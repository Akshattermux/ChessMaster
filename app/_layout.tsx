import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Custom dark chess theme
const ChessDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0D1117',
    card: '#161B22',
    text: '#E8DCC8',
    border: '#2D2416',
    primary: '#D4A853',
    notification: '#E74C3C',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={ChessDarkTheme}>
      <Stack screenOptions={{ headerShown: false, headerBackButtonDisplayMode: 'minimal' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="game/index"
          options={{
            headerShown: true,
            title: '2 Player',
            headerStyle: { backgroundColor: '#161B22' },
            headerTintColor: '#D4A853',
            headerTitleStyle: { fontWeight: '700', color: '#D4A853' },
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="game/ai"
          options={{
            headerShown: true,
            title: 'vs AI',
            headerStyle: { backgroundColor: '#161B22' },
            headerTintColor: '#D4A853',
            headerTitleStyle: { fontWeight: '700', color: '#D4A853' },
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="game/analysis"
          options={{
            headerShown: true,
            title: 'Analysis',
            headerStyle: { backgroundColor: '#161B22' },
            headerTintColor: '#D4A853',
            headerTitleStyle: { fontWeight: '700', color: '#D4A853' },
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="game/puzzle/[id]"
          options={{
            headerShown: true,
            title: 'Puzzle',
            headerStyle: { backgroundColor: '#161B22' },
            headerTintColor: '#D4A853',
            headerTitleStyle: { fontWeight: '700', color: '#D4A853' },
            presentation: 'card',
          }}
        />
      </Stack>
      <StatusBar style="light" backgroundColor="#0D1117" />
    </ThemeProvider>
  );
}
