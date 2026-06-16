import { productColorMap, retailerColorMap, retailerList } from "@/lib/lemmeColors";

export type ViewMode = "week" | "month" | "year";
export type CompareMode = "prior_period" | "prior_year";

export { productColorMap, retailerColorMap, retailerList };

const baseMetrics: Record<string, { sales: number; units: number; price: number; wos: number; returns: number }> = {
  Target:  { sales: 1900000, units: 52341, price: 36.29, wos: 8.2,  returns: 1.2 },
  Walmart: { sales: 1364589, units: 37599, price: 36.29, wos: 10.4, returns: 0.9 },
  Ulta:    { sales: 905578,  units: 24953, price: 36.29, wos: 6.8,  returns: 1.5 },
  iHerb:   { sales: 235584,  units: 6490,  price: 36.30, wos: 12.1, returns: 0.4 },
  Revolve: { sales: 148920,  units: 4103,  price: 36.30, wos: 9.3,  returns: 2.1 },
  Meijer:  { sales: 198432,  units: 5468,  price: 36.29, wos: 7.6,  returns: 1.0 },
};

export const allProducts = [
  "Purr Gummies",
  "Debloat Gummies",
  "Sleep Gummies",
  "Burn Gummies",
  "Play Gummies",
  "Tone Gummies",
  "Glow Gummies",
];

function vary(base: number, seed: number, range = 0.15): number {
  const s = Math.sin(seed * 9301 + 49297) * 0.5 + 0.5;
  return Math.round(base * (1 - range / 2 + s * range));
}

function growthFactor(periodOffset: number): number {
  return Math.pow(1.008, -periodOffset);
}

function multiplierForView(view: ViewMode): number {
  if (view === "month") return 4.33;
  if (view === "year") return 52;
  return 1;
}

export interface RetailerRow {
  name: string;
  sales: number;
  salesChange: number;
  salesYoY: number;
  unitSales: number;
  unitSalesChange: number;
  unitSalesYoY: number;
  avgRetailPrice: number;
  weeksOfSupply: number;
  returnsRate: number;
  scanningLocations: number;
  upss: number | null;
  lowStockAlert: boolean;
  decliningAlert: boolean;
}

export interface KPISnapshot {
  totalSales: number;
  salesChange: number;
  salesYoY: number;
  totalUnits: number;
  unitsChange: number;
  unitsYoY: number;
  periodLabel: string;
  comparePeriodLabel: string;
}

