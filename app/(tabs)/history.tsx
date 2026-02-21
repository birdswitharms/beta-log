import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  deleteExercise,
  deleteHangboarding,
  getLoggedDates,
  getExercisesByDate,
  getHangboardingByDate,
} from "../../db/database";
import { showAlert } from "../../components/CustomAlert";
import Calendar from "../../components/Calendar";
import ExerciseCard from "../../components/ExerciseCard";
import HangboardingCard from "../../components/HangboardingCard";
import { Exercise, Hangboarding } from "../../types";

type Tab = "hangboarding" | "exercises";

function formatDateHeader(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function HistoryScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<Tab>("hangboarding");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [hangboarding, setHangboarding] = useState<Hangboarding[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    const dates = await getLoggedDates();
    setMarkedDates(dates);
    setLoading(false);
  }, []);

  const loadDayData = useCallback(async (date: string) => {
    setLoading(true);
    const [ex, hb] = await Promise.all([
      getExercisesByDate(date),
      getHangboardingByDate(date),
    ]);
    setExercises(ex);
    setHangboarding(hb);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (selectedDate === null) {
        loadCalendarData();
      } else {
        loadDayData(selectedDate);
      }
    }, [selectedDate, loadCalendarData, loadDayData])
  );

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleBack = () => {
    setSelectedDate(null);
  };

  const handleDeleteExercise = (id: number) => {
    showAlert({
      title: "Delete",
      message: "Remove this exercise?",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteExercise(id);
            if (selectedDate) loadDayData(selectedDate);
          },
        },
      ],
    });
  };

  const handleDeleteHangboarding = (id: number) => {
    showAlert({
      title: "Delete",
      message: "Remove this hangboarding routine?",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteHangboarding(id);
            if (selectedDate) loadDayData(selectedDate);
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

  // Calendar view
  if (selectedDate === null) {
    return (
      <View style={styles.container}>
        <Calendar markedDates={markedDates} onSelectDate={handleSelectDate} />
      </View>
    );
  }

  // Day detail view
  return (
    <View style={styles.container}>
      {/* Back button + date header */}
      <Pressable onPress={handleBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={22} color="#FF6B35" />
        <Text style={styles.backText}>Calendar</Text>
      </Pressable>
      <Text style={styles.dateHeader}>{formatDateHeader(selectedDate)}</Text>

      {/* Tab toggle */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabButton, tab === "hangboarding" && styles.tabActive]}
          onPress={() => setTab("hangboarding")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "hangboarding" && styles.tabTextActive,
            ]}
          >
            Hangboarding
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, tab === "exercises" && styles.tabActive]}
          onPress={() => setTab("exercises")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "exercises" && styles.tabTextActive,
            ]}
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
            <HangboardingCard
              hangboarding={item}
              onDelete={handleDeleteHangboarding}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                No hangboarding on this day.
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
              <Text style={styles.emptyText}>No exercises on this day.</Text>
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backText: {
    color: "#FF6B35",
    fontSize: 17,
    marginLeft: 2,
  },
  dateHeader: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    textAlign: "center", 
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    padding: 4,
    marginHorizontal: 16,
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
});
