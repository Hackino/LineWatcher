import { useMemo } from 'react';
import type { Location, Reading, Source } from '@core/model';
import { summarizeLeak, type LeakSummary } from '@core/domain/services';
import { useMeterStore } from './meterStore';

/** The raw user data (null until the first realtime emission). */
export function useUserData() {
  return useMeterStore((s) => s.userData);
}

export function useIsLoading() {
  return useMeterStore((s) => s.loading);
}

/**
 * Message set when the data subscription failed or timed out before first
 * emission. Screens pair this with `useUserData()` — if the message is set and
 * user data is still null, they render a retryable error state instead of the
 * skeleton.
 */
export function useDataError() {
  return useMeterStore((s) => s.error);
}

/** The bootstrap-provided retry handler; null before bootstrap wires it. */
export function useDataRetry() {
  return useMeterStore((s) => s.retry);
}

/** All locations, sorted by createdAt for a stable order. */
export function useLocations(): Location[] {
  const data = useMeterStore((s) => s.userData);
  return useMemo(() => {
    if (!data) return [];
    return Object.values(data.locations).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }, [data]);
}

/** Sources of one location, non-archived first. */
export function useSourcesForLocation(locationId: string | null): Source[] {
  const data = useMeterStore((s) => s.userData);
  return useMemo(() => {
    if (!data || !locationId) return [];
    return Object.values(data.sources)
      .filter((s) => s.locationId === locationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [data, locationId]);
}

export function useSelectedLocation(): Location | null {
  const data = useMeterStore((s) => s.userData);
  const id = useMeterStore((s) => s.selectedLocationId);
  return data && id ? (data.locations[id] ?? null) : null;
}

export function useSelectedSource(): Source | null {
  const data = useMeterStore((s) => s.userData);
  const id = useMeterStore((s) => s.selectedSourceId);
  return data && id ? (data.sources[id] ?? null) : null;
}

/** Readings for the given source, sorted ascending by `at`. */
export function useSourceReadings(sourceId: string | null): Reading[] {
  const data = useMeterStore((s) => s.userData);
  return useMemo(() => {
    if (!data || !sourceId) return [];
    return Object.values(data.readings)
      .filter((r) => r.sourceId === sourceId)
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [data, sourceId]);
}

/**
 * Derived leak summary for the currently selected source. Memoized so
 * `summarizeLeak` only recomputes when the selected source or its readings
 * change — not on every render.
 */
export function useLeakSummary(): LeakSummary | null {
  const data = useMeterStore((s) => s.userData);
  const sourceId = useMeterStore((s) => s.selectedSourceId);
  return useMemo(() => {
    if (!data || !sourceId) return null;
    const source = data.sources[sourceId];
    if (!source) return null;
    const readings = Object.values(data.readings)
      .filter((r) => r.sourceId === sourceId)
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    return summarizeLeak(readings, data.settings, source);
  }, [data, sourceId]);
}
