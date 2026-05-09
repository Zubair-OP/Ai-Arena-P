require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/streamHandler');

const authRoutes = require('./routes/auth');
const conversationRoutes = require('./routes/conversations');
const arenaRoutes = require('./routes/arena');
const ragRoutes = require('./routes/rag');

const app = express();
const server = http.createServer(app);

// Must init socket before routes so emitToSocket is available
initSocket(server);

connectDB();

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/arena', arenaRoutes);
app.use('/api/rag', ragRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, data: { message: 'AI Arena server is running' } });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`AI Arena server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the process or change PORT in .env.`);
    process.exit(1);
  } else {
    throw err;
  }
});
