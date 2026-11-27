import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

export default function Navbar({ personal, navbarConfig, isPreview = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isPreview) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPreview]);

  const brandName = navbarConfig?.brandText?.trim() || personal.displayName || personal.name;
  const showUniversityTag = navbarConfig?.showUniversityTag !== false;
  const universityTag = navbarConfig?.universityTag || '/ WUSL';
  const showCta = navbarConfig?.showCta !== false;
  const ctaLabel = navbarConfig?.ctaLabel || 'Collaborate';
  const ctaHref = navbarConfig?.ctaHref || '#contact';

  const navItems = (navbarConfig?.links || [
    { id: 'about', label: 'Overview', href: '#about', visible: true },
    { id: 'arsenal', label: 'Arsenal', href: '#arsenal', visible: true },
    { id: 'projects', label: 'Work', href: '#projects', visible: true },
    { id: 'reel', label: 'Lens', href: '#reel', visible: true },
    { id: 'leadership', label: 'Ethos', href: '#leadership', visible: true },
  ]).filter((item) => item.visible !== false);

  return (
    <header
      className={`${isPreview ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-40 transition-colors duration-200 ${
        scrolled || isPreview
          ? 'py-3.5 bg-[#09090b]/90 backdrop-blur-md border-b border-white/[0.08]'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between">
          {/* Minimal Wordmark */}
          <a href="#" className="group flex items-baseline gap-2.5">
            <span className="font-bold text-base tracking-tight text-white">
              {brandName}
              <span className="text-accent">.</span>
            </span>
            {showUniversityTag && (
              <span className="hidden sm:inline text-[11px] font-mono text-zinc-500">
                {universityTag}
              </span>
            )}
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => {
              const isExternal = /^https?:\/\//i.test(item.href || '');
              return (
                <a
                  key={item.id || item.href}
                  href={item.href || '#'}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer' : undefined}
                  className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Minimal CTA */}
          {showCta && (
            <div className="hidden sm:flex items-center">
              <a
                href={ctaHref}
                target={/^https?:\/\//i.test(ctaHref) ? '_blank' : undefined}
                rel={/^https?:\/\//i.test(ctaHref) ? 'noreferrer' : undefined}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 rounded-xl bg-[#101012] border border-white/[0.08] flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.id || item.href}
                href={item.href || '#'}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
            {showCta && (
              <a
                href={ctaHref}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
