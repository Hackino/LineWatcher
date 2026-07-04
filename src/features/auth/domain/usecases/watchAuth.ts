import { inject, injectable } from 'tsyringe';
import type { AuthRepository, AuthUser } from '../repositories/AuthRepository';
import { AUTH_TOKENS } from '../authTokens';

@injectable()
export class WatchAuth {
  constructor(@inject(AUTH_TOKENS.AuthRepository) private readonly repo: AuthRepository) {}
  execute(onChange: (user: AuthUser | null) => void): () => void {
    return this.repo.watch(onChange);
  }
}
