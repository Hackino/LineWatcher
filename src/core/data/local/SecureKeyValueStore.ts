/**
 * Synchronous encrypted key-value store contract (the RN equivalent of Android
 * EncryptedSharedPreferences). Implemented by encrypted MMKV; the encryption key
 * itself lives in hardware-backed secure storage (see secretStore.ts).
 */
export interface SecureKeyValueStore {
  getString(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  getObject<T>(key: string): T | null;
  setObject<T>(key: string, value: T): void;
}
