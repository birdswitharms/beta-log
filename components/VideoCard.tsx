import { useEffect, useState } from "react";
import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "../types";

interface Props {
  video: Video;
  onDelete: (id: number) => void;
  onPress: (video: Video) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoCard({ video, onDelete, onPress }: Props) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(video.uri, {
          time: 1000,
        });
        if (!cancelled) setThumbnail(uri);
      } catch {
        // Thumbnail generation failed (e.g. placeholder URI) — show fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [video.uri]);

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress(video)}
      onLongPress={() => onDelete(video.id)}
    >
      {thumbnail ? (
        <Image source={{ uri: thumbnail }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.fallback]}>
          <Ionicons name="videocam" size={32} color="#636366" />
        </View>
      )}

      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{formatDuration(video.duration_seconds)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    margin: 1.5,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#2C2C2E",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
});
