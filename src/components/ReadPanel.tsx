import type { Read, Signal } from '../tone/types';
import { KIND_LABEL } from '../tone/types';

interface Props {
  read: Read;
  activeId: string | null;
  onActivate: (id: string | null) => void;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
}

const BUCKET_STYLE: Record<Read['bucket'], string> = {
  clear: 'border-sage/40 bg-sage/10 text-sage',
  leaning: 'border-accent/40 bg-accent/10 text-accent',
  mixed: 'border-heat/40 bg-heat/10 text-heat',
  insufficient: 'border-white/20 bg-white/5 text-muted',
};

function band(value: number): 'low' | 'some' | 'strong' {
  if (value < 0.33) return 'low';
  if (value < 0.66) return 'some';
  return 'strong';
}

export default function ReadPanel({ read, activeId, onActivate, headingRef }: Props) {
  return (
    <section aria-labelledby="read-heading" className="panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">The read</p>
        <span className={`chip min-h-7! text-[0.7rem] ${BUCKET_STYLE[read.bucket]}`}>{read.bucketLabel}</span>
      </div>

      <h2
        id="read-heading"
        ref={headingRef}
        tabIndex={-1}
        className="mt-2.5 font-display text-2xl font-semibold tracking-tight text-balance"
      >
        {read.headline}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-cream/75">{read.detail}</p>

      {read.evidence.length > 0 && (
        <div className="mt-5">
          <h3 className="eyebrow">Why it reads that way</h3>
          <ul className="mt-2.5 space-y-2">
            {read.evidence.map((signal: Signal) => (
              <li key={signal.id}>
                <button
                  type="button"
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    activeId === signal.id
                      ? 'border-accent/50 bg-accent/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                  }`}
                  onMouseEnter={() => onActivate(signal.id)}
                  onMouseLeave={() => onActivate(null)}
                  onFocus={() => onActivate(signal.id)}
                  onBlur={() => onActivate(null)}
                  onClick={() => onActivate(activeId === signal.id ? null : signal.id)}
                >
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-cream">“{signal.text}”</span>
                    <span className="text-[0.65rem] tracking-[0.14em] uppercase text-muted">
                      {KIND_LABEL[signal.kind]}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{signal.note}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 border-t border-white/10 pt-4">
        <h3 className="eyebrow">Dimensions</h3>
        <dl className="mt-2.5 space-y-2.5">
          <Dimension label="Warmth" value={read.dimensions.warmth} tone="bg-sage" />
          <Dimension label="Heat" value={read.dimensions.heat} tone="bg-heat" />
          <Dimension label="Directness" value={read.dimensions.directness} tone="bg-accent" />
        </dl>
      </div>

      <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-muted">
        <span className="text-cream/70">What this cannot see:</span> your history with the reader, what
        happened in the room, or what you actually meant. It reads words, not context — treat it as a
        second pair of eyes, not a verdict.
      </p>
    </section>
  );
}

function Dimension({ label, value, tone }: { label: string; value: number; tone: string }) {
  const level = band(value);
  return (
    <div className="flex items-center gap-3">
      <dt className="w-24 shrink-0 text-xs text-muted">{label}</dt>
      <div aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <dd className="w-14 shrink-0 text-right text-xs text-cream/70">{level}</dd>
    </div>
  );
}
