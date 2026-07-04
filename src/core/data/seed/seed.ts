import type { Location, Reading, Source, UserData } from '@core/model';
import { SCHEMA_VERSION } from '@core/model';
import { monthKey } from '@core/domain/services/rates';
import {
  DEFAULT_LOCATION_ID,
  DEFAULT_SOURCE_ID,
} from '@core/data/mappers/migrations';

/**
 * Rich demo seed used by the mock/offline datasource. Sets up two locations
 * and four sources so every screen has meaningful content:
 *
 *   Main house
 *     • EDL Grid          (pair)   — 30d of readings + a scripted leak episode
 *     • Diesel Generator  (pair)   — 20d of clean readings, no leak
 *     • Solar Rental      (pair)   — 15d of light readings, no leak
 *   Beach house
 *     • Meter             (single) — 15d of consumption-only readings
 *
 * The Grid source stays under the deterministic `src_main_grid` id so
 * verify:domain keeps passing against the original leak episode.
 */

const HOUSE_START = 3980.0;
const PROVIDER_START = 12450.0;
const LEAK_DAYS = new Set([18, 19, 20, 21, 22, 23]);

const BEACH_LOCATION_ID = 'loc_beach';
const GENERATOR_SOURCE_ID = 'src_main_generator';
const SOLAR_SOURCE_ID = 'src_main_solar';
const BEACH_SOURCE_ID = 'src_beach_grid';

function houseConsumption(dayIndex: number): number {
  const base = 11;
  const wave = Math.sin((dayIndex / 30) * Math.PI * 2) * 2.5;
  const weekend = dayIndex % 7 === 5 || dayIndex % 7 === 6 ? 1.8 : 0;
  return round(base + wave + weekend);
}

function lineLoss(): number {
  return 0.3;
}

function leakDraw(dayIndex: number): number {
  return LEAK_DAYS.has(dayIndex) ? 3.5 + (dayIndex % 3) : 0;
}

interface Step {
  at: Date;
  houseInc: number;
  providerInc: number;
}

/** Original grid readings — DO NOT change; verify:domain asserts on these. */
export function buildSeedReadings(now: Date): Reading[] {
  const steps: Step[] = [];
  const DAYS = 30;

  for (let i = 0; i < DAYS; i++) {
    const daysAgo = DAYS - i;
    const at = new Date(now);
    at.setDate(at.getDate() - daysAgo);
    at.setHours(20, 0, 0, 0);
    const houseInc = houseConsumption(i);
    steps.push({
      at,
      houseInc,
      providerInc: round(houseInc + lineLoss() + leakDraw(i)),
    });
  }

  const todayHouse = houseConsumption(DAYS);
  steps.push({
    at: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    houseInc: round(todayHouse * 0.4),
    providerInc: round(todayHouse * 0.4 + lineLoss()),
  });
  steps.push({
    at: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    houseInc: round(todayHouse * 0.6),
    providerInc: round(todayHouse * 0.6 + lineLoss()),
  });

  steps.sort((a, b) => a.at.getTime() - b.at.getTime());
  let house = HOUSE_START;
  let provider = PROVIDER_START;

  return steps.map((s, idx) => {
    house = round(house + s.houseInc);
    provider = round(provider + s.providerInc);
    return {
      id: `seed-${idx}`,
      sourceId: DEFAULT_SOURCE_ID,
      at: s.at.toISOString(),
      providerValue: provider,
      houseValue: house,
      createdAt: s.at.toISOString(),
    };
  });
}

/** Clean pair-mode readings — used for Generator and Solar demo sources. */
function buildPairReadings(opts: {
  now: Date;
  sourceId: string;
  idPrefix: string;
  days: number;
  providerStart: number;
  houseStart: number;
  dailyKwh: (dayIndex: number) => number;
  overhead?: number;
}): Reading[] {
  const {
    now,
    sourceId,
    idPrefix,
    days,
    providerStart,
    houseStart,
    dailyKwh,
    overhead = 0.15,
  } = opts;
  let provider = providerStart;
  let house = houseStart;
  const out: Reading[] = [];
  for (let i = 0; i < days; i++) {
    const daysAgo = days - i;
    const at = new Date(now);
    at.setDate(at.getDate() - daysAgo);
    at.setHours(20, 30, 0, 0);
    const houseInc = dailyKwh(i);
    house = round(house + houseInc);
    provider = round(provider + houseInc + overhead);
    out.push({
      id: `${idPrefix}-${i}`,
      sourceId,
      at: at.toISOString(),
      providerValue: provider,
      houseValue: house,
      createdAt: at.toISOString(),
    });
  }
  return out;
}

/** Single-meter demo readings — beach house grid meter, consumption only. */
function buildSingleReadings(opts: {
  now: Date;
  sourceId: string;
  idPrefix: string;
  days: number;
  start: number;
  dailyKwh: (dayIndex: number) => number;
}): Reading[] {
  const { now, sourceId, idPrefix, days, start, dailyKwh } = opts;
  let value = start;
  const out: Reading[] = [];
  for (let i = 0; i < days; i++) {
    const daysAgo = days - i;
    const at = new Date(now);
    at.setDate(at.getDate() - daysAgo);
    at.setHours(19, 0, 0, 0);
    value = round(value + dailyKwh(i));
    out.push({
      id: `${idPrefix}-${i}`,
      sourceId,
      at: at.toISOString(),
      providerValue: value,
      createdAt: at.toISOString(),
    });
  }
  return out;
}

