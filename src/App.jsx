import React, { useState, useEffect, lazy, Suspense } from 'react';
import PortfolioView from './components/PortfolioView';
import LoadingScreen from './components/LoadingScreen';
import {
  fetchPortfolioContent,
  getInitialCachedContent
} from './lib/portfolioService';

const AdminCMS = lazy(() => import('./components/AdminCMS'));

function parseHashRoute() {
  const hash = window.location.hash || '';
  if (hash.startsWith('#/admin')) {
    return { mode: 'admin', pageSlug: null };
  }
  if (hash.startsWith('#/page/')) {
    const slug = hash.slice(7).split('?')[0].trim();
    return { mode: 'page', pageSlug: slug || null };
  }
  return { mode: 'home', pageSlug: null };
}

const LOADER_SEEN_KEY = 'marco_loader_seen';

export default function App() {
  const [route, setRoute] = useState(parseHashRoute);
  const [content, setContent] = useState(getInitialCachedContent);
  const [loaderDismissed, setLoaderDismissed] = useState(() => {
    try {
      const initial = getInitialCachedContent();
      return (
        initial.siteConfig?.loader?.oncePerSession &&
        sessionStorage.getItem(LOADER_SEEN_KEY) === '1'
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleHashChange = () => {
      const next = parseHashRoute();
      setRoute(next);
      if (next.mode === 'admin' || next.mode === 'page') {
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    let active = true;
    fetchPortfolioContent().then((result) => {
      if (active && result?.data) {
        setContent(result.data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (route.mode === 'admin') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#09090b] text-zinc-400 flex items-center justify-center font-mono text-xs">
            Loading CMS...
          </div>
        }
      >
        <AdminCMS
          onExit={() => {
            window.location.hash = '';
          }}
        />
      </Suspense>
    );
  }

  const loaderCfg = content.siteConfig?.loader || {};
  const showLoader = Boolean(loaderCfg.enabled) && !loaderDismissed;

  const handleLoaderDone = () => {
    setLoaderDismissed(true);
    try {
      if (loaderCfg.oncePerSession) {
        sessionStorage.setItem(LOADER_SEEN_KEY, '1');
      }
    } catch {
      // ignore sessionStorage restriction
    }
  };

  return (
    <>
      {showLoader && (
        <LoadingScreen
          config={loaderCfg}
          brandName={content.personal?.displayName || content.personal?.name}
          lottieConfig={content.siteConfig?.lottie}
          onDone={handleLoaderDone}
        />
      )}
      <PortfolioView
        content={content}
        activePageSlug={route.mode === 'page' ? route.pageSlug : null}
        deferAnimations={showLoader}
      />
    </>
  );
}
