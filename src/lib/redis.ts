import IORedis from "ioredis";

let _client: IORedis | null | undefined;

function getClient(): IORedis | null {
  if (_client !== undefined) return _client;
  _client = process.env.REDIS_URL ? new IORedis(process.env.REDIS_URL, { lazyConnect: false }) : null;
  _client?.on("error", (err) => console.error("[redis]", err.message));
  return _client;
}

export const redisClient = {
  async get<T>(key: string): Promise<T | null> {
    const client = getClient();
    if (!client) return null;
    const val = await client.get(key);
    if (val === null) return null;
    try { return JSON.parse(val) as T; } catch { return val as unknown as T; }
  },
  async set(key: string, value: unknown): Promise<void> {
    const c = getClient();
    if (c) await c.set(key, JSON.stringify(value));
  },
  async del(key: string): Promise<void> {
    const c = getClient();
    if (c) await c.del(key);
  },
  isAvailable(): boolean {
    return getClient() !== null;
  },
};
