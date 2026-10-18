const LINKS = [
  { label: 'Tone lab', href: '#top', current: true },
  { label: 'Sound', href: '#sound', current: false },
  { label: 'Voice lab', href: '#voice', current: false },
  { label: 'Mind gym', href: '#gym', current: false },
  { label: 'Sky', href: '#sky', current: false },
  { label: 'Carry it', href: '#carry', current: false },
];

interface Props {
  /** False on the legal pages, where no in-page section is the current one. */
  home?: boolean;
}

export default function Header({ home = true }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120b26]/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4">
          <a href="#top" className="mr-auto flex min-h-16 items-center gap-2.5 rounded-lg">
            <StarMark />
            <span className="font-display text-[1.05rem] font-semibold tracking-tight">ShiftedMind</span>
          </a>

          <nav aria-label="Primary" className="order-3 -mx-1 flex w-full items-center gap-1 pb-2 sm:order-none sm:mx-0 sm:w-auto sm:pb-0">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={home && link.current ? 'page' : undefined}
                className={`flex min-h-11 items-center rounded-lg px-2.5 text-sm transition-colors sm:px-3 ${
                  link.current ? 'text-accent' : 'text-cream/75 hover:text-cream'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <a
              href="https://shiftedmind.vercel.app/auth"
              className="flex min-h-11 items-center rounded-lg px-2.5 text-sm text-cream/75 hover:text-cream"
            >
              Sign in
            </a>
            <a
              href="https://shiftedmind.vercel.app/auth"
              className="btn btn-primary hidden min-h-10! px-3.5! text-sm sm:inline-flex"
            >
              Start free
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function StarMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="text-accent">
      <path
        d="M12 1.5c.6 4.7 2.3 6.4 7 7-4.7.6-6.4 2.3-7 7-.6-4.7-2.3-6.4-7-7 4.7-.6 6.4-2.3 7-7Z"
        fill="currentColor"
      />
      <circle cx="19" cy="18.5" r="1.6" fill="currentColor" opacity=".55" />
      <circle cx="5" cy="19.5" r="1" fill="currentColor" opacity=".35" />
    </svg>
  );
}
