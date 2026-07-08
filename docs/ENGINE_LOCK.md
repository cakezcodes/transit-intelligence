# Chart Engine Lock

## Current engine: Celestine

**Status:** locked.

Transit Intelligence uses **Celestine** as the single chart engine.

Celestine is installed from npm and listed in `package.json` as the only astrology calculation dependency. It is MIT-licensed and present in `package-lock.json` with zero transitive runtime dependencies beyond itself.

## What Celestine owns

Celestine is responsible for chart math, including:

- planetary positions
- angles (ASC/MC) and house cusps
- planet-in-house assignment
- aspects
- retrograde detection
- transits
- progressions where needed later

## House system baseline

**Porphyry is the default house system.** Cusps are derived from Celestine's angles (ASC/MC/DSC/IC), with each quadrant trisected equally — see `porphyryCusps()` in `lib/engine/transit-routing-engine.ts`. House lookup is degree-based against those cusps. Whole-sign and Placidus stay available as user settings.

Configuration:

```js
calculateChart(birth, {
  zodiacType: 'tropical'
})
// then derive Porphyry cusps from the returned ASC/MC
```

Porphyry works at all latitudes (only the angles are needed). If a user selects Placidus and their chart is at an extreme latitude where Placidus fails, fall back to whole-sign and flag the chart.

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
