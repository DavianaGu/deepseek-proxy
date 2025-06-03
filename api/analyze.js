export default async function handler(req, res) {
  // 设置 CORS 头，允许跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const { prompt } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  if (!prompt) {
    return res.status(400).json({ error: '缺少 prompt' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: '缺少 API KEY' });
  }

  try {
    const response = await fetch("https://api.deepseek.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'DeepSeek API 错误' });
    }

    const result = data.choices?.[0]?.message?.content || "无分析结果";
    res.status(200).json({ result });
  } catch (error) {
    console.error("代理错误：", error);
    res.status(500).json({ error: "代理服务器错误" });
  }
}
