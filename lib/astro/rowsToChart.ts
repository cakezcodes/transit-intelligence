/* Celestine's flattened rows (computeNatalPositions) → the chart shape the app draws.
   Shared by /api/natal (a birth chart) and /api/sky (a chart for right now). */

export type PositionRow = {
  kind: string;
  body_key: string;
  house: number | null;
  sign: string;
  degree_in_sign: number;
  absolute_longitude: number;
  retrograde: boolean | null;
  speed: number | null;
};

export function rowsToChart(
  rows: PositionRow[],
  opts: { timeKnown: boolean; tzName: string; lat: number; lng: number; placidus?: number[] | null },
) {
  const angle = (k: string) => rows.find((r) => r.kind === 'angle' && r.body_key === k);
  const asc = angle('asc')?.absolute_longitude ?? null;
  const mc = angle('mc')?.absolute_longitude ?? null;
  const porphyry = rows
    .filter((r) => r.kind === 'house_cusp')
    .sort((a, b) => (a.house ?? 0) - (b.house ?? 0))
    .map((r) => r.absolute_longitude);
  const whole = asc === null ? null : Array.from({ length: 12 }, (_, i) => (Math.floor(asc / 30) * 30 + i * 30) % 360);
  return {
    engine: 'celestine',
    timeKnown: opts.timeKnown,
    tzName: opts.tzName,
    lat: opts.lat,
    lng: opts.lng,
    asc,
    mc,
    cusps: { porphyry: porphyry.length === 12 ? porphyry : null, whole_sign: whole, placidus: opts.placidus ?? null },
    bodies: rows
      .filter((r) => r.kind === 'body')
      .map((r) => ({
        key: r.body_key,
        sign: String(r.sign).toLowerCase(),
        deg: Number(r.degree_in_sign),
        lon: Number(r.absolute_longitude),
        house: r.house,
        retro: Boolean(r.retrograde),
        speed: r.speed == null ? null : Number(r.speed),
      })),
    computedAt: new Date().toISOString(),
  };
}
