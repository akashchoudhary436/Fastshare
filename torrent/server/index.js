const compress = require('compression');
const cors = require('cors'); // Still needed for other potential CORS usage
const express = require('express');
const http = require('http');
const pug = require('pug');
const path = require('path');

const config = require('../config');

// Create an Express application
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Set the port
const PORT = Number(process.argv[2]) || 5001; // Server will default to port 5001 if no port is specified

// Trust "X-Forwarded-For" and "X-Forwarded-Proto" nginx headers
app.enable('trust proxy');

// Disable "powered by express" header
app.set('x-powered-by', false);

// Use pug for templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.engine('pug', pug.renderFile);

// Pretty print JSON
app.set('json spaces', 2);

// Use GZIP
app.use(compress());

// Security and performance middleware
app.use((req, res, next) => {
  if (config.isProd) {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  const extname = path.extname(req.url);
  if (['.eot', '.ttf', '.otf', '.woff', '.woff2'].indexOf(extname) >= 0) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-UA-Compatible', 'IE=Edge,chrome=1');
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../static')));

// Define a route for /torrent
app.get('/torrent', (req, res) => {
  res.send('Torrent page content goes here'); // You can render a template or serve a file instead
});

// Routes
app.get('/torrentshare', (req, res) => {
  res.render('index', {
    title: 'FastShare'
  });
});

app.get('/__rtcConfig__', (req, res) => {
  // Hardcoded WebRTC configuration
  const rtcConfig = {
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302', // Public Google STUN server
        ]
      }
    ],
    sdpSemantics: 'unified-plan',
    bundlePolicy: 'max-bundle',
    iceCandidatePoolsize: 1
  };
  res.send({
    comment: 'WARNING: This is *NOT* a public endpoint. Do not depend on it in your app',
    rtcConfig: rtcConfig
  });
});

app.get('*', (req, res) => {
  res.status(404).render('error', {
    title: '404 Page Not Found - Instant.io',
    message: '404 Not Found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const code = typeof err.code === 'number' ? err.code : 500;
  res.status(code).render('error', {
    title: '500 Internal Server Error',
    message: err.message || err
  });
});

// Start the server
server.listen(PORT, '127.0.0.1', () => {
  console.log('listening on port %s', server.address().port);
});
