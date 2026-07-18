-- app_state: the cloud shadow of the prototype's S object.
-- The client remains the runtime source of truth; this table makes it survive
-- refreshes and devices. Normalizing into readings/journal_entries/etc. is a
-- later step (see docs/ROADMAP.md).
create table if not exists public.app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "app_state_select_own" on public.app_state;
create policy "app_state_select_own" on public.app_state
  for select using (auth.uid() = user_id);

drop policy if exists "app_state_insert_own" on public.app_state;
create policy "app_state_insert_own" on public.app_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "app_state_update_own" on public.app_state;
create policy "app_state_update_own" on public.app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "app_state_delete_own" on public.app_state;
create policy "app_state_delete_own" on public.app_state
  for delete using (auth.uid() = user_id);

-- profiles grows the birth fields the onboarding collects
alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists birth_time text,
  add column if not exists birth_place text,
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists tz_name text,
  add column if not exists onboarded boolean not null default false;
