# YouTube Shorts Controller

A lightweight Chrome Extension (Manifest V3) for controlling YouTube Shorts with watch count tracking, content filtering, and audio blocking.

## Features

- **Auto-Scroll After One Watch**: By default, once you've watched a short all the way through once, it auto-scrolls to the next one. You can still scroll back up to rewatch it manually — the count only affects auto-scroll.
- **Spoiler/Keyword Blocking Everywhere**: Add keywords (e.g. a show title) and matching content is filtered out — both in the Shorts player (auto-skipped) and on the home feed, search results, and sidebar (hidden from the grid entirely).
- **Audio Blocking**: Block shorts based on detected audio/song names
- **Watch Count Tracking**: Raise "Max Watch Count" above 1 in the popup if you want to allow rewatches before auto-scrolling
- **Privacy-First**: All data stored locally, no external APIs, no backend

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `scroll` directory
5. The extension should now be installed

## Icon Setup

The extension requires icon files. You can:

1. Create three PNG files: `icon16.png`, `icon48.png`, and `icon128.png`
2. Place them in the `scroll` directory
3. Or use any simple icon generator online

For a quick solution, you can create simple colored squares as placeholders.

## Usage

1. Click the extension icon in Chrome toolbar
2. Configure your settings:
   - **Max Watch Count**: Defaults to 1 (auto-scroll after one full watch-through). Raise it to allow rewatches first.
   - **Blocked Keywords**: Add keywords (comma-separated or one per line, e.g. a show title) to hide/skip shorts containing them — both in the Shorts player and on the home feed/search/sidebar
   - **Blocked Audios**: Add audio/song names to block shorts using those audios
   - **Toggle**: Enable/disable the extension

3. Navigate to YouTube and the extension will work automatically, on Shorts as well as the regular feed

## How It Works

- **Watch Tracking**: Counts a "watch" only when the short plays all the way through once (detected via the loop back to the start, or the video's `ended` event) — not just a few seconds of viewing
- **Content Scanning**: Scans title, description, and hashtags for blocked keywords inside the Shorts player, and scans visible tile text (title, channel) on the home feed, search results, and sidebar
- **Audio Detection**: Extracts audio/song names from available DOM metadata
- **Auto-Scroll**: Smoothly scrolls to the next short when conditions are met; matching tiles elsewhere on the site are hidden outright

## Storage Structure

Data is stored locally in Chrome storage:

```json
{
  "enabled": true,
  "maxWatchCount": 1,
  "blockedKeywords": ["keyword1", "keyword2"],
  "blockedAudios": ["audio1", "audio2"],
  "videoData": {
    "videoId123": {
      "watchCount": 2,
      "audio": "SPECIALZ - King Gnu"
    }
  }
}
```

## Privacy

- All data is stored locally in your browser
- No external API calls
- No data collection or tracking
- No login required

## Development

The extension consists of:

- `manifest.json`: Extension configuration
- `content.js`: Main logic running on YouTube pages
- `background.js`: Service worker for initialization
- `popup.html/css/js`: Settings UI

## Notes

- Watch tracking and auto-scroll only apply to YouTube Shorts; keyword blocking also runs on the regular home feed/search/sidebar
- Auto-scroll uses smooth scrolling and keyboard navigation
- Audio detection depends on YouTube's DOM structure and may vary
- YouTube changes its page structure often, so selectors may occasionally need updating if a feature stops working
