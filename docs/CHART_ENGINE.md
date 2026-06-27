# Chart Engine

This file records the v2 chart-engine decision.

## Locked direction

Use Astronomy Engine by Don Cross for planetary positions. It is MIT-licensed and avoids Swiss Ephemeris / GPL dependency issues.

Use `lib/astro/placidus.js` for Placidus houses. It is in-house project code using public-domain house math.

## Do not use

Do not use Flatlib, pyswisseph, Kerykeion, swisseph-wasm, or other Swiss Ephemeris wrappers unless the project has a paid commercial license and a clear compliance plan.

## Pipeline

1. Astronomy Engine calculates planetary ecliptic longitudes, obliquity, and sidereal time.
2. Convert longitude to sign and degree.
3. Detect aspects by longitude difference and orb table.
4. Compute houses with `computeHouses(ramc, latitude, obliquity)`.
5. Validate against a known natal chart before trusting house cusps.

## Validation rule

Validation is required before production use. Cross-check Ascendant, Midheaven, and all 12 Placidus cusps against a known chart. If latitude is above about 66 degrees, fall back to Whole Sign and flag the chart.
