import { redisClient } from "./redis";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";

const RESETS_FILE = path.join(process.cwd(), "data", "resets.json");
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

interface ResetRecord { email: string; expiresAt: number; }

function getRedis() { return redisClient.isAvailable() ? redisClient : null; }

function resetKey(token: string) { return `socialhub:reset:${token}`; }

function readLocal(): Record<string, ResetRecord> {
  try { return JSON.parse(fs.readFileSync(RESETS_FILE, "utf-8")); } catch { return {}; }
}
function writeLocal(data: Record<string, ResetRecord>) {
  fs.mkdirSync(path.dirname(RESETS_FILE), { recursive: true });
  fs.writeFileSync(RESETS_FILE, JSON.stringify(data, null, 2));
}

export async function createResetToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const record: ResetRecord = { email: email.toLowerCase(), expiresAt: Date.now() + RESET_TTL_MS };
  const redis = getRedis();
  if (redis) {
    await redis.set(resetKey(token), record);
  } else {
    const data = readLocal();
    // Prune expired tokens
    for (const k of Object.keys(data)) {
      if (Date.now() > data[k].expiresAt) delete data[k];
    }
    data[token] = record;
    writeLocal(data);
  }
  return token;
}

export async function consumeResetToken(token: string): Promise<string | null> {
  const redis = getRedis();
  if (redis) {
    const record = await redis.get<ResetRecord>(resetKey(token));
    if (!record || Date.now() > record.expiresAt) return null;
    await redis.del(resetKey(token));
    return record.email;
  }
  const data = readLocal();
  const record = data[token];
  if (!record || Date.now() > record.expiresAt) return null;
  delete data[token];
  writeLocal(data);
  return record.email;
}
