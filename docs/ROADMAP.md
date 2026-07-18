# Roadmap

## MVP

- Initialize Next.js app
- Recreate prototype UI from `index.html`
- Add Supabase auth
- Add database schema
- Build Calendar
- Build Today agenda
- Build Tarot AI reader
- Build Journal
- Build Orbit
- Build Settings
- Add AI Guidance routes
- Deploy to Vercel

## Later

- Subscription/paywall
- Widgets
- Synastry expansion
- Push notifications
- More ritual libraries
- Sharing/export tools
## Vercel go-live checklist (next step)

1. Merge the re-platform PR to `main`.
2. vercel.com → Add New Project → Import `cakezcodes/transit-intelligence` (this creates the project — nothing to pre-create).
3. Set env vars in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL` = https://lfukxvbcfetdzbauigxe.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the sb_publishable_… key
   - `OPENAI_API_KEY` = the real sk-… secret (server-only; the dashboard UUIDs are key IDs, not keys)
   - `OPENAI_MODEL` (optional, defaults to gpt-4o-mini)
4. Deploy. Every push to `main` auto-deploys after that.

## After go-live

- Normalize `app_state` jsonb into readings / journal_entries / reading_cards.
- Componentize prototype screens into React (strangler-fig, one screen at a time).
- Wire natal-chart casting for new accounts (celestine server-side, insert into natal_positions).
- Photo spread reader (vision) via a second API route.
