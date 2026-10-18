import { useState } from 'react';
import { useChime } from '../audio/AudioProvider';

const SENSES = [
  { count: 5, sense: 'things you can see', hint: 'Colours and shapes, not judgements.' },
  { count: 4, sense: 'things you can touch', hint: 'The chair, the sleeve, the desk.' },
  { count: 3, sense: 'things you can hear', hint: 'Near, far, and the room itself.' },
  { count: 2, sense: 'things you can smell', hint: 'Or two you can almost smell.' },
  { count: 1, sense: 'thing you can taste', hint: 'Coffee, toothpaste, nothing at all.' },
];

export default function Grounding() {
  const chime = useChime();
  const [step, setStep] = useState(0);
  const [found, setFound] = useState(0);
  const [done, setDone] = useState(false);

  const current = SENSES[step] ?? SENSES[0];

  function tap() {
    if (!current) return;
    if (found + 1 >= current.count) {
      if (step + 1 >= SENSES.length) {
        setDone(true);
        chime('release');
      } else {
        setStep((value) => value + 1);
        setFound(0);
        chime('soft');
      }
      return;
    }
    setFound((value) => value + 1);
    chime('soft');
  }

  function back() {
    if (step === 0) return;
    setStep((value) => value - 1);
    setFound(0);
  }

  function skip() {
    if (step + 1 >= SENSES.length) setDone(true);
    else {
      setStep((value) => value + 1);
      setFound(0);
    }
  }

  function restart() {
    setStep(0);
    setFound(0);
    setDone(false);
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#150e2c] px-4 py-8 text-center">
          <span aria-hidden="true" className="text-sage">
            <SproutIcon />
          </span>
          <p className="text-sm font-semibold">Back in the room.</p>
          <p className="max-w-[17rem] text-xs leading-relaxed text-muted">
            Five senses, one at a time. Anxiety lives in the future; senses only live here.
          </p>
          <button type="button" className="btn btn-quiet mt-2 min-h-10! px-3! text-xs" onClick={restart}>
            Walk it again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#150e2c] px-4 py-6 text-center">
        <p className="text-xs tracking-[0.14em] uppercase text-muted">
          Step {step + 1} of {SENSES.length}
        </p>
        <p className="text-sm font-semibold leading-relaxed">
          Notice {current?.count} {current?.sense}
        </p>
        <p className="text-xs text-muted">{current?.hint}</p>

        <button type="button" className="btn btn-quiet mt-1 min-h-11! px-4! text-sm" onClick={tap}>
          Found one — {Math.max(0, (current?.count ?? 1) - found - 1)} to go
        </button>

        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: current?.count ?? 0 }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 w-5 rounded-full transition-colors ${index < found ? 'bg-accent' : 'bg-white/12'}`}
            />
          ))}
        </div>

        <p aria-live="polite" className="sr-only">
          Step {step + 1} of {SENSES.length}. Notice {current?.count} {current?.sense}.
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button type="button" className="btn btn-quiet min-h-10! px-3! text-xs" onClick={back} disabled={step === 0}>
          Back
        </button>
        <button type="button" className="btn btn-quiet min-h-10! px-3! text-xs" onClick={skip}>
          Skip this sense
        </button>
        <button type="button" className="ml-auto text-xs text-muted underline-offset-4 hover:underline" onClick={restart}>
          Start over
        </button>
      </div>
    </div>
  );
}

function SproutIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 21v-7" />
      <path d="M12 14c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6Z" />
      <path d="M12 14c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6Z" />
    </svg>
  );
}
