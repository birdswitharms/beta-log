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
        <Text style={styles.name}>{exercise.name}</Text>
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

      {exercise.weight_lbs !== null && (
        <Text style={styles.weight}>{exercise.weight_lbs} lbs</Text>
      )}

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
  stats: {
    color: "#AEAEB2",
    fontSize: 15,
    marginTop: 6,
  },
  weight: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  date: {
    color: "#636366",
    fontSize: 12,
    marginTop: 8,
  },
});
