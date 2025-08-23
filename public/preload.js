const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform detection
  platform: process.platform,
  
  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  // Future: Add IPC methods here if needed
  // For example, if you want to add file system operations beyond the File System Access API
  // openDialog: () => ipcRenderer.invoke('dialog:openFile'),
  // saveDialog: () => ipcRenderer.invoke('dialog:saveFile'),
});

// Security: Remove Node.js globals in renderer process
delete window.module;
delete window.exports;
delete window.require;
