# LAPTOP STEPS — Transit Intelligence (paste this whole thing to ChatGPT or run in terminal)

Everything below happens in your repo folder:
    C:\CakezCodes\transit-intelligence

The tarot meaning data is ALREADY loaded in the live Supabase database. These
steps just (1) save the matching migration files into the repo so the database
is reproducible, (2) add the source/credit files, and (3) sync your local
migration history with the cloud. Nothing here changes the live data.

------------------------------------------------------------------
STEP 1 — Drop in the files
------------------------------------------------------------------
Place the four provided files into the repo like this:

    supabase/migrations/20260630000300_crossfill_corpora_by_number.sql
    supabase/migrations/20260630000400_fill_tarot_deckaura.sql
    sources.md          (repo root — overwrite the old one if present)
    CREDITS.md          (repo root)

If an older Corpora crossfill migration exists (a name-keyed one that was
silently skipping cards), DELETE it — the new 20260630000300 file replaces it.

------------------------------------------------------------------
STEP 2 — Sync local migration history with the cloud
------------------------------------------------------------------
Four migrations were applied directly to the cloud database today. Pull them so
local and remote agree. In the repo folder run:

    supabase migration list

That shows which migrations are remote-only (a gap between local and cloud).
Then bring the remote state down:

    supabase db pull

If it asks to link the project first:

    supabase link --project-ref lfukxvbcfetdzbauigxe

------------------------------------------------------------------
STEP 3 — Commit
------------------------------------------------------------------
    git add supabase/migrations sources.md CREDITS.md
    git commit -m "Load tarot meaning layer (Deckaura + Corpora), update sources/credits"
    git push origin main

------------------------------------------------------------------
DONE. After this, the repo and the live database match, and the full tarot +
astrology meaning layer is reproducible from migrations.
------------------------------------------------------------------

Note: do NOT run `supabase db reset` or `supabase db push` expecting to reload
the tarot data — it's already live. These files are for reproducibility and for
anyone who rebuilds the DB from scratch later.
