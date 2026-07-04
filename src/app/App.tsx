import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, type Theme } from '@react-navigation/native';
import { colors } from '@ds';
import { useMeterStore } from '@core/state';
import { WatchUserData } from '@core/domain/usecases/watchUserData';
import { WatchAuth } from '@features/auth/domain/usecases/watchAuth';
import { useAuthStore } from '@features/auth/presentation/state/authStore';
import { configureContainer, container } from '@app/di/container';
import { RootNavigator } from '@app/navigation/RootNavigator';

// Native splash stays up until DI is configured and the first auth state resolves.
SplashScreen.preventAutoHideAsync().catch(() => {});

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.panel,
    border: colors.hairline,
    primary: colors.accent,
    text: colors.text,
  },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let authUnsub: () => void = () => {};
    let dataUnsub: () => void = () => {};
    let revealed = false;

    // Reveal the app exactly once, no matter which path gets us there — so the
    // splash can never stay stuck (bootstrap error, slow auth, etc.).
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    };

    (async () => {
      try {
        await configureContainer();
        const watchAuth = container.resolve(WatchAuth);
        const watchData = container.resolve(WatchUserData);

        authUnsub = watchAuth.execute((user) => {
          useAuthStore.getState().setUser(user);
          dataUnsub();
          if (user) {
            dataUnsub = watchData.execute((d) => useMeterStore.getState().setUserData(d));
          } else {
            useMeterStore.getState().setUserData(null);
            dataUnsub = () => {};
          }
          reveal();
        });
      } catch (e) {
        console.warn('[bootstrap] failed:', e instanceof Error ? e.message : e);
        reveal(); // show the app (Login) rather than hang on the splash
      }
    })();

    // Safety net: never sit on the splash longer than 8s.
    const timer = setTimeout(reveal, 8000);

    return () => {
      clearTimeout(timer);
      dataUnsub();
      authUnsub();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {ready ? (
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      ) : (
        <View style={styles.splash}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
