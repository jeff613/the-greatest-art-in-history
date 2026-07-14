# Timeline Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Gothic & Proto-Renaissance, Symbolism & Fin de Siècle, and Early Modernism: 11 periods / 33 artists / 112 works.

**Architecture:** Identical to the collection-expansion plan: one site-prep task, one task per artist, final verification. Schema frozen. Spec: `docs/superpowers/specs/2026-07-13-timeline-extension-design.md`.

**Tech Stack:** Astro 7 content collections, markdown, curl + sips.

## Global Constraints

Identical to `docs/superpowers/plans/2026-07-13-collection-expansion.md` Global Constraints (template rules, word ranges, year-string rule, image floors, sourcing procedure, per-task check/build gate) — that section plus its "Image sourcing procedure" and "New-artist task shape" apply verbatim to every task below, with ONE addition:

- **Early Modernism licensing (Tasks 6–8):** pre-1930 works only. Picasso works use `imageLicense: "Public domain in the US (published before 1930); may remain under copyright in the EU"`. Kandinsky/Matisse works PD in US+EU — use standard/museum wording. No post-1929 work may be added under any substitution.

---

### Task 1: Site prep — three new periods, renumbering

**Files:**
- Create: `src/content/periods/gothic-proto-renaissance.md`, `src/content/periods/symbolism-fin-de-siecle.md`, `src/content/periods/early-modernism.md`
- Modify: all 8 existing period files (order only: renaissance 2, northern-renaissance 3, baroque 4, rococo-neoclassicism 5, romanticism 6, realism 7, impressionism 8, post-impressionism 9)

**Interfaces:** Produces period ids `gothic-proto-renaissance`, `symbolism-fin-de-siecle`, `early-modernism` used by Tasks 2–8.

- [ ] Step 1: Renumber the 8 existing periods as above.
- [ ] Step 2: Create the three new period files:

```markdown
---
name: "Gothic & Proto-Renaissance"
order: 1
years: "c. 1290–1420"
---
```

```markdown
---
name: "Symbolism & Fin de Siècle"
order: 10
years: "c. 1886–1918"
---
```

```markdown
---
name: "Early Modernism"
order: 11
years: "c. 1905–1929"
---
```

Each body: 120–200-word essay in the house voice (read two existing period files first). Themes — Gothic: Byzantine gold-ground icons learning to breathe; Giotto giving painted people weight and grief; the chapel a banker built to buy his father out of hell. Symbolism/Fin de Siècle: empires glittering toward collapse; Vienna's gold and Oslo's dread; art turning inward to desire and fear. Early Modernism: the picture plane shatters after Cézanne; Paris ateliers; painting races photography toward abstraction — end before 1930, note the museum pauses where living copyright begins.
- [ ] Step 3: `npm run check && npm run build` — green; periods ledger renders 11 rows chronologically.
- [ ] Step 4: Commit `feat(content): Gothic, Fin de Siècle, Early Modernism periods + renumbering`.

---

### Task 2: Artist: Giotto (gothic-proto-renaissance)

Artist entry: name "Giotto di Bondone", file `giotto.md`, birth 1267, death 1337 (birth c. 1267 — prose hedges). Hook angle: the shepherd boy who broke the Byzantine spell — the first painter whose people weep.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-lamentation | The Lamentation | "1305" | Fresco | Scrovegni Chapel, Padua | Commons: post-restoration Scrovegni scans |
| the-kiss-of-judas | The Kiss of Judas | "1305" | Fresco | Scrovegni Chapel, Padua | Commons: Scrovegni scans |
| ognissanti-madonna | Ognissanti Madonna | "1310" | Tempera on panel | Galleria degli Uffizi, Florence | Commons: Uffizi/GAP scan |

Portrait: no life portrait exists — use the posthumous portrait attributed to Paolo Uccello's circle or the Louvre "Five Masters of the Florentine Renaissance" Giotto panel (Commons); state posthumous status in the bio.
Story leads: Enrico Scrovegni's chapel as penance for his father's usury (Dante put Reginaldo in the Inferno); the O of Giotto legend (Vasari — hedge); Dante's Purgatorio name-check ("Giotto's the cry"); the frescoes' grief revolution.
Follow the New-artist task shape.

---

### Task 3: Artist: Duccio (gothic-proto-renaissance)

