export type Archetype = 'hype' | 'witty' | 'curious' | 'skeptical' | 'wholesome';

export interface ArchetypeConfig {
  id: Archetype;
  name: string;
  description: string;
  emoji: string;
  examples: string[];
}

export interface Comment {
  id: string;
  archetype: Archetype;
  text: string;
}

export interface GeneratorConfig {
  contextText: string;
  videoUrl: string;
  selectedArchetypes: Archetype[];
  commentsPerArchetype: number;
  lowercase: boolean;
  addImperfections: boolean;
}
