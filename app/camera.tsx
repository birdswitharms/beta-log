import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { addVideo } from "../db/database";

type Phase = "permissions" | "countdown" | "recording" | "saving";

export default function CameraScreen() {
  const { countdown: countdownParam } = useLocalSearchParams<{ countdown: string }>();
  const countdownTotal = parseInt(countdownParam || "10", 10);

  const [phase, setPhase] = useState<Phase>("permissions");
  const [countdownValue, setCountdownValue] = useState(countdownTotal);
  const [elapsed, setElapsed] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const cam = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
      const mic = micPermission?.granted ? micPermission : await requestMicPermission();
      const media = mediaPermission?.granted ? mediaPermission : await requestMediaPermission();

      if (cam?.granted && mic?.granted && media?.granted) {
        setPhase("countdown");
      }
    })();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (phase !== "countdown") return;

    setCountdownValue(countdownTotal);
    const interval = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Elapsed time tracker during recording
  useEffect(() => {
    if (phase !== "recording") return;

    elapsedIntervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 500);

    return () => {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
    };
  }, [phase]);

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setPhase("recording");
    startTimeRef.current = Date.now();

    try {
      const result = await cameraRef.current.recordAsync();
      if (!result) return;

      // Recording stopped — now save
      setPhase("saving");
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      const asset = await MediaLibrary.createAssetAsync(result.uri);
      const filename = asset.filename || `climb_${Date.now()}.mp4`;

      await addVideo({
        uri: asset.uri,
        filename,
        duration_seconds: durationSeconds,
      });

      router.back();
    } catch {
      // If recording fails, go back
      router.back();
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  const formatElapsed = (s: number): string => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Permissions denied
  if (
    phase === "permissions" &&
    (cameraPermission?.granted === false ||
      micPermission?.granted === false ||
      mediaPermission?.granted === false)
  ) {
    const allChecked =
      cameraPermission !== null &&
      micPermission !== null &&
      mediaPermission !== null;

    if (allChecked) {
      return (
        <View style={styles.container}>
          <View style={styles.center}>
            <Text style={styles.permissionText}>
              Camera, microphone, and media library permissions are required to
              record videos.
            </Text>
            <Pressable style={styles.goBackButton} onPress={() => router.back()}>
              <Text style={styles.goBackText}>Go Back</Text>
            </Pressable>
          </View>
        </View>
      );
    }
  }

  // Still requesting permissions
  if (phase === "permissions") {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#FF6B35" size="large" />
          <Text style={styles.permissionText}>Requesting permissions...</Text>
        </View>
      </View>
    );
  }

  // Saving phase
  if (phase === "saving") {
    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" mode="video" />
        <View style={styles.savingOverlay}>
          <ActivityIndicator color="#FFFFFF" size="large" />
          <Text style={styles.savingText}>Saving video...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" mode="video">
        {/* Close button */}
        <Pressable style={styles.closeButton} onPress={() => {
          if (phase === "recording") {
            stopRecording();
          }
          router.back();
        }}>
          <Text style={styles.closeText}>X</Text>
        </Pressable>

        {/* Countdown overlay */}
        {phase === "countdown" && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownNumber}>{countdownValue}</Text>
          </View>
        )}

        {/* Recording indicator */}
        {phase === "recording" && (
          <View style={styles.recordingHeader}>
            <View style={styles.recordingDot} />
            <Text style={styles.elapsedText}>{formatElapsed(elapsed)}</Text>
          </View>
        )}

        {/* Bottom controls */}
        {phase === "recording" && (
          <View style={styles.bottomControls}>
            <Pressable style={styles.stopButton} onPress={stopRecording}>
              <View style={styles.stopSquare} />
            </Pressable>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    color: "#AEAEB2",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  goBackButton: {
    marginTop: 24,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  goBackText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  countdownNumber: {
    color: "#FF6B35",
    fontSize: 120,
    fontWeight: "800",
  },
  recordingHeader: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF453A",
  },
  elapsedText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  bottomControls: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
  },
  stopButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  stopSquare: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FF453A",
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  savingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
