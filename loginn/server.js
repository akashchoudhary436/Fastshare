const express = require('express');
const sessionMiddleware = require('./config/session-express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoute');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration to allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:3000', // Allow only requests from this origin
  methods: ['GET', 'POST'], // Specify allowed HTTP methods
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

// Connect to MongoDB Atlas
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Apply session middleware
app.use(sessionMiddleware);

// Basic route
app.get('/', (req, res) => {
  res.send("Hello World");
});

// User routes
app.use('/user', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
