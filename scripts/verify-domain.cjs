// Verifies the ported domain kernel in node, through the app's Babel transforms
// (metadata + decorators + module-resolver aliases). Run from mobile/:
//   node scripts/verify-domain.cjs
require('reflect-metadata');
require('@babel/register')({
  extensions: ['.ts'],
  presets: ['@babel/preset-typescript'],
  plugins: [
    'babel-plugin-transform-typescript-metadata',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
          '@app': './src/app',
          '@core': './src/core',
          '@shared': './src/shared',
          '@ds': './src/design-system',
          '@features': './src/features',
        },
      },
    ],
  ],
});

const {
  summarizeLeak,
  computeIntervals,
  classifyLeak,
  validateReading,
  estimateCost,
  rateForDate,
} = require('../src/core/domain/services/index.ts');
const { buildSeedUserData } = require('../src/core/data/seed/seed.ts');
const { DEFAULT_SOURCE_ID } = require('../src/core/data/mappers/migrations.ts');
const { migrateUserData } = require('../src/core/data/mappers/migrations.ts');

let failures = 0;
function assert(name, cond) {
  console.log(`  ${cond ? '✓' : '✗'} ${name}`);
  if (!cond) failures++;
}

const now = new Date('2026-07-01T21:00:00Z');
const data = buildSeedUserData(now);
const source = data.sources[DEFAULT_SOURCE_ID];
const readings = Object.values(data.readings)
  .filter((r) => r.sourceId === source.id)
  .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
const summary = summarizeLeak(readings, data.settings, source);

console.log('Leak summary:');
assert('seed produces readings', readings.length > 20);
assert('leak episode detected (alert)', summary.status === 'alert');
assert('suspicious intervals > 0', summary.suspiciousCount > 0);
assert('total leak positive', summary.totalLeak > 0);
assert('money lost tracked', summary.totalCostLost > 0);
assert(
  'intervals = readings - 1',
  computeIntervals(readings, data.settings, source).length === readings.length - 1,
);
assert('healthy interval safe', classifyLeak(0.3, 12, data.settings) === 'safe');
assert('large leak alert', classifyLeak(5, 12, data.settings) === 'alert');

console.log('Validation:');
const last = readings[readings.length - 1];
const at = new Date(now.getTime() + 3600_000).toISOString();
assert(
  'below previous rejected',
  !validateReading({ at, providerValue: last.providerValue - 5, houseValue: last.houseValue }, readings).ok,
);
assert(
  'valid reading passes',
  validateReading({ at, providerValue: last.providerValue + 2, houseValue: last.houseValue + 1 }, readings).ok,
);

console.log('Cost & rates:');
assert('estimateCost multiplies', Math.abs(estimateCost(10, 0.28) - 2.8) < 1e-9);
assert('estimateCost floors at 0', estimateCost(-5, 0.28) === 0);
assert('rate off when 0', estimateCost(10, 0) === 0);
assert('current month rate 0.26', rateForDate(source, now.toISOString()) === 0.26);
const prev = new Date(now.getFullYear(), now.getMonth() - 1, 15);
assert('previous month rate 0.31', rateForDate(source, prev.toISOString()) === 0.31);
assert('unknown month → default 0.28', rateForDate(source, '2000-01-15T12:00:00Z') === 0.28);

console.log('Migration v1 → v2:');
const nowIso = now.toISOString();
const v1 = {
  profile: {
    displayName: 'Old House',
    email: 'user@example.com',
    currency: 'USD',
    ratePerKwh: 0.4,
    monthlyRates: { '2026-06': 0.42 },
    createdAt: nowIso,
  },
  meters: {
    provider: { id: 'p', label: 'Provider', unit: 'kWh', installedAt: nowIso, initialValue: 100 },
    house: { id: 'h', label: 'House', unit: 'kWh', installedAt: nowIso, initialValue: 50 },
  },
  settings: { leakThresholdKwh: 1, leakThresholdPct: 0.05, timezone: 'local' },
  readings: [
    { id: 'r1', at: nowIso, providerValue: 110, houseValue: 60, createdAt: nowIso },
    { id: 'r2', at: nowIso, providerValue: 115, houseValue: 64, createdAt: nowIso },
  ],
};
const migrated = migrateUserData(v1);
assert('migrated has schemaVersion 2', migrated.schemaVersion === 2);
assert('main location created', !!migrated.locations['loc_main']);
assert('main grid source created', !!migrated.sources['src_main_grid']);
assert('source carries v1 rate', migrated.sources['src_main_grid'].ratePerKwh === 0.4);
assert('source carries v1 monthlyRates', migrated.sources['src_main_grid'].monthlyRates['2026-06'] === 0.42);
assert('all readings kept', Object.keys(migrated.readings).length === 2);
assert('readings carry sourceId', migrated.readings.r1.sourceId === 'src_main_grid');
assert('profile has no rate leak', migrated.profile.ratePerKwh === undefined);
const twice = migrateUserData(migrated);
assert('migrator is idempotent (v2 → v2)', twice.schemaVersion === 2 && twice.sources['src_main_grid'].ratePerKwh === 0.4);

console.log('Single-meter source:');
const singleSource = {
  id: 'src_single',
  locationId: 'loc_main',
  type: 'grid',
  label: 'Meter only',
  ratePerKwh: 0.3,
  monthlyRates: {},
  meterMode: 'single',
  providerMeter: {
    id: 'm1',
    label: 'Meter',
    unit: 'kWh',
    installedAt: nowIso,
    initialValue: 0,
  },
  createdAt: nowIso,
};
const singleReadings = [
  { id: 'a', sourceId: 'src_single', at: '2026-06-01T20:00:00Z', providerValue: 100, createdAt: nowIso },
  { id: 'b', sourceId: 'src_single', at: '2026-06-02T20:00:00Z', providerValue: 112, createdAt: nowIso },
  { id: 'c', sourceId: 'src_single', at: '2026-06-03T20:00:00Z', providerValue: 125, createdAt: nowIso },
];
const singleSummary = summarizeLeak(singleReadings, data.settings, singleSource);
assert('single-mode intervals computed', singleSummary.intervals.length === 2);
assert('single-mode provider delta preserved', singleSummary.intervals[0].providerDelta === 12);
assert('single-mode leak always 0', singleSummary.totalLeak === 0);
assert('single-mode status always safe', singleSummary.status === 'safe');
assert('single-mode cost always 0', singleSummary.totalCostLost === 0);
assert(
  'single-mode validation ignores houseValue',
  validateReading(
    { at: '2026-06-04T20:00:00Z', providerValue: 130, houseValue: null },
    singleReadings,
    'single',
  ).ok,
);
assert(
  'pair-mode validation still requires houseValue',
  !validateReading(
    { at: '2026-06-04T20:00:00Z', providerValue: 130, houseValue: null },
    singleReadings,
    'pair',
  ).ok,
);

console.log(`\n${failures === 0 ? 'ALL PASSED' : failures + ' FAILED'}`);
process.exit(failures === 0 ? 0 : 1);
