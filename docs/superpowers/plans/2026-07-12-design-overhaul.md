# Design Overhaul Implementation Plan — "The Dimmed Gallery and the Reading Room"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the virtual gallery into an immersive, White Cube-inspired presentation: full-bleed Artwork of the Day homepage, floating header, dark image rooms alternating with warm paper reading rooms.

**Architecture:** Presentation layer only — 9 files (global CSS, Base layout, 5 pages, ArtworkCard). Content collections, schemas, URLs, the check script, and all markdown/images are untouched. Astro's ClientRouter adds crossfade page transitions; all page scripts re-initialize via the `astro:page-load` event.

**Tech Stack:** Astro 7, plain CSS (no framework), Cormorant Garamond + Inter (already installed).

**Spec:** `docs/superpowers/specs/2026-07-12-design-overhaul-design.md`

## Global Constraints

- Two rooms: imagery on near-black `#121010`; long-form text on warm paper `#f6f3ec`. No solid header bar anywhere.
- Floating header on every page: wordmark `THE GREATEST ART` centered (uppercase, wide tracking), `Artists` left, `Periods` right. Chalk text over dark, ink over paper.
- Type: Cormorant Garamond display — *italic only for artwork titles over imagery*, roman for artist/period names; display up to ~5rem via clamp. Kickers ~0.7rem uppercase, letter-spacing ≥0.2em. Paper body ≥1.0625rem, line-height ≥1.8, ~42rem measure.
- Accent `#8a6d3b` (gilt) only for rules, links, kickers.
- Thumbnails show TRUE aspect ratio — no cropping.
- Motion: image fade-ins ~1.2s; caption rise ~8px; hover brighten ~2–3% over ~400ms; view-transition crossfades. Everything off under `prefers-reduced-motion: reduce`. Animate opacity/transform only (no layout shift).
- "Surprise me"/shuffle: DELETED. Daily pick algorithm unchanged (local-date hash). JSON embed keeps the `.replace(/</g, '\\u003c')` escaping.
- Gate for every task: `npm run build` passes (48 pages); `npm run check` stays green (content untouched).

## File Structure

```
src/styles/global.css        (Task 1)  full rewrite: tokens, header, rooms, type, grid, motion
src/layouts/Base.astro       (Task 1)  floating header, ClientRouter, `bare` prop, quiet footer
src/pages/index.astro        (Task 2)  full-bleed daily artwork, wall label, no shuffle
src/pages/works/[slug].astro (Task 3)  dark room → reading room → dark close; facts line
src/components/ArtworkCard.astro (Task 4)  uncropped
src/pages/artists/index.astro    (Task 4)  paper page, upgraded grid
src/pages/artists/[slug].astro   (Task 4)  dark hero → paper bio/works
src/pages/periods/index.astro    (Task 5)  ledger, upgraded scale
src/pages/periods/[slug].astro   (Task 5)  italic lede + grid
```

Interim note: after Task 1, pages not yet migrated may look rough (e.g. old homepage buttons lose styling) — that's expected; the build must still pass at every step.

---

### Task 1: Foundations — global.css rewrite + Base layout

**Files:**
- Modify: `src/styles/global.css` (full replacement)
- Modify: `src/layouts/Base.astro` (full replacement)

**Interfaces:**
- Produces (all later tasks depend on these exact names): CSS classes `.kicker`, `.display`, `.display.italic`, `.byline`, `.prose`, `.lede`, `.reading-room`, `.grid`, `.card`, `.page-head`, `.facts-line`, `.read-link`, `.anim-rise`, `.wall-label`, `.scrim`, `.noscript-home`; CSS vars `--room --paper --ink --chalk --muted --muted-room --line --line-room --gilt --serif --sans --measure --pad`; Base props `{ title?: string, dark?: boolean, bare?: boolean }` (bare = no footer).

- [ ] **Step 1: Replace `src/styles/global.css` entirely with:**

