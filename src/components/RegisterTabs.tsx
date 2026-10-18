import { useEffect, useMemo, useRef, useState } from 'react';
import { diffWords } from '../tone/diff';
import { REGISTER_BLURB, REGISTER_LABEL, rewrite, withOptional } from '../tone/rewrite';
import type { Register } from '../tone/types';

const REGISTERS: Register[] = ['softer', 'kinder', 'plainer'];

interface Props {
  draft: string;
}

export default function RegisterTabs({ draft }: Props) {
  const [register, setRegister] = useState<Register>('softer');
  const [showDiff, setShowDiff] = useState(false);
  const [applied, setApplied] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const tabRefs = useRef<Record<Register, HTMLButtonElement | null>>({
    softer: null,
    kinder: null,
    plainer: null,
  });

  const variant = useMemo(() => rewrite(draft, register), [draft, register]);

  useEffect(() => {
    setApplied([]);
  }, [draft, register]);

  const chosen = variant.optional.filter((_, index) => applied.includes(index));
  const text = chosen.length > 0 ? withOptional(variant.text, chosen) : variant.text;
  const canCopy = text.trim().length > 0;
  const changed = text.trim() !== draft.trim();
  const diff = useMemo(() => diffWords(draft, text), [draft, text]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function onTabKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = REGISTERS.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    const target = REGISTERS[next];
    if (!target) return;
    setRegister(target);
    tabRefs.current[target]?.focus();
  }

  return (
    <div>
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">Say it another way</h2>
        <p className="mt-1 text-xs text-muted">Surgical edits only. Nothing is added to your message.</p>
      </div>

      <div role="tablist" aria-label="Rewrite registers" className="mt-3 flex flex-wrap gap-2">
        {REGISTERS.map((name, index) => {
          const selected = register === name;
          return (
            <button
              key={name}
              ref={(node) => {
                tabRefs.current[name] = node;
              }}
              role="tab"
              id={`tab-${name}`}
              aria-selected={selected}
              aria-controls={`panel-${name}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setRegister(name)}
              onKeyDown={(event) => onTabKey(event, index)}
              className={`flex min-h-11 flex-col justify-center rounded-xl border px-3.5 text-left transition-colors ${
                selected
                  ? 'border-accent/60 bg-accent/10 text-cream'
                  : 'border-white/12 bg-white/[0.02] text-cream/70 hover:border-white/25 hover:text-cream'
              }`}
            >
              <span className="text-sm font-semibold">{REGISTER_LABEL[name]}</span>
              <span className="text-[0.65rem] text-muted">{REGISTER_BLURB[name]}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${register}`}
        aria-labelledby={`tab-${register}`}
        className="mt-4 animate-rise rounded-xl border border-white/10 bg-[#150e2c] p-4"
      >
        <p className="text-xs leading-relaxed text-muted">{variant.note}</p>

        <div className="mt-3 text-[0.98rem] leading-7 text-cream/90">
          {showDiff && changed
            ? diff.map((token, index) => {
                if (token.type === 'same') return <span key={index}>{token.text}</span>;
                if (token.type === 'add')
                  return (
                    <span key={index} className="diff-add">
                      {token.text}
                    </span>
                  );
                return (
                  <span key={index} className="diff-del">
                    {token.text}
                  </span>
                );
              })
            : text}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary min-h-10! px-3.5! text-sm" onClick={copy} disabled={!canCopy}>
            {copied ? 'Copied' : 'Copy this version'}
          </button>
          {changed && (
            <button
              type="button"
              className="btn btn-quiet min-h-10! px-3! text-xs"
              aria-pressed={showDiff}
              onClick={() => setShowDiff((value) => !value)}
            >
              {showDiff ? 'Hide changes' : 'Show changes'}
            </button>
          )}
          <span aria-live="polite" className="text-xs text-sage">
            {copied ? 'Copied to clipboard.' : ''}
          </span>
        </div>

        {chosen.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-heat/25 pt-3">
            {chosen.map((edit, index) => (
              <li key={`applied-${index}`} className="text-xs text-muted">
                <span className="text-heat">Claim changed: </span>
                <span className="text-cream/80">“{variant.text.slice(edit.start, edit.end)}”</span>
                {' → '}
                <span className="text-cream/80">“{edit.replacement}”</span>
                <span className="text-muted/80"> — {edit.why}</span>
              </li>
            ))}
          </ul>
        )}

        {variant.edits.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
            {variant.edits.slice(0, 3).map((edit, index) => (
              <li key={index} className="text-xs text-muted">
                <span className="text-cream/80">“{draft.slice(edit.start, edit.end) || '…'}”</span>
                {edit.replacement ? (
                  <>
                    {' → '}
                    <span className="text-cream/80">“{edit.replacement}”</span>
                  </>
                ) : (
                  ' removed'
                )}
                <span className="text-muted/80"> — {edit.why}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {variant.optional.length > 0 && (
        <details className="group mt-3 rounded-xl border border-heat/25 bg-heat/[0.06] px-4 py-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-cream">
            <span aria-hidden="true" className="text-heat">
              ⚠
            </span>
            Optional: swaps that change what you claim
            <span className="ml-auto text-xs font-normal text-muted">{variant.optional.length}</span>
          </summary>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            These remove the judgement, so they also change the accusation. Apply one only if you mean the
            replacement.
          </p>
          <ul className="mt-2.5 space-y-2">
            {variant.optional.map((edit, index) => {
              const isOn = applied.includes(index);
              return (
                <li key={`${edit.start}-${index}`} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-cream/75">“{variant.text.slice(edit.start, edit.end)}”</span>
                  <span aria-hidden="true" className="text-xs text-muted">
                    →
                  </span>
                  <span className="text-xs text-cream/90">“{edit.replacement}”</span>
                  <button
                    type="button"
                    className={`chip ml-auto min-h-9! text-xs ${
                      isOn ? 'border-heat/50 bg-heat/15 text-cream' : 'border-white/15 text-cream/75'
                    }`}
                    aria-pressed={isOn}
                    onClick={() =>
                      setApplied((current) =>
                        current.includes(index) ? current.filter((value) => value !== index) : [...current, index],
                      )
                    }
                  >
                    {isOn ? 'Applied' : 'Apply'}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[0.7rem] text-muted">{chosen[0]?.why ?? 'Meaning changes are never applied by default.'}</p>
        </details>
      )}
    </div>
  );
}
