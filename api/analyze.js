export default async function handler(req, res) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (req.method !== 'POST') {
    console.log('❌ 非 POST 请求');
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    console.log('❌ 缺少 prompt');
    return res.status(400).json({ error: '缺少 prompt' });
  }

  if (!apiKey) {
    console.log('❌ 缺少 API KEY');
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
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ DeepSeek API 返回错误：", data);
      return res.status(500).json({ error: data });
    }

    console.log("✅ DeepSeek 成功返回：", data);
    const result = data.choices?.[0]?.message?.content || "无分析结果";
    res.status(200).json({ result });
  } catch (error) {
    console.error("❌ 代理错误：", error.message);
    res.status(500).json({ error: error.message });
  }
}