```css
/* ---------- tokens ---------- */
:root {
  --room: #121010;
  --paper: #f6f3ec;
  --ink: #211e1a;
  --chalk: #ece7dd;
  --muted: #6f6a61;
  --muted-room: #8f8779;
  --line: #e2dccf;
  --line-room: #2a2521;
  --gilt: #8a6d3b;
  --serif: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --sans: 'Inter', system-ui, sans-serif;
  --measure: 42rem;
  --pad: clamp(1.25rem, 4vw, 3.5rem);
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 1.0625rem;
  line-height: 1.8;
  -webkit-font-smoothing: antialiased;
}

body.dark { background: var(--room); color: var(--chalk); }

h1, h2, h3 {
  font-family: var(--serif);
  font-weight: 500;
  line-height: 1.1;
  margin: 0 0 0.5rem;
}

a { color: inherit; text-decoration: none; }
.prose a { border-bottom: 1px solid var(--gilt); }

img { max-width: 100%; height: auto; display: block; }

/* ---------- floating header ---------- */
.site-header {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: baseline;
  gap: 1rem;
  padding: 1.7rem var(--pad);
  color: var(--ink);
}
body.dark .site-header { color: var(--chalk); }

.wordmark {
  font-family: var(--sans);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;
}

.site-header nav { display: contents; }
.site-header .nav-left  { justify-self: start; }
.site-header .nav-right { justify-self: end; }
.site-header .nav-left, .site-header .nav-right {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  opacity: 0.85;
  transition: opacity 0.4s ease;
}
.site-header .nav-left:hover, .site-header .nav-right:hover { opacity: 1; }

/* ---------- type roles ---------- */
.kicker {
  font-family: var(--sans);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  color: var(--gilt);
  margin: 0 0 0.9rem;
}

.display {
  font-family: var(--serif);
  font-weight: 500;
  font-style: normal;
  font-size: clamp(2.4rem, 6.5vw, 5rem);
  line-height: 1.04;
  margin: 0 0 0.6rem;
}
.display.italic { font-style: italic; }

.byline {
  font-family: var(--sans);
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  color: inherit;
  opacity: 0.75;
  margin: 0;
}

.read-link {
  display: inline-block;
  margin-top: 1.4rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  border-bottom: 1px solid var(--gilt);
  padding-bottom: 0.35rem;
  transition: opacity 0.4s ease;
}
.read-link:hover { opacity: 0.7; }

/* ---------- rooms ---------- */
.reading-room {
  background: var(--paper);
  color: var(--ink);
  padding: 4.5rem 0 5rem;
}

.prose {
  max-width: var(--measure);
  margin: 0 auto;
  padding: 0 1.25rem;
}
.prose h2 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-top: 3.2rem;
  padding-top: 1.6rem;
}
.prose h2::before {
  content: '';
  display: block;
  width: 3rem;
  border-top: 1px solid var(--gilt);
  margin-bottom: 1.6rem;
}
.prose li { margin-bottom: 0.6rem; }

.lede p {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(1.3rem, 2.4vw, 1.65rem);
  line-height: 1.55;
}

.page-head {
  padding: 8.5rem var(--pad) 1rem;
  max-width: 56rem;
}

/* ---------- facts line (artwork quick facts) ---------- */
.facts-line {
  text-align: center;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  color: var(--muted-room);
  border-top: 1px solid var(--line-room);
  border-bottom: 1px solid var(--line-room);
  padding: 1.3rem var(--pad);
  margin: 2.5rem 0 0;
}
.facts-line a { border-bottom: 1px solid var(--gilt); }

/* ---------- grid & cards (uncropped, matted) ---------- */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 3.5rem 2.5rem;
  align-items: start;
  padding: 2.5rem var(--pad) 5.5rem;
}

.card img {
  width: 100%;
  height: auto;
  transition: filter 0.4s ease;
}
.card:hover img { filter: brightness(1.03); }
.card h3 {
  font-size: 1.35rem;
  margin: 1rem 0 0.15rem;
}
.card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.55;
}
.card .hook { font-family: var(--serif); font-style: italic; font-size: 1rem; margin-top: 0.35rem; }

/* ---------- footer ---------- */
.site-footer {
  padding: 2.6rem var(--pad);
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-align: center;
}
body.dark .site-footer { border-color: var(--line-room); color: var(--muted-room); }
.site-footer p { margin: 0; }

/* ---------- home: full-bleed daily artwork ---------- */
.daily-hero { position: relative; height: 100svh; }
.daily-bg { position: absolute; inset: 0; display: block; cursor: pointer; }
.daily-bg img { width: 100%; height: 100%; object-fit: cover; }
.scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to top, rgba(10, 8, 7, 0.72) 0%, rgba(10, 8, 7, 0.28) 26%, rgba(10, 8, 7, 0) 52%),
    linear-gradient(to bottom, rgba(10, 8, 7, 0.38) 0%, rgba(10, 8, 7, 0) 18%);
}
.wall-label {
  position: absolute;
  left: var(--pad);
  bottom: clamp(2rem, 7vh, 4.5rem);
  z-index: 2;
  max-width: min(46rem, 88vw);
  color: var(--chalk);
  pointer-events: none;
}
.wall-label a { pointer-events: auto; }

.noscript-home {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-content: center;
  text-align: center;
  background: var(--room);
  color: var(--chalk);
}
.noscript-home a { border-bottom: 1px solid var(--gilt); }

/* ---------- motion (opt-in via reduced-motion: no-preference) ---------- */
#daily-img { opacity: 1; }
@media (prefers-reduced-motion: no-preference) {
  #daily-img { opacity: 0; transition: opacity 1.2s ease-out; }
  #daily-img.is-loaded { opacity: 1; }
  .anim-rise { animation: rise 0.9s ease-out 0.35s both; }
  .anim-rise-2 { animation: rise 0.9s ease-out 0.55s both; }
}
@keyframes rise {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Replace `src/layouts/Base.astro` entirely with:**

```astro
---
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '../styles/global.css';
import { ClientRouter } from 'astro:transitions';

