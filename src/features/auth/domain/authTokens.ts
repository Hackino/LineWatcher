import type { InjectionToken } from 'tsyringe';
import type { AuthRepository } from './repositories/AuthRepository';

/** Auth feature's DI token (lives in the feature, not core). */
export const AUTH_TOKENS = {
  AuthRepository: Symbol('AuthRepository') as InjectionToken<AuthRepository>,
};
