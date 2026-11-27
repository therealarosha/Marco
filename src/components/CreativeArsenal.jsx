import React, { useState } from 'react';

export default function CreativeArsenal({ arsenal }) {
  const [activeTab, setActiveTab] = useState('tech');

  const tabs = [
    { id: 'tech', label: 'Code & Vibe' },
    { id: 'creative', label: 'Cinema & Motion' },
    { id: 'leadership', label: 'Leadership & Science' }
  ];

  const activeItems = arsenal[activeTab] || [];

  return (
    <section id="arsenal" className="py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header & Minimal Underline Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
              02 / Toolkit
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Code & Cinema Arsenal<span className="text-accent">.</span>
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              Software speed paired with visual restraint.
            </p>
          </div>

          <div className="flex items-center gap-6 border-b border-white/[0.08]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-xs font-mono transition-colors relative ${
                    isActive
                      ? 'text-white font-medium'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean 3-column Minimalist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeItems.map((item, idx) => (
            <div
              key={`${activeTab}-${idx}`}
              className="minimal-card rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-zinc-500">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                    {item.level}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white">
                  {item.name}
                </h3>

                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
