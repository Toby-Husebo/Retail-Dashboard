import { NextResponse } from 'next/server'

// TODO: Replace this with the real Omni API endpoint once known
// Base URL: https://lemme.omniapp.co
// Auth: Bearer ${process.env.OMNI_API_KEY}

export async function GET() {
  // Mock response until real Omni endpoint is configured
  return NextResponse.json({
    source: 'mock',
    message: 'Configure OMNI_API_KEY and update this route with the real Omni query endpoint.',
    data: {
      totalSales: 3753103,
      totalUnits: 130954,
      weekLabel: 'FW24 2025',
      retailers: [
        { name: 'Target', sales: 1900000, units: 52341 },
        { name: 'Walmart', sales: 1364589, units: 37599 },
        { name: 'Ulta', sales: 905578, units: 24953 },
        { name: 'iHerb', sales: 235584, units: 6490 },
        { name: 'Revolve', sales: 148920, units: 4103 },
        { name: 'Meijer', sales: 198432, units: 5468 },
      ],
    },
  })
}
