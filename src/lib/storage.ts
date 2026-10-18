/**
 * Every key the app writes lives here, so the privacy notice, the on-page data
 * controls, and the code can never drift apart.
 *
 * Every one is strictly necessary to do the thing the user asked for:
 *  - intention: the note the user explicitly saves
 *  - impulseBest: the drill score the user asked to keep
 *  - micConsent: the record of the microphone notice the user accepted
 *  - audioSettings: whether sound is on, which scene, how loud, and whether
 *    chimes are wanted. Sound is off until the user turns it on.
 *
 * No identifiers, no analytics, no cookies.
 */
export const STORAGE_KEYS = {
  intention: 'shiftedmind.toneLab.intention.v1',
  impulseBest: 'shiftedmind.toneLab.impulseBest.v1',
  micConsent: 'shiftedmind.toneLab.micConsent.v1',
  audioSettings: 'shiftedmind.toneLab.audio.v1',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export interface StoredItem {
  key: StorageKey;
  value: string | null;
}

function safeStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readRaw(key: StorageKey, storage: Storage | null = safeStorage()): string | null {
  try {
    return storage ? storage.getItem(key) : null;
  } catch {
    return null;
  }
}

export function writeRaw(key: StorageKey, value: string, storage: Storage | null = safeStorage()): boolean {
  try {
    storage?.setItem(key, value);
    return Boolean(storage);
  } catch {
    return false;
  }
}

export function removeRaw(key: StorageKey, storage: Storage | null = safeStorage()): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Nothing to do: storage is unavailable, so nothing is stored either.
  }
}

export function listStored(storage: Storage | null = safeStorage()): StoredItem[] {
  return Object.values(STORAGE_KEYS).map((key) => ({ key, value: readRaw(key, storage) }));
}

/**
 * Fired on `window` after the user clears local data, so live components stop
 * showing values that no longer exist. Browsers do not fire `storage` for
 * writes made in the same tab, which is exactly the case here.
 */
export const LOCAL_DATA_EVENT = 'shiftedmind:toneLab:local-data';

export function announceLocalDataChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(LOCAL_DATA_EVENT));
}

/** Clears only this app's keys; never touches other data on the origin. */
export function clearLocalData(storage: Storage | null = safeStorage()): void {
  for (const key of Object.values(STORAGE_KEYS)) removeRaw(key, storage);
  announceLocalDataChange();
}

/** Clears one key, announcing the change so the UI can update in place. */
export function clearLocalKey(key: StorageKey, storage: Storage | null = safeStorage()): void {
  removeRaw(key, storage);
  announceLocalDataChange();
}

export function storageAvailable(storage: Storage | null = safeStorage()): boolean {
  return Boolean(storage);
}

export function readJson<T>(key: StorageKey, storage: Storage | null = safeStorage()): T | null {
  const raw = readRaw(key, storage);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export interface MicConsentRecord {
  version: string;
  acceptedAt: string;
}

export function readMicConsent(storage: Storage | null = safeStorage()): MicConsentRecord | null {
  const raw = readRaw(STORAGE_KEYS.micConsent, storage);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      'acceptedAt' in parsed &&
      typeof (parsed as MicConsentRecord).version === 'string' &&
      typeof (parsed as MicConsentRecord).acceptedAt === 'string'
    ) {
      return parsed as MicConsentRecord;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeMicConsent(version: string, storage: Storage | null = safeStorage()): boolean {
  return writeRaw(
    STORAGE_KEYS.micConsent,
    JSON.stringify({ version, acceptedAt: new Date().toISOString() } satisfies MicConsentRecord),
    storage,
  );
}
