import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import {
  AppText,
  Card,
  Field,
  SectionHeader,
  colors,
  radius,
  spacing,
} from '@ds';
import { monthLabel } from '@shared/format';

interface MonthlyRatesSectionProps {
  /** Draft rate map (empty string means "use default"). */
  rates: Record<string, string>;
  /** Update a single month's rate string. */
  onChange: (monthKey: string, rate: string) => void;
  /** Remove a month override entirely. */
  onRemove: (monthKey: string) => void;
  /** Currency label shown as the field suffix. */
  currency: string;
  /** Default rate shown as placeholder when the month has no override. */
  defaultRate: number;
}

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const idx = (y ?? 1970) * 12 + ((m ?? 1) - 1) + delta;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${String(nm).padStart(2, '0')}`;
}

/**
 * Editable per-month rate list. Each row is its own card so the "one row per
 * month, edit independently" affordance is clear. Includes an inline picker to
 * add any month not yet in the list.
 */
export function MonthlyRatesSection({
  rates,
  onChange,
  onRemove,
  currency,
  defaultRate,
}: MonthlyRatesSectionProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cursor, setCursor] = useState<string>(currentMonthKey());

  const monthKeys = useMemo(
    () => Object.keys(rates).sort((a, b) => (a < b ? 1 : -1)),
    [rates],
  );

  const alreadyAdded = Object.prototype.hasOwnProperty.call(rates, cursor);

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Monthly rates" />
      <AppText variant="label" color={colors.textFaint}>
        Rate the provider billed each month. Blank = use the default rate.
      </AppText>

      {monthKeys.length === 0 ? (
        <Card tone="raised" style={styles.emptyCard}>
          <AppText variant="body" color={colors.textMuted}>
            No monthly overrides yet.
          </AppText>
          <AppText variant="label" color={colors.textFaint}>
            Add a month below to bill it at a different rate.
          </AppText>
        </Card>
      ) : (
        <View style={styles.list}>
          {monthKeys.map((key) => (
            <Card key={key} style={styles.row}>
              <View style={styles.rowHeader}>
                <AppText variant="title" color={colors.text}>
                  {monthLabel(key)}
                </AppText>
                <Pressable
                  onPress={() => onRemove(key)}
                  hitSlop={8}
                  style={styles.removeBtn}
                  accessibilityLabel={`Remove ${monthLabel(key)} rate`}
                >
                  <AppText variant="label" color={colors.textMuted}>
                    Remove
                  </AppText>
                </Pressable>
              </View>
              <Field
                label="Rate"
                value={rates[key]}
                onChangeText={(v) => onChange(key, v)}
                keyboardType="numeric"
                placeholder={String(defaultRate)}
                suffix={`${currency} / kWh`}
                mono
              />
            </Card>
          ))}
        </View>
      )}

      {pickerOpen ? (
        <Card tone="raised" style={styles.picker}>
          <AppText variant="label" color={colors.textMuted} uppercase>
            Add month
          </AppText>
          <View style={styles.pickerRow}>
            <Pressable
              onPress={() => setCursor((k) => shiftMonth(k, -1))}
              style={styles.stepBtn}
              accessibilityLabel="Previous month"
            >
              <AppText variant="h2" color={colors.text} style={styles.stepGlyph}>
                ‹
              </AppText>
            </Pressable>
            <View style={styles.pickerValue}>
              <AppText variant="h2" color={colors.accent}>
                {monthLabel(cursor)}
              </AppText>
              {alreadyAdded ? (
                <AppText variant="label" color={colors.warn}>
                  Already in list
                </AppText>
              ) : (
                <AppText variant="label" color={colors.textFaint}>
                  Tap Add to include
                </AppText>
              )}
            </View>
            <Pressable
              onPress={() => setCursor((k) => shiftMonth(k, 1))}
              style={styles.stepBtn}
              accessibilityLabel="Next month"
            >
              <AppText variant="h2" color={colors.text} style={styles.stepGlyph}>
                ›
              </AppText>
            </Pressable>
          </View>
          <View style={styles.pickerActions}>
            <Pressable
              onPress={() => setPickerOpen(false)}
              style={[styles.pickerBtn, styles.pickerBtnGhost]}
            >
              <AppText variant="label" color={colors.textMuted}>
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              disabled={alreadyAdded}
              onPress={() => {
                onChange(cursor, '');
                setPickerOpen(false);
              }}
              style={[
                styles.pickerBtn,
                styles.pickerBtnPrimary,
                alreadyAdded && styles.pickerBtnDisabled,
              ]}
            >
              <AppText variant="label" color={colors.bg}>
                Add
              </AppText>
            </Pressable>
          </View>
        </Card>
      ) : (
        <Pressable
          onPress={() => {
            setCursor(currentMonthKey());
            setPickerOpen(true);
          }}
          style={styles.addBtn}
          accessibilityLabel="Add month rate"
        >
          <AppText variant="label" color={colors.accent}>
            ＋ Add month
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  list: { gap: spacing.sm },
  emptyCard: { gap: spacing.xs },
  row: { gap: spacing.md },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  addBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentDim,
    backgroundColor: colors.accentDim,
  },
  picker: { gap: spacing.md },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValue: { alignItems: 'center', gap: 2 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepGlyph: {
    lineHeight: 44,
    textAlign: 'center',
    width: '100%',
  },
  pickerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  pickerBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  pickerBtnGhost: {
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  pickerBtnPrimary: { backgroundColor: colors.accent },
  pickerBtnDisabled: { opacity: 0.4 },
});
