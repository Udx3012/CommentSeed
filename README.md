# CommentSeed

> AI-powered social comment generator for short-form video content.

CommentSeed generates realistic, human-sounding engagement comments for TikTok, Instagram Reels, and YouTube Shorts. Given a content description or video URL, it produces a batch of varied comments across five voice archetypes, styled to match real platform comment behavior, not generic AI output.

Built as a demo to demonstrate applied AI content generation and tone control.

---

## Features

- **5 comment archetypes** — Hype 🔥, Witty, Curious, Skeptical, Wholesome
- **Parallel generation** — fan-out LLM calls per archetype for fast batch results
- **Realism post-processing** — enforces lowercase, natural imperfections, length variation, and strips AI-sounding openers
- **Per-comment regeneration** — re-roll any individual comment without redoing the whole batch
- **Copy to clipboard** — per-comment and copy-all options
- **Rate limiting** — 10 requests/minute per IP (in-memory token bucket)
- **Stateless** — no database, no auth, all session state lives on the client

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui, Radix UI, Framer Motion |
| LLM | Groq API (Llama 4 Scout / Llama 3.3 70B) |
| Hosting | Vercel |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/CommentSeed.git
cd CommentSeed
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and add your Groq API key:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at [console.groq.com/keys](https://console.groq.com/keys).

### 4. Run the development server

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

## Disclaimer

This tool is built strictly as a technical demo of AI-driven content generation and tone control. It includes no posting integration with any social platform and is not intended for use in artificially inflating engagement on real content.

---

## License

MIT
