# Virtual Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A local Astro static site — a story-driven virtual gallery of 10 artists and 30 artworks from the Renaissance through Post-Impressionism.

**Architecture:** Astro content collections hold all content as markdown with zod-typed frontmatter (periods, artists, works). Pages are statically generated; the only client-side JS is the daily-pick/shuffle script on the homepage and the full-screen zoom on artwork pages. High-res public-domain images live in `src/assets/` and are resized by Astro's image pipeline at build time.

**Tech Stack:** Astro 7 (static, TypeScript strict; scaffolded latest — content-collections API identical to v5), sharp (image checks), @fontsource/cormorant-garamond + @fontsource/inter (self-hosted fonts). No database, no backend, no UI framework.

**Spec:** `docs/superpowers/specs/2026-07-12-virtual-gallery-design.md`

## Global Constraints

- English only.
- Artwork master images: minimum **2500px on the long edge**; artist portraits: minimum **800px**. Every image records `imageSource` (URL) and `imageLicense` in frontmatter. All images public domain.
- Image source priority: museum open access (Rijksmuseum, Met, Art Institute of Chicago, National Gallery London/Washington, owning museum) → Google Art Project scans on Wikimedia Commons → other Wikimedia Commons scans. If no acceptable scan exists, substitute another work by the same artist.
- Artwork body sections, exactly these four, in order: `## The Story`, `## The World Behind It`, `## The Artist at This Moment`, `## Interesting Facts`. **No technique-analysis sections.**
- Story depth targets: The Story 250–450 words; The World Behind It 150–300; The Artist at This Moment 150–300; Interesting Facts 4–7 bullets. Artist bios 300–500 words. Written as narrative, not encyclopedia entries.
- Aesthetic: "quiet luxury museum" — warm off-white pages, dark backdrop for artwork heroes, Cormorant Garamond headings, Inter body, generous whitespace, no card/dashboard clutter. Responsive (phone + desktop).
- Local only: no deployment tasks. `npm run dev` / `npm run preview`.
- Verification gate for every content task: `npm run check && npm run build` passes.

## File Structure

```
astro.config.mjs, package.json, tsconfig.json     (Task 1)
src/content.config.ts                              (Task 1)  collection schemas
src/content/TEMPLATE.md                            (Task 1)  authoring guide
scripts/check-content.mjs                          (Task 2)  resolution + section checks
src/styles/global.css                              (Task 3)  design tokens, typography, layout primitives
src/layouts/Base.astro                             (Task 3)  header/nav/footer shell
src/content/periods/*.md          × 5              (Task 4)
src/content/artists/van-gogh.md + works/the-starry-night.md   (Task 4, golden sample)
src/components/ArtworkCard.astro                   (Task 5)
src/pages/works/[slug].astro                       (Task 5)  artwork page + zoom
src/pages/artists/index.astro, artists/[slug].astro (Task 6)
src/pages/periods/index.astro, periods/[slug].astro (Task 7)
src/pages/index.astro                              (Task 8)  daily pick + shuffle
src/content/artists/*.md, works/*.md, assets/*     (Tasks 9–12, content batches)
```

Each content file's id (filename without `.md`) is its URL slug.

---

### Task 1: Scaffold Astro project and content schemas

**Files:**
- Create: Astro project at repo root (`package.json`, `astro.config.mjs`, `tsconfig.json`, `src/`)
- Create: `src/content.config.ts`
- Create: `src/content/TEMPLATE.md`
- Create: `src/assets/art/.gitkeep`, `src/assets/portraits/.gitkeep`

**Interfaces:**
- Produces: collections `periods`, `artists`, `works` with the schemas below. All later tasks depend on these exact field names.

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/jeff613/Projects/the-greatest-art-in-history
npm create astro@latest . -- --template minimal --no-install --no-git --yes
npm install
npm install @fontsource/cormorant-garamond @fontsource/inter sharp
mkdir -p src/content/periods src/content/artists src/content/works src/assets/art src/assets/portraits scripts
touch src/assets/art/.gitkeep src/assets/portraits/.gitkeep
```

Note: the scaffold must not overwrite the existing `docs/` and `.claude/` directories; if the wizard balks at a non-empty directory, scaffold into a temp dir and move the generated files in.

- [ ] **Step 2: Define content schemas**

Create `src/content.config.ts`:

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const periods = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/periods' }),
  schema: z.object({
    name: z.string(),
    order: z.number().int(),
    years: z.string(),
  }),
});

const artists = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artists' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      birth: z.number().int(),
      death: z.number().int(),
      period: reference('periods'),
      portrait: image(),
      portraitSource: z.string().url(),
      portraitLicense: z.string(),
      hook: z.string(),
      timeline: z.array(z.object({ year: z.string(), event: z.string() })),
    }),
});

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      artist: reference('artists'),
      period: reference('periods'),
      year: z.string(),
      medium: z.string(),
      location: z.string(),
      image: image(),
      imageSource: z.string().url(),
      imageLicense: z.string(),
      teaser: z.string(),
    }),
});

export const collections = { periods, artists, works };
```

