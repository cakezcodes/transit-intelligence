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
