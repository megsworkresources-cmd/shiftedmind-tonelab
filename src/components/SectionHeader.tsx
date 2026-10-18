interface Props {
  index: string;
  eyebrow: string;
  title: string;
  note?: string;
  id?: string;
}

export default function SectionHeader({ index, eyebrow, title, note, id }: Props) {
  return (
    <div className="border-t border-white/10 pt-7">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
        <div className="max-w-2xl">
          <p className="eyebrow">
            {index} · {eyebrow}
          </p>
          <h2 id={id} className="mt-2 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
        </div>
        {note && <p className="max-w-sm text-sm leading-relaxed text-muted">{note}</p>}
      </div>
    </div>
  );
}
