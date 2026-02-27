// ─── ShadowDrive AI — Mobile App Entry ───
// Expo Router layout wrapper.

import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#030712" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#030712' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#030712' },
        }}
      />
    </>
  );
}
