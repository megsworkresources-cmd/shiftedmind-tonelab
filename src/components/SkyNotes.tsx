import { useMemo, useRef, useState } from 'react';
import { LEGAL_ROUTES } from '../legal/config';
import type { Sign } from '../zodiac/signs';
import { WEEK_COUNT, weeklySky } from '../zodiac/week';
import SectionHeader from './SectionHeader';

const ELEMENT_NOTE: Record<Sign['element'], string> = {
  fire: 'Fire — written around heat, speed and the cost of it.',
  earth: 'Earth — written around steadiness, upkeep and what holds.',
  air: 'Air — written around thought, speech and distance.',
  water: 'Water — written around feeling, memory and the shape of care.',
};

export default function SkyNotes() {
  const [sky, setSky] = useState(() => weeklySky());
  const [selected, setSelected] = useState(sky[0]?.sign.id ?? 'aries');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const entry = useMemo(() => sky.find((item) => item.sign.id === selected) ?? sky[0], [sky, selected]);

  function onTabKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = sky.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index === last ? 0 : index + 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    const target = sky[next];
    if (!target) return;
    setSelected(target.sign.id);
    tabRefs.current[target.sign.id]?.focus();
  }

  if (!entry) return null;

  return (
    <section
      id="sky"
      aria-labelledby="sky-heading"
      className="mx-auto max-w-6xl scroll-mt-32 px-4 py-14 sm:scroll-mt-24 sm:px-6"
    >
      <SectionHeader
        index="05"
        eyebrow="The weekly sky"
        id="sky-heading"
        title="Twelve constellations, four notes each, no predictions."
        note="Read one for the pleasure of being asked a good question. The lab is not going to pretend the sky knows your week."
      />

      <div
        role="note"
        className="mt-5 rounded-xl border border-white/12 bg-white/[0.03] p-4 text-xs leading-relaxed text-cream/75"
      >
        <strong className="text-cream">What this is.</strong> Twelve short pieces of writing that rotate every Monday,
        one of four per sign, chosen by the calendar week and shown to everybody. Astrology has no demonstrated
        predictive power, so nothing here is a forecast of your life —{' '}
        <span className="text-cream/90">we never ask for your birth date, and no note is personalised.</span> Treat it
        as a reflective prompt, like a good question in a journal. The wellbeing limits in the{' '}
        <a className="text-cream/90 underline decoration-accent/50 underline-offset-2 hover:text-cream" href={LEGAL_ROUTES.terms}>
          terms
        </a>{' '}
        apply here too.
      </div>

      <div
        role="tablist"
        aria-label="Choose a sign"
        className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
      >
        {sky.map((item, index) => {
          const active = item.sign.id === selected;
          return (
            <button
              key={item.sign.id}
              ref={(node) => {
                tabRefs.current[item.sign.id] = node;
              }}
              role="tab"
              id={`sky-tab-${item.sign.id}`}
              data-sign={item.sign.id}
              aria-selected={active}
              aria-controls="sky-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(item.sign.id)}
              onKeyDown={(event) => onTabKey(event, index)}
              className={`flex min-h-14 items-center gap-2.5 rounded-xl border px-3 text-left transition-colors ${
                active
                  ? 'border-accent/60 bg-accent/10 text-cream'
                  : 'border-white/12 bg-white/[0.02] text-cream/70 hover:border-white/25 hover:text-cream'
              }`}
            >
              <span aria-hidden="true" className="text-lg leading-none text-accent">
                {item.sign.symbol}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.sign.name}</span>
                <span className="block text-[0.62rem] text-muted">{item.sign.dates}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="sky-panel"
        aria-labelledby={`sky-tab-${entry.sign.id}`}
        className="panel mt-4 p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="eyebrow">
            Week of {entry.label} · {entry.sign.element} · {entry.sign.modality}
          </p>
          <p className="text-xs text-muted">
            Note {entry.index + 1} of {WEEK_COUNT} · changes Monday
          </p>
        </div>

        <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-balance">
          <span aria-hidden="true" className="mr-1.5 text-accent">
            {entry.sign.symbol}
          </span>
          {entry.note.headline}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {entry.sign.name} · {entry.sign.dates}
        </p>

        <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-cream/85">{entry.note.note}</p>

        <div className="mt-4 max-w-2xl rounded-xl border border-accent/30 bg-accent/[0.07] p-3">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-accent">This week's prompt</p>
          <p className="mt-1 text-sm leading-relaxed text-cream/90">{entry.note.prompt}</p>
        </div>

        <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-muted">
          {ELEMENT_NOTE[entry.sign.element]} Same note for everyone reading {entry.sign.name} this week, whichever
          day you open it.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a href="#top" className="btn btn-quiet min-h-11! px-3.5! text-sm">
            Take it to the tone lab
          </a>
          <button
            type="button"
            className="btn btn-quiet min-h-11! px-3.5! text-sm"
            onClick={() => setSky(weeklySky())}
          >
            Check the current week
          </button>
        </div>
      </div>
    </section>
  );
}
