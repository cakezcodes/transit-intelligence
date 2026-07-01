# LAPTOP STEPS — Transit Intelligence catch-up only

Everything below happens in your repo folder:

```powershell
C:\CakezCodes\transit-intelligence
```

Current truth as of 2026-07-01:

- Live Supabase project `lfukxvbcfetdzbauigxe` already has the tarot data loaded.
- Supabase has 14 migration records, including 5 Corpora tarot crossfill migrations and 2 Deckaura tarot fill migrations from 2026-06-30.
- GitHub already has `sources.md`, `CREDITS.md`, and `supabase/migrations/20260630000400_fill_tarot_deckaura.sql`.
- GitHub does **not** have `supabase/migrations/20260630000300_crossfill_corpora_by_number.sql` yet.
- `WORKLOG.md` is private user handoff/admin context and should **not** live in GitHub.
- YouTube scrubber / creator corpus build is parked until repo + Supabase catch-up is done.

## Step 1 — Download the missing file from ChatGPT

Download this uploaded file from the chat into Downloads or Desktop:

```txt
20260630000300_crossfill_corpora_by_number.sql
```

## Step 2 — Copy it into the repo and push it

Paste this into PowerShell:

```powershell
$repo = "C:\CakezCodes\transit-intelligence"
$file = "20260630000300_crossfill_corpora_by_number.sql"

$src = Get-ChildItem -Path "$env:USERPROFILE\Downloads","$env:USERPROFILE\Desktop" -Filter $file -Recurse -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $src) {
  throw "Could not find $file in Downloads or Desktop. Download it from ChatGPT first, then rerun this."
}

Set-Location $repo

git pull origin main

New-Item -ItemType Directory -Force -Path ".\supabase\migrations" | Out-Null
Copy-Item $src.FullName ".\supabase\migrations\$file" -Force

Get-Item ".\supabase\migrations\$file" | Select-Object Name, Length, LastWriteTime

git status --short
git add ".\supabase\migrations\$file"
git commit -m "Add Corpora tarot crossfill migration"
git push origin main
```

Expected: the file length should be around 62 KB. If it is tiny, blank, or missing, stop.

## Step 3 — Sync local Supabase state

Paste this after the GitHub push succeeds:

```powershell
Set-Location "C:\CakezCodes\transit-intelligence"

supabase migration list

supabase link --project-ref lfukxvbcfetdzbauigxe

supabase db pull

git status --short
```

If `supabase db pull` creates or changes files, commit them:

```powershell
git add supabase/migrations supabase/schema.sql 2>$null
git commit -m "Sync Supabase remote schema state"
git push origin main
```

If Git says there is nothing to commit, that is fine.

## Do not run these right now

```powershell
supabase db reset
supabase db push
```

Those are not catch-up commands. The live DB is already populated; the goal is only to make GitHub/local match the cloud.

## Definition of done

Catch-up is done when:

- `git status --short` is clean locally.
- GitHub contains `20260630000300_crossfill_corpora_by_number.sql` and `20260630000400_fill_tarot_deckaura.sql` under `supabase/migrations/`.
- `supabase migration list` shows the local and remote histories without surprise drift.
- `WORKLOG.md` stays off GitHub.
- No YouTube scrubber work starts until the above is true.
