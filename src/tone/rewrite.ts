import { detect } from './detect';
import type { Edit, Register, Signal, SignalKind, Variant } from './types';

const ALLOWED_KINDS: Record<Register, SignalKind[]> = {
  softer: ['demand', 'volume', 'absolute'],
  kinder: ['demand', 'volume', 'absolute'],
  plainer: ['hedge', 'volume'],
};

/** Kinder keeps the request but leads with the relationship. */
const KINDER_FIXES: Record<string, string> = {
  'you-need': 'it would help if you could',
  'you-should': 'it might be worth',
  'i-said': 'I mentioned earlier',
  obviously: '',
};

export const REGISTER_LABEL: Record<Register, string> = {
  softer: 'Softer',
  kinder: 'Kinder',
  plainer: 'Plainer',
};

export const REGISTER_BLURB: Record<Register, string> = {
  softer: 'Same ask, gentler grip',
  kinder: 'Lead with the person',
  plainer: 'Hedges off, point first',
};

export function applyEdits(text: string, edits: Edit[]): string {
  return [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce((current, edit) => current.slice(0, edit.start) + edit.replacement + current.slice(edit.end), text);
}

/** Collapses the punctuation and spacing damage that deletions leave behind. */
export function tidy(text: string): string {
  return text
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;:])\s*([.!?])/g, '$2')
    .replace(/([.!?])\s*(?:[!?])+/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+\n/g, '\n')
    .trim();
}

/** Restores sentence casing and the pronoun "I" after edits shift words around. */
export function reCase(text: string): string {
  const withPronoun = text.replace(/\bi\b/g, 'I');
  return withPronoun.replace(/(^|[.!?]\s+|\n\s*)([a-z])/g, (_match, lead: string, letter: string) => lead + letter.toUpperCase());
}

function dynamicEdit(signal: Signal, register: Register): Edit | null {
  if (signal.ruleId === 'caps' || signal.ruleId === 'caps-phrase') {
    // Lowercase here; reCase() restores a capital only when the span starts a sentence.
    const replacement = signal.text.toLowerCase();
    return { start: signal.start, end: signal.end, replacement, why: 'Lowercase reads as speaking, not shouting.', preservesMeaning: true };
  }
  if (signal.ruleId === 'exclamations') {
    return {
      start: signal.start,
      end: signal.end,
      replacement: register === 'plainer' ? '.' : '!',
      why: register === 'plainer' ? 'A full stop ends the sentence without the volume.' : 'One mark, still emphatic.',
      preservesMeaning: true,
    };
  }
  return null;
}

function editsFor(register: Register, signals: Signal[]): Edit[] {
  const allowed = ALLOWED_KINDS[register];
  const edits: Edit[] = [];

  for (const signal of signals) {
    if (!allowed.includes(signal.kind)) continue;

    if (signal.kind === 'volume') {
      const dynamic = dynamicEdit(signal, register);
      if (dynamic) edits.push(dynamic);
      else if (signal.fix) edits.push(signal.fix);
      continue;
    }

    if (!signal.fix) continue;
    const override = register === 'kinder' ? KINDER_FIXES[signal.ruleId] : undefined;
    edits.push(override === undefined ? signal.fix : { ...signal.fix, replacement: override });
  }

  // Suppress overlapping edits: the longest span wins, then the earlier one.
  const sorted = [...edits].sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start);
  const kept: Edit[] = [];
  for (const edit of sorted) {
    if (kept.some((other) => edit.start < other.end && other.start < edit.end)) continue;
    kept.push(edit);
  }
  return kept.sort((a, b) => a.start - b.start);
}

export function optionalEdits(signals: Signal[]): Edit[] {
  return signals
    .filter((signal) => signal.meaningEdit)
    .map((signal) => signal.meaningEdit as Edit);
}

function noteFor(register: Register, edits: Edit[], remaining: Signal[], optional: Edit[]): string {
  if (edits.length === 0) {
    if (optional.length > 0) {
      return 'Nothing here can change without changing what you claim. The optional lines below do change it — read them before you use them.';
    }
    return 'Nothing to change here. That is a read, not a failure.';
  }

  const stillHeated = remaining.some((signal) => signal.kind === 'heat');
  const stillDemanding = remaining.some((signal) => signal.kind === 'demand');

  if (register === 'plainer') {
    return stillDemanding
      ? 'Hedges removed and the point is first. The ask still reads as an order — that is what Plainer keeps.'
      : 'Hedges removed, volume flattened, point first.';
  }
  if (stillHeated && stillDemanding) {
    return 'The surface is cooler, but the put-down and the order are both still in there. That needs the optional swaps below.';
  }
  if (stillHeated) {
    return 'The ask is fixed. The judgement is still in the sentence — the optional swaps are the only way to remove it.';
  }
  if (stillDemanding) {
    return 'Calmer surface, same order underneath. Try Plainer if you want the order stated plainly instead of dressed up.';
  }
  return register === 'kinder'
    ? 'Same point, framed around the person. No pleasantries were invented for you.'
    : 'Same point, gentler grip. Nothing was added to the message.';
}

/**
 * Produces one register variant.
 *
 * Rewrites are surgical: they remove or replace spans in the draft and never
 * append greetings, closings, or encouragement. If nothing safe can change,
 * the variant says so instead of inventing text.
 */
export function rewrite(text: string, register: Register): Variant {
  const signals = detect(text);
  const edits = editsFor(register, signals);
  const rewritten = tidy(reCase(applyEdits(text, edits)));
  // Optional swaps are re-detected in the rewritten text so their offsets are valid there.
  const optional = optionalEdits(detect(rewritten));

  return {
    register,
    label: REGISTER_LABEL[register],
    note: noteFor(register, edits, detect(rewritten), optional),
    text: rewritten,
    edits,
    optional,
    remaining: detect(rewritten),
  };
}

/** Applies a chosen subset of optional, meaning-changing edits to a variant text. */
export function withOptional(text: string, optional: Edit[]): string {
  return tidy(reCase(applyEdits(text, optional)));
}