interface Props {
  title?: string;
  dark?: boolean;
  bare?: boolean;
}
const { title = 'The Greatest Art in History', dark = false, bare = false } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
    <ClientRouter />
  </head>
  <body class:list={[{ dark }]}>
    <header class="site-header">
      <a class="nav-left" href="/artists/">Artists</a>
      <a class="wordmark" href="/">The Greatest Art</a>
      <a class="nav-right" href="/periods/">Periods</a>
    </header>
    <main><slot /></main>
    {!bare && (
      <footer class="site-footer">
        <p>A personal gallery of public-domain masterpieces · images courtesy of museum open-access programs and Wikimedia Commons</p>
      </footer>
    )}
  </body>
</html>
```

Note: `ClientRouter` is imported from `astro:transitions` (Astro 5+ name; verify it exists in the installed Astro 7 — if the import fails at build, check `node_modules/astro/dist/transitions` for the current export name and report the deviation).

- [ ] **Step 3: Build**

Run: `npm run check && npm run build`
Expected: ✓ checks pass; 48 pages build. (Old pages still reference `.button`/`.ghost`/old `.art-hero` etc. — scoped styles keep working; unstyled interim buttons on the old homepage are expected until Task 2.)

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/layouts/Base.astro
git commit -m "feat(design): tokens, floating header, rooms, motion foundations"
```

---

### Task 2: Homepage — full-bleed Artwork of the Day

**Files:**
- Modify: `src/pages/index.astro` (full replacement)

**Interfaces:**
- Consumes: `.daily-hero .daily-bg .scrim .wall-label .kicker .display.italic .byline .read-link .anim-rise .anim-rise-2 .noscript-home #daily-img` from Task 1; Base props `bare`, `dark`.

- [ ] **Step 1: Replace `src/pages/index.astro` entirely with:**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import Base from '../layouts/Base.astro';

const works = await getCollection('works');
const entries = await Promise.all(
  works
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(async (work) => {
      const artist = await getEntry(work.data.artist);
      const hero = await getImage({ src: work.data.image, width: 2400, format: 'webp' });
      return {
        slug: work.id,
        title: work.data.title,
        artist: artist.data.name,
        year: work.data.year,
        src: hero.src,
      };
    })
);
---

<Base dark bare>
  <section class="daily-hero">
    <a id="daily-link" class="daily-bg" href="/artists/" aria-label="Read the story of today's artwork">
      <img id="daily-img" alt="" />
      <span class="scrim"></span>
    </a>
    <div class="wall-label">
      <p class="kicker anim-rise" id="daily-kicker">Artwork of the Day</p>
      <h1 class="display italic anim-rise" id="daily-title"></h1>
      <p class="byline anim-rise-2" id="daily-byline"></p>
      <a class="read-link anim-rise-2" id="daily-read" href="/artists/">Read the story →</a>
    </div>
    <noscript>
      <div class="noscript-home">
        <p class="wordmark">The Greatest Art</p>
        <p><a href="/artists/">Artists</a> · <a href="/periods/">Periods</a></p>
      </div>
    </noscript>
  </section>

  <script type="application/json" id="works-data" set:html={JSON.stringify(entries).replace(/</g, '\\u003c')} />
