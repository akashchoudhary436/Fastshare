const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

async function seedFile(filePath, progressCallback) {
  try {

    const WebTorrentModule = await import('webtorrent');
    const WebTorrent = WebTorrentModule.default;
    const client = new WebTorrent({
      dht: true,
      tracker: true,
      lsd: true,
    });

    console.log('Starting seeding process...');
    console.log(`File Path: ${filePath}`);

    const trackers = [
      'wss://tracker.fastsharetorrent.me',
      'wss://tracker.files.fm:7073/announce',
      'ws://tracker.files.fm:7072/announce',
      'wss://tracker.webtorrent.dev'
    ];

    await fs.promises.access(filePath); // Check if file exists

    const stat = await fs.promises.stat(filePath);
    const totalSize = stat.size;
    console.log(`File size: ${totalSize} bytes`);

    const readStream = fs.createReadStream(filePath);

    let bytesRead = 0;
    readStream.on('data', chunk => {
      bytesRead += chunk.length;
      const progress = (bytesRead / totalSize) * 100;

      // Send progress update to renderer process
      if (progressCallback) {
        progressCallback(progress.toFixed(2));
      }
    });

    readStream.on('end', () => {
      console.log('File read complete.');
      if (progressCallback) {
        progressCallback(100.00); // Ensure it shows 100% when done
      }
    });

    readStream.on('error', err => {
      console.error('File Read Error:', err.message);
      if (progressCallback) {
        progressCallback('Error'); // Handle error case
      }
    });

    console.log('Starting seeding...');
    return new Promise((resolve, reject) => {
      const torrent = client.seed(filePath, { announce: trackers }, torrent => {
        console.log('Client is seeding:', torrent.infoHash);
        console.log('Torrent URL:', `magnet:?xt=urn:btih:${torrent.infoHash}`);
        
        resolve({
          infoHash: torrent.infoHash,
          magnetLink: `magnet:?xt=urn:btih:${torrent.infoHash}`
        });
      });

      torrent.on('error', err => {
        console.error('Torrent Error:', err.message);
        reject(new Error(`Torrent Error: ${err.message}`));
      });

      torrent.on('done', () => {
        console.log('Seeding complete.');
      });
    });
  } catch (error) {
    console.error('Error during seeding:', error.message);
    throw new Error(`Error during seeding: ${error.message}`);
  }
}

app.whenReady().then(() => {
  console.log('Application is ready. Creating window...');
  createWindow();

  ipcMain.handle('dialog:openFile', async () => {
    console.log('Opening file dialog...');
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    });
    console.log('File dialog result:', result.filePaths);
    return result.filePaths;
  });

  ipcMain.handle('seed:file', async (event, filePath) => {
    console.log('Seeding file:', filePath);
    try {
      // Setup a progress callback
      const progressCallback = (progress) => {
        // Ensure progress is sent only if it is a number or 'Error'
        if (!isNaN(progress)) {
          event.sender.send('file-read-progress', progress);
        } else {
          event.sender.send('file-read-progress', 'Error');
        }
      };
      
      const { infoHash, magnetLink } = await seedFile(filePath, progressCallback);
      return { infoHash, magnetLink };
    } catch (err) {
      throw new Error(`Error: ${err.message}`);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('All windows closed. Exiting application.');
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log('No open windows. Creating new window.');
    createWindow();
  }
});
