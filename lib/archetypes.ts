import { ArchetypeConfig } from '@/types';

export const ARCHETYPES: ArchetypeConfig[] = [
  {
    id: 'hype',
    name: 'Hype',
    description: 'High energy, short, and emoji-heavy to build initial excitement.',
    emoji: '🔥',
    examples: ['bro cooked with this one ngl', 'this is actually next level 🚀']
  },
  {
    id: 'witty',
    name: 'Witty',
    description: 'Clever one-liners, platform-native memes, or sarcastic humor.',
    emoji: '⚡',
    examples: ['bro is playing chess while we are playing checkers', 'instructions unclear, deleted prod db']
  },
  {
    id: 'curious',
    name: 'Curious',
    description: 'Asks a natural question about the video content to start discussions.',
    emoji: '🤔',
    examples: ['wait, what tool did you use for the layout?', 'does this work on windows too?']
  },
  {
    id: 'skeptical',
    name: 'Skeptical',
    description: 'Constructive doubt or "wait really?" energy to provoke engagement.',
    emoji: '🤨',
    examples: ['looks clean but does this scale?', 'security audit is going to be fun']
  },
  {
    id: 'wholesome',
    name: 'Wholesome',
    description: 'Supportive, positive, and encouraging remarks to build goodwill.',
    emoji: '✨',
    examples: ['honestly so glad I found this channel', 'appreciate the clean breakdown, keep going!']
  }
];
