'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollHintProps {
  progress: number;
}

export function ScrollHint({ progress }: ScrollHintProps) {
  // Fade out once user has scrolled past 3% (0.03)
  const isVisible = progress <= 0.03;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 transition-all duration-500 pointer-events-none ${
        isVisible ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-md shadow-slate-200/40">
        {/* Animated Mouse Icon */}
        <div className="w-3.5 h-5 rounded-full border border-indigo-600/70 flex items-start justify-center p-0.5">
          <div className="w-1 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
        </div>
        <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
          Scroll to explore
        </span>
      </div>
      <ChevronDown className="w-4 h-4 text-indigo-600/80 animate-pulse" />
    </div>
  );
}
