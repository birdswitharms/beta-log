import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useFocusEffect } from "expo-router";
import {
  getExercises,
  deleteExercise,
  getHangboarding,
  deleteHangboarding,
} from "../../db/database";
import ExerciseCard from "../../components/ExerciseCard";
import HangboardingCard from "../../components/HangboardingCard";
import { Exercise, Hangboarding } from "../../types";

type Tab = "hangboarding" | "exercises";

export default function HistoryScreen() {
  const [tab, setTab] = useState<Tab>("hangboarding");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [hangboarding, setHangboarding] = useState<Hangboarding[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [ex, wo] = await Promise.all([getExercises(), getHangboarding()]);
    setExercises(ex);
    setHangboarding(wo);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDeleteExercise = (id: number) => {
    Alert.alert("Delete", "Remove this exercise?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteExercise(id);
          loadData();
        },
      },
    ]);
  };

  const handleDeleteHangboarding = (id: number) => {
    Alert.alert("Delete", "Remove this hangboarding routine?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteHangboarding(id);
          loadData();
        },
      },
    ]);
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
      {/* Tab toggle */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabButton, tab === "hangboarding" && styles.tabActive]}
          onPress={() => setTab("hangboarding")}
        >
          <Text
            style={[styles.tabText, tab === "hangboarding" && styles.tabTextActive]}
          >
            Hangboarding
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, tab === "exercises" && styles.tabActive]}
          onPress={() => setTab("exercises")}
        >
          <Text
            style={[styles.tabText, tab === "exercises" && styles.tabTextActive]}
          >
            Exercises
          </Text>
        </Pressable>
      </View>

      {tab === "hangboarding" ? (
        <FlatList
          data={hangboarding}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HangboardingCard hangboarding={item} onDelete={handleDeleteHangboarding} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No hangboarding yet.</Text>
              <Text style={styles.emptySubtext}>
                Complete a timer session to log your first one!
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ExerciseCard exercise={item} onDelete={handleDeleteExercise} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No exercises logged yet.</Text>
              <Text style={styles.emptySubtext}>
                Head to the Log tab to add your first one!
              </Text>
            </View>
          }
        />
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
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    padding: 4,
    margin: 16,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#FF6B35",
  },
  tabText: {
    color: "#8E8E93",
    fontSize: 15,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
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
});
