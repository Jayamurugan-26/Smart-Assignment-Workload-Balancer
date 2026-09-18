import React from "react";
import { 
  CheckCircle2, 
  RotateCcw, 
  Calendar, 
  Clock, 
  Award, 
  Trash2, 
  Edit3,
  ExternalLink,
  Inbox
} from "lucide-react";
import { format } from "date-fns";

export default function CompletedAssignmentsView({ 
  completedAssignments = [], 
  onRestore, 
  onEdit, 
  onDelete, 
  onOpenDetails 
}) {
  if (completedAssignments.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-500">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Completed Assignments Yet</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
          When you finish coursework and click <strong>Mark as Done</strong>, your completed work and timestamps will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Completed Coursework Archive
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {completedAssignments.length} Finished
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Coursework marked completed inside your Smart Workload Balancer. Original Google Classroom remains untouched.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {completedAssignments.map((asg) => {
          const dueDateObj = new Date(asg.dueDate);
          const completedAtObj = asg.completedAt ? new Date(asg.completedAt) : null;
          const subjectCode = asg.course?.code || "COURSE";
          const subjectName = asg.course?.name || "Subject Name";

          return (
            <div
              key={asg.id}
              className="glass-card rounded-2xl p-5 border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500/50 flex flex-col justify-between"
            >
              <div>
                {/* Header: Course badge & actions */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => onOpenDetails(asg)}
                    className="inline-flex items-center gap-1.5 hover:opacity-80 transition text-left"
                  >
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {subjectCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {subjectName}
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(asg)}
                      title="Edit local details"
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(asg)}
                      title="Delete assignment"
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Assignment Title */}
                <h3 
                  onClick={() => onOpenDetails(asg)}
                  className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition line-clamp-2"
                >
                  {asg.title}
                </h3>

                {/* Dates & Workload Info */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Original Due Date</span>
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px] font-medium mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {format(dueDateObj, "MMM d, yyyy")}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold block">Completed On</span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-semibold mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      {completedAtObj ? format(completedAtObj, "MMM d, h:mm a") : "Recently"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Estimated Workload</span>
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px] font-medium mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {+(asg.estimatedMinutes / 60).toFixed(1)} hours
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Difficulty Rating</span>
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px] font-medium mt-0.5">
                      <Award className="w-3 h-3 text-amber-500" />
                      Level {asg.difficulty} / 5
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom: Restore / Mark as Undone */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Saved in local history
                </span>

                <button
                  type="button"
                  onClick={() => onRestore(asg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition active:scale-95 shadow-sm"
                >
                  <RotateCcw className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                  <span>Restore / Mark as Undone</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}