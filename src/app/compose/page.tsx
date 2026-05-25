"use client";
import { useState, useEffect, useRef } from "react";
import { PLATFORMS, Platform } from "@/lib/data";
import {
  MediaType,
  isCompatible,
  getLabel,
  getNote,
  filterCompatible,
} from "@/lib/compatibility";
import { PlatformIcon } from "@/components/platform-icon";
import { cn } from "@/lib/utils";
import {
  Type,
  ImageIcon,
  Video,
  Send,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Ban,
  Info,
  CalendarClock,
  Clock,
} from "lucide-react";
import Link from "next/link";

type ConnectionStatus = Record<string, { connected: boolean; username?: string }>;
interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

// ─── Media type tab ────────────────────────────────────────────────────────────

const MEDIA_TABS: { type: MediaType; icon: React.ElementType; label: string }[] = [
  { type: "text",  icon: Type,      label: "Text" },
  { type: "image", icon: ImageIcon, label: "Image" },
  { type: "video", icon: Video,     label: "Video" },
];

// ─── Char counter ──────────────────────────────────────────────────────────────

function CharCounter({ current, max }: { current: number; max: number }) {
  const pct = (current / max) * 100;
  const remaining = max - current;
  const isWarn = pct > 80;
  const isOver = current > max;
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15" fill="none"
            stroke={isOver ? "#F87171" : isWarn ? "#FBBF24" : "#818CF8"}
            strokeWidth="3"
            strokeDasharray={`${Math.min(pct, 100) * 0.942} 100`}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className={cn("text-xs font-medium tabular-nums", isOver ? "text-red-400" : isWarn ? "text-amber-400" : "text-white/40")}>
        {remaining < 0 ? `+${Math.abs(remaining)}` : remaining}
      </span>
    </div>
  );
}

// ─── Platform button with compat state ────────────────────────────────────────

function PlatformButton({
  platformId,
  mediaType,
  selected,
  onToggle,
}: {
  platformId: Platform;
  mediaType: MediaType;
  selected: boolean;
  onToggle: () => void;
}) {
  const config = PLATFORMS.find((p) => p.id === platformId)!;
  const compatible = isCompatible(platformId, mediaType);
  const note = getNote(platformId, mediaType);
  const label = getLabel(platformId, mediaType);
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={compatible ? onToggle : undefined}
        onMouseEnter={() => !compatible && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={!compatible}
        className={cn(
          "flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl text-sm font-medium transition-all border select-none",
          compatible && selected
            ? "bg-white/10 border-white/20 text-white"
            : compatible
            ? "bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white/80 hover:border-white/10 cursor-pointer"
            : "bg-white/[0.01] border-white/[0.04] text-white/20 cursor-not-allowed opacity-60"
        )}
      >
        <PlatformIcon platform={platformId} size="sm" />
        <span className="hidden sm:inline">{config.name}</span>
        {/* Status badge */}
        {compatible && selected && (
          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        )}
        {!compatible && (
          <Ban className="w-3.5 h-3.5 text-white/20 shrink-0" />
        )}
      </button>

      {/* Compatibility label pill */}
      {compatible && selected && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-violet-300 bg-violet-500/20 border border-violet-500/30 px-1.5 rounded-full whitespace-nowrap pointer-events-none">
          {label}
        </span>
      )}

      {/* Incompatibility tooltip */}
      {showTooltip && note && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-2xl pointer-events-none">
          <div className="flex gap-2 items-start">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-white/70 text-xs leading-relaxed">{note}</p>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/10" />
        </div>
      )}
    </div>
  );
}

// ─── Preview card ──────────────────────────────────────────────────────────────

