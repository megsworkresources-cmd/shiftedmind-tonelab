import { detectPitch, resampleLinear } from './pitch';
import type { VoiceMetrics } from './types';

const TARGET_RATE = 8000;
const FRAME = 1024;
const HOP = 512;
const MIN_VOICED_RMS = 0.004;
const MIN_PAUSE_SEC = 0.25;

const percentile = (sorted: number[], fraction: number): number => {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * fraction)));
  return sorted[index] ?? 0;
};

const toDb = (amplitude: number): number => (amplitude > 0 ? 20 * Math.log10(amplitude) : -100);

/** Mixes decoded channels down to mono. */
export function toMono(channels: Float32Array[]): Float32Array {
  if (channels.length === 0) return new Float32Array(0);
  if (channels.length === 1) return channels[0] ?? new Float32Array(0);
  const length = Math.max(...channels.map((channel) => channel.length));
  const mono = new Float32Array(length);
  for (const channel of channels) {
    for (let i = 0; i < channel.length; i += 1) mono[i] = (mono[i] ?? 0) + (channel[i] ?? 0) / channels.length;
  }
  return mono;
}

/**
 * Measurements only: pitch movement, level, silence, onset rate.
 * No speech recognition, no emotion inference, no health inference.
 */
export function analyzeVoice(samples: Float32Array, sampleRate: number): VoiceMetrics {
  const durationSec = sampleRate > 0 ? samples.length / sampleRate : 0;
  const audio = resampleLinear(samples, sampleRate, TARGET_RATE);

  const levels: number[] = [];
  const dbs: number[] = [];
  const times: number[] = [];
  const pitches: number[] = [];

  for (let start = 0; start + FRAME <= audio.length; start += HOP) {
    const frame = audio.subarray(start, start + FRAME);
    const pitch = detectPitch(frame, TARGET_RATE);
    levels.push(pitch.rms);
    dbs.push(toDb(pitch.rms));
    times.push((start + FRAME / 2) / TARGET_RATE);
    if (pitch.hz !== null && pitch.clarity >= 0.55 && pitch.rms >= MIN_VOICED_RMS) {
      pitches.push(pitch.hz);
    }
  }

  let sumSquares = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const value = samples[i] ?? 0;
    sumSquares += value * value;
  }
  const meanDb = toDb(Math.sqrt(sumSquares / Math.max(1, samples.length)));

  const voicedRatio = levels.length > 0 ? pitches.length / levels.length : 0;
  const sortedPitches = [...pitches].sort((a, b) => a - b);
  const medianPitchHz = sortedPitches.length > 0 ? percentile(sortedPitches, 0.5) : null;
  const low = percentile(sortedPitches, 0.1);
  const high = percentile(sortedPitches, 0.9);
  const pitchRangeSemitones = low > 0 && high > 0 ? Math.max(0, 12 * Math.log2(high / low)) : 0;

  const audibleDbs = dbs.filter((value) => value > -70);
  const sortedDbs = [...audibleDbs].sort((a, b) => a - b);
  const dynamicRangeDb =
    sortedDbs.length > 1 ? percentile(sortedDbs, 0.9) - percentile(sortedDbs, 0.1) : 0;

  // Least-squares slope of level over time.
  let loudnessTrendDbPerSec = 0;
  if (times.length > 2 && audibleDbs.length === times.length) {
    const meanTime = times.reduce((sum, value) => sum + value, 0) / times.length;
    const meanLevel = audibleDbs.reduce((sum, value) => sum + value, 0) / audibleDbs.length;
    let covariance = 0;
    let variance = 0;
    for (let i = 0; i < times.length; i += 1) {
      const dt = (times[i] ?? 0) - meanTime;
      covariance += dt * ((audibleDbs[i] ?? meanLevel) - meanLevel);
      variance += dt * dt;
    }
    loudnessTrendDbPerSec = variance > 0 ? covariance / variance : 0;
  }

  const silenceThreshold = Math.max(meanDb - 18, -55);
  const frameSec = HOP / TARGET_RATE;
  let pauseSec = 0;
  let longestPauseSec = 0;
  let run = 0;
  const commitRun = () => {
    const duration = run * frameSec;
    if (duration >= MIN_PAUSE_SEC) {
      pauseSec += duration;
      longestPauseSec = Math.max(longestPauseSec, duration);
    }
    run = 0;
  };
  for (const level of dbs) {
    if (level < silenceThreshold) run += 1;
    else commitRun();
  }
  commitRun();
  const pauseRatio = durationSec > 0 ? pauseSec / durationSec : 0;

  // Onset rate: a short-window envelope (32 ms) catches syllable-scale rises
  // that a 128 ms pitch frame is too coarse to see.
  const envelopeFrame = 256;
  const envelopeHop = 128;
  const envelope: number[] = [];
  for (let start = 0; start + envelopeFrame <= audio.length; start += envelopeHop) {
    let sum = 0;
    for (let i = 0; i < envelopeFrame; i += 1) {
      const value = audio[start + i] ?? 0;
      sum += value * value;
    }
    envelope.push(Math.sqrt(sum / envelopeFrame));
  }

  const smoothed = envelope.map((value, index) => {
    const previous = envelope[index - 1] ?? value;
    const next = envelope[index + 1] ?? value;
    return (previous + value + next) / 3;
  });
  const meanLevel = smoothed.reduce((sum, value) => sum + value, 0) / Math.max(1, smoothed.length);
  const onsetFloor = Math.max(0.002, meanLevel * 0.5);
  const prominenceFloor = Math.max(0.01, meanLevel * 0.25);
  const lookback = 6; // ~96 ms before the peak
  let onsets = 0;
  let lastOnsetTime = -1;
  for (let i = 2; i < smoothed.length - 2; i += 1) {
    const value = smoothed[i] ?? 0;
    const previous = smoothed[i - 1] ?? 0;
    const next = smoothed[i + 1] ?? 0;
    if (!(value > previous && value >= next)) continue;

    let trough = value;
    for (let j = Math.max(0, i - lookback); j < i; j += 1) {
      trough = Math.min(trough, smoothed[j] ?? value);
    }
    const time = (i * envelopeHop + envelopeFrame / 2) / TARGET_RATE;
    if (value - trough > prominenceFloor && value > onsetFloor && time - lastOnsetTime >= 0.11) {
      onsets += 1;
      lastOnsetTime = time;
    }
  }

  let clipped = 0;
  for (let i = 0; i < samples.length; i += 1) {
    if (Math.abs(samples[i] ?? 0) >= 0.995) clipped += 1;
  }

  return {
    durationSec,
    voicedRatio,
    medianPitchHz,
    pitchRangeSemitones,
    meanDb,
    dynamicRangeDb,
    loudnessTrendDbPerSec,
    pauseRatio,
    longestPauseSec,
    pacePerSec: durationSec > 0 ? onsets / durationSec : 0,
    clippingRatio: samples.length > 0 ? clipped / samples.length : 0,
  };
}
