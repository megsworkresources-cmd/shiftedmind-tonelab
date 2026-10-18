/**
 * The twelve signs, their sky geometry, and four weeks of editorial notes.
 *
 * Editorial rules this file follows, because the rest of the lab does:
 *  - No prediction. Nothing says what will happen to you.
 *  - No personal data. The feature never asks for or stores a birth date, so
 *    every note is the same note for everyone who reads it this week.
 *  - No health, legal or financial instruction. Notes are prompts to notice
 *    something, not advice.
 *  - `src/zodiac/zodiac.test.ts` enforces the vocabulary and the structure.
 */

export type ElementName = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';

export interface WeekNote {
  /** Short headline, sentence case, no claims about outcomes. */
  headline: string;
  /** Two or three sentences. Reflective, not predictive. */
  note: string;
  /** One thing to try this week. */
  prompt: string;
}

export interface Sign {
  id: string;
  name: string;
  symbol: string;
  dates: string;
  element: ElementName;
  modality: Modality;
  /** Rough line-art constellation, normalised to a 0–1 box. */
  stars: Array<[number, number]>;
  /** Links consecutive stars; defaults to sequential when omitted. */
  edges?: Array<[number, number]>;
  /** Four weekly notes, selected by ISO week so they rotate predictably. */
  weeks: [WeekNote, WeekNote, WeekNote, WeekNote];
}

