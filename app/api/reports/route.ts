import { NextRequest, NextResponse } from "next/server";

// Falls back to in-memory store when Upstash env vars are not set (dev only)
const memoryStore: Record<string, { weekLabel: string; content: string; savedAt: string }> = {};

async function getRedis() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = await import("@upstash/redis");
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return null;
}

export async function GET() {
  const redis = await getRedis();

  if (redis) {
    const keys: string[] = await redis.keys("report:*");
    const reports: Record<string, unknown> = {};
    for (const key of keys) {
      reports[key.replace("report:", "")] = await redis.get(key);
    }
    return NextResponse.json(reports);
  }

  return NextResponse.json(memoryStore);
}

export async function POST(req: NextRequest) {
  const { weekKey, weekLabel, content } = await req.json();
  const record = { weekLabel, content, savedAt: new Date().toISOString() };

  const redis = await getRedis();
  if (redis) {
    await redis.set(`report:${weekKey}`, record);
  } else {
    memoryStore[weekKey] = record;
  }

  return NextResponse.json({ success: true });
}
