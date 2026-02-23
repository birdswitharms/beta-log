# Video Playback Design

## Goal

Allow users to tap a video thumbnail in the Videos tab and play the video in a full-screen modal within the app. This keeps playback in-app to support future video processing features.

## Approach

Use `expo-video` (the modern Expo video API for SDK 54) with `useVideoPlayer` hook and `VideoView` component.

## Architecture

### New dependency
- `expo-video`

### New component: `VideoPlayerModal`

**Props:**
- `video: Video | null` — video to play (null = modal hidden)
- `onClose: () => void` — dismiss callback

**Behavior:**
- Full-screen `Modal` with dark background (#1C1C1E)
- `VideoView` centered, maintains aspect ratio
- Starts paused on first frame
- Custom controls: play/pause toggle, scrub slider, elapsed/total time
- Close button (top-left, respects safe area)
- Orange (#FF6B35) accent on scrub bar and play button
- On close, player is released/cleaned up

**Error handling:** If video URI is invalid, show "Unable to play video" text. No retry logic.

### Modified files

- `VideoCard.tsx` — add `onPress` prop (tap to play). Long-press to delete remains.
- `app/(tabs)/videos.tsx` — manage `selectedVideo` state, render `VideoPlayerModal`

### Data flow

```
User taps thumbnail → VideoCard.onPress(video)
  → videos.tsx sets selectedVideo state
  → VideoPlayerModal opens with video.uri
  → useVideoPlayer creates player, paused on first frame
  → User taps play → video plays
  → User taps close → modal closes, player releases
```

No database or type changes needed.
