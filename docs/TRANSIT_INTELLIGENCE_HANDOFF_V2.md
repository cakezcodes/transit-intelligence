# Transit Intelligence Handoff v2

This supersedes the old grimoire handoff for the engine layer.

## Repo

- GitHub: `cakezcodes/transit-intelligence`
- Branch: `main`
- Stack: Next.js + Supabase + Vercel
- Engine: Astronomy Engine plus in-house Placidus

## Chart engine decision

Flatlib is retired. It looked clean at the top-level license but pulled `pyswisseph` / Swiss Ephemeris-related dependency behavior during install. Do not build around it.

Use Astronomy Engine by Don Cross for positions. Use `lib/astro/placidus.js` for house cusps.

## Engine pipeline

1. Astronomy Engine calculates planetary ecliptic longitudes, obliquity, and sidereal time.
2. Convert longitude into sign and degree.
3. Detect aspects with longitude differences and orb table.
4. Compute houses with `computeHouses(ramc, latitude, obliquity)`.
5. Validate with a known chart before trusting the app output.

## Data sources to pull

- Deckaura tarot meanings: MIT
- Corpora tarot backup: CC0
- Celestine zodiac facts: MIT
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
2. Remove or ignore the failed Python virtual environment.
3. Run `npm install astronomy-engine` locally.
4. Commit the resulting package changes.
5. Build Supabase schema for the shared reference tables and personal grimoire tables.
