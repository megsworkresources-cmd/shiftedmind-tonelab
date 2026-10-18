import type { SignalKind } from './types';

export interface Rule {
  id: string;
  kind: SignalKind;
  /** Regex source. Detection compiles it with the flags below. */
  pattern: string;
  /** `g` is always added; `i` unless the rule must be case-sensitive. */
  caseSensitive?: boolean;
  weight: number;
  note: string;
  /** Safe, meaning-preserving replacement offered with the register rewrites. */
  fix?: { replacement: string; why: string };
  /** Replacement that changes the claim; offered separately, never applied silently. */
  meaningFix?: { replacement: string; why: string };
}

export const LEXICON: Rule[] = [
  // Heat: aimed at a person
  {
    id: 'slur-lite',
    kind: 'heat',
    pattern: '\\b(?:stupid|dumb|idiot(?:s|ic)?|moron(?:s|ic)?|imbecile)\\b',
    weight: 0.9,
    note: 'A judgement of the person, not the work. Say what the thing did instead.',
    meaningFix: { replacement: 'not working', why: 'Describes the problem instead of the person.' },
  },
  {
    id: 'worthless',
    kind: 'heat',
    pattern: '\\b(?:useless|pathetic|worthless)\\b',
    weight: 0.85,
    note: 'This says the reader has no value here. That is the line people remember.',
    meaningFix: { replacement: 'not helping yet', why: 'Keeps the complaint, drops the verdict on the person.' },
  },
  {
    id: 'trash',
    kind: 'heat',
    pattern: '\\b(?:trash|garbage)\\b',
    weight: 0.7,
    note: 'Contempt for the work, which transfers to whoever made it.',
    meaningFix: { replacement: 'not landing', why: 'Same objection, without the disposal metaphor.' },
  },
  {
    id: 'ridiculous',
    kind: 'heat',
    pattern: '\\bridiculous\\b',
    weight: 0.6,
    note: 'Frames the reader as absurd. "Surprising" keeps the disagreement.',
    meaningFix: { replacement: 'surprising', why: 'Keeps the objection, removes the judgement.' },
  },
  {
    id: 'shut-up',
    kind: 'heat',
    pattern: '\\b(?:shut up|get lost|piss off)\\b',
    weight: 0.95,
    note: 'This closes the conversation. If you need a pause, ask for one.',
  },
  {
    id: 'hate',
    kind: 'heat',
    pattern: '\\bhate (?:you|this|that|it)\\b',
    weight: 0.9,
    note: '"Hate" is a feeling, not a request. Name what you want changed.',
    meaningFix: { replacement: "I'm frustrated with this", why: 'Names your state rather than attacking.' },
  },
  {
    id: 'you-people',
    kind: 'heat',
    pattern: '\\byou people\\b',
    weight: 0.9,
    note: 'Turns one person into a category. Categories do not reply well.',
    meaningFix: { replacement: 'the team', why: 'Keeps the group reference, drops the us/them frame.' },
  },
  {
    id: 'nobody-cares',
    kind: 'heat',
    pattern: '\\b(?:nobody|no one) cares\\b|\\bwho cares\\b',
    weight: 0.8,
    note: 'Speaks for everyone else. Say what you have noticed instead.',
    meaningFix: { replacement: 'this keeps getting missed', why: 'States the observation without the audience vote.' },
  },
  {
    id: 'wasting-time',
    kind: 'heat',
    pattern: '\\bwasting (?:everyone\'s|everybody\'s|my|our|their) time\\b',
    weight: 0.85,
    note: 'Blames the reader for the delay. Name the blocked work instead.',
    meaningFix: { replacement: 'holding up the review', why: 'Points at the work, not the person.' },
  },
  {
    id: 'incompetent',
    kind: 'heat',
    pattern: '\\b(?:incompetent|clueless|amateur)\\b',
    weight: 0.75,
    note: 'A verdict on competence is the hardest thing to un-hear.',
  },
  {
    id: 'whatever',
    kind: 'heat',
    pattern: '\\bwhatever\\b',
    weight: 0.5,
    note: 'Dismissive. It ends the conversation instead of the problem.',
  },
  {
    id: 'wtf',
    kind: 'heat',
    pattern: '\\b(?:wtf|wth|ffs)\\b',
    weight: 0.7,
    note: 'Reads as exasperation at the reader, even when it is at the situation.',
  },

  // Demand: orders dressed as sentences
  {
    id: 'you-need',
    kind: 'demand',
    pattern: '\\byou (?:need|have|got) to\\b|\\byou must\\b',
    weight: 0.6,
    note: 'An order. "Could you…" asks the same thing and leaves room for a yes.',
    fix: { replacement: 'could you', why: 'Turns the order into an ask.' },
  },
  {
    id: 'you-should',
    kind: 'demand',
    pattern: '\\byou should\\b',
    weight: 0.45,
    note: 'Advice with the volume of an instruction.',
    fix: { replacement: 'you might', why: 'Leaves the decision with the reader.' },
  },
  {
    id: 'i-said',
    kind: 'demand',
    pattern: '\\bi said\\b',
    weight: 0.5,
    note: 'Ranking the conversation instead of repeating the ask.',
    fix: { replacement: 'I mentioned', why: 'Same reminder, no hierarchy.' },
  },
  {
    id: 'right-now',
    kind: 'demand',
    pattern: '\\b(?:do it now|right now|immediately)\\b',
    weight: 0.7,
    note: 'Urgency without a reason reads as pressure.',
  },
  {
    id: 'asap',
    kind: 'demand',
    pattern: '\\basap\\b',
    weight: 0.6,
    note: '"ASAP" hides the actual deadline. Give the date.',
  },
  {
    id: 'no-excuses',
    kind: 'demand',
    pattern: '\\b(?:no excuses|deal with it|not my problem)\\b',
    weight: 0.75,
    note: 'Pre-emptively dismissing the reply. People answer that with silence.',
  },
  {
    id: 'calm-down',
    kind: 'demand',
    pattern: '\\b(?:calm down|relax)\\b',
    weight: 0.7,
    note: '"Calm down" is reliably heard as a second insult. Name the behaviour instead.',
  },
  {
    id: 'listen',
    kind: 'demand',
    pattern: '\\blisten to me\\b',
    weight: 0.6,
    note: 'Implies the reader has not been listening.',
  },
  {
    id: 'obviously',
    kind: 'demand',
    pattern: '\\b(?:obviously|clearly you|as everyone knows)\\b',
    weight: 0.55,
    note: 'Implies the reader missed something easy. Delete it and the sentence still works.',
    fix: { replacement: '', why: 'The sentence makes the same point without the sting.' },
  },

  // Volume
  {
    id: 'exclamations',
    kind: 'volume',
    pattern: '!{2,}',
    weight: 0.5,
    note: 'Stacked exclamation marks read as volume, not urgency.',
    fix: { replacement: '!', why: 'One mark, still emphatic.' },
  },
  {
    id: 'caps',
    kind: 'volume',
    pattern: '\\b[A-Z]{4,}\\b',
    caseSensitive: true,
    weight: 0.4,
    note: 'All caps is the text version of raising your voice.',
  },
  {
    id: 'caps-phrase',
    kind: 'volume',
    pattern: '\\b[A-Z]{2,}(?:\\s+[A-Z]{2,})+\\b',
    caseSensitive: true,
    weight: 0.5,
    note: 'Consecutive all-caps words shout the whole clause.',
  },
  {
    id: 'slammed-question',
    kind: 'volume',
    pattern: '\\?!|!\\?',
    weight: 0.35,
    note: 'A slammed question mark can feel like an accusation.',
    fix: { replacement: '?', why: 'Keeps the question mark, drops the slam.' },
  },

  // Absolutes
  {
    id: 'always',
    kind: 'absolute',
    pattern: '\\balways\\b',
    weight: 0.35,
    note: 'Absolutes box the reader in. "This time" keeps the complaint true.',
    fix: { replacement: 'this time', why: 'Describes the instance instead of the character.' },
  },
  {
    id: 'never',
    kind: 'absolute',
    pattern: '\\bnever\\b',
    weight: 0.35,
    note: '"Never" invites a counter-example instead of a fix.',
    fix: { replacement: 'not yet', why: 'Leaves room for a first time.' },
  },
  {
    id: 'every-time',
    kind: 'absolute',
    pattern: '\\bevery (?:single )?time\\b|\\bconstantly\\b',
    weight: 0.3,
    note: 'A pattern claim from one example is easy to argue with.',
    fix: { replacement: 'last time', why: 'Anchors the complaint to something specific.' },
  },

  // Hedges
  {
    id: 'just',
    kind: 'hedge',
    pattern: '\\bjust\\b',
    weight: 0.2,
    note: '"Just" shrinks the ask before it lands.',
    fix: { replacement: '', why: 'The ask gets its full size back.' },
  },
  {
    id: 'kind-of',
    kind: 'hedge',
    pattern: '\\b(?:kind of|kinda|sort of|sorta)\\b',
    weight: 0.25,
    note: 'This blurs the ask. Say the thing you mean.',
  },
  {
    id: 'i-guess',
    kind: 'hedge',
    pattern: '\\bi guess\\b|\\bmaybe\\b',
    weight: 0.2,
    note: 'Hands the decision back to the reader, who may not take it.',
  },
  {
    id: 'i-think',
    kind: 'hedge',
    pattern: '\\bi think\\b|\\bi feel like\\b',
    weight: 0.15,
    note: 'Qualifies your own observation before anyone else can.',
  },
  {
    id: 'apologetic',
    kind: 'hedge',
    pattern: '\\b(?:sorry to (?:bother|ask)|if you don\'t mind|not sure but|hope this is okay)\\b',
    weight: 0.35,
    note: 'Apologising for the ask invites the reader to treat it as optional.',
  },
  {
    id: 'no-rush',
    kind: 'hedge',
    pattern: '\\bno rush\\b|\\bwhenever you get a chance\\b',
    weight: 0.15,
    note: 'Fine when true. If there is a deadline, this hides it.',
  },

  // Warmth
  {
    id: 'please',
    kind: 'warmth',
    pattern: '\\b(?:please|thank(?:s| you)?|appreciate|grateful)\\b',
    weight: 0.35,
    note: 'Acknowledges the person doing the work.',
  },
  {
    id: 'praise',
    kind: 'warmth',
    pattern: '\\b(?:glad|great|nice|wonderful|excited|proud|congrats|congratulations|well done|good job)\\b',
    weight: 0.3,
    note: 'Names something going well.',
  },
  {
    id: 'could-you',
    kind: 'warmth',
    pattern: '\\bcould you\\b|\\bwould you mind\\b',
    weight: 0.3,
    note: 'A request with a door in it.',
  },
  {
    id: 'together',
    kind: 'warmth',
    pattern: '\\b(?:team|together|with you)\\b',
    weight: 0.15,
    note: 'Frames the work as shared.',
  },

  // Play
  {
    id: 'laugh',
    kind: 'play',
    pattern: '\\b(?:lol|lmao|haha+|jk)\\b|😂|🤣',
    weight: 0.4,
    note: 'Reads as joking — which can defuse, or can land sideways in text.',
  },
  {
    id: 'kidding',
    kind: 'play',
    pattern: '\\b(?:just kidding|kidding)\\b',
    weight: 0.3,
    note: 'Signals the joke after the fact, which is where jokes usually go wrong.',
  },
];

/** Words in caps that are not shouting. */
export const CAPS_ALLOWLIST = new Set([
  'ASAP', 'FYI', 'EOD', 'ETA', 'PTO', 'OK', 'PDF', 'API', 'URL', 'SLA', 'CEO', 'CFO', 'CTO',
  'HR', 'QA', 'UAT', 'PR', 'CI', 'CD', 'AWS', 'GCP', 'SQL', 'JSON', 'HTML', 'CSS', 'AI', 'ML',
  'LLM', 'CRM', 'KPI', 'ROI', 'MVP', 'DOC', 'XLS', 'CSV', 'UTC', 'AM', 'PM', 'ET', 'PT', 'EST',
  'PST', 'GMT', 'NOTE', 'TODO', 'README', 'HTTP', 'HTTPS',
]);
