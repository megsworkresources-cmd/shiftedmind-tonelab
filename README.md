# Tone Lab — rebuilt

A working implementation of the redesign in [`TONE-LAB-CRITIQUE.md`](./TONE-LAB-CRITIQUE.md), built with Vite + React + TypeScript + Tailwind.

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # engine, voice, audio, zodiac and legal fixtures (84)
npm run typecheck # tsc, no emit
npm run build     # typecheck + production build
```

No accounts, no network calls at runtime, no analytics. Fonts are self-hosted via `@fontsource-variable`, so the page makes no third-party requests at all.

---

## What it does

1. **Read** a message locally: pattern detection over real spans, word-boundary matching, quoted evidence.
2. **Mark it up**: the draft is annotated inline with focusable marks; hovering or focusing evidence highlights the matching words.
3. **Fix it surgically**: three registers built from edits (no appended greetings, no invented closings, no "i think" substitutions), with a diff, a rationale list, and meaning-changing swaps kept behind an explicit opt-in.
4. **Train**: three drills — Impulse Catcher (20s, ramping, keyboard, pause), Reframe Lens (your own situation, three fixed lenses), Grounding 5-4-3-2-1 (back/skip).
5. **Set the sound**: four ambient scenes synthesised on the device from oscillators and noise — rain, tide, night drone, and a ten-second breathing pace. Off until you switch it on, quiet by design, independent volume, optional chimes, paused when the tab hides, and silenced while the microphone is open. [`AUDIO-NOTES.md`](./AUDIO-NOTES.md) records the evidence each scene is described against.
6. **Speak it**: the Voice Lab records up to 20 seconds, measures pitch, level, silence and pace on-device, and reads it back — no upload, no transcript, no retention.
7. **Read the sky**: twelve constellations in the hero, and a weekly sky section with four rotating notes per sign. Written as reflective prompts, not forecasts; no birth date is ever asked for, and the same note is shown to everyone.
8. **Carry it**: one intention saved to this browser only.

## How the audit findings were fixed

| # | Finding in the original | Fix here | Verified by |
|---|---|---|---|
| F1 | Substring matching (`relaxed` → `relax`) | Word-boundary regex lexicon, `detect()` quotes real spans | `detection…does not fire on substrings` |
| F2 | Flag quoted “calm down” when absent | Every chip renders `text.slice(signal.start, signal.end)` | `quotes a span that exists in the draft` |
| F3 | Absolutes flagged but scored zero | Absolutes feed the heat curve and drive their own verdict | `does not call an absolute "neutral and even"` |
| F4 | Repetition ignored | `1, 0.65, 0.42 …` damping per repeated kind | `counts repetition` |
| F5 | Stale results beside new text | Read is computed from an immutable snapshot; an edit shows a “read the new one” banner and dims the old read | browser check: banner appears, re-read updates headline |
| F6 | Fake confidence %, grows with length | No percentage; buckets `clear / leaning / mixed / not enough to read`, with a `Too little to read` state | `refuses to read gibberish`, `never prints a percentage` |
| F7 | Rewrite templates produce `could you DO IT … i think!`, `No rush` appended | Rewrites are `Edit[]` applied to spans, with casing, punctuation, and “don’t add closings” guards | 6 rewrite tests incl. casing and no-append |
| F8 | Silently changed meaning (`stupid → sneaky`) | Meaning-changing swaps are a separate, opt-in list with the claim difference stated | `offers meaning changes separately…` |
| F9 | Clouds paint over hero copy | Single decorative layer at `z-0` inside an isolated hero, capped height, plus a directional scrim | `audit/rebuild/desktop-hero.png`, `mobile-hero.png` |
| F10 | Translucent panel over bright sky | Opaque `#1e1539` panels, proof text on solid surfaces | computed background in geometry probe |
| F11 | Mobile header lets content through | `bg-[#120b26]/95` + `backdrop-blur`, verified with a heading scrolled under it | `mobile-header-overlap.png` |
| F12 | No annotation of the message | `AnnotatedDraft` marks spans; evidence and marks cross-highlight on hover/focus | interaction probe: mark gets `data-selected` |
| F13 | Noisy, duplicated, capped flags | One note per pattern, sorted by weight, no “+2 more” hiding, hedges never suppressed by other signals | evidence list renders all four sample signals |
| F14 | Meter values read as the next label | Dimensions are labelled rows with a band word (`low / some / strong`), values not interleaved | `audit/rebuild/desktop-result.png` |
| F15 | Disabled CTA looked enabled | Disabled state has its own muted surface + explicit helper copy | visual check |
| F16 | Dead ends after using the tools | Copy button, save-your-intention bridge, link into the product | interaction probe: intention persisted |
| F17 | Drills used fixed material | Reframe Lens takes your situation; Grounding and Impulse Catcher both have done states | interaction probe |
| F18 | Generic page metadata | Route-specific title, description, OG/Twitter tags in `index.html` | `document.title` check |
| F19 | 15px nav targets | Every control ≥44px (`btn`, nav, tabs, chips); inline marks are text with focus rings | target-size audit |
| F20 | Motion unconditional | `prefers-reduced-motion` kills drift, transitions, and animations | CSS media query + reduced-motion pass |
| F21 | No labels / outline / live regions | Labelled textarea, `h1/h2/h3` outline with no skips, `aria-live` status regions, `aria-current` | a11y probe (4 live regions, 1 label) |
| F22 | 358 KB with unused Radix/charts/CDN screenshot lib | React + own engines only; **120 KB gzip JS**, **9.2 KB gzip CSS**, zero third-party requests, zero audio downloads | `vite build` output |
| F23 | Timer leak, unnamespaced storage, “Start the 20s” | Interval + tick cleared on pause/unmount, namespaced versioned keys, corrected copy | drill pause test; storage key inspection |
| F24 | “Runs in your browser” unproven | No fetch on analyze; copy states exactly what is and isn’t stored, next to the field | network log: only document + assets |

