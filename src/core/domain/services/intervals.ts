import type { Interval, Reading, Settings, Source } from '@core/model';
import { estimateCost } from './cost';
import { rateForDate } from './rates';

const MS_PER_HOUR = 1000 * 60 * 60;

/** Evaluate leak status for a single interval against the tolerances. */
export function classifyLeak(
  leak: number,
  providerDelta: number,
  settings: Settings,
): Interval['status'] {
  if (leak <= 0) return 'safe';
  const pct = providerDelta > 0 ? leak / providerDelta : 0;
  const overAbsolute = leak > settings.leakThresholdKwh;
  const overPct = pct > settings.leakThresholdPct;
  return overAbsolute && overPct ? 'alert' : 'safe';
}

/**
 * Compute the derived interval between each consecutive pair of readings of
 * a single source. Input readings are assumed sorted ascending by `at`. For
 * a 'single'-mode source, `houseDelta` and `leak` are always 0 and status is
 * always 'safe' — leak detection is not applicable.
 */
export function computeIntervals(
  readings: Reading[],
  settings: Settings,
  source: Source,
): Interval[] {
  const intervals: Interval[] = [];
  const pair = source.meterMode === 'pair';

  for (let i = 1; i < readings.length; i++) {
    const prev = readings[i - 1];
    const cur = readings[i];

    const providerDelta = round(cur.providerValue - prev.providerValue);
    const houseDelta =
      pair && cur.houseValue != null && prev.houseValue != null
        ? round(cur.houseValue - prev.houseValue)
        : 0;
    const leak = pair ? round(providerDelta - houseDelta) : 0;
    const leakPct = pair && providerDelta > 0 ? leak / providerDelta : 0;
    const hours =
      (new Date(cur.at).getTime() - new Date(prev.at).getTime()) / MS_PER_HOUR;

    intervals.push({
      fromId: prev.id,
      toId: cur.id,
      from: prev.at,
      to: cur.at,
      hours: round(hours),
      providerDelta,
      houseDelta,
      leak,
      leakPct,
      status: pair ? classifyLeak(leak, providerDelta, settings) : 'safe',
      costLost: pair ? round(estimateCost(leak, rateForDate(source, cur.at))) : 0,
    });
  }

  return intervals;
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
