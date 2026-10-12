-- 2026-10-12 · real rising (Celestine self chart)
--
-- people.is_self marks the signed-in user's own chart row. POST /api/natal
-- (Celestine, server-side) upserts that row and replaces its natal_positions,
-- so the ascendant/houses the app shows always come from the engine — never
-- from client-side approximations.

alter table public.people
  add column if not exists is_self boolean not null default false;

-- one self row per owner
create unique index if not exists people_one_self_per_user
  on public.people (user_id)
  where is_self;

-- people RLS (owner-scoped) — idempotent: only adds policies if the table
-- doesn't already have owner policies under these names.
alter table public.people enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'people' and policyname = 'people_select_own') then
    create policy "people_select_own" on public.people for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'people' and policyname = 'people_insert_own') then
    create policy "people_insert_own" on public.people for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'people' and policyname = 'people_update_own') then
    create policy "people_update_own" on public.people for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
