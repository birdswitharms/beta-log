import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { usePreferencesStore } from "../store/usePreferencesStore";
import WelcomeScreen from "../components/WelcomeScreen";
import CustomAlert from "../components/CustomAlert";
import ErrorBoundary from "../components/ErrorBoundary";

export default function RootLayout() {
  const { loaded, onboardingComplete, load } = usePreferencesStore();

  useEffect(() => {
    load();
  }, []);

  if (!loaded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.loading}>
          <ActivityIndicator color="#FF6B35" size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!onboardingComplete) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <WelcomeScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="workout/[id]"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: "#1C1C1E" },
              headerTintColor: "#FFFFFF",
              headerTitleStyle: { fontWeight: "bold" },
              title: "Workout",
            }}
          />
          <Stack.Screen
            name="camera"
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
            }}
          />
        </Stack>
        <CustomAlert />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
  },
});
