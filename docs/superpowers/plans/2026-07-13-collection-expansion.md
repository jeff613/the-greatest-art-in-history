# Collection Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow the museum from 5 periods / 10 artists / 30 works to 8 periods / 26 artists / 91 works at the v1 quality bar.

**Architecture:** Pure content expansion on the frozen v1 schema (`src/content.config.ts` — do not modify). One site-prep task (new period entries, renumbering, gallery-walk cap), then one task per new artist and per deepening group. Every task ends with `npm run check && npm run build` green, so the museum is browsable after each task.

**Tech Stack:** Astro 7 content collections, markdown + frontmatter, curl for image sourcing, `sips` for resolution checks.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-13-collection-expansion-design.md`.
- Schema is frozen; never edit `src/content.config.ts` or `scripts/check-content.mjs`.
- Follow `src/content/TEMPLATE.md` exactly: work sections are exactly `## The Story` (250–450 words), `## The World Behind It` (150–300), `## The Artist at This Moment` (150–300), `## Interesting Facts` (4–7 bullets). No technique-analysis sections.
- `year` frontmatter MUST start with the 4-digit sort year (`"1509–1511"`, never `"c. 1509"`).
- Artwork images ≥2500px long edge, portraits ≥800px, public domain, no watermarks/upscales. `imageSource` = the Commons file page or museum page URL actually used; `imageLicense: "Public domain"` (or the museum's CC0 wording).
- Stories are history + the artist's human story, NOT technique. Facts must be web-verifiable; when in doubt, verify before writing.
- Every task ends: `npm run check && npm run build` → both pass, then commit.

### Image sourcing procedure (applies to every content task)

1. Find the work on Wikimedia Commons (search `<title> <artist> site:commons.wikimedia.org`). Prefer files credited to museum open-access programs (Google Art Project, Rijksmuseum, NGA, Met, Getty, Prado, AIC) — usually the largest scan.
2. On the Commons file page, take the **original file** link (`upload.wikimedia.org/.../<file>`), not a thumbnail. Download: `curl -L -o src/assets/art/<slug>.jpg "<original-url>"` (portraits → `src/assets/portraits/<artist-slug>.jpg`).
3. Verify: `sips -g pixelWidth -g pixelHeight src/assets/art/<slug>.jpg` → long edge ≥2500 (portrait ≥800). If under the floor, try the museum's own site (NGA/AIC/Getty/Rijksmuseum offer direct open-access downloads), then the listed alternate work.
4. If a listed work cannot meet the floor from any source, substitute another famous work by the same artist that can, and say so in the commit message.
5. PNG/TIF sources may be converted: `sips -s format jpeg -s formatOptions 92 in.png --out out.jpg`.

### New-artist task shape (all "Artist:" tasks below)

Each task creates: `src/content/artists/<artist-slug>.md`, `src/assets/portraits/<artist-slug>.jpg`, and for each listed work `src/content/works/<work-slug>.md` + `src/assets/art/<work-slug>.jpg`. Frontmatter shapes are copied exactly from `src/content/TEMPLATE.md` (see Global Constraints). Steps for every artist task:

- [ ] Step 1: Source and download the portrait + all listed work images per the procedure; verify every resolution with sips.
- [ ] Step 2: Write the artist entry — frontmatter (name, birth, death, period, portrait, portraitSource, portraitLicense, hook, timeline with 8–12 entries) + 300–500-word narrative bio.
- [ ] Step 3: Write each work file — full frontmatter + the four story sections. Research first; verify key claims (dates, commissions, thefts, prices) via web search.
- [ ] Step 4: Run `npm run check && npm run build` — both must pass (expect all-green content checks; build page count grows accordingly).
- [ ] Step 5: `git add -A && git commit` with message `feat(content): <artist name> — <n> works`.

---

### Task 1: Site prep — new periods, renumbering, walk cap

**Files:**
- Create: `src/content/periods/northern-renaissance.md`, `src/content/periods/rococo-neoclassicism.md`, `src/content/periods/realism.md`
- Modify: `src/content/periods/baroque.md`, `src/content/periods/romanticism.md`, `src/content/periods/impressionism.md`, `src/content/periods/post-impressionism.md` (order only)
- Modify: `src/pages/index.astro` (walk cap)

**Interfaces:** Produces period ids `northern-renaissance`, `rococo-neoclassicism`, `realism` that all later tasks reference in artist/work frontmatter.

- [ ] Step 1: Renumber existing period `order` frontmatter: renaissance 1 (unchanged), baroque 3, romanticism 5, impressionism 7, post-impressionism 8.
- [ ] Step 2: Create the three new period files. Frontmatter exactly:

```markdown
---
name: "Northern Renaissance"
order: 2
years: "c. 1420–1570"
---
```

```markdown
---
name: "Rococo & Neoclassicism"
order: 4
years: "c. 1700–1820"
---
```

```markdown
---
name: "Realism"
order: 6
years: "c. 1840–1880"
---
```

Each body is a 120–200-word intro essay in the voice of the existing five (read `src/content/periods/renaissance.md` and `realism`-adjacent `impressionism.md` first). Themes: Northern Renaissance — oil paint invented in Flanders, obsessive detail as devotion, art for merchants not just princes, Dürer bringing Italy north. Rococo & Neoclassicism — aristocratic pleasure painted on silk, then the Revolution guillotines the patrons and David repaints virtue in Roman marble; one century, two opposite dreams. Realism — painters declare peasants and laborers worthy of history-painting scale; the Salon riots; Manet drags the old masters into modern Paris.

- [ ] Step 3: Cap the gallery walk at 24 rooms. In `src/pages/index.astro`, replace

```ts
    const rest = data.filter((_, i) => i !== dailyIndex);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }

    for (const entry of rest) {
```

with

```ts
    const WALK_SIZE = 24;
    const rest = data.filter((_, i) => i !== dailyIndex);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    const rooms = rest.slice(0, WALK_SIZE);

    for (const entry of rooms) {
```

- [ ] Step 4: `npm run check && npm run build` — check passes (new periods have no resolution/section requirements), build now emits 3 more period pages (51 total). Load `http://localhost:4322/periods/` after `npm run build` and confirm the ledger reads chronologically with 8 rows (preview server serves `dist`).
- [ ] Step 5: Commit: `feat(content): three new periods, chronological renumbering, 24-room walk cap`.

*Note: the three new period pages render with an empty works grid (and the featured-work column absent — `cards` is empty, so `periods/[slug].astro`'s `featured` reduce would throw on an empty array!). Guard it in this task:* in `src/pages/periods/[slug].astro`, change

```ts
const featured = cards.reduce((best, c) => (aspect(c) > aspect(best) ? c : best));
```

to

```ts
const featured = cards.length
  ? cards.reduce((best, c) => (aspect(c) > aspect(best) ? c : best))
  : null;
```

and wrap the `<a class="intro-art">` block in `{featured && (...)}`. Same guard is NOT needed on artist pages (every artist ships with works).

---

### Task 2: Artist: Jan van Eyck (northern-renaissance)

Artist entry: name "Jan van Eyck", birth 1390, death 1441, period `northern-renaissance`. Hook angle: the diplomat-painter whose oil glazes were so luminous rivals thought he'd discovered a secret substance.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-arnolfini-portrait | The Arnolfini Portrait | "1434" | Oil on oak panel | The National Gallery, London | Commons: Google Art Project scan |
| the-ghent-altarpiece | The Ghent Altarpiece | "1432" | Oil on panel | St Bavo's Cathedral, Ghent | Commons: open-state full view; closertovaneyck.kikirpa.be scans feed Commons |
| portrait-of-a-man-in-a-red-turban | Portrait of a Man (Self-Portrait?) | "1433" | Oil on oak panel | The National Gallery, London | Commons: Google Art Project scan |

Portrait: crop/save the Man in a Red Turban image separately to `src/assets/portraits/van-eyck.jpg` (presumed self-portrait; note that in the bio).
Story leads: Arnolfini mirror + "Johannes de eyck fuit hic" graffiti-signature; Ghent Altarpiece = most-stolen artwork in history (Just Judges panel still missing); court spy missions for Philip the Good.
Follow the New-artist task shape (Steps 1–5).

---

### Task 3: Artist: Albrecht Dürer (northern-renaissance)

Artist entry: name "Albrecht Dürer", birth 1471, death 1528, period `northern-renaissance`. Hook angle: the goldsmith's son who made printmaking a fine art and painted himself as Christ.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| self-portrait-at-twenty-eight | Self-Portrait at Twenty-Eight | "1500" | Oil on lime panel | Alte Pinakothek, Munich | Commons: hi-res museum scan |
| young-hare | Young Hare | "1502" | Watercolour and bodycolour | Albertina, Vienna | Commons: Albertina scan |
| melencolia-i | Melencolia I | "1514" | Engraving | The Metropolitan Museum of Art, New York | Met open access (CC0) — met museum site direct download |

Portrait: Self-Portrait at 26 (1498, Museo del Prado) → `src/assets/portraits/durer.jpg` (Prado/Commons hi-res). Artist slug/file: `durer.md` (no umlaut in filenames; name field keeps "Albrecht Dürer").
Story leads: the 1500 self-portrait's frontal Christ pose as an artistic manifesto; Young Hare painted from life in the workshop; Melencolia I as the thinking artist's dark twin, its magic square.
Follow the New-artist task shape (Steps 1–5).

---

### Task 4: Artist: Pieter Bruegel the Elder (northern-renaissance)

Artist entry: name "Pieter Bruegel the Elder", birth 1525, death 1569, period `northern-renaissance`. Hook angle: the city sophisticate who dressed as a peasant to crash village weddings, then painted what he saw.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| hunters-in-the-snow | Hunters in the Snow | "1565" | Oil on oak panel | Kunsthistorisches Museum, Vienna | Commons: Google Art Project / KHM scan |
| the-tower-of-babel | The Tower of Babel | "1563" | Oil on oak panel | Kunsthistorisches Museum, Vienna | Commons: Google Art Project scan |
| netherlandish-proverbs | Netherlandish Proverbs | "1559" | Oil on oak panel | Gemäldegalerie, Berlin | Commons: Google Art Project scan |

Portrait: the 1572 engraved portrait (from *Pictorum aliquot celebrium Germaniae inferioris effigies*) → `src/assets/portraits/bruegel.jpg`.
Story leads: Hunters in the Snow and the Little Ice Age winter of 1565; Babel's colosseum-shaped critique of Antwerp's boom; the ~120 proverbs catalogued in one village.
Follow the New-artist task shape (Steps 1–5).

---

### Task 5: Artist: Michelangelo Buonarroti (renaissance)

Artist entry: name "Michelangelo Buonarroti", birth 1475, death 1564, period `renaissance`. Hook angle: the sculptor who insisted he was no painter — then spent four years on his back proving himself wrong.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-creation-of-adam | The Creation of Adam | "1512" | Fresco | Sistine Chapel, Vatican City | Commons: post-restoration hi-res |
| the-last-judgment | The Last Judgment | "1536–1541" | Fresco | Sistine Chapel, Vatican City | Commons: hi-res full-wall scan |
| doni-tondo | Doni Tondo | "1507" | Tempera and oil on panel | Galleria degli Uffizi, Florence | Commons: Uffizi/GAP scan |

Portrait: Daniele da Volterra's portrait of Michelangelo (c. 1544, Met, CC0) → `src/assets/portraits/michelangelo.jpg`.
Story leads: Julius II strong-arming a sculptor onto scaffolding; the Last Judgment's nudity scandal and Biagio da Cesena painted into hell; Doni Tondo as his only surviving finished panel painting.
Follow the New-artist task shape (Steps 1–5).

---

### Task 6: Artist: Raphael (renaissance)

Artist entry: name "Raphael", birth 1483, death 1520, period `renaissance`. Hook angle: the charming prodigy who ran art's largest workshop and died at 37 — Rome shut down for his funeral.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-school-of-athens | The School of Athens | "1509–1511" | Fresco | Apostolic Palace, Vatican City | Commons: hi-res scan |
| the-sistine-madonna | The Sistine Madonna | "1512" | Oil on canvas | Gemäldegalerie Alte Meister, Dresden | Commons: GAP scan |
| the-transfiguration | The Transfiguration | "1516–1520" | Tempera on panel | Pinacoteca Vaticana, Vatican City | Commons: hi-res scan |

Portrait: Self-portrait (c. 1506, Uffizi) → `src/assets/portraits/raphael.jpg`.
Story leads: School of Athens painted while Michelangelo worked next door (and Raphael sneaking him in as Heraclitus); the Sistine Madonna's bored cherubs; Transfiguration carried at his funeral.
Follow the New-artist task shape (Steps 1–5).

---

### Task 7: Artist: Titian (renaissance)

Artist entry: name "Titian", birth 1488, death 1576, period `renaissance`. Hook angle: Venice's painter-emperor for sixty years; kings picked up his brushes when he dropped them.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| venus-of-urbino | Venus of Urbino | "1538" | Oil on canvas | Galleria degli Uffizi, Florence | Commons: GAP/Uffizi scan |
| bacchus-and-ariadne | Bacchus and Ariadne | "1520–1523" | Oil on canvas | The National Gallery, London | Commons: GAP scan (post-cleaning) |
| equestrian-portrait-of-charles-v | Equestrian Portrait of Charles V | "1548" | Oil on canvas | Museo del Prado, Madrid | Commons: Prado scan |

Portrait: Self-Portrait (c. 1562, Prado) → `src/assets/portraits/titian.jpg`.
Story leads: Venus of Urbino's frank gaze scandalizing centuries (Mark Twain's rant); Bacchus leaping off the chariot for Alfonso d'Este's studiolo; Charles V picking up the brush — the legend and what it meant.
Follow the New-artist task shape (Steps 1–5).

---

### Task 8: Artist: Diego Velázquez (baroque)

Artist entry: name "Diego Velázquez", birth 1599, death 1660, period `baroque`. Hook angle: the king's painter who put himself in the royal family portrait — and got away with it.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| las-meninas | Las Meninas | "1656" | Oil on canvas | Museo del Prado, Madrid | Commons: Prado hi-res scan |
| the-surrender-of-breda | The Surrender of Breda | "1634–1635" | Oil on canvas | Museo del Prado, Madrid | Commons: Prado scan |
| portrait-of-innocent-x | Portrait of Innocent X | "1650" | Oil on canvas | Galleria Doria Pamphilj, Rome | Commons: hi-res scan |

Portrait: Self-portrait (c. 1640, Museu de Belles Arts de València) → `src/assets/portraits/velazquez.jpg`.
Story leads: Las Meninas' mirror puzzle and the red cross of Santiago added later; Breda's chivalrous surrender (the lance forest); Innocent X's "troppo vero!" and Francis Bacon's screaming-pope obsession.
Follow the New-artist task shape (Steps 1–5).

---

### Task 9: Artist: Peter Paul Rubens (baroque)

Artist entry: name "Peter Paul Rubens", birth 1577, death 1640, period `baroque`. Hook angle: Europe's busiest painter was also its most trusted diplomat — knighted by two kings for stopping a war.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-descent-from-the-cross | The Descent from the Cross | "1612–1614" | Oil on panel | Cathedral of Our Lady, Antwerp | Commons: hi-res scan |
| the-three-graces | The Three Graces | "1630–1635" | Oil on panel | Museo del Prado, Madrid | Commons: Prado scan |
| massacre-of-the-innocents | Massacre of the Innocents | "1611–1612" | Oil on panel | Art Gallery of Ontario, Toronto | Commons: hi-res scan |

Portrait: Self-Portrait (1623, Royal Collection) → `src/assets/portraits/rubens.jpg`.
Story leads: the Antwerp altarpiece painted for the harquebusiers' guild; Three Graces featuring both his wives, kept private until death; Massacre's 2002 rediscovery and £49.5M auction record.
Follow the New-artist task shape (Steps 1–5).

---

### Task 10: Deepen the Dutch/Baroque wing (+4 works)

No new artists. Create four work files + images for existing artists (frontmatter `artist:` values shown):

| slug | title | artist | period | year | medium | location | source hint |
|---|---|---|---|---|---|---|---|
| the-supper-at-emmaus | The Supper at Emmaus | caravaggio | baroque | "1601" | Oil and tempera on canvas | The National Gallery, London | Commons: GAP scan |
| the-jewish-bride | The Jewish Bride | rembrandt | baroque | "1665–1669" | Oil on canvas | Rijksmuseum, Amsterdam | Rijksmuseum open access (CC0), largest rendition |
| the-return-of-the-prodigal-son | The Return of the Prodigal Son | rembrandt | baroque | "1663–1669" | Oil on canvas | Hermitage Museum, St Petersburg | Commons: hi-res scan |
| view-of-delft | View of Delft | vermeer | baroque | "1660–1661" | Oil on canvas | Mauritshuis, The Hague | Mauritshuis open access / Commons hi-res |

Story leads: Emmaus' beardless Christ scandal; Jewish Bride — Van Gogh's "ten years of my life" quote; Prodigal Son as Rembrandt's last word, painted while bankrupt and bereaved; View of Delft as Proust's "most beautiful painting in the world" (the little patch of yellow wall).
Steps: source/verify images → write four work files → `npm run check && npm run build` → commit `feat(content): deepen the Baroque wing — 4 works`.

---

### Task 11: Artist: Jean-Honoré Fragonard (rococo-neoclassicism)

Artist entry: name "Jean-Honoré Fragonard", birth 1732, death 1806, period `rococo-neoclassicism`. Hook angle: painter of swings and stolen kisses who outlived his entire world — he died forgotten in Napoleon's Paris.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-swing | The Swing | "1767" | Oil on canvas | The Wallace Collection, London | Commons: post-2021-cleaning scan |
| the-bolt | The Bolt | "1777" | Oil on canvas | Musée du Louvre, Paris | Commons: RMN/GAP scan |
| a-young-girl-reading | A Young Girl Reading | "1776" | Oil on canvas | National Gallery of Art, Washington | NGA open access (CC0) direct download |

Portrait: Fragonard self-portrait (Commons; the c. 1760–1770 self-portrait) → `src/assets/portraits/fragonard.jpg`.
Story leads: The Swing's scandalous commission (the baron wanted a bishop pushing); The Bolt as Rococo's last gasp turning dangerous; Fragonard hired by David's intervention into the new Louvre museum.
Follow the New-artist task shape (Steps 1–5).

---

### Task 12: Artist: Jacques-Louis David (rococo-neoclassicism)

Artist entry: name "Jacques-Louis David", birth 1748, death 1825, period `rococo-neoclassicism`. Hook angle: the Revolution's official artist — he voted to execute the king, painted its martyrs, then crowned its emperor.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-death-of-marat | The Death of Marat | "1793" | Oil on canvas | Royal Museums of Fine Arts of Belgium, Brussels | Commons: hi-res scan |
| oath-of-the-horatii | Oath of the Horatii | "1784" | Oil on canvas | Musée du Louvre, Paris | Commons: RMN/GAP scan |
| napoleon-crossing-the-alps | Napoleon Crossing the Alps | "1801" | Oil on canvas | Château de Malmaison, Rueil-Malmaison | Commons: hi-res scan (Malmaison version) |

Portrait: Self-Portrait (1794, Louvre — painted in prison) → `src/assets/portraits/david.jpg`.
Story leads: Marat painted days after the assassination, the bathtub and the skin disease; Horatii as pre-Revolution thunderclap at the 1785 Salon; Napoleon's calm-horse fiction vs. Delaroche's mule.
Follow the New-artist task shape (Steps 1–5).

---

### Task 13: Artist: Gustave Courbet (realism)

Artist entry: name "Gustave Courbet", birth 1819, death 1877, period `realism`. Hook angle: "Show me an angel and I'll paint one" — the self-declared proudest man in France, who died in exile over a toppled column.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| a-burial-at-ornans | A Burial at Ornans | "1849–1850" | Oil on canvas | Musée d'Orsay, Paris | Commons: Orsay/GAP scan |
| the-desperate-man | The Desperate Man | "1843–1845" | Oil on canvas | Private collection | Commons: hi-res scan |
| the-artists-studio | The Artist's Studio | "1854–1855" | Oil on canvas | Musée d'Orsay, Paris | Commons: post-restoration Orsay scan |

Portrait: Nadar's photograph of Courbet (PD) → `src/assets/portraits/courbet.jpg`.
Story leads: Burial's ordinary funeral at history-painting scale enraging the 1850 Salon; The Desperate Man as the raging self-portrait he kept until death; the Studio rejected by the 1855 Exposition → Courbet builds his own Pavilion of Realism next door; the Vendôme Column and death in Swiss exile.
Follow the New-artist task shape (Steps 1–5).

---

### Task 14: Artist: Jean-François Millet (realism)

Artist entry: name "Jean-François Millet", birth 1814, death 1875, period `realism`. Hook angle: the farmer's son who painted peasants with the gravity of saints — and became Van Gogh's personal gospel.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-gleaners | The Gleaners | "1857" | Oil on canvas | Musée d'Orsay, Paris | Commons: Orsay/GAP scan |
| the-angelus | The Angelus | "1857–1859" | Oil on canvas | Musée d'Orsay, Paris | Commons: Orsay scan |
| the-sower | The Sower | "1850" | Oil on canvas | Museum of Fine Arts, Boston | Commons/MFA hi-res |

Portrait: Nadar's photograph of Millet (PD) → `src/assets/portraits/millet.jpg`.
Story leads: gleaning as legislated poverty and why the bourgeois press saw revolution in three bent backs; the Angelus' bidding war and Dalí's obsession (the buried coffin theory, confirmed by X-ray); Van Gogh copying The Sower twenty-plus times.
Follow the New-artist task shape (Steps 1–5).

---

### Task 15: Artist: Édouard Manet (realism)

Artist entry: name "Édouard Manet", birth 1832, death 1883, period `realism`. Hook angle: a well-dressed bourgeois who wanted medals and honors — and scandalized Paris more than any bohemian ever managed.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| olympia | Olympia | "1863" | Oil on canvas | Musée d'Orsay, Paris | Commons: Orsay/GAP scan |
| le-dejeuner-sur-lherbe | Le Déjeuner sur l'herbe | "1863" | Oil on canvas | Musée d'Orsay, Paris | Commons: Orsay/GAP scan |
| a-bar-at-the-folies-bergere | A Bar at the Folies-Bergère | "1882" | Oil on canvas | The Courtauld Gallery, London | Commons: GAP scan |

Portrait: Nadar's photograph of Manet (PD) → `src/assets/portraits/manet.jpg`.
Story leads: Olympia's guards protecting the canvas from umbrellas; Déjeuner at the Salon des Refusés with the Emperor's verdict; the Bar's impossible mirror painted by a dying man; Victorine Meurent in both scandals.
Follow the New-artist task shape (Steps 1–5).

---

### Task 16: Artist: Edgar Degas (impressionism)

Artist entry: name "Edgar Degas", birth 1834, death 1917, period `impressionism`. Hook angle: the Impressionist who hated the word, hated plein-air, hated fame — and saw modern life more sharply than any of them.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-ballet-class | The Ballet Class | "1871–1874" | Oil on canvas | Musée d'Orsay, Paris | Commons: Orsay/GAP scan |
| labsinthe | L'Absinthe | "1875–1876" | Oil on canvas | Musée d'Orsay, Paris | Commons: Orsay scan |
| the-tub | The Tub | "1886" | Pastel on card | Musée d'Orsay, Paris | Commons: Orsay scan |

Portrait: Self-portrait photograph or the 1855 painted Self-Portrait (Orsay) → `src/assets/portraits/degas.jpg`.
Story leads: the Opéra's petits rats and their "protectors" hovering in Degas' wings; L'Absinthe called "a blow in the eye" in London — both sitters were his friends playing roles; The Tub and the keyhole-view controversy at the last Impressionist show.
Follow the New-artist task shape (Steps 1–5).

---

### Task 17: Artist: Pierre-Auguste Renoir (impressionism)

Artist entry: name "Pierre-Auguste Renoir", birth 1841, death 1919, period `impressionism`. Hook angle: the porcelain painter's apprentice who spent fifty years painting happiness — and finished with brushes strapped to arthritic hands.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| dance-at-le-moulin-de-la-galette | Dance at Le Moulin de la Galette | "1876" | Oil on canvas | Musée d'Orsay, Paris | Commons: Orsay/GAP scan |
| luncheon-of-the-boating-party | Luncheon of the Boating Party | "1880–1881" | Oil on canvas | The Phillips Collection, Washington | Commons: hi-res scan |
| two-sisters-on-the-terrace | Two Sisters (On the Terrace) | "1881" | Oil on canvas | Art Institute of Chicago | AIC open access (CC0) direct download |

Portrait: Renoir photograph (PD, c. 1885) or Self-Portrait 1875 → `src/assets/portraits/renoir.jpg`.
Story leads: hauling the Moulin canvas up to Montmartre gardens between rain showers; the Boating Party as a who's-who of his circle (Aline with the dog — his future wife); the 1990 $78.1M Moulin de la Galette (smaller version) sale.
Follow the New-artist task shape (Steps 1–5).

---

### Task 18: Artist: Paul Cézanne (post-impressionism)

Artist entry: name "Paul Cézanne", birth 1839, death 1906, period `post-impressionism`. Hook angle: the banker's son who fled Paris, painted one mountain for twenty years, and quietly rebuilt painting from apples.

| slug | title | year | medium | location | source hint |
|---|---|---|---|---|---|
| the-card-players | The Card Players | "1890–1895" | Oil on canvas | Musée d'Orsay, Paris | Commons: Orsay scan (Orsay version) |
| the-basket-of-apples | The Basket of Apples | "1893" | Oil on canvas | Art Institute of Chicago | AIC open access (CC0) direct download |
| mont-sainte-victoire | Mont Sainte-Victoire with a Large Pine | "1887" | Oil on canvas | The Courtauld Gallery, London | Commons: GAP scan |

Portrait: Cézanne photograph (PD) or Self-Portrait c. 1875 (Orsay) → `src/assets/portraits/cezanne.jpg`.
Story leads: a Card Players version selling for ~$250M to Qatar (record at the time); "with an apple I will astonish Paris"; the Zola friendship destroyed by *L'Œuvre*; painting in the rain a month before his death.
Follow the New-artist task shape (Steps 1–5).

---

### Task 19: Deepen Impressionism & Post-Impressionism (+4 works)

| slug | title | artist | period | year | medium | location | source hint |
|---|---|---|---|---|---|---|---|
| rouen-cathedral-west-facade-sunlight | Rouen Cathedral, West Façade, Sunlight | monet | impressionism | "1894" | Oil on canvas | National Gallery of Art, Washington | NGA open access (CC0) direct download |
| stacks-of-wheat-end-of-summer | Stacks of Wheat (End of Summer) | monet | impressionism | "1890–1891" | Oil on canvas | Art Institute of Chicago | AIC open access (CC0) direct download |
| irises | Irises | van-gogh | post-impressionism | "1889" | Oil on canvas | J. Paul Getty Museum, Los Angeles | Getty Open Content direct download |
| cafe-terrace-at-night | Café Terrace at Night | van-gogh | post-impressionism | "1888" | Oil on canvas | Kröller-Müller Museum, Otterlo | Commons: hi-res scan |

Story leads: Monet renting rooms opposite the cathedral, thirty canvases, "everything changes, even stone"; the haystack series selling out and Kandinsky's Moscow epiphany; Irises painted his first week inside the Saint-Rémy asylum, later the first $50M painting; Café Terrace as the first starry-sky canvas, never signed but referenced in his letters.
Steps: source/verify → write four files → `npm run check && npm run build` → commit `feat(content): deepen Impressionism & Post-Impressionism — 4 works`.

---

### Task 20: Deepen Romanticism & Renaissance (+5 works)

| slug | title | artist | period | year | medium | location | source hint |
|---|---|---|---|---|---|---|---|
| the-dog | The Dog | goya | romanticism | "1819–1823" | Oil on plaster transferred to canvas | Museo del Prado, Madrid | Commons: Prado scan |
| the-slave-ship | The Slave Ship | turner | romanticism | "1840" | Oil on canvas | Museum of Fine Arts, Boston | Commons/MFA hi-res |
| women-of-algiers | Women of Algiers in their Apartment | delacroix | romanticism | "1834" | Oil on canvas | Musée du Louvre, Paris | Commons: RMN/GAP scan |
| the-mystical-nativity | The Mystical Nativity | botticelli | renaissance | "1500" | Oil on canvas | The National Gallery, London | Commons: GAP scan |
| ginevra-de-benci | Ginevra de' Benci | leonardo-da-vinci | renaissance | "1474–1478" | Oil on panel | National Gallery of Art, Washington | NGA open access (CC0) direct download |

Story leads: The Dog as the barest Black Painting — a head, a void; Slave Ship and the Zong massacre, Ruskin owning then offloading it; Delacroix talked into an Algiers harem visit in 1832; Mystical Nativity's Greek doomsday inscription (his only signed-and-dated work); Ginevra as the only Leonardo in the Americas, bought from Liechtenstein for a record $5M.
Steps: source/verify → write five files → `npm run check && npm run build` → commit `feat(content): deepen Romanticism & Renaissance — 5 works`.

---

### Task 21: Whole-museum verification

**Files:** none created; fixes only if issues found.

- [ ] Step 1: Counts: `ls src/content/periods | wc -l` → 8; `ls src/content/artists | grep -v TEMPLATE | wc -l` → 26; `ls src/content/works | wc -l` → 91. (`src/content/TEMPLATE.md` lives outside the collections.)
- [ ] Step 2: `npm run check` → all green; `npm run build` → 128 pages (1 home + 8 periods + 1 periods index + 26 artists + 1 artists index + 91 works). Adjust expectation to actual page arithmetic if an index page differs — the point is: build green, page count matches content count.
- [ ] Step 3: Serve `dist` and click through: periods ledger chronological 8 rows; each new period page has essay + featured vertical work + grid; 3 spot-check new work pages read well and images are sharp when zoomed; homepage walk = daily + 24 rooms ending in walk-end label.
- [ ] Step 4: Spot-check 5 random new images: `sips -g pixelWidth -g pixelHeight` ≥2500 long edge (the check script already enforces this — this is belt-and-braces on the right files being referenced).
- [ ] Step 5: Commit any fixes: `fix(content): verification sweep`.

---

## Self-review notes

- Spec coverage: 3 new periods (T1), 16 new artists (T2–T9, T11–T18), 13 deepening works (T10 +4, T19 +4, T20 +5), walk cap + renumber + empty-period guard (T1), verification (T21). 48 + 13 = 61 new works; 30 + 61 = 91. ✓
- The empty-period-grid crash guard (T1 note) is required because Task 1 creates periods with zero works — discovered during planning, fixed in-plan. ✓
- Slugs use plain ASCII (durer, labsinthe, le-dejeuner-sur-lherbe, cafe-terrace-at-night). ✓
- All frontmatter field names match `src/content.config.ts` exactly. ✓
