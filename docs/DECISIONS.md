# Decisions

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
