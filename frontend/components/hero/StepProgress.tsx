'use client';

import React from 'react';
import { FEATURE_STEPS } from '@/lib/heroSteps';

interface StepProgressProps {
  activeStep: number;
  totalSteps?: number;
  onSelectStep: (stepIndex: number) => void;
}

export function StepProgress({
  activeStep,
  totalSteps = 8,
  onSelectStep,
}: StepProgressProps) {
  const currentStepDisplay = String(activeStep + 1).padStart(2, '0');
  const totalStepsDisplay = String(totalSteps).padStart(2, '0');
  const currentPhase = FEATURE_STEPS[activeStep]?.phase || '';

  return (
    <>
      {/* Bottom-left Step Counter */}
      <div className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-md shadow-slate-200/40 pointer-events-none">
        <span className="text-xs font-mono font-bold text-indigo-600">
          {currentStepDisplay}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">/</span>
        <span className="text-xs font-mono text-slate-600">
          {totalStepsDisplay}
        </span>
        {currentPhase && (
          <span className="text-[10px] uppercase font-bold text-slate-500 border-l border-slate-200 pl-2 tracking-wider hidden sm:inline">
            {currentPhase}
          </span>
        )}
      </div>

      {/* Right-edge Vertical Dots Indicator */}
      <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 p-2 rounded-full bg-white/75 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-200/40">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index === activeStep;
          const stepData = FEATURE_STEPS[index];

          return (
            <button
              key={index}
              onClick={() => onSelectStep(index)}
              title={stepData?.cards[0]?.eyebrow || `Step ${index + 1}`}
              aria-label={`Jump to step ${index + 1}`}
              className="group relative flex items-center justify-center p-1 focus:outline-none"
            >
              {/* Tooltip on hover (left of dot) */}
              <span className="absolute right-7 px-2.5 py-1 rounded-md bg-slate-900 text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-lg">
                {stepData?.cards[0]?.eyebrow || `Phase ${index + 1}`}
              </span>

              {/* The Dot */}
              <div
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-2.5 h-6 bg-gradient-to-b from-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/30'
                    : 'w-2 h-2 bg-slate-300 group-hover:bg-slate-500 group-hover:scale-125'
                }`}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}
