export type SignalKind = 'heat' | 'demand' | 'volume' | 'absolute' | 'hedge' | 'warmth' | 'play';

export interface Edit {
  start: number;
  end: number;
  replacement: string;
  why: string;
  /** False when the replacement changes the claim, not just the temperature. */
  preservesMeaning: boolean;
}

export interface Signal {
  id: string;
  ruleId: string;
  kind: SignalKind;
  start: number;
  end: number;
  /** The exact draft text this signal matched. Never a paraphrase. */
  text: string;
  weight: number;
  note: string;
  fix?: Edit;
  /** Offered separately: this replacement changes the claim, not just the temperature. */
  meaningEdit?: Edit;
}

export type ReadBucket = 'insufficient' | 'mixed' | 'leaning' | 'clear';

export interface Read {
  bucket: ReadBucket;
  headline: string;
  detail: string;
  bucketLabel: string;
  evidence: Signal[];
  dimensions: {
    warmth: number;
    heat: number;
    directness: number;
  };
  words: number;
}

export type Register = 'softer' | 'kinder' | 'plainer';

export interface Variant {
  register: Register;
  label: string;
  note: string;
  text: string;
  edits: Edit[];
  optional: Edit[];
  remaining: Signal[];
}

export interface DiffToken {
  type: 'same' | 'add' | 'del';
  text: string;
}

export const KIND_LABEL: Record<SignalKind, string> = {
  heat: 'Heat',
  demand: 'Order',
  volume: 'Volume',
  absolute: 'Absolute',
  hedge: 'Hedge',
  warmth: 'Warmth',
  play: 'Play',
};
