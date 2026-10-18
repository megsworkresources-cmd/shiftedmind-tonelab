# Legal and privacy checklist

This file is the pre-launch companion to the four legal pages in `src/legal/`. It records what the
app now does about privacy, consent and accessibility, what still has to be filled in by the
operator, and how each claim is checked.

Nothing here is legal advice. It is a map of the implementation so a lawyer can review it quickly.

---

## 1. Fill these in before publishing

Every value below lives in `src/legal/config.ts`. While any placeholder remains, `LEGAL.placeholders`
is `true` and every legal page shows a **Template notice** banner.

| Field | Current value | Must become |
| --- | --- | --- |
| `operatorName` | `[Operator legal name]` | The registered legal entity, not the product name |
| `operatorAddress` | `[Registered address]` | Registered or principal address for service |
| `contactEmail` | `[privacy contact email]` | A monitored mailbox, ideally `privacy@…` |
| `jurisdiction` | `[Governing law and courts]` | Governing law and forum for the terms |
| `hostingProvider` | `[Hosting provider]` | The host that sees request logs (named in the notice) |
| `effectiveDate` / `version` | `17 October 2026` / `1.0` | Bump together on every material change |
| `minimumAge` | `16` | Your actual minimum age (see section 5) |

Then set `placeholders: false` so the banner disappears.

```bash
grep -n "\[" src/legal/config.ts   # should print nothing once every value is real
```

`src/legal/legal.test.ts` fails if `placeholders` and the bracketed values disagree, so the template
banner cannot say the wrong thing about the notice it sits on.

Also add a cookie-free, first-party-only subprocessor list if you later put a CDN or error tracker in
front of the app. Today there are none.

---

## 2. What the app does with personal data

| Data | Where it goes | Why that is defensible |
| --- | --- | --- |
| Message text | Stays in the tab; never sent | No server, no analytics, no third-party script |
| Microphone audio | Decoded and measured in the tab; in-memory blob only | Not uploaded, not transcribed, not retained |
| Derived measurements | Component state only | Descriptive acoustics, no inference about health or mood |
| Three local keys | `localStorage` on this device | Strictly necessary for features the user chose |
| Request logs | Hosting provider | Delivery and abuse prevention |

There are **no cookies**, **no analytics**, **no third-party requests at runtime**, and **no accounts**.
That is what makes the ePrivacy/PECR consent banner unnecessary (see section 4) — keep it true, and the
notice stays accurate.

### The four storage keys

Defined once in `src/lib/storage.ts` and described once in `src/legal/localData.ts`:

- `shiftedmind.toneLab.intention.v1` — the sentence the user chose to keep
- `shiftedmind.toneLab.impulseBest.v1` — best impulse-drill score on this device
- `shiftedmind.toneLab.micConsent.v1` — when the microphone notice was accepted, and which version
- `shiftedmind.toneLab.audio.v1` — whether sound is on, which scene, the volume, chimes on or off

`LOCAL_DATA_INFO` is keyed by `STORAGE_KEYS`, and `src/legal/legal.test.ts` fails if the two ever
diverge. So the privacy notice, the data page and the code cannot drift apart silently.

---

## 3. In-product consent and transparency

| Requirement | Implementation |
| --- | --- |
| Informed consent before capture, not just the browser prompt | `src/components/MicNotice.tsx` — a modal shown *before* `getUserMedia` |
| Explicit acknowledgement, not a passive banner | Checkbox; **Enable microphone** stays disabled until it is ticked |
| Consent is optional and not coerced | "Not now" and "Continue without microphone"; the text lab needs no microphone |
| Withdrawal is as easy as giving it | Clearing the acknowledgement (data page, or the withdraw link under the recorder) makes the notice appear again before the next recording |
| Other people's consent | Named in the notice, the privacy notice, and the terms, with the all-party-consent warning |
| Notice versioning | `MIC_NOTICE_VERSION`; a bump re-asks every user |
| Wellbeing limits stated where the drills are | Crisis and "not treatment" note in the mind gym section, plus terms and footer |
| Sound is optional, controllable and not presented as treatment | `SoundPanel.tsx`: off by default, a switch that also stops, independent volume, separate chime toggle, masking and sensory-sensitivity warnings, and one evidence note per scene |
| Sky notes are not dressed up as prediction | `SkyNotes.tsx`: "no demonstrated predictive power", "we never ask for your birth date", same note for everyone; a **Sky notes** clause in the terms |

Gating lives in `src/components/VoiceLab.tsx`: pressing record opens the notice unless the accepted
version matches `MIC_NOTICE_VERSION`.

---

## 4. Which framework requires which page

