import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Responsible Gaming",
  description: "Practical guidance for safe, controlled and lawful use of gaming-related content.",
};

export default function ResponsibleGamingPage() {
  return (
    <LegalPage
      eyebrow="Play responsibly"
      title="Responsible Gaming"
      intro="Gaming-related entertainment should remain controlled, affordable and lawful. This page provides practical safeguards and support options for members."
    >
      <section>
        <h2>1. Check that participation is lawful</h2>
        <p className="mt-3">Only use gaming-related services if you meet the legal age and other requirements in your location. Third-party services may apply additional identity, location and account rules.</p>
      </section>

      <section>
        <h2>2. Keep control</h2>
        <ul className="mt-3">
          <li>Decide your time and spending limits before you start.</li>
          <li>Never use money needed for food, housing, bills, education or debt repayment.</li>
          <li>Do not borrow money to play or try to recover previous losses.</li>
          <li>Take regular breaks and avoid playing when upset, stressed or under the influence.</li>
          <li>Review your activity honestly and stop if it is no longer enjoyable.</li>
        </ul>
      </section>

      <section>
        <h2>3. Warning signs</h2>
        <p className="mt-3">Consider seeking help if gaming is causing secrecy, debt, missed work, relationship problems, repeated attempts to recover losses, or difficulty stopping. A problem can develop regardless of the amount spent.</p>
      </section>

      <section>
        <h2>4. Protect your access</h2>
        <p className="mt-3">Do not share your password or allow another person, including a minor, to use your account. Keep gaming-related apps and payment access away from children and vulnerable individuals.</p>
      </section>

      <section>
        <h2>5. Ask for a break or account restriction</h2>
        <p className="mt-3">Contact 7ERA Live Chat if you want the support team to review a temporary suspension or account-access restriction. For third-party services, use the responsible-gaming, limit or self-exclusion controls offered by that provider directly.</p>
      </section>

      <section>
        <h2>6. Get independent support</h2>
        <p className="mt-3">If gaming is affecting your wellbeing or finances, speak with a qualified health professional, financial counsellor or an appropriate support organisation in your country. If there is immediate danger or risk of self-harm, contact local emergency services now.</p>
      </section>
    </LegalPage>
  );
}
