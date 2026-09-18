import React from "react";
import Logo from "./Logo";
import { ArrowLeft, Shield, FileText } from "lucide-react";

export default function TermsPage({ onBack }) {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
          <FileText className="w-3.5 h-3.5" />
          Academic Terms of Service
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Terms and Conditions</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Effective Date: September 2026</p>
      </div>

      {/* 15 Mandatory Sections */}
      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
        
        <div className="pt-4 first:pt-0 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Introduction</h2>
          <p>
            Welcome to <strong>Smart Assignment Workload Balancer</strong>. These Terms and Conditions govern your use of our application, services, and associated academic workload balancing tools.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Acceptance of Terms</h2>
          <p>
            By accessing or using Smart Assignment Workload Balancer, you agree to be bound by these Terms. If you disagree with any part of the terms, you may discontinue use of the service.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Description of Service</h2>
          <p>
            Smart Assignment Workload Balancer is an educational productivity tool designed to help students balance assignment deadlines using the Earliest Deadline First (EDF) algorithm, Google Classroom coursework synchronization, and NEXYRA AI task decomposition.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Google Account Integration</h2>
          <p>
            The service provides optional Google OAuth 2.0 authentication. You may authenticate with your student Google Account to authorize secure, read-only or calendar-write access according to requested OAuth scopes.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Google Classroom Integration</h2>
          <p>
            Our integration with Google Classroom imports your enrolled courses, active coursework, due dates, and submission statuses. Local modifications or deletions within this app <strong>never alter or delete coursework in Google Classroom</strong>.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Google Calendar Integration</h2>
          <p>
            When authorized, the app reads your primary Google Calendar to avoid scheduling study sessions over existing classes, and can push study blocks to your primary calendar upon your explicit request.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">7. Google Drive Integration</h2>
          <p>
            Authorized coursework attachments (such as PDF problem sets and documents) are accessed directly through Google's APIs respecting private Google permissions. Files are never shared with unauthorized parties.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">8. NEXYRA AI Features</h2>
          <p>
            NEXYRA AI assists in evaluating task difficulty, generating micro-tasks, analyzing documents, and answering academic questions. AI-generated suggestions are advisory; students remain responsible for meeting coursework standards.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">9. Uploaded Photos and Documents</h2>
          <p>
            Files uploaded to the Photo & Document Analysis feature are processed securely to extract requirements and instructions. We do not use your private academic documents for model training.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">10. User Responsibilities</h2>
          <p>
            Users are responsible for ensuring their use of AI tools complies with their academic institution's honor code and submission guidelines.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">11. Third-Party Services</h2>
          <p>
            Our service interacts with Google APIs and NEXYRA AI. We do not control third-party service uptime or API quotas and provide integrations on an "as-is" basis.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">12. Data and Privacy</h2>
          <p>
            Student data is stored locally in your database instance and is never sold, leased, or distributed to advertisers. Please review our Privacy Policy for full details.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">13. Service Availability</h2>
          <p>
            We strive to provide continuous availability but make no guarantees regarding uninterrupted operation. Local offline mode with demo data is supported.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">14. Changes to Terms</h2>
          <p>
            We may update these terms periodically to reflect new features or security updates. Continued use of the application constitutes acceptance of updated terms.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">15. Contact Information</h2>
          <p>
            For inquiries regarding these Terms, contact your system administrator or project maintainer at <strong>support@smartbalancer.edu</strong>.
          </p>
        </div>

      </div>

    </div>
  );
}
