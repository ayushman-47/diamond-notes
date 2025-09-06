import React, { useState } from "react";
import axios from "axios";

export default function App(){
  const [bookCode, setBookCode] = useState("lehi1.pdf");
  const [extractedText, setExtractedText] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const proxyPdf = (code) => `/pdf/${code}`;

  const handleOpenPdf = () => {
    window.open(proxyPdf(bookCode), "_blank");
  };

  const handleExtract = async () => {
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.get(`/extract-text/${bookCode}`);
      setExtractedText(res.data.text || "");
      setMessage("Extracted text loaded into the textarea below. Review and edit if needed.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to extract text. You can paste chapter text manually.");
    } finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!title || !extractedText) {
      setMessage("Please provide both Chapter Title and Chapter Text (paste or extract).");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/generate", { chapterTitle: title, chapterText: extractedText });
      setNotes(res.data.notes || "");
      setMessage("Generated Diamond Notes. Copy or download using buttons.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to generate notes.");
    } finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setMessage("Notes copied to clipboard.");
  };

  const handleDownload = () => {
    const blob = new Blob([notes], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${title || "diamond-notes"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{maxWidth:980, margin:'24px auto', fontFamily:'Inter, Arial, sans-serif'}}>
      <header style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <h1>📘 Diamond Notes — NCERT Expert Note Maker</h1>
        <div style={{textAlign:'right', fontSize:14}}>Powered by NCERT PDFs</div>
      </header>

      <section style={{marginTop:20, padding:16, border:'1px solid #eee', borderRadius:8}}>
        <h2>1) Fetch PDF from NCERT</h2>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <input value={bookCode} onChange={(e)=>setBookCode(e.target.value)} style={{padding:8, width:260}} />
          <button onClick={handleOpenPdf} style={{padding:'8px 12px'}}>Open PDF</button>
          <button onClick={handleExtract} style={{padding:'8px 12px'}}>Extract Text</button>
        </div>
        <div style={{marginTop:8, fontSize:13, color:'#555'}}>
          Use NCERT code like <code>lehi1.pdf</code>, <code>lemh1.pdf</code>. If extract fails, paste text manually.
        </div>
      </section>

      <section style={{marginTop:16, padding:16, border:'1px solid #eee', borderRadius:8}}>
        <h2>2) Paste / Edit Chapter Text</h2>
        <input placeholder="Exact chapter title (as in NCERT)" value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}} />
        <textarea value={extractedText} onChange={e=>setExtractedText(e.target.value)} rows={10} style={{width:'100%', padding:8}} placeholder="Paste the NCERT chapter text here (or click Extract Text)"></textarea>
      </section>

      <section style={{marginTop:16, padding:16, border:'1px solid #eee', borderRadius:8}}>
        <h2>3) Generate Diamond Notes</h2>
        <div style={{display:'flex', gap:8}}>
          <button onClick={handleGenerate} style={{padding:'8px 12px'}}>Generate Notes</button>
          <button onClick={handleCopy} disabled={!notes} style={{padding:'8px 12px'}}>Copy Notes</button>
          <button onClick={handleDownload} disabled={!notes} style={{padding:'8px 12px'}}>Download .txt</button>
        </div>
        <div style={{marginTop:8, color:'#444'}}>{message}</div>
      </section>

      <section style={{marginTop:16, padding:16, border:'1px solid #eee', borderRadius:8}}>
        <h2>4) Output — Diamond Notes</h2>
        <pre style={{whiteSpace:'pre-wrap', background:'#fafafa', padding:12, borderRadius:6, minHeight:200}}>{notes || "Generated notes will appear here."}</pre>
      </section>

      <footer style={{marginTop:24, textAlign:'center', color:'#666', fontSize:13'}}>
        Tip: If a PDF fails to extract on Render, download the NCERT PDF manually and paste the chapter text here.
      </footer>
    </div>
);
}
