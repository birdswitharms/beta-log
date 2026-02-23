# Video Playback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to tap a video thumbnail and play it in a full-screen modal with custom controls.

**Architecture:** New `VideoPlayerModal` component using `expo-video` (`useVideoPlayer` hook + `VideoView`). `VideoCard` gets an `onPress` prop, `videos.tsx` manages selected video state and renders the modal.

**Tech Stack:** expo-video, React Native Modal, expo-video's useVideoPlayer hook

---

### Task 1: Install expo-video

**Files:**
- Modify: `package.json`

**Step 1: Install the dependency**

Run: `npx expo install expo-video`

**Step 2: Verify installation**

Run: `npx tsc --noEmit`
Expected: No new type errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add expo-video dependency for video playback"
```

---

### Task 2: Add onPress prop to VideoCard

**Files:**
- Modify: `components/VideoCard.tsx`

**Step 1: Update Props interface and component**

Add `onPress` to the Props interface and wire it to the Pressable:

```tsx
interface Props {
  video: Video;
  onDelete: (id: number) => void;
  onPress: (video: Video) => void;
}
```

Update the component signature:

```tsx
export default function VideoCard({ video, onDelete, onPress }: Props) {
```

Update the Pressable to handle both tap and long-press:

```tsx
<Pressable
  style={styles.card}
  onPress={() => onPress(video)}
  onLongPress={() => onDelete(video.id)}
>
```

**Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: Error in `videos.tsx` because `onPress` is now required — this is expected and will be fixed in Task 4.

**Step 3: Commit**

```bash
git add components/VideoCard.tsx
git commit -m "feat: add onPress prop to VideoCard for tap-to-play"
```

---

### Task 3: Create VideoPlayerModal component

**Files:**
- Create: `components/VideoPlayerModal.tsx`

**Step 1: Create the component**

```tsx
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEventListener } from "expo";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { Video } from "../types";

interface Props {
  video: Video | null;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoPlayerModal({ video, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const player = useVideoPlayer(video?.uri ?? null, (p) => {
    p.loop = false;
  });

  useEventListener(player, "statusChange", (event) => {
    if (event.status === "readyToPlay") {
      setDuration(player.duration);
      setError(false);
    } else if (event.status === "error") {
      setError(true);
    }
  });

  useEventListener(player, "playingChange", (event) => {
    setIsPlaying(event.isPlaying);
  });

  // Poll current time while playing
  useEffect(() => {
    if (!isPlaying || isScrubbing) return;
    const interval = setInterval(() => {
      setCurrentTime(player.currentTime);
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying, isScrubbing, player]);

  // Reset state when video changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setError(false);
    setIsPlaying(false);
  }, [video?.id]);

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleScrubStart = () => {
    setIsScrubbing(true);
  };

  const handleScrubComplete = (value: number) => {
    player.currentTime = value;
    setCurrentTime(value);
    setIsScrubbing(false);
  };

  const handleClose = () => {
    player.pause();
    onClose();
  };

  return (
    <Modal
      visible={video !== null}
      animationType="fade"
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Close button */}
        <Pressable
          style={[styles.closeButton, { top: insets.top + 8 }]}
          onPress={handleClose}
          hitSlop={12}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>

        {/* Video or error */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#636366" />
            <Text style={styles.errorText}>Unable to play video</Text>
          </View>
        ) : (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />
        )}

        {/* Custom controls */}
        {!error && (
          <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
            <Pressable onPress={handlePlayPause} hitSlop={12}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={28}
                color="#FF6B35"
              />
            </Pressable>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 1}
              value={isScrubbing ? undefined : currentTime}
              onSlidingStart={handleScrubStart}
              onSlidingComplete={handleScrubComplete}
              minimumTrackTintColor="#FF6B35"
              maximumTrackTintColor="#636366"
              thumbTintColor="#FF6B35"
            />

            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    color: "#636366",
    fontSize: 16,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    color: "#AEAEB2",
    fontSize: 13,
    fontWeight: "500",
    minWidth: 90,
    textAlign: "right",
  },
});
```

**Note:** This uses `@react-native-community/slider` which needs to be installed. If it's not available in the Expo SDK, use a simple `Pressable`-based scrub bar instead. Check `expo-video` docs for whether `Slider` ships with Expo SDK 54 or needs separate install.

**Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: Pass (or minor slider import issue to resolve)

**Step 3: Commit**

```bash
git add components/VideoPlayerModal.tsx
git commit -m "feat: create VideoPlayerModal with custom controls"
```

---

### Task 4: Wire up VideoPlayerModal in videos.tsx

**Files:**
- Modify: `app/(tabs)/videos.tsx`

**Step 1: Add state and import**

Add import at top:

```tsx
import VideoPlayerModal from "../../components/VideoPlayerModal";
```

Add state in `VideosScreen`:

```tsx
const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
```

**Step 2: Pass onPress to VideoCard**

In the `renderItem` where `VideoCard` is rendered, add `onPress`:

```tsx
<VideoCard
  key={video.id}
  video={video}
  onDelete={handleDelete}
  onPress={setSelectedVideo}
/>
```

**Step 3: Render VideoPlayerModal**

Add before the closing `</View>` of the root container (after the timer modal):

```tsx
<VideoPlayerModal
  video={selectedVideo}
  onClose={() => setSelectedVideo(null)}
/>
```

**Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: Pass

**Step 5: Manual test**

Run: `npx expo start --ios`
- Tap a video thumbnail → modal opens with video paused
- Tap play → video plays
- Drag slider → video scrubs
- Tap close → modal dismisses
- Long-press thumbnail → still shows delete confirmation

**Step 6: Commit**

```bash
git add app/(tabs)/videos.tsx
git commit -m "feat: wire video player modal into Videos tab"
```
