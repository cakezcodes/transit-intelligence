import { calculateChart } from 'celestine';

const chart = calculateChart({
  year: 1995,
  month: 11,
  day: 5,
  hour: 14,
  minute: 52,
  second: 0,
  // Louisville / Eastern local birth time on 1995-11-05.
  // EST offset is UTC-5 after daylight saving time ended.
  timezone: -5,
  latitude: 38.2776,
  longitude: -85.7372,
  houseSystem: 'placidus',
});

const byName = Object.fromEntries(chart.planets.map((planet) => [planet.name, planet]));

const results = {
  ascendant: chart.angles.ascendant.formatted,
  midheaven: chart.angles.midheaven.formatted,
  sun: byName.Sun.formatted,
  moon: byName.Moon.formatted,
  mercury: byName.Mercury.formatted,
  venus: byName.Venus.formatted,
  mars: byName.Mars.formatted,
  jupiter: byName.Jupiter.formatted,
  saturn: byName.Saturn.formatted,
  uranus: byName.Uranus.formatted,
  neptune: byName.Neptune.formatted,
  pluto: byName.Pluto.formatted,
};

console.log('\nTransit Intelligence — Syd chart validation\n');
console.table(results);

const checks = [
  ['Sun sign', byName.Sun.signName, 'Scorpio'],
  ['Moon sign', byName.Moon.signName, 'Aries'],
  ['Ascendant sign', chart.angles.ascendant.signName, 'Pisces'],
  ['Ascendant degree', chart.angles.ascendant.degree, 8],
  ['Midheaven sign', chart.angles.midheaven.signName, 'Sagittarius'],
];

let passed = true;

for (const [label, actual, expected] of checks) {
  const ok = actual === expected;
  passed = passed && ok;
  console.log(`${ok ? '✅' : '❌'} ${label}: ${actual} ${ok ? 'matches' : `does not match ${expected}`}`);
}

if (!passed) {
  console.error('\nChart validation failed. Do not build chart-dependent features until this is fixed.');
  process.exit(1);
}

console.log('\nChart validation passed. Celestine is safe to wire into the app spine.\n');
