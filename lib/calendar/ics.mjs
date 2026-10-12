/**
 * Minimal iCalendar (RFC 5545) read/write for the Cosmic Calendar feeds.
 * Writer output mirrors the published Q4 2026 feeds: VTIMEZONE for the
 * user's zone, local DTSTART/DTEND with TZID, TRANSP:TRANSPARENT, 75-octet folding.
 */
import { createHash } from 'node:crypto';

/* ── read ── */
export function parseICS(text) {
  const raw = text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
  const cal = { name: (raw.match(/X-WR-CALNAME:(.*)/) || [])[1] || '', tz: (raw.match(/X-WR-TIMEZONE:(.*)/) || [])[1] || '' };
  cal.events = raw.split('BEGIN:VEVENT').slice(1).map((block) => {
    const e = {};
    for (const line of block.split('END:VEVENT')[0].trim().split('\n')) {
      const i = line.indexOf(':');
      const [key, ...params] = line.slice(0, i).split(';');
      e[key] = { value: line.slice(i + 1), params: Object.fromEntries(params.map((p) => p.split('='))) };
    }
    const unesc = (s) => (s || '').replace(/\\n/g, '\n').replace(/\\([,;\\])/g, '$1');
    return {
      uid: e.UID?.value,
      summary: unesc(e.SUMMARY?.value).trim(),
      description: unesc(e.DESCRIPTION?.value),
      start: e.DTSTART?.value,
      end: e.DTEND?.value,
      allDay: e.DTSTART?.params.VALUE === 'DATE',
      tzid: e.DTSTART?.params.TZID || null,
    };
  });
  return cal;
}

/** local wall time "YYYYMMDDTHHMMSS" in a zone → epoch ms */
export function localToMs(stamp, timeZone) {
  const [, y, mo, d, h = '0', mi = '0', s = '0'] = stamp.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  const guess = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
  let off = 0;
  for (let i = 0; i < 3; i++) off = tzOffsetMs(guess - off, timeZone);
  return guess - off;
}
export function tzOffsetMs(ms, timeZone) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(new Date(ms)).map((x) => [x.type, x.value]),
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000;
}
/** epoch ms → local "YYYYMMDDTHHMMSS" */
export function msToLocal(ms, timeZone) {
  const d = new Date(Math.floor(ms / 1000) * 1000 + tzOffsetMs(ms, timeZone));
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${z(d.getUTCMonth() + 1)}${z(d.getUTCDate())}T${z(d.getUTCHours())}${z(d.getUTCMinutes())}${z(d.getUTCSeconds())}`;
}

/* ── write ── */
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
function fold(line) {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const parts = [];
  let i = 0, first = true;
  while (i < bytes.length) {
    let n = first ? 75 : 74;
    while (i + n < bytes.length && (bytes[i + n] & 0xc0) === 0x80) n--; // never split a UTF-8 sequence
    parts.push((first ? '' : ' ') + bytes.subarray(i, i + n).toString('utf8'));
    i += n;
    first = false;
  }
  return parts.join('\r\n');
}

export function vtimezone(timeZone, year) {
  // describe the zone's two rules from the offsets actually in effect (good for any IANA zone with ≤2 changes/yr)
  const jan = tzOffsetMs(Date.UTC(year, 0, 15), timeZone), jul = tzOffsetMs(Date.UTC(year, 6, 15), timeZone);
  const fmt = (ms) => { const m = Math.round(ms / 60000), s = m < 0 ? '-' : '+', a = Math.abs(m); return `${s}${String(Math.floor(a / 60)).padStart(2, '0')}${String(a % 60).padStart(2, '0')}`; };
  if (jan === jul) return ['BEGIN:VTIMEZONE', `TZID:${timeZone}`, 'BEGIN:STANDARD', `TZOFFSETFROM:${fmt(jan)}`, `TZOFFSETTO:${fmt(jan)}`, 'DTSTART:19700101T000000', 'END:STANDARD', 'END:VTIMEZONE'];
  // find the two transition instants in `year`
  const changes = [];
  let prev = tzOffsetMs(Date.UTC(year, 0, 1), timeZone);
  for (let h = 1; h < 24 * 366; h++) {
    const ms = Date.UTC(year, 0, 1) + h * 3600000, o = tzOffsetMs(ms, timeZone);
    if (o !== prev) { changes.push({ ms, from: prev, to: o }); prev = o; }
  }
  const out = ['BEGIN:VTIMEZONE', `TZID:${timeZone}`];
  for (const c of changes) {
    const dst = c.to > c.from, local = new Date(c.ms + c.from);
    const nth = Math.ceil(local.getUTCDate() / 7), last = local.getUTCDate() + 7 > new Date(Date.UTC(year, local.getUTCMonth() + 1, 0)).getUTCDate();
    const day = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][local.getUTCDay()];
    out.push(`BEGIN:${dst ? 'DAYLIGHT' : 'STANDARD'}`, `TZOFFSETFROM:${fmt(c.from)}`, `TZOFFSETTO:${fmt(c.to)}`,
      `TZNAME:${new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' }).formatToParts(new Date(c.ms + 3600000)).find((x) => x.type === 'timeZoneName').value}`,
      `DTSTART:1970${String(local.getUTCMonth() + 1).padStart(2, '0')}${String(local.getUTCDate()).padStart(2, '0')}T${String(local.getUTCHours()).padStart(2, '0')}0000`,
      `RRULE:FREQ=YEARLY;BYMONTH=${local.getUTCMonth() + 1};BYDAY=${last && nth > 4 ? '-1' : nth}${day}`,
      `END:${dst ? 'DAYLIGHT' : 'STANDARD'}`);
  }
  out.push('END:VTIMEZONE');
  return out;
}

/**
 * events: [{ key, summary, description, start (ms), end? (ms), allDay?, endDay? }]
 * key is stable per event so calendar apps update instead of duplicating.
 */
export function writeICS({ name, timeZone, events, stamp = new Date() }) {
  const z = (n) => String(n).padStart(2, '0');
  const dtstamp = `${stamp.getUTCFullYear()}${z(stamp.getUTCMonth() + 1)}${z(stamp.getUTCDate())}T000000Z`;
  const year = events.length ? new Date(events[0].start).getUTCFullYear() : stamp.getUTCFullYear();
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cosmic Calendar Club//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${name}`, `X-WR-TIMEZONE:${timeZone}`, 'REFRESH-INTERVAL;VALUE=DURATION:PT12H', 'X-PUBLISHED-TTL:PT12H', ...vtimezone(timeZone, year)];
  for (const e of events) {
    const uid = createHash('sha1').update(e.key).digest('hex');
    lines.push('BEGIN:VEVENT', `UID:${uid}@cosmiccalendarclub`, `DTSTAMP:${dtstamp}`);
    if (e.allDay) {
      const d0 = msToLocal(e.start, timeZone).slice(0, 8), d1 = msToLocal(e.endDay ?? e.start + 86400000, timeZone).slice(0, 8);
      lines.push(`DTSTART;VALUE=DATE:${d0}`, `DTEND;VALUE=DATE:${d1}`);
    } else {
      lines.push(`DTSTART;TZID=${timeZone}:${msToLocal(e.start, timeZone)}`, `DTEND;TZID=${timeZone}:${msToLocal(e.end ?? e.start, timeZone)}`);
    }
    lines.push(`SUMMARY:${esc(e.summary)}`);
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    lines.push('TRANSP:TRANSPARENT', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
