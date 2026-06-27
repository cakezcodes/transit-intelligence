# Chart Engine

This file records the v3 chart-engine decision.

## Locked direction

Use Celestine as the primary astrology calculation engine.

Celestine is MIT-licensed, ships with zero runtime dependencies, and provides birth charts, planetary positions, retrograde detection, Placidus houses, aspects, dignities, transits, progressions, and solar arc features.

## Why Celestine replaced Astronomy Engine

Astronomy Engine is clean and remains a good astronomy library, but Celestine is purpose-built for astrology and gives the app more of the computational layer out of the box.

Celestine's own docs say it is validated against NASA, JPL Horizons, and Swiss Ephemeris. That validation is a benchmark/reference claim, not a runtime dependency.

## House system

Use Celestine with Placidus as the default house system.

Keep `lib/astro/placidus.js` as an independent cross-check only. It is not the primary production house engine unless validation later shows Celestine is wrong for the user's known chart.

## Do not use

Do not use Flatlib, pyswisseph, Kerykeion, swisseph-wasm, or other Swiss Ephemeris wrappers unless the project has a paid commercial license and a clear compliance plan.

## Validation rule

Before production use, run the user's known birth data through Celestine and compare against the known reference chart:

- Scorpio Sun in 8th house
- Aries Moon in 2nd house
- Pisces Ascendant
- Sagittarius Midheaven

If the known placements and house cusps match closely, treat Celestine as validated for the app's natal/transit layer.
