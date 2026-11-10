import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AtlasProvider } from '../state/store';
import { colors as c } from '../theme';

export default function RootLayout() {
  return <SafeAreaProvider><View style={{ flex: 1, backgroundColor: '#E1EAE2' }}><View style={{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: c.background }}><AtlasProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }}><Stack.Screen name="(tabs)" /><Stack.Screen name="breed/[id]" /><Stack.Screen name="match" /><Stack.Screen name="share/[id]" /><Stack.Screen name="feedback" /><Stack.Screen name="styles" /><Stack.Screen name="about" options={{ presentation: 'modal' }} /></Stack></AtlasProvider></View></View></SafeAreaProvider>;
}
