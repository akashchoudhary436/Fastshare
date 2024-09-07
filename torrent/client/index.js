// Define WebRTC configuration function
const getRtcConfig = (cb) => {
  // Hardcoded WebRTC configuration
  const rtcConfig = {
    iceServers: [
      // STUN Servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:stun.ekiga.net' },
  
      // TURN Servers (no authentication)
      { urls: 'turn:turn.anyfirewall.com:443?transport=udp' },
      { urls: 'turn:turn.anyfirewall.com:443?transport=tcp' }
    ],
    sdpSemantics: 'unified-plan',
    bundlePolicy: 'max-bundle',
    iceCandidatePoolSize: 10
  };
  
  cb(null, rtcConfig);
};

// Import necessary modules and libraries
const createTorrent = require('create-torrent');
const dragDrop = require('drag-drop');
const escapeHtml = require('escape-html');
const get = require('simple-get');
const formatDistance = require('date-fns/formatDistance');
const path = require('path');
const prettierBytes = require('prettier-bytes');
const throttle = require('throttleit');
const thunky = require('thunky');
const uploadElement = require('upload-element');
const WebTorrent = require('webtorrent');
const JSZip = require('jszip');
const SimplePeer = require('simple-peer');
const util = require('./util');
const debug = require('debug');
// WebTorrent announce list
globalThis.WEBTORRENT_ANNOUNCE = createTorrent.announceList
  .map(arr => arr[0])
  .filter(url => url.startsWith('wss://') || url.startsWith('ws://'));

const DISALLOWED = [
  '6feb54706f41f459f819c0ae5b560a21ebfead8f'
];

// Create WebTorrent client
const getClient = thunky(function (cb) {
  getRtcConfig(function (err, rtcConfig) {
    if (err) util.error(err);
    const client = new WebTorrent({
      tracker: {
        rtcConfig: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ],
          sdpSemantics: 'unified-plan',
          bundlePolicy: 'max-bundle',
          iceCandidatePoolSize: 1,
        }
      },
      dht: true, // Enable DHT for better peer discovery
      utp: true, // Enable uTP for efficient bandwidth usage
      maxConnections: 100, // Increase connections limit
      uploads: {
        maxUploadSpeed: 0, // Unlimited upload speed
        maxDownloadSpeed: 0 // Unlimited download speed
      }
    });
    window.client = client;
    client.on('warning', util.warning);
    client.on('error', util.error);
    cb(null, client);
  });
});

// Initialize the application
function init() {
  if (!WebTorrent.WEBRTC_SUPPORT) {
    util.error('This browser is unsupported. Please use a browser with WebRTC support.');
  }

  // Create the client immediately
  getClient(() => {});

  // Seed via upload input element
  const upload = document.querySelector('input[name=upload]');
  if (upload) {
    uploadElement(upload, (err, files) => {
      if (err) return util.error(err);
      files = files.map(file => file.file);
      onFiles(files);
    });
  }

  // Seed via drag-and-drop
  dragDrop('body', onFiles);

  // Download via input element
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      downloadTorrent(document.querySelector('form input[name=torrentId]').value.trim());
    });
  }

  // Download by URL hash
  onHashChange();
  window.addEventListener('hashchange', onHashChange);

  function onHashChange() {
    const hash = decodeURIComponent(window.location.hash.substring(1)).trim();
    if (hash !== '') downloadTorrent(hash);
  }

  // Register a protocol handler for "magnet:" (will prompt the user)
  if ('registerProtocolHandler' in navigator) {
    navigator.registerProtocolHandler('magnet', window.location.origin + '#%s', 'FastShare');
  }

  // Register a service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}

// Handle files
function onFiles(files) {
  debug('got files:');
  files.forEach(file => {
    debug(' - %s (%s bytes)', file.name, file.size);
  });

  // .torrent file = start downloading the torrent
  files.filter(isTorrentFile).forEach(downloadTorrentFile);

  // everything else = seed these files
  seed(files.filter(isNotTorrentFile));
}

// Check if file is a torrent file
function isTorrentFile(file) {
  const extname = path.extname(file.name).toLowerCase();
  return extname === '.torrent';
}

// Check if file is not a torrent file
function isNotTorrentFile(file) {
  return !isTorrentFile(file);
}

