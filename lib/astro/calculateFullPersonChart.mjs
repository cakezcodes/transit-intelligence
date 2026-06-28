import { calculateChart } from 'celestine';

function parseBirthDate(dateValue) {
  const [year, month, day] = String(dateValue).split('-').map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid birth_date: ${dateValue}`);
  }

  return { year, month, day };
}

function parseBirthTime(timeValue) {
  const [hour = 0, minute = 0, second = 0] = String(timeValue ?? '00:00:00')
    .split(':')
    .map(Number);

  return { hour, minute, second };
}

function getUtcOffsetHoursForBirth(person) {
  // MVP fixture: Syd's confirmed birth timezone was Louisville/Eastern on 1995-11-05.
  // DST had ended, so local time was EST / UTC-5.
  // Future version should use a real timezone resolver for arbitrary people/dates.
  if (person.timezone === 'America/Kentucky/Louisville' && String(person.birth_date) === '1995-11-05') {
    return -5;
  }

  throw new Error(
    `No timezone offset resolver yet for ${person.timezone} on ${person.birth_date}. Add resolver before calculating this chart.`
  );
}

function toCollection(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  if (value instanceof Map) {
    return Array.from(value.values());
  }

  if (typeof value === 'object') {
    return Object.entries(value).map(([key, entry]) => {
      if (entry && typeof entry === 'object') {
        return {
          key,
          ...entry,
        };
      }

      return {
        key,
        value: entry,
      };
    });
  }

  return [];
}

function summarizePoint(point = {}) {
  return {
    key: point.key,
    name: point.name ?? point.body ?? point.key,
    body: point.body,
    sign: point.signName ?? point.sign,
    sign_index: Number.isFinite(point.sign) ? point.sign : undefined,
    formatted: point.formatted,
    longitude: point.longitude,
    latitude: point.latitude,
    degree: point.degree,
    minute: point.minute,
    second: point.second,
  };
}

function summarizeBody(body = {}) {
  return {
    ...summarizePoint(body),
    house: body.house,
    distance: body.distance,
    longitude_speed: body.longitudeSpeed ?? body.speed,
    retrograde: Boolean(body.isRetrograde ?? body.retrograde),
    dignity: body.dignity ?? null,
  };
}

function summarizePlanets(planets = []) {
  return toCollection(planets).map(summarizeBody);
}

function summarizeAuxiliaryBodies(value) {
  return toCollection(value).map(summarizeBody);
}

function summarizeHouses(houses = []) {
  const cusps = Array.isArray(houses?.cusps) ? houses.cusps : houses;

  return toCollection(cusps).map((house, index) => {
    const houseNumber = house.number ?? house.house ?? Number(house.key);

    return {
      number: Number.isFinite(houseNumber) && houseNumber > 0 ? houseNumber : index + 1,
      ...summarizePoint(house),
      size: house.size,
    };
  });
}

function summarizeAspects(aspects = []) {
  const aspectList = Array.isArray(aspects?.all) ? aspects.all : aspects;

  return toCollection(aspectList).map((aspect) => ({
    type: aspect.type ?? aspect.name ?? aspect.aspectType,
    symbol: aspect.symbol,
    angle: aspect.angle,
    body_a: aspect.planet1?.name ?? aspect.body1?.name ?? aspect.planet1Name ?? aspect.bodyA ?? aspect.body1 ?? aspect.from,
    body_b: aspect.planet2?.name ?? aspect.body2?.name ?? aspect.planet2Name ?? aspect.bodyB ?? aspect.body2 ?? aspect.to,
    separation: aspect.separation,
    deviation: aspect.deviation,
    orb: aspect.orb,
    strength: aspect.strength,
    applying: Boolean(aspect.isApplying ?? aspect.applying),
    out_of_sign: Boolean(aspect.isOutOfSign),
    exact: aspect.exact,
  }));
}

function summarizePatterns(patterns = []) {
  const patternList = Array.isArray(patterns?.all) ? patterns.all : patterns;
  return toCollection(patternList);
}

export function calculateFullPersonChart(person, options = {}) {
  if (!person) throw new Error('Missing person row.');
  if (!person.birth_date) throw new Error('Missing person.birth_date.');
  if (!person.birth_time) throw new Error('Missing person.birth_time.');
  if (person.latitude === null || person.latitude === undefined) throw new Error('Missing person.latitude.');
  if (person.longitude === null || person.longitude === undefined) throw new Error('Missing person.longitude.');

  const { year, month, day } = parseBirthDate(person.birth_date);
  const { hour, minute, second } = parseBirthTime(person.birth_time);
  const timezone = options.timezoneOffsetHours ?? getUtcOffsetHoursForBirth(person);

  const chart = calculateChart({
    year,
    month,
    day,
    hour,
    minute,
    second,
    timezone,
    latitude: Number(person.latitude),
    longitude: Number(person.longitude),
    houseSystem: options.houseSystem ?? 'placidus',
    zodiacType: options.zodiacType ?? 'tropical',
    includeChiron: options.includeChiron ?? true,
    includeNodes: options.includeNodes ?? true,
    includeLilith: options.includeLilith ?? true,
    includeAsteroids: options.includeAsteroids ?? true,
    includeLots: options.includeLots ?? true,
    includePatterns: options.includePatterns ?? true,
  });

  const planets = summarizePlanets(chart.planets);
  const nodes = summarizeAuxiliaryBodies(chart.nodes);
  const lilith = summarizeAuxiliaryBodies(chart.lilith);
  const lots = summarizeAuxiliaryBodies(chart.lots);
  const bodies = [...planets, ...nodes, ...lilith, ...lots];

  return {
    person: {
      id: person.id,
      name: person.name,
      birth_date: person.birth_date,
      birth_time: person.birth_time,
      birth_place: person.birth_place,
      latitude: Number(person.latitude),
      longitude: Number(person.longitude),
      timezone: person.timezone,
      timezone_offset_hours: timezone,
    },
    profile: {
      house_system: options.houseSystem ?? 'placidus',
      zodiac_type: options.zodiacType ?? 'tropical',
      include_chiron: options.includeChiron ?? true,
      include_nodes: options.includeNodes ?? true,
      include_lilith: options.includeLilith ?? true,
      include_asteroids: options.includeAsteroids ?? true,
      include_lots: options.includeLots ?? true,
      include_patterns: options.includePatterns ?? true,
    },
    angles: {
      ascendant: chart.angles?.ascendant,
      midheaven: chart.angles?.midheaven,
      descendant: chart.angles?.descendant,
      imumCoeli: chart.angles?.imumCoeli,
    },
    bodies,
    planets,
    nodes,
    lilith,
    lots,
    houses: summarizeHouses(chart.houses),
    aspects: summarizeAspects(chart.aspects),
    patterns: summarizePatterns(chart.patterns),
    summary: chart.summary ?? null,
    raw: chart,
  };
}
