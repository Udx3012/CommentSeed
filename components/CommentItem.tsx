'use client';

import React, { useState } from 'react';
import { Copy, Check, RotateCw } from 'lucide-react';
import { Comment } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CommentItemProps {
  comment: Comment;
  onRegenerate: (id: string) => Promise<void> | void;
}

export default function CommentItem({ comment, onRegenerate }: CommentItemProps) {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(comment.text);
      setCopied(true);
      toast.success('Comment copied to clipboard', {
        duration: 1500,
        style: {
          background: '#0a0a0a',
          borderColor: '#1f1f1f',
          color: '#fff',
        }
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy comment');
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    
    try {
      await onRegenerate(comment.id);
      toast.success('Regenerated comment', {
        duration: 1500,
        style: {
          background: '#0a0a0a',
          borderColor: '#1f1f1f',
          color: '#fff',
        }
      });
    } catch {
      // Errors are toasted by the parent handler
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="group relative py-4 px-3 flex items-start justify-between gap-4 border-b border-neutral-900/60 last:border-b-0 hover:bg-neutral-900/10 hover:translate-x-0.5 rounded-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm text-neutral-200 group-hover:text-white leading-relaxed select-text transition-colors duration-300">
          {comment.text}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          title="Copy comment"
          className="size-7 rounded-md border border-neutral-850 bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 hover:text-white text-neutral-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.93]"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-500 animate-in fade-in zoom-in duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>

        {/* Regenerate Button */}
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          title="Regenerate comment"
          className="size-7 rounded-md border border-neutral-850 bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 hover:text-white text-neutral-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black disabled:opacity-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.93] group/reg"
        >
          <RotateCw className={cn("size-3.5 group-hover/reg:rotate-45 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]", isRegenerating && "animate-spin text-white")} />
        </button>
      </div>
    </div>
  );
}
