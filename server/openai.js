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
      model: "text-davinci-003",
      prompt: `${this.memory.join("\n")}`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
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
