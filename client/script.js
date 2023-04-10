const form = document.querySelector('form');
const input = document.querySelector('textarea');
const chatContainer = document.querySelector('#chat_container');

// Define function to add user input and bot response to chat container
function addToChatContainer(userInput, botResponse) {
  const userBubble = document.createElement('div');
  userBubble.classList.add('user-bubble');
  userBubble.textContent = userInput;

  const botBubble = document.createElement('div');
  botBubble.classList.add('bot-bubble');
  botBubble.textContent = botResponse;

  chatContainer.appendChild(userBubble);
  chatContainer.appendChild(botBubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Define function to send user input to server and receive bot response
async function sendInputToServer(input) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: input })
  });

  const data = await response.json();
  return data.response;
}

// Define function to display chat history in chat container
async function displayChatHistory() {
  const response = await fetch('/api/chat-history');
  const data = await response.json();
  const questions = data.chatHistory.questions;
  const responses = data.chatHistory.responses;

  for (let i = 0; i < questions.length; i++) {
    addToChatContainer(questions[i], responses[i]);
  }
}

// Display chat history on page load
displayChatHistory();

// Function to generate bot response
async function generateResponse(input) {
  // Check if user input is empty or already in chat history
  if (!input || isRepeated(input)) {
    return 'I cannot understand or repeat the same question.';
  }

  // Send user input to OpenAI API to get response
  const response = await openaiChat.getResponse(input);

  // Add user input and bot response to chat history
  chatHistory.push({ user: input, bot: response });

  // Return the bot response
  return response;
}

// Function to check if user input is already in chat history
function isRepeated(input) {
  return chatHistory.some((entry) => entry.user === input);
}

// Route to handle user input and return bot response
app.post('/api/chat', async (req, res) => {
  // Get user input from request body
  const userInput = req.body.input;

  // Generate response from OpenAI API
  const botResponse = await generateResponse(userInput);

  // Return bot response in JSON format
  res.json({ response: botResponse });
});

// Route to get chat history
app.get('/api/chat-history', (req, res) => {
  res.json({ chatHistory });
});

