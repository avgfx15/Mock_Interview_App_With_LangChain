require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const session = require('express-session');
const { ChatOpenAI } = require('@langchain/openai');
const  getPrompts  = require('./prompts');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// app.use(
//   session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }, // Set secure: true in production with HTTPS
//   })
// );

// Initialize OpenAI Chat Model
const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

let chatContext = [];
// Chat API with Context
app.post('/chat', async (req, res) => {
  try {
    const { message, resumeKeywords } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    chatContext.push({ role: 'user', content: message });

    const systemMessage = {
      role: 'system',
      content: `${getPrompts()} ${resumeKeywords.join(
        ', '
      )}.keep all previous questions and answers in context.`,
    };

    const contextWithSystemMessage = [systemMessage, ...chatContext];

    const response = await chatModel.invoke(contextWithSystemMessage);
    chatContext.push({ role: 'assistant', content: response.content });

    res.json({ response: response.content });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
