import KPICard from "@/components/KPICard";
import RetailerTable from "@/components/RetailerTable";
import SalesCharts from "@/components/SalesCharts";
import { kpiData, dailyUnitSales, weeklyUnitSales } from "@/lib/mockData";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-gray-900 text-lg">Retail Insights Hub</span>
            <nav className="flex gap-1">
              <Link href="/" className="px-3 py-1.5 rounded-md text-sm font-medium bg-teal-50 text-teal-700">
                Dashboard
              </Link>
              <Link href="/weekly-report" className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Weekly Report
              </Link>
            </nav>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            Jun 7 – 13, 2026
          </span>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard
            label="Total Sales"
            value={`$${(kpiData.totalSales / 1000000).toFixed(1)}M`}
            change={kpiData.totalSalesWoW}
            changeLabel="WoW"
            secondary={{ value: `+${kpiData.totalSalesYoY}% YoY`, change: kpiData.totalSalesYoY, label: "YoY" }}
          />
          <KPICard label="Unit Sales" value={kpiData.totalUnitSales.toLocaleString()} change={kpiData.totalUnitSalesWoW} changeLabel="WoW" />
          <KPICard label="Target" value="$1.9M" change={-3.6} changeLabel="WoW" />
          <KPICard label="Walmart" value="37,599 units" change={-0.6} changeLabel="WoW" />
          <KPICard label="Ulta" value="24,953 units" change={-2.7} changeLabel="WoW" />
        </div>

        <SalesCharts dailyData={dailyUnitSales} weeklyData={weeklyUnitSales} />

        <RetailerTable />
      </main>
    </div>
  );
}
