interface RetailerRow {
  name: string
  sales: number
  salesWoW: number
  salesYoY: number
  unitSales: number
  unitSalesWoW: number
  unitSalesYoY: number
  avgRetailPrice: number
  weeksOfSupply: number
  returnsRate: number
  scanningLocations: number
}

interface RetailerTableProps {
  data: RetailerRow[]
}

function PercentCell({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span className={`font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
      {isPositive ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

function formatSales(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value}`
}

export default function RetailerTable({ data }: RetailerTableProps) {
  const totals = data.reduce(
    (acc, row) => ({
      sales: acc.sales + row.sales,
      unitSales: acc.unitSales + row.unitSales,
    }),
    { sales: 0, unitSales: 0 }
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Retailer Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-medium">Retailer</th>
              <th className="px-4 py-3 text-right font-medium">Sales $</th>
              <th className="px-4 py-3 text-right font-medium">WoW%</th>
              <th className="px-4 py-3 text-right font-medium">YoY%</th>
              <th className="px-4 py-3 text-right font-medium">Units</th>
              <th className="px-4 py-3 text-right font-medium">Units WoW%</th>
              <th className="px-4 py-3 text-right font-medium">Units YoY%</th>
              <th className="px-4 py-3 text-right font-medium">Avg Price</th>
              <th className="px-4 py-3 text-right font-medium">WoS</th>
              <th className="px-4 py-3 text-right font-medium">Returns%</th>
              <th className="px-4 py-3 text-right font-medium">Locations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row) => (
              <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900">{row.name}</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatSales(row.sales)}</td>
                <td className="px-4 py-3 text-right"><PercentCell value={row.salesWoW} /></td>
                <td className="px-4 py-3 text-right"><PercentCell value={row.salesYoY} /></td>
                <td className="px-4 py-3 text-right text-gray-700">{row.unitSales.toLocaleString()}</td>
                <td className="px-4 py-3 text-right"><PercentCell value={row.unitSalesWoW} /></td>
                <td className="px-4 py-3 text-right"><PercentCell value={row.unitSalesYoY} /></td>
                <td className="px-4 py-3 text-right text-gray-700">${row.avgRetailPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{row.weeksOfSupply.toFixed(1)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{row.returnsRate.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {row.scanningLocations > 0 ? row.scanningLocations.toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-teal-50 font-semibold">
              <td className="px-4 py-3 text-gray-900">Total</td>
              <td className="px-4 py-3 text-right text-gray-900">{formatSales(totals.sales)}</td>
              <td colSpan={2} />
              <td className="px-4 py-3 text-right text-gray-900">{totals.unitSales.toLocaleString()}</td>
              <td colSpan={6} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
