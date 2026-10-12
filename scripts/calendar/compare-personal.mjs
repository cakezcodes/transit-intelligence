/**
 * Golden test for the personal feeds (Natal / Divination / Ritual) against a
 * person's published Q4 files. Birth data and fixtures are passed in — personal
 * calendars never live in this repo.
 *
 *   node scripts/calendar/compare-personal.mjs <fixtureDir> <YYYY-MM-DD> <HH:MM> <lat> <lng> <IANA zone>
 */
import { readFileSync } from 'node:fs';
import { parseICS, localToMs } from '../../lib/calendar/ics.mjs';
import { skyEvents, moonEvents } from '../../lib/calendar/sky.mjs';
import { personalEvents } from '../../lib/calendar/personal.mjs';
import { computeNatalPositions } from '../../lib/astro/computeNatalPositions.mjs';
import { convergenceEvents } from '../../lib/calendar/convergence.mjs';
import { buildFeeds } from '../../lib/calendar/feeds.mjs';

const [dir, date, time, lat, lng, tz] = process.argv.slice(2);
if (!tz) { console.error('usage: compare-personal.mjs <fixtureDir> <date> <time> <lat> <lng> <zone>'); process.exit(2); }

// same shape POST /api/natal returns
const pos = computeNatalPositions({ birth_date: date, birth_time: `${time}:00`, latitude: +lat, longitude: +lng, timezone: tz });
const angle = (k) => pos.rows.find((r) => r.kind === 'angle' && r.body_key === k)?.absolute_longitude;
const chart = {
  timeKnown: true, asc: angle('asc'), mc: angle('mc'),
  cusps: { porphyry: pos.rows.filter((r) => r.kind === 'house_cusp').sort((a, b) => a.house - b.house).map((r) => r.absolute_longitude) },
  bodies: pos.rows.filter((r) => r.kind === 'body').map((r) => ({ key: r.body_key, lon: r.absolute_longitude })),
};

const t0 = localToMs('20261001T000000', tz), t1 = localToMs('20261231T235959', tz);
chart.birthMs = localToMs(`${date.replace(/-/g, '')}T${time.replace(':', '')}00`, tz);
chart.timeZone = tz;
const sky = skyEvents(t0, t1);
const mine = personalEvents(chart, sky, moonEvents(t0, t1), tz);

let allOk = true;
for (const product of ['natal', 'divination', 'ritual']) {
  const cal = parseICS(readFileSync(`${dir}/cosmic-${product}-q4-2026.ics`, 'utf8'));
  const used = new Set();
  let titleOk = 0, descOk = 0;
  const bad = [];
  for (const w of cal.events) {
    const wt = localToMs(w.start, w.tzid || tz);
    const i = mine.findIndex((g, k) => !used.has(k) && g.summary[product] === w.summary && Math.abs(g.t - wt) <= 20 * 60000);
    if (i < 0) { bad.push(`  − ${w.start} ${w.summary}  ${closest(w, wt, product)}`); continue; }
    used.add(i);
    titleOk++;
    const want = w.description.trim(), got = mine[i].description[product].trim();
    // times print from the generated instant, which can differ by minutes (ephemeris precision)
    const norm = (s) => s.replace(/\d{1,2}:\d{2} [AP]M/g, 'H:MM').replace(/\(\d+\.\d° orb\)/g, '(n° orb)');
    if (norm(want) === norm(got)) descOk++;
    else bad.push(`  ≠ ${w.summary}\n      want: ${JSON.stringify(want)}\n      got:  ${JSON.stringify(got)}`);
  }
  const extra = mine.filter((_, k) => !used.has(k)).map((g) => `  + ${new Date(g.t).toISOString()} ${g.summary[product]}`);
  console.log(`\n${product}: titles ${titleOk}/${cal.events.length} · descriptions ${descOk}/${cal.events.length} · ${extra.length} extra`);
  [...bad.slice(0, 12), ...extra.slice(0, 8)].forEach((l) => console.log(l));
  allOk &&= titleOk === cal.events.length && descOk === cal.events.length && !extra.length;
}
function closest(w, wt, product) {
  const c = mine.slice().sort((a, b) => Math.abs(a.t - wt) - Math.abs(b.t - wt))[0];
  return c ? `(nearest: ${c.summary[product]})` : '';
}

/* convergence: titles + dates (descriptions carry hand-written flourishes in the published file) */
{
  const conv = convergenceEvents(chart, sky, t0, t1);
  const cal = parseICS(readFileSync(`${dir}/cosmic-convergence-q4-2026.ics`, 'utf8'));
  const used = new Set(); let ok = 0; const bad = [];
  const dateOf = (e) => (e.allDay ? new Date(e.start).toISOString().slice(0, 10).replace(/-/g, '') : null);
  for (const w of cal.events) {
    const i = conv.findIndex((g, k) => !used.has(k) && g.title === w.summary && (w.allDay ? dateOf(g) === w.start : Math.abs(g.start - localToMs(w.start, w.tzid || tz)) <= 20 * 60000));
    if (i < 0) { bad.push(`  − ${w.start} ${w.summary}`); continue; }
    used.add(i); ok++;
  }
  const extra = conv.filter((_, k) => !used.has(k)).map((g) => `  + ${g.allDay ? dateOf(g) : new Date(g.start).toISOString()} ${g.title}`);
  console.log(`\nconvergence: ${ok}/${cal.events.length} · ${extra.length} extra`);
  [...bad, ...extra].forEach((l) => console.log(l));
  allOk &&= ok === cal.events.length && !extra.length;
}

/* complete: the built .ics (round-trip through the writer) vs the published file */
{
  const built = parseICS(buildFeeds(chart, { start: t0, end: t1, timeZone: tz }).complete);
  const cal = parseICS(readFileSync(`${dir}/cosmic-complete-q4-2026.ics`, 'utf8'));
  const norm = (s) => s.trim().replace(/\d{1,2}:\d{2} [AP]M/g, 'H:MM').replace(/\(\d+\.\d° orb\)/g, '(n° orb)');
  const used = new Set(); let t = 0, d = 0;
  for (const w of cal.events) {
    const i = built.events.findIndex((g, k) => !used.has(k) && g.summary === w.summary && (w.allDay ? g.start === w.start : Math.abs(localToMs(g.start, tz) - localToMs(w.start, tz)) <= 20 * 60000));
    if (i < 0) continue;
    used.add(i); t++;
    if (w.allDay || norm(built.events[i].description) === norm(w.description)) d++;
  }
  console.log(`\ncomplete (.ics round-trip): titles ${t}/${cal.events.length} · personal descriptions ${d}/${cal.events.length} · ${built.events.length - used.size} extra`);
  allOk &&= t === cal.events.length && d === cal.events.length && built.events.length === used.size;
}
process.exitCode = allOk ? 0 : 1;
