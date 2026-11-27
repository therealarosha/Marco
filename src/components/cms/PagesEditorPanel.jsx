import React, { useRef } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Film,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Minus,
  MousePointerClick,
  Plus,
  Trash2,
  Type
} from 'lucide-react';
import {
  ButtonListEditor,
  Field,
  RichTextField,
  ToggleSwitch
} from './CmsFields';
import { PhotoInput, VideoInput } from './MediaPicker';
import { moveItem, reorderItems } from '../../lib/listUtils';

function createDefaultBlock(type) {
  const id = `blk-${Date.now()}`;
  switch (type) {
    case 'photo':
      return {
        id,
        type: 'photo',
        imageUrl: '',
        caption: '',
        aspect: '16:9',
        monochrome: false,
      };
    case 'gallery':
      return {
        id,
        type: 'gallery',
        columns: 3,
        monochrome: false,
        items: [
          { imageUrl: '', caption: 'Shot 01' },
          { imageUrl: '', caption: 'Shot 02' },
          { imageUrl: '', caption: 'Shot 03' },
        ],
      };
    case 'video':
      return {
        id,
        type: 'video',
        videoUrl: '',
        posterUrl: '',
        heading: '',
        caption: '',
        aspect: '16:9',
      };
    case 'buttons':
      return {
        id,
        type: 'buttons',
        buttons: [
          {
            id: `btn-${Date.now()}`,
            label: 'Back to Work',
            href: '#projects',
            variant: 'accent',
            icon: 'arrow',
            visible: true,
          },
        ],
      };
    case 'divider':
      return {
        id,
        type: 'divider',
        label: '',
      };
    case 'text':
    default:
      return {
        id,
        type: 'text',
        heading: 'Section Heading',
        body: 'Write story, case study notes, or behind-the-scenes details here.',
        align: 'left',
      };
  }
}

