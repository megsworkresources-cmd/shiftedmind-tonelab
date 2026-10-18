import { describe, expect, it } from 'vitest';
import {
  STORAGE_KEYS,
  clearLocalData,
  clearLocalKey,
  readMicConsent,
  readRaw,
  writeMicConsent,
  writeRaw,
} from '../lib/storage';
import { LEGAL, MIC_NOTICE_VERSION } from './config';
import { LOCAL_DATA_INFO, presentValue } from './localData';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('operator identity', () => {
  it('shows the template banner exactly while bracketed placeholders remain', () => {
    const bracketed = Object.values(LEGAL).filter(
      (value) => typeof value === 'string' && /\[[^\]]+\]/.test(value),
    );
    // Filling in the real details without flipping the flag (or the reverse)
    // would leave the banner lying about the state of the notice.
    expect(LEGAL.placeholders).toBe(bracketed.length > 0);
  });

  it('dates the microphone notice so a copy change can force re-consent', () => {
    expect(MIC_NOTICE_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('local data inventory', () => {
  it('describes every key the app can write, with no extras', () => {
    const keys = Object.values(STORAGE_KEYS).sort();
    const described = Object.keys(LOCAL_DATA_INFO).sort();
    expect(described).toEqual(keys);
  });

  it('names each entry once so the data page cannot show duplicates', () => {
    const labels = Object.values(LOCAL_DATA_INFO).map((info) => info.label);
    expect(new Set(labels).size).toBe(labels.length);
    for (const info of Object.values(LOCAL_DATA_INFO)) {
      expect(info.purpose.length).toBeGreaterThan(20);
      expect(info.retention.length).toBeGreaterThan(10);
    }
  });

  it('uses namespaced, versioned keys', () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      expect(key).toMatch(/^shiftedmind\.toneLab\.[a-zA-Z]+\.v\d+$/);
    }
  });
});

describe('microphone consent record', () => {
  it('round-trips a version and timestamp', () => {
    const storage = new MemoryStorage();
    expect(writeMicConsent('2026-10-17', storage)).toBe(true);
    const record = readMicConsent(storage);
    expect(record?.version).toBe('2026-10-17');
    expect(Number.isNaN(new Date(record?.acceptedAt ?? '').valueOf())).toBe(false);
  });

  it('returns null rather than throwing when the value is corrupt', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.micConsent, 'not json');
    expect(readMicConsent(storage)).toBeNull();
    storage.setItem(STORAGE_KEYS.micConsent, JSON.stringify({ version: 3 }));
    expect(readMicConsent(storage)).toBeNull();
  });

  it('treats a stale notice version as not acknowledged', () => {
    const storage = new MemoryStorage();
    writeMicConsent('2025-01-01', storage);
    expect(readMicConsent(storage)?.version).not.toBe('2026-10-17');
  });
});

describe('clearing local data', () => {
  it('removes only this app’s keys and leaves other origin data alone', () => {
    const storage = new MemoryStorage();
    writeRaw(STORAGE_KEYS.intention, JSON.stringify({ text: 'Ask first', at: '2026-10-17T09:00:00.000Z' }), storage);
    writeRaw(STORAGE_KEYS.impulseBest, '12', storage);
    writeMicConsent('2026-10-17', storage);
    storage.setItem('someOtherApp.token', 'keep-me');

    clearLocalData(storage);

    for (const key of Object.values(STORAGE_KEYS)) {
      expect(readRaw(key, storage)).toBeNull();
    }
    expect(storage.getItem('someOtherApp.token')).toBe('keep-me');
  });

  it('can remove a single entry without touching the rest', () => {
    const storage = new MemoryStorage();
    writeRaw(STORAGE_KEYS.impulseBest, '9', storage);
    writeMicConsent('2026-10-17', storage);

    clearLocalKey(STORAGE_KEYS.impulseBest, storage);

    expect(readRaw(STORAGE_KEYS.impulseBest, storage)).toBeNull();
    expect(readMicConsent(storage)?.version).toBe('2026-10-17');
  });

  it('never throws when storage is unavailable or blocked', () => {
    const blocked = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
      removeItem() {
        throw new Error('blocked');
      },
      clear() {},
      key() {
        return null;
      },
      length: 0,
    } as Storage;

    expect(readRaw(STORAGE_KEYS.intention, blocked)).toBeNull();
    expect(writeRaw(STORAGE_KEYS.intention, 'x', blocked)).toBe(false);
    expect(() => clearLocalData(blocked)).not.toThrow();
  });
});

describe('presenting stored values', () => {
  it('renders an intention with its save date', () => {
    const text = presentValue(
      STORAGE_KEYS.intention,
      JSON.stringify({ text: 'Ask for the deadline', at: '2026-10-17T09:00:00.000Z' }),
    );
    expect(text).toContain('Ask for the deadline');
    expect(text).toContain('saved');
  });

  it('renders a best score as a count, not a raw number', () => {
    expect(presentValue(STORAGE_KEYS.impulseBest, '7')).toBe('7 caught');
    expect(presentValue(STORAGE_KEYS.impulseBest, null)).toBe('Not set');
  });

  it('shows a consent acknowledgement as a version and date', () => {
    const text = presentValue(
      STORAGE_KEYS.micConsent,
      JSON.stringify({ version: '2026-10-17', acceptedAt: '2026-10-17T09:00:00.000Z' }),
    );
    expect(text).toContain('2026-10-17');
  });

  it('falls back to the raw value instead of hiding the user’s data', () => {
    expect(presentValue(STORAGE_KEYS.intention, 'legacy string')).toBe('legacy string');
  });

  it('summarises sound settings without pretending to store audio', () => {
    expect(presentValue(STORAGE_KEYS.audioSettings, null)).toBe('Not set');
    expect(
      presentValue(STORAGE_KEYS.audioSettings, JSON.stringify({ enabled: false, volume: 0.5 })),
    ).toBe('Off — no sound is playing');
    expect(
      presentValue(
        STORAGE_KEYS.audioSettings,
        JSON.stringify({ enabled: true, scene: 'tide', volume: 0.35, chimes: false }),
      ),
    ).toBe('On · tide · 35% · chimes off');
  });
});
