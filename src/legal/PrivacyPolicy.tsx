import { LEGAL, LEGAL_ROUTES } from './config';
import LegalLayout from './LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy notice" eyebrow="Privacy">
      <p className="text-cream/85">
        This notice explains what the {LEGAL.product} does with your information. It is written to be read, not to
        be survived.
      </p>

      <h2>In one paragraph</h2>
      <p>
        The lab runs in your browser. Your message, your voice and the measurements taken from them stay in the
        tab. There are no accounts, no cookies, no analytics, no advertising, and no third-party requests. Three
        small settings are saved on your device so the page works the way you left it. We do not sell or share
        personal information.
      </p>

      <h2>Who is responsible</h2>
      <p>
        The controller is <strong>{LEGAL.operatorName}</strong>, {LEGAL.operatorAddress}. Privacy contact:{' '}
        <strong>{LEGAL.contactEmail}</strong>. We have not appointed a Data Protection Officer or an EU/UK
        representative; if that changes, this page will name them.
      </p>

      <h2>What is processed</h2>
      <div className="legal-table-scroll" tabIndex={0} role="group" aria-label="What is processed">
        <table>
          <thead>
            <tr>
              <th scope="col">What</th>
            <th scope="col">Why</th>
            <th scope="col">Where it goes</th>
            <th scope="col">How long</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="What">Message text you type</td>
            <td data-label="Why">To mark tone and produce rewrites</td>
            <td data-label="Where it goes">Never leaves the tab; no request is made</td>
            <td data-label="How long">Until you clear the field or close the tab</td>
          </tr>
          <tr>
            <td data-label="What">Microphone audio</td>
            <td data-label="Why">To measure pitch, level, pauses and pace</td>
            <td data-label="Where it goes">Decoded and analysed in this tab; not uploaded</td>
            <td data-label="How long">Clip held in memory until you discard it, record again, or leave</td>
          </tr>
          <tr>
            <td data-label="What">Derived measurements</td>
            <td data-label="Why">To describe delivery and suggest one change</td>
            <td data-label="Where it goes">In the tab only; not stored or transmitted</td>
            <td data-label="How long">Until you reset or leave</td>
          </tr>
          <tr>
            <td data-label="What">Four local settings</td>
            <td data-label="Why">
              To keep your intention, your best drill score, your microphone-notice acknowledgement and your
              sound settings
            </td>
            <td data-label="Where it goes">Your browser’s local storage on this device</td>
            <td data-label="How long">
              Until you clear them (see <a href={LEGAL_ROUTES.data}>local data</a>)
            </td>
          </tr>
          <tr>
            <td data-label="What">Standard request logs</td>
            <td data-label="Why">To deliver the page and protect it from abuse</td>
            <td data-label="Where it goes">Our hosting provider ({LEGAL.hostingProvider})</td>
            <td data-label="How long">Per the hosting provider’s retention policy</td>
          </tr>
          </tbody>
        </table>
      </div>

      <h2>Microphone and voice</h2>
      <p>
        The microphone is off until you press record. Before the browser asks for permission, we show a notice
        explaining what happens; the browser prompt on its own is not informed consent. You can decline and still
        use the text lab.
      </p>
      <ul>
        <li>
          <strong>No upload.</strong> No audio, transcript, or measurement is sent to a server. There is no
          speech-to-text, no voice identification, and no attempt to infer emotion, health, or truthfulness.
        </li>
        <li>
          <strong>No retention.</strong> The clip exists as an in-memory blob so you can play it back. It is
          discarded when you press discard, record again, or close the page.
        </li>
        <li>
          <strong>No third-party processing.</strong> Because the audio never leaves the device, no processor
          receives it and no international transfer of audio takes place.
        </li>
        <li>
          <strong>Other people.</strong> Recording laws vary; several jurisdictions require every participant to
          consent. Do not record anyone else’s private conversation without their permission.
        </li>
      </ul>

      <h2>Cookies, storage and tracking</h2>
      <p>
        We set no cookies. We use four local-storage entries, all of which exist to do something you asked for:
      </p>
      <div className="legal-table-scroll" tabIndex={0} role="group" aria-label="Local storage keys">
        <table>
          <thead>
            <tr>
              <th scope="col">Key</th>
            <th scope="col">Purpose</th>
            <th scope="col">Removed when</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="Key"><code>shiftedmind.toneLab.intention.v1</code></td>
            <td data-label="Purpose">The intention you chose to keep</td>
            <td data-label="Removed when">You clear it, or clear local data</td>
          </tr>
          <tr>
            <td data-label="Key"><code>shiftedmind.toneLab.impulseBest.v1</code></td>
            <td data-label="Purpose">Your best score in the impulse drill</td>
            <td data-label="Removed when">You clear it, or clear local data</td>
          </tr>
          <tr>
            <td data-label="Key"><code>shiftedmind.toneLab.micConsent.v1</code></td>
            <td data-label="Purpose">Records that you saw the microphone notice and when</td>
            <td data-label="Removed when">You clear it, or clear local data</td>
          </tr>
          <tr>
            <td data-label="Key"><code>shiftedmind.toneLab.audio.v1</code></td>
            <td data-label="Purpose">
              Whether ambient sound is on, which scene, the volume and whether chimes play
            </td>
            <td data-label="Removed when">You clear it, or clear local data</td>
          </tr>
          </tbody>
        </table>
      </div>
      <p>
        These are strictly necessary to provide the feature you selected, so under the EU ePrivacy Directive and
        UK PECR they do not require a consent banner. Nothing is stored for analytics or advertising. If that ever
        changes, we will ask first and update this notice.
      </p>

      <h2>Purposes and lawful bases (EU/UK GDPR)</h2>
      <ul>
        <li>
          <strong>Microphone measurement</strong> — consent (Article 6(1)(a)). You give it through the pre-record
          notice and can withdraw it by not recording again and clearing the acknowledgement under{' '}
          <a href={LEGAL_ROUTES.data}>local data</a>. Withdrawal does not affect processing that already happened.
        </li>
        <li>
          <strong>Local settings</strong> — performance of the service you requested (Article 6(1)(b)) or our
          legitimate interest in remembering your preference (Article 6(1)(f)); both are minimal and stay on your
          device.
        </li>
        <li>
          <strong>Hosting and security logs</strong> — legitimate interests (Article 6(1)(f)) in delivering and
          protecting the page.
        </li>
      </ul>
      <p>
        We do not seek special-category data. The voice read measures acoustics only; it does not analyse what you
        say and makes no health inference. If you happen to speak about your health, that audio is processed
        transiently in your browser and is not retained or analysed for meaning.
      </p>

      <h2>Recipients, sharing and transfers</h2>
      <p>
        We do not sell or share personal information, and we do not disclose it to advertisers or data brokers.
        The page is served by {LEGAL.hostingProvider}, which processes standard request data (such as IP address
        and user agent) to deliver the page and prevent abuse. Links to the wider ShiftedMind product take you to a
        different site with its own notice. No personal data is transferred internationally by us beyond whatever
        the hosting provider does to serve the page; where required, that provider relies on standard contractual
        clauses.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the EU/UK GDPR you have the right to be informed, to access, to rectification, to erasure, to
        restriction, to object, and to data portability, and the right to withdraw consent. Because we never
        receive your message or audio, most requests can be satisfied on your device instantly by clearing local
        data. For anything else, write to <strong>{LEGAL.contactEmail}</strong>. We reply within one month. You can
        also complain to your supervisory authority — for example the ICO in the UK or your national authority in
        the EU.
      </p>

      <h2>California (CCPA/CPRA)</h2>
      <p>
        This is our notice at collection. If you are a California resident and the CCPA applies to us, the
        categories we collect are: identifiers limited to standard server logs (IP address, user agent), and the
        content you choose to save locally. Audio and message content are processed only on your device and are
        not collected by us.
      </p>
      <ul>
        <li>
          <strong>Purposes:</strong> providing the tools you request, keeping your settings, and securing the
          service.
        </li>
        <li>
          <strong>Sale or sharing:</strong> none. We do not sell or share personal information, and we do not use
          it for cross-context behavioural advertising.
        </li>
        <li>
          <strong>Sensitive personal information:</strong> not collected. We do not infer health status from your
          voice or text.
        </li>
        <li>
          <strong>Retention:</strong> logs per the hosting provider’s policy; local settings until you clear them.
        </li>
        <li>
          <strong>Your rights:</strong> to know, delete, correct, and limit use of sensitive personal information,
          and to be free from discrimination for exercising them. Use the <a href={LEGAL_ROUTES.data}>local data</a>{' '}
          controls, or email <strong>{LEGAL.contactEmail}</strong>. Authorised agents may make requests with proof
          of authorisation.
        </li>
      </ul>

      <h2>Other US state laws</h2>
      <p>
        If you live in a state with a comprehensive privacy law (for example Virginia, Colorado, Connecticut, Utah,
        Texas, Oregon or Montana), you may have rights to access, correct, delete, obtain a copy of, or appeal our
        handling of your personal information. We do not sell personal information or use it for targeted
        advertising. Contact <strong>{LEGAL.contactEmail}</strong> to exercise a right; if we refuse, you may
        appeal using the same address.
      </p>
      <p>
        We do not collect “consumer health data” as defined by Washington’s My Health My Data Act. The voice read
        measures acoustic properties only and is not used to identify a health condition.
      </p>

      <h2>Children</h2>
      <p>
        The lab is for people aged {LEGAL.minimumAge} and over. We do not knowingly collect information from
        children. If you are under {LEGAL.minimumAge}, please do not use the microphone features.
      </p>

      <h2>Security</h2>
      <p>
        Processing happens in your browser, which removes a whole class of risk: there is no server-side store of
        your message or voice to breach. The page is served over HTTPS. No system is perfectly secure, so treat the
        local clip as you would any recording on your device.
      </p>

      <h2>Changes</h2>
      <p>
        We update this notice when the app changes. Material changes will bump the version and date at the top of
        this page, and a change to the microphone notice will ask you to acknowledge it again.
      </p>

      <h2>Contact</h2>
      <p>
        {LEGAL.operatorName} · {LEGAL.contactEmail}. For accessibility feedback, see the{' '}
        <a href={LEGAL_ROUTES.accessibility}>accessibility statement</a>.
      </p>
    </LegalLayout>
  );
}
