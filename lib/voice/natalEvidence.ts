/* The facts a natal reading is written from. Pure: takes the Celestine rows stored in
   natal_positions (Rule 1 — no other chart math feeds this) and returns plain-language
   evidence lines. Aspects, rulerships and counts are arithmetic on those longitudes. */

export type NatalRow = {
  kind: string; // 'body' | 'angle' | 'house_cusp'
  body_key: string;
  house: number | null;
  sign: string;
  degree_in_sign: number | string;
  absolute_longitude: number | string;
  retrograde: boolean | null;
};

const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
const ELEMENT = ['fire', 'earth', 'air', 'water'];
const MODE = ['cardinal', 'fixed', 'mutable'];
const TRAD: Record<string, string> = { aries: 'mars', taurus: 'venus', gemini: 'mercury', cancer: 'moon', leo: 'sun', virgo: 'mercury', libra: 'venus', scorpio: 'mars', sagittarius: 'jupiter', capricorn: 'saturn', aquarius: 'saturn', pisces: 'jupiter' };
const MODERN: Record<string, string> = { scorpio: 'pluto', aquarius: 'uranus', pisces: 'neptune' };
const DIGNITY: Record<string, { dom: string[]; exalt?: string; det: string[]; fall?: string }> = {
  sun: { dom: ['leo'], exalt: 'aries', det: ['aquarius'], fall: 'libra' },
  moon: { dom: ['cancer'], exalt: 'taurus', det: ['capricorn'], fall: 'scorpio' },
  mercury: { dom: ['gemini', 'virgo'], exalt: 'virgo', det: ['sagittarius', 'pisces'], fall: 'pisces' },
  venus: { dom: ['taurus', 'libra'], exalt: 'pisces', det: ['scorpio', 'aries'], fall: 'virgo' },
  mars: { dom: ['aries', 'scorpio'], exalt: 'capricorn', det: ['libra', 'taurus'], fall: 'cancer' },
  jupiter: { dom: ['sagittarius', 'pisces'], exalt: 'cancer', det: ['gemini', 'virgo'], fall: 'capricorn' },
  saturn: { dom: ['capricorn', 'aquarius'], exalt: 'libra', det: ['cancer', 'leo'], fall: 'aries' },
};
const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const POINTS = [...PLANETS, 'chiron', 'north_node'];
const NAME: Record<string, string> = { north_node: 'North Node', asc: 'Ascendant', mc: 'Midheaven' };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const nm = (k: string) => NAME[k] || cap(k);
const ord = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
const dm = (d: number) => `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, '0')}′`;
const ASPECTS = [
  { n: 'conjunction', a: 0, orb: 8 }, { n: 'opposition', a: 180, orb: 8 }, { n: 'square', a: 90, orb: 7 },
  { n: 'trine', a: 120, orb: 7 }, { n: 'sextile', a: 60, orb: 5 },
];