</Base>

<script>
  type Entry = { slug: string; title: string; artist: string; year: string; src: string };

  function initDaily(): void {
    const dataEl = document.getElementById('works-data');
    if (!dataEl) return; // navigated to a non-home page
    const data: Entry[] = JSON.parse(dataEl.textContent!);

    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    let hash = 0;
    for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    const entry = data[hash % data.length];

    const img = document.getElementById('daily-img') as HTMLImageElement;
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    img.src = entry.src;
    img.alt = `${entry.title} by ${entry.artist}`;
    if (img.complete) img.classList.add('is-loaded');

    const dateLabel = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    document.getElementById('daily-kicker')!.textContent = `Artwork of the Day — ${dateLabel}`;
    document.getElementById('daily-title')!.textContent = entry.title;
    document.getElementById('daily-byline')!.textContent = `${entry.artist}, ${entry.year}`;
    const url = `/works/${entry.slug}/`;
    (document.getElementById('daily-link') as HTMLAnchorElement).href = url;
    (document.getElementById('daily-read') as HTMLAnchorElement).href = url;
  }

  document.addEventListener('astro:page-load', initDaily);
</script>
```

- [ ] **Step 2: Build and inspect**

Run: `npm run build`
Expected: PASS. Inspect `dist/index.html`: no `shuffle`/`Surprise` strings anywhere; `works-data` JSON has 30 entries each with exactly `slug,title,artist,year,src` (no `teaser`); wall-label skeleton and noscript block present; a module script registering `astro:page-load` present.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(design): full-bleed artwork-of-the-day homepage, remove shuffle"
```

---

### Task 3: Artwork page — dark room, reading room, dark close

**Files:**
- Modify: `src/pages/works/[slug].astro` (full replacement)

**Interfaces:**
- Consumes: `.display.italic .byline .facts-line .reading-room .prose .kicker` from Task 1.
- Unchanged behavior: `getStaticPaths` route shape, lightbox zoom, next-artwork cycle.

- [ ] **Step 1: Replace `src/pages/works/[slug].astro` entirely with:**

```astro
---
import { getCollection, getEntry, render } from 'astro:content';
import { Image, getImage } from 'astro:assets';
import Base from '../../layouts/Base.astro';

export async function getStaticPaths() {
  const works = await getCollection('works');
  return works.map((work) => ({ params: { slug: work.id }, props: { work } }));
}

const { work } = Astro.props;
const artist = await getEntry(work.data.artist);
const period = await getEntry(work.data.period);
const { Content } = await render(work);

const fullRes = await getImage({ src: work.data.image, format: 'jpeg' });

const all = (await getCollection('works')).sort((a, b) => a.id.localeCompare(b.id));
const index = all.findIndex((w) => w.id === work.id);
const next = all[(index + 1) % all.length];
---

<Base title={`${work.data.title} — ${artist.data.name}`} dark>
  <section class="art-hero">
    <button class="zoom-open" aria-label="View full screen">
      <Image
        src={work.data.image}
        widths={[800, 1400, 2000]}
        sizes="100vw"
        alt={work.data.title}
      />
    </button>
    <h1 class="display italic">{work.data.title}</h1>
    <p class="byline">
      <a href={`/artists/${artist.id}/`}>{artist.data.name}</a>, {work.data.year}
    </p>
  </section>

  <p class="facts-line">
    {work.data.year} · <a href={`/periods/${period.id}/`}>{period.data.name}</a> · {work.data.medium} · {work.data.location}
  </p>

  <dialog class="lightbox">
    <img src={fullRes.src} alt={work.data.title} loading="lazy" />
    <button class="zoom-close" aria-label="Close full screen view">×</button>
  </dialog>

  <div class="reading-room">
    <article class="prose">
      <Content />
    </article>
  </div>

  <nav class="next-work">
    <a href={`/works/${next.id}/`}>
      <span class="kicker">Next artwork</span>
      <span class="next-title">{next.data.title} →</span>
    </a>
  </nav>
</Base>

<style>
  .art-hero {
    padding: 7rem var(--pad) 0;
    text-align: center;
  }
  .art-hero :global(img) {
    max-height: 76vh;
    width: auto;
    max-width: 100%;
    margin: 0 auto 2.4rem;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  }
  .zoom-open { background: none; border: none; padding: 0; cursor: zoom-in; width: 100%; }
  .art-hero .byline a { border-bottom: 1px solid var(--gilt); }

  .lightbox {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    border: none;
    background: #000;
  }
  .lightbox img { width: 100%; height: 100%; object-fit: contain; cursor: zoom-out; }
  .zoom-close {
    position: fixed;
    top: 1rem;
    right: 1.25rem;
    font-size: 2rem;
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
  }

  .next-work { text-align: center; padding: 4.5rem 1rem 5.5rem; }
  .next-work .kicker { display: block; }
  .next-title { font-family: var(--serif); font-size: clamp(1.4rem, 3vw, 1.9rem); font-style: italic; }
</style>

<script>
  function initZoom(): void {
    const dialog = document.querySelector<HTMLDialogElement>('.lightbox');
    if (!dialog) return;
    document.querySelector('.zoom-open')?.addEventListener('click', () => dialog.showModal());
    document.querySelector('.zoom-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || (e.target as HTMLElement).tagName === 'IMG') dialog.close();
    });
  }
  document.addEventListener('astro:page-load', initZoom);
</script>
```

