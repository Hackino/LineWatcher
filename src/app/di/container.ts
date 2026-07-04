import { container } from 'tsyringe';
import { TOKENS } from '@core/di/tokens';
import { createEncryptedKvStore } from '@core/data/local/encryptedKvStore';
import { MockReadingsDataSource } from '@core/data/datasources/mockReadingsDataSource';
import { FirebaseReadingsDataSource } from '@core/data/datasources/firebaseReadingsDataSource';
import { AUTH_TOKENS } from '@features/auth/domain/authTokens';
import { MockAuthDataSource } from '@features/auth/data/mockAuthDataSource';
import { FirebaseAuthDataSource } from '@features/auth/data/firebaseAuthDataSource';

/** Offline mode: set EXPO_PUBLIC_USE_MOCK=1 to run without Firebase (seed data). */
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1';

/**
 * Composition root. Provisions the encrypted store (async), then wires the graph
 * and picks mock vs Firebase implementations. Call once at app bootstrap.
 */
export async function configureContainer(): Promise<void> {
  const kvStore = await createEncryptedKvStore();
  container.registerInstance(TOKENS.SecureKeyValueStore, kvStore);

  container.register(TOKENS.ReadingsRepository, {
    useClass: USE_MOCK ? MockReadingsDataSource : FirebaseReadingsDataSource,
  });
  container.register(AUTH_TOKENS.AuthRepository, {
    useClass: USE_MOCK ? MockAuthDataSource : FirebaseAuthDataSource,
  });
}

export { container };
