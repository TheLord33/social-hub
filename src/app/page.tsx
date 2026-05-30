import Link from "next/link";
import { Zap, Globe, BarChart3, CalendarClock, PenSquare, CheckCircle2 } from "lucide-react";

const platforms = [
  { name: "Twitter / X",   color: "from-sky-500 to-blue-600",     letter: "X" },
  { name: "Instagram",     color: "from-pink-500 to-rose-600",    letter: "IG" },
  { name: "Facebook",      color: "from-blue-500 to-indigo-600",  letter: "FB" },
  { name: "LinkedIn",      color: "from-cyan-500 to-blue-700",    letter: "LI" },
  { name: "TikTok",        color: "from-slate-600 to-slate-800",  letter: "TT" },
  { name: "YouTube",       color: "from-red-500 to-red-700",      letter: "YT" },
  { name: "Reddit",        color: "from-orange-500 to-red-600",   letter: "RD" },
];

const features = [
  {
    icon: PenSquare,
    title: "Compose Once, Post Everywhere",
    description: "Write your content once and publish simultaneously to all connected social media accounts.",
  },
  {
    icon: CalendarClock,
    title: "Smart Scheduling",
    description: "Schedule posts in advance. SocialHub publishes automatically at the right time.",
  },
  {
    icon: BarChart3,
    title: "Unified Analytics",
    description: "Track performance across every platform in a single dashboard with real-time insights.",
  },
  {
    icon: Globe,
    title: "Multi-Platform Support",
    description: "Connect Twitter, Instagram, Facebook, LinkedIn, TikTok, YouTube, and Reddit from one place.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Verification token for TikTok URL prefix verification */}
      <span
        id="tiktok-site-verification"
        style={{ display: "none" }}
        aria-hidden="true"
      >
        tiktok-developers-site-verification=DRrcz63CHYhAHPnKMCzaC4YzFd1LROEC
      </span>

      {/* Hero */}
      <section className="px-8 pt-24 pb-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8">
          <Zap className="w-3.5 h-3.5" />
          Social Media Management, Simplified
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent leading-tight">
          Post Everywhere.<br />Track Everything.
        </h1>

        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          SocialHub connects all your social media accounts in one place. Compose, schedule,
          and analyze your content across Twitter, Instagram, Facebook, LinkedIn, TikTok, YouTube, and Reddit.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/compose"
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-150"
          >
            Compose a Post
          </Link>
        </div>
      </section>

      {/* Platforms */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <p className="text-center text-white/30 text-sm uppercase tracking-widest font-medium mb-10">
          Supported Platforms
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
          {platforms.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-2">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs font-bold shadow-lg`}
              >
                {p.letter}
              </div>
              <span className="text-white/40 text-xs text-center">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12 text-white/90">
          Everything you need to manage social media
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 text-center max-w-2xl mx-auto">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/10">
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-white/40 mb-8 text-sm">
            Connect your accounts and start publishing in minutes.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/accounts"
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-violet-500/20 text-sm"
            >
              Connect Accounts
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-6 py-2.5 text-white/50 hover:text-white text-sm font-medium transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              View Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
