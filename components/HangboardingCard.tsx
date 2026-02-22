import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Hangboarding } from "../types";
import { usePreferencesStore, formatWeight } from "../store/usePreferencesStore";
import HangboardingProgressModal from "./HangboardingProgressModal";

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
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const [progressVisible, setProgressVisible] = useState(false);
  const isPreset = hangboarding.preset_name !== "Custom";
  const date = new Date(hangboarding.completed_at);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{hangboarding.preset_name}</Text>
        {isPreset && (
          <Pressable
            onPress={() => setProgressVisible(true)}
            hitSlop={8}
            style={styles.graphButton}
          >
            <Ionicons name="trending-up" size={18} color="#FF6B35" />
          </Pressable>
        )}
        <Pressable
          onPress={() => onDelete(hangboarding.id)}
          hitSlop={8}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF453A" />
        </Pressable>
      </View>

      <View style={styles.thickDivider} />

      <View style={styles.configContainer}>
        <Text style={styles.config}>
          {hangboarding.sets} sets x {hangboarding.reps} reps
        </Text>
        <View style={styles.divider} />
        <Text style={styles.config}>
          {hangboarding.work_time}s hang x {hangboarding.rep_rest}s rest
        </Text>
        <View style={styles.divider} />
        <Text style={styles.config}>
          {hangboarding.set_rest}s set rest
        </Text>
      </View>

      {(hangboarding.weight_lbs !== null || hangboarding.edge_mm !== null) && (
        <Text style={styles.extras}>
          {[
            hangboarding.weight_lbs !== null ? formatWeight(hangboarding.weight_lbs, weightUnit) : null,
            hangboarding.edge_mm !== null ? `${hangboarding.edge_mm}mm edge` : null,
          ]
            .filter(Boolean)
            .join(" | ")}
        </Text>
      )}
    </View>
    {isPreset && (
      <HangboardingProgressModal
        visible={progressVisible}
        onClose={() => setProgressVisible(false)}
        presetName={hangboarding.preset_name}
      />
    )}
    </>
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
  graphButton: {
    padding: 4,
    marginRight: 8,
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
  configContainer: {
    marginTop: 0,
  },
  config: {
    color: "#AEAEB2",
    fontSize: 13,
    paddingVertical: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#3A3A3C",
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
