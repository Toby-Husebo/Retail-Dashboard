import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  const body = await request.json()
  const { week } = body

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured', report: getSampleReport(week) },
      { status: 200 }
    )
  }

  const client = new Anthropic({ apiKey })

  const prompt = `You are writing a weekly retail sales performance summary for the Lemme brand (health/wellness gummy supplements). 

Write a professional email-style narrative for ${week} using this data:

Total Sales: $3.75M (+1.4% WoW, +50% YoY)
Total Units: 130,954 (+1.1% WoW)

Retailer breakdown:
- Target: $1.9M (+2.3% WoW, +45.2% YoY), 52,341 units
- Walmart: $1.36M (-1.2% WoW, +210.5% YoY), 37,599 units  
- Ulta: $905K (+3.7% WoW, +28.4% YoY), 24,953 units
- iHerb: $235K (+5.2% WoW, +67.8% YoY), 6,490 units
- Revolve: $148K (-3.4% WoW, +15.6% YoY), 4,103 units
- Meijer: $198K (+0.8% WoW, +89.4% YoY), 5,468 units

Products: Purr Gummies, Debloat Gummies, Sleep Gummies, Burn Gummies, Play Gummies, Tone Gummies, Glow Gummies

Write in this style:
Hi all,

Below is a summary of last week's retail sales performance, with key highlights and drivers by retailer. Overall, the business [summary sentence].

Lemme at Retail
$[total] ([WoW]% WoW, +[YoY]% YoY)

[Retailer name]
[Key insight about WoW performance and any notable drivers]

[Continue for each retailer...]

Thank you

Keep it concise, professional, and highlight the most important trends. 2-3 sentences max per retailer.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const report = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ report })
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json({ report: getSampleReport(week) })
  }
}

function getSampleReport(week: string) {
  return `Hi all,

Below is a summary of last week's retail sales performance (${week}), with key highlights and drivers by retailer. Overall, the business increased slightly WoW, driven by growth at Ulta, iHerb, and Target.

Lemme at Retail
$3.75M (+1.4% WoW, +50% YoY)

Target
+2.3% WoW — solid performance across both Beauty and Healthcare categories. Strong velocity on Purr and Debloat Gummies continues to drive results.

Walmart
-1.2% WoW — slight pullback following strong prior weeks. YoY performance remains exceptional at +210%, reflecting the brand's rapid expansion in mass retail.

Ulta
+3.7% WoW — continued momentum in beauty channel. Sleep and Glow Gummies performing well with the core Ulta customer.

iHerb
+5.2% WoW — strongest WoW growth this week, driven by international demand and strong search visibility for wellness products.

Revolve
-3.4% WoW — softness in fashion-adjacent channel; seasonal normalization after recent promotional period.

Meijer
+0.8% WoW — stable performance in Midwest regional. Distribution build still underway across 258 scanning locations.

Thank you`
}
