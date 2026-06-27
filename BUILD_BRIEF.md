# 🌙 Transit Intelligence — Build Brief for Claude Code

Paste this in at the start. Read it fully before writing any code.

---

## 🌌 Product Vision (the north star)

**Transit Intelligence is not an astrology app. It is a personal operating system for people who live by cycles.**

Astrology, tarot, rituals, journaling, relationships (Orbit), cycle tracking, and AI guidance are all different *lenses on the same life timeline*. The **calendar is the center of the experience** — every feature connects back to time, patterns, and personal history rather than existing as an isolated tool.

Every feature, current or future, must answer one question:

> **"How does this help the user understand what season they're in?"**

## 🎨 App philosophy

Build something that feels as **polished as Apple Calendar and Apple Journal**, while staying emotionally warm and mystical. **Simplicity always beats feature density.** Every screen should feel calm, intentional, and touch-first. When choosing between "more powerful" and "more calm," choose calm.

---

## 0. Rule #0 — the prototype is the source of truth

**The working `index.html` is the spec.** Match its screens, layout, flow, features, and aesthetic. You are not redesigning — you are re-platforming a working app onto Next.js + Supabase so keys live server-side and data syncs. When in doubt, open `index.html` and copy the behavior.

**The only things that change from the prototype:**
1. Structure → **Next.js (App Router)**
2. Storage → **Supabase** instead of `localStorage` (same data shapes, §11)
3. AI calls → **server-side API routes** so the OpenAI key never hits the browser

## 🚫 Do NOT

- redesign layouts
- rename screens
- add extra navigation
- invent new features
- replace existing interactions
- simplify or remove existing flows
- add placeholder / fake astrology
- hardcode dates
- expose API keys to the browser
- create duplicate components

## ♻️ Component rule

If a component already exists, **extend it.** Do not rewrite working components. Do not duplicate components. **Always reuse before creating new ones.**

## 🚫 Never Fake Data

Until live data is connected:
- Use realistic **mock** data, clearly marked as mock.
- **Never** fabricate astrology calculations, planetary positions, or transit timings.
- **Never** fabricate tarot interpretations.
- **Never** present a placeholder AI response as a real one.

Astronomy is math (ephemeris / verified data), never invented by the model.

## ⚡ Performance rules

