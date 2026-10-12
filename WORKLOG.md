# Worklog

## 2026-07-12 — Phase D step 1: natal computation + storage

Created `natal_positions` (RLS by owner) and stored Syd's full natal chart: 14 bodies (10 planets + Chiron, nodes, Lilith) with Porphyry house assignments, 4 angles, 12 Porphyry cusps.

### Decisions

- One table for bodies/angles/cusps, discriminated by `kind`, unique on `(person_id, house_system, body_key)` — cusps key as `cusp_1..cusp_12` so a single upsert is idempotent.
- Porphyry cusps derived app-side from Celestine's ASC/MC (`lib/astro/porphyry.mjs`, mirrors the TS engine); Celestine remains the only position source.
- Chart validated against the Syd fixture before storage: ASC Pisces 8°, MC Sagittarius, Sun Scorpio (house 8), Moon Aries (house 2) — matches the engine docstring example.

### Notes

`npm run natal:compute [person_id]` recomputes/upserts via the service-role client.

## 2026-07-12 — Phase D step 2: daily sky snapshot job

Deployed the `sky-snapshot` Supabase edge function (Celestine via npm specifier) and scheduled it daily at 00:10 UTC via pg_cron + pg_net. First snapshot (2026-07-12) written and verified: 12 rows — 10 planets + Chiron + North Node.

### Decisions

- Positions computed at 12:00 UTC of the snapshot date (midday representative).
- Motion: longitude-speed sign at day start vs day end; a flip inside the day = station_retrograde / station_direct. Node speed (no longitudeSpeed from Celestine) falls back to longitude delta across the day.
- Idempotent upsert on UNIQUE(snapshot_date, body_key). `?date=YYYY-MM-DD` supports backfill.
- The cron bearer token is the public anon key — it only passes the verify_jwt gate; writes happen via the function's service-role env.

### Notes

Next: Phase D step 3 (Illuminations screen — buildSkyState + ranking + voiced paragraphs).

## 2026-07-13 — Orbit tab data layer (Phase D step 7 foundation)

