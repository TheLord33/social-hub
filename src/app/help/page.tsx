"use client";
import { useState } from "react";
import {
  HelpCircle,
  Users,
  PenSquare,
  CalendarClock,
  BarChart3,
  Settings,
  ChevronDown,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string | React.ReactNode;
}

function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="text-white/80 text-sm font-medium">{item.q}</span>
            <ChevronDown
              size={16}
              className={cn("text-white/30 shrink-0 transition-transform", open === i && "rotate-180")}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-white/50 text-sm leading-relaxed">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

const sections = [
  {
    icon: Users,
    title: "Connecting Accounts",
    content: (
      <div className="space-y-4 text-white/50 text-sm leading-relaxed">
        <p>
          Go to <strong className="text-white/70">Accounts</strong> in the sidebar and click{" "}
          <strong className="text-white/70">Connect</strong> next to any platform. You will be taken to
          that platform's login page to authorize SocialHub.
        </p>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex gap-3">
          <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-200/70">
            Each platform requires a developer app to be registered with your callback URL. See the
            README for setup instructions for each platform.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          {[
            { name: "Twitter / X", scope: "Post, read timeline" },
            { name: "LinkedIn",    scope: "Post to profile & pages" },
            { name: "Facebook",    scope: "Post to pages you manage" },
            { name: "Instagram",   scope: "Media posts via Facebook" },
            { name: "YouTube",     scope: "Upload videos" },
            { name: "TikTok",      scope: "Upload videos" },
            { name: "Reddit",      scope: "Submit to subreddits" },
          ].map(({ name, scope }) => (
            <div key={name} className="bg-white/[0.03] rounded-xl px-3 py-2.5">
              <p className="text-white/70 text-xs font-semibold">{name}</p>
              <p className="text-white/30 text-xs mt-0.5">{scope}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: PenSquare,
    title: "Creating Posts",
    content: (
      <div className="space-y-4 text-white/50 text-sm leading-relaxed">
        <p>
          Open <strong className="text-white/70">Compose</strong> from the sidebar. Select the
          platforms you want to post to, write your content, attach media, then click{" "}
          <strong className="text-white/70">Publish</strong> or{" "}
          <strong className="text-white/70">Schedule</strong>.
        </p>
        <div className="space-y-2">
          <p className="text-white/60 font-medium">Platform character limits</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { p: "Twitter",   n: "280 characters" },
              { p: "LinkedIn",  n: "3,000 characters" },
              { p: "Facebook",  n: "63,206 characters" },
              { p: "Instagram", n: "2,200 characters" },
              { p: "Reddit",    n: "40,000 characters" },
              { p: "TikTok",    n: "2,200 characters" },
            ].map(({ p, n }) => (
              <div key={p} className="flex justify-between bg-white/[0.03] rounded-lg px-3 py-2">
                <span className="text-white/50">{p}</span>
                <span className="text-white/30">{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-xl px-4 py-3 space-y-1.5">
          <p className="text-white/60 font-medium text-xs">Media support</p>
          <p className="text-xs">Images: JPG, PNG, GIF (all platforms)</p>
          <p className="text-xs">Video: MP4 — YouTube, TikTok, Facebook, Instagram</p>
          <p className="text-xs flex items-center gap-1.5">
            <AlertCircle size={12} className="text-amber-400 shrink-0" />
            <span className="text-amber-200/60">
              On localhost only YouTube can receive media. Use a public domain for all platforms.
            </span>
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: CalendarClock,
    title: "Scheduling Posts",
    content: (
      <div className="space-y-4 text-white/50 text-sm leading-relaxed">
        <p>
          In Compose, click the arrow next to <strong className="text-white/70">Publish</strong> and
          choose <strong className="text-white/70">Schedule</strong>. Pick a future date and time, then
          confirm.
        </p>
        <p>
          Scheduled posts appear on the <strong className="text-white/70">Scheduled</strong> page. The
          app checks every minute and publishes posts when their time arrives — the app must be running
          for this to work.
        </p>
        <div className="bg-white/[0.03] rounded-xl px-4 py-3">
          <p className="text-white/60 text-xs font-medium mb-1">Cancelling a scheduled post</p>
          <p className="text-xs">Open the Scheduled page and click the trash icon next to the post.</p>
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Analytics",
    content: (
      <div className="space-y-3 text-white/50 text-sm leading-relaxed">
        <p>
          The <strong className="text-white/70">Analytics</strong> page shows engagement across all
          connected accounts — likes, comments, shares, reach, and follower growth.
        </p>
        <p>
          Data is fetched from each platform's API on page load. Some platforms have rate limits that
          may delay data refresh.
        </p>
        <div className="bg-white/[0.03] rounded-xl px-4 py-3 text-xs space-y-1">
          <p className="text-white/60 font-medium">Available metrics by platform</p>
          <p>Twitter — impressions, likes, retweets, profile visits</p>
          <p>LinkedIn — impressions, clicks, reactions, comments</p>
          <p>YouTube — views, watch time, subscribers gained</p>
          <p>Facebook / Instagram — reach, engagement, reactions</p>
        </div>
      </div>
    ),
  },
  {
    icon: Settings,
    title: "Settings & Account",
    content: (
      <div className="space-y-4 text-white/50 text-sm leading-relaxed">
        <div className="space-y-2">
          <p className="text-white/60 font-medium text-xs">Password</p>
          <p>
            Use the <strong className="text-white/70">Forgot password?</strong> link on the login page
            to receive a reset email. The link expires in 1 hour.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-white/60 font-medium text-xs">Billing / Plan</p>
          <p>
            Open <strong className="text-white/70">Settings → Billing</strong> to view your current
            plan and upgrade to Pro if Stripe is configured by your administrator.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-white/60 font-medium text-xs">Sign out</p>
          <p>Click the arrow icon next to your name at the bottom of the sidebar.</p>
        </div>
      </div>
    ),
  },
];

const faqItems: FaqItem[] = [
  {
    q: "A post says it published but I don't see it on the platform",
    a: "Some platforms have a short delay before posts appear publicly. If it doesn't appear within 5 minutes, check that your OAuth token is still valid by disconnecting and reconnecting the account.",
  },
  {
    q: "My OAuth token expired — posts stopped going through",
    a: "LinkedIn and TikTok tokens expire every 60 days. Go to Accounts, disconnect the platform, and reconnect to get a fresh token. SocialHub will automatically refresh tokens where the platform allows it.",
  },
  {
    q: "I didn't receive a password reset email",
    a: (
      <>
        If your administrator hasn&apos;t configured a Resend API key, the reset link is printed to the
        server logs instead of emailed. Ask your administrator to run{" "}
        <code className="bg-white/5 px-1.5 py-0.5 rounded text-violet-300 text-xs">
          docker compose logs app
        </code>{" "}
        and look for a line starting with &quot;[SocialHub] Reset URL:&quot;.
      </>
    ),
  },
  {
    q: "Can I post to multiple platforms at once?",
    a: "Yes — in Compose, select as many platforms as you want before clicking Publish or Schedule. Each platform gets the same content; you can customise per-platform in a future update.",
  },
  {
    q: "How do I back up my data?",
    a: (
      <>
        Ask your administrator to back up the Docker volumes — specifically{" "}
        <code className="bg-white/5 px-1.5 py-0.5 rounded text-violet-300 text-xs">redis_data</code>{" "}
        (accounts, tokens, posts) and{" "}
        <code className="bg-white/5 px-1.5 py-0.5 rounded text-violet-300 text-xs">app_data</code>{" "}
        (uploaded media). The README has full backup instructions.
      </>
    ),
  },
  {
    q: "Is there a mobile app?",
    a: "SocialHub is a Progressive Web App (PWA). On iOS, open it in Safari and tap Share → Add to Home Screen. On Android, tap the browser menu → Install app.",
  },
];

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<number | null>(null);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <HelpCircle size={18} className="text-violet-400" />
          </div>
          <h1 className="text-white text-xl font-bold">Help &amp; Support</h1>
        </div>
        <p className="text-white/40 text-sm">Guides for using SocialHub</p>
      </div>

      {/* Feature guides */}
      <div className="space-y-3 mb-10">
        {sections.map(({ icon: Icon, title, content }, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setActiveSection(activeSection === i ? null : i)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition"
            >
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-violet-400" />
              </div>
              <span className="text-white/80 font-medium text-sm">{title}</span>
              <ChevronDown
                size={16}
                className={cn(
                  "text-white/30 ml-auto shrink-0 transition-transform",
                  activeSection === i && "rotate-180"
                )}
              />
            </button>
            {activeSection === i && (
              <div className="px-5 pb-5 border-t border-white/[0.04]">
                <div className="pt-4">{content}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mb-10">
        <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">
          Frequently Asked Questions
        </h2>
        <Faq items={faqItems} />
      </div>

      {/* Footer links */}
      <div className="flex flex-wrap gap-3">
        <a
          href="https://github.com/TheLord33/social-hub/blob/docker/README.md"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/30 hover:text-violet-400 text-xs transition"
        >
          <ExternalLink size={13} />
          Installation README
        </a>
        <span className="text-white/10">·</span>
        <a
          href="https://github.com/TheLord33/social-hub/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/30 hover:text-violet-400 text-xs transition"
        >
          <ExternalLink size={13} />
          Report an issue
        </a>
      </div>
    </div>
  );
}
