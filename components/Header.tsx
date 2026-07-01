'use client';

import React from 'react';
import { Terminal, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full border-b border-neutral-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 select-none">
          <div className="h-9 w-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 to-neutral-850 opacity-50 group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <Sparkles className="size-4 text-white relative z-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">CommentSeed</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">v1.0.0-beta</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono tracking-tight">HALFTONEMOTION / DEMO</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-850 rounded-md px-3 py-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:scale-[0.98] outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
          >
            <Terminal className="size-3.5" />
            <span className="font-mono">Console</span>
          </a>
        </div>
      </div>
    </header>
  );
}