- [ ] **Step 3: Write the authoring template**

Create `src/content/TEMPLATE.md`:

```markdown
# Content authoring guide

## Adding an artwork — src/content/works/<slug>.md

Filename = URL slug, kebab-case (e.g. `the-third-of-may-1808.md`).
Put the master image in `src/assets/art/<slug>.jpg` (min 2500px long edge, public domain).

    ---
    title: "The Third of May 1808"
    artist: goya                # filename of the artist file, no .md
    period: romanticism         # filename of the period file
    year: "1814"
    medium: "Oil on canvas"
    location: "Museo del Prado, Madrid"
    image: "../../assets/art/the-third-of-may-1808.jpg"
    imageSource: "https://commons.wikimedia.org/wiki/File:..."
    imageLicense: "Public domain"
    teaser: "One sentence that makes you want to read the story."
    ---

    ## The Story
    250–450 words. Why it was painted, the drama of its creation and reception.

    ## The World Behind It
    150–300 words. Politics, society, the artist's city at that moment.

    ## The Artist at This Moment
    150–300 words. Where the artist was in their life.

    ## Interesting Facts
    - 4–7 punchy bullets: thefts, scandals, hidden details, record prices.

No technique-analysis sections. Technique only appears inside a story.

## Adding an artist — src/content/artists/<slug>.md

Portrait in `src/assets/portraits/<slug>.jpg` (min 800px long edge).

    ---
    name: "Francisco Goya"
    birth: 1746
    death: 1828
    period: romanticism
    portrait: "../../assets/portraits/goya.jpg"
    portraitSource: "https://commons.wikimedia.org/wiki/File:..."
    portraitLicense: "Public domain"
    hook: "The court painter who went deaf and painted nightmares on his walls."
    timeline:
      - { year: "1746", event: "Born in Fuendetodos, Aragon" }
      - { year: "1786", event: "Appointed painter to King Charles III" }
    ---

    Life story as narrative, 300–500 words. Not a Wikipedia dump.

After adding content, run: npm run check && npm run build
```

- [ ] **Step 4: Add npm scripts**

In `package.json`, ensure:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "node scripts/check-content.mjs"
}
```

(`scripts/check-content.mjs` arrives in Task 2; `npm run check` may fail until then — that's expected.)

- [ ] **Step 5: Verify the build passes empty**

Run: `npm run build`
Expected: build succeeds with zero content (collections are empty but defined).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro project with content collection schemas"
```

---

### Task 2: Content check script

**Files:**
- Create: `scripts/check-content.mjs`

**Interfaces:**
- Consumes: markdown files in `src/content/works` and `src/content/artists` with `image:`/`portrait:` frontmatter paths (Task 1 schema).
- Produces: `npm run check` — exits 1 with per-file errors, or prints `✓ content checks passed`. Every content task (4, 9–12) runs this as its gate.

- [ ] **Step 1: Write the check script**

Create `scripts/check-content.mjs`:

```js
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WORKS_DIR = path.join(ROOT, 'src/content/works');
const ARTISTS_DIR = path.join(ROOT, 'src/content/artists');
const MIN_ART = 2500;
const MIN_PORTRAIT = 800;
const SECTIONS = [
  '## The Story',
  '## The World Behind It',
  '## The Artist at This Moment',
  '## Interesting Facts',
];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error('✗ ' + msg);
};

function frontmatterValue(text, key) {
  const m = text.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, 'm'));
  return m ? m[1].trim() : null;
}

async function checkImage(label, contentDir, relPath, minEdge) {
  if (!relPath) return fail(`${label}: missing image path in frontmatter`);
  const abs = path.resolve(contentDir, relPath);
  try {
    const meta = await sharp(abs).metadata();
    const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (longEdge < minEdge)
      fail(`${label}: ${relPath} long edge ${longEdge}px < required ${minEdge}px`);
  } catch {
    fail(`${label}: image unreadable at ${abs}`);
  }
}

async function mdFiles(dir) {
  try {
    return (await readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
}

for (const f of await mdFiles(WORKS_DIR)) {
  const text = await readFile(path.join(WORKS_DIR, f), 'utf8');
  await checkImage(`works/${f}`, WORKS_DIR, frontmatterValue(text, 'image'), MIN_ART);
  for (const s of SECTIONS)
    if (!text.includes(s)) fail(`works/${f}: missing section "${s}"`);
}

for (const f of await mdFiles(ARTISTS_DIR)) {
  const text = await readFile(path.join(ARTISTS_DIR, f), 'utf8');
  await checkImage(
    `artists/${f}`,
    ARTISTS_DIR,
    frontmatterValue(text, 'portrait'),
    MIN_PORTRAIT
  );
}

if (failures > 0) {
  console.error(`${failures} problem(s) found`);
  process.exit(1);
}
console.log('✓ content checks passed');
```

- [ ] **Step 2: Verify it fails on bad fixture**

