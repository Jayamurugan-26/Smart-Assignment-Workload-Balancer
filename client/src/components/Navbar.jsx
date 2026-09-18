import React from "react";
import { 
  BookOpen, 
  RotateCw, 
  Calendar as CalIcon, 
  CheckCircle2, 
  LayoutDashboard, 
  ListTodo,
  Sparkles,
  ShieldCheck,
  UserCheck,
  LogOut
} from "lucide-react";

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  onSync, 
  isSyncing, 
  onBalance, 
  isBalancing,
  onOpenGoogleModal,
  onSignOut
}) {
  return (
    <header className="border-b border-slate-800 bg-[#0b1120]/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                Smart Workload Balancer
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI Powered
                </span>
              </span>
              <p className="text-xs text-slate-400 hidden sm:block">Google Classroom • Calendar • Drive • NEXYRA AI</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab("dashboard")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab("assignments")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === "assignments"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Assignments</span>
            </button>

            <button
              onClick={() => setCurrentTab("completed")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === "completed"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed</span>
            </button>

            <button
              onClick={() => setCurrentTab("calendar")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === "calendar"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <CalIcon className="w-4 h-4" />
              <span>Schedule</span>
            </button>
          </nav>

          {/* Quick Actions & User Info */}
          <div className="flex items-center space-x-3">
            {/* Google Classroom Re-sync button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Sync Google Classroom coursework"
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-700 transition active:scale-95 disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 text-blue-400 ${isSyncing ? "animate-spin text-blue-400" : ""}`} />
              <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Re-sync"}</span>
            </button>

            {/* Balance Workload Trigger */}
            <button
              onClick={onBalance}
              disabled={isBalancing}
              title="Run AI Workload Balancer"
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isBalancing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isBalancing ? "Balancing..." : "Balance"}</span>
            </button>

            {/* Google Sign-in or User Profile */}
            <div className="flex items-center pl-2 border-l border-slate-800 space-x-2">
              {user && user.email !== "demo.student@university.edu" ? (
                /* Connected Google User */
                <div className="flex items-center space-x-2.5">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={user?.name || "User"}
                    className="w-8 h-8 rounded-full border border-emerald-500/60 object-cover"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-semibold text-slate-200 leading-tight flex items-center gap-1">
                      {user?.name?.split(" ")[0] || "Student"}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Classroom Connected
                    </div>
                  </div>
                  <button
                    onClick={onSignOut}
                    title="Sign Out / Switch to Demo"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Demo Student Mode with Google Connect CTA */
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onOpenGoogleModal}
                    className="flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-900 font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm transition active:scale-95 border border-slate-200"
                    title="Sign in with your Google Classroom school account"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Sign in with Google</span>
                    <span className="sm:hidden">Sign In</span>
                  </button>

                  <div className="hidden xl:flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <img
                      src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                      alt="Demo User"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-[11px] text-slate-400 font-medium">Demo Mode</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80">
          <button
            onClick={() => setCurrentTab("dashboard")}
            className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-md ${currentTab === "dashboard" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab("assignments")}
            className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-md ${currentTab === "assignments" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            Assignments
          </button>
          <button
            onClick={() => setCurrentTab("completed")}
            className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-md ${currentTab === "completed" ? "bg-emerald-600 text-white" : "text-slate-400"}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </button>
          <button
            onClick={() => setCurrentTab("calendar")}
            className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-md ${currentTab === "calendar" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            <CalIcon className="w-3.5 h-3.5" />
            Schedule
          </button>
        </div>

      </div>
    </header>
  );
}