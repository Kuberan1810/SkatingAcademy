import '@/global.css';
import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme, Text, TextInput } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Urbanist_400Regular, Urbanist_500Medium, Urbanist_600SemiBold, Urbanist_700Bold } from '@expo-google-fonts/urbanist';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppTabs from '@/components/app-tabs';
import React from 'react';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Disable Reanimated strict mode warning for shared values during render
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Set global default font family for React Native Text and TextInput components
if ((Text as any).defaultProps) {
  (Text as any).defaultProps.style = [{ fontFamily: 'Urbanist_400Regular' }, (Text as any).defaultProps.style];
} else {
  (Text as any).defaultProps = { style: { fontFamily: 'Urbanist_400Regular' } };
}

if ((TextInput as any).defaultProps) {
  (TextInput as any).defaultProps.style = [{ fontFamily: 'Urbanist_400Regular' }, (TextInput as any).defaultProps.style];
} else {
  (TextInput as any).defaultProps = { style: { fontFamily: 'Urbanist_400Regular' } };
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DefaultTheme}>
        <AppTabs />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
