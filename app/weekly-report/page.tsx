import ReportEditor from '@/components/ReportEditor'

export default function WeeklyReportPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Weekly Report</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Generate, edit, and save your weekly retail narrative
        </p>
      </div>
      <ReportEditor />
    </div>
  )
}
