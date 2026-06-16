interface KPICardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  subtitle?: string
}

export default function KPICard({ title, value, change, changeLabel, subtitle }: KPICardProps) {
  const isPositive = change !== undefined && change >= 0
  const changeColor = change === undefined ? '' : isPositive ? 'text-emerald-600' : 'text-red-500'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {change !== undefined && (
        <p className={`text-sm font-medium ${changeColor}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%{' '}
          <span className="text-gray-400 font-normal">{changeLabel}</span>
        </p>
      )}
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  )
}
