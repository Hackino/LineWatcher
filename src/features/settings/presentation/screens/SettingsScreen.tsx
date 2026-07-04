import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { container } from 'tsyringe';
import {
  Screen,
  AppText,
  Card,
  Field,
  PrimaryButton,
  SectionHeader,
  SettingsSkeleton,
  colors,
  radius,
  spacing,
} from '@ds';
import { useUserData } from '@core/state';
import { useAuthStore } from '@features/auth/presentation/state/authStore';
import type { RootStackParamList } from '@app/navigation/types';
import { UpdateProfile } from '../../domain/usecases/updateProfile';
import { UpdateSettings } from '../../domain/usecases/updateSettings';
import { ProfileCard } from '../components/ProfileCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function num(text: string, fallback: number): number {
  const n = Number(text.replace(',', '.'));
  return Number.isNaN(n) ? fallback : n;
}

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const data = useUserData();
  const signOut = useAuthStore((s) => s.signOut);

  const [currency, setCurrency] = useState(data?.profile.currency ?? 'USD');
  const [thresholdPct, setThresholdPct] = useState(
    String(Math.round((data?.settings.leakThresholdPct ?? 0) * 100)),
  );
  const [saved, setSaved] = useState(false);

  if (!data) return <SettingsSkeleton />;

  const locationCount = Object.keys(data.locations).length;
  const sourceCount = Object.keys(data.sources).length;

  const onSave = async () => {
    await container.resolve(UpdateProfile).execute({ currency });
    await container.resolve(UpdateSettings).execute({
      leakThresholdPct: num(thresholdPct, data.settings.leakThresholdPct * 100) / 100,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Screen title="Settings" eyebrow="Configuration">
      <ProfileCard profile={data.profile} />

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
              <AppText variant="h2" color={colors.textMuted} style={styles.chevronGlyph}>
                ›
              </AppText>
            </View>
          </Card>
        )}
      </Pressable>

      <Card style={styles.card}>
        <SectionHeader title="Alerts" />
        <Field
          label="Leak tolerance (%)"
          value={thresholdPct}
          onChangeText={setThresholdPct}
          keyboardType="numeric"
          suffix="%"
          mono
        />
        <Field
          label="Currency"
          value={currency}
          onChangeText={setCurrency}
          autoCapitalize="none"
        />
      </Card>

      <PrimaryButton label={saved ? 'Saved ✓' : 'Save changes'} onPress={onSave} />

      <PrimaryButton label="Sign out" variant="danger" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
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
  chevronGlyph: {
    lineHeight: 32,
    textAlign: 'center',
    width: '100%',
  },
  pressed: { opacity: 0.7 },
});
