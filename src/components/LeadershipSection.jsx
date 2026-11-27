import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import RichText from './RichText';

export default function LeadershipSection({ leadershipPillars, sectionMeta, theme }) {
  const cardRadius = theme?.cardRadius || 'rounded-xl';

  return (
    <section id="leadership" className="py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="max-w-2xl mb-14">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
            {sectionMeta?.eyebrow || '05 / Ethos'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            <RichText text={sectionMeta?.title || 'Leader at Core==.=='} />
          </h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            <RichText text={sectionMeta?.subtitle || 'Leadership is removing friction, setting a high aesthetic bar, and uniting people around meaningful work.'} />
          </p>
        </div>

        {/* 4-Column Architectural Index */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {leadershipPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="border-t border-white/[0.1] pt-6"
            >
              <span className="text-xs font-mono text-accent font-medium block mb-3">
                {pillar.number}
              </span>
              <h3 className="text-base font-semibold text-white mb-2">
                {pillar.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Minimal Community Row */}
        <div className={`mt-14 minimal-card ${cardRadius} p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
              WUSL Community
            </span>
            <h4 className="text-sm sm:text-base font-semibold text-white">
              Wayamba University Student Initiatives
            </h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Leading university societies, technical symposiums, and campus media production crews.
            </p>
          </div>

          <a
            href="#contact"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white border border-white/[0.1] hover:border-white/[0.25] transition-colors self-start sm:self-auto"
          >
            <span>Connect</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
