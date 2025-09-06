import React, { useState } from "react";

function App() {
  const [file, setFile] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterText, setChapterText] = useState("");
  const [notes, setNotes] = useState("");

  const handleFetchPDF = () => {
    if (!file) return;
    window.open(`/pdf/${file}`, "_blank");
  };

  const handleExtractText = async () => {
    if (!file) return;
    try {
      const res = await fetch(`/extract-text/${file}`);
      const data = await res.json();
      if (data.text) {
        setChapterText(data.text);
      } else {
        alert("Could not extract text.");
      }
    } catch (err) {
      console.error(err);
      alert("Error extracting text.");
    }
  };

  const handleGenerateNotes = async () => {
    if (!chapterTitle || !chapterText) {
      alert("Please enter chapter title and text");
      return;
    }
    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterTitle, chapterText }),
      });
      const data = await res.json();
      setNotes(data.notes || "No notes generated.");
    } catch (err) {
      console.error(err);
      alert("Error generating notes.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        📘 Diamond Notes Generator
      </h1>

      {/* PDF Input */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">
          Enter NCERT PDF Code (e.g., <code>lehi1.pdf</code>)
        </label>
        <input
          type="text"
          value={file}
          onChange={(e) => setFile(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter filename like lehi1.pdf"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleFetchPDF}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow"
          >
            View PDF
          </button>
          <button
            onClick={handleExtractText}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow"
          >
            Extract Text
          </button>
        </div>
      </div>

      {/* Chapter Title */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Chapter Title</label>
        <input
          type="text"
          value={chapterTitle}
          onChange={(e) => setChapterTitle(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="Enter official NCERT chapter title"
        />
      </div>

      {/* Text Area */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Chapter Text</label>
        <textarea
          value={chapterText}
          onChange={(e) => setChapterText(e.target.value)}
          className="w-full p-2 border rounded-lg h-40"
          placeholder="Paste extracted or manual text here"
        />
      </div>

      {/* Generate Notes Button */}
      <button
        onClick={handleGenerateNotes}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg w-full"
      >
        Generate Diamond Notes
      </button>

      {/* Notes Output */}
      {notes && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2 text-gray-800">
            ✨ Diamond Notes
          </h2>
          <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm">
            {notes}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(notes)}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg shadow"
          >
            Copy Notes
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
