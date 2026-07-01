# TRANSIT INTELLIGENCE — WORKLOG

Shared running log between Claude and ChatGPT. **Newest entry at the TOP.**
Every entry is timestamped and states: who, what was actually done, and what's
proposed next. Read the top entry first; it is the current state of truth.

Format rules (both AIs follow these):
- New entries go ABOVE this line of the log, never at the bottom.
- Timestamp format: `YYYY-MM-DD HH:MM TZ` (use the user's local time).
- Each entry has four parts: WHO / DID / STATE / NEXT.
- DID = what actually happened (past tense, concrete, verifiable).
- STATE = what is now true in the database/repo as a result.
- NEXT = the specific proposed next action for the OTHER ai to pick up.
- Never delete old entries. The log is append-only history.
- If you verified something against the live DB, say so and give the number.

═══════════════════════════════════════════════════════════════════════

## 2026-07-01 13:44 EDT — CHATGPT

**WHO:** ChatGPT (GitHub connector + Supabase connector)

**DID:**
- Read Claude's handoff files and treated `WORKLOG.md` as the source-of-truth handoff format.
- Confirmed the active repo is `cakezcodes/transit-intelligence`, private, default branch `main`, with push/admin access.
- Checked repo state on `main`:
  - `sources.md` already existed and already had the Celestine / Deckaura / Corpora / CC-BY-SA license flags.
  - `CREDITS.md` already existed and already credited Celestine, Deckaura, Corpora, and public-domain decan/reference work.
  - `supabase/migrations/20260630000400_fill_tarot_deckaura.sql` already existed and contains the 78-card Deckaura fill keyed on `card_number`.
  - `WORKLOG.md` did not exist in the repo, so it was created at repo root with this entry on top.
  - `supabase/migrations/20260630000300_crossfill_corpora_by_number.sql` was not present in GitHub at the time of this entry; the full file is present in the user's uploaded handoff bundle and still needs to be committed if not added by another tool/session.
- Checked the live Supabase project `lfukxvbcfetdzbauigxe`:
  - `list_migrations` shows 14 remote migrations total.
  - The 7 direct-cloud tarot migrations from 2026-06-30 are present: 5 Corpora migrations and 2 Deckaura migrations.
  - Verified `tarot_cards` counts directly against live DB: 78 total cards; all 78 filled for `upright_core`, `reversed_core`, `upright_love`, `upright_career`, `upright_yes_no`, `meaning_light`, `meaning_shadow`, `fortune_telling`, and `corpora_keywords`.

**STATE:**
- Live Supabase tarot data is complete and verified: 78/78 cards populated across all Deckaura + Corpora meaning columns.
- GitHub repo already contains `sources.md`, `CREDITS.md`, and the Deckaura migration.
- GitHub repo now contains `WORKLOG.md` at repo root.
- The missing reproducibility gap is specifically the Corpora-by-number migration file in `supabase/migrations/` unless it is added after this entry.
- I could verify remote Supabase migration history, but I could not run `supabase db pull` on the user's Windows laptop from here; that remains a local checkout sync step.

**NEXT (for Claude / next AI / terminal):**
1. Add the full uploaded `20260630000300_crossfill_corpora_by_number.sql` file to `supabase/migrations/` if it is still missing on GitHub.
2. On the user's local laptop checkout, run:
   - `git pull origin main`
   - `supabase migration list`
   - `supabase db pull`
   - If the project is not linked: `supabase link --project-ref lfukxvbcfetdzbauigxe`
3. Do not run `supabase db reset` or `supabase db push` to reload tarot data. The live data is already complete.
4. After local sync, append a new `WORKLOG.md` entry above this one with exact commands run and whether local/remote migration history is clean.

**OPEN ITEMS:**
- Commit the Corpora-by-number migration if still missing from GitHub.
- Decide fate of duplicate `planets` table vs `celestial_bodies`.
- Keep `placement_meanings` lazy-authored; 0 rows is intentional.
- Creator interpretation layer remains separate: reading capture schema exists, extractor/write path is not wired yet.
- Optional: enrich `aspects` meanings from short keywords to fuller paragraphs.

═══════════════════════════════════════════════════════════════════════

## 2026-06-30 14:12 EDT — CLAUDE

**WHO:** Claude (Supabase connector + file generation)

**DID:**
- Loaded the full tarot meaning layer into the live Supabase `tarot_cards`
  table (project `lfukxvbcfetdzbauigxe`), which was previously 78 rows with
  every meaning column empty.
- Corpora (CC0) → meaning_light, meaning_shadow, fortune_telling,
  corpora_keywords. Applied as 5 migrations, keyed on card_number (0-77) to
  fix the earlier name-match failure that left the table empty.
- Deckaura → upright_core, reversed_core, upright_love, upright_career,
  upright_yes_no, correspondence_seed (zodiac on majors). Applied as 2
  migrations from the user's uploaded CSV.
- Generated committable migration files + filled-in sources.md and CREDITS.md
  and a LAPTOP_STEPS.md instruction card (delivered to user as downloads).

**STATE (verified against live DB):**
- tarot_cards: 78/78 filled on ALL meaning columns (upright_core, reversed_core,
  upright_love, upright_career, upright_yes_no = 78 each; corpora light/shadow/
  fortune/keywords = 78 each). Confirmed via count query.
- Reference layer already complete from prior work: signs 12, houses 12,
  planets 13 + celestial_bodies 23, aspects 14, decans 36 — all with meanings.
- placement_meanings: 0 (intentionally lazy-authored, not a gap).
- Two duplicate-ish tables exist: `planets` (13) and `celestial_bodies` (23).
  celestial_bodies is the one wired into the meaning bundle. `planets` is
  likely dead weight — decision deferred.
- Migrations applied directly to cloud today (NOT yet pulled to local repo):
  corpora_crossfill_majors, _wands, _cups, _swords, _pentacles;
  deckaura_fill_majors_wands, deckaura_fill_cups_swords_pents.

**LICENSE FLAGS (carry forward):**
- Deckaura data circulates as both MIT (npm) and CC-BY-SA (HuggingFace-78).
  Loaded into its own columns so it's removable if the CC-BY-SA origin matters
  for commercial release. Per user's own plan, Deckaura is the MIT base layer.
- Corpora is CC0 but its text traces to Mark McElroy's book; isolated to its
  own columns, swappable.
- Sign facts trace to a CC-BY-SA (Wikipedia-derived) seed; logged in sources.md.

**NEXT (for ChatGPT / terminal — user can't do this part alone):**
1. Place the 4 delivered files into the repo:
   - supabase/migrations/20260630000300_crossfill_corpora_by_number.sql
   - supabase/migrations/20260630000400_fill_tarot_deckaura.sql
   - sources.md (root, overwrite), CREDITS.md (root)
   - Delete any older name-keyed Corpora crossfill migration if present.
2. Run `supabase migration list`, then `supabase db pull` to sync local
   migration history with the 7 cloud migrations applied today.
   (Link first if needed: `supabase link --project-ref lfukxvbcfetdzbauigxe`.)
3. Commit + push: the migrations, sources.md, CREDITS.md.
4. Do NOT `supabase db reset` / `db push` to reload tarot data — it's already
   live. Files are for reproducibility only.

**OPEN ITEMS (not blocking, for whoever picks up next):**
- Decide fate of duplicate `planets` table vs `celestial_bodies`.
- placement_meanings: author lazily as placements come up (planet-in-sign/house).
- Creator interpretation layer (Cam/Jimmy/303): reading-capture pipeline is a
  separate build — schema exists (meaning_enrichments, reading_sources, etc.),
  extractor is rule-based and not yet wired to OpenAI or writing to DB.
- aspects table meanings are short (~95 chars); could enrich to paragraph length
  to match signs/houses. Pure canon, safe, optional.

═══════════════════════════════════════════════════════════════════════
<!-- NEW ENTRIES GO ABOVE THIS LINE -->
<!-- Log started 2026-06-30 by Claude. Append-only. Newest on top. -->
