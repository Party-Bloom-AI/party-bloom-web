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

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/generate-theme', isAuthenticated, async (req: any, res) => {
    try {
      const { prompt, inspirationType, inspirationContent } = req.body;

      if (!prompt && !inspirationContent) {
        return res.status(400).json({ message: "Please provide a description or select inspiration" });
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
  "themeImagePrompt": "A detailed DALL-E prompt for generating a beautiful party decoration scene that captures this theme. Should describe a photorealistic party setup with decorations, balloons, table settings, and themed elements. Maximum 400 characters.",
  "moodboardImages": [
    "https://images.unsplash.com/photo-...",
    "https://images.unsplash.com/photo-...",
    "https://images.unsplash.com/photo-...",
    "https://images.unsplash.com/photo-..."
  ] (4-6 real Unsplash image URLs that match the theme - use actual unsplash photo IDs),
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
- The themeImagePrompt should be vivid and specific for generating a party decoration scene
- Use real, working Unsplash image URLs (format: https://images.unsplash.com/photo-{id}?w=400)
- Price ranges should be realistic for party decorations
- Include a mix of essentials (balloons, banners, tableware) and theme-specific items
- Total cost should accurately sum the individual item ranges
- Retailer links should be real search URLs for those items`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: combinedPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error("No response from AI");
      }

      const planResult = JSON.parse(resultText);

      let themeImage = "";
      
      if (planResult.themeImagePrompt) {
        try {
          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: `A beautiful, photorealistic party decoration setup: ${planResult.themeImagePrompt}. Professional party photography, vibrant colors, celebration atmosphere, high quality, no text or watermarks.`,
            n: 1,
            size: "1792x1024",
            quality: "standard",
          });

          themeImage = imageResponse.data?.[0]?.url || "";
        } catch (imageError) {
          console.error("Error generating theme image:", imageError);
        }
      }

      const result = {
        title: planResult.title,
        description: planResult.description,
        colors: planResult.colors,
        themeImage: themeImage,
        moodboardImages: planResult.moodboardImages,
        decorItems: planResult.decorItems,
        totalCostRange: planResult.totalCostRange,
      };

      res.json(result);
    } catch (error) {
      console.error("Error generating theme:", error);
      res.status(500).json({ message: "Failed to generate theme" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
