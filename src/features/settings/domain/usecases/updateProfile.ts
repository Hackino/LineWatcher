import { inject, injectable } from 'tsyringe';
import type { Profile } from '@core/model';
import type { ReadingsRepository } from '@core/domain/repositories/ReadingsRepository';
import { TOKENS } from '@core/di/tokens';

@injectable()
export class UpdateProfile {
  constructor(
    @inject(TOKENS.ReadingsRepository) private readonly repo: ReadingsRepository,
  ) {}

  execute(patch: Partial<Profile>): Promise<void> {
    return this.repo.updateProfile(patch);
  }
}
