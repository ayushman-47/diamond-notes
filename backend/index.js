import express from "express";
import fetch from "node-fetch";
import pdfParse from "pdf-parse";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Route 1: Proxy NCERT PDF
app.get("/pdf/:file", async (req, res) => {
  try {
    const file = req.params.file;
    const url = `https://ncert.nic.in/textbook/pdf/${file}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch PDF");

    res.setHeader("Content-Type", "application/pdf");
    response.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching PDF");
  }
});

// ✅ Route 2: Extract text from NCERT PDF
app.get("/extract-text/:file", async (req, res) => {
  try {
    const file = req.params.file;
    const url = `https://ncert.nic.in/textbook/pdf/${file}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch PDF");

    const buffer = Buffer.from(await response.arrayBuffer());
    const data = await pdfParse(buffer);

    res.json({ text: data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error extracting text" });
  }
});

// ✅ Route 3: Generate Diamond Notes (Mock AI for now)
app.post("/generate", async (req, res) => {
  try {
    const { chapterTitle, chapterText } = req.body;

    if (!chapterTitle || !chapterText) {
      return res
        .status(400)
        .json({ error: "Both chapterTitle and chapterText are required" });
    }

    // 🚨 Replace this with real AI API later (OpenAI / OpenRouter etc.)
    const notes = `
Chapter Title: ${chapterTitle}

1. Introduction
- Summary of chapter introduction here

2. Main Topics
- Key point 1
- Key point 2
- Key point 3

3. Conclusion
- Short conclusion of chapter

Keywords to Remember:
- Term 1, Term 2, Term 3
    `.trim();

    res.json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating notes" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
