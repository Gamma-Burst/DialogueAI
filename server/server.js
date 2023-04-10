const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAIChat = require('./openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openaiChat = new OpenAIChat(process.env.OPENAI_API_KEY);

const chatHistory = [];

// Function to generate bot response
async function generateResponse(input) {
  // Send user input to OpenAI API to get response
  const response = await openaiChat.getResponse(input);

  // Add user input and bot response to chat history
  chatHistory.push({ user: input, bot: response });

  // Return the bot response
  return response;
}

// Route to handle chat requests
app.post('/api/chat', async (req, res) => {
  // Get user input from request body
  const userInput = req.body.input;

  // Generate response from OpenAI API
  const botResponse = await generateResponse(userInput);

  // Return bot response in JSON format
  res.json({ response: botResponse });
});

app.listen(5000, () => console.log('AI server started on http://localhost:5000'));
