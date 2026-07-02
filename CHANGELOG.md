# Changelog

All notable changes to this project are documented here.

---

## [v1.0.0] — 2026-07-02 · CommentSeed

**Stable release of CommentSeed.** First production-ready version of the AI comment generation tool.

### Features shipped in v1
- **5 comment archetypes** — Hype 🔥, Witty, Curious, Skeptical, Wholesome
- **Parallel LLM generation** — fan-out Groq API calls per archetype for fast batch output
- **Realism post-processing** — enforces lowercase, natural imperfections, length variation, strips AI-sounding openers
- **Per-comment regeneration** — re-roll any individual comment independently
- **Copy to clipboard** — per-comment and copy-all
- **In-memory rate limiting** — 10 req/min per IP (token bucket)
- **Stateless architecture** — no database, no auth; all session state on the client
- **Vercel deployment** — live demo hosted on Vercel with server-side API key handling

### Tech stack
- Next.js 15, React 19, TypeScript
- Tailwind CSS v4, shadcn/ui, Framer Motion
- Groq API (Llama 4 Scout / Llama 3.3 70B)

---

## [v2.0.0] — In Development · Creator Intelligence

**Major evolution.** CommentSeed becomes Creator Intelligence — a broader platform for AI-powered creator content operations.

> See [PRD-CreatorIntelligence.md](./PRD-CreatorIntelligence.md) for the full v2 requirements.

_Changelog entries will be added as features ship._
