# 🌙 Transit Intelligence

> An AI-powered cosmic platform combining precise astrology, tarot, rituals, journaling, and an intelligent calendar designed for everyday life.

Your astrology + tarot bestie — one voice, two modes. She reads the sky and she reads your spreads, she remembers your history, and she tells you what the energy is *actually* doing. Mystical without the fluff. Strategic without the lecture.

---

## ✨ What it does

- **🗓️ Intelligent calendar** — sabbats, moons, retrogrades, ingresses, eclipses, and the transits hitting *your* chart, as toggleable layers
- **🔮 AI spread reader** — snap a photo of a tarot spread and get it read in your voice: the cards, the pattern, one real concept taught, and a `✨ Strategist's Note` to act on
- **🃏 Grimoire** — tarot cheat sheets, polarity axes, spreads, and rituals
- **🕸️ Orbit** — a birth-chart CRM for the people in your life: synastry, composites, compatibility meters, and private link logs
- **🩸 Cycle tracking** — auto-populates your period, fertile window, and ovulation as its own calendar layer
- **📓 Journal** — readings, reflections, and a reader's-scan checklist, all saved as history the AI learns from

## 🧠 The voice

One personality across the whole app: warm, witty, emotionally intelligent. Teaches *why*, notices the pattern first, never fear-mongers, never fakes certainty. Texts you like your smartest friend who happens to have your chart pulled up.

---

## 🛠️ Stack

- **Next.js** (App Router) — frontend + server-side API routes
- **Supabase** — database, auth, storage
- **OpenAI** — the AI voice (text + vision for spread reading)
- **Vercel** — hosting

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

### Environment variables

Create `.env.local` (never commit it — `.gitignore` already blocks it):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=sk-...        # server-side only, never exposed to the browser
```

The Supabase URL + anon key are meant to be public. The **OpenAI key stays server-side** — all AI calls route through Next.js API routes so the key never reaches the browser.

## ☁️ Deploy

1. Push to GitHub (private)
2. Import the repo at [vercel.com](https://vercel.com) → New Project
3. Add the env vars above under **Settings → Environment Variables**
4. Deploy — every push auto-redeploys

---

*as above · so below* 🌙
