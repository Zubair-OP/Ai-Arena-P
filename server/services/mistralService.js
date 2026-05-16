const { Mistral } = require('@mistralai/mistralai');
const { emitToSocket } = require('../socket/streamHandler');

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Models to try in order if capacity is exceeded
const JUDGE_MODELS = ['mistral-small-latest', 'open-mixtral-8x7b', 'open-mistral-7b'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const streamMistralResponse = async (prompt, socketId) => {
  let lastError;

  for (const model of JUDGE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const stream = await mistral.chat.stream({
          model,
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
      } catch (err) {
        lastError = err;
        const is429 = err?.statusCode === 429 || err?.body?.includes?.('429') || err?.message?.includes?.('429');
        if (is429 && attempt === 0) {
          await sleep(2000);
          continue;
        }
        break; // try next model
      }
    }
  }

  throw lastError;
};

module.exports = { streamMistralResponse };
