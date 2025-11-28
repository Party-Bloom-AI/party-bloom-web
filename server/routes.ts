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
      const { type, content } = req.body;

      if (!type || !content) {
        return res.status(400).json({ message: "Missing type or content" });
      }

      let prompt = "";
      
      if (type === "image") {
        prompt = `Based on this image description/inspiration, create a kids birthday party decoration theme. The image shows: ${content.substring(0, 500)}...`;
      } else if (type === "text") {
        prompt = `Create a kids birthday party decoration theme based on this idea: ${content}`;
      } else if (type === "template") {
        prompt = `Create a detailed kids birthday party decoration theme for: ${content}`;
      }

      const systemPrompt = `You are a professional party planner specializing in kids' birthday party decorations. 
Generate a complete party decoration plan in JSON format with the following structure:
{
  "title": "Theme name (e.g., 'Enchanted Princess Castle')",
  "description": "A 2-3 sentence description of the theme and its mood",
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4"] (4-5 theme colors as hex codes),
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
- Use real, working Unsplash image URLs (format: https://images.unsplash.com/photo-{id}?w=400)
- Price ranges should be realistic for party decorations
- Include a mix of essentials (balloons, banners, tableware) and theme-specific items
- Total cost should accurately sum the individual item ranges
- Retailer links should be real search URLs for those items`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error("No response from AI");
      }

      const result = JSON.parse(resultText);
      res.json(result);
    } catch (error) {
      console.error("Error generating theme:", error);
      res.status(500).json({ message: "Failed to generate theme" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
