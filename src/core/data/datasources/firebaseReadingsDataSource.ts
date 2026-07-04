import { injectable } from 'tsyringe';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
  getDatabase,
  ref,
  child,
  onValue,
  push,
  update,
  remove,
  set,
} from '@react-native-firebase/database';
import type {
  Location,
  Profile,
  Settings,
  Source,
  UserData,
} from '@core/model';
import type {
  ReadingsRepository,
  NewReading,
} from '@core/domain/repositories/ReadingsRepository';
import {
  userDataFromDb,
  defaultUserData,
} from '@core/data/mappers/userDataMapper';
import { SCHEMA_VERSION } from '@core/model';

// RTDB URL isn't embedded in google-services.json (DB is often created after
// the config file is downloaded), so it's passed explicitly via env at build
// time. Configure it in `.env` (EXPO_PUBLIC_FIREBASE_DATABASE_URL) or as the
// matching GitHub Actions secret before building. Read lazily so a mock build
// that never touches this datasource doesn't fail at module load.
function databaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL;
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_FIREBASE_DATABASE_URL is not set — copy .env.example to .env ' +
        'and fill in your Realtime Database URL.',
    );
  }
  return url;
}

/**
 * Realtime datasource: subscribes to `users/{uid}` and pushes every change into
 * the store; mutations write to the matching child node. Implements the shared
 * ReadingsRepository contract, so it swaps 1:1 with the mock datasource.
 *
 * v2 RTDB shape:
 *   users/{uid}/schemaVersion = 2
 *   users/{uid}/profile/…
 *   users/{uid}/settings/…
 *   users/{uid}/locations/{locId}/…
 *   users/{uid}/sources/{srcId}/…
 *   users/{uid}/readings/{srcId}/{readingId}/…
 */
@injectable()
export class FirebaseReadingsDataSource implements ReadingsRepository {
  private db() {
    return getDatabase(getApp(), databaseUrl());
  }

  private userRef() {
    const uid = getAuth().currentUser?.uid;
    if (!uid) throw new Error('No authenticated user');
    return ref(this.db(), `users/${uid}`);
  }

  watch(onData: (data: UserData) => void): () => void {
    const user = getAuth().currentUser;
    if (!user) {
      onData(defaultUserData(null));
      return () => {};
    }
    const email = user.email;
    // Populate defaults immediately so screens render (empty states for a new
    // account) even before the first snapshot arrives or if the read is slow.
    onData(defaultUserData(email));
    return onValue(
      ref(this.db(), `users/${user.uid}`),
      (snap) => {
        const raw = snap.val();
        const hydrated = userDataFromDb(raw, email);
        onData(hydrated);
        // If we just migrated a v1 blob live, persist the v2 shape once.
        if (raw && raw.schemaVersion !== SCHEMA_VERSION) {
          set(ref(this.db(), `users/${user.uid}`), hydrated).catch((err) =>
            console.warn(
              '[RTDB] migration write-back failed:',
              err instanceof Error ? err.message : err,
            ),
          );
        }
      },
      (err) =>
        console.warn('[RTDB] read failed:', err instanceof Error ? err.message : err),
    );
  }

  async addReading(input: NewReading): Promise<void> {
    const { sourceId, ...payload } = input;
    await push(child(this.userRef(), `readings/${sourceId}`), payload);
  }

  async deleteReading(sourceId: string, id: string): Promise<void> {
    await remove(child(this.userRef(), `readings/${sourceId}/${id}`));
  }

  async updateSettings(patch: Partial<Settings>): Promise<void> {
    await update(child(this.userRef(), 'settings'), patch);
  }

  async updateProfile(patch: Partial<Profile>): Promise<void> {
    await update(child(this.userRef(), 'profile'), patch);
  }

  async upsertLocation(location: Location): Promise<void> {
    await set(child(this.userRef(), `locations/${location.id}`), location);
  }

  async deleteLocation(id: string): Promise<void> {
    // Cascade: cheapest correct approach is a single set() of the migrated tree.
    // For now, prune subtrees individually and let clients drop dangling data.
    await remove(child(this.userRef(), `locations/${id}`));
  }

  async upsertSource(source: Source): Promise<void> {
    await set(child(this.userRef(), `sources/${source.id}`), source);
  }

  async deleteSource(id: string): Promise<void> {
    await remove(child(this.userRef(), `sources/${id}`));
    await remove(child(this.userRef(), `readings/${id}`));
  }

  async reset(): Promise<void> {
    await set(
      this.userRef(),
      defaultUserData(getAuth().currentUser?.email ?? null),
    );
  }
}
