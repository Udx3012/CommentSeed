'use client';

import React from 'react';

interface LoadingSkeletonProps {
  archetypesCount: number;
  commentsCount: number;
}

export default function LoadingSkeleton({ archetypesCount = 3, commentsCount = 2 }: LoadingSkeletonProps) {
  // Create arrays for mapping skeleton cards
  const archetypes = Array.from({ length: archetypesCount });
  const comments = Array.from({ length: commentsCount });

  return (
    <div className="space-y-6 w-full">
      {/* Skeleton Top Bar */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div className="h-4 bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 border border-neutral-850 rounded w-40 animate-pulse" />
        <div className="h-8 bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 border border-neutral-850 rounded-lg w-24 animate-pulse" />
      </div>

      {/* Skeleton Card Grid */}
      <div className="grid gap-4">
        {archetypes.map((_, aIdx) => (
          <div
            key={aIdx}
            className="rounded-xl border border-neutral-900 bg-neutral-950/20 p-5 space-y-4 animate-pulse [animation-delay:_100ms]"
          >
            {/* Archetype Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-md bg-neutral-900" />
                <div className="h-4 bg-neutral-900 rounded-md w-20" />
              </div>
              <div className="h-3 bg-neutral-900 rounded-md w-32" />
            </div>

            {/* Comments List Skeletons */}
            <div className="divide-y divide-neutral-900/60">
              {comments.map((_, cIdx) => (
                <div key={cIdx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    <div className="h-3.5 bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 rounded-md w-[85%]" />
                    <div className="h-3 bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 rounded-md w-[55%]" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="size-7 rounded-md bg-neutral-900" />
                    <div className="size-7 rounded-md bg-neutral-900" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
