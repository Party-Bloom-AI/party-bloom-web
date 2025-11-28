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

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: combinedPrompt }
        ],
        response_format: { type: "json_object" },
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error("No response from AI");
      }

      const planResult = JSON.parse(resultText);

      let themeImage = "";
      const moodboardImages: string[] = [];
      
      const generateImage = async (prompt: string, size: "1536x1024" | "1024x1024" = "1024x1024"): Promise<string> => {
        try {
          const imageResponse = await openai.images.generate({
            model: "gpt-image-1",
            prompt: `${prompt}. Professional party photography, vibrant colors, celebration atmosphere, high quality, no text, no watermarks, no people.`,
            n: 1,
            size: size,
          });
          return imageResponse.data?.[0]?.url || "";
        } catch (error) {
          console.error("Error generating image:", error);
          return "";
        }
      };

      if (planResult.themeImagePrompt) {
        themeImage = await generateImage(
          `A beautiful photorealistic kids birthday party room fully decorated: ${planResult.themeImagePrompt}`,
          "1536x1024"
        );
      }

      if (planResult.moodboardPrompts && Array.isArray(planResult.moodboardPrompts)) {
        const moodboardPromises = planResult.moodboardPrompts.slice(0, 4).map((prompt: string) =>
          generateImage(`Photorealistic decorated party area: ${prompt}`)
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

  const httpServer = createServer(app);

  return httpServer;
}
