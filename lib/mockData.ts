export const retailers = [
  {
    name: "Target",
    sales: 1897772,
    salesWoW: -3.6,
    salesYoY: 38.6,
    unitSales: 69314,
    unitSalesWoW: -3.8,
    unitSalesYoY: 36.0,
    digitalPenetration: 12.1,
    avgRetailPrice: 27.39,
    weeksOfSupply: 5.82,
    returnsPercent: 1.4,
    scanningLocations: 2018,
    trackedLocations: 2008,
  },
  {
    name: "Walmart",
    sales: 670000,
    salesWoW: -4.4,
    salesYoY: null,
    unitSales: 37599,
    unitSalesWoW: -0.6,
    unitSalesYoY: null,
    digitalPenetration: 0.4,
    avgRetailPrice: 17.83,
    weeksOfSupply: 9.46,
    returnsPercent: 0.7,
    scanningLocations: 4045,
    trackedLocations: 4538,
  },
  {
    name: "Ulta",
    sales: 510000,
    salesWoW: -3.6,
    salesYoY: -3.6,
    unitSales: 24953,
    unitSalesWoW: -2.7,
    unitSalesYoY: 12.6,
    digitalPenetration: 16.9,
    avgRetailPrice: 20.43,
    weeksOfSupply: 11.69,
    returnsPercent: 0.0,
    scanningLocations: 2,
    trackedLocations: 1532,
  },
  {
    name: "iHerb",
    sales: 192900,
    salesWoW: -10.8,
    salesYoY: -32.8,
    unitSales: 6490,
    unitSalesWoW: -11.1,
    unitSalesYoY: -30.4,
    digitalPenetration: null,
    avgRetailPrice: 29.73,
    weeksOfSupply: null,
    returnsPercent: 0.0,
    scanningLocations: 1,
    trackedLocations: null,
  },
  {
    name: "Revolve",
    sales: 81800,
    salesWoW: -5.9,
    salesYoY: -31.6,
    unitSales: 2844,
    unitSalesWoW: -5.8,
    unitSalesYoY: -26.1,
    digitalPenetration: null,
    avgRetailPrice: 28.77,
    weeksOfSupply: 15.73,
    returnsPercent: 0.8,
    scanningLocations: 1,
    trackedLocations: 1,
  },
  {
    name: "Meijer",
    sales: 13400,
    salesWoW: -5.4,
    salesYoY: 36.4,
    unitSales: 447,
    unitSalesWoW: -5.7,
    unitSalesYoY: 13.7,
    digitalPenetration: null,
    avgRetailPrice: 29.92,
    weeksOfSupply: 18.68,
    returnsPercent: 0.0,
    scanningLocations: 207,
    trackedLocations: 273,
  },
];

export const kpiData = {
  totalSales: 3363873,
  totalSalesWoW: 1.4,
  totalSalesYoY: 50.0,
  totalUnitSales: 141647,
  totalUnitSalesWoW: -3.2,
};

export const products = [
  "Purr Gummies",
  "Debloat Gummies",
  "Sleep Gummies",
  "Burn Gummies",
  "Play Gummies",
  "Tone Gummies",
  "Glow Gummies",
];

const productColors = [
  "#00897B",
  "#26A69A",
  "#4DB6AC",
  "#80CBC4",
  "#F4A261",
  "#E76F51",
  "#264653",
];

export { productColors };

const retailerColors: Record<string, string> = {
  Target: "#CC0000",
  Walmart: "#0071CE",
  Ulta: "#000000",
  iHerb: "#5BA617",
  Revolve: "#C8A951",
  Meijer: "#E31837",
};

export { retailerColors };

// Last week daily unit sales by product (Jun 7–13)
const days = ["Jun 7", "Jun 8", "Jun 9", "Jun 10", "Jun 11", "Jun 12", "Jun 13"];
export const dailyUnitSales = days.map((day) => {
  const entry: Record<string, number | string> = { day };
  products.forEach((p, i) => {
    entry[p] = Math.floor(1500 + Math.random() * 1000 - i * 100);
  });
  return entry;
});

// Last 52 weeks unit sales by retailer
export const weeklyUnitSales = Array.from({ length: 52 }, (_, i) => {
  const date = new Date("2025-06-15");
  date.setDate(date.getDate() + i * 7);
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const entry: Record<string, number | string> = { week: label };
  retailers.forEach((r) => {
    entry[r.name] = Math.floor(r.unitSales * (0.7 + Math.random() * 0.6));
  });
  return entry;
});

export const fiscalWeeks = Array.from({ length: 20 }, (_, i) => {
  const d = new Date("2026-06-13");
  d.setDate(d.getDate() - i * 7);
  const end = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const start = new Date(d);
  start.setDate(start.getDate() - 6);
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { label: `${startStr} – ${end}`, value: `fw-${2026}-${String(20 - i).padStart(2, "0")}` };
});
