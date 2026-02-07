import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { getExercises, deleteExercise } from "../../db/database";
import ExerciseCard from "../../components/ExerciseCard";
import { Exercise } from "../../types";

export default function HistoryScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    const data = await getExercises();
    setExercises(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  const handleDelete = (id: number) => {
    Alert.alert("Delete", "Remove this exercise?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteExercise(id);
          loadExercises();
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
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExerciseCard exercise={item} onDelete={handleDelete} />
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
  list: {
    padding: 16,
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
  },
});
