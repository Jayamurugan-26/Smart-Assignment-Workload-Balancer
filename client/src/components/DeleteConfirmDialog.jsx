import React, { useState } from "react";
import { AlertTriangle, Trash2, X, ShieldAlert } from "lucide-react";

export default function DeleteConfirmDialog({ assignment, isOpen, onClose, onConfirm }) {
  if (!isOpen || !assignment) return null;

  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(assignment.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        
        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-500 dark:text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
          Remove this assignment from your dashboard?
        </h3>

        {/* Assignment Name */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl my-3 text-xs text-slate-800 dark:text-slate-300 font-medium">
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-0.5">
            {assignment.course?.code || "Course"}
          </div>
          {assignment.title}
        </div>

        {/* Safe Classroom Disclaimer */}
        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 mb-6">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            This will only remove it from this app. The original Google Classroom assignment will <strong className="text-slate-900 dark:text-white">not</strong> be deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20 transition active:scale-95 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Removing..." : "Remove Assignment"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}