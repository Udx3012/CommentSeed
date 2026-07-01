'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Globe, 
  Copy, 
  Check, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import CommentItem from '@/components/CommentItem';
import ArchetypeSelector from '@/components/ArchetypeSelector';
import OptionsPanel from '@/components/OptionsPanel';

import { Archetype, Comment } from '@/types';
import { ARCHETYPES } from '@/lib/archetypes';

export default function Home() {
  // Input states
  const [contextText, setContextText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedArchetypes, setSelectedArchetypes] = useState<Archetype[]>([
    'hype', 'witty', 'curious', 'skeptical', 'wholesome'
  ]);
  
  // Parameter states
  const [commentsPerArchetype, setCommentsPerArchetype] = useState(2);
  const [lowercase, setLowercase] = useState(true);
  const [addImperfections, setAddImperfections] = useState(true);

  // Status states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Output states
  const [comments, setComments] = useState<Comment[]>([]);

  // Template selector helper
  const handleSelectTemplate = useCallback((description: string, url: string) => {
    setContextText(description);
    setVideoUrl(url);
    setErrorMsg('');
  }, []);

  // Start a cooldown countdown of `seconds` seconds
  const startCooldown = useCallback((seconds: number) => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    setCooldownSeconds(seconds);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current!);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
  }, []);

  // URL fetch context from backend metadata API
  const handleFetchUrl = useCallback(() => {
    if (!videoUrl) return;
    setIsFetchingUrl(true);
    setErrorMsg('');

    const fetchPromise = fetch('/api/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: videoUrl }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || 'Failed to fetch video metadata.');
        }
        return data;
      })
      .then((data) => {
        const contextParts = [];
        if (data.title) contextParts.push(`[Title]: ${data.title}`);
        if (data.caption) contextParts.push(`[Caption/Description]: ${data.caption}`);
        const combinedMeta = contextParts.join('\n');
        
        if (combinedMeta) {
          setContextText(prev => prev ? `${prev}\n\n${combinedMeta}` : combinedMeta);
        }
        setIsFetchingUrl(false);
        return `Fetched ${data.provider || 'Video'} metadata successfully`;
      })
      .catch((err) => {
        setIsFetchingUrl(false);
        const msg = err instanceof Error ? err.message : 'Failed to fetch video data.';
        setErrorMsg(msg);
        throw err;
      });

    toast.promise(fetchPromise, {
      loading: 'Connecting and fetching metadata...',
      success: (msg) => msg,
      error: (err) => err instanceof Error ? err.message : 'Failed to fetch video metadata',
      style: {
        background: '#0a0a0a',
        borderColor: '#1f1f1f',
        color: '#fff',
      }
    });
  }, [videoUrl]);

  // Archetype toggling helpers
  const handleToggleArchetype = useCallback((id: Archetype) => {
    setSelectedArchetypes(prev => {
      if (prev.includes(id)) {
        return prev.filter(a => a !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleSelectAllArchetypes = useCallback(() => {
    setSelectedArchetypes(['hype', 'witty', 'curious', 'skeptical', 'wholesome']);
  }, []);

  const handleDeselectAllArchetypes = useCallback(() => {
    setSelectedArchetypes([]);
  }, []);

  // Generate batch comments simulation
  const handleGenerate = useCallback(async () => {
    if (!contextText && !videoUrl) {
      setErrorMsg('Please provide either video context or a post URL.');
      toast.error('Missing context', {
        description: 'Provide video context or a post URL to generate comments.',
        style: {
          background: '#0a0a0a',
          borderColor: '#1f1f1f',
          color: '#fff',
        }
      });
      return;
    }
    if (selectedArchetypes.length === 0) {
      setErrorMsg('Please select at least one voice archetype.');
      toast.error('No archetypes selected', {
        description: 'You must select at least one archetype from the panel.',
        style: {
          background: '#0a0a0a',
          borderColor: '#1f1f1f',
          color: '#fff',
        }
      });
      return;
    }
    
    setErrorMsg('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contextText,
          videoUrl,
          selectedArchetypes,
          commentsPerArchetype,
          lowercase,
          addImperfections,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to generate comments.');
      }

      if (data.success && Array.isArray(data.comments)) {
        setComments(data.comments);
        toast.success('Generated comments successfully', {
          description: `Seeded ${data.comments.length} engagement comments.`,
          style: {
            background: '#0a0a0a',
            borderColor: '#1f1f1f',
            color: '#fff',
          }
        });
      } else {
        throw new Error('Invalid response structure from generation engine.');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to generate comments.';
      setErrorMsg(errMsg);
      toast.error('Generation failed', {
        description: errMsg,
        style: {
          background: '#0a0a0a',
          borderColor: '#1f1f1f',
          color: '#fff',
        }
      });
    } finally {
      setIsGenerating(false);
      startCooldown(10); // 10-second cooldown after every generation attempt
    }
  }, [contextText, videoUrl, selectedArchetypes, commentsPerArchetype, lowercase, addImperfections, startCooldown]);

  // Keyboard shortcut listener (Cmd/Ctrl + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);


  // Individual comment regenerate
  const handleRegenerateComment = useCallback(async (commentId: string) => {
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;

    const targetComment = comments[commentIndex];

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contextText,
          videoUrl,
          selectedArchetypes: [targetComment.archetype],
          commentsPerArchetype: 1,
          lowercase,
          addImperfections,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to regenerate comment.');
      }

      if (data.success && Array.isArray(data.comments) && data.comments.length > 0) {
        setComments(prevComments => {
          const updated = [...prevComments];
          const index = updated.findIndex(c => c.id === commentId);
          if (index !== -1) {
            updated[index] = {
              ...data.comments[0],
              id: commentId // Keep same ID so the UI state remains bound
            };
          }
          return updated;
        });
      } else {
        throw new Error('No comments returned from generation engine.');
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to regenerate comment.';
      toast.error('Regeneration failed', {
        description: errMsg,
        style: {
          background: '#0a0a0a',
          borderColor: '#1f1f1f',
          color: '#fff',
        }
      });
      throw err; // propagate to allow child UI component to stop spinner
    }
  }, [comments, contextText, videoUrl, lowercase, addImperfections]);

  // Copy All comments
  const handleCopyAll = useCallback(async () => {
    if (comments.length === 0) return;
    
    // Format comments grouped by archetype
    const formattedText = ARCHETYPES.map(arch => {
      const archComments = comments.filter(c => c.archetype === arch.id);
      if (archComments.length === 0) return '';
      return `[${arch.name}]\n` + archComments.map(c => `• "${c.text}"`).join('\n');
    }).filter(Boolean).join('\n\n');

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopiedAll(true);
      toast.success('Copied all comments to clipboard', {
        description: 'Formatted and ready to paste.',
        style: {
          background: '#0a0a0a',
          borderColor: '#1f1f1f',
          color: '#fff',
        }
      });
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      toast.error('Failed to copy comments');
      console.error('Failed to copy all: ', err);
    }
  }, [comments]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-neutral-850 selection:text-white relative overflow-hidden">
      {/* Premium ambient glows */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[400px] bg-neutral-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute -top-32 -left-32 size-80 bg-neutral-950/20 rounded-full blur-[80px] pointer-events-none z-0" />
      
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:grid md:grid-cols-12 gap-8 relative z-10">
        {/* Left Side Panel (Controls) */}
        <section className="col-span-12 md:col-span-5 lg:col-span-4 space-y-6 flex flex-col">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">Generator Config</h1>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">Configure inputs and parameter presets for the seeding engine.</p>
          </div>

          <div className="space-y-5 bg-gradient-to-b from-neutral-900/30 via-neutral-950/40 to-neutral-950/20 border border-neutral-900 rounded-xl p-6 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.65)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            
            {/* Context Textarea */}
            <div className="space-y-2">
              <label htmlFor="context-input" className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 block">
                Video Context / Caption
              </label>
              <textarea
                id="context-input"
                rows={4}
                value={contextText}
                onChange={(e) => {
                  setContextText(e.target.value);
                  if (errorMsg && e.target.value) setErrorMsg('');
                }}
                placeholder="Paste video script, transcript, or describe the content..."
                className="w-full text-sm bg-neutral-950 border border-neutral-900 rounded-lg p-3 text-neutral-200 placeholder-neutral-700 focus:border-neutral-750 focus:ring-1 focus:ring-neutral-750 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] resize-y leading-relaxed font-sans focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
              />
            </div>

            {/* Video URL Input */}
            <div className="space-y-2">
              <label htmlFor="url-input" className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 block">
                Social Video URL (Optional)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-500">
                    <Globe className="size-3.5" />
                  </span>
                  <input
                    id="url-input"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      if (errorMsg && e.target.value) setErrorMsg('');
                    }}
                    placeholder="https://tiktok.com/@creator/..."
                    className="w-full text-sm bg-neutral-950 border border-neutral-900 rounded-lg pl-9 pr-3 py-2.5 text-neutral-200 placeholder-neutral-700 focus:border-neutral-750 focus:ring-1 focus:ring-neutral-750 outline-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] font-mono focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchUrl}
                  disabled={!videoUrl || isFetchingUrl}
                  className="px-3.5 rounded-lg border border-neutral-900 bg-neutral-950/80 text-xs font-mono uppercase tracking-wider hover:bg-neutral-900 hover:border-neutral-800 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 text-neutral-300 flex items-center gap-1.5 active:scale-[0.98]"
                >
                  {isFetchingUrl ? (
                    <span className="size-3 border-2 border-neutral-500 border-t-white rounded-full animate-spin" />
                  ) : 'Fetch'}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">Supports TikTok, YouTube, Instagram</p>
            </div>

            {/* Archetype Selector */}
            <ArchetypeSelector 
              selectedArchetypes={selectedArchetypes}
              onToggleArchetype={handleToggleArchetype}
              onSelectAll={handleSelectAllArchetypes}
              onDeselectAll={handleDeselectAllArchetypes}
            />

            {/* Parameter Settings */}
            <OptionsPanel
              commentsPerArchetype={commentsPerArchetype}
              setCommentsPerArchetype={setCommentsPerArchetype}
              lowercase={lowercase}
              setLowercase={setLowercase}
              addImperfections={addImperfections}
              setAddImperfections={setAddImperfections}
            />

            {/* Errors */}
            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Generate Trigger */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || cooldownSeconds > 0}
              className="w-full h-10 rounded-lg bg-gradient-to-b from-white to-neutral-200 text-black font-semibold text-xs hover:from-white hover:to-neutral-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.06)] hover:shadow-[0_0_25px_rgba(255,255,255,0.18)]"
            >
              {isGenerating ? (
                <>
                  <span className="size-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Seeding comments...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <span className="size-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  <span>Wait {cooldownSeconds}s...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5 text-black group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                  <span>Generate Comments</span>
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono text-neutral-500 bg-neutral-100 border border-neutral-250 px-1.5 py-0.5 rounded ml-1.5 group-hover:text-neutral-950 transition-colors duration-300">
                    <span>Ctrl</span><span>+</span><span>Enter</span>
                  </kbd>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Side Panel (Results Output) */}
        <section className="col-span-12 md:col-span-7 lg:col-span-8 flex flex-col min-h-[500px]">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="w-full flex-1"
              >
                <LoadingSkeleton 
                  archetypesCount={selectedArchetypes.length} 
                  commentsCount={commentsPerArchetype} 
                />
              </motion.div>
            ) : comments.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="w-full flex-1 flex"
              >
                <EmptyState onSelectTemplate={handleSelectTemplate} />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 w-full flex-1 flex flex-col"
              >
                {/* Results Header */}
                <div className="flex items-center justify-between border-b border-neutral-900 pb-4 shrink-0">
                  <div>
                    <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
                      <MessageSquare className="size-4 text-neutral-400" />
                      Generated Seed Comments
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      {comments.length} comments generated • Stateless sandbox
                    </p>
                  </div>
                  
                  {/* Copy All Button */}
                  <button
                    onClick={handleCopyAll}
                    className="h-8 px-3 rounded-lg border border-neutral-900 bg-neutral-950/80 hover:bg-neutral-900 hover:border-neutral-800 text-xs text-neutral-300 font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 focus-visible:ring-offset-black active:scale-[0.97]"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="size-3.5 text-emerald-500 animate-in fade-in zoom-in duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                        <span className="text-emerald-400">Copied all!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Results Grid/List */}
                <div className="grid gap-4 flex-1 overflow-y-auto pr-1">
                  {ARCHETYPES.map((arch) => {
                    const archComments = comments.filter(c => c.archetype === arch.id);
                    if (archComments.length === 0) return null;

                    return (
                      <div
                        key={arch.id}
                        className="rounded-xl border border-neutral-900 bg-gradient-to-b from-neutral-950/50 to-neutral-950/20 backdrop-blur-md p-5 space-y-3 relative overflow-hidden group/card hover:border-neutral-800 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.55)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      >
                        {/* Archetype Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm select-none" role="img" aria-label={arch.name}>
                              {arch.emoji}
                            </span>
                            <span className="text-xs font-semibold text-white tracking-wide">
                              {arch.name} Archetype
                            </span>
                          </div>
                          <span className="text-xs text-neutral-400 font-mono font-medium">
                            {archComments.length} {archComments.length === 1 ? 'comment' : 'comments'}
                          </span>
                        </div>

                        {/* Comments List */}
                        <div className="divide-y divide-neutral-900/60">
                          {archComments.map((comment) => (
                            <CommentItem
                              key={comment.id}
                              comment={comment}
                              onRegenerate={handleRegenerateComment}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left select-none">
          <p className="text-[11px] font-mono text-neutral-600">
            © 2026 CommentSeed. Built as a technical showcase. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-neutral-600 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Fully Client-Side Mock Sandbox
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
