import { describe, expect, it } from 'vitest';
import { detect } from './detect';
import { diffWords } from './diff';
import { readTone } from './score';
import { rewrite, withOptional } from './rewrite';

const HOSTILE =
  "I've asked you three times already. You need to just DO IT and stop wasting everyone's time, obviously!!";
const POLITE =
  'Hey! When you get a chance could you take a look at the doc? No rush at all, thanks so much :)';

describe('detection quotes the draft, never a paraphrase', () => {
  it('does not fire on substrings', () => {
    const text = 'The schedule is relaxed and the invoice needs adjustment.';
    const signals = detect(text);
    const demands = signals.filter((s) => s.kind === 'demand');
    expect(demands).toHaveLength(0);
    expect(signals.some((s) => s.text === 'calm down')).toBe(false);
  });

  it('quotes a span that exists in the draft', () => {
    for (const signal of detect(HOSTILE)) {
      expect(HOSTILE.slice(signal.start, signal.end)).toBe(signal.text);
    }
  });

  it('ignores allowlisted acronyms but still reads shouting', () => {
    const acronyms = detect('Send the PDF by EOD.');
    expect(acronyms.filter((s) => s.kind === 'volume')).toHaveLength(0);
    expect(detect('SEND IT NOW').some((s) => s.kind === 'volume' && s.text === 'SEND IT NOW')).toBe(true);
  });

  it('resolves overlapping spans in favour of the stronger reading', () => {
    const signals = detect('just kidding');
    expect(signals).toHaveLength(1);
    expect(signals[0]?.kind).toBe('play');
  });
});

describe('scoring responds to every flagged pattern', () => {
  it('does not call an absolute "neutral and even"', () => {
    const read = readTone('You always do this.');
    expect(read.bucket).not.toBe('insufficient');
    expect(read.headline).toBe('Pinned by absolutes');
    expect(read.evidence.some((s) => s.kind === 'absolute')).toBe(true);
  });

  it('counts repetition', () => {
    const once = readTone('You never listen.');
    const thrice = readTone('You never listen. You never listen. You never listen.');
    expect(thrice.dimensions.heat).toBeGreaterThan(once.dimensions.heat);
  });

  it('refuses to read gibberish', () => {
    expect(readTone('asdf qwer zxcv').bucket).toBe('insufficient');
    expect(readTone('Okay.').bucket).toBe('insufficient');
    expect(readTone('Okay.').headline).toBe('Too little to read');
  });

  it('reads the polite sample as warm', () => {
    const read = readTone(POLITE);
    expect(read.headline).toBe('Warm');
    expect(read.bucket).toBe('clear');
  });

  it('reads the bundled hostile sample as heat plus an order', () => {
    const read = readTone(HOSTILE);
    expect(read.headline).toBe('Hot, and pushing');
    expect(read.evidence.length).toBeGreaterThan(1);
    expect(read.dimensions.heat).toBeGreaterThan(read.dimensions.warmth);
  });

  it('never prints a percentage', () => {
    const read = readTone(HOSTILE);
    expect(JSON.stringify(read)).not.toMatch(/\d+\.\d+%/);
  });
});

describe('rewrites are surgical', () => {
  it('never appends pleasantries or closings', () => {
    const variant = rewrite(HOSTILE, 'softer');
    expect(variant.text).not.toMatch(/No rush/i);
    expect(variant.text).not.toMatch(/thanks/i);
  });

  it('keeps sentence casing and the pronoun I', () => {
    for (const register of ['softer', 'kinder', 'plainer'] as const) {
      const variant = rewrite(HOSTILE, register);
      expect(variant.text).not.toMatch(/[.!?]\s+[a-z]/);
      expect(variant.text).not.toMatch(/\bi\b/);
    }
  });

  it('lowercases a mid-sentence shout but keeps sentence starts capitalised', () => {
    expect(rewrite('Please SEND the report.', 'softer').text).toContain('send the report');
    expect(rewrite('SEND the report.', 'softer').text.startsWith('Send the report')).toBe(true);
  });

  it('does not turn "obviously" into a hedging "i think"', () => {
    const variant = rewrite(HOSTILE, 'softer');
    expect(variant.text.toLowerCase()).not.toContain('i think');
    expect(variant.text).not.toContain('obviously');
  });

  it('softens the ask without inventing content', () => {
    const variant = rewrite(HOSTILE, 'softer');
    expect(variant.text).toMatch(/could you/i);
    expect(variant.text).not.toMatch(/\bDO IT\b/);
    expect(variant.text.endsWith('!') || variant.text.endsWith('.')).toBe(true);
  });

  it('says what is still wrong instead of claiming success', () => {
    const variant = rewrite(HOSTILE, 'softer');
    expect(variant.note.toLowerCase()).toContain('optional');
    expect(variant.remaining.some((s) => s.kind === 'heat')).toBe(true);
  });

  it('strips hedges only in Plainer, and admits the order survives', () => {
    const plainer = rewrite(HOSTILE, 'plainer');
    expect(plainer.text.toLowerCase()).not.toMatch(/\bjust\b/);
    expect(plainer.note.toLowerCase()).toContain('order');
  });

  it('offers meaning changes separately and applies them only on request', () => {
    const variant = rewrite(HOSTILE, 'softer');
    expect(variant.text).not.toContain('holding up the review');
    expect(variant.optional.length).toBeGreaterThan(0);
    const applied = withOptional(variant.text, variant.optional.slice(0, 1));
    expect(applied).toContain('holding up the review');
  });

  it('says so when there is nothing to change', () => {
    const variant = rewrite('The report is on the shared drive.', 'softer');
    expect(variant.edits).toHaveLength(0);
    expect(variant.note.toLowerCase()).toContain('nothing to change');
  });
});

describe('diff', () => {
  it('marks additions and removals between registers', () => {
    const tokens = diffWords('You need to fix this.', 'Could you fix this?');
    expect(tokens.some((t) => t.type === 'add')).toBe(true);
    expect(tokens.some((t) => t.type === 'del')).toBe(true);
    expect(tokens.map((t) => t.text).join('')).toContain('fix this');
  });
});
