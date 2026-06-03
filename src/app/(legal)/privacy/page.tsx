import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SocialHub",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert prose-violet max-w-none">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Effective date: June 3, 2026</p>

      <section className="mb-8">
        <p className="text-gray-300 leading-relaxed">
          SocialHub (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website{" "}
          <a href="https://socialhub.bonnellio.com" className="text-violet-400 hover:text-violet-300">
            socialhub.bonnellio.com
          </a>{" "}
          (the &quot;Service&quot;). This Privacy Policy explains how we collect, use, and protect your
          information when you use SocialHub to manage and publish content across social media platforms.
        </p>
      </section>

      <Section title="1. What We Collect">
        <SubSection title="Account Information">
          When you register, we collect your name, email address, and a hashed password. We use this to
          authenticate you and associate your data with your account.
        </SubSection>
        <SubSection title="Connected Platform Tokens">
          When you connect a third-party platform (TikTok, YouTube, LinkedIn, Reddit, Twitter/X,
          Facebook, Instagram), we store the OAuth access tokens and refresh tokens provided by those
          platforms. These tokens are stored securely and are used solely to perform actions on your
          behalf — such as publishing posts or retrieving basic profile information.
        </SubSection>
        <SubSection title="Content You Create">
          We store the text, images, and videos you compose and schedule through SocialHub. This content
          is retained until you delete it or close your account.
        </SubSection>
        <SubSection title="Usage Data">
          We collect basic usage information (pages visited, features used) to improve the Service. We
          do not sell this data.
        </SubSection>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>To authenticate you and provide access to the Service.</li>
          <li>To publish or schedule content to your connected social media accounts.</li>
          <li>To display your connected account names and profile information within the app.</li>
          <li>To send transactional emails (password resets, billing confirmations).</li>
          <li>To improve and maintain the Service.</li>
        </ul>
        <p className="text-gray-300 mt-4">
          We do not use your content or platform data for advertising, profiling, or any purpose beyond
          operating the Service for you.
        </p>
      </Section>

      <Section title="3. TikTok Data">
        <p className="text-gray-300 mb-3">
          When you connect your TikTok account, SocialHub requests the following permissions:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>
            <strong className="text-white">user.info.basic</strong> — Used to retrieve your TikTok display
            name and user ID so we can show which account is connected.
          </li>
          <li>
            <strong className="text-white">video.upload</strong> — Used to upload video files to TikTok on
            your behalf when you publish or schedule a post.
          </li>
          <li>
            <strong className="text-white">video.publish</strong> — Used to publish uploaded videos to your
            TikTok profile when you choose to post through SocialHub.
          </li>
        </ul>
        <p className="text-gray-300 mt-4">
          TikTok data obtained through these permissions is used exclusively to provide the posting
          feature. We do not share, sell, or use TikTok user data for any other purpose. You can
          disconnect your TikTok account at any time from the Accounts page.
        </p>
      </Section>

      <Section title="4. Data Sharing">
        <p className="text-gray-300">
          We do not sell, rent, or share your personal information with third parties except in the
          following limited circumstances:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mt-3">
          <li>
            <strong className="text-white">Service providers:</strong> We use Stripe for payment processing.
            Stripe&apos;s privacy policy governs their handling of your payment data.
          </li>
          <li>
            <strong className="text-white">Legal requirements:</strong> We may disclose information if required
            by law or to protect our rights.
          </li>
        </ul>
      </Section>

      <Section title="5. Data Retention">
        <p className="text-gray-300">
          We retain your account data and content for as long as your account is active. OAuth tokens
          are refreshed automatically and removed when you disconnect a platform or close your account.
          You may request deletion of your account and all associated data by contacting us.
        </p>
      </Section>

      <Section title="6. Security">
        <p className="text-gray-300">
          OAuth tokens are stored encrypted. Passwords are hashed using industry-standard algorithms. We
          use HTTPS for all data in transit. No method of transmission or storage is 100% secure, and we
          cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p className="text-gray-300">You have the right to:</p>
        <ul className="list-disc list-inside text-gray-300 space-y-2 mt-3">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your account and data.</li>
          <li>Disconnect any connected social media platform at any time.</li>
        </ul>
        <p className="text-gray-300 mt-4">
          To exercise these rights, contact us at{" "}
          <a href="mailto:support@bonnellio.com" className="text-violet-400 hover:text-violet-300">
            support@bonnellio.com
          </a>
          .
        </p>
      </Section>

      <Section title="8. Children's Privacy">
        <p className="text-gray-300">
          SocialHub is not directed at children under 13. We do not knowingly collect personal
          information from children under 13. If you believe a child has provided us with personal
          information, please contact us and we will delete it.
        </p>
      </Section>

      <Section title="9. Changes to This Policy">
        <p className="text-gray-300">
          We may update this Privacy Policy from time to time. We will notify you of significant changes
          by posting the new policy on this page with an updated effective date.
        </p>
      </Section>

      <Section title="10. Contact">
        <p className="text-gray-300">
          Questions about this Privacy Policy? Contact us at{" "}
          <a href="mailto:support@bonnellio.com" className="text-violet-400 hover:text-violet-300">
            support@bonnellio.com
          </a>
          .
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-medium text-gray-200 mb-1">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{children}</p>
    </div>
  );
}
