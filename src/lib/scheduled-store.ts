import fs from "fs";
import path from "path";
import { Platform } from "./data";
import { MediaType } from "./compatibility";

const FILE = path.join(process.cwd(), "data", "scheduled.json");

export interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface ScheduledPost {
  id: string;
  content: string;
  platforms: Platform[];
  mediaType: MediaType;
  mediaUrl?: string;
  redditSubreddit?: string;
  redditTitle?: string;
  scheduledFor: string; // ISO string (UTC)
  createdAt: string;
  status: "pending" | "published" | "failed";
  results?: PostResult[];
}

function read(): ScheduledPost[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
}

function write(posts: ScheduledPost[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(posts, null, 2));
}

export function listScheduled(): ScheduledPost[] {
  return read().sort(
    (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  );
}

export function getScheduled(id: string): ScheduledPost | undefined {
  return read().find((p) => p.id === id);
}

export function createScheduled(data: Omit<ScheduledPost, "id" | "createdAt" | "status">): ScheduledPost {
  const post: ScheduledPost = {
    ...data,
    id: `sched_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const all = read();
  all.push(post);
  write(all);
  return post;
}

export function cancelScheduled(id: string): boolean {
  const all = read();
  const idx = all.findIndex((p) => p.id === id && p.status === "pending");
  if (idx === -1) return false;
  all.splice(idx, 1);
  write(all);
  return true;
}

export function markPublished(id: string, results: PostResult[]) {
  const all = read();
  const post = all.find((p) => p.id === id);
  if (post) {
    post.status = "published";
    post.results = results;
    write(all);
  }
}

export function markFailed(id: string, results: PostResult[]) {
  const all = read();
  const post = all.find((p) => p.id === id);
  if (post) {
    post.status = "failed";
    post.results = results;
    write(all);
  }
}

export function getPendingDue(): ScheduledPost[] {
  const now = new Date();
  return read().filter(
    (p) => p.status === "pending" && new Date(p.scheduledFor) <= now
  );
}
