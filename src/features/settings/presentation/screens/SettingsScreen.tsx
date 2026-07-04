import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Screen,
  AppText,
  Card,
  ConfirmDialog,
  ErrorState,
  PrimaryButton,
  SettingsSkeleton,
  colors,
  radius,
  spacing,
} from '@ds';
import { container } from 'tsyringe';
import { useUserData, useDataError, useDataRetry } from '@core/state';
import { useAuthStore } from '@features/auth/presentation/state/authStore';
import type { RootStackParamList } from '@app/navigation/types';
import { UpdateProfile } from '../../domain/usecases/updateProfile';
import { ProfileCard } from '../components/ProfileCard';
import { EditNameDialog } from '../components/EditNameDialog';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const data = useUserData();
  const error = useDataError();
  const retry = useDataRetry();
  const signOut = useAuthStore((s) => s.signOut);

  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [editingName, setEditingName] = useState(false);

  if (error && !data) {
    return (
      <Screen title="Settings" eyebrow="Configuration">
        <ErrorState message={error} onRetry={retry ?? undefined} />
      </Screen>
    );
  }

  if (!data) return <SettingsSkeleton />;

  const locationCount = Object.keys(data.locations).length;
  const sourceCount = Object.keys(data.sources).length;
  const thresholdPct = Math.round(data.settings.leakThresholdPct * 100);

  return (
    <Screen title="Settings" eyebrow="Configuration">
      <ProfileCard profile={data.profile} onEditName={() => setEditingName(true)} />

      <Pressable
        onPress={() => navigation.navigate('Locations')}
        accessibilityRole="button"
        accessibilityLabel="Manage locations and sources"
      >
        {({ pressed }) => (
          <Card style={[styles.navCard, pressed && styles.pressed]}>
            <View style={styles.navLeft}>
              <AppText variant="caption" color={colors.accent} uppercase>
                Metering
              </AppText>
              <AppText variant="title" color={colors.text}>
                Locations & sources
              </AppText>
              <AppText variant="label" color={colors.textFaint}>
                {locationCount} location{locationCount === 1 ? '' : 's'} ·{' '}
                {sourceCount} source{sourceCount === 1 ? '' : 's'} · rates &
                meters live here
              </AppText>
            </View>
            <View style={styles.chevron}>
              <Svg width={12} height={14} viewBox="0 0 12 14">
                <Path
                  d="M3 1 L9 7 L3 13"
                  stroke={colors.textMuted}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </View>
          </Card>
        )}
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('Alerts')}
        accessibilityRole="button"
        accessibilityLabel="Alerts"
      >
        {({ pressed }) => (
          <Card style={[styles.navCard, pressed && styles.pressed]}>
            <View style={styles.navLeft}>
              <AppText variant="caption" color={colors.accent} uppercase>
                Configuration
              </AppText>
              <AppText variant="title" color={colors.text}>
                Alerts
              </AppText>
              <AppText variant="label" color={colors.textFaint}>
                Leak tolerance {thresholdPct}% · currency {data.profile.currency}
              </AppText>
            </View>
            <View style={styles.chevron}>
              <Svg width={12} height={14} viewBox="0 0 12 14">
                <Path
                  d="M3 1 L9 7 L3 13"
                  stroke={colors.textMuted}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </View>
          </Card>
        )}
      </Pressable>

      <View style={styles.spacer} />

      <PrimaryButton
        label="Sign out"
        variant="danger"
        onPress={() => setConfirmSignOut(true)}
      />

      <EditNameDialog
        visible={editingName}
        initialValue={data.profile.displayName ?? ''}
        onCancel={() => setEditingName(false)}
        onSave={async (displayName) => {
          await container.resolve(UpdateProfile).execute({ displayName });
          setEditingName(false);
        }}
      />

      <ConfirmDialog
        visible={confirmSignOut}
        eyebrow="Session"
        title="Sign out of LineWatch?"
        message="You'll need to sign back in to keep tracking your meters. Your readings stay saved."
        confirmLabel="Sign out"
        cancelLabel="Stay"
        tone="danger"
        onConfirm={() => {
          setConfirmSignOut(false);
          signOut();
        }}
        onCancel={() => setConfirmSignOut(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: { flex: 1 },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  navLeft: { flex: 1, gap: 2 },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
