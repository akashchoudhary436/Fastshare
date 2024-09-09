import { Server } from 'bittorrent-tracker';
import http from 'http';

// Create the tracker server
const server = new Server({
  udp: false,  // Disable UDP server
  http: false, // Disable HTTP server
  ws: true,    // Enable WebSocket server
  stats: true, // Enable web-based statistics
  trustProxy: false, // Enable trusting x-forwarded-for header for remote IP
  filter: function (infoHash, params, cb) {
    // Allow all torrents
    cb(null);
  }
});

// Handle WebSocket upgrade and simple HTTP requests
const wsServer = http.createServer((req, res) => {
  if (req.headers['upgrade'] !== 'websocket') {
    // Handle regular HTTP request
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Tracker is running');
  }
});

// Start listening on the specified port and hostname
const port = 8000;
const hostname = '0.0.0.0';
wsServer.listen(port, hostname, () => {
  console.log(`Server is running and WebSocket tracker is listening on ws://${hostname}:${port}`);
});

// Attach the WebSocket tracker to the HTTP server
server.ws.listen(wsServer);

// Handle WebSocket tracker events
server.on('error', function (err) {
  console.log('Fatal server error:', err.message);
});

server.on('warning', function (err) {
  console.log('Client sent bad data:', err.message);
});

server.on('listening', function () {
  const wsAddr = server.ws.address();
  const wsHost = wsAddr.address !== '::' ? wsAddr.address : 'localhost';
  const wsPort = wsAddr.port;
  console.log(`WebSocket tracker: ws://${wsHost}:${wsPort}`);
});

server.on('start', function (addr) {
  console.log('Got start message from', addr);
});

server.on('complete', function (addr) {});
server.on('update', function (addr) {});
server.on('stop', function (addr) {});

// Log current info hashes for all torrents in the tracker server
console.log(Object.keys(server.torrents));
