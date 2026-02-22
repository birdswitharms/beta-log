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
import { getHangboardingByPresetName } from "../db/database";
import {
  usePreferencesStore,
  convertFromLbs,
} from "../store/usePreferencesStore";

type Metric = "weight" | "edge";

interface Props {
  visible: boolean;
  onClose: () => void;
  presetName: string;
}

export default function HangboardingProgressModal({
  visible,
  onClose,
  presetName,
}: Props) {
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const [metric, setMetric] = useState<Metric>("weight");
  const [loading, setLoading] = useState(true);
  const [weightLabels, setWeightLabels] = useState<string[]>([]);
  const [weightValues, setWeightValues] = useState<number[]>([]);
  const [edgeLabels, setEdgeLabels] = useState<string[]>([]);
  const [edgeValues, setEdgeValues] = useState<number[]>([]);
  const [hasWeight, setHasWeight] = useState(false);
  const [hasEdge, setHasEdge] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      const entries = await getHangboardingByPresetName(presetName);

      // Group by date — max weight, min edge per date
      const weightByDate = new Map<string, number>();
      const edgeByDate = new Map<string, number>();

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
      }

      if (cancelled) return;

      const foundWeight = weightByDate.size >= 2;
      const foundEdge = edgeByDate.size >= 2;
      setHasWeight(foundWeight);
      setHasEdge(foundEdge);

      if (foundWeight) {
        const sorted = Array.from(weightByDate.keys()).sort();
        const labels = thinLabels(
          sorted.map(formatLabel)
        );
        const values = sorted.map((d) =>
          convertFromLbs(weightByDate.get(d)!, weightUnit)
        );
        setWeightLabels(labels);
        setWeightValues(values);
      }

      if (foundEdge) {
        const sorted = Array.from(edgeByDate.keys()).sort();
        const labels = thinLabels(
          sorted.map(formatLabel)
        );
        const values = sorted.map((d) => edgeByDate.get(d)!);
        setEdgeLabels(labels);
        setEdgeValues(values);
      }

      // Default to whichever metric has data
      if (!foundWeight && foundEdge) setMetric("edge");
      else setMetric("weight");

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, presetName, weightUnit]);

  const screenWidth = Dimensions.get("window").width;

  const labels = metric === "weight" ? weightLabels : edgeLabels;
  const values = metric === "weight" ? weightValues : edgeValues;
  const suffix = metric === "weight" ? ` ${weightUnit}` : " mm";
  const hasData = metric === "weight" ? hasWeight : hasEdge;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{presetName}</Text>
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
            ) : !hasWeight && !hasEdge ? (
              <Text style={styles.emptyText}>
                Not enough data to show a graph.{"\n"}Log this preset on at
                least 2 different dates with weight or edge data.
              </Text>
            ) : (
              <>
                {hasWeight && hasEdge && (
                  <View style={styles.toggleRow}>
                    <Pressable
                      style={[
                        styles.toggleOption,
                        metric === "weight" && styles.toggleActive,
                      ]}
                      onPress={() => setMetric("weight")}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          metric === "weight" && styles.toggleTextActive,
                        ]}
                      >
                        Weight
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.toggleOption,
                        metric === "edge" && styles.toggleActive,
                      ]}
                      onPress={() => setMetric("edge")}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          metric === "edge" && styles.toggleTextActive,
                        ]}
                      >
                        Edge
                      </Text>
                    </Pressable>
                  </View>
                )}

                {hasData ? (
                  <LineChart
                    data={{
                      labels,
                      datasets: [{ data: values }],
                    }}
                    width={screenWidth - 40}
                    height={220}
                    yAxisSuffix={suffix}
                    chartConfig={{
                      backgroundColor: "#1C1C1E",
                      backgroundGradientFrom: "#1C1C1E",
                      backgroundGradientTo: "#1C1C1E",
                      decimalPlaces: 0,
                      color: () => "#FF6B35",
                      labelColor: () => "#8E8E93",
                      propsForDots: {
                        r: "4",
                        strokeWidth: "2",
                        stroke: "#FF6B35",
                      },
                      propsForBackgroundLines: {
                        stroke: "#2C2C2E",
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                ) : (
                  <Text style={styles.emptyText}>
                    Not enough {metric} data to show a graph.{"\n"}Log this
                    preset on at least 2 different dates.
                  </Text>
                )}
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
    padding: 20,
    minHeight: 300,
  },
  centered: {
    marginTop: 80,
  },
  emptyText: {
    color: "#8E8E93",
    fontSize: 15,
    textAlign: "center",
    marginTop: 60,
    lineHeight: 22,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#FF6B35",
  },
  toggleText: {
    color: "#8E8E93",
    fontSize: 15,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  chart: {
    borderRadius: 12,
  },
});
