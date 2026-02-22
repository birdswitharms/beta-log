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

type Metric = "weight" | "reps";

const METRIC_COLORS: Record<Metric, string> = {
  weight: "#FF6B35",
  reps: "#5AC8FA",
};

const METRIC_LABELS: Record<Metric, string> = {
  weight: "Weight",
  reps: "Reps",
};

export default function ExerciseProgressModal({
  visible,
  onClose,
  exerciseName,
}: Props) {
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<string[]>([]);
  const [weightData, setWeightData] = useState<number[]>([]);
  const [repsData, setRepsData] = useState<number[]>([]);
  const [activeMetrics, setActiveMetrics] = useState<Set<Metric>>(
    new Set(["weight", "reps"])
  );

  const toggleMetric = (m: Metric) => {
    setActiveMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(m)) {
        if (next.size > 1) next.delete(m);
      } else {
        next.add(m);
      }
      return next;
    });
  };

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

        // Max weight per date
        const existingWeight = weightByDate.get(date) ?? 0;
        if (maxWeight > existingWeight) weightByDate.set(date, maxWeight);

        // Sum reps per date
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

  const datasets: { data: number[]; color: () => string; strokeWidth: number }[] = [];
  if (activeMetrics.has("weight") && weightData.length > 0) {
    datasets.push({
      data: weightData,
      color: () => METRIC_COLORS.weight,
      strokeWidth: 2,
    });
  }
  if (activeMetrics.has("reps") && repsData.length > 0) {
    datasets.push({
      data: repsData,
      color: () => METRIC_COLORS.reps,
      strokeWidth: 2,
    });
  }

  // Y-axis suffix only when a single metric is active
  let yAxisSuffix = "";
  if (activeMetrics.size === 1) {
    const solo = Array.from(activeMetrics)[0];
    if (solo === "weight") yAxisSuffix = ` ${weightUnit}`;
    else yAxisSuffix = " reps";
  }

  const hasEnoughData = weightData.length >= 2;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
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
                <View style={styles.pillRow}>
                  {(["weight", "reps"] as Metric[]).map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => toggleMetric(m)}
                      style={[
                        styles.pill,
                        activeMetrics.has(m) && {
                          backgroundColor: METRIC_COLORS[m],
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          activeMetrics.has(m) && styles.pillTextActive,
                        ]}
                      >
                        {METRIC_LABELS[m]}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {datasets.length > 0 && (
                  <LineChart
                    data={{
                      labels,
                      datasets,
                    }}
                    width={screenWidth}
                    height={300}
                    yAxisSuffix={yAxisSuffix}
                    chartConfig={{
                      backgroundColor: "#1C1C1E",
                      backgroundGradientFrom: "#1C1C1E",
                      backgroundGradientTo: "#1C1C1E",
                      decimalPlaces: 0,
                      color: () => "#FF6B35",
                      labelColor: () => "#8E8E93",
                      propsForDots: {
                        r: "3",
                        strokeWidth: "1",
                      },
                      propsForBackgroundLines: {
                        stroke: "#2C2C2E",
                      },
                    }}
                    bezier
                    style={styles.chart}
                    withDots={activeMetrics.size === 1}
                  />
                )}

                <View style={styles.legend}>
                  {(["weight", "reps"] as Metric[]).map(
                    (m) =>
                      activeMetrics.has(m) && (
                        <View key={m} style={styles.legendItem}>
                          <View
                            style={[
                              styles.legendDot,
                              { backgroundColor: METRIC_COLORS[m] },
                            ]}
                          />
                          <Text style={styles.legendText}>
                            {METRIC_LABELS[m]}
                          </Text>
                        </View>
                      )
                  )}
                </View>
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
    paddingBottom: 40,
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
    paddingVertical: 20,
    minHeight: 380,
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
  pillRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2C2C2E",
  },
  pillText: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  chart: {
    borderRadius: 12,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: "#8E8E93",
    fontSize: 12,
  },
});
