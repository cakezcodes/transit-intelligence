# Decisions

## 2026-07-18 — Information architecture rework

- **Organize by the user's day, not by feature.** The app read as six separate products
  because one day's data was scattered across six tabs. The new spine is the daily loop
  (sky predicts → you live → you record → patterns surface → repeat). This deliberately
  **supersedes BUILD_BRIEF.md**'s "do not rename screens / add navigation / redesign layouts"
  clause — that brief predates this pivot. Visual identity and feature set are unchanged.
- **Nav is `Sky · Life · People · Library · Me`** (Syd's pick over the verbier `Today ·
  Timeline · Library · People · You`). Record is not a destination — logging is an event
  ("what happened?"), so it folds into Life. Chosen because it maps onto the existing views
  with the least disruption (Sky keeps its `nav` id as the home).
- **Implemented by re-parenting, not rewriting.** The `TAB` map re-tags which bottom tab each
  existing sub-view highlights; all render functions and `nav` ids stay. Lowest-risk path to a
  new IA over a 2,500-line hand-rolled prototype.
- **"Today's Intelligence" is assembled, not a live AI call** (this pass). Voicing is the only
  paid step (CLAUDE.md rule 2), and a per-open GPT call would widen scope + add cost. The
  synthesis stitches voice-approved strings (`MOOD`/`SIGN_READ`/`dailyRead`) so it stays
  on-voice by construction. A true GPT-written synthesis is roadmap work.
- **The "layers" screen is now the "intelligence engine."** Reframed from calendar display
  toggles to "what the app pays attention to," grouped by data source with a live built-from
  sentence — so the switches read as inputs to guidance, not display preferences. All layer
  `id`s were preserved (the events engine keys off them); only grouping/labels/`inc` changed.

## 2026-06-25

- Product name is `Transit Intelligence`.
- Repository name is `transit-intelligence`.
- `index.html` is the prototype and source of truth.
- Claude Code should build straight through the brief unless genuinely blocked.
- Next.js App Router is the app structure.
- Supabase is the database/auth layer.
- OpenAI calls must stay server-side.
- The calendar is the center of the experience.
- Every feature must help the user understand what season they are in.
## 2026-07-18

- Ported the prototype wholesale (markup + logic intact) instead of rewriting screen-by-screen into React components. Rule #0 says the prototype is the spec; the strangler-fig path (React shell around the working prototype, componentize later) ships a faithful, working app now with real auth, saves, and server-side AI. Componentization is roadmap work.
- v1 persistence is one jsonb `app_state` row per user (the S object's cloud shadow), not normalized tables. The live schema (readings, journal_entries, …) predates the v11 prototype's shapes; mapping them properly is its own step. jsonb gets cross-device sync now without lossy guessing.
- AI provider is OpenAI (`gpt-4o-mini` default, `OPENAI_MODEL` to override) per Syd's credits; the Anthropic browser call from the prototype only worked inside claude.ai previews.
- Create-account and birth-time onboarding are combined into one flow: `/welcome` handles the account, then the prototype's own onboarding (untouched) collects birth data and saves to `profiles` + `app_state`.
