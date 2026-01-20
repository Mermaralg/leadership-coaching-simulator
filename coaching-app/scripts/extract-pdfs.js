const fs = require('fs');
const pdfParse = require('pdf-parse').default || require('pdf-parse');
const path = require('path');

async function extractPDF(pdfPath, outputName) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  
  const outputDir = path.join(__dirname, '../lib/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, `${outputName}.txt`);
  fs.writeFileSync(outputPath, data.text);
  console.log(`✓ Extracted ${outputName}: ${data.text.length} characters`);
}

async function main() {
  console.log('Extracting PDF documents...\n');
  
  const docsDir = path.join(__dirname, '../../docs');
  
  await extractPDF(
    path.join(docsDir, '_5D güçlü gelişim - Güçlü.pdf'),
    'strengths-raw'
  );
  
  await extractPDF(
    path.join(docsDir, '_5D güçlü gelişim - Gelişim.pdf'),
    'development-raw'
  );
  
  await extractPDF(
    path.join(docsDir, '_5D güçlü gelişim - Ne yapması gerek.pdf'),
    'actions-raw'
  );
  
  await extractPDF(
    path.join(docsDir, '_5D güçlü gelişim - Boyut-Çapraz Yorum.pdf'),
    'cross-dimension-raw'
  );
  
  console.log('\n✓ All PDFs extracted successfully!');
}

main().catch(error => {
  console.error('Error extracting PDFs:', error);
  process.exit(1);
});
