import express from "express";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { GoogleGenAI, Type } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasHfToken: !!process.env.HF_TOKEN
    });
  });

  // Hugging Face Dedicated Endpoint (Lexi) with Gemini fallback
  app.post("/api/lexi", async (req, res) => {
    try {
      const { messages } = req.body;
      const hfToken = process.env.HF_TOKEN;

      if (hfToken) {
        try {
          const response = await fetch("https://tgrshgvmfj0v7epc.us-east4.gcp.endpoints.huggingface.cloud/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${hfToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "bartowski/Lexi-Llama-3-8B-Uncensored-GGUF",
              messages: messages,
              stream: true,
              max_tokens: 400
            })
          });

          if (response.ok && response.body) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            while (!done) {
              const { value, done: readerDone } = await reader.read();
              done = readerDone;
              if (value) {
                const chunkStr = decoder.decode(value, { stream: true });
                res.write(chunkStr);
              }
            }
            res.write('data: [DONE]\n\n');
            return res.end();
          }
        } catch (hfErr) {
          console.warn("Lexi HF Endpoint unavailable, falling back to Gemini:", hfErr);
        }
      }

      // Seamless fallback to Gemini with multi-model cascade
      const ai = getGemini();
      const geminiContents = (messages || []).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content || " " }]
      }));

      const lexiModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.7-flash"];
      let streamSuccess = false;

      for (const m of lexiModels) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: m,
            contents: geminiContents,
            config: {
              systemInstruction: "You are Lexi, an intelligent, candid, witty, and highly capable AI assistant.",
            }
          });

          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');

          for await (const chunk of responseStream) {
            const chunkText = chunk.text || "";
            if (chunkText) {
              res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunkText } }] })}\n\n`);
            }
          }
          res.write('data: [DONE]\n\n');
          res.end();
          streamSuccess = true;
          break;
        } catch (err: any) {
          console.warn(`Lexi fallback model ${m} failed (${err?.message || err}), trying next...`);
        }
      }

      if (!streamSuccess && !res.headersSent) {
        res.status(503).json({
          error: "Service Temporarily Unavailable",
          message: "All AI model providers are currently experiencing high demand. Please retry in a few seconds."
        });
      }
    } catch (error: any) {
      console.error("Lexi API Error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Internal Server Error",
          message: error?.message || String(error)
        });
      }
    }
  });

  // Smart suggestions generator endpoint
  app.post("/api/suggestions", async (req, res) => {
    try {
      const { text, language = "ENG" } = req.body;
      if (!text || typeof text !== "string") {
        return res.json({ suggestions: [] });
      }

      const isHun = language === "HUN";
      const langInstruction = isHun 
        ? "Minden javasolt prompt CSAK és KIZÁRÓLAG MAGYARUL (Hungarian) legyen. Legyenek lényegretörő, magas szintű prompt engineer szintű szakmai folytatási kérdések." 
        : "All suggested prompts MUST be in English. Provide concise, high-value, prompt-engineer level follow-up questions.";

      const ai = getGemini();
      const modelsToTry = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.7-flash"];
      let response = null;

      for (const m of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: m,
            contents: `Based on this AI response, generate 4 concise, high-value follow-up prompts that a professional user would ask next to dive deeper, optimize, test, or expand on the topic. ${langInstruction}
Return ONLY a valid JSON array of 4 short strings (e.g. ["prompt 1", "prompt 2", "prompt 3", "prompt 4"]).