- **Server Components by default**; Client Components only when interactivity requires it
- Lazy-load heavy calendar views
- Cache astrology calculations (don't recompute the same positions repeatedly)
- **Never block the UI waiting on AI** — stream or show a calm loading state
- Optimistic UI where appropriate

---

## 1. What it is

An AI-powered cosmic platform: precise astrology, tarot, rituals, journaling, and an intelligent calendar for everyday life. Personal, single-user to start. iOS-first (390×844, standalone PWA).

## 2. Stack

- **Next.js** (App Router, TypeScript)
- **Supabase** — Postgres + auth + storage
- **OpenAI** — `gpt-4o-mini` for text + vision
- **Vercel** — hosting
- Keep it lightweight; the prototype is hand-rolled CSS.

## 3. 📁 Folder architecture (lock this)

```
app/
components/
features/
    calendar/
    tarot/
    rituals/
    journal/
    orbit/
lib/
services/
hooks/
types/
supabase/
docs/        # project memory (see §10)
```

## 4. Design system (match the prototype)

- **Light / iOS aesthetic.** App bg `#F2F2F7`, cards white `#FFFFFF`, text `#1C1C1E`.
- **Accent gold** `#A8842F`. Font **DM Sans**. Editorial, generous whitespace, minimal chrome.
- **Splash:** bg `#F2F2F7`, serif (Georgia) title (bold + italic), gold ✦☽✦, gold rule, tracked "as above · so below", fades out. *(Wordmark is currently "Cosmic Calendar" in the prototype — keep or switch to "Transit Intelligence", your call. Flag it; don't silently change it.)*
- Rounded cards, soft shadows, one accent, no clutter. **First screen = sky card → Today's events → month grid → Up Next.** Nothing else.

## 5. Screens (4 bottom-nav tabs)

**📅 Calendar** — sky card (moon phase/sign/% lit) → **Today** agenda (today's events + "+ Event") → month grid (event dots + toggleable cycle-color tints) → "Up Next". Tap a **day number** → sheet with that day's events + "+ New Event" (no health logging here — intentional). Top-right: **📅 Calendars manager** (create/rename/recolor/hide/delete; built-in non-deletable **Cycle** + **Links** layers) and **⚙️ Settings**. Calendars are toggleable layers; cycle colors show only when the Cycle layer is visible.

**🕸️ Orbit** (birth-chart CRM) — alphabetized contacts. Per person: **Contact** (socials, status, red/green flags, the ick, intel, private "log a link 🔥" w/ unprotected flag + history), **Chart** (natal wheel + placements), **📊 Meter** (5 draggable compatibility sliders + auto Overall), **Synastry** (auto-computed from both natals), **Composite**, **Journal**. Logging a link saves privately to the contact AND drops a discreet entry on the **Links** layer.

**🔮 Grimoire** — **Journal** (the 📸 AI spread reader §8, reflection journal, and the reading/pull history the AI learns from), **Tarot** (cheat sheet + spread library; *queued: element-block restructure on an astrological baseline + polarity-axis section*), **Workings** (ritual library, each step explained).

**✅ Reminders** — to-do list (overdue/today/upcoming/done).

## 6. Auth

Supabase auth, single-user to start. Bake a `user_id` column into **every** table from day one so multi-account is free later.

## 7. Data model (Supabase) — mirrors the prototype's storage keys

`events`(date,title,start,end,all_day,repeat,cal_id,note) · `calendars`(name,color,hidden,is_cycle,is_links) · `people`(name,role,pronoun,category,sun_date,accent,visible,planets jsonb) · `person_edits`(person_id,fields jsonb) · `links`(person_id,date,unprotected) · `compat`(person_id,finances,communication,home,career,longterm) · `readings`(date,question,interp,scan jsonb,image_url) · `reflections`(date,text) · `tarot_pulls`(spread_id,date,interp) · `cycle_setup`(start_date,cycle_len,period_len) · `reminders`(text,due,done). Every table gets `id` + `user_id`. Seed `people` + `events` from the prototype's verified data verbatim.

## 8. AI architecture (server-side only)

All OpenAI calls go through Next.js route handlers. `OPENAI_API_KEY` is server-only — never `NEXT_PUBLIC_`.
- **`POST /api/read-spread`** — base64 image + optional question + last ~8 readings (history). `gpt-4o-mini` vision. Returns the layered reading. Use the §9 prompt verbatim.
- **`POST /api/draft-event`** — text drafting for calendar/event readings (calendar mode, §9).
Every reading saves to `readings`; the last 8 feed each new read so the voice clocks patterns across time.

## 9. THE VOICE (locked — do not "improve")

One personality, two modes (sky + tarot). The friend who's studied this for years and explains it so it instantly clicks. Texts her smartest friend, **not** TikTok. Mystical-not-fluffy, strategic-not-preachy, teaches *why*, notices the pattern first, humor as seasoning. Astrology + tarot are **real** — never hedge, never fear-monger, never "the universe wants," never fortune-cookie, never gatekeep, never fake certainty (hold both contexts: "if it's an ex… / if it's work…").

**Tarot mode system prompt (verbatim):**
> You are Transit Intelligence — one astrology + tarot bestie, two modes (sky readings and tarot). Right now you're reading a tarot spread from a photo. WHO YOU ARE: the friend who's studied astrology and tarot for years and explains it so it instantly clicks. Warm, witty, emotionally intelligent, confident — never preachy, never talking down, never gatekeeping. You text your smartest friend; you are NOT TikTok. Astrology and tarot are REAL — never hedge with "the cards suggest" or "may," never fear-monger, never "the universe wants," never fortune-cookie. HOW YOU READ — always layer it, in this exact order, with these headers: 🃏 The Card(s) — name the cards you can see; teach the symbolism, upright vs reversed when it matters. 🔮 In Your Reading — connect the cards to each other and their positions; say WHY you're reading it this way. 🕸️ The Pattern — notice the pattern FIRST: majors stacking, suit majorities, repeats, directions, sister-sign polarity axes. 📚 Bestie Explains — sneak in ONE genuine concept so she leaves smarter. ✨ Strategist's Note — end on ONE punchy, concrete, screenshot-worthy move. RULES: pattern before details; never fake certainty (hold both contexts); teach exactly one real concept; humor is seasoning not the meal; talk directly to her ("you"); keep it tight; end on momentum; if reading history is provided, clock genuine recurring patterns only if real.

**Calendar mode** — same voice, structured: **Current Energy** → **What This Activates** → **Best Use** → **Watch For** → **✨ Strategist's Note** (one concrete move). The `✨ Strategist's Note` is the signature — the line users screenshot.

## 10. 📚 docs/ — project memory

Create and maintain these so decisions survive across sessions:
```
docs/
├── DESIGN_SYSTEM.md   # tokens, components, spacing
├── DATABASE.md        # schema + relationships
├── AI_PROMPTS.md      # the locked voice (§9) lives here too
├── ROADMAP.md         # what's next
├── DECISIONS.md       # why we chose X over Y
└── CHANGELOG.md       # what changed each session
```
Update `DECISIONS.md` and `CHANGELOG.md` at the end of every build step.

## 11. Astrology math (server-side)

**Astronomy Engine** (Don Cross, MIT, pure JS) on the server for moon phase, planetary positions, and computing new natal charts from birth data. User never manages it. Verified data + existing natal charts are authoritative — never invent degrees or dates.

## 12. Laws

Astrology/tarot = real, zero hedging · astronomy = math, never invented · cycle tracking is its own toggleable layer, never a focal-point health flow · link logging lives on the contact (private), surfaces only as the toggleable Links layer · child-safe, single-user-personal privacy posture.

---

## 🏗️ Build order (UI before AI — test against a real interface)

1. **Initialize** the Next.js project + folder structure (§3) + design tokens + splash
2. **Recreate the UI** from `index.html` faithfully — the 4-tab shell + every screen's layout (mock data, clearly marked)
3. **Supabase auth**
4. **Database schema** (§7) + seed people/events
5. **Calendar logic** (sky card, Today, grid, day sheet, Calendars manager, cycle layer)
6. **Tarot AI** (`/api/read-spread` + spread reader UI + reading history)
7. **Transit AI** (`/api/draft-event` + calendar-mode voice)
8. **Journal**
9. **Orbit**
10. **Deploy to Vercel** (push → import → env vars → ship)

**Build straight through all 10 steps — do not stop to check in between steps.** Keep moving; only pause if something is genuinely blocking (a missing key, a decision that can't be inferred from the prototype).

**Before any app code:** create a GitHub milestone **`MVP`** with an issue per major feature — Authentication, Calendar, Today, Tarot, Journal, Orbit, Settings, AI Guidance, Deployment — so there's a shared checklist instead of relying on chat history.

**Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY` (server-only).

---

*The prototype is the source of truth. Build it to run on localhost first. Every feature answers: "what season is the user in?" 🌙*
