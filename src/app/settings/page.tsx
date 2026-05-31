"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bell, Shield, Palette, Globe, ChevronRight, CreditCard, Zap, CheckCircle2, Loader2 } from "lucide-react";

const SECTIONS = [
  {
    icon: Bell,
    title: "Notifications",
    description: "Choose when and how you receive alerts",
    settings: [
      { label: "Email digests", description: "Daily summary of your post performance", enabled: true },
      { label: "Engagement alerts", description: "Notify when a post gets unusual activity", enabled: true },
      { label: "Scheduled post reminders", description: "15-minute reminder before publishing", enabled: false },
    ],
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Customize how SocialHub looks",
    settings: [
      { label: "Dark mode", description: "Always use dark interface", enabled: true },
      { label: "Compact view", description: "Show more content on screen", enabled: false },
    ],
  },
  {
    icon: Globe,
    title: "Publishing",
    description: "Default publishing preferences",
    settings: [
      { label: "Auto-shorten links", description: "Shorten URLs in your posts", enabled: true },
      { label: "Include watermark", description: "Add SocialHub branding to images", enabled: false },
    ],
  },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-10 h-5.5 rounded-full transition-all duration-200",
        enabled ? "bg-violet-500" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200",
          enabled ? "translate-x-4.5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function BillingSection() {
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "1";
  const [user, setUser] = useState<{ plan: string; hasStripe: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    const res = await fetch("/api/me");
    if (res.ok) setUser(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleUpgrade = async () => {
    setActionLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setActionLoading(false);
  };

  const handleManage = async () => {
    setActionLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setActionLoading(false);
  };

  const isPro = user?.plan === "pro";

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <CreditCard className="w-4.5 h-4.5 text-violet-400" size={18} />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Billing</p>
          <p className="text-white/30 text-xs">Manage your subscription</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {upgraded && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-emerald-300 text-sm">Payment successful — you&apos;re on Pro!</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Current plan</p>
                <p className="text-white/30 text-xs mt-0.5">
                  {isPro ? "All features unlocked" : "Limited to 2 platforms, no scheduling"}
                </p>
              </div>
              <span className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full",
                isPro
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-white/5 text-white/40 border border-white/10"
              )}>
                {isPro ? "Pro" : "Free"}
              </span>
            </div>

            {!isPro && (
              <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4 space-y-3">
                <p className="text-white font-medium text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" /> Upgrade to Pro
                </p>
                <ul className="space-y-1.5 text-xs text-white/50">
                  {["All social platforms", "Unlimited scheduled posts", "Analytics & insights", "Priority support"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleUpgrade}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Upgrade — $29 / month
                </button>
              </div>
            )}

            {isPro && user?.hasStripe && (
              <button
                onClick={handleManage}
                disabled={actionLoading}
                className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                Manage billing & invoices
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(
    SECTIONS.map((s) => ({
      ...s,
      settings: s.settings.map((setting) => ({ ...setting })),
    }))
  );

  const toggle = (si: number, ti: number) => {
    setSettings((prev) =>
      prev.map((section, i) =>
        i !== si
          ? section
          : {
              ...section,
              settings: section.settings.map((setting, j) =>
                j !== ti ? setting : { ...setting, enabled: !setting.enabled }
              ),
            }
      )
    );
  };

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">
          Manage your SocialHub preferences
        </p>
      </div>

      <div className="space-y-6">
        <BillingSection />

        {settings.map((section, si) => (
          <div
            key={section.title}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <section.icon className="w-4.5 h-4.5 text-violet-400" size={18} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{section.title}</p>
                <p className="text-white/30 text-xs">{section.description}</p>
              </div>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {section.settings.map((setting, ti) => (
                <div
                  key={setting.label}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-white/80 text-sm font-medium">
                      {setting.label}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {setting.description}
                    </p>
                  </div>
                  <Toggle
                    enabled={setting.enabled}
                    onToggle={() => toggle(si, ti)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-red-500/10">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-red-400" size={18} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Danger Zone</p>
              <p className="text-white/30 text-xs">Irreversible actions</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Delete all posts</p>
              <p className="text-white/30 text-xs mt-0.5">Remove all post history from SocialHub</p>
            </div>
            <button className="flex items-center gap-1.5 text-red-400 text-sm font-medium hover:text-red-300 transition-colors">
              Delete <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
