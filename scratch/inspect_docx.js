const AdmZip = require('adm-zip');
const fs = require('fs');

const zip = new AdmZip('CareerReady_AI_IEEE_Format.docx');
const docXml = zip.readAsText('word/document.xml');

// Let's find drawing elements for Fig 1 and Fig 2
const drawings = docXml.match(/<w:drawing[\s\S]*?<\/w:drawing>/g) || [];
console.log('Found drawings count:', drawings.length);

// Let's find table elements
const tables = docXml.match(/<w:tbl[\s\S]*?<\/w:tbl>/g) || [];
console.log('Found tables count:', tables.length);

// Let's write drawings to a file for easy re-use
if (drawings.length >= 2) {
  fs.writeFileSync('scratch/fig1_drawing.xml', drawings[0]);
  fs.writeFileSync('scratch/fig2_drawing.xml', drawings[1]);
  console.log('Saved fig1 and fig2 drawings');
}
