# Design System — astrocake (app v2)

Canonical brand: `cakezcodes/design-system` — `docs/brand-book.md` (Apps section) and `docs/app-rules.md`. Tokens: `design-system/tokens.json`.
This file is the app-side summary. When the two disagree, the design-system repo wins.

## Direction

Old-world occult mood, modern editorial execution. Bone paper, black ink, one ribbon accent,
blackletter worn like jewelry. The calendar (= the Cosmic Calendar sheet) is the reference screen —
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
- Four-point sparkles are the only ornament: splash constellation, tap bursts on buttons/days/tabs (`sparkleBurst`).
- Motion is quick (`.16s / .32s / .7s`, ease-out) and fully disabled under `prefers-reduced-motion`.

## Splash

One markup (`features/splash/splashMarkup.mjs`) rendered by both `/welcome` and `/app`: the double frame, "welcome to",
**✦transit intelligence** in lowercase blackletter with the pink ✦, the tagline, and "an ✦astrocake app" at the foot.
Arrival: splash → sign-in card rises in. Sign-in: splash fades back over → `/app` paints the same finished frame
(pre-paint script sets `data-splash="seen"`) → fades into the app.

## The calendar

The Cosmic Calendar sheet (`design-system/calendar/cosmic-calendar-sheet.html`) at phone size:
✦astrocake masthead, the engine's natal line (ASC · MC · ☉︎ · ☽︎ with houses), month in 800 italic + year, square
layer keys with an ink hairline (Cosmic Sky in stone, flagged days in tomato), the black standing bar, a Mon–Sun
grid with events written in sheet shorthand, What to Watch in the double frame, notes, and the sheet footer.
"Sheet" is the default view; grid (pips) and ledger stay one tap away.

## The chart wheel

A port of the Natal Blueprint `wheel()` (`astrocake-site-shop/chart-engine/template.html`), ink only: three rings,
3-letter sign codes, 5° ticks, bold 2-letter body codes, ASC–DSC solid, MC–IC dashed, aspects under 4° in the hub
(squares/oppositions solid, the rest dashed). The app draws Porphyry cusps by default; Whole Sign draws exactly like
the Blueprint. Every code is tappable.

## Color law

Pops (the ribbon) are flat fills with ink text only — never pop-colored text, lines or focus rings. Dark mode is flat
ink with `#232220` cards; the site gradient is light-mode only.

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