- [ ] **Step 2: Build and inspect**

Run: `npm run build`
Expected: PASS. Inspect `dist/works/the-starry-night/index.html`: `facts-line` contains `1889 ·` and links to `/periods/post-impressionism/`; `reading-room` div wraps the four `<h2>` story sections; old `.quick-facts` markup gone; lightbox + next-work present.

- [ ] **Step 3: Commit**

```bash
git add src/pages/works
git commit -m "feat(design): artwork page — dark room, facts line, paper reading room"
```

---

### Task 4: Cards + artist pages

**Files:**
- Modify: `src/components/ArtworkCard.astro` (full replacement)
- Modify: `src/pages/artists/index.astro` (full replacement)
- Modify: `src/pages/artists/[slug].astro` (full replacement)

**Interfaces:**
- Consumes: `.grid .card .hook .kicker .display .reading-room .prose .page-head` from Task 1; ArtworkCard keeps props `{ work, artistName }`.

- [ ] **Step 1: Replace `src/components/ArtworkCard.astro` entirely with:**

```astro
---
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';

interface Props {
  work: CollectionEntry<'works'>;
  artistName: string;
}
const { work, artistName } = Astro.props;
---

<a class="card" href={`/works/${work.id}/`}>
  <Image
    src={work.data.image}
    widths={[400, 800]}
    sizes="(min-width: 700px) 400px, 100vw"
    alt={`${work.data.title} by ${artistName}`}
  />
  <h3>{work.data.title}</h3>
  <p>{artistName}, {work.data.year}</p>
</a>
```

(The only change from the current file: no more `aspect-ratio`/`object-fit` cropping — that lived in global.css `.card img`, already replaced in Task 1. The component markup loses nothing but gains true-aspect rendering.)

- [ ] **Step 2: Replace `src/pages/artists/index.astro` entirely with:**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import { Image } from 'astro:assets';
import Base from '../../layouts/Base.astro';

const artists = await getCollection('artists');
const withPeriod = await Promise.all(
  artists.map(async (artist) => ({
    artist,
    period: await getEntry(artist.data.period),
  }))
);
withPeriod.sort(
  (a, b) => a.period.data.order - b.period.data.order || a.artist.data.birth - b.artist.data.birth
);
---

<Base title="Artists — The Greatest Art in History">
  <div class="page-head">
    <p class="kicker">The Artists</p>
    <h1 class="display">Ten lives that changed how we see.</h1>
  </div>
  <div class="grid">
    {withPeriod.map(({ artist }) => (
      <a class="card" href={`/artists/${artist.id}/`}>
        <Image
          src={artist.data.portrait}
          widths={[400, 800]}
          sizes="(min-width: 700px) 400px, 100vw"
          alt={`Portrait of ${artist.data.name}`}
        />
        <h3>{artist.data.name}</h3>
        <p>{artist.data.birth}–{artist.data.death}</p>
        <p class="hook">{artist.data.hook}</p>
      </a>
    ))}
  </div>
