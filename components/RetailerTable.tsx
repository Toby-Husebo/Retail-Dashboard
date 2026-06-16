"use client";

import { retailers } from "@/lib/mockData";

function Pct({ val }: { val: number | null }) {
  if (val === null) return <span className="text-gray-400">—</span>;
  return (
    <span className={val >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
      {val >= 0 ? "+" : ""}{val}%
    </span>
  );
}

export default function RetailerTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Sales by Retailer — Last Week
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wider">
              <th className="text-left px-5 py-3">Partner</th>
              <th className="text-right px-4 py-3">Sales $</th>
              <th className="text-right px-4 py-3">WoW</th>
              <th className="text-right px-4 py-3">YoY</th>
              <th className="text-right px-4 py-3">Units</th>
              <th className="text-right px-4 py-3">Units WoW</th>
              <th className="text-right px-4 py-3">Units YoY</th>
              <th className="text-right px-4 py-3">Avg Price</th>
              <th className="text-right px-4 py-3">Wks Supply</th>
              <th className="text-right px-4 py-3">Returns %</th>
              <th className="text-right px-4 py-3">Locations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {retailers.map((r) => (
              <tr key={r.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-gray-800">{r.name}</td>
                <td className="px-4 py-3.5 text-right text-gray-700">
                  ${(r.sales / 1000).toFixed(0)}K
                </td>
                <td className="px-4 py-3.5 text-right"><Pct val={r.salesWoW} /></td>
                <td className="px-4 py-3.5 text-right"><Pct val={r.salesYoY} /></td>
                <td className="px-4 py-3.5 text-right text-gray-700">{r.unitSales.toLocaleString()}</td>
                <td className="px-4 py-3.5 text-right"><Pct val={r.unitSalesWoW} /></td>
                <td className="px-4 py-3.5 text-right"><Pct val={r.unitSalesYoY} /></td>
                <td className="px-4 py-3.5 text-right text-gray-700">${r.avgRetailPrice.toFixed(2)}</td>
                <td className="px-4 py-3.5 text-right text-gray-700">
                  {r.weeksOfSupply !== null ? r.weeksOfSupply.toFixed(1) : "—"}
                </td>
                <td className="px-4 py-3.5 text-right text-gray-700">{r.returnsPercent.toFixed(1)}%</td>
                <td className="px-4 py-3.5 text-right text-gray-700">
                  {r.scanningLocations.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold text-gray-800 border-t border-gray-200">
              <td className="px-5 py-3">Total</td>
              <td className="px-4 py-3 text-right">$3,366K</td>
              <td className="px-4 py-3 text-right"><Pct val={1.4} /></td>
              <td className="px-4 py-3 text-right"><Pct val={50.0} /></td>
              <td className="px-4 py-3 text-right">141,647</td>
              <td className="px-4 py-3 text-right"><Pct val={-3.2} /></td>
              <td className="px-4 py-3 text-right"><Pct val={59.5} /></td>
              <td className="px-4 py-3 text-right" colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
