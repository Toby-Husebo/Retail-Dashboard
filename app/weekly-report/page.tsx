"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fiscalWeeks, kpiData, retailers } from "@/lib/mockData";

interface SavedReport {
  weekLabel: string;
  content: string;
  savedAt: string;
}

export default function WeeklyReportPage() {
  const [selectedWeek, setSelectedWeek] = useState(fiscalWeeks[0]);
  const [reportContent, setReportContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedReports, setSavedReports] = useState<Record<string, SavedReport>>({});
  const [downloading, setDownloading] = useState<"pdf" | "excel" | null>(null);

  const loadSavedReports = useCallback(async () => {
    const res = await fetch("/api/reports");
    if (res.ok) setSavedReports(await res.json());
  }, []);

  useEffect(() => {
    loadSavedReports();
  }, [loadSavedReports]);

  function loadSavedReport(weekKey: string) {
    const report = savedReports[weekKey];
    if (report) {
      const week = fiscalWeeks.find((w) => w.value === weekKey);
      if (week) setSelectedWeek(week);
      setReportContent(report.content);
      setSaved(true);
    }
  }

  async function generateReport() {
    setGenerating(true);
    const res = await fetch("/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekLabel: selectedWeek.label, kpi: kpiData, retailers }),
    });
    if (res.ok) {
      const { report } = await res.json();
      setReportContent(report);
      setSaved(false);
    }
    setGenerating(false);
  }

  async function saveReport() {
    setSaving(true);
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekKey: selectedWeek.value,
        weekLabel: selectedWeek.label,
        content: reportContent,
      }),
    });
    setSaved(true);
    setSaving(false);
    loadSavedReports();
  }

  async function downloadPDF() {
    setDownloading("pdf");
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Retail Insights — Weekly Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Week: ${selectedWeek.label}`, 14, 30);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(reportContent, 180);
    doc.text(lines, 14, 42);
    doc.save(`retail-report-${selectedWeek.value}.pdf`);
    setDownloading(null);
  }

  async function downloadExcel() {
    setDownloading("excel");
    const XLSX = await import("xlsx");
    const data = retailers.map((r) => ({
      Partner: r.name,
      "Sales ($)": r.sales,
      "Sales WoW %": r.salesWoW,
      "Sales YoY %": r.salesYoY ?? "",
      "Unit Sales": r.unitSales,
      "Unit Sales WoW %": r.unitSalesWoW,
      "Unit Sales YoY %": r.unitSalesYoY ?? "",
      "Avg Retail Price": r.avgRetailPrice,
      "Weeks of Supply": r.weeksOfSupply ?? "",
      "Returns %": r.returnsPercent,
      "Scanning Locations": r.scanningLocations,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Weekly Sales");
    XLSX.writeFile(wb, `retail-report-${selectedWeek.value}.xlsx`);
    setDownloading(null);
  }

  const savedKeys = Object.keys(savedReports).sort().reverse();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center gap-6">
          <span className="font-bold text-gray-900 text-lg">Retail Insights Hub</span>
          <nav className="flex gap-1">
            <Link href="/" className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Dashboard
            </Link>
            <Link href="/weekly-report" className="px-3 py-1.5 rounded-md text-sm font-medium bg-teal-50 text-teal-700">
              Weekly Report
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-56 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Saved Reports</p>
              </div>
              {savedKeys.length === 0 ? (
                <p className="text-xs text-gray-400 px-4 py-4">No saved reports yet.</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {savedKeys.map((key) => (
                    <li key={key}>
                      <button
                        onClick={() => loadSavedReport(key)}
                        className={`w-full text-left px-4 py-3 text-xs hover:bg-gray-50 transition-colors ${selectedWeek.value === key ? "bg-teal-50 text-teal-700 font-semibold" : "text-gray-700"}`}
                      >
                        <span className="block font-medium">{savedReports[key].weekLabel}</span>
                        <span className="text-gray-400">
                          {new Date(savedReports[key].savedAt).toLocaleDateString()}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <select
                  value={selectedWeek.value}
                  onChange={(e) => {
                    const w = fiscalWeeks.find((fw) => fw.value === e.target.value);
                    if (w) { setSelectedWeek(w); setSaved(false); setReportContent(""); }
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {fiscalWeeks.map((w) => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>

                <button
                  onClick={generateReport}
                  disabled={generating}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  {generating ? "Generating..." : "Generate Report"}
                </button>

                {reportContent && (
                  <>
                    <button
                      onClick={saveReport}
                      disabled={saving || saved}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
                    </button>
                    <button
                      onClick={downloadPDF}
                      disabled={downloading === "pdf"}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {downloading === "pdf" ? "Exporting..." : "Download PDF"}
                    </button>
                    <button
                      onClick={downloadExcel}
                      disabled={downloading === "excel"}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {downloading === "excel" ? "Exporting..." : "Download Excel"}
                    </button>
                  </>
                )}
              </div>

              {!reportContent && !generating && (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-sm">Select a fiscal week and click <strong className="text-gray-600">Generate Report</strong> to create an AI-written summary.</p>
                </div>
              )}

              {generating && (
                <div className="text-center py-16 text-gray-400">
                  <div className="inline-block w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm">Generating report with AI...</p>
                </div>
              )}

              {reportContent && !generating && (
                <textarea
                  value={reportContent}
                  onChange={(e) => { setReportContent(e.target.value); setSaved(false); }}
                  className="w-full h-[520px] border border-gray-200 rounded-lg p-4 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
