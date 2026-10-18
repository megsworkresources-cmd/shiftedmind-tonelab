import { useEffect, useId, useRef, useState } from 'react';
import { LEGAL, LEGAL_ROUTES, MIC_NOTICE_VERSION } from '../legal/config';

interface Props {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * Shown before the browser's own permission prompt.
 *
 * The browser prompt is permission, not informed consent: it does not explain
 * where the audio goes, how long it exists, or that other people may be heard.
 */
export default function MicNotice({ open, onAccept, onDecline }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAcknowledged(false);
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = dialogRef.current;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.offsetParent !== null);

    focusables()[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onDecline();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onDecline]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="panel max-h-[90dvh] w-full max-w-xl overflow-y-auto p-5 sm:p-6"
      >
        <p className="eyebrow">Before the microphone</p>
        <h2 id={titleId} className="mt-2 font-display text-2xl font-semibold tracking-tight">
          Your voice stays on this device
        </h2>

        <div id={descriptionId} className="mt-3 space-y-3 text-sm leading-relaxed text-cream/80">
          <p>
            The Voice Lab listens only while you hold a recording. The audio is analysed in this browser tab to
            measure pitch, level, pauses and pace.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-cream/75">
            <li>
              <strong className="text-cream">Not uploaded.</strong> No audio, transcript or measurement is sent to
              a server.
            </li>
            <li>
              <strong className="text-cream">Not stored.</strong> The clip lives in memory so you can play it back,
              and is discarded when you record again, reset, or close the tab.
            </li>
            <li>
              <strong className="text-cream">Not transcribed.</strong> There is no speech recognition, no voice
              identification, and no attempt to infer your mood, health or truthfulness.
            </li>
            <li>
              <strong className="text-cream">Other people.</strong> Do not record anyone else without their
              permission — some places require every participant to agree.
            </li>
          </ul>
          <p className="text-xs text-muted">
            Taking part is voluntary. You can decline and still use the text Tone Lab. If you accept, we store one
            local record that you saw this notice ({MIC_NOTICE_VERSION}) so we do not ask every time; you can
            remove it under{' '}
            <a className="underline decoration-accent/60 underline-offset-2 hover:text-cream" href={LEGAL_ROUTES.data}>
              local data
            </a>
            . Read the{' '}
            <a className="underline decoration-accent/60 underline-offset-2 hover:text-cream" href={LEGAL_ROUTES.privacy}>
              privacy notice
            </a>{' '}
            for the full detail.
          </p>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/12 bg-white/[0.03] p-3">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#f4c469]"
          />
          <span className="text-xs leading-relaxed text-cream/85">
            I am recording myself, and I have permission from anyone else who might be heard.
          </span>
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary" disabled={!acknowledged} onClick={onAccept}>
            Enable microphone
          </button>
          <button type="button" className="btn btn-quiet" onClick={onDecline}>
            Not now
          </button>
          <a href="#top" className="ml-auto flex min-h-11 items-center text-xs text-muted hover:text-cream">
            Continue without microphone
          </a>
        </div>

        <p className="mt-3 text-[0.7rem] leading-relaxed text-muted/80">
          Controller: {LEGAL.operatorName}. Legal bases: your consent for the microphone, and our legitimate
          interest in keeping the page working for local settings. Because this happens entirely in your browser,
          we cannot access, export or delete your audio — closing the tab removes it.
        </p>
      </div>
    </div>
  );
}
