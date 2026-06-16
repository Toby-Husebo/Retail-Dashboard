import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const { kpi, retailers, periodLabel, compareLabel, view } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      insights: [
        `Total sales ${kpi.salesChange >= 0 ? "up" : "down"} ${Math.abs(kpi.salesChange)}% vs ${compareLabel}`,
        `${retailers.filter((r: { salesChange: number }) => r.salesChange > 0).map((r: { name: string }) => r.name).join(", ")} leading WoW growth`,
        `${retailers.filter((r: { lowStockAlert: boolean }) => r.lowStockAlert).map((r: { name: string }) => r.name).join(", ")} below 6 weeks of supply — monitor closely`,
      ],
    });
  }

  const client = new Anthropic({ apiKey });

  const topRetailer = [...retailers].sort((a: { salesChange: number }, b: { salesChange: number }) => b.salesChange - a.salesChange)[0];
  const bottomRetailer = [...retailers].sort((a: { salesChange: number }, b: { salesChange: number }) => a.salesChange - b.salesChange)[0];
  const lowStock = retailers.filter((r: { lowStockAlert: boolean }) => r.lowStockAlert).map((r: { name: string }) => r.name);

  const prompt = `You are a retail analyst for Lemme, a health & wellness gummy supplement brand. Write exactly 3-4 concise bullet-point insights (one sentence each) about this ${view} of retail performance. Be specific with numbers. No headers, no preamble — just the bullets starting with "•".

Period: ${periodLabel} vs ${compareLabel}
Total Sales: $${(kpi.totalSales / 1000000).toFixed(2)}M (${kpi.salesChange > 0 ? "+" : ""}${kpi.salesChange}% vs comparison, ${kpi.salesYoY > 0 ? "+" : ""}${kpi.salesYoY}% YoY)
Total Units: ${kpi.totalUnits.toLocaleString()} (${kpi.unitsChange > 0 ? "+" : ""}${kpi.unitsChange}% vs comparison)
Top retailer: ${topRetailer.name} (${topRetailer.salesChange > 0 ? "+" : ""}${topRetailer.salesChange}% sales change)
Weakest retailer: ${bottomRetailer.name} (${bottomRetailer.salesChange > 0 ? "+" : ""}${bottomRetailer.salesChange}% sales change)
Low stock risk: ${lowStock.length > 0 ? lowStock.join(", ") : "None"}

Retailer data:
${retailers.map((r: { name: string; salesChange: number; salesYoY: number; unitSales: number; unitSalesChange: number; weeksOfSupply: number; upss: number | null }) =>
  `${r.name}: ${r.salesChange > 0 ? "+" : ""}${r.salesChange}% WoW, ${r.salesYoY > 0 ? "+" : ""}${r.salesYoY}% YoY, ${r.unitSales.toLocaleString()} units, ${r.weeksOfSupply.toFixed(1)} wks supply${r.upss ? `, ${r.upss.toFixed(2)} UPSS` : ""}`
).join("\n")}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const insights = text.split("\n").filter((l: string) => l.trim().startsWith("•")).map((l: string) => l.replace(/^•\s*/, "").trim());
    return NextResponse.json({ insights });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ insights: [`Sales ${kpi.salesChange > 0 ? "up" : "down"} ${Math.abs(kpi.salesChange)}% vs ${compareLabel} this ${view}.`] });
  }
}
