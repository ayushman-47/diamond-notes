import React, { useState } from 'react'

function App() {
  const [classLevel, setClassLevel] = useState('')
  const [subject, setSubject] = useState('')
  const [chapter, setChapter] = useState('')
  const [language, setLanguage] = useState('English')
  const [pdfFile, setPdfFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setTimeout(() => {
      setNotes(`
Chapter Title: ${chapter || "Uploaded Chapter"}

1. Heading 1
   - Point 1
   - Point 2

2. Heading 2
   - Point A
   - Point B

Conclusion:
This is a summary of the chapter.

Keywords to Remember:
- Keyword1
- Keyword2
- Keyword3
      `)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="app">
      <h1>📘 Diamond Notes Generator</h1>
      <div className="form">
        <label>Class:</label>
        <select value={classLevel} onChange={e => setClassLevel(e.target.value)}>
          <option value="">Select Class</option>
          {[...Array(12).keys()].map(i => (
            <option key={i+1} value={i+1}>Class {i+1}</option>
          ))}
        </select>

        <label>Subject:</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter Subject" />

        <label>Chapter Name:</label>
        <input type="text" value={chapter} onChange={e => setChapter(e.target.value)} placeholder="Enter Chapter Name" />

        <label>Upload PDF:</label>
        <input type="file" onChange={e => setPdfFile(e.target.files[0])} />

        <label>Output Language:</label>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
        </select>

        <button onClick={handleGenerate}>Generate Notes</button>
      </div>

      {loading && <p>⏳ Generating Notes...</p>}
      {notes && (
        <div className="notes">
          <h2>Generated Notes</h2>
          <pre>{notes}</pre>
        </div>
      )}
    </div>
  )
}

export default App