"use client";
import { useEffect, useState } from "react";
import { PLATFORMS, Platform } from "@/lib/data";
import { PlatformIcon } from "@/components/platform-icon";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Plus,
  Unlink,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type ConnectionStatus = Record<string, { connected: boolean; username?: string }>;

const OAUTH_MAP: Partial<Record<Platform, string>> = {
  twitter:   "/api/auth/twitter/connect",
  facebook:  "/api/auth/meta/connect",
  instagram: "/api/auth/meta/connect",
  linkedin:  "/api/auth/linkedin/connect",
  tiktok:    "/api/auth/tiktok/connect",
  reddit:    "/api/auth/reddit/connect",
};

function StatusBanner() {
  const params = useSearchParams();
  const success = params.get("success");
  const error = params.get("error");

  const successMessages: Record<string, string> = {
    twitter: "Twitter/X connected successfully!",
    meta: "Facebook and Instagram connected!",
    linkedin: "LinkedIn connected successfully!",
    tiktok: "TikTok connected successfully!",
    reddit: "Reddit connected successfully!",
  };

  const errorMessages: Record<string, string> = {
    twitter_denied: "Twitter authorization was denied.",
    meta_denied: "Meta authorization was denied.",
    linkedin_denied: "LinkedIn authorization was denied.",
    tiktok_denied: "TikTok authorization was denied.",
    reddit_denied: "Reddit authorization was denied.",
    meta_no_pages: "No Facebook Pages found. Create a page first.",
    twitter_token_failed: "Twitter token exchange failed. Check your credentials.",
    meta_token_failed: "Meta token exchange failed. Check your credentials.",
    linkedin_token_failed: "LinkedIn token exchange failed. Check your credentials.",
    tiktok_token_failed: "TikTok token exchange failed. Check your credentials.",
    reddit_token_failed: "Reddit token exchange failed. Check your credentials.",
  };

  if (!success && !error) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium border",
        success
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"
      )}
    >
      {success ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {success
        ? (successMessages[success] ?? "Connected successfully!")
        : (errorMessages[error ?? ""] ?? `Error: ${error}`)}
    </div>
  );
}

export default function Accounts() {
  const [status, setStatus] = useState<ConnectionStatus>({});
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/status");
      setStatus(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  async function disconnect(platform: string) {
    setDisconnecting(platform);
    try {
      await fetch(`/api/auth/${platform}/disconnect`, { method: "POST" });
      await fetchStatus();
    } finally {
      setDisconnecting(null);
    }
  }

  const connected = PLATFORMS.filter((p) => status[p.id]?.connected);
  const disconnected = PLATFORMS.filter((p) => !status[p.id]?.connected && OAUTH_MAP[p.id]);
  const unsupported = PLATFORMS.filter((p) => !OAUTH_MAP[p.id]);

  const totalFollowers = connected.reduce((s, p) => s + p.followers, 0);

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Accounts</h1>
        <p className="text-white/40 text-sm mt-1">
          Connect your social media accounts via OAuth
        </p>
      </div>

      <Suspense>
        <StatusBanner />
      </Suspense>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-white/40 text-sm mb-1">Connected</p>
          <p className="text-white text-3xl font-bold">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            ) : (
              connected.length
            )}
          </p>
          <p className="text-white/30 text-xs mt-1">of {PLATFORMS.filter(p => OAUTH_MAP[p.id]).length} supported platforms</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-white/40 text-sm mb-1">Total Followers</p>
          <p className="text-white text-3xl font-bold">{formatNumber(totalFollowers)}</p>
          <p className="text-white/30 text-xs mt-1">across connected accounts</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-white/40 text-sm mb-1">Reach Potential</p>
          <p className="text-white text-3xl font-bold">
            {disconnected.length > 0 ? `+${disconnected.length}` : "Max"}
          </p>
          <p className="text-white/30 text-xs mt-1">
            {disconnected.length > 0 ? "more platforms available" : "all platforms active"}
          </p>
        </div>
      </div>

      {/* Connected */}
      {connected.length > 0 && (
        <div className="mb-8">
          <h3 className="text-white font-semibold text-base mb-4">Connected Accounts</h3>
          <div className="space-y-3">
            {connected.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors"
              >
                <PlatformIcon platform={platform.id as Platform} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-semibold">{platform.name}</p>
                    <span className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  </div>
                  <p className="text-white/40 text-sm">
                    {status[platform.id]?.username ?? platform.handle}
                  </p>
                </div>

                <button
                  onClick={() => disconnect(platform.id)}
                  disabled={disconnecting === platform.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                >
                  {disconnecting === platform.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlink className="w-4 h-4" />
                  )}
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available to Connect */}
      {disconnected.length > 0 && (
        <div className="mb-8">
          <h3 className="text-white font-semibold text-base mb-4">Available to Connect</h3>
          <div className="grid grid-cols-2 gap-3">
            {disconnected.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center gap-4 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] hover:bg-white/[0.04] transition-all group"
              >
                <PlatformIcon platform={platform.id as Platform} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 font-semibold">{platform.name}</p>
                  <p className="text-white/30 text-sm">{platform.handle}</p>
                </div>
                <a
                  href={OAUTH_MAP[platform.id as Platform]}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Plus className="w-4 h-4" /> Connect
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unsupported/coming soon */}
      {unsupported.length > 0 && (
        <div>
          <h3 className="text-white/40 font-semibold text-sm mb-3">Coming Soon</h3>
          <div className="grid grid-cols-2 gap-3">
            {unsupported.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center gap-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl p-5 opacity-40"
              >
                <PlatformIcon platform={platform.id as Platform} size="lg" />
                <div>
                  <p className="text-white/60 font-semibold">{platform.name}</p>
                  <p className="text-white/30 text-xs">API integration coming soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="mt-10 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-violet-400" />
          Setup Instructions
        </h3>
        <div className="space-y-2 text-sm text-white/50">
          <p>
            1. Copy <code className="text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded text-xs">.env.local.example</code> to{" "}
            <code className="text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded text-xs">.env.local</code> and fill in your API keys.
          </p>
          <p>2. <strong className="text-white/70">Twitter/X</strong> → developer.twitter.com → Create app → OAuth 2.0 → callback: <code className="text-white/40 text-xs">/api/auth/twitter/callback</code></p>
          <p>3. <strong className="text-white/70">Facebook + Instagram</strong> → developers.facebook.com → Create app → Facebook Login + Instagram → callback: <code className="text-white/40 text-xs">/api/auth/meta/callback</code></p>
          <p>4. <strong className="text-white/70">LinkedIn</strong> → linkedin.com/developers → Create app → &quot;Share on LinkedIn&quot; product → callback: <code className="text-white/40 text-xs">/api/auth/linkedin/callback</code></p>
          <p>5. <strong className="text-white/70">TikTok</strong> → developers.tiktok.com → Create app → Content Posting API → callback: <code className="text-white/40 text-xs">/api/auth/tiktok/callback</code></p>
          <p>6. <strong className="text-white/70">Reddit</strong> → reddit.com/prefs/apps → Create app (web app type) → callback: <code className="text-white/40 text-xs">/api/auth/reddit/callback</code></p>
          <p>7. Restart the dev server after updating <code className="text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded text-xs">.env.local</code></p>
        </div>
      </div>
    </div>
  );
}
