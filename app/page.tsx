'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts'
import KPICard from '@/components/KPICard'
import RetailerTable from '@/components/RetailerTable'
import {
  getKPIData, getRetailerData, getProductCompareData, getRetailerChartData,
  getAvailablePeriods, allProducts, productColorMap, retailerColorMap, retailerList, channelConfig,
  type ViewMode, type CompareMode, type KPISnapshot, type RetailerRow,
} from '@/lib/periodData'

type InsightState = { loading: boolean; bullets: string[] }

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 100_000) return `$${(n / 1_000_000).toFixed(3)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

export default function DashboardPage() {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<ViewMode>('week')
  const [periodOffset, setPeriodOffset] = useState(0)
  const [compare, setCompare] = useState<CompareMode>('prior_period')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [channelFilter, setChannelFilter] = useState<string>('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [insights, setInsights] = useState<InsightState>({ loading: false, bullets: [] })

  const kpi: KPISnapshot = getKPIData(view, periodOffset, compare, channelFilter || undefined, departmentFilter || undefined)
  const retailers: RetailerRow[] = getRetailerData(view, periodOffset, compare, channelFilter || undefined, departmentFilter || undefined)
  const productCompare = getProductCompareData(view, periodOffset, compare, selectedProducts)
  const retailerData = getRetailerChartData(view, periodOffset, channelFilter || undefined)
  const periods = getAvailablePeriods(view)

  // Available departments based on selected channel
  const availableDepts = channelFilter && channelConfig[channelFilter]?.departments
    ? channelConfig[channelFilter].departments!
    : []

  const fetchInsights = useCallback(async () => {
    setInsights({ loading: true, bullets: [] })
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kpi, retailers, periodLabel: kpi.periodLabel, compareLabel: kpi.comparePeriodLabel, view }),
      })
      if (res.ok) {
        const { insights: data } = await res.json()
        setInsights({ loading: false, bullets: Array.isArray(data) ? data : [] })
      } else {
        setInsights({ loading: false, bullets: [] })
      }
    } catch {
      setInsights({ loading: false, bullets: [] })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, periodOffset, compare, channelFilter, departmentFilter])

  useEffect(() => { fetchInsights() }, [fetchInsights])

  function toggleProduct(p: string) {
    setSelectedProducts(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  // Clear department when channel changes
  function handleChannelChange(ch: string) {
    setChannelFilter(ch)
    setDepartmentFilter('')
  }

  // Clustered bar chart data: one entry per product, with current + prior bars
  const clusterData = productCompare.map(p => ({
    name: p.shortName,
    [kpi.periodLabel]: p.current,
    [kpi.comparePeriodLabel]: p.prior,
    color: p.color,
  }))

  const retailersForChart = channelFilter
    ? retailerList.filter(r => r.name === channelFilter)
    : retailerList

  return (
    <div className="space-y-5" ref={dashboardRef}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{kpi.periodLabel}</p>
            <p className="text-xs text-gray-400 mt-0.5">vs {kpi.comparePeriodLabel}</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-4 flex flex-wrap gap-5 items-start">
        {/* View */}
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">View</p>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(['week', 'month', 'year'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => { setView(v); setPeriodOffset(0) }}
                className={`px-3 py-1.5 font-medium transition-colors capitalize ${view === v ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Period */}
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Period</p>
          <select value={periodOffset} onChange={e => setPeriodOffset(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
            {periods.map(p => <option key={p.offset} value={p.offset}>{p.label}</option>)}
          </select>
        </div>

        {/* Compare */}
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Compare To</p>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {([['prior_period', 'Prior Period'], ['prior_year', 'Prior Year']] as [CompareMode, string][]).map(([v, label]) => (
              <button key={v} onClick={() => setCompare(v)}
                className={`px-3 py-1.5 font-medium transition-colors ${compare === v ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Channel filter */}
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Channel</p>
          <select value={channelFilter} onChange={e => handleChannelChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
            <option value="">All Retailers</option>
            {retailerList.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
          </select>
        </div>

        {/* Department filter (only when channel has depts) */}
        {availableDepts.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Department</p>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              <button onClick={() => setDepartmentFilter('')}
                className={`px-3 py-1.5 font-medium transition-colors ${departmentFilter === '' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                All
              </button>
              {availableDepts.map(d => (
                <button key={d} onClick={() => setDepartmentFilter(d)}
                  className={`px-3 py-1.5 font-medium transition-colors ${departmentFilter === d ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product filter — dropdown */}
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Products</p>
          <div className="relative group">
            <button className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[140px] justify-between">
              <span>{selectedProducts.length === 0 ? 'All SKUs' : `${selectedProducts.length} selected`}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[200px] hidden group-hover:block">
              <button onClick={() => setSelectedProducts([])}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedProducts.length === 0 ? 'font-semibold text-teal-700' : 'text-gray-700'}`}>
                All SKUs
              </button>
              <div className="border-t border-gray-100 mt-1 pt-1">
                {allProducts.map(p => (
                  <button key={p} onClick={() => toggleProduct(p)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: productColorMap[p] }} />
                    <span className={selectedProducts.includes(p) ? 'font-semibold text-teal-700' : 'text-gray-700'}>
                      {p.replace(' Gummies', '')}
                    </span>
                    {selectedProducts.includes(p) && <span className="ml-auto text-teal-600">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl px-5 py-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold flex items-center gap-1.5">
            <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Key Insights — {kpi.periodLabel}
          </span>
          <button onClick={fetchInsights} disabled={insights.loading}
            className="text-xs text-teal-200 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1">
            {insights.loading
              ? <span className="inline-block w-3 h-3 border border-teal-200 border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
            Refresh
          </button>
        </div>
        {insights.loading && insights.bullets.length === 0
          ? <div className="flex gap-3">{[1,2,3].map(i => <div key={i} className="h-3.5 bg-teal-500 rounded animate-pulse flex-1" />)}</div>
          : <ul className="flex flex-col gap-1">
              {insights.bullets.map((b, i) => (
                <li key={i} className="text-sm text-teal-50 flex items-start gap-1.5">
                  <span className="text-teal-300 mt-0.5 shrink-0">›</span>{b}
                </li>
              ))}
            </ul>}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard title="Total Sales" value={fmt(kpi.totalSales)}
          change={kpi.salesChange} changeLabel={`vs ${kpi.comparePeriodLabel}`}
          yoyChange={kpi.salesYoY} />
        <KPICard title="Total Units" value={kpi.totalUnits.toLocaleString()}
          change={kpi.unitsChange} changeLabel={`vs ${kpi.comparePeriodLabel}`}
          yoyChange={kpi.unitsYoY} />
        {retailers.slice(0, 3).map(r => (
          <KPICard key={r.name} title={r.name}
            value={fmt(r.sales)}
            change={r.salesChange} changeLabel="vs prior"
            yoyChange={r.salesYoY} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Clustered product bar chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Unit Sales by Product</p>
          <p className="text-xs text-gray-400 mb-4">
            <span className="inline-block w-3 h-2 rounded-sm bg-gray-800 opacity-90 mr-1" />current vs
            <span className="inline-block w-3 h-2 rounded-sm bg-gray-300 ml-2 mr-1" />prior
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={clusterData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v, name) => [typeof v === 'number' ? v.toLocaleString() : v, name]} />
              <Bar dataKey={kpi.periodLabel} radius={[2,2,0,0]}>
                {clusterData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
              <Bar dataKey={kpi.comparePeriodLabel} radius={[2,2,0,0]}>
                {clusterData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.35} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Retailer stacked chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Unit Sales by Retailer</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={retailerData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v, name) => [typeof v === 'number' ? v.toLocaleString() : v, name]} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {retailersForChart.map(r => (
                <Bar key={r.name} dataKey={r.name} stackId="a" fill={retailerColorMap[r.name] || '#94a3b8'} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Retailer table */}
      <RetailerTable data={retailers} compareLabel={kpi.comparePeriodLabel} />
    </div>
  )
}