```bash
mkdir -p /tmp/gallery-fixture && node -e "
const sharp = require('sharp');
sharp({ create: { width: 400, height: 300, channels: 3, background: 'gray' } })
  .jpeg().toFile('src/assets/art/fixture-test.jpg');
"
cat > src/content/works/fixture-test.md <<'EOF'
---
title: "Fixture"
artist: nobody
period: nowhere
year: "1800"
medium: "Oil"
location: "Nowhere"
image: "../../assets/art/fixture-test.jpg"
imageSource: "https://example.com/x"
imageLicense: "Public domain"
teaser: "x"
---
## The Story
x
EOF
npm run check
```

Expected: exit 1, errors for `long edge 400px < required 2500px` and three missing sections.

- [ ] **Step 3: Remove fixture, verify pass**

```bash
rm src/content/works/fixture-test.md src/assets/art/fixture-test.jpg
npm run check
```

Expected: `✓ content checks passed` (no content yet = nothing to fail).

- [ ] **Step 4: Commit**

```bash
git add scripts/check-content.mjs
git commit -m "feat: add content quality check script (resolution floor, required sections)"
```

---

### Task 3: Design system and base layout

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/Base.astro`
- Modify: `src/pages/index.astro` (temporary placeholder to view the shell)

**Interfaces:**
- Produces: `Base.astro` with props `{ title?: string, dark?: boolean }` and a default slot; CSS custom properties and classes (`.prose`, `.button`, `.ghost`, `.kicker`, `.grid`, `.card`) used by all page tasks.

- [ ] **Step 1: Write global styles**

Create `src/styles/global.css`:

```css
:root {
  --bg: #f7f4ee;
  --ink: #211e1a;
  --muted: #6f6a61;
  --line: #e2dccf;
  --accent: #8a6d3b;
  --dark-bg: #14120f;
  --dark-ink: #ece7dd;
  --serif: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --sans: 'Inter', system-ui, sans-serif;
  --measure: 42rem;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 1.0625rem;
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}

body.dark { background: var(--dark-bg); color: var(--dark-ink); }

h1, h2, h3 {
  font-family: var(--serif);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0.01em;
  margin: 0 0 0.5rem;
}
h1 { font-size: clamp(2.2rem, 5vw, 3.4rem); }
h2 { font-size: clamp(1.6rem, 3vw, 2.1rem); }
h3 { font-size: 1.25rem; }

a { color: inherit; text-decoration: none; }
p a, .prose a { border-bottom: 1px solid var(--accent); }

img { max-width: 100%; height: auto; display: block; }

