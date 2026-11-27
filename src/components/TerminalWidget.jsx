import React, { useState, useRef, useEffect } from 'react';
import { CornerDownLeft } from 'lucide-react';

export default function TerminalWidget({ personal }) {
  const [history, setHistory] = useState([
    { type: 'system', text: 'VibeOS v2.4 — interactive profile shell.' },
    { type: 'system', text: "Run 'help' or select a command below." }
  ]);
  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef(null);

  const commandResponses = {
    help: "Commands:\n  roles    — multidisciplinary profile\n  vibe     — approach to vibe coding\n  wusl     — academic background\n  stack    — code & cinema tools\n  leader   — leadership philosophy\n  contact  — reach out\n  clear    — clear output",
    roles: "Vibe Coder / Full-Stack Developer\nCinematographer / Video Editor\nMotion Graphics Artist / Graphic Designer\nApplied Science Undergrad @ WUSL\nLeader at Core",
    vibe: "Vibe Coding: shipping software at the speed of thought—pairing AI velocity with clean engineering and deliberate visual taste.",
    wusl: "Wayamba University of Sri Lanka (WUSL)\nFaculty of Applied Sciences — B.Sc. Undergraduate.\nFocus: analytical problem solving & real-world software.",
    stack: "Code   : React, Vite, Tailwind, JS, Python, Node.js\nMedia  : Premiere Pro, After Effects, DaVinci Resolve, Photoshop, Illustrator",
    leader: "Leadership at Core: setting clear direction, backing the team, and delivering real outcomes with restraint and empathy.",
    contact: `Email    : ${personal.contacts.email}\nGitHub   : ${personal.contacts.github}\nLinkedIn : ${personal.contacts.linkedin}`
  };

  const handleCommand = (cmdText) => {
    const trimmed = cmdText.trim().toLowerCase();
    if (!trimmed) return;

    if (trimmed === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    }

    const response =
      commandResponses[trimmed] ||
      `Command not found: '${trimmed}'. Type 'help' for options.`;

    setHistory((prev) => [
      ...prev,
      { type: 'user', text: `$ ${trimmed}` },
      { type: 'output', text: response }
    ]);
    setInputVal('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCommand(inputVal);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="h-full flex flex-col bg-[#0c0c0e] rounded-xl border border-white/[0.08] overflow-hidden font-mono text-xs">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
            <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
            <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
          </div>
          <span className="text-[11px] text-zinc-500 ml-1.5">
            vibe@wusl:~
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
          Shell
        </span>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 max-h-48 sm:max-h-56 select-text">
        {history.map((item, idx) => (
          <div key={idx} className="leading-relaxed">
            {item.type === 'user' ? (
              <span className="text-accent font-medium">{item.text}</span>
            ) : item.type === 'system' ? (
              <span className="text-zinc-500">{item.text}</span>
            ) : (
              <pre className="text-zinc-300 whitespace-pre-wrap font-mono mt-1 pl-2.5 border-l border-zinc-700 text-[11px] leading-relaxed">
                {item.text}
              </pre>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Quick Commands */}
      <div className="px-3.5 py-2 flex flex-wrap gap-1.5 border-t border-white/[0.05]">
        {['help', 'roles', 'vibe', 'wusl', 'stack', 'leader'].map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => handleCommand(cmd)}
            className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Prompt Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3.5 py-2.5 border-t border-white/[0.06] bg-[#0a0a0c]"
      >
        <span className="text-accent font-semibold">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="type a command..."
          className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono text-xs"
        />
        <button
          type="submit"
          className="p-1 text-zinc-500 hover:text-white transition-colors"
          aria-label="Run command"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
