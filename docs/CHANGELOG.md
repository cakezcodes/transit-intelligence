# Changelog

## 2026-07-18 — Information architecture rework (feature tabs → daily-life loop)

Reorganized the app around the user's day instead of its feature list. No new visual identity,
no removed features — this is re-parenting + one synthesizing home + copy/structure reframes.

- **Navigation: 6 → 5 tabs** — `Sky · Life · People · Library · Me`. Record folds into Life.
  Done via the `TAB` map (sub-views re-parent onto their journey tab) + the tab bar; every
  existing `nav` id and render function is preserved.
- **Sky is now a synthesis home.** New `composeToday()` stitches the moon, the plot twist
  (retrograde/void/season), today's tarot pull, the matched working, and people lighting up
  into ONE paragraph ("today's intelligence"), followed by "today's mission" and "today's
  timing" (lean in / hold off). Assembled client-side from existing math and voice-approved
  strings — no new paid AI call (CLAUDE.md rule 2). The old read/expanded cards remain below
  as "dive deeper."
- **Life** = the calendar reframed as a timeline; every day opens its scrapbook
  (`openDayPage`, already built). New **"what happened?"** chooser (`openWhatHappened()`)
  fronts the existing loggers — tarot · ritual · journal · dream · sign · mood · photo ·
  someone · cycle. `openEntry` gained a preset-type arg so dream/sign/mood/photo log directly.
- **Library** (grimoire) reframed as your archive. **People** (orbit) surfaces "lighting up
  today" (shared `peopleLightingUp()`, also feeding Sky).
- **Intelligence engine** — the old "layers" screen, reframed as "what shapes your guidance."
  `LAYERS` regrouped by data source (🌌 sky · 🪞 chart · 👥 relationships · 📖 life · 🌸 body),
  each toggle showing "included in …", plus a live "your guidance is currently built from: …"
  sentence that recomputes as you flip sources. Reached from Me ("intelligence engine") and Life.
- Verified in headless Chromium: all 5 tabs + the chooser + the engine render, the built-from
  line updates on toggle, zero JS errors. `npm run build` compiles.

## 2026-06-25

- Created fresh `transit-intelligence` repo foundation.
- Added `.env.example` for safe environment setup.
- Added `BUILD_BRIEF.md` for Claude Code build guidance.
- Added docs memory folder:
  - `DESIGN_SYSTEM.md`
  - `DATABASE.md`
  - `AI_PROMPTS.md`
  - `ROADMAP.md`
  - `DECISIONS.md`
  - `CHANGELOG.md`
## 2026-07-18

- Re-platformed the v11 prototype onto Next.js (App Router) + Supabase + Vercel-ready structure:
  - `app/` — layout, `/welcome` (create account / sign in), `/app` (the almanac), `/api/reading`.
  - Prototype ported verbatim per Rule #0: CSS → `app/prototype.css`, markup → `features/app/prototypeBody.mjs`, logic → `public/prototype/app.js`, deck art → `public/prototype/img.js`.
- Supabase auth (email + password) gates the app; middleware refreshes sessions and routes signed-out users to `/welcome`.
- AI readings moved server-side: `POST /api/reading` (OpenAI, `OPENAI_API_KEY` server-only, signed-in users only). The locked tarot voice moved verbatim into the route.
- Cloud persistence: new `app_state` table (RLS, one jsonb row per user) shadows the prototype's `S` object — debounced saves, 20s safety flush, flush on tab-hide. Onboarding also upserts birth data to `profiles` (new birth columns).
- Session token now flows into the prototype's Supabase reads, so RLS-locked `natal_positions` loads after sign-in.
- Verified end-to-end in headless Chromium: splash → onboarding → chart cast → all six tabs render, zero JS errors.