.site-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 1.5rem clamp(1rem, 4vw, 3rem);
  border-bottom: 1px solid var(--line);
}
body.dark .site-header { border-color: #2a261f; }

.wordmark {
  font-family: var(--serif);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.wordmark span { color: var(--muted); font-weight: 500; }

.site-header nav { display: flex; gap: 1.75rem; }
.site-header nav a {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--muted);
}
.site-header nav a:hover { color: var(--accent); }

main { min-height: 70vh; }

.site-footer {
  padding: 3rem clamp(1rem, 4vw, 3rem);
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.85rem;
}
body.dark .site-footer { border-color: #2a261f; }

.kicker {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--accent);
  margin: 0 0 0.75rem;
}

.button {
  display: inline-block;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.8rem 1.6rem;
  background: var(--ink);
  color: var(--bg);
  border: 1px solid var(--ink);
  cursor: pointer;
  font-family: var(--sans);
}
body.dark .button { background: var(--dark-ink); color: var(--dark-bg); border-color: var(--dark-ink); }

.button.ghost { background: transparent; color: inherit; border-color: currentColor; }

.prose {
  max-width: var(--measure);
  margin: 0 auto;
  padding: 0 1.25rem;
}
.prose h2 {
  margin-top: 3rem;
  padding-top: 1.5rem;
}
.prose h2::before {
  content: '';
  display: block;
  width: 3rem;
  border-top: 1px solid var(--accent);
  margin-bottom: 1.5rem;
}
.prose li { margin-bottom: 0.6rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2.5rem 2rem;
  padding: 2rem clamp(1rem, 4vw, 3rem) 4rem;
}

.card img { aspect-ratio: 4 / 3; object-fit: cover; filter: saturate(0.97); }
.card:hover img { filter: none; }
.card h3 { margin: 0.9rem 0 0.15rem; }
.card p { margin: 0; color: var(--muted); font-size: 0.9rem; }

.page-head { padding: 3.5rem clamp(1rem, 4vw, 3rem) 0.5rem; max-width: 52rem; }
```

- [ ] **Step 2: Write the base layout**

Create `src/layouts/Base.astro`:

```astro
---
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '../styles/global.css';

interface Props {
  title?: string;
  dark?: boolean;
}
const { title = 'The Greatest Art in History', dark = false } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body class:list={[{ dark }]}>
    <header class="site-header">
      <a class="wordmark" href="/">The Greatest Art<span> in History</span></a>
      <nav>
        <a href="/artists/">Artists</a>
        <a href="/periods/">Periods</a>
      </nav>
    </header>
    <main><slot /></main>
    <footer class="site-footer">
      <p>A personal gallery of public-domain masterpieces. Images courtesy of museum open-access programs and Wikimedia Commons.</p>
    </footer>
  </body>
</html>
```

- [ ] **Step 3: Temporary homepage to view the shell**

Replace `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
---

<Base>
  <div class="page-head">
    <p class="kicker">Coming soon</p>
    <h1>The collection is being hung.</h1>
  </div>
</Base>
```

- [ ] **Step 4: Verify visually and build**

Run: `npm run build` — expected: PASS.
Run: `npm run dev` briefly and load `http://localhost:4321/` — header, serif headline, warm off-white background render correctly.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: design system, fonts, and base layout"
```

---

### Task 4: Period content + golden sample (Van Gogh / The Starry Night)

This task sets the content quality bar. All five period files, one complete artist, one complete artwork with a verified high-res image.

**Files:**
- Create: `src/content/periods/renaissance.md`, `baroque.md`, `romanticism.md`, `impressionism.md`, `post-impressionism.md`
- Create: `src/content/artists/van-gogh.md`, `src/assets/portraits/van-gogh.jpg`
- Create: `src/content/works/the-starry-night.md`, `src/assets/art/the-starry-night.jpg`

**Interfaces:**
- Consumes: schemas (Task 1), check script (Task 2).
- Produces: period ids `renaissance`, `baroque`, `romanticism`, `impressionism`, `post-impressionism` (all later content references these exact ids); the content-quality reference example.

- [ ] **Step 1: Write the five period files**

Frontmatter per file (body: 100–200-word story-driven era introduction, researched and written fresh):

| file | name | order | years |
|---|---|---|---|
| renaissance.md | Renaissance | 1 | "c. 1400–1600" |
| baroque.md | Baroque & Dutch Golden Age | 2 | "c. 1600–1700" |
| romanticism.md | Romanticism | 3 | "c. 1780–1850" |
| impressionism.md | Impressionism | 4 | "c. 1860–1890" |
| post-impressionism.md | Post-Impressionism | 5 | "c. 1885–1910" |

Example shape (`romanticism.md`):

```markdown
---
name: "Romanticism"
order: 3
years: "c. 1780–1850"
---

Europe was on fire — revolution in France, Napoleon marching across the
continent, old certainties collapsing... [continue: what the era felt like,
what its painters chased — emotion, terror, the sublime — in 100–200 words]
```

- [ ] **Step 2: Source the Starry Night image and Van Gogh portrait**

Research (WebSearch/WebFetch) the best available scan following the Global Constraints source priority. For The Starry Night: MoMA's page and the Google Art Project scan on Wikimedia Commons (`File:Van Gogh - Starry Night - Google Art Project.jpg`, ~9000px) are the leading candidates. Portrait: a Van Gogh self-portrait (1887, Musée d'Orsay or Art Institute of Chicago — AIC's is open access).

```bash
curl -L -o src/assets/art/the-starry-night.jpg '<original-file URL from the chosen source>'
curl -L -o src/assets/portraits/van-gogh.jpg '<portrait URL>'
```

Inspect both images visually (open the files) for frame glare, moiré, or color cast. Record the exact source page URL and license for frontmatter.

- [ ] **Step 3: Write van-gogh.md and the-starry-night.md**

Full frontmatter per TEMPLATE.md. Research and write original narrative content meeting the Global Constraints depth targets. For The Starry Night that means: The Story (painted from the asylum window at Saint-Rémy, the invented village, Vincent's own dismissal of it in letters); The World Behind It (1889 France, the asylum system, the Paris avant-garde he'd left); The Artist at This Moment (a year after the ear, months of crisis, painting between breakdowns); Interesting Facts (sold for nothing in his lifetime → MoMA icon, the turbulence-physics studies, Don McLean, etc. — verify each fact before including).

- [ ] **Step 4: Verify**

Run: `npm run check` — expected: `✓ content checks passed` (resolution + all four sections present).
Run: `npm run build` — expected: PASS (schema + references valid).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "content: five periods + golden sample (Van Gogh, The Starry Night)"
```

---

### Task 5: Artwork page with zoom and next-artwork

**Files:**
- Create: `src/components/ArtworkCard.astro`
- Create: `src/pages/works/[slug].astro`

**Interfaces:**
- Consumes: `works`, `artists`, `periods` collections; golden sample content (Task 4); `Base.astro` (Task 3).
- Produces: route `/works/<slug>/`; `ArtworkCard.astro` with props `{ work: CollectionEntry<'works'>, artistName: string }` (used by Tasks 6, 7).

- [ ] **Step 1: Write ArtworkCard**

Create `src/components/ArtworkCard.astro`:

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

- [ ] **Step 2: Write the artwork page**

Create `src/pages/works/[slug].astro`:

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
    <h1>{work.data.title}</h1>
    <p class="byline">
      <a href={`/artists/${artist.id}/`}>{artist.data.name}</a>, {work.data.year}
    </p>
  </section>

  <dialog class="lightbox">
    <img src={fullRes.src} alt={work.data.title} loading="lazy" />
    <button class="zoom-close" aria-label="Close full screen view">×</button>
  </dialog>

  <dl class="quick-facts">
    <div><dt>Year</dt><dd>{work.data.year}</dd></div>
    <div><dt>Period</dt><dd><a href={`/periods/${period.id}/`}>{period.data.name}</a></dd></div>
    <div><dt>Medium</dt><dd>{work.data.medium}</dd></div>
    <div><dt>Location</dt><dd>{work.data.location}</dd></div>
  </dl>

  <article class="prose">
    <Content />
  </article>

  <nav class="next-work">
    <a href={`/works/${next.id}/`}>
      <span class="kicker">Next artwork</span>
      <span class="next-title">{next.data.title} →</span>
    </a>
  </nav>
</Base>

<style>
  .art-hero {
    padding: 2.5rem clamp(1rem, 4vw, 3rem) 2rem;
    text-align: center;
  }
  .art-hero :global(img) {
    max-height: 78vh;
    width: auto;
    max-width: 100%;
    margin: 0 auto 2rem;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  }
  .zoom-open { background: none; border: none; padding: 0; cursor: zoom-in; width: 100%; }
  .byline { color: var(--muted); font-size: 1.05rem; margin: 0; }
  .byline a { border-bottom: 1px solid var(--accent); }

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
  .lightbox img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    cursor: zoom-out;
  }
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

  .quick-facts {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2.5rem 3.5rem;
    margin: 0;
    padding: 1.75rem 1rem;
    border-top: 1px solid #2a261f;
    border-bottom: 1px solid #2a261f;
  }
  .quick-facts dt {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--muted);
  }
  .quick-facts dd { margin: 0.15rem 0 0; font-family: var(--serif); font-size: 1.15rem; }

  .prose { padding-top: 1rem; padding-bottom: 3rem; }

  .next-work { text-align: center; padding: 0 1rem 5rem; }
  .next-title { font-family: var(--serif); font-size: 1.5rem; }
