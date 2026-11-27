import React, { useRef, useState } from 'react';
import { Film, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import {
  compressImageFile,
  normalizeImageUrl,
  parseVideoSource
} from '../../lib/mediaUtils';

export function PhotoInput({
  label = 'Photo',
  value = '',
  onChange,
  compact = false,
}) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const res = await compressImageFile(file);
      onChange(res.dataUrl);
      setInfo(`Compressed to ${res.approxKb} KB (${res.width}x${res.height})`);
    } catch (err) {
      setError(err.message || 'Could not process image.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-3 h-3" />
          <span>{label}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-[10px] font-mono text-zinc-200 transition-colors"
          >
            <Upload className="w-3 h-3" />
            <span>{busy ? 'Compressing...' : 'Upload Photo'}</span>
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setInfo('');
              }}
              className="p-1 text-zinc-500 hover:text-accent"
              title="Clear photo"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <input
        type="text"
        value={value?.startsWith('data:image/') ? '' : value || ''}
        onChange={(e) => {
          setInfo('');
          setError('');
          onChange(e.target.value ? normalizeImageUrl(e.target.value) : '');
        }}
        placeholder={
          value?.startsWith('data:image/')
            ? 'Uploaded image stored inline (or paste URL to replace)'
            : 'Paste image URL or Google Drive share link...'
        }
        className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] focus:border-accent focus:outline-none text-xs font-mono text-zinc-100 placeholder-zinc-600 transition-colors"
      />

      {!compact && value && (
        <div className="rounded-lg overflow-hidden border border-white/[0.08] bg-[#09090b] h-28 flex items-center justify-center">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {info && <p className="text-[10px] font-mono text-zinc-400">{info}</p>}
      {error && <p className="text-[10px] font-mono text-accent">{error}</p>}
    </div>
  );
}

export function VideoInput({ label = 'Video URL (Optional)', value = '', onChange }) {
  const parsed = parseVideoSource(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Film className="w-3 h-3" />
          <span>{label}</span>
        </span>
        {parsed && (
          <span className="text-[10px] font-mono text-accent uppercase">
            {parsed.provider}
          </span>
        )}
      </div>

      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="YouTube, Vimeo, Google Drive, or .mp4 URL..."
        className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] focus:border-accent focus:outline-none text-xs font-mono text-zinc-100 placeholder-zinc-600 transition-colors"
      />
    </div>
  );
}
