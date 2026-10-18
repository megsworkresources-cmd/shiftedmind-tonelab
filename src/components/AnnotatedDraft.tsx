import { Fragment } from 'react';
import { KIND_LABEL, type Signal } from '../tone/types';

interface Props {
  text: string;
  signals: Signal[];
  activeId: string | null;
  onActivate: (id: string | null) => void;
}

export default function AnnotatedDraft({ text, signals, activeId, onActivate }: Props) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  signals.forEach((signal, index) => {
    if (signal.start > cursor) {
      parts.push(<Fragment key={`text-${index}`}>{text.slice(cursor, signal.start)}</Fragment>);
    }
    parts.push(
      <button
        key={signal.id}
        type="button"
        className="mark"
        data-kind={signal.kind}
        data-selected={activeId === signal.id}
        aria-label={`${KIND_LABEL[signal.kind]}: ${signal.text}. ${signal.note}`}
        onMouseEnter={() => onActivate(signal.id)}
        onMouseLeave={() => onActivate(null)}
        onFocus={() => onActivate(signal.id)}
        onBlur={() => onActivate(null)}
        onClick={() => onActivate(activeId === signal.id ? null : signal.id)}
      >
        {text.slice(signal.start, signal.end)}
      </button>,
    );
    cursor = signal.end;
  });

  if (cursor < text.length) {
    parts.push(<Fragment key="text-tail">{text.slice(cursor)}</Fragment>);
  }

  return (
    <div>
      <p className="text-[0.98rem] leading-8 whitespace-pre-wrap text-cream/90">{parts}</p>
    </div>
  );
}
