import React, { useEffect } from 'react';
import Navbar from './Navbar';
import HeroBento from './HeroBento';
import CreativeArsenal from './CreativeArsenal';
import ProjectShowcase from './ProjectShowcase';
import FilmStripGallery from './FilmStripGallery';
import LeadershipSection from './LeadershipSection';
import FooterAndContact from './FooterAndContact';
import LottieBackground from './LottieBackground';
import { applyThemeToRoot } from '../lib/themeUtils';

function PreviewSelectableBlock({
  blockId,
  label,
  isPreview,
  selectedBlock,
  onSelectBlock,
  hidden = false,
  children,
}) {
  if (!isPreview) {
    return hidden ? null : children;
  }

  const isSelected = selectedBlock === blockId;

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelectBlock?.(blockId);
      }}
      className={`relative group/block cursor-pointer transition-all ${
        isSelected
          ? 'ring-1 ring-accent ring-offset-0'
          : 'hover:ring-1 hover:ring-white/25'
      } ${hidden ? 'opacity-40 grayscale' : ''}`}
    >
      <div
        className={`absolute top-2 right-3 z-30 px-2 py-0.5 rounded text-[10px] font-mono pointer-events-none transition-opacity ${
          isSelected
            ? 'bg-accent text-white opacity-100'
            : 'bg-[#101012] border border-white/15 text-zinc-300 opacity-0 group-hover/block:opacity-100'
        }`}
      >
        {hidden ? `${label} (Hidden)` : `Edit ${label}`}
      </div>
      {children}
    </div>
  );
}

export default function PortfolioView({
  content,
  isPreview = false,
  selectedBlock = null,
  onSelectBlock = null,
}) {
  const siteConfig = content.siteConfig || {};
  const theme = siteConfig.theme || {};
  const accentColor = theme.accentColor;
  const lottieConfig = siteConfig.lottie || {};
  const sections = siteConfig.sections || [
    { id: 'hero', label: 'Hero & Bento', visible: true },
    { id: 'arsenal', label: 'Code & Cinema Arsenal', visible: true },
    { id: 'projects', label: 'Creations & Productions', visible: true },
    { id: 'reel', label: 'Visual Rhythm & Stills', visible: true },
    { id: 'leadership', label: 'Leader at Core', visible: true },
  ];

  useEffect(() => {
    applyThemeToRoot({ accentColor });
  }, [accentColor]);

  const renderSection = (sec) => {
    switch (sec.id) {
      case 'hero':
        return (
          <HeroBento
            personal={content.personal}
            stats={content.stats}
            heroConfig={siteConfig.hero}
            lottieConfig={lottieConfig}
            theme={theme}
          />
        );
      case 'arsenal':
        return (
          <CreativeArsenal
            arsenal={content.arsenal}
            sectionMeta={sec}
            theme={theme}
          />
        );
      case 'projects':
        return (
          <ProjectShowcase
            projects={content.projects}
            sectionMeta={sec}
            theme={theme}
          />
        );
      case 'reel':
        return (
          <FilmStripGallery
            gallery={content.gallery}
            sectionMeta={sec}
            theme={theme}
          />
        );
      case 'leadership':
        return (
          <LeadershipSection
            leadershipPillars={content.leadershipPillars}
            sectionMeta={sec}
            theme={theme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`${
        isPreview ? 'min-h-full' : 'min-h-screen'
      } bg-[#09090b] text-zinc-100 relative selection:bg-accent/25 selection:text-white overflow-x-hidden`}
    >
      {lottieConfig.enabled && lottieConfig.scope !== 'hero' && (
        <LottieBackground
          config={lottieConfig}
          className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-0`}
        />
      )}

      <PreviewSelectableBlock
        blockId="navbar"
        label="Navbar"
        isPreview={isPreview}
        selectedBlock={selectedBlock}
        onSelectBlock={onSelectBlock}
      >
        <Navbar
          personal={content.personal}
          navbarConfig={siteConfig.navbar}
          isPreview={isPreview}
        />
      </PreviewSelectableBlock>

      <main className="relative z-10">
        {sections.map((sec) => (
          <PreviewSelectableBlock
            key={sec.id}
            blockId={sec.id}
            label={sec.label}
            isPreview={isPreview}
            selectedBlock={selectedBlock}
            onSelectBlock={onSelectBlock}
            hidden={sec.visible === false}
          >
            {renderSection(sec)}
          </PreviewSelectableBlock>
        ))}
      </main>

      <PreviewSelectableBlock
        blockId="footer"
        label="Footer & Contact"
        isPreview={isPreview}
        selectedBlock={selectedBlock}
        onSelectBlock={onSelectBlock}
      >
        <FooterAndContact
          personal={content.personal}
          footerConfig={siteConfig.footer}
          isPreview={isPreview}
        />
      </PreviewSelectableBlock>
    </div>
  );
}
