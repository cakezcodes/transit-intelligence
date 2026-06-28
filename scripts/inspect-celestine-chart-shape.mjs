import { loadLocalEnv } from '../lib/env/loadLocalEnv.mjs';
import { createSupabaseAdminClient } from '../lib/supabase/admin.mjs';
import { calculateFullPersonChart } from '../lib/astro/calculateFullPersonChart.mjs';

loadLocalEnv();

const supabase = createSupabaseAdminClient();

const { data: person, error } = await supabase
  .from('people')
  .select('id,name,birth_date,birth_time,birth_place,latitude,longitude,timezone,relationship')
  .eq('relationship', 'self')
  .single();

if (error) {
  console.error('Could not load person row from Supabase.');
  console.error(error);
  process.exit(1);
}

const chartBundle = calculateFullPersonChart(person);
const raw = chartBundle.raw;

function describeValue(value) {
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }

  if (value instanceof Map) {
    return `Map(${value.size})`;
  }

  if (value && typeof value === 'object') {
    return `object(${Object.keys(value).length})`;
  }

  return typeof value;
}

function previewCollection(label, value, limit = 5) {
  console.log(`\n${label}`);
  console.log('shape:', describeValue(value));

  if (!value) return;

  const entries = Array.isArray(value)
    ? value.map((entry, index) => [index, entry])
    : value instanceof Map
      ? Array.from(value.entries())
      : typeof value === 'object'
        ? Object.entries(value)
        : [];

  console.log('keys:', entries.slice(0, 20).map(([key]) => key));
  console.dir(entries.slice(0, limit), { depth: 4 });
}

console.log('\nTransit Intelligence — Celestine raw chart shape inspector\n');
console.log('person:', {
  name: person.name,
  birth_date: person.birth_date,
  birth_time: person.birth_time,
  birth_place: person.birth_place,
  timezone: person.timezone,
});

console.log('\nTop-level raw chart keys:');
console.log(Object.keys(raw));

previewCollection('raw.angles', raw.angles);
previewCollection('raw.planets', raw.planets);
previewCollection('raw.houses', raw.houses);
previewCollection('raw.aspects', raw.aspects);
previewCollection('raw.patterns', raw.patterns);
previewCollection('raw.summary', raw.summary);

console.log('\nNormalized bundle counts:');
console.table({
  planets: chartBundle.planets.length,
  houses: chartBundle.houses.length,
  aspects: chartBundle.aspects.length,
  patterns: chartBundle.patterns.length,
});

console.log('\nNormalized planets preview:');
console.table(chartBundle.planets.slice(0, 20));

console.log('\nNormalized houses preview:');
console.table(chartBundle.houses);

console.log('\nInspector complete. Use this output to improve the normalizer before UI/calendar wiring.\n');
