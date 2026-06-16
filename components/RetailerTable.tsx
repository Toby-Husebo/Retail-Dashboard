'use client'

import type { RetailerRow } from '@/lib/periodData'

interface Props {
  data: RetailerRow[]
  compareLabel: string
}

function Pct({ val }: { val: number }) {
  const pos = val >= 0
  const abs = Math.min(Math.abs(val), 20)
  const alpha = (abs / 20) * 0.15
  const bg = pos ? `rgba(16,185,129,${alpha})` : `rgba(239,68,68,${alpha})`
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${pos ? 'text-emerald-700' : 'text-red-600'}`}
      style={{ background: bg }}
    >
      {pos ? '+' : ''}{val.toFixed(1)}%
    </span>
  )
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

export default function RetailerTable({ data, compareLabel }: Props) {
  const totals = data.reduce((a, r) => ({ sales: a.sales + r.sales, units: a.units + r.unitSales }), { sales: 0, units: 0 })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Retailer Performance</h3>
        <span className="text-xs text-gray-400">vs {compareLabel}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-medium">Retailer</th>
              <th className="px-4 py-3 text-right font-medium">Sales $</th>
              <th className="px-4 py-3 text-right font-medium">vs Prior</th>
              <th className="px-4 py-3 text-right font-medium">YoY</th>
              <th className="px-4 py-3 text-right font-medium">Units</th>
              <th className="px-4 py-3 text-right font-medium">Units Chg</th>
              <th className="px-4 py-3 text-right font-medium">Units YoY</th>
              <th className="px-4 py-3 text-right font-medium">UPSS</th>
              <th className="px-4 py-3 text-right font-medium">Avg $</th>
              <th className="px-4 py-3 text-right font-medium">WoS</th>
              <th className="px-4 py-3 text-right font-medium">Returns</th>
              <th className="px-4 py-3 text-right font-medium">Locations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(row => (
              <tr key={row.name} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{row.name}</span>
                    {row.lowStockAlert && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">⚠ Low Stock</span>
                    )}
                    {row.decliningAlert && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">↓ Declining</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-800">{fmt(row.sales)}</td>
                <td className="px-4 py-3 text-right"><Pct val={row.salesChange} /></td>
                <td className="px-4 py-3 text-right"><Pct val={row.salesYoY} /></td>
                <td className="px-4 py-3 text-right text-gray-700">{row.unitSales.toLocaleString()}</td>
                <td className="px-4 py-3 text-right"><Pct val={row.unitSalesChange} /></td>
                <td className="px-4 py-3 text-right"><Pct val={row.unitSalesYoY} /></td>
                <td className="px-4 py-3 text-right text-gray-600 text-xs">
                  {row.upss !== null ? row.upss.toFixed(2) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">${row.avgRetailPrice.toFixed(2)}</td>
                <td className={`px-4 py-3 text-right font-medium ${row.weeksOfSupply < 4 ? 'text-red-600' : row.weeksOfSupply < 6 ? 'text-amber-600' : 'text-gray-600'}`}>
                  {row.weeksOfSupply.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{row.returnsRate.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {row.scanningLocations > 0 ? row.scanningLocations.toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-teal-50 font-semibold border-t border-teal-100">
              <td className="px-4 py-3 text-gray-900">Total</td>
              <td className="px-4 py-3 text-right text-gray-900">{fmt(totals.sales)}</td>
              <td colSpan={2} />
              <td className="px-4 py-3 text-right text-gray-900">{totals.units.toLocaleString()}</td>
              <td colSpan={7} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
