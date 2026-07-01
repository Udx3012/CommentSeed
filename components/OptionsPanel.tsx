'use client';

import React from 'react';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionsPanelProps {
  commentsPerArchetype: number;
  setCommentsPerArchetype: (val: number) => void;
  lowercase: boolean;
  setLowercase: (val: boolean) => void;
  addImperfections: boolean;
  setAddImperfections: (val: boolean) => void;
}

export default function OptionsPanel({
  commentsPerArchetype,
  setCommentsPerArchetype,
  lowercase,
  setLowercase,
  addImperfections,
  setAddImperfections
}: OptionsPanelProps) {
  return (
    <div className="space-y-4 border-t border-neutral-900 pt-5">
      <div className="flex items-center gap-1.5 mb-2">
        <Settings2 className="size-3.5 text-neutral-400" />
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">Generation Parameters</span>
      </div>

      {/* Comments Per Archetype Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-300">Comments per Archetype</span>
          <span className="font-mono text-neutral-200 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-xs">
            {commentsPerArchetype}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={commentsPerArchetype}
          onChange={(e) => setCommentsPerArchetype(parseInt(e.target.value))}
          className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:size-3.5 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-emerald-500 
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_#10b981] 
            [&::-webkit-slider-thumb]:transition-all 
            [&::-webkit-slider-thumb]:duration-300
            [&::-webkit-slider-thumb]:ease-[cubic-bezier(0.16,1,0.3,1)]
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-moz-range-thumb]:size-3.5 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-white 
            [&::-moz-range-thumb]:border-2 
            [&::-moz-range-thumb]:border-emerald-500 
            [&::-moz-range-thumb]:shadow-[0_0_8px_#10b981] 
            [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:duration-300
            [&::-moz-range-thumb]:ease-[cubic-bezier(0.16,1,0.3,1)]
            [&::-moz-range-thumb]:hover:scale-125"
        />
        <div className="flex justify-between text-[11px] font-mono text-neutral-500 px-1 select-none">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      {/* Switch Toggles */}
      <div className="space-y-3.5 pt-2">
        {/* Force Lowercase Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1 pr-4">
            <label htmlFor="lowercase-toggle" className="text-sm font-medium text-neutral-200 cursor-pointer">
              Force Lowercase
            </label>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Style comments in all lowercase to match casual platform behavior.
            </p>
          </div>
          <button
            id="lowercase-toggle"
            role="switch"
            aria-checked={lowercase}
            onClick={() => setLowercase(!lowercase)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black",
              lowercase ? "bg-white" : "bg-neutral-800"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                lowercase ? "translate-x-4 bg-black" : "translate-x-0.5 bg-neutral-500"
              )}
            />
          </button>
        </div>

        {/* Inject Imperfections Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1 pr-4">
            <label htmlFor="imperfections-toggle" className="text-sm font-medium text-neutral-200 cursor-pointer">
              Realism Imperfections
            </label>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Inject abbreviations (ngl, fr, lol), drop periods, and add light typos.
            </p>
          </div>
          <button
            id="imperfections-toggle"
            role="switch"
            aria-checked={addImperfections}
            onClick={() => setAddImperfections(!addImperfections)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black",
              addImperfections ? "bg-white" : "bg-neutral-800"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                addImperfections ? "translate-x-4 bg-black" : "translate-x-0.5 bg-neutral-500"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
