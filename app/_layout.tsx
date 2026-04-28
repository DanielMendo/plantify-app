import NoInternet from "@/components/no-internet";
import { useNetwork } from "@/hooks/use-network";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import "react-native-reanimated";

export default function RootLayout() {
  const { isConnected, retry } = useNetwork();
  const router = useRouter();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (isConnected === null) return;

    if (!isConnected) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      router.replace("/(tabs)/home");
    }
  }, [isConnected]);

  if (isConnected === false) {
    return <NoInternet onRetry={retry} />;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="scanning" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ headerShown: false }} />
        <Stack.Screen name="detection" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
