import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChime } from './audio/AudioProvider';
import AnnotatedDraft from './components/AnnotatedDraft';
import CarryIt from './components/CarryIt';
import Footer from './components/Footer';
import Header from './components/Header';
import MessageField, { SAMPLES } from './components/MessageField';
import ReadPanel from './components/ReadPanel';
import RegisterTabs from './components/RegisterTabs';
import SectionHeader from './components/SectionHeader';
import Sky from './components/Sky';
import SkyNotes from './components/SkyNotes';
import SoundPanel from './components/SoundPanel';
import VoiceLab from './components/VoiceLab';
import DrillCard from './drills/DrillCard';
import Grounding from './drills/Grounding';
import ImpulseCatcher from './drills/ImpulseCatcher';
import ReframeLens from './drills/ReframeLens';
import { pageTitle, useHashRoute } from './hooks/useHashRoute';
import Accessibility from './legal/Accessibility';
import LocalData from './legal/LocalData';
import PrivacyPolicy from './legal/PrivacyPolicy';
import Terms from './legal/Terms';
import { detect } from './tone/detect';
import { readTone } from './tone/score';

const LEGEND = [
  { kind: 'heat', label: 'Heat' },
  { kind: 'demand', label: 'Order' },
  { kind: 'volume', label: 'Volume' },
  { kind: 'absolute', label: 'Absolute' },
  { kind: 'hedge', label: 'Hedge' },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-cream focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
    >
      Skip to content
    </a>
  );
}

export default function App() {
  const page = useHashRoute();
  const [draft, setDraft] = useState('');
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [sampleName, setSampleName] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sampleIndex = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const chime = useChime();

  const signals = useMemo(() => (snapshot ? detect(snapshot) : []), [snapshot]);
  const read = useMemo(() => (snapshot ? readTone(snapshot, signals) : null), [snapshot, signals]);
  const stale = snapshot !== null && draft.trim() !== snapshot.trim();

  const analyze = useCallback(
    (candidate?: string) => {
      const value = (candidate ?? draft).trim();
      if (value.length < 3) return;
      setSnapshot(value);
      setActiveId(null);
      chime('warm');
    },
    [chime, draft],
  );

  const selectMark = useCallback(
    (id: string | null) => {
      if (id && id !== activeId) chime('soft');
      setActiveId(id);
    },
    [activeId, chime],
  );

  const useExample = useCallback(() => {
    const sample = SAMPLES[sampleIndex.current % SAMPLES.length];
    sampleIndex.current += 1;
    if (!sample) return;
    setSampleName(sample.name);
    setDraft(sample.text);
    analyze(sample.text);
  }, [analyze]);

  useEffect(() => {
    if (!snapshot) return;
    headingRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  }, [snapshot, reduced]);

  if (page !== 'home') {
    return (
      <div className="relative min-h-screen overflow-x-clip">
        <SkipLink />
        <Header home={false} />
        <p className="sr-only" aria-live="polite">
          {pageTitle(page)}
        </p>
        {page === 'privacy' && <PrivacyPolicy />}
        {page === 'terms' && <Terms />}
        {page === 'accessibility' && <Accessibility />}
        {page === 'data' && <LocalData />}
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <SkipLink />

      <Header home />

      <main id="main">
        <section id="top" className="relative isolate scroll-mt-32 sm:scroll-mt-24">
          <Sky />
          <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
            <p className="eyebrow text-accent">01 · The tone lab · no account needed</p>
            <h1 className="mt-3 max-w-3xl font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-balance sm:text-6xl">
              Read the room before you hit send.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/80">
              Paste the message you are about to send. The lab marks the words carrying heat, shows you why it
              reads that way, and hands back the smallest edit that keeps your point.
            </p>

            <div className="mt-7 max-w-2xl">
              <MessageField
                value={draft}
                onChange={(value) => {
                  setDraft(value);
                  setSampleName(null);
                }}
                onAnalyze={() => analyze()}
                onSample={useExample}
                sampleName={sampleName}
              />
            </div>

            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
              <li className="text-muted/80">What gets marked:</li>
              {LEGEND.map((item) => (
                <li key={item.kind} className="flex items-center gap-1.5">
                  <span aria-hidden="true" data-swatch data-kind={item.kind} className="h-1 w-4 rounded-full" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {snapshot && read && (
          <section
            ref={resultRef}
            aria-label="Tone read"
            className="mx-auto max-w-6xl scroll-mt-32 px-4 pb-4 pt-2 sm:scroll-mt-24 sm:px-6"
          >
            {stale && (
              <div
                role="status"
                className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-accent/40 bg-accent/[0.08] px-4 py-3 text-sm"
              >
                <span className="text-cream/90">You have edited the draft since this read.</span>
                <button type="button" className="btn btn-quiet min-h-9! px-3! text-xs" onClick={() => analyze()}>
                  Read the new one
                </button>
              </div>
            )}

            <div
              className={`grid gap-4 transition-opacity lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start ${
                stale ? 'opacity-60' : ''
              }`}
            >
              <div className="panel p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="eyebrow">Your draft, marked up</p>
                  <p className="text-xs text-muted">
                    {signals.length} {signals.length === 1 ? 'mark' : 'marks'}
                  </p>
                </div>
                <div className="mt-3">
                  <AnnotatedDraft
                    text={snapshot}
                    signals={signals}
                    activeId={activeId}
                    onActivate={selectMark}
                  />
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <RegisterTabs draft={snapshot} />
                </div>
              </div>

              <ReadPanel read={read} activeId={activeId} onActivate={selectMark} headingRef={headingRef} />
            </div>
          </section>
        )}

        <SoundPanel />

        <VoiceLab />

        <section
          id="gym"
          aria-labelledby="gym-heading"
          className="mx-auto max-w-6xl scroll-mt-32 px-4 py-14 sm:scroll-mt-24 sm:px-6"
        >
          <SectionHeader
            index="04"
            eyebrow="The mind gym"
            id="gym-heading"
            title="Three tiny workouts for the space between stimulus and response"
            note="Each one takes under a minute. No sign-up, no score to post — reps for the part of you that chooses."
          />

          <div
            role="note"
            className="mt-5 rounded-xl border border-white/12 bg-white/[0.03] p-4 text-xs leading-relaxed text-cream/75"
          >
            <strong className="text-cream">These are practices, not treatment.</strong> The gym is general
            wellbeing, not therapy, diagnosis or crisis support, and it is not a substitute for care from a
            qualified professional. If you are in immediate danger or thinking about harming yourself, contact your
            local emergency number or a crisis line now — the lab cannot respond to an emergency. Read the full{' '}
            <a
              href="#/terms"
              className="text-cream/90 underline decoration-accent/50 underline-offset-2 hover:text-cream"
            >
              limits of the service
            </a>
            .
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DrillCard
              index="01"
              title="The Impulse Catcher"
              sub="A 20-second game of catching urges before they slip past — the reflex gap, made playable."
            >
              <ImpulseCatcher />
            </DrillCard>

            <DrillCard
              index="02"
              title="The Reframe Lens"
              sub="Take your own situation and turn three fixed lenses on it. The frame moves; the facts do not."
            >
              <ReframeLens />
            </DrillCard>

            <DrillCard
              index="03"
              title="Grounding 5-4-3-2-1"
              sub="Walk your five senses one tap at a time and land back in the room."
            >
              <Grounding />
            </DrillCard>
          </div>
        </section>

        <SkyNotes />

        <CarryIt />
      </main>

      <Footer />
    </div>
  );
}
