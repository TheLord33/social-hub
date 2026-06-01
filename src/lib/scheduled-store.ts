import { redisClient } from "./redis";
import fs from "fs";
import path from "path";
import { Platform } from "./data";
import { MediaType } from "./compatibility";

const FILE = path.join(process.cwd(), "data", "scheduled.json");
const REDIS_KEY = "socialhub:scheduled";

export interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface ScheduledPost {
  id: string;
  userId: string;
  content: string;
  platforms: Platform[];
  mediaType: MediaType;
  mediaUrl?: string;
  redditSubreddit?: string;
  redditTitle?: string;
  youtubeTitle?: string;
  youtubePrivacy?: "public" | "unlisted" | "private";
  scheduledFor: string;
  createdAt: string;
  status: "pending" | "published" | "failed";
  results?: PostResult[];
}

function getRedis() { return redisClient.isAvailable() ? redisClient : null; }

async function read(): Promise<ScheduledPost[]> {
  const redis = getRedis();
  if (redis) {
    return (await redis.get<ScheduledPost[]>(REDIS_KEY)) ?? [];
  }
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function write(posts: ScheduledPost[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, posts);
    return;
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(posts, null, 2));
}

export async function listScheduled(userId: string): Promise<ScheduledPost[]> {
  return (await read())
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

export async function getScheduled(id: string): Promise<ScheduledPost | undefined> {
  return (await read()).find((p) => p.id === id);
}

export async function createScheduled(
  data: Omit<ScheduledPost, "id" | "createdAt" | "status">
): Promise<ScheduledPost> {
  const post: ScheduledPost = {
    ...data,
    id: `sched_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const all = await read();
  all.push(post);
  await write(all);
  return post;
}

export async function cancelScheduled(id: string): Promise<boolean> {
  const all = await read();
  const idx = all.findIndex((p) => p.id === id && p.status === "pending");
  if (idx === -1) return false;
  all.splice(idx, 1);
  await write(all);
  return true;
}

export async function markPublished(id: string, results: PostResult[]): Promise<void> {
  const all = await read();
  const post = all.find((p) => p.id === id);
  if (post) {
    post.status = "published";
    post.results = results;
    await write(all);
  }
}

export async function markFailed(id: string, results: PostResult[]): Promise<void> {
  const all = await read();
  const post = all.find((p) => p.id === id);
  if (post) {
    post.status = "failed";
    post.results = results;
    await write(all);
  }
}

export async function getPendingDue(): Promise<ScheduledPost[]> {
  const now = new Date();
  return (await read()).filter(
    (p) => p.status === "pending" && new Date(p.scheduledFor) <= now
  );
}
