import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getWorkout, deleteWorkout } from "../../db/database";
import { showAlert } from "../../components/CustomAlert";
import { Workout } from "../../types";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        const data = await getWorkout(Number(id));
        setWorkout(data);
        setLoading(false);
      })();
    }, [id])
  );

  const handleDelete = () => {
    showAlert({
      title: "Delete",
      message: "Remove this workout?",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteWorkout(Number(id));
            router.back();
          },
        },
      ],
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FF6B35" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Workout not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: workout.name,
          headerRight: () => (
            <Pressable onPress={handleDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={22} color="#FF453A" />
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={workout.exercises}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <Pressable
            style={styles.exerciseRow}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/log",
                params: { exerciseName: item },
              })
            }
          >
            <Text style={styles.exerciseName}>{item}</Text>
            <Ionicons name="chevron-forward" size={20} color="#636366" />
          </Pressable>
        )}
        contentContainerStyle={styles.list}
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
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  exerciseName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
    flex: 1,
  },
  emptyText: {
    color: "#AEAEB2",
    fontSize: 17,
    fontWeight: "600",
  },
});
