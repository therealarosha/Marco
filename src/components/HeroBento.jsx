import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import TerminalWidget from './TerminalWidget';

export default function HeroBento({ personal, stats }) {
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRoleIndex((prev) => (prev + 1) % personal.roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [personal.roles.length]);

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Colombo',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date());
        setLocalTime(timeStr);
      } catch {
        setLocalTime(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="about" className="pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Minimalist Editorial Header */}
        <div className="mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            <span>{personal.statusBadge}</span>
            <span className="text-zinc-700">/</span>
            <span>{personal.location}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
            Engineering solutions through{' '}
            <span className="text-accent">Vibe Coding</span>
            , shaped by cinematic craft.
          </h1>

          <p className="mt-5 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
            Applied Science undergraduate at{' '}
            <span className="text-zinc-200 font-medium">{personal.university}</span>.
            Building practical applications, directing film & motion graphics, and leading teams.
          </p>
        </div>

        {/* Minimalist Monotone Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {/* Card 1: Main Identity (2 cols, 2 rows) */}
          <div className="md:col-span-2 lg:col-span-2 md:row-span-2 minimal-card rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                  01 / Profile
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  2026
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {personal.displayName || personal.name}
                <span className="text-accent">.</span>
              </h2>

              {/* Minimal Dynamic Role Line */}
              <div className="mt-2 mb-6 flex items-center gap-2 font-mono text-xs sm:text-sm">
                <span className="text-accent">-&gt;</span>
                <span
                  key={activeRoleIndex}
                  className="text-zinc-200 font-medium"
                >
                  {personal.roles[activeRoleIndex]}
                </span>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {personal.bio.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Clean Action Links */}
            <div className="mt-8 pt-5 border-t border-white/[0.06] flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
              >
                <span>Selected Work</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="#reel"
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Visual Reel
              </a>

              <a
                href="#arsenal"
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Toolkit
              </a>
            </div>
          </div>

          {/* Card 2: Academia & Station (1 col) */}
          <div className="minimal-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">
                02 / Academia
              </span>
              <h3 className="text-base font-semibold text-white leading-snug">
                Wayamba University of Sri Lanka
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
                <span className="text-zinc-300 font-mono">{localTime || '--:--'} SLST</span>
              </div>
            </div>
          </div>

          {/* Card 3: Visual & Leadership Focus (1 col) */}
          <div className="minimal-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">
                03 / Craft & Lead
              </span>
              <h3 className="text-base font-semibold text-white leading-snug">
                Cinema, Motion & Core Leadership
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Video editing, photography, 2D motion graphics, and leading teams from concept to ship.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap gap-1.5">
              {['Premiere Pro', 'After Effects', 'DaVinci', 'Sony Alpha', 'Illustrator'].map((tool) => (
                <span
                  key={tool}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4: Interactive Vibe Shell (2 cols) */}
          <div className="md:col-span-2 lg:col-span-2">
            <TerminalWidget personal={personal} />
          </div>

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
