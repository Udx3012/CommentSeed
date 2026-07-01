import { Archetype, Comment } from '@/types';
import { postProcessComment } from '@/lib/postprocess';

// Keyword-based templates for realistic context matching
const TEMPLATES: Record<string, Record<Archetype, string[]>> = {
  tech: {
    hype: [
      "nah this is actually next level 🔥",
      "bro cooked with this one, actual gamechanger",
      "omg i need this setup immediately 💻",
      "this is insanely clean fr!!",
      "finally someone solved this!! absolute chef's kiss",
      "wait this is so good?? drop the repo link!"
    ],
    witty: [
      "my last two brain cells trying to compile this",
      "instructions unclear, accidentally deleted production db",
      "bro is coding in 2035 while we're stuck in notepad",
      "developer: it works on my machine. *the machine:*",
      "another package for my node_modules to ignore",
      "bold of you to assume my code has no bugs"
    ],
    curious: [
      "wait, what framework did you use for the dashboard?",
      "does this support dark mode out of the box?",
      "how do you handle the state management for this scale?",
      "is the source code available anywhere to look at?",
      "what's the font you're using in your editor? looks clean",
      "how does this perform compared to native solutions?"
    ],
    skeptical: [
      "looks super clean but will it scale past 100 users?",
      "feels like another wrapper wrapper ngl",
      "cool demo but now show it running on mobile safari",
      "is this actually faster or just styled nicely?",
      "looks cool but the pricing is probably insane",
      "security audit is going to have a field day with this"
    ],
    wholesome: [
      "honestly so glad i found this, super helpful tutorial",
      "your explanation style is so clean, keep it up!",
      "this deserves way more reach. thanks for sharing!",
      "been struggling with this for hours, you saved my night",
      "really appreciate the step-by-step breakdown",
      "such a gem of a video, subscribed instantly!"
    ]
  },
  fitness: {
    hype: [
      "absolutely insane physique bro!! 🚀",
      "pure motivation right here, let's gooo 🔥",
      "the intensity is off the charts!",
      "bro is lifting the whole gym at this point",
      "lightweight baby!! 💪💪",
      "nah this form is immaculate"
    ],
    witty: [
      "my muscles are sore just watching this",
      "me watching this while eating a family size bag of chips",
      "bro's warmup is my max lift for the year",
      "gravity left the chat during that lift",
      "my joints clicked in three different languages watching this",
      "the weights are begging for mercy"
    ],
    curious: [
      "what's the song in the background? goes hard",
      "do you recommend this split for beginners too?",
      "how long did it take to build up to that max?",
      "what's your pre-workout stack looking like?",
      "how many times a week do you train shoulders?",
      "any tips for avoiding elbow pain on these?"
    ],
    skeptical: [
      "great lift but that locking out at the top makes me nervous",
      "is this natural progression or is there a secret sauce?",
      "definitely felt some lower back action in that rep",
      "impressive but is this safe for long term joints?",
      "looks heavy but the depth was a bit short ngl",
      "why not just use dumbbells for better range of motion?"
    ],
    wholesome: [
      "the consistency is paying off big time, congrats!",
      "really love how positive your fitness journey is",
      "thanks for showing the struggles too, not just the wins",
      "such a humble champion, always supporting others",
      "motivated me to not skip my workout today, thank you!",
      "you're an inspiration to so many of us starting out"
    ]
  },
  relatable: {
    hype: [
      "OMG THIS IS SO TRUE 😭",
      "never related to a video more in my life",
      "i'm screaming at how accurate this is!!",
      "lmaoo this is sending me 💀💀",
      "literally sent this to the group chat immediately",
      "the ending caught me completely off guard 😂"
    ],
    witty: [
      "i feel personally attacked by this video",
      "are we all living the exact same life or what?",
      "my FBI agent is watching this and nodding in agreement",
      "who gave you permission to film my daily routine?",
      "i am in this video and i don't like it",
      "my therapist is going to hear about this post"
    ],
    curious: [
      "wait, does everyone's office do this or is it just mine?",
      "where did you get that mug at the beginning?",
      "is there a part 2 coming? need to see what happened",
      "how did you film this without laughing?",
      "anyone else notice that background detail at 0:12?",
      "what's the name of this specific trend?"
    ],
    skeptical: [
      "am i the only one who doesn't relate to this at all?",
      "this feels slightly staged but still funny i guess",
      "surely people don't actually act like this in real life?",
      "funny video but that's not how it works at all",
      "this is just a remake of that other viral clip",
      "seems like a lot of effort for a 5 second joke"
    ],
    wholesome: [
      "made me smile so much, needed this today!",
      "your videos always bring such a good vibe",
      "so comforting to know we all experience this",
      "honestly love your sense of humor so much",
      "this is the most wholesome thing on my feed today",
      "thanks for making me laugh after a stressful day"
    ]
  },
  general: {
    hype: [
      "this goes so incredibly hard 🔥🔥",
      "obsessed with how this turned out!",
      "wow this is absolutely stunning",
      "insane edit and clean shots!",
      "this deserves to go viral immediately",
      "bro cooked, simple as that"
    ],
    witty: [
      "bro won the internet today",
      "rent free. this is living in my head rent free.",
      "i can't stop replaying this, help",
      "well, there goes my afternoon productivity",
      "the algorithm actually did something right for once",
      "i wasn't expecting to be this invested"
    ],
    curious: [
      "how did you edit that transition? looks seamless",
      "what camera was this shot on? colors are nice",
      "where is this location? looks beautiful",
      "can we get a tutorial on how you made this?",
      "what's the song ID? search isn't finding it",
      "how long did this take to film and compile?"
    ],
    skeptical: [
      "looks cool but feels a bit over-edited",
      "is this real or is there some heavy filter action?",
      "i feel like the behind the scenes is much messier",
      "cool concept but the execution is a bit rushed",
      "not sure how to feel about this one tbh",
      "looks nice, let's see how it holds up in a week"
    ],
    wholesome: [
      "this is so beautiful, thank you for sharing!",
      "honestly love the peaceful vibe of this video",
      "you can see the passion that went into making this",
      "this just made my evening so much better",
      "such creative talent, keep up the amazing work!",
      "really appreciate the positivity in this post"
    ]
  }
};

