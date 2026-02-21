import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addExercise } from "../db/database";
import { usePreferencesStore, convertToLbs } from "../store/usePreferencesStore";
import { showAlert } from "./CustomAlert";

interface LoggedSet {
  reps: number;
  weight: number | null;
}

interface Props {
  onSaved: () => void;
  initialName?: string;
}

export default function ExerciseForm({ onSaved, initialName }: Props) {
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const [name, setName] = useState(initialName ?? "");
  const [reps, setReps] = useState("");
  const [weightEnabled, setWeightEnabled] = useState(true);
  const [weight, setWeight] = useState("");
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);

  const handleLogSet = () => {
    const repCount = parseInt(reps, 10) || 0;
    if (repCount < 1) {
      showAlert({ title: "Required", message: "Enter at least 1 rep." });
      return;
    }
    setLoggedSets((prev) => [
      ...prev,
      {
        reps: repCount,
        weight: weightEnabled ? (parseFloat(weight) || 0) : null,
      },
    ]);
  };

  const handleRemoveSet = (index: number) => {
    setLoggedSets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert({ title: "Required", message: "Please enter an exercise name." });
      return;
    }
    if (loggedSets.length === 0) {
      showAlert({ title: "No sets", message: "Log at least one set before saving." });
      return;
    }

    const totalReps = loggedSets.reduce((sum, s) => sum + s.reps, 0);
    const weights = loggedSets
      .map((s) => s.weight !== null ? convertToLbs(s.weight, weightUnit) : null)
      .filter((w): w is number => w !== null);
    const maxWeight = weights.length > 0 ? Math.max(...weights) : null;

    await addExercise({
      name: name.trim(),
      sets: loggedSets.length,
      reps: totalReps,
      weight_lbs: maxWeight,
      sets_data: loggedSets.map((s) => ({
        reps: s.reps,
        weight: s.weight !== null ? convertToLbs(s.weight, weightUnit) : null,
      })),
    });

    setName("");
    setReps("");
    setWeight("");
    setLoggedSets([]);
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
          placeholder="Pullups, Bench Press, etc."
          placeholderTextColor="#636366"
        />

        <Text style={styles.label}>Reps</Text>
        <TextInput
          style={styles.input}
          value={reps}
          onChangeText={setReps}
          placeholder="0"
          placeholderTextColor="#636366"
          keyboardType="number-pad"
        />

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setWeightEnabled(!weightEnabled)}
        >
          <Ionicons
            name={weightEnabled ? "checkbox" : "square-outline"}
            size={22}
            color={weightEnabled ? "#FF6B35" : "#636366"}
          />
          <Text style={styles.checkboxLabel}>{`Add weight (${weightUnit})`}</Text>
        </Pressable>

        {weightEnabled && (
          <>
            <Text style={styles.label}>{`Weight (${weightUnit})`}</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              placeholderTextColor="#636366"
              keyboardType="decimal-pad"
            />
          </>
        )}

        <Pressable style={styles.logSetButton} onPress={handleLogSet}>
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logSetText}>Log Set</Text>
        </Pressable>

        {loggedSets.length > 0 && (
          <View style={styles.setsSection}>
            <Text style={styles.setsHeader}>
              {loggedSets.length} {loggedSets.length === 1 ? "set" : "sets"} logged
            </Text>
            {loggedSets.map((s, i) => (
              <View key={i} style={styles.setRow}>
                <Text style={styles.setNumber}>Set {i + 1}</Text>
                <Text style={styles.setDetail}>
                  {s.reps} reps{s.weight !== null ? ` @ ${s.weight} ${weightUnit}` : ""}
                </Text>
                <Pressable onPress={() => handleRemoveSet(i)} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="#FF453A" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Pressable
          style={[
            styles.saveButton,
            loggedSets.length === 0 && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
        >
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    marginBottom: 4,
  },
  checkboxLabel: {
    color: "#AEAEB2",
    fontSize: 15,
    fontWeight: "600",
  },
  logSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  logSetText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  setsSection: {
    marginTop: 20,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 14,
  },
  setsHeader: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#3A3A3C",
  },
  setNumber: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
    width: 50,
  },
  setDetail: {
    color: "#FFFFFF",
    fontSize: 15,
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
