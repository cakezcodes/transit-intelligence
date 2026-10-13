/**
 * The eight Cosmic Calendar feeds for one person (or none, for the public three).
 *
 *   public:   sky · moon · essentials (sky + moon)
 *   personal: natal · divination · ritual · convergence · complete (personal + convergence)
 *
 * Public-feed copy (ENERGY FORECAST / LEAN INTO / AVOID / TEA) is product writing and
 * is not in this repo: pass it in as `copy` (key → description) — e.g. loaded from the
 * calendar_copy table — and events without copy fall back to a plain factual line.
 */

import { skyEvents, moonEvents, skyTitle, moonTitle, lon, signOf, SIGNS, PG } from './sky.mjs';
import { personalEvents, timeFmt, zoneAbbr } from './personal.mjs';
import { convergenceEvents } from './convergence.mjs';
import { writeICS } from './ics.mjs';

export const FEEDS = {
  sky: { name: '🪐 Cosmic Sky', personal: false },
  moon: { name: '🌙 Cosmic Moon', personal: false },
  essentials: { name: '✦ Cosmic Essentials', personal: false },
  natal: { name: '✦ Cosmic Natal', personal: true },
  divination: { name: '✦ Cosmic Divination', personal: true },
  ritual: { name: '✦ Cosmic Ritual', personal: true },
  convergence: { name: '✦ Cosmic Convergence', personal: true },
  complete: { name: '✦ Cosmic Complete', personal: true },
};

const dm = (l) => { const d = ((l % 360) + 360) % 360 % 30; return `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, '0')}′`; };
const pos = (body, t) => `${dm(lon(body, t))} ${SIGNS[signOf(lon(body, t))]}`;
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const dateTime = (ms, tz) => `${new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ms))} · ${timeFmt(ms, tz)}`;

/** the stable copy key for a public event (shared by the importer and the generator) */
export function copyKey(e) {
  if (e.kind === 'aspect') return `aspect:${e.a}:${e.aspect.name}:${e.b}`;
  if (e.kind === 'cazimi') return `cazimi:${e.a}`;
  if (e.kind === 'station') return `station:${e.planet}:${e.direction}:${new Date(e.t).toISOString().slice(0, 10)}`;
  if (e.kind === 'ingress') return `ingress:${e.planet}:${SIGNS[e.sign]}${e.retro ? ':rx' : ''}`;
  if (e.kind === 'shadow') return `shadow:${e.planet}:${e.phase}:${new Date(e.t).toISOString().slice(0, 10)}`;
  if (e.kind === 'voc') return `voc:${SIGNS[e.sign]}`;
  return `phase:${e.phase}:${SIGNS[e.sign]}`;
}

export function publicDescription(e, tz, copy) {
  const facts = factDescription(e, tz);
  const c = copy?.[copyKey(e)];
  if (!c) return facts;
  // product copy is the reusable middle (ENERGY FORECAST … TEA); the facts around it are this event's own
  const cut = facts.indexOf('\n\nDETAILS');
  return cut < 0 ? `${facts}\n\n${c}` : `${facts.slice(0, cut)}\n\n${c}${facts.slice(cut)}`;
}

