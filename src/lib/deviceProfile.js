import { useEffect, useState } from 'react';

export function getDeviceProfile() {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isLowEnd: false,
      prefersReducedMotion: false,
      canRunLottie: true,
      lottieDpr: 1,
    };
  }

  const prefersReducedMotion = Boolean(
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  );
  const isMobile = Boolean(
    window.matchMedia?.('(max-width: 767px)')?.matches
  );

  const deviceMemory = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const saveData = Boolean(navigator.connection?.saveData);

  const isLowEnd =
    saveData ||
    (typeof deviceMemory === 'number' && deviceMemory <= 3) ||
    (typeof cores === 'number' && cores <= 4);

  const canRunLottie = !prefersReducedMotion && !(isLowEnd && isMobile);
  const rawDpr = window.devicePixelRatio || 1;
  const lottieDpr = isMobile ? 1 : Math.min(rawDpr, 1.5);

  return {
    isMobile,
    isLowEnd,
    prefersReducedMotion,
    canRunLottie,
    lottieDpr,
  };
}

export function useDeviceProfile() {
  const [profile, setProfile] = useState(getDeviceProfile);

  useEffect(() => {
    const mqMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const mqMobile = window.matchMedia?.('(max-width: 767px)');

    const update = () => setProfile(getDeviceProfile());
    mqMotion?.addEventListener?.('change', update);
    mqMobile?.addEventListener?.('change', update);
    return () => {
      mqMotion?.removeEventListener?.('change', update);
      mqMobile?.removeEventListener?.('change', update);
    };
  }, []);

  return profile;
}
