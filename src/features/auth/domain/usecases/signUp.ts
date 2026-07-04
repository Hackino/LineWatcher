import { inject, injectable } from 'tsyringe';
import type { AuthRepository } from '../repositories/AuthRepository';
import { AUTH_TOKENS } from '../authTokens';

@injectable()
export class SignUp {
  constructor(@inject(AUTH_TOKENS.AuthRepository) private readonly repo: AuthRepository) {}
  execute(email: string, password: string): Promise<void> {
    return this.repo.signUp(email, password);
  }
}
