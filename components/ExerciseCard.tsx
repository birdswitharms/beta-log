import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "../types";

interface Props {
  exercise: Exercise;
  onDelete: (id: number) => void;
}

export default function ExerciseCard({ exercise, onDelete }: Props) {
  const date = new Date(exercise.created_at);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{exercise.name}</Text>
          {exercise.grade ? (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>{exercise.grade}</Text>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={() => onDelete(exercise.id)}
          hitSlop={8}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF453A" />
        </Pressable>
      </View>

      {(exercise.sets > 0 || exercise.reps > 0) && (
        <Text style={styles.stats}>
          {exercise.sets > 0 ? `${exercise.sets} sets` : ""}
          {exercise.sets > 0 && exercise.reps > 0 ? " x " : ""}
          {exercise.reps > 0 ? `${exercise.reps} reps` : ""}
        </Text>
      )}

      {exercise.notes ? (
        <Text style={styles.notes}>{exercise.notes}</Text>
      ) : null}

      <Text style={styles.date}>{formattedDate}</Text>
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
    alignItems: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  gradeBadge: {
    backgroundColor: "#FF6B35",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gradeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  deleteButton: {
    padding: 4,
  },
  stats: {
    color: "#AEAEB2",
    fontSize: 15,
    marginTop: 6,
  },
  notes: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 6,
    fontStyle: "italic",
  },
  date: {
    color: "#636366",
    fontSize: 12,
    marginTop: 8,
  },
});
