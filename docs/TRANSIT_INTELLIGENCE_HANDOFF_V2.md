# Transit Intelligence Handoff v3

This supersedes the old grimoire handoff and the v2 Astronomy Engine handoff for the engine layer.

## Repo

- GitHub: `cakezcodes/transit-intelligence`
- Branch: `main`
- Stack: Next.js + Supabase + Vercel
- Engine: Celestine
- Cross-check: `lib/astro/placidus.js`

## Chart engine decision

Flatlib is retired. It looked clean at the top-level license but pulled `pyswisseph` / Swiss Ephemeris-related dependency behavior during install. Do not build around it.

Astronomy Engine is also retired/replaced. It is clean MIT, but Celestine is more complete for astrology-specific calculations.

Use Celestine as the primary engine for chart calculations.

## Engine pipeline

1. Celestine calculates birth chart, planetary positions, retrograde status, house cusps, planet-in-house, aspects, dignities, transits, progressions, and solar arc data.
2. Convert Celestine's output into a stable Transit Intelligence fact bundle.
3. Join that fact bundle with the neutral meaning tables.
4. Apply app voice only after the facts and meanings are assembled.
5. Validate against the user's known natal chart before trusting production output.

## Data sources to pull

- Deckaura tarot meanings: MIT
- Corpora tarot backup: CC0
- Celestine zodiac facts and chart engine: MIT
- astro-mcp astrology keyword skeleton: ISC
- Decans: authored from public-domain correspondence facts
- Planet-in-sign and planet-in-house meanings: authored lazily

## Shared reference tables

- tarot_cards
- decans
- signs
- planets
- houses
- aspects
- placement_meanings

## Personal tables

Every personal table gets `user_id` from day one.

- people
- readings
- reading_cards
- reading_echoes
- rereads

## Immediate next steps

1. Pull latest main locally.
2. Keep Celestine installed.
3. Uninstall Astronomy Engine.
4. Commit the resulting package changes.
5. Validate Celestine output against the user's known natal chart.
6. Continue raw data pulls: Corpora, Celestine source zip, astro-mcp.
7. Then build the Supabase schema for shared reference tables and personal grimoire tables.