</style>

<script>
  const dialog = document.querySelector<HTMLDialogElement>('.lightbox')!;
  document.querySelector('.zoom-open')?.addEventListener('click', () => dialog.showModal());
  document.querySelector('.zoom-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || (e.target as HTMLElement).tagName === 'IMG') dialog.close();
  });
</script>
```

- [ ] **Step 3: Verify**

Run: `npm run build` — expected: PASS, `/works/the-starry-night/index.html` generated.
Run: `npm run dev`, open `http://localhost:4321/works/the-starry-night/` — dark hero, image click opens full-screen zoom, Esc/click closes, four story sections render, quick facts correct, next-artwork link present (loops to itself with one work — correct behavior).

- [ ] **Step 4: Commit**

```bash
git add src/components/ArtworkCard.astro src/pages/works
git commit -m "feat: artwork page with full-screen zoom and next-artwork navigation"
```

---

### Task 6: Artist pages

**Files:**
- Create: `src/pages/artists/index.astro`
- Create: `src/pages/artists/[slug].astro`

**Interfaces:**
- Consumes: `artists`/`works` collections, `ArtworkCard` (Task 5), `Base.astro`.
- Produces: routes `/artists/` and `/artists/<slug>/`.

- [ ] **Step 1: Artists index**

Create `src/pages/artists/index.astro`:

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
    <h1>Ten lives that changed how we see.</h1>
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

<style>
  .hook { font-style: italic; margin-top: 0.3rem !important; }
</style>
```

- [ ] **Step 2: Artist detail page**

Create `src/pages/artists/[slug].astro`:

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

<Base title={`${artist.data.name} — The Greatest Art in History`}>
  <div class="artist-head">
    <Image
      src={artist.data.portrait}
      widths={[400, 800]}
      sizes="320px"
      alt={`Portrait of ${artist.data.name}`}
    />
    <div>
      <p class="kicker">{period.data.name} · {artist.data.birth}–{artist.data.death}</p>
      <h1>{artist.data.name}</h1>
      <p class="hook">{artist.data.hook}</p>
    </div>
  </div>

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

  <section>
    <div class="page-head"><h2>In the collection</h2></div>
    <div class="grid">
      {works.map((work) => (
        <ArtworkCard work={work} artistName={artist.data.name} />
      ))}
    </div>
  </section>
</Base>

<style>
  .artist-head {
    display: flex;
    flex-wrap: wrap;
    gap: 2.5rem;
    align-items: end;
    padding: 3.5rem clamp(1rem, 4vw, 3rem) 2rem;
  }
  .artist-head :global(img) { width: 240px; height: auto; }
  .hook { font-style: italic; color: var(--muted); font-size: 1.15rem; }
  .timeline ul { list-style: none; padding: 0; }
  .timeline li { border-left: 1px solid var(--accent); padding-left: 1.25rem; margin-bottom: 0.9rem; }
</style>
```

