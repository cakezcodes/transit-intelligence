/**
 * Cosmic Convergence — the timing techniques layer.
 *
 * Annual + monthly profections (whole sign from the Ascendant, traditional rulers),
 * the year lord's own sky events, zodiacal releasing from Fortune and Spirit (L3 changes
 * and peaks), firdaria major periods, secondary-progressed Moon aspects, and power days.
 * Natal inputs come from the /api/natal chart (Celestine); progressed positions use
 * Celestine too (rule 1). The sky events come from sky.mjs.
 */

import * as C from 'celestine';
import * as A from 'astronomy-engine';
import { PG, SIGNS, signGlyph, signLabel, skyTitle, lon, ASPECTS, signOf } from './sky.mjs';
import { HOUSE_THEMES, houseOf, timeFmt } from './personal.mjs';

const VS = '︎';
const DAY = 86400000;
const P = (p) => `${PG[p]}${VS} ${p}`;
const RULER = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const ZR_YEARS = [15, 8, 20, 25, 19, 20, 8, 15, 12, 27, 30, 12];
const norm = (x) => ((x % 360) + 360) % 360;
const dm = (l) => { const d = norm(l) % 30; return `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, '0')}′`; };

/** local calendar date parts of an instant in a zone */
function ymd(ms, timeZone) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day };
}
/** noon local on a calendar date, as an instant (all-day events key off the date) */
const dayMs = (y, m, d) => Date.UTC(y, m - 1, d, 12);
const fmtDay = (ms) => new Date(ms).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
const fmtMD = (ms) => { const x = new Date(ms); return `${x.getUTCMonth() + 1}/${x.getUTCDate()}`; };

/**
 * @param {object} chart   /api/natal chart + { birthMs, timeZone }
 * @param {object[]} sky   skyEvents() covering the window
 * @param {number} t0,t1   window (ms)
 */
