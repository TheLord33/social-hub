"use client";
import { TOTAL_STATS, PLATFORMS, MOCK_POSTS } from "@/lib/data";
import { StatsCard } from "@/components/stats-card";
import { PostCard } from "@/components/post-card";
import { AnalyticsChart } from "@/components/analytics-chart";
import { PlatformIcon } from "@/components/platform-icon";
import { formatNumber } from "@/lib/utils";
import { Eye, Users, FileText, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const connected = PLATFORMS.filter((p) => p.connected);
  const recentPosts = MOCK_POSTS.filter((p) => p.status === "published").slice(0, 3);

  return (
    <div className="px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Views"
          value={TOTAL_STATS.totalViews}
          growth={TOTAL_STATS.viewsGrowth}
          icon={Eye}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10"
        />
        <StatsCard
          label="Total Followers"
          value={TOTAL_STATS.totalFollowers}
          growth={TOTAL_STATS.followersGrowth}
          icon={Users}
          iconColor="text-pink-400"
          iconBg="bg-pink-500/10"
        />
        <StatsCard
          label="Posts Published"
          value={TOTAL_STATS.totalPosts}
          growth={TOTAL_STATS.postsGrowth}
          icon={FileText}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
        />
        <StatsCard
          label="Avg Engagement"
          value={TOTAL_STATS.avgEngagement}
          growth={TOTAL_STATS.engagementGrowth}
          icon={TrendingUp}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="col-span-2">
          <AnalyticsChart />
        </div>

        {/* Connected Platforms */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <h3 className="text-white font-semibold text-base mb-4">Connected Platforms</h3>
          <div className="space-y-3">
            {connected.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
              >
                <PlatformIcon platform={platform.id} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-white/80 text-sm font-medium truncate">
                    {platform.name}
                  </p>
                  <p className="text-white/30 text-xs">{platform.handle}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-sm font-semibold">
                    {formatNumber(platform.followers)}
                  </p>
                  <p className="text-white/30 text-xs">followers</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/accounts"
            className="flex items-center justify-center gap-2 mt-4 py-2 text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors"
          >
            Manage accounts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-base">Recent Posts</h3>
          <Link
            href="/analytics"
            className="text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