export function getPeriodLabel(view: ViewMode, periodOffset: number): string {
  const now = new Date("2026-06-13");
  if (view === "week") {
    const end = new Date(now);
    end.setDate(end.getDate() - periodOffset * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const fw = 24 - periodOffset;
    return `FW${fw} · ${fmt(start)} – ${fmt(end)}, 2026`;
  }
  if (view === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - periodOffset);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return `${2026 - periodOffset}`;
}

export function getComparePeriodLabel(view: ViewMode, periodOffset: number, compare: CompareMode): string {
  if (compare === "prior_year") {
    const label = getPeriodLabel(view, periodOffset);
    return label.replace(/2026/g, "2025");
  }
  return getPeriodLabel(view, periodOffset + 1);
}

export function getRetailerData(view: ViewMode, periodOffset: number, compare: CompareMode): RetailerRow[] {
  const mul = multiplierForView(view);
  const gf = growthFactor(periodOffset);
  const priorOffset = compare === "prior_year" ? periodOffset + 52 : periodOffset + (view === "week" ? 1 : view === "month" ? 4 : 52);
  const compareGf = growthFactor(priorOffset);

  return retailerList.map((r, ri) => {
    const base = baseMetrics[r.name];
    const units = Math.round(vary(base.units, periodOffset * 7 + ri) * mul * gf);
    const compareUnits = Math.round(vary(base.units, priorOffset * 7 + ri) * mul * compareGf);
    const yoyUnits = Math.round(vary(base.units, (periodOffset + 52) * 7 + ri) * mul * growthFactor(periodOffset + 52));

    const sales = Math.round(units * base.price);
    const compareSales = Math.round(compareUnits * base.price);
    const yoySales = Math.round(yoyUnits * base.price);

    const salesChange = compareSales > 0 ? parseFloat((((sales - compareSales) / compareSales) * 100).toFixed(1)) : 0;
    const unitsChange = compareUnits > 0 ? parseFloat((((units - compareUnits) / compareUnits) * 100).toFixed(1)) : 0;
    const salesYoY = yoySales > 0 ? parseFloat((((sales - yoySales) / yoySales) * 100).toFixed(1)) : 0;
    const unitsYoY = yoyUnits > 0 ? parseFloat((((units - yoyUnits) / yoyUnits) * 100).toFixed(1)) : 0;

    const weeksOfSupply = parseFloat((base.wos * (0.85 + (Math.sin(periodOffset * ri + 1) + 1) * 0.15)).toFixed(1));
    const upss = r.locations > 0 ? parseFloat((units / r.locations / (view === "year" ? 52 : view === "month" ? 4.33 : 1)).toFixed(2)) : null;

    return {
      name: r.name,
      sales,
      salesChange,
      salesYoY,
      unitSales: units,
      unitSalesChange: unitsChange,
      unitSalesYoY: unitsYoY,
      avgRetailPrice: base.price,
      weeksOfSupply,
      returnsRate: base.returns,
      scanningLocations: r.locations,
      upss,
      lowStockAlert: weeksOfSupply < 6,
      decliningAlert: unitsChange < -5,
    };
  });
}

export function getKPIData(view: ViewMode, periodOffset: number, compare: CompareMode): KPISnapshot {
  const rows = getRetailerData(view, periodOffset, compare);
  const priorOffset = compare === "prior_year" ? periodOffset + 52 : periodOffset + (view === "week" ? 1 : view === "month" ? 4 : 52);
  const compareRows = getRetailerData(view, priorOffset, compare);
  const yoyRows = getRetailerData(view, periodOffset + 52, compare);

  const totalSales = rows.reduce((s, r) => s + r.sales, 0);
  const totalUnits = rows.reduce((s, r) => s + r.unitSales, 0);
  const compareSales = compareRows.reduce((s, r) => s + r.sales, 0);
  const compareUnits = compareRows.reduce((s, r) => s + r.unitSales, 0);
  const yoySales = yoyRows.reduce((s, r) => s + r.sales, 0);
  const yoyUnits = yoyRows.reduce((s, r) => s + r.unitSales, 0);

  return {
    totalSales,
    salesChange: parseFloat((((totalSales - compareSales) / compareSales) * 100).toFixed(1)),
    salesYoY: parseFloat((((totalSales - yoySales) / yoySales) * 100).toFixed(1)),
    totalUnits,
    unitsChange: parseFloat((((totalUnits - compareUnits) / compareUnits) * 100).toFixed(1)),
    unitsYoY: parseFloat((((totalUnits - yoyUnits) / yoyUnits) * 100).toFixed(1)),
    periodLabel: getPeriodLabel(view, periodOffset),
    comparePeriodLabel: getComparePeriodLabel(view, periodOffset, compare),
  };
}

export function getProductChartData(view: ViewMode, periodOffset: number, selectedProducts: string[]): Record<string, number | string>[] {
  const prods = selectedProducts.length > 0 ? selectedProducts : allProducts;
  const labels = view === "week"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : view === "month"
    ? ["W1", "W2", "W3", "W4"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return labels.map((label, li) => {
    const entry: Record<string, number | string> = { label };
    prods.forEach((p, pi) => {
      const base = view === "week" ? 900 : view === "month" ? 6000 : 28000;
      const weekend = view === "week" && li >= 4 ? 1.4 : 1;
      entry[p] = vary(Math.round((base - pi * 80) * weekend), periodOffset * 10 + li * 3 + pi);
    });
    return entry;
  });
}

export function getRetailerChartData(view: ViewMode, periodOffset: number): Record<string, number | string>[] {
  const labels = view === "week"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : view === "month"
    ? ["W1", "W2", "W3", "W4"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return labels.map((label, li) => {
    const entry: Record<string, number | string> = { label };
    retailerList.forEach((r, ri) => {
      const base = baseMetrics[r.name].units / (view === "week" ? 7 : view === "month" ? 1 : 0.077);
      const weekend = view === "week" && li >= 4 ? 1.4 : 1;
      entry[r.name] = vary(Math.round(base * weekend), periodOffset * 10 + li * 3 + ri);
    });
    return entry;
  });
}

export function getAvailablePeriods(view: ViewMode): { label: string; offset: number }[] {
  const count = view === "week" ? 24 : view === "month" ? 12 : 3;
  return Array.from({ length: count }, (_, i) => ({
    label: getPeriodLabel(view, i),
    offset: i,
  }));
}
