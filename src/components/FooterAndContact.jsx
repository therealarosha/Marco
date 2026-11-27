import React, { useState } from 'react';
import { Mail, Copy, Check, ArrowUp } from 'lucide-react';
import { GithubIcon, LinkedinIcon, InstagramIcon, YoutubeIcon } from './SocialIcons';

const CURRENT_YEAR = new Date().getFullYear();

export default function FooterAndContact({ personal }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(personal.contacts.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="pt-20 pb-12 border-t border-white/[0.08] bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Minimalist Contact Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-16 border-b border-white/[0.08]">
          <div className="max-w-xl">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mb-3">
              06 / Contact
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Have a project, film, or problem worth solving<span className="text-accent">?</span>
            </h2>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Open for software builds, video direction, motion design, and student collaborations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={`mailto:${personal.contacts.email}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </a>

            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-[#101012] border border-white/[0.1] hover:border-white/[0.2] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-accent" />
                  <span className="font-mono text-white">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{personal.contacts.email}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Metadata & Socials */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
            <span>&copy; {CURRENT_YEAR} {personal.displayName || personal.name}</span>
            <span className="text-zinc-700">/</span>
            <span>WUSL Applied Sciences</span>
            <span className="text-zinc-700">/</span>
            <a href="#/admin" className="text-zinc-500 hover:text-accent transition-colors">
              CMS
            </a>
          </div>

          <div className="flex items-center gap-3">
            {personal.contacts.github && (
              <a
                href={personal.contacts.github}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-white/[0.08] hover:border-white/[0.2] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {personal.contacts.linkedin && (
              <a
                href={personal.contacts.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-white/[0.08] hover:border-white/[0.2] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {personal.contacts.youtube && (
              <a
                href={personal.contacts.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-white/[0.08] hover:border-white/[0.2] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            )}
            {personal.contacts.instagram && (
              <a
                href={personal.contacts.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-white/[0.08] hover:border-white/[0.2] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-lg border border-white/[0.08] hover:border-white/[0.2] flex items-center justify-center text-zinc-400 hover:text-white transition-colors ml-2"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
