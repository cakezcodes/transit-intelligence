/**
 * Compute + store natal positions for people (Phase D step 1).
 *
 * Usage:
 *   node scripts/compute-natal-positions.mjs             # all people missing rows
 *   node scripts/compute-natal-positions.mjs <person_id> # one person, recompute
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Idempotent: rows are upserted per (person, house_system, slot).
 */

import { loadLocalEnv } from '../lib/env/loadLocalEnv.mjs';
import { createSupabaseAdminClient } from '../lib/supabase/admin.mjs';
import { computeNatalPositions } from '../lib/astro/computeNatalPositions.mjs';

loadLocalEnv();

const personId = process.argv[2] ?? null;
const supabase = createSupabaseAdminClient();

async function fetchPeople() {
  let query = supabase.from('people').select('*');
  if (personId) query = query.eq('id', personId);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch people: ${error.message}`);
  if (!data?.length) throw new Error(personId ? `No person with id ${personId}.` : 'No people rows.');
  return data;
}

async function storeForPerson(person) {
  const { houseSystem, rows } = computeNatalPositions(person);

  const payload = rows.map((row) => ({
    ...row,
    person_id: person.id,
    user_id: person.user_id,
    house_system: houseSystem,
    computed_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('natal_positions')
    .upsert(payload, { onConflict: 'person_id,house_system,body_key' });
  if (error) throw new Error(`Upsert failed for ${person.name}: ${error.message}`);

  console.log(`✅ ${person.name}: ${payload.length} rows stored (${houseSystem}).`);
}

const people = await fetchPeople();
for (const person of people) {
  await storeForPerson(person);
}
