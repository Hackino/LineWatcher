import { createMMKV } from 'react-native-mmkv';
import type { SecureKeyValueStore } from './SecureKeyValueStore';
import { getOrCreateEncryptionKey } from './secretStore';

/**
 * AES-encrypted MMKV instance implementing SecureKeyValueStore. The encryption
 * key is provisioned once into hardware-backed secure storage, so everything
 * written here is ciphertext at rest. Construction is async (the key fetch is),
 * so call this once at app bootstrap and inject the result.
 */
export async function createEncryptedKvStore(): Promise<SecureKeyValueStore> {
  const encryptionKey = await getOrCreateEncryptionKey();
  const mmkv = createMMKV({ id: 'linewatch.secure', encryptionKey });

  return {
    getString: (key) => mmkv.getString(key) ?? null,
    set: (key, value) => mmkv.set(key, value),
    delete: (key) => mmkv.remove(key),
    getObject: <T>(key: string): T | null => {
      const raw = mmkv.getString(key);
      return raw ? (JSON.parse(raw) as T) : null;
    },
    setObject: <T>(key: string, value: T) => mmkv.set(key, JSON.stringify(value)),
  };
}
