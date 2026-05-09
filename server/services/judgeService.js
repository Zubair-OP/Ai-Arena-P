const { streamMistralResponse } = require('./mistralService');

const buildJudgePrompt = (query, responseA, responseB) =>
  `You are a neutral AI judge. Analyze both responses objectively.

User Query: ${query}
Model A Response: ${responseA}
Model B Response: ${responseB}

Evaluate based on: accuracy, clarity, completeness, relevance.

Respond ONLY in this exact JSON format with no extra text, no markdown, no newlines inside string values:
{"ratingA": <number 1-10>, "ratingB": <number 1-10>, "winner": "<A|B|tie>", "reasoning": "<2-3 sentence analysis on a single line>"}`;

const parseJudgeResponse = (text) => {
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Extract the JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON object found in judge response');
  cleaned = jsonMatch[0];

  try {
    const parsed = JSON.parse(cleaned);
    parsed.ratingA = Number(parsed.ratingA) || 5;
    parsed.ratingB = Number(parsed.ratingB) || 5;
    return parsed;
  } catch {
    // Fix literal control characters inside JSON string values and retry
    const fixed = cleaned.replace(/"(?:[^"\\]|\\.)*"/g, (str) =>
      str.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
    );
    try {
      const parsed = JSON.parse(fixed);
      parsed.ratingA = Number(parsed.ratingA) || 5;
      parsed.ratingB = Number(parsed.ratingB) || 5;
      return parsed;
    } catch {
      // Last resort: extract fields with regex
      const ratingA = Number(cleaned.match(/"ratingA"\s*:\s*(\d+)/)?.[1]) || 5;
      const ratingB = Number(cleaned.match(/"ratingB"\s*:\s*(\d+)/)?.[1]) || 5;
      const winner = cleaned.match(/"winner"\s*:\s*"(A|B|tie)"/i)?.[1] || 'tie';
      const reasoning = cleaned.match(/"reasoning"\s*:\s*"([\s\S]*?)"\s*[,}]/)?.[1]
        ?.replace(/\n/g, ' ').trim() || 'Judgment unavailable.';
      return { ratingA, ratingB, winner, reasoning };
    }
  }
};

const judgeResponses = async (query, responseA, responseB, socketId) => {
  const prompt = buildJudgePrompt(query, responseA, responseB);
  const raw = await streamMistralResponse(prompt, socketId);
  return parseJudgeResponse(raw);
};

module.exports = { judgeResponses };
