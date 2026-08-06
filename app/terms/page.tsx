import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { getWebsiteSettings } from "@/lib/data/get-website-settings";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Rules for using 7ERA Platform member accounts, rewards, Lucky Spin and support services.",
};

export default async function TermsPage() {
  const settings = await getWebsiteSettings();

  return (
    <LegalPage
      eyebrow="Platform rules"
      title="Terms & Conditions"
      intro="These terms govern access to the 7ERA Platform website, member accounts, points, promotional rewards, Lucky Spin and Live Chat support."
    >
      <section>
        <h2>1. Acceptance and lawful use</h2>
        <p className="mt-3">By registering or using the platform, you agree to these terms. You must be legally permitted to use the platform and any linked content in your location. Do not use the platform where access is restricted or unlawful.</p>
      </section>

      <section>
        <h2>2. Member accounts</h2>
        <ul className="mt-3">
          <li>Register using your own full name and mobile number.</li>
          <li>Provide accurate information and promptly correct information that changes.</li>
          <li>Keep your password private and contact support if you suspect unauthorised access.</li>
          <li>One person must not operate multiple accounts to obtain extra rewards or spins.</li>
        </ul>
      </section>

      <section>
        <h2>3. Points, Daily Check-in and Lucky Spin</h2>
        <p className="mt-3">Points are promotional platform units and have no cash value unless a specific published offer expressly states otherwise. Campaign cost, limits, availability, prize weighting and active dates are controlled by the platform&apos;s published settings. A displayed prize is not confirmed until the result and claim are recorded by the platform.</p>
      </section>

      <section>
        <h2>4. Prize claims</h2>
        <p className="mt-3">Eligible prizes appear in Member History with a claim code. Claims are handled through 7ERA Live Chat and may require reasonable account or identity verification. A claim remains pending until marked fulfilled by an authorised administrator. Fraudulent, duplicated or technically invalid claims may be cancelled after review.</p>
      </section>

      <section>
        <h2>5. Prohibited conduct</h2>
        <ul className="mt-3">
          <li>Providing false identity, referral or claim information.</li>
          <li>Using bots, scripts, exploits or manipulation to obtain points, spins or prizes.</li>
          <li>Attempting to access another member&apos;s account, data or messages.</li>
          <li>Uploading unlawful, harmful, abusive or rights-infringing content.</li>
          <li>Interfering with platform security, availability or administration.</li>
        </ul>
      </section>

      <section>
        <h2>6. Third-party content</h2>
        <p className="mt-3">The website may display brands, games, downloads or links operated by third parties. Their products, rules, privacy practices and availability are controlled by them. Review the third party&apos;s terms before using its service.</p>
      </section>

      <section>
        <h2>7. Availability and changes</h2>
        <p className="mt-3">We may maintain, modify, suspend or discontinue platform features, campaigns or content. We may correct technical, display or configuration errors and investigate affected transactions. Material changes to these terms will be published on this page.</p>
      </section>

      <section>
        <h2>8. Suspension and termination</h2>
        <p className="mt-3">Access may be suspended or terminated for security concerns, prohibited conduct, legal requirements or serious breaches of these terms. You may contact support to request account assistance or closure, subject to necessary record retention.</p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p className="mt-3">Questions about these terms can be sent through member Live Chat or to <a href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>.</p>
      </section>
    </LegalPage>
  );
}
