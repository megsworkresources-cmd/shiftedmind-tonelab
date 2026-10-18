import { describe, expect, it } from 'vitest';
import { analyzeVoice } from './analyze';
import { detectPitch } from './pitch';
import { readVoice } from './read';

const RATE = 8000;

function tone(hz: number, seconds: number, amplitude = 0.25, rate = RATE): Float32Array {
  const length = Math.round(seconds * rate);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i += 1) out[i] = amplitude * Math.sin((2 * Math.PI * hz * i) / rate);
  return out;
}

function concat(...parts: Float32Array[]): Float32Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Float32Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function silence(seconds: number, rate = RATE): Float32Array {
  return new Float32Array(Math.round(seconds * rate));
}

function chirp(fromHz: number, toHz: number, seconds: number, amplitude = 0.25, rate = RATE): Float32Array {
  const length = Math.round(seconds * rate);
  const out = new Float32Array(length);
  let phase = 0;
  for (let i = 0; i < length; i += 1) {
    const hz = fromHz + ((toHz - fromHz) * i) / length;
    phase += (2 * Math.PI * hz) / rate;
    out[i] = amplitude * Math.sin(phase);
  }
  return out;
}

function ramp(seconds: number, from: number, to: number, hz = 160, rate = RATE): Float32Array {
  const length = Math.round(seconds * rate);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const amplitude = from + ((to - from) * i) / length;
    out[i] = amplitude * Math.sin((2 * Math.PI * hz * i) / rate);
  }
  return out;
}

function bursts(ratePerSecond: number, seconds: number, amplitude = 0.3, rate = RATE): Float32Array {
  const length = Math.round(seconds * rate);
  const out = new Float32Array(length);
  const period = rate / ratePerSecond;
  for (let i = 0; i < length; i += 1) {
    const phase = i % period;
    out[i] = phase < period * 0.6 ? amplitude * Math.sin((2 * Math.PI * 180 * i) / rate) : 0;
  }
  return out;
}

describe('pitch detection', () => {
  it('finds the fundamental of a clean tone', () => {
    const frame = tone(120, 0.25);
    const result = detectPitch(frame.subarray(0, 2048), RATE);
    expect(result.hz).not.toBeNull();
    expect(Math.abs((result.hz ?? 0) - 120)).toBeLessThan(3);
    expect(result.clarity).toBeGreaterThan(0.7);
  });

  it('returns nothing for silence', () => {
    const result = detectPitch(silence(0.2).subarray(0, 2048), RATE);
    expect(result.hz).toBeNull();
  });
});

describe('voice metrics', () => {
  it('reports duration and voiced ratio for speech-like audio', () => {
    const metrics = analyzeVoice(tone(150, 5), RATE);
    expect(metrics.durationSec).toBeCloseTo(5, 2);
    expect(metrics.voicedRatio).toBeGreaterThan(0.8);
    expect(metrics.medianPitchHz).toBeGreaterThan(140);
    expect(metrics.medianPitchHz).toBeLessThan(160);
  });

  it('finds a long pause between two phrases', () => {
    const metrics = analyzeVoice(concat(tone(150, 1.2), silence(1), tone(150, 1.2)), RATE);
    expect(metrics.longestPauseSec).toBeGreaterThan(0.8);
    expect(metrics.longestPauseSec).toBeLessThan(1.2);
    expect(metrics.pauseRatio).toBeGreaterThan(0.2);
  });

  it('does not invent pauses inside continuous speech', () => {
    const metrics = analyzeVoice(tone(150, 4), RATE);
    expect(metrics.longestPauseSec).toBeLessThan(0.25);
    expect(metrics.pauseRatio).toBeLessThan(0.1);
  });

  it('measures a rising level', () => {
    const metrics = analyzeVoice(ramp(6, 0.01, 0.4), RATE);
    expect(metrics.loudnessTrendDbPerSec).toBeGreaterThan(2);
  });

  it('measures pace from onset rate', () => {
    const metrics = analyzeVoice(bursts(4, 5), RATE);
    expect(metrics.pacePerSec).toBeGreaterThan(3);
    expect(metrics.pacePerSec).toBeLessThan(6);
  });

  it('flags clipping', () => {
    const metrics = analyzeVoice(tone(200, 3, 1.4), RATE);
    expect(metrics.clippingRatio).toBeGreaterThan(0.01);
  });
});

describe('voice read', () => {
  it('refuses a clip that is too short', () => {
    const read = readVoice(analyzeVoice(tone(150, 1), RATE));
    expect(read.bucket).toBe('insufficient');
    expect(read.observations).toHaveLength(0);
  });

  it('calls a steady tone one note', () => {
    const read = readVoice(analyzeVoice(tone(150, 4), RATE));
    expect(read.headline).toBe('One note');
    expect(read.observations.some((item) => item.key === 'pitch')).toBe(true);
  });

  it('does not call a moving pitch monotone', () => {
    const read = readVoice(analyzeVoice(chirp(130, 260, 4), RATE));
    expect(read.headline).not.toBe('One note');
  });

  it('names low level as part of the read', () => {
    const read = readVoice(analyzeVoice(tone(150, 4, 0.008), RATE));
    const volume = read.observations.find((item) => item.key === 'volume');
    expect(volume?.note.toLowerCase()).toContain('quiet');
    expect(read.headline).not.toBe('Even-keeled');
    expect(read.bucket).not.toBe('insufficient');
  });

  it('has a suggestion for every bucket', () => {
    for (const samples of [tone(150, 4), tone(120, 3, 0.005), bursts(4, 4), concat(tone(150, 1), silence(1), tone(150, 2))]) {
      expect(readVoice(analyzeVoice(samples, RATE)).suggestion.length).toBeGreaterThan(10);
    }
  });
});
