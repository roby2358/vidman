// Vidman Renderer Process
// Stage 2: File system integration

let currentDirectory = 'C:\\';

async function loadDirectory(dirPath) {
  try {
    const result = await window.electronAPI.readDirectory(dirPath);
    
    if (!result.success) {
      showMessage(`Error: ${result.error}`, false);
      return;
    }
    
    const data = result.data;
    currentDirectory = data.path;
    
    // Update path display
    $('#path-display').text(data.path);
    
    // Display meta-navigation bar (.. and volumes)
    await displayMetaNavigation(data.path);
    
    // Display subdirectories (without "..")
    displaySubdirectories(data.subdirectories);
    
    // Display videos
    displayVideos(data.videos);
    
  } catch (error) {
    showMessage(`Error loading directory: ${error.message}`, false);
  }
}

async function displayMetaNavigation(currentPath) {
  const $metaNav = $('#meta-navigation-list');
  $metaNav.empty();
  
  // Check if we're at a volume root
  const isRoot = await window.electronAPI.isVolumeRoot(currentPath);
  const parentDir = await window.electronAPI.getParentDirectory(currentPath);
  const hasParent = parentDir !== null && parentDir !== currentPath;
  
  // Show ".." if we have a parent and we're not at volume root
  if (hasParent && !isRoot) {
    const $parent = $('<div>').addClass('meta-nav-item').text('..');
    $parent.data('path', parentDir);
    $parent.on('click', () => navigateToDirectory(parentDir));
    $metaNav.append($parent);
  }
  
  // Get and display available volumes
  const volumes = await window.electronAPI.getAvailableVolumes();
  volumes.forEach(volume => {
    const volumePath = volume + '\\';
    const $volume = $('<div>').addClass('meta-nav-item').text(volume);
    $volume.data('path', volumePath);
    $volume.on('click', () => navigateToDirectory(volumePath));
    $metaNav.append($volume);
  });
}

function displaySubdirectories(subdirectories) {
  const $list = $('#directory-list');
  $list.empty();
  
  // Just show subdirectories (no ".." - that's in meta-navigation bar now)
  subdirectories.forEach(subdir => {
    const $item = $('<div>').addClass('directory-item').text(subdir.name);
    $item.data('path', subdir.path);
    $item.on('click', () => navigateToDirectory(subdir.path));
    $list.append($item);
  });
}

function navigateToDirectory(dirPath) {
  loadDirectory(dirPath);
}

function displayVideos(videos) {
  const $grid = $('#video-grid');
  $grid.empty();
  
  // Ensure grid is properly set
  $grid.css({
    'display': 'grid',
    'grid-template-columns': 'repeat(5, 1fr)'
  });
  
  // Handle empty state
  if (videos.length === 0) {
    const $emptyMsg = $('<div>').text('no videos available').css({
      'grid-column': '1 / -1',
      'text-align': 'center',
      'padding': '40px',
      'color': '#666',
      'font-size': '16px'
    });
    $grid.append($emptyMsg);
    return;
  }
  
  // Display videos in grid (5 across, 9:16 aspect ratio)
  videos.forEach((video, index) => {
    const $item = $('<div>').addClass('video-item');
    
    // Thumbnail container
    const $thumbnail = $('<div>').addClass('video-thumbnail');
    $thumbnail.text('Loading...');
    
    // Filename with wrapping
    const $filename = $('<div>').addClass('video-filename').text(video.name);
    
    $item.append($thumbnail);
    $item.append($filename);
    
    // Click handler - open video player
    $item.data('video-path', video.path);
    $item.on('click', () => {
      openVideoPlayer(video.path);
    });
    
    $grid.append($item);
    
    // Load thumbnail (check cache first, then generate)
    loadThumbnail(video.path, $thumbnail);
  });
  
  // Grid will naturally leave blank spaces (per spec: "leave the rest of the window blank")
}

async function loadThumbnail(videoPath, $thumbnailContainer) {
  try {
    // Check cache first
    const cachedResult = await window.electronAPI.getCachedThumbnail(videoPath);
    if (cachedResult.success) {
      displayThumbnail($thumbnailContainer, cachedResult.data);
      return;
    }
    
    // Generate thumbnail
    const result = await window.electronAPI.generateThumbnail(videoPath);
    if (result.success) {
      displayThumbnail($thumbnailContainer, result.data);
    } else {
      $thumbnailContainer.text('No thumbnail');
    }
  } catch (error) {
    console.error('Error loading thumbnail:', error);
    $thumbnailContainer.text('No thumbnail');
  }
}

