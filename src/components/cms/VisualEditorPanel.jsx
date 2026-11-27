import React, { useRef } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FilePlus2,
  Film,
  GripVertical,
  Layout,
  Loader,
  MousePointerClick,
  Palette,
  Play,
  Sliders,
  Upload
} from 'lucide-react';
import {
  ButtonListEditor,
  Field,
  RichTextField,
  SliderField,
  TextArea,
  ToggleSwitch
} from './CmsFields';
import PagesEditorPanel from './PagesEditorPanel';
import { moveItem, reorderItems } from '../../lib/listUtils';
import { LOTTIE_PRESETS } from '../../data/lottiePresets';

const ACCENT_SWATCHES = [
  { hex: '#FF4D00', label: 'Signal Orange' },
  { hex: '#FFFFFF', label: 'Pure White' },
  { hex: '#3B82F6', label: 'Cobalt' },
  { hex: '#10B981', label: 'Emerald' },
  { hex: '#E11D48', label: 'Crimson' },
];

const BENTO_LABELS = {
  profile: '01 / Main Profile & Bio',
  academia: '02 / WUSL Academia',
  craft: '03 / Cinema & Leadership',
  terminal: '04 / Interactive Shell',
};

export default function VisualEditorPanel({
  draft,
  updateDraft,
  selectedBlock,
  onSelectBlock,
  previewPageSlug,
  onSelectPreviewPageSlug,
  selectedPageBlockIndex,
  onSelectPageBlockIndex,
  onReplayLoader,
}) {
  const siteConfig = draft.siteConfig;
  const loaderCfg = siteConfig.loader || {};
  const sectionDragRef = useRef(null);
  const bentoDragRef = useRef(null);
  const fileInputRef = useRef(null);

  const updateSiteConfig = (updater) => {
    updateDraft((d) => ({
      ...d,
      siteConfig: updater(d.siteConfig),
    }));
  };

  const activeTab = selectedBlock || 'sections';

  const panelTabs = [
    { id: 'sections', label: 'Sections', icon: Layout },
    { id: 'pages', label: `Pages (${(siteConfig.pages || []).length})`, icon: FilePlus2 },
    { id: 'navbar', label: 'Navbar', icon: MousePointerClick },
    { id: 'hero', label: 'Hero & Buttons', icon: Sliders },
    { id: 'footer', label: 'Footer', icon: MousePointerClick },
    { id: 'lottie', label: 'Lottie BG', icon: Film },
    { id: 'loader', label: 'Loader', icon: Loader },
    { id: 'theme', label: 'Theme', icon: Palette },
  ];

  // If the user clicked a section on the live preview (arsenal/projects/reel/leadership),
  // map it into the Sections editor while keeping it highlighted!
  const effectiveTab = ['arsenal', 'projects', 'reel', 'leadership'].includes(activeTab)
    ? 'sections'
    : activeTab;

  const handleLottieFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      updateSiteConfig((sc) => ({
        ...sc,
        lottie: {
          ...sc.lottie,
          enabled: true,
          sourceType: 'json',
          customJson: text,
        },
      }));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] border-r border-white/[0.08]">
      {/* Sub-navigation inside Visual Inspector */}
      <div className="p-3 border-b border-white/[0.08] flex flex-wrap gap-1.5">
        {panelTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = effectiveTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectBlock(tab.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Inspector Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 1. PAGE SECTIONS ORDER & COPY */}
        {effectiveTab === 'sections' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-white">
                Page Sections Order & Headings
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Drag handles or use arrows to reorder sections, toggle visibility, and edit section headings.
              </p>
            </div>

            <div className="space-y-2.5">
              {siteConfig.sections.map((sec, idx) => {
                const isHighlighted = selectedBlock === sec.id;
                return (
                  <div
                    key={sec.id}
                    draggable
                    onDragStart={() => {
                      sectionDragRef.current = idx;
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      const from = sectionDragRef.current;
                      sectionDragRef.current = null;
                      if (from !== null && from !== idx) {
                        updateSiteConfig((sc) => ({
                          ...sc,
                          sections: reorderItems(sc.sections, from, idx),
                        }));
                      }
                    }}
                    className={`rounded-lg border p-3 space-y-3 transition-colors bg-[#09090b] ${
                      isHighlighted ? 'border-accent/60' : 'border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectBlock(sec.id)}
                        className="flex items-center gap-2 text-left text-xs font-medium text-white"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab shrink-0" />
                        <span>{sec.label}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig((sc) => {
                              const sections = [...sc.sections];
                              sections[idx] = {
                                ...sections[idx],
                                visible: sections[idx].visible === false,
                              };
                              return { ...sc, sections };
                            })
                          }
                          className="p-1 text-zinc-400 hover:text-white"
                          title={sec.visible === false ? 'Show section' : 'Hide section'}
                        >
                          {sec.visible === false ? (
                            <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig((sc) => ({
                              ...sc,
                              sections: moveItem(sc.sections, idx, -1),
                            }))
                          }
                          className="p-1 text-zinc-500 hover:text-white"
                          aria-label="Move section up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig((sc) => ({
                              ...sc,
                              sections: moveItem(sc.sections, idx, 1),
                            }))
                          }
                          className="p-1 text-zinc-500 hover:text-white"
                          aria-label="Move section down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {sec.id !== 'hero' && (
                      <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                        <Field
                          label="Eyebrow Label"
                          value={sec.eyebrow}
                          mono
                          onChange={(v) =>
                            updateSiteConfig((sc) => {
                              const sections = [...sc.sections];
                              sections[idx] = { ...sections[idx], eyebrow: v };
                              return { ...sc, sections };
                            })
                          }
                        />
                        <RichTextField
                          label="Section Title"
                          value={sec.title}
                          rows={1}
                          onChange={(v) =>
                            updateSiteConfig((sc) => {
                              const sections = [...sc.sections];
                              sections[idx] = { ...sections[idx], title: v };
                              return { ...sc, sections };
                            })
                          }
                        />
                        <RichTextField
                          label="Subtitle"
                          value={sec.subtitle}
                          rows={2}
                          onChange={(v) =>
                            updateSiteConfig((sc) => {
                              const sections = [...sc.sections];
                              sections[idx] = { ...sections[idx], subtitle: v };
                              return { ...sc, sections };
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. NAVBAR & NAVIGATION LINKS */}
        {effectiveTab === 'navbar' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white">
              Navbar Brand, Links & CTA
            </h3>
            <Field
              label="Brand Name Override (blank = Display Name)"
              value={siteConfig.navbar.brandText}
              placeholder={draft.personal.displayName}
              onChange={(v) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  navbar: { ...sc.navbar, brandText: v },
                }))
              }
            />
            <ToggleSwitch
              label="Show Subtitle Tag"
              checked={siteConfig.navbar.showUniversityTag}
              onChange={(val) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  navbar: { ...sc.navbar, showUniversityTag: val },
                }))
              }
            />
            {siteConfig.navbar.showUniversityTag && (
              <Field
                label="Subtitle Tag"
                value={siteConfig.navbar.universityTag}
                mono
                onChange={(v) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    navbar: { ...sc.navbar, universityTag: v },
                  }))
                }
              />
            )}

            <div className="pt-3 border-t border-white/[0.06] space-y-3">
              <ToggleSwitch
                label="Show Navbar Action Button"
                checked={siteConfig.navbar.showCta}
                onChange={(val) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    navbar: { ...sc.navbar, showCta: val },
                  }))
                }
              />
              {siteConfig.navbar.showCta && (
                <div className="grid grid-cols-2 gap-2.5">
                  <Field
                    label="Button Text"
                    value={siteConfig.navbar.ctaLabel}
                    onChange={(v) =>
                      updateSiteConfig((sc) => ({
                        ...sc,
                        navbar: { ...sc.navbar, ctaLabel: v },
                      }))
                    }
                  />
                  <Field
                    label="Target Link"
                    value={siteConfig.navbar.ctaHref}
                    mono
                    onChange={(v) =>
                      updateSiteConfig((sc) => ({
                        ...sc,
                        navbar: { ...sc.navbar, ctaHref: v },
                      }))
                    }
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.06]">
              <ButtonListEditor
                title="Navigation Links (Drag to Reorder)"
                buttons={siteConfig.navbar.links}
                allowIcon={false}
                allowVariant={false}
                createNewItem={() => ({
                  id: `nav-${Date.now()}`,
                  label: 'New Link',
                  href: '#about',
                  visible: true,
                })}
                onChange={(links) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    navbar: { ...sc.navbar, links },
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* 3. HERO, BENTO ORDER & ACTION BUTTONS */}
        {effectiveTab === 'hero' && (
          <div className="space-y-5">
            <h3 className="text-xs font-semibold text-white">
              Hero Copy, Buttons & Bento Order
            </h3>

            <RichTextField
              label="Main Headline"
              value={siteConfig.hero.headline}
              rows={2}
              onChange={(v) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  hero: { ...sc.hero, headline: v },
                }))
              }
            />

            <RichTextField
              label="Subheadline"
              value={siteConfig.hero.subheadline}
              rows={3}
              onChange={(v) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  hero: { ...sc.hero, subheadline: v },
                }))
              }
            />

            <div className="pt-3 border-t border-white/[0.06]">
              <ButtonListEditor
                title="Hero Action Buttons (Drag to Reorder)"
                buttons={siteConfig.hero.buttons}
                onChange={(buttons) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    hero: { ...sc.hero, buttons },
                  }))
                }
              />
            </div>

            <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Bento Grid Card Order (Drag or Arrows)
              </span>
              {siteConfig.hero.bentoOrder.map((cardKey, idx) => (
                <div
                  key={cardKey}
                  draggable
                  onDragStart={() => {
                    bentoDragRef.current = idx;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const from = bentoDragRef.current;
                    bentoDragRef.current = null;
                    if (from !== null && from !== idx) {
                      updateSiteConfig((sc) => ({
                        ...sc,
                        hero: {
                          ...sc.hero,
                          bentoOrder: reorderItems(sc.hero.bentoOrder, from, idx),
                        },
                      }));
                    }
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#09090b] border border-white/[0.08] text-xs text-zinc-200"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab" />
                    <span>{BENTO_LABELS[cardKey] || cardKey}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateSiteConfig((sc) => ({
                          ...sc,
                          hero: {
                            ...sc.hero,
                            bentoOrder: moveItem(sc.hero.bentoOrder, idx, -1),
                          },
                        }))
                      }
                      className="p-1 text-zinc-500 hover:text-white"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSiteConfig((sc) => ({
                          ...sc,
                          hero: {
                            ...sc.hero,
                            bentoOrder: moveItem(sc.hero.bentoOrder, idx, 1),
                          },
                        }))
                      }
                      className="p-1 text-zinc-500 hover:text-white"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.06] space-y-3">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Bento Card Titles & Tools
              </span>
              <div className="grid grid-cols-3 gap-2">
                <Field
                  label="Card 1 Label"
                  value={siteConfig.hero.profileLabel}
                  mono
                  onChange={(v) =>
                    updateSiteConfig((sc) => ({
                      ...sc,
                      hero: { ...sc.hero, profileLabel: v },
                    }))
                  }
                />
                <Field
                  label="Card 2 Label"
                  value={siteConfig.hero.academiaLabel}
                  mono
                  onChange={(v) =>
                    updateSiteConfig((sc) => ({
                      ...sc,
                      hero: { ...sc.hero, academiaLabel: v },
                    }))
                  }
                />
                <Field
                  label="Card 3 Label"
                  value={siteConfig.hero.craftLabel}
                  mono
                  onChange={(v) =>
                    updateSiteConfig((sc) => ({
                      ...sc,
                      hero: { ...sc.hero, craftLabel: v },
                    }))
                  }
                />
              </div>
              <Field
                label="Craft Card Title"
                value={siteConfig.hero.craftTitle}
                onChange={(v) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    hero: { ...sc.hero, craftTitle: v },
                  }))
                }
              />
              <TextArea
                label="Craft Card Description"
                value={siteConfig.hero.craftDesc}
                rows={2}
                onChange={(v) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    hero: { ...sc.hero, craftDesc: v },
                  }))
                }
              />
              <Field
                label="Craft Tool Tags (comma-separated)"
                value={(siteConfig.hero.craftTools || []).join(', ')}
                mono
                onChange={(v) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    hero: {
                      ...sc.hero,
                      craftTools: v
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* 4. FOOTER & CONTACT BUTTONS */}
        {effectiveTab === 'footer' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white">
              Footer & Contact Buttons
            </h3>
            <Field
              label="Eyebrow Label"
              value={siteConfig.footer.eyebrow}
              mono
              onChange={(v) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  footer: { ...sc.footer, eyebrow: v },
                }))
              }
            />
            <RichTextField
              label="Contact Heading"
              value={siteConfig.footer.heading}
              rows={2}
              onChange={(v) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  footer: { ...sc.footer, heading: v },
                }))
              }
            />
            <RichTextField
              label="Contact Subheading"
              value={siteConfig.footer.subheading}
              rows={2}
              onChange={(v) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  footer: { ...sc.footer, subheading: v },
                }))
              }
            />

            <div className="pt-3 border-t border-white/[0.06]">
              <ButtonListEditor
                title="Footer Action Buttons (Drag to Reorder)"
                buttons={siteConfig.footer.buttons}
                allowAction
                createNewItem={() => ({
                  id: `footer-btn-${Date.now()}`,
                  label: 'Book Call',
                  action: 'link',
                  href: 'https://cal.com',
                  variant: 'outline',
                  icon: 'arrow',
                  visible: true,
                })}
                onChange={(buttons) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    footer: { ...sc.footer, buttons },
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* 5. LOTTIE ANIMATION BACKGROUND STUDIO */}
        {effectiveTab === 'lottie' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-white">
                Lottie Background Studio
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Configure animated vector Lottie backgrounds from built-in presets, a Lottie JSON URL, or a custom `.json` file.
              </p>
            </div>

            <ToggleSwitch
              label="Enable Lottie Background"
              checked={siteConfig.lottie.enabled}
              onChange={(val) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  lottie: { ...sc.lottie, enabled: val },
                }))
              }
            />

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Placement
                </span>
                <select
                  value={siteConfig.lottie.scope || 'global'}
                  onChange={(e) =>
                    updateSiteConfig((sc) => ({
                      ...sc,
                      lottie: { ...sc.lottie, scope: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] text-xs text-zinc-100 focus:border-accent focus:outline-none"
                >
                  <option value="global">Full-Page Background</option>
                  <option value="hero">Hero Section Only</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Source
                </span>
                <select
                  value={siteConfig.lottie.sourceType || 'preset'}
                  onChange={(e) =>
                    updateSiteConfig((sc) => ({
                      ...sc,
                      lottie: { ...sc.lottie, sourceType: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] text-xs text-zinc-100 focus:border-accent focus:outline-none"
                >
                  <option value="preset">Built-in Preset</option>
                  <option value="url">External JSON URL</option>
                  <option value="json">Custom Lottie JSON</option>
                </select>
              </label>
            </div>

            {siteConfig.lottie.sourceType === 'preset' && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Minimalist Presets
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(LOTTIE_PRESETS).map((preset) => {
                    const selected = siteConfig.lottie.preset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          updateSiteConfig((sc) => ({
                            ...sc,
                            lottie: {
                              ...sc.lottie,
                              enabled: true,
                              sourceType: 'preset',
                              preset: preset.id,
                            },
                          }))
                        }
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          selected
                            ? 'bg-[#141417] border-accent text-white'
                            : 'bg-[#09090b] border-white/[0.08] text-zinc-300 hover:border-white/[0.2]'
                        }`}
                      >
                        <div className="text-xs font-semibold">{preset.name}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {preset.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {siteConfig.lottie.sourceType === 'url' && (
              <Field
                label="Lottie JSON URL (.json)"
                value={siteConfig.lottie.url}
                mono
                placeholder="https://assets.lottiefiles.com/.../animation.json"
                onChange={(v) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    lottie: { ...sc.lottie, url: v },
                  }))
                }
              />
            )}

            {siteConfig.lottie.sourceType === 'json' && (
              <div className="space-y-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleLottieFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-white/[0.2] hover:border-accent text-xs text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .json Lottie File</span>
                </button>
                <TextArea
                  label="Or Paste Lottie JSON (< 300 KB)"
                  value={siteConfig.lottie.customJson}
                  rows={5}
                  placeholder='{"v":"5.7.4",...}'
                  onChange={(v) =>
                    updateSiteConfig((sc) => ({
                      ...sc,
                      lottie: { ...sc.lottie, customJson: v },
                    }))
                  }
                />
              </div>
            )}

            <div className="pt-3 border-t border-white/[0.06] space-y-4">
              <SliderField
                label="Opacity"
                value={Math.round((siteConfig.lottie.opacity ?? 0.2) * 100)}
                min={5}
                max={100}
                step={5}
                unit="%"
                onChange={(pct) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    lottie: { ...sc.lottie, opacity: pct / 100 },
                  }))
                }
              />

              <SliderField
                label="Playback Speed"
                value={siteConfig.lottie.speed ?? 0.75}
                min={0.25}
                max={2.5}
                step={0.25}
                unit="x"
                onChange={(speed) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    lottie: { ...sc.lottie, speed },
                  }))
                }
              />

              <SliderField
                label="Backdrop Blur"
                value={siteConfig.lottie.blur ?? 0}
                min={0}
                max={8}
                step={1}
                unit="px"
                onChange={(blur) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    lottie: { ...sc.lottie, blur },
                  }))
                }
              />

              <ToggleSwitch
                label="Loop Animation"
                checked={siteConfig.lottie.loop !== false}
                onChange={(val) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    lottie: { ...sc.lottie, loop: val },
                  }))
                }
              />

              <ToggleSwitch
                label="Force Monochrome Filter"
                description="Converts colorful Lottie animations to match your monotone palette"
                checked={Boolean(siteConfig.lottie.monochrome)}
                onChange={(val) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    lottie: { ...sc.lottie, monochrome: val },
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* 6. THEME & STANDOUT ACCENT COLOR */}
        {effectiveTab === 'theme' && (
          <div className="space-y-5">
            <h3 className="text-xs font-semibold text-white">
              Monotone & Accent Theme
            </h3>

            <div>
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                Standout Accent Color
              </span>
              <div className="flex flex-wrap gap-2 mb-3">
                {ACCENT_SWATCHES.map((swatch) => {
                  const active =
                    (siteConfig.theme.accentColor || '').toUpperCase() ===
                    swatch.hex.toUpperCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() =>
                        updateSiteConfig((sc) => ({
                          ...sc,
                          theme: { ...sc.theme, accentColor: swatch.hex },
                        }))
                      }
                      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-colors ${
                        active
                          ? 'border-white bg-white/[0.08] text-white'
                          : 'border-white/[0.08] bg-[#09090b] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span>{swatch.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={siteConfig.theme.accentColor || '#FF4D00'}
                  onChange={(e) =>
                    updateSiteConfig((sc) => ({
                      ...sc,
                      theme: { ...sc.theme, accentColor: e.target.value },
                    }))
                  }
                  className="w-10 h-9 rounded bg-transparent border border-white/[0.1] cursor-pointer"
                />
                <div className="flex-1">
                  <Field
                    label="Custom Hex"
                    value={siteConfig.theme.accentColor}
                    mono
                    onChange={(v) =>
                      updateSiteConfig((sc) => ({
                        ...sc,
                        theme: { ...sc.theme, accentColor: v },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <label className="block">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                Card Corner Style
              </span>
              <select
                value={siteConfig.theme.cardRadius || 'rounded-xl'}
                onChange={(e) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    theme: { ...sc.theme, cardRadius: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] text-xs text-zinc-100 focus:border-accent focus:outline-none"
              >
                <option value="rounded-none">Sharp / Brutalist (0px)</option>
                <option value="rounded-lg">Subtle (8px)</option>
                <option value="rounded-xl">Architectural (12px)</option>
                <option value="rounded-2xl">Soft Minimal (16px)</option>
              </select>
            </label>

            <ToggleSwitch
              label="Subtle Dot Grid Texture"
              description="Show dot-matrix grid inside viewfinder & empty preview frames"
              checked={siteConfig.theme.showDotGrid !== false}
              onChange={(val) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  theme: { ...sc.theme, showDotGrid: val },
                }))
              }
            />
          </div>
        )}

        {/* 7. CUSTOM PAGES BUILDER */}
        {effectiveTab === 'pages' && (
          <PagesEditorPanel
            pages={siteConfig.pages || []}
            activePageSlug={previewPageSlug}
            onSelectPageSlug={onSelectPreviewPageSlug}
            selectedBlockIndex={selectedPageBlockIndex}
            onSelectBlockIndex={onSelectPageBlockIndex}
            onChangePages={(pages) =>
              updateSiteConfig((sc) => ({
                ...sc,
                pages,
              }))
            }
          />
        )}

        {/* 8. LOADING ANIMATION STUDIO */}
        {effectiveTab === 'loader' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold text-white">
                  Preloader Intro Animation
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Cinematic curtain reveal shown when visitors enter your portfolio.
                </p>
              </div>
              <button
                type="button"
                onClick={onReplayLoader}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white bg-accent hover:bg-accent-hover transition-colors shrink-0"
              >
                <Play className="w-3 h-3" />
                <span>Replay</span>
              </button>
            </div>

            <ToggleSwitch
              label="Enable Loading Animation"
              checked={loaderCfg.enabled !== false}
              onChange={(val) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  loader: { ...(sc.loader || {}), enabled: val },
                }))
              }
            />

            <label className="block">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                Animation Style
              </span>
              <select
                value={loaderCfg.style || 'telemetry'}
                onChange={(e) =>
                  updateSiteConfig((sc) => ({
                    ...sc,
                    loader: { ...(sc.loader || {}), style: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] text-xs text-zinc-100 focus:border-accent focus:outline-none"
              >
                <option value="telemetry">Telemetry Counter & Shutter Split</option>
                <option value="shutter">Aperture Iris Ring Spin</option>
                <option value="lottie">Lottie Vector Preloader</option>
              </select>
            </label>

            {loaderCfg.style === 'lottie' && (
              <div className="space-y-3 p-3 rounded-lg bg-[#09090b] border border-white/[0.08]">
                <label className="block">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Loader Lottie Preset
                  </span>
                  <select
                    value={loaderCfg.lottiePreset || 'orbital'}
                    onChange={(e) =>
                      updateSiteConfig((sc) => ({
                        ...sc,
                        loader: { ...(sc.loader || {}), lottiePreset: e.target.value },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#101012] border border-white/[0.1] text-xs text-zinc-100"
                  >
                    {Object.values(LOTTIE_PRESETS).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>

                <Field
                  label="Or Custom Lottie JSON URL"
                  value={loaderCfg.lottieUrl || ''}
                  mono
                  placeholder="https://..."
                  onChange={(v) =>
                    updateSiteConfig((sc) => ({
                      ...sc,
                      loader: { ...(sc.loader || {}), lottieUrl: v },
                    }))
                  }
                />
              </div>
            )}

            <SliderField
              label="Duration"
              value={Number(((loaderCfg.durationMs || 1450) / 1000).toFixed(1))}
              min={0.7}
              max={3.5}
              step={0.1}
              unit="s"
              onChange={(sec) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  loader: { ...(sc.loader || {}), durationMs: Math.round(sec * 1000) },
                }))
              }
            />

            <Field
              label="Intro Tagline"
              value={loaderCfg.tagline || ''}
              mono
              onChange={(v) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  loader: { ...(sc.loader || {}), tagline: v },
                }))
              }
            />

            <ToggleSwitch
              label="Play Once Per Browser Session"
              description="Skip intro if visitor already saw it during this tab session"
              checked={Boolean(loaderCfg.oncePerSession)}
              onChange={(val) =>
                updateSiteConfig((sc) => ({
                  ...sc,
                  loader: { ...(sc.loader || {}), oncePerSession: val },
                }))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
