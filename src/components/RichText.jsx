import React from 'react';

const TOKEN_REGEX =
  /(==[^=]+==|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|mailto:|#)[^)]+\))/g;

function isSafeHref(href) {
  return /^(https?:\/\/|mailto:|#)/i.test(href);
}

/**
 * Renders lightweight inline WYSIWYG tokens safely as React elements:
 * ==accent==, **bold**, *italic*, `code`, and [label](url).
 */
export default function RichText({ text = '' }) {
  if (typeof text !== 'string' || !text) return null;

  const parts = text.split(TOKEN_REGEX);

  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;

        if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
          return (
            <span key={idx} className="text-accent">
              {part.slice(2, -2)}
            </span>
          );
        }

        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={idx} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }

        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return (
            <em key={idx} className="italic text-zinc-200">
              {part.slice(1, -1)}
            </em>
          );
        }

        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={idx}
              className="font-mono text-[0.9em] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch && isSafeHref(linkMatch[2])) {
          const isExternal = /^https?:\/\//i.test(linkMatch[2]);
          return (
            <a
              key={idx}
              href={linkMatch[2]}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer' : undefined}
              className="underline decoration-white/30 hover:decoration-accent text-zinc-200 hover:text-white transition-colors"
            >
              {linkMatch[1]}
            </a>
          );
        }

        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </>
  );
}
