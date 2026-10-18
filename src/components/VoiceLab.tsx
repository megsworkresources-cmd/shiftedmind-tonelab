import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAudio } from '../audio/AudioProvider';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { LEGAL_ROUTES, MIC_NOTICE_VERSION } from '../legal/config';
import { LOCAL_DATA_EVENT, readMicConsent, writeMicConsent } from '../lib/storage';
import MicNotice from './MicNotice';
import SectionHeader from './SectionHeader';
import type { VoiceObservation, VoiceRead } from '../voice/types';

const BUCKET_STYLE: Record<VoiceRead['bucket'], string> = {
  clear: 'border-sage/40 bg-sage/10 text-sage',
  leaning: 'border-accent/40 bg-accent/10 text-accent',
  mixed: 'border-heat/40 bg-heat/10 text-heat',
  insufficient: 'border-white/20 bg-white/5 text-muted',
};

const MEASURES: Array<{ label: string; note: string }> = [
  { label: 'Pitch', note: 'How far your voice rises and falls.' },
  { label: 'Level', note: 'How loud you are, and whether that changes.' },
  { label: 'Silence', note: 'Where you pause, and for how long.' },
  { label: 'Pace', note: 'How quickly the syllables arrive.' },
];

function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `0:${String(whole).padStart(2, '0')}`;
}