export function convergenceEvents(chart, sky, t0, t1) {
  if (!chart.timeKnown || chart.asc == null || !chart.cusps?.porphyry) return [];
  const tz = chart.timeZone;
  const cusps = chart.cusps.porphyry;
  const ascSign = signOf(chart.asc);
  const body = (k) => chart.bodies.find((b) => b.key === k);
  const sunLon = body('sun').lon, moonLon = body('moon').lon;
  // sect: the Sun above the horizon (houses 7–12) is a day chart
  const day = houseOf(sunLon, cusps) >= 7;
  const birth = ymd(chart.birthMs, tz);
  const wsHouse = (sign) => ((sign - ascSign + 12) % 12) + 1;
  const out = [];
  const push = (e) => { if (e.start >= t0 - DAY && e.start <= t1) out.push(e); };

  /* ── profections ── */
  const yearOf = (age) => { const sign = (ascSign + age) % 12; return { sign, house: wsHouse(sign), lord: RULER[sign] }; };
  const birthday = (age) => dayMs(birth.y + age, birth.m, birth.d);
  const ageAt = (ms) => { const { y, m, d } = ymd(ms, tz); return y - birth.y - (m < birth.m || (m === birth.m && d < birth.d) ? 1 : 0); };

  const firstAge = ageAt(t0), lastAge = ageAt(t1);
  const firdaria = firdariaPeriods(day, chart.birthMs);
  for (let age = firstAge; age <= lastAge + 1; age++) {
    const bd = birthday(age);
    if (bd < t0 - DAY || bd > t1) continue;
    const Y = yearOf(age);
    const same = [];
    if (firdaria.some((f) => Math.abs(f.start - bd) < 2 * DAY)) same.push('Firdaria ' + firdaria.find((f) => Math.abs(f.start - bd) < 2 * DAY).lord + ' period opens');
    same.push('solar return', 'monthly profection resets');
    push({
      key: `profection:year:${age}`, start: bd, allDay: true, house: Y.house,
      title: `✦ ${Y.house}H • CONVERGENCE | Year Lord ${P(Y.lord)} · ${signGlyph(Y.sign)}`,
      description: `ANNUAL PROFECTION\nAge ${age} = ${Y.house}H year · ${signLabel(Y.sign)} · Lord of the Year ${P(Y.lord)}.\nTheme for the next 12 months: ${HOUSE_THEMES[Y.house]}.\nWatch every ${Y.lord} transit this year — ${Y.lord} is driving.\n\nCONVERGENCE\nSame day: ${same.join(', ')}.\n\nDETAILS\nRuns ${fmtDay(bd)} – ${fmtDay(birthday(age + 1))}`,
    });
  }
  // monthly profections: each month turns on the birthday's day-of-month; month 0 is the annual reset
  for (let ms = t0 - 31 * DAY; ms <= t1; ms += 27 * DAY) {
    const { y, m } = ymd(ms, tz);
    const start = dayMs(y, m, Math.min(birth.d, 28));
    const age = ageAt(start);
    const k = (m - birth.m + 12) % 12;
    if (k === 0 || out.some((e) => e.key === `profection:month:${y}-${m}`)) continue;
    const Y = yearOf(age), sign = (Y.sign + k) % 12, house = wsHouse(sign), lord = RULER[sign];
    const next = dayMs(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1, Math.min(birth.d, 28));
    push({
      key: `profection:month:${y}-${m}`, start, allDay: true, house,
      title: `✦ ${house}H • CONVERGENCE | Month Lord ${P(lord)} · ${signGlyph(sign)}`,
      description: `MONTHLY PROFECTION\n${signLabel(sign)} · ${house}H month — ${HOUSE_THEMES[house]}.\nMonth lord ${P(lord)} · Year lord ${P(Y.lord)} (${Y.house}H year).\n\nDETAILS\nRuns ${fmtMD(start)} – ${fmtMD(next)}`,
    });
  }

  /* ── the year lord's own sky events ── */
  for (const e of sky) {
    if (!['station', 'ingress', 'shadow'].includes(e.kind)) continue;
    const Y = yearOf(ageAt(e.t));
    if (e.planet !== Y.lord) continue;
    const l = lon(e.planet, e.t), house = houseOf(l, cusps), sign = e.kind === 'ingress' ? e.sign : signOf(l);
    const title = skyTitle(e).replace(P(e.planet), `Year Lord ${P(e.planet)}`);
    push({
      key: `yearlord:${e.kind}:${e.planet}:${Math.round(e.t / 60000)}`, start: e.t, allDay: false, house,
      title: `✦ ${house}H • CONVERGENCE | ${title} · ${signGlyph(sign)}`,
      description: `LORD OF THE YEAR\n${P(e.planet)} runs your ${Y.house}H profection year (${signLabel(Y.sign)}). When the year lord shifts, the whole year shifts with it.\nTransiting ${e.planet} ${dm(l)} ${SIGNS[signOf(l)]} · ${house}H — ${HOUSE_THEMES[house]}.\n\nDETAILS\n${timeFmt(e.t, tz)}`,
    });
  }

  /* ── firdaria majors ── */
  for (const f of firdaria) {
    if (f.start < t0 - DAY || f.start > t1 || !body(f.lord.toLowerCase())) continue;
    const nb = body(f.lord.toLowerCase()), house = houseOf(nb.lon, cusps), sign = signOf(nb.lon);
    const prev = firdaria[firdaria.indexOf(f) - 1];
    push({
      key: `firdaria:${f.lord}:${f.start}`, start: dayMs(...Object.values(ymd(f.start, tz))), allDay: true, house,
      title: `✦ ${house}H • CONVERGENCE | Firdaria ${P(f.lord)} · ${signGlyph(sign)}`,
      description: `FIRDARIA\n${prev ? `${prev.lord} period closes. ` : ''}${f.lord} period opens — ${f.years} years, ${fmtDay(f.start)} – ${fmtDay(f.end)}.\nFirst sub-period: ${P(f.lord)} / ${P(f.subs[0])}.\nNatal ${f.lord} ${dm(nb.lon)} ${SIGNS[sign]} · ${house}H — ${HOUSE_THEMES[house]}.`,
    });
  }

  /* ── zodiacal releasing: L3 changes from Fortune and Spirit ── */
  const fortune = norm(day ? chart.asc + moonLon - sunLon : chart.asc + sunLon - moonLon);
  const spirit = norm(day ? chart.asc + sunLon - moonLon : chart.asc + moonLon - sunLon);
  const fortuneSign = signOf(fortune);
  const lots = [
    { name: 'Fortune', sign: signOf(fortune), about: 'Fortune tracks body, health, circumstances, what happens to you.' },
    { name: 'Spirit', sign: signOf(spirit), about: 'Spirit tracks career, action, what you are building.' },
  ];
  for (const lot of lots) {
    for (const p of releasing(lot.sign, chart.birthMs, t0 - 400 * DAY, t1)) {
      if (p.start < t0 - DAY || p.start > t1) continue;
      const house = wsHouse(p.l3), peak = [0, 3, 6, 9].includes((p.l3 - fortuneSign + 12) % 12);
      const isPeak = (s) => [0, 3, 6, 9].includes((s - fortuneSign + 12) % 12);
      const ord = ['1st', '4th', '7th', '10th'][[0, 3, 6, 9].indexOf((p.l3 - fortuneSign + 12) % 12)];
      const start = dayMs(...Object.values(ymd(p.start, tz)));
      push({
        key: `zr:${lot.name}:${p.start}`, start, allDay: true, house,
        title: `✦ ${house}H • CONVERGENCE | ${lot.name} L3${peak ? ' Peak' : ''} → ${signLabel(p.l3)} · ${signGlyph(p.l3)}`,
        description: `ZODIACAL RELEASING · ${lot.name.toUpperCase()}\n${lot.about}\nL3 period: ${signLabel(p.l3)} · ${house}H — ${HOUSE_THEMES[house]}.\nRuns ${fmtDay(start)} – ${fmtDay(dayMs(...Object.values(ymd(p.end, tz))))}.\nStack: L1 ${signGlyph(p.l1)}${isPeak(p.l1) ? ' peak' : ''} · L2 ${signGlyph(p.l2)}${isPeak(p.l2) ? ' peak' : ''} · L3 ${signGlyph(p.l3)}${peak ? ' peak' : ''}${peak ? `\nPeak: ${SIGNS[p.l3]} is a peak (${ord} from Fortune). Visibility and momentum go up.` : ''}\n\nDETAILS\nPeriod ruler: ${P(RULER[p.l3])}`,
      });
    }
  }

  /* ── power days: two themes (or three hits) perfecting on the same local day ── */
  out.push(...powerDays(chart, cusps, sky, t0, t1, tz));

  /* ── secondary progressions: the progressed Moon's exact aspects to natal planets ── */
  out.push(...progressedMoon(chart, cusps, t0, t1, tz));

  return out.sort((a, b) => a.start - b.start);
}

