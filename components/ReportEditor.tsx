'use client'

import { useState, useEffect, useRef } from 'react'
import { getAvailablePeriods, getRetailerData, type RetailerRow } from '@/lib/periodData'

interface SavedReport {
  week: string
  content: string
  savedAt: string
}

export default function ReportEditor() {
  const weeks = getAvailablePeriods('week').map(p => p.label)
  const [selectedOffset, setSelectedOffset] = useState(0)
  const [selectedWeek, setSelectedWeek] = useState(weeks[0])
  const [reportContent, setReportContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    fetchSavedReports()
  }, [])

  async function fetchSavedReports() {
    try {
      const res = await fetch('/api/reports')
      if (res.ok) {
        const data = await res.json()
        setSavedReports(data.reports || [])
      }
    } catch {
      // storage not configured
    }
  }

  async function handleGenerate() {
    setIsGenerating(true)
    setStatusMsg('')
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: selectedWeek, periodOffset: selectedOffset }),
      })
      const data = await res.json()
      if (data.report) {
        setReportContent(data.report)
      } else {
        setStatusMsg('Failed to generate report.')
      }
    } catch {
      setStatusMsg('Error generating report.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    setStatusMsg('')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: selectedWeek, content: reportContent }),
      })
      if (res.ok) {
        setStatusMsg('Report saved!')
        fetchSavedReports()
      } else {
        setStatusMsg('Save failed.')
      }
    } catch {
      setStatusMsg('Error saving report.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDownloadPDF() {
    if (!reportContent) return
    setIsExporting(true)
    setStatusMsg('Capturing dashboard screenshot…')
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })

      // Header
      doc.setFontSize(18)
      doc.setTextColor(15, 118, 110) // teal-700
      doc.text('Lemme Retail Weekly Report', 20, 20)
      doc.setFontSize(11)
      doc.setTextColor(100, 116, 139) // slate-500
      doc.text(selectedWeek, 20, 28)

      // Report text
      doc.setFontSize(10)
      doc.setTextColor(30, 41, 59) // slate-800
      const lines = doc.splitTextToSize(reportContent, 170)
      let y = 38
      for (const line of lines) {
        if (y > 260) {
          doc.addPage()
          y = 20
        }
        doc.text(line, 20, y)
        y += 5
      }

      // Dashboard screenshot
      try {
        const html2canvas = (await import('html2canvas')).default
        const dashEl = window.document.getElementById('dashboard-root')
        if (dashEl) {
          setStatusMsg('Rendering dashboard…')
          const canvas = await html2canvas(dashEl, { scale: 1, useCORS: true, backgroundColor: '#f8fafc' })
          const imgData = canvas.toDataURL('image/jpeg', 0.85)
          doc.addPage()
          doc.setFontSize(11)
          doc.setTextColor(100, 116, 139)
          doc.text('Dashboard Snapshot', 20, 15)
          const imgWidth = 170
          const imgHeight = (canvas.height / canvas.width) * imgWidth
          doc.addImage(imgData, 'JPEG', 20, 20, imgWidth, Math.min(imgHeight, 250))
        }
      } catch {
        // screenshot failed — skip it silently
      }

      doc.save(`retail-report-${selectedWeek.replace(/[\s·/]/g, '-')}.pdf`)
      setStatusMsg('')
    } catch (e) {
      setStatusMsg('PDF export failed.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleDownloadExcel() {
    const XLSX = await import('xlsx')
    const retailers: RetailerRow[] = getRetailerData('week', selectedOffset, 'prior_period')
    const rows = retailers.flatMap(r => {
      const base = [{
        Retailer: r.name,
        Department: 'Total',
        'Sales ($)': r.sales,
        'Sales vs Prior %': r.salesChange,
        'Sales YoY %': r.salesYoY,
        'Unit Sales': r.unitSales,
        'Units vs Prior %': r.unitSalesChange,
        'Units YoY %': r.unitSalesYoY,
        'Weeks of Supply': r.weeksOfSupply,
        'OOS %': r.oosPercent,
        'Digital %': r.digitalPct,
        'Returns %': r.returnsRate,
      }]
      if (r.departments) {
        for (const [dept, d] of Object.entries(r.departments)) {
          base.push({
            Retailer: r.name,
            Department: dept,
            'Sales ($)': d.sales,
            'Sales vs Prior %': d.salesChange,
            'Sales YoY %': 0,
            'Unit Sales': d.units,
            'Units vs Prior %': d.unitsChange,
            'Units YoY %': 0,
            'Weeks of Supply': r.weeksOfSupply,
            'OOS %': r.oosPercent,
            'Digital %': r.digitalPct,
            'Returns %': r.returnsRate,
          })
        }
      }
      return base
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Weekly Data')
    XLSX.writeFile(wb, `retail-data-${selectedWeek.replace(/[\s·/]/g, '-')}.xlsx`)
  }

  function handleOutlookEmail() {
    const subject = encodeURIComponent(`Lemme Retail Weekly Report — ${selectedWeek}`)
    const body = encodeURIComponent(reportContent || '(Generate report first, then use this button.)')
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  function loadSavedReport(report: SavedReport) {
    setSelectedWeek(report.week)
    setReportContent(report.content)
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar */}
      <div className="w-56 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Saved Reports
          </h3>
          {savedReports.length === 0 ? (
            <p className="text-xs text-gray-400">No saved reports yet.</p>
          ) : (
            <ul className="space-y-1">
              {savedReports.map((r) => (
                <li key={r.week}>
                  <button
                    onClick={() => loadSavedReport(r)}
                    className="w-full text-left text-sm px-2 py-1.5 rounded-lg hover:bg-teal-50 text-gray-700 hover:text-teal-700 transition-colors"
                  >
                    {r.week}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fiscal Week</label>
              <select
                value={selectedOffset}
                onChange={(e) => {
                  const offset = parseInt(e.target.value)
                  setSelectedOffset(offset)
                  setSelectedWeek(weeks[offset])
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {weeks.map((w, i) => (
                  <option key={w} value={i}>{w}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2 flex-wrap">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {isGenerating ? 'Generating…' : 'Generate Report'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !reportContent}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!reportContent || isExporting}
                className="px-4 py-2 border border-gray-200 hover:border-teal-400 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {isExporting ? 'Exporting…' : 'Download PDF'}
              </button>
              <button
                onClick={handleDownloadExcel}
                className="px-4 py-2 border border-gray-200 hover:border-teal-400 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Download Excel
              </button>
              <button
                onClick={handleOutlookEmail}
                disabled={!reportContent}
                className="px-4 py-2 border border-blue-200 hover:border-blue-400 text-blue-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Open in Outlook
              </button>
            </div>
          </div>
          {statusMsg && (
            <p className={`mt-2 text-sm ${statusMsg.includes('saved') || statusMsg.includes('Saved') ? 'text-emerald-600' : statusMsg.includes('Captur') || statusMsg.includes('Render') ? 'text-teal-600' : 'text-red-500'}`}>
              {statusMsg}
            </p>
          )}
        </div>

        {/* Report textarea */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Report Narrative — {selectedWeek}
          </label>
          <textarea
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            placeholder="Click 'Generate Report' to create an AI-drafted narrative with department callouts, or type your own…"
            className="w-full h-[calc(100vh-360px)] min-h-[300px] text-sm text-gray-700 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-xs text-gray-400 mt-2">
            The PDF download includes a dashboard snapshot. "Open in Outlook" pre-fills an email with the report text.
          </p>
        </div>
      </div>
    </div>
  )
}
