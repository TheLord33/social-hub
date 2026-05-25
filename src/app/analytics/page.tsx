"use client";
import { MOCK_POSTS, PLATFORMS, Platform } from "@/lib/data";
import { PostCard } from "@/components/post-card";
import { PlatformIcon } from "@/components/platform-icon";
import { AnalyticsChart } from "@/components/analytics-chart";
import { formatNumber } from "@/lib/utils";
import { Eye, Heart, MessageCircle, Share2, MousePointerClick } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Filter = "all" | Platform;

export default function Analytics() {
  const [filter, setFilter] = useState<Filter>("all");

  const publishedPosts = MOCK_POSTS.filter((p) => p.status === "published");

  const filteredPosts =
    filter === "all"
      ? publishedPosts
      : publishedPosts.filter((p) => p.platforms.includes(filter as Platform));

  const connectedPlatforms = PLATFORMS.filter((p) => p.connected);

  const platformTotals = connectedPlatforms.map((platform) => {
    const posts = publishedPosts.filter((p) =>
      p.platforms.includes(platform.id)
    );
    const totals = posts.reduce(
      (acc, post) => ({
        views: acc.views + post.metrics[platform.id].views,
        likes: acc.likes + post.metrics[platform.id].likes,
        comments: acc.comments + post.metrics[platform.id].comments,
        shares: acc.shares + post.metrics[platform.id].shares,
        clicks: acc.clicks + post.metrics[platform.id].clicks,
      }),
      { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 }
    );
    return { platform, totals, postCount: posts.length };
  });

  const grandTotal = platformTotals.reduce(
    (acc, { totals }) => ({
      views: acc.views + totals.views,
      likes: acc.likes + totals.likes,
      comments: acc.comments + totals.comments,
      shares: acc.shares + totals.shares,
      clicks: acc.clicks + totals.clicks,
    }),
    { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 }
  );

  return (
    <div className="px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">
          Track performance across all your platforms
        </p>
      </div>

      {/* Grand Total Row */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { icon: Eye, label: "Total Views", value: grandTotal.views, color: "text-violet-400", bg: "bg-violet-500/10" },
          { icon: Heart, label: "Total Likes", value: grandTotal.likes, color: "text-pink-400", bg: "bg-pink-500/10" },
          { icon: MessageCircle, label: "Comments", value: grandTotal.comments, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { icon: Share2, label: "Shares", value: grandTotal.shares, color: "text-amber-400", bg: "bg-amber-500/10" },
          { icon: MousePointerClick, label: "Clicks", value: grandTotal.clicks, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div
            key={label}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4"
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", bg)}>
              <Icon className={cn("w-4.5 h-4.5", color)} size={18} />
            </div>
            <p className="text-white/40 text-xs font-medium mb-1">{label}</p>
            <p className="text-white text-xl font-bold">{formatNumber(value)}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mb-8">
        <AnalyticsChart />
      </div>

      {/* Per-Platform Breakdown */}
      <div className="mb-8">
        <h3 className="text-white font-semibold text-base mb-4">Platform Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          {platformTotals.map(({ platform, totals, postCount }) => (
            <div
              key={platform.id}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <PlatformIcon platform={platform.id} size="lg" />
                <div>
                  <p className="text-white font-semibold">{platform.name}</p>
                  <p className="text-white/30 text-sm">
                    {postCount} post{postCount !== 1 ? "s" : ""} ·{" "}
                    {formatNumber(platform.followers)} followers
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Views", value: totals.views },
                  { label: "Likes", value: totals.likes },
                  { label: "Comments", value: totals.comments },
                  { label: "Shares", value: totals.shares },
                  { label: "Clicks", value: totals.clicks },
                  {
                    label: "Eng. Rate",
                    value:
                      totals.views > 0
                        ? ((totals.likes + totals.comments + totals.shares) /
                            totals.views) *
                          100
                        : 0,
                    suffix: "%",
                  },
                ].map(({ label, value, suffix }) => (
                  <div key={label} className="bg-white/[0.03] rounded-xl p-3">
                    <p className="text-white/30 text-xs mb-1">{label}</p>
                    <p className="text-white font-semibold text-sm">
                      {suffix
                        ? `${value.toFixed(1)}${suffix}`
                        : formatNumber(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Filter + List */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-white font-semibold text-base mr-2">Posts</h3>
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filter === "all"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}
          >
            All platforms
          </button>
          {connectedPlatforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilter(p.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filter === p.id
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <PlatformIcon platform={p.id} size="sm" />
              {p.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {filteredPosts.length === 0 && (
            <div className="col-span-2 py-16 text-center">
              <p className="text-white/25 text-sm">
                No published posts for this platform yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
