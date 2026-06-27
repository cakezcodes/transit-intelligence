# CakezCodes Design System

> CakezCodes builds emotionally intelligent, consumer-ready apps for creators, mystics, strategists, and chaotic hot girls with systems to run.

This folder is the shared design-system landing zone for Transit Intelligence and the wider CakezCodes app family.

## What belongs here

- `src/design-system/styles.css` — global entry file for the design system
- `src/design-system/tokens/` — colors, accents, typography, spacing, radius, shadows, motion, fonts
- `src/design-system/assets/` — shared SVG marks/icons
- `docs/design-system/` — product notes, source-of-truth guidance, and Claude build instructions

## Product family

| Product | Role | Signature accent |
|---|---|---|
| After Dark | Creator OS / fan CRM / content vault | OnlyFans blue `#00AFF0` |
| Seen | AI texting co-pilot + dating CRM | Candlelit gold `#A8842F` |
| Transit Intelligence | Astrology + tarot cosmic OS | Antique gold `#C9A961` |

## Visual direction

CakezCodes apps use an editorial-luxe, iOS-grade mobile aesthetic: clean cards, soft corners, glassy floating tab bars, real spacing, and one live accent that retints the entire interface.

The system should feel polished, intimate, and screenshot-worthy — not corporate SaaS, not gamer UI, not cheap galaxy clipart.

## Typography

- UI/body: DM Sans
- Editorial display: Playfair Display
- Seen alt display: DM Serif Display
- Transit ceremonial caps: Montserrat

## Claude build instruction

Use `src/design-system` as the source of truth for colors, spacing, radius, typography, accents, motion, and shared assets. Do not invent a second visual system. Transit Intelligence should use `.app-transit` as its default accent scope and support light/dark themes.

## Notes

This branch imports the usable core of the CakezCodes design system directly into the Transit Intelligence repo. The separate full ZIP should still be kept as the archive/source package until a dedicated `cakezcodes-design-system` repo is created.