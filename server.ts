import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Helper to initialize Gemini client safely
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", apiKeyConfigured: !!process.env.GEMINI_API_KEY });
  });

  // Enhance prompt endpoint
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "A valid prompt string is required." });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `You are an expert AI prompt engineer for image generation models (like Imagen/Nano Banana). Take this simple user request and enhance it into a vivid, descriptive, high-quality prompt specifying subject details, atmospheric lighting, artistic style, camera angle, color scheme, and texture. Keep the response concise, punchy, and under 80 words. Return ONLY the enhanced prompt string without commentary or quotation marks.

User Prompt: "${prompt}"`,
      });

      const enhancedText = response.text?.trim() || prompt;
      res.json({ enhancedPrompt: enhancedText });
    } catch (error: any) {
      console.error("Error enhancing prompt:", error);
      res.status(500).json({
        error: error?.message || "Failed to enhance prompt. Check API key or configuration.",
      });
    }
  });

  // Generate image endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio = "1:1", style = "", negativePrompt = "" } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "A prompt is required." });
      }

      const ai = getGeminiClient();

      // Combine prompt with style or negative prompt if supplied
      let fullPrompt = prompt.trim();
      if (style && style !== "None") {
        fullPrompt += `, in ${style} style`;
      }
      if (negativePrompt && negativePrompt.trim()) {
        fullPrompt += `. Avoid: ${negativePrompt.trim()}`;
      }

      // Valid aspect ratios supported by gemini-3.1-flash-lite-image
      const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      const targetAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "1:1";

      console.log(`Generating image with prompt: "${fullPrompt}", aspect ratio: ${targetAspectRatio}`);

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: targetAspectRatio,
          },
        },
      });

      let imageUrl: string | null = null;
      let modelComments: string = "";

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const mimeType = part.inlineData.mimeType || "image/png";
            const base64Data = part.inlineData.data;
            imageUrl = `data:${mimeType};base64,${base64Data}`;
          } else if (part.text) {
            modelComments += part.text;
          }
        }
      }

      if (!imageUrl) {
        throw new Error("The model did not return an image inline data payload.");
      }

      res.json({
        success: true,
        imageUrl,
        prompt: fullPrompt,
        comments: modelComments || undefined,
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      res.status(500).json({
        error: error?.message || "Failed to generate image.",
      });
    }
  });

  // Vite development middleware vs Static Production setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AuraAI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
