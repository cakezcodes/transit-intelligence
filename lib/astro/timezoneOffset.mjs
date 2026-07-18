/**
 * IANA timezone → UTC offset resolver for birth charts.
 *
 * Given a local wall-clock date/time and an IANA zone name, returns the
 * UTC offset (hours) that was in effect there and then — DST-aware and
 * historically correct via the runtime's Intl tz database.
 *
 * Birth data is stored as local date/time + IANA string; conversion to
 * UT happens only inside the engine (never store pre-converted UT).
 */

function zoneOffsetMs(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second),
  );
  return asUtc - date.getTime();
}

/**
 * UTC offset in hours for a local wall time in an IANA zone.
 * Iterates because the offset itself determines which UTC instant the
 * wall time refers to (matters around DST transitions).
 */
export function utcOffsetHoursFor(timeZone, year, month, day, hour = 12, minute = 0) {
  if (!timeZone) throw new Error('Missing IANA timezone.');

  const wall = Date.UTC(year, month - 1, day, hour, minute);
  let offsetMs = 0;
  for (let i = 0; i < 3; i++) {
    offsetMs = zoneOffsetMs(new Date(wall - offsetMs), timeZone);
  }
  return offsetMs / 3_600_000;
}
