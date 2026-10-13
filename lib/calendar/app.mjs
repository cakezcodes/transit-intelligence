/**
 * The Cosmic Calendar, shaped for the app's calendar view.
 *
 * One app event per thing that happens in the sky, carrying every layer's text the
 * way the Complete feed stacks it: the public sky/moon description (with product copy
 * when it's loaded), then NATAL, DIVINATION and RITUAL for this chart. Convergence
 * events (profections, firdaria, zodiacal releasing, progressed moon, power days)
 * ride alongside as their own all-day events.
 */

import { skyEvents, moonEvents, skyTitle, moonTitle } from './sky.mjs';
import { personalEvents } from './personal.mjs';
import { convergenceEvents } from './convergence.mjs';
import { publicDescription, copyKey } from './feeds.mjs';

const ymd = (ms, timeZone) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
};

/* which in-app layer an engine event lights up */
function skyLayer(e) {
  if (e.kind === 'station' || e.kind === 'shadow') return 'retro';
  return 'global';
}
function moonLayer(e) {
  if (e.kind === 'voc') return 'void';
  return e.phase === 'new' || e.phase === 'full' ? 'lunation' : 'lunar';
}
function convLayer(key) {
  if (key.startsWith('power:')) return 'power';
  if (key.startsWith('prog:')) return 'prog';
  if (key.startsWith('firdaria:')) return 'firdaria';
  if (key.startsWith('zr:')) return 'zr';
  return 'prof'; // profections + the lord of the year's moves
}
const GLYPH = { global: '☉︎', retro: '℞', void: '⊘', lunation: '◑', lunar: '☽︎', power: '✦', prog: '☽︎', firdaria: '♄︎', zr: '⟳', prof: '◈' };

/** first line of a description, without the DETAILS tail */
const lead = (s) => String(s || '').split('\n').find((l) => l.trim() && !/^[A-Z ·]+$/.test(l.trim())) || '';

/**
 * @param {object|null} chart  /api/natal chart + { birthMs } (null → sky + moon only)
 * @param {{ start:number, end:number, timeZone:string, copy?:Record<string,string> }} opts
 */
export function appEvents(chart, { start, end, timeZone, copy }) {
  const sky = skyEvents(start, end);
  const moon = moonEvents(start, end);
  const personal = chart ? personalEvents(chart, sky, moon, timeZone) : [];
  const byT = new Map();
  for (const p of personal) byT.set(`${p.key.split(':')[0]}@${p.t}`, p);

  const out = [];
  const add = (e, layer, title) => {
    const p = byT.get(`${e.kind}@${e.t}`);
    const sky = publicDescription(e, timeZone, copy);
    out.push({
      id: `${layer}-${Math.round(e.t / 60000)}-${out.length}`,
      t: e.t,
      end: e.end || null,
      date: ymd(e.t, timeZone),
      lay: layer,
      gl: GLYPH[layer],
      title,
      house: p?.house ?? null,
      big: e.kind === 'station' || e.kind === 'cazimi' || (e.kind === 'phase' && (e.phase === 'new' || e.phase === 'full')),
      // the row's second line: the tightest natal contact if there is one, else the house's themes
      sub: p ? `${p.house}H · ${(p.description.natal.split('\n')[1] || '').startsWith('Transit ') ? p.description.natal.split('\n')[1].replace(/^Transit /, '') : lead(p.description.natal).replace(/^(Your|Activating your) \d+H — /, '')}` : lead(sky),
      sky,
      natal: p?.description.natal || null,
      divination: p?.description.divination || null,
      ritual: p?.description.ritual || null,
      copied: !!copy?.[copyKey(e)],
    });
  };
  sky.forEach((e) => add(e, skyLayer(e), skyTitle(e)));
  moon.forEach((e) => add(e, moonLayer(e), moonTitle(e)));

  if (chart) {
    for (const c of convergenceEvents({ ...chart, timeZone }, sky, start, end)) {
      const layer = convLayer(c.key);
      out.push({
        id: `${layer}-${c.key}`.replace(/[^\w-]/g, '_'),
        t: c.start,
        end: null,
        allDay: !!c.allDay,
        date: c.allDay ? new Date(c.start).toISOString().slice(0, 10) : ymd(c.start, timeZone),
        lay: layer,
        gl: GLYPH[layer],
        title: c.title.replace(/^✦ (\d+H) • CONVERGENCE \| /, '$1 · ').replace(/^✦ POWER DAY \| /, 'power day · '),
        house: c.house ?? null,
        big: layer === 'power' || /Peak/.test(c.title),
        sub: lead(c.description),
        conv: c.description,
      });
    }
  }
  return out.sort((a, b) => a.t - b.t);
}
