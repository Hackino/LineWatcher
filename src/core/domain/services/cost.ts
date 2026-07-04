/** Cost domain service. Pure. */

/** Money value of a kWh amount at a given per-kWh rate. */
export function estimateCost(kwh: number, ratePerKwh: number): number {
  if (!ratePerKwh || ratePerKwh <= 0) return 0;
  return Math.max(0, kwh) * ratePerKwh;
}
