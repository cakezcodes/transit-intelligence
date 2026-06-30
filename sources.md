# DATA SOURCES & LICENSES

Every dataset and engine used in Transit Intelligence, with its license and what obligation it carries. Update this whenever a new source is added.

| Data | Source | URL | License | Obligation | Status |
|---|---|---|---|---|---|
| Chart engine | Celestine | github.com/Anonyfox/celestine | MIT | Credit line | Locked, in use — replaced Flatlib |
| Tarot meanings (base) | Deckaura | deckaura.com/blogs/guide/tarot-card-meanings | See note ⚠️ | Credit line | Loaded — all 78 cards |
| Tarot meanings (backup) | Corpora / Kazemi (McElroy) | github.com/dariusk/corpora | CC0 | None — see note | Loaded — all 78 cards |
| Sign facts | zodiac.json reference | Wikipedia-derived | CC-BY-SA ⚠️ | Share-alike | Loaded — 12 signs |
| Planets / houses / aspects | Authored — public-domain astrology | — | Original | None | Loaded |
| Decans — 36 minor pips + majors + courts | Authored — Golden Dawn / Liber 777 public-domain correspondences | — | Original | None | Loaded — 36 decans |
| Astro keywords | astro-mcp | github.com/memyselfandm/astro-mcp | ISC | Credit line | NOT NEEDED — planets/houses/aspects already authored |

## Notes on the two flags ⚠️

### Deckaura license

The Deckaura tarot data circulates in two copies: an MIT npm/PyPI package (`tarot-card-meanings`) and a CC-BY-SA dataset copy (`tarot-card-meanings-78` on HuggingFace/Kaggle). The CSV loaded into the base `tarot_cards` table came from the Deckaura guide. Per the project sources plan, Deckaura is the intended MIT base layer.

If the specific CSV used is ever shown to derive from the CC-BY-SA copy, the safe move is to keep Deckaura content in a removable, source-tagged layer rather than the core. The data is already isolated to its own columns (`upright_core`, `reversed_core`, `upright_love`, `upright_career`, `upright_yes_no`), so it can be lifted without disturbing anything else.

Credit Deckaura on the About/Credits page either way.

### Corpora content origin

The Corpora repo is CC0, but this file’s own description attributes its text to Mark McElroy’s *A Guide to Tarot Meanings*. It has been distributed as open data for years and is widely reused. For personal use this is a non-issue.

For commercial release, Corpora content lives in its own columns (`meaning_light`, `meaning_shadow`, `fortune_telling`, `corpora_keywords`) and can be swapped out if ever needed.

### Sign facts — CC-BY-SA

The structural sign facts — element, modality, polarity, rulers — trace to a Wikipedia-derived zodiac reference. These specific facts are not copyrightable individually; element/modality of a sign is not authorship. The seed file noted a CC-BY-SA origin, logged here for honesty.

## License cheat sheet

- **MIT / ISC** — free commercial use, keep a credit line.
- **CC0 / Public Domain** — no obligation.
- **CC-BY-SA** — share-alike: derivatives must carry the same license. Keep such data in a removable layer, not baked into the core.
- **GPL / AGPL** — forces the whole app open-source. Avoided; this is why Celestine replaced Flatlib / Swiss Ephemeris paths.
