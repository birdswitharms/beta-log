import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTimerStore } from "../store/useTimerStore";

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function TimerDisplay() {
  const {
    elapsedSeconds,
    isRunning,
    mode,
    countdownFrom,
    start,
    pause,
    reset,
    tick,
    setMode,
    setCountdownFrom,
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

  const displayTime =
    mode === "countdown"
      ? Math.max(0, countdownFrom - elapsedSeconds)
      : elapsedSeconds;

  const isFinished = mode === "countdown" && elapsedSeconds >= countdownFrom;

  const countdownOptions = [30, 60, 90, 120, 180, 300];

  return (
    <View style={styles.container}>
      {/* Mode toggle */}
      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeButton, mode === "stopwatch" && styles.modeActive]}
          onPress={() => setMode("stopwatch")}
        >
          <Text
            style={[styles.modeText, mode === "stopwatch" && styles.modeTextActive]}
          >
            Stopwatch
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === "countdown" && styles.modeActive]}
          onPress={() => setMode("countdown")}
        >
          <Text
            style={[styles.modeText, mode === "countdown" && styles.modeTextActive]}
          >
            Countdown
          </Text>
        </Pressable>
      </View>

      {/* Countdown presets */}
      {mode === "countdown" && (
        <View style={styles.presetRow}>
          {countdownOptions.map((s) => (
            <Pressable
              key={s}
              style={[styles.presetButton, countdownFrom === s && styles.presetActive]}
              onPress={() => setCountdownFrom(s)}
            >
              <Text
                style={[
                  styles.presetText,
                  countdownFrom === s && styles.presetTextActive,
                ]}
              >
                {s >= 60 ? `${s / 60}m` : `${s}s`}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Timer display */}
      <View style={[styles.timerCircle, isFinished && styles.timerFinished]}>
        <Text style={[styles.timerText, isFinished && styles.timerTextFinished]}>
          {formatTime(displayTime)}
        </Text>
        {isFinished && <Text style={styles.doneText}>Done!</Text>}
      </View>

      {/* Controls */}
      <View style={styles.controlRow}>
        <Pressable style={styles.controlButton} onPress={reset}>
          <Text style={styles.controlText}>Reset</Text>
        </Pressable>
        <Pressable
          style={[styles.controlButton, styles.primaryButton]}
          onPress={isRunning ? pause : start}
        >
          <Text style={[styles.controlText, styles.primaryText]}>
            {isRunning ? "Pause" : "Start"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
  },
  modeRow: {
    flexDirection: "row",
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeActive: {
    backgroundColor: "#FF6B35",
  },
  modeText: {
    color: "#8E8E93",
    fontSize: 15,
    fontWeight: "600",
  },
  modeTextActive: {
    color: "#FFFFFF",
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  presetButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#2C2C2E",
  },
  presetActive: {
    backgroundColor: "#FF6B35",
  },
  presetText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "500",
  },
  presetTextActive: {
    color: "#FFFFFF",
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  timerFinished: {
    borderColor: "#30D158",
  },
  timerText: {
    fontSize: 52,
    fontWeight: "300",
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
  },
  timerTextFinished: {
    color: "#30D158",
  },
  doneText: {
    fontSize: 16,
    color: "#30D158",
    fontWeight: "600",
    marginTop: 4,
  },
  controlRow: {
    flexDirection: "row",
    gap: 16,
  },
  controlButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
  },
  primaryButton: {
    backgroundColor: "#FF6B35",
  },
  controlText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  primaryText: {
    color: "#FFFFFF",
  },
});