/* ── firdaria (day/night order), each major split into seven equal sub-periods ── */
const CHALDEAN = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
function firdariaPeriods(day, birthMs) {
  const order = day
    ? [['Sun', 10], ['Venus', 8], ['Mercury', 13], ['Moon', 9], ['Saturn', 11], ['Jupiter', 12], ['Mars', 7], ['North Node', 3], ['South Node', 2]]
    : [['Moon', 9], ['Saturn', 11], ['Jupiter', 12], ['Mars', 7], ['Sun', 10], ['Venus', 8], ['Mercury', 13], ['North Node', 3], ['South Node', 2]];
  const YEAR = 365.2422 * DAY;
  const out = [];
  let t = birthMs;
  for (let cycle = 0; cycle < 2; cycle++) {
    for (const [lord, years] of order) {
      const start = t, end = t + years * YEAR;
      const i = CHALDEAN.indexOf(lord);
      const subs = i < 0 ? [] : Array.from({ length: 7 }, (_, k) => CHALDEAN[(i + k) % 7]);
      out.push({ lord, years, start, end, subs });
      t = end;
    }
  }
  // the anniversary is the date that matters, not the exact instant
  return out.map((f) => ({ ...f, start: anniversary(birthMs, f.start), end: anniversary(birthMs, f.end) }));
}
function anniversary(birthMs, ms) {
  const b = new Date(birthMs), y = new Date(ms).getUTCFullYear();
  const cand = [y - 1, y, y + 1].map((yy) => Date.UTC(yy, b.getUTCMonth(), b.getUTCDate(), b.getUTCHours(), b.getUTCMinutes()));
  return cand.sort((a, c) => Math.abs(a - ms) - Math.abs(c - ms))[0];
}

