/**
 * Parses YouTube, Vimeo, Google Drive, or direct MP4/WebM video URLs into
 * a normalized player descriptor.
 */
export function parseVideoSource(rawUrl) {
  const url = String(rawUrl || '').trim();
  if (!url) return null;

  // YouTube (watch, youtu.be, shorts, embed)
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      kind: 'iframe',
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      kind: 'iframe',
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      thumbnailUrl: '',
    };
  }

  // Google Drive preview link
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return {
      kind: 'iframe',
      provider: 'gdrive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      thumbnailUrl: '',
    };
  }

  // Direct HTML5 video or generic https video URL
  if (/^https?:\/\//i.test(url)) {
    return {
      kind: 'video',
      provider: 'direct',
      src: url,
      thumbnailUrl: '',
    };
  }

  return null;
}

/**
 * Normalizes a pasted Google Drive image link into a direct embeddable image URL,
 * or preserves standard http(s) and data:image URLs.
 */
export function normalizeImageUrl(rawUrl) {
  const url = String(rawUrl || '').trim();
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;

  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function canvasFromSource(source, width, height, quality) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable.');
  }
  ctx.drawImage(source, 0, 0, width, height);

  let dataUrl = canvas.toDataURL('image/webp', quality);
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }
  if (dataUrl.length > 160000) {
    dataUrl = canvas.toDataURL('image/jpeg', 0.6);
  }
  // Free canvas backing store immediately on mobile devices
  canvas.width = 0;
  canvas.height = 0;

  const approxBytes = Math.round((dataUrl.length * 3) / 4);
  return {
    dataUrl,
    width,
    height,
    approxKb: Math.max(1, Math.round(approxBytes / 1024)),
  };
}

/**
 * Compresses an uploaded image file client-side into a compact WebP/JPEG
 * Data URL suitable for free-tier Firestore storage, using createImageBitmap
 * downscaling when available to protect low/mid-end phone memory.
 */
export async function compressImageFile(file, { maxWidth = 1080, quality = 0.76 } = {}) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file.');
  }

  if (typeof createImageBitmap === 'function') {
    try {
      const probe = await createImageBitmap(file);
      const scale = probe.width > maxWidth ? maxWidth / probe.width : 1;
      const targetW = Math.max(1, Math.round(probe.width * scale));
      const targetH = Math.max(1, Math.round(probe.height * scale));
      probe.close?.();

      const bitmap =
        scale < 1
          ? await createImageBitmap(file, { resizeWidth: targetW, resizeQuality: 'high' })
          : await createImageBitmap(file);

      try {
        return canvasFromSource(bitmap, targetW, targetH, quality);
      } finally {
        bitmap.close?.();
      }
    } catch {
      // Fall back to standard Image() path if browser doesn't support resize options
    }
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Invalid image format.'));
    };
    img.onload = () => {
      try {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        resolve(canvasFromSource(img, width, height, quality));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    img.src = objectUrl;
  });
}

export function estimateJsonKb(obj) {
  try {
    const bytes = new Blob([JSON.stringify(obj)]).size;
    return Math.round(bytes / 1024);
  } catch {
    return 0;
  }
}