| Law / standard | Obligation | Where it is answered |
| --- | --- | --- |
| EU/UK GDPR Art. 13 | Controller identity, purposes, lawful bases, recipients, retention, rights, complaint route | `PrivacyPolicy.tsx` |
| EU/UK GDPR Arts. 15–21 | Access, erasure, portability, objection | Local-data page (view, download JSON, delete per key or all) plus the contact email |
| EU/UK GDPR Art. 6(1)(a) | Consent for microphone processing | Notice + checkbox, withdrawable |
| ePrivacy Directive Art. 5(3) / UK PECR reg. 6 | Storage access | No cookies; the three keys are strictly necessary to a user-requested feature, and the notice says so |
| CCPA/CPRA | Notice at collection, no sale/share, no sensitive-data inference, right to limit | "California (CCPA/CPRA)" section |
| Other US state laws (VA, CO, CT, UT, TX, OR, MT…) | Access, correct, delete, appeal | "Other US state laws" section |
| Washington My Health My Data | Consumer health data | Explicit statement that none is collected |
| US state wiretap / all-party consent laws | Recording other people | Terms, privacy notice, and mic notice all put the duty on the user |
| WCAG 2.2 AA / EU Accessibility Act (from 28 June 2025) | Accessible product and a published statement | `Accessibility.tsx`, with named gaps |
| WCAG 2.2 SC 1.4.2 (audio control) | Stop mechanism or independent volume for audio longer than three seconds | No autoplay at all; the on/off switch stops playback and volume is independent of the device |
| Consumer-protection "entertainment" framing | Not misrepresenting astrology as fact, not implying therapeutic benefit | Both features carry their own honesty copy, and the terms repeat it |

The accessibility statement is a **self-assessment**. Before launch, either commission an audit or keep
the "no formal audit yet" limitation visible — it is currently the honest description.

---

## 5. Age and children

`LEGAL.minimumAge` is 16 and is quoted in the privacy notice and terms. Decide the real floor:

- COPPA (US) bites below 13; GDPR Art. 8 lets a member state set the digital-consent age between 13 and 16.
- The app has no accounts and no server storage, so there is nothing to delete for a child — but the
  microphone and the wellbeing drills still need a floor in the terms.
- If you lower the age, review the notice wording and the crisis-signposting text in the mind gym.

---

## 6. How each claim is verified

Deterministic checks (`npm test`, 84 tests total):

- `src/legal/legal.test.ts` — the inventory matches the code; the template banner agrees with the
  bracketed placeholders; consent round-trips; corrupt values are handled; **clearing touches only this
  app's keys**; blocked storage never throws; values render readably.
- `src/audio/audio.test.ts` — no audio module may fetch or reference a sound file; sound is off by default;
  the gain ceiling and curvature; chime levels; no healing-frequency or cure claims in the scene copy.
- `src/zodiac/zodiac.test.ts` — ISO week maths; four notes per sign that rotate weekly; 48 distinct notes;
  and a vocabulary check that fails on predictive, medical or personalised-claim language.
- `src/tone/tone.test.ts`, `src/voice/voice.test.ts` — the analysis engines that produce the on-screen claims.

Browser checks (`.audit/legal-check.mjs`, 64 assertions, plus `.audit/sky-audio-check.mjs`, 43 assertions,
headless Chromium at 1440×900 and 390×844):

- all four routes render, one `h1` each, titles update, focus moves to the new heading, the page returns
  to the top without a long glide
- the footer links are real navigation; the mic notice cannot be accepted unchecked; the notice explains
  no upload, no storage, no transcription; focus is trapped in the dialog
- the data page lists all three keys with readable values, exports a JSON copy, removes one key without
  touching the others, requires confirmation before clearing everything, and **leaves unrelated origin
  data alone**
- after clearing, the app reflects it: the saved intention is gone and the microphone notice is required again
- mobile: no horizontal page overflow on any legal route, stacked rows print their column labels, the
  Remove controls stay on screen, and the table/rowheader roles survive the layout change

The sound checks are behavioural rather than declarative: they read the engine's real output level, so they fail if
a scene produces silence, if 0% volume is not silent, if the tab switch does not suspend, or if a single
third-party or audio-file request is made. The sky checks compare the on-screen week against an independently
computed ISO week and confirm that no decoration paints over the hero copy.

```bash
npm run typecheck && npm test && npm run build
node .audit/legal-check.mjs       # requires the dev server on :3000
node .audit/sky-audio-check.mjs   # same server; screenshots land in audit/sky-audio/
```

---

## 7. Known gaps

- No independent legal review and no commissioned accessibility audit yet.
- Column headers are clipped out of the accessibility tree by the mobile stacked layout; each cell
  carries its own label text instead. Verified, documented, and worth revisiting if a screen-reader
  user reports a problem.
- The accessibility statement lists the gaps on purpose. Do not delete them without fixing them.
- If a third-party script, font CDN, analytics tool, hosted AI call or streaming audio provider is ever
  added, this file, the privacy notice and the "no third-party requests" claim all become false and must
  change in the same commit.
- The sound levels are digital gains, not measured sound pressure. Nobody has listened to this on a phone
  speaker or a pair of headphones in a quiet room yet; do that before recommending a volume.
