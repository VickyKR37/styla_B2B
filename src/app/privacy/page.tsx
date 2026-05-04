// src/app/privacy/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Styla',
  description: 'How we collect, use and protect your personal data.',
};

export default function PrivacyPolicy() {
  return (
    <main className="prose mx-auto px-4 py-8">
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> 12 July 2025</p>

      <h2>1. Who we are</h2>
      <p>Styla is an online style‑analysis tool based in the United Kingdom.</p>

      <h2>2. What data we collect</h2>
      <ul>
        <li>Style‑questionnaire answers (e.g., body shape & proportions)</li>
        <li>IP address & basic browser info (analytics & security)</li>
        <li>Email address (if you join the beta or sign up for updates)</li>
        <li>Cookie preferences</li>
      </ul>

      <h2>3. How we use your data</h2>
      <ul>
        <li>Generate your personalised style advice report</li>
        <li>Improve the service and user experience</li>
        <li>Send occasional updates (only if you opt in)</li>
      </ul>

      <h2>4. Legal basis</h2>
      <ul>
        <li>Your consent</li>
        <li>Our legitimate interest in improving & protecting the service</li>
      </ul>

      <h2>5. Data retention</h2>
      <p>We keep questionnaire responses only as long as needed to test and improve the tool. You may request deletion at any time.</p>

      <h2>6. Cookies</h2>
      <p>We use cookies for preferences and basic analytics. Manage them via the cookie banner or your browser.</p>

      <h2>7. Your rights</h2>
      <ul>
        <li>Access, correct or delete your data</li>
        <li>Withdraw consent at any time</li>
        <li>Lodge a complaint with the ICO</li>
      </ul>

      <p>Email requests to <a href="mailto:contact@perfectlystyled.co.uk">contact@perfectlystyled.co.uk</a>.</p>

      <h2>8. Security & third parties</h2>
      <p>Data is stored securely on Firebase (UK/EU‑compliant). We never sell your data.</p>

      <h2>9. Changes</h2>
      <p>Any future updates will be posted on this page and dated.</p>
    </main>
  );
}
