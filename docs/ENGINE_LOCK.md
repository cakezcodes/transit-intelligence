# Chart Engine Lock

## Current engine: Celestine

**Status:** locked.

Transit Intelligence uses **Celestine** as the single chart engine.

Celestine is installed from npm and listed in `package.json` as the only astrology calculation dependency. It is MIT-licensed and present in `package-lock.json` with zero transitive runtime dependencies beyond itself.

## What Celestine owns

Celestine is responsible for chart math, including:

- planetary positions
- Placidus house calculation
- house cusps and angles
- planet-in-house assignment
- aspects
- retrograde detection
- transits
- progressions where needed later

## Configuration baseline

Use:

```js
calculateChart(birth, {
  houseSystem: 'placidus',
  zodiacType: 'tropical'
})
```

For extreme latitudes where Placidus can fail, fall back to whole-sign and flag the chart.

## Validation fixture

The repo includes:

```txt
scripts/validate-syd-chart.mjs
```

Run:

```bash
npm test
```

Expected anchors:

- Sun: Scorpio
- Moon: Aries
- Ascendant: Pisces, about 8°
- Midheaven: Sagittarius

If this validation fails, do not build chart-dependent features until the cause is understood.

## Retired engines

Do not reintroduce these without a deliberate review:

- Flatlib — rejected because of Swiss Ephemeris / pyswisseph GPL and Windows build-tool issues.
- Astronomy Engine — clean MIT, but replaced because Celestine already handles the astrology-specific layer directly.
- In-house Placidus production math — no longer needed as the production house engine. Keep any old implementation only as a reference/cross-check, not as the app spine.
- astro-mcp — not used in the current source stack.

## Licensing rule

The license that matters is the whole dependency tree, not only the top package. Any future astro dependency must be checked for transitive Swiss Ephemeris, GPL, AGPL, or native-build traps before trust.
