"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Users, TrendingUp, MessageSquare, ThumbsUp,
  Eye, PlaySquare, Loader2, AlertCircle,
} from "lucide-react";

interface Subreddit {
  name: string;
  title: string;
  description: string;
  subscribers: number;
  url: string;
}

interface RedditPost {
  title: string;
  subreddit: string;
  score: number;
  numComments: number;
  url: string;
  author: string;
}

interface YTChannel {
  title: string;
  description: string;
  channelId: string;
  url: string;
  thumbnail?: string;
  subscribers?: string;
  videoCount?: string;
}

interface YTVideo {
  title: string;
  channelTitle: string;
  videoId: string;
  url: string;
  thumbnail?: string;
  publishedAt: string;
  views?: string;
  likes?: string;
}

function fmt(n?: string | number): string {
  const num = typeof n === "string" ? parseInt(n) : n;
  if (!num) return "—";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export default function DiscoverPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [reddit, setReddit] = useState<{ subreddits: Subreddit[]; posts: RedditPost[] } | null>(null);
  const [rdError, setRdError] = useState<string | null>(null);
  const [youtube, setYoutube] = useState<{ channels: YTChannel[]; videos: YTVideo[] } | null>(null);
  const [ytError, setYtError] = useState<string | null>(null);

  async function search() {
    const t = topic.trim();
    if (!t) return;
    setLoading(true);
    setSearched(true);
    setReddit(null);
    setRdError(null);
    setYoutube(null);
    setYtError(null);

    const q = encodeURIComponent(t);
    const [rdRes, ytRes] = await Promise.allSettled([
      fetch(`/api/discover/reddit?topic=${q}`).then((r) => r.json()),
      fetch(`/api/discover/youtube?topic=${q}`).then((r) => r.json()),
    ]);

    if (rdRes.status === "fulfilled" && !rdRes.value.error) {
      setReddit(rdRes.value);
    } else if (rdRes.status === "fulfilled" && rdRes.value.error === "reddit_not_configured") {
      setRdError("Connect your Reddit account (or add Reddit API credentials) to see community results.");
    }

    if (ytRes.status === "fulfilled" && !ytRes.value.error) {
      setYoutube(ytRes.value);
    } else if (ytRes.status === "fulfilled" && ytRes.value.error === "YouTube not connected") {
      setYtError("Connect your YouTube account to see channel and video results.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white mb-1">Audience Discovery</h1>
        <p className="text-white/40 text-sm">
          Find communities and trending content around any topic to inform your posting strategy.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-12 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Enter a topic — e.g. philosophy, fitness, AI"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-xl text-white placeholder-white/25 text-sm outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
          />
        </div>
        <button
          onClick={search}
          disabled={loading || !topic.trim()}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-all text-sm flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Empty state */}
      {!searched && (
        <div className="text-center py-20">
          <Search className="w-12 h-12 mx-auto mb-4 text-white/10" />
          <p className="text-white/30 font-medium">Search for a topic to discover audiences</p>
          <p className="text-white/20 text-sm mt-1">Try: philosophy, fitness, AI, cooking, travel</p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div className="space-y-12">
          {/* Reddit not configured notice */}
          {rdError && (
            <section>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                  RD
                </div>
                <h2 className="text-white font-semibold">Reddit</h2>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-white/40 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-yellow-500/60" />
                {rdError}
                <Link
                  href="/accounts"
                  className="ml-auto text-violet-400 hover:text-violet-300 transition-colors shrink-0 text-sm font-medium"
                >
                  Connect →
                </Link>
              </div>
            </section>
          )}

          {/* Reddit */}
          {reddit && (
            <section>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                  RD
                </div>
                <h2 className="text-white font-semibold">Reddit Communities &amp; Posts</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subreddits */}
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Communities
                  </p>
                  <div className="space-y-2">
                    {reddit.subreddits.length === 0 && (
                      <p className="text-white/30 text-sm">No subreddits found.</p>
                    )}
                    {reddit.subreddits.map((sr) => (
                      <a
                        key={sr.name}
                        href={sr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/20 hover:bg-white/[0.05] transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm group-hover:text-orange-400 transition-colors">
                              r/{sr.name}
                            </p>
                            {sr.description && (
                              <p className="text-white/40 text-xs mt-1 line-clamp-2">{sr.description}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-orange-400 text-sm font-semibold">{fmt(sr.subscribers)}</p>
                            <p className="text-white/30 text-xs">members</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Top Posts */}
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Top Posts This Week
                  </p>
                  <div className="space-y-2">
                    {reddit.posts.length === 0 && (
                      <p className="text-white/30 text-sm">No posts found.</p>
                    )}
                    {reddit.posts.map((post, i) => (
                      <a
                        key={i}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/20 hover:bg-white/[0.05] transition-all group"
                      >
                        <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-orange-400 transition-colors mb-2">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-3 text-white/30 text-xs">
                          <span>r/{post.subreddit}</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {fmt(post.score)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {fmt(post.numComments)}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* YouTube not connected notice */}
          {ytError && (
            <section>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
                  YT
                </div>
                <h2 className="text-white font-semibold">YouTube</h2>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-white/40 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-yellow-500/60" />
                {ytError}
                <Link
                  href="/accounts"
                  className="ml-auto text-violet-400 hover:text-violet-300 transition-colors shrink-0 text-sm font-medium"
                >
                  Connect →
                </Link>
              </div>
            </section>
          )}

          {/* YouTube results */}
          {youtube && (
            <section>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
                  YT
                </div>
                <h2 className="text-white font-semibold">YouTube Channels &amp; Videos</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Channels */}
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Channels
                  </p>
                  <div className="space-y-2">
                    {youtube.channels.length === 0 && (
                      <p className="text-white/30 text-sm">No channels found.</p>
                    )}
                    {youtube.channels.map((ch) => (
                      <a
                        key={ch.channelId}
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-red-500/20 hover:bg-white/[0.05] transition-all group"
                      >
                        {ch.thumbnail && (
                          <img
                            src={ch.thumbnail}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm group-hover:text-red-400 transition-colors truncate">
                            {ch.title}
                          </p>
                          {ch.description && (
                            <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{ch.description}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-red-400 text-sm font-semibold">{fmt(ch.subscribers)}</p>
                          <p className="text-white/30 text-xs">subs</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Videos */}
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider font-medium mb-3 flex items-center gap-1.5">
                    <PlaySquare className="w-3.5 h-3.5" /> Popular Videos
                  </p>
                  <div className="space-y-2">
                    {youtube.videos.length === 0 && (
                      <p className="text-white/30 text-sm">No videos found.</p>
                    )}
                    {youtube.videos.map((v) => (
                      <a
                        key={v.videoId}
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-red-500/20 hover:bg-white/[0.05] transition-all group"
                      >
                        {v.thumbnail && (
                          <img
                            src={v.thumbnail}
                            alt=""
                            className="w-20 h-11 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm group-hover:text-red-400 transition-colors line-clamp-2">
                            {v.title}
                          </p>
                          <p className="text-white/30 text-xs mt-1">{v.channelTitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-white/50 text-xs flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {fmt(v.views)}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {!reddit && !youtube && !ytError && (
            <div className="text-center py-12 text-white/30 text-sm">
              No results found. Try a different topic.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
