const fs = require('fs');
const pdfParse = require('pdf-parse');

async function parseResume(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    // Extract keywords
    const text = pdfData.text;
    const keywords = text
      .toLowerCase()
      .match(/\b[a-zA-Z]+\b/g)
      .filter((word, index, arr) => arr.indexOf(word) === index);

    // Cleanup
    fs.unlinkSync(filePath);

    return keywords;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

module.exports = { parseResume };
