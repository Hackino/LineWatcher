import { inject, injectable } from 'tsyringe';
import type { UserData } from '@core/model';
import type { ReadingsRepository } from '@core/domain/repositories/ReadingsRepository';
import { TOKENS } from '@core/di/tokens';

/**
 * App-wide bootstrap use-case: opens the realtime subscription on the readings
 * repository. The caller (app bootstrap) supplies the sink — typically the
 * meter store's setter — so this use-case stays independent of the state layer.
 */
@injectable()
export class WatchUserData {
  constructor(
    @inject(TOKENS.ReadingsRepository) private readonly repo: ReadingsRepository,
  ) {}

  execute(onData: (data: UserData) => void): () => void {
    return this.repo.watch(onData);
  }
}
