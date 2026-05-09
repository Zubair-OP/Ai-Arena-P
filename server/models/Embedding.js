const mongoose = require('mongoose');

const embeddingSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  uploadedAt: { type: Date, default: Date.now },
});

embeddingSchema.index({ fileId: 1 });
embeddingSchema.index({ userId: 1 });

module.exports = mongoose.model('Embedding', embeddingSchema);
