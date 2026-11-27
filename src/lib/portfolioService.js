import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { portfolioData as defaultData } from '../data/portfolioData';

const COLLECTION_NAME = 'portfolio';
const DOC_ID = 'content';

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

export async function savePortfolioContent(content) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* environment variables.');
  }

  const payload = {
    personal: content.personal,
    stats: content.stats,
    arsenal: content.arsenal,
    projects: content.projects,
    gallery: content.gallery,
    leadershipPillars: content.leadershipPillars,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, COLLECTION_NAME, DOC_ID), payload);
}
