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

const jokes = [
  'Why was the math book sad? Because it had too many problems.',
  'Why did the tomato turn red? Because it saw the salad dressing.',
  'What did the janitor say when he jumped out of the closet? "Supplies!"',
  'How do you make a tissue dance? You put a little boogey in it!',
  'Why did the scarecrow win an award? Because he was outstanding in his field.',
  'Why did the hipster burn his tongue? He drank his coffee before it was cool.',
  'Why don’t scientists trust atoms? Because they make up everything.',
  'Why don’t oysters give to charity? They’re shellfish.',
  'Why did the chicken cross the playground? To get to the other slide.',
  'Why did the stadium get hot after the game? Because all of the fans left.',
];

function getJoke() {
  const randomIndex = Math.floor(Math.random() * jokes.length)
  return jokes[randomIndex]
}

async function getBotResponse(prompt) {
  const response = await fetch('https://codex-1z8x.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
    }),
  })

  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim() // trims any trailing spaces/'\n'
    return parsedData
  } else {
    const err = await response.text()
    throw new Error(err)
  }
}

async function handleUserInput(input) {
  chatContainer.innerHTML += chatStripe(false, input)
  form.reset()
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

  // If the prompt contains the word "joke", randomly choose from an array of jokes
  if (data.prompt.toLowerCase().includes('joke')) {
    const jokes = ['Why was the math book sad? Because it had too many problems.', 'I told my wife she was drawing her eyebrows too high. She looked surprised.', 'Why do we tell actors to “break a leg?” Because every play has a cast.']
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    typeText(messageDiv, joke);
  } else {
    typeText(messageDiv, parsedData);
  }

  storeConversation(); // Store the conversation in local storage after each message is sent/received
} else {
  const err = await response.text();

  messageDiv.innerHTML = 'Something went wrong';
  alert(err);
}}