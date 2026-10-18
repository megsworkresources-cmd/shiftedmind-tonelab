import { countWords, detect } from './detect';
import type { Read, ReadBucket, Signal, SignalKind } from './types';

/** Repetition counts, but each repeat counts less: 1, 0.65, 0.42 … */
function aggregate(signals: Signal[], kind: SignalKind): number {
  const weights = signals
    .filter((signal) => signal.kind === kind)
    .map((signal) => signal.weight)
    .sort((a, b) => b - a);
  return weights.reduce((total, weight, index) => total + weight * 0.65 ** index, 0);
}

/** Bounded 0..1 curve; no score ever claims more precision than it has. */
function norm(raw: number): number {
  if (raw <= 0) return 0;
  return 1 - Math.exp(-raw / 0.8);
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function pickEvidence(signals: Signal[]): Signal[] {
  const strongest: Signal[] = [];
  for (const signal of [...signals].sort((a, b) => b.weight - a.weight)) {
    if (strongest.length === 3) break;
    if (strongest.some((kept) => kept.note === signal.note)) continue;
    strongest.push(signal);
  }
  return strongest;
}

const BUCKET_LABEL: Record<ReadBucket, string> = {
  insufficient: 'Not enough to read',
  mixed: 'Mixed signals',
  leaning: 'Leaning',
  clear: 'Clear read',
};

interface Headline {
  bucket: ReadBucket;
  headline: string;
  detail: string;
}

function headlineFor(input: {
  heat: number;
  warmth: number;
  demand: number;
  hedge: number;
  play: number;
  hasAbsolute: boolean;
  hasHeat: boolean;
  hasDemand: boolean;
}): Headline {
  const { heat, warmth, demand, hedge, play, hasAbsolute, hasHeat, hasDemand } = input;

  if (heat >= 0.5 && warmth >= 0.3) {
    return {
      bucket: 'mixed',
      headline: 'Two messages at once',
      detail: 'There is warmth in here and heat aimed at a person. The reader will remember the heat.',
    };
  }
  if (heat >= 0.55 && demand >= 0.4) {
    return {
      bucket: 'clear',
      headline: 'Hot, and pushing',
      detail: 'Heat plus an order. The reader feels told off before they reach the ask, so the ask is what they answer.',
    };
  }
  if (heat >= 0.55) {
    return {
      bucket: 'clear',
      headline: 'Sharp, aimed at a person',
      detail: 'This is aimed at someone rather than at the problem. It will be felt before it is understood.',
    };
  }
  if (hasDemand && demand >= 0.45 && warmth >= 0.3) {
    return {
      bucket: 'clear',
      headline: 'Warm and direct',
      detail: 'Clear ask, kind packaging. This is the shape that gets done without anyone bleeding.',
    };
  }
  if (hasDemand && demand >= 0.45) {
    return {
      bucket: 'clear',
      headline: 'Direct to the point of an order',
      detail: 'The point is clear and the door is closed. "Could you" asks for the same thing and still gets a yes.',
    };
  }
  if (hasAbsolute && heat < 0.25 && warmth < 0.25) {
    return {
      bucket: 'leaning',
      headline: 'Pinned by absolutes',
      detail: '"Always" and "never" describe a pattern from one example. "This time" is harder to argue with — and easier to act on.',
    };
  }
  if (hedge >= 0.4 && heat < 0.2 && warmth < 0.3) {
    return {
      bucket: 'leaning',
      headline: 'Softened past the ask',
      detail: 'The request is in here, but it arrives smaller than it should. One clean sentence will land further than three hedged ones.',
    };
  }
  if (play >= 0.35 && heat < 0.2) {
    return {
      bucket: 'leaning',
      headline: 'Joking — check the room',
      detail: 'Humour reads as warmth in person and as ambiguity in text. Fine here if the topic is light.',
    };
  }
  if (warmth >= 0.45) {
    return {
      bucket: 'clear',
      headline: 'Warm',
      detail: 'This builds the relationship while it communicates. Keep the ask as clear as the tone.',
    };
  }
  if (hasHeat && heat < 0.55) {
    return {
      bucket: 'leaning',
      headline: 'A little heat',
      detail: 'There is an edge in one or two words. It may be exactly the edge you want — or the one that gets quoted back.',
    };
  }
  return {
    bucket: 'mixed',
    headline: 'Signals pulling apart',
    detail: 'Different parts of this message are doing different things. Read it once as the recipient would.',
  };
}

/**
 * Reads tone from signals.
 *
 * There is deliberately no percentage: the output is a bucket, a headline,
 * and the spans that produced them, so a reader can disagree with the evidence.
 */
export function readTone(text: string, signals = detect(text)): Read {
  const words = countWords(text);
  const heatRaw = aggregate(signals, 'heat') + 0.35 * aggregate(signals, 'absolute');
  const warmthRaw = aggregate(signals, 'warmth') + 0.35 * aggregate(signals, 'play');
  const demandRaw = aggregate(signals, 'demand');
  const hedgeRaw = aggregate(signals, 'hedge');
  const playRaw = aggregate(signals, 'play');

  const heat = norm(heatRaw + 0.45 * demandRaw);
  const warmth = norm(warmthRaw);
  const directness = clamp01(norm(demandRaw) + 0.3 - 0.3 * norm(hedgeRaw));

  const dimensions = {
    warmth: Math.round(warmth * 100) / 100,
    heat: Math.round(heat * 100) / 100,
    directness: Math.round(directness * 100) / 100,
  };

  if (words < 3) {
    return {
      bucket: 'insufficient',
      bucketLabel: BUCKET_LABEL.insufficient,
      headline: 'Too little to read',
      detail: 'Three words can mean anything. Add the sentence you would actually send.',
      evidence: [],
      dimensions,
      words,
    };
  }

  if (signals.length === 0) {
    return {
      bucket: 'insufficient',
      bucketLabel: BUCKET_LABEL.insufficient,
      headline: 'Nothing to flag',
      detail: 'No heat, no hedges, no orders. That is usually the goal — check that the ask is in there.',
      evidence: [],
      dimensions,
      words,
    };
  }

  const verdict = headlineFor({
    heat,
    warmth,
    demand: norm(demandRaw),
    hedge: norm(hedgeRaw),
    play: norm(playRaw),
    hasAbsolute: signals.some((signal) => signal.kind === 'absolute'),
    hasHeat: signals.some((signal) => signal.kind === 'heat'),
    hasDemand: signals.some((signal) => signal.kind === 'demand'),
  });

  return {
    bucket: verdict.bucket,
    bucketLabel: BUCKET_LABEL[verdict.bucket],
    headline: verdict.headline,
    detail: verdict.detail,
    evidence: pickEvidence(signals),
    dimensions,
    words,
  };
}

