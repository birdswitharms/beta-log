import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { create } from "zustand";

interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

interface AlertConfig {
  title: string;
  message: string;
  buttons?: AlertButton[];
}

interface AlertState {
  visible: boolean;
  config: AlertConfig | null;
  show: (config: AlertConfig) => void;
  hide: () => void;
}

const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  config: null,
  show: (config) => set({ visible: true, config }),
  hide: () => set({ visible: false, config: null }),
}));

export function showAlert(config: AlertConfig) {
  useAlertStore.getState().show(config);
}

export default function CustomAlert() {
  const { visible, config, hide } = useAlertStore();

  if (!config) return null;

  const buttons = config.buttons ?? [{ text: "OK", style: "default" as const }];

  const handlePress = (button: AlertButton) => {
    hide();
    button.onPress?.();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{config.title}</Text>
          </View>

          <Text style={styles.message}>{config.message}</Text>

          <View style={styles.buttonRow}>
            {buttons.map((button, i) => (
              <Pressable
                key={i}
                style={[
                  styles.button,
                  button.style === "cancel" && styles.buttonCancel,
                  button.style === "destructive" && styles.buttonDestructive,
                  button.style === "default" && styles.buttonDefault,
                  (!button.style || button.style === "default") &&
                    buttons.length === 1 &&
                    styles.buttonDefault,
                ]}
                onPress={() => handlePress(button)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "cancel" && styles.buttonTextCancel,
                  ]}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
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
  message: {
    color: "#AEAEB2",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDefault: {
    backgroundColor: "#FF6B35",
  },
  buttonCancel: {
    backgroundColor: "#2C2C2E",
  },
  buttonDestructive: {
    backgroundColor: "#FF453A",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextCancel: {
    color: "#AEAEB2",
  },
});