- [ ] **Step 3: Verify**

Run: `npm run build` — expected: PASS, `/artists/` and `/artists/van-gogh/` generated.
Run: `npm run dev`, check both pages: portrait grid with hook lines; artist page shows bio, timeline, Starry Night card.

- [ ] **Step 4: Commit**

```bash
git add src/pages/artists
git commit -m "feat: artists index and artist detail pages"
```

---

### Task 7: Period pages

**Files:**
- Create: `src/pages/periods/index.astro`
- Create: `src/pages/periods/[slug].astro`

**Interfaces:**
- Consumes: `periods`/`works`/`artists` collections, `ArtworkCard`, `Base.astro`.
- Produces: routes `/periods/` and `/periods/<slug>/`.

- [ ] **Step 1: Periods index**

Create `src/pages/periods/index.astro`:

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
    <h1>Five hundred years, five revolutions.</h1>
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
  .period-list { list-style: none; margin: 0; padding: 1rem clamp(1rem, 4vw, 3rem) 5rem; }
  .period-list li { border-top: 1px solid var(--line); }
  .period-list a {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 1.5rem;
    padding: 1.75rem 0;
  }
  .period-list a:hover .name { color: var(--accent); }
  .years { color: var(--muted); font-size: 0.85rem; min-width: 9rem; }
  .name { font-family: var(--serif); font-size: 1.9rem; font-weight: 600; flex: 1; }
  .count { color: var(--muted); font-size: 0.85rem; }
</style>
```

- [ ] **Step 2: Period detail page**

Create `src/pages/periods/[slug].astro`:

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
    <h1>{period.data.name}</h1>
  </div>
  <article class="prose intro">
    <Content />
  </article>
  <div class="grid">
    {cards.map(({ work, artistName }) => (
      <ArtworkCard work={work} artistName={artistName} />
    ))}
  </div>
</Base>

<style>
  .intro { margin-bottom: 1rem; }
</style>
```

- [ ] **Step 3: Verify**

Run: `npm run build` — expected: PASS; `/periods/`, five period pages generated.
Run: `npm run dev`, check `/periods/` (five eras, chronological, work counts) and `/periods/post-impressionism/` (intro + Starry Night card).

- [ ] **Step 4: Commit**

```bash
git add src/pages/periods
git commit -m "feat: periods index and period detail pages"
```

---

### Task 8: Homepage — Artwork of the Day + shuffle

**Files:**
- Modify: `src/pages/index.astro` (replace Task 3 placeholder entirely)

**Interfaces:**
- Consumes: `works`/`artists` collections; `getImage` for hero renditions.
- Produces: route `/` with deterministic daily pick and shuffle.

- [ ] **Step 1: Write the homepage**

Replace `src/pages/index.astro`:

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
      const hero = await getImage({ src: work.data.image, width: 1600, format: 'webp' });
      return {
        slug: work.id,
        title: work.data.title,
        artist: artist.data.name,
        year: work.data.year,
        teaser: work.data.teaser,
        src: hero.src,
      };
    })
);
---

<Base dark>
  <section class="daily">
    <p class="kicker">Artwork of the Day</p>
    <a id="daily-link" href="#" class="daily-frame">
      <img id="daily-img" alt="" />
    </a>
    <h1 id="daily-title"></h1>
    <p class="byline" id="daily-byline"></p>
    <p class="teaser" id="daily-teaser"></p>
    <div class="actions">
      <a id="daily-read" class="button" href="#">Read the story →</a>
      <button id="shuffle" class="button ghost" type="button">Surprise me</button>
    </div>
  </section>

  <script type="application/json" id="works-data" set:html={JSON.stringify(entries)} />
</Base>

<style>
  .daily {
    text-align: center;
    padding: 2.5rem clamp(1rem, 4vw, 3rem) 5rem;
  }
  .daily-frame :global(img),
  #daily-img {
    max-height: 62vh;
    width: auto;
    max-width: 100%;
    margin: 0 auto 2rem;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  }
  .byline { color: var(--muted); margin: 0 0 1rem; }
  .teaser {
    font-family: var(--serif);
    font-size: 1.3rem;
    font-style: italic;
    max-width: 34rem;
    margin: 0 auto 2rem;
  }
  .actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
</style>

