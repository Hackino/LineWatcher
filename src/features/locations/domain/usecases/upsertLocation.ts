import { inject, injectable } from 'tsyringe';
import type { Location } from '@core/model';
import type { ReadingsRepository } from '@core/domain/repositories/ReadingsRepository';
import { TOKENS } from '@core/di/tokens';

@injectable()
export class UpsertLocation {
  constructor(
    @inject(TOKENS.ReadingsRepository) private readonly repo: ReadingsRepository,
  ) {}

  execute(location: Location): Promise<void> {
    return this.repo.upsertLocation(location);
  }
}
