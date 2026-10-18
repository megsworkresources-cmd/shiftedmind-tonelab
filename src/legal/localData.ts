import { STORAGE_KEYS, type StorageKey } from '../lib/storage';

export interface LocalDataInfo {
  key: StorageKey;
  label: string;
  purpose: string;
  retention: string;
}

/**
 * Human-readable metadata for every key the app writes. The local-data page and
 * the privacy notice both describe the same three entries; keeping the
 * descriptions here stops the copy from drifting from the code.
 */
export const LOCAL_DATA_INFO: Record<StorageKey, LocalDataInfo> = {
  [STORAGE_KEYS.intention]: {
    key: STORAGE_KEYS.intention,
    label: 'Your intention',
    purpose: 'The one sentence you asked us to keep in the “carry it” section, with the date you saved it.',
    retention: 'Until you clear it here, or clear your browser data.',
  },
  [STORAGE_KEYS.impulseBest]: {
    key: STORAGE_KEYS.impulseBest,
    label: 'Best impulse-drill score',
    purpose: 'The highest number of urges you have caught in the 20-second drill on this device.',
    retention: 'Until you clear it here, or clear your browser data.',
  },
  [STORAGE_KEYS.micConsent]: {
    key: STORAGE_KEYS.micConsent,
    label: 'Microphone notice acknowledgement',
    purpose: 'A record of the date and version of the microphone notice you accepted, so we do not ask again.',
    retention: 'Until you clear it here. Clearing it makes the notice appear before the next recording.',
  },
  [STORAGE_KEYS.audioSettings]: {
    key: STORAGE_KEYS.audioSettings,
    label: 'Sound settings',
    purpose:
      'Whether ambient sound is on, which scene, how loud, and whether the quiet interaction chimes play. Sound is off until you turn it on.',
    retention: 'Until you clear it here, or clear your browser data.',
  },
};

export function describeEntry(key: string): LocalDataInfo | null {
  return LOCAL_DATA_INFO[key as StorageKey] ?? null;
}

/** Turns a stored raw value into something a person can read. */
export function presentValue(key: StorageKey, value: string | null): string {
  if (value === null) return 'Not set';
  if (key === STORAGE_KEYS.impulseBest) {
    const score = Number.parseInt(value, 10);
    return Number.isFinite(score) ? `${score} caught` : value;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null) {
      const record = parsed as Record<string, unknown>;
      if (key === STORAGE_KEYS.audioSettings) {
        const on = record.enabled === true;
        const scene = typeof record.scene === 'string' ? record.scene : 'rain';
        const volume = typeof record.volume === 'number' ? Math.round(record.volume * 100) : 0;
        const chimes = record.chimes === false ? 'chimes off' : 'chimes on';
        return on ? `On · ${scene} · ${volume}% · ${chimes}` : 'Off — no sound is playing';
      }
      if (typeof record.text === 'string') {
        const when = typeof record.at === 'string' ? new Date(record.at) : null;
        const date = when && !Number.isNaN(when.valueOf()) ? when.toLocaleDateString() : 'unknown date';
        return `“${record.text}” — saved ${date}`;
      }
      if (typeof record.version === 'string' && typeof record.acceptedAt === 'string') {
        const when = new Date(record.acceptedAt);
        const date = Number.isNaN(when.valueOf()) ? 'unknown date' : when.toLocaleString();
        return `Accepted version ${record.version} on ${date}`;
      }
    }
  } catch {
    // Fall through to the raw value: it is still the user's data.
  }
  return value;
}
