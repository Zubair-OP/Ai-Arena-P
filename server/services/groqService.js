const Groq = require('groq-sdk');
const { emitToSocket } = require('../socket/streamHandler');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const streamGroqResponse = async (prompt, socketId) => {
  const stream = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
    max_tokens: 2048,
  });

  let fullContent = '';
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || '';
    if (token) {
      fullContent += token;
      emitToSocket(socketId, 'responseA_token', { token });
    }
  }

  return fullContent;
};

module.exports = { streamGroqResponse };
