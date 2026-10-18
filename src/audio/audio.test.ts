import { describe, expect, it } from 'vitest';
import {
  AmbientEngine,
  CHIMES,
  DEFAULT_SETTINGS,
  MAX_GAIN,
  SCENES,
  assertNoRemoteAudio,
  chimePeak,
  clampVolume,
  gainForVolume,
  isSceneId,
  normalizeSettings,
  sceneById,
  type ChimeKind,
} from './engine';

/** Every source file in this folder, as text. */
const sources = import.meta.glob<string>('./*.ts*', { query: '?raw', import: 'default', eager: true });

describe('the audio engine makes its own sound', () => {
  it('ships no fetched or referenced audio files anywhere in the module', () => {
    const entries = Object.entries(sources).filter(([name]) => !name.includes('.test.'));
    expect(entries.length).toBeGreaterThan(0);
    for (const [name, source] of entries) {
      // The guard's own pattern list sits between markers; everything else in
      // these files is scanned.
      const stripped = source.replace(/\/\* audio-guard:start \*\/[\s\S]*?\/\* audio-guard:end \*\//g, '');
      const verdict = assertNoRemoteAudio(stripped);
      expect(verdict.ok, `${name}: ${verdict.reason ?? ''}`).toBe(true);
    }
  });

  it('catches the patterns it is meant to catch', () => {
    expect(assertNoRemoteAudio('await fetch("/rain.mp3")').ok).toBe(false);
    expect(assertNoRemoteAudio('new Audio("tide.ogg")').ok).toBe(false);
    expect(assertNoRemoteAudio('const src = "https://cdn.example/calm.wav"').ok).toBe(false);
    expect(assertNoRemoteAudio('context.createOscillator()').ok).toBe(true);
  });
});

describe('scenes', () => {
  it('offers four distinct scenes with honest descriptions', () => {
    expect(SCENES).toHaveLength(4);
    expect(new Set(SCENES.map((scene) => scene.id)).size).toBe(4);
    for (const scene of SCENES) {
      expect(scene.name.length).toBeGreaterThan(4);
      expect(scene.blurb.length).toBeGreaterThan(20);
      expect(scene.evidence.length).toBeGreaterThan(80);
    }
  });

  it('states what the evidence does not support instead of selling a benefit', () => {
    const text = SCENES.map((scene) => `${scene.name} ${scene.blurb} ${scene.evidence}`).join(' ');
    expect(text).not.toMatch(/\b(heals?|cures?|detox\w*|vibrat\w+ (at|frequency)|chakra\w*|432 ?hz)\b/i);
    expect(text).not.toMatch(/proven to|guarantee\w*|clinically proven|treats? (anxiety|depression|insomnia)\b/i);
    // Every scene says what it is not.
    for (const scene of SCENES) {
      expect(scene.evidence).toMatch(/not|no evidence|no demonstrable|preference/i);
    }
  });

  it('resolves ids and refuses unknown ones', () => {
    expect(isSceneId('rain')).toBe(true);
    expect(isSceneId('ocean')).toBe(false);
    expect(isSceneId(3)).toBe(false);
    expect(sceneById('breath').id).toBe('breath');
    expect(sceneById('nonsense' as never).id).toBe('rain');
  });
});

describe('levels', () => {
  it('keeps the ceiling low and the curve monotonic', () => {
    expect(gainForVolume(0)).toBe(0);
    expect(gainForVolume(1)).toBeLessThanOrEqual(MAX_GAIN);
    expect(gainForVolume(1)).toBeGreaterThan(0.1);
    let previous = -1;
    for (let step = 0; step <= 1.0001; step += 0.05) {
      const gain = gainForVolume(step);
      expect(gain).toBeGreaterThanOrEqual(previous);
      previous = gain;
    }
  });

  it('clamps anything a slider or a stored value could produce', () => {
    expect(clampVolume(-4)).toBe(0);
    expect(clampVolume(9)).toBe(1);
    expect(clampVolume(Number.NaN)).toBe(DEFAULT_SETTINGS.volume);
    expect(clampVolume('loud')).toBe(DEFAULT_SETTINGS.volume);
    expect(gainForVolume(-1)).toBe(0);
  });

  it('keeps every chime quiet, short and inside a gentle register', () => {
    for (const [kind, spec] of Object.entries(CHIMES) as Array<[ChimeKind, (typeof CHIMES)[ChimeKind]]>) {
      expect(chimePeak(kind), kind).toBeLessThanOrEqual(1);
      expect(spec.decay, kind).toBeLessThanOrEqual(0.6);
      for (const partial of spec.partials) {
        expect(partial.hz, kind).toBeGreaterThanOrEqual(200);
        expect(partial.hz, kind).toBeLessThanOrEqual(1200);
        expect(partial.gain, kind).toBeLessThanOrEqual(0.6);
      }
    }
  });
});

describe('settings', () => {
  it('defaults to silence', () => {
    expect(DEFAULT_SETTINGS.enabled).toBe(false);
    expect(normalizeSettings(undefined).enabled).toBe(false);
    expect(normalizeSettings('{enabled:true}').enabled).toBe(false);
    expect(normalizeSettings(null).enabled).toBe(false);
  });

  it('accepts a real stored setting but repairs the broken parts', () => {
    const settings = normalizeSettings({ enabled: true, scene: 'tide', volume: 0.3, chimes: false });
    expect(settings).toEqual({ enabled: true, scene: 'tide', volume: 0.3, chimes: false });

    const repaired = normalizeSettings({ enabled: true, scene: 'ocean', volume: 12, chimes: 'yes' });
    expect(repaired.scene).toBe(DEFAULT_SETTINGS.scene);
    expect(repaired.volume).toBe(1);
    expect(repaired.chimes).toBe(true);
  });

  it('treats only an explicit false as chimes off', () => {
    expect(normalizeSettings({ chimes: false }).chimes).toBe(false);
    expect(normalizeSettings({ chimes: true }).chimes).toBe(true);
    expect(normalizeSettings({}).chimes).toBe(true);
    expect(normalizeSettings({ chimes: 0 }).chimes).toBe(true);
  });
});

describe('engine lifecycle without a browser', () => {
  it('reports unsupported instead of throwing when there is no Web Audio', async () => {
    const engine = new AmbientEngine();
    expect(AmbientEngine.isSupported()).toBe(false);
    expect(engine.isPlaying()).toBe(false);
    await engine.start(DEFAULT_SETTINGS);
    expect(engine.getState()).toBe('unsupported');
    expect(() => engine.setVolume(0.8)).not.toThrow();
    expect(() => engine.chime('soft')).not.toThrow();
    expect(engine.meter()).toBe(0);
    expect(() => engine.stop()).not.toThrow();
    expect(() => engine.close()).not.toThrow();
  });

  it('never reports playing before it has been started', () => {
    const engine = new AmbientEngine();
    expect(engine.snapshot().state).toBe('idle');
    expect(engine.snapshot().meter).toBe(0);
  });
});
