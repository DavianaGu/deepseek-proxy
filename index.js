import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const API_KEY = process.env.DEEPSEEK_API_KEY;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("DeepSeek Proxy Server is running.");
});

app.post("/api/analyze", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "缺少 prompt" });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: "缺少 API_KEY" });
  }

  try {
    const response = await fetch("https://api.deepseek.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "DeepSeek API 错误" });
    }

    const result = data.choices?.[0]?.message?.content || "无分析结果";
    res.json({ result });
  } catch (err) {
    console.error("代理错误:", err);
    res.status(500).json({ error: "代理服务器错误" });
  }
});

app.listen(port, () => {
  console.log(`✅ DeepSeek Proxy is running on http://localhost:${port}`);
});
