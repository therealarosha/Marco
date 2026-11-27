import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { parseVideoSource } from '../lib/mediaUtils';

export default function MediaRenderer({
  imageUrl = '',
  videoUrl = '',
  title = 'Media',
  aspectClass = 'aspect-video',
  monochrome = false,
  className = '',
  preferVideo = true,
}) {
  const video = preferVideo ? parseVideoSource(videoUrl) : null;
  const fallbackThumb = !preferVideo ? parseVideoSource(videoUrl)?.thumbnailUrl : '';
  const imgSrc = String(imageUrl || '').trim() || fallbackThumb || '';
  const [iframeActive, setIframeActive] = useState(false);

  if (video) {
    if (video.kind === 'iframe') {
      const thumb = String(imageUrl || '').trim() || video.thumbnailUrl || '';
      const activeSrc = video.embedUrl.includes('?')
        ? `${video.embedUrl}&autoplay=1`
        : `${video.embedUrl}?autoplay=1`;

      return (
        <div className={`w-full overflow-hidden bg-[#09090b] relative ${aspectClass} ${className}`}>
          {iframeActive ? (
            <iframe
              src={activeSrc}
              title={title}
              loading="lazy"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setIframeActive(true)}
              className="w-full h-full relative flex flex-col items-center justify-center group bg-[#09090b] text-left"
              aria-label={`Play ${title}`}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="absolute inset-0 bg-subtle-dots opacity-40" />
              )}
              <div className="absolute inset-0 bg-black/35" />
              <span className="relative z-10 w-12 h-12 rounded-full bg-accent group-hover:bg-accent-hover text-white flex items-center justify-center transition-transform group-hover:scale-105">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </span>
              <span className="relative z-10 mt-2.5 text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                Tap to Load {video.provider} Video
              </span>
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={`w-full overflow-hidden bg-[#09090b] ${aspectClass} ${className}`}>
        <video
          src={video.src}
          poster={imgSrc || undefined}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (imgSrc) {
    return (
      <div className={`w-full overflow-hidden bg-[#09090b] ${aspectClass} ${className}`}>
        <img
          src={imgSrc}
          alt={title}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-all duration-300 ${
            monochrome ? 'grayscale hover:grayscale-0' : ''
          }`}
        />
      </div>
    );
  }

  return null;
}
