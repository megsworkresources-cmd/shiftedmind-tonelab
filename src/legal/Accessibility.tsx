import { LEGAL } from './config';
import LegalLayout from './LegalLayout';

export default function Accessibility() {
  return (
    <LegalLayout title="Accessibility statement" eyebrow="Accessibility">
      <p>
        This statement covers the {LEGAL.product} at this address. It explains the standard the lab aims at, what
        works today, where it falls short, and how to tell us when it fails you.
      </p>

      <h2>Conformance status</h2>
      <p>
        The lab aims to meet <strong>WCAG 2.2 level AA</strong>. As of {LEGAL.effectiveDate} it is{' '}
        <strong>partially conformant</strong>: most success criteria are met, and the exceptions are listed below
        rather than hidden. We have not yet commissioned an independent audit, so this is a self-assessment.
      </p>
      <p>
        Because the lab is offered to consumers in the European Union, we treat the European Accessibility Act
        (Directive (EU) 2019/882), applicable from 28 June 2025, as the baseline expectation alongside WCAG 2.2 AA.
      </p>

      <h2>What works</h2>
      <ul>
        <li>
          <strong>Structure.</strong> One main landmark, one h1 per page, headings in order, sections named by their
          headings, and a skip link as the first focusable element.
        </li>
        <li>
          <strong>Keyboard.</strong> Every control is reachable and operable with a keyboard alone, including the
          register tabs (arrow keys) and the marks in the annotated draft. Focus is never trapped, and focus
          returns to the trigger when a dialog closes.
        </li>
        <li>
          <strong>Screen readers.</strong> The annotated draft exposes each mark as a labelled button with the
          pattern it matched. Status changes — recording, measuring, copying, saving — are announced through live
          regions rather than colour alone.
        </li>
        <li>
          <strong>Colour and contrast.</strong> Text is set on a dark surface; the decorative sky photograph is
          behind a scrim and never carries meaning. Marks use an underline pattern as well as colour, so a
          colour-vision deficiency does not remove the signal.
        </li>
        <li>
          <strong>Targets and zoom.</strong> Interactive targets are at least 44 × 44 CSS pixels. The layout
          reflows to 320 CSS pixels wide and remains usable at 200% zoom and 400% text-only zoom.
        </li>
        <li>
          <strong>Motion.</strong> Cloud drift, the constellation twinkle, transitions and the scroll-to-result
          animation are disabled when your system asks for reduced motion, and nothing moves for longer than five
          seconds without a way to stop it.
        </li>
        <li>
          <strong>Sound.</strong> Nothing starts playing on its own. Ambient sound is off by default and begins
          only from the switch that says so, which then acts as the stop control; volume is adjustable
          independently of your device and chimes can be turned off separately. Every chime has a visible
          equivalent, so no action depends on hearing one, and sound stops if you switch tabs. The breathing pace
          is described in text rather than announced repeatedly.
        </li>
        <li>
          <strong>Time.</strong> The impulse drill's 20-second timer can be paused and restarted. No other feature
          is time-limited, and no session expires.
        </li>
        <li>
          <strong>Forms and errors.</strong> The message field has a visible, programmatic label and a described
          character count. Microphone failures are announced with a plain-language cause and a way forward that
          does not need a microphone.
        </li>
        <li>
          <strong>No account wall.</strong> Every feature, including the legal pages, works without signing in.
        </li>
      </ul>

      <h2>Known limitations</h2>
      <p>These are real gaps, not hypothetical ones:</p>
      <ul>
        <li>
          <strong>No formal audit or assistive-technology matrix yet.</strong> Testing has been done with automated
          checks and keyboard-only navigation. A structured pass with NVDA on Windows, VoiceOver on macOS and iOS,
          and TalkBack on Android is outstanding.
        </li>
        <li>
          <strong>Muted secondary text.</strong> Some small captions sit near the 4.5:1 boundary against the
          translucent panels. Where they fall short, the same information is repeated in higher-contrast text
          nearby, but the captions themselves should be raised.
        </li>
        <li>
          <strong>The sky photograph.</strong> The hero contains a decorative photograph. It is marked as
          decorative and covered by a scrim, but on very bright displays it can reduce the perceived contrast of
          the hero paragraph. Increasing your display contrast resolves it.
        </li>
        <li>
          <strong>Microphone features need a modern browser</strong> and a secure (https) connection. If your
          browser cannot capture audio, the lab says so and the text lab remains fully available.
        </li>
        <li>
          <strong>SVG icons.</strong> The recorder and mark icons are decorative and hidden from assistive
          technology; the adjacent text carries the meaning. If an icon ever becomes the only label, that is a bug
          — please report it.
        </li>
        <li>
          <strong>English only.</strong> The interface and the tone lexicon are written in English. Other languages
          are not supported, and the text direction is left-to-right.
        </li>
      </ul>

      <h2>What we do to keep it working</h2>
      <ul>
        <li>Automated checks run on every change to the tone and voice engines.</li>
        <li>Keyboard navigation and the reduced-motion path are part of the release check, not an afterthought.</li>
        <li>New interactive components must bring a visible label, a focus style, and a 44px target with them.</li>
      </ul>

      <h2>Feedback and enforcement</h2>
      <p>
        If something here blocks you, tell us what you were doing, what you expected, and which browser or
        assistive technology you use. Write to <strong>{LEGAL.contactEmail}</strong>. We aim to acknowledge within
        five working days and to fix blocking issues in the next release. If you are not satisfied with our
        response, you can complain to the market-surveillance authority for accessibility in your EU member state,
        or — in the United States — to the relevant federal agency under the ADA.
      </p>
      <p>
        We will update this statement whenever the conformance position changes, and the version and date at the
        top of the page will move with it.
      </p>
    </LegalLayout>
  );
}
