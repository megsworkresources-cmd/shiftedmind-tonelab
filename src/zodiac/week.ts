import { SIGNS, type Sign, type WeekNote } from './signs';

export const WEEK_COUNT = 4;

export interface IsoWeek {
  /** ISO-8601 week-numbering year, which can differ from the calendar year. */
  year: number;
  /** 1–53. */
  week: number;
  /** Monday 00:00 UTC of that week. */
  monday: Date;
  /** Sunday 00:00 UTC of that week. */
  sunday: Date;
}

const DAY_MS = 86_400_000;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/**
 * ISO-8601 week numbering: weeks start on Monday, and week 1 is the week that
 * contains the first Thursday of the year. Computed in UTC from the local
 * calendar date so a user's timezone cannot move them into another week.
 */
export function isoWeek(date: Date = new Date()): IsoWeek {
  const day = startOfUtcDay(date);
  const weekday = day.getUTCDay() || 7; // Monday = 1 … Sunday = 7
  const thursday = new Date(day.getTime() + (4 - weekday) * DAY_MS);
  const year = thursday.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstWeekday = firstThursday.getUTCDay() || 7;
  const weekOneMonday = new Date(firstThursday.getTime() - (firstWeekday - 1) * DAY_MS);
  const week = Math.round((thursday.getTime() - weekOneMonday.getTime()) / (7 * DAY_MS)) + 1;

  const monday = new Date(day.getTime() - (weekday - 1) * DAY_MS);
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);

  return { year, week, monday, sunday };
}

/** Stable identifier for the week, e.g. `2026-W42`. */
export function weekKey(date: Date = new Date()): string {
  const { year, week } = isoWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Which of the four notes to show. Deterministic for a given week, so two
 * tabs opened on the same day always agree, and it advances on Monday.
 */
export function rotationIndex(date: Date = new Date()): number {
  const { year, week } = isoWeek(date);
  return (year * 53 + week) % WEEK_COUNT;
}

function formatDay(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
}

/** Human label for the week, e.g. `12 – 18 October 2026`. */
export function weekLabel(date: Date = new Date()): string {
  const { monday, sunday } = isoWeek(date);
  const year = sunday.getUTCFullYear();
  const sameMonth =
    monday.getUTCFullYear() === sunday.getUTCFullYear() && monday.getUTCMonth() === sunday.getUTCMonth();
  if (sameMonth) {
    return `${monday.getUTCDate()} – ${formatDay(sunday)} ${year}`;
  }
  return `${formatDay(monday)} – ${formatDay(sunday)} ${year}`;
}

/** The rotating note for one sign in a given week. */
export function noteFor(sign: Sign, date: Date = new Date()): WeekNote {
  const note = sign.weeks[rotationIndex(date)];
  if (!note) throw new Error(`No note for ${sign.id} in week ${weekKey(date)}`);
  return note;
}

export interface WeeklySky {
  week: string;
  label: string;
  index: number;
  sign: Sign;
  note: WeekNote;
}

/** Every sign with this week's note, in zodiac order. */
export function weeklySky(date: Date = new Date()): WeeklySky[] {
  const index = rotationIndex(date);
  return SIGNS.map((sign) => {
    const note = noteFor(sign, date);
    return { week: weekKey(date), label: weekLabel(date), index, sign, note };
  });
}
