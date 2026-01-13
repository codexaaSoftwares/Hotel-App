# POS Notification Sounds

## Audio File Location

Place your notification sound file here:
- **Path**: `admin/public/sounds/tic.mp3` (or `.wav`, `.ogg`)

## Supported Formats
- `.mp3` (recommended - best compatibility)
- `.wav` (high quality, larger file size)
- `.ogg` (good compression)

## File Requirements
- **Duration**: 0.1 - 0.3 seconds (short "tic" sound)
- **Volume**: Normalized (not too loud)
- **Format**: Mono or Stereo
- **Sample Rate**: 44.1kHz (standard)

## How It Works

The sound utility (`src/utils/soundUtils.js`) will:
1. **First try**: Generate a "tic" sound using Web Audio API (no file needed!)
2. **Fallback**: Play the audio file from `/sounds/tic.mp3` if Web Audio API fails

## Optional: Custom Audio File

If you want to use a custom audio file instead of the generated sound:

1. Place your audio file in this folder: `admin/public/sounds/tic.mp3`
2. The system will automatically use it as a fallback
3. To force use of the file, modify `soundUtils.js` to prefer the file over Web Audio API

## Testing

After adding the file, test it by:
1. Adding an item to cart
2. Changing quantity
3. Deleting an item

You should hear the "tic" sound on each action!

