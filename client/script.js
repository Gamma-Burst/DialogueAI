import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('#chat_form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.';

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
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
  );
}

function storeConversation() {
  const conversation = chatContainer.innerHTML;
  localStorage.setItem('conversation', conversation);
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

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
      prompt: data.get('prompt'),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = ' ';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    typeText(messageDiv, parsedData);

    storeConversation(); // Store the conversation in local storage after each message is sent/received
  } else {
    const err = await response.text();

    messageDiv.innerHTML = 'Something went wrong';
    alert(err);
  }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

// Restore the conversation from local storage on page load
window.addEventListener('load', () => {
  const conversation = getConversationFromLocalStorage();
  conversation.forEach(({ isUser, message }) => {
    if (isUser) {
      addMessageToChat(message, 'user');
    } else {
      addMessageToChat(message, 'bot');
    }
  });
});

// Get the conversation from local storage
function getConversationFromLocalStorage() {
  try {
    const conversation = JSON.parse(localStorage.getItem('conversation')) || [];
    return conversation;
  } catch (e) {
    console.error('Error getting conversation from local storage', e);
    return [];
  }
}

// Add message to chat
function addMessageToChat(message, sender) {
  const chatContainer = document.getElementById('chat-container');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}`;
  messageElement.innerText = message;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Save the conversation to local storage
  const conversation = getConversationFromLocalStorage();
  conversation.push({ isUser: sender === 'user', message });
  try {
    localStorage.setItem('conversation', JSON.stringify(conversation));
  } catch (e) {
    console.error('Error saving conversation to local storage', e);
  }
}
