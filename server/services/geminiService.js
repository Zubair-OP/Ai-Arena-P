const { GoogleGenerativeAI } = require('@google/generative-ai');
const { emitToSocket } = require('../socket/streamHandler');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const streamGeminiResponse = async (prompt, socketId) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContentStream(prompt);

  let fullContent = '';
  for await (const chunk of result.stream) {
    const token = chunk.text();
    if (token) {
      fullContent += token;
      emitToSocket(socketId, 'responseB_token', { token });
    }
  }

  return fullContent;
};

module.exports = { streamGeminiResponse };
