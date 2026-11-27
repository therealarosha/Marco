import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import HeroBento from './components/HeroBento';
import CreativeArsenal from './components/CreativeArsenal';
import ProjectShowcase from './components/ProjectShowcase';
import FilmStripGallery from './components/FilmStripGallery';
import LeadershipSection from './components/LeadershipSection';
import FooterAndContact from './components/FooterAndContact';
import { portfolioData as defaultData } from './data/portfolioData';
import { subscribePortfolioContent } from './lib/portfolioService';

const AdminCMS = lazy(() => import('./components/AdminCMS'));

function isAdminHash() {
  return window.location.hash.startsWith('#/admin');
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(isAdminHash);
  const [content, setContent] = useState(defaultData);

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(isAdminHash());
      if (isAdminHash()) {
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribePortfolioContent((result) => {
      if (result?.data) {
        setContent(result.data);
      }
    });
    return () => unsubscribe();
  }, []);

  if (isAdmin) {
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

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 relative selection:bg-[#FF4D00]/25 selection:text-white">
      <Navbar personal={content.personal} />

      <main className="relative z-10">
        <HeroBento
          personal={content.personal}
          stats={content.stats}
        />

        <CreativeArsenal
          arsenal={content.arsenal}
        />

        <ProjectShowcase
          projects={content.projects}
        />

        <FilmStripGallery
          gallery={content.gallery}
        />

        <LeadershipSection
          leadershipPillars={content.leadershipPillars}
        />
      </main>

      <FooterAndContact personal={content.personal} />
    </div>
  );
}