Adopted the chart-comparison machinery from the July-12 Orbit handoff, adapted to the locked stack (Celestine + existing schema; that doc's circular-natal-horoscope-js suggestion and its "9-table schema applied" claim were rejected — the live DB is the CLAUDE.md schema).

### Decisions

- `people.house_system` (default porphyry) + `people.time_known` — house system is per-person, never global; noon-default charts suppress ASC/MC/houses entirely.
- New `synastry` table: one cached row per pair (person_a < person_b), overlays JSONB (whose planets in whose houses — joins `synastry_meanings` by planet x house) + cross_aspects JSONB (tightest first), RLS by owner.
- Real IANA timezone resolver (`lib/astro/timezoneOffset.mjs`, Intl-based, DST-correct) replaced the Syd-only hardcode — arbitrary roster people can now be charted.
- `lib/astro/synastry.mjs` is pure math (overlays + cross-aspects); `npm run synastry:compute <a> <b>` computes and caches.

### Notes

Roster people (Christian, Zay, Tab, Eryn) need birth data entered into `people` before their charts/synastry can compute. Composites (midpoint charts) deferred to phase 2, per the handoff's own ordering.

## 2026-07-02 — Bestie Voice Skill Lock

Locked `skills/bestie-voice/SKILL.md` as the canonical Transit Intelligence voice skill.

### Decisions

- Retired the four-parallel-voices model.
- Adopted blended synthesis: Jimmy = spine, 303 = edge, Cam = garnish.
- Clarified that Bestie is the synthesis, not a fourth voice.
- Locked the final formula: feral but accurate, funny with receipts, selectively profane, emoji as timing, spiritual glitter with teeth, no skeptical hedging, no fake certainty, joke from accuracy.
- Locked the response shape for astrology and tarot outputs: mechanic → real-life consequence → pattern callout → one grounded move.
- Committed DOA phrase list and failure modes.

### Notes

This skill is for user-facing Transit Intelligence and CakezCodes brand copy only. It should not be used for legal copy, developer-facing error strings, backend logs, database values, or neutral system messages.

## 2026-07-18 — Next.js Re-platform (deploy-ready)

Ported the v11 prototype onto Next.js + Supabase auth + server-side OpenAI. See docs/CHANGELOG.md 2026-07-18 for the full list. Vercel go-live checklist lives in docs/ROADMAP.md.

## 2026-10-12 — Splash restored, real rising, nav + calendar hub, design system v2

### What was broken

- **The app never booted.** v1-final's `app.js` declared `const IMG = {}` while `img.js` (the 78 card scans) already declares `IMG`. Two classic scripts share one global scope, so the browser refused to run `app.js` at all — the splash never handed off. The Oct 11 "splash freeze" fixes never touched this. Guarded now by `npm run check:prototype`.
- **Rising was faked.** Onboarding computed the ascendant as `(lst/24)*360 + lat*0.5` and the Big 3 used `(sun + hour/2) % 12`. Both are gone.
- **Dead buttons.** "+ add to the calendar" called `openAdd()`, which didn't exist. Synastry/composite/settings rows were toasts.
- Stat tiles + Big 3 tiles never showed their values (`.v` collided with the view class `.v{display:none}`).
- Calendar opened on July 2026 (prototype hardcode); notes and layer toggles weren't persisted; profile longitude never saved (`me.lon` vs `me.lng`); city list used fixed offsets (no DST).

### Decisions

- **`POST /api/natal`** is the only place a chart is cast: Celestine server-side, Porphyry default, whole-sign + Placidus cusps returned alongside so the house-system setting switches instantly. `self: true` upserts the user's `people` row (`is_self`) and replaces its `natal_positions`. No birth time → no angles/houses (never noon houses). Client only draws and does house lookup against the cusps it was handed.
- **One splash, two hosts** (`features/splash/splashMarkup.mjs`) so `/welcome → /app` is seamless; a pre-paint script applies saved theme (no light flash for dark mode) and shows an already-played splash finished instead of replaying it.
- **Back stack in history state** — in-app back, browser back, and back-swipe all agree; back closes sheets first.
- **Calendar is the hub.** The record lost its duplicate month grid (it's the list view of the calendar now); every entry date, moon stamp, ritual window, person, and custom event routes to the calendar.
- **Markup source moved** to `features/app/body.html`; `prototypeBody.mjs` is generated (`prebuild`/`predev`). `npm test` also checks inline handlers resolve and tags balance.
- Embedded base64 blackletter font extracted to `public/fonts/` (CSS 122KB → 45KB).

### Notes

Migration `20261012000100_people_is_self.sql` must be applied (`supabase db push`) before self charts store; until then the route still returns the chart and the app keeps it in `app_state`. Verified in headless Chromium against a mock Supabase: welcome splash → sign-in → onboarding → cast (8°32′ Pisces rising, matches the Syd fixture) → all tabs, sheets, back nav, reload, dark mode — zero page errors.

## 2026-10-12 (later) — aligned to the astrocake 2.0.0 handoff

The design-system repo now holds the full rebrand (brand book, tokens, chart engine, calendar sheet, site, apps, shop kit). The app was brought into line with it:

- **Calendar = the Cosmic Calendar sheet**: ✦astrocake masthead, engine natal line, square ink-edged layer keys, standing bar, sheet shorthand in day cells (default "sheet" view), double-framed What to Watch, sheet footer. Cosmic Sky is stone, flagged days tomato.
- **Wheel = the Natal Blueprint `wheel()`**, ink only (3-letter signs, 2-letter bodies, solid ASC–DSC, dashed MC–IC, aspects < 4°).
- **Splash**: lowercase blackletter ✦transit intelligence with the pink ✦, "an ✦astrocake app" at the foot.
- **Color law**: removed pop-colored text/lines/focus rings; pops carry ink text; dark mode is flat ink with #232220 cards.
- Fixed: calendar buttons were inflated by the `#ti-root button` font reset.
