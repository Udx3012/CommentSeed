# CommentSeed → Creator Intelligence

> **v1 (CommentSeed) is stable and tagged.** Active development has moved to **v2 — Creator Intelligence**.

---

## CommentSeed (v1) — Stable

AI-powered social comment generator for short-form video content. Given a content description or video URL, it produces a batch of varied comments across five voice archetypes, styled to match real platform comment behavior.

### Features

- **5 comment archetypes** — Hype 🔥, Witty, Curious, Skeptical, Wholesome
- **Parallel generation** — fan-out LLM calls per archetype for fast batch results
- **Realism post-processing** — enforces lowercase, natural imperfections, length variation, strips AI-sounding openers
- **Per-comment regeneration** — re-roll any individual comment without redoing the whole batch
- **Copy to clipboard** — per-comment and copy-all options
- **Rate limiting** — 10 requests/minute per IP (in-memory token bucket)
- **Stateless** — no database, no auth, all session state lives on the client

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui, Radix UI, Framer Motion |
| LLM | Groq API (Llama 4 Scout / Llama 3.3 70B) |
| Hosting | Vercel |

---

## Creator Intelligence (v2) — In Development

Creator Intelligence is the evolution of CommentSeed into a full-spectrum AI platform for content creators. Beyond comment generation, it adds caption writing, hook generation, content briefs, and platform-native tone calibration across TikTok, YouTube, Instagram, and X.

> See [PRD-CreatorIntelligence.md](./PRD-CreatorIntelligence.md) for the full v2 requirements and roadmap.

**Development branch:** `v2/creator-intelligence`

---

## Getting Started (v1)

### 1. Clone the repo

```bash
git clone https://github.com/Udx3012/CommentSeed.git
cd CommentSeed
```

### 2. Checkout the stable v1 tag

```bash
git checkout v1.0.0
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at [console.groq.com/keys](https://console.groq.com/keys).

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

1. User enters a content description or pastes a video URL
2. User selects which archetypes to include (default: all 5, 2 comments each)
3. On submit, the API route fans out parallel Groq LLM calls — one per archetype
4. Each response is post-processed for realism (lowercase, abbreviations, punctuation drop-off)
5. Results render grouped by archetype; individual comments can be regenerated or copied

### API Route

`POST /api/generate`

```json
{
  "contextText": "video about making sourdough bread from scratch",
  "selectedArchetypes": ["hype", "witty", "curious"],
  "commentsPerArchetype": 2,
  "lowercase": true,
  "addImperfections": true
}
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key |
| `GROQ_MODEL` | No | Override the default model (default: `llama-3.3-70b-versatile`) |

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

---

## Disclaimer

This tool is built strictly as a technical demo of AI-driven content generation and tone control. It includes no posting integration with any social platform and is not intended for use in artificially inflating engagement on real content.

---

## License

MIT
