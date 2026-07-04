import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Screen,
  AppText,
  Card,
  PrimaryButton,
  EmptyState,
  ErrorState,
  SectionHeader,
  SourceChip,
  StatTile,
  MeterReadoutCard,
  Sparkline,
  HomeSkeleton,
  colors,
  spacing,
} from '@ds';
import { useMeasuredWidth } from '@shared/hooks';
import { formatKwh, relativeDay, formatMoney } from '@shared/format';
import {
  useUserData,
  useLeakSummary,
  useSelectedLocation,
  useSelectedSource,
  useSourceReadings,
  useDataError,
  useDataRetry,
} from '@core/state';
import type { RootStackParamList } from '@app/navigation/types';
import { StatusCard } from '../components/StatusCard';
import { ConsumptionCard } from '../components/ConsumptionCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const data = useUserData();
  const summary = useLeakSummary();
  const location = useSelectedLocation();
  const source = useSelectedSource();
  const readings = useSourceReadings(source?.id ?? null);
  const error = useDataError();
  const retry = useDataRetry();
  const [trendWidth, onTrendLayout] = useMeasuredWidth();

  if (error && !data) {
    return (
      <Screen title="LineWatch" eyebrow="Line monitor">
        <ErrorState message={error} onRetry={retry ?? undefined} />
      </Screen>
    );
  }

  if (!data || !summary || !location || !source) {
    return <HomeSkeleton />;
  }

  const pair = source.meterMode === 'pair';
  const latest = readings[readings.length - 1];
  const lastInterval = summary.intervals[summary.intervals.length - 1] ?? null;
  const trendSeries = pair
    ? summary.intervals.slice(-14).map((iv) => iv.houseDelta)
    : summary.intervals.slice(-14).map((iv) => iv.providerDelta);
  const trendColor = pair ? colors.house : colors.provider;
  const trendLabel = pair
    ? 'House consumption · last 14 intervals'
    : `${source.providerMeter.label} consumption · last 14 intervals`;

  const chip = (
    <SourceChip
      locationLabel={location.label}
      sourceLabel={source.label}
      onPress={() => navigation.navigate('SourcePicker')}
    />
  );

  if (readings.length < 2) {
    return (
      <Screen title="LineWatch" eyebrow="Line monitor">
        {chip}
        <EmptyState
          title="Add your first readings"
          message={
            pair
              ? `Enter both meter counts twice on "${source.label}" to start tracking consumption and detecting leaks on this line.`
              : `Enter the meter count twice on "${source.label}" to start tracking consumption.`
          }
        >
          <PrimaryButton
            label="Add reading"
            icon="＋"
            onPress={() => navigation.navigate('AddReading')}
          />
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen title="LineWatch" eyebrow="Line monitor">
      {chip}

      {pair ? (
        <StatusCard summary={summary} />
      ) : (
        <ConsumptionCard summary={summary} meterLabel={source.providerMeter.label} />
      )}

      <View style={styles.metersRow}>
        <MeterReadoutCard
          label={source.providerMeter.label}
          value={latest.providerValue}
          delta={lastInterval?.providerDelta ?? null}
          color={colors.provider}
        />
        {pair && source.houseMeter ? (
          <MeterReadoutCard
            label={source.houseMeter.label}
            value={latest.houseValue ?? 0}
            delta={lastInterval?.houseDelta ?? null}
            color={colors.house}
          />
        ) : null}
      </View>

      {pair ? (
        <View style={styles.tilesRow}>
          <StatTile
            label="Money lost"
            value={formatMoney(summary.totalCostLost, data.profile.currency)}
            hint="to leaks, 30d"
            color={summary.totalCostLost > 0 ? colors.leak : colors.text}
          />
          <StatTile
            label="Suspicious"
            value={String(summary.suspiciousCount)}
            hint="intervals flagged"
            color={summary.suspiciousCount > 0 ? colors.warn : colors.safe}
          />
        </View>
      ) : null}

      <Card>
        <SectionHeader title={trendLabel} />
        <View onLayout={onTrendLayout}>
          {trendWidth > 0 ? (
            <Sparkline data={trendSeries} width={trendWidth} height={56} color={trendColor} />
          ) : null}
        </View>
        <AppText variant="label" color={colors.textFaint} style={styles.trendHint}>
          Last reading {relativeDay(latest.at)} ·{' '}
          {formatKwh(pair ? (latest.houseValue ?? 0) : latest.providerValue)} kWh
        </AppText>
      </Card>

      <PrimaryButton
        label="Add reading"
        icon="＋"
        onPress={() => navigation.navigate('AddReading')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  metersRow: { flexDirection: 'row', gap: spacing.md },
  tilesRow: { flexDirection: 'row', gap: spacing.md },
  trendHint: { marginTop: spacing.sm },
});
