import React, { lazy, Suspense, useEffect, useState } from 'react';
import TerminalWidget from './TerminalWidget';
import RichText from './RichText';
import ActionButton from './ActionButton';

const LottieBackground = lazy(() => import('./LottieBackground'));

function RoleRotator({ roles }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (roles.length <= 1) return;
    let id = null;

    const start = () => {
      if (id) clearInterval(id);
      id = setInterval(() => {
        setIndex((prev) => (prev + 1) % roles.length);
      }, 2800);
    };

    const onVisChange = () => {
      if (document.visibilityState === 'hidden') {
        if (id) clearInterval(id);
        id = null;
      } else {
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      if (id) clearInterval(id);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [roles.length]);

  const safeIndex = index % roles.length;

  return (
    <span className="text-zinc-200 font-medium">
      {roles[safeIndex]}
    </span>
  );
}

function formatColomboTime() {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Colombo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return new Date().toLocaleTimeString();
  }
}

function LocalClock() {
  const [localTime, setLocalTime] = useState(formatColomboTime);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        setLocalTime(formatColomboTime());
      }
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return <span className="text-zinc-300 font-mono">{localTime} SLST</span>;
}

export default function HeroBento({
  personal,
  stats,
  heroConfig,
  lottieConfig,
  theme,
  deferAnimations = false,
}) {
  const roles = personal.roles?.length ? personal.roles : ['Developer'];
  const cardRadius = theme?.cardRadius || 'rounded-xl';
  const headline =
    heroConfig?.headline ||
    'Engineering solutions through ==Vibe Coding==, shaped by cinematic craft.';
  const subheadline =
    heroConfig?.subheadline ||
    `Applied Science undergraduate at **${personal.university}**. Building practical applications, directing film & motion graphics, and leading teams.`;

  const heroButtons = (heroConfig?.buttons || [
    { id: 'btn-work', label: 'Selected Work', href: '#projects', variant: 'accent', icon: 'arrow', visible: true },
    { id: 'btn-reel', label: 'Visual Reel', href: '#reel', variant: 'ghost', icon: 'none', visible: true },
    { id: 'btn-toolkit', label: 'Toolkit', href: '#arsenal', variant: 'ghost', icon: 'none', visible: true },
  ]).filter((b) => b.visible !== false);

  const bentoOrder = heroConfig?.bentoOrder?.length
    ? heroConfig.bentoOrder
    : ['profile', 'academia', 'craft', 'terminal'];

  const craftTools = heroConfig?.craftTools?.length
    ? heroConfig.craftTools
    : ['Premiere Pro', 'After Effects', 'DaVinci', 'Sony Alpha', 'Illustrator'];

  const renderBentoCard = (key) => {
    switch (key) {
      case 'profile':
        return (
          <div
            key="profile"
            className={`md:col-span-2 lg:col-span-2 md:row-span-2 minimal-card ${cardRadius} p-6 sm:p-8 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                  {heroConfig?.profileLabel || '01 / Profile'}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  2026
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {personal.displayName || personal.name}
                <span className="text-accent">.</span>
              </h2>

              <div className="mt-2 mb-6 flex items-center gap-2 font-mono text-xs sm:text-sm">
                <span className="text-accent">-&gt;</span>
                <RoleRotator roles={roles} />
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {personal.bio.map((para, i) => (
                  <p key={i}>
                    <RichText text={para} />
                  </p>
                ))}
              </div>
            </div>

            {heroButtons.length > 0 && (
              <div className="mt-8 pt-5 border-t border-white/[0.06] flex flex-wrap items-center gap-4">
                {heroButtons.map((btn) => (
                  <ActionButton key={btn.id || btn.label} button={btn} />
                ))}
              </div>
            )}
          </div>
        );

      case 'academia':
        return (
          <div
            key="academia"
            className={`minimal-card ${cardRadius} p-6 flex flex-col justify-between`}
          >
            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">
                {heroConfig?.academiaLabel || '02 / Academia'}
              </span>
              <h3 className="text-base font-semibold text-white leading-snug">
                {personal.university}
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5">
                {personal.faculty}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-mono">Degree</span>
                <span className="text-zinc-200 font-medium">B.Sc. Applied Science</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-mono">Local Time</span>
                <LocalClock />
              </div>
            </div>
          </div>
        );

      case 'craft':
        return (
          <div
            key="craft"
            className={`minimal-card ${cardRadius} p-6 flex flex-col justify-between`}
          >
            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">
                {heroConfig?.craftLabel || '03 / Craft & Lead'}
              </span>
              <h3 className="text-base font-semibold text-white leading-snug">
                {heroConfig?.craftTitle || 'Cinema, Motion & Core Leadership'}
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {heroConfig?.craftDesc ||
                  'Video editing, photography, 2D motion graphics, and leading teams from concept to ship.'}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap gap-1.5">
              {craftTools.map((tool, i) => (
                <span
                  key={`${tool}-${i}`}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        );

      case 'terminal':
        return (
          <div key="terminal" className="md:col-span-2 lg:col-span-2">
            <TerminalWidget personal={personal} radiusClass={cardRadius} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="about" className="pt-28 sm:pt-32 pb-20 relative overflow-hidden">
      {!deferAnimations && lottieConfig?.enabled && lottieConfig?.scope === 'hero' && (
        <Suspense fallback={null}>
          <LottieBackground config={lottieConfig} className="absolute inset-0 -z-10" />
        </Suspense>
      )}

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
        {/* Minimalist Editorial Header */}
        <div className="mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            <span>{personal.statusBadge}</span>
            <span className="text-zinc-700">/</span>
            <span>{personal.location}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
            <RichText text={headline} />
          </h1>

          <p className="mt-5 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
            <RichText text={subheadline} />
          </p>
        </div>

        {/* Minimalist Monotone Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bentoOrder.map((cardKey) => renderBentoCard(cardKey))}
        </div>

        {/* Hairline Architectural Metadata Bar */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 border-y border-white/[0.08] divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {stats.map((stat, idx) => (
            <div key={idx} className="py-5 px-4 first:pl-0">
              <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-[11px] font-mono text-zinc-400 mt-1">
                {stat.label} <span className="text-zinc-600">—</span> {stat.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
