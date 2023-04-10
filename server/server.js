const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const OpenAIChat = require('./openai')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const openaiChat = new OpenAIChat(process.env.OPENAI_API_KEY)

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  })
})

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt
    const response = await openaiChat.getResponse(prompt)

    res.status(200).send({
      bot: response
    })
  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong')
  }
})

app.listen(5000, () => console.log('AI server started on http://localhost:5000'))
