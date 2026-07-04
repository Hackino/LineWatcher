import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

/**
 * Hardware-backed secret vault (iOS Keychain / Android Keystore) via
 * expo-secure-store. Holds the MMKV AES key and any future auth secrets.
 */

const MMKV_KEY_ID = 'linewatch.mmkv.encryptionKey';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Returns the persisted MMKV AES key, generating + storing one on first run. */
export async function getOrCreateEncryptionKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(MMKV_KEY_ID);
  if (existing) return existing;
  const key = toHex(await Crypto.getRandomBytesAsync(16)); // 128-bit
  await SecureStore.setItemAsync(MMKV_KEY_ID, key);
  return key;
}

/** Generic secret accessors (e.g. tokens) — small values only. */
export async function getSecret(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function setSecret(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecret(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
