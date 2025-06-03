const fetch = require("node-fetch");

module.exports = async (req, res) => {
  // 设置 CORS 头部，允许跨域请求
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 处理预检请求
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 只允许 POST 方法
  if (req.method !== "POST") {
    return res.status(405).json({ error: "仅支持 POST 请求" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "缺少 prompt 参数" });
    }

    const API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "服务器未配置 API Key" });
    }

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

    const result = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: result.error?.message || "调用失败" });
    }

    const output = result.choices?.[0]?.message?.content || "无分析结果";
    return res.status(200).json({ result: output });
  } catch (err) {
    console.error("调用出错：", err);
    return res.status(500).json({ error: "服务器内部错误" });
  }
};
