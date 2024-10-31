const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const pdfPoppler = require('pdf-poppler');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer();

// Temporary folder to store images converted from PDF pages
const TEMP_IMAGE_FOLDER = './temp_images';
if (!fs.existsSync(TEMP_IMAGE_FOLDER)) {
  fs.mkdirSync(TEMP_IMAGE_FOLDER);
}

app.post('/api/extract', upload.single('document'), async (req, res) => {
  const { buffer, originalname } = req.file;
  const fileType = path.extname(originalname).toLowerCase();

  try {
    if (fileType === '.pdf') {
        
      // Convert PDF to images
      const imagePaths = await convertPdfToImages(buffer);
      
      // Process each page image with OCR
      const ocrResults = [];
      for (const imagePath of imagePaths) {
        const { data } = await Tesseract.recognize(imagePath, 'eng');
        ocrResults.push(data.text);
        console.log("data.text",data.text);
        // Remove image after OCR to save space
        fs.unlinkSync(imagePath);
      }
      console.log("ocrResults",ocrResults.join('\n'));
      const extractedData = parseDocumentData(ocrResults.join('\n'));
      
      
      res.json(extractedData);
    } else {
      // Handle image files (JPEG, PNG)
      const { data } = await Tesseract.recognize(buffer, 'eng');
      const extractedData = parseDocumentData(data.text);
      res.json(extractedData);
    }
  } catch (error) {
    res.status(500).json({ error: 'Document processing failed.' });
  }
});

// Function to convert PDF to image files using pdf-poppler
async function convertPdfToImages(pdfBuffer) {
  const pdfPath = path.join(TEMP_IMAGE_FOLDER, `temp.pdf`);
  fs.writeFileSync(pdfPath, pdfBuffer);

  const opts = {
    format: 'jpeg',
    out_dir: TEMP_IMAGE_FOLDER,
    out_prefix: 'page',
    page: null, // Convert all pages
  };

  await pdfPoppler.convert(pdfPath, opts);

  // Collect all page images
  const imagePaths = fs.readdirSync(TEMP_IMAGE_FOLDER)
    .filter(file => file.startsWith('page') && file.endsWith('.jpg'))
    .map(file => path.join(TEMP_IMAGE_FOLDER, file));

  // Remove PDF after conversion
  fs.unlinkSync(pdfPath);
  return imagePaths;
}

function parseDocumentData(text) {
    console.log("text",text);
    
  const data = {
    name: extractField(text, 'Name'),
    passportNumber: extractField(text, 'Passport Number'),
    nationality: extractField(text, 'Nationality'),
    dob: extractField(text, 'Date of Birth'),
    issueDate: extractField(text, 'Issue Date'),
    expirationDate: extractField(text, 'Expiration Date'),
  };
  console.log("data",data);
  
  return data;
}

function extractField(text, fieldName) {
    const regex = new RegExp(`${fieldName}[.:]?\\s*(.+?)(?=\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
