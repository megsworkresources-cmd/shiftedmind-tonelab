import { useId, useState } from 'react';
import { useChime } from '../audio/AudioProvider';

const EXAMPLES = [
  'I have to give the presentation on Thursday.',
  'They have not replied to my message.',
  'I made a mistake in the review.',
  'Tomorrow is going to be hard.',
];

const LENSES = [
  { name: 'Evidence', line: '…and I have handled something like this before.' },
  { name: 'Other side', line: '…and they are carrying something I cannot see.' },
  { name: 'Friend', line: '…and I know exactly what I would say to a friend in this.' },
];

export default function ReframeLens() {
  const chime = useChime();
  const fieldId = useId();
  const [situation, setSituation] = useState(EXAMPLES[0] ?? '');
  const [lens, setLens] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0);

  const current = LENSES[lens] ?? LENSES[0];

  function nextExample() {
    const next = (exampleIndex + 1) % EXAMPLES.length;
    setExampleIndex(next);
    setSituation(EXAMPLES[next] ?? '');
    setLens(0);
  }

  return (
    <div className="flex flex-1 flex-col">
      <label htmlFor={fieldId} className="text-xs text-muted">
        Your situation
      </label>
      <input
        id={fieldId}
        value={situation}
        maxLength={140}
        onChange={(event) => setSituation(event.target.value)}
        className="field mt-1.5 min-h-11! py-2.5! text-sm"
        placeholder="The thing that is actually happening"
      />

      <div className="mt-3 flex min-h-[8.5rem] flex-1 flex-col justify-center rounded-xl border border-white/10 bg-[#150e2c] p-4">
        <p className="text-xs tracking-[0.14em] uppercase text-muted">Lens · {current?.name}</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-cream/90">
          “{situation.trim() || 'Your situation'}”
        </p>
        <p key={lens} className="animate-rise mt-2 text-sm leading-relaxed text-cool">
          {current?.line}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-quiet min-h-10! px-3! text-xs"
          onClick={() => {
            setLens((value) => (value + 1) % LENSES.length);
            chime('soft');
          }}
        >
          Turn the lens
        </button>
        <button type="button" className="btn btn-quiet min-h-10! px-3! text-xs" onClick={nextExample}>
          Another situation
        </button>
        <span aria-live="polite" className="ml-auto text-[0.68rem] text-muted">
          {lens + 1} of {LENSES.length}
        </span>
      </div>
      <p className="mt-1 text-[0.68rem] text-muted/80">
        Same facts, different frame. Nothing here is generated — the three lenses are fixed questions.
      </p>
    </div>
  );
}
