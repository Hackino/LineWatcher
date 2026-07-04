import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { container } from 'tsyringe';
import {
  Screen,
  PrimaryButton,
  EmptyState,
  ErrorState,
  Segmented,
  SourceChip,
  HistorySkeleton,
  ConfirmDialog,
  spacing,
} from '@ds';
import { formatDateTime } from '@shared/format';
import {
  useLeakSummary,
  useSelectedLocation,
  useSelectedSource,
  useSourceReadings,
  useUserData,
  useDataError,
  useDataRetry,
} from '@core/state';
import type { Interval, Reading } from '@core/model';
import type { RootStackParamList } from '@app/navigation/types';
import { ReadingRow } from '../components/ReadingRow';
import { DeleteReading } from '../../domain/usecases/deleteReading';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Range = '7d' | '30d' | 'all';

const RANGE_DAYS: Record<Range, number | null> = { '7d': 7, '30d': 30, all: null };

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const data = useUserData();
  const summary = useLeakSummary();
  const location = useSelectedLocation();
  const source = useSelectedSource();
  const readings = useSourceReadings(source?.id ?? null);
  const error = useDataError();
  const retry = useDataRetry();
  const [range, setRange] = useState<Range>('30d');
  const [pendingDelete, setPendingDelete] = useState<Reading | null>(null);

  const intervalByToId = useMemo(() => {
    const map = new Map<string, Interval>();
    summary?.intervals.forEach((iv) => map.set(iv.toId, iv));
    return map;
  }, [summary]);

  const rows = useMemo(() => {
    const days = RANGE_DAYS[range];
    const cutoff = days ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;
    return readings
      .filter((r) => new Date(r.at).getTime() >= cutoff)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [readings, range]);

  if (error && !data) {
    return (
      <Screen title="History" eyebrow="Readings">
        <ErrorState message={error} onRetry={retry ?? undefined} />
      </Screen>
    );
  }

  if (!data || !summary || !source || !location) {
    return <HistorySkeleton />;
  }

  const onConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, sourceId } = pendingDelete;
    setPendingDelete(null);
    await container.resolve(DeleteReading).execute(sourceId, id);
  };

  return (
    <Screen
      title="History"
      eyebrow="Readings"
      right={
        <PrimaryButton
          label="Add"
          icon="＋"
          variant="ghost"
          onPress={() => navigation.navigate('AddReading')}
          style={styles.addBtn}
        />
      }
    >
      <SourceChip
        locationLabel={location.label}
        sourceLabel={source.label}
        onPress={() => navigation.navigate('SourcePicker')}
      />

      <Segmented
        options={[
          { value: '7d', label: '7 days' },
          { value: '30d', label: '30 days' },
          { value: 'all', label: 'All' },
        ]}
        value={range}
        onChange={(v) => setRange(v as Range)}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No readings yet"
          message="Readings you add will appear here with the computed leak for each step."
        />
      ) : (
        <View style={styles.list}>
          {rows.map((r) => (
            <ReadingRow
              key={r.id}
              at={r.at}
              providerValue={r.providerValue}
              houseValue={r.houseValue}
              interval={intervalByToId.get(r.id) ?? null}
              showLeakColumn={source.meterMode === 'pair'}
              onPress={() => navigation.navigate('ReadingDetail', { readingId: r.id })}
              onLongPress={() => setPendingDelete(r)}
            />
          ))}
        </View>
      )}

      <ConfirmDialog
        visible={pendingDelete !== null}
        eyebrow="Reading"
        title="Delete this reading?"
        message={
          pendingDelete
            ? `${formatDateTime(pendingDelete.at)} will be removed. Leak stats around this point will be recomputed.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        tone="danger"
        onConfirm={onConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: { height: 40, paddingHorizontal: spacing.lg },
  list: { gap: spacing.sm },
});
