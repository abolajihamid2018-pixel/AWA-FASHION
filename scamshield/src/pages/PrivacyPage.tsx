import { LegalLayout } from './LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy policy" updated="21 November 2026">
      <section>
        <h2>The short version</h2>
        <p>
          ScamShield is designed to collect as little as possible. We do not want your passwords, OTPs, PINs or bank
          details, and we ask you to remove them before pasting anything.
        </p>
      </section>
      <section>
        <h2>What happens today (prototype)</h2>
        <ul>
          <li>Nothing you paste is sent to a server. The prototype runs entirely in your browser.</li>
          <li>Content you submit is shown on the result screen only and is not saved.</li>
          <li>
            History is saved in your browser's local storage on this device. It holds report summaries for built-in
            examples only. You can delete entries or clear it at any time on the History page.
          </li>
          <li>There are no accounts, no tracking cookies and no analytics.</li>
        </ul>
      </section>
      <section>
        <h2>What will change as features are added</h2>
        <ul>
          <li>
            To analyse content, it will be sent securely to ScamShield's server. Links may be checked with external
            threat-intelligence services, and text may be sent to an AI provider to help explain findings. This page
            will name each service before it is used.
          </li>
          <li>
            If you create an account, your saved history will be stored in our database and protected so only you can
            read it. By default we will store the report, not the full text you pasted.
          </li>
          <li>You will be able to delete your history and your account.</li>
        </ul>
      </section>
      <section>
        <h2>Contact</h2>
        <p>A contact address for privacy requests will be published before public launch.</p>
      </section>
    </LegalLayout>
  );
}
