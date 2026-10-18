import type { VoiceBucket, VoiceMetrics, VoiceObservation, VoiceRead } from './types';

const BUCKET_LABEL: Record<VoiceBucket, string> = {
  insufficient: 'Not enough to read',
  leaning: 'Leaning',
  clear: 'Clear read',
  mixed: 'Mixed signals',
};

const formatSigned = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(1)}`;

/**
 * Reads delivery, not meaning.
 *
 * Every threshold below is about sound — pitch movement, level, silence, onset
 * rate. Nothing here infers emotion, mental state, health, or truthfulness.
 */
export function readVoice(metrics: VoiceMetrics): VoiceRead {
  const {
    durationSec,
    voicedRatio,
    medianPitchHz,
    pitchRangeSemitones,
    meanDb,
    dynamicRangeDb,
    loudnessTrendDbPerSec,
    pauseRatio,
    longestPauseSec,
    pacePerSec,
    clippingRatio,
  } = metrics;

  if (durationSec < 2.5 || voicedRatio < 0.12) {
    return {
      bucket: 'insufficient',
      bucketLabel: BUCKET_LABEL.insufficient,
      headline: 'Too little to read',
      detail:
        durationSec < 2.5
          ? 'Give it a full sentence or two. Under three seconds there is not enough voice to measure.'
          : 'Most of the clip was silence or too quiet to measure. Check the input level and try again.',
      observations: [],
      suggestion: 'Record one sentence you would actually say out loud, close enough to the mic to be heard clearly.',
    };
  }

  const monotone = medianPitchHz !== null && pitchRangeSemitones < 1.8;
  const widePitch = pitchRangeSemitones >= 6.5;
  const quiet = meanDb < -34;
  const hot = meanDb > -14 || clippingRatio > 0.01;
  const rising = loudnessTrendDbPerSec > 3;
  const falling = loudnessTrendDbPerSec < -3;
  const noPauses = pauseRatio < 0.04 && longestPauseSec < 0.25;
  const lotsOfAir = pauseRatio > 0.3;
  const fast = pacePerSec > 5.2;
  const slow = pacePerSec > 0 && pacePerSec < 3;

  const observations: VoiceObservation[] = [];

  if (medianPitchHz !== null) {
    const pitchNote = monotone
      ? 'Your pitch barely moved. Flat delivery makes clear words sound flat too.'
      : widePitch
        ? 'Pitch moved a lot — expressive, and easy to read as charged if the topic is heavy.'
        : 'Pitch moved enough to sound spoken rather than read.';
    observations.push({
      key: 'pitch',
      label: 'Pitch',
      value: `${Math.round(medianPitchHz)} Hz · ${pitchRangeSemitones.toFixed(1)} semitones of movement`,
      note: pitchNote,
    });
  }

  const volumeNote = quiet
    ? 'You are quiet enough that a listener leans in. That reads as uncertain even when you are not.'
    : hot
      ? 'You are close to the mic or pushing. The signal is hot, and hot reads as intensity.'
      : rising
        ? `You get louder as you go (${formatSigned(loudnessTrendDbPerSec)} dB/sec) — the last sentence lands hardest.`
        : falling
          ? `You lose volume towards the end (${formatSigned(loudnessTrendDbPerSec)} dB/sec) — the ask arrives quietly.`
          : 'Level is steady. Nothing here is fighting the words.';
  observations.push({
    key: 'volume',
    label: 'Level',
    value: `${Math.round(meanDb)} dBFS · ${Math.round(dynamicRangeDb)} dB of range`,
    note: volumeNote,
  });

  observations.push({
    key: 'pauses',
    label: 'Silence',
    value: `${Math.round(pauseRatio * 100)}% pauses · longest ${longestPauseSec.toFixed(1)}s`,
    note: noPauses
      ? 'Almost no silence. Without a gap, the listener has nowhere to put the point.'
      : lotsOfAir
        ? 'A lot of air. If that is thinking time it is fine; too much can read as unsure.'
        : 'Pauses are doing their job — there is room between the thoughts.',
  });

  observations.push({
    key: 'pace',
    label: 'Pace',
    value: `${pacePerSec.toFixed(1)} onsets/sec`,
    note: fast
      ? 'Brisk. At this rate the last third of a sentence tends to get clipped.'
      : slow
        ? 'Measured. It gives weight, as long as it does not turn into a monotone.'
        : 'An ordinary speaking pace — close to conversational.',
  });

  let headline = 'Even-keeled';
  let detail = 'Steady level, ordinary pace, some movement in pitch. Nothing here needs fixing before you send it.';
  let suggestion = 'Record the same line once more, changing one thing — not everything.';

  if (fast && noPauses) {
    headline = 'No room to breathe';
    detail = 'The words run together with no gaps. A listener cannot tell which sentence is the important one.';
    suggestion = 'Put one full stop in the middle and actually stop. Let the silence carry the emphasis.';
  } else if (monotone && quiet) {
    headline = 'Steady, but hard to follow';
    detail = 'Low level and one pitch. The words may be clear; the delivery gives the listener nothing to hold.';
    suggestion = 'Pick the three most important words and lift those — louder, not faster.';
  } else if (monotone) {
    headline = 'One note';
    detail = 'Your pitch stays in a narrow band, so the sentence arrives as a single block.';
    suggestion = 'Say the most important word a little higher than the rest. One word is enough.';
  } else if (rising && (hot || fast)) {
    headline = 'Building';
    detail = 'You accelerate and get louder. It can sound committed — or like the message is escalating.';
    suggestion = 'Land the last sentence instead of pushing it. Slow down and drop the volume at the end.';
  } else if (widePitch && fast) {
    headline = 'Charged';
    detail = 'Wide pitch movement at a quick pace reads as high energy. Check whether the topic can carry it.';
    suggestion = 'Keep the movement, halve the speed of the opening sentence.';
  } else if (quiet) {
    headline = 'Quiet';
    detail = 'The delivery asks the listener to lean in. That can read as unsure regardless of your words.';
    suggestion = 'Project as if the person is across a table, not across a room.';
  } else if (noPauses) {
    headline = 'Runs together';
    detail = 'One long stream. The punctuation in your head is not reaching the listener.';
    suggestion = 'Breathe at the first comma. If there is no comma, add one.';
  } else if (lotsOfAir && slow) {
    headline = 'Careful, almost hesitant';
    detail = 'Long silences at a slow pace give the impression you are still deciding.';
    suggestion = 'Keep the pauses, tighten the sentences between them.';
  }

  const bucket: VoiceBucket = durationSec < 4 || voicedRatio < 0.35 ? 'leaning' : fast && lotsOfAir ? 'mixed' : 'clear';

  return {
    bucket,
    bucketLabel: BUCKET_LABEL[bucket],
    headline,
    detail,
    observations,
    suggestion,
  };
}