/* ── zodiacal releasing (Valens): L1 years ×360d, L2 sign-years ×30d, L3 ×2.5d; loosing of the bond after 12 ── */
function releasing(startSign, birthMs, from, to) {
  const out = [];
  const L1u = 360 * DAY, L2u = 30 * DAY, L3u = 2.5 * DAY;
  let t1s = birthMs, s1 = startSign;
  while (t1s < to) {
    const e1 = t1s + ZR_YEARS[s1] * L1u;
    if (e1 > from) {
      let t2s = t1s, s2 = s1, n2 = 0;
      while (t2s < e1 && t2s < to) {
        const e2 = Math.min(e1, t2s + ZR_YEARS[s2] * L2u);
        if (e2 > from) {
          let t3s = t2s, s3 = s2, n3 = 0;
          while (t3s < e2 && t3s < to) {
            const e3 = Math.min(e2, t3s + ZR_YEARS[s3] * L3u);
            if (e3 > from) out.push({ l1: s1, l2: s2, l3: s3, start: t3s, end: e3 });
            t3s = e3;
            n3++;
            s3 = n3 === 12 ? (s3 + 7) % 12 : (s3 + 1) % 12; // loosing of the bond: jump to the opposite of the 12th
          }
        }
        t2s = e2;
        n2++;
        s2 = n2 === 12 ? (s2 + 7) % 12 : (s2 + 1) % 12;
      }
    }
    t1s = e1;
    s1 = (s1 + 1) % 12;
  }
  return out;
}

/* ── progressed Moon (day-for-a-year, Celestine) ── */
function progressedMoon(chart, cusps, t0, t1, tz) {
  const YEAR = 365.2422 * DAY;
  const jd0 = chart.birthMs / DAY + 2440587.5;
  const progLon = (ms) => C.getPosition(C.CelestialBody.Moon, jd0 + (ms - chart.birthMs) / YEAR).longitude;
  const targets = chart.bodies.filter((b) => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(b.key));
  const out = [];
  for (const nb of targets) {
    for (const asp of ASPECTS) {
      for (const sgn of asp.angle % 180 ? [1, -1] : [1]) {
        const f = (ms) => { let d = norm(progLon(ms) - nb.lon - sgn * asp.angle); return d > 180 ? d - 360 : d; };
        for (let a = t0; a < t1; a += 5 * DAY) {
          const b = a + 5 * DAY, fa = f(a), fb = f(b);
          if (Math.sign(fa) === Math.sign(fb) || Math.abs(fa - fb) > 30) continue;
          let lo = a, hi = b;
          for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (Math.sign(f(m)) === Math.sign(fa)) lo = m; else hi = m; }
          const pl = progLon(lo), house = houseOf(pl, cusps), name = nb.key[0].toUpperCase() + nb.key.slice(1);
          const { y, m, d } = ymd(lo, tz);
          out.push({
            key: `prog:moon:${nb.key}:${asp.name}:${y}-${m}-${d}`, start: dayMs(y, m, d), allDay: true, house, aspect: asp.name,
            title: `✦ ${house}H • CONVERGENCE | Prog ${P('Moon')} ${asp.glyph} ${P(name)} · ${signGlyph(signOf(pl))}`,
            description: `SECONDARY PROGRESSION\nProgressed Moon ${dm(pl)} ${SIGNS[signOf(pl)]} exact ${asp.name === 'conjunction' ? 'conjunct' : asp.name === 'opposition' ? 'opposite' : asp.name} natal ${name} ${dm(nb.lon)} ${SIGNS[signOf(nb.lon)]}.\nProgressed Moon in your ${house}H — ${HOUSE_THEMES[house]}.\nSlow inner-timing marker: this is the background tone for weeks either side, not one day.\n\nDETAILS\nExact date (day-for-a-year)`,
          });
        }
      }
    }
  }
  return out;
}

/* ── power days ──
   categories (title order): ♛ Career · ♃︎ Luck · ⊕ Money · ☿︎ Deal · ♡ Love
   hits are exact transit contacts (conjunction / sextile / trine) or New Moons, on the user's local date */
