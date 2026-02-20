import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTimerStore, TimerPhase } from "../store/useTimerStore";
import { usePreferencesStore, formatWeight, convertToLbs, convertFromLbs } from "../store/usePreferencesStore";
import { savePreset, addHangboarding } from "../db/database";
import TimerPresetPicker from "./TimerPresetPicker";
import { TimerPreset } from "../types";

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function phaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case "work":
      return "HANG";
    case "repRest":
      return "REP REST";
    case "setRest":
      return "SET REST";
    default:
      return "";
  }
}

function phaseColor(phase: TimerPhase): string {
  switch (phase) {
    case "work":
      return "#FF6B35";
    case "repRest":
      return "#30D158";
    case "setRest":
      return "#0A84FF";
    default:
      return "#FF6B35";
  }
}

// --- Config Mode ---

function Checkbox({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable style={styles.checkboxRow} onPress={onToggle}>
      <Ionicons
        name={checked ? "checkbox" : "square-outline"}
        size={22}
        color={checked ? "#FF6B35" : "#636366"}
      />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

function ConfigMode() {
  const { config, setConfig, presetName, setPresetName, start } = useTimerStore();
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [weightEnabled, setWeightEnabled] = useState(config.weightLbs !== null);
  const [edgeEnabled, setEdgeEnabled] = useState(config.edgeMm !== null);
  const [displayWeight, setDisplayWeight] = useState(
    config.weightLbs !== null ? convertFromLbs(config.weightLbs, weightUnit) : 0
  );

  const handleLoadPreset = (preset: TimerPreset) => {
    useTimerStore.getState().loadPreset(preset.name, {
      sets: preset.sets,
      reps: preset.reps,
      workTime: preset.work_time,
      repRest: preset.rep_rest,
      setRest: preset.set_rest,
      weightLbs: preset.weight_lbs,
      edgeMm: preset.edge_mm,
    });
    setWeightEnabled(preset.weight_lbs !== null);
    setEdgeEnabled(preset.edge_mm !== null);
    setDisplayWeight(
      preset.weight_lbs !== null ? convertFromLbs(preset.weight_lbs, weightUnit) : 0
    );
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      Alert.alert("Name required", "Enter a preset name before saving.");
      return;
    }
    const weightLbs = weightEnabled ? convertToLbs(displayWeight, weightUnit) : null;
    savePreset({
      name: presetName.trim(),
      sets: config.sets,
      reps: config.reps,
      work_time: config.workTime,
      rep_rest: config.repRest,
      set_rest: config.setRest,
      weight_lbs: weightLbs,
      edge_mm: edgeEnabled ? config.edgeMm : null,
    });
    Alert.alert("Saved", `"${presetName.trim()}" saved.`);
  };

  const handleStart = () => {
    if (config.sets < 1 || config.reps < 1 || config.workTime < 1) {
      Alert.alert("Invalid config", "Sets, reps, and work time must be at least 1.");
      return;
    }
    const weightLbs = weightEnabled ? convertToLbs(displayWeight, weightUnit) : null;
    setConfig({
      weightLbs,
      edgeMm: edgeEnabled ? (config.edgeMm ?? 0) : null,
    });
    start();
  };

  const toggleWeight = () => {
    const next = !weightEnabled;
    setWeightEnabled(next);
    if (!next) {
      setConfig({ weightLbs: null });
    } else {
      setConfig({ weightLbs: convertToLbs(displayWeight, weightUnit) });
    }
  };

  const toggleEdge = () => {
    const next = !edgeEnabled;
    setEdgeEnabled(next);
    setConfig({ edgeMm: next ? (config.edgeMm ?? 0) : null });
  };

  const handleWeightChange = (v: number) => {
    setDisplayWeight(v);
    setConfig({ weightLbs: convertToLbs(v, weightUnit) });
  };

  return (
    <ScrollView contentContainerStyle={styles.configContainer}>
      <View style={styles.presetRow}>
        <TextInput
          style={[styles.input, styles.presetNameInput]}
          value={presetName}
          onChangeText={setPresetName}
          placeholder="Preset name"
          placeholderTextColor="#636366"
        />
        <Pressable style={styles.smallButton} onPress={handleSavePreset}>
          <Text style={styles.smallButtonText}>Save</Text>
        </Pressable>
        <Pressable
          style={[styles.smallButton, styles.secondaryButton]}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.smallButtonText}>Load</Text>
        </Pressable>
      </View>

      <NumberField
        label="Sets"
        value={config.sets}
        onChange={(v) => setConfig({ sets: v })}
      />
      <NumberField
        label="Reps per set"
        value={config.reps}
        onChange={(v) => setConfig({ reps: v })}
      />
      <NumberField
        label="Hang time (sec)"
        value={config.workTime}
        onChange={(v) => setConfig({ workTime: v })}
      />
      <NumberField
        label="Rep rest (sec)"
        value={config.repRest}
        onChange={(v) => setConfig({ repRest: v })}
      />
      <NumberField
        label="Set rest (sec)"
        value={config.setRest}
        onChange={(v) => setConfig({ setRest: v })}
      />

      <View style={styles.optionalSection}>
        <Checkbox checked={weightEnabled} onToggle={toggleWeight} label={`Add weight (${weightUnit})`} />
        {weightEnabled && (
          <NumberField
            label={`Weight (${weightUnit})`}
            value={displayWeight}
            onChange={handleWeightChange}
          />
        )}

        <Checkbox checked={edgeEnabled} onToggle={toggleEdge} label="Add edge size (mm)" />
        {edgeEnabled && (
          <NumberField
            label="Edge (mm)"
            value={config.edgeMm ?? 0}
            onChange={(v) => setConfig({ edgeMm: v })}
          />
        )}
      </View>

      <Pressable style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Begin</Text>
      </Pressable>

      <TimerPresetPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleLoadPreset}
      />
    </ScrollView>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable
          style={styles.stepperButton}
          onPress={() => onChange(Math.max(0, value - 1))}
        >
          <Text style={styles.stepperText}>-</Text>
        </Pressable>
        <TextInput
          style={styles.stepperInput}
          value={String(value)}
          onChangeText={(t) => onChange(parseInt(t, 10) || 0)}
          keyboardType="number-pad"
        />
        <Pressable
          style={styles.stepperButton}
          onPress={() => onChange(value + 1)}
        >
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- Running Mode ---

function RunningMode() {
  const {
    phase,
    currentSet,
    currentRep,
    secondsRemaining,
    isRunning,
    totalElapsed,
    config,
    pause,
    resume,
    reset,
    tick,
    skip,
  } = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const waitingToBegin = !isRunning && totalElapsed === 0;
  const color = phaseColor(phase);

  return (
    <View style={styles.runningContainer}>
      <Text style={[styles.phaseLabel, { color }]}>
        {waitingToBegin ? "READY" : phaseLabel(phase)}
      </Text>

      <View style={[styles.timerCircle, { borderColor: color }]}>
        <Text style={[styles.timerText, { color }]}>
          {formatTime(secondsRemaining)}
        </Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>
            {currentSet}/{config.sets}
          </Text>
          <Text style={styles.progressLabel}>Set</Text>
        </View>
        <View style={styles.progressDivider} />
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>
            {currentRep}/{config.reps}
          </Text>
          <Text style={styles.progressLabel}>Rep</Text>
        </View>
      </View>

      {waitingToBegin ? (
        <View style={styles.controlRow}>
          <Pressable style={styles.controlButton} onPress={reset}>
            <Text style={styles.controlText}>Back</Text>
          </Pressable>
          <Pressable
            style={[styles.controlButton, styles.primaryButton]}
            onPress={resume}
          >
            <Text style={styles.controlText}>Start</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.controlRow}>
          <Pressable style={styles.controlButton} onPress={reset}>
            <Text style={styles.controlText}>Reset</Text>
          </Pressable>
          <Pressable
            style={[styles.controlButton, styles.primaryButton]}
            onPress={isRunning ? pause : resume}
          >
            <Text style={styles.controlText}>
              {isRunning ? "Pause" : "Resume"}
            </Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={skip}>
            <Text style={styles.controlText}>Skip</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// --- Completed Mode ---

function CompletedMode() {
  const { config, presetName, totalElapsed, reset } = useTimerStore();
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const loggedRef = useRef(false);

  useEffect(() => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    addHangboarding({
      preset_name: presetName || "Custom",
      sets: config.sets,
      reps: config.reps,
      work_time: config.workTime,
      rep_rest: config.repRest,
      set_rest: config.setRest,
      weight_lbs: config.weightLbs,
      edge_mm: config.edgeMm,
      duration_seconds: totalElapsed,
    });
  }, []);

  return (
    <View style={styles.completedContainer}>
      <Text style={styles.completedTitle}>Workout Complete!</Text>
      <Text style={styles.completedStat}>
        {config.sets} sets x {config.reps} reps
      </Text>
      {config.weightLbs !== null && (
        <Text style={styles.completedStat}>Weight: {formatWeight(config.weightLbs, weightUnit)}</Text>
      )}
      {config.edgeMm !== null && (
        <Text style={styles.completedStat}>Edge: {config.edgeMm} mm</Text>
      )}
      <Text style={styles.completedStat}>
        Total time: {formatTime(totalElapsed)}
      </Text>
      <Text style={styles.completedNote}>Logged to history.</Text>
      <Pressable style={styles.startButton} onPress={reset}>
        <Text style={styles.startButtonText}>Done</Text>
      </Pressable>
    </View>
  );
}

// --- Main ---

export default function TimerDisplay() {
  const phase = useTimerStore((s) => s.phase);

  if (phase === "idle") return <ConfigMode />;
  if (phase === "completed") return <CompletedMode />;
  return <RunningMode />;
}

// --- Styles ---

const styles = StyleSheet.create({
  // Config
  configContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  presetNameInput: {
    flex: 1,
  },
  input: {
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  smallButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "#2C2C2E",
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  fieldLabel: {
    color: "#AEAEB2",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepperButton: {
    backgroundColor: "#2C2C2E",
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  stepperInput: {
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
    borderRadius: 10,
    width: 60,
    height: 40,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  optionalSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
    paddingTop: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  checkboxLabel: {
    color: "#AEAEB2",
    fontSize: 15,
    fontWeight: "600",
  },
  startButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  // Running
  runningContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 20,
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  timerText: {
    fontSize: 52,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  progressItem: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  progressValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  progressLabel: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    textTransform: "uppercase",
  },
  progressDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#3A3A3C",
  },
  controlRow: {
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
  },
  primaryButton: {
    backgroundColor: "#FF6B35",
  },
  controlText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Completed
  completedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  completedTitle: {
    color: "#30D158",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
  },
  completedStat: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 8,
  },
  completedNote: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
});