</Base>
```

- [ ] **Step 3: Replace `src/pages/artists/[slug].astro` entirely with:**

```astro
---
import { getCollection, getEntry, render } from 'astro:content';
import { Image } from 'astro:assets';
import Base from '../../layouts/Base.astro';
import ArtworkCard from '../../components/ArtworkCard.astro';

export async function getStaticPaths() {
  const artists = await getCollection('artists');
  return artists.map((artist) => ({ params: { slug: artist.id }, props: { artist } }));
}

const { artist } = Astro.props;
const period = await getEntry(artist.data.period);
const { Content } = await render(artist);
const works = (await getCollection('works', (w) => w.data.artist.id === artist.id)).sort(
  (a, b) => a.data.year.localeCompare(b.data.year)
);
---

<Base title={`${artist.data.name} — The Greatest Art in History`} dark>
  <section class="artist-hero">
    <Image
      src={artist.data.portrait}
      widths={[400, 800]}
      sizes="320px"
      alt={`Portrait of ${artist.data.name}`}
    />
    <div>
      <p class="kicker">{period.data.name} · {artist.data.birth}–{artist.data.death}</p>
      <h1 class="display">{artist.data.name}</h1>
      <p class="artist-hook">{artist.data.hook}</p>
    </div>
  </section>

  <div class="reading-room">
    <article class="prose">
      <Content />
    </article>

    <section class="timeline prose">
      <h2>Life in brief</h2>
      <ul>
        {artist.data.timeline.map((item) => (
          <li><strong>{item.year}</strong> — {item.event}</li>
        ))}
      </ul>
    </section>

    <section class="collection-band">
      <p class="kicker">In the collection</p>
      <div class="grid">
        {works.map((work) => (
          <ArtworkCard work={work} artistName={artist.data.name} />
        ))}
      </div>
    </section>
  </div>
</Base>

<style>
  .artist-hero {
    display: flex;
    flex-wrap: wrap;
    gap: 3rem;
    align-items: flex-end;
    padding: 8rem var(--pad) 3.5rem;
  }
  .artist-hero :global(img) {
    width: min(260px, 60vw);
    height: auto;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  }
  .artist-hook {
    font-family: var(--serif);
    font-style: italic;
    font-size: clamp(1.15rem, 2vw, 1.45rem);
    color: var(--muted-room);
    max-width: 30rem;
    margin: 0.4rem 0 0;
  }
  .timeline ul { list-style: none; padding: 0; }
  .timeline li {
    border-left: 1px solid var(--gilt);
    padding-left: 1.25rem;
    margin-bottom: 0.9rem;
  }
  .collection-band { padding-top: 3.5rem; }
  .collection-band .kicker { text-align: center; }
</style>
```

- [ ] **Step 4: Build and inspect**

Run: `npm run build`
Expected: PASS. Inspect `dist/artists/van-gogh/index.html`: `artist-hero` on dark with kicker/display name/italic hook, `reading-room` wraps bio + timeline + works grid. `dist/artists/index.html`: `page-head` + `display` headline, cards with `hook` lines, no aspect-crop styles anywhere.

- [ ] **Step 5: Commit**

```bash
git add src/components/ArtworkCard.astro src/pages/artists
git commit -m "feat(design): uncropped cards, artist hero and paper bio treatment"
```

---

### Task 5: Period pages

**Files:**
- Modify: `src/pages/periods/index.astro` (full replacement)
- Modify: `src/pages/periods/[slug].astro` (full replacement)

**Interfaces:**
- Consumes: `.page-head .kicker .display .lede .prose .grid` from Task 1; ArtworkCard `{ work, artistName }`.

- [ ] **Step 1: Replace `src/pages/periods/index.astro` entirely with:**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';

const periods = (await getCollection('periods')).sort(
  (a, b) => a.data.order - b.data.order
);
const works = await getCollection('works');
const countByPeriod = new Map<string, number>();
for (const w of works) {
  countByPeriod.set(w.data.period.id, (countByPeriod.get(w.data.period.id) ?? 0) + 1);
}
---

<Base title="Periods — The Greatest Art in History">
  <div class="page-head">
    <p class="kicker">The Periods</p>
    <h1 class="display">Five hundred years, five revolutions.</h1>
  </div>
  <ol class="period-list">
    {periods.map((period) => (
      <li>
        <a href={`/periods/${period.id}/`}>
          <span class="years">{period.data.years}</span>
          <span class="name">{period.data.name}</span>
          <span class="count">{countByPeriod.get(period.id) ?? 0} works →</span>
        </a>
      </li>
    ))}
  </ol>
</Base>

<style>
  .period-list {
    list-style: none;
    margin: 0;
    padding: 1.5rem var(--pad) 6rem;
  }
  .period-list li { border-top: 1px solid var(--line); }
  .period-list li:last-child { border-bottom: 1px solid var(--line); }
  .period-list a {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 1.5rem;
    padding: 2.2rem 0;
  }
  .period-list a:hover .name { color: var(--gilt); }
  .years {
    color: var(--muted);
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    min-width: 10rem;
  }
  .name {
    font-family: var(--serif);
    font-weight: 500;
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    line-height: 1.1;
    flex: 1;
    transition: color 0.4s ease;
  }
  .count { color: var(--muted); font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; }
</style>
```

