/**
 * Personal Cosmic Calendars — Natal, Divination, Ritual — for any chart.
 *
 * Every public sky + moon event (voids excepted) is placed in the user's house
 * (Porphyry cusps from POST /api/natal, i.e. Celestine) and annotated with the
 * natal points the moving body touches within 4°. Divination and Ritual read the
 * same events through their own lens; a void-of-course Moon overrides both.
 */

import { PG, SIGNS, signGlyph, signLabel, skyTitle, moonTitle, signOf, lon, ASPECTS } from './sky.mjs';

const VS = '︎';
export const HOUSE_THEMES = {
  1: 'identity, self-image, how you show up',
  2: 'money, values, self-worth, what you own',
  3: 'communication, learning, siblings, neighborhood',
  4: 'home, family, roots, emotional foundation',
  5: 'creativity, romance, children, pleasure, play',
  6: 'daily routines, health, work, service, systems',
  7: 'partnerships, contracts, one-on-one dynamics',
  8: 'shared resources, intimacy, transformation, power',
  9: 'beliefs, higher learning, travel, worldview, publishing',
  10: 'career, public image, reputation, legacy',
  11: 'community, friends, networks, future vision',
  12: 'rest, solitude, hidden patterns, surrender, spirituality',
};
/* orbs for transit-to-natal contacts, per aspect (fitted to the published Natal feed) */
const NATAL_ORBS = { conjunction: 4, opposition: 4, square: 3.5, trine: 3.5, sextile: 2.5 };
const NATAL_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
/* a transit "activates" natal points for Divination/Ritual when any contact is within 3° */
const ACTIVATES = (c) => c.orb <= 3;
const cap = (s) => s[0].toUpperCase() + s.slice(1);

/** natal points from the /api/natal chart shape: bodies[] + asc/mc */
export function natalPoints(chart) {
  const pts = chart.bodies
    .filter((b) => NATAL_KEYS.includes(b.key))
    .map((b) => ({ key: b.key, label: `natal ${PG[cap(b.key)]}${VS} ${cap(b.key)}`, lon: b.lon }));
  if (chart.timeKnown && chart.asc != null) pts.push({ key: 'asc', label: 'ASC', lon: chart.asc }, { key: 'mc', label: 'MC', lon: chart.mc });
  return pts;
}

export function houseOf(l, cusps) {
  for (let i = 0; i < 12; i++) {
    const a = cusps[i], b = cusps[(i + 1) % 12];
    if (a < b ? l >= a && l < b : l >= a || l < b) return i + 1;
  }
  return 1;
}

/** which body an event belongs to (whose house, whose contacts) */
function moverOf(e) {
  if (e.kind === 'aspect' || e.kind === 'cazimi') return e.a;
  if (e.kind === 'phase') return 'Moon';
  return e.planet;
}

function contactsAt(l, points) {
  const out = [];
  for (const p of points) {
    let d = Math.abs(l - p.lon) % 360;
    if (d > 180) d = 360 - d;
    for (const asp of ASPECTS) {
      const orb = Math.abs(d - asp.angle);
      if (orb <= NATAL_ORBS[asp.name] + 0.05) out.push({ point: p, aspect: asp, orb });
    }
  }
  return out.sort((a, b) => a.orb - b.orb);
}

export const timeFmt = (ms, timeZone) =>
  new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date(ms)) + ` ${zoneAbbr(ms, timeZone)}`;
const dateTimeFmt = (ms, timeZone) =>
  new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ms)) + ` ${timeFmt(ms, timeZone)}`;
/** "ET", "CT", "PT"… — the generic zone name, as the feeds print it */
export function zoneAbbr(ms, timeZone) {
  const n = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortGeneric' }).formatToParts(new Date(ms)).find((x) => x.type === 'timeZoneName')?.value || '';
  return /^[A-Z]{1,4}$/.test(n) ? n : n.replace(/^GMT/, 'UTC');
}

/**
 * Build the personal layer.
 * @param {object} chart  /api/natal chart (bodies, asc, mc, cusps.porphyry, timeKnown)
 * @param {object[]} sky  skyEvents()
 * @param {object[]} moon moonEvents()
 * @param {string} timeZone the user's IANA zone
 * @returns {object[]} [{ key, t, house, sign, summary: {natal,divination,ritual}, description: {…} }]
 */
