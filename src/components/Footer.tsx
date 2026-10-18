export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0e0820]">
      <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-base font-semibold tracking-tight">ShiftedMind · Tone lab</p>
            <p className="mt-1 text-xs text-muted">Choose your responses. Keep the ones that are yours.</p>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted/80">
              No account, no cookies, no analytics, no third-party requests. Your message and voice are processed
              in this tab and never uploaded, and ambient sound is generated here rather than downloaded.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
            <a className="flex min-h-11 items-center text-muted hover:text-cream" href="#top">
              Tone lab
            </a>
            <a className="flex min-h-11 items-center text-muted hover:text-cream" href="#sound">
              Sound
            </a>
            <a className="flex min-h-11 items-center text-muted hover:text-cream" href="#voice">
              Voice lab
            </a>
            <a className="flex min-h-11 items-center text-muted hover:text-cream" href="#gym">
              Mind gym
            </a>
            <a className="flex min-h-11 items-center text-muted hover:text-cream" href="#sky">
              Weekly sky
            </a>
            <a className="flex min-h-11 items-center text-muted hover:text-cream" href="#carry">
              Carry it
            </a>
            <a
              className="flex min-h-11 items-center text-muted hover:text-cream"
              href="https://shiftedmind.vercel.app/auth"
            >
              Sign in
            </a>
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
            <a className="flex min-h-11 items-center text-muted hover:text-cream" href="#/privacy">
              Privacy notice
            </a>
            <a className="flex min-h-11 items-center text-muted hover:text-cream" href="#/terms">
              Terms of use
            </a>
            <a className="flex min-h-11 items-center text-muted hover:text-cream" href="#/accessibility">
              Accessibility
            </a>
            <a className="flex min-h-11 items-center text-muted hover:text-cream" href="#/data">
              Your local data
            </a>
          </nav>
          <p className="text-xs text-muted/70">© 2026 ShiftedMind</p>
        </div>

        <p className="mt-3 text-[0.7rem] leading-relaxed text-muted/70">
          A writing and speaking aid, not medical care. If you are in crisis, contact your local emergency number
          or a crisis line.
        </p>
      </div>
    </footer>
  );
}
