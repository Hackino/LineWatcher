import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { container } from 'tsyringe';
import {
  Screen,
  AppText,
  Card,
  Field,
  Chip,
  PrimaryButton,
  SourceChip,
  colors,
  spacing,
} from '@ds';
import { validateReading, classifyLeak } from '@core/domain/services';
import { formatKwh, formatDateTime } from '@shared/format';
import {
  useUserData,
  useSelectedLocation,
  useSelectedSource,
  useSourceReadings,
} from '@core/state';
import type { RootStackParamList } from '@app/navigation/types';
import { AddReading } from '../../domain/usecases/addReading';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function parseNum(text: string): number | null {
  if (text.trim() === '') return null;
  const n = Number(text.replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

export function AddReadingScreen() {
  const navigation = useNavigation<Nav>();
  const data = useUserData();
  const location = useSelectedLocation();
  const source = useSelectedSource();
  const readings = useSourceReadings(source?.id ?? null);
  const [at] = useState(() => new Date().toISOString());
  const [providerText, setProviderText] = useState('');
  const [houseText, setHouseText] = useState('');
  const [note, setNote] = useState('');

  const providerValue = parseNum(providerText);
  const houseValue = parseNum(houseText);
  const prev = readings[readings.length - 1];
  const pair = source?.meterMode === 'pair';

  const validation = useMemo(() => {
    if (!data || !source) return { ok: false, errors: {} };
    return validateReading(
      { at, providerValue, houseValue, note },
      readings,
      source.meterMode,
    );
  }, [data, source, readings, at, providerValue, houseValue, note]);

  const preview = useMemo(() => {
    if (!data || !prev || !pair || providerValue == null || houseValue == null) return null;
    const providerDelta = providerValue - prev.providerValue;
    const prevHouse = prev.houseValue ?? 0;
    const houseDelta = houseValue - prevHouse;
    const leak = providerDelta - houseDelta;
    const status = classifyLeak(leak, providerDelta, data.settings);
    return { providerDelta, houseDelta, leak, status };
  }, [data, prev, pair, providerValue, houseValue]);

  const consumptionPreview = useMemo(() => {
    if (pair || !prev || providerValue == null) return null;
    return providerValue - prev.providerValue;
  }, [pair, prev, providerValue]);

  const onSave = async () => {
    if (!source || !validation.ok || providerValue == null) return;
    if (pair && houseValue == null) return;
    await container.resolve(AddReading).execute({
      sourceId: source.id,
      at,
      providerValue,
      houseValue: pair ? (houseValue ?? undefined) : undefined,
      note: note || undefined,
    });
    navigation.goBack();
  };

  if (!source || !location) {
    return (
      <Screen title="Add reading" eyebrow="Manual entry">
        <AppText variant="body" color={colors.textMuted}>
          Pick a source first.
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen title="Add reading" eyebrow="Manual entry">
      <SourceChip
        locationLabel={location.label}
        sourceLabel={source.label}
        onPress={() => navigation.navigate('SourcePicker')}
      />

      <Card>
        <AppText variant="caption" color={colors.textMuted} uppercase>
          Captured
        </AppText>
        <AppText variant="h2" color={colors.text}>
          {formatDateTime(at)}
        </AppText>
        <AppText variant="label" color={colors.textFaint}>
          {pair
            ? 'Defaults to now · both meters read together'
            : 'Defaults to now · single meter'}
        </AppText>
      </Card>

      <Field
        label={
          pair
            ? `${source.providerMeter.label} (billing box)`
            : source.providerMeter.label
        }
        value={providerText}
        onChangeText={setProviderText}
        keyboardType="numeric"
        placeholder={prev ? String(prev.providerValue) : '0'}
        suffix="kWh"
        mono
        error={validation.errors.providerValue}
      />
      {pair ? (
        <Field
          label={`${source.houseMeter?.label ?? 'House meter'} (your box)`}
          value={houseText}
          onChangeText={setHouseText}
          keyboardType="numeric"
          placeholder={prev?.houseValue != null ? String(prev.houseValue) : '0'}
          suffix="kWh"
          mono
          error={validation.errors.houseValue}
        />
      ) : null}
      <Field
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        autoCapitalize="sentences"
        placeholder="e.g. after the outage"
      />

      {preview ? (
        <Card
          glowColor={preview.status === 'alert' ? colors.leak : colors.safe}
          style={styles.preview}
        >
          <View style={styles.previewHead}>
            <AppText variant="caption" color={colors.textMuted} uppercase>
              Leak preview
            </AppText>
            <Chip
              label={preview.status === 'alert' ? 'suspicious' : 'ok'}
              tone={preview.status === 'alert' ? 'alert' : 'safe'}
            />
          </View>
          <View style={styles.previewRow}>
            <Preview label="Provider" value={preview.providerDelta} color={colors.provider} />
            <Preview label="House" value={preview.houseDelta} color={colors.house} />
            <Preview
              label="Leak"
              value={preview.leak}
              color={preview.status === 'alert' ? colors.leak : colors.safe}
            />
          </View>
        </Card>
      ) : consumptionPreview != null ? (
        <Card style={styles.preview}>
          <View style={styles.previewHead}>
            <AppText variant="caption" color={colors.textMuted} uppercase>
              Consumption since last reading
            </AppText>
          </View>
          <AppText variant="h1" color={colors.provider} mono>
            {consumptionPreview > 0 ? '+' : ''}
            {formatKwh(consumptionPreview)} kWh
          </AppText>
        </Card>
      ) : null}

      <PrimaryButton label="Save reading" icon="✓" onPress={onSave} disabled={!validation.ok} />
    </Screen>
  );
}

function Preview({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.previewItem}>
      <AppText variant="caption" color={colors.textFaint} uppercase>
        {label}
      </AppText>
      <AppText variant="h2" color={color} mono>
        {value > 0 ? '+' : ''}
        {formatKwh(value)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { gap: spacing.md },
  previewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  previewItem: { gap: 2 },
});
