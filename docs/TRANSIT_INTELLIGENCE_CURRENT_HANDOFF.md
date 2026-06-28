# Transit Intelligence — Current Handoff

Repo: `cakezcodes/transit-intelligence`  
Branch: `main`  
Stack: Next.js + Supabase + Vercel  
Brand: CakezCodes  
Product: cosmic calendar + personal grimoire + tarot/astrology meaning engine

This is the current source-of-truth summary. It supersedes older notes that mention Astronomy Engine as the locked engine, Flatlib, or astro-mcp.

## Current locked engine

Celestine is the locked chart engine.

- npm package: `celestine`
- license: MIT
- production role: planetary positions, Placidus houses, aspects, retrogrades, transits, progressions, and chart math
- validation script: `scripts/validate-syd-chart.mjs`
- command: `npm test`

Retired / not used:

- Flatlib
- Astronomy Engine
- astro-mcp
- production in-house Placidus math

## Supabase state

Project: `lfukxvbcfetdzbauigxe`

Shared reference layer:

- `tarot_cards` — 78 rows
- `signs` — 12 rows
- `planets` — 13 rows
- `houses` — 12 rows
- `aspects` — 5 rows
- `decans` — 36 rows linked to tarot cards
- `placement_meanings` — empty authoring table for planet-in-sign and planet-in-house meanings

Personal layer:

- `people`
- `readings`
- `reading_cards`
- `reading_echoes`
- `rereads`

RLS is enabled. Reference tables are public read-only. Personal tables are owner-only by `auth.uid() = user_id`.

## User zero

A user-zero row exists in `people` for Syd.

Stored birth data:

- birth date: 1995-11-05
- birth time: 14:52:00
- birth place: Jeffersonville, Indiana, United States
- latitude: 38.2776
- longitude: -85.7372
- timezone: America/Kentucky/Louisville
- relationship: self

Known validation anchors:

- Sun: Scorpio
- Moon: Aries
- Ascendant: Pisces around 8°31′
- Midheaven: Sagittarius around 17°52′

## Storage

Bucket:

- `reading-photos`
- private

Storage policies are owner-only. App upload paths should use:

```txt
{auth.uid()}/{filename}
```

## Sources and credits

Current source stack:

- Celestine — MIT
- Deckaura tarot-mcp-server — MIT
- Corpora by Darius Kazemi / dariusk — CC0
- zodiac facts / Wikipedia lineage — CC-BY-SA attribution where applicable
- Golden Dawn / Liber 777 decan correspondences — public domain tradition
- authored planets/houses/aspects/decans/meaning layers — CakezCodes / Transit Intelligence

## Immediate next build step

Wire Celestine into Supabase:

1. read a person row from `people`
2. pass birth inputs into Celestine
3. calculate chart with tropical Placidus
4. convert the Celestine output into a structured fact bundle
5. join placements against `signs`, `houses`, `planets`, and later `placement_meanings`
6. keep voice out of math; voice only phrases already-calculated facts

## Later feature: External Reading Capture

External Reading Capture is a defined later pillar, not the immediate next task.

It will capture trusted creator readings, store all 12 sign sections, link named cards to `tarot_cards` / `decans`, run convergence and recurrence, and enrich meaning tables by appending approved layers rather than overwriting base meanings.

## Rules

1. Naked meaning in the database; voice on top.
2. Chart math from Celestine, never AI guesses.
3. Store atoms and generate combinations on demand.
4. Every dependency is a liability.
5. Personal data is always walled by `user_id` / RLS.
6. Enrichment appends; it never overwrites.
7. One signature voice, isolated in one function.
