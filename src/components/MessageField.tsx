import { useEffect, useId, useRef } from 'react';

export const SAMPLES = [
  {
    name: 'The follow-up',
    text: "I've asked you three times already. You need to just DO IT and stop wasting everyone's time, obviously!!",
  },
  {
    name: 'The pushback',
    text: "I don't understand why this keeps getting missed. It's like nobody reads the brief before the review.",
  },
  {
    name: 'The ask',
    text: 'Hey! When you get a chance could you take a look at the doc? No rush at all, thanks so much :)',
  },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onSample: () => void;
  sampleName: string | null;
  maxLength?: number;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function MessageField({
  value,
  onChange,
  onAnalyze,
  onSample,
  sampleName,
  maxLength = 500,
  inputRef,
}: Props) {
  const fieldId = useId();
  const hintId = useId();
  const counterId = useId();
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef ?? localRef;
  const tooShort = value.trim().length < 3;
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  const shortcut = isMac ? '⌘↵' : 'Ctrl↵';

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(240, Math.max(104, node.scrollHeight))}px`;
  }, [value, ref]);

  return (
    <div>
      <label htmlFor={fieldId} className="sr-only">
        Message to read
      </label>
      <textarea
        id={fieldId}
        ref={ref}
        className="field"
        rows={3}
        maxLength={maxLength}
        value={value}
        placeholder='Paste the message you are about to send. e.g. "You need to fix this now, it is broken again!!"'
        aria-describedby={`${hintId} ${counterId}`}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onAnalyze();
          }
        }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={tooShort}
          aria-keyshortcuts="Control+Enter Meta+Enter"
        >
          Read it
          <span aria-hidden="true" className="font-sans text-[0.7rem] opacity-60">
            {shortcut}
          </span>
        </button>
        <button type="button" className="btn btn-quiet" onClick={onSample}>
          <SampleIcon />
          {sampleName ? `Example: ${sampleName}` : 'Use an example'}
        </button>
        <span id={counterId} className="ml-auto text-xs text-muted tabular-nums">
          {value.length}/{maxLength}
        </span>
      </div>

      <p id={hintId} className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        <LockIcon />
        <span>
          Runs in this browser tab. Your draft is not sent, stored, or logged —{' '}
          <span className="text-cream/80">nothing leaves this page.</span>
        </span>
      </p>
      {tooShort && (
        <p className="mt-2 text-sm text-cream/60">Type or paste a message — three words minimum.</p>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 text-sage">
      <rect x="4" y="10" width="16" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SampleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" className="text-accent">
      <path
        d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
