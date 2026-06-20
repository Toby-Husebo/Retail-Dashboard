import { productColorMap, retailerColorMap, retailerList } from "@/lib/lemmeColors";

export type ViewMode = "week" | "month" | "year";
export type CompareMode = "prior_period" | "prior_year";

export { productColorMap, retailerColorMap, retailerList };

// SKU → department mapping (from Omni SKU classification)
// Target departments: Beauty, Healthcare
// Walmart departments: Digestive, VMS
export const departmentMap: Record<string, { target?: string; walmart?: string }> = {
  "Purr Gummies":           { target: "Beauty",     walmart: "Digestive" },
  "Debloat Gummies":        { target: "Beauty",     walmart: "Digestive" },
  "Sleep Gummies":          { target: "Beauty",     walmart: "VMS" },
  "Burn Gummies":           { target: "Beauty",     walmart: "VMS" },
  "Play Gummies":           { target: "Beauty",     walmart: "VMS" },
  "Tone Gummies":           { target: "Beauty",     walmart: "VMS" },
  "Glow Gummies":           { target: "Beauty" },
  "Purr Gummies (VMS)":     {                       walmart: "VMS" },
  "Sleep Gummies (VMS)":    {                       walmart: "VMS" },
  "Debloat Gummies (VMS)":  { target: "Healthcare", walmart: "VMS" },
  "Burn Capsules":          { target: "Beauty",     walmart: "VMS" },
  "Starface Gummies":       { target: "Beauty" },
  "Creatine Gummies":       { target: "Healthcare", walmart: "Digestive" },
  "Purr Capsules":          { target: "Healthcare", walmart: "Digestive" },
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

// Retailer channels with department sub-views
export const channelConfig: Record<string, { departments?: string[] }> = {
  Target:  { departments: ["Beauty", "Healthcare"] },
  Walmart: { departments: ["Digestive", "VMS"] },
  Ulta:    {},
  iHerb:   {},
  Revolve: {},
  Meijer:  {},
};

// Accurate base metrics — prices match Alloy data
const baseMetrics: Record<string, { sales: number; units: number; price: number; wos: number; returns: number; oos: number; digitalPct: number }> = {
  Target:  { sales: 1897772, units: 69314, price: 27.39, wos: 5.82,  returns: 1.4, oos: 2.1, digitalPct: 12.1 },
  Walmart: { sales: 670000,  units: 37599, price: 17.83, wos: 9.46,  returns: 0.7, oos: 8.3, digitalPct: 0.4  },
  Ulta:    { sales: 510000,  units: 24953, price: 20.43, wos: 11.69, returns: 0.0, oos: 1.2, digitalPct: 16.9 },
  iHerb:   { sales: 192900,  units: 6490,  price: 29.73, wos: 12.0,  returns: 0.0, oos: 0.0, digitalPct: 100  },
  Revolve: { sales: 81800,   units: 2844,  price: 28.77, wos: 15.73, returns: 0.8, oos: 0.0, digitalPct: 100  },
  Meijer:  { sales: 13400,   units: 447,   price: 29.92, wos: 18.68, returns: 0.0, oos: 3.1, digitalPct: 0.0  },
};

// Department split ratios (based on SKU classification — most Target SKUs are Beauty)
const deptSplit: Record<string, Record<string, number>> = {
  Target:  { Beauty: 0.88, Healthcare: 0.12 },
  Walmart: { Digestive: 0.38, VMS: 0.62 },
};

function vary(base: number, seed: number, range = 0.12): number {
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
  oosPercent: number;
  digitalPct: number;
  scanningLocations: number;
  lowStockAlert: boolean;
  decliningAlert: boolean;
  departments?: Record<string, { sales: number; salesChange: number; units: number; unitsChange: number }>;
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

// Week always runs Sunday–Saturday
export function getPeriodLabel(view: ViewMode, periodOffset: number): string {
  // Reference: week ending Sat Jun 13, 2026 (starts Sun Jun 7)
  const refSat = new Date("2026-06-13");
  if (view === "week") {
    const sat = new Date(refSat);
    sat.setDate(sat.getDate() - periodOffset * 7);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() - 6);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
    const fw = 24 - periodOffset;
    return `FW${fw} · ${fmt(sun)} – ${fmt(sat)}`;
  }
  if (view === "month") {
    const d = new Date(refSat);
    d.setMonth(d.getMonth() - periodOffset);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return `${2026 - periodOffset}`;
}

export function getComparePeriodLabel(view: ViewMode, periodOffset: number, compare: CompareMode): string {
  if (compare === "prior_year") {
    const refSat = new Date("2025-06-14"); // same week last year
    if (view === "week") {
      const sat = new Date(refSat);
      sat.setDate(sat.getDate() - periodOffset * 7);
      const sun = new Date(sat);
      sun.setDate(sat.getDate() - 6);
      const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
      const fw = 24 - periodOffset;
      return `FW${fw} · ${fmt(sun)} – ${fmt(sat)} '25`;
    }
    if (view === "month") {
      const d = new Date(refSat);
      d.setMonth(d.getMonth() - periodOffset);
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    return `${2025 - periodOffset}`;
  }
  return getPeriodLabel(view, periodOffset + 1);
}

export function getRetailerData(
  view: ViewMode,
  periodOffset: number,
  compare: CompareMode,
  channelFilter?: string,
  departmentFilter?: string
): RetailerRow[] {
  const mul = multiplierForView(view);
  const gf = growthFactor(periodOffset);
  const priorOffset = compare === "prior_year"
    ? periodOffset + 52
    : periodOffset + (view === "week" ? 1 : view === "month" ? 4 : 52);
  const compareGf = growthFactor(priorOffset);

  const filtered = channelFilter
    ? retailerList.filter(r => r.name === channelFilter)
    : retailerList;

  return filtered.map((r, ri) => {
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

    const weeksOfSupply = parseFloat((base.wos * (0.85 + (Math.sin(periodOffset * (ri + 1)) + 1) * 0.1)).toFixed(1));

    // Department breakdown
    const depts = deptSplit[r.name];
    let departments: RetailerRow["departments"];
    if (depts && !departmentFilter) {
      departments = {};
      for (const [dept, ratio] of Object.entries(depts)) {
        const dUnits = Math.round(units * ratio);
        const dCompareUnits = Math.round(compareUnits * ratio);
        const dSales = Math.round(dUnits * base.price);
        const dCompareSales = Math.round(dCompareUnits * base.price);
        departments[dept] = {
          sales: dSales,
          salesChange: dCompareSales > 0 ? parseFloat((((dSales - dCompareSales) / dCompareSales) * 100).toFixed(1)) : 0,
          units: dUnits,
          unitsChange: dCompareUnits > 0 ? parseFloat((((dUnits - dCompareUnits) / dCompareUnits) * 100).toFixed(1)) : 0,
        };
      }
    }

    // If department filter is active, scale down
    let finalSales = sales;
    let finalUnits = units;
    let finalSalesChange = salesChange;
    let finalUnitsChange = unitsChange;
    if (departmentFilter && depts && depts[departmentFilter] !== undefined) {
      const ratio = depts[departmentFilter];
      finalSales = Math.round(sales * ratio);
      finalUnits = Math.round(units * ratio);
      const cSales = Math.round(compareSales * ratio);
      const cUnits = Math.round(compareUnits * ratio);
      finalSalesChange = cSales > 0 ? parseFloat((((finalSales - cSales) / cSales) * 100).toFixed(1)) : 0;
      finalUnitsChange = cUnits > 0 ? parseFloat((((finalUnits - cUnits) / cUnits) * 100).toFixed(1)) : 0;
    }

    return {
      name: departmentFilter ? `${r.name} ${departmentFilter}` : r.name,
      sales: finalSales,
      salesChange: finalSalesChange,
      salesYoY,
      unitSales: finalUnits,
      unitSalesChange: finalUnitsChange,
      unitSalesYoY: unitsYoY,
      avgRetailPrice: base.price,
      weeksOfSupply,
      returnsRate: base.returns,
      oosPercent: base.oos,
      digitalPct: base.digitalPct,
      scanningLocations: r.locations,
      lowStockAlert: weeksOfSupply < 6,
      decliningAlert: finalUnitsChange < -5,
      departments,
    };
  });
}

export function getKPIData(view: ViewMode, periodOffset: number, compare: CompareMode, channelFilter?: string, departmentFilter?: string): KPISnapshot {
  const rows = getRetailerData(view, periodOffset, compare, channelFilter, departmentFilter);
  const priorOffset = compare === "prior_year" ? periodOffset + 52 : periodOffset + (view === "week" ? 1 : view === "month" ? 4 : 52);
  const compareRows = getRetailerData(view, priorOffset, compare, channelFilter, departmentFilter);
  const yoyRows = getRetailerData(view, periodOffset + 52, compare, channelFilter, departmentFilter);

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

export interface ProductComparePoint {
  product: string;
  shortName: string;
  current: number;
  prior: number;
  color: string;
}

export function getProductCompareData(view: ViewMode, periodOffset: number, compare: CompareMode, selectedProducts: string[]): ProductComparePoint[] {
  const prods = selectedProducts.length > 0 ? selectedProducts : allProducts;
  const mul = multiplierForView(view);
  const gf = growthFactor(periodOffset);
  const priorOffset = compare === "prior_year" ? periodOffset + 52 : periodOffset + 1;
  const priorGf = growthFactor(priorOffset);

  return prods.map((p, pi) => {
    const baseUnits = 6000 + (allProducts.length - pi) * 1200;
    return {
      product: p,
      shortName: p.replace(" Gummies", ""),
      current: vary(Math.round(baseUnits * mul), periodOffset * 10 + pi),
      prior: vary(Math.round(baseUnits * mul * (priorGf / gf)), priorOffset * 10 + pi),
      color: productColorMap[p] || "#94a3b8",
    };
  });
}

export function getRetailerChartData(view: ViewMode, periodOffset: number, channelFilter?: string): Record<string, number | string>[] {
  const labels = view === "week"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : view === "month"
    ? ["W1", "W2", "W3", "W4"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const retailers = channelFilter
    ? retailerList.filter(r => r.name === channelFilter)
    : retailerList;

  return labels.map((label, li) => {
    const entry: Record<string, number | string> = { label };
    retailers.forEach((r, ri) => {
      const base = baseMetrics[r.name].units / (view === "week" ? 7 : view === "month" ? 1 : 0.077);
      const weekend = view === "week" && (li === 0 || li === 6) ? 1.35 : 1;
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
