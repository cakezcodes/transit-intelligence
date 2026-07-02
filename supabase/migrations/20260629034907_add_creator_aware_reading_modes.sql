-- Creator-aware reading modes
-- Adds explicit extraction routing so Cam, Jimmy, and 303 are not flattened into one transcript shape.

alter table public.reading_sources
  add column if not exists audience_mode text not null default 'unknown',
  add column if not exists creator_mode text not null default 'unknown',
  add column if not exists extraction_profile text not null default 'generic',
  add column if not exists calendar_import boolean not null default true;

alter table public.reading_source_sections
  add column if not exists audience_mode text,
  add column if not exists sign_basis text,
  add column if not exists section_kind text not null default 'sign_section',
  add column if not exists calendar_import boolean;

alter table public.user_external_log
  add column if not exists sign_basis text not null default 'unknown',
  add column if not exists audience_mode text not null default 'unknown',
  add column if not exists extraction_profile text not null default 'generic';

-- Replace narrow reading_type constraint with creator-aware options.
do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.reading_sources'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%reading_type%'
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.reading_sources drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.reading_sources
  add constraint reading_sources_reading_type_check
  check (reading_type in (
    'transit',
    'tarot',
    'hybrid',
    'ritual',
    'tarot_ritual',
    'collective_overview',
    'unknown'
  ));

alter table public.reading_sources
  drop constraint if exists reading_sources_audience_mode_check;

alter table public.reading_sources
  add constraint reading_sources_audience_mode_check
  check (audience_mode in (
    'rising_sign',
    'sun_moon_rising',
    'sun_moon_rising_venus',
    'all_signs_general',
    'collective',
    'single_sign',
    'unknown'
  ));

alter table public.reading_source_sections
  drop constraint if exists reading_source_sections_audience_mode_check;

alter table public.reading_source_sections
  add constraint reading_source_sections_audience_mode_check
  check (audience_mode is null or audience_mode in (
    'rising_sign',
    'sun_moon_rising',
    'sun_moon_rising_venus',
    'all_signs_general',
    'collective',
    'single_sign',
    'unknown'
  ));

alter table public.user_external_log
  drop constraint if exists user_external_log_audience_mode_check;

alter table public.user_external_log
  add constraint user_external_log_audience_mode_check
  check (audience_mode in (
    'rising_sign',
    'sun_moon_rising',
    'sun_moon_rising_venus',
    'all_signs_general',
    'collective',
    'single_sign',
    'unknown'
  ));

alter table public.reading_source_sections
  drop constraint if exists reading_source_sections_sign_basis_check;

alter table public.reading_source_sections
  add constraint reading_source_sections_sign_basis_check
  check (sign_basis is null or sign_basis in (
    'sun',
    'moon',
    'rising',
    'venus',
    'stellium',
    'resonance',
    'collective',
    'unknown'
  ));

alter table public.user_external_log
  drop constraint if exists user_external_log_sign_basis_check;

alter table public.user_external_log
  add constraint user_external_log_sign_basis_check
  check (sign_basis in (
    'sun',
    'moon',
    'rising',
    'venus',
    'stellium',
    'resonance',
    'collective',
    'unknown'
  ));

alter table public.reading_sources
  drop constraint if exists reading_sources_creator_mode_check;

alter table public.reading_sources
  add constraint reading_sources_creator_mode_check
  check (creator_mode in (
    'technical_astrology',
    'hybrid_astrology_tarot',
    'intuitive_tarot_ritual',
    'collective_astrology_overview',
    'unknown'
  ));

alter table public.reading_sources
  drop constraint if exists reading_sources_extraction_profile_check;

alter table public.reading_sources
  add constraint reading_sources_extraction_profile_check
  check (extraction_profile in (
    'cam_transit_rising',
    'jimmy_hybrid_sign',
    'jimmy_collective_overview',
    'three_oh_three_timed',
    'three_oh_three_timeless',
    'generic'
  ));

alter table public.user_external_log
  drop constraint if exists user_external_log_extraction_profile_check;

alter table public.user_external_log
  add constraint user_external_log_extraction_profile_check
  check (extraction_profile in (
    'cam_transit_rising',
    'jimmy_hybrid_sign',
    'jimmy_collective_overview',
    'three_oh_three_timed',
    'three_oh_three_timeless',
    'generic'
  ));

alter table public.reading_source_sections
  drop constraint if exists reading_source_sections_section_kind_check;

alter table public.reading_source_sections
  add constraint reading_source_sections_section_kind_check
  check (section_kind in (
    'sign_section',
    'rising_sign_section',
    'collective_overview',
    'timeline_segment',
    'tarot_spread',
    'ritual_segment',
    'theme_segment'
  ));

create index if not exists idx_reading_sources_audience_mode on public.reading_sources(audience_mode);
create index if not exists idx_reading_sources_creator_mode on public.reading_sources(creator_mode);
create index if not exists idx_reading_sources_extraction_profile on public.reading_sources(extraction_profile);
create index if not exists idx_reading_source_sections_sign_basis on public.reading_source_sections(sign_basis);
create index if not exists idx_user_external_log_sign_basis on public.user_external_log(sign_basis);
