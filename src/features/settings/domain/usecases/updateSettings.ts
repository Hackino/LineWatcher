import { inject, injectable } from 'tsyringe';
import type { Settings } from '@core/model';
import type { ReadingsRepository } from '@core/domain/repositories/ReadingsRepository';
import { TOKENS } from '@core/di/tokens';

@injectable()
export class UpdateSettings {
  constructor(
    @inject(TOKENS.ReadingsRepository) private readonly repo: ReadingsRepository,
  ) {}

  execute(patch: Partial<Settings>): Promise<void> {
    return this.repo.updateSettings(patch);
  }
}
