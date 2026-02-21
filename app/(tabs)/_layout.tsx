import { useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePreferencesStore } from "../../store/usePreferencesStore";

function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { weightUnit, setWeightUnit } = usePreferencesStore();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Settings</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#AEAEB2" />
            </Pressable>
          </View>

          <Text style={modalStyles.sectionLabel}>Weight Unit</Text>
          <View style={modalStyles.toggleRow}>
            <Pressable
              style={[
                modalStyles.toggleOption,
                weightUnit === "lbs" && modalStyles.toggleActive,
              ]}
              onPress={() => setWeightUnit("lbs")}
            >
              <Text
                style={[
                  modalStyles.toggleText,
                  weightUnit === "lbs" && modalStyles.toggleTextActive,
                ]}
              >
                lbs
              </Text>
            </Pressable>
            <Pressable
              style={[
                modalStyles.toggleOption,
                weightUnit === "kg" && modalStyles.toggleActive,
              ]}
              onPress={() => setWeightUnit("kg")}
            >
              <Text
                style={[
                  modalStyles.toggleText,
                  weightUnit === "kg" && modalStyles.toggleTextActive,
                ]}
              >
                kg
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function TabLayout() {
  const [settingsVisible, setSettingsVisible] = useState(false);

  const headerRight = () => (
    <Pressable
      onPress={() => setSettingsVisible(true)}
      hitSlop={8}
      style={{ marginRight: 16 }}
    >
      <Ionicons name="settings-outline" size={22} color="#AEAEB2" />
    </Pressable>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FF6B35",
          tabBarInactiveTintColor: "#8E8E93",
          tabBarStyle: {
            backgroundColor: "#1C1C1E",
            borderTopColor: "#2C2C2E",
          },
          headerStyle: {
            backgroundColor: "#1C1C1E",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerRight,
        }}
      >
        <Tabs.Screen
          name="videos"
          options={{
            title: "Videos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="videocam-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Hangboarding",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="timer-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="log"
          options={{
            title: "Log Exercise",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="workouts"
          options={{
            title: "Workouts",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="clipboard-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </>
  );
}

const modalStyles = StyleSheet.create({
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
  sectionLabel: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    overflow: "hidden",
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#FF6B35",
  },
  toggleText: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
});