export const SIGNS: Sign[] = [
  {
    id: 'aries',
    name: 'Aries',
    symbol: '♈',
    dates: '21 March – 19 April',
    element: 'fire',
    modality: 'cardinal',
    stars: [
      [0.08, 0.62],
      [0.3, 0.48],
      [0.52, 0.36],
      [0.78, 0.3],
    ],
    weeks: [
      {
        headline: 'Notice the first move',
        note: 'Starting is the easy part for this sign and the finishing is where it usually costs you. This week, look at the one thing you began before you were ready.',
        prompt: 'Pick one unfinished thing and give it twenty honest minutes.',
      },
      {
        headline: 'Slow the reply',
        note: 'The quick answer feels like honesty and sometimes it is just speed. Watch where you answer before you have decided what you actually want.',
        prompt: 'Draft one difficult reply in the tone lab before you send it.',
      },
      {
        headline: 'Heat is information',
        note: 'Irritation usually arrives before the sentence that names the real problem. Read it as a signal to look closer rather than a verdict to deliver.',
        prompt: 'Name the need under one annoyance, out loud, to nobody.',
      },
      {
        headline: 'Rest is not retreat',
        note: 'Pushing through is a skill here and it has a ceiling. Notice the week you spend proving you do not need the break.',
        prompt: 'Take one rest you would not normally justify to anyone.',
      },
    ],
  },
  {
    id: 'taurus',
    name: 'Taurus',
    symbol: '♉',
    dates: '20 April – 20 May',
    element: 'earth',
    modality: 'fixed',
    stars: [
      [0.22, 0.2],
      [0.22, 0.62],
      [0.55, 0.34],
      [0.82, 0.18],
      [0.82, 0.68],
    ],
    edges: [
      [0, 1],
      [0, 2],
      [2, 3],
      [3, 4],
    ],
    weeks: [
      {
        headline: 'The shape of your week',
        note: 'Routine is how this sign rests, and it is also how it stalls. Look at which habituated part of your week stopped being a choice.',
        prompt: 'Change the time or place of one routine by an hour.',
      },
      {
        headline: 'Saying no is upkeep',
        note: 'Refusal is often read as rejection and it rarely is. Notice where you agree quickly and then quietly resent it.',
        prompt: 'Say no to one thing this week without offering a reason.',
      },
      {
        headline: 'What you are holding',
        note: 'Steadiness can look like stillness from the outside. Check whether something you are carrying is yours to carry.',
        prompt: 'Write down one responsibility you could hand back.',
      },
      {
        headline: 'Comfort is not avoidance',
        note: 'Slowness is not the same as hiding, but they can look identical from inside. Find the difference in one moment.',
        prompt: 'Do the comfortable thing, and notice what you are not doing.',
      },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    symbol: '♊',
    dates: '21 May – 20 June',
    element: 'air',
    modality: 'mutable',
    stars: [
      [0.18, 0.14],
      [0.18, 0.72],
      [0.46, 0.4],
      [0.74, 0.14],
      [0.74, 0.72],
    ],
    edges: [
      [0, 1],
      [0, 2],
      [2, 3],
      [3, 4],
    ],
    weeks: [
      {
        headline: 'Half of an idea',
        note: 'Thinking out loud is how you find the shape of it, and it can leave other people holding fragments. Notice who is keeping up and who is not.',
        prompt: 'Finish one thought in writing before you say it aloud.',
      },
      {
        headline: 'Two versions at once',
        note: 'Holding several readings of a situation is a strength until it becomes a way to avoid choosing. Watch where you have decided without saying so.',
        prompt: 'State one position without adding the counter-case.',
      },
      {
        headline: 'Speed and attention',
        note: 'Fast conversation is fun and it can hide what you did not actually hear. Recall one thing someone told you this week and then check it.',
        prompt: 'Ask a follow-up question instead of offering your take.',
      },
      {
        headline: 'Quiet is not empty',
        note: 'The pause in a conversation is usually where the useful part arrives. Notice how quickly you fill it.',
        prompt: 'Let one silence run three seconds longer than is comfortable.',
      },
    ],
  },
  {
    id: 'cancer',
    name: 'Cancer',
    symbol: '♋',
    dates: '21 June – 22 July',
    element: 'water',
    modality: 'cardinal',
    stars: [
      [0.2, 0.3],
      [0.44, 0.62],
      [0.72, 0.28],
      [0.86, 0.56],
      [0.6, 0.8],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    weeks: [
      {
        headline: 'Ask before you assume',
        note: 'Reading the room is a real skill and it is not telepathy. Notice where you have decided what someone meant without asking them.',
        prompt: 'Turn one guess about someone into an actual question.',
      },
      {
        headline: 'The shell and the door',
        note: 'Protecting yourself and shutting people out can feel identical from the inside. Look for the moment you chose the second one.',
        prompt: 'Say one true thing to someone who has earned hearing it.',
      },
      {
        headline: 'Old weather',
        note: 'A feeling from years ago can arrive with this week\u2019s date on it. Check the calendar before you react to it.',
        prompt: 'Name the year a present irritation actually belongs to.',
      },
      {
        headline: 'Care that costs you',
        note: 'Looking after people is not the same as being responsible for them. Notice where you are carrying someone else\u2019s weather.',
        prompt: 'Offer help once without taking over the problem.',
      },
    ],
  },
  {
    id: 'leo',
    name: 'Leo',
    symbol: '♌',
    dates: '23 July – 22 August',
    element: 'fire',
    modality: 'fixed',
    stars: [
      [0.16, 0.66],
      [0.34, 0.5],
      [0.5, 0.3],
      [0.66, 0.44],
      [0.84, 0.24],
      [0.78, 0.7],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
    ],
    weeks: [
      {
        headline: 'Generosity or performance',
        note: 'Giving is natural here, and sometimes the gift is doing two jobs. Notice which one you are actually doing.',
        prompt: 'Do one good thing this week that nobody will see.',
      },
      {
        headline: 'Praise and evidence',
        note: 'Warmth from other people is pleasant and it is not a measurement of your work. Check one thing you made against something real.',
        prompt: 'Ask for a specific piece of criticism instead of a compliment.',
      },
      {
        headline: 'The room you light',
        note: 'Your energy sets the temperature for everyone nearby, including when you are tired. Notice what people do when you go quiet.',
        prompt: 'Say plainly that you are low, and let it be unremarkable.',
      },
      {
        headline: 'Pride and defence',
        note: 'Being corrected is not being diminished. Watch for the moment you stop listening in order to protect a position.',
        prompt: 'Thank someone for a correction you would normally deflect.',
      },
    ],
  },
  {
    id: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    dates: '23 August – 22 September',
    element: 'earth',
    modality: 'mutable',
    stars: [
      [0.12, 0.44],
      [0.34, 0.3],
      [0.56, 0.44],
      [0.7, 0.66],
      [0.86, 0.52],
    ],
    weeks: [
      {
        headline: 'Useful, not perfect',
        note: 'Precision is a gift until it becomes the reason nothing ships. Notice which standard is doing the work and which is decoration.',
        prompt: 'Send one thing that is finished rather than flawless.',
      },
      {
        headline: 'Criticism and care',
        note: 'You often improve things because you like the person or the work. Check whether that is how it landed.',
        prompt: 'Pair one piece of feedback with a reason you are giving it.',
      },
      {
        headline: 'The body keeps the ledger',
        note: 'Tension usually shows up before you notice the worry. Find where this week\u2019s stress is actually sitting.',
        prompt: 'Unclench one jaw, shoulder or fist and stay with it for a minute.',
      },
      {
        headline: 'Enough is a decision',
        note: 'There is no natural stopping point in most tasks; you have to declare one. Notice the point you declared it last time.',
        prompt: 'Choose a finishing line before you begin something.',
      },
    ],
  },
  {
    id: 'libra',
    name: 'Libra',
    symbol: '♎',
    dates: '23 September – 22 October',
    element: 'air',
    modality: 'cardinal',
    stars: [
      [0.18, 0.5],
      [0.4, 0.3],
      [0.6, 0.5],
      [0.42, 0.72],
      [0.78, 0.62],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
    ],
    weeks: [
      {
        headline: 'Balance is not agreement',
        note: 'Keeping the peace can quietly mean keeping a problem. Notice where you softened something that needed to stay firm.',
        prompt: 'Restate one position you trimmed to avoid friction.',
      },
      {
        headline: 'Deciding is a kindness',
        note: 'Deferring the choice spreads the discomfort rather than removing it. Watch how long you leave someone waiting on you.',
        prompt: 'Make one small decision without polling anyone first.',
      },
      {
        headline: 'Charm and truth',
        note: 'Being liked is pleasant and it is not the same as being known. Notice where you are performing ease.',
        prompt: 'Tell one person something you normally keep smooth.',
      },
      {
        headline: 'Your own side',
        note: 'You can argue another person\u2019s case better than your own. Try writing yours down without qualifying it.',
        prompt: 'Write your side in three sentences, no hedging.',
      },
    ],
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    symbol: '♏',
    dates: '23 October – 21 November',
    element: 'water',
    modality: 'fixed',
    stars: [
      [0.2, 0.24],
      [0.2, 0.5],
      [0.36, 0.66],
      [0.56, 0.56],
      [0.78, 0.68],
      [0.7, 0.36],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
    ],
    weeks: [
      {
        headline: 'Depth or dwelling',
        note: 'Going all the way in is a strength, and it can turn into going round the same loop. Check whether this is still a question or a verdict.',
        prompt: 'Set a time limit on one thing you have decided not to resolve.',
      },
      {
        headline: 'Say the whole thing',
        note: 'Hinting keeps you safe and leaves the other person guessing. Notice where you are testing someone instead of telling them.',
        prompt: 'Replace one hint with a direct sentence.',
      },
      {
        headline: 'Held grievances',
        note: 'Remembering exactly is useful and expensive. Look at one thing you keep available in case you need it.',
        prompt: 'Put down one grievance you have stopped wanting to fix.',
      },
      {
        headline: 'Waiting to be trusted',
        note: 'Trust is usually built by small disclosures, not one large test. Notice who has earned the small ones.',
        prompt: 'Share one ordinary fact about your week with someone.',
      },
    ],
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    symbol: '♐',
    dates: '22 November – 21 December',
    element: 'fire',
    modality: 'mutable',
    stars: [
      [0.16, 0.32],
      [0.36, 0.44],
      [0.56, 0.4],
      [0.74, 0.26],
      [0.8, 0.62],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
    ],
    weeks: [
      {
        headline: 'The wide view',
        note: 'Zooming out is genuinely useful and it can skip past something that needed one honest look. Find the detail you filed under context.',
        prompt: 'Name the small concrete thing one big idea depends on.',
      },
      {
        headline: 'Say the whole truth',
        note: 'Bluntness is often intended as clarity. Check whether the person in front of you got the clarity or the bluntness.',
        prompt: 'Rewrite one honest message once before sending it.',
      },
      {
        headline: 'Restlessness and escape',
        note: 'Wanderlust and avoidance can feel identical in the legs. Notice where the urge to leave is about the place.',
        prompt: 'Stay ten minutes longer than you want to in one conversation.',
      },
      {
        headline: 'Promise small',
        note: 'Enthusiasm makes commitments cheap and expensive to keep. Look at what you said yes to while excited.',
        prompt: 'Convert one vague promise into a dated, small one.',
      },
    ],
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    symbol: '♑',
    dates: '22 December – 19 January',
    element: 'earth',
    modality: 'cardinal',
    stars: [
      [0.14, 0.24],
      [0.34, 0.4],
      [0.54, 0.34],
      [0.66, 0.58],
      [0.86, 0.68],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    weeks: [
      {
        headline: 'Pace over proof',
        note: 'Long effort is your ground and it can become the only thing you trust. Notice the week you confuse exhaustion with commitment.',
        prompt: 'Stop working twenty minutes before you have to.',
      },
      {
        headline: 'Standards and permission',
        note: 'You hold yourself to a number nobody else agreed to. Check who set it and when.',
        prompt: 'Name one standard you can lower without anyone noticing.',
      },
      {
        headline: 'Ask, do not carry',
        note: 'Competence makes asking feel like a downgrade. Find one thing you are doing that somebody would gladly share.',
        prompt: 'Ask for help with something small and specific.',
      },
      {
        headline: 'Purpose without reward',
        note: 'Output is easy to measure and it is not the same as meaning. Notice what you did this week that nobody will count.',
        prompt: 'Protect one hour for something with no measurable result.',
      },
    ],
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    symbol: '♒',
    dates: '20 January – 18 February',
    element: 'air',
    modality: 'fixed',
    stars: [
      [0.14, 0.36],
      [0.32, 0.3],
      [0.42, 0.56],
      [0.6, 0.34],
      [0.76, 0.48],
      [0.86, 0.3],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    weeks: [
      {
        headline: 'Distance and care',
        note: 'Stepping back to see clearly is a gift, and it can read as coldness up close. Notice which one someone received.',
        prompt: 'Say the warm part out loud, not just the analysis.',
      },
      {
        headline: 'Principles in the room',
        note: 'Ideals are easy to hold in the abstract and harder with one person in front of you. Find where the rule met a body.',
        prompt: 'Apply one principle to a single specific case this week.',
      },
      {
        headline: 'Being contrary',
        note: 'Opposition is often how you find your own position. Check whether you would still argue it if nobody disagreed.',
        prompt: 'Agree with something first, then say what you would change.',
      },
      {
        headline: 'Difference and belonging',
        note: 'Standing out is comfortable and it can quietly rule out being close. Notice where you stayed the interesting outsider on purpose.',
        prompt: 'Share one ordinary unimpressive thing about yourself.',
      },
    ],
  },
  {
    id: 'pisces',
    name: 'Pisces',
    symbol: '♓',
    dates: '19 February – 20 March',
    element: 'water',
    modality: 'mutable',
    stars: [
      [0.14, 0.66],
      [0.32, 0.46],
      [0.46, 0.6],
      [0.62, 0.38],
      [0.84, 0.28],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    weeks: [
      {
        headline: 'Absorbing the room',
        note: 'You pick up what other people are carrying before they say it. Check which feelings in you this week started somewhere else.',
        prompt: 'Name one mood you caught rather than created.',
      },
      {
        headline: 'Boundaries are not walls',
        note: 'Refusal is harder here than almost anything else. Notice the moment you agreed with your whole body saying no.',
        prompt: 'Decline one thing and let the discomfort sit unfinished.',
      },
      {
        headline: 'Sweet and untrue',
        note: 'Softening the truth can be kindness and it can also be protection for you. Find one place you softened it.',
        prompt: 'Say one plain thing without a cushion around it.',
      },
      {
        headline: 'Attention you can hold',
        note: 'Drifting is not laziness; it is often overload. Notice what your attention does when the day gets loud.',
        prompt: 'Work in one short block with everything else closed.',
      },
    ],
  },
];

export const SIGN_BY_ID: Record<string, Sign> = Object.fromEntries(SIGNS.map((sign) => [sign.id, sign]));
