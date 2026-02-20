import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePreferencesStore } from "../store/usePreferencesStore";

type WeightUnit = "lbs" | "kg";

export default function WelcomeScreen() {
  const [selected, setSelected] = useState<WeightUnit>("lbs");
  const { setWeightUnit, completeOnboarding } = usePreferencesStore();

  const handleGetStarted = async () => {
    await setWeightUnit(selected);
    await completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Beta Log</Text>
      <Text style={styles.subtitle}>
        Choose your preferred weight unit. You can change this later in settings.
      </Text>

      <View style={styles.cardsRow}>
        <Pressable
          style={[styles.card, selected === "lbs" && styles.cardSelected]}
          onPress={() => setSelected("lbs")}
        >
          <Text style={[styles.cardUnit, selected === "lbs" && styles.cardUnitSelected]}>
            lbs
          </Text>
          <Text style={styles.cardLabel}>Imperial</Text>
        </Pressable>

        <Pressable
          style={[styles.card, selected === "kg" && styles.cardSelected]}
          onPress={() => setSelected("kg")}
        >
          <Text style={[styles.cardUnit, selected === "kg" && styles.cardUnitSelected]}>
            kg
          </Text>
          <Text style={styles.cardLabel}>Metric</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  subtitle: {
    color: "#8E8E93",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 48,
  },
  card: {
    width: 140,
    height: 140,
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2C2C2E",
  },
  cardSelected: {
    borderColor: "#FF6B35",
    backgroundColor: "#3A2A1E",
  },
  cardUnit: {
    color: "#AEAEB2",
    fontSize: 32,
    fontWeight: "800",
  },
  cardUnitSelected: {
    color: "#FF6B35",
  },
  cardLabel: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
