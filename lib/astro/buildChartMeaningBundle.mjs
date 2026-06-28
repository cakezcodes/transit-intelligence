const SIGN_ALIASES = new Map([
  ['aries', 'aries'],
  ['taurus', 'taurus'],
  ['gemini', 'gemini'],
  ['cancer', 'cancer'],
  ['leo', 'leo'],
  ['virgo', 'virgo'],
  ['libra', 'libra'],
  ['scorpio', 'scorpio'],
  ['sagittarius', 'sagittarius'],
  ['capricorn', 'capricorn'],
  ['aquarius', 'aquarius'],
  ['pisces', 'pisces'],
]);

function normalizeKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeName(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^mean_/, '')
    .replace(/^true_/, '')
    .replace(/_/g, ' ');
}

function byAnyName(rows = [], keys = []) {
  const index = new Map();

  for (const row of rows) {
    for (const key of keys) {
      const value = row?.[key];
      if (value === null || value === undefined) continue;
      index.set(normalizeName(value), row);
      index.set(normalizeKey(value), row);
    }
  }

  return index;
}

function compactRow(row) {
  if (!row) return null;

  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== null && value !== undefined && value !== '')
  );
}

function pickMeaningText(row) {
  if (!row) return null;

  return (
    row.meaning ??
    row.description ??
    row.summary ??
    row.keywords ??
    row.interpretation ??
    row.text ??
    null
  );
}

function signKey(sign) {
  const normalized = normalizeName(sign);
  return SIGN_ALIASES.get(normalized) ?? normalized;
}

function findPlacementMeaning(placementMeanings, placement) {
  if (!placementMeanings?.length) return null;

  const body = normalizeName(placement.name ?? placement.body);
  const sign = signKey(placement.sign);
  const house = Number(placement.house);

  const exact = placementMeanings.find((row) => {
    const rowBody = normalizeName(row.body ?? row.planet ?? row.celestial_body ?? row.point ?? row.name);
    const rowSign = signKey(row.sign ?? row.zodiac_sign);
    const rowHouse = Number(row.house ?? row.house_number);

    return rowBody === body && rowSign === sign && rowHouse === house;
  });

  if (exact) return exact;

  return placementMeanings.find((row) => {
    const rowBody = normalizeName(row.body ?? row.planet ?? row.celestial_body ?? row.point ?? row.name);
    const rowSign = signKey(row.sign ?? row.zodiac_sign);
    const rowHouse = Number(row.house ?? row.house_number);

    return (
      (rowBody === body && rowSign === sign) ||
      (rowBody === body && rowHouse === house) ||
      (rowSign === sign && rowHouse === house)
    );
  }) ?? null;
}

function formatPlacementTitle(placement) {
  const houseText = placement.house ? `${placement.house}H` : 'no house';
  return `${placement.name ?? placement.body} in ${placement.sign} ${houseText}`;
}

function buildPlacementCards(chart, reference) {
  const celestialBodiesByName = byAnyName(reference.celestial_bodies, ['name', 'slug', 'key', 'body']);
  const signsByName = byAnyName(reference.signs, ['name', 'slug', 'key']);
  const housesByNumber = new Map(
    (reference.houses ?? []).map((house) => [Number(house.number ?? house.house ?? house.house_number), house])
  );

  return (chart.bodies?.length ? chart.bodies : chart.planets ?? []).map((placement) => {
    const bodyRef = celestialBodiesByName.get(normalizeName(placement.name ?? placement.body)) ?? null;
    const signRef = signsByName.get(signKey(placement.sign)) ?? null;
    const houseRef = housesByNumber.get(Number(placement.house)) ?? null;
    const placementMeaning = findPlacementMeaning(reference.placement_meanings, placement);

    return {
      title: formatPlacementTitle(placement),
      fact: {
        body: placement.name ?? placement.body,
        sign: placement.sign,
        house: placement.house,
        formatted: placement.formatted,
        longitude: placement.longitude,
        retrograde: placement.retrograde,
        dignity: placement.dignity,
      },
      references: {
        body: compactRow(bodyRef),
        sign: compactRow(signRef),
        house: compactRow(houseRef),
        placement_meaning: compactRow(placementMeaning),
      },
      text_sources: {
        body: pickMeaningText(bodyRef),
        sign: pickMeaningText(signRef),
        house: pickMeaningText(houseRef),
        placement: pickMeaningText(placementMeaning),
      },
    };
  });
}

function buildAspectCards(chart, reference) {
  const aspectsByName = byAnyName(reference.aspects, ['name', 'slug', 'key', 'type']);

  return (chart.aspects ?? []).map((aspect) => {
    const aspectRef = aspectsByName.get(normalizeName(aspect.type)) ?? null;

    return {
      title: `${aspect.body_a} ${aspect.symbol ?? aspect.type} ${aspect.body_b}`,
      fact: aspect,
      references: {
        aspect: compactRow(aspectRef),
      },
      text_sources: {
        aspect: pickMeaningText(aspectRef),
      },
    };
  });
}

function buildHouseCards(chart, reference) {
  const housesByNumber = new Map(
    (reference.houses ?? []).map((house) => [Number(house.number ?? house.house ?? house.house_number), house])
  );
  const signsByName = byAnyName(reference.signs, ['name', 'slug', 'key']);

  return (chart.houses ?? []).map((house) => {
    const houseRef = housesByNumber.get(Number(house.number)) ?? null;
    const signRef = signsByName.get(signKey(house.sign)) ?? null;

    return {
      title: `House ${house.number} cusp in ${house.sign}`,
      fact: house,
      references: {
        house: compactRow(houseRef),
        sign: compactRow(signRef),
      },
      text_sources: {
        house: pickMeaningText(houseRef),
        sign: pickMeaningText(signRef),
      },
    };
  });
}

function summarizeCoverage(cards, reference) {
  return {
    reference_counts: {
      celestial_bodies: reference.celestial_bodies?.length ?? 0,
      signs: reference.signs?.length ?? 0,
      houses: reference.houses?.length ?? 0,
      aspects: reference.aspects?.length ?? 0,
      decans: reference.decans?.length ?? 0,
      placement_meanings: reference.placement_meanings?.length ?? 0,
    },
    matched: {
      placements_with_body_ref: cards.placements.filter((card) => card.references.body).length,
      placements_with_sign_ref: cards.placements.filter((card) => card.references.sign).length,
      placements_with_house_ref: cards.placements.filter((card) => card.references.house).length,
      placements_with_specific_meaning: cards.placements.filter((card) => card.references.placement_meaning).length,
      aspects_with_ref: cards.aspects.filter((card) => card.references.aspect).length,
      houses_with_ref: cards.houses.filter((card) => card.references.house).length,
    },
  };
}

export function buildChartMeaningBundle(chart, reference = {}) {
  if (!chart) throw new Error('Missing calculated chart.');

  const cards = {
    placements: buildPlacementCards(chart, reference),
    houses: buildHouseCards(chart, reference),
    aspects: buildAspectCards(chart, reference),
  };

  return {
    person: chart.person,
    profile: chart.profile,
    anchors: {
      ascendant: chart.angles?.ascendant?.formatted,
      midheaven: chart.angles?.midheaven?.formatted,
      sun: cards.placements.find((card) => normalizeName(card.fact.body) === 'sun')?.fact.formatted,
      moon: cards.placements.find((card) => normalizeName(card.fact.body) === 'moon')?.fact.formatted,
    },
    cards,
    coverage: summarizeCoverage(cards, reference),
  };
}
