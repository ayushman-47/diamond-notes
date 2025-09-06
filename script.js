
/*
Front-end demo for Diamond Notes Generator.
- Extracts text from uploaded PDF (using PDF.js)
- Or uses chapter name as input
- Builds the master prompt
- Sends to API (client key mode or proxy mode)
Note: This demo requires you to paste an API key (or provide proxy). See README in zip.
*/

const classSelect = document.getElementById('classSelect');
const subjectSelect = document.getElementById('subjectSelect');
const langSelect = document.getElementById('langSelect');
const chapterInput = document.getElementById('chapterInput');
const pdfInput = document.getElementById('pdfInput');
const pdfStatus = document.getElementById('pdfStatus');
const apiKeyInput = document.getElementById('apiKeyInput');
const proxyUrlInput = document.getElementById('proxyUrlInput');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const output = document.getElementById('output');
const loading = document.getElementById('loading');

const clientBox = document.getElementById('clientKeyBox');
const proxyBox = document.getElementById('proxyBox');

document.querySelectorAll('input[name="apiMode"]').forEach(radio=>{
  radio.addEventListener('change', (e)=>{
    if(e.target.value==='client'){ clientBox.classList.remove('hidden'); proxyBox.classList.add('hidden'); }
    else { clientBox.classList.add('hidden'); proxyBox.classList.remove('hidden'); }
  });
});

// Subject mapping (expandable)
const SUBJECTS = {
  "1-8": ["Mathematics","English","Hindi","Bengali","Science","Social Science"],
  "9-10": ["Mathematics","English","Hindi","Bengali","Physics","Chemistry","Biology","History","Geography","Political Science","Economics"],
  "11-12-arts": ["History","Geography","Political Science","Economics","Sociology","Philosophy","Psychology","Social Science","English","Hindi"],
  "11-12-commerce": ["Economics","Business Studies","Accountancy","Mathematics","English","Hindi"],
  "11-12-science": ["Mathematics","Physics","Chemistry","Biology","English","Hindi"]
};

// populate class dropdown
function populateClasses(){
  const classes = [];
  for(let i=1;i<=12;i++) classes.push(i);
  classSelect.innerHTML = classes.map(c=>`<option value="${c}">${c}</option>`).join('');
  updateSubjects();
}
function updateSubjects(){
  const cls = parseInt(classSelect.value);
  let list = [];
  if(cls<=8) list = SUBJECTS["1-8"];
  else if(cls<=10) list = SUBJECTS["9-10"];
  else {
    // For 11-12 show combined and user can pick stream via a simple prompt (we show all but recommend streams)
    list = [...new Set([].concat(SUBJECTS["11-12-arts"], SUBJECTS["11-12-commerce"], SUBJECTS["11-12-science"]))];
  }
  subjectSelect.innerHTML = list.map(s=>`<option value="${s}">${s}</option>`).join('');
}
classSelect.addEventListener('change', updateSubjects);
populateClasses();

// PDF handling using PDF.js
let uploadedPdfText = '';
pdfInput.addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file){ pdfStatus.textContent = 'No file selected'; uploadedPdfText = ''; return; }
  pdfStatus.textContent = 'Reading PDF...';
  try{
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
    let text = '';
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(it=>it.str);
      text += strings.join(' ') + '\n\n';
    }
    uploadedPdfText = text;
    pdfStatus.textContent = `Loaded PDF (${pdf.numPages} pages)`;
  }catch(err){
    console.error(err);
    pdfStatus.textContent = 'Error reading PDF';
  }
});

// Build master prompt (updated to include language and selection)
function buildPrompt(chapterText, chapterName, classVal, subjectVal, language){
  const master = `You are an expert NCERT educational assistant that generates "Diamond Notes" — detailed, structured study notes for students in Classes 1 to 12.\n\n`+
`The user selected: Class ${classVal}, Subject: ${subjectVal}, Chapter: ${chapterName || '(uploaded PDF)'}, Output Language: ${language === 'hindi' ? 'Hindi' : 'English'}.\n\n`+
`Task: Using ONLY the provided NCERT chapter text (below), generate Diamond Notes in the selected language following this format:\n1) Chapter Title\n2) Numbered Headings (in NCERT order) with concise bullet points under each heading (include important dates, facts, definitions, examples, diagram descriptions).\n3) Conclusion (2-3 lines)\n4) Keywords to Remember (8-15 items).\n\n`+
`Strict rules: Use only the content below; do not add outside knowledge. Keep bullets concise, exam-oriented, and preserve NCERT sequence. Output must be clear and well-structured.\n\n`+
`NCERT CHAPTER TEXT START:\n\n${chapterText}\n\nNCERT CHAPTER TEXT END.`; 
  return master;
}

// Generate handler
generateBtn.addEventListener('click', async ()=>{
  output.classList.add('hidden'); output.textContent=''; loading.classList.remove('hidden');
  const classVal = classSelect.value;
  const subjectVal = subjectSelect.value;
  const language = langSelect.value;
  const chapterName = chapterInput.value.trim();

  let chapterText = '';
  if(uploadedPdfText){
    chapterText = uploadedPdfText;
  } else if(chapterName){
    // For demo: we do NOT fetch NCERT from web. Instead we ask user to upload if they want exact NCERT text.
    chapterText = `User provided chapter name: ${chapterName}. (Note: In this demo, remote NCERT PDF fetching is not enabled. For accurate NCERT-based notes, upload the NCERT chapter PDF in the upload box.)`;
  } else {
    alert('Please enter a chapter name or upload a PDF.');
    loading.classList.add('hidden');
    return;
  }

  const prompt = buildPrompt(chapterText, chapterName, classVal, subjectVal, language);

  try{
    // Determine mode
    const apiMode = document.querySelector('input[name="apiMode"]:checked').value;
    let responseText = '';
    if(apiMode === 'client'){
      const key = apiKeyInput.value.trim();
      if(!key){ alert('Paste your API key in the box (for demo).'); loading.classList.add('hidden'); return; }
      // Direct call to OpenAI Chat Completions (example). This will use your key and may cost credits.
      const payload = {
        model: "gpt-4o-mini",
        messages: [
          {role: "system", content: "You are a helpful assistant."},
          {role: "user", content: prompt}
        ],
        temperature: 0.2,
        max_tokens: 2500
      };
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":"application/json",
          "Authorization": "Bearer " + key
        },
        body: JSON.stringify(payload)
      });
      if(!res.ok){ const t = await res.text(); throw new Error(t||'API error'); }
      const data = await res.json();
      // Attempt to extract assistant reply
      responseText = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || JSON.stringify(data);
    } else {
      const proxy = proxyUrlInput.value.trim();
      if(!proxy){ alert('Enter proxy URL'); loading.classList.add('hidden'); return; }
      const res = await fetch(proxy, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ prompt })
      });
      if(!res.ok){ const t = await res.text(); throw new Error(t||'Proxy error'); }
      const data = await res.text();
      responseText = data;
    }

    output.textContent = responseText;
    output.classList.remove('hidden');
  }catch(err){
    console.error(err);
    alert('Error: '+ (err.message || err));
  }finally{
    loading.classList.add('hidden');
  }
});

clearBtn.addEventListener('click', ()=>{
  chapterInput.value=''; pdfInput.value=''; pdfStatus.textContent='No file selected'; uploadedPdfText=''; output.textContent=''; output.classList.add('hidden');
});
