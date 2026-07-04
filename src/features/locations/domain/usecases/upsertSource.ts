import { inject, injectable } from 'tsyringe';
import type { Source } from '@core/model';
import type { ReadingsRepository } from '@core/domain/repositories/ReadingsRepository';
import { TOKENS } from '@core/di/tokens';

@injectable()
export class UpsertSource {
  constructor(
    @inject(TOKENS.ReadingsRepository) private readonly repo: ReadingsRepository,
  ) {}

  execute(source: Source): Promise<void> {
    return this.repo.upsertSource(source);
  }
}
