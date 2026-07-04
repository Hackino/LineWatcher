import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
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
    let dataTimer: ReturnType<typeof setTimeout> | null = null;
    let watchData: WatchUserData | null = null;
    let revealed = false;

    // Reveal the app exactly once, no matter which path gets us there — so the
    // splash can never stay stuck (bootstrap error, slow auth, etc.).
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    };

    const clearDataTimer = () => {
      if (dataTimer) {
        clearTimeout(dataTimer);
        dataTimer = null;
      }
    };

    // (Re)open the realtime data subscription for the currently authed user.
    // Wired up here so `retry` in the meter store can call it after a failure
    // without needing the whole app to remount.
    const startDataWatch = () => {
      if (!watchData) return;
      dataUnsub();
      clearDataTimer();
      useMeterStore.getState().setError(null);
      dataUnsub = watchData.execute(
        (d) => {
          clearDataTimer();
          useMeterStore.getState().setUserData(d);
        },
        (err) => {
          clearDataTimer();
          useMeterStore.getState().setError(
            err.message || 'Failed to load your data.',
          );
        },
      );
      // Firebase RTDB does not surface transport errors while offline; it just
      // never fires. So we install a hard deadline: if no snapshot arrives in
      // 12s we flip the store into the error state so the retry CTA renders.
      dataTimer = setTimeout(() => {
        const state = useMeterStore.getState();
        if (!state.userData) {
          state.setError('No connection. Check your internet and try again.');
        }
      }, 12000);
    };

    (async () => {
      try {
        await configureContainer();
        const watchAuth = container.resolve(WatchAuth);
        watchData = container.resolve(WatchUserData);
        useMeterStore.getState().setRetry(startDataWatch);

        authUnsub = watchAuth.execute((user) => {
          useAuthStore.getState().setUser(user);
          dataUnsub();
          clearDataTimer();
          if (user) {
            startDataWatch();
          } else {
            useMeterStore.getState().setUserData(null);
            useMeterStore.getState().setError(null);
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
      clearDataTimer();
      dataUnsub();
      authUnsub();
      useMeterStore.getState().setRetry(null);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
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
      </KeyboardProvider>
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
