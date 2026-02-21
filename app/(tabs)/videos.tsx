import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function VideosScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Ionicons name="videocam-outline" size={64} color="#636366" />
        <Text style={styles.emptyText}>No videos yet</Text>
        <Text style={styles.emptySubtext}>
          Record a climbing attempt or add a collection to get started.
        </Text>
        <View style={styles.buttons}>
          <Pressable style={styles.primaryButton}>
            <Ionicons name="videocam" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Record Video</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Ionicons name="folder-open-outline" size={20} color="#FFFFFF" />
            <Text style={styles.secondaryButtonText}>Add Collection</Text>
          </Pressable>
        </View>
      </View>
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
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 14,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
