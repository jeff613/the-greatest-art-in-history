# The Greatest Art in History — Virtual Gallery Design

Date: 2026-07-12
Status: Approved pending user review

## Purpose

A personal virtual gallery website for Jeff and friends to learn the great artists
and their works, from the Old Masters through Post-Impressionism. The site is built
around **storytelling** — the history and human drama behind each artwork — not
technique analysis. V1 runs locally; deployment and a mobile app may come later.
The pilot starts small to get the UX right; the collection and roster will expand
substantially after the pilot.

## Scope (v1)

- **Language:** English only.
- **Periods:** Renaissance → Post-Impressionism. No modern art (may be added later).
- **Collection:** 10 artists × 3 works = 30 artworks.
- **Hosting:** local only (`npm run dev` / `npm run preview`). Architecture must make
  later deployment to any static host a one-step change.
- **Out of scope for v1:** user accounts, favorites, comments, search, multi-language,
  mobile app, CMS/admin UI.

## Starter roster

| Period | Artists |
|---|---|
| Renaissance | Leonardo da Vinci, Botticelli |
| Baroque & Dutch Golden Age | Caravaggio, Rembrandt, Vermeer |
| Romanticism | Goya, Turner, Delacroix |
| Impressionism | Monet |
| Post-Impressionism | Van Gogh |

Three signature works per artist, chosen for fame and story richness. Exact work
list is finalized during implementation, subject to the image-quality bar below.

## Content model

Content lives as markdown files with typed frontmatter (Astro content collections).

### Artwork (`src/content/works/*.md`)

Frontmatter: `title`, `slug`, `artist` (ref), `period` (ref), `year` (display string),
`medium`, `location` (museum, city), `image` (local path), `imageSource` (URL),
`imageLicense`, `teaser` (one enticing line for the homepage/grids).

Body sections (in order):

1. **The Story** — why it was painted; the drama of its creation and reception.
2. **The World Behind It** — historical context: politics, society, the artist's city.
3. **The Artist at This Moment** — where the artist was in life when making it.
4. **Interesting Facts** — short punchy bullets (thefts, scandals, hidden details).

No technique-analysis section; technique appears only when it serves a story.

### Artist (`src/content/artists/*.md`)

Frontmatter: `name`, `slug`, `birth`, `death`, `period` (primary), `portrait`
(local path + source/license), `hook` (one-line grid caption, e.g. "The murderer
who invented dramatic light").

Body: life story written as a short biography (narrative, not a Wikipedia dump)
plus a compact timeline of key life events.

### Period (`src/content/periods/*.md`)

Frontmatter: `name`, `slug`, `order` (chronological sort), `years` (display string).
Body: a short, story-driven introduction to the era.

Periods (order): Renaissance, Baroque & Dutch Golden Age, Romanticism,
Impressionism, Post-Impressionism.

Content is researched and written by Claude; Jeff reviews and edits.

## Image sourcing (first-class requirement)

Image quality is critical — no bad or low-res reproductions.

- **Source priority:** (1) museum open-access originals — Rijksmuseum, Met Open
  Access, Art Institute of Chicago (IIIF), National Gallery London/Washington,
  and the owning museum generally; (2) Google Art Project scans hosted on
  Wikimedia Commons (often gigapixel); (3) other Wikimedia Commons scans as
  last resort.
- **Quality floor:** minimum ~2500px on the long edge for the master file; each
  image is checked after download for resolution and obvious defects (frame
  glare, moiré, heavy color cast) before acceptance. If no acceptable scan
  exists for a work, substitute a different work by the same artist.
- **Provenance:** every image records its source URL and license in frontmatter
  so scans can be re-fetched or upgraded later.
- **Storage:** master images live in the repo (`src/assets/art/`); Astro's image
  pipeline generates responsive sizes at build time so pages stay fast while
  full-screen zoom uses the high-res master. All images are public domain.

## Pages & UX

**Design direction — "quiet luxury museum":** generous whitespace; near-black or
warm off-white backgrounds that let paintings dominate; classic serif for headings
(gallery wall-text feel) with a restrained sans-serif for body; no dashboard-style
cards or clutter; subtle slow transitions; the artwork image is always the hero.
Reference feel: Rijksmuseum website, Phaidon art books. Responsive — works well
on phone and desktop.

1. **Home (`/`)** — Artwork of the Day fills the viewport: painting, title, artist,
   the `teaser` line, "Read the story →". Below: a "Surprise me" shuffle button and
   quiet links to Artists and Periods.
2. **Artists index (`/artists`)** — portrait grid: name, dates, `hook` line.
3. **Artist page (`/artists/<slug>`)** — portrait, biography-as-story, timeline,
   grid of their works in the collection.
4. **Periods (`/periods`, `/periods/<slug>`)** — index lists eras chronologically;
   each period page has its intro and a gallery grid of its artworks.
5. **Artwork page (`/works/<slug>`)** — image first (click for full-screen zoom),
   quick-facts bar (year, period, medium, location), the four story sections, then
   "Next artwork" navigation so browsing never dead-ends.

## Architecture

- **Framework:** Astro static site, content collections with zod-typed frontmatter.
  Invalid metadata (missing image, bad artist/period reference) fails the build.
- **Artwork of the Day:** small client-side script hashes today's date to an index
  over the works list — same pick for everyone all day, no server. "Surprise me"
  picks randomly, never repeating the currently shown work.
- **Full-screen zoom:** lightweight client-side image viewer on artwork pages.
- **No database, no backend, no auth.** JavaScript only where interaction requires
  it (daily pick, shuffle, zoom).
- **Adding content later:** one markdown file + one image per new work;
  `src/content/TEMPLATE.md` documents the format so additions stay consistent.

## Error handling & testing

- Astro build is the primary gate: it validates frontmatter schemas, internal
  links, and image references at build time.
- A small check script verifies every work references an existing artist and
  period, every referenced image file exists, and every master image meets the
  resolution floor.
- Manual UX review by Jeff is the acceptance test for the pilot.

## Future (explicitly deferred)

Roster/collection expansion (post-pilot priority), deployment to a public host,
modern-art periods if desired, search, favorites, multi-language, mobile app.
The markdown content model is the stable asset all of these build on.
