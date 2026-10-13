import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { appEvents } from '@/lib/calendar/app.mjs';
import { localToMs } from '@/lib/calendar/ics.mjs';

/* POST /api/calendar — the Cosmic Calendar for the signed-in user, for a date range.
   Detection is free math (astronomy-engine for the sky, the user's Celestine chart from
   /api/natal for houses and contacts); nothing here is generated prose beyond the
   calendar's own fixed templates. Public-event product copy comes from calendar_copy
   when the table is populated (see scripts/calendar/import-copy.mjs). */

export const runtime = 'nodejs';

type Body = {
  start?: string; // YYYY-MM-DD (inclusive, in tz)
  end?: string; // YYYY-MM-DD (inclusive, in tz)
  tz?: string;
  chart?: Record<string, unknown> | null; // the chart /api/natal returned
  birth?: { date?: string; time?: string; tzName?: string } | null;
};

const MAX_DAYS = 100;
let COPY: { at: number; map: Record<string, string> } | null = null;

async function loadCopy(supabase: Awaited<ReturnType<typeof createClient>>) {
  if (COPY && Date.now() - COPY.at < 10 * 60000) return COPY.map;
  const map: Record<string, string> = {};
  try {
    const { data, error } = await supabase.from('calendar_copy').select('key,body').limit(5000);
    if (!error) for (const r of data || []) map[r.key] = r.body;
  } catch {
    /* table not there yet — factual fallbacks */
  }
  COPY = { at: Date.now(), map };
  return map;
}

const validTz = (tz: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'sign in first' }, { status: 401 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }
  const tz = body.tz && validTz(body.tz) ? body.tz : 'UTC';
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!body.start || !body.end || !re.test(body.start) || !re.test(body.end)) {
    return NextResponse.json({ error: 'start and end are YYYY-MM-DD' }, { status: 400 });
  }
  const start = localToMs(body.start.replace(/-/g, '') + 'T000000', tz);
  const end = localToMs(body.end.replace(/-/g, '') + 'T235959', tz);
  if (!(end > start) || end - start > MAX_DAYS * 86400000) {
    return NextResponse.json({ error: `range must be 1–${MAX_DAYS} days` }, { status: 400 });
  }

  /* the personal layers need the engine's chart with a birth time (houses) */
  let chart = null;
  const c = body.chart as { bodies?: unknown[]; cusps?: { porphyry?: unknown[] }; timeKnown?: boolean } | null;
  const b = body.birth;
  if (c && Array.isArray(c.bodies) && c.timeKnown && Array.isArray(c.cusps?.porphyry) && b?.date && re.test(b.date)) {
    const btz = b.tzName && validTz(b.tzName) ? b.tzName : tz;
    const time = /^\d{2}:\d{2}$/.test(b.time || '') ? (b.time as string).replace(':', '') + '00' : '120000';
    chart = { ...c, birthMs: localToMs(b.date.replace(/-/g, '') + 'T' + time, btz) };
  }

  const copy = await loadCopy(supabase);
  const events = appEvents(chart, { start, end, timeZone: tz, copy });
  return NextResponse.json(
    { tz, personal: !!chart, events },
    { headers: { 'Cache-Control': 'private, max-age=600' } },
  );
}
