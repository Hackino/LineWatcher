import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from './Screen';
import { Card } from './Card';
import { Shimmer } from './Shimmer';
import { colors, radius, spacing } from '../theme/tokens';

/** Home tab loading state — mimics status card, meter row, tiles, trend, button. */
export function HomeSkeleton() {
  return (
    <Screen title="LineWatch" eyebrow="Line monitor">
      <Card style={styles.hero}>
        <Shimmer height={22} width="60%" />
        <Shimmer height={14} width="90%" />
        <Shimmer height={14} width="70%" />
      </Card>
      <View style={styles.row}>
        <Card style={styles.flex}>
          <Shimmer height={12} width="45%" />
          <Shimmer height={26} width="80%" style={styles.gap} />
          <Shimmer height={12} width="35%" style={styles.gap} />
        </Card>
        <Card style={styles.flex}>
          <Shimmer height={12} width="45%" />
          <Shimmer height={26} width="80%" style={styles.gap} />
          <Shimmer height={12} width="35%" style={styles.gap} />
        </Card>
      </View>
      <View style={styles.row}>
        <Card style={styles.flex}>
          <Shimmer height={12} width="55%" />
          <Shimmer height={22} width="70%" style={styles.gap} />
        </Card>
        <Card style={styles.flex}>
          <Shimmer height={12} width="55%" />
          <Shimmer height={22} width="70%" style={styles.gap} />
        </Card>
      </View>
      <Card>
        <Shimmer height={14} width="55%" />
        <Shimmer height={56} width="100%" style={styles.gap} radius={radius.md} />
      </Card>
      <Shimmer height={52} width="100%" radius={radius.md} />
    </Screen>
  );
}

/** History tab loading — segmented + list rows. */
export function HistorySkeleton() {
  return (
    <Screen title="History" eyebrow="Readings">
      <Shimmer height={40} width="100%" radius={radius.md} />
      <View style={styles.list}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.readingRow}>
            <View style={styles.readingLeft}>
              <Shimmer height={14} width={120} />
              <Shimmer height={12} width={80} style={styles.gapSm} />
            </View>
            <View style={styles.readingRight}>
              <Shimmer height={16} width={70} />
              <Shimmer height={12} width={50} style={styles.gapSm} />
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

/** Analytics tab loading — segmented, chart card, totals row, bar chart card. */
export function AnalyticsSkeleton() {
  return (
    <Screen title="Analytics" eyebrow="Consumption">
      <Shimmer height={40} width="100%" radius={radius.md} />
      <Card>
        <Shimmer height={14} width="55%" />
        <Shimmer height={140} width="100%" style={styles.gap} radius={radius.md} />
        <Shimmer height={12} width="80%" style={styles.gap} />
      </Card>
      <View style={styles.row}>
        <Card style={styles.flex}>
          <Shimmer height={10} width="60%" />
          <Shimmer height={22} width="80%" style={styles.gap} />
          <Shimmer height={10} width="30%" style={styles.gapSm} />
        </Card>
        <Card style={styles.flex}>
          <Shimmer height={10} width="60%" />
          <Shimmer height={22} width="80%" style={styles.gap} />
          <Shimmer height={10} width="30%" style={styles.gapSm} />
        </Card>
        <Card style={styles.flex}>
          <Shimmer height={10} width="60%" />
          <Shimmer height={22} width="80%" style={styles.gap} />
          <Shimmer height={10} width="30%" style={styles.gapSm} />
        </Card>
      </View>
      <Card>
        <Shimmer height={14} width="55%" />
        <Shimmer height={110} width="100%" style={styles.gap} radius={radius.md} />
      </Card>
    </Screen>
  );
}

/** Leak (Anti-theft) loading — hero with gauge, tiles, threshold card, list. */
export function LeakSkeleton() {
  return (
    <Screen title="Anti-theft" eyebrow="Line integrity">
      <Card style={styles.leakHero}>
        <Shimmer height={150} width={150} radius={999} />
        <View style={styles.leakHeroText}>
          <Shimmer height={22} width={120} radius={999} />
          <Shimmer height={14} width="100%" style={styles.gap} />
          <Shimmer height={14} width="80%" />
        </View>
      </Card>
      <View style={styles.row}>
        <Card style={styles.flex}>
          <Shimmer height={12} width="55%" />
          <Shimmer height={22} width="70%" style={styles.gap} />
        </Card>
        <Card style={styles.flex}>
          <Shimmer height={12} width="55%" />
          <Shimmer height={22} width="70%" style={styles.gap} />
        </Card>
      </View>
      <Card>
        <Shimmer height={14} width="45%" />
        <View style={[styles.row, styles.gap]}>
          <Shimmer height={52} width={52} radius={radius.md} />
          <View style={styles.flex}>
            <Shimmer height={28} width="60%" />
            <Shimmer height={12} width="80%" style={styles.gapSm} />
          </View>
          <Shimmer height={52} width={52} radius={radius.md} />
        </View>
      </Card>
      <Shimmer height={14} width="55%" />
      <View style={styles.list}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.leakRow}>
            <View style={styles.flex}>
              <Shimmer height={14} width="70%" />
              <Shimmer height={12} width="45%" style={styles.gapSm} />
            </View>
            <Shimmer height={16} width={72} />
          </View>
        ))}
      </View>
    </Screen>
  );
}

/** Settings loading — three cards each with a stack of fields. */
export function SettingsSkeleton() {
  return (
    <Screen title="Settings" eyebrow="Configuration">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} style={styles.settingsCard}>
          <Shimmer height={14} width="50%" />
          <Shimmer height={44} width="100%" style={styles.gap} radius={radius.md} />
          <Shimmer height={44} width="100%" style={styles.gap} radius={radius.md} />
          {i === 2 ? <Shimmer height={44} width="100%" style={styles.gap} radius={radius.md} /> : null}
        </Card>
      ))}
      <Shimmer height={52} width="100%" radius={radius.md} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xs },
  gap: { marginTop: spacing.md },
  gapSm: { marginTop: spacing.xs },
  list: { gap: spacing.sm },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
  },
  readingLeft: { gap: 2 },
  readingRight: { alignItems: 'flex-end', gap: 2 },
  leakHero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  leakHeroText: { flex: 1, gap: spacing.sm },
  leakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: spacing.md,
  },
  settingsCard: { gap: spacing.md },
});
