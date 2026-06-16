import { NextRequest, NextResponse } from "next/server";
import { kpiData, retailers, dailyUnitSales, weeklyUnitSales } from "@/lib/mockData";

const OMNI_BASE = "https://lemme.omniapp.co";
const OMNI_API_KEY = process.env.OMNI_API_KEY;

// When OMNI_API_KEY is set, replace mock calls below with real Omni API queries.
// Example Omni query:
//   fetch(`${OMNI_BASE}/api/v1/query`, {
//     method: "POST",
//     headers: { Authorization: `Bearer ${OMNI_API_KEY}`, "Content-Type": "application/json" },
//     body: JSON.stringify({ topic: "alloy", fields: [...], filters: [...] }),
//   })

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "dashboard";

  if (OMNI_API_KEY) {
    // TODO: Replace with real Omni API calls once endpoint structure is confirmed
    console.log(`Omni API key present — would query ${OMNI_BASE} for type=${type}`);
  }

  switch (type) {
    case "dashboard":
      return NextResponse.json({ kpi: kpiData, retailers, dailyUnitSales, weeklyUnitSales });
    case "retailers":
      return NextResponse.json(retailers);
    case "kpi":
      return NextResponse.json(kpiData);
    default:
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }
}
