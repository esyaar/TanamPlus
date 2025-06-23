import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Lexend1: require('../assets/fonts/Lexend-Thin.ttf'),
    Lexend2: require('../assets/fonts/Lexend-Light.ttf'),
    Lexend3: require('../assets/fonts/Lexend-Regular.ttf'),
    Lexend4: require('../assets/fonts/Lexend-Bold.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName='index'screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="Penyuluh" options={{ headerShown: false }} />
        <Stack.Screen name="Admin" options={{ headerShown: false }} />
        <Stack.Screen name="Kepala" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        <Stack.Screen name="(subtabs)" options={{ headerShown: false }}  />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
import 'react-native-reanimated';