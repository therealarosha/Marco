import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Database,
  Layout,
  Lock,
  LogOut,
  Monitor,
  Play,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Tablet,
  Trash2
} from 'lucide-react';
import { loadFirebaseAuth, isFirebaseConfigured, ADMIN_EMAIL } from '../lib/firebase';
import { fetchPortfolioContent, savePortfolioContent } from '../lib/portfolioService';
import { portfolioData as defaultData } from '../data/portfolioData';
import PortfolioView from './PortfolioView';
import LoadingScreen from './LoadingScreen';
import VisualEditorPanel from './cms/VisualEditorPanel';
import { Field, RichTextField, TextArea } from './cms/CmsFields';
import { PhotoInput, VideoInput } from './cms/MediaPicker';
import { moveItem } from '../lib/listUtils';
import { estimateJsonKb } from '../lib/mediaUtils';
import { useDeviceProfile } from '../lib/deviceProfile';

export default function AdminCMS({ onExit }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState('');
  const authApiRef = useRef(null);
  const device = useDeviceProfile();

  const [draft, setDraft] = useState(null);
  const [dbExists, setDbExists] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState('wysiwyg'); // 'wysiwyg' | 'content'
  const [mobilePane, setMobilePane] = useState('editor'); // 'editor' | 'preview'
  const [selectedBlock, setSelectedBlock] = useState('hero');
  const [previewPageSlug, setPreviewPageSlug] = useState(null);
  const [selectedPageBlockIndex, setSelectedPageBlockIndex] = useState(null);
  const [replayingLoader, setReplayingLoader] = useState(false);
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [activeTab, setActiveTab] = useState('profile');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const state = { cancelled: false, unsub: null };

    Promise.all([loadFirebaseAuth(), import('firebase/auth')]).then(
      ([bundle, authSdk]) => {
        if (state.cancelled || !bundle) return;
        authApiRef.current = { ...bundle, ...authSdk };
        state.unsub = authSdk.onAuthStateChanged(bundle.auth, async (currentUser) => {
          if (currentUser) {
            const email = (currentUser.email || '').toLowerCase();
            if (email !== ADMIN_EMAIL || !currentUser.emailVerified) {
              await authSdk.signOut(bundle.auth);
              setUser(null);
              setAuthError(`Access denied for ${currentUser.email}. Only ${ADMIN_EMAIL} is authorized.`);
            } else {
              setUser(currentUser);
              setAuthError('');
            }
          } else {
            setUser(null);
          }
          setAuthLoading(false);
        });
      }
    );

    return () => {
      state.cancelled = true;
      state.unsub?.();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchPortfolioContent().then((res) => {
      if (!active) return;
      setDraft(res.data);
      setDbExists(res.existsInDb);
      setDirty(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const handleSignIn = async () => {
    const api = authApiRef.current;
    if (!api) return;
    setAuthError('');
    try {
      const result = await api.signInWithPopup(api.auth, api.googleProvider);
      const email = (result.user?.email || '').toLowerCase();
      if (email !== ADMIN_EMAIL) {
        await api.signOut(api.auth);
        setAuthError(`Access denied for ${result.user?.email}. Sign in with ${ADMIN_EMAIL}.`);
      }
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed.');
    }
  };

  const handleSignOut = async () => {
    const api = authApiRef.current;
    if (!api) return;
    await api.signOut(api.auth);
    setDraft(null);
  };

  const updateDraft = (updater) => {
    setDraft((prev) => updater(prev));
    setDirty(true);
    setStatusMsg(null);
  };

  const handleSave = async () => {
    if (!draft || !user) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const saved = await savePortfolioContent(draft);
      setDraft(saved);
      setDirty(false);
      setDbExists(true);
      setStatusMsg({ type: 'success', text: 'Saved to Firebase Firestore.' });
    } catch (err) {
      const msg =
        err?.code === 'permission-denied'
          ? 'Missing or insufficient permissions: ensure Firestore rules are deployed (`npx -y firebase-tools@latest deploy --only firestore:rules`) and you are signed in with the verified owner Google account.'
          : err.message || 'Save failed. Check Firestore rules and connection.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setDraft(structuredClone(defaultData));
    setDirty(true);
    setStatusMsg({
      type: 'info',
      text: 'Loaded default template into editor. Click Save to Firebase to publish.',
    });
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-5">
        <div className="max-w-lg w-full minimal-card rounded-xl p-7 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-mono text-accent uppercase tracking-widest">
              CMS / Setup Required
            </span>
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Site</span>
            </button>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Connect Firebase to unlock the CMS
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed mb-5">
            Add your Firebase Web App credentials to <code className="text-zinc-200 font-mono">.env.local</code> locally and GitHub Secrets for deployment.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-400 flex items-center justify-center font-mono text-xs">
        Verifying Google session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-5">
        <div className="max-w-md w-full minimal-card rounded-xl p-7 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-accent" />
              CMS / Protected
            </span>
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portfolio</span>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Admin Console<span className="text-accent">.</span>
          </h1>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            Sign in with your authorized Google account (<span className="font-mono text-zinc-200">{ADMIN_EMAIL}</span>) to edit layout, buttons, Lottie backgrounds, and portfolio content.
          </p>

          {authError && (
            <div className="mt-4 p-3 rounded-lg border border-accent/40 bg-accent/10 text-xs text-zinc-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSignIn}
            className="mt-6 w-full py-2.5 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-400 flex items-center justify-center font-mono text-xs">
        Loading portfolio content from Firestore...
      </div>
    );
  }

  const contentTabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'projects', label: `Projects (${draft.projects.length})` },
    { id: 'gallery', label: `Lens & Stills (${draft.gallery.length})` },
    { id: 'arsenal', label: 'Arsenal' },
    { id: 'stats', label: 'Stats & Ethos' },
  ];

  const previewWidthClass =
    viewport === 'mobile'
      ? 'max-w-[390px]'
      : viewport === 'tablet'
      ? 'max-w-[768px]'
      : 'max-w-full';

  const customPages = draft.siteConfig?.pages || [];
  const docKb = estimateJsonKb(draft);

  const handleSelectBlock = (blockId) => {
    setSelectedBlock(blockId);
    if (blockId === 'pages') {
      if (!previewPageSlug && customPages.length > 0) {
        setPreviewPageSlug(customPages[0].slug);
      }
    } else if (['sections', 'hero', 'arsenal', 'projects', 'reel', 'leadership'].includes(blockId)) {
      setPreviewPageSlug(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {replayingLoader && (
        <LoadingScreen
          config={draft.siteConfig?.loader}
          brandName={draft.personal?.displayName || draft.personal?.name}
          lottieConfig={draft.siteConfig?.lottie}
          onDone={() => setReplayingLoader(false)}
        />
      )}
      {/* Top Studio Header */}
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-full px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </button>
            <span className="text-zinc-700">/</span>
            <span className="font-bold text-sm text-white">
              Studio CMS<span className="text-accent">.</span>
            </span>

            {/* Workspace Mode Switcher */}
            <div className="hidden md:flex items-center bg-[#101012] border border-white/[0.08] rounded-lg p-0.5 ml-3">
              <button
                type="button"
                onClick={() => setWorkspaceMode('wysiwyg')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  workspaceMode === 'wysiwyg'
                    ? 'bg-accent text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Visual WYSIWYG</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('content')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  workspaceMode === 'content'
                    ? 'bg-accent text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Content & Data</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Switcher (WYSIWYG Mode) */}
            {workspaceMode === 'wysiwyg' && (
              <div className="hidden lg:flex items-center bg-[#101012] border border-white/[0.08] rounded-lg p-0.5 mr-2">
                {[
                  { id: 'desktop', icon: Monitor, label: 'Desktop' },
                  { id: 'tablet', icon: Tablet, label: 'Tablet' },
                  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                ].map((vp) => {
                  const Icon = vp.icon;
                  return (
                    <button
                      key={vp.id}
                      type="button"
                      onClick={() => setViewport(vp.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        viewport === vp.id
                          ? 'bg-white/[0.1] text-white'
                          : 'text-zinc-500 hover:text-zinc-200'
                      }`}
                      title={vp.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            )}

            {dirty && (
              <span className="text-[11px] font-mono text-accent flex items-center gap-1.5 mr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Unsaved
              </span>
            )}

            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.2] transition-colors"
              title="Reset from template defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save to Firebase'}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.2] transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Mode Switcher */}
        <div className="flex md:hidden px-4 pb-2.5 gap-2">
          <button
            type="button"
            onClick={() => setWorkspaceMode('wysiwyg')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono ${
              workspaceMode === 'wysiwyg'
                ? 'bg-accent text-white'
                : 'bg-[#101012] text-zinc-400 border border-white/[0.08]'
            }`}
          >
            Visual WYSIWYG
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('content')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono ${
              workspaceMode === 'content'
                ? 'bg-accent text-white'
                : 'bg-[#101012] text-zinc-400 border border-white/[0.08]'
            }`}
          >
            Content & Data
          </button>
        </div>
      </header>

      {/* Status Toast / Seed Prompt */}
      {(!dbExists || statusMsg) && (
        <div className="px-4 sm:px-6 pt-3">
          {!dbExists && !statusMsg && (
            <div className="p-3 rounded-lg border border-white/[0.1] bg-[#101012] text-xs text-zinc-300">
              Firestore document <code className="font-mono text-white">portfolio/content</code> is not initialized yet. Customize your layout below and click <strong className="text-white">Save to Firebase</strong> to publish.
            </div>
          )}
          {statusMsg && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                statusMsg.type === 'error'
                  ? 'border-accent/50 bg-accent/10 text-zinc-100'
                  : 'border-white/[0.15] bg-[#101012] text-zinc-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-accent shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-accent shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 1: SPLIT-SCREEN VISUAL WYSIWYG WORKSPACE */}
      {workspaceMode === 'wysiwyg' ? (
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-[calc(100vh-58px)]">
          {/* Mobile / Tablet Pane Toggle (keeps only Editor OR Preview mounted to prevent phone OOM) */}
          {device.isMobile && (
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.08] bg-[#0c0c0e]">
              <button
                type="button"
                onClick={() => setMobilePane('editor')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono ${
                  mobilePane === 'editor'
                    ? 'bg-accent text-white'
                    : 'bg-[#09090b] text-zinc-400 border border-white/[0.08]'
                }`}
              >
                Visual Controls
              </button>
              <button
                type="button"
                onClick={() => setMobilePane('preview')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono ${
                  mobilePane === 'preview'
                    ? 'bg-accent text-white'
                    : 'bg-[#09090b] text-zinc-400 border border-white/[0.08]'
                }`}
              >
                Live Preview
              </button>
            </div>
          )}

          {/* Left Visual Inspector (4 cols) */}
          {(!device.isMobile || mobilePane === 'editor') && (
            <div className="lg:col-span-4 xl:col-span-4 lg:h-[calc(100vh-58px)] lg:sticky lg:top-[58px] overflow-hidden">
              <VisualEditorPanel
                draft={draft}
                updateDraft={updateDraft}
                selectedBlock={selectedBlock}
                onSelectBlock={handleSelectBlock}
                previewPageSlug={previewPageSlug}
                onSelectPreviewPageSlug={(slug) => {
                  setPreviewPageSlug(slug);
                  if (slug) setSelectedBlock('pages');
                }}
                selectedPageBlockIndex={selectedPageBlockIndex}
                onSelectPageBlockIndex={setSelectedPageBlockIndex}
                onReplayLoader={() => setReplayingLoader(true)}
              />
            </div>
          )}

          {/* Right Live Interactive WYSIWYG Canvas (8 cols) */}
          {(!device.isMobile || mobilePane === 'preview') && (
            <div className="lg:col-span-8 xl:col-span-8 bg-[#050506] p-4 sm:p-6 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-[11px] font-mono text-zinc-500">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewPageSlug(null);
                      if (selectedBlock === 'pages') setSelectedBlock('hero');
                    }}
                    className={`px-2 py-0.5 rounded border transition-colors ${
                      !previewPageSlug
                        ? 'bg-accent text-white border-accent'
                        : 'bg-[#101012] text-zinc-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    Home
                  </button>
                  {customPages.map((p) => (
                    <button
                      key={p.id || p.slug}
                      type="button"
                      onClick={() => {
                        setPreviewPageSlug(p.slug);
                        setSelectedBlock('pages');
                      }}
                      className={`px-2 py-0.5 rounded border transition-colors ${
                        previewPageSlug === p.slug
                          ? 'bg-accent text-white border-accent'
                          : 'bg-[#101012] text-zinc-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      /{p.slug}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReplayingLoader(true)}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Play className="w-3 h-3 text-accent" />
                    <span>Replay Intro</span>
                  </button>
                  <span className={docKb > 850 ? 'text-accent' : 'text-zinc-500'}>
                    {docKb} KB / 950 KB
                  </span>
                </div>
              </div>

              <div
                className={`mx-auto ${previewWidthClass} border border-white/[0.1] rounded-xl overflow-hidden shadow-2xl transition-all duration-300`}
              >
                <PortfolioView
                  content={draft}
                  activePageSlug={previewPageSlug}
                  isPreview
                  selectedBlock={selectedBlock}
                  onSelectBlock={handleSelectBlock}
                  onNavigatePage={(slug) => {
                    setPreviewPageSlug(slug);
                    setSelectedBlock(slug ? 'pages' : 'hero');
                  }}
                  selectedPageBlockIndex={selectedPageBlockIndex}
                  onSelectPageBlockIndex={(idx) => {
                    setSelectedBlock('pages');
                    setSelectedPageBlockIndex(idx);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* MODE 2: STRUCTURED CONTENT & DATA TABS */
        <div className="max-w-6xl w-full mx-auto px-5 sm:px-8 pt-8 pb-20">
          <div className="flex flex-wrap items-center gap-6 border-b border-white/[0.08] mb-8">
            {contentTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-xs font-mono transition-colors relative ${
                    isActive ? 'text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />}
                </button>
              );
            })}
          </div>

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="minimal-card rounded-xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white">Identity & Academics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Display Name"
                    value={draft.personal.displayName}
                    onChange={(v) =>
                      updateDraft((d) => ({
                        ...d,
                        personal: { ...d.personal, displayName: v, name: v },
                      }))
                    }
                  />
                  <Field
                    label="Status Badge"
                    value={draft.personal.statusBadge}
                    onChange={(v) =>
                      updateDraft((d) => ({
                        ...d,
                        personal: { ...d.personal, statusBadge: v },
                      }))
                    }
                  />
                  <Field
                    label="University"
                    value={draft.personal.university}
                    onChange={(v) =>
                      updateDraft((d) => ({
                        ...d,
                        personal: { ...d.personal, university: v },
                      }))
                    }
                  />
                  <Field
                    label="Faculty / Degree"
                    value={draft.personal.faculty}
                    onChange={(v) =>
                      updateDraft((d) => ({
                        ...d,
                        personal: { ...d.personal, faculty: v },
                      }))
                    }
                  />
                  <Field
                    label="Location"
                    value={draft.personal.location}
                    onChange={(v) =>
                      updateDraft((d) => ({
                        ...d,
                        personal: { ...d.personal, location: v },
                      }))
                    }
                  />
                  <Field
                    label="Contact Email"
                    value={draft.personal.contacts.email}
                    mono
                    onChange={(v) =>
                      updateDraft((d) => ({
                        ...d,
                        personal: {
                          ...d.personal,
                          contacts: { ...d.personal.contacts, email: v },
                        },
                      }))
                    }
                  />
                </div>

                <Field
                  label="Cycling Roles (comma-separated)"
                  value={(draft.personal.roles || []).join(', ')}
                  mono
                  onChange={(v) =>
                    updateDraft((d) => ({
                      ...d,
                      personal: {
                        ...d.personal,
                        roles: v
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                      Bio Paragraphs (Supports Rich Formatting)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft((d) => ({
                          ...d,
                          personal: { ...d.personal, bio: [...d.personal.bio, ''] },
                        }))
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-300 hover:text-white"
                    >
                      <Plus className="w-3 h-3" /> Add Paragraph
                    </button>
                  </div>
                  {draft.personal.bio.map((para, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <RichTextField
                          label={`Paragraph ${idx + 1}`}
                          value={para}
                          rows={3}
                          onChange={(v) =>
                            updateDraft((d) => {
                              const bio = [...d.personal.bio];
                              bio[idx] = v;
                              return { ...d, personal: { ...d.personal, bio } };
                            })
                          }
                        />
                      </div>
                      {draft.personal.bio.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft((d) => ({
                              ...d,
                              personal: {
                                ...d.personal,
                                bio: d.personal.bio.filter((_, i) => i !== idx),
                              },
                            }))
                          }
                          className="mt-7 p-2 text-zinc-500 hover:text-accent transition-colors"
                          aria-label="Remove paragraph"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="minimal-card rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-white">Social Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="GitHub URL"
                    value={draft.personal.contacts.github}
                    mono
                    onChange={(v) =>
                      updateDraft((d) => ({
                        ...d,
                        personal: {
                          ...d.personal,
                          contacts: { ...d.personal.contacts, github: v },
                        },
                      }))
                    }
                  />
                  <Field
                    label="LinkedIn URL"
                    value={draft.personal.contacts.linkedin}
                    mono
                    onChange={(v) =>
                      updateDraft((d) => ({
                        ...d,
                        personal: {
                          ...d.personal,
                          contacts: { ...d.personal.contacts, linkedin: v },
                        },
                      }))
                    }
                  />
                  <Field
                    label="YouTube URL"
                    value={draft.personal.contacts.youtube}
                    mono
                    onChange={(v) =>
                      updateDraft((d) => ({
                        ...d,
                        personal: {
                          ...d.personal,
                          contacts: { ...d.personal.contacts, youtube: v },
                        },
                      }))
                    }
                  />
                  <Field
                    label="Instagram URL"
                    value={draft.personal.contacts.instagram}
                    mono
                    onChange={(v) =>
                      updateDraft((d) => ({
                        ...d,
                        personal: {
                          ...d.personal,
                          contacts: { ...d.personal.contacts, instagram: v },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-400">
                  Manage projects across Vibe Coding, Cinema, Motion Graphics, and Design.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft((d) => ({
                      ...d,
                      projects: [
                        {
                          id: `project-${Date.now()}`,
                          title: 'New Project',
                          category: 'dev',
                          featured: false,
                          tag: 'Vibe Coding / App',
                          summary: '',
                          techStack: ['React'],
                          imageUrl: '',
                          demoUrl: '',
                          githubUrl: '',
                        },
                        ...d.projects,
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {draft.projects.map((project, idx) => (
                <div key={project.id || idx} className="minimal-card rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-xs font-mono text-zinc-400">
                      {String(idx + 1).padStart(2, '0')} — {project.title || 'Untitled'}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 mr-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(project.featured)}
                          onChange={(e) =>
                            updateDraft((d) => {
                              const projects = [...d.projects];
                              projects[idx] = { ...projects[idx], featured: e.target.checked };
                              return { ...d, projects };
                            })
                          }
                          className="accent-[var(--accent)]"
                        />
                        Featured
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((d) => ({
                            ...d,
                            projects: moveItem(d.projects, idx, -1),
                          }))
                        }
                        className="p-1 text-zinc-500 hover:text-white"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((d) => ({
                            ...d,
                            projects: moveItem(d.projects, idx, 1),
                          }))
                        }
                        className="p-1 text-zinc-500 hover:text-white"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((d) => ({
                            ...d,
                            projects: d.projects.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-1 text-zinc-500 hover:text-accent ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field
                      label="Title"
                      value={project.title}
                      onChange={(v) =>
                        updateDraft((d) => {
                          const projects = [...d.projects];
                          projects[idx] = { ...projects[idx], title: v };
                          return { ...d, projects };
                        })
                      }
                    />
                    <label className="block">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                        Category
                      </span>
                      <select
                        value={project.category}
                        onChange={(e) =>
                          updateDraft((d) => {
                            const projects = [...d.projects];
                            projects[idx] = { ...projects[idx], category: e.target.value };
                            return { ...d, projects };
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-white/[0.1] focus:border-accent focus:outline-none text-xs text-zinc-100"
                      >
                        <option value="dev">Code & Apps (dev)</option>
                        <option value="video">Cinema & Video (video)</option>
                        <option value="motion">Motion Graphics (motion)</option>
                        <option value="design">Visual Design (design)</option>
                        <option value="photo">Photography (photo)</option>
                      </select>
                    </label>
                    <Field
                      label="Display Tag"
                      value={project.tag}
                      onChange={(v) =>
                        updateDraft((d) => {
                          const projects = [...d.projects];
                          projects[idx] = { ...projects[idx], tag: v };
                          return { ...d, projects };
                        })
                      }
                    />
                  </div>

                  <TextArea
                    label="Summary"
                    value={project.summary}
                    rows={2}
                    onChange={(v) =>
                      updateDraft((d) => {
                        const projects = [...d.projects];
                        projects[idx] = { ...projects[idx], summary: v };
                        return { ...d, projects };
                      })
                    }
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Tools / Stack (comma-separated)"
                      value={(project.techStack || []).join(', ')}
                      mono
                      onChange={(v) =>
                        updateDraft((d) => {
                          const projects = [...d.projects];
                          projects[idx] = {
                            ...projects[idx],
                            techStack: v
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          };
                          return { ...d, projects };
                        })
                      }
                    />
                    <Field
                      label="Live Demo URL"
                      value={project.demoUrl}
                      mono
                      placeholder="https://..."
                      onChange={(v) =>
                        updateDraft((d) => {
                          const projects = [...d.projects];
                          projects[idx] = { ...projects[idx], demoUrl: v };
                          return { ...d, projects };
                        })
                      }
                    />
                    <Field
                      label="GitHub Repo URL (optional)"
                      value={project.githubUrl}
                      mono
                      placeholder="https://github.com/..."
                      onChange={(v) =>
                        updateDraft((d) => {
                          const projects = [...d.projects];
                          projects[idx] = { ...projects[idx], githubUrl: v };
                          return { ...d, projects };
                        })
                      }
                    />
                    <VideoInput
                      label="Project Video (YouTube, Vimeo, Drive, MP4)"
                      value={project.videoUrl || ''}
                      onChange={(v) =>
                        updateDraft((d) => {
                          const projects = [...d.projects];
                          projects[idx] = { ...projects[idx], videoUrl: v };
                          return { ...d, projects };
                        })
                      }
                    />
                    <div className="md:col-span-2">
                      <PhotoInput
                        label="Project Thumbnail Photo (Upload or URL)"
                        value={project.imageUrl || ''}
                        onChange={(v) =>
                          updateDraft((d) => {
                            const projects = [...d.projects];
                            projects[idx] = { ...projects[idx], imageUrl: v };
                            return { ...d, projects };
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-400">
                  Manage cinema viewfinder frames, stills, and camera metadata.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft((d) => ({
                      ...d,
                      gallery: [
                        ...d.gallery,
                        {
                          title: 'New Frame',
                          category: 'Cinematography',
                          gear: '50mm f/1.8 • 1/125s • ISO 200',
                          description: '',
                          imageUrl: '',
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Frame</span>
                </button>
              </div>

              {draft.gallery.map((frame, idx) => (
                <div key={idx} className="minimal-card rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-xs font-mono text-zinc-400">
                      Frame {String(idx + 1).padStart(2, '0')} — {frame.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((d) => ({
                            ...d,
                            gallery: moveItem(d.gallery, idx, -1),
                          }))
                        }
                        className="p-1 text-zinc-500 hover:text-white"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((d) => ({
                            ...d,
                            gallery: moveItem(d.gallery, idx, 1),
                          }))
                        }
                        className="p-1 text-zinc-500 hover:text-white"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((d) => ({
                            ...d,
                            gallery: d.gallery.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-1 text-zinc-500 hover:text-accent ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field
                      label="Title"
                      value={frame.title}
                      onChange={(v) =>
                        updateDraft((d) => {
                          const gallery = [...d.gallery];
                          gallery[idx] = { ...gallery[idx], title: v };
                          return { ...d, gallery };
                        })
                      }
                    />
                    <Field
                      label="Category"
                      value={frame.category}
                      onChange={(v) =>
                        updateDraft((d) => {
                          const gallery = [...d.gallery];
                          gallery[idx] = { ...gallery[idx], category: v };
                          return { ...d, gallery };
                        })
                      }
                    />
                    <Field
                      label="Gear / Exposure Specs"
                      value={frame.gear}
                      mono
                      onChange={(v) =>
                        updateDraft((d) => {
                          const gallery = [...d.gallery];
                          gallery[idx] = { ...gallery[idx], gear: v };
                          return { ...d, gallery };
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Field
                        label="Description"
                        value={frame.description}
                        onChange={(v) =>
                          updateDraft((d) => {
                            const gallery = [...d.gallery];
                            gallery[idx] = { ...gallery[idx], description: v };
                            return { ...d, gallery };
                          })
                        }
                      />
                    </div>
                    <PhotoInput
                      label="Still Photo (Upload or URL)"
                      value={frame.imageUrl || ''}
                      onChange={(v) =>
                        updateDraft((d) => {
                          const gallery = [...d.gallery];
                          gallery[idx] = { ...gallery[idx], imageUrl: v };
                          return { ...d, gallery };
                        })
                      }
                    />
                    <VideoInput
                      label="Video Reel (YouTube, Vimeo, Drive, MP4)"
                      value={frame.videoUrl || ''}
                      onChange={(v) =>
                        updateDraft((d) => {
                          const gallery = [...d.gallery];
                          gallery[idx] = { ...gallery[idx], videoUrl: v };
                          return { ...d, gallery };
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'arsenal' && (
            <div className="space-y-8">
              {[
                { key: 'tech', title: 'Code & Vibe Engineering' },
                { key: 'creative', title: 'Cinema & Motion Suite' },
                { key: 'leadership', title: 'Leadership & Science' },
              ].map((group) => (
                <div key={group.key} className="minimal-card rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <h3 className="text-sm font-semibold text-white">{group.title}</h3>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft((d) => ({
                          ...d,
                          arsenal: {
                            ...d.arsenal,
                            [group.key]: [
                              ...d.arsenal[group.key],
                              { name: 'New Skill', level: 'Core', desc: '' },
                            ],
                          },
                        }))
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-300 hover:text-white"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {draft.arsenal[group.key].map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b border-white/[0.04] pb-3 last:border-none last:pb-0"
                      >
                        <div className="md:col-span-3">
                          <Field
                            label="Name"
                            value={item.name}
                            onChange={(v) =>
                              updateDraft((d) => {
                                const list = [...d.arsenal[group.key]];
                                list[idx] = { ...list[idx], name: v };
                                return {
                                  ...d,
                                  arsenal: { ...d.arsenal, [group.key]: list },
                                };
                              })
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Field
                            label="Tag"
                            value={item.level || ''}
                            mono
                            onChange={(v) =>
                              updateDraft((d) => {
                                const list = [...d.arsenal[group.key]];
                                list[idx] = { ...list[idx], level: v };
                                return {
                                  ...d,
                                  arsenal: { ...d.arsenal, [group.key]: list },
                                };
                              })
                            }
                          />
                        </div>
                        <div className="md:col-span-6">
                          <Field
                            label="Description"
                            value={item.desc}
                            onChange={(v) =>
                              updateDraft((d) => {
                                const list = [...d.arsenal[group.key]];
                                list[idx] = { ...list[idx], desc: v };
                                return {
                                  ...d,
                                  arsenal: { ...d.arsenal, [group.key]: list },
                                };
                              })
                            }
                          />
                        </div>
                        <div className="md:col-span-1 flex justify-end pb-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft((d) => ({
                                ...d,
                                arsenal: {
                                  ...d.arsenal,
                                  [group.key]: d.arsenal[group.key].filter((_, i) => i !== idx),
                                },
                              }))
                            }
                            className="p-2 text-zinc-500 hover:text-accent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="minimal-card rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white border-b border-white/[0.06] pb-3">
                  Metadata Ribbon (4 Slots)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {draft.stats.map((stat, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[#09090b] border border-white/[0.06] space-y-3">
                      <Field
                        label="Value"
                        value={stat.value}
                        onChange={(v) =>
                          updateDraft((d) => {
                            const stats = [...d.stats];
                            stats[idx] = { ...stats[idx], value: v };
                            return { ...d, stats };
                          })
                        }
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Label"
                          value={stat.label}
                          onChange={(v) =>
                            updateDraft((d) => {
                              const stats = [...d.stats];
                              stats[idx] = { ...stats[idx], label: v };
                              return { ...d, stats };
                            })
                          }
                        />
                        <Field
                          label="Detail"
                          value={stat.detail}
                          onChange={(v) =>
                            updateDraft((d) => {
                              const stats = [...d.stats];
                              stats[idx] = { ...stats[idx], detail: v };
                              return { ...d, stats };
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="minimal-card rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white border-b border-white/[0.06] pb-3">
                  Leadership Pillars
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {draft.leadershipPillars.map((pillar, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-[#09090b] border border-white/[0.06] space-y-3">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-1">
                          <Field
                            label="No."
                            value={pillar.number}
                            mono
                            onChange={(v) =>
                              updateDraft((d) => {
                                const leadershipPillars = [...d.leadershipPillars];
                                leadershipPillars[idx] = { ...leadershipPillars[idx], number: v };
                                return { ...d, leadershipPillars };
                              })
                            }
                          />
                        </div>
                        <div className="col-span-3">
                          <Field
                            label="Title"
                            value={pillar.title}
                            onChange={(v) =>
                              updateDraft((d) => {
                                const leadershipPillars = [...d.leadershipPillars];
                                leadershipPillars[idx] = { ...leadershipPillars[idx], title: v };
                                return { ...d, leadershipPillars };
                              })
                            }
                          />
                        </div>
                      </div>
                      <TextArea
                        label="Description"
                        value={pillar.desc}
                        rows={2}
                        onChange={(v) =>
                          updateDraft((d) => {
                            const leadershipPillars = [...d.leadershipPillars];
                            leadershipPillars[idx] = { ...leadershipPillars[idx], desc: v };
                            return { ...d, leadershipPillars };
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
