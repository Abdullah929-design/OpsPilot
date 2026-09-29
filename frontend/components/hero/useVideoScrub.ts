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
  const { totalSteps = 8, easing = 0.09 } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(20);
  const [videoError, setVideoError] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const targetTimeRef = useRef(0);
  const smoothedTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const pendingSeekTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

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

    // Handler when decoder finishes seeking a frame
    const handleSeeked = () => {
      isSeekingRef.current = false;

      // If a newer time arrived while seeking, apply it immediately
      if (pendingSeekTimeRef.current !== null && !isDestroyed) {
        const nextTime = pendingSeekTimeRef.current;
        pendingSeekTimeRef.current = null;

        if (Math.abs(video.currentTime - nextTime) > 0.01) {
          isSeekingRef.current = true;
          video.currentTime = nextTime;
        }
      }
    };

    video.addEventListener('seeked', handleSeeked);

    const handleLoadedMetadata = () => {
      if (isDestroyed) return;
      setLoadProgress(80);

      video.pause();
      video.muted = true;
      video.currentTime = 0;
      targetTimeRef.current = 0;
      smoothedTimeRef.current = 0;

      // ScrollTrigger with built-in smooth scrub
      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6, // Adds silky smooth inertia to scroll progress
        onUpdate: (self) => {
          if (isDestroyed) return;
          const p = Math.max(0, Math.min(1, self.progress));
          setProgress(p);

          const step = Math.min(totalSteps - 1, Math.floor(p * totalSteps));
          setActiveStep(step);

          if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
            targetTimeRef.current = p * video.duration;
          }
        },
      });

      scrollTriggerRef.current = st;
      setIsLoaded(true);
      setLoadProgress(100);

      // Continuous lerp loop with hardware decoder queue protection
      const loop = () => {
        if (isDestroyed) return;

        const target = targetTimeRef.current;
        const current = smoothedTimeRef.current;
        const delta = target - current;

        // Smoothly interpolate towards target
        if (Math.abs(delta) > 0.004) {
          smoothedTimeRef.current = current + delta * easing;
        } else {
          smoothedTimeRef.current = target;
        }

        const desiredTime = smoothedTimeRef.current;

        // Only commit currentTime when decoder is idle to avoid frame drops
        if (
          video.readyState >= 2 &&
          isFinite(desiredTime) &&
          desiredTime >= 0 &&
          desiredTime <= (video.duration || 9999)
        ) {
          const timeDiff = Math.abs(video.currentTime - desiredTime);

          if (timeDiff > 0.012) {
            if (!isSeekingRef.current && !video.seeking) {
              isSeekingRef.current = true;
              video.currentTime = desiredTime;
            } else {
              // Store latest timestamp so it fires as soon as current seek completes
              pendingSeekTimeRef.current = desiredTime;
            }
          }
        }

        rafIdRef.current = requestAnimationFrame(loop);
      };

      rafIdRef.current = requestAnimationFrame(loop);
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
        scrub: 0.6,
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
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
    };
  }, [isReducedMotion, totalSteps, easing]);

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
