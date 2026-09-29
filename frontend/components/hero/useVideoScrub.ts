'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseVideoScrubOptions {
  totalSteps?: number;
  frameRate?: number; // frames to extract per second of video
}

export function useVideoScrub(options: UseVideoScrubOptions = {}) {
  const { totalSteps = 8, frameRate = 24 } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  // canvasRef is used for rendering extracted frames
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // videoRef is a hidden offscreen video used only for frame extraction
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(5);
  const [videoError, setVideoError] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const framesRef = useRef<ImageBitmap[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const currentFrameRef = useRef(-1);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Frame extraction + scroll setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    if (isReducedMotion) {
      setIsLoaded(true);
      return;
    }

    let isDestroyed = false;

    const setupScrollOnly = () => {
      // Fallback: just drive progress/step without canvas
      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
        onUpdate: (self) => {
          if (isDestroyed) return;
          const p = Math.max(0, Math.min(1, self.progress));
          setProgress(p);
          setActiveStep(Math.min(totalSteps - 1, Math.floor(p * totalSteps)));
        },
      });
      scrollTriggerRef.current = st;
      setVideoError(true);
      setIsLoaded(true);
    };

    const extractFrames = async () => {
      // Create a hidden video element for frame extraction
      const video = document.createElement('video');
      videoRef.current = video;
      video.src = '/videos/hero-scrub.mp4';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';

      // Wait for metadata so we know duration
      await new Promise<void>((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => resolve(), { once: true });
        video.addEventListener('error', () => reject(new Error('video load error')), { once: true });
        video.load();
      });

      if (isDestroyed) return;

      const duration = video.duration;
      const totalFrames = Math.floor(duration * frameRate);
      const frames: ImageBitmap[] = new Array(totalFrames);

      setLoadProgress(10);

      const canvas = document.createElement('canvas');
      // Use actual video dimensions for extraction
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d')!;

      // Extract every frame by seeking the video and painting to canvas
      for (let i = 0; i < totalFrames; i++) {
        if (isDestroyed) return;

        const seekTime = (i / (totalFrames - 1)) * duration;

        await new Promise<void>((resolve) => {
          const onSeeked = async () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            try {
              frames[i] = await createImageBitmap(canvas);
            } catch {
              // fallback — skip frame if createImageBitmap fails
            }
            resolve();
          };
          video.addEventListener('seeked', onSeeked, { once: true });
          video.currentTime = seekTime;
        });

        // Update load progress from 10% → 90%
        const extractPct = Math.round(10 + ((i + 1) / totalFrames) * 80);
        setLoadProgress(extractPct);
      }

      if (isDestroyed) return;

      framesRef.current = frames;
      setLoadProgress(100);

      // Now wire up GSAP ScrollTrigger to drive canvas painting
      const renderCanvas = (p: number) => {
        const displayCanvas = canvasRef.current;
        if (!displayCanvas) return;
        const frameIndex = Math.min(
          frames.length - 1,
          Math.max(0, Math.floor(p * (frames.length - 1)))
        );
        if (frameIndex === currentFrameRef.current) return;
        currentFrameRef.current = frameIndex;

        const frame = frames[frameIndex];
        if (!frame) return;
        const dctx = displayCanvas.getContext('2d');
        if (!dctx) return;
        dctx.drawImage(frame, 0, 0, displayCanvas.width, displayCanvas.height);
      };

      // Paint first frame immediately
      renderCanvas(0);

      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
        onUpdate: (self) => {
          if (isDestroyed) return;
          const p = Math.max(0, Math.min(1, self.progress));
          setProgress(p);
          setActiveStep(Math.min(totalSteps - 1, Math.floor(p * totalSteps)));
          renderCanvas(p);
        },
      });

      scrollTriggerRef.current = st;
      setIsLoaded(true);
    };

    extractFrames().catch((err) => {
      console.warn('[OpsPilot Hero] Frame extraction failed:', err);
      setupScrollOnly();
    });

    return () => {
      isDestroyed = true;
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      framesRef.current.forEach((bmp) => bmp?.close?.());
      framesRef.current = [];
      currentFrameRef.current = -1;
    };
  }, [isReducedMotion, totalSteps, frameRate]);

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

      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    },
    [totalSteps]
  );

  return {
    containerRef,
    canvasRef,
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
