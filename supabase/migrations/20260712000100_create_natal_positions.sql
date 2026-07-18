-- Phase D step 1: natal chart storage.
-- One row per stored chart element: bodies (planets/nodes/lilith with
-- Porphyry house assignment), the four angles, and the 12 house cusps.
-- Positions come from Celestine; Porphyry cusps are derived from ASC/MC.

create table public.natal_positions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  user_id uuid not null,
  house_system text not null default 'porphyry'
    check (house_system in ('porphyry', 'whole_sign', 'placidus')),
  kind text not null check (kind in ('body', 'angle', 'house_cusp')),
  -- bodies: 'sun'..'pluto', 'chiron', 'north_node', 'south_node', 'lilith'
  -- angles: 'asc', 'mc', 'dsc', 'ic'
  -- cusps:  'cusp_1'..'cusp_12'
  body_key text not null,
  -- bodies: natal house 1-12; cusps: cusp number 1-12; angles: null
  house smallint check (house between 1 and 12),
  sign text not null,
  degree_in_sign numeric(8, 5) not null,
  absolute_longitude numeric(9, 5) not null
    check (absolute_longitude >= 0 and absolute_longitude < 360),
  retrograde boolean,
  speed numeric,
  computed_at timestamptz not null default now(),
  constraint natal_positions_slot_unique unique (person_id, house_system, body_key),
  constraint natal_positions_cusp_has_house
    check (kind <> 'house_cusp' or house is not null)
);

create index natal_positions_person_idx on public.natal_positions (person_id);
create index natal_positions_user_idx on public.natal_positions (user_id);

alter table public.natal_positions enable row level security;

create policy "Owners can read their natal positions"
  on public.natal_positions for select
  using (auth.uid() = user_id);

create policy "Owners can insert their natal positions"
  on public.natal_positions for insert
  with check (auth.uid() = user_id);

create policy "Owners can update their natal positions"
  on public.natal_positions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owners can delete their natal positions"
  on public.natal_positions for delete
  using (auth.uid() = user_id);
