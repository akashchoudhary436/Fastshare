// session-express.js
const session = require('express-session');
const MongoStore = require('connect-mongo'); // For storing sessions in MongoDB

// Session middleware configuration
const sessionMiddleware = session({
  secret: 'fastshare', // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/fastshare' }), // Replace with your MongoDB URI
  cookie: { secure: false }, // Set secure: true in production with HTTPS
});

module.exports = sessionMiddleware;
