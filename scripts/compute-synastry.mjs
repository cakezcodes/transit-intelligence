/**
 * Compute + cache synastry for a pair of people (Orbit tab).
 *
 * Usage:
 *   node scripts/compute-synastry.mjs <person_a_id> <person_b_id>
 *
 * Reads both people's stored natal_positions (compute those first via
 * `npm run natal:compute`), computes overlays + cross-aspects, and
 * upserts one `synastry` row per pair (person ids in sorted order).
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import { loadLocalEnv } from '../lib/env/loadLocalEnv.mjs';
import { createSupabaseAdminClient } from '../lib/supabase/admin.mjs';
import { computeSynastry } from '../lib/astro/synastry.mjs';

loadLocalEnv();

const [idA, idB] = process.argv.slice(2);
if (!idA || !idB || idA === idB) {
  console.error('Usage: node scripts/compute-synastry.mjs <person_a_id> <person_b_id>');
  process.exit(1);
}

// Canonical pair order matches the table's (person_a < person_b) constraint.
const [personA, personB] = [idA, idB].sort();
const supabase = createSupabaseAdminClient();

async function loadChart(personId) {
  const { data: person, error: personError } = await supabase
    .from('people').select('id, user_id, name, house_system, time_known').eq('id', personId).single();
  if (personError) throw new Error(`Person ${personId}: ${personError.message}`);

  const { data: rows, error } = await supabase
    .from('natal_positions')
    .select('kind, body_key, house, absolute_longitude')
    .eq('person_id', personId)
    .eq('house_system', person.house_system ?? 'porphyry');
  if (error) throw new Error(`natal_positions for ${person.name}: ${error.message}`);
  if (!rows?.length) throw new Error(`No natal_positions for ${person.name} — run npm run natal:compute ${personId} first.`);

  return {
    person,
    planets: rows
      .filter((r) => r.kind === 'body')
      .map((r) => ({ body: r.body_key, absoluteLongitude: Number(r.absolute_longitude) })),
    cusps: person.time_known === false ? null : rows
      .filter((r) => r.kind === 'house_cusp')
      .map((r) => ({ house: r.house, absoluteLongitude: Number(r.absolute_longitude) })),
  };
}

const chartA = await loadChart(personA);
const chartB = await loadChart(personB);

if (chartA.person.user_id !== chartB.person.user_id) {
  throw new Error('Both people must belong to the same owner.');
}

const { overlays, cross_aspects } = computeSynastry(chartA, chartB);

const { error } = await supabase.from('synastry').upsert({
  user_id: chartA.person.user_id,
  person_a: personA,
  person_b: personB,
  house_system: chartA.person.house_system ?? 'porphyry',
  overlays,
  cross_aspects,
  computed_at: new Date().toISOString(),
}, { onConflict: 'person_a,person_b,house_system' });
if (error) throw new Error(`Upsert synastry failed: ${error.message}`);

console.log(`✅ ${chartA.person.name} × ${chartB.person.name}:`);
console.log(`   ${chartA.person.name} in ${chartB.person.name}'s houses: ${overlays.a_in_b ? overlays.a_in_b.length : 'suppressed (time unknown)'}`);
console.log(`   ${chartB.person.name} in ${chartA.person.name}'s houses: ${overlays.b_in_a ? overlays.b_in_a.length : 'suppressed (time unknown)'}`);
console.log(`   cross-aspects: ${cross_aspects.length} (tightest: ${cross_aspects[0] ? `${cross_aspects[0].body_a}-${cross_aspects[0].body_b} ${cross_aspects[0].aspect} ${cross_aspects[0].orb}°` : 'none'})`);
