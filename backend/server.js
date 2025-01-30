require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Ping route
app.get('/ping', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// $ Method 1

// # Multer setup for file upload
const upload = multer({ dest: 'uploads/' });

// % Resume upload and parsing route
app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const keywords = extraKeywords(pdfData.text);

    // % Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ keywords });
  } catch (error) {
    res.status(500).json({ error: 'Error processing the file' });
  }
});

const extraKeywords = (text) => {
  const words = text.split(/\W+/);

  const frequency = {};
  words.forEach((word) => {
    if (word.length > 4) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  const sortedKeywords = Object.keys(frequency).sort(
    (a, b) => frequency[b] - frequency[a]
  );
  return sortedKeywords.slice(0, 50);
};

// $ Method 2

// const { parseResume } = require('./resumeParse');
// const { upload } = require('./multerConfig');

// Resume upload and parsing route
// app.post('/upload-resume', upload.single('resume'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     console.log('Uploaded file details:', req.file);

//     const keywords = await parseResume(req.file.path);
//     res.json({ keywords });
//   } catch (error) {
//     console.error('Error processing file:', error);
//     res.status(500).json({ error: 'Error processing the file' });
//   }
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
