import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { portfolioData as defaultData } from '../data/portfolioData';
import { normalizeHex } from './themeUtils';

const COLLECTION_NAME = 'portfolio';
const DOC_ID = 'content';

function mergeSiteConfig(remoteConfig) {
  const base = defaultData.siteConfig;
  if (!remoteConfig || typeof remoteConfig !== 'object') {
    return structuredClone(base);
  }
  return {
    theme: {
      ...base.theme,
      ...(remoteConfig.theme || {}),
    },
    lottie: {
      ...base.lottie,
      ...(remoteConfig.lottie || {}),
    },
    sections: Array.isArray(remoteConfig.sections)
      ? remoteConfig.sections
      : structuredClone(base.sections),
    navbar: {
      ...base.navbar,
      ...(remoteConfig.navbar || {}),
      links: Array.isArray(remoteConfig.navbar?.links)
        ? remoteConfig.navbar.links
        : structuredClone(base.navbar.links),
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
        : structuredClone(base.hero.buttons),
    },
    footer: {
      ...base.footer,
      ...(remoteConfig.footer || {}),
      buttons: Array.isArray(remoteConfig.footer?.buttons)
        ? remoteConfig.footer.buttons
        : structuredClone(base.footer.buttons),
    },
  };
}

function mergeWithDefaults(remote) {
  if (!remote || typeof remote !== 'object') {
    return structuredClone(defaultData);
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

export async function fetchPortfolioContent() {
  if (!isFirebaseConfigured || !db) {
    return {
      data: structuredClone(defaultData),
      source: 'local',
      existsInDb: false,
    };
  }

  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, DOC_ID));
    if (snap.exists()) {
      return {
        data: mergeWithDefaults(snap.data()),
        source: 'firestore',
        existsInDb: true,
      };
    }
    return {
      data: structuredClone(defaultData),
      source: 'default',
      existsInDb: false,
    };
  } catch (error) {
    console.warn('Firestore fetch failed, using default content:', error);
    return {
      data: structuredClone(defaultData),
      source: 'fallback',
      existsInDb: false,
      error,
    };
  }
}

export function subscribePortfolioContent(onUpdate) {
  if (!isFirebaseConfigured || !db) {
    onUpdate({
      data: structuredClone(defaultData),
      source: 'local',
      existsInDb: false,
    });
    return () => {};
  }

  const ref = doc(db, COLLECTION_NAME, DOC_ID);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onUpdate({
          data: mergeWithDefaults(snap.data()),
          source: 'firestore',
          existsInDb: true,
        });
      } else {
        onUpdate({
          data: structuredClone(defaultData),
          source: 'default',
          existsInDb: false,
        });
      }
    },
    (error) => {
      console.warn('Firestore subscription error, falling back to defaults:', error);
      onUpdate({
        data: structuredClone(defaultData),
        source: 'fallback',
        existsInDb: false,
        error,
      });
    }
  );
}

function normalizeOptionalUrl(url) {
  const trimmed = String(url ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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

  const lottieJson = String(siteConfig.lottie.customJson ?? '');
  if (lottieJson.length > 300000) {
    throw new Error('Inline Lottie JSON exceeds 300 KB limit. Host the .json file externally and use Lottie URL instead.');
  }
  if (siteConfig.lottie.enabled && siteConfig.lottie.sourceType === 'json' && lottieJson.trim()) {
    try {
      JSON.parse(lottieJson);
    } catch {
      throw new Error('Custom Lottie JSON is not valid JSON.');
    }
  }

  return {
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
  return clean;
}
