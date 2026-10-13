import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { computeNatalPositions } from '@/lib/astro/computeNatalPositions.mjs';
import { rowsToChart, type PositionRow } from '@/lib/astro/rowsToChart';

/* POST /api/sky — the sky right now, cast by Celestine (Rule 1) as a chart for a place:
   planets, signs, retrogrades and, with a location, the rising sign and Porphyry houses.
   The home screen draws it as today's wheel. */

export const runtime = 'nodejs';

type Body = { lat?: number | string | null; lng?: number | string | null; tzName?: string | null; at?: string | null };

const num = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v));
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

  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    /* defaults */
  }
  const tzName = body.tzName && validTz(body.tzName) ? body.tzName : 'UTC';
  let lat = num(body.lat);
  let lng = num(body.lng);
  const placed = lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng);
  if (!placed) {
    lat = 0;
    lng = 0;
  }
  const at = body.at && !Number.isNaN(Date.parse(body.at)) ? new Date(body.at) : new Date();
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: tzName, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(at)
      .map((x) => [x.type, x.value]),
  );

  try {
    const positions = computeNatalPositions({
      name: 'the sky',
      birth_date: `${p.year}-${p.month}-${p.day}`,
      birth_time: `${p.hour}:${p.minute}:${p.second}`,
      birth_place: '',
      latitude: lat,
      longitude: lng,
      timezone: tzName,
      time_known: placed, // no place → no honest rising, so no houses
      house_system: 'porphyry',
    });
    const chart = rowsToChart(positions.rows as PositionRow[], { timeKnown: placed, tzName, lat: lat!, lng: lng! });
    return NextResponse.json({ at: at.toISOString(), chart }, { headers: { 'Cache-Control': 'private, max-age=300' } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'sky failed' }, { status: 500 });
  }
}
