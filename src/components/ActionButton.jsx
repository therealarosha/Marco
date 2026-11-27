import React from 'react';
import {
  ArrowUpRight,
  Download,
  ExternalLink,
  Mail,
  Play,
  Terminal
} from 'lucide-react';

const ICON_MAP = {
  arrow: ArrowUpRight,
  play: Play,
  terminal: Terminal,
  download: Download,
  mail: Mail,
  external: ExternalLink,
};

const VARIANT_CLASSES = {
  accent: 'px-4 py-2 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors',
  outline: 'px-4 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white bg-[#101012] border border-white/[0.12] hover:border-white/[0.28] transition-colors',
  ghost: 'text-xs font-medium text-zinc-400 hover:text-white transition-colors px-1 py-1',
};

export function ActionIcon({ icon, className = 'w-3.5 h-3.5' }) {
  if (!icon || icon === 'none') return null;
  const Icon = ICON_MAP[icon];
  return Icon ? <Icon className={className} /> : null;
}

export default function ActionButton({ button, onClick }) {
  const variant = button.variant || 'ghost';
  const cls = VARIANT_CLASSES[variant] || VARIANT_CLASSES.ghost;
  const isExternal = /^https?:\/\//i.test(button.href || '');

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-1.5 ${cls}`}
      >
        <ActionIcon icon={button.icon} />
        <span>{button.label}</span>
      </button>
    );
  }

  return (
    <a
      href={button.href || '#'}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
      className={`inline-flex items-center justify-center gap-1.5 ${cls}`}
    >
      <span>{button.label}</span>
      <ActionIcon icon={button.icon} />
    </a>
  );
}
