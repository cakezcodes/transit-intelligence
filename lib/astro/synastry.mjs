/**
 * Synastry — the Orbit tab's math (Phase D step 7).
 *
 * Pure functions, no IO. Two computed charts in, two products out:
 *
 *   overlays      — whose planets land in whose houses. The compare view
 *                   joins these to `synastry_meanings` (planet x house).
 *                   Null for a host whose houses are unknown (time_known
 *                   false: noon charts never present houses as real).
 *   cross_aspects — planet-to-planet aspects between the two charts,
 *                   tightest first.
 *
 * Aspect set mirrors lib/engine/transit-routing-engine.ts.
 */

import { houseForDegree, normalizeDegrees } from './porphyry.mjs';

const ASPECTS = [
  { name: 'conjunction', angle: 0, orb: 8 },
  { name: 'sextile', angle: 60, orb: 4 },
  { name: 'square', angle: 90, orb: 7 },
  { name: 'trine', angle: 120, orb: 7 },
  { name: 'opposition', angle: 180, orb: 8 },
];

const OVERLAY_BODIES = new Set([
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
]);

function angularSeparation(a, b) {
  const d = Math.abs(normalizeDegrees(a) - normalizeDegrees(b)) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * @param {Array<{body: string, absoluteLongitude: number}>} planets - guest planets
 * @param {Array<{house: number, absoluteLongitude: number}>|null} cusps - host cusps
 * @returns overlay list, or null when the host's houses are unknown
 */
export function houseOverlays(planets, cusps) {
  if (!cusps?.length) return null;
  return planets
    .filter((p) => OVERLAY_BODIES.has(p.body))
    .map((p) => ({ body: p.body, house: houseForDegree(p.absoluteLongitude, cusps) }));
}

/** Cross-chart aspects, one (tightest) aspect per planet pair, sorted by orb. */
export function crossAspects(planetsA, planetsB) {
  const contacts = [];
  for (const a of planetsA) {
    if (!OVERLAY_BODIES.has(a.body)) continue;
    for (const b of planetsB) {
      if (!OVERLAY_BODIES.has(b.body)) continue;
      const separation = angularSeparation(a.absoluteLongitude, b.absoluteLongitude);
      for (const aspect of ASPECTS) {
        const orb = Math.abs(separation - aspect.angle);
        if (orb <= aspect.orb) {
          contacts.push({
            body_a: a.body,
            body_b: b.body,
            aspect: aspect.name,
            orb: +orb.toFixed(2),
          });
          break;
        }
      }
    }
  }
  return contacts.sort((x, y) => x.orb - y.orb);
}

/**
 * @param {{planets: array, cusps: array|null}} chartA
 * @param {{planets: array, cusps: array|null}} chartB
 * @returns {{overlays: {a_in_b: array|null, b_in_a: array|null}, cross_aspects: array}}
 */
export function computeSynastry(chartA, chartB) {
  return {
    overlays: {
      a_in_b: houseOverlays(chartA.planets, chartB.cusps),
      b_in_a: houseOverlays(chartB.planets, chartA.cusps),
    },
    cross_aspects: crossAspects(chartA.planets, chartB.planets),
  };
}
