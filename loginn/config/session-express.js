// session-express.js
const session = require('express-session');
const MongoStore = require('connect-mongo'); // For storing sessions in MongoDB

// Replace with your MongoDB Atlas connection string
const mongoUrl = 'mongodb+srv://akashchoudhary436:OjzGk5PLzQr8Xoyl@cluster0.wstuz.mongodb.net/fastshare?retryWrites=true&w=majority';

// Session middleware configuration
const sessionMiddleware = session({
  secret: 'fastshare', // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl }), // Use MongoDB Atlas URI
  cookie: { secure: false }, // Set secure: true in production with HTTPS
});

module.exports = sessionMiddleware;
