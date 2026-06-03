import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — SocialHub",
};

export default function TermsPage() {
  return (
    <article className="prose prose-invert prose-violet max-w-none">
      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-gray-400 text-sm mb-8">Effective date: June 3, 2026</p>

      <section className="mb-8">
        <p className="text-gray-300 leading-relaxed">
          These Terms of Service (&quot;Terms&quot;) govern your use of SocialHub, operated by Bonnellio
          (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), available at{" "}
          <a href="https://socialhub.bonnellio.com" className="text-violet-400 hover:text-violet-300">
            socialhub.bonnellio.com
          </a>
          . By creating an account or using the Service, you agree to these Terms.
        </p>
      </section>

      <Section title="1. The Service">
        <p className="text-gray-300 leading-relaxed">
          SocialHub is a social media management platform that allows you to connect your social media
          accounts (TikTok, YouTube, LinkedIn, Reddit, Twitter/X, Facebook, Instagram), compose content,
          publish posts, and schedule future posts — all from a single interface.
        </p>
      </Section>

      <Section title="2. Eligibility">
        <p className="text-gray-300">
          You must be at least 13 years old to use SocialHub. By using the Service you represent that
          you meet this requirement and that all information you provide is accurate.
        </p>
      </Section>

      <Section title="3. Your Account">
        <p className="text-gray-300">
          You are responsible for maintaining the security of your account and password. You are
          responsible for all activity that occurs under your account. Notify us immediately at{" "}
          <a href="mailto:support@bonnellio.com" className="text-violet-400 hover:text-violet-300">
            support@bonnellio.com
          </a>{" "}
          if you suspect unauthorized access.
        </p>
      </Section>

      <Section title="4. Connected Platforms">
        <p className="text-gray-300">
          SocialHub connects to third-party social media platforms via OAuth. By connecting a platform,
          you authorize us to act on your behalf — including reading basic profile information and
          publishing content you create within SocialHub. You may disconnect any platform at any time
          from your Accounts page.
        </p>
        <p className="text-gray-300 mt-3">
          You remain bound by the terms of service of each connected platform. We are not responsible
          for any action taken by those platforms, including account suspension or content removal.
        </p>
      </Section>

      <Section title="5. Acceptable Use">
        <p className="text-gray-300 mb-3">You agree not to use SocialHub to:</p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Post content that violates the terms of any connected social media platform.</li>
          <li>Publish spam, misleading information, or content that violates any applicable law.</li>
          <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts.</li>
          <li>Reverse-engineer, scrape, or otherwise misuse the Service.</li>
        </ul>
      </Section>

      <Section title="6. Content Ownership">
        <p className="text-gray-300">
          You retain ownership of all content you create and publish through SocialHub. By using the
          Service, you grant us a limited license to store and transmit your content solely to operate
          the Service. We do not claim ownership of your content.
        </p>
      </Section>

      <Section title="7. Billing and Subscriptions">
        <p className="text-gray-300">
          Paid plans are available for additional features. Billing is handled by Stripe. You may cancel
          your subscription at any time; access continues until the end of the current billing period.
          We reserve the right to change pricing with reasonable notice.
        </p>
      </Section>

      <Section title="8. Termination">
        <p className="text-gray-300">
          You may delete your account at any time. We reserve the right to suspend or terminate accounts
          that violate these Terms. Upon termination, your data will be deleted in accordance with our{" "}
          <a href="/privacy" className="text-violet-400 hover:text-violet-300">
            Privacy Policy
          </a>
          .
        </p>
      </Section>

      <Section title="9. Disclaimer of Warranties">
        <p className="text-gray-300">
          The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
          that the Service will be uninterrupted, error-free, or that posts will be published
          successfully to all connected platforms at all times.
        </p>
      </Section>

      <Section title="10. Limitation of Liability">
        <p className="text-gray-300">
          To the maximum extent permitted by law, Bonnellio shall not be liable for any indirect,
          incidental, special, or consequential damages arising from your use of the Service, including
          loss of data or failed posts to third-party platforms.
        </p>
      </Section>

      <Section title="11. Changes to These Terms">
        <p className="text-gray-300">
          We may update these Terms from time to time. Continued use of the Service after changes
          constitutes acceptance of the updated Terms. We will notify you of material changes via email
          or an in-app notice.
        </p>
      </Section>

      <Section title="12. Contact">
        <p className="text-gray-300">
          Questions about these Terms? Contact us at{" "}
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
