import { useEffect, useId, useState } from 'react';
import { useChime } from '../audio/AudioProvider';
import { LOCAL_DATA_EVENT, STORAGE_KEYS, readRaw, removeRaw, writeRaw } from '../lib/storage';

interface Intention {
  text: string;
  at: string;
}

function readIntention(): Intention | null {
  try {
    const raw = readRaw(STORAGE_KEYS.intention);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'text' in parsed &&
      'at' in parsed &&
      typeof (parsed as Intention).text === 'string' &&
      typeof (parsed as Intention).at === 'string'
    ) {
      return parsed as Intention;
    }
    return null;
  } catch {
    return null;
  }
}

export default function CarryIt() {
  const chime = useChime();
  const fieldId = useId();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState<Intention | null>(readIntention);
  const [error, setError] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readIntention());
    window.addEventListener(LOCAL_DATA_EVENT, sync);
    return () => window.removeEventListener(LOCAL_DATA_EVENT, sync);
  }, []);

  function save(event: React.FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    const next: Intention = { text: value, at: new Date().toISOString() };
    if (writeRaw(STORAGE_KEYS.intention, JSON.stringify(next))) {
      setSaved(next);
      setText('');
      setError(false);
      chime('confirm');
    } else {
      setError(true);
    }
  }

  function clear() {
    removeRaw(STORAGE_KEYS.intention);
    setSaved(null);
    chime('release');
  }

  return (
    <section id="carry" aria-labelledby="carry-heading" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-14 sm:scroll-mt-24 sm:px-6">
      <div className="border-t border-white/10 pt-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
          <div>
            <p className="eyebrow">06 · Carry it</p>
            <h2 id="carry-heading" className="mt-2 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              The lab is not the point. The next conversation is.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              One intention, written before you need it, is worth more than a perfect rewrite you never send.
              Name it here and it stays on this device.
            </p>
            <p className="mt-2 text-xs text-muted/80">
              Saved to this browser only. No account, no sync, no analytics on what you typed.{' '}
              <a
                href="#/data"
                className="text-cream/80 underline decoration-accent/50 underline-offset-2 hover:text-cream"
              >
                See, export or delete what is stored
              </a>
              .
            </p>
          </div>

          <div className="panel p-5">
            {saved ? (
              <div>
                <p className="eyebrow">Carried</p>
                <blockquote className="mt-2 font-display text-xl leading-snug text-cream">“{saved.text}”</blockquote>
                <p className="mt-2 text-xs text-muted">
                  Saved {new Date(saved.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-quiet min-h-11! px-3! text-xs"
                    onClick={clear}
                    aria-label="Delete the saved intention from this browser"
                  >
                    Delete
                  </button>
                  <a
                    href="https://shiftedmind.vercel.app/auth"
                    className="btn btn-primary min-h-10! px-3.5! text-xs"
                  >
                    Hang it as a star
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={save}>
                <label htmlFor={fieldId} className="eyebrow">
                  Your intention
                </label>
                <input
                  id={fieldId}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  maxLength={120}
                  className="field mt-2 min-h-11! py-2.5! text-sm"
                  placeholder="e.g. Ask for the deadline before I say yes."
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button type="submit" className="btn btn-primary min-h-10! px-3.5! text-sm" disabled={!text.trim()}>
                    Keep it
                  </button>
                  <a href="https://shiftedmind.vercel.app/auth" className="btn btn-quiet min-h-10! px-3! text-xs">
                    Start free
                  </a>
                </div>
                {error && (
                  <p role="alert" className="mt-2 text-xs text-heat">
                    This browser blocked local storage. The intention was not saved.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
