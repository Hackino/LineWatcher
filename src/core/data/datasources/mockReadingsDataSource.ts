import { inject, injectable } from 'tsyringe';
import type {
  Location,
  Profile,
  Reading,
  Settings,
  Source,
  UserData,
} from '@core/model';
import type {
  ReadingsRepository,
  NewReading,
} from '@core/domain/repositories/ReadingsRepository';
import type { SecureKeyValueStore } from '@core/data/local/SecureKeyValueStore';
import { buildSeedUserData } from '@core/data/seed/seed';
import { migrateUserData } from '@core/data/mappers/migrations';
import { TOKENS } from '@core/di/tokens';

const STORAGE_KEY = 'linewatch:userdata:v1';

/**
 * Mock/offline datasource. Seeds v2 data on first load, migrates any v1 blob
 * left over from a previous version, and persists to the encrypted secure
 * store. Implements the ReadingsRepository contract so it swaps 1:1 with the
 * Firebase datasource.
 */
@injectable()
export class MockReadingsDataSource implements ReadingsRepository {
  private readonly listeners = new Set<(data: UserData) => void>();

  constructor(
    @inject(TOKENS.SecureKeyValueStore) private readonly store: SecureKeyValueStore,
  ) {}

  private load(): UserData {
    const saved = this.store.getObject<unknown>(STORAGE_KEY);
    const migrated = saved ? migrateUserData(saved) : null;
    if (migrated) {
      // If the on-disk blob was v1, persist the migrated shape once.
      const savedVersion = (saved as { schemaVersion?: number } | null)
        ?.schemaVersion;
      if (savedVersion !== migrated.schemaVersion) {
        this.store.setObject(STORAGE_KEY, migrated);
      }
      return migrated;
    }
    const seeded = buildSeedUserData(new Date());
    this.store.setObject(STORAGE_KEY, seeded);
    return seeded;
  }

  private persist(data: UserData): void {
    this.store.setObject(STORAGE_KEY, data);
    this.listeners.forEach((l) => l(data));
  }

  watch(
    onData: (data: UserData) => void,
    _onError?: (err: Error) => void,
  ): () => void {
    onData(this.load()); // emit current immediately
    this.listeners.add(onData);
    return () => {
      this.listeners.delete(onData);
    };
  }

  async addReading(input: NewReading): Promise<void> {
    const data = this.load();
    const id = `r-${Date.now()}-${Object.keys(data.readings).length}`;
    const reading: Reading = {
      id,
      sourceId: input.sourceId,
      at: input.at,
      providerValue: input.providerValue,
      houseValue: input.houseValue,
      note: input.note,
      createdAt: new Date().toISOString(),
    };
    this.persist({
      ...data,
      readings: { ...data.readings, [id]: reading },
    });
  }

  async deleteReading(_sourceId: string, id: string): Promise<void> {
    const data = this.load();
    if (!data.readings[id]) return;
    const { [id]: _drop, ...rest } = data.readings;
    void _drop;
    this.persist({ ...data, readings: rest });
  }

  async updateSettings(patch: Partial<Settings>): Promise<void> {
    const data = this.load();
    this.persist({ ...data, settings: { ...data.settings, ...patch } });
  }

  async updateProfile(patch: Partial<Profile>): Promise<void> {
    const data = this.load();
    this.persist({ ...data, profile: { ...data.profile, ...patch } });
  }

  async upsertLocation(location: Location): Promise<void> {
    const data = this.load();
    this.persist({
      ...data,
      locations: { ...data.locations, [location.id]: location },
    });
  }

  async deleteLocation(id: string): Promise<void> {
    const data = this.load();
    if (!data.locations[id]) return;
    const { [id]: _drop, ...locations } = data.locations;
    void _drop;
    // Cascade: remove sources of the location and their readings.
    const droppedSourceIds = new Set(
      Object.values(data.sources)
        .filter((s) => s.locationId === id)
        .map((s) => s.id),
    );
    const sources = Object.fromEntries(
      Object.entries(data.sources).filter(([sid]) => !droppedSourceIds.has(sid)),
    );
    const readings = Object.fromEntries(
      Object.entries(data.readings).filter(
        ([, r]) => !droppedSourceIds.has(r.sourceId),
      ),
    );
    this.persist({ ...data, locations, sources, readings });
  }

  async upsertSource(source: Source): Promise<void> {
    const data = this.load();
    this.persist({
      ...data,
      sources: { ...data.sources, [source.id]: source },
    });
  }

  async deleteSource(id: string): Promise<void> {
    const data = this.load();
    if (!data.sources[id]) return;
    const { [id]: _drop, ...sources } = data.sources;
    void _drop;
    const readings = Object.fromEntries(
      Object.entries(data.readings).filter(([, r]) => r.sourceId !== id),
    );
    this.persist({ ...data, sources, readings });
  }

  async reset(): Promise<void> {
    this.persist(buildSeedUserData(new Date()));
  }
}
