import React, { useEffect, useMemo, useRef, useState } from 'react';
import lottie from 'lottie-web/build/player/lottie_light_canvas';
import { LOTTIE_PRESETS } from '../data/lottiePresets';
import { useDeviceProfile } from '../lib/deviceProfile';

export default function LottieBackground({ config, className = '', forceRun = false }) {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const device = useDeviceProfile();
  const [isInView, setIsInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'
  );

  const enabled = Boolean(config?.enabled) && (forceRun || device.canRunLottie);
  const sourceType = config?.sourceType || 'preset';
  const presetKey = config?.preset || 'orbital';
  const url = (config?.url || '').trim();
  const customJson = config?.customJson || '';
  const loop = config?.loop !== false;
  const speed = Number(config?.speed) || 1;
  const speedRef = useRef(speed);
  const opacity = typeof config?.opacity === 'number' ? config.opacity : 0.3;
  const blur = device.isMobile ? 0 : Number(config?.blur) || 0;
  const monochrome = Boolean(config?.monochrome);

  const parsedCustomData = useMemo(() => {
    if (sourceType !== 'json' || !customJson.trim()) return null;
    try {
      return JSON.parse(customJson);
    } catch {
      return null;
    }
  }, [sourceType, customJson]);

  // Pause animation when browser tab or phone screen is backgrounded
  useEffect(() => {
    const onVisChange = () => {
      setIsTabVisible(document.visibilityState !== 'hidden');
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, []);

  // Pause animation when container scrolls out of viewport
  useEffect(() => {
    if (!enabled || !containerRef.current || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    if (animRef.current) {
      animRef.current.destroy();
      animRef.current = null;
    }

    const options = {
      container: containerRef.current,
      renderer: 'canvas',
      loop,
      autoplay: true,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
        clearCanvas: true,
        dpr: device.lottieDpr,
      },
    };

    if (sourceType === 'url' && url) {
      options.path = url;
    } else if (sourceType === 'json' && parsedCustomData) {
      options.animationData = parsedCustomData;
    } else {
      const preset = LOTTIE_PRESETS[presetKey] || LOTTIE_PRESETS.orbital;
      options.animationData = JSON.parse(JSON.stringify(preset.data));
    }

    const anim = lottie.loadAnimation(options);
    if (device.isMobile || device.isLowEnd) {
      anim.setSubframe?.(false);
    }
    anim.setSpeed(speedRef.current);
    animRef.current = anim;

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [
    enabled,
    sourceType,
    presetKey,
    url,
    parsedCustomData,
    loop,
    device.lottieDpr,
    device.isMobile,
    device.isLowEnd,
  ]);

  useEffect(() => {
    speedRef.current = speed;
    if (animRef.current) {
      animRef.current.setSpeed(speed);
    }
  }, [speed]);

  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    if (isInView && isTabVisible) {
      anim.play();
    } else {
      anim.pause();
    }
  }, [isInView, isTabVisible]);

  if (!enabled) return null;

  const filters = [];
  if (monochrome) filters.push('grayscale(100%) contrast(1.08)');
  if (blur > 0) filters.push(`blur(${blur}px)`);

  return (
    <div
      className={`pointer-events-none overflow-hidden select-none ${className}`}
      style={{
        opacity: Math.max(0, Math.min(1, opacity)),
        filter: filters.length ? filters.join(' ') : undefined,
      }}
      aria-hidden="true"
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
