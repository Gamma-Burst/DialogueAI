const { Configuration, OpenAIApi } = require('openai')

class OpenAIChat {
  constructor(apiKey, memory = []) {
    const configuration = new Configuration({ apiKey })
    this.openai = new OpenAIApi(configuration)
    this.memory = memory
  }

  async getResponse(prompt) {
    this.memory.push(prompt)

    const response = await this.openai.createCompletion({
      model: "text-davinci-002",
      prompt: `${this.memory.join("\n")}`,
      temperature: 0.7,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ["\n"],
      ...this.memory.length && { context: this.memory.slice(0, -1).join("\n") },
    });

    this.memory.push(response.data.choices[0].text)
    return response.data.choices[0].text
  }

  resetMemory() {
    this.memory = []
  }
}

module.exports = OpenAIChat
