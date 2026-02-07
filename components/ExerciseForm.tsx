import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { addExercise } from "../db/database";
import { NewExercise } from "../types";

interface Props {
  onSaved: () => void;
}

export default function ExerciseForm({ onSaved }: Props) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [grade, setGrade] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter an exercise name.");
      return;
    }

    const exercise: NewExercise = {
      name: name.trim(),
      sets: parseInt(sets, 10) || 0,
      reps: parseInt(reps, 10) || 0,
      grade: grade.trim(),
      notes: notes.trim(),
    };

    await addExercise(exercise);
    setName("");
    setSets("");
    setReps("");
    setGrade("");
    setNotes("");
    onSaved();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Exercise Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Campus Board, Hangboard, Boulder"
          placeholderTextColor="#636366"
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Sets</Text>
            <TextInput
              style={styles.input}
              value={sets}
              onChangeText={setSets}
              placeholder="0"
              placeholderTextColor="#636366"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Reps</Text>
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              placeholder="0"
              placeholderTextColor="#636366"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Text style={styles.label}>Grade (optional)</Text>
        <TextInput
          style={styles.input}
          value={grade}
          onChangeText={setGrade}
          placeholder="e.g. V4, 5.11a"
          placeholderTextColor="#636366"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it feel? Any beta to remember?"
          placeholderTextColor="#636366"
          multiline
          numberOfLines={3}
        />

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Exercise</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