function displayThumbnail($container, dataUrl) {
  $container.empty();
  const $img = $('<img>').attr('src', dataUrl);
  $img.css({
    'width': '100%',
    'height': '100%',
    'object-fit': 'cover'
  });
  $container.append($img);
}

function showMessage(message, isSuccess = true) {
  const $msgBar = $('#message-bar');
  $msgBar.text(message);
  
  if (isSuccess) {
    $msgBar.css('background-color', '#d4edda');
  } else {
    $msgBar.css('background-color', '#f8d7da');
  }
  
  // Fade after 5 seconds but leave visible
  setTimeout(() => {
    $msgBar.css('background-color', '#fff');
  }, 5000);
}

// Video player functions
let currentVideoPath = null;

function openVideoPlayer(videoPath) {
  const $player = $('#video-player');
  const $video = $('#video-element');
  const $playPauseBtn = $('#play-pause-btn');
  
  currentVideoPath = videoPath;
  
  // Set video source - convert Windows path to file:// URL
  // Electron needs file:/// format (three slashes) for Windows paths
  const normalizedPath = videoPath.replace(/\\/g, '/');
  $video.attr('src', `file:///${normalizedPath}`);
  
  // Show player with transition
  $player.removeClass('hidden');
  setTimeout(() => {
    $player.addClass('visible');
  }, 10);
  
  // Play video
  $video[0].play().then(() => {
    updatePlayPauseButton(true);
  }).catch(error => {
    console.error('Error playing video:', error);
    showMessage(`Error playing video: ${error.message}`, false);
  });
  
  // Set up repeat on finish
  $video.off('ended').on('ended', () => {
    $video[0].currentTime = 0;
    $video[0].play();
  });
  
  // Update play/pause button based on video state
  $video.off('play pause').on('play', () => {
    updatePlayPauseButton(true);
  }).on('pause', () => {
    updatePlayPauseButton(false);
  });
}

function closeVideoPlayer() {
  const $player = $('#video-player');
  const $video = $('#video-element');
  
  $player.removeClass('visible');
  setTimeout(() => {
    $player.addClass('hidden');
    $video[0].pause();
    $video.attr('src', '');
    currentVideoPath = null;
  }, 300);
}

function togglePlayPause() {
  const $video = $('#video-element');
  const video = $video[0];
  
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function jumpToStart() {
  const $video = $('#video-element');
  $video[0].currentTime = 0;
}

function updatePlayPauseButton(isPlaying) {
  const $btn = $('#play-pause-btn');
  $btn.text(isPlaying ? 'Pause' : 'Play');
}

$(document).ready(() => {
  console.log('Vidman initialized');
  
  // Initialize starting directory to c:\
  currentDirectory = 'C:\\';
  
  // Set initial path display
  $('#path-display').text(currentDirectory);
  
  // Message bar shows ready on startup
  $('#message-bar').text('ready');
  
  // Video grid will be populated in Stage 5
  $('#video-grid').html('');
  
  // Video player starts hidden
  $('#video-player').addClass('hidden');
  
  // Wire up video player controls
  $('#play-pause-btn').on('click', togglePlayPause);
  $('#close-btn').on('click', closeVideoPlayer);
  
  // Keyboard shortcuts for video player
  $(document).on('keydown', (e) => {
    const $player = $('#video-player');
    if ($player.hasClass('hidden') || !$player.hasClass('visible')) {
      return; // Only handle shortcuts when player is visible
    }
    
    // Prevent default for these keys
    if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault();
    }
    
    // Space: play/pause
    if (e.key === ' ') {
      togglePlayPause();
    }
    // Escape: exit player
    else if (e.key === 'Escape') {
      closeVideoPlayer();
    }
    // Enter: jump to start
    else if (e.key === 'Enter') {
      jumpToStart();
    }
  });
  
  // Load initial directory
  loadDirectory(currentDirectory);
});

