import { CAPS_ALLOWLIST, LEXICON } from './lexicon';
import type { Signal } from './types';

const KIND_PRIORITY: Record<Signal['kind'], number> = {
  heat: 7,
  demand: 6,
  volume: 5,
  absolute: 4,
  hedge: 3,
  warmth: 2,
  play: 1,
};

/** Highest weight wins an overlap; longer span breaks a tie. */
function resolveOverlaps(signals: Signal[]): Signal[] {
  const kept: Signal[] = [];
  const ordered = [...signals].sort(
    (a, b) => b.weight - a.weight || b.end - b.start - (a.end - a.start) || KIND_PRIORITY[b.kind] - KIND_PRIORITY[a.kind],
  );
  for (const signal of ordered) {
    const collides = kept.some((other) => signal.start < other.end && other.start < signal.end);
    if (!collides) kept.push(signal);
  }
  return kept.sort((a, b) => a.start - b.start || a.end - b.end);
}

/**
 * Finds tone signals in `text`.
 *
 * Every match is a real span, so callers can quote it back to the author.
 * Matching is word-boundary based — `relaxed` will not fire `relax`.
 */
export function detect(text: string): Signal[] {
  if (!text.trim()) return [];
  const found: Signal[] = [];

  for (const rule of LEXICON) {
    const flags = rule.caseSensitive ? 'gu' : 'giu';
    const re = new RegExp(rule.pattern, flags);
    for (const match of text.matchAll(re)) {
      const start = match.index;
      if (start === undefined) continue;
      const matched = match[0];
      if (
        rule.kind === 'volume' &&
        rule.caseSensitive &&
        matched.split(/\s+/).every((word) => CAPS_ALLOWLIST.has(word))
      ) {
        continue;
      }
      found.push({
        id: `${rule.id}:${start}`,
        ruleId: rule.id,
        kind: rule.kind,
        start,
        end: start + matched.length,
        text: matched,
        weight: rule.weight,
        note: rule.note,
        ...(rule.fix
          ? { fix: { start, end: start + matched.length, replacement: rule.fix.replacement, why: rule.fix.why, preservesMeaning: true } }
          : {}),
        ...(rule.meaningFix
          ? {
              meaningEdit: {
                start,
                end: start + matched.length,
                replacement: rule.meaningFix.replacement,
                why: rule.meaningFix.why,
                preservesMeaning: false,
              },
            }
          : {}),
      });
    }
  }

  return resolveOverlaps(found);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
