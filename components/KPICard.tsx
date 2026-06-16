interface KPICardProps {
  label: string;
  value: string;
  change?: number | null;
  changeLabel?: string;
  secondary?: { value: string; change: number | null; label: string };
}

export default function KPICard({ label, value, change, changeLabel, secondary }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {change !== undefined && change !== null && (
        <p className={`text-sm font-medium mt-1 ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {change >= 0 ? "+" : ""}{change}% {changeLabel}
        </p>
      )}
      {secondary && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600">{secondary.value}</p>
          {secondary.change !== null && (
            <p className={`text-xs font-medium ${secondary.change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {secondary.change >= 0 ? "+" : ""}{secondary.change}% {secondary.label}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
