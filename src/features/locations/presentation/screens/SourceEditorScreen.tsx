import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { container } from 'tsyringe';
import type { MeterMode, Source, SourceType } from '@core/model';
import {
  Screen,
  AppText,
  Card,
  Field,
  PrimaryButton,
  SectionHeader,
  ConfirmDialog,
  colors,
  radius,
  spacing,
} from '@ds';
import { useUserData } from '@core/state';
import { shortId } from '@shared/id';
import type { RootStackParamList } from '@app/navigation/types';
import { UpsertSource } from '../../domain/usecases/upsertSource';
import { DeleteSource } from '../../domain/usecases/deleteSource';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'SourceEditor'>;

const TYPES: { value: SourceType; label: string }[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'generator', label: 'Generator' },
  { value: 'solar', label: 'Solar' },
  { value: 'other', label: 'Other' },
];

const MODES: { value: MeterMode; label: string; hint: string }[] = [
  {
    value: 'pair',
    label: 'Two meters',
    hint: 'Provider + house submeter. Full leak detection.',
  },
  {
    value: 'single',
    label: 'One meter',
    hint: 'Consumption only. Leak detection is unavailable.',
  },
];

function num(text: string, fallback: number): number {
  const n = Number(text.replace(',', '.'));
  return Number.isNaN(n) ? fallback : n;
}

