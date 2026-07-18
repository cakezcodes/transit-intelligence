/**
 * TRANSIT ROUTING ENGINE — Transit Intelligence
 * ------------------------------------------------
 * The chain: Transit Planet → Motion → Sign → Natal House
 *            → Sign Ruler → Ruler's Natal Placement → (Aspects)
 *
 * Design rules honored:
 *  - Celestine is the ONLY chart-math engine (positions come in, never computed here).
 *  - This function is PURE: no DB, no AI, no side effects. It builds the evidence
 *    object. Meaning rows are attached by the caller; prose is written by the
 *    Bestie voice from the evidence. Combine like a sentence recipe, not soup.
 *  - PORPHYRY is the default house system: cusps come from Celestine's angles
 *    (ASC/MC), each quadrant trisected equally; lookup is degree-vs-cusp.
 *    Whole-sign and Placidus remain as user settings. The degree-based lookup
 *    below works for ANY cusp-based system (Porphyry, Placidus) — only the
 *    cusp values differ.
 */

// ---------- Types ----------

export type Motion = 'direct' | 'retrograde' | 'station_retrograde' | 'station_direct';

export interface SkyBody {
  body: string;            // 'mercury'
  sign: string;            // 'Cancer'
  degreeInSign: number;    // 18.4
  absoluteLongitude: number;
  motion: Motion;
  speed?: number;          // deg/day (negative = retrograde)
}

export interface NatalPlanet {
  body: string;            // 'moon'
  sign: string;            // 'Aries'
  house: number;           // 2
  degreeInSign: number;    // 25.9
  absoluteLongitude: number;
}

export interface NatalHouse {
  house: number;           // 1..12
  cuspSign: string;        // 'Pisces'
  cuspDegree?: number;     // Placidus only
}

export interface NatalChart {
  risingSign: string;                 // 'Pisces'
  houses: NatalHouse[];               // 12
  planets: NatalPlanet[];
  houseSystem: 'porphyry' | 'whole_sign' | 'placidus';
}

export interface RulerHop {
  ruler: string;                      // 'moon'
  rulershipType: 'traditional' | 'modern';
  natalSign: string;                  // 'Aries'
  natalHouse: number;                 // 2
}

export interface TransitChain {
  transitBody: string;
  motion: Motion;
  transitSign: string;
  transitDegree: number;
  natalHouse: number;                 // where the transit lands in THIS chart
  rulerChain: RulerHop[];             // usually 1 hop; Scorpio/Aquarius/Pisces may carry 2 (trad+modern)
  natalContacts: NatalContact[];      // aspects from transit body to natal planets
}

export interface NatalContact {
  natalBody: string;
  aspect: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;                        // degrees from exact
  applying: boolean;                  // true if transit is moving toward exact
}

// ---------- Static data (mirror of the `signs` table) ----------

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const RULERS: Record<string, { traditional: string; modern: string }> = {
  Aries:       { traditional: 'mars',    modern: 'mars' },
  Taurus:      { traditional: 'venus',   modern: 'venus' },
  Gemini:      { traditional: 'mercury', modern: 'mercury' },
  Cancer:      { traditional: 'moon',    modern: 'moon' },
  Leo:         { traditional: 'sun',     modern: 'sun' },
  Virgo:       { traditional: 'mercury', modern: 'mercury' },
  Libra:       { traditional: 'venus',   modern: 'venus' },
  Scorpio:     { traditional: 'mars',    modern: 'pluto' },
  Sagittarius: { traditional: 'jupiter', modern: 'jupiter' },
  Capricorn:   { traditional: 'saturn',  modern: 'saturn' },
  Aquarius:    { traditional: 'saturn',  modern: 'uranus' },
  Pisces:      { traditional: 'jupiter', modern: 'neptune' },
};

const ASPECTS: Array<{ name: NatalContact['aspect']; angle: number; orb: number }> = [
  { name: 'conjunction', angle: 0,   orb: 8 },
  { name: 'sextile',     angle: 60,  orb: 4 },
  { name: 'square',      angle: 90,  orb: 7 },
  { name: 'trine',       angle: 120, orb: 7 },
  { name: 'opposition',  angle: 180, orb: 8 },
];

// ---------- Core helpers ----------

/** Whole-sign: house = distance from rising sign + 1. */
export function houseForSignWholeSign(sign: string, risingSign: string): number {
  const r = SIGNS.indexOf(risingSign);
  const s = SIGNS.indexOf(sign);
  if (r < 0 || s < 0) throw new Error(`unknown sign ${sign}/${risingSign}`);
  return ((s - r + 12) % 12) + 1;
}

/** Cusp-based lookup (Porphyry default, also Placidus): walk cusps by absolute longitude. */
export function houseForDegreeCusps(absLon: number, houses: NatalHouse[]): number {
  // requires cuspDegree as absolute longitude on each house, sorted 1..12
  const cusps = houses
    .map(h => ({ house: h.house, lon: (SIGNS.indexOf(h.cuspSign) * 30 + (h.cuspDegree ?? 0)) % 360 }))
    .sort((a, b) => a.house - b.house);
  for (let i = 0; i < 12; i++) {
    const a = cusps[i].lon, b = cusps[(i + 1) % 12].lon;
    const inSpan = a < b ? absLon >= a && absLon < b : absLon >= a || absLon < b; // wrap
    if (inSpan) return cusps[i].house;
  }
  return 1;
}

