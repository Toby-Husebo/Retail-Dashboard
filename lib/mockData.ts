export const retailers = [
  {
    name: "Target",
    sales: 1900000,
    salesWoW: 2.3,
    salesYoY: 45.2,
    unitSales: 52341,
    unitSalesWoW: 1.8,
    unitSalesYoY: 38.6,
    avgRetailPrice: 36.29,
    weeksOfSupply: 8.2,
    returnsRate: 1.2,
    scanningLocations: 1847,
  },
  {
    name: "Walmart",
    sales: 1364589,
    salesWoW: -1.2,
    salesYoY: 210.5,
    unitSales: 37599,
    unitSalesWoW: -0.8,
    unitSalesYoY: 195.3,
    avgRetailPrice: 36.29,
    weeksOfSupply: 10.4,
    returnsRate: 0.9,
    scanningLocations: 3421,
  },
  {
    name: "Ulta",
    sales: 905578,
    salesWoW: 3.7,
    salesYoY: 28.4,
    unitSales: 24953,
    unitSalesWoW: 4.1,
    unitSalesYoY: 22.7,
    avgRetailPrice: 36.29,
    weeksOfSupply: 6.8,
    returnsRate: 1.5,
    scanningLocations: 1385,
  },
  {
    name: "iHerb",
    sales: 235584,
    salesWoW: 5.2,
    salesYoY: 67.8,
    unitSales: 6490,
    unitSalesWoW: 6.1,
    unitSalesYoY: 58.3,
    avgRetailPrice: 36.30,
    weeksOfSupply: 12.1,
    returnsRate: 0.4,
    scanningLocations: 0,
  },
  {
    name: "Revolve",
    sales: 148920,
    salesWoW: -3.4,
    salesYoY: 15.6,
    unitSales: 4103,
    unitSalesWoW: -2.9,
    unitSalesYoY: 12.1,
    avgRetailPrice: 36.30,
    weeksOfSupply: 9.3,
    returnsRate: 2.1,
    scanningLocations: 0,
  },
  {
    name: "Meijer",
    sales: 198432,
    salesWoW: 0.8,
    salesYoY: 89.4,
    unitSales: 5468,
    unitSalesWoW: 1.2,
    unitSalesYoY: 78.9,
    avgRetailPrice: 36.29,
    weeksOfSupply: 7.6,
    returnsRate: 1.0,
    scanningLocations: 258,
  },
]

export const products = [
  "Purr Gummies",
  "Debloat Gummies",
  "Sleep Gummies",
  "Burn Gummies",
  "Play Gummies",
  "Tone Gummies",
  "Glow Gummies",
]

export const productColors = [
  "#00897B",
  "#26A69A",
  "#4DB6AC",
  "#80CBC4",
  "#00695C",
  "#00796B",
  "#43A047",
]

export const retailerColors = [
  "#00897B",
  "#1565C0",
  "#E53935",
  "#FB8C00",
  "#8E24AA",
  "#00ACC1",
]

export const weeklyUnitSalesByDay = [
  {
    day: "Mon",
    "Purr Gummies": 1240,
    "Debloat Gummies": 980,
    "Sleep Gummies": 870,
    "Burn Gummies": 720,
    "Play Gummies": 540,
    "Tone Gummies": 460,
    "Glow Gummies": 380,
  },
  {
    day: "Tue",
    "Purr Gummies": 1180,
    "Debloat Gummies": 1050,
    "Sleep Gummies": 920,
    "Burn Gummies": 680,
    "Play Gummies": 590,
    "Tone Gummies": 490,
    "Glow Gummies": 410,
  },
  {
    day: "Wed",
    "Purr Gummies": 1320,
    "Debloat Gummies": 1100,
    "Sleep Gummies": 890,
    "Burn Gummies": 760,
    "Play Gummies": 610,
    "Tone Gummies": 520,
    "Glow Gummies": 440,
  },
  {
    day: "Thu",
    "Purr Gummies": 1290,
    "Debloat Gummies": 1020,
    "Sleep Gummies": 950,
    "Burn Gummies": 790,
    "Play Gummies": 580,
    "Tone Gummies": 500,
    "Glow Gummies": 420,
  },
  {
    day: "Fri",
    "Purr Gummies": 1560,
    "Debloat Gummies": 1280,
    "Sleep Gummies": 1120,
    "Burn Gummies": 940,
    "Play Gummies": 720,
    "Tone Gummies": 610,
    "Glow Gummies": 530,
  },
  {
    day: "Sat",
    "Purr Gummies": 1820,
    "Debloat Gummies": 1490,
    "Sleep Gummies": 1350,
    "Burn Gummies": 1120,
    "Play Gummies": 860,
    "Tone Gummies": 740,
    "Glow Gummies": 650,
  },
  {
    day: "Sun",
    "Purr Gummies": 1680,
    "Debloat Gummies": 1380,
    "Sleep Gummies": 1240,
    "Burn Gummies": 1050,
    "Play Gummies": 790,
    "Tone Gummies": 680,
    "Glow Gummies": 590,
  },
]

function generateWeeklyData() {
  const data = []
  const now = new Date()
  for (let i = 51; i >= 0; i--) {
    const weekDate = new Date(now)
    weekDate.setDate(weekDate.getDate() - i * 7)
    const weekLabel = `W${52 - i}`
    const baseMultiplier = 1 + (52 - i) * 0.008

    data.push({
      week: weekLabel,
      Target: Math.round(52341 * baseMultiplier * (0.85 + Math.random() * 0.3)),
      Walmart: Math.round(37599 * baseMultiplier * (0.85 + Math.random() * 0.3)),
      Ulta: Math.round(24953 * baseMultiplier * (0.85 + Math.random() * 0.3)),
      iHerb: Math.round(6490 * baseMultiplier * (0.85 + Math.random() * 0.3)),
      Revolve: Math.round(4103 * baseMultiplier * (0.85 + Math.random() * 0.3)),
      Meijer: Math.round(5468 * baseMultiplier * (0.85 + Math.random() * 0.3)),
    })
  }
  return data
}

export const last52WeeksData = generateWeeklyData()

export const kpiData = {
  totalSales: 3753103,
  salesWoW: 1.4,
  salesYoY: 50.2,
  totalUnitSales: 130954,
  unitSalesWoW: 1.1,
}

export function getCurrentFiscalWeek() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  return `FW${weekNum} ${now.getFullYear()}`
}

export function getFiscalWeeks() {
  const weeks = []
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const currentWeek = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  for (let i = currentWeek; i >= 1; i--) {
    weeks.push(`FW${i} ${now.getFullYear()}`)
  }
  return weeks
}