Artist entry: name "Duccio di Buoninsegna", file `duccio.md`, birth 1255, death 1319 (both approximate — prose hedges; use 1255/1319 ints). Hook angle: Siena's difficult genius — fined for debts and dodging civic duty, he painted heaven so well the city carried it through the streets.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| maesta | Maestà | "1308–1311" | Tempera and gold on panel | Museo dell'Opera del Duomo, Siena | Commons: hi-res front-panel scan |
| rucellai-madonna | Rucellai Madonna | "1285" | Tempera on panel | Galleria degli Uffizi, Florence | Commons: Uffizi scan |
| madonna-and-child-stoclet | Madonna and Child | "1290–1300" | Tempera and gold on wood | The Metropolitan Museum of Art, New York | Met open access CC0 ("Stoclet Madonna") |

Portrait: no portrait exists — use a public-domain 19th-century engraved imagining or the Maestà's own central Madonna detail as a stand-in image with the bio stating no likeness survives (portrait floor still ≥800px).
Story leads: the 9 June 1311 procession carrying the Maestà from workshop to Duomo (shops shut, bells rang — documented); the panel later sawn apart and scattered; the Stoclet Madonna's parapet burn marks from devotional candles and the Met's ~$45M 2004 purchase (price never officially confirmed — hedge).
Follow the New-artist task shape.

---

### Task 4: Artist: Gustav Klimt (symbolism-fin-de-siecle)

Artist entry: name "Gustav Klimt", file `klimt.md`, birth 1862, death 1918. Hook angle: Vienna's golden scandal — he painted the empire's wives into icons and never explained himself once.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-kiss | The Kiss | "1907–1908" | Oil and gold leaf on canvas | Österreichische Galerie Belvedere, Vienna | Belvedere open access / Commons GAP scan |
| portrait-of-adele-bloch-bauer-i | Portrait of Adele Bloch-Bauer I | "1907" | Oil, silver and gold on canvas | Neue Galerie, New York | Commons GAP scan |
| judith-i | Judith I | "1901" | Oil and gold leaf on canvas | Österreichische Galerie Belvedere, Vienna | Commons/Belvedere scan |

Portrait: 1914 photograph by Anton Josef Trčka or Moriz Nähr photo (PD) → portraits/klimt.jpg.
Story leads: The Kiss bought by Austria mid-exhibition 1908; Adele Bloch-Bauer I's Nazi seizure, the 2006 Altmann restitution (Republic of Austria v. Altmann, US Supreme Court) and Lauder's $135M purchase; Judith mislabeled "Salome" for decades; the 1918 flu taking Klimt, Schiele, and the Vienna moment; the Faculty Paintings scandal + 1945 Immendorf fire.
Follow the New-artist task shape.

---

### Task 5: Artist: Edvard Munch (symbolism-fin-de-siecle)

Artist entry: name "Edvard Munch", file `munch.md`, birth 1863, death 1944. Hook angle: illness, madness and death were his family — so he painted them until they let him live.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-scream | The Scream | "1893" | Tempera and crayon on cardboard | National Museum, Oslo | Nasjonalmuseet open access / Commons hi-res |
| madonna | Madonna | "1894–1895" | Oil on canvas | Munch Museum, Oslo | Commons hi-res |
| the-sick-child | The Sick Child | "1885–1886" | Oil on canvas | National Museum, Oslo | Nasjonalmuseet open access / Commons |

Portrait: 1902 self-photograph or PD photographic portrait → portraits/munch.jpg.
Story leads: the blood-red sky diary entry behind The Scream (quote the documented text); the 1994 and 2004 thefts (which versions — 1994 National Gallery theft of this 1893 version during the Lillehammer Olympics; 2004 Munch Museum armed theft of the 1910 version — keep them straight); sister Sophie's death behind The Sick Child and its "shredded" first reception; Madonna's scandal frame with sperm-border lithograph version; the 1908 breakdown and the late calm.
Follow the New-artist task shape.

---

### Task 6: Artist: Pablo Picasso (early-modernism)

Artist entry: name "Pablo Picasso", file `picasso.md`, birth 1881, death 1973. Hook angle: the prodigy who could paint like Raphael at fifteen and spent the rest of his life learning to break it. Bio covers the whole life but the collection stops at 1929 — say so ("the museum pauses where living copyright begins"; a line in the bio noting later giants like Guernica await the public domain).

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-old-guitarist | The Old Guitarist | "1903–1904" | Oil on panel | Art Institute of Chicago | AIC open access CC0 direct download |
| les-demoiselles-davignon | Les Demoiselles d'Avignon | "1907" | Oil on canvas | Museum of Modern Art, New York | Commons PD-US scan (≥2500px) |
| family-of-saltimbanques | Family of Saltimbanques | "1905" | Oil on canvas | National Gallery of Art, Washington | NGA open access download |

