Diamond Notes Frontend Demo

Files:
- index.html
- style.css
- script.js

How to use:
1. Open index.html in a browser (double-click) or host as static site (GitHub Pages / Netlify / Vercel).
2. Choose class and subject. Enter chapter name OR upload the NCERT PDF (recommended for true NCERT-based notes).
3. Select language (English/Hindi).
4. Choose API Mode:
   - Use API Key in Browser: paste your OpenAI (or compatible) API key. This will send requests from your browser using your key. DO NOT share this key.
   - Use Proxy: supply a server endpoint that accepts { prompt } and forwards to your API securely (recommended).
5. Click Generate Notes. The assistant will return the note text.

Important Security Notes:
- Exposing API keys in browser is insecure. Use proxy/server for production.
- OpenAI or other providers may charge; ensure you understand costs.

Proxy Example:
- See 'serverless-proxy-example.js' included in zip for a Vercel/Node.js serverless function example that uses server-side API key (recommended).
