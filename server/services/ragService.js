const Embedding = require('../models/Embedding');

// 1 token ≈ 4 chars → 500 tokens ≈ 2000 chars, overlap ≈ 200 chars
const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

let embedder = null;

const getEmbedder = async () => {
  if (!embedder) {
    const { pipeline } = await import('@xenova/transformers');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
};

const embedText = async (text) => {
  const embed = await getEmbedder();
  const output = await embed(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

const chunkText = (text) => {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
};

const cosineSimilarity = (a, b) => {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const uploadToMongo = async (text, userId, fileName) => {
  const fileId = `${userId}_${Date.now()}`;
  const chunks = chunkText(text.trim());

  const docs = await Promise.all(
    chunks.map(async (chunk) => ({
      fileId,
      userId: userId.toString(),
      fileName,
      text: chunk,
      embedding: await embedText(chunk),
    }))
  );

  await Embedding.insertMany(docs);

  return { fileId, fileName, chunkCount: chunks.length };
};

const queryMongo = async (query, userId, fileId, topK = 5) => {
  const queryEmbedding = await embedText(query);

  // Fetch all chunks for this file, then rank by cosine similarity in JS
  const chunks = await Embedding.find({ fileId }).lean();

  if (!chunks.length) return [];

  return chunks
    .map((c) => ({ text: c.text, score: cosineSimilarity(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((c) => c.text);
};

module.exports = { uploadToMongo, queryMongo };
