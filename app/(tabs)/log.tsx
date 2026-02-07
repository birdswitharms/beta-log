import { Alert, StyleSheet, View } from "react-native";
import ExerciseForm from "../../components/ExerciseForm";

export default function LogScreen() {
  return (
    <View style={styles.container}>
      <ExerciseForm
        onSaved={() => Alert.alert("Saved", "Exercise logged successfully!")}
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
