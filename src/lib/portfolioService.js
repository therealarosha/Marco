import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { portfolioData as defaultData } from '../data/portfolioData';
import { normalizeHex } from './themeUtils';
import { estimateJsonKb } from './mediaUtils';

const COLLECTION_NAME = 'portfolio';
const DOC_ID = 'content';
const CACHE_KEY = 'marco_portfolio_cache_v1';

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mergeSiteConfig(remoteConfig) {
  const base = defaultData.siteConfig;
  if (!remoteConfig || typeof remoteConfig !== 'object') {
    return cloneObj(base);
  }
  return {
    theme: {
      ...base.theme,
      ...(remoteConfig.theme || {}),
    },
    loader: {
      ...base.loader,
      ...(remoteConfig.loader || {}),
    },
    lottie: {
      ...base.lottie,
      ...(remoteConfig.lottie || {}),
    },
    sections: Array.isArray(remoteConfig.sections)
      ? remoteConfig.sections
      : cloneObj(base.sections),
    navbar: {
      ...base.navbar,
      ...(remoteConfig.navbar || {}),
      links: Array.isArray(remoteConfig.navbar?.links)
        ? remoteConfig.navbar.links
        : cloneObj(base.navbar.links),
    },
    hero: {
      ...base.hero,
      ...(remoteConfig.hero || {}),
      bentoOrder: Array.isArray(remoteConfig.hero?.bentoOrder)
        ? remoteConfig.hero.bentoOrder
        : [...base.hero.bentoOrder],
      craftTools: Array.isArray(remoteConfig.hero?.craftTools)
        ? remoteConfig.hero.craftTools
        : [...base.hero.craftTools],
      buttons: Array.isArray(remoteConfig.hero?.buttons)
        ? remoteConfig.hero.buttons
        : cloneObj(base.hero.buttons),
    },
    footer: {
      ...base.footer,
      ...(remoteConfig.footer || {}),
      buttons: Array.isArray(remoteConfig.footer?.buttons)
        ? remoteConfig.footer.buttons
        : cloneObj(base.footer.buttons),
    },
    pages: Array.isArray(remoteConfig.pages)
      ? remoteConfig.pages
      : cloneObj(base.pages),
  };
}

function mergeWithDefaults(remote) {
  if (!remote || typeof remote !== 'object') {
    return cloneObj(defaultData);
  }
  return {
    personal: {
      ...defaultData.personal,
      ...(remote.personal || {}),
      contacts: {
        ...defaultData.personal.contacts,
        ...(remote.personal?.contacts || {}),
      },
    },
    stats: Array.isArray(remote.stats) ? remote.stats : defaultData.stats,
    arsenal: {
      tech: Array.isArray(remote.arsenal?.tech)
        ? remote.arsenal.tech
        : defaultData.arsenal.tech,
      creative: Array.isArray(remote.arsenal?.creative)
        ? remote.arsenal.creative
        : defaultData.arsenal.creative,
      leadership: Array.isArray(remote.arsenal?.leadership)
        ? remote.arsenal.leadership
        : defaultData.arsenal.leadership,
    },
    projects: Array.isArray(remote.projects)
      ? remote.projects
      : defaultData.projects,
    gallery: Array.isArray(remote.gallery)
      ? remote.gallery
      : defaultData.gallery,
    leadershipPillars: Array.isArray(remote.leadershipPillars)
      ? remote.leadershipPillars
      : defaultData.leadershipPillars,
    siteConfig: mergeSiteConfig(remote.siteConfig),
  };
}

export function getInitialCachedContent() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return defaultData;
    return mergeWithDefaults(JSON.parse(raw));
  } catch {
    return defaultData;
  }
}

function writeCachedContent(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage quota errors on mobile devices
  }
}

export async function fetchPortfolioContent() {
  if (!isFirebaseConfigured || !db) {
    return {
      data: cloneObj(defaultData),
      source: 'local',
      existsInDb: false,
    };
  }

  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, DOC_ID));
    if (snap.exists()) {
      const merged = mergeWithDefaults(snap.data());
      writeCachedContent(merged);
      return {
        data: merged,
        source: 'firestore',
        existsInDb: true,
      };
    }
    return {
      data: cloneObj(defaultData),
      source: 'default',
      existsInDb: false,
    };
  } catch (error) {
    console.warn('Firestore fetch failed, using default content:', error);
    return {
      data: getInitialCachedContent(),
      source: 'fallback',
      existsInDb: false,
      error,
    };
  }
}

