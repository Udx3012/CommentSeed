'use client';

import React from 'react';
import { ARCHETYPES } from '@/lib/archetypes';
import { Archetype } from '@/types';
import { cn } from '@/lib/utils';

interface ArchetypeSelectorProps {
  selectedArchetypes: Archetype[];
  onToggleArchetype: (id: Archetype) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function ArchetypeSelector({
  selectedArchetypes,
  onToggleArchetype,
  onSelectAll,
  onDeselectAll
}: ArchetypeSelectorProps) {
  
  const handleKeyDown = (e: React.KeyboardEvent, id: Archetype) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggleArchetype(id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-neutral-400">
          Archetypes Selection
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors focus:outline-none"
          >
            Select All
          </button>
          <span className="text-[10px] text-neutral-700 select-none">|</span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors focus:outline-none"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
        {ARCHETYPES.map((arch) => {
          const isSelected = selectedArchetypes.includes(arch.id);
          
          return (
            <div
              key={arch.id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, arch.id)}
              onClick={() => onToggleArchetype(arch.id)}
              className={cn(
                "p-3 rounded-lg border text-left cursor-pointer select-none outline-none relative overflow-hidden group focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]",
                isSelected
                  ? "border-white bg-neutral-900/80 shadow-[0_0_12px_-3px_rgba(255,255,255,0.06)]"
                  : "border-neutral-900 bg-neutral-950/20 hover:border-neutral-800 hover:-translate-y-[1px] hover:bg-neutral-950/40"
              )}
            >
              {/* Left highlight bar */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white animate-in fade-in duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              )}

              {/* Top-right selection indicator dot */}
              {isSelected ? (
                <div className="absolute right-3 top-3.5 h-1.5 w-1.5 rounded-full bg-white animate-in zoom-in duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              ) : (
                <div className="absolute right-3 top-3.5 h-1.5 w-1.5 rounded-full bg-transparent group-hover:bg-neutral-800 transition-colors duration-300" />
              )}
              
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm select-none" role="img" aria-label={arch.name}>
                  {arch.emoji}
                </span>
                <span className="text-xs font-medium text-neutral-200 group-hover:text-white transition-colors duration-300">
                  {arch.name}
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed transition-colors duration-300 group-hover:text-neutral-400">
                {arch.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
