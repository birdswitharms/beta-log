import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ExerciseForm from "../../components/ExerciseForm";
import { showAlert } from "../../components/CustomAlert";

export default function LogScreen() {
  const { exerciseName } = useLocalSearchParams<{ exerciseName?: string }>();

  return (
    <View style={styles.container}>
      <ExerciseForm
        initialName={exerciseName}
        onSaved={() => showAlert({ title: "Saved", message: "Exercise logged successfully!" })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
});
