import KPICard from '@/components/KPICard'
import SalesChart from '@/components/SalesChart'
import RetailerTable from '@/components/RetailerTable'
import {
  retailers,
  products,
  productColors,
  retailerColors,
  weeklyUnitSalesByDay,
  last52WeeksData,
  kpiData,
  getCurrentFiscalWeek,
} from '@/lib/mockData'

export default function DashboardPage() {
  const fiscalWeek = getCurrentFiscalWeek()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retail Insights Hub</h1>
          <p className="text-sm text-gray-500 mt-0.5">Current period: {fiscalWeek}</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
          Live Data
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Sales"
          value={`$${(kpiData.totalSales / 1000000).toFixed(2)}M`}
          change={kpiData.salesWoW}
          changeLabel="WoW"
        />
        <KPICard
          title="Sales WoW"
          value={`${kpiData.salesWoW > 0 ? '+' : ''}${kpiData.salesWoW.toFixed(1)}%`}
          subtitle="vs prior week"
        />
        <KPICard
          title="Sales YoY"
          value={`+${kpiData.salesYoY.toFixed(1)}%`}
          subtitle="vs prior year"
        />
        <KPICard
          title="Total Units"
          value={kpiData.totalUnitSales.toLocaleString()}
          change={kpiData.unitSalesWoW}
          changeLabel="WoW"
        />
        <KPICard
          title="Unit Sales WoW"
          value={`${kpiData.unitSalesWoW > 0 ? '+' : ''}${kpiData.unitSalesWoW.toFixed(1)}%`}
          subtitle="vs prior week"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesChart
          title="Unit Sales Last Week (by Product)"
          data={weeklyUnitSalesByDay}
          keys={products}
          colors={productColors}
          xKey="day"
          yLabel="Units"
        />
        <SalesChart
          title="Unit Sales Last 52 Weeks (by Retailer)"
          data={last52WeeksData}
          keys={['Target', 'Walmart', 'Ulta', 'iHerb', 'Revolve', 'Meijer']}
          colors={retailerColors}
          xKey="week"
          yLabel="Units"
        />
      </div>

      {/* Retailer Table */}
      <RetailerTable data={retailers} />
    </div>
  )
}
