import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NavigationContainer, DarkTheme, type Theme } from '@react-navigation/native';
import { colors, AnimatedSplash } from '@ds';
import { useMeterStore } from '@core/state';
import { WatchUserData } from '@core/domain/usecases/watchUserData';
import { WatchAuth } from '@features/auth/domain/usecases/watchAuth';
import { useAuthStore } from '@features/auth/presentation/state/authStore';
import { configureContainer, container } from '@app/di/container';
import { RootNavigator } from '@app/navigation/RootNavigator';

// Keep the OS splash up only until React mounts, then hand off to <AnimatedSplash />.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Minimum time the animated splash stays on screen — long enough for the
// wave to trace + wordmark to fade in even when bootstrap is instant.
const MIN_SPLASH_MS = 2400;

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
    let revealTimer: ReturnType<typeof setTimeout> | null = null;
    let watchData: WatchUserData | null = null;
    let revealed = false;
    const mountedAt = Date.now();

    // Hand off from the OS splash immediately so <AnimatedSplash /> actually
    // renders instead of being masked underneath the native image.
    SplashScreen.hideAsync().catch(() => {});

    // Reveal the app exactly once, no matter which path gets us there — so the
    // splash can never stay stuck (bootstrap error, slow auth, etc.). Holds
    // for MIN_SPLASH_MS so the intro animation always plays through.
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      const elapsed = Date.now() - mountedAt;
      const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
      revealTimer = setTimeout(() => setReady(true), wait);
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
      if (revealTimer) clearTimeout(revealTimer);
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
          <AnimatedSplash />
        )}
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
