# Spec — the collection grows to fifty artists

**Date:** 2026-08-11 · **Branch:** `collect-more-artists` · **Author:** gobble session

## Goal

Take the collection from 33 artists / 112 works to **50 artists / 163 works**,
adding 17 artists at the house baseline of **3 works each**. No new periods, no
schema changes, nothing dated 1930 or later.

## Why these seventeen

Ranked. The first eight are the wait-list carried in CLAUDE.md; the next nine
were chosen to fill the thinnest periods and the most conspicuous canonical
gaps.

### Tier 1 — the wait-list (CLAUDE.md backlog)

| # | Artist | Slug | Period | Note |
|---|---|---|---|---|
| 1 | Paul Gauguin | `gauguin` | post-impressionism | d. 1903 |
| 2 | Georges Seurat | `seurat` | post-impressionism | d. 1891 |
| 3 | El Greco | `el-greco` | renaissance | Mannerist tail of the period |
| 4 | Jean-Auguste-Dominique Ingres | `ingres` | rococo-neoclassicism | Neoclassical successor to David |
| 5 | Antoine Watteau | `watteau` | rococo-neoclassicism | invented the fête galante |
| 6 | Hans Holbein the Younger | `holbein` | northern-renaissance | d. 1543 |
| 7 | Egon Schiele | `schiele` | early-modernism | d. 1918, fully PD |
| 8 | Henri Rousseau | `rousseau` | post-impressionism | d. 1910 |

### Tier 2 — nine chosen to balance the collection

| # | Artist | Slug | Period | Why |
|---|---|---|---|---|
| 9 | Hieronymus Bosch | `bosch` | northern-renaissance | *Garden of Earthly Delights* — the largest single gap in the collection |
| 10 | Caspar David Friedrich | `friedrich` | romanticism | Romanticism without *Wanderer above the Sea of Fog* is incomplete |
| 11 | Théodore Géricault | `gericault` | romanticism | *The Raft of the Medusa* — one of the great stories in art |
| 12 | Artemisia Gentileschi | `artemisia-gentileschi` | baroque | first woman in the collection; the trial and *Judith* |
| 13 | Camille Pissarro | `pissarro` | impressionism | the only painter in all eight Impressionist exhibitions |
| 14 | Mary Cassatt | `cassatt` | impressionism | d. 1926 |
| 15 | Ilya Repin | `repin` | realism | *Barge Haulers on the Volga*; thin period, superb Tretyakov scans |
| 16 | Cimabue | `cimabue` | gothic-proto-renaissance | Giotto's teacher; thinnest period in the collection |
| 17 | Jean-Siméon Chardin | `chardin` | rococo-neoclassicism | the quiet counterweight to Fragonard |

## Resulting distribution (50 artists)

| Period | Before | After |
|---|---|---|
| Gothic & Proto-Renaissance | 2 | 3 |
| Renaissance | 5 | 6 |
| Northern Renaissance | 3 | 5 |
| Baroque & Dutch Golden Age | 5 | 6 |
| Rococo & Neoclassicism | 2 | 5 |
| Romanticism | 3 | 5 |
| Realism | 3 | 4 |
| Impressionism | 3 | 5 |
| Post-Impressionism & Symbolism | 4 | 7 |
| Early Modernism | 3 | 4 |

## Done means

- 17 artist files + 51 work files, each following `src/content/TEMPLATE.md`.
- Every image meets the floor (artworks ≥2500px long edge, portraits ≥800px),
  public domain, no watermarks or upscales; `imageSource` points at the page
  for the file actually used.
- Four story sections exactly, house voice (scene-first, human drama, hedged
  legends, no technique lectures).
- Work `year` starts with the 4-digit sort year.
- `swift scripts/focal-points.swift` re-run after the images land.
- Both hardcoded count headlines updated (`artists/index.astro`;
  `periods/index.astro` re-checked, since Cimabue may move the start date).
- `npm run check` and `npm run build` green — expected **226 pages**
  (2 + 10 periods + 1 + 50 artists + 163 works).

## Explicitly out of scope

- No new periods, no `content.config.ts` changes (frozen).
- No period-music work.
- No timeline reconfiguration beyond checking the headline; new cameos are
  hand-balanced work that needs Jeff's eye on real screenshots.
- No merge to `main`. Jeff approves merges.

## Decisions Jeff may want to overrule

1. **Artemisia Gentileschi and Mary Cassatt are the first women in the
   collection.** 33/33 were men. This was my call, not an instruction.
2. **El Greco filed under Renaissance**, not Baroque — Mannerism reads as the
   late-Renaissance tail, and his period straddles the 1600 boundary.
3. **Cimabue over Simone Martini / Ambrogio Lorenzetti** for the Gothic slot —
   the Giotto lineage and the 1966 flood give him the better story.
4. **Repin over Corot / Daumier / Homer** for the Realism slot.