## Structure

```
src/
  tone/         engine: types, lexicon, detect, score, rewrite, diff (+ 20 fixtures)
  voice/        acoustic engine: pitch, analyze, read (+ 13 fixtures)
  audio/        procedural Web Audio engine, provider, settings (+ 13 fixtures)
  zodiac/       twelve signs, four weekly notes each, ISO-week rotation (+ 22 fixtures)
  components/   header, sky, constellations, message field, annotated draft, read panel, register tabs, sound panel, voice lab, mic notice, weekly sky, carry-it, footer
  drills/       impulse catcher, reframe lens, grounding, shared card
  hooks/        useVoiceRecorder (mic lifecycle), useHashRoute (legal routes)
  lib/          storage: the only place that touches localStorage
  legal/        config, layout, privacy, terms, accessibility, local data (+ 16 fixtures)
  App.tsx       snapshot state, stale handling, section layout, route switch
```

## Privacy, consent and legal

The lab processes nothing on a server: the microphone and the message stay in the tab. That removes a
whole class of obligation, and the four pages state the rest honestly.

The sound and sky features add two obligations: sound must be controllable and honest about not being a
treatment, and the sky notes must not be dressed up as prediction. Both are handled in-product (the Sound
section's disclosures, the sky section's framing) and in the legal pages (a **Sound** clause and a **Sky
notes** clause in the terms).

| Page | Route | Covers |
|---|---|---|
| Privacy notice | `#/privacy` | What is processed, where it goes, retention; EU/UK GDPR Art. 13 items and lawful bases; ePrivacy/PECR position; CCPA/CPRA notice at collection; other US state rights; children; security |
| Terms of use | `#/terms` | Age, medical and crisis limits, recording-consent duties, acceptable use, IP, liability, governing law |
| Accessibility statement | `#/accessibility` | WCAG 2.2 AA target, partial conformance, the real gaps, EAA 28 June 2025 baseline, feedback and enforcement route |
| Local data | `#/data` | Every stored key with its purpose and current value, per-key removal, JSON export, confirmed clear-all |

Consent before capture is a modal, not a banner: `MicNotice` appears before `getUserMedia`, requires an
explicit acknowledgement, offers "not now", and re-asks when `MIC_NOTICE_VERSION` changes. Clearing the
acknowledgement withdraws it.

[`LEGAL_CHECKLIST.md`](./LEGAL_CHECKLIST.md) lists the placeholders the operator must fill in, the
regulatory mapping, and the checks behind each claim. While placeholders remain, `LEGAL.placeholders`
keeps a **Template notice** banner on every legal page.

## Known limits (deliberately honest)

- The lexicon is a curated list, not a model. It will miss sarcasm, context, and most indirect hostility — the UI says so under the read.
- Rewrites only remove or replace words; they cannot restructure a paragraph. When nothing safe can change, the variant says that instead of inventing text.
- Meaning-changing swaps are not auto-applied; that is a product decision, not an oversight.
- Drills keep state in memory only; the intention, the Impulse Catcher best score, the microphone-consent record and the sound settings are the only persisted values, all local and all listed on the local-data page.
- The ambient scenes are pleasant, not therapeutic. The evidence is thin and mixed, and each scene says so where you choose it — see [`AUDIO-NOTES.md`](./AUDIO-NOTES.md).
- The sky notes are editorial writing on a four-week rotation, not astrology that means anything. They are identical for every reader and no birth date is collected.
- The legal pages are complete templates, not reviewed advice: operator identity, address, contact and governing law are placeholders until the operator fills them in.
- No independent accessibility audit has been run, and the accessibility statement says so rather than claiming conformance it cannot evidence.
