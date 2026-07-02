# Product Requirements Document: Creator Intelligence

**Product:** Creator Intelligence (v2)
**Previous Version:** CommentSeed (v1)
**Author:** Udayjot Singh Ghatoura
**Status:** Draft — In Planning
**Date:** July 2026

---

## 1. Overview

Creator Intelligence is the evolution of CommentSeed into a full-spectrum AI platform for content creators and social media teams. Where CommentSeed solved a single narrow problem (generating realistic engagement comments), Creator Intelligence addresses the broader creative workflow — from content ideation and captioning to engagement strategy and audience psychology.

The product name reflects the positioning shift: from a utility tool to an intelligence layer that helps creators think, write, and engage smarter.

---

## 2. Problem Statement

Content creators and social media teams face three compounding problems:

1. **Content ideation fatigue** — the pressure to post consistently leads to creative burnout and declining originality.
2. **Engagement asymmetry** — platforms reward early engagement, but authentic early comments are hard to generate at speed without sounding robotic.
3. **Platform fragmentation** — TikTok, Instagram, YouTube, and X have distinct comment cultures, caption styles, and audience behaviors that require platform-native voice, not generic output.

CommentSeed (v1) addressed only problem #2, and only partially. Creator Intelligence addresses all three with a unified interface.

---

## 3. Goals

- Expand from comment generation to a **multi-surface creator intelligence** platform.
- Maintain the core strength of v1: realism, speed, and platform-native tone.
- Introduce **platform context awareness** — outputs calibrated for TikTok vs. YouTube vs. Instagram vs. X.
- Design for **creator workflow integration**, not just point-in-time generation.
- Keep the tool fast, minimal, and opinionated — not a bloated Swiss Army knife.

### Non-Goals (v2)
- No direct social platform API posting integration (v3 consideration).
- No user accounts or persistent history (still stateless for v2).
- No mobile app (web-first).

---

## 4. Target User

**Primary:** Solo content creators (100k–1M followers) who produce short-form video content and manage their own social presence.

**Secondary:** Small content teams at DTC brands or agencies managing multiple creator accounts.

**Expanded from v1:** v1 targeted a hypothetical content team for demo purposes. v2 is designed as a real product for real creators.

---

## 5. Core Features (v2)

### 5.1 Comment Generation (Evolved from v1)
- Retained from v1 with improvements.
- Add **platform-specific tone calibration**: TikTok comments vs. YouTube comments vs. Instagram comments vs. X replies differ meaningfully in style, length, and energy.
- Add **niche/genre context**: Gaming, beauty, finance, fitness — each has its own comment culture.
- Increase archetype count or allow custom archetype creation.

### 5.2 Caption Generator
- Given a content description or video concept, generate platform-optimized captions.
- Controls: platform target, length (hook-only vs. full caption), CTA inclusion, hashtag style.
- Tone: matches existing archetype system — casual, authoritative, relatable, educational.

### 5.3 Hook Generator
- Generate 5–10 opening hooks for a given video concept.
- Optimized for attention retention (first 1–3 seconds of a video).
- Formats: question hook, statement hook, controversy hook, pattern interrupt.

### 5.4 Content Brief Generator
- Input: broad topic or trend.
- Output: structured content brief — angle, hook, key points, call to action, ideal platform, estimated audience response.

### 5.5 Audience Psychology Layer _(stretch goal)_
- Analyze a piece of content and return a breakdown of likely audience reactions by sentiment segment.
- Useful for predicting comment distribution before posting.

---

## 6. User Flow (v2)

1. User opens Creator Intelligence.
2. User selects a **workflow mode**: Comments / Captions / Hooks / Brief.
3. User provides content context (text description, caption, or URL).
4. User configures platform, tone, and output preferences.
5. App generates output in a structured, editable card UI.
6. User can regenerate, copy, or export the batch.

---

## 7. Technical Architecture (v2)

- **Frontend:** Next.js 15+ (App Router), React 19, TypeScript — same foundation as v1.
- **Styling:** Tailwind CSS v4 + shadcn/ui — same as v1, extended design system.
- **Backend:** Next.js API routes — expanded route surface (`/api/comments`, `/api/captions`, `/api/hooks`, `/api/brief`).
- **Model:** Groq API (primary) — evaluate Claude or GPT-4o for quality comparison on certain surfaces.
- **State:** Still stateless for v2. Session state on client. (Evaluate persistence in v3.)
- **Hosting:** Vercel — same as v1.

---

## 8. Design Direction

Creator Intelligence should feel meaningfully different from CommentSeed visually:

- **Brand shift:** From utility/tool aesthetic → intelligence platform aesthetic.
- **Darker, richer UI** — deep backgrounds, subtle gradients, premium feel.
- **Multi-mode navigation** — clear top-level switching between workflow modes.
- **Retained:** Speed, minimal chrome, no clutter. Still tool-first, not dashboard-first.

---

## 9. Open Questions

- [ ] Should v2 introduce platform presets (TikTok mode / YouTube mode / Instagram mode) as a first-class concept, or keep it as a dropdown parameter?
- [ ] How many workflow modes ship in v2 vs. being saved for v3?
- [ ] Should custom archetypes (user-defined voice profiles) ship in v2?
- [ ] Is there a value in showing a live preview of how a comment would look in a real platform's comment UI?

---

## 10. Success Metrics (v2)

- All v1 functionality retained and improved.
- At least 2 new workflow modes (Captions + Hooks) functional end-to-end.
- Platform-specific tone calibration demonstrably different in output quality vs. v1.
- UI feels like a step-change upgrade from CommentSeed — premium, polished, purposeful.

---

## 11. Future Considerations (v3+)

- Social platform API integration (TikTok, YouTube, Instagram) for direct posting.
- User accounts + saved comment batches / content history.
- Analytics: track which archetypes/hooks perform best (requires posting integration).
- Multi-language support.
- Team collaboration features.
