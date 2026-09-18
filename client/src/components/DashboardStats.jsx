import React from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  FileText,
  Activity,
  Flame
} from "lucide-react";

export default function DashboardStats({ stats }) {
  if (!stats) return null;

  const {
    total = 0,
    pending = 0,
    inProgress = 0,
    completed = 0,
    overdue = 0,
    completionPercentage = 0,
    totalPendingHours = 0,
  } = stats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
      
      {/* 1. Total Assignments */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
          <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{total}</div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Coursework tracked</p>
      </div>

      {/* 2. Pending */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
          <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
        </div>
        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pending}</div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Awaiting start</p>
      </div>

      {/* 3. In Progress */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
          <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgress}</div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Underway</p>
      </div>

      {/* 4. Completed */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completed}</div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Finished tasks</p>
      </div>

      {/* 5. Overdue */}
      <div className={`border p-4 rounded-2xl shadow-sm transition ${
        overdue > 0 
          ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60" 
          : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80"
      }`}>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
          <AlertTriangle className={`w-4 h-4 ${overdue > 0 ? "text-rose-500 dark:text-rose-400 animate-pulse" : "text-slate-400 dark:text-slate-500"}`} />
        </div>
        <div className={`text-2xl font-bold ${overdue > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>{overdue}</div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Past deadline</p>
      </div>

      {/* 6. Completion Rate & Workload */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Progress</span>
          <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{completionPercentage}%</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">({totalPendingHours}h left)</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, completionPercentage)}%` }}
          />
        </div>
      </div>

    </div>
  );
}