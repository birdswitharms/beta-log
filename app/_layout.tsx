import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
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
      </Stack>
    </SafeAreaProvider>
  );
}
