/**
 * Golden test: generate the public feeds for Q4 2026 and diff them against
 * the published Cosmic Sky / Cosmic Moon files (tests/fixtures/calendars).
 * An event matches when the title is identical and the start is within 2 minutes.
 */
import { readFileSync } from 'node:fs';
import { parseICS, localToMs } from '../../lib/calendar/ics.mjs';
import { skyEvents, moonEvents, skyTitle, moonTitle } from '../../lib/calendar/sky.mjs';

const TZ = 'America/Kentucky/Louisville';
const t0 = localToMs('20261001T000000', TZ), t1 = localToMs('20261231T235959', TZ);
// lunar events land within seconds; planetary ones within minutes (astronomy-engine ≈ 1′ of arc vs Swiss Ephemeris)
const TOL = { sky: 20 * 60000, moon: 2 * 60000 };

function diff(label, fixtureFile, generated, tol) {
  const cal = parseICS(readFileSync(`tests/fixtures/calendars/${fixtureFile}`, 'utf8'));
  const want = cal.events.map((e) => ({ title: e.summary.replace(/\s+$/, ''), t: localToMs(e.start, e.tzid || TZ), end: e.end && localToMs(e.end, e.tzid || TZ) }));
  const got = generated.map((g) => ({ ...g }));
  const used = new Set();
  const missing = [], offs = [];
  for (const w of want) {
    const i = got.findIndex((g, k) => !used.has(k) && g.title === w.title && Math.abs(g.t - w.t) <= tol);
    if (i >= 0) { used.add(i); offs.push(Math.abs(got[i].t - w.t) / 1000); }
    else missing.push(w);
  }
  const extra = got.filter((_, k) => !used.has(k));
  const fmt = (x) => `${new Date(x.t).toISOString().slice(0, 16)}Z  ${x.title}`;
  console.log(`\n${label}: ${want.length - missing.length}/${want.length} matched · ${extra.length} extra · median offset ${offs.length ? offs.sort((a,b)=>a-b)[offs.length>>1].toFixed(0) : 0}s · max ${offs.length ? Math.max(...offs).toFixed(0) : 0}s`);
  missing.slice(0, 25).forEach((m) => console.log('  − missing', fmt(m), nearest(m, got)));
  extra.slice(0, 25).forEach((e) => console.log('  + extra  ', fmt(e)));
  return missing.length === 0 && extra.length === 0;
}
function nearest(w, got) {
  const same = got.filter((g) => g.title === w.title).sort((a, b) => Math.abs(a.t - w.t) - Math.abs(b.t - w.t))[0];
  return same ? `(closest same-title ${((same.t - w.t) / 60000).toFixed(1)} min)` : '(no same-title event)';
}

const sky = skyEvents(t0, t1).map((e) => ({ title: skyTitle(e), t: e.t }));
const moon = moonEvents(t0, t1).map((e) => ({ title: moonTitle(e), t: e.t, end: e.end }));
const ok = [diff('Cosmic Sky', 'cosmic-sky-q4-2026.ics', sky, TOL.sky), diff('Cosmic Moon', 'cosmic-moon-q4-2026.ics', moon, TOL.moon)];
process.exitCode = ok.every(Boolean) ? 0 : 1;
