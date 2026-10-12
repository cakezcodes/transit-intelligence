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

## 2026-10-12

- Fixed the boot crash that froze the app on the splash (duplicate `IMG` declaration between `img.js` and `app.js`).
- Splash restored and shared between `/welcome` and `/app` with a seamless sign-in hand-off; no theme flash on reload.
- Real rising: new `POST /api/natal` (Celestine, Porphyry default, whole-sign/Placidus available) replaces client-side ascendant approximations everywhere (onboarding, Big 3, orbit, calendar natal layer).
- New astrocake line-only chart wheel with aspect web; full placements + aspects tables; tap-to-explain on every glyph, sign, house, and aspect.
- History-based navigation: back bar on every sub-view, browser/phone back support, Escape closes sheets, accessible tabs and dialogs.
- Calendar is the single calendar: record's duplicate grid removed; "+ add to the calendar" implemented; every element routes or explains.
- Synastry + composite sheets, house-system picker, moon sheet, sign/house/suit explainers, sparkle bursts.
- Design system v2 layer (`app/astrocake.css`), blackletter font extracted to a file, favicon.
- Migration: `people.is_self` (+ owner RLS policies if missing).
- `npm test` now also runs `check:prototype`, `check:handlers`, `check:markup`.
