# Sound: what the evidence supports, and what the app does about it

The Sound section exists because a wellbeing tool with audio in it has an obligation to be honest about what
the audio is. This file records the evidence we based the choices on, the safety decisions that follow from
it, and how each decision is enforced in code and tests.

Nothing here is medical advice, and none of it is a claim that the app treats anything.

---

## 1. What the evidence actually says

| Claim | What the literature shows | How the app responds |
| --- | --- | --- |
| Nature sounds help stress recovery | One small within-person study (Alvarsson, Wiens & Nilsson, 2010, *IJERPH*, N=40) found faster skin-conductance recovery with fountain-and-bird audio than with high traffic noise (recovery half-life 101.3 s vs 159.8 s), significant only against the loud-noise condition; high-frequency HRV showed no effect. | The "Slow tide" scene is offered and its evidence note says exactly this, including that HRV showed nothing. |
| Nature sound improves attention | A four-week randomised study (Luo, Wang & Chen, 2021, *Frontiers in Psychology*, N=71) reported better affect, flow and alerting attention in a nature-sound-app group. Small, students only. | The scene blurb avoids promising focus benefits. |
| Noise helps attention generally | The best quantitative result found is a meta-analysis (Nigg et al., 2024, *JAACAP*) of laboratory tasks: white/pink noise had a **small** benefit in ADHD groups (g=0.249, 95% CI 0.135–0.363) and a **small cost** in comparison groups (g=−0.212, 95% CI −0.355 to −0.069). No brown-noise studies. | The "Rain on a window" evidence note states both directions, and calls the scene a preference rather than an enhancer. |
| Noise improves sleep | A review of 34 studies (Capezuti et al., 2022, *JCSM*) concluded there is **no strong evidence** for auditory stimulation as a sleep aid. | No sleep claims anywhere in the app. |
| Slow music lowers arousal | Bernardi, Porta & Sleight (2006, *Heart*, N=24) found tempo-related changes in breathing, blood pressure and heart rate, with the largest effect from a *pause* in the music. | Scenes are slow and non-melodic, and the drone is deliberately uneventful. |
| ~6 breaths per minute is a useful pace | Chaitanya et al. (2022, *Cureus*, N=50) and Fuchs, Hillecke & Warth (2018, *Music and Medicine*, N=60) found HRV and wellbeing effects from guided resonance breathing. Small trials, combined interventions, individual resonance rates vary. | The "Breathing pace" scene swells every 10 seconds, the on-screen pacer runs 4 s in / 6 s out, and the copy says breathe normally if that is more comfortable. |
| Particular frequencies heal | Not supported. The 432 Hz literature (e.g. Calamassi et al., 2022, *Acta Biomedica*) compared tunings and found anxiety fell in **all** groups, including the routine-break control. Subliminal affirmation claims failed double-blind replication (Greenwald et al., 1991, *Psychological Science*). | Frequencies are ordinary musical pitches (A2 110 Hz, F3 174.61 Hz, and so on) and are described as such. A test fails the build if the word "healing frequency", "432", "chakra", "detox" or any cure claim appears in the audio module. |
| Chimes/bells have a calming effect | No verified study found. | Chimes are described as feedback, never as therapy, and every one has a visible equivalent on screen. |

Sources: [Alvarsson 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2872309/) ·
[Luo 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8651610/) ·
[Nigg 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11283987/) ·
[Capezuti 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9163611/) ·
[Bernardi 2006](https://pmc.ncbi.nlm.nih.gov/articles/PMC1860846/) ·
[Chaitanya 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC8924557/) ·
[Fuchs 2018](https://mmd.iammonline.com/index.php/musmed/article/view/576/0) ·
[Calamassi 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9534204/) ·
[Greenwald 1991](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.1991.tb00112.x/)

## 2. Safety decisions

- **Off until switched on.** `DEFAULT_SETTINGS.enabled` is `false`, nothing writes to storage until the user
  chooses something, and a reload never restarts playback. WCAG 2.2 SC 1.4.2 asks for a stop mechanism or
  independent volume control for audio over three seconds; the answer here is a switch that also stops, and a
  separate volume slider.
- **Quiet by default.** Digital gain is capped at `MAX_GAIN = 0.2` (about −14 dBFS at full slider) and the
  default setting is well below that. The copy says plainly that no browser can know how loud it is at your ear,
  and that the right setting is one you can talk over. WHO's safe-listening guidance (80 dB for 40 h/week;
  90 dB for 4 h/week) is the reason to be conservative, not a specification this app can meet for you.
- **Do not mask alarms.** Broadband noise masks by design, so the panel and the terms both say not to use it
  where you need to hear alarms, doorbells or someone calling you.
- **Sensory conditions.** Hyperacusis, misophonia, tinnitus and sound-triggered dizziness are named, with one
  instruction: stop if sound is uncomfortable or painful.
- **Paused on tab switch.** Hiding the tab fades the master to silence, suspends the context, and does not
  resume on return — the interface switches to "Resume sound" and waits for a click. This also matches iOS,
  where Safari can interrupt a context and an audio start usually has to come from a gesture.
- **Visible equivalents.** Chimes never carry information on their own.

## 3. Technical decisions

- **Synthesised, never fetched.** Scenes are built from oscillators and a generated noise buffer. `AmbientEngine`
  contains no `fetch`, no `Audio(...)` and no file references; `src/audio/audio.test.ts` reads every file in the
  folder and fails if one appears. The browser check additionally asserts that a session produces **zero
  third-party requests** and no request ending in an audio extension.
- **Gesture-only start.** `start()` creates or resumes the `AudioContext` synchronously inside the click handler,
  because iOS only unlocks audio created or resumed in the gesture. Nothing starts from an effect or a timer.
- **Ramps everywhere.** Every source starts at ~0 and is moved with `setTargetAtTime` (τ ≈ 0.08 s for volume,
  scene-dependent for crossfades). Sources are stopped after a fade, never cut, which is what clicks are.
- **One context, closed on teardown.** The provider keeps a single engine and closes the context when the
  component tree unmounts. Stop is a fade plus `suspend`-free teardown; close is `AudioContext.close()`.
- **Metering in the right place.** The `AnalyserNode` sits between the master gain and the destination, so the
  RMS the tests read is what the app is actually sending out. It is not sound pressure at anyone's ear, and the
  interface never implies otherwise.
- **A dev-only handle.** In development only, `window.__toneLabAudio()` returns the engine snapshot so the
  browser check can prove the output is non-zero, that zero volume is silent, and that the context is suspended
  when the tab is hidden. `import.meta.env.DEV` removes it from production builds.
- **Microphone courtesy.** Opening the microphone silences the master for as long as it is open — both to keep
  the clip clean and because capturing your own ambience back would be a silly bug.

## 4. Where each decision is enforced

| Decision | Test |
| --- | --- |
| Nothing is downloaded | `audio.test.ts` source scan; browser check: no third-party requests, no audio-file requests |
| Off by default, no autoplay | `audio.test.ts` defaults; browser check: idle on load, meter 0 before a gesture, idle after reload |
| Quiet ceiling and monotonic curve | `audio.test.ts` level tests; browser check: gain ≤ 0.2 at 100% |
| No healing/frequency claims | `audio.test.ts` scene-copy rules |
| Chimes are decoration and optional | `audio.test.ts` chime spec limits; browser check: cue fires when on, silent when off |
| Hidden tab pauses and does not auto-resume | browser check: `suspended` while hidden, still `suspended` on return, resume needs a click |
| Microphone silences the app | engine `suspendForRecording` / `recording` guard, wired in `VoiceLab` |