function normalizeOptionalUrl(url) {
  const trimmed = String(url ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function sanitizeSlug(raw, fallbackIndex) {
  const cleaned = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || `page-${fallbackIndex + 1}`;
}

export function sanitizeAndValidateContent(content) {
  const personal = content.personal || {};
  const contacts = personal.contacts || {};

  const name = String(personal.displayName || personal.name || '').trim();
  if (!name) {
    throw new Error('Display Name cannot be empty.');
  }

  const email = String(contacts.email ?? '').trim();
  if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    throw new Error('Contact Email must be a valid email address (or left empty).');
  }

  const bio = Array.isArray(personal.bio)
    ? personal.bio.map((p) => String(p ?? ''))
    : [];
  if (bio.length < 1 || bio.length > 8) {
    throw new Error('Bio must contain between 1 and 8 paragraphs.');
  }

  const roles = Array.isArray(personal.roles)
    ? personal.roles.map((r) => String(r ?? '').trim()).filter(Boolean)
    : [];
  if (roles.length > 16) {
    throw new Error('Roles list can have at most 16 items.');
  }

  const stats = Array.isArray(content.stats) ? content.stats : [];
  if (stats.length < 1 || stats.length > 8) {
    throw new Error('Stats strip must contain between 1 and 8 items.');
  }

  const leadershipPillars = Array.isArray(content.leadershipPillars)
    ? content.leadershipPillars
    : [];
  if (leadershipPillars.length < 1 || leadershipPillars.length > 8) {
    throw new Error('Leadership Pillars must contain between 1 and 8 items.');
  }

  const siteConfig = mergeSiteConfig(content.siteConfig);
  siteConfig.theme.accentColor = normalizeHex(siteConfig.theme.accentColor);
  siteConfig.lottie.url = normalizeOptionalUrl(siteConfig.lottie.url);
  siteConfig.loader.lottieUrl = normalizeOptionalUrl(siteConfig.loader.lottieUrl);

  siteConfig.pages = (siteConfig.pages || []).slice(0, 15).map((page, idx) => ({
    ...page,
    slug: sanitizeSlug(page.slug || page.title, idx),
  }));

  const lottieJson = String(siteConfig.lottie.customJson ?? '');
  if (lottieJson.length > 300000) {
    throw new Error('Inline Lottie JSON exceeds 300 KB limit. Use an external URL instead.');
  }
  if (siteConfig.lottie.enabled && siteConfig.lottie.sourceType === 'json' && lottieJson.trim()) {
    try {
      JSON.parse(lottieJson);
    } catch {
      throw new Error('Custom Lottie JSON is not valid JSON.');
    }
  }

  const clean = {
    personal: {
      name,
      displayName: name,
      headline: String(personal.headline ?? ''),
      subheadline: String(personal.subheadline ?? ''),
      university: String(personal.university ?? ''),
      faculty: String(personal.faculty ?? ''),
      statusBadge: String(personal.statusBadge ?? ''),
      location: String(personal.location ?? ''),
      bio,
      roles,
      contacts: {
        email,
        github: normalizeOptionalUrl(contacts.github),
        linkedin: normalizeOptionalUrl(contacts.linkedin),
        instagram: normalizeOptionalUrl(contacts.instagram),
        youtube: normalizeOptionalUrl(contacts.youtube),
      },
    },
    stats,
    arsenal: {
      tech: Array.isArray(content.arsenal?.tech) ? content.arsenal.tech : [],
      creative: Array.isArray(content.arsenal?.creative) ? content.arsenal.creative : [],
      leadership: Array.isArray(content.arsenal?.leadership) ? content.arsenal.leadership : [],
    },
    projects: Array.isArray(content.projects) ? content.projects : [],
    gallery: Array.isArray(content.gallery) ? content.gallery : [],
    leadershipPillars,
    siteConfig,
  };

  if (estimateJsonKb(clean) > 950) {
    throw new Error(
      'Total document size exceeds 950 KB (Firestore 1 MB limit). Replace a few uploaded photos with external image URLs.'
    );
  }

  return clean;
}

export async function savePortfolioContent(content) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* environment variables.');
  }

  const clean = sanitizeAndValidateContent(content);
  const payload = {
    ...clean,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, COLLECTION_NAME, DOC_ID), payload);
  writeCachedContent(clean);
  return clean;
}
