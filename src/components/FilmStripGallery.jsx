import React, { useState } from 'react';
import { Aperture } from 'lucide-react';

export default function FilmStripGallery({ gallery = [] }) {
  const [activeFrame, setActiveFrame] = useState(0);

  if (!gallery.length) {
    return null;
  }

  const safeIndex = activeFrame < gallery.length ? activeFrame : 0;
  const currentFrame = gallery[safeIndex];

  return (
    <section id="reel" className="py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
              04 / Lens & Motion
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Visual Rhythm & Stills<span className="text-accent">.</span>
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              Cinematography, natural campus light, motion tests, and live direction.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-zinc-400 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#101012] self-start md:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>REC • 4K 24FPS</span>
          </div>
        </div>

        {/* Cinema Monitor & Frame Index */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* Main Monochrome Viewfinder (8 cols) */}
          <div className="lg:col-span-8 minimal-card rounded-xl p-3 sm:p-4 flex flex-col">
            <div className="relative aspect-video rounded-lg bg-[#09090b] border border-white/[0.06] flex flex-col justify-between p-4 sm:p-6 overflow-hidden">

              {/* Optional Still Image Backdrop */}
              {currentFrame.imageUrl ? (
                <>
                  <img
                    src={currentFrame.imageUrl}
                    alt={currentFrame.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60" />
                </>
              ) : (
                <div className="absolute inset-0 bg-subtle-dots opacity-40" />
              )}

              {/* Minimal Corner Viewfinder Marks */}
              <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/25 pointer-events-none" />
              <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/25 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/25 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/25 pointer-events-none" />

              {/* Center Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                <div className="w-6 h-[1px] bg-white" />
                <div className="h-6 w-[1px] bg-white absolute" />
              </div>

              {/* Top HUD */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium uppercase">
                    {currentFrame.category}
                  </span>
                  <span className="text-zinc-600">/</span>
                  <span>
                    {String(safeIndex + 1).padStart(2, '0')} of {String(gallery.length).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-zinc-500">LOG-C • MONO</span>
              </div>

              {/* Frame Subject */}
              <div className="relative z-10 text-center my-auto px-4 py-6">
                <h3 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                  {currentFrame.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {currentFrame.description}
                </p>
              </div>

              {/* Bottom Camera Specs HUD */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Aperture className="w-3.5 h-3.5 text-accent" />
                  <span>{currentFrame.gear}</span>
                </div>
                <span className="text-zinc-500">WUSL MEDIA RIG</span>
              </div>

            </div>
          </div>

          {/* Side Frame Selector (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-2.5">
            {gallery.map((item, idx) => {
              const isActive = safeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveFrame(idx)}
                  className={`text-left p-4 rounded-xl border transition-colors ${
                    isActive
                      ? 'bg-[#141417] border-white/[0.15] border-l-2 border-l-accent'
                      : 'bg-[#101012] border-white/[0.06] hover:border-white/[0.14]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      0{idx + 1}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1.5 truncate">
                    {item.gear}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
