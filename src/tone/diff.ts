import type { DiffToken } from './types';

function lcsMatrix(a: string[], b: string[]): number[][] {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      const row = table[i];
      const next = table[i + 1];
      if (!row || !next) continue;
      row[j] = a[i] === b[j] ? (next[j + 1] ?? 0) + 1 : Math.max(next[j] ?? 0, row[j + 1] ?? 0);
    }
  }
  return table;
}

function push(tokens: DiffToken[], type: DiffToken['type'], text: string) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (last && last.type === type) last.text += text;
  else tokens.push({ type, text });
}

/** Word-level diff. Whitespace rides along with the token before it. */
export function diffWords(before: string, after: string): DiffToken[] {
  const a = before.split(/(\s+)/).filter((token) => token !== '');
  const b = after.split(/(\s+)/).filter((token) => token !== '');
  const table = lcsMatrix(a, b);
  const tokens: DiffToken[] = [];

  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push(tokens, 'same', a[i] ?? '');
      i += 1;
      j += 1;
      continue;
    }
    const down = table[i + 1]?.[j] ?? 0;
    const right = table[i]?.[j + 1] ?? 0;
    if (down >= right) {
      push(tokens, 'del', a[i] ?? '');
      i += 1;
    } else {
      push(tokens, 'add', b[j] ?? '');
      j += 1;
    }
  }
  while (i < a.length) {
    push(tokens, 'del', a[i] ?? '');
    i += 1;
  }
  while (j < b.length) {
    push(tokens, 'add', b[j] ?? '');
    j += 1;
  }

  return tokens;
}
