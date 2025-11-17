const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
  moveFile: (sourcePath, destinationPath) => ipcRenderer.invoke('move-file', sourcePath, destinationPath),
  getParentDirectory: (dirPath) => ipcRenderer.invoke('get-parent-directory', dirPath),
  getAvailableVolumes: () => ipcRenderer.invoke('get-available-volumes'),
  isVolumeRoot: (dirPath) => ipcRenderer.invoke('is-volume-root', dirPath),
  generateThumbnail: (videoPath) => ipcRenderer.invoke('generate-thumbnail', videoPath),
  getCachedThumbnail: (videoPath) => ipcRenderer.invoke('get-cached-thumbnail', videoPath)
});

