import type {
  Location,
  Profile,
  Settings,
  Source,
  UserData,
} from '@core/model';

/** A new reading before the store assigns id/createdAt. */
export interface NewReading {
  sourceId: string;
  at: string;
  providerValue: number;
  houseValue?: number; // absent for single-meter sources
  note?: string;
}

/**
 * Domain contract for the user's meter data. Datasources (mock now, Firebase in
 * Phase 6) implement this directly — no DTO mapping is needed while the storage
 * shape equals the entity shape. `watch` emits the current data immediately and
 * again on every change (realtime).
 */
export interface ReadingsRepository {
  watch(onData: (data: UserData) => void): () => void; // returns unsubscribe

  addReading(input: NewReading): Promise<void>;
  deleteReading(sourceId: string, id: string): Promise<void>;

  updateSettings(patch: Partial<Settings>): Promise<void>;
  updateProfile(patch: Partial<Profile>): Promise<void>;

  upsertLocation(location: Location): Promise<void>;
  deleteLocation(id: string): Promise<void>;

  upsertSource(source: Source): Promise<void>;
  deleteSource(id: string): Promise<void>;

  reset(): Promise<void>;
}