export default function PagesEditorPanel({
  pages = [],
  onChangePages,
  activePageSlug,
  onSelectPageSlug,
  selectedBlockIndex,
  onSelectBlockIndex,
}) {
  const dragRef = useRef(null);

  const selectedPageIndex = pages.findIndex((p) => p.slug === activePageSlug);
  const currentPage = selectedPageIndex >= 0 ? pages[selectedPageIndex] : pages[0] || null;
  const effectiveIndex = selectedPageIndex >= 0 ? selectedPageIndex : pages.length ? 0 : -1;

  const updateCurrentPage = (updater) => {
    if (effectiveIndex < 0) return;
    const copy = [...pages];
    copy[effectiveIndex] = updater(copy[effectiveIndex]);
    onChangePages(copy);
  };

  const handleAddPage = () => {
    const idx = pages.length + 1;
    const slug = `page-${idx}`;
    const newPage = {
      id: `pg-${Date.now()}`,
      slug,
      title: `New Page ${idx}==.==`,
      navLabel: `Page ${idx}`,
      eyebrow: '01 / Custom Page',
      subtitle: 'Custom layout with photos, videos, and formatted copy.',
      published: true,
      showInNav: true,
      blocks: [createDefaultBlock('text')],
    };
    onChangePages([...pages, newPage]);
    onSelectPageSlug(slug);
    onSelectBlockIndex?.(0);
  };

  const handleDeletePage = (idx) => {
    const remaining = pages.filter((_, i) => i !== idx);
    onChangePages(remaining);
    onSelectPageSlug(remaining[0]?.slug || null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold text-white">Custom Pages</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Create standalone pages (<code className="font-mono text-zinc-300">#/page/slug</code>) with photos, videos & buttons.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddPage}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white bg-accent hover:bg-accent-hover transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Page</span>
        </button>
      </div>

      {/* Page Selector Pills */}
      {pages.length === 0 ? (
        <div className="p-4 rounded-lg bg-[#09090b] border border-dashed border-white/[0.12] text-center space-y-2">
          <p className="text-xs text-zinc-400">No custom pages yet.</p>
          <p className="text-[11px] text-zinc-500">
            Click <strong>New Page</strong> to build a Showreel, Photography Gallery, About/CV, or Case Study page.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {pages.map((p, idx) => {
            const isSel = idx === effectiveIndex;
            return (
              <button
                key={p.id || idx}
                type="button"
                onClick={() => {
                  onSelectPageSlug(p.slug);
                  onSelectBlockIndex?.(null);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                  isSel
                    ? 'bg-[#141417] border-accent text-white'
                    : 'bg-[#09090b] border-white/[0.08] text-zinc-400 hover:text-white'
                }`}
              >
                /{p.slug}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Page Editor */}
      {currentPage && (
        <div className="space-y-4 pt-2 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-accent">
              Route: #/page/{currentPage.slug}
            </span>
            <button
              type="button"
              onClick={() => handleDeletePage(effectiveIndex)}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-accent"
            >
              <Trash2 className="w-3 h-3" /> Delete Page
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Field
              label="URL Slug"
              value={currentPage.slug}
              mono
              onChange={(v) => {
                const clean = v.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                updateCurrentPage((p) => ({ ...p, slug: clean }));
                onSelectPageSlug(clean);
              }}
            />
            <Field
              label="Eyebrow Label"
              value={currentPage.eyebrow}
              mono
              onChange={(v) => updateCurrentPage((p) => ({ ...p, eyebrow: v }))}
            />
          </div>

          <RichTextField
            label="Page Title"
            value={currentPage.title}
            rows={1}
            onChange={(v) => updateCurrentPage((p) => ({ ...p, title: v }))}
          />

          <RichTextField
            label="Page Subtitle"
            value={currentPage.subtitle}
            rows={2}
            onChange={(v) => updateCurrentPage((p) => ({ ...p, subtitle: v }))}
          />

          <div className="p-3 rounded-lg bg-[#09090b] border border-white/[0.08] space-y-2">
            <ToggleSwitch
              label="Published (Visible to Visitors)"
              checked={currentPage.published !== false}
              onChange={(val) => updateCurrentPage((p) => ({ ...p, published: val }))}
            />
            <ToggleSwitch
              label="Show Link in Navbar"
              checked={Boolean(currentPage.showInNav)}
              onChange={(val) => updateCurrentPage((p) => ({ ...p, showInNav: val }))}
            />
            {currentPage.showInNav && (
              <Field
                label="Navbar Label"
                value={currentPage.navLabel || ''}
                placeholder={currentPage.title}
                onChange={(v) => updateCurrentPage((p) => ({ ...p, navLabel: v }))}
              />
            )}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(`#/page/${currentPage.slug}`);
              }}
              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 hover:text-white pt-1"
            >
              <Copy className="w-3 h-3" />
              <span>Copy link target (#/page/{currentPage.slug}) for custom buttons</span>
            </button>
          </div>

          {/* Add Block Toolbar */}
          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              Add Content Block
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { type: 'text', label: 'Text', icon: Type },
                { type: 'photo', label: 'Photo', icon: ImageIcon },
                { type: 'gallery', label: 'Photo Grid', icon: LayoutGrid },
                { type: 'video', label: 'Video', icon: Film },
                { type: 'buttons', label: 'Buttons', icon: MousePointerClick },
                { type: 'divider', label: 'Divider', icon: Minus },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      const nextBlock = createDefaultBlock(item.type);
                      updateCurrentPage((p) => ({
                        ...p,
                        blocks: [...(p.blocks || []), nextBlock],
                      }));
                      onSelectBlockIndex?.((currentPage.blocks || []).length);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#09090b] border border-white/[0.08] hover:border-accent text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
                  >
                    <Icon className="w-3 h-3 text-accent" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Blocks List (Drag to Reorder) */}
          <div className="space-y-3">
            {(currentPage.blocks || []).map((block, bIdx) => {
              const isSelected = selectedBlockIndex === bIdx;
              const blocks = currentPage.blocks || [];
              return (
                <div
                  key={block.id || bIdx}
                  draggable
                  onDragStart={() => {
                    dragRef.current = bIdx;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const from = dragRef.current;
                    dragRef.current = null;
                    if (from !== null && from !== bIdx) {
                      updateCurrentPage((p) => ({
                        ...p,
                        blocks: reorderItems(p.blocks || [], from, bIdx),
                      }));
                    }
                  }}
                  onClick={() => onSelectBlockIndex?.(bIdx)}
                  className={`p-3 rounded-lg bg-[#09090b] border space-y-3 transition-colors ${
                    isSelected ? 'border-accent' : 'border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-200 uppercase">
                      <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab" />
                      <span>
                        {String(bIdx + 1).padStart(2, '0')} / {block.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateCurrentPage((p) => ({
                            ...p,
                            blocks: moveItem(blocks, bIdx, -1),
                          }))
                        }
                        className="p-1 text-zinc-500 hover:text-white"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateCurrentPage((p) => ({
                            ...p,
                            blocks: moveItem(blocks, bIdx, 1),
                          }))
                        }
                        className="p-1 text-zinc-500 hover:text-white"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateCurrentPage((p) => ({
                            ...p,
                            blocks: blocks.filter((_, i) => i !== bIdx),
                          }))
                        }
                        className="p-1 text-zinc-500 hover:text-accent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Block Specific Controls */}
                  {block.type === 'text' && (
                    <div className="space-y-2.5">
                      <RichTextField
                        label="Heading"
                        value={block.heading}
                        rows={1}
                        onChange={(v) =>
                          updateCurrentPage((p) => {
                            const next = [...(p.blocks || [])];
                            next[bIdx] = { ...next[bIdx], heading: v };
                            return { ...p, blocks: next };
                          })
                        }
                      />
                      <RichTextField
                        label="Body Copy"
                        value={block.body}
                        rows={4}
                        onChange={(v) =>
                          updateCurrentPage((p) => {
                            const next = [...(p.blocks || [])];
                            next[bIdx] = { ...next[bIdx], body: v };
                            return { ...p, blocks: next };
                          })
                        }
                      />
                      <label className="block">
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                          Alignment
                        </span>
                        <select
                          value={block.align || 'left'}
                          onChange={(e) =>
                            updateCurrentPage((p) => {
                              const next = [...(p.blocks || [])];
                              next[bIdx] = { ...next[bIdx], align: e.target.value };
                              return { ...p, blocks: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#101012] border border-white/[0.1] text-xs text-zinc-100"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                        </select>
                      </label>
                    </div>
                  )}

                  {block.type === 'photo' && (
                    <div className="space-y-2.5">
                      <PhotoInput
                        label="Photo Source"
                        value={block.imageUrl}
                        onChange={(v) =>
                          updateCurrentPage((p) => {
                            const next = [...(p.blocks || [])];
                            next[bIdx] = { ...next[bIdx], imageUrl: v };
                            return { ...p, blocks: next };
                          })
                        }
                      />
                      <Field
                        label="Caption (optional)"
                        value={block.caption}
                        onChange={(v) =>
                          updateCurrentPage((p) => {
                            const next = [...(p.blocks || [])];
                            next[bIdx] = { ...next[bIdx], caption: v };
                            return { ...p, blocks: next };
                          })
                        }
                      />
                      <div className="grid grid-cols-2 gap-2 items-end">
                        <label className="block">
                          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                            Aspect
                          </span>
                          <select
                            value={block.aspect || '16:9'}
                            onChange={(e) =>
                              updateCurrentPage((p) => {
                                const next = [...(p.blocks || [])];
                                next[bIdx] = { ...next[bIdx], aspect: e.target.value };
                                return { ...p, blocks: next };
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#101012] border border-white/[0.1] text-xs text-zinc-100"
                          >
                            <option value="16:9">16:9 Wide</option>
                            <option value="4:3">4:3 Classic</option>
                            <option value="1:1">1:1 Square</option>
                            <option value="auto">Original</option>
                          </select>
                        </label>
                        <ToggleSwitch
                          label="Monochrome"
                          checked={Boolean(block.monochrome)}
                          onChange={(val) =>
                            updateCurrentPage((p) => {
                              const next = [...(p.blocks || [])];
                              next[bIdx] = { ...next[bIdx], monochrome: val };
                              return { ...p, blocks: next };
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {block.type === 'gallery' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <label className="block">
                          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                            Columns
                          </span>
                          <select
                            value={block.columns || 3}
                            onChange={(e) =>
                              updateCurrentPage((p) => {
                                const next = [...(p.blocks || [])];
                                next[bIdx] = { ...next[bIdx], columns: Number(e.target.value) };
                                return { ...p, blocks: next };
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#101012] border border-white/[0.1] text-xs text-zinc-100"
                          >
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                          </select>
                        </label>
                        <ToggleSwitch
                          label="Monochrome"
                          checked={Boolean(block.monochrome)}
                          onChange={(val) =>
                            updateCurrentPage((p) => {
                              const next = [...(p.blocks || [])];
                              next[bIdx] = { ...next[bIdx], monochrome: val };
                              return { ...p, blocks: next };
                            })
                          }
                        />
                      </div>

                      {(block.items || []).map((item, gIdx) => (
                        <div
                          key={gIdx}
                          className="p-2.5 rounded-lg bg-[#101012] border border-white/[0.06] space-y-2"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                            <span>Slot 0{gIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCurrentPage((p) => {
                                  const next = [...(p.blocks || [])];
                                  next[bIdx] = {
                                    ...next[bIdx],
                                    items: (next[bIdx].items || []).filter((_, i) => i !== gIdx),
                                  };
                                  return { ...p, blocks: next };
                                })
                              }
                              className="text-zinc-500 hover:text-accent"
                            >
                              Remove
                            </button>
                          </div>
                          <PhotoInput
                            label="Photo"
                            value={item.imageUrl}
                            compact
                            onChange={(v) =>
                              updateCurrentPage((p) => {
                                const next = [...(p.blocks || [])];
                                const items = [...(next[bIdx].items || [])];
                                items[gIdx] = { ...items[gIdx], imageUrl: v };
                                next[bIdx] = { ...next[bIdx], items };
                                return { ...p, blocks: next };
                              })
                            }
                          />
                          <Field
                            label="Caption"
                            value={item.caption}
                            onChange={(v) =>
                              updateCurrentPage((p) => {
                                const next = [...(p.blocks || [])];
                                const items = [...(next[bIdx].items || [])];
                                items[gIdx] = { ...items[gIdx], caption: v };
                                next[bIdx] = { ...next[bIdx], items };
                                return { ...p, blocks: next };
                              })
                            }
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          updateCurrentPage((p) => {
                            const next = [...(p.blocks || [])];
                            next[bIdx] = {
                              ...next[bIdx],
                              items: [
                                ...(next[bIdx].items || []),
                                { imageUrl: '', caption: '' },
                              ],
                            };
                            return { ...p, blocks: next };
                          })
                        }
                        className="w-full py-1.5 rounded-lg border border-dashed border-white/[0.15] hover:border-accent text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                      >
                        + Add Photo Slot
                      </button>
                    </div>
                  )}

                  {block.type === 'video' && (
                    <div className="space-y-2.5">
                      <VideoInput
                        label="Video URL (YouTube, Vimeo, Drive, MP4)"
                        value={block.videoUrl}
                        onChange={(v) =>
                          updateCurrentPage((p) => {
                            const next = [...(p.blocks || [])];
                            next[bIdx] = { ...next[bIdx], videoUrl: v };
                            return { ...p, blocks: next };
                          })
                        }
                      />
                      <Field
                        label="Video Title"
                        value={block.heading}
                        onChange={(v) =>
                          updateCurrentPage((p) => {
                            const next = [...(p.blocks || [])];
                            next[bIdx] = { ...next[bIdx], heading: v };
                            return { ...p, blocks: next };
                          })
                        }
                      />
                      <Field
                        label="Caption"
                        value={block.caption}
                        onChange={(v) =>
                          updateCurrentPage((p) => {
                            const next = [...(p.blocks || [])];
                            next[bIdx] = { ...next[bIdx], caption: v };
                            return { ...p, blocks: next };
                          })
                        }
                      />
                      <label className="block">
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                          Aspect Ratio
                        </span>
                        <select
                          value={block.aspect || '16:9'}
                          onChange={(e) =>
                            updateCurrentPage((p) => {
                              const next = [...(p.blocks || [])];
                              next[bIdx] = { ...next[bIdx], aspect: e.target.value };
                              return { ...p, blocks: next };
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#101012] border border-white/[0.1] text-xs text-zinc-100"
                        >
                          <option value="16:9">16:9 Standard</option>
                          <option value="21:9">21:9 Anamorphic Cinema</option>
                          <option value="9:16">9:16 Vertical Reel</option>
                        </select>
                      </label>
                    </div>
                  )}

                  {block.type === 'buttons' && (
                    <ButtonListEditor
                      title="Buttons"
                      buttons={block.buttons || []}
                      onChange={(buttons) =>
                        updateCurrentPage((p) => {
                          const next = [...(p.blocks || [])];
                          next[bIdx] = { ...next[bIdx], buttons };
                          return { ...p, blocks: next };
                        })
                      }
                    />
                  )}

                  {block.type === 'divider' && (
                    <Field
                      label="Divider Label (optional)"
                      value={block.label}
                      mono
                      onChange={(v) =>
                        updateCurrentPage((p) => {
                          const next = [...(p.blocks || [])];
                          next[bIdx] = { ...next[bIdx], label: v };
                          return { ...p, blocks: next };
                        })
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