export default function VoiceLab() {
  const recorder = useVoiceRecorder(20);
  const audio = useAudio();
  const setRecordingRef = useRef(audio.setRecording);
  setRecordingRef.current = audio.setRecording;
  const [noticeOpen, setNoticeOpen] = useState(false);

  // Ambient sound would otherwise be captured by the microphone, so it is
  // silenced for as long as the microphone is open and restored afterwards.
  useEffect(() => {
    const open = recorder.status === 'requesting' || recorder.status === 'recording';
    setRecordingRef.current(open);
  }, [recorder.status]);

  useEffect(() => () => setRecordingRef.current(false), []);
  const [noticeSeen, setNoticeSeen] = useState(() => readMicConsent()?.version === MIC_NOTICE_VERSION);

  // Clearing local data withdraws the stored acknowledgement, so the notice
  // must appear again before the next recording.
  useEffect(() => {
    const sync = () => setNoticeSeen(readMicConsent()?.version === MIC_NOTICE_VERSION);
    window.addEventListener(LOCAL_DATA_EVENT, sync);
    return () => window.removeEventListener(LOCAL_DATA_EVENT, sync);
  }, []);

  const statusText = useMemo(() => {
    switch (recorder.status) {
      case 'requesting':
        return 'Waiting for your browser’s permission prompt.';
      case 'recording':
        return 'Recording. The microphone is on.';
      case 'processing':
        return 'Measuring the clip in this browser.';
      case 'ready':
        return 'Recording finished. The clip is held in memory only.';
      case 'error':
        return recorder.error?.message ?? 'The microphone could not start.';
      default:
        return 'Microphone off. Nothing is being captured.';
    }
  }, [recorder.status, recorder.error]);

  const begin = useCallback(() => {
    if (!noticeSeen) {
      setNoticeOpen(true);
      return;
    }
    void recorder.start();
  }, [noticeSeen, recorder]);

  const accept = useCallback(() => {
    writeMicConsent(MIC_NOTICE_VERSION);
    setNoticeSeen(true);
    setNoticeOpen(false);
    void recorder.start();
  }, [recorder]);

  const reviewing = recorder.status === 'recording' || recorder.status === 'processing';
  const levelPercent = Math.round(recorder.level * 100);

  return (
    <section id="voice" aria-labelledby="voice-heading" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-14 sm:scroll-mt-24 sm:px-6">
      <SectionHeader
        index="03"
        eyebrow="The voice lab"
        id="voice-heading"
        title="Say it out loud. Hear how it lands."
        note="Twenty seconds of speech, measured on this device: pitch, level, pauses and pace. No transcript, no upload, no account."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <div className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="eyebrow">Instrument 03 · runs in your browser</p>
            <span
              className={`chip min-h-7! text-[0.7rem] ${
                recorder.status === 'recording'
                  ? 'border-heat/50 bg-heat/15 text-heat'
                  : 'border-white/15 bg-white/[0.03] text-muted'
              }`}
            >
              {recorder.status === 'recording'
                ? 'Mic on'
                : recorder.status === 'ready'
                  ? 'Clip in memory'
                  : recorder.status === 'error'
                    ? 'Problem'
                    : 'Mic off'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => (recorder.status === 'recording' ? recorder.stop() : begin())}
              disabled={recorder.status === 'requesting' || recorder.status === 'processing'}
              aria-pressed={recorder.status === 'recording'}
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border transition-colors ${
                recorder.status === 'recording'
                  ? 'border-heat/60 bg-heat/20 text-heat'
                  : 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {recorder.status === 'recording' ? <StopIcon /> : <MicIcon />}
              <span className="sr-only">
                {recorder.status === 'recording' ? 'Stop recording' : 'Start recording'}
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {recorder.status === 'recording'
                  ? 'Recording'
                  : recorder.status === 'requesting'
                    ? 'Waiting for permission'
                    : recorder.status === 'processing'
                      ? 'Measuring'
                      : 'Ready when you are'}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {formatTime(recorder.seconds)} / {formatTime(recorder.maxSeconds)} ·{' '}
                {recorder.status === 'recording' ? 'tap the button to stop' : 'one or two sentences is enough'}
              </p>
            </div>

            {recorder.status === 'ready' && (
              <button type="button" className="btn btn-quiet min-h-10! px-3! text-xs" onClick={recorder.reset}>
                Discard clip
              </button>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-end gap-1" aria-hidden="true">
              {recorder.bars.map((value, index) => (
                <span
                  key={index}
                  className={`w-full rounded-sm ${
                    recorder.status === 'recording' ? 'bg-accent/80' : 'bg-white/12'
                  }`}
                  style={{ height: `${8 + Math.round(value * 38)}px` }}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[0.68rem] text-muted">
              Input level: {levelPercent}%{recorder.status === 'recording' ? ' · live' : ''}
            </p>
          </div>

          <p aria-live="polite" className="mt-3 text-xs leading-relaxed text-cream/70">
            {statusText}
          </p>

          {recorder.status === 'ready' && recorder.result && (
            <div className="mt-4 rounded-xl border border-white/10 bg-[#150e2c] p-3">
              <p className="eyebrow">Your clip · {recorder.result.metrics.durationSec.toFixed(1)}s</p>
              <audio controls src={recorder.result.url} className="mt-2 w-full" aria-label="Your recording">
                Your browser cannot play this recording.
              </audio>
              <p className="mt-2 text-[0.68rem] leading-relaxed text-muted">
                This clip exists only in this tab. It is deleted when you discard it, record again, or close the
                page.
              </p>
            </div>
          )}

          {recorder.status === 'error' && recorder.error && (
            <div role="alert" className="mt-4 rounded-xl border border-heat/40 bg-heat/10 p-3">
              <p className="text-sm font-semibold text-cream">{recorder.error.message}</p>
              <p className="mt-1 text-xs leading-relaxed text-cream/75">{recorder.error.hint}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn btn-quiet min-h-10! px-3! text-xs" onClick={begin}>
                  Try again
                </button>
                <a href="#top" className="btn btn-quiet min-h-10! px-3! text-xs">
                  Use the text lab
                </a>
              </div>
            </div>
          )}

          <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-muted">
            Microphone is off until you press record. Audio is decoded and measured in this tab and never sent
            anywhere. Ambient sound is paused while the microphone is open, so it cannot bleed into your clip. Do
            not record other people without their permission.{' '}
            <button
              type="button"
              onClick={() => setNoticeOpen(true)}
              className="min-h-11 text-left text-cream/80 underline decoration-accent/50 underline-offset-2 hover:text-cream"
            >
              Read the microphone notice
            </button>
            {' · '}
            <a href={LEGAL_ROUTES.privacy} className="text-cream/80 underline decoration-accent/50 underline-offset-2 hover:text-cream">
              Privacy notice
            </a>
            {noticeSeen && (
              <>
                {' · '}
                <a
                  href={LEGAL_ROUTES.data}
                  className="text-cream/80 underline decoration-accent/50 underline-offset-2 hover:text-cream"
                >
                  Withdraw &amp; delete the acknowledgement
                </a>
              </>
            )}
          </p>
        </div>

        <div className="panel p-5 sm:p-6">
          {recorder.status === 'ready' && recorder.result ? (
            <VoiceFeedback read={recorder.result.read} />
          ) : recorder.status === 'processing' ? (
            <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm font-semibold">Measuring pitch, level, silence and pace…</p>
              <p className="text-xs text-muted">Everything happens in this tab. It takes a moment.</p>
            </div>
          ) : recorder.status === 'error' ? (
            <div className="flex min-h-[16rem] flex-col justify-center">
              <p className="eyebrow">The read</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">No read yet</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">
                The microphone did not start, so there is nothing to measure. The text lab is unaffected — it never
                needs a microphone.
              </p>
              <a href="#top" className="mt-4 text-sm text-accent underline underline-offset-4">
                Go to the text lab
              </a>
            </div>
          ) : (
            <div>
              <p className="eyebrow">The read</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">It measures sound, not meaning</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">
                Four acoustic measurements, no interpretation of your words. Useful for hearing habits you cannot
                hear while you are speaking.
              </p>
              <dl className="mt-4 space-y-3">
                {MEASURES.map((measure) => (
                  <div key={measure.label} className="flex gap-3">
                    <dt className="w-16 shrink-0 text-xs font-semibold tracking-[0.1em] uppercase text-cream/70">
                      {measure.label}
                    </dt>
                    <dd className="text-xs leading-relaxed text-muted">{measure.note}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-muted">
                No speech recognition, no voice identification, no emotion or health inference. Measurements are
                descriptive, not diagnostic.
              </p>
            </div>
          )}
        </div>
      </div>

      <MicNotice open={noticeOpen} onAccept={accept} onDecline={() => setNoticeOpen(false)} />

      {reviewing && (
        <p className="sr-only" role="status">
          {recorder.status === 'recording' ? 'Recording in progress.' : 'Recording finished, measuring.'}
        </p>
      )}
    </section>
  );
}

function VoiceFeedback({ read }: { read: VoiceRead }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">The read</p>
        <span className={`chip min-h-7! text-[0.7rem] ${BUCKET_STYLE[read.bucket]}`}>{read.bucketLabel}</span>
      </div>
      <h3 className="mt-2.5 font-display text-2xl font-semibold tracking-tight text-balance">{read.headline}</h3>
      <p className="mt-2 text-sm leading-relaxed text-cream/75">{read.detail}</p>

      {read.observations.length > 0 && (
        <dl className="mt-4 space-y-2.5">
          {read.observations.map((observation: VoiceObservation) => (
            <div key={observation.key} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <dt className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="text-xs font-semibold tracking-[0.1em] uppercase text-cream/70">
                  {observation.label}
                </span>
                <span className="text-xs tabular-nums text-cream/85">{observation.value}</span>
              </dt>
              <dd className="mt-1 text-xs leading-relaxed text-muted">{observation.note}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-4 rounded-xl border border-accent/30 bg-accent/[0.07] p-3">
        <p className="text-xs font-semibold tracking-[0.1em] uppercase text-accent">Try this</p>
        <p className="mt-1 text-sm leading-relaxed text-cream/85">{read.suggestion}</p>
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-muted">
        One clip, measured once. This is not a judgement of how you sound, and it cannot hear context, audience, or
        what you meant.
      </p>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" />
    </svg>
  );
}