export function natalEvidence(rows: NatalRow[], timeKnown: boolean) {
  const lon = (r: NatalRow) => Number(r.absolute_longitude);
  const deg = (r: NatalRow) => Number(r.degree_in_sign);
  const bodies = rows.filter((r) => r.kind === 'body' && POINTS.includes(r.body_key));
  const by = (k: string) => bodies.find((b) => b.body_key === k);
  const angle = (k: string) => rows.find((r) => r.kind === 'angle' && r.body_key === k);
  const cusps = rows.filter((r) => r.kind === 'house_cusp').sort((a, b) => (a.house ?? 0) - (b.house ?? 0));
  const asc = timeKnown ? angle('asc') : undefined;
  const mc = timeKnown ? angle('mc') : undefined;
  const signOfLon = (l: number) => SIGNS[Math.floor((((l % 360) + 360) % 360) / 30)];
  const place = (b: NatalRow) => `${nm(b.body_key)} ${dm(deg(b))} ${cap(String(b.sign))}${b.house ? `, ${ord(b.house)} house` : ''}${b.retrograde && b.body_key !== 'north_node' ? ', retrograde' : ''}`;

  const lines: string[] = [];
  lines.push('PLACEMENTS (Celestine, Porphyry houses)');
  if (asc) lines.push(`Ascendant ${dm(deg(asc))} ${cap(signOfLon(lon(asc)))}`);
  if (mc) lines.push(`Midheaven ${dm(deg(mc))} ${cap(signOfLon(lon(mc)))}`);
  for (const k of POINTS) { const b = by(k); if (b) lines.push(place(b)); }
  if (!timeKnown) lines.push('Birth time unknown: no Ascendant, Midheaven or houses. Do not mention them.');

  /* rulerships: the chart ruler and what each ruler of an angle is doing */
  if (asc && cusps.length === 12) {
    const housesRuled = (planet: string) => cusps.filter((c) => TRAD[signOfLon(lon(c))] === planet || MODERN[signOfLon(lon(c))] === planet).map((c) => c.house!);
    const rulers = (sign: string) => [TRAD[sign], MODERN[sign]].filter(Boolean) as string[];
    lines.push('', 'RULERSHIPS');
    const ascSign = signOfLon(lon(asc));
    for (const r of rulers(ascSign)) {
      const b = by(r);
      if (b) lines.push(`Chart ruler (${MODERN[ascSign] === r ? 'modern' : 'traditional'} ruler of ${cap(ascSign)} rising): ${place(b)}; it rules houses ${housesRuled(r).join(', ')}`);
    }
    if (mc) {
      const mcSign = signOfLon(lon(mc));
      for (const r of rulers(mcSign)) { const b = by(r); if (b) lines.push(`Ruler of the Midheaven (${cap(mcSign)}): ${place(b)}`); }
    }
  }

  /* dignities */
  const dig: string[] = [];
  for (const k of Object.keys(DIGNITY)) {
    const b = by(k); if (!b) continue;
    const s = String(b.sign).toLowerCase(), d = DIGNITY[k];
    if (d.dom.includes(s)) dig.push(`${nm(k)} in its own sign (${cap(s)})`);
    else if (d.exalt === s) dig.push(`${nm(k)} exalted in ${cap(s)}`);
    else if (d.det.includes(s)) dig.push(`${nm(k)} in detriment in ${cap(s)}`);
    else if (d.fall === s) dig.push(`${nm(k)} in fall in ${cap(s)}`);
  }
  if (dig.length) lines.push('', 'DIGNITIES', ...dig);

  /* stelliums */
  const planets = PLANETS.map(by).filter(Boolean) as NatalRow[];
  const group = (key: (b: NatalRow) => string | number | null) => {
    const m = new Map<string | number, NatalRow[]>();
    planets.forEach((b) => { const k = key(b); if (k != null) m.set(k, [...(m.get(k) || []), b]); });
    return [...m.entries()].filter(([, v]) => v.length >= 3);
  };
  const st = [
    ...group((b) => String(b.sign).toLowerCase()).map(([s, v]) => `${v.length} planets in ${cap(String(s))}: ${v.map((b) => `${nm(b.body_key)} ${Math.floor(deg(b))}°`).join(', ')}`),
    ...(timeKnown ? group((b) => b.house).map(([h, v]) => `${v.length} planets in the ${ord(Number(h))} house: ${v.map((b) => nm(b.body_key)).join(', ')}`) : []),
  ];
  if (st.length) lines.push('', 'CONCENTRATIONS', ...st);

  /* tightest aspects, planets + angles + node */
  const pts: { k: string; l: number }[] = [...POINTS.map(by).filter(Boolean).map((b) => ({ k: b!.body_key, l: lon(b!) }))];
  if (asc) pts.push({ k: 'asc', l: lon(asc) });
  if (mc) pts.push({ k: 'mc', l: lon(mc) });
  const asp: { t: string; orb: number }[] = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const a = pts[i], b = pts[j];
    if ((a.k === 'asc' && b.k === 'mc') || (a.k === 'mc' && b.k === 'asc')) continue;
    if ((a.k === 'north_node' || b.k === 'north_node') && (a.k === 'chiron' || b.k === 'chiron')) continue;
    let d = Math.abs(a.l - b.l); if (d > 180) d = 360 - d;
    const angular = ['asc', 'mc'].includes(a.k) || ['asc', 'mc'].includes(b.k) || a.k === 'north_node' || b.k === 'north_node';
    for (const A of ASPECTS) {
      const orb = Math.abs(d - A.a), lim = angular ? Math.min(A.orb, 5) : A.orb;
      if (orb <= lim) asp.push({ t: `${nm(a.k)} ${A.n} ${nm(b.k)} (${dm(orb)} orb)`, orb });
    }
  }
  asp.sort((x, y) => x.orb - y.orb);
  if (asp.length) lines.push('', 'TIGHTEST ASPECTS', ...asp.slice(0, 12).map((x) => x.t));

  /* elements and modes, the ten planets */
  const el = [0, 0, 0, 0], mo = [0, 0, 0];
  planets.forEach((b) => { const i = SIGNS.indexOf(String(b.sign).toLowerCase()); if (i >= 0) { el[i % 4]++; mo[i % 3]++; } });
  lines.push('', 'BALANCE (ten planets)', ELEMENT.map((e, i) => `${cap(e)} ${el[i]}`).join(', '), MODE.map((m, i) => `${cap(m)} ${mo[i]}`).join(', '));

  const nn = by('north_node');
  if (nn) {
    const ss = SIGNS[(SIGNS.indexOf(String(nn.sign).toLowerCase()) + 6) % 12];
    lines.push('', 'NODES', `North Node ${cap(String(nn.sign))}${nn.house ? ` in the ${ord(nn.house)} house` : ''}; South Node ${cap(ss)}${nn.house ? ` in the ${ord(((nn.house + 5) % 12) + 1)} house` : ''}`);
  }
  return lines.join('\n');
}
