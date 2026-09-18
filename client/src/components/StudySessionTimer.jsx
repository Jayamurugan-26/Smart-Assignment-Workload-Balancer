import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  Square, 
  X, 
  Clock, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { api } from "../services/api.js";

export default function StudySessionTimer({
  assignments = [],
  courses = [],
  onSessionUpdated,
  onNotify,
}) {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Timer inputs when idle
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [notes, setNotes] = useState("");

  // Live timer state
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const timerIntervalRef = useRef(null);

  // 1. Fetch active session on mount
  const fetchActiveSession = async () => {
    try {
      setLoading(true);
      const res = await api.getActiveStudySession();
      if (res.session) {
        setActiveSession(res.session);
        calculateInitialSeconds(res.session);
      } else {
        setActiveSession(null);
        setDisplaySeconds(0);
      }
    } catch (err) {
      console.error("Failed to load active study session:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // 2. Calculate initial display seconds from session
  const calculateInitialSeconds = (session) => {
    let secs = session.durationSeconds || 0;
    if (session.status === "ACTIVE" && session.lastResumedAt) {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(session.lastResumedAt).getTime()) / 1000));
      secs += elapsed;
    }
    setDisplaySeconds(secs);
  };

  // 3. Ticking counter effect
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (activeSession && activeSession.status === "ACTIVE") {
      timerIntervalRef.current = setInterval(() => {
        setDisplaySeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeSession]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSecs) => {
    const secs = Math.max(0, totalSecs);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // Handlers
  const handleStart = async () => {
    try {
      setActionLoading(true);
      const res = await api.startStudySession({
        assignmentId: selectedAssignmentId || undefined,
        courseId: selectedCourseId || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.session) {
        setActiveSession(res.session);
        setDisplaySeconds(0);
        if (onNotify) onNotify("success", "Focus session started. Track your academic effort!", "Timer Started");
        if (onSessionUpdated) onSessionUpdated();
      }
    } catch (err) {
      if (onNotify) onNotify("error", err.message || "Failed to start study session", "Session Error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!activeSession) return;
    try {
      setActionLoading(true);
      const res = await api.pauseStudySession(activeSession.id);
      if (res.session) {
        setActiveSession(res.session);
        setDisplaySeconds(res.session.durationSeconds);
        if (onNotify) onNotify("info", "Session paused. Take a break!", "Timer Paused");
        if (onSessionUpdated) onSessionUpdated();
      }
    } catch (err) {
      if (onNotify) onNotify("error", err.message || "Failed to pause session", "Error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!activeSession) return;
    try {
      setActionLoading(true);
      const res = await api.resumeStudySession(activeSession.id);
      if (res.session) {
        setActiveSession(res.session);
        if (onNotify) onNotify("success", "Resumed study session. Keep going!", "Timer Resumed");
        if (onSessionUpdated) onSessionUpdated();
      }
    } catch (err) {
      if (onNotify) onNotify("error", err.message || "Failed to resume session", "Error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!activeSession) return;
    try {
      setActionLoading(true);
      const res = await api.endStudySession(activeSession.id);
      setActiveSession(null);
      setDisplaySeconds(0);
      setNotes("");
      setSelectedAssignmentId("");
      setSelectedCourseId("");
      if (onNotify) {
        const mins = Math.round((res.session?.durationSeconds || 0) / 60);
        onNotify("success", `Completed ${mins} minutes of recorded study time!`, "Session Logged");
      }
      if (onSessionUpdated) onSessionUpdated();
    } catch (err) {
      if (onNotify) onNotify("error", err.message || "Failed to end session", "Error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!activeSession) return;
    if (!window.confirm("Are you sure you want to discard this session? Unsaved time will not count towards your productivity hours.")) {
      return;
    }
    try {
      setActionLoading(true);
      await api.cancelStudySession(activeSession.id);
      setActiveSession(null);
      setDisplaySeconds(0);
      if (onNotify) onNotify("info", "Study session discarded.", "Timer Cancelled");
      if (onSessionUpdated) onSessionUpdated();
    } catch (err) {
      if (onNotify) onNotify("error", err.message || "Failed to cancel session", "Error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-center animate-pulse">
        <Clock className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Loading focus tracker...</span>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 mb-6 shadow-sm">
      {!activeSession ? (
        // IDLE STATE: Configuration & Start
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Study Session Tracker
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Record active focus time to calculate genuine study hours and subject workload.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Optional Assignment Selector */}
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Select Assignment to study for"
            >
              <option value="">Link to Assignment (Optional)</option>
              {assignments
                .filter((a) => a.status !== "COMPLETED")
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.course?.code || "Course"})
                  </option>
                ))}
            </select>

            {/* Optional Course Selector if no assignment selected */}
            {!selectedAssignmentId && courses.length > 0 && (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Select Course to study for"
              >
                <option value="">Link to Subject (Optional)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ""}
                  </option>
                ))}
              </select>
            )}

            {/* Start Action */}
            <button
              type="button"
              onClick={handleStart}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{actionLoading ? "Starting..." : "Start Study Session"}</span>
            </button>
          </div>
        </div>
      ) : (
        // ACTIVE / PAUSED STATE
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Live Clock Display */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    activeSession.status === "ACTIVE"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-amber-500"
                  }`}
                />
                <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-slate-900 dark:text-white">
                  {formatTime(displaySeconds)}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    activeSession.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  }`}
                >
                  {activeSession.status === "ACTIVE" ? "In Progress" : "Paused"}
                </span>
              </div>

              {/* Associated task info */}
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  {activeSession.assignment
                    ? `Studying: ${activeSession.assignment.title}`
                    : activeSession.course
                    ? `Subject: ${activeSession.course.name} (${activeSession.course.code || "Course"})`
                    : "General Academic Study Session"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {activeSession.status === "ACTIVE" ? (
              <button
                type="button"
                onClick={handlePause}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleEnd}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>End & Save Session</span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={actionLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
              title="Discard session"
              aria-label="Discard session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