<script>
  type Entry = {
    slug: string;
    title: string;
    artist: string;
    year: string;
    teaser: string;
    src: string;
  };
  const data: Entry[] = JSON.parse(
    document.getElementById('works-data')!.textContent!
  );

  function dayIndex(): number {
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    let hash = 0;
    for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return hash % data.length;
  }

  let current = dayIndex();

  function show(i: number): void {
    const entry = data[i];
    const img = document.getElementById('daily-img') as HTMLImageElement;
    img.src = entry.src;
    img.alt = `${entry.title} by ${entry.artist}`;
    document.getElementById('daily-title')!.textContent = entry.title;
    document.getElementById('daily-byline')!.textContent = `${entry.artist}, ${entry.year}`;
    document.getElementById('daily-teaser')!.textContent = entry.teaser;
    const url = `/works/${entry.slug}/`;
    (document.getElementById('daily-link') as HTMLAnchorElement).href = url;
    (document.getElementById('daily-read') as HTMLAnchorElement).href = url;
  }

  show(current);

  document.getElementById('shuffle')!.addEventListener('click', () => {
    if (data.length < 2) return;
    let next: number;
    do {
      next = Math.floor(Math.random() * data.length);
    } while (next === current);
    current = next;
    show(next);
  });
</script>
```

- [ ] **Step 2: Verify**

Run: `npm run build` — expected: PASS.
Run: `npm run dev`, open `/`: Starry Night appears as the daily pick (only work), title/byline/teaser populate, "Read the story" links to `/works/the-starry-night/`. Shuffle is a no-op with one work — correct.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: homepage with artwork of the day and shuffle"
```

---

### Tasks 9–12: Content batches

The four batches share one procedure; each batch is a separate task and commit. **For every artist:** research their life, source a portrait (≥800px, public domain), write the bio (300–500 words, narrative) with timeline. **For every work:** source the best available scan per Global Constraints priority (≥2500px long edge, visually inspected), record source URL + license, and write all four sections at the depth targets, story-first, facts verified before inclusion. Substitute a different work by the same artist if no acceptable scan exists (note the substitution in the commit message).

**Gate for each batch:** `npm run check && npm run build` passes, then spot-check 2–3 new pages in `npm run dev`.

**Commit message pattern:** `content: <period> batch — <artists>`

---

### Task 9: Renaissance batch

**Files:**
- Create: `src/content/artists/leonardo-da-vinci.md`, `botticelli.md` + portraits
- Create: 6 work files + images:

| Work | Artist | Where it hangs | Likely best source |
|---|---|---|---|
| Mona Lisa | leonardo-da-vinci | Louvre, Paris | Wikimedia Commons (Louvre scan) |
| The Last Supper | leonardo-da-vinci | Santa Maria delle Grazie, Milan | Wikimedia Commons (post-restoration scan) |
| Lady with an Ermine | leonardo-da-vinci | Czartoryski Museum, Kraków | Wikimedia Commons (Google Art Project) |
| The Birth of Venus | botticelli | Uffizi, Florence | Wikimedia Commons (Google Art Project, gigapixel) |
| Primavera | botticelli | Uffizi, Florence | Wikimedia Commons (Google Art Project) |
| Venus and Mars | botticelli | National Gallery, London | NG London open access / Wikimedia |

- [ ] Write both artist files with portraits; verify portraits ≥800px
- [ ] Source all 6 images; verify each ≥2500px and visually clean
- [ ] Write all 6 work files (four sections each, depth targets, facts verified)
- [ ] Run `npm run check && npm run build` — expected: PASS
- [ ] Spot-check `/artists/leonardo-da-vinci/` and `/works/the-birth-of-venus/` in dev
- [ ] Commit: `content: Renaissance batch — Leonardo da Vinci, Botticelli`

---

### Task 10: Baroque & Dutch Golden Age batch

**Files:**
- Create: `src/content/artists/caravaggio.md`, `rembrandt.md`, `vermeer.md` + portraits
- Create: 9 work files + images:

| Work | Artist | Where it hangs | Likely best source |
|---|---|---|---|
| The Calling of Saint Matthew | caravaggio | San Luigi dei Francesi, Rome | Wikimedia Commons |
| Judith Beheading Holofernes | caravaggio | Palazzo Barberini, Rome | Wikimedia Commons |
| David with the Head of Goliath | caravaggio | Galleria Borghese, Rome | Wikimedia Commons |
| The Night Watch | rembrandt | Rijksmuseum, Amsterdam | **Rijksmuseum open access (superb scans)** |
| The Anatomy Lesson of Dr Nicolaes Tulp | rembrandt | Mauritshuis, The Hague | Mauritshuis / Wikimedia GAP |
| Self-Portrait with Two Circles | rembrandt | Kenwood House, London | Wikimedia Commons |
| Girl with a Pearl Earring | vermeer | Mauritshuis, The Hague | Mauritshuis open access (gigapixel available) |
| The Milkmaid | vermeer | Rijksmuseum, Amsterdam | **Rijksmuseum open access** |
| The Art of Painting | vermeer | Kunsthistorisches Museum, Vienna | Wikimedia Commons (Google Art Project) |

