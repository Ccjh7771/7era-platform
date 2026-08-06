import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { getWebsiteSettings } from "@/lib/data/get-website-settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How 7ERA Platform collects, uses, stores and protects member information.",
};

export default async function PrivacyPage() {
  const settings = await getWebsiteSettings();

  return (
    <LegalPage
      eyebrow="Privacy & data protection"
      title="Privacy Policy"
      intro="This notice explains how 7ERA Platform handles personal data when you browse the website, register a member account, use rewards and Lucky Spin, or contact our support team."
    >
      <section>
        <h2>1. Who this notice applies to</h2>
        <p className="mt-3">This notice applies to visitors, registered members and people who communicate with 7ERA Platform. It is intended to support transparent processing under Malaysia&apos;s Personal Data Protection Act 2010 (Act 709), as amended.</p>
      </section>

      <section>
        <h2>2. Information we may collect</h2>
        <ul className="mt-3">
          <li>Registration and profile details, including your full name, mobile number and account status.</li>
          <li>Optional account details supplied by you or an authorised administrator, such as bank, bank account and referral information.</li>
          <li>Authentication, session and security information needed to protect your account.</li>
          <li>Points, Daily Check-in, Lucky Spin, prize, claim and other member activity records.</li>
          <li>Live Chat messages, internal support records and photos you choose to upload.</li>
          <li>Technical information such as browser, device, IP address, timestamps, error and access logs.</li>
        </ul>
      </section>

      <section>
        <h2>3. Why we use personal data</h2>
        <ul className="mt-3">
          <li>To create, authenticate, maintain and secure member accounts.</li>
          <li>To provide points, rewards, campaigns, prize claims and member history.</li>
          <li>To answer questions and resolve issues through our own Live Chat support.</li>
          <li>To detect abuse, investigate incidents and enforce platform rules.</li>
          <li>To operate, maintain, analyse and improve the website.</li>
          <li>To meet lawful requests and applicable regulatory obligations.</li>
        </ul>
      </section>

      <section>
        <h2>4. Sources and disclosure</h2>
        <p className="mt-3">We receive information directly from you, from authorised administrators and automatically through your use of the platform. Access is limited to authorised staff and service providers that support hosting, databases, storage, security and website operations. We may also disclose information when required by law, a court or a competent authority.</p>
      </section>

      <section>
        <h2>5. Storage and international processing</h2>
        <p className="mt-3">Our technology providers may process or store data outside Malaysia. We use access controls and contractual or technical safeguards appropriate to the service. Data is kept only as long as reasonably needed for the purposes described above, dispute handling, security and legal obligations.</p>
      </section>

      <section>
        <h2>6. Security</h2>
        <p className="mt-3">We use authentication, role-based access, restricted file storage and other reasonable safeguards. No online service can guarantee absolute security. Never send passwords, one-time codes or unrelated account credentials through Live Chat.</p>
      </section>

      <section>
        <h2>7. Your choices and rights</h2>
        <p className="mt-3">Subject to applicable law, you may ask to access or correct your data, withdraw a consent where processing relies on consent, or request deletion or restriction. Some information may need to be retained for security, claims, disputes or legal obligations.</p>
      </section>

      <section>
        <h2>8. Cookies and analytics</h2>
        <p className="mt-3">The platform may use essential cookies for authentication and security, plus limited analytics or performance tools to understand website usage. Blocking essential cookies may prevent login and member features from working.</p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p className="mt-3">For a privacy request or question, contact us through member Live Chat or email <a href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>. We may need to verify your identity before acting on a request.</p>
      </section>
    </LegalPage>
  );
}
