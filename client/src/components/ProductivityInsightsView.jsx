import React, { useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  Calendar, 
  Download, 
  Sparkles, 
  RotateCw, 
  BarChart3, 
  ChevronRight, 
  Layers, 
  Sun, 
  Moon, 
  Hourglass, 
  Flame,
  Award,
  Activity
} from "lucide-react";
import { api } from "../services/api.js";
import StudySessionTimer from "./StudySessionTimer.jsx";

export default function ProductivityInsightsView({
  assignments = [],
  courses = [],
  onNotify,
  onOpenDetails,
}) {
  const [preset, setPreset] = useState("this-week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Active chart hover item
  const [hoveredTrendItem, setHoveredTrendItem] = useState(null);

  // Fetch productivity insights
  const fetchProductivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { preset };
      if (preset === "custom") {
        if (!customStartDate || !customEndDate) {
          setLoading(false);
          return;
        }
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }

      const res = await api.getProductivityInsights(params);
      if (res.success) {
        setData(res);
      } else {
        throw new Error(res.error || "Unable to load productivity insights.");
      }
    } catch (err) {
      console.error("Productivity fetch error:", err);
      setError("Unable to load productivity insights. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [preset, customStartDate, customEndDate]);

  useEffect(() => {
    fetchProductivity();
  }, [fetchProductivity]);

  // Handle preset selector
  const handlePresetSelect = (newPreset) => {
    if (newPreset === "custom") {
      setIsCustomMode(true);
      setPreset("custom");
    } else {
      setIsCustomMode(false);
      setPreset(newPreset);
    }
  };

  // CSV Export Report Generator
  const handleExportCSV = () => {
    if (!data) return;

    const { range, summary, subjectWorkload, progressTrend } = data;

    let csv = `Productivity Insights Report\n`;
    csv += `Date Range,${range.formattedRange} (Preset: ${range.preset})\n`;
    csv += `Exported At,${new Date().toISOString()}\n\n`;

    csv += `Summary Statistics\n`;
    csv += `Assignments Completed,${summary.assignmentsCompleted}\n`;
    csv += `Completion Comparison,${summary.completionComparison?.text || "N/A"}\n`;
    csv += `Average Completion Time,${summary.averageCompletionTimeFormatted}\n`;
    csv += `Late Submissions,${summary.lateSubmissions}\n`;
    csv += `Late Submission Rate,${summary.lateSubmissionText}\n`;
    csv += `Total Study Hours,${summary.studyHoursFormatted} (${summary.studySessionsCount} sessions)\n`;
    csv += `Study Hours Comparison,${summary.studyHoursComparison?.text || "N/A"}\n`;
    csv += `Pending Assignments,${summary.pendingAssignments}\n`;
    csv += `Estimated Remaining Workload,${summary.pendingWorkloadHours}h\n\n`;

    csv += `Subject-Wise Workload\n`;
    csv += `Subject Name,Subject Code,Total Assignments,Completed,Pending,Overdue,Estimated Workload (Hours),Actual Study Hours\n`;
    subjectWorkload.forEach((s) => {
      csv += `"${s.name}","${s.code}",${s.totalAssignments},${s.completed},${s.pending},${s.overdue},${s.estimatedWorkloadHours}h,${s.actualStudyHours}h\n`;
    });
    csv += `\n`;

    csv += `Progress Trend Breakdown\n`;
    csv += `Date,Day,Completed Count,Study Hours,Due Deadlines\n`;
    progressTrend.forEach((t) => {
      csv += `${t.date},${t.dayName},${t.completedCount},${t.studyHours}h,${t.dueCount}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Productivity_Report_${range.preset}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onNotify) {
      onNotify("success", "Productivity report successfully exported to CSV.", "Report Generated");
    }
  };

  const summary = data?.summary || {};
  const subjectWorkload = data?.subjectWorkload || [];
  const progressTrend = data?.progressTrend || [];
  const patterns = data?.patterns || {};
  const insights = data?.insights || [];
  const hasTrendData = data?.hasTrendData;

  // Maximum value for chart scaling
  const maxTrendCompleted = Math.max(1, ...progressTrend.map((t) => t.completedCount));
  const maxTrendStudyHours = Math.max(1, ...progressTrend.map((t) => t.studyHours));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Date Range Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Productivity Insights
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {data?.range?.formattedRange || "Live"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Understand your academic progress and workload patterns.
          </p>
        </div>

        {/* Date Selector & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Presets */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
            {[
              { id: "this-week", label: "This Week" },
              { id: "this-month", label: "This Month" },
              { id: "last-7-days", label: "Last 7 Days" },
              { id: "last-30-days", label: "Last 30 Days" },
              { id: "custom", label: "Custom Range" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetSelect(p.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  preset === p.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export Report Action */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!data || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition active:scale-95 shadow-sm disabled:opacity-50"
            title="Export factual productivity report as CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Custom Date Inputs if Custom Selected */}
      {isCustomMode && (
        <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={fetchProductivity}
            disabled={!customStartDate || !customEndDate || loading}
            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition disabled:opacity-50"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* 2. Interactive Study Session Focus Tracker */}
      <StudySessionTimer
        assignments={assignments}
        courses={courses}
        onSessionUpdated={fetchProductivity}
        onNotify={onNotify}
      />

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RotateCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Calculating verified productivity metrics...
          </p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-3xl p-8 text-center max-w-md mx-auto">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Unable to load productivity insights
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchProductivity}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* 3. Summary Statistics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Assignments Completed */}
            <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Completed
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {summary.assignmentsCompleted}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Assignments
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  {summary.completionComparison?.text || "No previous-period data"}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                Based on actual assignment completion dates.
              </div>
            </div>

            {/* Card 2: Study Hours */}
            <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Study Hours
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {summary.studyHoursFormatted}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  {summary.studyHoursComparison?.text || "Total study time"}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {summary.studySessionsCount > 0
                  ? `${summary.studySessionsCount} recorded study session${summary.studySessionsCount === 1 ? "" : "s"}`
                  : "No study sessions recorded yet."}
              </div>
            </div>

            {/* Card 3: Average Completion Time */}
            <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Avg Duration
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Hourglass className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {summary.averageCompletionTimeFormatted}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {summary.averageCompletionTimeMinutes
                    ? `~${summary.averageCompletionTimeMinutes} minutes per task`
                    : "Requires start timestamps"}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {summary.averageCompletionTimeExplanation}
              </div>
            </div>

            {/* Card 4: Late Submissions */}
            <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Late Submissions
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-bold ${
                      summary.lateSubmissions > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {summary.lateSubmissions}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Late
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {summary.lateSubmissionText}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                Completed after scheduled deadline.
              </div>
            </div>

            {/* Card 5: Pending Workload */}
            <div className="glass-card rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pending Workload
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {summary.pendingAssignments}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Active
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-1">
                  {summary.pendingWorkloadHours}h estimated effort
                </div>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                Total remaining tasks across all subjects.
              </div>
            </div>

          </div>

          {/* 4. NEXYRA AI Insights & Productivity Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* NEXYRA AI Insights (2 cols) */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      NEXYRA AI Insights
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        Verified Data
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Objective observations synthesized exclusively from your authenticated activity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Productivity Patterns (1 col) */}
            <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Productivity Patterns
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Behavioral trends from recorded study sessions.
                </p>

                {patterns.hasPatterns ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Most Active Day</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {patterns.mostActiveDay}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Peak Study Time</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {patterns.mostActiveTimeRange}
                      </div>
                    </div>

                    {patterns.highestStudySubject && (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Top Focus Subject</div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                          {patterns.highestStudySubject}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {patterns.message || "More study activity is needed to identify a reliable pattern."}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                Updated continuously as study sessions are recorded.
              </div>
            </div>

          </div>

          {/* 5. Progress Trend Chart */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Progress Trend
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assignment completions and study session hours across the selected timeframe.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">Completed Assignments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-500" />
                  <span className="text-slate-600 dark:text-slate-300">Study Hours</span>
                </div>
              </div>
            </div>

            {hasTrendData ? (
              <div className="space-y-4">
                {/* Visual Chart Bars */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-48 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
                  {progressTrend.map((t, idx) => {
                    const completedHeight = Math.min(100, Math.round((t.completedCount / maxTrendCompleted) * 100));
                    const studyHeight = Math.min(100, Math.round((t.studyHours / maxTrendStudyHours) * 100));

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                        onMouseEnter={() => setHoveredTrendItem(t)}
                        onMouseLeave={() => setHoveredTrendItem(null)}
                      >
                        {/* Dual Bar Column */}
                        <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full">
                          {/* Completed Bar */}
                          <div
                            className="w-1/2 bg-emerald-500/80 hover:bg-emerald-500 rounded-t-md transition-all duration-300"
                            style={{ height: `${t.completedCount > 0 ? Math.max(12, completedHeight) : 4}%` }}
                          />
                          {/* Study Hours Bar */}
                          <div
                            className="w-1/2 bg-blue-500/80 hover:bg-blue-500 rounded-t-md transition-all duration-300"
                            style={{ height: `${t.studyHours > 0 ? Math.max(12, studyHeight) : 4}%` }}
                          />
                        </div>

                        {/* Day Label */}
                        <div className="text-center mt-2">
                          <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                            {t.dayName}
                          </span>
                          <span className="text-[10px] text-slate-400 block sm:hidden">
                            {t.date.split("-")[2]}
                          </span>
                          <span className="text-[10px] text-slate-400 hidden sm:block">
                            {t.displayDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hover Tooltip display */}
                <div className="h-6 text-xs text-center font-semibold text-slate-600 dark:text-slate-300">
                  {hoveredTrendItem ? (
                    <span>
                      {hoveredTrendItem.dayName}, {hoveredTrendItem.displayDate}:{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {hoveredTrendItem.completedCount} completed
                      </strong>{" "}
                      •{" "}
                      <strong className="text-blue-600 dark:text-blue-400">
                        {hoveredTrendItem.studyHours}h study recorded
                      </strong>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Hover over any day to inspect details</span>
                  )}
                </div>
              </div>
            ) : (
              // Empty State
              <div className="py-14 text-center">
                <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No productivity data available yet.
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Start a study session or mark an assignment as completed during this date range to visualize your progress trend.
                </p>
              </div>
            )}
          </div>

          {/* 6. Subject-Wise Workload Table & Cards */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Subject-wise Workload
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real courses synchronized with Google Classroom or local student enrollment.
                </p>
              </div>
            </div>

            {subjectWorkload.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="pb-3 pr-4">Subject</th>
                      <th className="pb-3 px-3 text-center">Total</th>
                      <th className="pb-3 px-3 text-center">Completed</th>
                      <th className="pb-3 px-3 text-center">Pending</th>
                      <th className="pb-3 px-3 text-center">Overdue</th>
                      <th className="pb-3 px-3 text-right">Workload</th>
                      <th className="pb-3 pl-3 text-right">Study Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {subjectWorkload.map((subj) => (
                      <tr key={subj.courseId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: subj.color || "#3b82f6" }}
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white leading-tight">
                                {subj.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {subj.code}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                          {subj.totalAssignments}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                            {subj.completed}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10">
                            {subj.pending}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {subj.overdue > 0 ? (
                            <span className="px-2 py-0.5 rounded-md font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10">
                              {subj.overdue}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                          {subj.estimatedWorkloadHours}h
                        </td>

                        <td className="py-3.5 pl-3 text-right font-bold text-blue-600 dark:text-blue-400">
                          {subj.actualStudyHours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No subject workload data available.
                </p>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
