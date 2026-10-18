import type { ReactNode } from 'react';

interface Props {
  index: string;
  title: string;
  sub: string;
  children: ReactNode;
}

export default function DrillCard({ index, title, sub, children }: Props) {
  return (
    <section
      aria-label={title}
      className="panel flex flex-col p-5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/[0.08] font-display text-sm font-semibold text-accent"
        >
          {index}
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">{sub}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </section>
  );
}