function PlatformPreview({
  platformId,
  mediaType,
  content,
  mediaUrl,
}: {
  platformId: Platform;
  mediaType: MediaType;
  content: string;
  mediaUrl: string;
}) {
  const config = PLATFORMS.find((p) => p.id === platformId)!;
  const compatible = isCompatible(platformId, mediaType);
  const label = getLabel(platformId, mediaType);
  const isOver = content.length > config.charLimit;

  return (
    <div className={cn(
      "border rounded-2xl p-4 transition-all",
      compatible
        ? "bg-white/[0.03] border-white/[0.07]"
        : "bg-white/[0.01] border-white/[0.04] opacity-50"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <PlatformIcon platform={platformId} size="sm" />
        <span className="text-white/60 text-sm font-medium">{config.name}</span>
        <span className="text-white/20 text-xs">·</span>
        <span className="text-white/30 text-xs">{label}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {!compatible && (
            <span className="flex items-center gap-1 text-red-400/70 text-xs">
              <XCircle className="w-3 h-3" /> Incompatible
            </span>
          )}
          {compatible && isOver && (
            <span className="flex items-center gap-1 text-red-400 text-xs">
              <AlertCircle className="w-3 h-3" /> Over limit
            </span>
          )}
        </div>
      </div>

      {/* Media preview */}
      {compatible && mediaUrl && mediaType === "image" && (
        <div className="rounded-xl overflow-hidden mb-3 bg-white/5 border border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl}
            alt="Media preview"
            className="w-full max-h-40 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      {compatible && mediaUrl && mediaType === "video" && (
        <div className="rounded-xl bg-black/40 border border-white/5 mb-3 h-28 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-white/30">
            <Video className="w-8 h-8" />
            <span className="text-xs">Video preview</span>
          </div>
        </div>
      )}

      {/* Text body */}
      <div className="bg-[#0d0d14] rounded-xl p-3 text-sm text-white/70 leading-relaxed min-h-[72px] whitespace-pre-wrap break-words">
        {content || (
          <span className="text-white/20 italic">Your post preview will appear here…</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-white/30 text-xs">{config.handle}</span>
        {compatible && <CharCounter current={content.length} max={config.charLimit} />}
      </div>
    </div>
  );
}

// ─── Dismissed banners notice ─────────────────────────────────────────────────

function IncompatibleBanner({
  removed,
  mediaType,
}: {
  removed: Platform[];
  mediaType: MediaType;
}) {
  if (removed.length === 0) return null;
  const names = removed.map((id) => PLATFORMS.find((p) => p.id === id)!.name);
  return (
    <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl px-4 py-3">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>
        <strong>{names.join(", ")}</strong>{" "}
        {names.length === 1 ? "was" : "were"} deselected — not compatible with{" "}
        <strong>{mediaType}</strong> posts.
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Compose() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<Platform[]>([]);
  const [selected, setSelected] = useState<Platform[]>([]);
  const [mediaType, setMediaType] = useState<MediaType>("text");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [redditSubreddit, setRedditSubreddit] = useState("");
  const [redditTitle, setRedditTitle] = useState("");
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [scheduleTime, setScheduleTime] = useState(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [publishing, setPublishing] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [results, setResults] = useState<PostResult[] | null>(null);
  const [recentlyRemoved, setRecentlyRemoved] = useState<Platform[]>([]);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((s: ConnectionStatus) => {
        const connected = PLATFORMS.filter((p) => s[p.id]?.connected).map(
          (p) => p.id as Platform
        );
        setConnectedPlatforms(connected);
        setSelected(filterCompatible(connected, "text"));
      });
  }, []);

  // When media type changes, auto-deselect incompatible platforms
  function switchMediaType(next: MediaType) {
    setMediaType(next);
    setMediaUrl("");
    setResults(null);
    const nowIncompat = selected.filter((p) => !isCompatible(p, next));
    if (nowIncompat.length) {
      setRecentlyRemoved(nowIncompat);
      setSelected((prev) => filterCompatible(prev, next));
      setTimeout(() => setRecentlyRemoved([]), 4000);
    }
  }

  function toggle(p: Platform) {
    if (!isCompatible(p, mediaType)) return;
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  const tightest =
    selected.length > 0
      ? Math.min(...selected.map((id) => PLATFORMS.find((p) => p.id === id)!.charLimit))
      : 280;

  const needsMedia = mediaType !== "text";
  const redditSelected = selected.includes("reddit" as Platform);
  const minDateTime = new Date(Date.now() + 60_000).toISOString().slice(0, 16);
  const canPublish =
    content.trim().length > 0 &&
    selected.length > 0 &&
    !publishing &&
    (!needsMedia || mediaUrl.trim().length > 0) &&
    (!redditSelected || (redditSubreddit.trim().length > 0 && redditTitle.trim().length > 0)) &&
    (mode === "now" || scheduleTime > minDateTime);

  async function handlePublish() {
    if (!canPublish) return;
    setPublishing(true);
    setResults(null);
    setScheduled(false);
    try {
      if (mode === "schedule") {
        const res = await fetch("/api/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            platforms: selected,
            mediaType,
            mediaUrl: mediaUrl || undefined,
            redditSubreddit,
            redditTitle,
            scheduledFor: new Date(scheduleTime).toISOString(),
          }),
        });
        if (res.ok) {
          setScheduled(true);
          setContent("");
          setMediaUrl("");
        } else {
          const err = await res.json();
          setResults([{ platform: "all", success: false, error: err.error }]);
        }
      } else {
        const res = await fetch("/api/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            platforms: selected,
            mediaType,
            mediaUrl: mediaUrl || undefined,
            redditSubreddit,
            redditTitle,
          }),
        });
        const data = await res.json();
        setResults(data.results);
        if (data.results.some((r: PostResult) => r.success)) {
          setContent("");
          setMediaUrl("");
        }
      }
    } catch (e) {
      setResults([{ platform: "all", success: false, error: String(e) }]);
    } finally {
      setPublishing(false);
    }
  }

  // All platforms visible in the selector (connected + supported by at least one type)
  const visiblePlatforms = connectedPlatforms;
  const compatibleCount = filterCompatible(visiblePlatforms, mediaType).length;

  return (
    <div className="px-8 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Compose</h1>
        <p className="text-white/40 text-sm mt-1">Write once, publish everywhere</p>
      </div>

      {connectedPlatforms.length === 0 && (
        <div className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          No accounts connected.{" "}
          <a href="/accounts" className="underline hover:text-amber-200 transition-colors inline-flex items-center gap-1">
            Connect accounts <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <IncompatibleBanner removed={recentlyRemoved} mediaType={mediaType} />

      {results && (
        <div className="mt-4 space-y-2">
          {results.map((r) => (
            <div
              key={r.platform}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm",
                r.success
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : "bg-red-500/10 border-red-500/20 text-red-300"
              )}
            >
              {r.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="capitalize font-medium">{r.platform}</span>
              <span className="text-white/30">—</span>
              {r.success ? (
                r.postUrl ? (
                  <a
                    href={r.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    View post <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  "Published"
                )
              ) : (
                <span className="text-white/60 text-xs">{r.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-5 gap-6">
        {/* ── Left: editor column ── */}
        <div className="col-span-3 space-y-4">

          {/* Media type tabs */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-1.5 flex gap-1">
            {MEDIA_TABS.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => switchMediaType(type)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                  mediaType === type
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Platform selector */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/50 text-sm font-medium">Publish to</p>
              <span className="text-white/25 text-xs">
                {selected.length}/{compatibleCount} compatible selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {connectedPlatforms.length === 0 ? (
                <p className="text-white/20 text-sm italic">No connected accounts</p>
              ) : (
                visiblePlatforms.map((id) => (
                  <PlatformButton
                    key={id}
                    platformId={id}
                    mediaType={mediaType}
                    selected={selected.includes(id)}
                    onToggle={() => toggle(id)}
                  />
                ))
              )}
            </div>

            {/* Compatibility legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <CheckCircle2 className="w-3 h-3 text-violet-400" /> Compatible
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <Ban className="w-3 h-3 text-white/20" /> Incompatible with {mediaType}
              </div>
            </div>
          </div>

          {/* Text editor */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden focus-within:border-violet-500/40 transition-colors">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                mediaType === "text"
                  ? "What's on your mind? Write your post here…"
                  : mediaType === "image"
                  ? "Write a caption for your image…"
                  : "Write a description for your video…"
              }
              className="w-full bg-transparent text-white text-sm leading-relaxed p-5 resize-none outline-none placeholder:text-white/20 min-h-[180px]"
            />

            {/* Media URL input */}
            {needsMedia && (
              <div className="px-5 pb-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-violet-500/40 transition-colors">
                  {mediaType === "image" ? (
                    <ImageIcon className="w-4 h-4 text-white/30 shrink-0" />
                  ) : (
                    <Video className="w-4 h-4 text-white/30 shrink-0" />
                  )}
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder={
                      mediaType === "image"
                        ? "Paste image URL (https://…)"
                        : "Paste video URL (https://…)"
                    }
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                  />
                  {mediaUrl && (
                    <button
                      onClick={() => setMediaUrl("")}
                      className="text-white/20 hover:text-white/50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {!mediaUrl && (
                  <p className="text-white/25 text-xs mt-1.5 ml-1">
                    {mediaType === "image"
                      ? "Required for Instagram. Enhances Twitter, Facebook, and LinkedIn."
                      : "Required for Instagram Reels and Facebook video posts."}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
              <p className="text-white/25 text-xs">
                Tightest limit:{" "}
                <span className="text-white/50">
                  {selected.length > 0
                    ? PLATFORMS.find((p) => p.charLimit === tightest)?.name
                    : "—"}
                </span>
              </p>
              {selected.length > 0 && (
                <CharCounter current={content.length} max={tightest} />
              )}
            </div>
          </div>

          {/* Publish mode: now vs schedule */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-1.5 flex gap-1">
            {([
              { value: "now",      icon: Send,          label: "Publish now" },
              { value: "schedule", icon: CalendarClock, label: "Schedule" },
            ] as const).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => { setMode(value); setScheduled(false); setResults(null); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all",
                  mode === value
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Date/time picker */}
          {mode === "schedule" && (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
              <label className="text-white/40 text-xs font-medium mb-2 block">Publish at</label>
              <input
                type="datetime-local"
                value={scheduleTime}
                min={minDateTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/40 transition-colors [color-scheme:dark]"
              />
              {scheduleTime && (
                <p className="text-white/25 text-xs mt-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {new Date(scheduleTime).toLocaleString(undefined, {
                    weekday: "long", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          )}

          {/* Scheduled success banner */}
          {scheduled && (
            <div className="flex items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Post scheduled for{" "}
                {new Date(scheduleTime).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
              <Link href="/scheduled" className="text-white/40 hover:text-white text-xs underline transition-colors shrink-0">
                View scheduled →
              </Link>
            </div>
          )}

          {/* Reddit-specific fields */}
          {redditSelected && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 space-y-3">
              <p className="text-orange-300/80 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-orange-500/20 flex items-center justify-center text-[10px] font-bold text-orange-400">Re</span>
                Reddit options
              </p>
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Subreddit <span className="text-red-400">*</span></label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-orange-500/40 transition-colors">
                  <span className="text-white/30 text-sm">r/</span>
                  <input
                    type="text"
                    value={redditSubreddit}
                    onChange={(e) => setRedditSubreddit(e.target.value.replace(/^\/?r\//, ""))}
                    placeholder="gaming, worldnews, AskReddit…"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Post title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={redditTitle}
                  onChange={(e) => setRedditTitle(e.target.value)}
                  placeholder="Give your post a title…"
                  maxLength={300}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-orange-500/40 transition-colors"
                />
                <p className="text-white/20 text-xs mt-1 text-right">{redditTitle.length}/300</p>
              </div>
            </div>
          )}

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200",
              canPublish
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                : "bg-white/5 text-white/25 cursor-not-allowed"
            )}
          >
            {publishing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {mode === "schedule" ? "Scheduling…" : "Publishing…"}</>
            ) : mode === "schedule" ? (
              <><CalendarClock className="w-4 h-4" /> Schedule for later</>
            ) : (
              <><Send className="w-4 h-4" /> Publish {selected.length > 0 ? `to ${selected.length} platform${selected.length !== 1 ? "s" : ""}` : ""}</>
            )}
          </button>
        </div>

        {/* ── Right: previews ── */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/50 text-sm font-medium">Previews</p>
            <span className="text-white/25 text-xs capitalize">{mediaType} post</span>
          </div>

          {visiblePlatforms.length === 0 ? (
            <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-8 text-center">
              <p className="text-white/25 text-sm">No connected platforms</p>
            </div>
          ) : (
            visiblePlatforms.map((id) => (
              <PlatformPreview
                key={id}
                platformId={id}
                mediaType={mediaType}
                content={content}
                mediaUrl={mediaUrl}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
