"use client";
import { Bell, CheckCircle2, Heart, MessageCircle, Share2 } from "lucide-react";
import { PlatformIcon } from "@/components/platform-icon";
import { Platform } from "@/lib/data";

const NOTIFICATIONS = [
  { id: 1, platform: "instagram" as Platform, type: "likes", message: "Your post received 847 new likes", time: "2m ago", read: false },
  { id: 2, platform: "twitter" as Platform, type: "comments", message: "14 new comments on your announcement post", time: "18m ago", read: false },
  { id: 3, platform: "linkedin" as Platform, type: "shares", message: "Your article was shared 23 times", time: "1h ago", read: false },
  { id: 4, platform: "facebook" as Platform, type: "likes", message: "Your post is performing 3× above average", time: "3h ago", read: true },
  { id: 5, platform: "instagram" as Platform, type: "milestone", message: "You reached 38K followers on Instagram!", time: "5h ago", read: true },
  { id: 6, platform: "twitter" as Platform, type: "comments", message: "New reply from @techcrunch on your post", time: "1d ago", read: true },
];

const typeIcon: Record<string, React.ReactNode> = {
  likes: <Heart className="w-3.5 h-3.5 text-pink-400" />,
  comments: <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />,
  shares: <Share2 className="w-3.5 h-3.5 text-amber-400" />,
  milestone: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
};

export default function Notifications() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-white/40 text-sm mt-1">Stay on top of your engagement</p>
        </div>
        <button className="text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors">
          Mark all read
        </button>
      </div>

      <div className="space-y-2">
        {NOTIFICATIONS.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
              n.read
                ? "bg-white/[0.02] border-white/[0.05] opacity-60"
                : "bg-white/[0.04] border-white/[0.08]"
            }`}
          >
            <PlatformIcon platform={n.platform} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {typeIcon[n.type]}
                <p className="text-white/80 text-sm">{n.message}</p>
              </div>
              <p className="text-white/30 text-xs">{n.time}</p>
            </div>
            {!n.read && (
              <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0 mt-1.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
