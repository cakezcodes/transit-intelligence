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

function summarizePlanets(planets = []) {
  return planets.map((planet) => ({
    name: planet.name,
    sign: planet.signName,
    formatted: planet.formatted,
    longitude: planet.longitude,
    degree: planet.degree,
    minute: planet.minute,
    second: planet.second,
    house: planet.house,
    retrograde: Boolean(planet.retrograde),
    speed: planet.speed,
  }));
}

function summarizeHouses(houses = []) {
  return houses.map((house) => ({
    number: house.number,
    sign: house.signName,
    formatted: house.formatted,
    longitude: house.longitude,
    degree: house.degree,
    minute: house.minute,
    second: house.second,
  }));
}

function summarizeAspects(aspects = []) {
  return aspects.map((aspect) => ({
    type: aspect.type ?? aspect.name,
    bodyA: aspect.planet1?.name ?? aspect.body1?.name ?? aspect.planet1Name,
    bodyB: aspect.planet2?.name ?? aspect.body2?.name ?? aspect.planet2Name,
    orb: aspect.orb,
    applying: aspect.applying,
    exact: aspect.exact,
  }));
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
    planets: summarizePlanets(chart.planets),
    houses: summarizeHouses(chart.houses),
    aspects: summarizeAspects(chart.aspects),
    patterns: chart.patterns ?? [],
    summary: chart.summary ?? null,
    raw: chart,
  };
}