- [ ] **Step 2: Replace `src/pages/periods/[slug].astro` entirely with:**

```astro
---
import { getCollection, getEntry, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import ArtworkCard from '../../components/ArtworkCard.astro';

export async function getStaticPaths() {
  const periods = await getCollection('periods');
  return periods.map((period) => ({ params: { slug: period.id }, props: { period } }));
}

const { period } = Astro.props;
const { Content } = await render(period);
const works = await getCollection('works', (w) => w.data.period.id === period.id);
const cards = await Promise.all(
  works.map(async (work) => ({
    work,
    artistName: (await getEntry(work.data.artist)).data.name,
  }))
);
cards.sort((a, b) => a.work.data.year.localeCompare(b.work.data.year));
---

<Base title={`${period.data.name} — The Greatest Art in History`}>
  <div class="page-head">
    <p class="kicker">{period.data.years}</p>
    <h1 class="display">{period.data.name}</h1>
  </div>
  <article class="prose lede intro">
    <Content />
  </article>
  <div class="grid">
    {cards.map(({ work, artistName }) => (
      <ArtworkCard work={work} artistName={artistName} />
    ))}
  </div>
</Base>

<style>
  .intro { margin-bottom: 1.5rem; }
</style>
```

- [ ] **Step 2b: Build and inspect**

Run: `npm run build`
Expected: PASS. `dist/periods/index.html`: ledger rows with uppercase years and large serif names. `dist/periods/romanticism/index.html`: kicker years + display name + `prose lede` intro + 9 cards.

- [ ] **Step 3: Commit**

```bash
git add src/pages/periods
git commit -m "feat(design): period ledger and italic lede treatment"
```

---

### Task 6: Final QA

**Files:** none new (fixes only, if issues found)

- [ ] **Step 1: Gates**

Run: `npm run check && npm run build`
Expected: ✓ checks; 48 pages.

- [ ] **Step 2: Dead-style and dead-code sweep**

```bash
grep -rn "shuffle\|Surprise\|quick-facts\|\.button\|\.ghost" src/ && echo "FOUND STALE" || echo "clean"
```
Expected: `clean` (no shuffle remnants, no orphaned class usage; if global.css or pages still define/use `.button`/`.ghost`/`.quick-facts`, remove them).

- [ ] **Step 3: Static UX verification on dist/**

- `dist/index.html`: works-data 30 entries with `slug,title,artist,year,src` only; wall-label + noscript present; no shuffle strings.
- Every page contains `astro-transition` / ClientRouter artifacts (view transitions active) and the floating header (wordmark + 2 nav links).
- Sample a dark page (`works/the-third-of-may-1808`) and a paper page (`periods/renaissance`): correct body class, `reading-room` band present on works/artist pages.
- Viewport meta on all pages; no horizontal-scroll-inducing fixed widths (grep CSS for `width:` values > 400px on body/main — expect none).

- [ ] **Step 4: Fix anything found, re-run gates, commit**

```bash
git add -A && git commit -m "chore: design QA fixes"
```
(Only if fixes were needed.)

- [ ] **Step 5: Controller visual walkthrough** — the session controller (not a subagent) runs `npm run preview` and screenshots home, one artwork page (top/middle/bottom), artist page, both period pages, and a phone-width home in the browser, then presents them to Jeff for acceptance.
