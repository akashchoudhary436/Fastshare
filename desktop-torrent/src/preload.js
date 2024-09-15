const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  seedFile: (filePath) => ipcRenderer.invoke('seed:file', filePath),
  onFileReadProgress: (callback) => ipcRenderer.on('file-read-progress', callback)
});
