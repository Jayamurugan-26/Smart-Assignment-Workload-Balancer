import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Settings,
  Edit3,
  LogOut,
  ShieldCheck,
  Moon,
  Sun,
  X,
  Save,
  Check
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { api } from "../services/api";

export default function StudentProfileView({ 
  user, 
  onSignOut, 
  onOpenGoogleModal, 
  onNotify, 
  onProfileUpdated 
}) {
  const { theme, setTheme } = useTheme();
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Form State
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    academicYear: "",
    semester: "",
    studentIdNumber: "",
    weekdayCapacity: 4,
    weekendCapacity: 6,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getStudentProfile();
      if (res.profile) {
        setProfileData(res.profile);
        setStatsData(res.stats);
        setFormData({
          name: res.profile.name || "",
          department: res.profile.department || "",
          academicYear: res.profile.academicYear || "",
          semester: res.profile.semester || "",
          studentIdNumber: res.profile.studentIdNumber || "",
          weekdayCapacity: res.profile.weekdayCapacity || 4,
          weekendCapacity: res.profile.weekendCapacity || 6,
        });
      }
    } catch (err) {
      console.warn("Could not fetch profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateStudentProfile(formData);
      setProfileData((prev) => ({ ...prev, ...res.profile }));
      setIsEditModalOpen(false);
      if (onNotify) onNotify("success", "Student profile updated successfully.", "Profile Saved");
      if (onProfileUpdated) onProfileUpdated(res.profile);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading student profile & real database statistics...</p>
      </div>
    );
  }

  const p = profileData || user || {};
  const s = statsData || { totalAssignments: 0, completedAssignments: 0, pendingAssignments: 0, overdueAssignments: 0, completionRate: 0 };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Student Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Academic credentials, real database metrics, and Google Classroom connection
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Student Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar */}
          <div className="relative">
            <img
              src={p.avatar || user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
              alt={p.name || user?.name || "Student"}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
              }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-blue-500/50 shadow-md"
            />
            {(p.isConnectedToGoogle || user?.isConnectedToGoogle) && (
              <span className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-500 text-white shadow" title="Google Classroom Connected">
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {p.name || user?.name || "Student"}
              </h2>
              {(p.isConnectedToGoogle || user?.isConnectedToGoogle) ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-center sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Google Classroom Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 self-center sm:self-auto">
                  Demo Student Profile
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{p.email || user?.email || "student@university.edu"}</span>
            </p>

            {/* Academic Information Grid */}
            <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{p.department}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Year / Semester</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{p.academicYear} • {p.semester}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Student ID</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{p.studentIdNumber}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Study Capacity</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{p.weekdayCapacity}h wkday / {p.weekendCapacity}h wkend</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Real Database Statistics Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Academic Progress (Calculated from Real Database Data)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {/* Total */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">{s.totalAssignments}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">Total Tasks</span>
          </div>

          {/* Completed */}
          <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">{s.completedAssignments}</span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-1 block">Completed</span>
          </div>

          {/* Pending */}
          <div className="p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-center">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 block">{s.pendingAssignments}</span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 mt-1 block">Pending</span>
          </div>

          {/* Overdue */}
          <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-center">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 block">{s.overdueAssignments}</span>
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 mt-1 block">Overdue</span>
          </div>

          {/* Completion Rate */}
          <div className="p-4 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 text-center col-span-2 sm:col-span-1">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 block">{s.completionRate}%</span>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-1 block">Completion Rate</span>
          </div>
        </div>
      </div>

      {/* Account Preferences & Google Connect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Google Classroom Connection Box */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center p-2 shadow border border-slate-200 dark:border-slate-700">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Google Classroom Connection</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">OAuth 2.0 Integration for courses & coursework</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {p.isConnectedToGoogle 
              ? `Connected to your school account (${p.email}). Automatic background sync keeps your deadlines and materials synchronized.` 
              : "Connect your official student Google account to import your real Google Classroom courses, coursework specifications, and Drive materials."}
          </p>

          <div className="pt-2">
            {p.isConnectedToGoogle ? (
              <button
                onClick={onSignOut}
                className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Google Account</span>
              </button>
            ) : (
              <button
                onClick={onOpenGoogleModal}
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
              >
                <span>Connect Google Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Preferences & Theme Box */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Interface & Preferences</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Visual theme and system settings</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Theme Mode</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Manual selection (stored in local storage)</span>
              </div>
              <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 select-none">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === "light"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Sun className={`w-3.5 h-3.5 ${theme === "light" ? "text-amber-500" : ""}`} />
                  <span>☀ Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    theme === "dark"
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Moon className={`w-3.5 h-3.5 ${theme === "dark" ? "text-indigo-400" : ""}`} />
                  <span>🌙 Dark</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Typography</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Academic Standard</span>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Times New Roman
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Edit Academic Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Student ID Number</label>
                  <input
                    type="text"
                    value={formData.studentIdNumber}
                    onChange={(e) => setFormData({ ...formData, studentIdNumber: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="e.g. 3rd Year"
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Semester</label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    placeholder="e.g. Semester 5"
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Weekday Hours (per day)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="16"
                    value={formData.weekdayCapacity}
                    onChange={(e) => setFormData({ ...formData, weekdayCapacity: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Weekend Hours (per day)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="16"
                    value={formData.weekendCapacity}
                    onChange={(e) => setFormData({ ...formData, weekendCapacity: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
