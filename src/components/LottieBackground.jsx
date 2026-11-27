import React, { useEffect, useMemo, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import { LOTTIE_PRESETS } from '../data/lottiePresets';

export default function LottieBackground({ config, className = '' }) {
  const containerRef = useRef(null);
  const animRef = useRef(null);

  const enabled = Boolean(config?.enabled);
  const sourceType = config?.sourceType || 'preset';
  const presetKey = config?.preset || 'orbital';
  const url = (config?.url || '').trim();
  const customJson = config?.customJson || '';
  const loop = config?.loop !== false;
  const speed = Number(config?.speed) || 1;
  const speedRef = useRef(speed);
  const opacity = typeof config?.opacity === 'number' ? config.opacity : 0.3;
  const blur = Number(config?.blur) || 0;
  const monochrome = Boolean(config?.monochrome);

  const parsedCustomData = useMemo(() => {
    if (sourceType !== 'json' || !customJson.trim()) return null;
    try {
      return JSON.parse(customJson);
    } catch {
      return null;
    }
  }, [sourceType, customJson]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    if (animRef.current) {
      animRef.current.destroy();
      animRef.current = null;
    }

    const options = {
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay: true,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    };

    if (sourceType === 'url' && url) {
      options.path = url;
    } else if (sourceType === 'json' && parsedCustomData) {
      options.animationData = parsedCustomData;
    } else {
      const preset = LOTTIE_PRESETS[presetKey] || LOTTIE_PRESETS.orbital;
      options.animationData = structuredClone(preset.data);
    }

    const anim = lottie.loadAnimation(options);
    anim.setSpeed(speedRef.current);
    animRef.current = anim;

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [enabled, sourceType, presetKey, url, parsedCustomData, loop]);

  useEffect(() => {
    speedRef.current = speed;
    if (animRef.current) {
      animRef.current.setSpeed(speed);
    }
  }, [speed]);

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
