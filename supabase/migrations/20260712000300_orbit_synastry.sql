-- Orbit tab (Phase D step 7): roster mechanics + synastry cache.
--
-- people gains per-person chart settings:
--   house_system — you read yourself in Porphyry; a friend screenshotting
--     from another app may be Placidus. Per-person, never global.
--   time_known — false means noon-default birth time: charts for that
--     person suppress ASC/MC/houses entirely (never present noon houses
--     as real).
--
-- synastry caches the pairwise computation (compute once, read forever):
--   overlays — whose planets land in whose houses (joined to
--     synastry_meanings by planet x house_number in the compare view)
--   cross_aspects — planet-to-planet aspects between the two charts

alter table public.people
  add column if not exists house_system text not null default 'porphyry'
    check (house_system in ('porphyry', 'whole_sign', 'placidus')),
  add column if not exists time_known boolean not null default true;

create table public.synastry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  person_a uuid not null references public.people (id) on delete cascade,
  person_b uuid not null references public.people (id) on delete cascade,
  house_system text not null default 'porphyry'
    check (house_system in ('porphyry', 'whole_sign', 'placidus')),
  -- { "a_in_b": [{"body":"sun","house":5}], "b_in_a": [...] }
  -- a_in_b/b_in_a are null when the host person's houses are unknown
  -- (time_known = false).
  overlays jsonb not null,
  -- [{"body_a":"sun","body_b":"moon","aspect":"trine","orb":1.2}]
  cross_aspects jsonb not null,
  computed_at timestamptz not null default now(),
  constraint synastry_pair_unique unique (person_a, person_b, house_system),
  constraint synastry_pair_ordered check (person_a < person_b)
);

create index synastry_user_idx on public.synastry (user_id);

alter table public.synastry enable row level security;

create policy "Owners can read their synastry"
  on public.synastry for select
  using (auth.uid() = user_id);

create policy "Owners can insert their synastry"
  on public.synastry for insert
  with check (auth.uid() = user_id);

create policy "Owners can update their synastry"
  on public.synastry for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners can delete their synastry"
  on public.synastry for delete
  using (auth.uid() = user_id);
