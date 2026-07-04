import type { Interval, Reading, Settings, Source } from '@core/model';
import { computeIntervals } from './intervals';

export interface LeakSummary {
  status: Interval['status'];
  latestLeak: number; // leak of the most recent interval
  latestLeakPct: number;
  totalLeak: number; // summed leak across all intervals
  totalCostLost: number;
  suspiciousCount: number; // intervals flagged 'alert'
  intervals: Interval[];
  suspicious: Interval[];
}

/** Roll the intervals of a single source up into its anti-theft summary. */
export function summarizeLeak(
  readings: Reading[],
  settings: Settings,
  source: Source,
): LeakSummary {
  const intervals = computeIntervals(readings, settings, source);
  const suspicious = intervals.filter((iv) => iv.status === 'alert');
  const latest = intervals[intervals.length - 1];

  return {
    status: suspicious.length > 0 ? 'alert' : 'safe',
    latestLeak: latest ? latest.leak : 0,
    latestLeakPct: latest ? latest.leakPct : 0,
    totalLeak: round(intervals.reduce((sum, iv) => sum + Math.max(0, iv.leak), 0)),
    totalCostLost: round(intervals.reduce((sum, iv) => sum + iv.costLost, 0)),
    suspiciousCount: suspicious.length,
    intervals,
    suspicious,
  };
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
