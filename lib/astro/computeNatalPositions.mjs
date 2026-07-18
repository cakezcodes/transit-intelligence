/**
 * Natal computation for storage (Phase D step 1).
 *
 * Runs Celestine once per person and flattens the chart into
 * `natal_positions` rows: bodies (with Porphyry house assignment),
 * the four angles, and the 12 Porphyry cusps.
 *
 * Celestine is the ONLY source of positions; only the house cusps are
 * derived (Porphyry trisection of Celestine's angles).
 */

import { calculateFullPersonChart } from './calculateFullPersonChart.mjs';
import { porphyryCusps, houseForDegree, normalizeDegrees, signForDegree } from './porphyry.mjs';

const STORED_PLANETS = new Set([
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron',
]);

const BODY_KEYS = {
  'North Node': 'north_node',
  'South Node': 'south_node',
  'Mean Lilith': 'lilith',
};

function bodyKeyFor(name) {
  return BODY_KEYS[name] ?? String(name).toLowerCase();
}

function bodyRow(body, cusps) {
  const absoluteLongitude = normalizeDegrees(body.longitude);
  return {
    kind: 'body',
    body_key: bodyKeyFor(body.name),
    house: cusps?.length ? houseForDegree(absoluteLongitude, cusps) : null,
    sign: body.sign ?? signForDegree(absoluteLongitude),
    degree_in_sign: absoluteLongitude % 30,
    absolute_longitude: absoluteLongitude,
    retrograde: Boolean(body.retrograde),
    speed: body.longitude_speed ?? null,
  };
}

function angleRow(bodyKey, angle) {
  const absoluteLongitude = normalizeDegrees(angle.longitude);
  return {
    kind: 'angle',
    body_key: bodyKey,
    house: null,
    sign: angle.signName ?? signForDegree(absoluteLongitude),
    degree_in_sign: absoluteLongitude % 30,
    absolute_longitude: absoluteLongitude,
    retrograde: null,
    speed: null,
  };
}

/**
 * @param {object} person - a `people` row (id, user_id, birth data, lat/lon, timezone)
 * @param {object} options - passed through to calculateFullPersonChart
 * @returns {{ houseSystem: string, cusps: object[], rows: object[] }}
 *   rows are ready for insert into `natal_positions` once person_id/user_id
 *   are attached by the caller.
 */
export function computeNatalPositions(person, options = {}) {
  // Unknown birth time: chart runs at noon, and ASC/MC/houses are
  // suppressed entirely — noon houses must never be presented as real.
  const timeKnown = person.time_known ?? true;
  const effectivePerson = timeKnown ? person : { ...person, birth_time: '12:00:00' };
  const chart = calculateFullPersonChart(effectivePerson, options);

  if (!timeKnown) {
    const bodies = [
      ...chart.planets.filter((p) => STORED_PLANETS.has(p.name)),
      ...chart.nodes,
      ...chart.lilith,
    ].map((body) => bodyRow(body, null));
    return { houseSystem: person.house_system ?? 'porphyry', cusps: null, rows: bodies };
  }

  const asc = chart.angles.ascendant;
  const mc = chart.angles.midheaven;
  if (!Number.isFinite(asc?.longitude) || !Number.isFinite(mc?.longitude)) {
    throw new Error('Celestine chart is missing ASC/MC longitudes; cannot derive Porphyry cusps.');
  }

  const cusps = porphyryCusps(asc.longitude, mc.longitude);

  const bodies = [
    ...chart.planets.filter((p) => STORED_PLANETS.has(p.name)),
    ...chart.nodes,
    ...chart.lilith,
  ].map((body) => bodyRow(body, cusps));

  const angles = [
    angleRow('asc', asc),
    angleRow('mc', mc),
    angleRow('dsc', chart.angles.descendant),
    angleRow('ic', chart.angles.imumCoeli),
  ];

  const cuspRows = cusps.map((cusp) => ({
    kind: 'house_cusp',
    body_key: `cusp_${cusp.house}`,
    house: cusp.house,
    sign: cusp.sign,
    degree_in_sign: cusp.degreeInSign,
    absolute_longitude: cusp.absoluteLongitude,
    retrograde: null,
    speed: null,
  }));

  return {
    houseSystem: 'porphyry',
    cusps,
    rows: [...bodies, ...angles, ...cuspRows],
  };
}
