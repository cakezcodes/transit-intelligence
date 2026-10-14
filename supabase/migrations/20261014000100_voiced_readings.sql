-- Written readings (Rule 2: detection is free math; voicing is the only paid step).
-- One row per generated reading, generated on demand when the owner opens it and kept,
-- so the same chart + voice version is never paid for twice.
create table if not exists public.voiced_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,             -- 'natal_promise' (later: 'event', 'spread')
  ref_key text not null,          -- what it reads: the chart's computed_at, an event key, a reading id
  voice_version text not null,    -- bump to re-voice everything
  title text,
  body text not null,
  model text,
  usage jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref_key, voice_version)
);

alter table public.voiced_readings enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'voiced_readings' and policyname = 'voiced_readings_owner') then
    create policy voiced_readings_owner on public.voiced_readings for all to authenticated
      using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
end $$;
