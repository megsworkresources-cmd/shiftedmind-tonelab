# Tone Lab — critique and redesign plan

Audited target: `https://shiftedmind.vercel.app/tone-lab` (production build, last-modified 2026‑10‑17 16:47 UTC)
Method: read the shipped ES modules (`ToneLab`, `ToneDetector`, `MindGym`, `PublicShell`), then drove the live page in headless Chromium at 1440×900 and 390×844: screenshots, DOM/computed-style measurement, network waterfall, and scripted probes through the real UI.
Screenshots: `audit/screenshots/`. Probe scripts: `.audit/scan.mjs`, `.audit/probe2.mjs`, `.audit/probe3.mjs`.
Note: the audit container has no emoji font, so card icons and the 🙂 in rewritten text render as boxes in the screenshots. That is an artifact of the audit machine, not the site.

---

## 1. Verdict

The page has a real idea and a real voice: *two instruments, no account needed*, a tone reader that runs locally, and a "mind gym" that makes the gap between stimulus and response playable. The visual language (Fraunces display over a painted dusk sky, amber accent, tracked uppercase eyebrows) is distinctive and coherent.

What it does not yet have is a detector you can trust, and a result screen that helps you act. Right now the instrument produces a scoreboard that contradicts its own flags, invents confidence, and rewrites your message into something you would never send. That is the gap between a demo and a tool.

| Area | Grade | One-line reason |
|---|---|---|
| Concept & positioning | A− | Clear, differentiated, immediately understandable |
| Visual identity | B+ | Distinctive; damaged by layering and contrast bugs |
| Detector correctness | D | Substring matching, flags that don't score, stale results |
| Rewrite quality | D− | Template concatenation produces incoherent, sometimes hostile output |
| Result UX | C− | Numbers without evidence; no annotation of the message itself |
| Mind Gym | B− | Charming, tactile; four dead ends and one fake quiz |
| Accessibility | C− | No labels, no live region, 15px nav targets, motion not reduced |
| Performance | C | 358 KB transferred, 56 KB third-party script never used here |
| Conversion | D | The best moment on the page has no next step |

---

## 2. Keep these

1. **"Two instruments, no account needed."** Best sentence on the page. It sets scope, removes friction, and explains why this route exists outside the account product.
2. **"Instrument 01 · runs in your browser."** Local-processing is a genuine trust feature. It needs to stay, and it needs to be true and provable (see F24).
3. **The editorial register.** *"There's heat here, and it's aimed at someone. It'll sting before it informs."* This is better writing than most tone tools manage. Keep the voice; fix the machinery under it.
4. **Try a sample instantly analyzes.** One click to value, no typing required. Preserve that.
5. **The meter motion.** Bars animating from 0 on reveal is the right gesture — it reads as an instrument needle settling.
6. **"You are the sky, not the weather."** The strongest line in the Mind Gym, and the one that ties the drill to the product's star metaphor.

---

## 3. Findings

Severity: **P0** = wrong output or unreadable content, fix first. **P1** = hurts trust, comprehension, or completion. **P2** = craft.

### P0 — The detector is not measuring what it says it measures

**F1. Matching is raw substring search, so unrelated words fire signals.**
Detection is `text.toLowerCase().includes(phrase)` with no word boundaries (`ToneDetector`, `b()`/`Y()`).