- [ ] Write all 3 artist files with portraits (Caravaggio: Ottavio Leoni chalk portrait; Rembrandt & Vermeer: self-portraits — Vermeer has no confirmed self-portrait, use the presumed one in The Procuress detail or the Saint Praxedis-era attribution; if neither is acceptable quality, use a crop from The Art of Painting's painter figure and note it as "presumed self-depiction")
- [ ] Source all 9 images; verify ≥2500px and visually clean
- [ ] Write all 9 work files (four sections each, depth targets, facts verified)
- [ ] Run `npm run check && npm run build` — expected: PASS
- [ ] Spot-check `/works/the-night-watch/` and `/artists/caravaggio/` in dev
- [ ] Commit: `content: Baroque batch — Caravaggio, Rembrandt, Vermeer`

---

### Task 11: Romanticism batch

**Files:**
- Create: `src/content/artists/goya.md`, `turner.md`, `delacroix.md` + portraits
- Create: 9 work files + images:

| Work | Artist | Where it hangs | Likely best source |
|---|---|---|---|
| The Third of May 1808 | goya | Museo del Prado, Madrid | Wikimedia Commons (Prado scan) |
| Saturn Devouring His Son | goya | Museo del Prado, Madrid | Wikimedia Commons (Prado scan) |
| Witches' Sabbath (The Great He-Goat) | goya | Museo del Prado, Madrid | Wikimedia Commons |
| The Fighting Temeraire | turner | National Gallery, London | NG London open access |
| Rain, Steam and Speed | turner | National Gallery, London | NG London open access |
| Snow Storm: Steam-Boat off a Harbour's Mouth | turner | Tate Britain, London | Tate / Wikimedia Commons |
| Liberty Leading the People | delacroix | Louvre, Paris | Wikimedia Commons (post-2024-restoration scan if available) |
| The Death of Sardanapalus | delacroix | Louvre, Paris | Wikimedia Commons |
| The Massacre at Chios | delacroix | Louvre, Paris | Wikimedia Commons |

- [ ] Write all 3 artist files with portraits (Goya: Vicente López portrait or self-portrait; Turner: self-portrait c. 1799, Tate; Delacroix: self-portrait, Louvre)
- [ ] Source all 9 images; verify ≥2500px and visually clean
- [ ] Write all 9 work files (four sections each, depth targets, facts verified)
- [ ] Run `npm run check && npm run build` — expected: PASS
- [ ] Spot-check `/works/the-third-of-may-1808/` and `/periods/romanticism/` in dev
- [ ] Commit: `content: Romanticism batch — Goya, Turner, Delacroix`

---

### Task 12: Impressionism & Post-Impressionism batch

**Files:**
- Create: `src/content/artists/monet.md` + portrait
- Create: 5 work files + images (Van Gogh artist file and The Starry Night already exist from Task 4):

| Work | Artist | Where it hangs | Likely best source |
|---|---|---|---|
| Impression, Sunrise | monet | Musée Marmottan Monet, Paris | Wikimedia Commons |
| Woman with a Parasol | monet | National Gallery of Art, Washington | **NGA open access (excellent scans)** |
| Water Lilies (1906) | monet | Art Institute of Chicago | **AIC open access / IIIF** |
| Sunflowers (1888) | van-gogh | National Gallery, London | NG London open access / Wikimedia GAP |
| Wheatfield with Crows | van-gogh | Van Gogh Museum, Amsterdam | Van Gogh Museum / Wikimedia Commons |

- [ ] Write monet.md with portrait (Nadar photograph, public domain)
- [ ] Source all 5 images; verify ≥2500px and visually clean
- [ ] Write all 5 work files (four sections each, depth targets, facts verified)
- [ ] Run `npm run check && npm run build` — expected: PASS
- [ ] Spot-check `/works/impression-sunrise/` and `/artists/monet/` in dev
- [ ] Commit: `content: Impressionism & Post-Impressionism batch — Monet, Van Gogh`

---

### Task 13: Final QA

**Files:**
- No new files (fixes only, if issues found)

- [ ] **Step 1: Full gates**

Run: `npm run check && npm run build`
Expected: `✓ content checks passed`; build generates 1 home + 2 index + 10 artist + 5 period + 30 work pages = 48 pages.

- [ ] **Step 2: Collection completeness**

```bash
ls src/content/artists/*.md | wc -l   # expected: 10
ls src/content/works/*.md | wc -l     # expected: 30
ls src/content/periods/*.md | wc -l   # expected: 5
```

- [ ] **Step 3: Manual UX walkthrough (`npm run preview`)**

- Home: daily artwork renders full-bleed; shuffle cycles without repeats; "Read the story" navigates correctly.
- Reload home on the same day → same daily pick (deterministic).
- `/artists/`: 10 portraits, period-then-birth order, hook lines read well.
- `/periods/`: 5 eras chronological with correct work counts.
- Three artwork pages from different periods: zoom opens/closes, quick facts correct, all four sections present and well-written, next-artwork chains work.
- Phone-width viewport (devtools): no horizontal scroll, images fit, nav usable.

- [ ] **Step 4: Fix anything found, re-run gates, commit**

```bash
git add -A
git commit -m "chore: final QA fixes for v1 pilot"
```

- [ ] **Step 5: Hand off to Jeff for acceptance review** — the pilot's acceptance test is his manual UX review per the spec.
