import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import { Sparkles, ArrowRight } from "lucide-react";

/**
 * 5-Second Academic Splash Landing Page
 * STRICT RULES:
 * - Exactly 5 seconds duration
 * - NO percentage counter or progress percentage
 * - Smooth, subtle academic animation
 * - Project logo, project name, academic tagline
 * - Auto-routes to dashboard/login when 5 seconds finish
 */
export default function LandingPage({ onComplete }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Exactly 5000ms duration
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 4600); // start gentle fade out 400ms before transition

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-opacity duration-500 select-none ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Main Splash Content */}
      <div className="relative z-10 max-w-xl mx-auto text-center flex flex-col items-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Project Logo with breathing glow */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
          <div className="relative">
            <Logo size="xl" />
          </div>
        </div>

        {/* Project Titles & Tagline */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Driven Academic Productivity
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Smart Assignment<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
              Workload Balancer
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
            Optimized task scheduling, NEXYRA AI multi-modal decomposition, and seamless Google Classroom synchronization.
          </p>
        </div>

        {/* Subtle decorative pulsing indicator - NO percentage */}
        <div className="pt-4 flex flex-col items-center space-y-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse delay-150"></span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 tracking-wider font-medium uppercase">
            Preparing your academic dashboard...
          </span>
        </div>

        {/* Optional quick Skip button for fast access */}
        <button
          onClick={onComplete}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition inline-flex items-center gap-1 pt-4 opacity-75 hover:opacity-100"
        >
          <span>Enter Dashboard</span>
          <ArrowRight className="w-3 h-3" />
        </button>

      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        Google Classroom • Google Calendar • Google Drive • NEXYRA AI
      </div>

    </div>
  );
}
