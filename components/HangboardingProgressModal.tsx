import { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { getHangboardingByPresetName } from "../db/database";
import {
  usePreferencesStore,
  convertFromLbs,
} from "../store/usePreferencesStore";

interface Props {
  visible: boolean;
  onClose: () => void;
  presetName: string;
}

const COLORS = {
  hangTime: "#5AC8FA",
  weight: "#FF6B35",
  edge: "#34C759",
};

export default function HangboardingProgressModal({
  visible,
  onClose,
  presetName,
}: Props) {
  const insets = useSafeAreaInsets();
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const [loading, setLoading] = useState(true);
  const [weightLabels, setWeightLabels] = useState<string[]>([]);
  const [weightValues, setWeightValues] = useState<number[]>([]);
  const [edgeLabels, setEdgeLabels] = useState<string[]>([]);
  const [edgeValues, setEdgeValues] = useState<number[]>([]);
  const [hangTimeLabels, setHangTimeLabels] = useState<string[]>([]);
  const [hangTimeValues, setHangTimeValues] = useState<number[]>([]);
  const [hasWeight, setHasWeight] = useState(false);
  const [hasEdge, setHasEdge] = useState(false);
  const [hasHangTime, setHasHangTime] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      const entries = await getHangboardingByPresetName(presetName);

      const weightByDate = new Map<string, number>();
      const edgeByDate = new Map<string, number>();
      const hangTimeByDate = new Map<string, number>();

      for (const entry of entries) {
        const date = entry.completed_at.slice(0, 10);

        if (entry.weight_lbs !== null) {
          const existing = weightByDate.get(date) ?? 0;
          if (entry.weight_lbs > existing) {
            weightByDate.set(date, entry.weight_lbs);
          }
        }

        if (entry.edge_mm !== null) {
          const existing = edgeByDate.get(date);
          if (existing === undefined || entry.edge_mm < existing) {
            edgeByDate.set(date, entry.edge_mm);
          }
        }

        // Total work time = work_time * (sets * reps)
        const workTime = (entry.work_time ?? 0) * (entry.sets ?? 0) * (entry.reps ?? 0);
        if (workTime > 0) {
          const existing = hangTimeByDate.get(date) ?? 0;
          hangTimeByDate.set(date, existing + workTime);
        }
      }

      if (cancelled) return;

      const foundWeight = weightByDate.size >= 2;
      const foundEdge = edgeByDate.size >= 2;
      const foundHangTime = hangTimeByDate.size >= 2;
      setHasWeight(foundWeight);
      setHasEdge(foundEdge);
      setHasHangTime(foundHangTime);

      if (foundWeight) {
        const sorted = Array.from(weightByDate.keys()).sort();
        setWeightLabels(thinLabels(sorted.map(formatLabel)));
        setWeightValues(
          sorted.map((d) => convertFromLbs(weightByDate.get(d)!, weightUnit))
        );
      }

      if (foundEdge) {
        const sorted = Array.from(edgeByDate.keys()).sort();
        setEdgeLabels(thinLabels(sorted.map(formatLabel)));
        setEdgeValues(sorted.map((d) => edgeByDate.get(d)!));
      }

      if (foundHangTime) {
        const sorted = Array.from(hangTimeByDate.keys()).sort();
        setHangTimeLabels(thinLabels(sorted.map(formatLabel)));
        setHangTimeValues(sorted.map((d) => hangTimeByDate.get(d)!));
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, presetName, weightUnit]);

  const screenWidth = Dimensions.get("window").width;
  const hasAnyData = hasHangTime || hasWeight || hasEdge;

  // Build ordered list of charts to render; last one gets x-axis labels
  const charts: {
    key: string;
    labels: string[];
    values: number[];
    suffix: string;
    color: string;
  }[] = [];
  if (hasHangTime)
    charts.push({ key: "hangTime", labels: hangTimeLabels, values: hangTimeValues, suffix: "s", color: COLORS.hangTime });
  if (hasWeight)
    charts.push({ key: "weight", labels: weightLabels, values: weightValues, suffix: ` ${weightUnit}`, color: COLORS.weight });
  if (hasEdge)
    charts.push({ key: "edge", labels: edgeLabels, values: edgeValues, suffix: " mm", color: COLORS.edge });

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
            <Text style={styles.title}>{presetName}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#AEAEB2" />
            </Pressable>
          </View>

          <ScrollView style={styles.body}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#FF6B35"
                style={styles.centered}
              />
            ) : !hasAnyData ? (
              <Text style={styles.emptyText}>
                Not enough data to show a graph.{"\n"}Log this preset on at
                least 2 different dates.
              </Text>
            ) : (
              <>
                {charts.map((chart, index) => {
                  const isLast = index === charts.length - 1;
                  return (
                    <LineChart
                      key={chart.key}
                      data={{
                        labels: isLast ? chart.labels : chart.labels.map(() => ""),
                        datasets: [{ data: chart.values, color: () => chart.color, strokeWidth: 2 }],
                      }}
                      width={screenWidth}
                      height={isLast ? 170 : 150}
                      yAxisSuffix={chart.suffix}
                      chartConfig={makeChartConfig(chart.color)}
                      bezier
                      withDots
                      style={styles.chart}
                    />
                  );
                })}
              </>
            )}
          </ScrollView>
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
    maxHeight: "95%",
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
});
