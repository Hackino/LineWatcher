/**
 * Domain entities. These mirror the Firebase Realtime DB shape 1:1 so the mock
 * datasource and the future Firebase datasource are interchangeable.
 *
 * v2 introduces multi-house / multi-source:
 *   - a Location groups sources (a house, a shop, etc.)
 *   - a Source is one billed line (Grid, Generator, Solar) with its own rate
 *     and its own provider+house meter pair — leak = provider − house per source.
 *   - readings belong to a source (`reading.sourceId`).
 */

export const SCHEMA_VERSION = 2 as const;
export type SchemaVersion = typeof SCHEMA_VERSION;

export type SourceType = 'grid' | 'generator' | 'solar' | 'other';

/**
 * Metering setup for a source:
 *   - 'pair'   → provider + house meters. Full leak detection (default).
 *   - 'single' → one meter for consumption tracking only. Leak features locked.
 */
export type MeterMode = 'single' | 'pair';

export interface Meter {
  id: string;
  label: string;
  unit: 'kWh';
  installedAt: string; // ISO date
  initialValue: number;
}

export interface Location {
  id: string;
  label: string;
  timezone?: string;
  createdAt: string;
}

export interface Source {
  id: string;
  locationId: string;
  type: SourceType;
  label: string;
  ratePerKwh: number;
  monthlyRates: Record<string, number>;
  /**
   * How this source is metered. 'pair' keeps provider+house (leak detection);
   * 'single' uses only `providerMeter` as a plain consumption meter.
   */
  meterMode: MeterMode;
  providerMeter: Meter;
  houseMeter?: Meter; // absent for 'single' mode
  archivedAt?: string;
  createdAt: string;
}

/**
 * A single manual reading against one source. For a 'pair' source, both meter
 * counts are captured together; for a 'single' source, only `providerValue`
 * is used and `houseValue` is absent.
 */
export interface Reading {
  id: string;
  sourceId: string;
  at: string; // ISO timestamp (date, optionally with hour)
  providerValue: number;
  houseValue?: number;
  note?: string;
  createdAt: string;
}

export interface Profile {
  displayName: string;
  email: string;
  currency: string; // e.g. "USD", "LBP"
  createdAt: string;
}

export interface Settings {
  leakThresholdKwh: number; // absolute tolerance per interval
  leakThresholdPct: number; // 0..1 relative tolerance per interval
  timezone: string;
}

export type LeakStatus = 'safe' | 'alert';

/** Derived consumption between two consecutive readings of the same source. */
export interface Interval {
  fromId: string;
  toId: string;
  from: string; // ISO
  to: string; // ISO
  hours: number;
  providerDelta: number;
  houseDelta: number;
  leak: number; // providerDelta - houseDelta (consumption outside the house)
  leakPct: number; // leak / providerDelta (0 if providerDelta === 0)
  status: LeakStatus;
  costLost: number; // money value of the leak (0 if rate is 0)
}

export interface UserData {
  schemaVersion: SchemaVersion;
  profile: Profile;
  settings: Settings;
  locations: Record<string, Location>;
  sources: Record<string, Source>;
  readings: Record<string, Reading>;
}
