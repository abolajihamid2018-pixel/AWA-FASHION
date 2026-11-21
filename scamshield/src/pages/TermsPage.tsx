import { LegalLayout } from './LegalLayout';

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of use" updated="21 November 2026">
      <section>
        <h2>Guidance, not a guarantee</h2>
        <p>
          ScamShield gives an assessment based on the warning signs it can detect. It can be wrong in both directions: a
          scam can score low and a genuine message can score high. Always use your own judgement, and contact the
          organisation or person directly through details you already trust before acting.
        </p>
      </section>
      <section>
        <h2>Not financial, legal or professional advice</h2>
        <p>
          If money, bank details or personal documents are involved, contact your bank or the relevant authority. Do not
          rely on ScamShield alone.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not submit other people's private information without good reason.</li>
          <li>Do not submit passwords, OTPs, PINs or card numbers.</li>
          <li>Do not attempt to overload, probe or misuse the service.</li>
        </ul>
      </section>
      <section>
        <h2>Prototype status</h2>
        <p>
          ScamShield is in development. During the prototype stage, reports for built-in examples are demonstrations and
          real content is not scored.
        </p>
      </section>
    </LegalLayout>
  );
}
