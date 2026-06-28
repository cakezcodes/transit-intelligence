import { loadLocalEnv } from '../lib/env/loadLocalEnv.mjs';
import { createSupabaseClient } from '../lib/supabase/client.mjs';
import { calculateFullPersonChart } from '../lib/astro/calculateFullPersonChart.mjs';

loadLocalEnv();

const supabase = createSupabaseClient();

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

const chart = calculateFullPersonChart(person);

const planetByName = Object.fromEntries(chart.planets.map((planet) => [planet.name, planet]));

console.log('\nTransit Intelligence — Supabase → Celestine full chart bridge\n');
console.log('Loaded person from Supabase:');
console.table({
  name: chart.person.name,
  birth_date: chart.person.birth_date,
  birth_time: chart.person.birth_time,
  birth_place: chart.person.birth_place,
  timezone: chart.person.timezone,
});

console.log('\nChart anchors calculated from live Supabase data:');
console.table({
  ascendant: chart.angles.ascendant?.formatted,
  midheaven: chart.angles.midheaven?.formatted,
  sun: planetByName.Sun?.formatted,
  moon: planetByName.Moon?.formatted,
  mercury: planetByName.Mercury?.formatted,
  venus: planetByName.Venus?.formatted,
  mars: planetByName.Mars?.formatted,
  jupiter: planetByName.Jupiter?.formatted,
  saturn: planetByName.Saturn?.formatted,
  uranus: planetByName.Uranus?.formatted,
  neptune: planetByName.Neptune?.formatted,
  pluto: planetByName.Pluto?.formatted,
});

console.log('\nCounts:');
console.table({
  planets: chart.planets.length,
  houses: chart.houses.length,
  aspects: chart.aspects.length,
  patterns: Array.isArray(chart.patterns) ? chart.patterns.length : 0,
});

const checks = [
  ['Sun sign', planetByName.Sun?.sign, 'Scorpio'],
  ['Moon sign', planetByName.Moon?.sign, 'Aries'],
  ['Ascendant sign', chart.angles.ascendant?.signName, 'Pisces'],
  ['Midheaven sign', chart.angles.midheaven?.signName, 'Sagittarius'],
];

let passed = true;

for (const [label, actual, expected] of checks) {
  const ok = actual === expected;
  passed = passed && ok;
  console.log(`${ok ? '✅' : '❌'} ${label}: ${actual} ${ok ? 'matches' : `does not match ${expected}`}`);
}

if (!passed) {
  console.error('\nSupabase chart bridge failed validation. Do not wire UI to this yet.');
  process.exit(1);
}

console.log('\nSupabase chart bridge passed. Live DB birth data is feeding Celestine correctly.\n');
