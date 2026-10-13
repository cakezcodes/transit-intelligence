/**
 * Load the public Cosmic Calendar product copy (ENERGY FORECAST / LEAN INTO / AVOID / TEA)
 * from published .ics files into the calendar_copy table, keyed by copyKey().
 *
 *   node scripts/calendar/import-copy.mjs cosmic-sky.ics cosmic-moon.ics [--tz America/New_York] [--dry-run] [--sql out.sql]
 *
 * Each published event is matched to the engine's own event (same title, start within
 * 20 minutes) so the key is the engine's, not a guess. Writes need SUPABASE_SERVICE_ROLE_KEY
 * and NEXT_PUBLIC_SUPABASE_URL (from .env.local); --sql writes an upsert script to paste into
 * the Supabase SQL editor instead. The copy never goes into the repo.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parseICS, localToMs } from '../../lib/calendar/ics.mjs';
import { skyEvents, moonEvents, skyTitle, moonTitle } from '../../lib/calendar/sky.mjs';
import { copyKey } from '../../lib/calendar/feeds.mjs';

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const dry = args.includes('--dry-run'); if (dry) args.splice(args.indexOf('--dry-run'), 1);
const sqlOut = flag('--sql');
const tzArg = flag('--tz');
if (!args.length) { console.error('usage: import-copy.mjs <file.ics …> [--tz Zone] [--dry-run] [--sql out.sql]'); process.exit(1); }

const TOL = 20 * 60000;
function middle(desc) {
  const d = desc.replace(/\r/g, '');
  const i = d.search(/^(ENERGY FORECAST|LEAN INTO|AVOID|TEA)\b/m);
  if (i < 0) return '';
  const j = d.slice(i).search(/\n\n(DETAILS|PAIRS TO)\b/);
  return (j < 0 ? d.slice(i) : d.slice(i, i + j)).trim();
}
const rows = new Map();
let seen = 0, unmatched = 0;
for (const file of args) {
  const cal = parseICS(readFileSync(file, 'utf8'));
  const tz = tzArg || cal.tz || 'UTC';
  const pub = cal.events.filter((e) => e.description && e.start && e.start.includes('T'));
  if (!pub.length) continue;
  const ts = pub.map((e) => localToMs(e.start, e.tzid || tz));
  const t0 = Math.min(...ts) - 86400000, t1 = Math.max(...ts) + 86400000;
  const gen = [...skyEvents(t0, t1).map((e) => ({ e, title: skyTitle(e) })), ...moonEvents(t0, t1).map((e) => ({ e, title: moonTitle(e) }))];
  pub.forEach((p, i) => {
    seen++;
    const title = p.summary.replace(/\s+$/, '');
    const hit = gen.find((g) => g.title === title && Math.abs(g.e.t - ts[i]) <= TOL);
    if (!hit) { unmatched++; return; }
    // keep the reusable middle — ENERGY FORECAST through TEA — not this pass's degrees, dates or links
    const body = middle(p.description);
    if (body && !rows.has(copyKey(hit.e))) rows.set(copyKey(hit.e), { key: copyKey(hit.e), body, source: file.split('/').pop() });
  });
}
console.log(`${seen} published events · ${rows.size} copy keys · ${unmatched} unmatched`);

if (sqlOut) {
  const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
  const sql = [...rows.values()].map((r) => `insert into public.calendar_copy (key, body, source) values (${q(r.key)}, ${q(r.body)}, ${q(r.source)}) on conflict (key) do update set body = excluded.body, source = excluded.source, updated_at = now();`).join('\n');
  writeFileSync(sqlOut, sql + '\n');
  console.log(`wrote ${sqlOut}`);
}
if (dry || sqlOut) process.exit(0);

if (existsSync('.env.local')) for (const l of readFileSync('.env.local', 'utf8').split('\n')) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim(); }
const { createSupabaseAdminClient } = await import('../../lib/supabase/admin.mjs');
const sb = createSupabaseAdminClient();
const list = [...rows.values()];
for (let i = 0; i < list.length; i += 200) {
  const { error } = await sb.from('calendar_copy').upsert(list.slice(i, i + 200), { onConflict: 'key' });
  if (error) { console.error(error.message); process.exit(1); }
}
console.log(`upserted ${list.length} rows into calendar_copy`);