/** Create or edit a single source under a location. */
export function SourceEditorScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const data = useUserData();

  const existing = useMemo<Source | null>(() => {
    if (!data || !route.params.sourceId) return null;
    return data.sources[route.params.sourceId] ?? null;
  }, [data, route.params.sourceId]);

  const [type, setType] = useState<SourceType>(existing?.type ?? 'grid');
  const [meterMode, setMeterMode] = useState<MeterMode>(existing?.meterMode ?? 'pair');
  const [label, setLabel] = useState(existing?.label ?? '');
  const [rate, setRate] = useState(String(existing?.ratePerKwh ?? 0));
  const [providerLabel, setProviderLabel] = useState(
    existing?.providerMeter.label ?? 'Meter',
  );
  const [providerInitial, setProviderInitial] = useState(
    String(existing?.providerMeter.initialValue ?? 0),
  );
  const [houseLabel, setHouseLabel] = useState(
    existing?.houseMeter?.label ?? 'House meter',
  );
  const [houseInitial, setHouseInitial] = useState(
    String(existing?.houseMeter?.initialValue ?? 0),
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!data) return <Screen title="Source" eyebrow="Editor">{null}</Screen>;
  const locationId = existing?.locationId ?? route.params.locationId;
  const location = data.locations[locationId];
  if (!location) {
    return (
      <Screen title="Source" eyebrow="Editor">
        <AppText variant="body" color={colors.textMuted}>
          Location no longer exists.
        </AppText>
      </Screen>
    );
  }

  const canSave = label.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;
    const nowIso = new Date().toISOString();
    const providerMeter = {
      id: existing?.providerMeter.id ?? shortId('mtr'),
      label:
        providerLabel.trim() || (meterMode === 'pair' ? 'Provider meter' : 'Meter'),
      unit: 'kWh' as const,
      installedAt: existing?.providerMeter.installedAt ?? nowIso,
      initialValue: num(providerInitial, 0),
    };
    const houseMeter =
      meterMode === 'pair'
        ? {
            id: existing?.houseMeter?.id ?? shortId('mtr'),
            label: houseLabel.trim() || 'House meter',
            unit: 'kWh' as const,
            installedAt: existing?.houseMeter?.installedAt ?? nowIso,
            initialValue: num(houseInitial, 0),
          }
        : undefined;

    const source: Source = {
      id: existing?.id ?? shortId('src'),
      locationId,
      type,
      label: label.trim(),
      ratePerKwh: num(rate, 0),
      monthlyRates: existing?.monthlyRates ?? {},
      meterMode,
      providerMeter,
      houseMeter,
      archivedAt: existing?.archivedAt,
      createdAt: existing?.createdAt ?? nowIso,
    };
    await container.resolve(UpsertSource).execute(source);
    navigation.goBack();
  };

  const onDelete = async () => {
    if (!existing) return;
    setConfirmDelete(false);
    await container.resolve(DeleteSource).execute(existing.id);
    navigation.goBack();
  };

  return (
    <Screen
      title={existing ? label || 'Edit source' : 'New source'}
      eyebrow={`${location.label} · ${existing ? 'Edit' : 'New'}`}
    >
      <Card style={styles.card}>
        <SectionHeader title="Source" />
        <View style={styles.typeRow}>
          {TYPES.map((t) => {
            const selected = t.value === type;
            return (
              <Pressable
                key={t.value}
                onPress={() => setType(t.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.typeBtn, selected && styles.typeBtnSelected]}
              >
                <AppText
                  variant="label"
                  color={selected ? colors.bg : colors.text}
                >
                  {t.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <Field
          label="Label"
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. EDL Grid, Diesel generator"
          autoCapitalize="sentences"
        />
        <Field
          label={`Default rate / kWh (${data.profile.currency})`}
          value={rate}
          onChangeText={setRate}
          keyboardType="numeric"
          mono
        />
        {existing ? (
          <PrimaryButton
            label="Monthly rate overrides"
            variant="ghost"
            onPress={() =>
              navigation.navigate('MonthlyRates', { sourceId: existing.id })
            }
          />
        ) : (
          <AppText variant="label" color={colors.textFaint}>
            Monthly overrides can be added after saving.
          </AppText>
        )}
      </Card>

      <Card style={styles.card}>
        <SectionHeader title="Metering setup" />
        <View style={styles.modeCol}>
          {MODES.map((m) => {
            const selected = m.value === meterMode;
            return (
              <Pressable
                key={m.value}
                onPress={() => setMeterMode(m.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.modeRow, selected && styles.modeRowSelected]}
              >
                <View style={styles.modeText}>
                  <AppText
                    variant="title"
                    color={selected ? colors.accent : colors.text}
                  >
                    {m.label}
                  </AppText>
                  <AppText variant="label" color={colors.textFaint}>
                    {m.hint}
                  </AppText>
                </View>
                <View
                  style={[styles.modeDot, selected && styles.modeDotSelected]}
                />
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <SectionHeader
          title={meterMode === 'pair' ? 'Provider meter (billing box)' : 'Meter'}
        />
        <Field
          label="Label"
          value={providerLabel}
          onChangeText={setProviderLabel}
          autoCapitalize="sentences"
        />
        <Field
          label="Initial value (kWh)"
          value={providerInitial}
          onChangeText={setProviderInitial}
          keyboardType="numeric"
          mono
        />
      </Card>

      {meterMode === 'pair' ? (
        <Card style={styles.card}>
          <SectionHeader title="House meter (your box)" />
          <Field
            label="Label"
            value={houseLabel}
            onChangeText={setHouseLabel}
            autoCapitalize="sentences"
          />
          <Field
            label="Initial value (kWh)"
            value={houseInitial}
            onChangeText={setHouseInitial}
            keyboardType="numeric"
            mono
          />
        </Card>
      ) : (
        <Card>
          <AppText variant="caption" color={colors.warn} uppercase>
            Leak detection off
          </AppText>
          <AppText variant="body" color={colors.textMuted}>
            One-meter sources track consumption only. Switch to “Two meters” to
            unlock the Anti-theft screen and leak alerts for this source.
          </AppText>
        </Card>
      )}

      <PrimaryButton label={existing ? 'Save source' : 'Add source'} onPress={onSave} disabled={!canSave} />

      {existing ? (
        <PrimaryButton
          label="Delete source"
          variant="danger"
          onPress={() => setConfirmDelete(true)}
        />
      ) : null}

      <ConfirmDialog
        visible={confirmDelete}
        eyebrow="Source"
        title={`Delete ${existing?.label ?? ''}?`}
        message="Readings for this source will be removed."
        confirmLabel="Delete"
        cancelLabel="Keep"
        tone="danger"
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  typeRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  typeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.panel,
  },
  typeBtnSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modeCol: { gap: spacing.sm },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.panel,
    gap: spacing.md,
  },
  modeRowSelected: {
    borderColor: colors.accent,
  },
  modeText: { flex: 1, gap: 2 },
  modeDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.bg,
  },
  modeDotSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
});
