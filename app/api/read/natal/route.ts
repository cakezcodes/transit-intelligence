import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { natalEvidence, type NatalRow } from '@/lib/voice/natalEvidence';
import { VOICE, NATAL_TASK, VOICE_MODEL, VOICE_VERSION } from '@/lib/voice/voice';

/* GET  /api/read/natal — the saved natal promise for the signed-in user's chart, if any.
   POST /api/read/natal — write it (on demand, once per chart + voice version; Rule 2).
   The evidence comes from natal_positions (Celestine, Rule 1), never from the client. */

export const runtime = 'nodejs';
export const maxDuration = 300;

const KIND = 'natal_promise';

async function selfChart(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: people } = await supabase.from('people').select('id,time_known,is_self').eq('user_id', userId);
  const me = people?.find((p) => p.is_self) ?? people?.[0];
  if (!me) return null;
  const { data: rows } = await supabase
    .from('natal_positions')
    .select('kind,body_key,house,sign,degree_in_sign,absolute_longitude,retrograde,computed_at')
    .eq('person_id', me.id)
    .eq('house_system', 'porphyry');
  if (!rows?.length) return null;
  const refKey = rows.map((r) => r.computed_at).sort().pop() as string;
  return { rows: rows as (NatalRow & { computed_at: string })[], timeKnown: !!me.time_known, refKey };
}

async function saved(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, refKey: string) {
  const { data } = await supabase
    .from('voiced_readings')
    .select('title,body,created_at')
    .eq('user_id', userId)
    .eq('kind', KIND)
    .eq('ref_key', refKey)
    .eq('voice_version', VOICE_VERSION)
    .maybeSingle();
  return data;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'sign in first' }, { status: 401 });
  const chart = await selfChart(supabase, user.id);
  if (!chart) return NextResponse.json({ reading: null, chart: false });
  return NextResponse.json({ reading: await saved(supabase, user.id, chart.refKey), chart: true, enabled: !!process.env.ANTHROPIC_API_KEY });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'sign in first' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'readings aren’t switched on yet' }, { status: 503 });
  }
  const chart = await selfChart(supabase, user.id);
  if (!chart) return NextResponse.json({ error: 'cast your chart first' }, { status: 409 });
  const have = await saved(supabase, user.id, chart.refKey);
  if (have) return NextResponse.json({ reading: have, cached: true });

  const evidence = natalEvidence(chart.rows, chart.timeKnown);
  const client = new Anthropic();
  let message;
  try {
    const stream = client.beta.messages.stream({
      model: VOICE_MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      system: [{ type: 'text', text: VOICE, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: `${NATAL_TASK}\n\n${evidence}` }],
    });
    message = await stream.finalMessage();
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: 'the reading key is wrong — check ANTHROPIC_API_KEY' }, { status: 502 });
    if (e instanceof Anthropic.RateLimitError) return NextResponse.json({ error: 'too many readings at once — try again in a minute' }, { status: 429 });
    if (e instanceof Anthropic.APIError) return NextResponse.json({ error: 'the reader is having a moment — try again' }, { status: 502 });
    throw e;
  }
  if (message.stop_reason === 'refusal') return NextResponse.json({ error: 'this one couldn’t be written — try again' }, { status: 502 });

  const text = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
  const [first, ...rest] = text.split(/\n\s*\n/);
  const title = first.replace(/^title:\s*/i, '').replace(/[#*]/g, '').trim();
  const body = rest.join('\n\n').trim();
  if (!body) return NextResponse.json({ error: 'the reading came back empty — try again' }, { status: 502 });

  const row = {
    user_id: user.id, kind: KIND, ref_key: chart.refKey, voice_version: VOICE_VERSION,
    title, body, model: message.model, usage: message.usage,
  };
  const { error } = await supabase.from('voiced_readings').upsert(row, { onConflict: 'user_id,kind,ref_key,voice_version' });
  return NextResponse.json({ reading: { title, body, created_at: new Date().toISOString() }, stored: !error });
}
