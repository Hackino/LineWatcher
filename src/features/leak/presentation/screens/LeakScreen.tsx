import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { container } from 'tsyringe';
import {
  Screen,
  AppText,
  Card,
  Chip,
  StatTile,
  LeakGauge,
  PrimaryButton,
  SectionHeader,
  SourceChip,
  EmptyState,
  ErrorState,
  LeakSkeleton,
  colors,
  spacing,
  radius,
} from '@ds';
import { formatKwh, formatDate, formatMoney } from '@shared/format';
import {
  useUserData,
  useLeakSummary,
  useSelectedLocation,
  useSelectedSource,
  useDataError,
  useDataRetry,
} from '@core/state';
import type { RootStackParamList } from '@app/navigation/types';
import { UpdateLeakThreshold } from '../../domain/usecases/updateLeakThreshold';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LeakScreen() {
  const navigation = useNavigation<Nav>();
  const data = useUserData();
  const summary = useLeakSummary();
  const location = useSelectedLocation();
  const source = useSelectedSource();
  const error = useDataError();
  const retry = useDataRetry();

  if (error && !data) {
    return (
      <Screen title="Anti-theft" eyebrow="Line integrity">
        <ErrorState message={error} onRetry={retry ?? undefined} />
      </Screen>
    );
  }

  if (!data || !summary || !location || !source) {
    return <LeakSkeleton />;
  }

  // Single-meter sources have no leak concept — lock the whole feature and
  // point the user to the source editor to unlock it.
  if (source.meterMode === 'single') {
    return (
      <Screen title="Anti-theft" eyebrow="Line integrity">
        <SourceChip
          locationLabel={location.label}
          sourceLabel={source.label}
          onPress={() => navigation.navigate('SourcePicker')}
        />
        <Card glowColor={colors.warn} style={styles.lockCard}>
          <View style={styles.lockHead}>
            <AppText variant="h1" color={colors.warn} style={styles.lockGlyph}>
              🔒
            </AppText>
            <View style={styles.lockText}>
              <AppText variant="caption" color={colors.warn} uppercase>
                Locked
              </AppText>
              <AppText variant="h2" color={colors.text}>
                Leak detection needs two meters
              </AppText>
            </View>
          </View>
          <AppText variant="body" color={colors.textMuted}>
            “{source.label}” has one meter, so consumption is tracked but there
            is nothing to compare against. Add a house submeter to this source
            to unlock leak alerts, the suspicious-intervals list, and money-lost
            tracking.
          </AppText>
          <PrimaryButton
            label="Edit source"
            onPress={() =>
              navigation.navigate('SourceEditor', {
                sourceId: source.id,
                locationId: source.locationId,
              })
            }
          />
          <PrimaryButton
            label="Pick a two-meter source"
            variant="ghost"
            onPress={() => navigation.navigate('SourcePicker')}
          />
        </Card>
      </Screen>
    );
  }

  const alert = summary.status === 'alert';
  const threshold = data.settings.leakThresholdKwh;

  const bump = (delta: number) =>
    container
      .resolve(UpdateLeakThreshold)
      .execute(Math.max(0, Math.round((threshold + delta) * 10) / 10));

  return (
    <Screen title="Anti-theft" eyebrow="Line integrity">
      <SourceChip
        locationLabel={location.label}
        sourceLabel={source.label}
        onPress={() => navigation.navigate('SourcePicker')}
      />
      <Card glowColor={alert ? colors.leak : colors.safe} style={styles.hero}>
        <LeakGauge fraction={summary.latestLeakPct} status={summary.status} size={150} />
        <View style={styles.heroText}>
          <Chip label={alert ? 'Leak detected' : 'Line secure'} tone={alert ? 'alert' : 'safe'} />
          <AppText variant="body" color={colors.textMuted} style={styles.heroSub}>
            {alert
              ? 'Provider consumption is outrunning your house meter. Someone may be on your line.'
              : 'No meaningful gap between provider and house consumption.'}
          </AppText>
        </View>
      </Card>

      <View style={styles.tilesRow}>
        <StatTile
          label="Total leak"
          value={`${formatKwh(summary.totalLeak)}`}
          hint="kWh, all time"
          color={alert ? colors.leak : colors.text}
        />
        <StatTile
          label="Money lost"
          value={formatMoney(summary.totalCostLost, data.profile.currency)}
          hint="at your rate"
          color={summary.totalCostLost > 0 ? colors.leak : colors.text}
        />
      </View>

      <Card>
        <SectionHeader title="Alert threshold" />
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => bump(-0.5)}>
            <AppText variant="h2" color={colors.text}>
              −
            </AppText>
          </Pressable>
          <View style={styles.stepValue}>
            <AppText variant="h1" color={colors.accent} mono>
              {formatKwh(threshold)}
            </AppText>
            <AppText variant="label" color={colors.textFaint}>
              kWh per interval
            </AppText>
          </View>
          <Pressable style={styles.stepBtn} onPress={() => bump(0.5)}>
            <AppText variant="h2" color={colors.text}>
              ＋
            </AppText>
          </Pressable>
        </View>
        <AppText variant="label" color={colors.textFaint} style={styles.stepHint}>
          Intervals above this (and {Math.round(data.settings.leakThresholdPct * 100)}%) are
          flagged suspicious.
        </AppText>
      </Card>

      <SectionHeader title={`Suspicious intervals · ${summary.suspiciousCount}`} />
      {summary.suspicious.length === 0 ? (
        <EmptyState
          icon="✓"
          title="Nothing suspicious"
          message="No interval has exceeded your leak threshold."
        />
      ) : (
        <View style={styles.list}>
          {summary.suspicious
            .slice()
            .reverse()
            .map((iv) => (
              <View key={iv.toId} style={styles.suspRow}>
                <View style={styles.suspLeft}>
                  <AppText variant="title" color={colors.text}>
                    {formatDate(iv.from)} → {formatDate(iv.to)}
                  </AppText>
                  <AppText variant="label" color={colors.textFaint}>
                    {Math.round(iv.leakPct * 100)}% over billed line
                  </AppText>
                </View>
                <View style={styles.suspRight}>
                  <AppText variant="title" color={colors.leak} mono>
                    +{formatKwh(iv.leak)} kWh
                  </AppText>
                  {iv.costLost > 0 ? (
                    <AppText variant="label" color={colors.textMuted}>
                      {formatMoney(iv.costLost, data.profile.currency)}
                    </AppText>
                  ) : null}
                </View>
              </View>
            ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  lockCard: { gap: spacing.md },
  lockHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  lockGlyph: { fontSize: 40, lineHeight: 44 },
  lockText: { flex: 1, gap: 2 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  heroText: { flex: 1, gap: spacing.sm },
  heroSub: { lineHeight: 20 },
  tilesRow: { flexDirection: 'row', gap: spacing.md },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { alignItems: 'center', gap: 2 },
  stepHint: { marginTop: spacing.md },
  list: { gap: spacing.sm },
  suspRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.leakDim,
    padding: spacing.lg,
  },
  suspLeft: { gap: 2 },
  suspRight: { alignItems: 'flex-end', gap: 2 },
});
