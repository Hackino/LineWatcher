import type { Reading, Source } from '@core/model';

/** "YYYY-MM" key for the month a timestamp falls in. */
export function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Rate that applies on a given date: the source's month override, else its default. */
export function rateForDate(source: Source, iso: string): number {
  const override = source.monthlyRates?.[monthKey(iso)];
  return override != null ? override : source.ratePerKwh;
}

/** Distinct months present in the readings, newest first. */
export function monthsInReadings(readings: Reading[]): string[] {
  const set = new Set<string>();
  for (const r of readings) set.add(monthKey(r.at));
  return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
}
