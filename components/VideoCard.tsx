import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "../types";

interface Props {
  video: Video;
  onDelete: (id: number) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function VideoCard({ video, onDelete }: Props) {
  const date = new Date(video.recorded_at);
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="videocam" size={20} color="#FF6B35" />
        <Text style={styles.name} numberOfLines={1}>
          {video.filename}
        </Text>
        <Pressable
          onPress={() => onDelete(video.id)}
          hitSlop={8}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF453A" />
        </Pressable>
      </View>

      <View style={styles.thickDivider} />

      <View style={styles.detailRow}>
        <Text style={styles.detail}>
          {formatDuration(video.duration_seconds)}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.detail}>{formattedTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  thickDivider: {
    height: 2,
    backgroundColor: "#3A3A3C",
    marginTop: 12,
    marginBottom: 12,
  },
  detailRow: {},
  detail: {
    color: "#AEAEB2",
    fontSize: 13,
    paddingVertical: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#3A3A3C",
  },
});
