The display should have one display line, a message line, a meta-navigation bar, and two panels stacked vertically from top to bottom to fill the window. Additionally a play video panel
will appear.

1) Display of the full path of the current directory.

2) Message line.

3) Meta-navigation bar. This bar displays ".." (parent folder) when available, and lists available volumes (C:, D:, etc.). If volume introspection is possible, show only available volumes. Otherwise, list A: through Z:. The display should be minimal, listing items directly without icons.

4) A scrollable list of subdirectories in the current folder. The display should be minimal, listing the folder names directly without icons. Drag and drop should be presented mimally.

5) A scrollable grid of videos present in the CURRENT DIRECTORY only. They should run
5 across with 9:16 aspect ratio, scaled to fit inside. When clicked, a video
expands to fit the window and plays. It repeats when finished.

6) Fill the window, scaling the video to fit. Controls: play, pause, close. The video player MUST start playing automatically when opened. The player MUST use smooth opacity transitions when showing and hiding.

User actions:

1) click on a folder to navigate there
2) Click on parent ".." in the meta-navigation bar to navigate up
3) Click on a volume (C:, D:, etc.) in the meta-navigation bar to navigate to that volume
4) drag a video to one of the folders in the subdirectory bar to move it to that folder on disk.
5) drag a video to ".." in the meta-navigation bar to move it to the parent directory.
6) drag a video to a volume (C:, D:, etc.) in the meta-navigation bar to move it to that volume root.
7) click on a video to expand it to fill the screen and play it on repeat.

Tecnical specs:
The message bar MUST display "ready" on startup
The message bar MUST highlight a new message
The message bar MUST fade the last message after 5 seconds but leave it visible
The meta-navigation bar MUST show ".." when there is a parent directory (i.e. not at a volume root)
The meta-navigation bar MUST NOT show ".." when at a volume root (i.e. C:\, D:\, etc.)
The meta-navigation bar MUST list available volumes. If volume introspection is possible, show only available volumes. Otherwise, list A: through Z:
The app MUST fill the window with as many video thumbnails ad videos are present
  and leave the rest of the window blank
MUST support .mp4
MAY support other video formats (.webm, .avi, .mov, .mkv, .flv, .wmv, .m4v), but not required
MUST only display files with video extensions in the video pane
The video pane MUST show thumbnail and file name
The video pane MUST display "Loading..." while thumbnails are being generated
The video pane MUST display "no FFmpeg" if FFmpeg is not available or not found
The video pane MUST display "No thumbnail" if thumbnail generation fails for other reasons
The app MUST extract the first frame from MP4 files and cache it in memory
The file name MUST wrap at character break if it is long
The video pane MUST sort videos by date modified or then created
The video pane MUST leave blank spaces when there aren't enough videos to fill it
The video pane MUST display "no videos available" if there are zero videos
A successful operation (i.e. move a video) must be reported in the message bar
A failed operation (i.e. move a video) must be reported in the message bar with
  a reason why
The app MUST NOT allow moving files between different volumes (e.g., from C: to D:).
  If a move between volumes is attempted, the operation MUST be halted and the message
  "Can not move between volumes" MUST be displayed in the message bar.
The video playback MUST support keyboard shortcut space to play/pause
The video playback MUST support keyboard shortcut escape to exit the player
The video playback MUST support keyboard shortcut enter to jump to the start
The current directory MUST be c:\ to start with (on Win 11)
The app MUST support Win 11 in this iteration
The app MUST NOT support linux or IOs yet

Technology Stack:
The app MUST be built using Electron
The frontend MUST use HTML, CSS, and JavaScript with jQuery
The backend MUST use Node.js (via Electron) for file system operations
Video thumbnail generation MUST use Node.js libraries (e.g., ffmpeg or fluent-ffmpeg)