// Simple keyword detector
function detectCategory(text: string, url: string): keyof typeof TEMPLATES {
  const combined = (text + " " + url).toLowerCase();
  
  if (
    combined.includes("code") ||
    combined.includes("dev") ||
    combined.includes("software") ||
    combined.includes("saas") ||
    combined.includes("react") ||
    combined.includes("nextjs") ||
    combined.includes("programmer") ||
    combined.includes("tech") ||
    combined.includes("app") ||
    combined.includes("vscode") ||
    combined.includes("database") ||
    combined.includes("coding") ||
    combined.includes("git")
  ) {
    return "tech";
  }

  if (
    combined.includes("gym") ||
    combined.includes("workout") ||
    combined.includes("fitness") ||
    combined.includes("lift") ||
    combined.includes("diet") ||
    combined.includes("bodybuilding") ||
    combined.includes("muscle") ||
    combined.includes("protein") ||
    combined.includes("squat") ||
    combined.includes("bench") ||
    combined.includes("training")
  ) {
    return "fitness";
  }

  if (
    combined.includes("relatable") ||
    combined.includes("funny") ||
    combined.includes("me when") ||
    combined.includes("office") ||
    combined.includes("corporate") ||
    combined.includes("pov") ||
    combined.includes("lmao") ||
    combined.includes("joke") ||
    combined.includes("humor") ||
    combined.includes("lifestyle") ||
    combined.includes("room tour")
  ) {
    return "relatable";
  }

  return "general";
}

// Helper styling is handled via reusable post-processing layer

export function generateMockComments(
  contextText: string,
  videoUrl: string,
  archetypes: Archetype[],
  commentsPerArchetype: number,
  lowercase: boolean,
  addImperfections: boolean
): Comment[] {
  const category = detectCategory(contextText, videoUrl);
  const categoryTemplates = TEMPLATES[category];
  const results: Comment[] = [];

  archetypes.forEach(archetype => {
    const templates = categoryTemplates[archetype];
    
    // Shuffle and pick templates
    const shuffled = [...templates].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(commentsPerArchetype, shuffled.length); i++) {
      const originalText = shuffled[i];
      const processedText = postProcessComment(originalText, { lowercase, addImperfections, archetype });
      
      results.push({
        id: `${archetype}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        archetype,
        text: processedText
      });
    }
  });

  return results;
}
