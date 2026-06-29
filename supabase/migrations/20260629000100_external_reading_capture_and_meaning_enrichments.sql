-- External Reading Capture + Meaning Enrichment Layer
-- Purpose: store trusted creator readings, sign sections, tarot cards, user logs,
-- and append-only meaning enrichments without overwriting base reference data.

create table if not exists public.meaning_enrichments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  target_type text not null check (target_type in (
    'sign',
    'house',
    'aspect',
    'aspect_pattern',
    'celestial_body',
    'planet',
    'decan',
    'tarot_card',
    'placement_meaning',
    'transit_event_type',
    'progression_event_type',
    'calendar_event'
  )),
  target_id uuid,
  target_key text,
  source_type text not null default 'manual' check (source_type in (
    'manual',
    'external_reading',
    'research',
    'system',
    'user_note'
  )),
  source_id uuid,
  layer_type text not null check (layer_type in (
    'correspondence',
    'interpretation',
    'ritual',
    'theme',
    'timing',
    'note',
    'canon'
  )),
  title text,
  distilled_text text not null,
  tags text[] default '{}',
  confidence text not null default 'draft' check (confidence in ('draft', 'reviewed', 'trusted', 'rejected')),
  verified boolean not null default false,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meaning_enrichments_target_required check (target_id is not null or target_key is not null)
);

create table if not exists public.reading_sources (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  creator text not null,
  source_url text,
  source_type text not null default 'manual' check (source_type in ('youtube', 'audio', 'manual', 'transcript')),
  reading_type text not null check (reading_type in ('transit', 'tarot', 'hybrid', 'ritual', 'unknown')),
  time_tier text not null check (time_tier in ('yearly', 'monthly', 'weekly', 'timeless', 'seasonal', 'unknown')),
  period_label text,
  covers_start date,
  covers_end date,
  captured_at timestamptz not null default now(),
  source_title text,
  source_published_at timestamptz,
  raw_transcript text,
  transcript_status text not null default 'raw' check (transcript_status in ('raw', 'cleaned', 'extracted', 'reviewed', 'loaded')),
  transits jsonb not null default '[]'::jsonb,
  key_dates jsonb not null default '[]'::jsonb,
  collective_themes text[] default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reading_sources_url_or_title check (source_url is not null or source_title is not null)
);

create table if not exists public.reading_source_sections (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.reading_sources(id) on delete cascade,
  sign text not null check (sign in (
    'Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
    'Collective','All Signs','Unknown'
  )),
  section_order integer,
  starts_at_seconds integer,
  ends_at_seconds integer,
  house_focus text,
  summary text,
  themes text[] default '{}',
  transits jsonb not null default '[]'::jsonb,
  key_dates jsonb not null default '[]'::jsonb,
  ritual jsonb not null default '{}'::jsonb,
  creator_notes text,
  extraction_confidence text not null default 'draft' check (extraction_confidence in ('draft', 'reviewed', 'trusted', 'needs_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, sign)
);

create table if not exists public.reading_section_cards (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.reading_source_sections(id) on delete cascade,
  card_id uuid references public.tarot_cards(id) on delete set null,
  card_name_raw text,
  position text,
  position_order integer,
  is_reversed boolean not null default false,
  creator_astro_note text,
  interpretation_note text,
  extraction_confidence text not null default 'draft' check (extraction_confidence in ('draft', 'reviewed', 'trusted', 'needs_review')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_external_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid not null references public.reading_sources(id) on delete cascade,
  section_id uuid references public.reading_source_sections(id) on delete set null,
  their_sign text check (their_sign in (
    'Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
  )),
  saved_at timestamptz not null default now(),
  personal_note text,
  resonance_score integer check (resonance_score is null or (resonance_score >= 1 and resonance_score <= 5)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_id, their_sign)
);

create index if not exists idx_meaning_enrichments_target on public.meaning_enrichments(target_type, target_id, target_key);
create index if not exists idx_meaning_enrichments_user on public.meaning_enrichments(user_id);
create index if not exists idx_meaning_enrichments_source on public.meaning_enrichments(source_type, source_id);
create index if not exists idx_reading_sources_creator on public.reading_sources(creator);
create index if not exists idx_reading_sources_period on public.reading_sources(time_tier, covers_start, covers_end);
create index if not exists idx_reading_source_sections_source on public.reading_source_sections(source_id);
create index if not exists idx_reading_source_sections_sign on public.reading_source_sections(sign);
create index if not exists idx_reading_section_cards_section on public.reading_section_cards(section_id);
create index if not exists idx_reading_section_cards_card on public.reading_section_cards(card_id);
create index if not exists idx_user_external_log_user on public.user_external_log(user_id);

alter table public.meaning_enrichments enable row level security;
alter table public.reading_sources enable row level security;
alter table public.reading_source_sections enable row level security;
alter table public.reading_section_cards enable row level security;
alter table public.user_external_log enable row level security;

drop policy if exists "Authenticated users can read meaning enrichments" on public.meaning_enrichments;
create policy "Authenticated users can read meaning enrichments"
  on public.meaning_enrichments for select
  to authenticated
  using (user_id is null or user_id = auth.uid());

drop policy if exists "Users can insert their own meaning enrichments" on public.meaning_enrichments;
create policy "Users can insert their own meaning enrichments"
  on public.meaning_enrichments for insert
  to authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Users can update their own meaning enrichments" on public.meaning_enrichments;
create policy "Users can update their own meaning enrichments"
  on public.meaning_enrichments for update
  to authenticated
  using (user_id is null or user_id = auth.uid())
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Authenticated users can read reading sources" on public.reading_sources;
create policy "Authenticated users can read reading sources"
  on public.reading_sources for select
  to authenticated
  using (true);

drop policy if exists "Users can insert reading sources" on public.reading_sources;
create policy "Users can insert reading sources"
  on public.reading_sources for insert
  to authenticated
  with check (created_by is null or created_by = auth.uid());

drop policy if exists "Users can update their reading sources" on public.reading_sources;
create policy "Users can update their reading sources"
  on public.reading_sources for update
  to authenticated
  using (created_by is null or created_by = auth.uid())
  with check (created_by is null or created_by = auth.uid());

drop policy if exists "Authenticated users can read reading sections" on public.reading_source_sections;
create policy "Authenticated users can read reading sections"
  on public.reading_source_sections for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert reading sections" on public.reading_source_sections;
create policy "Authenticated users can insert reading sections"
  on public.reading_source_sections for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update reading sections" on public.reading_source_sections;
create policy "Authenticated users can update reading sections"
  on public.reading_source_sections for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can read reading section cards" on public.reading_section_cards;
create policy "Authenticated users can read reading section cards"
  on public.reading_section_cards for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert reading section cards" on public.reading_section_cards;
create policy "Authenticated users can insert reading section cards"
  on public.reading_section_cards for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update reading section cards" on public.reading_section_cards;
create policy "Authenticated users can update reading section cards"
  on public.reading_section_cards for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Users can read their external log" on public.user_external_log;
create policy "Users can read their external log"
  on public.user_external_log for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can insert their external log" on public.user_external_log;
create policy "Users can insert their external log"
  on public.user_external_log for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their external log" on public.user_external_log;
create policy "Users can update their external log"
  on public.user_external_log for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete their external log" on public.user_external_log;
create policy "Users can delete their external log"
  on public.user_external_log for delete
  to authenticated
  using (user_id = auth.uid());
