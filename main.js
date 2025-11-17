const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fileSystem = require('./fileSystem');
const thumbnailGenerator = require('./thumbnailGenerator');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  if (process.env.DEV === 'true') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for file system operations
ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const result = await fileSystem.readDirectory(dirPath);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('move-file', async (event, sourcePath, destinationPath) => {
  return await fileSystem.moveFile(sourcePath, destinationPath);
});

ipcMain.handle('get-parent-directory', async (event, dirPath) => {
  return fileSystem.getParentDirectory(dirPath);
});

ipcMain.handle('get-available-volumes', async (event) => {
  return await fileSystem.getAvailableVolumes();
});

ipcMain.handle('is-volume-root', async (event, dirPath) => {
  return fileSystem.isVolumeRoot(dirPath);
});

// IPC handlers for thumbnail generation
ipcMain.handle('generate-thumbnail', async (event, videoPath) => {
  try {
    const thumbnail = await thumbnailGenerator.generateThumbnail(videoPath);
    return { success: true, data: thumbnail };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-cached-thumbnail', async (event, videoPath) => {
  const thumbnail = thumbnailGenerator.getCachedThumbnail(videoPath);
  return thumbnail ? { success: true, data: thumbnail } : { success: false };
});

