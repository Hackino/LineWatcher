import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { container } from 'tsyringe';
import {
  Screen,
  AppText,
  PrimaryButton,
  SettingsSkeleton,
  colors,
  spacing,
} from '@ds';
import { monthsInReadings } from '@core/domain/services';
import { useUserData } from '@core/state';
import type { RootStackParamList } from '@app/navigation/types';
import { UpsertSource } from '@features/locations/domain/usecases/upsertSource';
import { MonthlyRatesSection } from '../components/MonthlyRatesSection';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'MonthlyRates'>;

/** Per-source per-month rate overrides. */
export function MonthlyRatesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const data = useUserData();
  const source = data?.sources[route.params.sourceId] ?? null;

  const initialRates = useMemo<Record<string, string>>(() => {
    if (!data || !source) return {};
    const out: Record<string, string> = {};
    const rates = source.monthlyRates ?? {};
    const readings = Object.values(data.readings).filter(
      (r) => r.sourceId === source.id,
    );
    const months = monthsInReadings(readings);
    new Set<string>([...Object.keys(rates), ...months]).forEach((k) => {
      out[k] = rates[k] != null ? String(rates[k]) : '';
    });
    return out;
  }, [data, source]);

  const [monthRates, setMonthRates] = useState<Record<string, string>>(initialRates);
  const [saving, setSaving] = useState(false);

  if (!data) return <SettingsSkeleton />;
  if (!source) {
    return (
      <Screen title="Monthly rates" eyebrow="Billing">
        <AppText variant="body" color={colors.textMuted}>
          Source no longer exists.
        </AppText>
      </Screen>
    );
  }

  const setMonth = (key: string, value: string) =>
    setMonthRates((prev) => ({ ...prev, [key]: value }));

  const removeMonth = (key: string) =>
    setMonthRates((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });

  const onSave = async () => {
    setSaving(true);
    const monthlyRates: Record<string, number> = {};
    for (const [k, v] of Object.entries(monthRates)) {
      const n = Number(v.replace(',', '.'));
      if (v.trim() !== '' && !Number.isNaN(n)) monthlyRates[k] = n;
    }
    await container.resolve(UpsertSource).execute({ ...source, monthlyRates });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <Screen title="Monthly rates" eyebrow={source.label}>
      <MonthlyRatesSection
        rates={monthRates}
        onChange={setMonth}
        onRemove={removeMonth}
        currency={data.profile.currency}
        defaultRate={source.ratePerKwh}
      />
      <PrimaryButton
        label={saving ? 'Saving…' : 'Save monthly rates'}
        onPress={onSave}
        style={styles.saveBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  saveBtn: { marginTop: spacing.md },
});
