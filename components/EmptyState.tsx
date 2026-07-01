'use client';

import React from 'react';
import { MessageSquarePlus, Sparkles, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  onSelectTemplate: (context: string, url: string) => void;
}

const TEMPLATES = [
  {
    title: 'Next.js Dev Workflow',
    description: '5 Next.js tips that will save you 100+ hours in 2026. Custom caching, route optimization.',
    url: 'https://youtube.com/shorts/nextjs-tips',
    category: 'Tech'
  },
  {
    title: 'Gym Leg Day Routine',
    description: 'Leg day motivation. Deep squats form breakdown, high volume quad training routine.',
    url: 'https://tiktok.com/@fitcoach/video/legday',
    category: 'Fitness'
  },
  {
    title: 'Corporate Office Humor',
    description: 'POV: You are in a 4:30 PM meeting on a Friday that could have been a 2-word Slack message.',
    url: 'https://instagram.com/reels/corporate-life',
    category: 'Relatable'
  }
];

export default function EmptyState({ onSelectTemplate }: EmptyStateProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-neutral-850 rounded-xl p-8 md:p-12 bg-neutral-950/20 text-center min-h-[450px] relative overflow-hidden group backdrop-blur-[2px]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(255,255,255,0.005)_100%)] pointer-events-none" />
      
      <div className="h-12 w-12 rounded-xl bg-neutral-900 border border-neutral-855 flex items-center justify-center text-neutral-400 mb-6 group-hover:scale-105 group-hover:border-neutral-750 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <MessageSquarePlus className="size-5" />
      </div>

      <h3 className="text-base font-semibold text-white mb-2 tracking-tight">No comments generated yet</h3>
      <p className="text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
        Describe your video context or paste a social video link on the left panel, configure your archetypes, and click Generate.
      </p>

      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Sparkles className="size-3 text-neutral-550 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Quick Start Templates</span>
        </div>
        
        <div className="grid gap-3 text-left">
          {TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              onClick={() => onSelectTemplate(tpl.description, tpl.url)}
              className="w-full text-left p-3.5 rounded-lg bg-neutral-950/80 border border-neutral-900 hover:border-neutral-800 hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group/btn relative overflow-hidden focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-neutral-200 group-hover/btn:text-white transition-colors">
                  {tpl.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                  {tpl.category}
                </span>
              </div>
              <p className="text-xs text-neutral-450 line-clamp-1 mb-2.5 group-hover/btn:text-neutral-300 transition-colors">
                {tpl.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-600 truncate max-w-[280px]">
                  {tpl.url}
                </span>
                <span className="text-xs text-neutral-450 flex items-center gap-0.5 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  Load <ArrowRight className="size-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
