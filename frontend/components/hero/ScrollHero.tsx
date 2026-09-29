'use client';

import React, { useState } from 'react';
import { useVideoScrub } from './useVideoScrub';
import { HeroHeader } from './HeroHeader';
import { FeatureCard } from './FeatureCard';
import { ScrollHint } from './ScrollHint';
import { StepProgress } from './StepProgress';
import { FEATURE_STEPS } from '@/lib/heroSteps';

export function ScrollHero() {
  const {
    containerRef,
    canvasRef,
    progress,
    activeStep,
    isLoaded,
    loadProgress,
    videoError,
    isReducedMotion,
    scrollToStep,
  } = useVideoScrub({ totalSteps: 8, frameRate: 24 });

  const [mobileTab, setMobileTab] = useState<'left' | 'right'>('left');

  const currentStepData = FEATURE_STEPS[activeStep] || FEATURE_STEPS[0];
  const leftCard = currentStepData.cards.find(
    (c) => c.side === 'left' || c.side === 'center-left'
  );
  const rightCard = currentStepData.cards.find((c) => c.side === 'right');
  const isFinalStep = activeStep === 7;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        isReducedMotion ? 'h-auto' : 'h-[600vh]'
      } bg-[#F1F5F9] text-slate-900`}
    >
      {/* Sticky 100vh viewport stage */}
      <div
        className={`${
          isReducedMotion ? 'relative h-screen' : 'sticky top-0 h-screen'
        } w-full overflow-hidden flex flex-col justify-between`}
      >
        {/* Minimal Branded Loader (Light Theme) */}
        {!isLoaded && !isReducedMotion && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F1F5F9] transition-opacity duration-700">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping opacity-40" />
              <div className="relative w-full h-full rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center p-3 shadow-xl shadow-slate-300/50">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  className="w-full h-full animate-pulse"
                >
                  <path
                    d="M28 4L4 15.5L14 18L16.5 28L28 4Z"
                    fill="#4F46E5"
                  />
                </svg>
              </div>
            </div>
            <span className="text-sm font-bold tracking-wider text-slate-700 mb-3 font-headline">
              Loading OpsPilot Experience...
            </span>
            <div className="w-48 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Video / Ambient Light Stage */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          {videoError ? (
            <div className="w-full h-full bg-gradient-to-br from-[#F1F5F9] via-[#E2E8F0] to-[#EDF2F7] flex items-center justify-center">
              <div className="w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              <div className="w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              width={1920}
              height={1080}
              className="w-full h-full object-cover object-center select-none pointer-events-none"
            />
          )}

          {/* Ultra-subtle light scrim so text blends naturally into video without dark boxes */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 pointer-events-none hidden sm:block" />
        </div>

        {/* Navigation & Header */}
        <HeroHeader />

        {/* Desktop Cards Layout (Hidden on Mobile) */}
        <div className="hidden md:block absolute inset-0 z-20 pointer-events-none">
          {/* Left Card */}
          {leftCard && (
            <div
              key={`left-${activeStep}`}
              className={`absolute top-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-500 ease-out ${
                isFinalStep
                  ? 'left-[6%] lg:left-[8%]'
                  : 'left-[4%] lg:left-[5%]'
              } animate-in fade-in slide-in-from-bottom-5 duration-500`}
            >
              <FeatureCard card={leftCard} isHeroStatement={isFinalStep} />
            </div>
          )}

          {/* Right Card (Only when not final step) */}
          {rightCard && !isFinalStep && (
            <div
              key={`right-${activeStep}`}
              className="absolute top-1/2 -translate-y-1/2 right-[4%] lg:right-[5%] pointer-events-auto transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-5 duration-500"
            >
              <FeatureCard card={rightCard} />
            </div>
          )}
        </div>

        {/* Mobile Cards Layout (Anchored to Bottom Third with Soft Light Scrim) */}
        <div className="md:hidden absolute inset-x-0 bottom-16 z-20 px-4 pointer-events-auto">
          {/* Subtle mobile card backdrop scrim */}
          <div className="absolute inset-0 -top-12 bg-gradient-to-t from-[#F1F5F9] via-[#F1F5F9]/85 to-transparent -z-10 pointer-events-none" />

          {/* If step has both cards on mobile, provide quick toggle tabs */}
          {leftCard && rightCard && !isFinalStep && (
            <div className="flex items-center gap-2 mb-2 justify-center">
              <button
                onClick={() => setMobileTab('left')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                  mobileTab === 'left'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/80 text-slate-700 border border-slate-200'
                }`}
              >
                {leftCard.eyebrow}
              </button>
              <button
                onClick={() => setMobileTab('right')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                  mobileTab === 'right'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/80 text-slate-700 border border-slate-200'
                }`}
              >
                {rightCard.eyebrow}
              </button>
            </div>
          )}

          <div
            key={`mobile-${activeStep}-${mobileTab}`}
            className="animate-in fade-in slide-in-from-bottom-3 duration-300 flex justify-center"
          >
            {isFinalStep && leftCard ? (
              <FeatureCard card={leftCard} isHeroStatement={true} />
            ) : mobileTab === 'right' && rightCard ? (
              <FeatureCard card={rightCard} />
            ) : leftCard ? (
              <FeatureCard card={leftCard} />
            ) : null}
          </div>
        </div>

        {/* Floating Controls & Overlays */}
        <ScrollHint progress={progress} />
        <StepProgress
          activeStep={activeStep}
          totalSteps={8}
          onSelectStep={scrollToStep}
        />
      </div>

      {/* Reduced-Motion Fallback Static Feature List */}
      {isReducedMotion && (
        <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Explore All OpsPilot Capabilities
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
              Designed for multi-tenant business CRM, human resource scaling, and automated operational clarity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_STEPS.flatMap((s) => s.cards).map((card, i) => (
              <FeatureCard key={i} card={card} isHeroStatement={i === FEATURE_STEPS.flatMap((s) => s.cards).length - 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
