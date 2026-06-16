import { NextResponse } from 'next/server'

interface ReportEntry {
  week: string
  content: string
  savedAt: string
}

async function getKV() {
  try {
    const { kv } = await import('@vercel/kv')
    return kv
  } catch {
    return null
  }
}

export async function GET() {
  const kv = await getKV()
  if (!kv) {
    return NextResponse.json({ reports: [], message: 'KV not configured' })
  }

  try {
    const keys = await kv.keys('report:*')
    const reports: ReportEntry[] = []
    for (const key of keys) {
      const val = await kv.get<ReportEntry>(key)
      if (val) reports.push(val)
    }
    reports.sort((a, b) => b.week.localeCompare(a.week))
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('KV error:', error)
    return NextResponse.json({ reports: [] })
  }
}

export async function POST(request: Request) {
  const { week, content } = await request.json()

  const kv = await getKV()
  if (!kv) {
    return NextResponse.json({ success: false, message: 'KV not configured' }, { status: 503 })
  }

  try {
    const entry: ReportEntry = { week, content, savedAt: new Date().toISOString() }
    await kv.set(`report:${week}`, entry)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('KV save error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
