const { ChatOpenAI } = require('@langchain/openai');
require('dotenv').config();

const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await chatModel.invoke('what is LangSmith?');

console.log(response);
