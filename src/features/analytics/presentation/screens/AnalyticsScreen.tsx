import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Screen,
  AppText,
  Card,
  Segmented,
  SectionHeader,
  EmptyState,
  SourceChip,
  DualLineChart,
  BarChart,
  AnalyticsSkeleton,
  colors,
  spacing,
} from '@ds';
import { useMeasuredWidth } from '@shared/hooks';
import { formatKwh } from '@shared/format';
import {
  useUserData,
  useLeakSummary,
  useSelectedLocation,
  useSelectedSource,
} from '@core/state';
import type { RootStackParamList } from '@app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Range = '7d' | '30d' | 'all';
const RANGE_DAYS: Record<Range, number | null> = { '7d': 7, '30d': 30, all: null };

export function AnalyticsScreen() {
  const navigation = useNavigation<Nav>();
  const data = useUserData();
  const summary = useLeakSummary();
  const location = useSelectedLocation();
  const source = useSelectedSource();
  const [range, setRange] = useState<Range>('30d');
  const [lineW, onLineLayout] = useMeasuredWidth();
  const [barW, onBarLayout] = useMeasuredWidth();

  const intervals = useMemo(() => {
    if (!summary) return [];
    const days = RANGE_DAYS[range];
    const cutoff = days ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;
    return summary.intervals.filter((iv) => new Date(iv.to).getTime() >= cutoff);
  }, [summary, range]);

  const cumulative = useMemo(() => {
    let p = 0;
    let h = 0;
    const provider: number[] = [0];
    const house: number[] = [0];
    for (const iv of intervals) {
      p += iv.providerDelta;
      h += iv.houseDelta;
      provider.push(p);
      house.push(h);
    }
    return { provider, house };
  }, [intervals]);

  const totals = useMemo(() => {
    const provider = intervals.reduce((s, iv) => s + iv.providerDelta, 0);
    const house = intervals.reduce((s, iv) => s + iv.houseDelta, 0);
    return { provider, house, leak: provider - house };
  }, [intervals]);

  const header =
    location && source ? (
      <SourceChip
        locationLabel={location.label}
        sourceLabel={source.label}
        onPress={() => navigation.navigate('SourcePicker')}
      />
    ) : null;

  const rangeControl = (
    <Segmented
      options={[
        { value: '7d', label: '7 days' },
        { value: '30d', label: '30 days' },
        { value: 'all', label: 'All' },
      ]}
      value={range}
      onChange={(v) => setRange(v as Range)}
    />
  );

  if (!data || !summary || !location || !source) {
    return <AnalyticsSkeleton />;
  }

  if (intervals.length === 0) {
    return (
      <Screen title="Analytics" eyebrow="Consumption">
        {header}
        {rangeControl}
        <EmptyState
          title="Not enough data"
          message="Add more readings in this range to see consumption trends."
        />
      </Screen>
    );
  }

  const pair = source.meterMode === 'pair';

  return (
    <Screen title="Analytics" eyebrow="Consumption">
      {header}
      {rangeControl}

      <Card>
        <SectionHeader title="Cumulative consumption" />
        <View onLayout={onLineLayout}>
          {lineW > 0 ? (
            <DualLineChart
              width={lineW}
              series={
                pair && source.houseMeter
                  ? [
                      {
                        label: source.providerMeter.label,
                        color: colors.provider,
                        values: cumulative.provider,
                      },
                      {
                        label: source.houseMeter.label,
                        color: colors.house,
                        values: cumulative.house,
                      },
                    ]
                  : [
                      {
                        label: source.providerMeter.label,
                        color: colors.provider,
                        values: cumulative.provider,
                      },
                    ]
              }
            />
          ) : null}
        </View>
        <AppText variant="label" color={colors.textFaint} style={styles.caption}>
          {pair
            ? 'The gap between the lines is power drawn outside your house.'
            : 'Running consumption on the single meter for this source.'}
        </AppText>
      </Card>

      <View style={styles.totalsRow}>
        <Total
          label={source.providerMeter.label}
          value={totals.provider}
          color={colors.provider}
        />
        {pair && source.houseMeter ? (
          <Total
            label={source.houseMeter.label}
            value={totals.house}
            color={colors.house}
          />
        ) : null}
        {pair ? (
          <Total
            label="Leak"
            value={totals.leak}
            color={totals.leak > data.settings.leakThresholdKwh ? colors.leak : colors.safe}
          />
        ) : null}
      </View>

      {pair ? (
        <Card>
          <SectionHeader title="Leak per interval" />
          <View onLayout={onBarLayout}>
            {barW > 0 ? (
              <BarChart
                width={barW}
                bars={intervals.map((iv) => ({
                  value: Math.max(0, iv.leak),
                  color: iv.status === 'alert' ? colors.leak : colors.safe,
                }))}
              />
            ) : null}
          </View>
        </Card>
      ) : (
        <Card>
          <SectionHeader title="Consumption per interval" />
          <View onLayout={onBarLayout}>
            {barW > 0 ? (
              <BarChart
                width={barW}
                bars={intervals.map((iv) => ({
                  value: Math.max(0, iv.providerDelta),
                  color: colors.provider,
                }))}
              />
            ) : null}
          </View>
        </Card>
      )}
    </Screen>
  );
}

function Total({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card style={styles.total}>
      <AppText variant="caption" color={colors.textMuted} uppercase>
        {label}
      </AppText>
      <AppText variant="h2" color={color} mono>
        {formatKwh(value)}
      </AppText>
      <AppText variant="label" color={colors.textFaint}>
        kWh
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  caption: { marginTop: spacing.sm },
  totalsRow: { flexDirection: 'row', gap: spacing.md },
  total: { flex: 1, gap: 2, alignItems: 'flex-start' },
});
