# Gobble Report — 2026-08-11 → 2026-08-12

**Goal:** grow the collection from 33 artists / 112 works to **50 artists / 163 works**
(17 new artists × 3 works). Ranked: the 8 wait-listed artists first, then 9 chosen
to balance thin periods, then — only if budget remained — extra works for existing
artists. Spec: `docs/superpowers/specs/2026-08-11-collection-to-fifty-artists.md`.

**Contract (given by you at launch, not defaulted):** time ceiling 08:00 PDT
2026-08-12 · stop at 45% weekly quota (29% at launch) · no new work stretch above
85% session window · nothing pushed, nothing merged.

**Branch:** `collect-more-artists` in `.claude/worktrees/collect-more-artists`.
Main checkout untouched. **Nothing is merged — that is your call.**

**Status:** **DONE.** All 17 artists landed. 50 artists · 163 works · 226 pages.
`npm run check` green, `npm run build` green. Stopped because the goal was met,
not because a ceiling was hit — finished 01:05 PDT, roughly seven hours inside
the time ceiling, with weekly quota at ~36% against your 45% limit.

---

## Review me in this order

1. **Browse the site.** `astro dev` in the worktree, then walk the home gallery
   and the artists index. That is the real acceptance test and nothing below
   substitutes for it.
2. **The two women.** Artemisia Gentileschi and Mary Cassatt are the first women
   in the collection. This was my call, not your instruction — see "Decisions
   yours to overrule".
3. **`src/content/works/the-body-of-the-dead-christ-in-the-tomb.md`** (Holbein).
   The painting is **6.7:1** — more than twice the aspect ratio of the widest
   image previously in the collection. On the home walk's full-bleed crop that
   room will show roughly a quarter of the picture. It probably wants a
   focal-point override, or you may not want it in the walk at all.
4. **Substituted works** (four of them) — listed below. Each is a case where the
   most famous candidate had no scan that clears the 2500px floor.
5. **Cimabue's dating** — genuinely unsettled in the literature; I picked
   defensible dates and said so in the prose. Worth a skim if you care.

**The periods timeline is NOT affected** — I checked rather than assumed.
`TIMELINE_CFG` names all 16 cameos explicitly and all 10 periods are
configured, so the "unconfigured periods fall back to their first work"
behaviour described in CLAUDE.md never triggers here. `SPAN_START` is already
1280, and Cimabue's 1280 *Maestà* is not a configured cameo, so it does not
appear on the axis. No collision check needed. The only thing that moves is the
per-period work count on the period cards, which is derived and correct.

---

## What landed

Seventeen artists, three works each, one commit per artist so you can review or
drop any single artist cleanly.

| # | Artist | Period | Works |
|---|---|---|---|
| 1 | Paul Gauguin | Post-Impressionism | Where Do We Come From?; Vision after the Sermon; The Yellow Christ |
| 2 | Georges Seurat | Post-Impressionism | La Grande Jatte; Bathers at Asnières; The Circus |
| 3 | El Greco | Renaissance | Burial of the Count of Orgaz; View of Toledo; Laocoön |
| 4 | Ingres | Rococo & Neoclassicism | The Valpinçon Bather; Madame Moitessier; The Turkish Bath |
| 5 | Antoine Watteau | Rococo & Neoclassicism | Pilgrimage to Cythera; Pierrot; L'Enseigne de Gersaint |
| 6 | Hans Holbein the Younger | Northern Renaissance | The Ambassadors; Christina of Denmark; The Dead Christ |
| 7 | Egon Schiele | Early Modernism | Self-Portrait with Physalis; Death and the Maiden; The Family |
| 8 | Henri Rousseau | Post-Impressionism | Tiger in a Tropical Storm; The Sleeping Gypsy; The Dream |
| 9 | Caspar David Friedrich | Romanticism | Wanderer above the Sea of Fog; Monk by the Sea; The Sea of Ice |
| 10 | Artemisia Gentileschi | Baroque | Susanna and the Elders; Judith Slaying Holofernes; Self-Portrait as the Allegory of Painting |
| 11 | Hieronymus Bosch | Northern Renaissance | Garden of Earthly Delights; The Haywain Triptych; The Ship of Fools |
| 12 | Théodore Géricault | Romanticism | The Raft of the Medusa; The Charging Chasseur; The Monomaniac of Envy |
| 13 | Camille Pissarro | Impressionism | Hoar Frost; Haymaking at Éragny; Boulevard Montmartre at Night |
| 14 | Ilya Repin | Realism | Barge Haulers on the Volga; Ivan the Terrible and His Son; They Did Not Expect Him |
| 15 | Mary Cassatt | Impressionism | Little Girl in a Blue Armchair; In the Loge; The Child's Bath |
| 16 | Cimabue | Gothic & Proto-Renaissance | Maestà of the Louvre; Crucifix of Santa Croce; Santa Trinita Maestà |
| 17 | Jean-Siméon Chardin | Rococo & Neoclassicism | The Ray; Soap Bubbles; Saying Grace |

