import React, { useState } from "react";
import Logo from "./Logo";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  LayoutDashboard,
  ListTodo,
  Calendar as CalendarIcon,
  Bot,
  FileScan,
  BarChart3,
  TrendingUp,
  Bell,
  User,
  Settings,
  Sun,
  Moon,
  RotateCw,
  Sparkles,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileText,
  Shield
} from "lucide-react";

export default function Sidebar({
  currentTab,
  setCurrentTab,
  user,
  unreadNotificationsCount = 0,
  onSync,
  isSyncing,
  onBalance,
  isBalancing,
  onOpenGoogleModal,
  onSignOut,
  isMobileOpen,
  setIsMobileOpen
}) {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "assignments", label: "Assignments", icon: ListTodo },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "ai-chat", label: "AI Assistant", icon: Bot, badge: "NEXYRA" },
    { id: "document-analysis", label: "Photo / Document Analysis", icon: FileScan },
    { id: "productivity", label: "Productivity Insights", icon: TrendingUp },
    { id: "notifications", label: "Notifications", icon: Bell, count: unreadNotificationsCount },
    { id: "profile", label: "Student Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (tabId) => {
    setCurrentTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const isRealGoogleUser = user && user.email !== "demo.student@university.edu" && (user.isConnectedToGoogle || user.googleId);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen flex flex-col justify-between border-r transition-all duration-300 select-none
          ${isCollapsed ? "md:w-20" : "md:w-64"}
          w-72 bg-white dark:bg-[#0b1120] border-slate-200 dark:border-slate-800 shadow-xl md:shadow-none
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Top Header & Logo */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer overflow-hidden"
            onClick={() => handleNavClick("dashboard")}
          >
            <Logo size="sm" />
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col text-left">
                <span className="font-bold text-base text-slate-900 dark:text-white leading-tight tracking-tight">
                  Smart Balancer
                </span>
                <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400">
                  Workload AI
                </span>
              </div>
            )}
          </div>

          {/* Desktop/Tablet Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Classroom / Balance Action Bar */}
        <div className="px-3 pt-3 pb-2 space-y-2">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onSync}
                disabled={isSyncing}
                title="Sync Google Classroom coursework"
                className="flex items-center justify-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 transition active:scale-95 disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 text-blue-500 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing" : "Re-sync"}</span>
              </button>

              <button
                onClick={onBalance}
                disabled={isBalancing}
                title="Run AI Workload Balancer"
                className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-1.5 px-2.5 rounded-lg text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isBalancing ? "animate-spin" : ""}`} />
                <span>{isBalancing ? "Balancing" : "Balance"}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 items-center">
              <button
                onClick={onSync}
                disabled={isSyncing}
                title="Sync Google Classroom"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <RotateCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`} />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {item.count > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white animate-pulse">
                        {item.count}
                      </span>
                    )}
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Theme, User & Legal Links */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          
          {/* Manual Light / Dark Theme Toggle (Independent of OS) */}
          {(!isCollapsed || isMobileOpen) ? (
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1 select-none">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  theme === "light"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
                title="Switch to Light theme"
              >
                <Sun className={`w-3.5 h-3.5 ${theme === "light" ? "text-amber-500" : ""}`} />
                <span>☀ Light</span>
              </button>
              
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  theme === "dark"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
                title="Switch to Dark theme"
              >
                <Moon className={`w-3.5 h-3.5 ${theme === "dark" ? "text-indigo-400" : ""}`} />
                <span>🌙 Dark</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleTheme}
                title={`Theme: ${theme === "dark" ? "Dark (click for Light)" : "Light (click for Dark)"}`}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </button>
            </div>
          )}

          {/* User Profile / Student Identity Card */}
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <div 
                className="flex items-center space-x-2.5 overflow-hidden cursor-pointer flex-1 min-w-0"
                onClick={() => handleNavClick("profile")}
                title={`Student: ${user?.name || "Student"} (${user?.email || ""})`}
              >
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={user?.name || "Student"}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                  }}
                  className="w-9 h-9 rounded-full border-2 border-emerald-500/80 shrink-0 object-cover shadow-sm"
                />
                {(!isCollapsed || isMobileOpen) && (
                  <div className="truncate text-left flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {user?.name || "Student"}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={user?.email}>
                      {user?.email || "student@university.edu"}
                    </div>
                  </div>
                )}
              </div>

              {(!isCollapsed || isMobileOpen) && isRealGoogleUser && (
                <button
                  onClick={onSignOut}
                  title="Sign Out / Switch to Demo"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Google Connection Pill or Connect CTA */}
            {(!isCollapsed || isMobileOpen) && (
              <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                {isRealGoogleUser ? (
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Classroom Active</span>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between gap-1">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      Demo Profile
                    </span>
                    <button
                      onClick={onOpenGoogleModal}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      title="Connect Google Classroom"
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                      </svg>
                      <span>Connect Google</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legal Links (Terms & Privacy) */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center justify-center space-x-3 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              <button
                onClick={() => handleNavClick("terms")}
                className="hover:underline flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <FileText className="w-3 h-3" />
                Terms
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavClick("privacy")}
                className="hover:underline flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Shield className="w-3 h-3" />
                Privacy
              </button>
            </div>
          )}

        </div>
      </aside>
    </>
  );
}
