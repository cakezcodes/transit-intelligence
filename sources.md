# DATA SOURCES & LICENSES

| Data | Source | URL | License | Obligation | Date pulled |
|------|--------|-----|---------|------------|-------------|
| Tarot meanings | Deckaura MCP repo | github.com/gokimedia/tarot-mcp-server | MIT | Credit line | 2026-06-27 |
| Tarot meanings dataset | Deckaura Zenodo DOI | doi.org/10.5281/zenodo.19475329 | MIT | Credit line | 2026-06-27 |
| Tarot meanings package | Deckaura PyPI package | pypi.org/project/tarot-card-meanings | MIT | Credit line | 2026-06-27 |
| Tarot meanings package | Deckaura npm package | npmjs.com/package/tarot-card-meanings | MIT | Credit line | 2026-06-27 |
| Deckaura entity | Deckaura website | deckaura.com | Website | Reference only | 2026-06-27 |
| Deckaura entity | Wikidata Q138745960 | wikidata.org/wiki/Q138745960 | Reference metadata | Reference only | 2026-06-27 |
| Tarot backup | Corpora / Kazemi | github.com/dariusk/corpora | CC0 | None | |
| Sign facts | Celestine | github.com/Anonyfox/celestine | MIT | Credit line | 2026-06-27 |
| Chart engine | Celestine | github.com/Anonyfox/celestine | MIT | Credit line | 2026-06-27 |
| Astro keywords | astro-mcp | github.com/memyselfandm/astro-mcp | ISC | Credit line | |
| Houses cross-check | In-house Placidus calculator | public-domain / reference math | Original | None | 2026-06-27 |
| Decans | Authored | Golden Dawn public-domain correspondence facts | Original | None | |
| Astro interpretive text | Authored | Original meaning layer | Original | None | |
| Retired / not used | Flatlib | github.com/flatangle/flatlib | Not used | Retired due transitive pyswisseph / Swiss Ephemeris concern | 2026-06-27 |
| Retired / replaced | Astronomy Engine | github.com/cosinekitty/astronomy | MIT | Replaced by Celestine as astrology engine | 2026-06-27 |

## Rule

Check the full dependency tree before trusting any chart calculation library. Top-level license is not enough.

## Deckaura verification notes

The correct MCP repository is `github.com/gokimedia/tarot-mcp-server`, not `github.com/Deckaura/tarot-mcp-server`.

The uploaded Deckaura repo zip includes `data/tarot_card_meanings.csv`, `LICENSE`, `README.md`, and `package.json`. The uploaded Zenodo dataset zip includes CSV, JSON, JSONL, and `paper.md`.

## Celestine verification notes

Celestine's package metadata shows MIT license and no runtime dependency list; only build/test/documentation devDependencies are present. Its README states zero runtime dependencies and includes Placidus, transits, progressions, dignities, and aspect support.