function angularSep(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Porphyry cusps from the four angles: trisect each quadrant equally. */
export function porphyryCusps(ascLon: number, mcLon: number): NatalHouse[] {
  const norm = (x: number) => ((x % 360) + 360) % 360;
  const arc = (a: number, b: number) => norm(b - a); // forward arc a->b
  const dsc = norm(ascLon + 180), ic = norm(mcLon + 180);
  const cusps: number[] = new Array(13);
  cusps[1] = ascLon; cusps[10] = mcLon; cusps[7] = dsc; cusps[4] = ic;
  const q = (from: number, to: number) => arc(from, to) / 3;
  let s = q(ascLon, ic);  cusps[2] = norm(ascLon + s); cusps[3] = norm(ascLon + 2 * s);
  s = q(ic, dsc);         cusps[5] = norm(ic + s);     cusps[6] = norm(ic + 2 * s);
  s = q(dsc, mcLon);      cusps[8] = norm(dsc + s);    cusps[9] = norm(dsc + 2 * s);
  s = q(mcLon, ascLon);   cusps[11] = norm(mcLon + s); cusps[12] = norm(mcLon + 2 * s);
  return Array.from({ length: 12 }, (_, i) => {
    const lon = cusps[i + 1];
    return { house: i + 1, cuspSign: SIGNS[Math.floor(lon / 30)], cuspDegree: lon % 30 };
  });
}

// ---------- The chain ----------

export function buildTransitChain(
  transit: SkyBody,
  natal: NatalChart,
  opts: { rulership?: 'traditional' | 'modern' | 'both' } = {}
): TransitChain {
  const rulership = opts.rulership ?? 'both';

  // 1) Which natal house does the transit land in?
  const natalHouse =
    natal.houseSystem === 'whole_sign'
      ? houseForSignWholeSign(transit.sign, natal.risingSign)
      : houseForDegreeCusps(transit.absoluteLongitude, natal.houses); // Porphyry (default) & Placidus

  // 2) Follow the sign ruler(s) into the natal chart.
  const r = RULERS[transit.sign];
  const wanted: Array<['traditional' | 'modern', string]> =
    rulership === 'both'
      ? r.traditional === r.modern
        ? [['traditional', r.traditional]]
        : [['traditional', r.traditional], ['modern', r.modern]]
      : [[rulership, r[rulership]]];

  const rulerChain: RulerHop[] = [];
  for (const [type, ruler] of wanted) {
    const p = natal.planets.find(pl => pl.body === ruler);
    if (p) rulerChain.push({ ruler, rulershipType: type, natalSign: p.sign, natalHouse: p.house });
  }

  // 3) Aspects from the transit body to natal planets (applying/separating via speed sign).
  const natalContacts: NatalContact[] = [];
  for (const p of natal.planets) {
    const sep = angularSep(transit.absoluteLongitude, p.absoluteLongitude);
    for (const a of ASPECTS) {
      const orb = Math.abs(sep - a.angle);
      if (orb <= a.orb) {
        // applying = the separation is shrinking; approximate by nudging along speed
        const nudged = angularSep(
          transit.absoluteLongitude + (transit.speed ?? 1) * 0.1,
          p.absoluteLongitude
        );
        natalContacts.push({
          natalBody: p.body,
          aspect: a.name,
          orb: +orb.toFixed(2),
          applying: Math.abs(nudged - a.angle) < orb,
        });
        break; // one aspect per pair
      }
    }
  }
  natalContacts.sort((a, b) => a.orb - b.orb);

  return {
    transitBody: transit.body,
    motion: transit.motion,
    transitSign: transit.sign,
    transitDegree: transit.degreeInSign,
    natalHouse,
    rulerChain,
    natalContacts,
  };
}

// ---------- Sky State: run the whole sky through one chart ----------

export function buildSkyState(sky: SkyBody[], natal: NatalChart) {
  return sky.map(body => buildTransitChain(body, natal));
}

/**
 * ---------- How the caller assembles MEANING (the sentence recipe) ----------
 *
 * Given a TransitChain, fetch exactly these rows and hand them to the voice:
 *
 *   1. planets.meaning            WHERE lower(name) = chain.transitBody       -- what function is active
 *   2. motion flavor              (static: retrograde = review/revisit)      -- how it's moving
 *   3. signs.meaning              WHERE name = chain.transitSign             -- what style
 *   4. houses.meaning/domain      WHERE number = chain.natalHouse            -- what life area
 *   5. FOR EACH rulerChain hop:
 *        placement_meanings       WHERE planet = hop.ruler
 *                                   AND context = (hop.natalSign, hop.natalHouse)
 *                                                                            -- where the story routes
 *   6. natalContacts[0..2]        -- tightest aspects only; budget, don't dump
 *
 * Voice prompt shape (ONE paragraph, not keyword soup):
 *   "{transitBody} {motion} is moving through {transitSign} in your {natalHouse}th house.
 *    {transitSign} is ruled by {ruler}; your natal {ruler} is in {natalSign} in the
 *    {rulerHouse}th house — so this transit routes {houseDomain} themes through
 *    {rulerHouseDomain}." + contacts if within orb.
 *
 * Budget rule (anti atom-soup): max 6 evidence atoms per event —
 *   planet + motion + sign + house + 1 ruler hop + tightest aspect.
 *   The voice writes from evidence; it never concatenates meanings verbatim.
 */