const SOFT = ASPECTS.filter((a) => a.angle === 0 || a.angle === 60 || a.angle === 120);
const POWER = [
  { key: 'career', label: '♛ Career', line: 'you get noticed. post, launch, put your name on it.', movers: ['Sun', 'Venus', 'Jupiter', 'NewMoon'], targets: ['mc', 'jupiter'] },
  { key: 'luck', label: `${PG.Jupiter}${VS} Luck`, line: 'doors open easier than usual. ask, apply, shoot your shot.', movers: ['Jupiter'], targets: ['sun', 'moon', 'venus', 'asc'] },
  { key: 'money', label: '⊕ Money', line: 'good day to price, pitch, invoice, or ask for more.', houses: [2, 8] },
  { key: 'deal', label: `${PG.Mercury}${VS} Deal`, line: 'words land. sign, send, negotiate, close it out.', movers: ['Mercury'], targets: ['sun', 'jupiter', 'mc'] },
  { key: 'love', label: '♡ Love', line: 'magnetic energy. dates, flirting, closeness, saying the thing.', movers: ['Venus', 'Mars'], targets: ['moon', 'venus'] },
];
const NAME = (k) => (k === 'mc' ? 'MC' : k === 'asc' ? 'ASC' : P(k[0].toUpperCase() + k.slice(1)));

function powerDays(chart, cusps, sky, t0, t1, tz) {
  const pts = Object.fromEntries(chart.bodies.map((b) => [b.key, b.lon]));
  pts.mc = chart.mc; pts.asc = chart.asc;
  const hits = [];
  const exact = (mover, target, asp, sgn) => {
    const f = (ms) => { let d = norm(lon(mover, ms) - pts[target] - sgn * asp.angle); return d > 180 ? d - 360 : d; };
    const out = [];
    for (let a = t0; a < t1; a += 6 * 3600000) {
      const b = a + 6 * 3600000, fa = f(a), fb = f(b);
      if (Math.sign(fa) === Math.sign(fb) || Math.abs(fa - fb) > 30) continue;
      let lo = a, hi = b;
      for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (Math.sign(f(m)) === Math.sign(fa)) lo = m; else hi = m; }
      out.push(lo);
    }
    return out;
  };
  for (const cat of POWER) {
    if (cat.houses) continue;
    for (const mover of cat.movers.filter((m) => m !== 'NewMoon')) {
      for (const target of cat.targets) {
        for (const asp of SOFT) for (const sgn of asp.angle % 180 ? [1, -1] : [1]) {
          for (const t of exact(mover, target, asp, sgn)) hits.push({ cat: cat.key, t, text: `${P(mover)} ${asp.glyph} natal ${NAME(target).replace(/^natal /, '')}` });
        }
      }
    }
  }
  // New Moons: career when they aspect natal Jupiter / MC (≤3°), money when they fall in the 2nd/8th
  for (const nm of newMoonsIn(t0, t1)) {
    const l = nm.lon, sg = signLabel(signOf(l)), house = houseOf(l, cusps);
    if ([2, 8].includes(house)) hits.push({ cat: 'money', t: nm.t, text: `🌑 ${sg} in your ${house}H` });
    for (const target of ['jupiter', 'mc']) {
      let d = Math.abs(l - pts[target]) % 360; if (d > 180) d = 360 - d;
      const a = SOFT.find((x) => Math.abs(d - x.angle) <= 3);
      if (a) hits.push({ cat: 'career', t: nm.t, text: `🌑 ${sg} ${a.glyph} natal ${NAME(target)}` });
    }
  }
  const byDay = {};
  for (const h of hits) { const { y, m, d } = ymd(h.t, tz); (byDay[`${y}-${m}-${d}`] ||= []).push(h); }
  const out = [];
  for (const [k, list] of Object.entries(byDay)) {
    const cats = POWER.filter((c) => list.some((h) => h.cat === c.key));
    // a power day needs two different themes, or three hits stacking on one
    if (cats.length < 2 && list.length < 3) continue;
    const [y, m, d] = k.split('-').map(Number);
    const label = (c) => c.label;
    list.sort((a, b) => a.t - b.t);
    out.push({
      key: `power:${k}`, start: dayMs(y, m, d), allDay: true,
      title: `✦ POWER DAY | ${cats.map(label).join(' · ')}`,
      description: `${cats.map((c) => `${c.label}: ${c.line}`).join('\n')}\n\nWHAT'S HITTING\n${list.map((h) => `· ${h.text} (${POWER.find((c) => c.key === h.cat).label.split(' ').pop()})`).join('\n')}`,
    });
  }
  return out;
}

function newMoonsIn(t0, t1) {
  const out = [];
  let t = t0;
  for (;;) {
    const r = A.SearchMoonPhase(0, new Date(t), 40);
    if (!r || r.date.getTime() > t1) break;
    out.push({ t: r.date.getTime(), lon: lon('Moon', r.date.getTime()) });
    t = r.date.getTime() + DAY;
  }
  return out;
}
