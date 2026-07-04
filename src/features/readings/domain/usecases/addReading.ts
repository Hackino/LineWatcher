import { inject, injectable } from 'tsyringe';
import type {
  ReadingsRepository,
  NewReading,
} from '@core/domain/repositories/ReadingsRepository';
import { TOKENS } from '@core/di/tokens';

@injectable()
export class AddReading {
  constructor(
    @inject(TOKENS.ReadingsRepository) private readonly repo: ReadingsRepository,
  ) {}

  execute(input: NewReading): Promise<void> {
    return this.repo.addReading(input);
  }
}
