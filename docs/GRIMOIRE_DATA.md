# Grimoire Data Layer

This file tracks the reference-data work for Transit Intelligence.

## v2 correction

The old Flatlib path is retired. Do not use Flatlib or Swiss Ephemeris wrappers. Chart positions should use Astronomy Engine, and houses should use the in-house Placidus calculator at `lib/astro/placidus.js`.

## Build order

1. Keep source notes.
2. Keep credits.
3. Add raw data files.
4. Add cleaned data files.
5. Add SQL setup files.
6. Install Astronomy Engine.
7. Validate chart math with a known natal chart.

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
