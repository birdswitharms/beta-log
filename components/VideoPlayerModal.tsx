import { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEventListener } from "expo";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Video } from "../types";

interface Props {
  video: Video | null;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const totalSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoPlayerModal({ video, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const player = useVideoPlayer(video?.uri ?? null, (p) => {
    p.loop = false;
  });

  // Reset state when video changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setError(false);
    setIsPlaying(false);
  }, [video?.id]);

  // Listen for status changes (readyToPlay, loading, error, idle)
  useEventListener(player, "statusChange", (event) => {
    if (event.status === "error") {
      setError(true);
    }
    if (event.status === "readyToPlay") {
      setError(false);
      setDuration(player.duration);
    }
  });

  // Listen for playing changes
  useEventListener(player, "playingChange", (event) => {
    setIsPlaying(event.isPlaying);
  });

  // Reset to start when playback finishes
  useEventListener(player, "playToEnd", () => {
    setIsPlaying(false);
    setCurrentTime(0);
    player.currentTime = 0;
  });

  // Poll currentTime while playing
  useEffect(() => {
    if (isPlaying && !isScrubbing) {
      pollRef.current = setInterval(() => {
        setCurrentTime(player.currentTime);
        setDuration((prev) =>
          prev === 0 && player.duration > 0 ? player.duration : prev
        );
      }, 250);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isPlaying, isScrubbing, player]);

  // Pause player when modal closes
  useEffect(() => {
    if (!video) {
      player.pause();
    }
  }, [video, player]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPlaying, player]);

  const handleScrubStart = useCallback(() => {
    setIsScrubbing(true);
  }, []);

  const handleScrubComplete = useCallback(
    (value: number) => {
      player.currentTime = value;
      setCurrentTime(value);
      setIsScrubbing(false);
    },
    [player]
  );

  const handleScrubChange = useCallback((value: number) => {
    setCurrentTime(value);
  }, []);

  const handleClose = useCallback(() => {
    player.pause();
    onClose();
  }, [player, onClose]);

  return (
    <Modal
      visible={video !== null}
      animationType="fade"
      presentationStyle="fullScreen"
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={styles.container}>
        {/* Close button */}
        <Pressable
          style={[styles.closeButton, { top: insets.top + 8 }]}
          onPress={handleClose}
          hitSlop={16}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>

        {/* Video area */}
        {error ? (
          <View style={styles.errorContainer}>
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

        {/* Controls bar */}
        <View style={[styles.controlsBar, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable onPress={handlePlayPause} hitSlop={12} style={styles.playButton}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="#FF6B35" />
          </Pressable>

          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration > 0 ? duration : 1}
            value={currentTime}
            onSlidingStart={handleScrubStart}
            onSlidingComplete={handleScrubComplete}
            onValueChange={handleScrubChange}
            minimumTrackTintColor="#FF6B35"
            maximumTrackTintColor="#636366"
            thumbTintColor="#FF6B35"
          />

          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
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
    backgroundColor: "rgba(44, 44, 46, 0.8)",
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
  },
  errorText: {
    color: "#AEAEB2",
    fontSize: 16,
  },
  controlsBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#2C2C2E",
  },
  playButton: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeText: {
    color: "#AEAEB2",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    minWidth: 36,
    textAlign: "center",
  },
});
