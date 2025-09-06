// Example Node.js serverless proxy for Vercel or similar platforms.
// Deploy this as /api/generate. It forwards the prompt to OpenAI server-side using your API key stored in environment variables.

const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const body = req.body;
  if (!body || !body.prompt) return res.status(400).send('Missing prompt');

  const API_KEY = process.env.OPENAI_API_KEY;
  if (!API_KEY) return res.status(500).send('Server missing API key');

  try {
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: body.prompt }
      ],
      temperature: 0.2,
      max_tokens: 2500
    };
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + API_KEY },
      body: JSON.stringify(payload)
    });
    const data = await r.text();
    res.status(r.status).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send(String(err));
  }
};
