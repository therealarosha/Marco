import React, { useRef } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Code,
  Eye,
  EyeOff,
  GripVertical,
  Italic,
  Link as LinkIcon,
  Plus,
  Sparkles,
  Trash2
} from 'lucide-react';
import { moveItem, reorderItems } from '../../lib/listUtils';

export function Field({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  mono = false,
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] focus:border-accent focus:outline-none text-xs text-zinc-100 placeholder-zinc-600 transition-colors ${
          mono ? 'font-mono' : ''
        }`}
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3, placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] focus:border-accent focus:outline-none text-xs text-zinc-100 placeholder-zinc-600 transition-colors resize-y"
      />
    </label>
  );
}

export function RichTextField({ label, value, onChange, rows = 2, placeholder = '' }) {
  const inputRef = useRef(null);

  const wrapSelection = (prefix, suffix, fallback = 'text') => {
    const el = inputRef.current;
    const current = String(value ?? '');
    if (!el) {
      onChange(`${current}${prefix}${fallback}${suffix}`);
      return;
    }

    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const selected = current.slice(start, end) || fallback;
    const next = `${current.slice(0, start)}${prefix}${selected}${suffix}${current.slice(end)}`;
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      const cursorPos = start + prefix.length + selected.length + suffix.length;
      el.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <div className="block">
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1 bg-[#09090b] border border-white/[0.08] rounded-md p-0.5">
          <button
            type="button"
            onClick={() => wrapSelection('**', '**', 'bold')}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            title="Bold (**text**)"
          >
            <Bold className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('*', '*', 'italic')}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            title="Italic (*text*)"
          >
            <Italic className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('==', '==', 'highlight')}
            className="p-1 rounded text-accent hover:bg-white/[0.06]"
            title="Accent Highlight (==text==)"
          >
            <Sparkles className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('`', '`', 'code')}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            title="Inline Code (`code`)"
          >
            <Code className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('[', '](https://)', 'link')}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            title="Link ([label](url))"
          >
            <LinkIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      <textarea
        ref={inputRef}
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] focus:border-accent focus:outline-none text-xs text-zinc-100 placeholder-zinc-600 transition-colors resize-y"
      />
    </div>
  );
}

export function ToggleSwitch({ label, checked, onChange, description = '' }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
      <div>
        <span className="text-xs font-medium text-zinc-200 block">{label}</span>
        {description && (
          <span className="text-[11px] text-zinc-500 block">{description}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-accent' : 'bg-zinc-800 border border-white/[0.1]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

export function SliderField({ label, value, min, max, step, unit = '', onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[11px] font-mono text-accent">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)] cursor-pointer"
      />
    </div>
  );
}

export function ButtonListEditor({
  title,
  buttons = [],
  onChange,
  allowAction = false,
  allowIcon = true,
  allowVariant = true,
  createNewItem,
}) {
  const dragIndexRef = useRef(null);

  const handleDrop = (targetIdx) => {
    const fromIdx = dragIndexRef.current;
    dragIndexRef.current = null;
    if (fromIdx === null || fromIdx === targetIdx) return;
    onChange(reorderItems(buttons, fromIdx, targetIdx));
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          {title}
        </span>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...buttons,
              createNewItem
                ? createNewItem()
                : {
                    id: `btn-${Date.now()}`,
                    label: 'New Button',
                    href: '#contact',
                    variant: 'outline',
                    icon: 'arrow',
                    visible: true,
                  },
            ])
          }
          className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-300 hover:text-white"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      <div className="space-y-2">
        {buttons.map((btn, idx) => (
          <div
            key={btn.id || idx}
            draggable
            onDragStart={() => {
              dragIndexRef.current = idx;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            className="p-3 rounded-lg bg-[#09090b] border border-white/[0.08] space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab shrink-0" />
                <span className="truncate max-w-[140px]">
                  {btn.label || (btn.action === 'copy' ? 'Copy Email' : 'Button')}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const copy = [...buttons];
                    copy[idx] = { ...copy[idx], visible: copy[idx].visible === false };
                    onChange(copy);
                  }}
                  className="p-1 text-zinc-400 hover:text-white"
                  title={btn.visible === false ? 'Show' : 'Hide'}
                >
                  {btn.visible === false ? (
                    <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onChange(moveItem(buttons, idx, -1))}
                  className="p-1 text-zinc-500 hover:text-white"
                  aria-label="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(moveItem(buttons, idx, 1))}
                  className="p-1 text-zinc-500 hover:text-white"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(buttons.filter((_, i) => i !== idx))}
                  className="p-1 text-zinc-500 hover:text-accent"
                  aria-label="Remove button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Text"
                value={btn.label}
                placeholder={btn.action === 'copy' ? 'Defaults to email' : 'Button text'}
                onChange={(v) => {
                  const copy = [...buttons];
                  copy[idx] = { ...copy[idx], label: v };
                  onChange(copy);
                }}
              />
              {allowAction ? (
                <label className="block">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Action
                  </span>
                  <select
                    value={btn.action || 'link'}
                    onChange={(e) => {
                      const copy = [...buttons];
                      copy[idx] = { ...copy[idx], action: e.target.value };
                      onChange(copy);
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] text-xs text-zinc-100 focus:border-accent focus:outline-none"
                  >
                    <option value="mailto">Email (mailto)</option>
                    <option value="copy">Copy Email</option>
                    <option value="link">Custom Link</option>
                  </select>
                </label>
              ) : (
                <Field
                  label="Link / Target"
                  value={btn.href}
                  mono
                  placeholder="#projects or https://..."
                  onChange={(v) => {
                    const copy = [...buttons];
                    copy[idx] = { ...copy[idx], href: v };
                    onChange(copy);
                  }}
                />
              )}
            </div>

            {(allowVariant || allowIcon || (allowAction && btn.action === 'link')) && (
              <div className="grid grid-cols-2 gap-2">
                {allowAction && btn.action === 'link' && (
                  <div className="col-span-2">
                    <Field
                      label="Link URL"
                      value={btn.href}
                      mono
                      placeholder="https://..."
                      onChange={(v) => {
                        const copy = [...buttons];
                        copy[idx] = { ...copy[idx], href: v };
                        onChange(copy);
                      }}
                    />
                  </div>
                )}

                {allowVariant && (
                  <label className="block">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Style
                    </span>
                    <select
                      value={btn.variant || 'outline'}
                      onChange={(e) => {
                        const copy = [...buttons];
                        copy[idx] = { ...copy[idx], variant: e.target.value };
                        onChange(copy);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] text-xs text-zinc-100 focus:border-accent focus:outline-none"
                    >
                      <option value="accent">Accent Solid</option>
                      <option value="outline">Outline</option>
                      <option value="ghost">Minimal Text</option>
                    </select>
                  </label>
                )}

                {allowIcon && (
                  <label className="block">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Icon
                    </span>
                    <select
                      value={btn.icon || 'none'}
                      onChange={(e) => {
                        const copy = [...buttons];
                        copy[idx] = { ...copy[idx], icon: e.target.value };
                        onChange(copy);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] text-xs text-zinc-100 focus:border-accent focus:outline-none"
                    >
                      <option value="none">None</option>
                      <option value="arrow">Arrow Up-Right</option>
                      <option value="play">Play</option>
                      <option value="terminal">Terminal</option>
                      <option value="download">Download</option>
                      <option value="mail">Mail</option>
                      <option value="external">External Link</option>
                    </select>
                  </label>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
