import { useEffect, useRef, type ReactNode } from 'react';
import { LEGAL } from './config';

interface Props {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export default function LegalLayout({ title, eyebrow = 'Legal', children }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the page heading so a screen reader lands on the new page
  // instead of staying where the footer link was.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-10 outline-none sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-xs">
        <a href="#/" className="inline-flex min-h-11 items-center text-muted hover:text-cream">
          <span aria-hidden="true" className="mr-1.5">
            ←
          </span>
          Back to the lab
        </a>
      </nav>

      <p className="eyebrow mt-4">{eyebrow}</p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 font-display text-3xl font-semibold tracking-tight text-balance outline-none sm:text-4xl"
      >
        {title}
      </h1>
      <p className="mt-3 text-xs text-muted">
        Effective {LEGAL.effectiveDate} · Version {LEGAL.version}
      </p>

      {LEGAL.placeholders && (
        <div
          role="note"
          className="mt-6 rounded-xl border border-accent/40 bg-accent/[0.08] p-4 text-sm leading-relaxed text-cream/85"
        >
          <strong className="text-cream">Template notice.</strong> The operator identity, address, contact email,
          hosting provider and governing law are placeholders. Replace every bracketed value before publishing.
          See <code className="rounded bg-black/30 px-1">LEGAL_CHECKLIST.md</code> for the full pre-launch list.
        </div>
      )}

      <div className="legal-prose mt-8">{children}</div>

      <div className="mt-10 border-t border-white/10 pt-6 text-xs text-muted">
        <p>
          Questions about this page: <span className="text-cream/80">{LEGAL.contactEmail}</span>
        </p>
        <p className="mt-1">
          <a href="#/privacy" className="underline decoration-accent/40 underline-offset-2 hover:text-cream">
            Privacy
          </a>{' '}
          ·{' '}
          <a href="#/terms" className="underline decoration-accent/40 underline-offset-2 hover:text-cream">
            Terms
          </a>{' '}
          ·{' '}
          <a href="#/accessibility" className="underline decoration-accent/40 underline-offset-2 hover:text-cream">
            Accessibility
          </a>{' '}
          ·{' '}
          <a href="#/data" className="underline decoration-accent/40 underline-offset-2 hover:text-cream">
            Local data
          </a>
        </p>
      </div>
    </main>
  );
}
