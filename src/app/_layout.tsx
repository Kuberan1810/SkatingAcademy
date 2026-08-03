import '@/global.css';
import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Urbanist_400Regular, Urbanist_500Medium, Urbanist_600SemiBold, Urbanist_700Bold } from '@expo-google-fonts/urbanist';
import AppTabs from '@/components/app-tabs';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}
