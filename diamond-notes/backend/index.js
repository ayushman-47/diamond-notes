import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Serve frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Proxy NCERT PDFs
app.get("/pdf/:file", async (req, res) => {
  const file = req.params.file; // e.g. lehi1.pdf
  const url = `https://ncert.nic.in/textbook/pdf/${file}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch PDF");
    res.setHeader("Content-Type", "application/pdf");
    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
