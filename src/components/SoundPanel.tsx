import { useEffect, useId, useRef, useState } from 'react';
import { useAudio } from '../audio/AudioProvider';
import { SCENES, sceneById, type SceneId } from '../audio/engine';
import { LEGAL_ROUTES } from '../legal/config';
import SectionHeader from './SectionHeader';

const EVIDENCE_LABEL: Record<SceneId, string> = {
  rain: 'Broadband masking',
  tide: 'Nature sounds',
  night: 'Steady tone',
  breath: 'Paced breathing',
};

export default function SoundPanel() {
  const audio = useAudio();
  const volumeId = useId();
  const chimesId = useId();
  const scene = sceneById(audio.settings.scene);
  const volumePercent = Math.round(audio.settings.volume * 100);

  // `enabled` is the stored preference; `playing` is what is actually audible.
  // They differ after a reload or after the tab was hidden, and the interface
  // says which one is true rather than assuming.
  const label = audio.playing ? 'Stop sound' : audio.settings.enabled ? 'Resume sound' : 'Turn sound on';
  const status = !audio.supported
    ? 'This browser cannot play generated audio. Everything else on the page works without it.'
    : audio.playing
      ? `Sound on. ${scene.name}, ${volumePercent} percent.`
      : audio.pausedByTab
        ? 'Paused because you switched away from this tab. Press resume when you want sound again.'
        : audio.settings.enabled
          ? 'Silent. You had sound on last time — press resume to start it again. Nothing plays until you do.'
          : 'Silent. Nothing is playing.';

  return (
    <section
      id="sound"
      aria-labelledby="sound-heading"
      className="mx-auto max-w-6xl scroll-mt-32 px-4 py-14 sm:scroll-mt-24 sm:px-6"
    >
      <SectionHeader
        index="02"
        eyebrow="Sound"
        id="sound-heading"
        title="Quiet sound you switch on yourself."
        note="Four ambient scenes, generated on your device from oscillators and noise — no audio files, nothing downloaded, nothing to sit through."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <div className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Playback</p>
              <p className="mt-1 text-sm text-cream/80">
                {audio.playing ? `Playing “${scene.name}”` : 'Not playing'}
              </p>
            </div>
            <button
              type="button"
              className={`btn ${audio.playing ? 'btn-quiet' : 'btn-primary'}`}
              aria-pressed={audio.playing}
              onClick={() => audio.setEnabled(!audio.playing)}
            >
              {label}
            </button>
          </div>

          <p aria-live="polite" role="status" className="mt-3 text-xs leading-relaxed text-cream/70">
            {status}
          </p>

          <fieldset className="mt-5 border-t border-white/10 pt-5">
            <legend className="text-xs font-semibold tracking-[0.1em] uppercase text-cream/70">
              Scene
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SCENES.map((option) => {
                const active = option.id === audio.settings.scene;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      active
                        ? 'border-accent/60 bg-accent/10'
                        : 'border-white/12 bg-white/[0.02] hover:border-white/25'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sound-scene"
                      value={option.id}
                      checked={active}
                      onChange={() => audio.setScene(option.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#f4c469]"
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-semibold text-cream">{option.name}</span>
                        <span className="chip min-h-6! border-white/15 px-1.5! text-[0.6rem] text-muted">
                          {EVIDENCE_LABEL[option.id]}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">{option.blurb}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 border-t border-white/10 pt-5">
            <label htmlFor={volumeId} className="text-xs font-semibold tracking-[0.1em] uppercase text-cream/70">
              Volume
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id={volumeId}
                type="range"
                min={0}
                max={100}
                step={5}
                value={volumePercent}
                onChange={(event) => audio.setVolume(Number(event.target.value) / 100)}
                className="h-11 w-full max-w-xs accent-[#f4c469]"
                aria-describedby={`${volumeId}-hint`}
              />
              <span className="w-12 text-right text-sm tabular-nums text-cream/85">{volumePercent}%</span>
            </div>
            <p id={`${volumeId}-hint`} className="mt-1 text-xs leading-relaxed text-muted">
              Independent of your device volume, and the scenes are generated quietly on purpose. Set it no louder
              than you could comfortably talk over.
            </p>
          </div>

          <div className="mt-5 flex items-start gap-3 border-t border-white/10 pt-5">
            <input
              id={chimesId}
              type="checkbox"
              checked={audio.settings.chimes}
              onChange={(event) => audio.setChimes(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#f4c469]"
            />
            <label htmlFor={chimesId} className="text-sm leading-relaxed text-cream/85">
              Soft chimes on actions
              <span className="mt-0.5 block text-xs text-muted">
                Short tones when a read finishes, a mark is selected or a drill catches an urge. Every one of them
                has a visible equivalent on screen, so nothing depends on hearing them.
              </span>
            </label>
          </div>

          <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-muted">
            Sound is off until you turn it on, it never starts by itself, and it pauses when you switch tabs.
            Volume is not a medical setting: no browser can tell how loud it really is in your ears. Do not use
            these scenes to mask alarms, doorbells, or someone calling you. If sound feels uncomfortable or
            painful, stop — that is the whole instruction, and it is written down for good reason.{' '}
            <a href={LEGAL_ROUTES.terms} className="text-cream/80 underline decoration-accent/50 underline-offset-2 hover:text-cream">
              Terms
            </a>
            {' · '}
            <a href={LEGAL_ROUTES.privacy} className="text-cream/80 underline decoration-accent/50 underline-offset-2 hover:text-cream">
              Privacy
            </a>
          </p>
        </div>

        <div className="panel p-5 sm:p-6">
          <p className="eyebrow">What the evidence says</p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{scene.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-cream/80">{scene.evidence}</p>

          {scene.id === 'breath' ? (
            <BreathPacer active={audio.playing} />
          ) : (
            <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs leading-relaxed text-muted">
              Nothing here is a treatment, and none of it is personalised. It is a sound you may or may not like
              working near, and the honest answer to “does it help?” is that it depends on you.
            </p>
          )}

          <dl className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Generated</dt>
              <dd className="text-cream/85">On this device, from oscillators</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Downloaded</dt>
              <dd className="text-cream/85">Nothing</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Stored about you</dt>
              <dd className="text-cream/85">Your four settings, on this device</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

/**
 * Visual pace for the breathing scene: four seconds in, six seconds out, which
 * is six breaths a minute. The animation is decoration — the label is hidden
 * from assistive technology and the text underneath describes it instead of
 * announcing a new phrase every ten seconds.
 */
function BreathPacer({ active }: { active: boolean }) {
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [scale, setScale] = useState(0.7);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setPhase('in');
      setScale(0.7);
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const started = performance.now();
    const step = (now: number) => {
      const elapsed = (now - started) % 10_000;
      if (elapsed < 4_000) {
        setPhase('in');
        setScale(reduced ? 1 : 0.7 + 0.45 * (elapsed / 4_000));
      } else {
        setPhase('out');
        setScale(reduced ? 0.7 : 1.15 - 0.45 * ((elapsed - 4_000) / 6_000));
      }
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [active]);

  return (
    <div className="mt-4 rounded-xl border border-accent/30 bg-accent/[0.06] p-4">
      <p className="text-xs font-semibold tracking-[0.1em] uppercase text-accent">Pace it if you want to</p>
      <div className="mt-3 flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-accent/50 bg-accent/10 transition-transform duration-100"
          style={{ transform: `scale(${scale.toFixed(3)})` }}
        />
        <div>
          <p aria-hidden="true" className="font-display text-xl font-semibold text-cream">
            {active ? (phase === 'in' ? 'In' : 'Out') : 'Ready'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Four seconds in, six seconds out — six breaths a minute. Breathe normally instead if that is more
            comfortable; the pace is an option, not an instruction.
          </p>
        </div>
      </div>
    </div>
  );
}
