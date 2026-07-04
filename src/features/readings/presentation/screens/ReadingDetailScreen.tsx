import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { container } from 'tsyringe';
import {
  Screen,
  AppText,
  Card,
  Chip,
  PrimaryButton,
  ConfirmDialog,
  colors,
  spacing,
} from '@ds';
import { formatKwh, formatDateTime, formatMoney, monthLabel } from '@shared/format';
import { rateForDate, monthKey } from '@core/domain/services';
import { useUserData, useLeakSummary } from '@core/state';
import type { RootStackParamList } from '@app/navigation/types';
import { DeleteReading } from '../../domain/usecases/deleteReading';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ReadingDetail'>;

export function ReadingDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const data = useUserData();
  const summary = useLeakSummary();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const reading = data?.readings[route.params.readingId] ?? null;
  const source = reading ? (data?.sources[reading.sourceId] ?? null) : null;
  const interval = summary?.intervals.find((iv) => iv.toId === route.params.readingId) ?? null;

  if (!reading || !data || !source) {
    return (
      <Screen title="Reading" eyebrow="Detail">
        <AppText variant="body" color={colors.textMuted}>
          This reading no longer exists.
        </AppText>
      </Screen>
    );
  }

  const pair = source.meterMode === 'pair';
  const alert = pair && interval?.status === 'alert';

  return (
    <Screen title={formatDateTime(reading.at)} eyebrow={`Reading · ${source.label}`}>
      <View style={styles.metersRow}>
        <MeterBlock
          label={source.providerMeter.label}
          value={reading.providerValue}
          color={colors.provider}
        />
        {pair && source.houseMeter ? (
          <MeterBlock
            label={source.houseMeter.label}
            value={reading.houseValue ?? 0}
            color={colors.house}
          />
        ) : null}
      </View>

      {interval && pair ? (
        <Card glowColor={alert ? colors.leak : colors.safe} style={styles.card}>
          <View style={styles.head}>
            <AppText variant="caption" color={colors.textMuted} uppercase>
              vs previous reading · {interval.hours}h
            </AppText>
            <Chip label={alert ? 'suspicious' : 'ok'} tone={alert ? 'alert' : 'safe'} />
          </View>
          <Line
            label={`${source.providerMeter.label} consumed`}
            value={`${formatKwh(interval.providerDelta)} kWh`}
            color={colors.provider}
          />
          <Line
            label={`${source.houseMeter?.label ?? 'House meter'} consumed`}
            value={`${formatKwh(interval.houseDelta)} kWh`}
            color={colors.house}
          />
          <Line
            label="Leak (outside house)"
            value={`${formatKwh(interval.leak)} kWh`}
            color={alert ? colors.leak : colors.safe}
          />
          {interval.costLost > 0 ? (
            <>
              <Line
                label="Money lost"
                value={formatMoney(interval.costLost, data.profile.currency)}
                color={colors.leak}
              />
              <Line
                label={`Rate · ${monthLabel(monthKey(reading.at))}`}
                value={`${formatMoney(rateForDate(source, reading.at), data.profile.currency)} / kWh`}
                color={colors.textMuted}
              />
            </>
          ) : null}
        </Card>
      ) : interval ? (
        <Card style={styles.card}>
          <View style={styles.head}>
            <AppText variant="caption" color={colors.textMuted} uppercase>
              Consumption · {interval.hours}h
            </AppText>
          </View>
          <Line
            label={`${source.providerMeter.label} used`}
            value={`${formatKwh(interval.providerDelta)} kWh`}
            color={colors.provider}
          />
          <Line
            label={`Rate · ${monthLabel(monthKey(reading.at))}`}
            value={`${formatMoney(rateForDate(source, reading.at), data.profile.currency)} / kWh`}
            color={colors.textMuted}
          />
        </Card>
      ) : (
        <Card>
          <AppText variant="body" color={colors.textMuted}>
            This is the baseline reading — no previous reading to compare against.
          </AppText>
        </Card>
      )}

      {reading.note ? (
        <Card>
          <AppText variant="caption" color={colors.textMuted} uppercase>
            Note
          </AppText>
          <AppText variant="body" color={colors.text}>
            {reading.note}
          </AppText>
        </Card>
      ) : null}

      <PrimaryButton
        label="Delete reading"
        variant="danger"
        onPress={() => setConfirmVisible(true)}
      />

      <ConfirmDialog
        visible={confirmVisible}
        eyebrow="Reading"
        title="Delete this reading?"
        message={`${formatDateTime(reading.at)} will be removed. Leak stats around this point will be recomputed.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        tone="danger"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={async () => {
          setConfirmVisible(false);
          await container.resolve(DeleteReading).execute(reading.sourceId, reading.id);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}

function MeterBlock({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card style={styles.block}>
      <View style={styles.blockHead}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <AppText variant="caption" color={colors.textMuted} uppercase>
          {label}
        </AppText>
      </View>
      <AppText variant="h1" color={colors.text} mono>
        {formatKwh(value)}
      </AppText>
    </Card>
  );
}

function Line({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.line}>
      <AppText variant="body" color={colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="title" color={color} mono>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  metersRow: { flexDirection: 'row', gap: spacing.md },
  block: { flex: 1, gap: spacing.sm },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  card: { gap: spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
