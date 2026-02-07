import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPresets, deletePreset } from "../db/database";
import { TimerPreset } from "../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (preset: TimerPreset) => void;
}

export default function TimerPresetPicker({ visible, onClose, onSelect }: Props) {
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadPresets();
    }
  }, [visible]);

  const loadPresets = async () => {
    setLoading(true);
    const data = await getPresets();
    setPresets(data);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    await deletePreset(id);
    loadPresets();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Saved Presets</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#AEAEB2" />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color="#FF6B35" style={styles.loader} />
          ) : presets.length === 0 ? (
            <Text style={styles.emptyText}>No saved presets yet.</Text>
          ) : (
            <FlatList
              data={presets}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.presetRow}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <View style={styles.presetInfo}>
                    <Text style={styles.presetName}>{item.name}</Text>
                    <Text style={styles.presetDetail}>
                      {item.sets}s x {item.reps}r | {item.work_time}s work | {item.rep_rest}s rep rest | {item.set_rest}s set rest
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleDelete(item.id)}
                    hitSlop={8}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF453A" />
                  </Pressable>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
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
    maxHeight: "60%",
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
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    color: "#636366",
    fontSize: 15,
    textAlign: "center",
    marginTop: 40,
  },
  presetRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  presetDetail: {
    color: "#8E8E93",
    fontSize: 13,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
});
