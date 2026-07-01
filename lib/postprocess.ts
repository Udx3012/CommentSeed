import { Comment, Archetype } from '@/types';

export interface PostProcessOptions {
  lowercase: boolean;
  addImperfections: boolean;
  archetype: Archetype;
}

// Configurable probabilities
const PROBABILITIES = {
  punctuationDrop: 0.70,
  wordShortening: 0.15,
  charRepeating: 0.05,
  slangInjection: 0.10,
  emojiCapRate: 0.10 // Less than 10% of comments should have emojis
};

const WORD_SHORTENINGS: Record<string, string> = {
  "going": "goin",
  "because": "cuz",
  "though": "tho",
  "going to": "gonna",
  "want to": "wanna",
  "something": "somethin",
  "nothing": "nothin",
  "before": "b4",
  "about": "abt",
  "people": "ppl"
};

const REPEATABLE_WORDS = ["so", "nah", "yeah", "cool", "bro", "lol", "wow", "no"];

const ARCHETYPE_SLANG: Record<Archetype, string[]> = {
  hype: ["fr", "ngl", "bro", "rn"],
  witty: ["ngl", "tbh", "lol"],
  curious: ["lowkey", "tbh"],
  skeptical: ["ngl", "lowkey", "tbh"],
  wholesome: ["tbh"] // Very mild, rarely used
};

// Regex to match emojis
const EMOJI_REGEX = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;

/**
 * Main post-processing function for a single comment
 */
export function postProcessComment(text: string, options: PostProcessOptions): string {
  let result = text.trim();

  // 1. Lowercase processing
  if (options.lowercase) {
    result = result.toLowerCase();
  }

  if (!options.addImperfections) {
    // If imperfections are disabled, we only handle lowercase and return
    return result;
  }

  // 2. Trailing punctuation drop (70% chance to drop trailing periods and exclamation marks, NEVER question marks)
  if (result.endsWith('.') || result.endsWith('!')) {
    if (Math.random() < PROBABILITIES.punctuationDrop) {
      result = result.slice(0, -1);
    }
  }

  // Split into words for word-level transformations
  let words = result.split(/\s+/);

  // 3. Word Shortenings & 4. Character Repeating
  words = words.map(word => {
    // Strip punctuation for matching, but preserve it for the final output
    const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const punctuation = word.slice(cleanWord.length);
    let modified = word;

    // Apply word shortening (~15% chance)
    if (WORD_SHORTENINGS[cleanWord] && Math.random() < PROBABILITIES.wordShortening) {
      modified = WORD_SHORTENINGS[cleanWord] + punctuation;
    } 
    // Apply character repeating for emphasis (~5% chance)
    else if (REPEATABLE_WORDS.includes(cleanWord) && Math.random() < PROBABILITIES.charRepeating) {
      const lastChar = cleanWord.slice(-1);
      // Repeat the last character 2-3 times
      const repeats = Math.floor(Math.random() * 2) + 2; 
      modified = cleanWord + lastChar.repeat(repeats) + punctuation;
    }

    return modified;
  });

  result = words.join(' ');

  // 5. Slang injection (~10% chance, avoiding Wholesome comments unless mild)
  const allowedSlang = ARCHETYPE_SLANG[options.archetype] || [];
  if (allowedSlang.length > 0 && Math.random() < PROBABILITIES.slangInjection) {
    // Ensure we don't inject slang if the comment already contains common slang
    const hasExistingSlang = allowedSlang.some(s => result.toLowerCase().includes(s));
    
    if (!hasExistingSlang) {
      const selectedSlang = allowedSlang[Math.floor(Math.random() * allowedSlang.length)];
      
      // Wholesome checks: only allow tbh and keep it natural
      if (options.archetype === 'wholesome') {
        if (selectedSlang === 'tbh' && Math.random() < 0.2) { // Extremely rare for wholesome
          result = `${result}, tbh`;
        }
      } else {
        // Randomly prepend or append based on the slang word
        if (['bro', 'ngl'].includes(selectedSlang) && Math.random() < 0.5) {
          result = `${selectedSlang} ${result}`;
        } else {
          result = `${result} ${selectedSlang}`;
        }
      }
    }
  }

  return result;
}

/**
 * Normalizes emojis across the entire generated comment batch to ensure
 * emoji rate remains below 10% and prevents repetitive emoji blocks.
 */
export function normalizeBatchEmojis(comments: Comment[]): Comment[] {
  // Determine how many comments should have emojis (max 10%)
  const maxEmojiComments = Math.max(1, Math.floor(comments.length * PROBABILITIES.emojiCapRate));
  let currentEmojiCount = 0;

  return comments.map(comment => {
    const hasEmojis = EMOJI_REGEX.test(comment.text);
    if (!hasEmojis) return comment;

    // If we've already exceeded the 10% emoji rate cap, strip emojis from this comment
    if (currentEmojiCount >= maxEmojiComments) {
      return {
        ...comment,
        text: comment.text.replace(EMOJI_REGEX, '').replace(/\s+/g, ' ').trim()
      };
    }

    // Keep emojis but normalize them (limit to max 2 emojis to prevent spam)
    currentEmojiCount++;
    const emojis = comment.text.match(EMOJI_REGEX) || [];
    if (emojis.length > 2) {
      const cleanText = comment.text.replace(EMOJI_REGEX, '');
      const uniqueEmojis = Array.from(new Set(emojis)).slice(0, 2).join('');
      return {
        ...comment,
        text: `${cleanText.trim()} ${uniqueEmojis}`.replace(/\s+/g, ' ').trim()
      };
    }

    return comment;
  });
}

/**
 * Deduplicates generated comments in a batch using Jaccard Similarity.
 * Tweak or slightly modify duplicates to ensure variety.
 */
export function deduplicateComments(comments: Comment[]): Comment[] {
  const processed: Comment[] = [];

  for (const current of comments) {
    let isDuplicate = false;

    for (const completed of processed) {
      if (current.archetype === completed.archetype) {
        const similarity = getJaccardSimilarity(current.text, completed.text);
        if (similarity > 0.6) {
          isDuplicate = true;
          break;
        }
      }
    }

    if (isDuplicate) {
      // Resolve duplicate by making a slight text modification
      let modifiedText = current.text;
      const variations = [
        (t: string) => `lowkey ${t}`,
        (t: string) => `${t} fr`,
        (t: string) => `wait ${t}`,
        (t: string) => t.replace(/\bthe\b/gi, 'teh'), // Add a light typo
        (t: string) => `${t} ngl`
      ];

      // Wholesome comments get custom clean variations
      const wholesomeVariations = [
        (t: string) => `Honestly, ${t.charAt(0).toLowerCase() + t.slice(1)}`,
        (t: string) => `${t}!`,
        (t: string) => `Really ${t.charAt(0).toLowerCase() + t.slice(1)}`
      ];

      const chosenVariations = current.archetype === 'wholesome' ? wholesomeVariations : variations;
      const modifier = chosenVariations[Math.floor(Math.random() * chosenVariations.length)];
      modifiedText = modifier(current.text);

      processed.push({
        ...current,
        text: modifiedText
      });
    } else {
      processed.push(current);
    }
  }

  return processed;
}

/**
 * Calculates Jaccard Similarity between two strings (word level)
 */
function getJaccardSimilarity(str1: string, str2: string): number {
  const clean = (s: string) => 
    s.toLowerCase()
     .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
     .split(/\s+/)
     .filter(Boolean);

  const words1 = new Set(clean(str1));
  const words2 = new Set(clean(str2));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}