Probe: `"Please adjust the justification of the invoice; the schedule is relaxed."`
Result: `WARM 12 / DIRECT 6 / EVEN 72`, plus flags for **"relax"** (*"It reads as an order"*) — because `relax` is a substring of `relaxed`, and `just` is inside *adjust*/*justification*.

**F2. One flag quotes words the message never contained.**
```js
if (a.includes("calm down") || a.includes("relax"))
  s("harsh", "calm down", "Telling someone to calm down reliably does the opposite.");
```
The probe above rendered a chip reading **“calm down”** for a message containing no such phrase. A tool that misquotes you loses the argument instantly.

**F3. Absolutes are flagged but contribute nothing to any score.**
`always / never / every time / constantly` are detected and shown as flags; they are never added to `rude`, `direct`, `warm` or `funny`, and they do not suppress `even`.

Probe: `"You always do this. You always, always, always do this."`
Result: `RUDE 0 · DIRECT 24 · FUNNY 0 · WARM 0 · EVEN 72` → verdict **"Neutral & even"**, confidence **64%**, while two chips tell the user the sentence boxes people in. The headline contradicts the evidence printed beneath it. See `audit/screenshots/desktop-result-always.png`.

**F4. Repetition is invisible.** Each phrase is counted at most once (`for (const s of e) if (a.includes(s)) i += 1`). Saying "always" three times scores exactly like saying it once, which is the opposite of how heat works.

**F5. Results go stale.** The read is computed from the *analyzed snapshot* (`s`), not the live textarea (`e`), and nothing clears it on edit.
Probe: analyze `"Thanks so much — this is great news, really glad."` → `confidence 68%`; replace the text with `"You never listen and this is garbage."` without pressing the button → the panel still reads `confidence 68%`. The input and the verdict describe two different messages.

**F6. "Confidence" is a length bonus, printed to one decimal.**
```js
L = max(52, min(97, 58 + round(spread * 1.6) + min(words, 60) * 0.3))
```
- `"Okay."` → **58.3%**
- a 60-word bland paragraph → **76%** (same verdict, +18 points for typing more)
- `"asdf qwer zxcv"` → **58.9%**, verdict "Neutral & even"

The floor is 52%, so nonsense is never below a coin flip, and `0.3 × words` is fractional, which is why users see `71.4%`. This is a heuristic dressed as a measurement; it is the single fastest way to lose a sophisticated reader.

**F7. The rewrite engine manufactures ungrammatical, tonally incoherent text.**
Rewrites are `prefix + regex-swapped text + closing line`, with no grammar or register checks. Actual output for the bundled sample `"I've asked you three times already. You need to just DO IT and stop wasting everyone's time, obviously!!"`:

| Register | Output (verbatim) |
|---|---|
| Softer | `Hey — I've asked you three times already. could you DO IT and stop wasting everyone's time, i think!` … `No rush — whenever you get a moment.` |
| Kinder | `Hey — hope your day's going okay. I've asked you three times already. could you DO IT and stop wasting everyone's time, i think! Thanks for hearing me out.` |
| More direct | `Bottom line: I've asked you three times already. You need to DO IT and stop wasting everyone's time, obviously.` |
| Lighter | `Okay so — I've asked you three times already. could you DO IT and stop wasting everyone's time, i think! We'll laugh about this later. Probably. 🙂` |

Four distinct failures in one sample: a lowercase sentence start (`already. could you`), `obviously → i think` producing `time, i think!`, `No rush` appended to a message that still says *stop wasting everyone's time*, and a "lighter" variant that jokes at someone. "More direct" leaves the insult untouched, so the register that is supposed to fix the flagged problem changes nothing.

**F8. "Lighter" rewrites change what you said.** `stupid → sneaky`, `idiot → confusing moment`, `useless → not helping`, `hate → am side-eyeing`. These are not tone edits; they are new claims. Any substitution that alters the accusation must be offered as a *choice with the meaning difference stated*, never applied silently.

### P0 — Layering and contrast

**F9. Decorative clouds paint over copy, and they drift.**
The sky is a `pointer-events-none absolute z-[1]` layer of cloud divs animated `translate(-30vw) → translate(130vw)`, `iteration-count: infinite`, `linear`.

In the hero, the clouds composite **above** the copy and erase it outright: at 1440px the paragraph reads *"one reads the room before you hi…"* and the second line is gone under a cloud core (`audit/screenshots/crop-hero-text.png`; full page in `desktop-1440.png`). In section 01 the order flips — the note sits on top — but it is pale copy over a pale cloud, so contrast collapses there instead (`audit/screenshots/crop-section-note.png`). Two different failure modes from one decorative layer, both of which move across the page on a timer.

Because the clouds are `pointer-events-none`, nothing feels broken when you click — only when you read, and only depending on when you look.

**F10. The detector panel is 66% opaque over a high-luminance sunset.**
`background: rgba(36, 30, 48, 0.66)`. Body copy inside the panel is `text-muted-foreground` at 10–14px. Where the panel overlaps the bright horizon band, the copy and the 10px meter values sit on a shifting, luminous backdrop (`audit/screenshots/desktop-result-hostile.png`). The glass look is right; the opacity is not.

**F11. On mobile, content reads through the sticky header.** In `audit/screenshots/mobile-after-analyze.png` the H2 "Read the room before you hit send" is legible underneath the logo and menu button while scrolling. The header needs an opaque-enough surface (or a scrim) at small widths.

### P1 — Result UX

**F12. The message is never annotated.** The user gets five bars and a list of chips; the draft itself is untouched. People want to see *which words* did it. This is the biggest missed opportunity on the page — the natural artifact is your sentence with three underlines and a margin note, not a scoreboard.

**F13. Flags are noisy and lossy.**
- Every chip contains the full tip *and* repeats it in `title` (`“you need to” · It reads as an order. An invitation gets more yes.`), so three findings become three wrapped sentences.
- Different causes share one generic tip: both `you need to` and `obviously` render *"It reads as an order."*
- Flags are capped at four (`slice(0, 4)`) in detection order, and hedges are suppressed entirely if anything else fires (`if (i.length === 0)`), so the most self-undermining pattern in professional writing can never appear alongside a rival.

**F14. The two-column meter grid is ambiguous.** Each row is `[label][bar][value]`, so column two's label lands beside column one's value: the line reads **`44 DIRECT ▬▬▬ 24`** (`audit/screenshots/desktop-result-hostile.png`). It parses as one row with two numbers.

**F15. The primary CTA is invisible when disabled.** With an empty textarea, *Read the tone* renders at `opacity: 0.51` on a near-white background — a large pale button that reads as "the main thing, greyed out" rather than "type something first". Add the actual instruction ("Type or paste a message to begin") or swap the primary for the sample CTA in the empty state.

**F16. Two instruments, four dead ends.** Nothing you do here is saved, shared, or carried forward. The Moment Compass literally says *"Hang it as a star and it stops being a coin-flip"* — with no button to hang it. After a run, the only forward action is the header's *Start free*. The page's best moment (a finished drill, a rewritten message) has no next step.

**F17. The drills don't accept your material.** The Reframe Lens ships four fixed situations; Thought Unhook ships six fixed thoughts. A mind gym with no way to enter your own thought is a demo of a mind gym. Also, Moment Compass tallies eight forced choices and then editorializes ("You lean toward the bold, self-forward pull") from a 5–3 split, which is not a result — it is a horoscope.

**F18. Page metadata is generic.** `document.title` on `/tone-lab` is `"ShiftedMind — intentions as stars"` and the description is the account product's. A public tool that people will share has no route-level title, description, or share image.

### P2 — Craft

**F19. Tap targets.** Nav links measure **15px** tall (tracked 10px uppercase), secondary drill buttons **30px**, primary buttons **36px**, copy-to-clipboard **28px**. Minimum comfortable target is 44px.

**F20. Motion is unconditional.** No `prefers-reduced-motion` anywhere in the 197 KB stylesheet, despite infinite cloud drift, animated meters, a floating thought, a lens flip, and ping-dot loading states.

**F21. Document structure.** The page exposes four headings (`h1`, two `h2`, one `h3`); the five drill titles are `<p class="font-display">`, so the gym has no outline. The textarea has no label (placeholder only), the result block has no `aria-live`, and the active *Tone lab* nav item has an amber class but no `aria-current`.

**F22. Weight.** 358,615 bytes transferred on load; 327,098 of it JavaScript. Among the shipped modules: `framer-motion` 44 KB, `radix-ui` 33 KB, `index` 154 KB, and **`html2canvas-pro` 56 KB pulled from `cdn.jsdelivr.net` with no integrity hash** on a page with no screenshot/share UI. Three Google-hosted families (Space Grotesk, Fraunces, JetBrains Mono) carry the typography.

**F23. Small logic and copy leaks.**
- The 20-second Impulse Catcher timer (`setTimeout(20_000)`) is never cleared on unmount; navigating away and back can write a stale personal best.
- Personal best is stored under the unnamespaced key `sm-gym-best`.
- "Start the 20s" reads like the 1920s.
- Two different things are numbered `01` ("01 · The Tone Lab" and "Instrument 01"), and the section titled *Five tiny workouts* is followed by an *Instrument 02* label that never appears — the numbering system stops halfway.
- `🎭`-style emoji are used as icons with no `aria-hidden`, so screen readers announce them as content.

**F24. "Runs in your browser" is true, but unproven.** No network request is made when analyzing — good, and worth showing. There is no visible statement of what is stored (nothing) and no way to verify it.

---

## 4. Redesign plan

### 4.1 The one-sentence thesis

> **Stop scoring the message. Mark it up, then make one surgical edit.**

The value is not "your message is 44% rude". The value is "these three words are doing the damage; here is the version that keeps your point and loses the sting." Everything below serves that sentence.

### 4.2 Page architecture

Current order costs ~450px of scroll before the instrument starts. Invert it.

```
┌ Hero (compact, ~40vh) ────────────────────────────────┐
│ The tone lab                                          │
│ Read the room before you hit send.                    │
│ [ paste your message…                          ]      │
│ [ Read it ]  [ Use an example ]        ⌘↵            │
└───────────────────────────────────────────────────────┘
┌ Result (the page's centre of gravity) ────────────────┐
│ Draft (left, 7 cols)          Read (right, 5 cols)    │
│  annotated text with           verdict, 2–4 signals,  │
│  underlines + margin notes     what would land better │
│  [Softer][Kinder][Plainer]  →  diff view + rationale  │
└───────────────────────────────────────────────────────┘
┌ The mind gym (three drills, not five) ─────────────────┐
│ Impulse Catcher · Reframe Lens · Grounding             │
│ each card accepts *your* thought / situation           │
└───────────────────────────────────────────────────────┘
┌ Carry it ──────────────────────────────────────────────┐
│ "Hang one intention for the next hard conversation."   │
│ [ Start free ]  ·  "Nothing you typed leaves this tab."│
└───────────────────────────────────────────────────────┘
```

Rationale for each move:
- **Tool in the hero** — removes the scroll tax and makes the promise testable in three seconds.
- **Annotated draft as the primary artifact** — this is the redesign's core; see 4.3.
- **Gym below as three drills** — five cards in a 2×2+1 grid reads as a feature list; three reads as a practice. Cut Moment Compass (it is a quiz, not a drill) or demote it to a one-line "what do you value when squeezed?" prompt inside the Reframe Lens. Keep Grounding, Reframe, Impulse Catcher.
- **A closing bridge** — the only account CTA that makes sense after a successful run.

### 4.3 The detector, redesigned

**A. State machine (one source of truth, no stale reads)**

```
idle → typing → reading → read → editing(register) → copied
```

- `read` is computed from an immutable `{ text, version }` snapshot.
- Any edit to the draft returns to `typing` and visually *dims* the old read with "This read is for the previous draft — read it again." Never leave a stale verdict next to new copy (F5).
- Analyzing is synchronous, so no fake 620ms "Listening…" delay. If you want the pulse, show it for the actual work (~1 frame) or drop it.

**B. Signals replace scores**

Every detected pattern becomes an object with a span, a category, a weight, and a *specific* note:

```ts
type SignalKind = 'heat' | 'demand' | 'volume' | 'absolute' | 'hedge' | 'warmth' | 'play';

interface Signal {
  kind: SignalKind;
  start: number;            // index into the draft
  end: number;
  text: string;             // exact matched span — never a paraphrase
  weight: number;           // 0..1
  note: string;             // one short, pattern-specific sentence
  fix?: Edit;               // the surgical change this signal suggests
}
```

Rules that fall out of the findings:
- **Word-boundary regexes, never `includes`** (F1). `/\b(relax|relaxed)\b/` still needs care: match the *inflection* you mean and quote the span.
- **Quote strictly from the matched span** (F2). If the span is `relaxed`, the chip says "relaxed".
- **Every signal must move something** (F3). Either it contributes weight to a dimension, or it is filed as context and not shown as a finding.
- **Count occurrences, weight repetition sub-linearly** (F4): `weight = 1 - 0.5^n`.
- **Show all hedges** alongside other signals (F13); sort findings by weight, not detection order, and cap at four *after* sorting with a "+2 more" affordance.
- **One note per pattern, not per category.** `obviously` and `you need to` are different problems and must not share a sentence.

**C. Verdict without fake confidence**

Replace the five meters and the percentage with a read that states its own evidence:

```
Reading: Rude, with heat aimed at a person
Because: “wasting everyone’s time” (heat) · “you need to” (demand) · “!!” (volume)
Would land better if: the ask were separated from the frustration
```

- Dimensions stay available, but as two compact axes (Warmth ↔ Heat, Directness) with a qualitative band (low / some / strong), not a two-digit number next to a 1.5px bar.
- Replace `confidence` with **evidence buckets**: `Clear` (≥3 signals, one dominant), `Leaning` (2 signals or a close margin), `Mixed` (signals conflict), `Not enough to read` (<4 words or 0 signals). Nonsense must land in the last bucket, not at 59% (F6).
- If you keep a number for instrumentation, keep it internal.

**D. Annotation layer instead of chips**

Render the draft in a read-only `<mark>`ed-up view:
- underlines coloured by kind (heat / demand / volume / hedge),
- margin notes aligned to the line, max three visible,
- clicking a note scrolls/highlights its span, and vice versa,
- keyboard: notes are a list, arrow keys move highlight.

This single change converts the page from "a scoreboard about you" into "an editor beside you", and it is what people will screenshot and share.

**E. Rewrites as surgical edits, not templates**

```ts
interface Edit {
  start: number; end: number;
  replacement: string;
  why: string;              // shown under the suggestion
  preservesMeaning: boolean; // false → must be user-confirmed
}

interface Rewrite {
  register: 'softer' | 'kinder' | 'plainer';
  edits: Edit[];
  text: string;             // draft with edits applied
  diff: Array<{ type: 'same' | 'removed' | 'added'; text: string }>;
}
```

Non-negotiable guards, each mapped to an observed failure (F7/F8):

1. **Never append a closing line to content that still contains a demand.** If the edit set still contains `demand` signals, the register is not "softer" — it is "same demand, calmer surface", and it says so.
2. **Preserve sentence boundaries and casing.** Replacement text is cased to the position it occupies; if you remove a clause that began a sentence, re-case the new first word. No more `already. could you`.
3. **One substitution vocabulary per register, with grammar-aware targets.** `obviously` → delete it, or move it to a separate sentence ("I know I've said this before."). Never `i think` (F7).
4. **Meaning-changing swaps are opt-in.** `stupid → careless` is a claim change; show it as "replace the judgement with a description" and let the user accept, don't bake it into three variants (F8).
5. **If no edit is possible, say so.** "There's nothing to soften here without changing what you said." Honest emptiness beats four bad variants.
6. **Diff view is mandatory.** Reviewers need to see what was removed; a wall of replaced text hides the disagreement.

**F. Optional model-backed rewrite (decision, not default)**

A deterministic engine handles the read, the annotation and 80% of edits, and it is instant, private, and free. Register-scale rewriting — especially "keep my meaning, lose the sting" — is exactly where a model helps. Recommended shape if you go there:

- deterministic read + local diff always; model only proposes `Edit[]` for the chosen register,
- validate every returned edit against the span (offsets exist, text present) and reject silently otherwise,
- server route, streamed, with the draft never logged; the "runs in your browser" line must stay scoped to the read, and say so precisely ("the read runs locally; the rewrite uses a model").
- Cost/latency budget: one call per register click, 400-char cap, cache by `hash(text + register)`.
- Provider choice is open — pick it when we ship that phase, not now.

### 4.4 Visual system rules

1. **Layering contract.** One decorative layer, `z-index: 0` inside an `isolation: isolate` wrapper, and a content layer above it. No decorative element may carry a positive z-index above flow content. Clouds are allowed behind text, never over it (F9). Verify by asserting `compareDocumentPosition`/paint order in a visual test, not by eye.
2. **Cloud budget.** Drift is charming for 6–8s, then it is a moving contrast hazard. Either confine clouds to the band between sections, or drop opacity to ≤0.25 and stop them at the hero's lower third.
3. **Panels must be opaque enough to be readable.** Raise the detector surface to ≥0.9 alpha, or add a vertical scrim inside the panel behind body copy. Measure contrast against the *composited* screenshot pixel, not the design token (F10). Target 4.5:1 for 14px copy, 3:1 for 24px+ display.
4. **Sticky header gets a surface.** Opaque `bg-background/90` + `backdrop-blur` at `<768px`, plus a hairline; test by scrolling a long H2 under it (F11).
5. **Type floor.** No functional text under 11px. The 10px uppercase eyebrows are a signature — keep them for labels only, never for the meter values or `/400` counter.
6. **Meter pairing.** If you keep multi-meter rows, make the pairing unmistakable: group label+bar+value in a bordered cell, or put values under the bar's end, not between columns (F14).
7. **Motion policy.** `@media (prefers-reduced-motion: reduce)` kills drift, ping, float, and lens flip; meters snap to value. All animation under 300ms except the deliberate drills.
8. **One surface language.** The detector is a translucent glass panel and the gym cards are opaque gradient cards. Pick one — recommended: opaque cards with a 1px amber-tinted hairline, glass reserved for the hero input.

### 4.5 Mind Gym, redesigned

- **Three drills, one loop each**, all with the same anatomy: *Setup (30–60s) → Do → One-line insight → Optional next rep.*
- **Your material, not ours.** Reframe Lens opens with "What's the situation?" (free text, prefilled with an example); Thought Unhook (if kept) takes your thought. This is the difference between a gym and a brochure (F17).
- **Impulse Catcher**: difficulty ramp (spawn interval 900ms → 600ms over 20s), keyboard `Space`/`Tab` capture for non-touch users, pause button, timer cleared in the effect cleanup, best score namespaced (`shiftedmind.toneLab.gym.best`) and versioned (F23).
- **Moment Compass**: either delete, or reformat as a *reflection* ("You picked 'keep the person' 5 times, 'win the argument' 3 — what would you want to have chosen next time?") and wire it to the closing CTA (F16/F17).
- **Accessibility**: every drill operable with keyboard, results announced via `aria-live="polite"`, steps labelled "1 of 5", emoji `aria-hidden`, timers announce start/end.
- **One bridge per drill**: "Keep this for the next time you're in this room" → saves a personal intention (auth) or copies a line (anon). That is the missing conversion and it fits the product's metaphor.

### 4.6 Accessibility checklist (acceptance)

- [ ] `<label>` for the message field (visually hidden if needed), `aria-describedby` for the counter and the privacy line.
- [ ] Result region `role="status" aria-live="polite"`, focus moved to the verdict heading after analysis on mobile (`scrollIntoView({block:'nearest'})` + `focus()`).
- [ ] All interactive targets ≥44×44 CSS px (nav links included).
- [ ] Active nav link gets `aria-current="page"`.
- [ ] Drill titles are `<h3>`; each card is a labelled `<section>`; page has a skip link.
- [ ] Emoji icons `aria-hidden="true"`; flag/annotation notes reachable by keyboard.
- [ ] Contrast verified from screenshots at 390/768/1440 in the worst-case scroll position behind each text block.
- [ ] `prefers-reduced-motion` honoured; no infinite drift.
- [ ] Visible focus ring on the dark panel at ≥3:1.

### 4.7 Performance budget

- Target ≤180 KB JS (gzip) for `/tone-lab`. Current: 327 KB.
- Do not ship `radix-ui` and `recharts` to a page with no dialogs and no charts — split the shell so primitive chunks are route-scoped.
- Remove the CDN `html2canvas-pro` load from this route (and if it is needed elsewhere, self-host it, pin the version, add SRI) (F22).
- Self-host the two families you actually use (Fraunces display + Space Grotesk text); drop JetBrains Mono from the critical path (it is used for 10px numbers).
- Keep the detector route ≤12 KB of its own JS. It is ~6 KB today; the budget is for annotation + diff, not a framework.

### 4.8 Implementation sketch (Vite + React + TS + Tailwind)

```
src/
  tone/
    types.ts            // Signal, Edit, Rewrite, Read
    lexicon.ts          // patterns → kind, weight, note, suggested edit
    detect.ts           // span-based detection, word boundaries, dedupe
    score.ts            // dimensions + verdict bucket + evidence list
    rewrite.ts          // edit application, casing/punctuation guards, diff
    __tests__/          // golden fixtures (see below)
  components/
    MessageField.tsx
    AnnotatedDraft.tsx
    ReadPanel.tsx
    RegisterTabs.tsx
    Diff.tsx
    drills/…
  page/ToneLab.tsx
```

`detect.ts` core:

```ts
export function detect(text: string): Signal[] {
  const out: Signal[] = [];
  for (const rule of LEXICON) {
    const re = new RegExp(rule.pattern, 'giu');
    for (const m of text.matchAll(re)) {
      if (m.index === undefined) continue;
      out.push({ kind: rule.kind, start: m.index, end: m.index + m[0].length, text: m[0], weight: rule.weight, note: rule.note(m[0]), fix: rule.fix?.(m[0]) });
    }
  }
  return dedupeOverlaps(out).sort((a, b) => b.weight - a.weight);
}
```

`score.ts` verdict (`sum` and `headlineFor` elided):

```ts
export function read(signals: Signal[], words: number): Read {
  if (words < 4 || signals.length === 0) return { bucket: 'insufficient', headline: 'Not enough to read', evidence: [] };
  const heat = sum(signals, 'heat') + sum(signals, 'volume') * 0.6 + sum(signals, 'absolute') * 0.4;
  const warmth = sum(signals, 'warmth');
  const demand = sum(signals, 'demand');
  const margin = Math.abs(heat - warmth);
  const bucket = signals.some((s) => s.kind === 'hedge') && heat > 0 ? 'mixed'
    : margin < 0.6 ? 'mixed'
    : margin < 1.6 ? 'leaning' : 'clear';
  return { bucket, headline: headlineFor({ heat, warmth, demand }), evidence: signals.slice(0, 4) };
}
```

Rewrite invariant tests (these are the regression suite for F7/F8):

```ts
it('never appends a softener while a demand survives', () => {
  const r = rewrite(SAMPLE_HOSTILE, 'softer');
  expect(r.edits.some((e) => e.why.includes('demand'))).toBe(false);
  expect(r.text).not.toMatch(/No rush/);
});
it('preserves sentence casing', () => {
  expect(rewrite(SAMPLE_HOSTILE, 'softer').text).not.toMatch(/\.\s+[a-z]/);
});
it('quotes only words that exist in the draft', () => {
  for (const s of detect('The schedule is relaxed.')) expect('The schedule is relaxed.'.slice(s.start, s.end)).toBe(s.text);
});
it('does not raise evidence for length alone', () => {
  expect(read(detect('Okay.'), 1).bucket).toBe('insufficient');
});
```

### 4.9 Build sequence

**Phase 1 — make it honest (1–2 days).**
Word-boundary detection with span quoting; absolutes weighted; sorted, uncapped hedges; stale-state fix; confidence replaced by evidence buckets; page title/meta; cloud layer moved behind all copy and capped; panel contrast; sticky header surface; textarea label and `aria-live`.
*Done when:* every probe in section 3 behaves correctly and Lighthouse a11y ≥ 95 on `/tone-lab`.

**Phase 2 — make it useful (3–4 days).**
Annotated draft + margin notes; register tabs driven by surgical edits with casing guards and diff; empty/limited states; move the field into the hero; 44px targets.
*Done when:* the bundled sample produces three coherent variants a copy editor would sign off, and the diff shows what changed.

**Phase 3 — make it travel (3–5 days).**
Three-drill gym with your-own-material inputs; carry-it bridge; reduced motion; JS ≤ 180 KB; route-scoped metadata and share card; privacy line made precise and visible.
*Done when:* a first-time visitor can go from paste to copied rewrite in under 30 seconds, and the result is worth screenshotting.

---

## 5. Open decisions (yours)

1. **Deterministic-only or hybrid rewriting?** Deterministic keeps the local/private promise and the instant feel; hybrid gets genuinely good register shifts at the cost of a server call and a new privacy sentence. My recommendation: deterministic read, model-assisted rewrite behind an explicit button.
2. **Keep five drills or three?** Three drills with real inputs beat five demos. Moment Compass is the weakest — it is a quiz wearing a drill's clothes.
3. **What is the conversion moment?** The best guess from this page: after a successful copy, offer "save this rewrite as an intention for the conversation" — the product's star metaphor, applied to the tool's own outcome.
