import { inject, injectable } from 'tsyringe';
import type { ReadingsRepository } from '@core/domain/repositories/ReadingsRepository';
import { TOKENS } from '@core/di/tokens';

@injectable()
export class DeleteReading {
  constructor(
    @inject(TOKENS.ReadingsRepository) private readonly repo: ReadingsRepository,
  ) {}

  execute(sourceId: string, id: string): Promise<void> {
    return this.repo.deleteReading(sourceId, id);
  }
}
