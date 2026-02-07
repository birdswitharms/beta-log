import { View, StyleSheet } from "react-native";
import TimerDisplay from "../../components/TimerDisplay";

export default function TimerScreen() {
  return (
    <View style={styles.container}>
      <TimerDisplay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    justifyContent: "flex-start",
  },
});
