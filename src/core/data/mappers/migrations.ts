import type {
  Location,
  Meter,
  Profile,
  Reading,
  Settings,
  Source,
  UserData,
} from '@core/model';
import { SCHEMA_VERSION } from '@core/model';

/**
 * Deterministic ids for the auto-migrated single-source setup. Stable so both
 * the offline blob and the RTDB tree converge on the same keys.
 */
export const DEFAULT_LOCATION_ID = 'loc_main';
export const DEFAULT_SOURCE_ID = 'src_main_grid';

/** Shape of a v1 blob before the multi-source refactor. */
interface V1Reading {
  id: string;
  at: string;
  providerValue: number;
  houseValue: number;
  note?: string;
  createdAt?: string;
}

interface V1Profile {
  displayName: string;
  email: string;
  currency: string;
  ratePerKwh: number;
  monthlyRates?: Record<string, number>;
  createdAt: string;
}

interface V1Meters {
  provider: Meter;
  house: Meter;
}

interface V1UserData {
  profile: V1Profile;
  meters: V1Meters;
  settings: Settings;
  readings: V1Reading[] | Record<string, V1Reading>;
}

function isV2(raw: unknown): raw is UserData {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    (raw as { schemaVersion?: number }).schemaVersion === SCHEMA_VERSION
  );
}

function isV1(raw: unknown): raw is V1UserData {
  if (typeof raw !== 'object' || raw === null) return false;
  const r = raw as { profile?: unknown; meters?: unknown };
  return typeof r.profile === 'object' && typeof r.meters === 'object';
}

function readingsToArray(
  input: V1Reading[] | Record<string, V1Reading> | undefined,
): V1Reading[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return Object.entries(input).map(([id, r]) => ({ ...r, id: r.id ?? id }));
}

/**
 * Idempotent v1 → v2 migrator. Also acts as a light hydrator when the input
 * is already v2 but has partial nodes (e.g. an RTDB snapshot with no readings).
 */
export function migrateUserData(raw: unknown): UserData | null {
  if (raw == null) return null;
  if (isV2(raw)) return normalizeV2(raw);
  if (!isV1(raw)) return null;

  const v1 = raw;
  const nowIso = new Date().toISOString();

  const location: Location = {
    id: DEFAULT_LOCATION_ID,
    label: 'Main house',
    timezone: v1.settings?.timezone,
    createdAt: v1.profile.createdAt ?? nowIso,
  };

  const source: Source = {
    id: DEFAULT_SOURCE_ID,
    locationId: DEFAULT_LOCATION_ID,
    type: 'grid',
    label: 'Grid',
    ratePerKwh: v1.profile.ratePerKwh ?? 0,
    monthlyRates: v1.profile.monthlyRates ?? {},
    meterMode: 'pair', // v1 always had both meters
    providerMeter: v1.meters.provider,
    houseMeter: v1.meters.house,
    createdAt: v1.profile.createdAt ?? nowIso,
  };

  const readings: Record<string, Reading> = {};
  for (const r of readingsToArray(v1.readings)) {
    readings[r.id] = {
      id: r.id,
      sourceId: DEFAULT_SOURCE_ID,
      at: r.at,
      providerValue: r.providerValue,
      houseValue: r.houseValue,
      note: r.note,
      createdAt: r.createdAt ?? r.at,
    };
  }

  const profile: Profile = {
    displayName: v1.profile.displayName,
    email: v1.profile.email,
    currency: v1.profile.currency,
    createdAt: v1.profile.createdAt ?? nowIso,
  };

  return {
    schemaVersion: SCHEMA_VERSION,
    profile,
    settings: v1.settings,
    locations: { [location.id]: location },
    sources: { [source.id]: source },
    readings,
  };
}

/** Normalize a v2 blob: coerce missing maps to {} without losing content. */
function normalizeV2(v2: UserData): UserData {
  return {
    ...v2,
    schemaVersion: SCHEMA_VERSION,
    locations: v2.locations ?? {},
    sources: v2.sources ?? {},
    readings: v2.readings ?? {},
  };
}
