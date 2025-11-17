# TODO - Vidman Project Plan

## Stage 1: Project Setup and Electron Foundation
X Initialize Electron project structure
X Set up package.json with dependencies (electron, jQuery, ffmpeg/fluent-ffmpeg)
X Create main process entry point (main.js)
X Create renderer process entry point (index.html, renderer.js)
X Set up basic window configuration for Win 11
X Initialize starting directory to c:\

## Stage 2: File System Operations Backend
X Create Node.js backend module for file system operations
X Implement directory reading (list subdirectories and files)
X Implement file metadata retrieval (date modified, date created)
X Implement file filtering (identify video files by extension)
X Implement file moving operation
X Set up IPC communication between main and renderer processes
X Implement volume introspection (get available volumes, detect volume root)

## Stage 3: Basic UI Layout and Structure
X Create HTML structure (path display, message bar, directory panel, video grid)
X Implement CSS layout (stacked panels, full window fill)
X Style path display line
X Style message bar (blank initially, highlight/fade functionality)
X Set up jQuery and basic DOM manipulation structure
X Add meta-navigation bar (between message bar and directory panel)

## Stage 4: Directory Navigation
X Display current directory path
X Implement subdirectory listing (scrollable list)
X Handle ".." parent folder display logic (moved to meta-navigation bar, not shown at volume root)
X Implement folder click navigation
X Implement ".." click navigation (in meta-navigation bar)
X Implement volume navigation (C:, D:, etc. in meta-navigation bar)
X Update UI when directory changes

## Stage 5: Video Grid Display
X Implement video file detection and filtering
X Create scrollable grid layout (5 videos across)
X Display video items with 9:16 aspect ratio containers
X Show file names with text wrapping
X Sort videos by date modified (fallback to created)
X Handle empty states ("no videos available", blank spaces)
X Implement video item click handler

## Stage 6: Thumbnail Generation and Caching
X Set up ffmpeg/fluent-ffmpeg integration
X Implement first frame extraction from MP4 files
X Create in-memory cache for thumbnails
X Display thumbnails in video grid items
X Handle thumbnail loading states

## Stage 7: Video Player
X Create fullscreen video player overlay
X Implement video playback (fill window, scale to fit)
X Add play/pause/close controls
X Implement video repeat on finish
X Implement keyboard shortcuts (space: play/pause, escape: exit, enter: jump to start)
X Handle player show/hide transitions

## Stage 8: Drag and Drop Functionality
- Implement drag start on video items
- Implement drop zones on folder items in directory bar
- Handle drag and drop visual feedback (minimal presentation)
- Implement file move operation on drop
- Update message bar with success/failure messages
- Implement message bar highlight and fade behavior (5 second fade, leave visible)
- Refresh video grid after successful move

