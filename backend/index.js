const { ChatOpenAI } = require('@langchain/openai');
require('dotenv').config();

const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
