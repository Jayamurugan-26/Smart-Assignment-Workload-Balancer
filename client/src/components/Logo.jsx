import React, { useState } from "react";

/**
 * Official Project Logo Component
 * - Maintains strict aspect ratio
 * - Supports responsive sizing (sm, md, lg, xl)
 * - Tries custom uploaded logo at /logo.png or /logo.svg first, with high-fidelity academic crest fallback
 */
export default function Logo({ size = "md", className = "", showText = false, textClassName = "" }) {
  const [imgError, setImgError] = useState(false);

  // Responsive dimension map
  const sizeMap = {
    xs: { box: "w-7 h-7", icon: "w-4 h-4", text: "text-sm", sub: "text-[10px]" },
    sm: { box: "w-9 h-9", icon: "w-5 h-5", text: "text-base", sub: "text-xs" },
    md: { box: "w-11 h-11", icon: "w-6 h-6", text: "text-lg", sub: "text-xs" },
    lg: { box: "w-16 h-16", icon: "w-9 h-9", text: "text-2xl", sub: "text-sm" },
    xl: { box: "w-24 h-24", icon: "w-14 h-14", text: "text-3xl", sub: "text-base" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Primary Logo Graphic */}
      <div 
        className={`${currentSize.box} rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-2 shadow-lg shadow-blue-500/25 shrink-0 overflow-hidden transition-transform duration-300 hover:scale-105`}
        title="Smart Assignment Workload Balancer"
      >
        {!imgError ? (
          <img 
            src="/logo.png" 
            alt="Smart Assignment Workload Balancer Logo" 
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${currentSize.icon} text-white drop-shadow`}
          >
            {/* Academic Balance & Knowledge Crest */}
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
            <path d="M6 14h6" />
            <circle cx="17" cy="15" r="3" fill="currentColor" fillOpacity="0.2" />
            <path d="M17 12v6" />
            <path d="M14 15h6" />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${currentSize.text} leading-tight`}>
            Smart Balancer
          </span>
          <span className={`text-slate-500 dark:text-slate-400 font-medium ${currentSize.sub}`}>
            Academic Workload AI
          </span>
        </div>
      )}
    </div>
  );
}
