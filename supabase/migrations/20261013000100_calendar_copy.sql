-- Product copy for public Cosmic Calendar events (ENERGY FORECAST / LEAN INTO / AVOID / TEA),
-- keyed by lib/calendar/feeds.mjs copyKey(). The text is product writing, so it lives
-- here and never in the repo; scripts/calendar/import-copy.mjs loads it from the
-- published .ics files. Signed-in users can read it (the app's calendar shows it);
-- only the service role writes.
create table if not exists public.calendar_copy (
  key text primary key,
  body text not null,
  source text,
  updated_at timestamptz not null default now()
);

alter table public.calendar_copy enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'calendar_copy' and policyname = 'calendar_copy_read_signed_in') then
    create policy calendar_copy_read_signed_in on public.calendar_copy for select to authenticated using (true);
  end if;
end $$;
