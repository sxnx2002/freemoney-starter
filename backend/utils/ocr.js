// Simple OCR wrapper using tesseract.js server-side.
// In production consider using Google Cloud Vision or AWS Textract for reliability and scale.
const Tesseract = require('tesseract.js');
async function runOcr(filePath){
  try{
    const res = await Tesseract.recognize(filePath, 'eng+tha');
    const text = res.data.text;
    const conf = res.data.confidence || 0;
    return { text, confidence: conf/100 };
  }catch(e){
    return { text: '', confidence: 0 };
  }
}

module.exports = { runOcr };
