const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAIChat = require('./openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openaiChat = new OpenAIChat(process.env.OPENAI_API_KEY);

// Define chat history object to store all questions and responses
const chatHistory = {
  questions: [],
  responses: []
};

// Define function to add question and response to chat history object
function addToChatHistory(question, response) {
  chatHistory.questions.push(question);
  chatHistory.responses.push(response);
}

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  });
});

app.post('/api/chat', async (req, res) => {
  const input = req.body.input;

  // If chat history is not empty, check if the current input matches a previous question
  if (chatHistory.questions.length > 0) {
    const prevIndex = chatHistory.questions.indexOf(input.toLowerCase());
    if (prevIndex !== -1) {
      const prevResponse = chatHistory.responses[prevIndex];
      res.json({ response: prevResponse });
      return;
    }
  }

  // If input is not a previous question, generate response using OpenAI API
  const response = await openaiChat.getResponse(input);

  // Add question and response to chat history
  addToChatHistory(input.toLowerCase(), response);

  // Return response in JSON format
  res.json({ response: response });
});

app.get('/api/chat-history', (req, res) => {
  res.json({ chatHistory: chatHistory });
});

app.listen(5000, () => console.log('AI server started on http://localhost:5000'));
