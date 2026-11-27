import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Lock,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';
import { auth, googleProvider, isFirebaseConfigured, ADMIN_EMAIL } from '../lib/firebase';
import { fetchPortfolioContent, savePortfolioContent } from '../lib/portfolioService';
import { portfolioData as defaultData } from '../data/portfolioData';

function Field({ label, value, onChange, placeholder = '', type = 'text', mono = false }) {
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

function TextArea({ label, value, onChange, rows = 3, placeholder = '' }) {
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

function moveItem(list, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

export default function AdminCMS({ onExit }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState('');

  const [draft, setDraft] = useState(null);
  const [dbExists, setDbExists] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Monitor Firebase Auth session
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const email = (currentUser.email || '').toLowerCase();
        if (email !== ADMIN_EMAIL || !currentUser.emailVerified) {
          await signOut(auth);
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
    return () => unsub();
  }, []);

  // Load Firestore data once authorized
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
    if (!auth || !googleProvider) return;
    setAuthError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = (result.user?.email || '').toLowerCase();
      if (email !== ADMIN_EMAIL) {
        await signOut(auth);
        setAuthError(`Access denied for ${result.user?.email}. Sign in with ${ADMIN_EMAIL}.`);
      }
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed.');
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
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
      await savePortfolioContent(draft, user.email);
      setDirty(false);
      setDbExists(true);
      setStatusMsg({ type: 'success', text: 'Saved to Firebase Firestore.' });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Save failed. Check Firestore rules and connection.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setDraft(structuredClone(defaultData));
    setDirty(true);
    setStatusMsg({
      type: 'info',
      text: 'Loaded default template into editor. Click Save Changes to publish to Firestore.',
    });
  };

  // Setup required screen if Firebase env vars are not set yet
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
            Firebase environment variables are not configured yet. Add your Firebase Web App credentials to{' '}
            <code className="text-zinc-200 font-mono">.env.local</code> locally and to GitHub Repository Secrets for deployment.
          </p>

          <div className="rounded-lg bg-[#09090b] border border-white/[0.08] p-4 font-mono text-[11px] text-zinc-400 space-y-1.5 mb-6">
            <div>VITE_FIREBASE_API_KEY</div>
            <div>VITE_FIREBASE_AUTH_DOMAIN</div>
            <div>VITE_FIREBASE_PROJECT_ID</div>
            <div>VITE_FIREBASE_STORAGE_BUCKET</div>
            <div>VITE_FIREBASE_MESSAGING_SENDER_ID</div>
            <div>VITE_FIREBASE_APP_ID</div>
            <div className="text-accent pt-1">VITE_ADMIN_EMAIL={ADMIN_EMAIL}</div>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Ensure Google Sign-In is enabled in Firebase Authentication and <code className="text-zinc-300 font-mono">firestore.rules</code> is deployed so only{' '}
            <span className="text-zinc-300 font-mono">{ADMIN_EMAIL}</span> can write to Firestore.
          </p>
        </div>
      </div>
    );
  }

  // Loading auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-400 flex items-center justify-center font-mono text-xs">
        Verifying Google session...
      </div>
    );
  }

  // Google Auth Sign-In Gate
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
            Sign in with your authorized Google account (<span className="font-mono text-zinc-200">{ADMIN_EMAIL}</span>) to manage projects, stills, toolkit, and profile content.
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

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'projects', label: `Projects (${draft.projects.length})` },
    { id: 'gallery', label: `Lens & Stills (${draft.gallery.length})` },
    { id: 'arsenal', label: 'Arsenal' },
    { id: 'stats', label: 'Stats & Ethos' }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
      {/* Top CMS Bar */}
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Site</span>
            </button>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                CMS<span className="text-accent">.</span>
              </span>
              <span className="hidden sm:inline text-[11px] font-mono text-zinc-500">
                {user.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {dirty && (
              <span className="text-[11px] font-mono text-accent flex items-center gap-1.5 mr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Unsaved
              </span>
            )}

            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.2] transition-colors"
              title="Reset editor from default template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Seed Defaults</span>
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
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8">
        {/* Status Banner */}
        {!dbExists && !statusMsg && (
          <div className="mb-6 p-3.5 rounded-lg border border-white/[0.1] bg-[#101012] text-xs text-zinc-300 flex items-center justify-between gap-4">
            <span>
              Firestore document <code className="font-mono text-white">portfolio/content</code> is not initialized yet. Review defaults below and click <strong className="text-white">Save to Firebase</strong> to publish.
            </span>
          </div>
        )}

        {statusMsg && (
          <div
            className={`mb-6 p-3.5 rounded-lg border text-xs flex items-center gap-2 ${
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

        {/* Section Tabs */}
        <div className="flex flex-wrap items-center gap-6 border-b border-white/[0.08] mb-8">
          {tabs.map((tab) => {
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

        {/* TAB 1: PROFILE */}
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
                    Bio Paragraphs
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
                      <TextArea
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
                        className="mt-6 p-2 text-zinc-500 hover:text-accent transition-colors"
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

        {/* TAB 2: PROJECTS */}
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
                        className="accent-[#FF4D00]"
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
                      aria-label="Move up"
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
                      aria-label="Move down"
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
                      aria-label="Delete project"
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
                    label="Thumbnail Image URL (optional)"
                    value={project.imageUrl || ''}
                    mono
                    placeholder="https://..."
                    onChange={(v) =>
                      updateDraft((d) => {
                        const projects = [...d.projects];
                        projects[idx] = { ...projects[idx], imageUrl: v };
                        return { ...d, projects };
                      })
                    }
                  />
                  <Field
                    label="Live Demo / Video URL"
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: GALLERY / LENS */}
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
                      aria-label="Move up"
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
                      aria-label="Move down"
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
                      aria-label="Delete frame"
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
                  <Field
                    label="Still Image URL (optional)"
                    value={frame.imageUrl || ''}
                    mono
                    placeholder="https://..."
                    onChange={(v) =>
                      updateDraft((d) => {
                        const gallery = [...d.gallery];
                        gallery[idx] = { ...gallery[idx], imageUrl: v };
                        return { ...d, gallery };
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: ARSENAL */}
        {activeTab === 'arsenal' && (
          <div className="space-y-8">
            {[
              { key: 'tech', title: 'Code & Vibe Engineering' },
              { key: 'creative', title: 'Cinema & Motion Suite' },
              { key: 'leadership', title: 'Leadership & Science' }
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
                          aria-label="Remove item"
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

        {/* TAB 5: STATS & ETHOS */}
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
    </div>
  );
}
