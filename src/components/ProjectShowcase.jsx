import React, { useState } from 'react';
import { ArrowUpRight, Code2, Film, X } from 'lucide-react';
import { GithubIcon } from './SocialIcons';
import RichText from './RichText';

export default function ProjectShowcase({ projects, sectionMeta, theme }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'dev', label: 'Code & Apps' },
    { id: 'video', label: 'Cinema' },
    { id: 'motion', label: 'Motion' },
    { id: 'design', label: 'Design' }
  ];

  const filteredProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  const cardRadius = theme?.cardRadius || 'rounded-xl';
  const showDotGrid = theme?.showDotGrid !== false;

  return (
    <section id="projects" className="py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header & Minimal Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
              {sectionMeta?.eyebrow || '03 / Selected Work'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              <RichText text={sectionMeta?.title || 'Creations & Productions==.=='} />
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              <RichText text={sectionMeta?.subtitle || 'Practical software solutions, documentaries, motion packages, and visual identities.'} />
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 border-b border-white/[0.08]">
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setActiveFilter(opt.id)}
                  className={`pb-3 text-xs font-mono transition-colors relative ${
                    isActive
                      ? 'text-white font-medium'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimalist Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`minimal-card ${cardRadius} p-6 cursor-pointer group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
                    {project.featured && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    )}
                    <span>{project.tag}</span>
                  </span>

                  <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </div>

                <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors">
                  {project.title}
                </h3>

                {project.imageUrl && (
                  <div className="mt-3 aspect-[16/9] rounded-lg overflow-hidden border border-white/[0.06] bg-[#09090b]">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                )}

                <p className="mt-2.5 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {project.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap gap-x-3 gap-y-1">
                {project.techStack.map((tech, i) => (
                  <span key={i} className="text-[10px] font-mono text-zinc-500">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Minimalist Modal Inspector */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className={`bg-[#0e0e10] border border-white/[0.12] ${cardRadius} max-w-xl w-full p-6 sm:p-8 relative`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-mono text-accent uppercase tracking-widest block mb-2">
              {selectedProject.tag}
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              {selectedProject.title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
              {selectedProject.summary}
            </p>

            {/* Minimalist Monochrome Preview Box */}
            {selectedProject.imageUrl ? (
              <div className="rounded-lg bg-[#09090b] border border-white/[0.08] mb-6 overflow-hidden aspect-video">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-lg bg-[#09090b] border border-white/[0.08] p-6 mb-6 flex flex-col items-center justify-center text-center min-h-[140px] relative overflow-hidden">
                {showDotGrid && <div className="absolute inset-0 bg-subtle-dots opacity-50" />}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-lg border border-white/[0.1] bg-[#111113] flex items-center justify-center text-zinc-300 mb-2.5">
                    {selectedProject.category === 'video' ? (
                      <Film className="w-4 h-4" />
                    ) : (
                      <Code2 className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-mono text-zinc-300">
                    {selectedProject.category === 'video'
                      ? '4K Master Cut Preview'
                      : 'Interactive Build Preview'}
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-1">
                    Add an image URL or demo link via the CMS (#/admin)
                  </span>
                </div>
              </div>
            )}

            {/* Stack Tags */}
            <div className="mb-6">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
                Stack & Tools
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.08]">
              {selectedProject.demoUrl && (
                <a
                  href={selectedProject.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
                >
                  <span>View Project</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>Source</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
