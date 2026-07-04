import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { container } from 'tsyringe';
import {
  Screen,
  Card,
  Field,
  PrimaryButton,
  SectionHeader,
  SettingsSkeleton,
  spacing,
} from '@ds';
import { useUserData } from '@core/state';
import type { RootStackParamList } from '@app/navigation/types';
import { UpdateProfile } from '../../domain/usecases/updateProfile';
import { UpdateSettings } from '../../domain/usecases/updateSettings';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function num(text: string, fallback: number): number {
  const n = Number(text.replace(',', '.'));
  return Number.isNaN(n) ? fallback : n;
}

export function AlertsScreen() {
  const navigation = useNavigation<Nav>();
  const data = useUserData();

  const [currency, setCurrency] = useState(data?.profile.currency ?? 'USD');
  const [thresholdPct, setThresholdPct] = useState(
    String(Math.round((data?.settings.leakThresholdPct ?? 0) * 100)),
  );
  const [saving, setSaving] = useState(false);

  if (!data) return <SettingsSkeleton />;

  const onSave = async () => {
    setSaving(true);
    await container.resolve(UpdateProfile).execute({ currency });
    await container.resolve(UpdateSettings).execute({
      leakThresholdPct:
        num(thresholdPct, data.settings.leakThresholdPct * 100) / 100,
    });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <Screen
      title="Alerts"
      eyebrow="Configuration"
      back
      keyboardBottomOffset={CTA_BLOCK_HEIGHT}
    >
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

      <PrimaryButton
        label={saving ? 'Saving…' : 'Save changes'}
        onPress={onSave}
      />
    </Screen>
  );
}

// PrimaryButton height (~52) + gap above it (spacing.lg = 16).
// Reserved above the keyboard so the save button stays visible alongside the
// focused field — same pattern as LoginScreen.
const CTA_BLOCK_HEIGHT = 52 + 16;

const styles = StyleSheet.create({
  card: { gap: spacing.md },
});
