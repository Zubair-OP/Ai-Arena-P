const { Mistral } = require('@mistralai/mistralai');
const { emitToSocket } = require('../socket/streamHandler');

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const streamMistralResponse = async (prompt, socketId) => {
  const stream = await mistral.chat.stream({
    model: 'mistral-medium-latest',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  });

  let fullContent = '';
  for await (const chunk of stream) {
    const token = chunk.data?.choices?.[0]?.delta?.content || '';
    if (token) {
      fullContent += token;
    }
  }

  return fullContent;
};

module.exports = { streamMistralResponse };
