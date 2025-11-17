const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// In-memory cache for thumbnails
// Key: video file path, Value: base64 encoded image data
const thumbnailCache = new Map();

async function generateThumbnail(videoPath) {
  // Check cache first
  if (thumbnailCache.has(videoPath)) {
    return thumbnailCache.get(videoPath);
  }
  
  return new Promise((resolve, reject) => {
    // Create a unique temp file path
    const tempDir = os.tmpdir();
    const thumbnailPath = path.join(tempDir, `thumbnail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`);
    
    // Extract first frame as JPEG with proper scaling for 9:16 aspect ratio
    ffmpeg(videoPath)
      .seekInput(0)
      .frames(1)
      .output(thumbnailPath)
      .outputOptions([
        '-vf', 'scale=320:568:force_original_aspect_ratio=decrease,pad=320:568:(ow-iw)/2:(oh-ih)/2:color=black',
        '-q:v', '2'
      ])
      .on('end', async () => {
        try {
          // Read the generated thumbnail file
          const imageBuffer = await fs.readFile(thumbnailPath);
          const base64Image = imageBuffer.toString('base64');
          const dataUrl = `data:image/jpeg;base64,${base64Image}`;
          
          // Cache it
          thumbnailCache.set(videoPath, dataUrl);
          
          // Clean up temp file
          try {
            await fs.unlink(thumbnailPath);
          } catch (err) {
            // Ignore cleanup errors
          }
          
          resolve(dataUrl);
        } catch (error) {
          reject(new Error(`Failed to process thumbnail: ${error.message}`));
        }
      })
      .on('error', async (error) => {
        // Clean up temp file on error
        try {
          await fs.unlink(thumbnailPath);
        } catch (err) {
          // Ignore cleanup errors
        }
        reject(new Error(`FFmpeg error: ${error.message}`));
      })
      .run();
  });
}

function getCachedThumbnail(videoPath) {
  return thumbnailCache.get(videoPath) || null;
}

function clearCache() {
  thumbnailCache.clear();
}

module.exports = {
  generateThumbnail,
  getCachedThumbnail,
  clearCache
};

