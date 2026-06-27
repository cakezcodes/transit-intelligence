# Grimoire Data Layer

This file tracks the reference-data work for Transit Intelligence.

## v3 correction

Flatlib is retired. Astronomy Engine is replaced. Celestine is now the primary astrology calculation engine.

Use Celestine for planetary positions, retrograde detection, Placidus houses, planet-in-house assignment, aspects, dignities, transits, progressions, and solar arc features.

Keep `lib/astro/placidus.js` as an independent cross-check only.

## Build order

1. Keep source notes.
2. Keep credits.
3. Add raw data files.
4. Add cleaned data files.
5. Add SQL setup files.
6. Install Celestine.
7. Validate chart math with the user's known natal chart.

## Reference tables

- tarot_cards
- decans
- signs
- planets
- houses
- aspects
- placement_meanings

## Personal tables

- people
- readings
- reading_cards
- reading_echoes
- rereads

## Data rule

Reference meanings stay neutral in the database. App voice is applied later by the AI layer.
