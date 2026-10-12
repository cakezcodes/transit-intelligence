# Design System — astrocake (app v2)

Canonical brand: `cakezcodes/astrocake-design-system` (`brand/`, plus `12-app/` for the app rules).
This file is the app-side summary. When the two disagree, the design-system repo wins.

## Direction

Old-world occult mood, modern editorial execution. Bone paper, black ink, one ribbon accent,
blackletter worn like jewelry. The calendar page (v1-final baseline) is the reference screen —
new UI matches it, never the other way around.

## Where styles live

| Layer | File | What |
|---|---|---|
| Base (v1-final port) | `app/prototype.css` | every component from the prototype, incl. the calendar baseline |
| Design system v2 | `app/astrocake.css` | tokens, splash, sparkles, nav/back bar, sheets, the chart wheel, a11y, motion |
| Welcome | `app/welcome/welcome.css` | sign-in card (self-contained hex values — see file header) |
| Fonts | `public/fonts/ManufacturingConsent-Regular.ttf` + Google Fonts | Inter Tight · Manufacturing Consent · Noto Sans Symbols (glyph subset only) |

## Tokens

- Grounds: bone `#eeece8`, cream `#f2ebdd`, ink `#1a1917`, dark-grey `#2b2a28`; gradient `cream → blush → mist → cream`.
- Ribbon accent (user-chosen, re-tints everything): lilac, pink, yellow, chartreuse, orange, ice, mint, tomato.
- Type: Inter Tight does the work (caps + tight tracking for heads, bold italic for the pop word). Blackletter only for the wordmark, sign names in explain sheets, sign-offs.
- Astro glyphs render with the text variation selector (`U+FE0E`) and Noto Sans Symbols so they never turn into emoji.

## Shape + motion

- Square everything. Circles only for moon discs and the chart wheel.
- Borders over shadows; the thin double frame (`1px / 8px / 1px`) frames the splash and the sign-in card.
- Four-point sparkles are the only ornament: splash constellation, tap bursts on buttons/days/tabs (`sparkleBurst`), the wheel's centre.
- Motion is quick (`.16s / .32s / .7s`, ease-out) and fully disabled under `prefers-reduced-motion`.

## Splash

One markup (`features/splash/splashMarkup.mjs`) rendered by both `/welcome` and `/app`.
Arrival: splash → sign-in card rises in. Sign-in: splash fades back over → `/app` paints the
same finished frame (pre-paint script sets `data-splash="seen"`) → fades into the app.
`sessionStorage['ti-splash-at']` keeps it from replaying within two minutes.

## The chart wheel

Line-only astrocake chart print, drawn from engine data only (`wheelSVG` in `public/prototype/app.js`):
double-rule rim · zodiac band with 1°/5°/10° ticks · house cusps as hairlines, angles in heavier ink
with ASC/MC/DSC/IC labels · planets fanned to avoid collisions, ticked at their true degree ·
aspect web in the core (solid ink = square/opposition, accent dashes = trine/sextile) · four-point
star at the centre. ASC sits at 9 o'clock. Every glyph, sign, and house number is tappable.

## Navigation

- Five tabs (sky · calendar · grimoire · orbit · me). The calendar is the one calendar: the record,
  rituals, pulls, people's transits, and custom events all land on it as layers.
- Sub-views have a sticky back bar labelled with where you came from. Every view change is a
  history entry carrying the whole back stack, so browser back / phone back-swipe agree with the
  in-app back buttons. Back (or Escape) closes an open sheet first.
- Tabs expose `aria-current`, sheets are `role=dialog` with a close button and focus return,
  toasts are a live region, there's a skip link, and focus rings use the ribbon accent.

## Rule: nothing is a dead end

Every element either navigates, explains (`explain*` / `moonSheet` sheets), or acts. `npm test`
fails if any inline handler calls a function that doesn't exist (`scripts/check-handlers.mjs`).
