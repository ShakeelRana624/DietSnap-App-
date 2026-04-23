import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini AI securely
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

app.use(express.json({ limit: '10mb' }));

// Simple Rate Limiting in memory
const scanLimits = new Map<string, { count: number, reset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_SCANS_PER_WINDOW = 5;

// API Route for Food Analysis
app.post("/api/analyze-food", async (req, res) => {
  const { image } = req.body;
  const ip = req.ip || "unknown";

  // Check rate limit
  const now = Date.now();
  const userLimit = scanLimits.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW };
  
  if (now > userLimit.reset) {
    userLimit.count = 1;
    userLimit.reset = now + RATE_LIMIT_WINDOW;
  } else {
    userLimit.count++;
  }
  scanLimits.set(ip, userLimit);

  if (userLimit.count > MAX_SCANS_PER_WINDOW) {
    return res.status(429).json({ error: "Too many scans. Please wait a minute." });
  }

  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    const prompt = "Analyze this food item. Identify the food and provide nutrition data for Small, Medium, and Large portions. Return JSON format with foodName, calories, protein, carbs, fat, and a health grade (A-F) based on nutritional density. Focus on accuracy for the specific food shown.";

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: image,
                mimeType: "image/jpeg"
              }
            }
          ]
        }
      ]
    });

    const responseText = response.text;
    // Clean up response text if it contains markdown code blocks
    const cleanJson = responseText.replace(/```json|```/g, "").trim() || "{}";
    const data = JSON.parse(cleanJson);

    res.json(data);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
