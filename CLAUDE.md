# CLAUDE.md — Transit Intelligence Engineering Handoff

App: personal cosmic OS (astrology + tarot + grimoire + calendar).
Stack: Next.js + Supabase (`lfukxvbcfetdzbauigxe`) + Vercel. Chart math: **Celestine** (npm). Global almanac: **astronomy-engine** (npm).

## Non-negotiable rules
1. **Celestine is the ONLY chart-math engine** for natal/transit positions. Never compute natal degrees with anything else (astronomy-engine is for the global almanac only, already loaded).
2. **Detection is free math; voicing is the only paid step.** Never batch-generate interpretations. Prose is written on demand, per event, when a user opens it.
3. **Append-never-overwrite** on meaning data. New meaning layers go to `meaning_enrichments`; never mutate existing meaning columns.
4. **Anti atom-soup:** max 6 evidence atoms per interpretation (planet + motion + sign + house + 1 ruler hop + tightest aspect). The voice writes ONE coherent paragraph *from* evidence — it never concatenates meaning rows verbatim.
5. **Voice:** all user-facing interpretation copy uses the locked "bestie" voice (feral Gen-Z cosmic bestie). Neutral reference text stays in the DB; the voice is applied at generation time.
6. **Porphyry is the default house system.** Cusps: angles (ASC/MC/DSC/IC) from Celestine, each quadrant trisected equally. House lookup is degree-based against those cusps. Whole-sign and Placidus stay available as user settings.

## The engine (already written)
`lib/engine/transit-routing-engine.ts` — pure function, no IO. The chain:
Transit planet → motion → sign → **natal house** → sign ruler(s) → **ruler's natal placement** → tightest natal aspects (applying/separating).
Dual-ruler signs (Scorpio, Aquarius, Pisces) return BOTH traditional + modern hops.
`buildSkyState()` maps the whole sky through one chart. The bottom of the file documents exactly which DB rows to fetch per chain and the one-paragraph prompt shape.

## Build order (Phase D)
1. **Natal computation + storage.** On person/user creation: run Celestine, store planets (body, sign, house, degree, abs longitude) + house cusps (compute Porphyry cusps from Celestine's ASC/MC: each quadrant divided into three equal arcs). Suggested table `natal_positions` (does not exist yet — create, RLS by owner; `people` table already exists with 1 row, user-zero).
2. **Daily sky snapshot job.** Cron (Vercel cron or Supabase edge function) writes 12 rows/day to `sky_positions` from Celestine (body, sign, degree, abs lon, motion, speed). Idempotent: UNIQUE(snapshot_date, body_key).
3. **Illuminations screen.** For the user: `buildSkyState(sky_positions today, natal chart)` → rank chains (retrograde/station first, tightest applying aspects next) → fetch meaning rows per the recipe → voice ONE paragraph per top chain.
4. **Calendar.** Global layer = `global_events` (251 events for 2026, DONE: lunations, stations, ingresses, eclipses, 8 sabbats, 159 void-of-course windows w/ starts_at/ends_at). Per-user layer = `calendar_events` (custom events/reminders). Render merged.
5. **Grimoire screen.** Read-only joins: `tarot_spreads` (20), `rituals` (20, trigger-keyed by sign/element/moon_phase/event_type_key — surface "tonight's ritual" by matching current `global_events`), `grimoire_reference` (8 sections), `correspondences` (16).
6. **Tarot logging.** `readings`/`reading_cards` (exist, RLS'd). Card detail view stacks layers: card core + `tarot_suits` + `tarot_numerology` + `color_meanings` + `meaning_enrichments` (Waite on 78; Golden Dawn/Book T divinatory on the 36 minors) + astro glyph + decan link.
7. **Orbit (friends/compare).** Add person → compute + store natal once. Compare view uses `synastry_meanings` (48 rows: sun/moon/venus/mars × 12 houses).
8. **Health/cycle.** `cycle_logs` stores anchors; phase math (`phaseForDate`) is pure app-side date math. Bonus join: overlap cycle phase with `global_events` lunations.
9. **Journal.** `journal_entries` — freeform, optional links to global_event/reading/ritual_log.

## Supabase map (all live unless noted)
Reference: `planets`, `signs` (rulers trad+modern), `houses` (number, domain), `celestial_bodies`, `decans` (36, Book T, linked to cards), `aspect_patterns`, `transit_event_types`, `progression_event_types`, `moon_phases` (8), `color_meanings` (6), `placement_meanings` (240: every planet × sign and × house, each with core/constructive/distorted), `synastry_meanings` (48).
Tarot: `tarot_cards` (78, with astro_type/astro_ruler/astro_glyph), `tarot_suits` (4), `tarot_numerology` (10), `meaning_enrichments` (114), `card_themes` (8, structure only — assignments NOT curated yet, do not auto-fill), `tarot_spreads` (20).
Grimoire: `rituals` (20), `correspondences` (16), `grimoire_reference` (8), `ritual_log` (user, RLS).
Calendar/state: `global_events` (251), `sky_positions` (empty — job in step 2), `calendar_events` (empty — user events), `cycle_logs`, `journal_entries` (empty, RLS'd).
People: `people` (1 row), `profiles`. Archive (read-only, never an engine source): `prototype_archive`.
Storage: a bucket exists for RWS card art (public domain, 1909) — images not sourced/uploaded yet; add `card_image_url` to `tarot_cards` when wiring.

## Prototype → screens
`docs/prototype/Transit Intelligence.html` is the interaction reference: views = Calendar, Orbit, Me (chart), Grimoire/Library, Health, Reminders, Settings; plus journal, tarot pull logging, spell logging, custom events. Design tokens/components live in the `cakezcodes/design-system` repo.

## Known open items
- `card_themes` assignments await Syd's curation.
- Cycle phase logic stays simple date math (no medical claims).
- Mathers/Etteilla third divinatory voice: only if a clean public-domain text is provided; wire like Waite via `meaning_enrichments`.
