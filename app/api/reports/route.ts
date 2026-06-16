import { NextRequest, NextResponse } from "next/server";

// Uses Vercel KV when KV_REST_API_URL is set, otherwise falls back to in-memory store (dev only)
let memoryStore: Record<string, { weekLabel: string; content: string; savedAt: string }> = {};

async function getKV() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    return kv;
  }
  return null;
}

export async function GET() {
  const kv = await getKV();

  if (kv) {
    const keys = await kv.keys("report:*");
    const reports: Record<string, unknown> = {};
    for (const key of keys) {
      reports[key.replace("report:", "")] = await kv.get(key);
    }
    return NextResponse.json(reports);
  }

  return NextResponse.json(memoryStore);
}

export async function POST(req: NextRequest) {
  const { weekKey, weekLabel, content } = await req.json();
  const record = { weekLabel, content, savedAt: new Date().toISOString() };

  const kv = await getKV();
  if (kv) {
    await kv.set(`report:${weekKey}`, record);
  } else {
    memoryStore[weekKey] = record;
  }

  return NextResponse.json({ success: true });
}
