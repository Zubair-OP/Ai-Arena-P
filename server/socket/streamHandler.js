const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(o => o.trim());
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const emitToSocket = (socketId, event, data) => {
  if (io && socketId) {
    io.to(socketId).emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToSocket };
