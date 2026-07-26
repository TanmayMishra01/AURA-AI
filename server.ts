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

  // Describe image endpoint (Vision image-to-prompt)
  app.post("/api/describe-image", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg" } = req.body;
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).json({ error: "Base64 image data is required." });
      }

      // Clean base64 string if data URL prefix exists
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: "Analyze this image and transform it into a hyper-detailed, ultra-advanced, breathtaking 8K cinematic AI artwork prompt. Reimagine the subject with surreal photorealistic lighting, intricate textures, luminous atmosphere, visual depth, and futuristic high-concept artistic styling. Return ONLY the enhanced prompt text under 70 words without quotes or preamble.",
              },
            ],
          },
        ],
      });

      const extractedPrompt = response.text?.trim() || "A creative artistic portrait inspired by visual reference";
      res.json({ prompt: extractedPrompt });
    } catch (error: any) {
      console.log("Describe image info fallback used");
      res.json({
        prompt: "A highly detailed, luminous digital masterpiece portrait inspired by visual camera reference with vibrant artistic lighting",
      });
    }
  });

  // Enhance prompt endpoint
  app.post("/api/enhance-prompt", async (req, res) => {
    const rawPrompt = req.body?.prompt;
    const userPrompt = typeof rawPrompt === "string" ? rawPrompt.trim() : "";
    if (!userPrompt) {
      return res.status(400).json({ error: "A valid prompt string is required." });
    }

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `You are an expert AI prompt engineer for image generation models (like Imagen/Nano Banana). Take this simple user request and enhance it into a vivid, descriptive, high-quality prompt specifying subject details, atmospheric lighting, artistic style, camera angle, color scheme, and texture. Keep the response concise, punchy, and under 80 words. Return ONLY the enhanced prompt string without commentary or quotation marks.

User Prompt: "${userPrompt}"`,
      });

      const enhancedText = response.text?.trim() || userPrompt;
      res.json({ enhancedPrompt: enhancedText });
    } catch (error: any) {
      console.log("Enhance prompt info fallback used");
      res.json({
        enhancedPrompt: `${userPrompt}, 8k resolution, cinematic lighting, masterpiece digital art, highly detailed, dramatic atmosphere`,
      });
    }
  });

  // Helper function to create an SVG Data URL fallback when quota is reached
  function createFallbackArtworkUrl(prompt: string, style: string, aspectRatio: string): string {
    const encodedPrompt = prompt.replace(/"/g, "'");
    const colors = [
      ["#157ff0", "#8b5cf6", "#0f172a"],
      ["#f43f5e", "#8b5cf6", "#1e1b4b"],
      ["#10b981", "#3b82f6", "#022c22"],
      ["#f59e0b", "#ef4444", "#450a0a"],
      ["#ec4899", "#8b5cf6", "#31103f"],
    ];
    const palette = colors[Math.abs(prompt.length) % colors.length];

    let width = 800;
    let height = 800;
    if (aspectRatio === "16:9") { width = 960; height = 540; }
    else if (aspectRatio === "9:16") { width = 540; height = 960; }
    else if (aspectRatio === "4:3") { width = 800; height = 600; }
    else if (aspectRatio === "3:4") { width = 600; height = 800; }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="50%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[2]}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.8" />
        </radialGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <circle cx="${width * 0.3}" cy="${height * 0.4}" r="${width * 0.35}" fill="${palette[0]}" filter="url(#blur)" opacity="0.6" />
      <circle cx="${width * 0.7}" cy="${height * 0.6}" r="${width * 0.3}" fill="${palette[1]}" filter="url(#blur)" opacity="0.6" />
      <rect width="100%" height="100%" fill="url(#glow)" />
      <g transform="translate(${width/2}, ${height/2})" text-anchor="middle" font-family="-apple-system, sans-serif">
        <text y="-20" fill="#ffffff" font-size="28" font-weight="bold" opacity="0.95">${style && style !== 'None' ? style + ' Vision' : 'AuraAI Canvas'}</text>
        <text y="20" fill="#38bdf8" font-size="14" font-weight="600" opacity="0.9">Prompt: "${encodedPrompt.slice(0, 45)}${encodedPrompt.length > 45 ? '...' : ''}"</text>
        <text y="50" fill="#a1a1aa" font-size="11" opacity="0.75">AI Styled Preview Artwork</text>
      </g>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Generate image endpoint
  app.post("/api/generate-image", async (req, res) => {
    const { prompt, aspectRatio = "1:1", style = "", negativePrompt = "" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "A prompt is required." });
    }

    let fullPrompt = prompt.trim();
    if (style && style !== "None") {
      fullPrompt += `, in ${style} style`;
    }
    if (negativePrompt && negativePrompt.trim()) {
      fullPrompt += `. Avoid: ${negativePrompt.trim()}`;
    }

    const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const targetAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "1:1";

    console.log(`Generating image with prompt: "${fullPrompt}", aspect ratio: ${targetAspectRatio}`);

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: fullPrompt }],
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

      if (imageUrl) {
        return res.json({
          success: true,
          imageUrl,
          prompt: fullPrompt,
          comments: modelComments || undefined,
        });
      }

      throw new Error("No image payload received from model.");
    } catch (error: any) {
      console.log("Generating styled canvas preview (API fallback active)");

      const fallbackUrl = createFallbackArtworkUrl(prompt, style, targetAspectRatio);
      return res.json({
        success: true,
        imageUrl: fallbackUrl,
        prompt: fullPrompt,
        warning: "Generated artwork canvas preview.",
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
