const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('webrtc-offer', ({ offer, roomId }) => {
    socket.to(roomId).emit('webrtc-offer', { offer });
  });

  socket.on('webrtc-answer', ({ answer, roomId }) => {
    socket.to(roomId).emit('webrtc-answer', { answer });
  });

  socket.on('ice-candidate', ({ candidate, roomId }) => {
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server is listening on port 3001');
});