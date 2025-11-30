import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import OpenAI from "openai";

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
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

      console.log("=== GPT-5 Chat Request ===");
      console.log("Model:", chatRequest.model);
      console.log("User Prompt:", combinedPrompt);
      console.log("System Prompt Length:", systemPrompt.length, "chars");

      const response = await openai.chat.completions.create(chatRequest as any);

      console.log("=== GPT-5 Chat Response ===");
      console.log("Response ID:", response.id);
      console.log("Model Used:", response.model);
      console.log("Usage:", JSON.stringify(response.usage));
      console.log("Finish Reason:", response.choices[0]?.finish_reason);

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error("No response from AI");
      }

      console.log("Response Content:", resultText);

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

        console.log("=== Image Generation Request ===");
        console.log("Model:", imageRequest.model);
        console.log("Size:", imageRequest.size);
        console.log("Prompt:", fullPrompt);

        try {
          const imageResponse = await openai.images.generate(imageRequest);

          console.log("=== Image Generation Response ===");
          console.log("Created:", imageResponse.created);
          
          const base64Data = (imageResponse.data?.[0] as any)?.b64_json;
          if (base64Data) {
            console.log("Image Base64: Generated successfully (length:", base64Data.length, "chars)");
            return `data:image/png;base64,${base64Data}`;
          }
          
          console.log("Image: No base64 data returned");
          return "";
        } catch (error) {
          console.error("=== Image Generation Error ===");
          console.error("Error:", error);
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
      const userId = req.user.claims.sub;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
    } catch (error) {
      console.error("Error saving favorite:", error);
      res.status(500).json({ message: "Failed to save favorite" });
    }
  });

  app.delete("/api/favorites/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favoriteId = parseInt(req.params.id, 10);
      
      if (isNaN(favoriteId)) {
        return res.status(400).json({ message: "Invalid favorite ID" });
      }

      const deleted = await storage.deleteFavorite(favoriteId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Favorite not found" });
      }

      res.json({ message: "Favorite deleted successfully" });
    } catch (error) {
      console.error("Error deleting favorite:", error);
      res.status(500).json({ message: "Failed to delete favorite" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