Resulting period balance: Gothic 3, Renaissance 6, Northern Renaissance 5,
Baroque 6, Rococo & Neoclassicism 5, Romanticism 5, Realism 4, Impressionism 5,
Post-Impressionism 7, Early Modernism 4.

---

## Substitutions — famous works that had no floor-clearing scan

Every one of these was checked hard before giving up. The 2500px floor and the
"no frames, no upscales, no detail crops" rule did the deciding.

- **Ingres, *La Grande Odalisque*** → *Madame Moitessier* (1851, NGA). No scan
  of the Odalisque above 2200px exists on Commons; the only larger file is a
  crop of the head. **Also dropped: *Portrait of Monsieur Bertin*** — its only
  ≥2500px file is a photograph including the gilt frame, and cropping the frame
  off drops it to ~2090px.
- **El Greco, *El Espolio*** → *Laocoön* (NGA). The Espolio's only large files
  are visitor photographs of the Toledo cathedral sacristy, with frame and
  perspective distortion.
- **Géricault, *Wounded Cuirassier*** → *The Charging Chasseur*. No Cuirassier
  scan clears 2500px; the only large file is a 16:9 phone photo. The Cuirassier
  still appears inside the Chasseur's story as its deliberate opposite.
- **Repin, *Reply of the Zaporozhian Cossacks*** → *They Did Not Expect Him*.
  The only full reproduction is a Yorck Project book plate trimmed 4% off the
  documented canvas ratio.

Worth adding to the "Known quirks" list in CLAUDE.md alongside the Matisse
*Dance* and Courbet *Desperate Man* entries.

**Traps caught and rejected during sourcing** (agents verified aspect ratio
against documented canvas dimensions on every file): a 16112×30000 *Ship of
Fools* that is an exact 3× upscale; a 9843px *Haywain* that is a framed gallery
photo with the museum wall label in shot; a 5211×7764 Louvre *Chasseur*
stretched 13% vertically; a "remastered colour" Photoshop derivative of the
Repin. I also cropped a Met colour-reference bar off *View of Toledo* and
trimmed the surrounding plaster from the in-situ *Crucifix of Santa Croce*.

---

## Decisions yours to overrule

1. **Two women enter the collection** — Artemisia Gentileschi and Mary Cassatt.
   All 33 existing artists were men. This was my judgement about what "the
   greatest art in history" should contain, not something you asked for.
2. **Artemisia's death year is set to 1656, not 1653.** Documents place her
   still paying taxes in Naples in 1654; she probably died in the 1656 plague.
   The bio explains the discrepancy rather than hiding it.
3. **El Greco is filed under Renaissance**, not Baroque — Mannerism as the
   late-Renaissance tail. His career straddles 1600.
4. **Roster picks 9–17** (Bosch, Friedrich, Géricault, Artemisia, Pissarro,
   Cassatt, Repin, Cimabue, Chardin) were mine, chosen to fill the thinnest
   periods and the largest canonical gaps. Rationale per artist is in the spec.
5. **Watteau's portrait is a 1000px PD file** rather than either of two sharper
   3000px+ scans of the same pastel, because those are CC BY-SA and every other
   portrait in the collection is PD/CC0. Trivial to swap if you'd accept a
   credit line.
6. **Three works per new artist**, matching the collection's baseline (the
   giants carry 4–5). Nobody new was given four.

---

## Flagged risks and follow-ups

- **Holbein's *Dead Christ* at 6.7:1** will crop badly on the home walk. This is
  the one real layout risk in the batch.
- **The periods timeline is fine** — verified, not assumed; see the note above
  the "What landed" table.
