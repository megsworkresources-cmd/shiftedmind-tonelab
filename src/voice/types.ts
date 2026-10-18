export interface VoiceMetrics {
  durationSec: number;
  /** Share of frames with a confident pitch and real level. */
  voicedRatio: number;
  medianPitchHz: number | null;
  /** 10th–90th percentile of voiced pitch, in semitones. */
  pitchRangeSemitones: number;
  /** Mean level of the whole clip, dBFS. */
  meanDb: number;
  dynamicRangeDb: number;
  /** Least-squares slope of level over time, dB per second. */
  loudnessTrendDbPerSec: number;
  pauseRatio: number;
  longestPauseSec: number;
  /** Energy onsets per second — a syllable-rate proxy, not a word count. */
  pacePerSec: number;
  clippingRatio: number;
}

export type VoiceBucket = 'insufficient' | 'leaning' | 'clear' | 'mixed';

export interface VoiceObservation {
  key: 'pitch' | 'volume' | 'pauses' | 'pace';
  label: string;
  value: string;
  note: string;
}

export interface VoiceRead {
  bucket: VoiceBucket;
  bucketLabel: string;
  headline: string;
  detail: string;
  observations: VoiceObservation[];
  suggestion: string;
}

export interface VoiceResult {
  url: string;
  metrics: VoiceMetrics;
  read: VoiceRead;
}
