const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true },
  fileUploaded: { type: Boolean, default: false },
  fileName: { type: String },
  fileText: { type: String },
  responseA: {
    model: { type: String },
    provider: { type: String },
    content: { type: String },
  },
  responseB: {
    model: { type: String },
    provider: { type: String },
    content: { type: String },
  },
  judge: {
    model: { type: String },
    reasoning: { type: String },
    ratingA: { type: Number },
    ratingB: { type: Number },
    winner: { type: String, enum: ['A', 'B', 'tie'] },
  },
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
