const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { streamGroqResponse } = require('../services/groqService');
const { streamGeminiResponse } = require('../services/geminiService');
const { judgeResponses } = require('../services/judgeService');
const { emitToSocket } = require('../socket/streamHandler');

const query = async (req, res) => {
  try {
    const { query: userQuery, conversationId, socketId } = req.body;
    const userId = req.user._id;

    if (!userQuery || !userQuery.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }
    } else {
      const title = userQuery.trim().split(/\s+/).slice(0, 6).join(' ');
      conversation = await Conversation.create({ userId, title });
    }

    emitToSocket(socketId, 'stream_start', {});

    // Run both AI models in parallel
    const [contentA, contentB] = await Promise.all([
      streamGroqResponse(userQuery, socketId),
      streamGeminiResponse(userQuery, socketId),
    ]);

    // Judge after both complete — fallback if judge service is unavailable
    let judgment;
    try {
      judgment = await judgeResponses(userQuery, contentA, contentB, socketId);
    } catch (judgeErr) {
      console.error('Judge service failed, using fallback:', judgeErr.message);
      judgment = { ratingA: 5, ratingB: 5, winner: 'tie', reasoning: 'Judgment unavailable due to service error.' };
    }

    const message = await Message.create({
      conversationId: conversation._id,
      userId,
      query: userQuery,
      responseA: {
        model: 'mixtral-8x7b-32768',
        provider: 'Groq',
        content: contentA,
      },
      responseB: {
        model: 'gemini-1.5-flash',
        provider: 'Google Gemini',
        content: contentB,
      },
      judge: {
        model: 'mistral-small-latest',
        reasoning: judgment.reasoning,
        ratingA: judgment.ratingA,
        ratingB: judgment.ratingB,
        winner: judgment.winner,
      },
    });

    await Conversation.findByIdAndUpdate(conversation._id, { updatedAt: new Date() });

    emitToSocket(socketId, 'arena_complete', {
      messageId: message._id,
      ratings: { modelA: judgment.ratingA, modelB: judgment.ratingB },
      winner: judgment.winner,
      reasoning: judgment.reasoning,
    });

    return res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        messageId: message._id,
        responseA: message.responseA,
        responseB: message.responseB,
        judge: message.judge,
      },
    });
  } catch (error) {
    console.error('Arena query error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { query };
