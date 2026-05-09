const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    return res.json({ success: true, data: { conversations } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createConversation = async (req, res) => {
  try {
    const { title } = req.body;
    const conversation = await Conversation.create({
      userId: req.user._id,
      title: title?.trim() || 'New Conversation',
    });
    return res.status(201).json({ success: true, data: { conversation } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await Message.deleteMany({ conversationId: conversation._id });
    await conversation.deleteOne();

    return res.json({ success: true, data: { message: 'Conversation deleted' } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    return res.json({ success: true, data: { messages } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllConversations, createConversation, deleteConversation, getMessages };
