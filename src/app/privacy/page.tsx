// src/app/privacy/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Styla',
  description: 'How Styla handles image consultant accounts, client session data, and security.',
};

export default function PrivacyPolicy() {
  return (
    <main className="prose mx-auto px-4 py-8">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last updated:</strong> 4 May 2026
      </p>

      <h2>1. Who we are</h2>
      <p>
        Styla provides style-analysis tooling for professional image consultants serving end clients. This policy
        explains how we differentiate data about <strong>consultant accounts</strong> from data about{' '}
        <strong>clients</strong>.
      </p>

      <h2>2. What data we collect</h2>
      <ul>
        <li>
          <strong>Consultant account data</strong> — email, password hash (via Supabase/Firebase authentication), and
          consultant profile fields such as consultant name.
        </li>
        <li>
          <strong>Client session data</strong> — proportional measurements, line/scale answers, and inferred body shape
          selections that you record while preparing a report for a named client.
        </li>
        <li>IP address & basic browser telemetry for security and diagnostics.</li>
        <li>Billing references (e.g., PayPal confirmations) tied to your consultant workspace.</li>
        <li>Cookie preferences for the marketing site.</li>
      </ul>

      <h2>3. How we use consultant vs client data</h2>
      <ul>
        <li>
          Consultant data keeps your professional account secure, enables billing, and stores consent logs attributable
          to your firm.
        </li>
        <li>
          Client questionnaire data is transformed into warm, client-facing recommendations you may deliver after a
          session. You remain the data controller for your clients; Styla processes that information on your documented
          instructions.
        </li>
        <li>
          We analyse aggregated, de-identified questionnaire patterns to improve Styla’s modelling—never to market
          directly to your clients without separate consent.
        </li>
      </ul>

      <h2>4. Legal bases</h2>
      <ul>
        <li>Contractual necessity for consultant subscriptions and service delivery.</li>
        <li>Legitimate interests in securing the platform, preventing abuse, and improving accuracy.</li>
        <li>
          Client-specific processing generally flows from the agreements you hold with your clientele; contact us if you
          require a data processing addendum.
        </li>
      </ul>

      <h2>5. Retention</h2>
      <p>
        Consultant credentials persist for the life of the account. Client questionnaire drafts or generated reports may
        reside in device storage (mobile) or consultant-controlled browser storage (web sandbox) until you clear them or
        uninstall. Server-side copies follow the retention window stated in your consultancy agreement with Styla—ask
        support for exports or deletion.
      </p>

      <h2>6. Cookies</h2>
      <p>Marketing pages use cookies for analytics and preferences. Authenticated mobile sessions rely on OS-level secure stores.</p>

      <h2>7. Your rights</h2>
      <ul>
        <li>Consultants may access, rectify, export, or delete their workspace data subject to lawful billing holds.</li>
        <li>End clients exercise privacy rights primarily through their image consultant; Styla will assist consultants with verifiable deletion requests.</li>
        <li>You may escalate concerns to the UK ICO.</li>
      </ul>

      <p>
        Email <a href="mailto:support@styla.me">support@styla.me</a> for privacy enquiries.
      </p>

      <h2>8. Storage locations & subprocessors</h2>
      <p>
        Operational data may be processed in the United Kingdom/European Union regions supported by Firebase, Supabase,
        PayPal, and email delivery vendors. Review their DPAs alongside this policy when onboarding enterprise clients.
      </p>

      <h2>9. Updates</h2>
      <p>Material revisions will update this page and the “Last updated” stamp above.</p>
    </main>
  );
}
