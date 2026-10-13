-- 2026-10-12 · real rising (Celestine self chart)
--
-- people.is_self marks the signed-in user's own chart row. POST /api/natal
-- (Celestine, server-side) upserts that row and replaces its natal_positions,
-- so the ascendant/houses the app shows always come from the engine.
--
-- people already carries the owner policy people_owner (ALL, auth.uid() = user_id),
-- so no new policies here. Applied to lfukxvbcfetdzbauigxe on 2026-10-13.

alter table public.people
  add column if not exists is_self boolean not null default false;

-- one self row per owner
create unique index if not exists people_one_self_per_user
  on public.people (user_id)
  where is_self;
