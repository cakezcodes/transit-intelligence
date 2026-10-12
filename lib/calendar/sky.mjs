/**
 * The sky event engine — the public layer of the Cosmic Calendars
 * (Cosmic Sky, Cosmic Moon, Cosmic Essentials).
 *
 * Positions: astronomy-engine (apparent geocentric ecliptic longitude of date).
 * Accuracy vs the Swiss Ephemeris feeds: lunar events within ~1 minute; planetary
 * aspects/stations within ~20 minutes (astronomy-engine is good to ~1′ of arc).
 * This is the "global almanac" per CLAUDE.md rule 1 — natal charts stay on
 * Celestine. Times are found by bracketing a sign change on a coarse grid and
 * bisecting to the second.
 *
 * Event taxonomy and titles follow astrocake-design-system
 * docs/calendar-event-architecture.md (locked Oct 2026) and the Q4 2026 feeds.
 */

import * as A from 'astronomy-engine';

export const PLANETS = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const VS = '︎';
export const PG = { Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇' };
export const SG = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
export const ASPECTS = [
  { name: 'conjunction', angle: 0, glyph: '☌' },
  { name: 'sextile', angle: 60, glyph: '⚹' },
  { name: 'square', angle: 90, glyph: '□' },
  { name: 'trine', angle: 120, glyph: '△' },
  { name: 'opposition', angle: 180, glyph: '☍' },
];

export const planetLabel = (p) => `${PG[p]}${VS} ${p}`;
export const signLabel = (i) => `${SG[i]}${VS} ${SIGNS[i]}`;
export const signGlyph = (i) => `${SG[i]}${VS}`;

const DAY = 86400000;
const norm = (x) => ((x % 360) + 360) % 360;
const wrap180 = (x) => {
  const v = norm(x);
  return v > 180 ? v - 360 : v;
};

/* positions repeat across every aspect angle scanned on the same grid — memoize them */
const MEMO = new Map();
/** apparent geocentric ecliptic longitude of date, degrees */
export function lon(body, ms) {
  const k = body + ms;
  let v = MEMO.get(k);
  if (v === undefined) {
    v = rawLon(body, ms);
    if (MEMO.size > 400000) MEMO.clear();
    MEMO.set(k, v);
  }
  return v;
}
function rawLon(body, ms) {
  const t = new Date(ms);
  if (body === 'Moon') return A.EclipticGeoMoon(t).lon;
  if (body === 'Sun') return A.SunPosition(t).elon;
  return A.Ecliptic(A.GeoVector(body, t, true)).elon;
}
export const signOf = (l) => Math.floor(norm(l) / 30);
/** daily motion in degrees/day (central difference) */
export const speed = (body, ms) => wrap180(lon(body, ms + 3600000) - lon(body, ms - 3600000)) * 12;

/** find every t in [t0,t1] where f crosses zero upward or downward; f must be continuous near roots */
function roots(f, t0, t1, step, guard = 30) {
  const out = [];
  let a = t0;
  let fa = f(a);
  for (let b = t0 + step; b <= t1 + step; b += step) {
    const fb = f(b);
    // a real crossing, not a ±180 wrap jump
    if (fa === 0 || (Math.sign(fa) !== Math.sign(fb) && Math.abs(fa - fb) < guard)) {
      let lo = a, hi = b, flo = fa;
      for (let i = 0; i < 40 && hi - lo > 500; i++) {
        const mid = (lo + hi) / 2, fm = f(mid);
        if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else hi = mid;
      }
      const t = (lo + hi) / 2;
      if (t >= t0 && t <= t1) out.push(t);
    }
    a = b;
    fa = fb;
  }
  return out;
}

const STEP = { Moon: 2 * 3600000, Sun: 12 * 3600000, Mercury: 6 * 3600000, Venus: 6 * 3600000, Mars: 12 * 3600000 };
const stepFor = (...bodies) => Math.min(...bodies.map((b) => STEP[b] ?? DAY));

/* ─────────────── planetary events (Cosmic Sky) ─────────────── */

/** exact aspects between two planets */
function aspectEvents(a, b, t0, t1) {
  const out = [];
  const step = stepFor(a, b);
  for (const asp of ASPECTS) {
    const targets = asp.angle === 0 || asp.angle === 180 ? [asp.angle] : [asp.angle, -asp.angle];
    for (const target of targets) {
      const f = (ms) => wrap180(lon(a, ms) - lon(b, ms) - target);
      for (const t of roots(f, t0, t1, step)) out.push({ kind: 'aspect', a, b, aspect: asp, t });
    }
  }
  return out;
}

/** stations: zero crossings of daily motion */
function stationEvents(p, t0, t1) {
  if (p === 'Sun') return [];
  return roots((ms) => speed(p, ms), t0, t1, stepFor(p)).map((t) => ({
    kind: 'station',
    planet: p,
    direction: speed(p, t + 2 * DAY) < 0 ? 'retrograde' : 'direct',
    t,
    lon: lon(p, t),
  }));
}

/** sign ingresses (incl. retrograde re-entries) */
function ingressEvents(p, t0, t1) {
  const out = [];
  for (let s = 0; s < 12; s++) {
    const f = (ms) => wrap180(lon(p, ms) - s * 30);
    for (const t of roots(f, t0, t1, stepFor(p))) {
      const rx = speed(p, t) < 0;
      out.push({ kind: 'ingress', planet: p, sign: rx ? (s + 11) % 12 : s, retro: rx, t });
    }
  }
  return out;
}

/** first/last time a planet sits on a longitude, searching forward or backward from a moment */
function crossTime(p, target, from, dir, limitDays = 200) {
  const step = stepFor(p) * dir;
  const f = (ms) => wrap180(lon(p, ms) - target);
  let a = from, fa = f(a);
  for (let i = 0; i < (limitDays * DAY) / Math.abs(step); i++) {
    const b = a + step, fb = f(b);
    if (Math.sign(fa) !== Math.sign(fb) && Math.abs(fa - fb) < 30) {
      let lo = Math.min(a, b), hi = Math.max(a, b), flo = f(lo);
      for (let k = 0; k < 40 && hi - lo > 500; k++) {
        const mid = (lo + hi) / 2, fm = f(mid);
        if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else hi = mid;
      }
      return (lo + hi) / 2;
    }
    a = b;
    fa = fb;
  }
  return null;
}

const SHADOW_PLANETS = ['Mercury', 'Venus', 'Mars'];

/** pre-retrograde shadow entry and post-retrograde shadow exit */
function shadowEvents(p, t0, t1) {
  if (!SHADOW_PLANETS.includes(p)) return [];
  const out = [];
  // a whole retrograde cycle can sit up to ~5 months either side of the window
  const st = stationEvents(p, t0 - 160 * DAY, t1 + 160 * DAY).sort((x, y) => x.t - y.t);
  for (let i = 0; i < st.length - 1; i++) {
    const rx = st[i], d = st[i + 1];
    if (rx.direction !== 'retrograde' || d.direction !== 'direct') continue;
    const enter = crossTime(p, d.lon, rx.t - 3600000, -1);
    const exit = crossTime(p, rx.lon, d.t + 3600000, 1);
    if (enter && enter >= t0 && enter <= t1) out.push({ kind: 'shadow', planet: p, phase: 'enter', t: enter, rx, d });
    if (exit && exit >= t0 && exit <= t1) out.push({ kind: 'shadow', planet: p, phase: 'exit', t: exit, rx, d });
  }
  return out;
}

/** planetary events publish at minute precision (the lunar ones keep seconds), like the published feeds */
const toMinute = (ms) => Math.round(ms / 60000) * 60000;

export function skyEvents(t0, t1) {
  const out = [];
  for (let i = 0; i < PLANETS.length; i++) {
    const p = PLANETS[i];
    out.push(...ingressEvents(p, t0, t1), ...stationEvents(p, t0, t1), ...shadowEvents(p, t0, t1));
    for (let j = i + 1; j < PLANETS.length; j++) {
      for (const e of aspectEvents(p, PLANETS[j], t0, t1)) {
        // a planet conjunct the Sun is only an event when it's a cazimi (inside 17′ — every exact conjunction is)
        if (p === 'Sun' && e.aspect.angle === 0) {
          out.push({ ...e, kind: 'cazimi', a: PLANETS[j], b: 'Sun' });
          continue;
        }
        out.push(e);
      }
    }
  }
  return out.map((e) => ({ ...e, t: toMinute(e.t) })).sort((x, y) => x.t - y.t);
}

/* ─────────────── lunar events (Cosmic Moon) ─────────────── */

const PHASES = [
  { angle: 0, key: 'new' },
  { angle: 90, key: 'first_quarter' },
  { angle: 180, key: 'full' },
  { angle: 270, key: 'last_quarter' },
  { angle: 315, key: 'balsamic' },
];

export function moonEvents(t0, t1) {
  const out = [];
  for (const ph of PHASES) {
    let t = t0 - DAY * 2;
    while (true) {
      const r = A.SearchMoonPhase(ph.angle, new Date(t), 40);
      if (!r || r.date.getTime() > t1 + DAY * 2) break;
      const ms = r.date.getTime();
      if (ms >= t0 && ms <= t1) out.push({ kind: 'phase', phase: ph.key, t: ms, sign: signOf(lon('Moon', ms)), lon: lon('Moon', ms) });
      // the dark moon: the 24 hours before the new moon
      if (ph.key === 'new') {
        const dm = ms - DAY;
        if (dm >= t0 && dm <= t1) out.push({ kind: 'phase', phase: 'dark', t: dm, sign: signOf(lon('Moon', dm)), newMoon: ms });
      }
      t = ms + DAY;
    }
  }
  out.push(...voidEvents(t0, t1));
  return out.sort((x, y) => x.t - y.t);
}

const VOC_BODIES = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

/** void-of-course: from the Moon's last exact major aspect in a sign to its ingress into the next */
export function voidEvents(t0, t1) {
  const out = [];
  const ingresses = [];
  for (let s = 0; s < 12; s++) {
    for (const t of roots((ms) => wrap180(lon('Moon', ms) - s * 30), t0 - 3 * DAY, t1 + 3 * DAY, 2 * 3600000)) {
      ingresses.push({ t, sign: s });
    }
  }
  ingresses.sort((a, b) => a.t - b.t);
  for (let i = 1; i < ingresses.length; i++) {
    const prev = ingresses[i - 1], ing = ingresses[i];
    let last = null;
    for (const b of VOC_BODIES) {
      for (const asp of ASPECTS) {
        const targets = asp.angle === 0 || asp.angle === 180 ? [asp.angle] : [asp.angle, -asp.angle];
        for (const target of targets) {
          const f = (ms) => wrap180(lon('Moon', ms) - lon(b, ms) - target);
          for (const t of roots(f, prev.t, ing.t, 2 * 3600000)) {
            if (!last || t > last.t) last = { t, body: b, aspect: asp };
          }
        }
      }
    }
    if (!last) continue;
    // a window belongs to the feed only when it opens and closes inside it
    if (last.t >= t0 && ing.t <= t1) out.push({ kind: 'voc', t: last.t, end: ing.t, sign: ing.sign, last });
  }
  return out;
}

/* ─────────────── titles (calendar-event-architecture.md) ─────────────── */

export function skyTitle(e) {
  switch (e.kind) {
    case 'aspect':
      return `${planetLabel(e.a)} ${e.aspect.glyph} ${planetLabel(e.b)}`;
    case 'cazimi':
      return `${planetLabel(e.a)} ☌ ${planetLabel('Sun')} · Cazimi`;
    case 'ingress':
      return `${planetLabel(e.planet)}${e.retro ? ' ℞' : ''} → ${signLabel(e.sign)}`;
    case 'station':
      return e.direction === 'retrograde' ? `${planetLabel(e.planet)} ℞` : `${planetLabel(e.planet)} → Direct`;
    case 'shadow':
      return `${planetLabel(e.planet)} → ${e.phase === 'enter' ? 'Shadow' : 'Shadow Exit'}`;
    default:
      return '';
  }
}

export function moonTitle(e) {
  if (e.kind === 'voc') return `✧ ${PG.Moon}${VS} VOC → ${signLabel(e.sign)}`;
  const s = signLabel(e.sign);
  switch (e.phase) {
    case 'new': return `✦ 🌑 ${s}`;
    case 'full': return `✦ 🌕 ${s}`;
    case 'first_quarter': return `${PG.Moon}${VS} First Quarter · ${s}`;
    case 'last_quarter': return `${PG.Moon}${VS} Last Quarter · ${s}`;
    case 'balsamic': return `${PG.Moon}${VS} Balsamic · ${s}`;
    case 'dark': return `${PG.Moon}${VS} Dark Moon · ${s}`;
    default: return '';
  }
}
