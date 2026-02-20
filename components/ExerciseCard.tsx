import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "../types";
import { usePreferencesStore, formatWeight } from "../store/usePreferencesStore";

interface Props {
  exercise: Exercise;
  onDelete: (id: number) => void;
}

export default function ExerciseCard({ exercise, onDelete }: Props) {
  const weightUnit = usePreferencesStore((s) => s.weightUnit);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Pressable
          onPress={() => onDelete(exercise.id)}
          hitSlop={8}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF453A" />
        </Pressable>
      </View>

      {exercise.sets_data && exercise.sets_data.length > 0 ? (
        <View style={styles.setsContainer}>
          {exercise.sets_data.map((s, i) => (
            <View key={i} style={styles.setRow}>
              <Text style={styles.setLabel}>Set {i + 1}</Text>
              <Text style={styles.setDetail}>
                {s.reps} reps{s.weight !== null ? ` @ ${formatWeight(s.weight, weightUnit)}` : ""}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        // Fallback for older entries without per-set data
        <>
          {(exercise.sets > 0 || exercise.reps > 0) && (
            <Text style={styles.fallbackStats}>
              {exercise.sets > 0 ? `${exercise.sets} sets` : ""}
              {exercise.sets > 0 && exercise.reps > 0 ? " x " : ""}
              {exercise.reps > 0 ? `${exercise.reps} reps` : ""}
              {exercise.weight_lbs !== null
                ? ` @ ${formatWeight(exercise.weight_lbs, weightUnit)}`
                : ""}
            </Text>
          )}
        </>
      )}
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
  setsContainer: {
    marginTop: 10,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  setLabel: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
    width: 50,
  },
  setDetail: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  fallbackStats: {
    color: "#AEAEB2",
    fontSize: 15,
    marginTop: 6,
  },
});
