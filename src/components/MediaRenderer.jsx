import React from 'react';
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
  const imgSrc = String(imageUrl || '').trim() || (!preferVideo && parseVideoSource(videoUrl)?.thumbnailUrl) || '';

  if (video) {
    return (
      <div className={`w-full overflow-hidden bg-[#09090b] ${aspectClass} ${className}`}>
        {video.kind === 'iframe' ? (
          <iframe
            src={video.embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            src={video.src}
            poster={imgSrc || undefined}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  if (imgSrc) {
    return (
      <div className={`w-full overflow-hidden bg-[#09090b] ${aspectClass} ${className}`}>
        <img
          src={imgSrc}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            monochrome ? 'grayscale hover:grayscale-0' : ''
          }`}
          loading="lazy"
        />
      </div>
    );
  }

  return null;
}
