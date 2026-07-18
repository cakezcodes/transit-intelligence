# Changelog

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