export function buildSeedUserData(now: Date): UserData {
  const nowIso = now.toISOString();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

  const mainLocation: Location = {
    id: DEFAULT_LOCATION_ID,
    label: 'Main house',
    timezone: 'local',
    createdAt: nowIso,
  };
  const beachLocation: Location = {
    id: BEACH_LOCATION_ID,
    label: 'Beach house',
    timezone: 'local',
    createdAt: nowIso,
  };

  const gridSource: Source = {
    id: DEFAULT_SOURCE_ID,
    locationId: DEFAULT_LOCATION_ID,
    type: 'grid',
    label: 'EDL Grid',
    ratePerKwh: 0.28,
    monthlyRates: {
      [monthKey(prevMonth.toISOString())]: 0.31,
      [monthKey(nowIso)]: 0.26,
    },
    meterMode: 'pair',
    providerMeter: {
      id: 'meter-grid-provider',
      label: 'Provider meter',
      unit: 'kWh',
      installedAt: nowIso,
      initialValue: PROVIDER_START,
    },
    houseMeter: {
      id: 'meter-grid-house',
      label: 'House meter',
      unit: 'kWh',
      installedAt: nowIso,
      initialValue: HOUSE_START,
    },
    createdAt: nowIso,
  };

  const generatorSource: Source = {
    id: GENERATOR_SOURCE_ID,
    locationId: DEFAULT_LOCATION_ID,
    type: 'generator',
    label: 'Diesel Generator',
    ratePerKwh: 0.42,
    monthlyRates: { [monthKey(nowIso)]: 0.45 },
    meterMode: 'pair',
    providerMeter: {
      id: 'meter-gen-provider',
      label: 'Generator meter',
      unit: 'kWh',
      installedAt: nowIso,
      initialValue: 8420,
    },
    houseMeter: {
      id: 'meter-gen-house',
      label: 'House submeter',
      unit: 'kWh',
      installedAt: nowIso,
      initialValue: 2160,
    },
    createdAt: nowIso,
  };

  const solarSource: Source = {
    id: SOLAR_SOURCE_ID,
    locationId: DEFAULT_LOCATION_ID,
    type: 'solar',
    label: 'Solar Rental',
    ratePerKwh: 0.19,
    monthlyRates: {},
    meterMode: 'pair',
    providerMeter: {
      id: 'meter-solar-provider',
      label: 'Panel meter',
      unit: 'kWh',
      installedAt: nowIso,
      initialValue: 5210,
    },
    houseMeter: {
      id: 'meter-solar-house',
      label: 'House submeter',
      unit: 'kWh',
      installedAt: nowIso,
      initialValue: 1090,
    },
    createdAt: nowIso,
  };

  const beachSource: Source = {
    id: BEACH_SOURCE_ID,
    locationId: BEACH_LOCATION_ID,
    type: 'grid',
    label: 'Beach Meter',
    ratePerKwh: 0.24,
    monthlyRates: {},
    meterMode: 'single',
    providerMeter: {
      id: 'meter-beach',
      label: 'Meter',
      unit: 'kWh',
      installedAt: nowIso,
      initialValue: 900,
    },
    createdAt: nowIso,
  };

  const gridReadings = buildSeedReadings(now);
  const generatorReadings = buildPairReadings({
    now,
    sourceId: GENERATOR_SOURCE_ID,
    idPrefix: 'gen',
    days: 20,
    providerStart: 8420,
    houseStart: 2160,
    overhead: 0.18,
    dailyKwh: (i) => round(4 + Math.sin(i / 4) * 1.5 + (i % 5 === 0 ? 1.2 : 0)),
  });
  const solarReadings = buildPairReadings({
    now,
    sourceId: SOLAR_SOURCE_ID,
    idPrefix: 'sol',
    days: 15,
    providerStart: 5210,
    houseStart: 1090,
    overhead: 0.05,
    dailyKwh: (i) => round(3 + Math.cos(i / 3) * 0.8),
  });
  const beachReadings = buildSingleReadings({
    now,
    sourceId: BEACH_SOURCE_ID,
    idPrefix: 'beach',
    days: 15,
    start: 900,
    dailyKwh: (i) => round(7 + Math.sin(i / 5) * 2 + (i % 7 === 0 ? 1.5 : 0)),
  });

  const readings: Record<string, Reading> = {};
  for (const r of [
    ...gridReadings,
    ...generatorReadings,
    ...solarReadings,
    ...beachReadings,
  ]) {
    readings[r.id] = r;
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      displayName: 'Rami',
      email: 'you@example.com',
      currency: 'USD',
      createdAt: nowIso,
    },
    settings: {
      leakThresholdKwh: 1.0,
      leakThresholdPct: 0.05,
      timezone: 'local',
    },
    locations: {
      [mainLocation.id]: mainLocation,
      [beachLocation.id]: beachLocation,
    },
    sources: {
      [gridSource.id]: gridSource,
      [generatorSource.id]: generatorSource,
      [solarSource.id]: solarSource,
      [beachSource.id]: beachSource,
    },
    readings,
  };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
