import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { weekLabel, kpi, retailers } = await req.json();

  const dataContext = `
Week: ${weekLabel}
Total Sales: $${(kpi.totalSales / 1000000).toFixed(1)}M (${kpi.totalSalesWoW > 0 ? "+" : ""}${kpi.totalSalesWoW}% WoW, +${kpi.totalSalesYoY}% YoY)
Total Unit Sales: ${kpi.totalUnitSales.toLocaleString()} (${kpi.totalUnitSalesWoW > 0 ? "+" : ""}${kpi.totalUnitSalesWoW}% WoW)

Retailer breakdown:
${retailers
  .map(
    (r: { name: string; sales: number; salesWoW: number; unitSales: number; unitSalesWoW: number; avgRetailPrice: number; weeksOfSupply: number }) =>
      `- ${r.name}: $${(r.sales / 1000).toFixed(0)}K sales, ${r.salesWoW > 0 ? "+" : ""}${r.salesWoW}% WoW | ${r.unitSales.toLocaleString()} units, ${r.unitSalesWoW > 0 ? "+" : ""}${r.unitSalesWoW}% WoW | Avg price $${r.avgRetailPrice} | ${r.weeksOfSupply ?? "—"} wks supply`
  )
  .join("\n")}
`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are writing a weekly retail sales performance summary email for the Lemme brand team.

Write it in this exact style and format — concise, professional, bullet-pointed by retailer:

---
Hi all,

Below is a summary of last week's retail sales performance, with key highlights and drivers by retailer. Overall, [one sentence summary of overall trend].

Lemme at Retail
$X.XM (X.X% WoW, +X% YoY)

[Retailer Name]
[+X% or Flat or -X%] WoW [optional: (Category A: +X%; Category B: -X%)]
[2-3 specific bullet points on what drove performance, notable SKUs, any operational issues]

[repeat for each retailer]

Additional detail is available in the Alloy view below, showing sales trends by week, retailer, and SKU.

Thank you
---

Use this data:
${dataContext}

Be specific and data-driven. Use the actual numbers. Keep each retailer section to 2-4 lines.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ report: text });
}
