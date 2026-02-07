import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Hangboarding } from "../types";

interface Props {
  hangboarding: Hangboarding;
  onDelete: (id: number) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function HangboardingCard({ hangboarding, onDelete }: Props) {
  const date = new Date(hangboarding.completed_at);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{hangboarding.preset_name}</Text>
        <Pressable
          onPress={() => onDelete(hangboarding.id)}
          hitSlop={8}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF453A" />
        </Pressable>
      </View>

      <Text style={styles.config}>
        {hangboarding.sets}s x {hangboarding.reps}r | {hangboarding.work_time}s work | {hangboarding.rep_rest}s rep rest | {hangboarding.set_rest}s set rest
      </Text>

      {(hangboarding.weight_lbs !== null || hangboarding.edge_mm !== null) && (
        <Text style={styles.extras}>
          {[
            hangboarding.weight_lbs !== null ? `${hangboarding.weight_lbs} lbs` : null,
            hangboarding.edge_mm !== null ? `${hangboarding.edge_mm}mm edge` : null,
          ]
            .filter(Boolean)
            .join(" | ")}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.duration}>{formatDuration(hangboarding.duration_seconds)}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
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
  config: {
    color: "#AEAEB2",
    fontSize: 13,
    marginTop: 6,
  },
  extras: {
    color: "#FF6B35",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  duration: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "700",
  },
  date: {
    color: "#636366",
    fontSize: 12,
  },
});
