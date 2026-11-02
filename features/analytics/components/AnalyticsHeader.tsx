"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  RefreshCw,
  FileSpreadsheet,
  Check,
  ChevronDown,
} from "lucide-react";
import { AnalyticsTimeRange, IAnalyticsDateFilter } from "@/types/analytics";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AnalyticsHeaderProps {
  dateFilter: IAnalyticsDateFilter;
  onDateFilterChange: (filter: IAnalyticsDateFilter) => void;
  onRefresh: () => void;
  isLoading: boolean;
  activeTab: string;
}

const PRESET_OPTIONS: Array<{ value: AnalyticsTimeRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "this_year", label: "This Year" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range..." },
];

const EXPORT_TYPES = [
  { type: "overview", label: "Overview Report" },
  { type: "students", label: "Student Demographics & Skills" },
  { type: "opportunities", label: "Opportunities & Skill Demand" },
  { type: "skills", label: "Skill Gap & Triangulation" },
  { type: "applications", label: "Application Funnel & Tracking" },
  { type: "fairness", label: "Fairness & Methodology Audit" },
];

export function AnalyticsHeader({
  dateFilter,
  onDateFilterChange,
  onRefresh,
  isLoading,
  activeTab,
}: AnalyticsHeaderProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handlePresetChange = (val: AnalyticsTimeRange) => {
    if (val === "custom") {
      setShowCustomModal(true);
    } else {
      onDateFilterChange({ range: val });
    }
  };

  const handleApplyCustomDates = () => {
    if (!customStart || !customEnd) {
      toast.error("Please enter both start and end dates.");
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      toast.error("Start date must be earlier than or equal to end date.");
      return;
    }
    onDateFilterChange({
      range: "custom",
      startDate: customStart,
      endDate: customEnd,
    });
    setShowCustomModal(false);
  };

  const handleExportCSV = async (type: string) => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const params = new URLSearchParams();
      params.set("type", type);
      if (dateFilter.range) params.set("range", dateFilter.range);
      if (dateFilter.startDate) params.set("startDate", dateFilter.startDate);
      if (dateFilter.endDate) params.set("endDate", dateFilter.endDate);

      const res = await fetch(`/api/admin/analytics/export?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to export CSV report");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `careerbridge-${type}-analytics-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("CSV report exported securely.");
    } catch (err: any) {
      toast.error(err.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Analytics & Fairness Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time platform metrics, application conversion funnel, skill demand triangulation, and algorithmic fairness audits.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range selector */}
          <div className="relative inline-flex items-center">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={dateFilter.range || "30d"}
              onChange={(e) => handlePresetChange(e.target.value as AnalyticsTimeRange)}
              className="pl-9 pr-8 py-2 text-xs md:text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-700 shadow-2xs hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {PRESET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {/* CSV Export Dropdown */}
          <div className="relative">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
              <ChevronDown className="h-3 w-3 ml-0.5 opacity-80" />
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in-50 zoom-in-95">
                <div className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Select CSV Dataset
                </div>
                {EXPORT_TYPES.map((exp) => (
                  <button
                    key={exp.type}
                    type="button"
                    onClick={() => handleExportCSV(exp.type)}
                    className="w-full text-left px-2.5 py-2 text-xs md:text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-medium truncate">{exp.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              Select Custom Date Range
            </h3>
            <p className="text-xs text-slate-500">
              Filter platform analytics within specific start and end boundaries.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApplyCustomDates}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Apply Range
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