LICENSING (binding): les-demoiselles-davignon and family-of-saltimbanques use `imageLicense: "Public domain in the US (published before 1930); may remain under copyright in the EU"`. The Old Guitarist uses AIC's CC0 wording (AIC distributes it as public domain). If NGA does not offer Saltimbanques openly, source the best PD-US scan from Commons and use the US-caveat wording.
Story leads: Blue Period poverty and Casagemas' suicide behind The Old Guitarist; Demoiselles kept rolled in the studio for years, even friends recoiled (Braque, Matisse reactions), MoMA 1939; Saltimbanques' hidden earlier composition under X-ray, Rilke's Duino elegy on it; Chelsea Hotel? no — keep pre-1930.
Follow the New-artist task shape.

---

### Task 7: Artist: Wassily Kandinsky (early-modernism)

Artist entry: name "Wassily Kandinsky", file `kandinsky.md`, birth 1866, death 1944. Hook angle: the Moscow lawyer who saw a haystack dissolve and decided painting no longer needed the world.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| composition-vii | Composition VII | "1913" | Oil on canvas | Tretyakov Gallery, Moscow | Commons GAP/Tretyakov scan |
| composition-viii | Composition VIII | "1923" | Oil on canvas | Solomon R. Guggenheim Museum, New York | Commons hi-res |
| improvisation-28 | Improvisation 28 (Second Version) | "1912" | Oil on canvas | Solomon R. Guggenheim Museum, New York | Commons hi-res |

Story leads: the upside-down-canvas epiphany in his Munich studio (his own account); Composition VII's 30+ studies then three days of painting (documented); synesthesia and Der Blaue Reiter; Bauhaus years for VIII; the 1896 Monet haystack moment (this museum owns the AIC Stacks of Wheat — cross-reference it).
Follow the New-artist task shape (his works are PD in US+EU — standard wording).

---

### Task 8: Artist: Henri Matisse (early-modernism)

Artist entry: name "Henri Matisse", file `matisse.md`, birth 1869, death 1954. Hook angle: a law clerk given a paint-box during appendicitis — "a kind of paradise" he never left.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-dance | The Dance | "1910" | Oil on canvas | Hermitage Museum, St Petersburg | Commons hi-res (Hermitage version) |
| woman-with-a-hat | Woman with a Hat | "1905" | Oil on canvas | San Francisco Museum of Modern Art | Commons PD scan |
| the-joy-of-life | The Joy of Life | "1905–1906" | Oil on canvas | Barnes Foundation, Philadelphia | Barnes open access / Commons |

Sourcing risk is highest here — substitute freely within pre-1930 Matisse (e.g. The Red Studio 1911, Harmony in Red 1908 Hermitage, Blue Nude 1907) if a listed scan can't clear the floor. Matisse is PD in US+EU (d. 1954) — standard wording.
Story leads: the 1905 Salon d'Automne "Donatello among the wild beasts" (Vauxcelles — verify attribution) and Fauvism's naming; Leo/Gertrude Stein buying Woman with a Hat, mockers scratching at it; Shchukin commissioning Dance for his Moscow staircase and losing everything in 1917; the Matisse–Picasso rivalry-friendship.
Follow the New-artist task shape.

---

### Task 9: Whole-museum verification

Same shape as collection-expansion Task 21, updated numbers:
- [ ] Step 1: Counts: 11 periods / 33 artists / 112 works.
- [ ] Step 2: `npm run check` green; `npm run build` → 159 pages (1 home + 1 periods index + 11 periods + 1 artists index + 33 artists + 112 works).
- [ ] Step 3: Served-dist click-through: ledger 11 rows chronological; the three new period pages (essay + featured vertical work + grid); homepage works-data JSON = 112 entries, walk still 24 rooms; spot-check 3 new work pages.
- [ ] Step 4: License audit: every early-modernism work's imageLicense matches the binding wording rules; no work anywhere has a year ≥1930.
- [ ] Step 5: Image/orphan audit as before; commit any fixes `fix(content): verification sweep`.

---

## Self-review notes

- Spec coverage: 3 periods (T1), 7 artists × 3 works = 21 works (T2–T8), verification (T9). 91+21=112, 26+7=33, 8+3=11. ✓
- Renumbering touches all 8 existing period files; no URL changes (slugs stable). ✓
- Copyright rules embedded in Global Constraints addition + Task 6 licensing block + T9 license audit. ✓
- Portrait edge cases (Giotto posthumous, Duccio none survives) handled explicitly in-task. ✓
