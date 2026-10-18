import { useCallback, useEffect, useRef, useState } from 'react';
import { useChime } from '../audio/AudioProvider';
import { LOCAL_DATA_EVENT, STORAGE_KEYS, readRaw, writeRaw } from '../lib/storage';

const URGE_WORDS = ['Snap back', 'Check the phone', 'Defend myself', 'Say it now', 'Buy it', 'Refresh', 'Win this', 'Interrupt'];
const DURATION_MS = 20_000;
const LIFETIME_MS = 1_400;

interface Urge {
  id: number;
  word: string;
  x: number;
  y: number;
  born: number;
}

type Phase = 'idle' | 'running' | 'paused' | 'done';

function readBest(): number {
  const raw = readRaw(STORAGE_KEYS.impulseBest);
  const parsed = raw === null ? 0 : Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export default function ImpulseCatcher() {
  const chime = useChime();
  const [phase, setPhase] = useState<Phase>('idle');
  const [urges, setUrges] = useState<Urge[]>([]);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [remaining, setRemaining] = useState(20);
  const [best, setBest] = useState(readBest);
  const [status, setStatus] = useState('');

  const urgesRef = useRef<Urge[]>([]);
  const nextId = useRef(0);
  const startedAt = useRef(0);
  const elapsed = useRef(0);
  const lastSpawn = useRef(0);
  const caughtRef = useRef(0);
  const missedRef = useRef(0);
  const bestRef = useRef(best);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    chime('release');
    setPhase('done');
    setUrges([]);
    urgesRef.current = [];
    setRemaining(0);
    const score = caughtRef.current;
    setStatus(
      `Time. You caught ${score} and ${missedRef.current} slipped past. ${
        score > missedRef.current ? 'That is the muscle.' : 'In real life you get a breath, not a second.'
      }`,
    );
    if (score > bestRef.current) {
      bestRef.current = score;
      setBest(score);
      writeRaw(STORAGE_KEYS.impulseBest, String(score));
    }
  }, [chime]);

  // If the user clears local data in another tab or on the data page, stop
  // showing a best score that no longer exists.
  useEffect(() => {
    const sync = () => {
      const stored = readBest();
      bestRef.current = stored;
      setBest(stored);
    };
    window.addEventListener(LOCAL_DATA_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(LOCAL_DATA_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'running') return;
    const tick = () => {
      const now = Date.now();
      const total = elapsed.current + (now - startedAt.current);
      setRemaining(Math.max(0, Math.ceil((DURATION_MS - total) / 1000)));

      const alive = urgesRef.current.filter((urge) => now - urge.born < LIFETIME_MS);
      const expired = urgesRef.current.length - alive.length;
      if (expired > 0) {
        missedRef.current += expired;
        setMissed(missedRef.current);
      }

      const interval = 900 - 400 * Math.min(1, total / DURATION_MS);
      if (now - lastSpawn.current >= interval) {
        lastSpawn.current = now;
        alive.push({
          id: nextId.current,
          word: URGE_WORDS[Math.floor(Math.random() * URGE_WORDS.length)] ?? 'Snap back',
          x: 4 + Math.random() * 62,
          y: 6 + Math.random() * 56,
          born: now,
        });
        nextId.current += 1;
      }

      urgesRef.current = alive;
      setUrges(alive);

      if (total >= DURATION_MS) finish();
    };
    const id = window.setInterval(tick, 120);
    return () => window.clearInterval(id);
  }, [phase, finish]);

  const catchUrge = useCallback(
    (id: number) => {
      if (!urgesRef.current.some((urge) => urge.id === id)) return;
      urgesRef.current = urgesRef.current.filter((urge) => urge.id !== id);
      setUrges(urgesRef.current);
      caughtRef.current += 1;
      setCaught(caughtRef.current);
      chime('soft');
    },
    [chime],
  );

  useEffect(() => {
    if (phase !== 'running') return;
    const onKey = (event: KeyboardEvent) => {
      if (!/^[1-5]$/.test(event.key)) return;
      const index = Number(event.key) - 1;
      const urge = urgesRef.current[index];
      if (!urge) return;
      event.preventDefault();
      catchUrge(urge.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, catchUrge]);

  function start() {
    finished.current = false;
    caughtRef.current = 0;
    missedRef.current = 0;
    elapsed.current = 0;
    startedAt.current = Date.now();
    lastSpawn.current = 0;
    urgesRef.current = [];
    nextId.current = 0;
    setCaught(0);
    setMissed(0);
    setUrges([]);
    setRemaining(20);
    setStatus('Go. Catch them before they slip.');
    setPhase('running');
  }

  function pause() {
    elapsed.current += Date.now() - startedAt.current;
    setPhase('paused');
    setStatus('Paused. The urges stop with you.');
  }

  function resume() {
    startedAt.current = Date.now();
    setPhase('running');
    setStatus('Back on.');
  }

  const progress = Math.min(1, 1 - remaining / 20);

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative h-44 overflow-hidden rounded-xl border border-white/10 bg-[#150e2c]" role="group" aria-label="Urges to catch">
        {urges.map((urge) => (
          <button
            key={urge.id}
            type="button"
            onClick={() => catchUrge(urge.id)}
            className="absolute z-10 inline-flex min-h-11 -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-heat/50 bg-heat/15 px-3 text-[0.7rem] font-semibold text-cream shadow-[0_0_18px_rgba(242,134,154,0.25)]"
            style={{ left: `${urge.x}%`, top: `${urge.y}%` }}
            aria-label={`Catch ${urge.word}`}
          >
            {urge.word}
          </button>
        ))}

        {phase !== 'running' && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-5 text-center">
            {phase === 'idle' && (
              <>
                <p className="text-sm font-semibold">20 seconds</p>
                <p className="max-w-[16rem] text-xs leading-relaxed text-muted">
                  Urges appear fast and leave faster. Tap one before it disappears — that is the whole skill.
                </p>
              </>
            )}
            {phase === 'paused' && (
              <>
                <p className="text-sm font-semibold">Paused</p>
                <p className="max-w-[16rem] text-xs leading-relaxed text-muted">Take the breath. Resume when you are ready.</p>
              </>
            )}
            {phase === 'done' && (
              <>
                <p className="text-sm font-semibold">
                  {caught} caught · {missed} slipped past
                </p>
                <p className="max-w-[17rem] text-xs leading-relaxed text-muted">
                  {caught > missed
                    ? 'You caught more than slipped. That is the muscle.'
                    : 'They move fast. In real life you get a breath, not a second.'}
                </p>
              </>
            )}
            <div className="mt-1 flex flex-wrap justify-center gap-2">
              {phase === 'idle' && (
                <button type="button" className="btn btn-primary min-h-10! text-sm" onClick={start}>
                  Start the drill
                </button>
              )}
              {phase === 'paused' && (
                <button type="button" className="btn btn-primary min-h-10! text-sm" onClick={resume}>
                  Resume
                </button>
              )}
              {phase === 'done' && (
                <button type="button" className="btn btn-primary min-h-10! text-sm" onClick={start}>
                  Go again
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'running' && (
          <button
            type="button"
            onClick={pause}
            className="btn btn-quiet absolute right-2 top-2 z-20 min-h-9! px-2.5! text-xs"
          >
            Pause
          </button>
        )}

        {phase === 'running' && (
          <div className="pointer-events-none absolute inset-x-3 bottom-2 flex items-center gap-2">
            <div aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="text-[0.65rem] tabular-nums text-cream/70">{remaining}s</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span aria-live="polite">{status}</span>
        {best > 0 && <span className="ml-auto text-cream/60">Best: {best}</span>}
      </div>
      <p className="mt-1 text-[0.68rem] text-muted/80">Keys 1–5 catch without the mouse. Pause any time.</p>
    </div>
  );
}
