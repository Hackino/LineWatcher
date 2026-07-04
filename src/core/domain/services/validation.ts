import type { MeterMode, Reading } from '@core/model';

export interface ReadingDraft {
  at: string;
  providerValue: number | null;
  houseValue: number | null;
  note?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: Partial<Record<'providerValue' | 'houseValue' | 'at', string>>;
}

/**
 * A new reading is valid when its required meter value(s) are present and not
 * below the most recent reading before its timestamp — meters only ever count
 * up. For 'single' sources only `providerValue` is required.
 */
export function validateReading(
  draft: ReadingDraft,
  readings: Reading[],
  meterMode: MeterMode = 'pair',
): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  if (draft.providerValue == null || Number.isNaN(draft.providerValue)) {
    errors.providerValue = 'Enter the meter value';
  }
  if (meterMode === 'pair') {
    if (draft.houseValue == null || Number.isNaN(draft.houseValue)) {
      errors.houseValue = 'Enter the house meter value';
    }
  }

  // Compare against the latest reading strictly before this timestamp.
  const at = new Date(draft.at).getTime();
  const prior = readings
    .filter((r) => new Date(r.at).getTime() < at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];

  if (prior) {
    if (
      draft.providerValue != null &&
      draft.providerValue < prior.providerValue
    ) {
      errors.providerValue = `Cannot be below the previous reading (${prior.providerValue})`;
    }
    if (
      meterMode === 'pair' &&
      draft.houseValue != null &&
      prior.houseValue != null &&
      draft.houseValue < prior.houseValue
    ) {
      errors.houseValue = `Cannot be below the previous reading (${prior.houseValue})`;
    }
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
