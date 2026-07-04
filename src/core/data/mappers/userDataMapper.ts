import type { Location, Reading, Source, UserData } from '@core/model';
import { SCHEMA_VERSION } from '@core/model';
import {
  DEFAULT_LOCATION_ID,
  DEFAULT_SOURCE_ID,
  migrateUserData,
} from './migrations';

/**
 * Sensible defaults for a brand-new user: one location ("Main house") with one
 * empty Grid source (0.28/kWh fallback). Chosen so a fresh account has a
 * usable "context" to select before the user adds their own locations.
 */
export function defaultUserData(email: string | null): UserData {
  const now = new Date().toISOString();
  const location: Location = {
    id: DEFAULT_LOCATION_ID,
    label: 'Main house',
    timezone: 'local',
    createdAt: now,
  };
  const source: Source = {
    id: DEFAULT_SOURCE_ID,
    locationId: DEFAULT_LOCATION_ID,
    type: 'grid',
    label: 'Grid',
    ratePerKwh: 0.28,
    monthlyRates: {},
    meterMode: 'pair',
    providerMeter: {
      id: 'provider',
      label: 'Provider meter',
      unit: 'kWh',
      installedAt: now,
      initialValue: 0,
    },
    houseMeter: {
      id: 'house',
      label: 'House meter',
      unit: 'kWh',
      installedAt: now,
      initialValue: 0,
    },
    createdAt: now,
  };
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      displayName: email ? email.split('@')[0] : 'My House',
      email: email ?? '',
      currency: 'USD',
      createdAt: now,
    },
    settings: { leakThresholdKwh: 1, leakThresholdPct: 0.05, timezone: 'local' },
    locations: { [location.id]: location },
    sources: { [source.id]: source },
    readings: {},
  };
}

/**
 * Map a Firebase RTDB `users/{uid}` snapshot into a UserData entity. Handles:
 *  - v2 shape (nested locations/sources/readings) — hydrate as-is.
 *  - v1 shape (single provider/house meters + flat readings) — auto-migrate.
 *  - a partial snapshot with missing children — fall back to defaults.
 *
 * v1→v2 write-back is the caller's responsibility (datasource watches for the
 * schemaVersion bump and pushes a one-shot `set()`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function userDataFromDb(val: any, email: string | null): UserData {
  const d = defaultUserData(email);
  if (!val) return d;

  // v2 path — RTDB stores readings bucketed under `readings/{srcId}/{id}`.
  if (val.schemaVersion === SCHEMA_VERSION) {
    return hydrateV2(val, d);
  }

  const migrated = migrateUserData(val);
  return migrated ?? d;
}

/** RTDB may serialize record-shape entities as objects with keys. Rehydrate. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hydrateV2(val: any, defaults: UserData): UserData {
  const locations: Record<string, Location> = {};
  const rawLocations = (val.locations ?? {}) as Record<string, Location>;
  for (const [id, l] of Object.entries(rawLocations)) {
    locations[id] = { ...l, id };
  }

  const sources: Record<string, Source> = {};
  const rawSources = (val.sources ?? {}) as Record<string, Source>;
  for (const [id, s] of Object.entries(rawSources)) {
    // Default 'pair' for legacy RTDB rows without meterMode — they had both
    // meters, so leak detection stays on.
    const meterMode = s.meterMode ?? 'pair';
    sources[id] = {
      ...s,
      id,
      monthlyRates: s.monthlyRates ?? {},
      meterMode,
      houseMeter: meterMode === 'pair' ? s.houseMeter : undefined,
    };
  }

  const readings: Record<string, Reading> = {};
  const rawReadings = (val.readings ?? {}) as Record<
    string,
    Record<string, Reading>
  >;
  for (const [srcId, bucket] of Object.entries(rawReadings)) {
    for (const [id, r] of Object.entries(bucket)) {
      readings[id] = {
        id,
        sourceId: srcId,
        at: r.at,
        providerValue: r.providerValue,
        houseValue: r.houseValue,
        note: r.note,
        createdAt: r.createdAt ?? r.at,
      };
    }
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    profile: { ...defaults.profile, ...(val.profile ?? {}) },
    settings: { ...defaults.settings, ...(val.settings ?? {}) },
    locations: Object.keys(locations).length ? locations : defaults.locations,
    sources: Object.keys(sources).length ? sources : defaults.sources,
    readings,
  };
}
