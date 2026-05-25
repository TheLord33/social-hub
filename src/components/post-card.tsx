"use client";
import { Post, PLATFORMS } from "@/lib/data";
import { PlatformIcon } from "./platform-icon";
import { formatDate, formatNumber } from "@/lib/utils";
import { Eye, Heart, MessageCircle, Share2, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const totalViews = post.platforms.reduce(
    (sum, p) => sum + post.metrics[p].views,
    0
  );
  const totalLikes = post.platforms.reduce(
    (sum, p) => sum + post.metrics[p].likes,
    0
  );
  const totalComments = post.platforms.reduce(
    (sum, p) => sum + post.metrics[p].comments,
    0
  );
  const totalShares = post.platforms.reduce(
    (sum, p) => sum + post.metrics[p].shares,
    0
  );

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-200 hover:border-white/[0.12]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {post.platforms.map((p) => (
            <PlatformIcon key={p} platform={p} size="sm" />
          ))}
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
            post.status === "published"
              ? "text-emerald-400 bg-emerald-400/10"
              : post.status === "scheduled"
              ? "text-amber-400 bg-amber-400/10"
              : "text-white/40 bg-white/5"
          )}
        >
          {post.status === "published" ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {post.status === "published"
            ? formatDate(post.publishedAt)
            : post.status === "scheduled"
            ? `Scheduled ${post.scheduledFor ? formatDate(post.scheduledFor) : ""}`
            : "Draft"}
        </div>
      </div>

      {/* Content */}
      <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-4">
        {post.content}
      </p>

      {/* Metrics */}
      {post.status === "published" && (
        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-white/5">
          {[
            { icon: Eye, value: totalViews, label: "Views" },
            { icon: Heart, value: totalLikes, label: "Likes" },
            { icon: MessageCircle, value: totalComments, label: "Comments" },
            { icon: Share2, value: totalShares, label: "Shares" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1 text-white/40 mb-0.5">
                <Icon className="w-3 h-3" />
              </div>
              <p className="text-white font-semibold text-sm">{formatNumber(value)}</p>
              <p className="text-white/30 text-xs">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Per-platform breakdown for published posts */}
      {post.status === "published" && post.platforms.length > 1 && (
        <div className="mt-3 space-y-1.5">
          {post.platforms.map((p) => {
            const config = PLATFORMS.find((pl) => pl.id === p)!;
            const m = post.metrics[p];
            const maxViews = Math.max(
              ...post.platforms.map((pl) => post.metrics[pl].views),
              1
            );
            const pct = Math.round((m.views / maxViews) * 100);
            return (
              <div key={p} className="flex items-center gap-3">
                <PlatformIcon platform={p} size="sm" />
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r",
                        config.gradient
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-white/40 text-xs w-12 text-right">
                  {formatNumber(m.views)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
