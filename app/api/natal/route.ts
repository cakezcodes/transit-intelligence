import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { computeNatalPositions } from '@/lib/astro/computeNatalPositions.mjs';
import { calculateFullPersonChart } from '@/lib/astro/calculateFullPersonChart.mjs';
import { normalizeDegrees } from '@/lib/astro/porphyry.mjs';

/* POST /api/natal — the only place the app casts a chart.
   Celestine runs here (server-side, Rule 1); the client never does chart math for
   natal degrees. Porphyry cusps are the default; whole-sign and placidus cusps ride
   along so the house-system setting can switch without another round trip.
   self: true also stores the chart (people + natal_positions, RLS by owner). */

export const runtime = 'nodejs';

type Body = {
  name?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM (empty = unknown)
  place?: string;
  lat?: number | string | null;
  lng?: number | string | null;
  tzName?: string | null;
  self?: boolean;
};

type Geo = { lat: number; lng: number; tzName: string; place: string };

async function geocode(place: string): Promise<Geo | null> {
  const q = place.split(',')[0].trim();
  if (!q) return null;
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`,
      { signal: AbortSignal.timeout(6000) },
    );
    const j = await r.json();
    const hit = j?.results?.[0];
    if (!hit?.timezone) return null;
    return { lat: hit.latitude, lng: hit.longitude, tzName: hit.timezone, place: hit.name };
  } catch {
    return null;
  }
}

const num = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v));

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
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json({ error: 'birth date required (YYYY-MM-DD)' }, { status: 400 });
  }

  let lat = num(body.lat);
  let lng = num(body.lng);
  let tzName = body.tzName || null;
  let place = body.place || '';
  if ((lat === null || lng === null || !tzName) && place) {
    const g = await geocode(place);
    if (g) {
      lat ??= g.lat;
      lng ??= g.lng;
      tzName ||= g.tzName;
    }
  }
  if (lat === null || lng === null || !tzName) {
    return NextResponse.json(
      { error: 'birth place not found — pick a city from the list' },
      { status: 422 },
    );
  }

  const timeKnown = Boolean(body.time && /^\d{1,2}:\d{2}/.test(body.time));
  const person = {
    name: body.name || 'you',
    birth_date: body.date,
    birth_time: timeKnown ? `${body.time!.slice(0, 5)}:00` : '12:00:00',
    birth_place: place,
    latitude: lat,
    longitude: lng,
    timezone: tzName,
    time_known: timeKnown,
    house_system: 'porphyry',
  };

  let positions: ReturnType<typeof computeNatalPositions>;
  let placidus: number[] | null = null;
  try {
    positions = computeNatalPositions(person);
    if (timeKnown) {
      const full = calculateFullPersonChart(person, { houseSystem: 'placidus' });
      const h = (full.houses as { number: number; longitude: number }[])
        .filter((c) => Number.isFinite(c.longitude))
        .sort((a, b) => a.number - b.number)
        .map((c) => normalizeDegrees(c.longitude));
      placidus = h.length === 12 ? h : null;
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'chart failed' },
      { status: 500 },
    );
  }

  const rows = positions.rows as {
    kind: string;
    body_key: string;
    house: number | null;
    sign: string;
    degree_in_sign: number;
    absolute_longitude: number;
    retrograde: boolean | null;
    speed: number | null;
  }[];
  const angle = (k: string) => rows.find((r) => r.kind === 'angle' && r.body_key === k);
  const asc = angle('asc')?.absolute_longitude ?? null;
  const mc = angle('mc')?.absolute_longitude ?? null;
  const porphyry = rows
    .filter((r) => r.kind === 'house_cusp')
    .sort((a, b) => (a.house ?? 0) - (b.house ?? 0))
    .map((r) => r.absolute_longitude);
  const whole = asc === null ? null : Array.from({ length: 12 }, (_, i) => (Math.floor(asc / 30) * 30 + i * 30) % 360);

  const chart = {
    engine: 'celestine',
    timeKnown,
    tzName,
    lat,
    lng,
    asc,
    mc,
    cusps: { porphyry: porphyry.length === 12 ? porphyry : null, whole_sign: whole, placidus },
    bodies: rows
      .filter((r) => r.kind === 'body')
      .map((r) => ({
        key: r.body_key,
        sign: String(r.sign).toLowerCase(),
        deg: Number(r.degree_in_sign),
        lon: Number(r.absolute_longitude),
        house: r.house,
        retro: Boolean(r.retrograde),
      })),
    computedAt: new Date().toISOString(),
  };

  let stored = false;
  let storeError: string | null = null;
  if (body.self) {
    try {
      const personRow = {
        user_id: user.id,
        name: person.name,
        birth_date: person.birth_date,
        birth_time: person.birth_time,
        birth_place: person.birth_place,
        latitude: lat,
        longitude: lng,
        timezone: tzName,
        time_known: timeKnown,
        is_self: true,
      };
      // the self row: an existing is_self row, else a row with this birth date (user-zero), else new
      const { data: mine } = await supabase
        .from('people')
        .select('id,is_self,birth_date')
        .eq('user_id', user.id);
      const existing =
        mine?.find((p) => p.is_self) ?? mine?.find((p) => String(p.birth_date) === person.birth_date);
      let personId = existing?.id as string | undefined;
      if (personId) {
        const { error } = await supabase.from('people').update(personRow).eq('id', personId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('people').insert(personRow).select('id').single();
        if (error) throw error;
        personId = data.id;
      }
      // replace, not merge: a recast with a new time can drop angles/cusps entirely
      await supabase.from('natal_positions').delete().eq('person_id', personId).eq('house_system', 'porphyry');
      const { error } = await supabase.from('natal_positions').insert(
        rows.map((r) => ({
          ...r,
          person_id: personId,
          user_id: user.id,
          house_system: 'porphyry',
          computed_at: chart.computedAt,
        })),
      );
      if (error) throw error;
      stored = true;
    } catch (e) {
      storeError = e && typeof e === 'object' && 'message' in e ? String(e.message) : 'store failed';
    }
  }

  return NextResponse.json({ chart, stored, storeError });
}
