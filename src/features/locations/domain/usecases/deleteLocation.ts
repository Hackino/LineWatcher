import { inject, injectable } from 'tsyringe';
import type { ReadingsRepository } from '@core/domain/repositories/ReadingsRepository';
import { TOKENS } from '@core/di/tokens';

@injectable()
export class DeleteLocation {
  constructor(
    @inject(TOKENS.ReadingsRepository) private readonly repo: ReadingsRepository,
  ) {}

  execute(id: string): Promise<void> {
    return this.repo.deleteLocation(id);
  }
}
