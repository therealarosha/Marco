import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { getDeviceProfile } from '../lib/deviceProfile';

const LottieBackground = lazy(() => import('./LottieBackground'));

const TELEMETRY_STEPS = [
  'INIT // VIBE.OS',
  'SYNC // WUSL.AS',
  'CALIBRATE // 24FPS',
  'READY // 100%',
];

export default function LoadingScreen({
  config,
  brandName = 'Marco',
  lottieConfig,
  onDone,
}) {
  const device = getDeviceProfile();
  const baseDuration = Math.max(700, Math.min(3500, Number(config?.durationMs) || 1450));
  const durationMs = device.prefersReducedMotion
    ? 350
    : device.isLowEnd
    ? Math.min(baseDuration, 900)
    : baseDuration;

  const style =
    device.isLowEnd && config?.style === 'lottie'
      ? 'telemetry'
      : config?.style || 'telemetry';
  const tagline = config?.tagline || 'VIBE CODING • CINEMA • APPLIED SCIENCE';

  const [exiting, setExiting] = useState(false);
  const rafRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const statusRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);

  useEffect(() => {
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const raw = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - raw, 3);
      const pct = Math.round(eased * 100);

      // Update DOM directly to avoid 60 React re-renders/sec on mobile CPUs
      if (counterRef.current) {
        counterRef.current.textContent = String(pct).padStart(3, '0');
      }
      if (barRef.current) {
        barRef.current.style.width = `${pct}%`;
      }
      if (statusRef.current) {
        const idx = Math.min(
          TELEMETRY_STEPS.length - 1,
          Math.floor((pct / 100) * TELEMETRY_STEPS.length)
        );
        statusRef.current.textContent = TELEMETRY_STEPS[idx];
      }
      if (outerRingRef.current) {
        outerRingRef.current.style.transform = `rotate(${pct * 3.6}deg)`;
      }
      if (innerRingRef.current) {
        innerRingRef.current.style.transform = `rotate(-${pct * 2.2}deg)`;
      }

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setExiting(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setExiting(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [durationMs]);

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => {
      onDone?.();
    }, 520);
    return () => clearTimeout(timer);
  }, [exiting, onDone]);

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-auto overflow-hidden select-none"
      aria-label="Loading screen"
    >
      {/* Top & Bottom Cinema Shutter Curtains */}
      <div
        className={`absolute top-0 left-0 right-0 h-1/2 bg-[#09090b] border-b border-white/[0.06] will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          exiting ? '-translate-y-full' : 'translate-y-0'
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 h-1/2 bg-[#09090b] border-t border-white/[0.06] will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          exiting ? 'translate-y-full' : 'translate-y-0'
        }`}
      />

      {/* Foreground Telemetry / Aperture / Lottie Layer */}
      <div
        className={`relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-10 transition-opacity duration-300 ${
          exiting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span ref={statusRef}>{TELEMETRY_STEPS[0]}</span>
          </div>
          <span>24.00 FPS // MONO</span>
        </div>

        <div className="my-auto flex flex-col items-center justify-center text-center relative">
          {style === 'lottie' && (
            <div className="w-44 h-44 sm:w-60 sm:h-60 mb-4">
              <Suspense fallback={null}>
                <LottieBackground
                  forceRun
                  config={{
                    enabled: true,
                    sourceType: config?.lottieUrl ? 'url' : 'preset',
                    preset: config?.lottiePreset || lottieConfig?.preset || 'orbital',
                    url: config?.lottieUrl || '',
                    opacity: 0.9,
                    speed: 1.4,
                    loop: true,
                    monochrome: false,
                  }}
                  className="w-full h-full"
                />
              </Suspense>
            </div>
          )}

          {style === 'shutter' && (
            <div className="relative w-32 h-32 sm:w-44 sm:h-44 mb-8 flex items-center justify-center">
              <div
                ref={outerRingRef}
                className="absolute inset-0 rounded-full border border-white/[0.14] border-t-accent will-change-transform"
              />
              <div
                ref={innerRingRef}
                className="absolute inset-4 rounded-full border border-dashed border-white/[0.15] will-change-transform"
              />
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
          )}

          <div className="font-mono text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white tabular-nums">
            <span ref={counterRef}>000</span>
            <span className="text-accent">%</span>
          </div>

          <div className="mt-6 w-56 sm:w-72 h-[2px] bg-white/[0.08] overflow-hidden rounded-full">
            <div
              ref={barRef}
              className="h-full bg-accent"
              style={{ width: '0%' }}
            />
          </div>

          <p className="mt-4 text-[11px] font-mono text-zinc-500 tracking-[0.22em] uppercase">
            {tagline}
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span className="text-zinc-300 font-semibold">
            {brandName}
            <span className="text-accent">.</span>
          </span>

          <button
            type="button"
            onClick={() => setExiting(true)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            Skip [ESC]
          </button>
        </div>
      </div>
    </div>
  );
}
