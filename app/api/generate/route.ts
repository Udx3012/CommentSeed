import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { Archetype, Comment } from '@/types';
import { getSystemPrompt, getUserPrompt } from '@/lib/prompts';
import { postProcessComment, normalizeBatchEmojis, deduplicateComments } from '@/lib/postprocess';

// Per-IP rate limit: 5 requests per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Global daily cap: 50 requests total across all IPs (resets at midnight UTC)
// This is the primary abuse-prevention layer for a public demo on serverless,
// where per-IP in-memory state can reset on cold starts.
let globalDailyCount = 0;
let globalDayKey = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
const GLOBAL_DAILY_LIMIT = 50;

function checkGlobalDailyLimit(): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== globalDayKey) {
    // New UTC day — reset the counter
    globalDayKey = today;
    globalDailyCount = 0;
  }
  if (globalDailyCount >= GLOBAL_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  globalDailyCount += 1;
  return { allowed: true, remaining: GLOBAL_DAILY_LIMIT - globalDailyCount };
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    const newRecord = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(ip, newRecord);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, reset: newRecord.resetTime };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, reset: record.resetTime };
}

export async function POST(request: NextRequest) {
  // 1a. Global daily cap check (primary abuse-prevention for public demo)
  const globalLimit = checkGlobalDailyLimit();
  if (!globalLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Daily Limit Reached',
        message: 'This demo has reached its daily request limit. Please check back tomorrow.',
      },
      { status: 429 }
    );
  }

  // 1b. Per-IP rate limit: 5 requests per minute
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const rateLimit = checkRateLimit(ip);

  const headers = new Headers({
    'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': rateLimit.reset.toString(),
    'X-RateLimit-Daily-Remaining': globalLimit.remaining.toString(),
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too Many Requests', message: 'Slow down — you can generate up to 5 times per minute. Try again shortly.' },
      { status: 429, headers }
    );
  }

  // 2. Validate GROQ_API_KEY presence
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY environment variable is missing.');
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: 'API credentials are not configured.' },
      { status: 500, headers }
    );
  }

  // 3. Request Body Input Validation
  interface GenerateRequest {
    contextText?: string;
    videoUrl?: string;
    selectedArchetypes?: Archetype[];
    commentsPerArchetype?: number;
    lowercase?: boolean;
    addImperfections?: boolean;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Bad Request', message: 'Invalid JSON request payload.' },
      { status: 400, headers }
    );
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { success: false, error: 'Bad Request', message: 'Request payload must be a JSON object.' },
      { status: 400, headers }
    );
  }

  const payload = body as GenerateRequest;
  const contextText = payload.contextText;
  const videoUrl = payload.videoUrl;
  const selectedArchetypes = payload.selectedArchetypes;
  const commentsPerArchetype = payload.commentsPerArchetype ?? 2;
  const lowercase = payload.lowercase ?? true;
  const addImperfections = payload.addImperfections ?? true;

  if (!contextText && !videoUrl) {
    return NextResponse.json(
      { success: false, error: 'Validation Error', message: 'Either contextText or videoUrl must be provided.' },
      { status: 400, headers }
    );
  }

  if (!Array.isArray(selectedArchetypes) || selectedArchetypes.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Validation Error', message: 'selectedArchetypes must be a non-empty array.' },
      { status: 400, headers }
    );
  }

  // Validate archetypes
  const validArchetypes: string[] = ['hype', 'witty', 'curious', 'skeptical', 'wholesome'];
  const invalidArchetypes = selectedArchetypes.filter((arch) => typeof arch !== 'string' || !validArchetypes.includes(arch));
  if (invalidArchetypes.length > 0) {
    return NextResponse.json(
      { success: false, error: 'Validation Error', message: `Invalid archetypes detected: ${invalidArchetypes.join(', ')}` },
      { status: 400, headers }
    );
  }

  if (typeof commentsPerArchetype !== 'number' || commentsPerArchetype < 1 || commentsPerArchetype > 5) {
    return NextResponse.json(
      { success: false, error: 'Validation Error', message: 'commentsPerArchetype must be a number between 1 and 5.' },
      { status: 400, headers }
    );
  }

  // 4. Initialize Groq Client
  const groq = new Groq({ apiKey });
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  try {
    const generationPromises = selectedArchetypes.map(async (archetype) => {
      const systemPrompt = getSystemPrompt(archetype, commentsPerArchetype, lowercase, addImperfections);
      const userPrompt = getUserPrompt(contextText || '', videoUrl || '', archetype, commentsPerArchetype);

      try {
        const chatCompletion = await groq.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8
        });

        const content = chatCompletion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        const commentStrings: string[] = Array.isArray(parsed.comments) ? parsed.comments : [];

        return commentStrings.map((text, index) => {
          const styledText = postProcessComment(text, { lowercase, addImperfections, archetype });
          return {
            id: `${archetype}-${index}-${Math.random().toString(36).substring(2, 11)}`,
            archetype,
            text: styledText
          } as Comment;
        });
      } catch (err) {
        console.error(`Error fanning out generation for archetype: ${archetype}`, err);
        return []; // Resilient fallback: return empty array for this archetype instead of crashing the entire request
      }
    });

    const results = await Promise.all(generationPromises);
    let comments = results.flat();

    // Apply batch de-duplication and emoji normalization
    comments = deduplicateComments(comments);
    comments = normalizeBatchEmojis(comments);

    // 6. Return Structured JSON Response
    return NextResponse.json({ success: true, comments }, { status: 200, headers });
  } catch (error) {
    console.error('Error generating comments:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during comment generation.';
    return NextResponse.json(
      { success: false, error: 'Generation Failed', message: errorMessage },
      { status: 500, headers }
    );
  }
}
