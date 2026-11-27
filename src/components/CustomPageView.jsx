import React from 'react';
import { ArrowLeft } from 'lucide-react';
import RichText from './RichText';
import MediaRenderer from './MediaRenderer';
import ActionButton from './ActionButton';

const ASPECT_MAP = {
  '16:9': 'aspect-video',
  '21:9': 'aspect-[21/9]',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '9:16': 'aspect-[9/16] max-w-sm mx-auto',
  auto: '',
};

export default function CustomPageView({
  page,
  theme,
  onNavigateHome,
  isPreview = false,
  selectedBlockIndex = null,
  onSelectBlockIndex = null,
}) {
  if (!page) {
    return (
      <section className="pt-36 pb-28 min-h-[65vh] flex items-center justify-center">
        <div className="max-w-md text-center px-5">
          <span className="text-[11px] font-mono text-accent uppercase tracking-widest block mb-2">
            404 / Page Not Found
          </span>
          <h1 className="text-2xl font-bold text-white mb-3">
            This page does not exist.
          </h1>
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portfolio</span>
          </button>
        </div>
      </section>
    );
  }

  const cardRadius = theme?.cardRadius || 'rounded-xl';
  const blocks = page.blocks || [];

  const renderBlock = (block) => {
    switch (block.type) {
      case 'text': {
        const centered = block.align === 'center';
        return (
          <div className={centered ? 'text-center max-w-2xl mx-auto' : 'max-w-3xl'}>
            {block.heading && (
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
                <RichText text={block.heading} />
              </h2>
            )}
            {block.body && (
              <div className="space-y-3 text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                <RichText text={block.body} />
              </div>
            )}
          </div>
        );
      }

      case 'photo': {
        const aspect = ASPECT_MAP[block.aspect || '16:9'] ?? 'aspect-video';
        return (
          <figure className={`minimal-card ${cardRadius} p-2 sm:p-3 overflow-hidden`}>
            {block.imageUrl ? (
              <MediaRenderer
                imageUrl={block.imageUrl}
                title={block.caption || page.title}
                aspectClass={aspect}
                monochrome={Boolean(block.monochrome)}
                className="rounded-lg"
                preferVideo={false}
              />
            ) : (
              <div className={`rounded-lg bg-[#09090b] border border-white/[0.06] ${aspect || 'h-56'} flex items-center justify-center text-xs font-mono text-zinc-600`}>
                Upload a photo or paste an image URL in the CMS
              </div>
            )}
            {block.caption && (
              <figcaption className="mt-2.5 px-1 text-[11px] font-mono text-zinc-400">
                <RichText text={block.caption} />
              </figcaption>
            )}
          </figure>
        );
      }

      case 'gallery': {
        const items = block.items || [];
        const cols = block.columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
        return (
          <div className={`grid grid-cols-1 ${cols} gap-4`}>
            {items.map((item, idx) => (
              <figure key={idx} className={`minimal-card ${cardRadius} p-2.5 overflow-hidden`}>
                {item.imageUrl ? (
                  <MediaRenderer
                    imageUrl={item.imageUrl}
                    title={item.caption || `Image ${idx + 1}`}
                    aspectClass="aspect-[4/3]"
                    monochrome={Boolean(block.monochrome)}
                    className="rounded-lg"
                    preferVideo={false}
                  />
                ) : (
                  <div className="rounded-lg bg-[#09090b] border border-white/[0.06] aspect-[4/3] flex items-center justify-center text-[11px] font-mono text-zinc-600">
                    Empty Slot {idx + 1}
                  </div>
                )}
                {item.caption && (
                  <figcaption className="mt-2 px-1 text-[11px] font-mono text-zinc-400">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        );
      }

      case 'video': {
        const aspect = ASPECT_MAP[block.aspect || '16:9'] ?? 'aspect-video';
        return (
          <div className={`minimal-card ${cardRadius} p-3 sm:p-4 overflow-hidden`}>
            {block.videoUrl ? (
              <MediaRenderer
                videoUrl={block.videoUrl}
                imageUrl={block.posterUrl || ''}
                title={block.heading || page.title}
                aspectClass={aspect}
                className="rounded-lg"
                preferVideo
              />
            ) : (
              <div className={`rounded-lg bg-[#09090b] border border-white/[0.06] ${aspect} flex items-center justify-center text-xs font-mono text-zinc-600`}>
                Paste a YouTube, Vimeo, Google Drive, or MP4 URL in the CMS
              </div>
            )}
            {(block.heading || block.caption) && (
              <div className="mt-3 px-1">
                {block.heading && (
                  <h3 className="text-sm font-semibold text-white">
                    <RichText text={block.heading} />
                  </h3>
                )}
                {block.caption && (
                  <p className="text-xs text-zinc-400 mt-1">
                    <RichText text={block.caption} />
                  </p>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'buttons': {
        const buttons = (block.buttons || []).filter((b) => b.visible !== false);
        return (
          <div className="flex flex-wrap items-center gap-3">
            {buttons.map((btn, idx) => (
              <ActionButton key={btn.id || idx} button={btn} />
            ))}
          </div>
        );
      }

      case 'divider':
        return (
          <div className="py-2 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-white/[0.08]" />
            {block.label && (
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                {block.label}
              </span>
            )}
            {block.label && <div className="h-[1px] flex-1 bg-white/[0.08]" />}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <article className="pt-28 sm:pt-32 pb-24 min-h-[70vh] relative z-10">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <header className="mb-12 max-w-3xl">
          {page.eyebrow && (
            <span className="text-[11px] font-mono text-accent uppercase tracking-widest block mb-3">
              {page.eyebrow}
            </span>
          )}
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.12]">
            <RichText text={page.title || 'Untitled Page'} />
          </h1>
          {page.subtitle && (
            <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
              <RichText text={page.subtitle} />
            </p>
          )}
        </header>

        <div className="space-y-10">
          {blocks.length === 0 ? (
            <div className={`minimal-card ${cardRadius} p-8 text-center text-xs font-mono text-zinc-500`}>
              This page has no blocks yet. Add Text, Photo, Gallery, Video, or Button blocks from the CMS Pages panel.
            </div>
          ) : (
            blocks.map((block, idx) => {
              if (!isPreview) {
                return <div key={block.id || idx}>{renderBlock(block)}</div>;
              }
              const isSelected = selectedBlockIndex === idx;
              return (
                <div
                  key={block.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBlockIndex?.(idx);
                  }}
                  className={`relative rounded-xl p-1 -m-1 cursor-pointer transition-all ${
                    isSelected ? 'ring-1 ring-accent' : 'hover:ring-1 hover:ring-white/25'
                  }`}
                >
                  {renderBlock(block)}
                </div>
              );
            })
          )}
        </div>
      </div>
    </article>
  );
}
