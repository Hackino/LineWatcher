import { inject, injectable } from 'tsyringe';
import type { ReadingsRepository } from '@core/domain/repositories/ReadingsRepository';
import { TOKENS } from '@core/di/tokens';

/** Leak feature's own action: adjust the absolute leak tolerance. */
@injectable()
export class UpdateLeakThreshold {
  constructor(
    @inject(TOKENS.ReadingsRepository) private readonly repo: ReadingsRepository,
  ) {}

  execute(leakThresholdKwh: number): Promise<void> {
    return this.repo.updateSettings({ leakThresholdKwh });
  }
}
