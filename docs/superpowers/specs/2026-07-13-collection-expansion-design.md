# Collection Expansion — "The Museum Grows"

Date: 2026-07-13
Status: Approved pending user review
Prior specs: 2026-07-12-virtual-gallery-design.md (content model, image rules),
2026-07-12-design-overhaul-design.md (presentation).

## Purpose

Grow the museum from 5 periods / 10 artists / 30 works to **8 periods / 26 artists /
91 works** while holding the v1 quality bar: every work gets a researched four-part
story and a museum-grade image. Content expansion only — no schema changes, no new
page types.

## The roster

New periods and artists marked **+**. Numbers are works per artist after expansion.

| # | Period | Years | Artists (works) |
|---|--------|-------|-----------------|
| 1 | Renaissance | c. 1400–1600 | Botticelli (4) · Leonardo (4) · **+Michelangelo (3)** · **+Raphael (3)** · **+Titian (3)** |
| 2 | **+Northern Renaissance** | c. 1420–1570 | **+Van Eyck (3)** · **+Dürer (3)** · **+Bruegel (3)** |
| 3 | Baroque & Dutch Golden Age | c. 1600–1700 | Caravaggio (4) · Rembrandt (5) · Vermeer (4) · **+Velázquez (3)** · **+Rubens (3)** |
| 4 | **+Rococo & Neoclassicism** | c. 1700–1820 | **+Fragonard (3)** · **+David (3)** |
| 5 | Romanticism | c. 1780–1850 | Goya (4) · Turner (4) · Delacroix (4) |
| 6 | **+Realism** | c. 1840–1880 | **+Courbet (3)** · **+Millet (3)** · **+Manet (3)** |
| 7 | Impressionism | c. 1860–1890 | Monet (5) · **+Degas (3)** · **+Renoir (3)** |
| 8 | Post-Impressionism | c. 1885–1910 | Van Gogh (5) · **+Cézanne (3)** |

Totals: 16 new artists × 3 works = 48; existing ten artists deepened by 13
(Rembrandt +2, Monet +2, Van Gogh +2, and +1 each for Botticelli, Leonardo,
Caravaggio, Vermeer, Goya, Turner, Delacroix). 30 + 48 + 13 = **91 works**.

Deferred to a future batch (deliberately, to keep periods balanced): Ingres,
Gauguin, Seurat, El Greco, Watteau, Holbein.

Work selection favors each artist's most famous, best-storied paintings, subject
to the image-quality floor. The three new period entries need the same markdown
intro essay as the existing five (the italic lede on the period page).

## Content standards (unchanged from v1)

- Story sections, exactly: `## The Story`, `## The World Behind It`,
  `## The Artist at This Moment`, `## Interesting Facts`. History and the
  artist's human story over technique.
- Facts independently verifiable; reviewers web-check claims.
- Images: museum open-access first (Rijksmuseum, Met, NGA, Getty, Prado, Orsay
  via Wikimedia, etc.), ≥2500px long edge for artworks, ≥800px portraits,
  `imageSource` provenance frontmatter, no upscales or watermarks.
- Work `year` frontmatter starts with the 4-digit sort year (lexicographic sort).
- New artists need: portrait, hook line, timeline, bio essay — same shape as v1.
- `npm run check` must pass at every batch boundary.

## Storage decision

Plain git, as now (Jeff's call, 2026-07-13). Expected ~650MB of masters at 91
works; acceptable locally. If a future deploy target objects, migrate then.

## Site adjustments

1. **Period `order` renumbering** to the table above (1–8) so the periods ledger
   reads chronologically. No URL changes; existing period slugs keep their ids.
2. **Gallery-walk cap:** with 91 works, the walk no longer shows every remaining
   work. Each visit draws **24 random rooms** (fresh shuffle per visit, daily pick
   always first, no duplicates). Walk-end label unchanged. The works-data JSON
   still carries all works (the daily pick must be computable over the full set).
3. Nothing else changes: daily-pick algorithm (mod new count), justified grids,
   period/artist featured-work selection all adapt automatically.

## Execution

Batched by period, same subagent pipeline as v1 (implementer per task, reviewer
per batch, fact-check via web verification). Batch order:

1. Site prep: period renumbering + 3 new period entries (+essays) + walk cap.
2. Northern Renaissance (3 artists, 9 works).
3. Renaissance giants (Michelangelo, Raphael, Titian — 9 works).
4. Baroque additions (Velázquez, Rubens — 6 works) + deepen Caravaggio/Rembrandt/Vermeer (+4).
5. Rococo & Neoclassicism (Fragonard, David — 6 works).
6. Realism (Courbet, Millet, Manet — 9 works).
7. Impressionism & Post-Impressionism additions (Degas, Renoir, Cézanne — 9 works)
   + deepen Monet/Van Gogh (+4).
8. Romanticism & Renaissance deepening (Goya, Turner, Delacroix, Botticelli,
   Leonardo +1 each — 5 works).

Each batch ends green (`npm run check` + `npm run build`) and browsable, so the
museum grows wing by wing and any batch can pause for review.

## Acceptance

- 8 period pages, 26 artist pages, 91 work pages; all checks pass.
- Periods ledger chronological; every new period has an intro essay and its
  page shows a vertical featured work.
- Homepage walk shows daily + 24 rooms, reshuffled per visit.
- Every new image meets the resolution floor with provenance recorded.
- Jeff's browse-through is the acceptance test, batch by batch if he likes.

## Out of scope

Deployment prep (meta/OG, sitemap, lightbox rendition cap), search, favorites,
modern art, the deferred-artist list above.
