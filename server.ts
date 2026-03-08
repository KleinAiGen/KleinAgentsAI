import express from "express";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.post("/api/lexi", async (req, res) => {
    console.log("Lexi API request received");
    try {
      const { messages } = req.body;
      console.log("Messages:", JSON.stringify(messages));
      
      const hfToken = process.env.HF_TOKEN;
      if (!hfToken) {
        console.error("HF_TOKEN is missing");
        return res.status(500).json({ error: "HF_TOKEN environment variable is missing." });
      }

      console.log("Calling Hugging Face Dedicated Endpoint with fetch");
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
          max_tokens: 100
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Lexi API Error Response:", errorText);
        return res.status(response.status).json({ 
          error: "Hugging Face Endpoint Error", 
          details: errorText,
          status: response.status
        });
      }

      console.log("Chat completion created, starting stream");
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (response.body) {
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
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error("Lexi API Error:", error);
      const errorResponse = {
        error: "Internal Server Error",
        message: error?.message || String(error),
        stack: error?.stack,
        details: error?.response?.data || error?.data || null
      };
      console.error("Sending error response:", JSON.stringify(errorResponse));
      res.status(500).json(errorResponse);
    }
  });

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
