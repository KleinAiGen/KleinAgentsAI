import express from "express";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes FIRST
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, model, systemInstruction } = req.body;
      
      const hfToken = process.env.HF_TOKEN;
      if (!hfToken) {
        return res.status(500).json({ error: "HF_TOKEN environment variable is missing." });
      }

      const client = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: hfToken,
      });

      const formattedMessages = [];
      if (systemInstruction) {
        formattedMessages.push({ role: "system", content: systemInstruction });
      }

      for (const msg of messages) {
        if (msg.images && msg.images.length > 0) {
          const content: any[] = [{ type: "text", text: msg.text || " " }];
          for (const img of msg.images) {
            content.push({
              type: "image_url",
              image_url: { url: img }
            });
          }
          formattedMessages.push({ role: msg.role, content });
        } else {
          formattedMessages.push({ role: msg.role, content: msg.text || " " });
        }
      }

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
      res.end();
    } catch (error: any) {
      console.error("OpenAI API Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
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
