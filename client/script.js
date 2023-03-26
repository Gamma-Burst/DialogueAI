import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('#chat_form');
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.'

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
      element.textContent = ''
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
            <div class="profile">
                <img 
                  src=${isAi ? bot : user} 
                  alt="${isAi ? 'bot' : 'user'}" 
                />
            </div>
            <div class="message" id=${uniqueId}>${value}</div>
        </div>
    </div>
  `
  )
}

function storeConversation() {
  const conversation = chatContainer.innerHTML
  localStorage.setItem('conversation', conversation)
}

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // to clear the textarea input
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId)

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight

  // specific message div
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  loader(messageDiv)

  const response = await fetch('https://codex-1z8x.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = ' '

  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim() // trims any trailing spaces/'\n'

    typeText(messageDiv, parsedData)

    storeConversation() // Store the conversation in local storage after each message is sent/received
  } else {
    const err = await response.text()

    messageDiv.innerHTML = 'Something went wrong'
    alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})

// Restore the conversation from local storage on page load
window.addEventListener('load', () => {
  const conversation = JSON.parse(localStorage.getItem('conversation')) || [];
  conversation.forEach(({ isUser, message }) => {
    if (isUser) {
      addMessageToChat(message, 'user');
    } else {
      addMessageToChat(message, 'bot');
    }
  });
});

// Save the conversation to local storage
function saveConversationToLocalStorage() {
  const conversation = getConversationFromChat();
  localStorage.setItem('conversation', JSON.stringify(conversation));
}

// Send a message to the bot
function sendMessageToBot(message) {
  // Send the message to the server using fetch or XHR
  // ...
  // When the response comes back, add the bot's response to the chat
  const botResponse = 'This is a dummy response from the bot';
  addMessageToChat(botResponse, 'bot');
  // Save the conversation to local storage
  saveConversationToLocalStorage();
}

// Add a message to the chat
function addMessageToChat(message, sender) {
  // Create a new message element
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(sender);

  // Set the message text
  const messageText = document.createElement('div');
  messageText.classList.add('message-text');
  messageText.textContent = message;
  messageElement.appendChild(messageText);

  // Add the message element to the chat
  const chat = document.querySelector('#chat');
  chat.appendChild(messageElement);
}

// Get the conversation from the chat
function getConversationFromChat() {
  const conversation = [];
  const messages = document.querySelectorAll('.message');
  messages.forEach((message) => {
    const isUser = message.classList.contains('user');
    const messageText = message.querySelector('.message-text').textContent;
    conversation.push({ isUser, message: messageText });
  });
  return conversation;
}

// Attach a submit event listener to the form
form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Get the user's message from the input field
  const input = document.querySelector('#input');
  const message = input.value.trim();

  // Add the user's message to the chat
  addMessageToChat(message, 'user');

  // Send the message to the bot
  sendMessageToBot(message);

  // Clear the input field
  input.value = '';
});let lastUserMessage = '';

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  const userMessage = data.get('prompt'); // Store the user's message in a variable
  lastUserMessage = userMessage; // Update the variable to store the latest user message

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, userMessage);

  // to clear the textarea input
  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div
  const messageDiv = document.getElementById(uniqueId);

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  const response = await fetch('https://codex-1z8x.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: userMessage,
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = ' ';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    // Check if the user is asking the same question again
    if (parsedData.toLowerCase() === lastUserMessage.toLowerCase()) {
      parsedData = "You just asked me that!";
    }

    typeText(messageDiv, parsedData);

    storeConversation(); // Store the conversation in local storage after each message is sent/received
  } else {
    const err = await response.text();

    messageDiv.innerHTML = 'Something went wrong';
    alert(err);
  }
};
