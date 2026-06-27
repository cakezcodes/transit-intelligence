/**
 * placidus.js — Placidus house cusps + Ascendant/MC
 * Sits on top of Astronomy Engine output. No Swiss Ephemeris, no GPL.
 *
 * Needs:
 * - RAMC: Right Ascension of the Midheaven in degrees.
 * - obliquity: obliquity of the ecliptic in degrees.
 * - latitude: observer geographic latitude in degrees.
 *
 * Returns: { cusps:[12], asc, mc, system:'placidus'|'whole-sign' }
 */

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const sin = d => Math.sin(d * D2R);
const cos = d => Math.cos(d * D2R);
const tan = d => Math.tan(d * D2R);
const asin = x => Math.asin(x) * R2D;
const atan2 = (y, x) => Math.atan2(y, x) * R2D;
const norm360 = d => ((d % 360) + 360) % 360;

function eclLongFromRA(ra, eps) {
  const lon = atan2(sin(ra), cos(ra) * cos(eps));
  return norm360(lon);
}

function declFromEclLong(lon, eps) {
  return asin(sin(eps) * sin(lon));
}

function iterateCusp(ramc, lat, eps, houseFraction, upper) {
  const offset = upper ? houseFraction * 90 : 180 - houseFraction * 90;
  let ra = norm360(ramc + offset);

  for (let i = 0; i < 25; i++) {
    const lon = eclLongFromRA(ra, eps);
    const decl = declFromEclLong(lon, eps);
    const x = tan(lat) * tan(decl);

    if (Math.abs(x) >= 1) return null;

    const ad = asin(x);
    const semiArc = upper ? 90 + ad : 90 - ad;
    const newRA = upper
      ? norm360(ramc + houseFraction * semiArc)
      : norm360(ramc + 180 - houseFraction * semiArc);

    if (Math.abs(norm360(newRA - ra + 180) - 180) < 1e-7) {
      ra = newRA;
      break;
    }

    ra = newRA;
  }

  return eclLongFromRA(ra, eps);
}

function wholeSignCusps(asc) {
  const signStart = Math.floor(asc / 30) * 30;
  return Array.from({ length: 12 }, (_, i) => norm360(signStart + i * 30));
}

export function computeHouses(ramc, latitude, obliquity) {
  const eps = obliquity;
  const lat = latitude;

  const mc = norm360(atan2(sin(ramc), cos(ramc) * cos(eps)));
  const asc = norm360(
    atan2(cos(ramc), -(sin(ramc) * cos(eps) + tan(lat) * sin(eps)))
  );

  if (Math.abs(lat) > 66) {
    return { cusps: wholeSignCusps(asc), asc, mc, system: 'whole-sign' };
  }

  const c11 = iterateCusp(ramc, lat, eps, 1 / 3, true);
  const c12 = iterateCusp(ramc, lat, eps, 2 / 3, true);
  const c2 = iterateCusp(ramc, lat, eps, 2 / 3, false);
  const c3 = iterateCusp(ramc, lat, eps, 1 / 3, false);

  if ([c11, c12, c2, c3].some(c => c === null)) {
    return { cusps: wholeSignCusps(asc), asc, mc, system: 'whole-sign' };
  }

  const cusps = [
    asc,
    c2,
    c3,
    norm360(mc + 180),
    norm360(c11 + 180),
    norm360(c12 + 180),
    norm360(asc + 180),
    norm360(c2 + 180),
    norm360(c3 + 180),
    mc,
    c11,
    c12,
  ];

  return { cusps, asc, mc, system: 'placidus' };
}
