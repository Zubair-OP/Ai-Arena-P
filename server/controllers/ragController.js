const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { uploadToMongo, queryMongo } = require('../services/ragService');
const { streamGroqResponse } = require('../services/groqService');
const { streamGeminiResponse } = require('../services/geminiService');
const { judgeResponses } = require('../services/judgeService');
const { emitToSocket } = require('../socket/streamHandler');

const extractText = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === '.pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (ext === '.txt') {
    return file.buffer.toString('utf-8');
  }

  throw new Error('Unsupported file type');
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const text = await extractText(req.file);

    if (!text.trim()) {
      return res.status(400).json({ success: false, message: 'Could not extract text from file' });
    }

    const result = await uploadToMongo(text, req.user._id, req.file.originalname);

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const queryWithFile = async (req, res) => {
  try {
    const { query: userQuery, fileId, conversationId, socketId } = req.body;
    const userId = req.user._id;

    if (!userQuery || !userQuery.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    if (!fileId) {
      return res.status(400).json({ success: false, message: 'fileId is required' });
    }

    const chunks = await queryMongo(userQuery, userId, fileId);

    if (!chunks.length) {
      return res.status(404).json({ success: false, message: 'No relevant content found for this file' });
    }

    const context = chunks.join('\n\n---\n\n');
    const augmentedPrompt = `Context from uploaded document:\n${context}\n\nUser Question: ${userQuery}\n\nAnswer based on the context above.`;

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

    const [contentA, contentB] = await Promise.all([
      streamGroqResponse(augmentedPrompt, socketId),
      streamGeminiResponse(augmentedPrompt, socketId),
    ]);

    const judgment = await judgeResponses(userQuery, contentA, contentB, socketId);

    const message = await Message.create({
      conversationId: conversation._id,
      userId,
      query: userQuery,
      fileUploaded: true,
      responseA: { model: 'mixtral-8x7b-32768', provider: 'Groq', content: contentA },
      responseB: { model: 'gemini-1.5-flash', provider: 'Google Gemini', content: contentB },
      judge: {
        model: 'mistral-large-latest',
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
    console.error('RAG query error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadFile, queryWithFile };