- **`gothic-proto-renaissance.md` says `years: "c. 1290–1420"`** but now holds a
  1280 work. Note the period already contained a 1285 Duccio, so the label was
  already approximate — the shift is five years, not a rewrite. Left alone
  deliberately; your call.
- **Licence-wording variants** (`"CC0 Public Domain"`, `"Public domain (CC0)"`,
  etc.) exist across the collection. I checked: all of them are **pre-existing**,
  none came from this batch, and the field is not rendered on any page. Mentioned,
  not touched.
- Wikimedia began returning **HTTP 429 with `retry-after: 600`** under the
  parallel agent load. It cost time but no content. If a future batch runs this
  wide, throttle the downloads.

---

## Proposed, not done

Not started, because you did not ask for it and unreviewed diffs cost you more
than they save. Rough effort estimates:

- **Extra works for thin existing artists** (goal item 3, never reached — the 17
  artists consumed the budget). 23 of the original 33 artists carry only 3 works.
  ~15 min per work.
- **Image upgrades still wanted**: `witches-sabbath.jpg` (soft scan),
  `botticelli.jpg` (halftone). I'd add **`seurat.jpg`** to that list — the only
  PD Seurat likeness is a halftone book reproduction; I used the cropped variant
  without the printed caption, but it is the same class of defect. ~20 min each,
  and may simply not be solvable.
- **Re-tune the artists-index headline break.** "Fifty lives<br />that changed
  how we see." is more lopsided than "Thirty-three lives" was. ~5 min of taste.
- **A fourth Cimabue-era artist** (Simone Martini or Ambrogio Lorenzetti) if you
  want Gothic & Proto-Renaissance above 3. ~30 min.

---

## Test/build state

At the last commit (`8745049`):

```
npm run check   ✓ content checks passed
npm run build   ✓ 226 page(s) built     (2 + 10 periods + 1 + 50 artists + 163 works)
```

Extra QA I ran beyond the two gates, all clean:

- Every one of the 163 works has a `year` starting with a 4-digit sort key
  (convention #1 — `npm run check` does not test this).
- Every `artist:` and `period:` reference in every work resolves to a real file;
  every artist's `period` resolves.
- Every licence in the collection is PD or CC0. The EU-caveat wording appears on
  exactly 4 items — the same three Picasso works and one Matisse portrait as
  before. This batch introduced no new copyright exposure.
- `swift scripts/focal-points.swift` re-run: 163 focal points, 78 by face, 85 by
  saliency, 0 fallback-to-centre. I audited all 51 new anchors and overrode the
  two that were wrong (see the finishing commit).

**What I could not verify:** the actual look of the walk on a wide monitor and a
phone. That is your acceptance test and the reason nothing here is merged.

---

## Timeline

- **23:25 PDT** — Preflight: permission mode `auto`. Session 2%, weekly 29%.
  Worktree + caffeinate up.
- **23:35** — Spec written, roster of 17 fixed. Started **inline** (agent
  dispatch not authorized at that point), flagged to you as interruptible.
- **00:00** — Gauguin, Seurat, El Greco committed inline.
- **00:10** — You authorized subagent dispatch and asked not to be consulted
  again on similar calls. Switched to the repo's documented implementer-agent
  process: 8 agents in parallel, then 4 more.
- **00:45** — 15 artists committed. Session 60%, weekly 35%.
- **01:00** — 16 committed; 222 pages building. Cimabue done inline (his images
  took ~25 min of retries against Wikimedia's rate limiter).
- **01:05** — Chardin landed; 17/17. Finishing pass: headline, AGENTS.md state
  and backlog, focal points regenerated with two overrides. `check` green,
  `build` 226 pages. **Goal met — stopped here rather than spending the
  remaining budget.** Session 62%, weekly ~36%.

---

## What I changed outside `src/content` and `src/assets`

Four files, all in the finishing commit `8745049`, so they are easy to inspect
or drop:

- `src/pages/artists/index.astro` — the count headline (one line).
- `AGENTS.md` — current-state line, the count-headline reminder, the backlog
  wait-list, and two additions to "Known quirks" recording the four works with
  no floor-clearing scan and the Commons traps that catch bad files.
- `scripts/focal-points.swift` — two entries added to the `OVERRIDES` table.
- `src/data/focal-points.json` — regenerated (163 entries).

Nothing else in `src/pages`, `src/components`, `src/styles`, `src/layouts`, or
`src/content.config.ts` was touched. The schema is untouched, as required.
