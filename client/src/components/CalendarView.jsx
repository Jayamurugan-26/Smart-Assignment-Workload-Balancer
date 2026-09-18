import React, { useState, useEffect } from "react";
import { Calendar as CalIcon, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { api } from "../services/api.js";

export default function CalendarView({ onNotify }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getCalendarEvents();
      setEvents(data.events || []);
    } catch (err) {
      if (onNotify) onNotify("error", err.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Compute current week days (Mon - Sun)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Weekly Unified Academic Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized with Google Calendar commitments and AI-scheduled study blocks.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEvents}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day, idx) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const isCurrentDay = format(today, "yyyy-MM-dd") === dayKey;

          // Find events for this day
          const dayEvents = events.filter((e) => {
            const eDate = format(new Date(e.startTime), "yyyy-MM-dd");
            return eDate === dayKey;
          });

          return (
            <div
              key={idx}
              className={`rounded-2xl p-3 border min-h-[320px] flex flex-col justify-between transition ${
                isCurrentDay
                  ? "bg-blue-50/60 dark:bg-slate-900 border-blue-500/50 shadow-md ring-1 ring-blue-500/30"
                  : "bg-white/70 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800/80 shadow-sm backdrop-blur-sm"
              }`}
            >
              {/* Day Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {format(day, "EEE")}
                </span>
                <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                  isCurrentDay ? "bg-blue-600 text-white" : "text-slate-700 dark:text-slate-300"
                }`}>
                  {format(day, "d")}
                </span>
              </div>

              {/* Event Cards */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {dayEvents.length > 0 ? (
                  dayEvents.map((evt, eIdx) => {
                    const isStudy = evt.type === "STUDY_BLOCK";
                    const startTime = format(new Date(evt.startTime), "h:mm a");
                    const endTime = format(new Date(evt.endTime), "h:mm a");

                    return (
                      <div
                        key={eIdx}
                        className={`p-2.5 rounded-xl border text-[11px] font-medium leading-snug transition ${
                          isStudy
                            ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-200"
                            : "bg-slate-100/90 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            isStudy 
                              ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" 
                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }`}>
                            {isStudy ? "Study Block" : "Commitment"}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {startTime}
                          </span>
                        </div>

                        <div className="font-bold text-slate-900 dark:text-white truncate">{evt.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {startTime} - {endTime}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-600 italic py-8">
                    Free day
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}