import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? "bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300"
                : isError
                  ? "bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-800/80 text-rose-800 dark:text-rose-300"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <strong className="block text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                {toast.title || (isSuccess ? "Success" : isError ? "Notice" : "Info")}
              </strong>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}