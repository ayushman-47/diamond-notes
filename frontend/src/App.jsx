import React, { useState } from "react";

export default function App() {
  const [pdf, setPdf] = useState("lehi1.pdf");

  return (
    <div style={{ padding: "20px" }}>
      <h1>📘 Diamond Notes</h1>
      <p>Enter NCERT PDF filename (example: lehi1.pdf, lemh1.pdf)</p>
      <input
        value={pdf}
        onChange={(e) => setPdf(e.target.value)}
        placeholder="lehi1.pdf"
        style={{ padding: "6px", width: "250px" }}
      />
      <div style={{ marginTop: "20px" }}>
        <iframe
          src={`/pdf/${pdf}`}
          width="100%"
          height="600px"
          title="NCERT PDF"
        />
      </div>
    </div>
  );
}
