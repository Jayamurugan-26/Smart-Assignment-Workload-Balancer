import React from "react";
import Logo from "./Logo";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export default function PrivacyPage({ onBack }) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Back button & header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Application</span>
        </button>

        <Logo size="xs" showText={true} />
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          Privacy & Data Protection Policy
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Effective Date: September 2026</p>
      </div>

      {/* Structured Privacy Details */}
      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
        
        <div className="pt-4 first:pt-0 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. What Data is Collected</h2>
          <p>
            We collect only the minimum data required to calculate realistic academic workloads: your student name, email, enrolled Google Classroom course titles, coursework titles, due dates, submission statuses, and voluntary profile information (department, semester).
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Google Account Usage</h2>
          <p>
            When you choose to sign in with Google, we request OAuth 2.0 access solely to synchronize academic coursework and calendar availability. We never access personal emails or unrelated drive files.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Google Classroom Data</h2>
          <p>
            Classroom data is cached locally in your secure SQLite database instance to compute workload balance without repeatedly calling Google APIs. You retain full control over local edits and soft deletions.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Google Calendar Data</h2>
          <p>
            Calendar event times are inspected in memory to identify class blocks and busy slots. Study blocks are pushed to your Google Calendar only when explicitly triggered by you.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Google Drive Data</h2>
          <p>
            Only files attached directly to your assignments are inspected to extract assignment instructions and rubrics. Your personal Drive files outside of coursework are never touched.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Uploaded Files & Photos</h2>
          <p>
            Photos and documents uploaded for analysis are stored in a protected local temporary directory. File uploads are validated for file size (max 15MB) and permitted academic MIME types.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">7. NEXYRA AI Processing</h2>
          <p>
            Document text and assignment prompts sent to NEXYRA AI are processed securely in accordance with strict academic data protection standards. NEXYRA AI is used strictly for decomposition, summarization, and study advice.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">8. Data Storage & Security</h2>
          <p>
            Tokens and credentials reside exclusively on the server side in environment variables and encrypted database records. JWT tokens are used for client authentication.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">9. Account Disconnect & Data Removal</h2>
          <p>
            You can disconnect your Google account at any time from your Student Profile. Disconnecting immediately revokes local tokens and allows switching to demo student mode.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">10. User Controls & Contact Information</h2>
          <p>
            You have the right to view, edit, or purge all local assignment records and chat history. If you have privacy inquiries, please contact <strong>privacy@smartbalancer.edu</strong>.
          </p>
        </div>

      </div>

    </div>
  );
}
