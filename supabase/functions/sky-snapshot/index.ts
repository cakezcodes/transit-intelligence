/**
 * Daily sky snapshot (Phase D step 2).
 *
 * Writes 12 rows per day to `sky_positions` from Celestine:
 * 10 planets + Chiron + North Node — body, sign, degree, absolute
 * longitude, motion, speed. Idempotent via UNIQUE(snapshot_date, body_key).
 *
 * Position is computed at 12:00 UTC of the snapshot date. Motion compares
 * longitude speed at the day's start and end: a sign flip inside the
 * calendar day marks a station (station_retrograde when turning Rx,
 * station_direct when turning direct).
 *
 * Invoke: POST /functions/v1/sky-snapshot            -> today (UTC)
 *         POST /functions/v1/sky-snapshot?date=YYYY-MM-DD -> backfill a date
 *
 * Scheduled daily via pg_cron + pg_net (see migration 20260712000200).
 */

import { calculateChart } from 'npm:celestine@0.2.1';
import { createClient } from 'npm:@supabase/supabase-js@2';

const BODY_KEYS: Record<string, string> = {
  Sun: 'sun',
  Moon: 'moon',
  Mercury: 'mercury',
  Venus: 'venus',
  Mars: 'mars',
  Jupiter: 'jupiter',
  Saturn: 'saturn',
  Uranus: 'uranus',
  Neptune: 'neptune',
  Pluto: 'pluto',
  Chiron: 'chiron',
  'North Node': 'north_node',
};

interface SkyBody {
  name: string;
  longitude: number;
  longitudeSpeed?: number;
  signName?: string;
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

/** Signed shortest arc from a to b, in degrees (-180, 180]. */
function signedArc(a: number, b: number): number {
  let d = normalizeDegrees(b) - normalizeDegrees(a);
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

function chartBodiesAt(date: Date): SkyBody[] {
  const chart = calculateChart({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: 0,
    timezone: 0,
    // The global sky needs no houses; coordinates only anchor the (unused)
    // angles. Positions are geocentric ecliptic longitudes.
    latitude: 0,
    longitude: 0,
    houseSystem: 'placidus',
    zodiacType: 'tropical',
    includeChiron: true,
    includeNodes: true,
  });
  return [...chart.planets, ...(chart.nodes ?? [])] as SkyBody[];
}

/** Speed in deg/day: Celestine's longitudeSpeed, or longitude delta over the window. */
function speedOf(body: SkyBody | undefined, from?: SkyBody, to?: SkyBody, days = 1): number | null {
  if (body && Number.isFinite(body.longitudeSpeed)) return body.longitudeSpeed as number;
  if (from && to) return signedArc(from.longitude, to.longitude) / days;
  return null;
}

function motionFor(speedStart: number | null, speedEnd: number | null): string {
  const start = speedStart ?? 1;
  const end = speedEnd ?? start;
  if (start >= 0 && end < 0) return 'station_retrograde';
  if (start < 0 && end >= 0) return 'station_direct';
  return start < 0 ? 'retrograde' : 'direct';
}

export function buildSnapshotRows(snapshotDate: string) {
  const dayStart = new Date(`${snapshotDate}T00:00:00Z`);
  const noon = new Date(`${snapshotDate}T12:00:00Z`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const startBodies = chartBodiesAt(dayStart);
  const noonBodies = chartBodiesAt(noon);
  const endBodies = chartBodiesAt(dayEnd);
  const byName = (list: SkyBody[]) => new Map(list.map((b) => [b.name, b]));
  const startMap = byName(startBodies);
  const endMap = byName(endBodies);

  const rows = [];
  for (const body of noonBodies) {
    const bodyKey = BODY_KEYS[body.name];
    if (!bodyKey) continue;

    const start = startMap.get(body.name);
    const end = endMap.get(body.name);
    const speedStart = speedOf(start, start, body, 0.5);
    const speedEnd = speedOf(end, body, end, 0.5);
    const speedNoon = speedOf(body, start, end, 1);

    const absoluteLongitude = normalizeDegrees(body.longitude);
    rows.push({
      snapshot_date: snapshotDate,
      body_key: bodyKey,
      sign: body.signName,
      degree_in_sign: absoluteLongitude % 30,
      absolute_longitude: absoluteLongitude,
      motion: motionFor(speedStart, speedEnd),
      speed: speedNoon,
      source_engine: 'celestine',
    });
  }

  if (rows.length !== 12) {
    throw new Error(`Expected 12 sky rows, built ${rows.length} for ${snapshotDate}.`);
  }

  return rows;
}

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');
    const snapshotDate = dateParam ?? new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate)) {
      return Response.json({ error: `Invalid date: ${snapshotDate}` }, { status: 400 });
    }

    const rows = buildSnapshotRows(snapshotDate);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    const { error } = await supabase
      .from('sky_positions')
      .upsert(rows, { onConflict: 'snapshot_date,body_key' });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      ok: true,
      snapshot_date: snapshotDate,
      rows: rows.length,
      stations: rows.filter((r) => r.motion.startsWith('station')).map((r) => r.body_key),
    });
  } catch (err) {
    return Response.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
});
