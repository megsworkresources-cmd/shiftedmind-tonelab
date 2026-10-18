export interface PitchFrame {
  hz: number | null;
  clarity: number;
  rms: number;
}

/** Linear resampling. Voice analysis runs at 8 kHz, which is plenty for F0. */
export function resampleLinear(samples: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return samples;
  const ratio = fromRate / toRate;
  const length = Math.max(1, Math.floor(samples.length / ratio));
  const out = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;
    const a = samples[index] ?? 0;
    const b = samples[index + 1] ?? a;
    out[i] = a + (b - a) * fraction;
  }
  return out;
}

/**
 * Normalised square difference (NSDF) pitch estimate for one frame.
 *
 * Returns null for silence and for frames without a clear period; clarity is
 * the peak height (0..1). This is a measurement, not a judgement.
 */
export function detectPitch(frame: Float32Array, sampleRate: number, minHz = 70, maxHz = 350): PitchFrame {
  let mean = 0;
  for (let i = 0; i < frame.length; i += 1) mean += frame[i] ?? 0;
  mean /= frame.length;

  const centred = new Float32Array(frame.length);
  let energy = 0;
  for (let i = 0; i < frame.length; i += 1) {
    const value = (frame[i] ?? 0) - mean;
    centred[i] = value;
    energy += value * value;
  }
  const rms = Math.sqrt(energy / frame.length);
  if (rms < 0.004) return { hz: null, clarity: 0, rms };

  const minLag = Math.max(2, Math.floor(sampleRate / maxHz));
  const maxLag = Math.min(centred.length - 2, Math.ceil(sampleRate / minHz));
  if (maxLag <= minLag) return { hz: null, clarity: 0, rms };

  const score = new Float32Array(maxLag + 2);
  for (let lag = minLag; lag <= maxLag + 1; lag += 1) {
    let correlation = 0;
    let norm = 0;
    for (let i = 0; i + lag < centred.length; i += 1) {
      const a = centred[i] ?? 0;
      const b = centred[i + lag] ?? 0;
      correlation += a * b;
      norm += a * a + b * b;
    }
    score[lag] = norm > 0 ? (2 * correlation) / norm : 0;
  }

  // Collect peaks, then take the FIRST peak close to the best one. Picking the
  // global maximum alone picks octave-down multiples of a clean tone.
  const peaks: Array<{ lag: number; score: number }> = [];
  let crossed = false;
  let previous = score[minLag - 1] ?? 0;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    const value = score[lag] ?? 0;
    const next = score[lag + 1] ?? -1;
    if (!crossed && value < 0) crossed = true;
    if (crossed && value > previous && value >= next && value > 0) {
      peaks.push({ lag, score: value });
    }
    previous = value;
  }

  let maxScore = 0;
  for (const peak of peaks) maxScore = Math.max(maxScore, peak.score);
  if (peaks.length === 0 || maxScore < 0.5) {
    return { hz: null, clarity: Math.max(0, maxScore), rms };
  }

  const threshold = Math.max(0.5, maxScore * 0.85);
  let bestLag = -1;
  let bestScore = 0;
  for (const peak of peaks) {
    if (peak.score >= threshold) {
      bestLag = peak.lag;
      bestScore = peak.score;
      break;
    }
  }
  if (bestLag < 0) {
    return { hz: null, clarity: Math.max(0, maxScore), rms };
  }

  // Parabolic interpolation around the peak for sub-sample precision.
  const y0 = score[bestLag - 1] ?? 0;
  const y1 = score[bestLag] ?? 0;
  const y2 = score[bestLag + 1] ?? 0;
  const denominator = 2 * (2 * y1 - y0 - y2);
  const shift = denominator !== 0 ? (y2 - y0) / denominator : 0;
  const refined = bestLag + Math.max(-0.5, Math.min(0.5, shift));

  return { hz: sampleRate / refined, clarity: bestScore, rms };
}