// Download a torrent by ID
function downloadTorrent(torrentId) {
  const disallowed = DISALLOWED.some(infoHash => torrentId.indexOf(infoHash) >= 0);

  if (disallowed) {
    util.log('File not found ' + torrentId);
  } else {
    util.log('Downloading torrent from ' + torrentId);
    getClient((err, client) => {
      if (err) return util.error(err);
      client.add(torrentId, onTorrent);
    });
  }
}

// Download a torrent file
function downloadTorrentFile(file) {
  util.unsafeLog('Downloading torrent from <strong>' + escapeHtml(file.name) + '</strong>');
  getClient((err, client) => {
    if (err) return util.error(err);
    client.add(file, onTorrent);
  });
}

// Seed files
function seed(files) {
  if (files.length === 0) return;
  util.log('Seeding ' + files.length + ' files');

  // Seed from WebTorrent
  getClient((err, client) => {
    if (err) return util.error(err);
    client.seed(files, onTorrent);
  });
}

// Handle torrent events
function onTorrent(torrent) {
  torrent.on('warning', util.warning);
  torrent.on('error', util.error);

  const upload = document.querySelector('input[name=upload]');
  if (upload) upload.value = upload.defaultValue; // reset upload element

  const torrentFileName = path.basename(torrent.name, path.extname(torrent.name)) + '.torrent';

  util.log('"' + torrentFileName + '" contains ' + torrent.files.length + ' files:');

  torrent.files.forEach(file => {
    util.unsafeLog('&nbsp;&nbsp;- ' + escapeHtml(file.name) + ' (' + escapeHtml(prettierBytes(file.length)) + ')');
  });

  util.log('Torrent info hash: ' + torrent.infoHash);
  util.unsafeLog(
    '<a href="/torrentshare#' + escapeHtml(torrent.infoHash) + '" onclick="prompt(\'Share this link with anyone you want to download this torrent:\', this.href);return false;">[Share link]</a> ' +
    '<a href="' + escapeHtml(torrent.magnetURI) + '" target="_blank">[Magnet URI]</a> ' +
    '<a href="' + escapeHtml(torrent.torrentFileBlobURL) + '" target="_blank" download="' + escapeHtml(torrentFileName) + '">[Download .torrent]</a>'
  );

  function updateSpeed() {
    const progress = (100 * torrent.progress).toFixed(1);

    let remaining;
    if (torrent.done) {
      remaining = 'Done.';
    } else {
      remaining = torrent.timeRemaining !== Infinity
        ? formatDistance(torrent.timeRemaining, 0, { includeSeconds: true })
        : 'Infinity years';
      remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining.';
    }

    util.updateSpeed(
      '<b>Peers:</b> ' + torrent.numPeers + ' ' +
      '<b>Progress:</b> ' + progress + '% ' +
      '<b>Download speed:</b> ' + prettierBytes(window.client.downloadSpeed) + '/s ' +
      '<b>Upload speed:</b> ' + prettierBytes(window.client.uploadSpeed) + '/s ' +
      '<b>ETA:</b> ' + remaining
    );
  }

  torrent.on('download', throttle(updateSpeed, 250));
  torrent.on('upload', throttle(updateSpeed, 250));
  setInterval(updateSpeed, 5000);
  updateSpeed();

  torrent.files.forEach(file => {
    // Append file
    file.getBlobURL((err, url) => {
      if (err) return util.error(err);

      const a = document.createElement('a');
      a.target = '_blank';
      a.download = file.name;
      a.href = url;
      a.textContent = 'Download ' + file.name;
      util.appendElemToLog(a);
    });
  });

  const downloadZip = document.createElement('a');
  downloadZip.href = '#';
  downloadZip.target = '_blank';
  downloadZip.textContent = 'Download all files as zip';
  downloadZip.addEventListener('click', (event) => {
    let addedFiles = 0;
    const zipFilename = path.basename(torrent.name, path.extname(torrent.name)) + '.zip';
    let zip = new JSZip();
    event.preventDefault();

    torrent.files.forEach(file => {
      file.getBlob((err, blob) => {
        addedFiles += 1;
        if (err) return util.error(err);

        zip.file(file.name, blob);
        if (addedFiles === torrent.files.length) {
          zip.generateAsync({ type: 'blob' }).then(blob => {
            const url = URL.createObjectURL(blob);
            downloadZip.href = url;
            downloadZip.download = zipFilename;
            downloadZip.click();
            URL.revokeObjectURL(url);
          });
        }
      });
    });
  });
  util.appendElemToLog(downloadZip);
}

// Start the application
init();
