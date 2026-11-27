import React, { useState, useEffect, lazy, Suspense } from 'react';
import PortfolioView from './components/PortfolioView';
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

  return <PortfolioView content={content} />;
}
