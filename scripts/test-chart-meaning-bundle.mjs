import { loadLocalEnv } from '../lib/env/loadLocalEnv.mjs';
import { createSupabaseAdminClient } from '../lib/supabase/admin.mjs';
import { calculateFullPersonChart } from '../lib/astro/calculateFullPersonChart.mjs';
import { buildChartMeaningBundle } from '../lib/astro/buildChartMeaningBundle.mjs';

loadLocalEnv();

const supabase = createSupabaseAdminClient();

async function loadTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*');

  if (error) {
    console.warn(`Could not load ${tableName}:`, error.message);
    return [];
  }

  return data ?? [];
}

const { data: person, error: personError } = await supabase
  .from('people')
  .select('id,name,birth_date,birth_time,birth_place,latitude,longitude,timezone,relationship')
  .eq('relationship', 'self')
  .single();

if (personError) {
  console.error('Could not load person row from Supabase.');
  console.error(personError);
  process.exit(1);
}

const reference = {
  celestial_bodies: await loadTable('celestial_bodies'),
  signs: await loadTable('signs'),
  houses: await loadTable('houses'),
  aspects: await loadTable('aspects'),
  decans: await loadTable('decans'),
  placement_meanings: await loadTable('placement_meanings'),
};

const chart = calculateFullPersonChart(person);
const bundle = buildChartMeaningBundle(chart, reference);

console.log('\nTransit Intelligence — Chart Meaning Bundle Test\n');
console.log('Loaded person:');
console.table({
  name: person.name,
  birth_date: person.birth_date,
  birth_time: person.birth_time,
  birth_place: person.birth_place,
  timezone: person.timezone,
});

console.log('\nChart anchors:');
console.table(bundle.anchors);

console.log('\nNormalized chart counts:');
console.table({
  bodies: chart.bodies?.length ?? 0,
  planets: chart.planets?.length ?? 0,
  nodes: chart.nodes?.length ?? 0,
  lilith: chart.lilith?.length ?? 0,
  lots: chart.lots?.length ?? 0,
  houses: chart.houses?.length ?? 0,
  aspects: chart.aspects?.length ?? 0,
  patterns: chart.patterns?.length ?? 0,
});

console.log('\nReference + meaning coverage:');
console.table(bundle.coverage.reference_counts);
console.table(bundle.coverage.matched);

console.log('\nPlacement preview:');
console.table(
  bundle.cards.placements.slice(0, 12).map((card) => ({
    title: card.title,
    body_ref: Boolean(card.references.body),
    sign_ref: Boolean(card.references.sign),
    house_ref: Boolean(card.references.house),
    placement_meaning: Boolean(card.references.placement_meaning),
  }))
);

console.log('\nHouse preview:');
console.table(
  bundle.cards.houses.slice(0, 12).map((card) => ({
    title: card.title,
    house_ref: Boolean(card.references.house),
    sign_ref: Boolean(card.references.sign),
  }))
);

console.log('\nAspect preview:');
console.table(
  bundle.cards.aspects.slice(0, 12).map((card) => ({
    title: card.title,
    aspect_ref: Boolean(card.references.aspect),
    strength: card.fact.strength,
    orb: card.fact.orb,
    applying: card.fact.applying,
  }))
);

if ((chart.houses?.length ?? 0) !== 12) {
  throw new Error(`Expected 12 normalized houses, got ${chart.houses?.length ?? 0}`);
}

if ((chart.aspects?.length ?? 0) < 10) {
  throw new Error(`Expected a full aspect list, got ${chart.aspects?.length ?? 0}`);
}

if ((bundle.cards.placements?.length ?? 0) === 0) {
  throw new Error('Expected placement cards to be generated.');
}

console.log('\nMeaning bundle test passed. Chart facts are joining to Supabase reference data.\n');
