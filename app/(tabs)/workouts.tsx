import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import { getWorkouts, saveWorkout } from "../../db/database";
import { Workout } from "../../types";

export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [exerciseInput, setExerciseInput] = useState("");
  const [exercises, setExercises] = useState<string[]>([]);

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    const data = await getWorkouts();
    setWorkouts(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );

  const handleAddExercise = () => {
    const trimmed = exerciseInput.trim();
    if (!trimmed) return;
    setExercises((prev) => [...prev, trimmed]);
    setExerciseInput("");
  };

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Required", "Please enter a workout name.");
      return;
    }
    if (exercises.length === 0) {
      Alert.alert("Required", "Add at least one exercise.");
      return;
    }
    await saveWorkout({ name: workoutName.trim(), exercises });
    setWorkoutName("");
    setExerciseInput("");
    setExercises([]);
    setCreating(false);
    loadWorkouts();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {creating ? (
        <View style={styles.form}>
          <Text style={styles.label}>Workout Name</Text>
          <TextInput
            style={styles.input}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="e.g. Push Day"
            placeholderTextColor="#636366"
          />

          <Text style={styles.label}>Exercises</Text>
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, styles.addInput]}
              value={exerciseInput}
              onChangeText={setExerciseInput}
              placeholder="Exercise name"
              placeholderTextColor="#636366"
              onSubmitEditing={handleAddExercise}
              returnKeyType="done"
            />
            <Pressable style={styles.addButton} onPress={handleAddExercise}>
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          {exercises.map((ex, i) => (
            <View key={i} style={styles.exerciseRow}>
              <Text style={styles.exerciseText}>{ex}</Text>
              <Pressable onPress={() => handleRemoveExercise(i)} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#FF453A" />
              </Pressable>
            </View>
          ))}

          <View style={styles.formButtons}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setCreating(false);
                setWorkoutName("");
                setExerciseInput("");
                setExercises([]);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSaveWorkout}>
              <Text style={styles.saveText}>Save Workout</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <Pressable
            style={styles.createButton}
            onPress={() => setCreating(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.createText}>Create Workout</Text>
          </Pressable>

          <FlatList
            data={workouts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.workoutRow}
                onPress={() => router.push(`/workout/${item.id}`)}
              >
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{item.name}</Text>
                  <Text style={styles.workoutCount}>
                    {item.exercises.length}{" "}
                    {item.exercises.length === 1 ? "exercise" : "exercises"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#636366"
                />
              </Pressable>
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No workouts yet.</Text>
                <Text style={styles.emptySubtext}>
                  Create a workout to get started!
                </Text>
              </View>
            }
          />
        </>
      )}
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
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 14,
    margin: 16,
    marginBottom: 8,
  },
  createText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  workoutCount: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 2,
  },
  emptyText: {
    color: "#AEAEB2",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 60,
  },
  emptySubtext: {
    color: "#636366",
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  form: {
    padding: 20,
  },
  label: {
    color: "#AEAEB2",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  addRow: {
    flexDirection: "row",
    gap: 10,
  },
  addInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  exerciseText: {
    color: "#FFFFFF",
    fontSize: 15,
    flex: 1,
  },
  formButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  cancelText: {
    color: "#AEAEB2",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
