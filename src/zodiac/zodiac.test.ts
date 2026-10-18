import { describe, expect, it } from 'vitest';
import { SIGNS, SIGN_BY_ID } from './signs';
import { WEEK_COUNT, isoWeek, noteFor, rotationIndex, weekKey, weekLabel, weeklySky } from './week';

const utc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day));

describe('ISO week numbering', () => {
  // Cross-checked against `date -u +%G-%V` for these dates.
  const known: Array<[Date, string]> = [
    [utc(2026, 10, 17), '2026-W42'],
    [utc(2026, 1, 1), '2026-W01'],
    [utc(2025, 12, 31), '2026-W01'],
    [utc(2024, 12, 30), '2025-W01'],
    [utc(2027, 1, 1), '2026-W53'],
    [utc(2026, 3, 2), '2026-W10'],
  ];

  it.each(known)('labels %s as %s', (date, key) => {
    expect(weekKey(date)).toBe(key);
  });

  it('starts weeks on Monday and ends them on Sunday', () => {
    const { monday, sunday } = isoWeek(utc(2026, 10, 17));
    expect(monday.getUTCDay()).toBe(1);
    expect(sunday.getUTCDay()).toBe(0);
    expect(sunday.getTime() - monday.getTime()).toBe(6 * 86_400_000);
  });

  it('keeps every day of one week inside the same week', () => {
    for (let offset = 0; offset < 7; offset += 1) {
      const day = new Date(utc(2026, 10, 12).getTime() + offset * 86_400_000);
      expect(weekKey(day)).toBe('2026-W42');
    }
  });

  it('moves to the next week on Monday', () => {
    expect(weekKey(utc(2026, 10, 18))).toBe('2026-W42');
    expect(weekKey(utc(2026, 10, 19))).toBe('2026-W43');
  });

  it('labels a week with its own month when it spans two', () => {
    expect(weekLabel(utc(2026, 10, 17))).toBe('12 – 18 October 2026');
    expect(weekLabel(utc(2026, 10, 1))).toBe('28 September – 4 October 2026');
  });
});

describe('weekly rotation', () => {
  it('is stable across every day of the same week', () => {
    const indices = new Set([0, 1, 2, 3, 4, 5, 6].map((offset) => rotationIndex(new Date(utc(2026, 10, 12).getTime() + offset * 86_400_000))));
    expect(indices.size).toBe(1);
  });

  it('advances the rotation each week and uses all four notes', () => {
    const seen = new Set<number>();
    for (let week = 0; week < WEEK_COUNT; week += 1) {
      seen.add(rotationIndex(new Date(utc(2026, 10, 12).getTime() + week * 7 * 86_400_000)));
    }
    expect(seen.size).toBe(WEEK_COUNT);
  });

  it('gives the same answer twice for the same date', () => {
    expect(noteFor(SIGN_BY_ID.leo!, utc(2026, 10, 17))).toEqual(noteFor(SIGN_BY_ID.leo!, utc(2026, 10, 17)));
  });
});

describe('the twelve signs', () => {
  it('has twelve unique signs in zodiac order', () => {
    expect(SIGNS).toHaveLength(12);
    expect(new Set(SIGNS.map((sign) => sign.id)).size).toBe(12);
    expect(SIGNS[0]?.id).toBe('aries');
    expect(SIGNS[11]?.id).toBe('pisces');
  });

  it('gives every sign a symbol, dates, element, modality and constellation', () => {
    for (const sign of SIGNS) {
      expect(sign.symbol.length).toBeGreaterThan(0);
      expect(sign.dates).toMatch(/\d{1,2} \w+ – \d{1,2} \w+/);
      expect(['fire', 'earth', 'air', 'water']).toContain(sign.element);
      expect(['cardinal', 'fixed', 'mutable']).toContain(sign.modality);
      expect(sign.stars.length).toBeGreaterThanOrEqual(4);
      for (const [x, y] of sign.stars) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(1);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(1);
      }
    }
  });

  it('draws only between stars that exist', () => {
    for (const sign of SIGNS) {
      for (const [from, to] of sign.edges ?? []) {
        expect(from).toBeGreaterThanOrEqual(0);
        expect(to).toBeGreaterThanOrEqual(0);
        expect(from).toBeLessThan(sign.stars.length);
        expect(to).toBeLessThan(sign.stars.length);
        expect(from).not.toBe(to);
      }
    }
  });

  it('has four weeks of notes for every sign', () => {
    for (const sign of SIGNS) {
      expect(sign.weeks).toHaveLength(WEEK_COUNT);
      for (const week of sign.weeks) {
        expect(week.headline.length).toBeGreaterThan(3);
        expect(week.headline.length).toBeLessThan(40);
        expect(week.note.length).toBeGreaterThan(60);
        expect(week.note.length).toBeLessThan(260);
        expect(week.prompt.length).toBeGreaterThan(20);
      }
    }
  });

  it('writes 48 distinct notes rather than one template with a name swapped in', () => {
    const headlines = SIGNS.flatMap((sign) => sign.weeks.map((week) => `${sign.id}:${week.headline}`));
    expect(new Set(headlines).size).toBe(48);
    const bodies = SIGNS.flatMap((sign) => sign.weeks.map((week) => week.note));
    expect(new Set(bodies).size).toBe(48);
  });
});

describe('editorial rules', () => {
  const notes = SIGNS.flatMap((sign) => sign.weeks);

  it('never predicts an outcome, promises a result, or gives advice outside its remit', () => {
    const banned = [
      /\bwill (happen|be|get|receive|meet|find)\b/i,
      /\bguarantee/i,
      /\bprediction\b/i,
      /\bdestiny\b/i,
      /\bfate\b/i,
      /\bthe universe (will|wants|is telling)\b/i,
      /\blucky (number|day|colour)\b/i,
      /\byou should (invest|buy|sell|take|stop taking|marry|quit your job)\b/i,
      /\b(heal|cure|treat|diagnose|therapy for)\w*\b/i,
      /\bcancer\b/i,
      /\b(star sign|horoscope) (says|tells)\b/i,
      /\b100%|\b\d+% (chance|likely)\b/i,
    ];
    for (const week of notes) {
      const text = `${week.headline} ${week.note} ${week.prompt}`;
      for (const pattern of banned) {
        expect(text, `"${text}" matched ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it('asks the reader to notice something rather than telling them who they are', () => {
    const reflective = notes.filter((week) => /notice|look|check|watch|find|name|try/i.test(`${week.note} ${week.prompt}`));
    expect(reflective.length).toBe(notes.length);
  });

  it('never asks for a birth date or any personal data', () => {
    for (const week of notes) {
      expect(`${week.headline} ${week.note} ${week.prompt}`).not.toMatch(/birth|date of birth|your chart|sun sign of/i);
    }
  });
});

describe('weeklySky', () => {
  it('returns all twelve signs for one week with the week label attached', () => {
    const sky = weeklySky(utc(2026, 10, 17));
    expect(sky).toHaveLength(12);
    for (const entry of sky) {
      expect(entry.week).toBe('2026-W42');
      expect(entry.label).toBe('12 – 18 October 2026');
      expect(entry.index).toBe(rotationIndex(utc(2026, 10, 17)));
      expect(entry.sign.weeks).toContain(entry.note);
    }
  });
});
