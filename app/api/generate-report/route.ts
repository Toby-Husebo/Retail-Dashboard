import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getRetailerData, getKPIData, type RetailerRow } from '@/lib/periodData'

function fmtSales(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 100_000) return `$${(n / 1_000_000).toFixed(3)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

function pct(val: number) {
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`
}

function buildRetailerSection(row: RetailerRow): string {
  let section = `${row.name}\n`
  section += `${fmtSales(row.sales)} (${pct(row.salesChange)} vs prior, ${pct(row.salesYoY)} YoY) · ${row.unitSales.toLocaleString()} units\n`

  // Department breakdown
  if (row.departments) {
    for (const [dept, d] of Object.entries(row.departments)) {
      section += `  • ${dept}: ${fmtSales(d.sales)} (${pct(d.salesChange)} vs prior) · ${d.units.toLocaleString()} units\n`
    }
  }
  return section
}

export async function POST(request: Request) {
  const body = await request.json()
  const { week, periodOffset = 0 } = body

  // Build live data snapshot
  const rows = getRetailerData('week', periodOffset, 'prior_period')
  const kpi = getKPIData('week', periodOffset, 'prior_period')

  const dataBlock = rows.map(buildRetailerSection).join('\n')

  const prompt = `You are writing a weekly retail sales performance summary for the Lemme brand (health/wellness gummy supplements).

Write a professional email-style narrative for ${week || kpi.periodLabel}.

LIVE DATA:
Total Sales: ${fmtSales(kpi.totalSales)} (${pct(kpi.salesChange)} vs prior period, ${pct(kpi.salesYoY)} YoY)
Total Units: ${kpi.totalUnits.toLocaleString()} (${pct(kpi.unitsChange)} vs prior)

Retailer breakdown (with department sub-breakouts where available):
${dataBlock}

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

Hi all,

Below is a summary of this week's retail sales performance (${week || kpi.periodLabel}), with key highlights and drivers by retailer.

Lemme at Retail
${fmtSales(kpi.totalSales)} (${pct(kpi.salesChange)} WoW, ${pct(kpi.salesYoY)} YoY)

[For each retailer, write 2–3 sentences about WoW performance and key trends. For Target, include separate callouts for Target Beauty and Target Healthcare. For Walmart, include separate callouts for Walmart Digestive and Walmart VMS. Be specific about which SKUs or departments are driving results.]

Thank you

Keep the tone professional and data-driven. Highlight wins, flag concerns, and note any standout department or SKU trends.`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ report: getSampleReport(week || kpi.periodLabel, rows, kpi) })
  }

  const client = new Anthropic({ apiKey })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const report = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ report })
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json({ report: getSampleReport(week || kpi.periodLabel, rows, kpi) })
  }
}

function getSampleReport(week: string, rows: RetailerRow[], kpi: { totalSales: number; salesChange: number; salesYoY: number; totalUnits: number; unitsChange: number }) {
  const target = rows.find(r => r.name === 'Target')
  const walmart = rows.find(r => r.name === 'Walmart')
  const ulta = rows.find(r => r.name === 'Ulta')

  return `Hi all,

Below is a summary of this week's retail sales performance (${week}), with key highlights and drivers by retailer.

Lemme at Retail
${fmtSales(kpi.totalSales)} (${pct(kpi.salesChange)} WoW, ${pct(kpi.salesYoY)} YoY)

Target
${target ? `${fmtSales(target.sales)} (${pct(target.salesChange)} WoW, ${pct(target.salesYoY)} YoY) across ${target.unitSales.toLocaleString()} units.` : ''}
${target?.departments?.['Beauty'] ? `  • Target Beauty: ${fmtSales(target.departments['Beauty'].sales)} (${pct(target.departments['Beauty'].salesChange)} WoW) — strong velocity on Purr and Glow Gummies.` : ''}
${target?.departments?.['Healthcare'] ? `  • Target Healthcare: ${fmtSales(target.departments['Healthcare'].sales)} (${pct(target.departments['Healthcare'].salesChange)} WoW) — Debloat and Sleep continue to perform.` : ''}

Walmart
${walmart ? `${fmtSales(walmart.sales)} (${pct(walmart.salesChange)} WoW, ${pct(walmart.salesYoY)} YoY) across ${walmart.unitSales.toLocaleString()} units.` : ''}
${walmart?.departments?.['Digestive'] ? `  • Walmart Digestive: ${fmtSales(walmart.departments['Digestive'].sales)} (${pct(walmart.departments['Digestive'].salesChange)} WoW).` : ''}
${walmart?.departments?.['VMS'] ? `  • Walmart VMS: ${fmtSales(walmart.departments['VMS'].sales)} (${pct(walmart.departments['VMS'].salesChange)} WoW) — Tone and Play Gummies driving growth.` : ''}

Ulta
${ulta ? `${fmtSales(ulta.sales)} (${pct(ulta.salesChange)} WoW, ${pct(ulta.salesYoY)} YoY) — continued momentum in the beauty channel.` : ''}

Thank you`
}
