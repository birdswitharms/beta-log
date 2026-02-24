import { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { getExercisesByName } from "../db/database";
import {
  usePreferencesStore,
  convertFromLbs,
} from "../store/usePreferencesStore";

interface Props {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
}

const COLORS = {
  weight: "#FF6B35",
  reps: "#5AC8FA",
};

export default function ExerciseProgressModal({
  visible,
  onClose,
  exerciseName,
}: Props) {
  const insets = useSafeAreaInsets();
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<string[]>([]);
  const [weightData, setWeightData] = useState<number[]>([]);
  const [repsData, setRepsData] = useState<number[]>([]);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      const exercises = await getExercisesByName(exerciseName);

      const weightByDate = new Map<string, number>();
      const repsByDate = new Map<string, number>();

      for (const ex of exercises) {
        const date = ex.created_at.slice(0, 10);

        let maxWeight = 0;
        let totalReps = 0;

        if (ex.sets_data && ex.sets_data.length > 0) {
          for (const s of ex.sets_data) {
            totalReps += s.reps;
            const w = s.weight ?? 0;
            if (w > maxWeight) maxWeight = w;
          }
        } else {
          maxWeight = ex.weight_lbs ?? 0;
          totalReps = ex.reps;
        }

        const existingWeight = weightByDate.get(date) ?? 0;
        if (maxWeight > existingWeight) weightByDate.set(date, maxWeight);

        repsByDate.set(date, (repsByDate.get(date) ?? 0) + totalReps);
      }

      if (cancelled) return;

      const sortedDates = Array.from(weightByDate.keys()).sort();
      const dateLabels = sortedDates.map(formatLabel);

      setLabels(thinLabels(dateLabels));
      setWeightData(
        sortedDates.map((d) =>
          convertFromLbs(weightByDate.get(d)!, weightUnit)
        )
      );
      setRepsData(sortedDates.map((d) => repsByDate.get(d)!));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, exerciseName, weightUnit]);

  const screenWidth = Dimensions.get("window").width;
  const hasEnoughData = weightData.length >= 2;

  const makeChartConfig = (color: string) => ({
    backgroundColor: "#1C1C1E",
    backgroundGradientFrom: "#1C1C1E",
    backgroundGradientTo: "#1C1C1E",
    decimalPlaces: 0,
    color: () => color,
    labelColor: () => "#8E8E93",
    propsForDots: {
      r: "3",
      strokeWidth: "1",
      stroke: color,
    },
    propsForBackgroundLines: {
      stroke: "#2C2C2E",
    },
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(20, insets.bottom) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{exerciseName}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#AEAEB2" />
            </Pressable>
          </View>

          <View style={styles.body}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#FF6B35"
                style={styles.centered}
              />
            ) : !hasEnoughData ? (
              <Text style={styles.emptyText}>
                Not enough data to show a graph.{"\n"}Log this exercise on at
                least 2 different dates.
              </Text>
            ) : (
              <>
                <LineChart
                  data={{
                    labels: labels.map(() => ""),
                    datasets: [{ data: weightData, color: () => COLORS.weight, strokeWidth: 2 }],
                  }}
                  width={screenWidth}
                  height={150}
                  yAxisSuffix={` ${weightUnit}`}
                  chartConfig={makeChartConfig(COLORS.weight)}
                  bezier
                  style={styles.chart}
                  withDots
                />
                <LineChart
                  data={{
                    labels,
                    datasets: [{ data: repsData, color: () => COLORS.reps, strokeWidth: 2 }],
                  }}
                  width={screenWidth}
                  height={170}
                  yAxisSuffix=" reps"
                  chartConfig={makeChartConfig(COLORS.reps)}
                  bezier
                  style={styles.chart}
                  withDots
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatLabel(date: string): string {
  const [, m, d] = date.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

function thinLabels(labels: string[]): string[] {
  if (labels.length <= 7) return labels;
  const result = [...labels];
  const step = Math.ceil(result.length / 7);
  for (let i = 0; i < result.length; i++) {
    if (i % step !== 0) {
      result[i] = "";
    }
  }
  return result;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  body: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  centered: {
    marginTop: 80,
  },
  emptyText: {
    color: "#8E8E93",
    fontSize: 15,
    textAlign: "center",
    marginTop: 60,
    marginHorizontal: 20,
    lineHeight: 22,
  },
  chart: {
    borderRadius: 12,
  },
  chartLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 20,
    marginBottom: 4,
    marginTop: 8,
  },
});
