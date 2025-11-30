import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import OpenAI from "openai";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { sql } from "drizzle-orm";
import { db } from "./db";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const subscription = await storage.getSubscription(userId);
      res.json({ ...user, subscription });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getSubscription(userId);
      res.json({ subscription });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.get("/api/stripe/publishable-key", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error fetching Stripe publishable key:", error);
      res.status(500).json({ message: "Failed to fetch Stripe configuration" });
    }
  });

  app.post("/api/subscription/create-checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stripe = await getUncachableStripeClient();

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUserStripeCustomerId(userId, customerId);
      }

      // Fetch active price directly from Stripe to avoid sync issues between dev/prod
      const prices = await stripe.prices.list({
        active: true,
        currency: 'cad',
        limit: 10,
      });
      
      // Find the $2 CAD monthly price (200 cents)
      const monthlyPrice = prices.data.find(p => p.unit_amount === 200 && p.recurring?.interval === 'month');
      
      let priceId: string;
      if (monthlyPrice) {
        priceId = monthlyPrice.id;
      } else if (prices.data.length > 0) {
        // Fallback to any active CAD price
        priceId = prices.data[0].id;
      } else {
        console.error("No active CAD prices found in Stripe");
        return res.status(500).json({ message: "No subscription price found. Please create a price in Stripe." });
      }
      
      console.log("Using Stripe price:", priceId);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/subscription/cancel`,
        subscription_data: {
          trial_period_days: 30,
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/subscription/confirm", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'no_payment_required' && session.payment_status !== 'paid') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      const subscriptionId = session.subscription;
      
      if (!subscriptionId) {
        return res.status(400).json({ message: "No subscription found" });
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId as string) as any;

      const currentPeriodStart = subscription.current_period_start 
        ? new Date(subscription.current_period_start * 1000) 
        : new Date();
      const currentPeriodEnd = subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000) 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const existingSubscription = await storage.getSubscription(userId);
      
      if (existingSubscription) {
        await storage.updateSubscription(userId, {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: session.customer as string,
          status: subscription.status,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
      } else {
        await storage.createSubscription({
          userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: session.customer as string,
          status: subscription.status,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error confirming subscription:", error);
      res.status(500).json({ message: "Failed to confirm subscription" });
    }
  });

  app.post("/api/subscription/create-portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No billing account found" });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/billing`,
      });

      res.json({ url: portalSession.url });
    } catch (error) {
      console.error("Error creating portal session:", error);
      res.status(500).json({ message: "Failed to access billing portal" });
    }
  });

  app.post("/api/generate-theme", isAuthenticated, async (req: any, res) => {
    try {
      const { prompt, inspirationType, inspirationContent } = req.body;

      if (!prompt && !inspirationContent) {
        return res.status(400).json({
          message: "Please provide a description or select inspiration",
        });
      }

      let combinedPrompt = "";

      if (prompt && inspirationContent) {
        if (inspirationType === "template") {
          combinedPrompt = `Create a kids birthday party decoration theme that combines: 
User's vision: "${prompt}"
Template inspiration: ${inspirationContent}
Blend these elements together for a cohesive theme.`;
        } else if (inspirationType === "upload") {
          combinedPrompt = `Create a kids birthday party decoration theme based on:
User's vision: "${prompt}"
The user has also uploaded an inspiration image for reference.`;
        }
      } else if (prompt) {
        combinedPrompt = `Create a kids birthday party decoration theme based on this idea: ${prompt}`;
      } else if (inspirationContent && inspirationType === "template") {
        combinedPrompt = `Create a detailed kids birthday party decoration theme for: ${inspirationContent}`;
      } else {
        combinedPrompt = `Create a kids birthday party decoration theme based on the uploaded inspiration image.`;
      }

      const systemPrompt = `You are a professional party planner specializing in kids' birthday party decorations. 
Generate a complete party decoration plan in JSON format with the following structure:
{
  "title": "Theme name (e.g., 'Enchanted Princess Castle')",
  "description": "A 2-3 sentence description of the theme and its mood",
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4"] (4-5 theme colors as hex codes),
  "themeImagePrompt": "A detailed prompt for generating the main hero image - a beautifully decorated party room showing the overall theme. Maximum 350 characters.",
  "moodboardPrompts": [
    "Prompt for decorated dessert/cake table with theme elements",
    "Prompt for balloon arch or backdrop setup",
    "Prompt for table setting with themed tableware and centerpieces",
    "Prompt for party favor/gift area with themed decorations"
  ] (4 distinct prompts, each max 300 characters, showing different decorated areas of a party room),
  "decorItems": [
    {
      "name": "Item name",
      "priceRange": "$X-$Y",
      "retailer": "Amazon/Party City/Target/etc",
      "link": "https://www.amazon.com/s?k=search+terms"
    }
  ] (5-10 decoration items with realistic price ranges),
  "totalCostRange": "$XX-$XXX"
}

Important:
- All image prompts should describe photorealistic, beautifully decorated party spaces
- Each moodboard prompt should focus on a different area: dessert table, balloon display, table settings, favor area
- Include theme-specific colors, decorations, and elements in each prompt
- Price ranges should be realistic for party decorations
- Include a mix of essentials (balloons, banners, tableware) and theme-specific items
- Total cost should accurately sum the individual item ranges
- Retailer links should be real search URLs for those items`;

      const chatRequest = {
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: combinedPrompt },
        ],
        response_format: { type: "json_object" },
      };

      const response = await openai.chat.completions.create(chatRequest as any);

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error("No response from AI");
      }

      const planResult = JSON.parse(resultText);

      let themeImage = "";
      const moodboardImages: string[] = [];

      const generateImage = async (
        prompt: string,
        size: "1024x1536" | "1024x1024" = "1024x1024",
      ): Promise<string> => {
        const fullPrompt = `${prompt}. Professional party photography, vibrant colors, celebration atmosphere, high quality, no text, no watermarks, no people.`;
        const imageRequest = {
          model: "gpt-image-1",
          prompt: fullPrompt,
          n: 1,
          size: size,
        };

        try {
          const imageResponse = await openai.images.generate(imageRequest);
          
          const base64Data = (imageResponse.data?.[0] as any)?.b64_json;
          if (base64Data) {
            return `data:image/png;base64,${base64Data}`;
          }
          
          return "";
        } catch (error) {
          console.error("Image generation failed:", error);
          return "";
        }
      };

      if (planResult.themeImagePrompt) {
        themeImage = await generateImage(
          `A beautiful photorealistic kids birthday party room fully decorated: ${planResult.themeImagePrompt}`,
          "1024x1536",
        );
      }

      if (
        planResult.moodboardPrompts &&
        Array.isArray(planResult.moodboardPrompts)
      ) {
        const moodboardPromises = planResult.moodboardPrompts
          .slice(0, 4)
          .map((prompt: string) =>
            generateImage(`Photorealistic decorated party area: ${prompt}`),
          );

        const results = await Promise.all(moodboardPromises);
        moodboardImages.push(...results.filter((url: string) => url !== ""));
      }

      const result = {
        title: planResult.title,
        description: planResult.description,
        colors: planResult.colors,
        themeImage: themeImage,
        moodboardImages: moodboardImages,
        decorItems: planResult.decorItems,
        totalCostRange: planResult.totalCostRange,
      };

      res.json(result);
    } catch (error) {
      console.error("Error generating theme:", error);
      res.status(500).json({ message: "Failed to generate theme" });
    }
  });

  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        console.error("Favorites error: No user ID in session");
        return res.status(401).json({ message: "User not authenticated" });
      }
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error: any) {
      console.error("Error fetching favorites:", error?.message || error);
      console.error("Error stack:", error?.stack);
      res.status(500).json({ message: "Failed to fetch favorites", error: error?.message });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        console.error("Favorites POST error: No user ID in session");
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { title, description, colors, themeImage, moodboardImages, decorItems, totalCostRange } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Theme title is required" });
      }

      const favorite = await storage.createFavorite({
        userId,
        title,
        description,
        colors,
        themeImage,
        moodboardImages,
        decorItems,
        totalCostRange,
      });

      res.json(favorite);
    } catch (error: any) {
      console.error("Error saving favorite:", error?.message || error);
      console.error("Error stack:", error?.stack);
      res.status(500).json({ message: "Failed to save favorite", error: error?.message });
    }
  });

  app.delete("/api/favorites/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        console.error("Favorites DELETE error: No user ID in session");
        return res.status(401).json({ message: "User not authenticated" });
      }
      const favoriteId = parseInt(req.params.id, 10);
      
      if (isNaN(favoriteId)) {
        return res.status(400).json({ message: "Invalid favorite ID" });
      }

      const deleted = await storage.deleteFavorite(favoriteId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Favorite not found" });
      }

      res.json({ message: "Favorite deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting favorite:", error?.message || error);
      console.error("Error stack:", error?.stack);
      res.status(500).json({ message: "Failed to delete favorite", error: error?.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
