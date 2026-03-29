# AdSkip Elite

A Chrome extension that automatically skips YouTube ads.

## Features

- **Auto-skip ads** on YouTube video pages
- **Realistic click simulation** — simulates human-like mouse movements to avoid detection
- **Optional instant skip** — skips immediately or waits briefly to appear more human
- **Browser notifications** — alerts when an ad is skipped
- **Pause/Resume** — toggle auto-skip from the extension popup
- **Ads skipped counter** — tracks total skipped ads
- **Respects video state** — saves and restores mute/unmute and playback rate settings

## How It Works

The extension runs a content script on YouTube pages that:
1. Polls for the presence of a skip-ad button
2. When detected, simulates realistic mouse movements to the button
3. Performs a click to skip the ad
4. Sends a notification and updates the skip counter

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `adskip-elite` directory

## Usage

Click the extension icon in the toolbar to:
- See the current status (Active/Paused)
- View the total number of ads skipped
- Pause or resume auto-skipping

Click the gear icon (or right-click the extension → Options) to access settings:
- **Skip ads immediately** — disables the human-like delay before clicking
- **Show notification** — toggles browser notifications when ads are skipped

## Files

| File | Description |
|------|-------------|
| `manifest.json` | Extension configuration (Manifest V3) |
| `content.js` | YouTube page script — handles ad detection and skipping |
| `background.js` | Service worker — tracks stats and shows notifications |
| `popup.html` / `popup.js` | Extension popup UI |
| `settings.html` / `settings.js` | Options page UI |
| `styles.css` | Shared styles |

## Permissions

- `storage` — saves settings and stats
- `notifications` — shows alerts when ads are skipped
