const express = require('express');
const http = require('http');

const socketIO = require('socket.io');
const cors = require('cors');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS settings
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000', // React app URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Define server port
const PORT = process.env.PORT || 3001;

// Enable CORS for Express routes (if any)
app.use(cors({
  origin: 'http://localhost:3000',
}));

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user joining a room
  socket.on('join-room', (roomId) => {
    console.log(`User joined room: ${roomId}`);
    socket.join(roomId);
  });

  // Relay WebRTC offers to the specific room
  socket.on('webrtc-offer', ({ offer, roomId }) => {
    console.log(`Received offer for room: ${roomId}`);
    socket.to(roomId).emit('webrtc-offer', { offer });
  });

  // Relay WebRTC answers to the specific room
  socket.on('webrtc-answer', ({ answer, roomId }) => {
    console.log(`Received answer for room: ${roomId}`);
    socket.to(roomId).emit('webrtc-answer', { answer });
  });

  // Relay ICE candidates to the specific room
  socket.on('ice-candidate', ({ candidate, roomId }) => {
    console.log(`Received ICE candidate for room: ${roomId}`);
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

});