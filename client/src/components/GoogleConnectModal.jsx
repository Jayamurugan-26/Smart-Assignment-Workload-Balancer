import React, { useState, useEffect } from "react";
import { 
  X, 
  ExternalLink, 
  KeyRound, 
  ShieldAlert, 
  CheckCircle2, 
  LogIn, 
  Copy, 
  Check, 
  BookOpen, 
  HelpCircle 
} from "lucide-react";
import { api } from "../services/api";

export default function GoogleConnectModal({ isOpen, onClose, onAuthSuccess }) {
  const [loading, setLoading] = useState(true);
  const [oauthStatus, setOauthStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getGoogleAuthUrl()
        .then((res) => {
          setOauthStatus(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to check Google OAuth status", err);
          setOauthStatus({ configured: false, error: err.message });
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const redirectUri = oauthStatus?.redirectUri || "http://localhost:5000/api/auth/google/callback";

  const handleCopyUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedGoogleSignIn = () => {
    if (oauthStatus?.url) {
      window.location.href = oauthStatus.url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2 shadow">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
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
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign In with Google Classroom</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Connect your school or student Google Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700 dark:text-slate-300">
          
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Checking Google OAuth configuration...</p>
            </div>
          ) : oauthStatus?.configured ? (
            /* READY TO SIGN IN */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Google Credentials Active</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Your Google OAuth credentials are configured. Clicking below will take you to Google's official login page where you can pick your Google Classroom account.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Permissions Requested</span>
                <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                    <span><strong>Classroom:</strong> View your courses, assignments, and submission statuses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                    <span><strong>Calendar:</strong> View schedule conflicts and push study sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-500" />
                    <span><strong>Drive:</strong> Read coursework attachments, PDFs, and assignment specs</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleProceedGoogleSignIn}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                Proceed to Google Login
              </button>
            </div>
          ) : (
            /* CREDENTIALS NEEDED IN .ENV */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">Google OAuth Credentials Required</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    To sign in with your real Google Classroom email ID, you need a free Google Cloud OAuth Client ID & Secret configured in your <code className="text-amber-700 dark:text-amber-200 bg-amber-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">server/.env</code> file.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  Quick 3-Step Setup (Takes 3 minutes)
                </h5>

                <ol className="text-xs space-y-2.5 list-decimal list-inside text-slate-600 dark:text-slate-300">
                  <li className="pl-1">
                    Open <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a> and create a project.
                  </li>
                  <li className="pl-1">
                    Under <strong>APIs & Services &gt; Library</strong>, enable:
                    <div className="mt-1 ml-4 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      • Google Classroom API<br />
                      • Google Calendar API<br />
                      • Google Drive API
                    </div>
                  </li>
                  <li className="pl-1">
                    Under <strong>APIs & Services &gt; Credentials</strong>:
                    <div className="mt-1 ml-4 text-[11px] text-slate-500 dark:text-slate-400">
                      Click <strong>Create Credentials &gt; OAuth client ID</strong> (Application type: <em>Web application</em>).
                    </div>
                  </li>
                </ol>

                <div className="pt-2">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Authorized redirect URI (paste into Google Console):
                  </label>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-300">
                    <span className="truncate flex-1">{redirectUri}</span>
                    <button
                      onClick={handleCopyUri}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-transparent transition shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Add the values into <code className="text-blue-600 dark:text-blue-300">server/.env</code>:
                  </label>
                  <pre className="bg-slate-900 dark:bg-slate-950 p-3 rounded-lg border border-slate-700 dark:border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=${redirectUri}`}
                  </pre>
                </div>
              </div>

              {/* Instant Test Mode fallback reminder */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 flex items-center justify-between">
                <span>In the meantime, the application is preloaded with a full demo student profile so you can explore all features immediately.</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Secure Google OAuth 2.0 • Data never shared with 3rd parties
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