export function personalEvents(chart, sky, moon, timeZone) {
  const cusps = chart.cusps?.porphyry;
  if (!cusps) return []; // no birth time → no houses → no personal layer (never noon houses)
  const points = natalPoints(chart);
  const voids = moon.filter((e) => e.kind === 'voc');
  const events = [...sky, ...moon.filter((e) => e.kind === 'phase')].sort((a, b) => a.t - b.t);

  return events.map((e) => {
    const body = moverOf(e);
    const l = lon(body, e.t);
    const house = houseOf(l, cusps);
    const sign = e.kind === 'ingress' ? e.sign : signOf(l); // an ingress reads as the sign being entered
    const contacts = contactsAt(l, points);
    const themes = HOUSE_THEMES[house];
    const voc = voids.find((v) => e.t >= v.t && e.t < v.end);
    const when = timeFmt(e.t, timeZone);

    /* titles */
    const lunation = e.kind === 'phase' && (e.phase === 'new' || e.phase === 'full');
    const base = e.kind === 'phase' ? moonTitle(e) : skyTitle(e);
    const title = (product) =>
      lunation ? `${base} · ${house}H` : `✦ ${house}H • ${product} | ${base}${e.kind === 'phase' ? '' : ` · ${signGlyph(sign)}`}`;

    /* natal: house + contacts */
    const natal = [`${contacts.length ? 'Your' : 'Activating your'} ${house}H — ${themes}.`, ...contacts.map((c) => `Transit ${c.aspect.name} your ${c.point.label} (${c.orb.toFixed(1)}° orb)`), '', 'DETAILS', when].join('\n');

    /* divination + ritual */
    const vocLine = (verb) => voc && `Moon is void-of-course. No ${verb} until ${PG.Moon}${VS} enters ${signLabel(voc.sign)} at ${dateTimeFmt(voc.end, timeZone)}.`;
    let div, rit;
    if (voc) {
      div = vocLine('readings');
      rit = vocLine('spell work');
    } else if (e.kind === 'phase' && e.phase === 'new') {
      div = `Prime window for intention-setting spreads. Pull for ${house}H themes: ${themes}. Ask: What wants to begin here?`;
      rit = `PRIME MANIFESTATION WINDOW. Set intentions for ${house}H themes. Write it down, light a candle, speak it aloud. ${SIGNS[sign]} energy favors bold, clear asks.`;
    } else if (e.kind === 'phase' && e.phase === 'full') {
      div = `Peak clarity for revelation spreads. The ${house}H is illuminated — pull for what's culminating or releasing. Ask: What's ready to be seen?`;
      rit = `RELEASE + CHARGE. Release what's blocking your ${house}H. Charge crystals, water, tools under the Full Moon. Gratitude ritual for what's arrived.`;
    } else if (e.kind === 'phase' && e.phase === 'dark') {
      div = `Shadow work spreads only. No future-casting. Pull for what's hidden in your ${house}H. Ask: What am I not seeing?`;
      rit = `BANISHING + SHADOW WORK ONLY. Cord-cutting, banishing, binding. Your ${house}H shadow material surfaces — work with it, not against it. No manifestation.`;
    } else if (e.kind === 'cazimi') {
      div = `Rare clarity window. Pull for breakthroughs in your ${house}H. The veil is thinnest — trust what comes through.`;
      rit = `RARE POWER WINDOW. Cazimi = planet in the heart of the Sun. Maximum potency for any working related to your ${house}H. Don't waste this.`;
    } else if (e.kind === 'station') {
      const rx = e.direction === 'retrograde';
      div = `Major timing marker — ${rx ? 'turning inward' : 'moving forward'}. Pull a three-card past/present/future for your ${house}H themes. The pivot point is now.`;
      rit = rx
        ? `REVIEW + REVISIT RITUALS. Redo or adjust spell work from the past cycle related to your ${house}H. Retrograde energy is for revision, not initiation.`
        : `GREEN LIGHT TO RESTART. Resume spell work that was paused during the retrograde. Your ${house}H themes are moving forward — act.`;
    } else if (contacts.some(ACTIVATES)) {
      div = `Transit activating natal points — good time for a targeted pull about ${themes}.`;
      rit = `Transit hitting natal points in your ${house}H — potent window for targeted workings related to ${themes}.`;
    } else {
      div = `Moderate divination window. Best for ${house}H questions about ${themes}.`;
      rit = `Standard timing. ${SIGNS[sign]} energy supports ${house}H rituals — ${themes}.`;
    }

    return {
      key: `${e.kind}:${body}:${e.b || e.phase || e.direction || e.phase || ''}:${e.aspect?.name || ''}:${Math.round(e.t / 60000)}`,
      t: e.t,
      house,
      sign,
      lunation,
      summary: { natal: title('NATAL'), divination: title('DIVINATION'), ritual: title('RITUAL'), complete: title('COMPLETE') },
      description: { natal, divination: `${div}\n\n${when}`, ritual: `${rit}\n\n${when}` },
    };
  });
}
