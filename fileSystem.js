const fs = require('fs').promises;
const path = require('path');

// Video file extensions to recognize
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.m4v'];

function isVideoFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

async function readDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const subdirectories = [];
    const files = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        subdirectories.push({
          name: entry.name,
          path: fullPath,
          isDirectory: true
        });
      } else if (entry.isFile() && isVideoFile(entry.name)) {
        try {
          const stats = await fs.stat(fullPath);
          files.push({
            name: entry.name,
            path: fullPath,
            isDirectory: false,
            dateModified: stats.mtime,
            dateCreated: stats.birthtime || stats.ctime,
            size: stats.size
          });
        } catch (err) {
          // Skip files we can't stat
          console.error(`Error statting file ${fullPath}:`, err);
        }
      }
    }
    
    // Sort subdirectories by name
    subdirectories.sort((a, b) => a.name.localeCompare(b.name));
    
    // Sort files by date modified (fallback to created)
    files.sort((a, b) => {
      const dateA = a.dateModified || a.dateCreated;
      const dateB = b.dateModified || b.dateCreated;
      return dateB - dateA; // Most recent first
    });
    
    return {
      path: dirPath,
      subdirectories,
      videos: files
    };
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
}

async function moveFile(sourcePath, destinationPath) {
  try {
    await fs.rename(sourcePath, destinationPath);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function getParentDirectory(dirPath) {
  const parent = path.dirname(dirPath);
  // On Windows, if we're at a drive root (e.g., C:\), dirname returns C:\
  // If we're already at root, return null
  if (parent === dirPath) {
    return null;
  }
  return parent;
}

async function getAvailableVolumes() {
  // Try to introspect available volumes on Windows
  const volumes = [];
  
  if (process.platform === 'win32') {
    // Try to check each drive letter A: through Z:
    for (let i = 0; i < 26; i++) {
      const driveLetter = String.fromCharCode(65 + i) + ':';
      const drivePath = driveLetter + '\\';
      
      try {
        // Try to access the drive
        await fs.access(drivePath);
        volumes.push(driveLetter);
      } catch (error) {
        // Drive doesn't exist or isn't accessible, skip it
      }
    }
  }
  
  // If introspection failed or no volumes found, return A: through Z:
  if (volumes.length === 0) {
    for (let i = 0; i < 26; i++) {
      volumes.push(String.fromCharCode(65 + i) + ':');
    }
  }
  
  return volumes;
}

function isVolumeRoot(dirPath) {
  // Check if path is a volume root (e.g., C:\, D:\)
  if (process.platform === 'win32') {
    const normalized = path.normalize(dirPath).toUpperCase();
    // Match pattern like "C:\" or "C:/" - normalized should end with backslash
    // Also handle "C:" without trailing slash
    return /^[A-Z]:[\\/]?$/.test(normalized) || /^[A-Z]:$/.test(normalized);
  }
  return false;
}

module.exports = {
  readDirectory,
  moveFile,
  getParentDirectory,
  getAvailableVolumes,
  isVolumeRoot,
  isVideoFile
};