function factDescription(e, tz) {
  switch (e.kind) {
    case 'aspect':
      return `${e.a} ${cap(e.aspect.name)} ${e.b}\n${e.a} ${pos(e.a, e.t)} · ${e.b} ${pos(e.b, e.t)}\n\nDETAILS\n• Exact: ${dateTime(e.t, tz)}`;
    case 'cazimi':
      return `${e.a} Cazimi\n${e.a} in the heart of the Sun · ${pos(e.a, e.t)}\n\nDETAILS\n• Exact: ${dateTime(e.t, tz)}`;
    case 'station':
      return `${e.planet} Stations ${e.direction === 'retrograde' ? 'Retrograde' : 'Direct'}\n${pos(e.planet, e.t)}\n\nDETAILS\n• Exact: ${dateTime(e.t, tz)}`;
    case 'ingress':
      return `${e.planet}${e.retro ? ' (retrograde)' : ''} enters ${SIGNS[e.sign]}\n\nDETAILS\n• Exact: ${dateTime(e.t, tz)}`;
    case 'shadow':
      return `${e.planet} ${e.phase === 'enter' ? 'enters its pre-retrograde shadow' : 'leaves its post-retrograde shadow'}\n\nDETAILS\n• Exact: ${dateTime(e.t, tz)}`;
    case 'voc':
      return `Void-of-course: ${dateTime(e.t, tz)} → ${dateTime(e.end, tz)}. Hold readings and spell work.\n\n${PG.Moon}︎ enters ${SIGNS[e.sign]} at ${timeFmt(e.end, tz)}`;
    default: {
      const names = { new: 'New Moon', full: 'Full Moon', first_quarter: 'First Quarter Moon', last_quarter: 'Last Quarter Moon', balsamic: 'Balsamic Moon', dark: 'Dark Moon' };
      return `${names[e.phase]} in ${SIGNS[e.sign]}\n${pos('Moon', e.t)}\n\nDETAILS\n${dateTime(e.t, tz)}`;
    }
  }
}

/**
 * @param {object|null} chart  /api/natal chart + { birthMs, name } (null → public feeds only)
 * @param {{ start:number, end:number, timeZone:string, copy?:object }} opts
 * @returns {Record<string,string>} feed key → .ics text
 */
export function buildFeeds(chart, { start, end, timeZone, copy }) {
  const sky = skyEvents(start, end);
  const moon = moonEvents(start, end);
  const pub = (list, title) => list.map((e) => ({ key: `pub:${copyKey(e)}:${Math.round(e.t / 60000)}`, summary: title(e), description: publicDescription(e, timeZone, copy), start: e.t, end: e.end }));
  const skyItems = pub(sky, skyTitle), moonItems = pub(moon, moonTitle);
  const byStart = (a, b) => a.start - b.start;
  const out = {
    sky: writeICS({ name: FEEDS.sky.name, timeZone, events: skyItems }),
    moon: writeICS({ name: FEEDS.moon.name, timeZone, events: moonItems }),
    essentials: writeICS({ name: FEEDS.essentials.name, timeZone, events: [...skyItems, ...moonItems].sort(byStart) }),
  };
  if (!chart) return out;

  const who = chart.name ? ` · ${chart.name}` : '';
  const personal = personalEvents(chart, sky, moon, timeZone);
  const conv = convergenceEvents({ ...chart, timeZone }, sky, start, end);
  const layer = (product) => personal.map((p) => ({ key: `${product}:${p.key}`, summary: p.summary[product], description: p.description[product], start: p.t }));
  const convItems = conv.map((c) => ({ key: `conv:${c.key}`, summary: c.title, description: c.description, start: c.start, allDay: c.allDay }));
  const strip = (s) => s.replace(/\n\nDETAILS\n[\s\S]*$/, '').replace(/\n\n[^\n]*\b[AP]M [A-Z]{1,4}$/, '');
  const completeItems = personal.map((p) => ({
    key: `complete:${p.key}`,
    summary: p.summary.complete,
    description: `NATAL\n${strip(p.description.natal)}\n\nDIVINATION\n${strip(p.description.divination)}\n\nRITUAL\n${strip(p.description.ritual)}\n\nDETAILS\n${timeFmt(p.t, timeZone)}`,
    start: p.t,
  }));
  Object.assign(out, {
    natal: writeICS({ name: FEEDS.natal.name + who, timeZone, events: layer('natal') }),
    divination: writeICS({ name: FEEDS.divination.name + who, timeZone, events: layer('divination') }),
    ritual: writeICS({ name: FEEDS.ritual.name + who, timeZone, events: layer('ritual') }),
    convergence: writeICS({ name: FEEDS.convergence.name + who, timeZone, events: convItems }),
    complete: writeICS({ name: FEEDS.complete.name + who, timeZone, events: [...completeItems, ...convItems].sort(byStart) }),
  });
  return out;
}
export { zoneAbbr };
