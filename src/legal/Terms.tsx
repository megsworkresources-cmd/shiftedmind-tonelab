import { LEGAL, LEGAL_ROUTES } from './config';
import LegalLayout from './LegalLayout';

export default function Terms() {
  return (
    <LegalLayout title="Terms of use" eyebrow="Terms">
      <p>
        These terms cover the {LEGAL.product}. By using it you agree to them. If you do not, please stop using the
        lab.
      </p>

      <h2>Who can use it</h2>
      <p>
        You must be at least {LEGAL.minimumAge} years old. The lab is free, needs no account, and is provided for
        personal use. Do not use it on behalf of someone else without their agreement.
      </p>

      <h2>What this is — and what it is not</h2>
      <p>
        The lab is a writing and speaking aid. It marks patterns in text and measures acoustic properties of
        speech. Its output is a heuristic opinion about tone, not a fact about you, the reader, or the outcome of a
        conversation.
      </p>
      <ul>
        <li>
          <strong>Not medical care.</strong> The mind gym exercises are general wellbeing practices, not therapy,
          diagnosis, or treatment. Nothing here creates a clinical relationship.
        </li>
        <li>
          <strong>Not a crisis service.</strong> If you are in immediate danger or thinking about harming yourself,
          contact your local emergency number or a crisis line in your country now. Do not wait for a web page.
        </li>
        <li>
          <strong>Not advice.</strong> Do not rely on the lab for legal, employment, medical, or financial
          decisions. Read the marked message yourself before you send it.
        </li>
      </ul>

      <h2>Your content</h2>
      <p>
        Your message, your voice and your saved intention remain yours. We claim no licence over them, because we
        never receive them: processing happens in your browser. You are responsible for what you write and record.
      </p>

      <h2>Microphone and recording rules</h2>
      <p>
        The microphone is optional and only active while you are recording. When you use it:
      </p>
      <ul>
        <li>Record only yourself, or people who have given you permission.</li>
        <li>
          Recording laws vary. Some places require the consent of every person in the conversation, and penalties
          can be serious. It is your responsibility to comply with the law where you are.
        </li>
        <li>Do not use the lab to record private conversations, meetings, or anyone who has not agreed.</li>
        <li>Do not use the voice read to evaluate, rank, or make decisions about another person.</li>
      </ul>

      <h2>Sound</h2>
      <p>
        Ambient sound is optional, off until you switch it on, generated on your device rather than streamed, and
        it never starts by itself. Volume in the lab is independent of your device volume and, like every browser,
        it cannot know how loud something really is in your ears. Do not raise it past the point where you could
        comfortably talk over it, and do not use these scenes to mask alarms, doorbells, traffic or anyone calling
        for you. Sound can be uncomfortable or painful for people with hyperacusis, misophonia, tinnitus or
        sound-triggered dizziness; if that happens, stop. Nothing audible here is a medical device, a treatment or a
        therapeutic frequency, and the chimes are decoration with a visible equivalent on screen.
      </p>

      <h2>Sky notes</h2>
      <p>
        The weekly sky notes are short pieces of editorial writing that rotate by the calendar week. They are the
        same for everybody, they are not personalised, we do not ask for your birth date, and astrology has no
        demonstrated predictive power. Treat them as reflective prompts, not forecasts, and do not make decisions
        about money, health, work or relationships on the strength of them.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the lab to harass, threaten, or discriminate against anyone;</li>
        <li>attempt to break, overload, or reverse-engineer the service in a way that harms others;</li>
        <li>misrepresent the lab’s output as a clinical, forensic, or professional assessment;</li>
        <li>use it in a way that breaks the law, including recording and privacy law.</li>
      </ul>

      <h2>Output and availability</h2>
      <p>
        The lab is provided “as is”. Analysis can be wrong, incomplete, or blunt; the vocabulary it knows is a
        curated list, not a model of meaning. It may miss sarcasm, context, and indirect hostility. Features may
        change or be withdrawn. We do not guarantee uninterrupted availability.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The interface, copy, and code of the lab belong to {LEGAL.operatorName} or its licensors. You may not copy
        or redistribute them commercially without permission. Names and marks remain the property of their owners.
      </p>

      <h2>Third-party links</h2>
      <p>
        Links to the wider ShiftedMind product or to other sites are provided for convenience. Those sites have
        their own terms and privacy notices, and we are not responsible for them.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {LEGAL.operatorName} is not liable for indirect, incidental, or
        consequential loss, or for lost opportunities, relationships, or profits, arising from your use of the lab
        or reliance on its output. Nothing in these terms limits liability that cannot lawfully be limited,
        including for death or personal injury caused by negligence, or for fraud.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The version and effective date at the top of the page will change, and continued
        use after an update means you accept the new terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by {LEGAL.jurisdiction}, without affecting any mandatory consumer protections in
        your country of residence.
      </p>

      <h2>Contact</h2>
      <p>
        {LEGAL.operatorName} · {LEGAL.contactEmail}. See also the{' '}
        <a href={LEGAL_ROUTES.privacy}>privacy notice</a>.
      </p>
    </LegalLayout>
  );
}
