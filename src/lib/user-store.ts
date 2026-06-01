import { redisClient } from "./redis";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  plan: "free" | "pro";
  stripeCustomerId?: string;
  createdAt: number;
}

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function getRedis() { return redisClient.isAvailable() ? redisClient : null; }

function userKey(email: string) {
  return `socialhub:user:${email.toLowerCase()}`;
}

// ── Local JSON fallback ────────────────────────────────────────────────────────

function readLocalUsers(): Record<string, User> {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")); } catch { return {}; }
}

function writeLocalUsers(users: Record<string, User>) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<User | null> {
  const redis = getRedis();
  if (redis) return redis.get<User>(userKey(email));
  return readLocalUsers()[email.toLowerCase()] ?? null;
}

export async function updateUser(
  email: string,
  updates: Partial<Pick<User, "plan" | "stripeCustomerId" | "passwordHash">>
): Promise<void> {
  const user = await getUserByEmail(email);
  if (!user) return;
  const updated = { ...user, ...updates };
  const redis = getRedis();
  if (redis) {
    await redis.set(userKey(email), updated);
    if (updates.stripeCustomerId) {
      await redis.set(`socialhub:stripe:${updates.stripeCustomerId}`, email.toLowerCase());
    }
  } else {
    const users = readLocalUsers();
    users[email.toLowerCase()] = updated;
    writeLocalUsers(users);
  }
}

export async function getUserByStripeCustomerId(customerId: string): Promise<User | null> {
  const redis = getRedis();
  if (redis) {
    const email = await redis.get<string>(`socialhub:stripe:${customerId}`);
    if (!email) return null;
    return redis.get<User>(userKey(email));
  }
  const users = readLocalUsers();
  return Object.values(users).find((u) => u.stripeCustomerId === customerId) ?? null;
}

export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<User | { error: string }> {
  const existing = await getUserByEmail(email);
  if (existing) return { error: "Email already registered" };

  const passwordHash = await bcrypt.hash(password, 12);
  const user: User = {
    id: randomUUID(),
    email: email.toLowerCase(),
    name: name.trim(),
    passwordHash,
    plan: "free",
    createdAt: Date.now(),
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(userKey(email), user);
  } else {
    const users = readLocalUsers();
    users[email.toLowerCase()] = user;
    writeLocalUsers(users);
  }

  return user;
}
