import { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  SectionList,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { getVideos, deleteVideo, addVideo, addVideoWithDate } from "../../db/database";
import { showAlert } from "../../components/CustomAlert";
import VideoCard from "../../components/VideoCard";
import VideoPlayerModal from "../../components/VideoPlayerModal";
import { Video } from "../../types";

const NUM_COLUMNS = 3;

interface VideoSection {
  title: string;
  data: Video[][];
}

function formatDateHeader(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function groupVideosByDate(videos: Video[]): VideoSection[] {
  const groups: Record<string, Video[]> = {};
  for (const video of videos) {
    const dateKey = video.recorded_at.split(" ")[0] || video.recorded_at.split("T")[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(video);
  }

  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((dateKey) => ({
      title: formatDateHeader(dateKey),
      data: chunkArray(groups[dateKey], NUM_COLUMNS),
    }));
}

const TIMER_OPTIONS = [5, 10, 20];

export default function VideosScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    const result = await getVideos();
    setVideos(result);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVideos();
    }, [loadVideos])
  );

  const handleRecordPress = () => {
    setTimerModalVisible(true);
  };

  const handleTimerSelect = (seconds: number) => {
    setTimerModalVisible(false);
    router.push({ pathname: "/camera", params: { countdown: seconds.toString() } });
  };

  const handleImport = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "videos",
      allowsMultipleSelection: true,
    });

    if (result.canceled || result.assets.length === 0) return;

    setImporting(true);
    for (const asset of result.assets) {
      const filename = asset.fileName ?? asset.uri.split("/").pop() ?? "imported.mp4";
      const duration = Math.round((asset.duration ?? 0) / 1000);

      let recordedAt: string | null = null;
      if (asset.assetId) {
        try {
          const info = await MediaLibrary.getAssetInfoAsync(asset.assetId);
          if (info.creationTime) {
            const d = new Date(info.creationTime);
            recordedAt = d.toISOString().replace("T", " ").slice(0, 19);
          }
        } catch {
          // Fall through to default
        }
      }

      if (recordedAt) {
        await addVideoWithDate(
          { uri: asset.uri, filename, duration_seconds: duration },
          recordedAt
        );
      } else {
        await addVideo({ uri: asset.uri, filename, duration_seconds: duration });
      }
    }
    setImporting(false);
    loadVideos();
  };

  const handleDelete = (id: number) => {
    showAlert({
      title: "Delete Video",
      message: "Remove this video from your log? The file will remain in your gallery.",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteVideo(id);
            loadVideos();
          },
        },
      ],
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FF6B35" />
      </View>
    );
  }

  const sections = groupVideosByDate(videos);

  return (
    <View style={styles.container}>
      {importing && (
        <View style={styles.importingBanner}>
          <ActivityIndicator color="#FF6B35" size="small" />
          <Text style={styles.importingText}>Importing videos…</Text>
        </View>
      )}

      {videos.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="videocam-outline" size={64} color="#636366" />
          <Text style={styles.emptyText}>No videos yet</Text>
          <View style={styles.buttons}>
            <Pressable style={styles.primaryButton} onPress={handleRecordPress}>
              <Ionicons name="videocam" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Record Video</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={handleImport}>
              <Ionicons name="images-outline" size={20} color="#FF6B35" />
              <Text style={styles.secondaryButtonText}>Import from Gallery</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.map((v) => v.id).join("-")}
            renderItem={({ item: row }) => (
              <View style={styles.row}>
                {row.map((video) => (
                  <VideoCard key={video.id} video={video} onDelete={handleDelete} onPress={setSelectedVideo} />
                ))}
                {row.length < NUM_COLUMNS &&
                  Array.from({ length: NUM_COLUMNS - row.length }).map((_, i) => (
                    <View key={`spacer-${i}`} style={styles.spacer} />
                  ))}
              </View>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            contentContainerStyle={styles.list}
          />
          <View style={styles.fabColumn}>
            <Pressable style={styles.fabSecondary} onPress={handleImport}>
              <Ionicons name="images-outline" size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.fab} onPress={handleRecordPress}>
              <Ionicons name="videocam" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </>
      )}

      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      {/* Timer Selection Modal */}
      <Modal
        visible={timerModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTimerModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Countdown Timer</Text>
              <Pressable
                onPress={() => setTimerModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color="#AEAEB2" />
              </Pressable>
            </View>

            <Text style={styles.sheetSubtitle}>
              Choose how long you need to get into position!
            </Text>

            <View style={styles.timerRow}>
              {TIMER_OPTIONS.map((seconds) => (
                <Pressable
                  key={seconds}
                  style={styles.timerOption}
                  onPress={() => handleTimerSelect(seconds)}
                >
                  <Text style={styles.timerNumber}>{seconds}</Text>
                  <Text style={styles.timerLabel}>seconds</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setTimerModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "#AEAEB2",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#636366",
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  buttons: {
    marginTop: 24,
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FF6B35",
    borderRadius: 12,
    padding: 14,
  },
  secondaryButtonText: {
    color: "#FF6B35",
    fontSize: 16,
    fontWeight: "700",
  },
  importingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    backgroundColor: "#2C2C2E",
  },
  importingText: {
    color: "#AEAEB2",
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
  },
  spacer: {
    flex: 1,
    margin: 1.5,
  },
  sectionHeader: {
    color: "#AEAEB2",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 12,
    paddingHorizontal: 2,
  },
  list: {
    padding: 2,
    paddingBottom: 100,
  },
  fabColumn: {
    position: "absolute",
    bottom: 24,
    right: 20,
    alignItems: "center",
    gap: 12,
  },
  fabSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  sheetSubtitle: {
    color: "#AEAEB2",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  timerRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timerOption: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
  },
  timerNumber: {
    color: "#FF6B35",
    fontSize: 32,
    fontWeight: "800",
  },
  timerLabel: {
    color: "#AEAEB2",
    fontSize: 13,
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 20,
    alignItems: "center",
  },
  cancelText: {
    color: "#AEAEB2",
    fontSize: 16,
    fontWeight: "600",
  },
});