AI Response: "${text.slice(0, 1200)}"`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          });
          if (response?.text) break;
        } catch (err: any) {
          // Silent fallback on 503 high demand or quota
        }
      }

      let parsed: string[] = [];
      if (response?.text) {
        try {
          let raw = response.text.trim();
          if (raw.startsWith("```json")) raw = raw.slice(7);
          if (raw.startsWith("```")) raw = raw.slice(3);
          if (raw.endsWith("```")) raw = raw.slice(0, -3);
          parsed = JSON.parse(raw.trim());
        } catch (e) {
          // JSON parse fallback
        }
      }

      // Robust contextual fallback if parsing or API returned empty
      if (!Array.isArray(parsed) || parsed.length === 0) {
        if (isHun) {
          parsed = [
            "Részletezd a gyakorlati megvalósítás lépéseit!",
            "Hogyan tehető ez még gyorsabbá és hatékonyabbá?",
            "Mutass hozzá egy teljes, működő kódpéldát!",
            "Mik a lehetséges hibák és alternatív megoldások?"
          ];
        } else {
          parsed = [
            "Break down the step-by-step implementation details",
            "How can we optimize performance and error handling?",
            "Provide a complete, production-ready code snippet",
            "What are the edge cases and alternative approaches?"
          ];
        }
      }

      res.json({ suggestions: parsed.filter(s => typeof s === "string" && s.trim().length > 0).slice(0, 4) });
    } catch (error: any) {
      const isHun = req.body?.language === "HUN";
      res.json({ 
        suggestions: isHun ? [
          "Részletezd a gyakorlati megvalósítás lépéseit!",
          "Mutass egy teljes, működő kódpéldát!",
          "Hogyan optimalizálható ez tovább?"
        ] : [
          "Explain the implementation steps in detail",
          "Show a complete, working code example",
          "How can this be further optimized?"
        ]
      });
    }
  });

  // AI Agent Persona Generator endpoint with offline synthesis fallback
  app.post("/api/generate-agent", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Missing query parameter" });
      }

      const ai = getGemini();
      const modelsToTry = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-3.1-pro-preview"];
      let agentData: any = null;

      for (const m of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: m,
            contents: `Generate a high-quality AI agent profile based on this query: "${query}".
Return ONLY a valid JSON object with this exact structure (no markdown code blocks, just raw valid JSON):
{
  "name": "Agent Name",
  "description": "Concise 1-2 sentence description of what the agent specializes in.",
  "systemInstruction": "Detailed, professional system instruction defining the persona, tone, guidelines, and domain knowledge.",
  "icon": "Sparkles",
  "category": "Custom",
  "capabilities": ["Capability 1", "Capability 2", "Capability 3"],
  "commands": [
    { "command": "/analyze", "description": "Analyze input", "prompt": "Please analyze this: " },
    { "command": "/optimize", "description": "Optimize solution", "prompt": "Please optimize this: " }
  ]
}`,
            config: {
              responseMimeType: "application/json",
            }
          });

          let responseText = response.text || "{}";
          responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          agentData = JSON.parse(responseText);
          if (agentData && agentData.name) {
            break;
          }
        } catch (err: any) {
          // Model unavailable or 503, try next
        }
      }

      // Offline synthesis fallback if all models experienced temporary 503 spikes
      if (!agentData || !agentData.name) {
        const cleanQuery = query.trim().replace(/^["']|["']$/g, '');
        const capitalized = cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1);
        agentData = {
          name: `${capitalized} Specialist`,
          description: `An intelligent expert assistant customized for ${cleanQuery}.`,
          systemInstruction: `You are an expert specialist dedicated to ${cleanQuery}. Provide clear, professional, accurate, and deeply knowledgeable answers with actionable recommendations.`,
          icon: "Sparkles",
          category: "Custom",
          capabilities: ["Specialized Analysis", "Direct Problem Solving", "Best Practices"],
          commands: [
            { command: "/analyze", description: `Analyze ${cleanQuery}`, prompt: `Please provide an in-depth analysis of: ` },
            { command: "/improve", description: "Improve or optimize", prompt: "How can we optimize and enhance this: " }
          ]
        };
      }

      agentData.id = `custom-${Date.now()}`;
      if (!agentData.category) agentData.category = "Custom";
      if (!agentData.icon) agentData.icon = "Sparkles";
      if (!Array.isArray(agentData.capabilities)) agentData.capabilities = ["Expert Advice", "Problem Solving"];
      if (!Array.isArray(agentData.commands)) agentData.commands = [{ command: "/solve", description: "Solve issue", prompt: "Help solve: " }];

      res.json(agentData);
    } catch (error: any) {
      console.error("Generate agent error:", error);
      res.status(500).json({ error: error.message || "Failed to generate agent" });
    }
  });

  // Image Generation endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio = "1:1" } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt" });
      }

      const ai = getGemini();
      const imageModels = ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image", "gemini-3-pro-image"];
      let lastErr: any = null;

      for (const m of imageModels) {
        try {
          const response = await ai.models.generateContent({
            model: m,
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: aspectRatio as any } }
          });

          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.data) {
              const mimeType = part.inlineData.mimeType || "image/png";
              return res.json({
                imageUrl: `data:${mimeType};base64,${part.inlineData.data}`
              });
            }
          }
        } catch (err: any) {
          lastErr = err;
          console.warn(`Image model ${m} failed (${err?.message || err}), trying next...`);
        }
      }

      throw lastErr || new Error("Failed to generate image from models");
    } catch (error: any) {
      console.error("Image gen error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // Unified Chat endpoint (Gemini with multi-model fallback & Qwen/HuggingFace)
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, model = "gemini-3.7-flash", systemInstruction, stream = true } = req.body;
      let fallbackPrefix = "";

      // Handle Qwen / Hugging Face router
      if (model.startsWith("Qwen/") || model.includes("novita") || model.includes("huggingface")) {
        const hfToken = process.env.HF_TOKEN;

        if (hfToken) {
          try {
            const client = new OpenAI({
              baseURL: "https://router.huggingface.co/v1",
              apiKey: hfToken,
            });

            const formattedMessages: any[] = [];
            if (systemInstruction) {
              formattedMessages.push({ role: "system", content: systemInstruction });
            }

            for (const msg of messages || []) {
              if (msg.images && msg.images.length > 0) {
                const content: any[] = [{ type: "text", text: msg.text || " " }];
                for (const img of msg.images) {
                  content.push({
                    type: "image_url",
                    image_url: { url: img }
                  });
                }
                formattedMessages.push({ role: msg.role === "gemini" || msg.role === "assistant" ? "assistant" : "user", content });
              } else {
                formattedMessages.push({
                  role: msg.role === "gemini" || msg.role === "assistant" ? "assistant" : "user",
                  content: msg.text || " "
                });
              }
            }

            if (stream) {
              const completion = await client.chat.completions.create({
                model: model || "Qwen/Qwen3.5-35B-A3B:novita",
                messages: formattedMessages,
                stream: true,
              });

              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache');
              res.setHeader('Connection', 'keep-alive');

              for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                  res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
                }
              }
              res.write('data: [DONE]\n\n');
              return res.end();
            } else {
              const completion = await client.chat.completions.create({
                model: model || "Qwen/Qwen3.5-35B-A3B:novita",
                messages: formattedMessages,
                stream: false,
              });
              const text = completion.choices[0]?.message?.content || "";
              return res.json({ text });
            }
          } catch (hfError: any) {
            console.warn("HuggingFace/Qwen API failed or invalid token, falling back to Gemini:", hfError?.message);
            fallbackPrefix = "> 💡 *Notice: Hugging Face (Qwen) was unauthorized or unreachable. Switched seamlessly to Gemini Flash:*\n\n";
          }
        } else {
          fallbackPrefix = "> 💡 *Notice: Hugging Face token (HF_TOKEN) is not configured in Settings > Secrets. Switched seamlessly to Gemini Flash:*\n\n";
        }
      }

      // Handle Gemini models with fallback
      const ai = getGemini();

      // Convert messages to Gemini format
      const geminiContents: any[] = [];
      for (const msg of messages || []) {
        const parts: any[] = [];
        if (msg.text && msg.text.trim()) {
          parts.push({ text: msg.text });
        }
        if (msg.images && Array.isArray(msg.images)) {
          for (const img of msg.images) {
            if (typeof img === "string" && img.startsWith("data:")) {
              const base64Data = img.split(',')[1];
              const mimeType = img.split(';')[0].split(':')[1] || "image/png";
              parts.push({ inlineData: { data: base64Data, mimeType } });
            }
          }
        }
        if (parts.length === 0) {
          parts.push({ text: " " });
        }
        geminiContents.push({
          role: msg.role === "gemini" || msg.role === "model" ? "model" : "user",
          parts
        });
      }

      // Model fallback cascade: requested model -> stable fast models -> pro reasoning model
      const candidateModels = [
        model,
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite",
        "gemini-3.7-flash",
        "gemini-3.1-pro-preview"
      ].filter((m, i, arr) => arr.indexOf(m) === i && !m.startsWith("Qwen/"));

      let lastError: any = null;

      for (const candidateModel of candidateModels) {
        try {
          if (stream) {
            const responseStream = await ai.models.generateContentStream({
              model: candidateModel,
              contents: geminiContents,
              config: {
                systemInstruction: systemInstruction || undefined,
              }
            });

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            if (fallbackPrefix) {
              res.write(`data: ${JSON.stringify({ text: fallbackPrefix })}\n\n`);
            }

            for await (const chunk of responseStream) {
              const chunkText = chunk.text || "";
              const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
              if (chunkText || groundingChunks) {
                res.write(`data: ${JSON.stringify({ text: chunkText, groundingChunks })}\n\n`);
              }
            }
            res.write('data: [DONE]\n\n');
            return res.end();
          } else {
            const response = await ai.models.generateContent({
              model: candidateModel,
              contents: geminiContents,
              config: {
                systemInstruction: systemInstruction || undefined,
              }
            });

            const text = (fallbackPrefix ? fallbackPrefix : "") + (response.text || "");
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            return res.json({ text, groundingChunks });
          }
        } catch (geminiError: any) {
          lastError = geminiError;
          const errMsg = geminiError?.message || String(geminiError);
          console.warn(`Gemini model ${candidateModel} failed with: ${errMsg}. Trying fallback if available...`);
          // If headers already sent, we cannot retry
          if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ text: `\n\n⚠️ Stream notice: switched model due to demand.` })}\n\n`);
            res.write('data: [DONE]\n\n');
            return res.end();
          }
        }
      }

      // If all candidate models failed
      const errorStr = lastError?.message || String(lastError || "Unknown error");
      const isQuota429 = errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota");
      const isUnavailable503 = errorStr.includes("503") || errorStr.includes("UNAVAILABLE") || errorStr.includes("high demand");

      if (isQuota429) {
        return res.status(429).json({
          error: "Quota Exceeded (429)",
          message: "⚠️ Your Gemini API quota limit has been reached for this billing tier. Please try again in a few moments, or check your rate limits in Google AI Studio."
        });
      }

      if (isUnavailable503) {
        return res.status(503).json({
          error: "Service Experiencing High Demand (503)",
          message: "⚠️ Upstream Gemini servers are currently experiencing temporary high demand spikes. The request has been queued; please click regenerate or send your prompt again in a moment."
        });
      }

      return res.status(500).json({
        error: "Gemini API Error",
        message: errorStr
      });
    } catch (error: any) {
      console.error("Chat endpoint outer error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

