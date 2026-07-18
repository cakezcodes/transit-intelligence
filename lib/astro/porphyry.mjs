/**
 * Porphyry house math — the default house system.
 *
 * Cusps come from Celestine's angles (ASC/MC): the four angles anchor
 * houses 1/4/7/10 and each quadrant is trisected equally. Mirrors
 * `porphyryCusps()` / `houseForDegreeCusps()` in
 * lib/engine/transit-routing-engine.ts — keep the two in sync.
 */

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

export function signForDegree(absoluteLongitude) {
  return SIGNS[Math.floor(normalizeDegrees(absoluteLongitude) / 30)];
}

/** Porphyry cusps from ASC/MC absolute longitudes: trisect each quadrant. */
export function porphyryCusps(ascendantLongitude, midheavenLongitude) {
  const asc = normalizeDegrees(ascendantLongitude);
  const mc = normalizeDegrees(midheavenLongitude);
  const dsc = normalizeDegrees(asc + 180);
  const ic = normalizeDegrees(mc + 180);
  const arc = (from, to) => normalizeDegrees(to - from);

  const cusps = new Array(13);
  cusps[1] = asc;
  cusps[4] = ic;
  cusps[7] = dsc;
  cusps[10] = mc;

  let step = arc(asc, ic) / 3;
  cusps[2] = normalizeDegrees(asc + step);
  cusps[3] = normalizeDegrees(asc + 2 * step);
  step = arc(ic, dsc) / 3;
  cusps[5] = normalizeDegrees(ic + step);
  cusps[6] = normalizeDegrees(ic + 2 * step);
  step = arc(dsc, mc) / 3;
  cusps[8] = normalizeDegrees(dsc + step);
  cusps[9] = normalizeDegrees(dsc + 2 * step);
  step = arc(mc, asc) / 3;
  cusps[11] = normalizeDegrees(mc + step);
  cusps[12] = normalizeDegrees(mc + 2 * step);

  return Array.from({ length: 12 }, (_, i) => {
    const absoluteLongitude = cusps[i + 1];
    return {
      house: i + 1,
      absoluteLongitude,
      sign: signForDegree(absoluteLongitude),
      degreeInSign: absoluteLongitude % 30,
    };
  });
}

/** Degree-based house lookup against any cusp set (Porphyry, Placidus). */
export function houseForDegree(absoluteLongitude, cusps) {
  const lon = normalizeDegrees(absoluteLongitude);
  const ordered = [...cusps].sort((a, b) => a.house - b.house);

  for (let i = 0; i < 12; i++) {
    const a = ordered[i].absoluteLongitude;
    const b = ordered[(i + 1) % 12].absoluteLongitude;
    const inSpan = a < b ? lon >= a && lon < b : lon >= a || lon < b;
    if (inSpan) return ordered[i].house;
  }

  return 1;
}
