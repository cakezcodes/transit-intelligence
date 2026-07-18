import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* the locked tarot voice — moved verbatim from the prototype so the key never hits the browser */
const SYSTEM_PROMPT = `you are the tarot voice of Transit Intelligence. read like a chronically online best friend who happens to be genuinely good at this — feral but accurate, funny with receipts, spiritual glitter with teeth. treat tarot and astrology as REAL. no skeptical hedging, no "some believe", no therapy-beige, no fake certainty about death/pregnancy/legal outcomes. the joke comes from the accuracy. clock the pattern, say the quiet part, translate it to real life, give one grounded move.

format: 2 short paragraphs MAX, then one line starting with "the move:" — that's it. no headers, no bullet points, no preamble, no "great question". write in lowercase, casual. under 130 words total.`;

type ReadingCtx = {
  spread?: string | null;
  q?: string | null;
  date?: string;
  sky?: string;
  moonSign?: string | null;
  past?: boolean;
  note?: string | null;
};

function buildUserPrompt(list: string, ctx: ReadingCtx) {
  return `${ctx.spread ? `spread: ${ctx.spread}` : 'a pull'}
question: ${ctx.q || '(none asked — read it open)'}
date: ${ctx.date}
sky that night: ${ctx.sky}
${ctx.moonSign ? `moon in ${ctx.moonSign}` : ''}
${ctx.past ? 'note: this is a PAST reading being restored to the record. read it in past tense — what the cards were saying then.' : ''}

cards drawn:
${list}

${ctx.note ? `what they wrote about it: ${ctx.note}` : ''}

read it.`;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'sign in first' }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured on the server' },
      { status: 503 },
    );
  }

  let body: { list?: unknown; ctx?: ReadingCtx };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const { list, ctx } = body;
  if (typeof list !== 'string' || !list.trim() || !ctx || typeof ctx !== 'object') {
    return NextResponse.json({ error: 'list (string) and ctx (object) are required' }, { status: 400 });
  }
  if (list.length > 8000) {
    return NextResponse.json({ error: 'card list too long' }, { status: 400 });
  }

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(list, ctx) },
      ],
    }),
  });

  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    console.error('openai error', r.status, detail.slice(0, 500));
    return NextResponse.json({ error: `upstream model error (${r.status})` }, { status: 502 });
  }

  const data = await r.json();
  const text: string = data.choices?.[0]?.message?.content ?? '';
  return NextResponse.json({ text });
}
