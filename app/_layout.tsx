import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../src/hooks/useTheme';
import { useAppStore } from '../src/store/useAppStore';
import { Onboarding } from '../src/components/Onboarding';

export default function RootLayout() {
  const theme = useTheme();
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style={theme.background === '#1a1a1a' ? 'light' : 'dark'} />
      {!hasSeenOnboarding && <Onboarding />}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
