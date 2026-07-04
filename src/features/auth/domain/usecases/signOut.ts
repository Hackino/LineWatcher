import { inject, injectable } from 'tsyringe';
import type { AuthRepository } from '../repositories/AuthRepository';
import { AUTH_TOKENS } from '../authTokens';

@injectable()
export class SignOut {
  constructor(@inject(AUTH_TOKENS.AuthRepository) private readonly repo: AuthRepository) {}
  execute(): Promise<void> {
    return this.repo.signOut();
  }
}
