"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { products, productColors, retailers, retailerColors } from "@/lib/mockData";

interface Props {
  dailyData: Record<string, number | string>[];
  weeklyData: Record<string, number | string>[];
}

export default function SalesCharts({ dailyData, weeklyData }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Unit Sales (Last Week)
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => (typeof v === "number" ? v.toLocaleString() : v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {products.map((p, i) => (
              <Bar key={p} dataKey={p} stackId="a" fill={productColors[i]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Unit Sales (Last 52 Weeks)
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyData.slice(-52)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="week"
              tick={{ fontSize: 9 }}
              interval={7}
            />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => (typeof v === "number" ? v.toLocaleString() : v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {retailers.map((r) => (
              <Bar key={r.name} dataKey={r.name} stackId="a" fill={retailerColors[r.name]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
