"use client";
import { useEffect, useState, useCallback } from "react";
import { ScheduledPost } from "@/lib/scheduled-store";
import { PlatformIcon } from "@/components/platform-icon";
import { Platform } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Clock, CheckCircle2, XCircle, Trash2, RefreshCw,
  CalendarClock, ExternalLink, Loader2,
} from "lucide-react";
import Link from "next/link";

function useCountdown(target: string) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function compute() {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setLabel("Publishing soon…"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) setLabel(`in ${h}h ${m}m`);
      else if (m > 0) setLabel(`in ${m}m ${s}s`);
      else setLabel(`in ${s}s`);
    }
    compute();
    const t = setInterval(compute, 1000);
    return () => clearInterval(t);
  }, [target]);

  return label;
}

function Countdown({ target }: { target: string }) {
  const label = useCountdown(target);
  return <span>{label}</span>;
}

function ScheduledCard({ post, onCancel }: { post: ScheduledPost; onCancel: (id: string) => void }) {
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    setCancelling(true);
    await fetch(`/api/schedule/${post.id}`, { method: "DELETE" });
    onCancel(post.id);
  }

  const scheduledDate = new Date(post.scheduledFor);
  const isPast = scheduledDate <= new Date();

  return (
    <div className={cn(
      "border rounded-2xl p-5 transition-all",
      post.status === "pending"   ? "bg-white/[0.03] border-white/[0.07]"
      : post.status === "published" ? "bg-emerald-500/5 border-emerald-500/15"
      : "bg-red-500/5 border-red-500/15"
    )}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {post.platforms.map((p) => (
            <PlatformIcon key={p} platform={p as Platform} size="sm" />
          ))}
        </div>

        <div className={cn(
          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0",
          post.status === "pending"   ? "text-amber-400 bg-amber-400/10"
          : post.status === "published" ? "text-emerald-400 bg-emerald-400/10"
          : "text-red-400 bg-red-400/10"
        )}>
          {post.status === "pending"   && <Clock className="w-3 h-3" />}
          {post.status === "published" && <CheckCircle2 className="w-3 h-3" />}
          {post.status === "failed"    && <XCircle className="w-3 h-3" />}
          {post.status === "pending"
            ? (isPast ? "Publishing soon…" : <Countdown target={post.scheduledFor} />)
            : post.status === "published" ? "Published" : "Failed"
          }
        </div>
      </div>

      {/* Content */}
      <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-3">
        {post.content}
      </p>

      {/* Schedule time */}
      <div className="flex items-center gap-1.5 text-white/30 text-xs mb-3">
        <CalendarClock className="w-3.5 h-3.5" />
        {scheduledDate.toLocaleString(undefined, {
          weekday: "short", month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
        {post.mediaType !== "text" && (
          <span className="ml-2 capitalize px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            {post.mediaType}
          </span>
        )}
      </div>

      {/* Results for published/failed */}
      {post.results && (
        <div className="space-y-1 mb-3">
          {post.results.map((r) => (
            <div key={r.platform} className={cn(
              "flex items-center gap-2 text-xs",
              r.success ? "text-emerald-400" : "text-red-400/70"
            )}>
              {r.success ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
              <span className="capitalize font-medium">{r.platform}</span>
              {r.success && r.postUrl && (
                <a href={r.postUrl} target="_blank" rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-white/30 hover:text-white/60 transition-colors">
                  View <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {!r.success && <span className="text-white/30 truncate ml-auto">{r.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {post.status === "pending" && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors disabled:opacity-50 mt-1"
        >
          {cancelling
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />}
          Cancel
        </button>
      )}
    </div>
  );
}

export default function ScheduledPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/schedule");
    setPosts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  // Refresh every 30s so published/failed statuses update
  useEffect(() => {
    const t = setInterval(fetch_, 30_000);
    return () => clearInterval(t);
  }, [fetch_]);

  const pending   = posts.filter((p) => p.status === "pending");
  const published = posts.filter((p) => p.status === "published");
  const failed    = posts.filter((p) => p.status === "failed");

  function removeFromList(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Scheduled</h1>
          <p className="text-white/40 text-sm mt-1">Posts queued for future publishing</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetch_} className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/compose"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
            + Schedule post
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center">
          <CalendarClock className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">No scheduled posts yet.</p>
          <Link href="/compose" className="text-violet-400 text-sm hover:text-violet-300 transition-colors mt-2 inline-block">
            Schedule your first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Pending
                <span className="bg-amber-400/15 text-amber-400 text-xs px-1.5 py-0.5 rounded-full font-normal">{pending.length}</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {pending.map((p) => <ScheduledCard key={p.id} post={p} onCancel={removeFromList} />)}
              </div>
            </section>
          )}

          {published.length > 0 && (
            <section>
              <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Published
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {published.map((p) => <ScheduledCard key={p.id} post={p} onCancel={removeFromList} />)}
              </div>
            </section>
          )}

          {failed.length > 0 && (
            <section>
              <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-red-400" /> Failed
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {failed.map((p) => <ScheduledCard key={p.id} post={p} onCancel={removeFromList} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
