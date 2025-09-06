import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import pdf from "pdf-parse";
import cors from "cors";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json({limit: '10mb'}));

// Serve frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Proxy NCERT PDF - streams PDF back (no caching)
app.get("/pdf/:file", async (req, res) => {
  const file = req.params.file; // e.g. lehi1.pdf
  const url = `https://ncert.nic.in/textbook/pdf/${file}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send(`NCERT responded with ${response.status}`);
    }
    res.setHeader("Content-Type", "application/pdf");
    response.body.pipe(res);
  } catch (err) {
    console.error("Error proxying PDF:", err);
    res.status(500).json({ error: "Failed to fetch PDF from NCERT", details: String(err) });
  }
});

// Extract full text from NCERT PDF and return as plain text
app.get("/extract-text/:file", async (req, res) => {
  const file = req.params.file;
  const url = `https://ncert.nic.in/textbook/pdf/${file}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).send("Failed to fetch PDF");
    const buffer = await response.arrayBuffer();
    const data = await pdf(Buffer.from(buffer));
    return res.json({ text: data.text });
  } catch (err) {
    console.error("Error extracting text:", err);
    return res.status(500).json({ error: String(err) });
  }
});

// Generate Diamond Notes from given chapterText (or fallback rawText)
app.post("/generate", async (req, res) => {
  try {
    const { chapterTitle, chapterText } = req.body;
    if (!chapterText || !chapterTitle) {
      return res.status(400).json({ error: "Provide both chapterTitle and chapterText in JSON body" });
    }

    // Simple parser: split into sections using numbered headings or lines in ALL CAPS as separators
    const lines = chapterText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    // build sections: look for lines that start with "1 " or "1.1 " or are all caps (short)
    const sections = [];
    let current = { heading: "Introduction", content: [] };

    const headingRegex = /^(\d+(?:\.\d+)*)\s+(.+)$/;
    for (let i=0;i<lines.length;i++){
      const line = lines[i];
      const m = line.match(headingRegex);
      const isAllCaps = line.length <= 80 && line === line.toUpperCase() && /[A-Z]/.test(line);
      if (m || isAllCaps) {
        // push current
        if (current.content.length) sections.push(current);
        const h = m ? (m[1] + " " + m[2]) : line;
        current = { heading: h, content: [] };
      } else {
        current.content.push(line);
      }
    }
    if (current.content.length) sections.push(current);
    if (!sections.length) {
      // fallback: make whole text a single section
      sections.push({ heading: chapterTitle, content: lines.slice(0,200) });
    }

    // For each section, create concise bullet points by splitting sentences and trimming
    const bulletize = (textArr) => {
      const joined = textArr.join(" ");
      // split into sentences approx by . ? !
      const parts = joined.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);
      // pick up to 10 concise bullets, trimming length
      const bullets = parts.slice(0, 12).map(s => {
        // remove extremely long tails
        if (s.length > 200) s = s.slice(0,197) + "...";
        return s.replace(/\s+/g, " ");
      });
      return bullets;
    };

    const notesSections = sections.map(sec => {
      return {
        heading: sec.heading,
        bullets: bulletize(sec.content)
      };
    });

    // Conclusion: take first 2-3 sentences from whole text
    const whole = lines.join(" ");
    const wholeSents = whole.split(/(?<=[.?!])\s+/).filter(Boolean);
    const conclusion = wholeSents.slice(0,3).join(" ");

    // Keywords: pick capitalized words and numbers frequency
    const wordFreq = {};
    const words = whole.match(/\b[A-Za-z0-9()\-]{2,}\b/g) || [];
    for (const w of words) {
      if (/^\d{4}$/.test(w) || /^[A-Z][a-z]/.test(w) || /^[A-Z]{2,}$/.test(w)) {
        const key = w.replace(/[()]/g, "");
        wordFreq[key] = (wordFreq[key]||0)+1;
      }
    }
    const keywords = Object.entries(wordFreq).sort((a,b)=>b[1]-a[1]).slice(0,15).map(x=>x[0]);

    // Build final Diamond Notes text in required format
    let out = `Chapter Title: ${chapterTitle}\n\n`;
    out += `Introduction\n\n`;
    out += `- This file was generated from NCERT chapter text provided by the user. The notes follow the NCERT sequence as closely as possible.\n\n`;

    for (const sec of notesSections) {
      out += `${sec.heading}\n\n`;
      for (const b of sec.bullets) {
        out += `- ${b}\n`;
      }
      out += `\n`;
    }

    out += `Conclusion:\n\n${conclusion}\n\n`;
    out += `Keywords to Remember:\n\n${keywords.join(", ")}\n`;

    return res.json({ notes: out, sections: notesSections, conclusion, keywords });
  } catch (err) {
    console.error("Generate error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

// Health
app.get("/health", (_req, res) => res.status(200).send("ok"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
