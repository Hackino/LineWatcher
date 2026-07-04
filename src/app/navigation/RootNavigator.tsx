import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { AppTabs } from './AppTabs';
import { colors } from '@ds';
import { useAuthStore } from '@features/auth/presentation/state/authStore';
import { LoginScreen } from '@features/auth/presentation/screens/LoginScreen';
import { AddReadingScreen } from '@features/readings/presentation/screens/AddReadingScreen';
import { ReadingDetailScreen } from '@features/readings/presentation/screens/ReadingDetailScreen';
import { MonthlyRatesScreen } from '@features/settings/presentation/screens/MonthlyRatesScreen';
import { AlertsScreen } from '@features/settings/presentation/screens/AlertsScreen';
import { LocationsScreen } from '@features/locations/presentation/screens/LocationsScreen';
import { SourceEditorScreen } from '@features/locations/presentation/screens/SourceEditorScreen';
import { SourcePickerScreen } from '@features/locations/presentation/screens/SourcePickerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Single stack; the screens shown depend on auth state. */
export function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={AppTabs} />
          <Stack.Screen
            name="AddReading"
            component={AddReadingScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="ReadingDetail" component={ReadingDetailScreen} />
          <Stack.Screen name="MonthlyRates" component={MonthlyRatesScreen} />
          <Stack.Screen name="Alerts" component={AlertsScreen} />
          <Stack.Screen name="Locations" component={LocationsScreen} />
          <Stack.Screen name="SourceEditor" component={SourceEditorScreen} />
          <Stack.Screen
            name="SourcePicker"
            component={SourcePickerScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
