import type { InjectionToken } from 'tsyringe';
import type { SecureKeyValueStore } from '@core/data/local/SecureKeyValueStore';
import type { ReadingsRepository } from '@core/domain/repositories/ReadingsRepository';

/**
 * DI injection tokens for interfaces. TS erases interface types at runtime, so
 * each interface dependency is identified by a symbol token. Lives in `core` so
 * both `core` (consumers) and `app` (composition root) can import it without any
 * upward dependency.
 */
export const TOKENS = {
  SecureKeyValueStore: Symbol('SecureKeyValueStore') as InjectionToken<SecureKeyValueStore>,
  ReadingsRepository: Symbol('ReadingsRepository') as InjectionToken<ReadingsRepository>,
};
