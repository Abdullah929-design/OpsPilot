'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseVideoScrubOptions {
  totalSteps?: number;
  easing?: number;
}

export function useVideoScrub(options: UseVideoScrubOptions = {}) {
  const { totalSteps = 8 } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(20);
  const [videoError, setVideoError] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Main setup once video metadata is ready
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    if (isReducedMotion) {
      setIsLoaded(true);
      return;
    }

    let isDestroyed = false;

    const handleLoadedMetadata = () => {
      if (isDestroyed) return;
      setLoadProgress(80);

      video.pause();
      video.muted = true;
      video.currentTime = 0;

      const dur = video.duration && isFinite(video.duration) ? video.duration : 10;
      const videoProxy = { time: 0 };

      // High-performance GSAP scrub tween (smooth 0.35s inertia, zero lag)
      const tween = gsap.to(videoProxy, {
        time: dur,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35,
          onUpdate: (self) => {
            if (isDestroyed) return;
            const p = Math.max(0, Math.min(1, self.progress));
            setProgress(p);

            const step = Math.min(totalSteps - 1, Math.floor(p * totalSteps));
            setActiveStep(step);
          },
        },
        onUpdate: () => {
          if (isDestroyed || video.readyState < 2) return;
          const target = videoProxy.time;
          if (Math.abs(video.currentTime - target) > 0.02) {
            if (typeof (video as any).fastSeek === 'function') {
              (video as any).fastSeek(target);
            } else {
              video.currentTime = target;
            }
          }
        },
      });

      tweenRef.current = tween;
      scrollTriggerRef.current = tween.scrollTrigger as ScrollTrigger;
      setIsLoaded(true);
      setLoadProgress(100);
    };

    const handleError = () => {
      console.warn(
        '[OpsPilot Hero] Local video could not be loaded or is missing. Falling back to background gradient scrim.'
      );
      setVideoError(true);
      setIsLoaded(true);

      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.35,
        onUpdate: (self) => {
          const p = Math.max(0, Math.min(1, self.progress));
          setProgress(p);
          const step = Math.min(totalSteps - 1, Math.floor(p * totalSteps));
          setActiveStep(step);
        },
      });
      scrollTriggerRef.current = st;
    };

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplaythrough', () => setLoadProgress(100));
      video.addEventListener('error', handleError);
    }

    return () => {
      isDestroyed = true;
      if (tweenRef.current) tweenRef.current.kill();
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [isReducedMotion, totalSteps]);

  // Programmatic scroll to a specific step (0 to totalSteps - 1)
  const scrollToStep = useCallback(
    (stepIndex: number) => {
      if (typeof window === 'undefined' || !containerRef.current) return;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset;
      const totalScrollable = container.offsetHeight - window.innerHeight;

      const stepFraction = (stepIndex + 0.5) / totalSteps;
      const targetScroll = scrollTop + rect.top + totalScrollable * stepFraction;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    },
    [totalSteps]
  );

  return {
    containerRef,
    videoRef,
    progress,
    activeStep,
    isLoaded,
    loadProgress,
    videoError,
    isReducedMotion,
    scrollToStep,
  };
}
