# Period Music Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Each of the 10 period pages gets an optional ambient audio player: one curated, freely-licensed period-matched classical recording, self-hosted, styled to the dimmed-gallery design system.

**Architecture:** An optional `music` array on the `periods` collection schema (frontmatter-driven, like everything else on this site); MP3s in `public/audio/`; one new `PeriodMusic.astro` component rendered in the period page head; a new `npm run check` rule that every referenced audio file exists. Music stops when the visitor navigates away (the site uses ClientRouter view transitions, so this must be explicit).

**Tech Stack:** Astro 7 static site, vanilla TS in `<script>` tags, ffmpeg for audio re-encoding, no new npm dependencies.

**Spec:** `docs/superpowers/specs/2026-07-13-period-music-design.md` — read it before starting any task.

## Global Constraints

- Working directory is the `period-music` worktree; branch `worktree-period-music`.
- `npm run check` and `npm run build` must pass at the end of every task (build page count stays 158 — this feature adds no pages).
- No new npm dependencies. No changes to files other than those listed per task.
- Commit messages follow repo style: `feat(music): …` / `feat(content): …` / `chore: …`, ending with the Claude co-author line.
- **Licensing is per-recording, not per-composition.** The composition being public domain is NOT sufficient. The specific recording must be public domain, CC0, or CC BY (CC BY-SA acceptable; **CC BY-NC / ND are NOT** — the site plans an eventual public deploy). Verify on the source page for the file actually downloaded; record that exact page URL in `sourceUrl` and the license string in `license`.
- **Ambient criterion (hard requirement from Jeff):** calm, even dynamics — chant, small choral, solo keyboard, slow movements. No symphonic climaxes or wide loud/soft swings. Objective gate: `ffmpeg -i <file> -af ebur128 -f null - 2>&1 | grep -A5 "Summary"` — the LRA (loudness range) value must be **≤ 12 LU**. Also: duration ≥ 2 minutes (short clips loop too noticeably).
- Audio target format: MP3 via `ffmpeg -i <src> -codec:a libmp3lame -q:a 4 public/audio/<period-slug>.mp3` (~165 kbps VBR). Keep each file under ~10 MB; for very long recordings, trim to the first complete movement/section with `-t <seconds>` only if a natural stopping point exists — otherwise pick a shorter piece.
- File naming: exactly `public/audio/<period-slug>.mp3` where `<period-slug>` is the period's markdown filename without `.md` (e.g. `post-impressionism.mp3`).

### Music frontmatter shape (used by every curation task)

Append to the period's frontmatter (between the `---` fences), e.g. in `src/content/periods/post-impressionism.md`:

```yaml
music:
  - title: "Gymnopédie No. 1"
    composer: "Erik Satie"
    composed: "1888"
    performer: "Performer or ensemble as credited by the source"
    source: "Musopen"
    sourceUrl: "https://musopen.org/music/…exact-page-for-this-recording…"
    license: "Public domain"
    file: "/audio/post-impressionism.mp3"
```

`composed` is a display string ("1888", "c. 1365"). `performer` is whatever the source credits (use "Unknown performer" only if the source truly doesn't say — prefer recordings with credited performers).

### Sourcing procedure (used by every curation task)

1. Search, in order of preference:
   - **Wikimedia Commons** (`https://commons.wikimedia.org/w/index.php?search=<composer>+<piece>&ns6=1`) — file pages state the license explicitly; files are directly downloadable (often .ogg/.flac/.oga — re-encode to MP3).
   - **Musopen** (`https://musopen.org/music/`) — filter for public-domain recordings.
   - **IMSLP** (`https://imslp.org`) — performance recordings list their license per file.
2. On the file/recording page, confirm the license covers the **recording/performance** (Commons file pages have a license box; IMSLP shows it next to each audio file). Reject anything NC/ND or "for evaluation only".
3. Download to the scratchpad directory, NOT the repo.
4. Inspect: `ffprobe -hide_banner <file>` — confirm duration ≥ 2 min and it's an audio stream.
5. Re-encode to `public/audio/<period-slug>.mp3` with the ffmpeg command from Global Constraints.
6. Run the ebur128 LRA gate (must be ≤ 12 LU). If it fails, pick a different recording or piece — do not ship it.
7. Add the `music:` frontmatter block to the period file with real values.
8. `npm run check` must pass.
9. If no acceptable recording can be found for a period after honest effort, **ship that period with no music** and say so in your report — no bad track over no track.

---

### Task 1: Schema field + check gate

**Files:**
- Modify: `src/content.config.ts` (periods schema, lines 4–11)
- Modify: `scripts/check-content.mjs`

**Interfaces:**
- Produces: `period.data.music?: Array<{title, composer, composed, performer, source, sourceUrl, license, file}>` — consumed by Task 2's component and page wiring. `npm run check` failing on missing/misplaced audio files — relied on by all curation tasks.

Note: `content.config.ts` is marked frozen in CLAUDE.md; Jeff explicitly directed this change (see spec).

- [ ] **Step 1: Add the optional `music` field to the periods schema**

In `src/content.config.ts`, replace the `periods` collection definition with:

```ts
const periods = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/periods' }),
  schema: z.object({
    name: z.string(),
    order: z.number().int(),
    years: z.string(),
    music: z
      .array(
        z.object({
          title: z.string(),
          composer: z.string(),
          composed: z.string(),
          performer: z.string(),
          source: z.string(),
          sourceUrl: z.string().url(),
          license: z.string(),
          file: z.string(),
        })
      )
      .optional(),
  }),
});
```

- [ ] **Step 2: Add the audio-file existence rule to the check script**

In `scripts/check-content.mjs`:

Change the first import line to include `stat`:

```js
import { readdir, readFile, stat } from 'node:fs/promises';
```

Add after the `ARTISTS_DIR` constant:

```js
const PERIODS_DIR = path.join(ROOT, 'src/content/periods');
const PUBLIC_DIR = path.join(ROOT, 'public');
```

Add after the artists loop (before the `if (failures > 0)` block):

```js
for (const f of await mdFiles(PERIODS_DIR)) {
  const text = await readFile(path.join(PERIODS_DIR, f), 'utf8');
  for (const m of text.matchAll(/^\s*file:\s*["']?([^"'\n]+?)["']?\s*$/gm)) {
    const rel = m[1].trim();
    if (!rel.startsWith('/audio/')) {
      fail(`periods/${f}: music file "${rel}" must start with /audio/`);
      continue;
    }
    try {
      await stat(path.join(PUBLIC_DIR, rel));
    } catch {
      fail(`periods/${f}: audio file missing at public${rel}`);
    }
  }
}
```

- [ ] **Step 3: Verify the gate fails on a missing file**

Temporarily append to the frontmatter of `src/content/periods/post-impressionism.md` (inside the `---` fences):

```yaml
music:
  - title: "Test"
    composer: "Test"
    composed: "1888"
    performer: "Test"
    source: "Test"
    sourceUrl: "https://example.com/"
    license: "Public domain"
    file: "/audio/does-not-exist.mp3"
```

Run: `npm run check`
Expected: FAIL with `periods/post-impressionism.md: audio file missing at public/audio/does-not-exist.mp3`, exit code 1.

- [ ] **Step 4: Verify schema + build accept a valid entry**

Create the directory and a placeholder so only the schema is under test: `mkdir -p public/audio && touch public/audio/does-not-exist.mp3`

Run: `npm run check` — Expected: PASS.
Run: `npm run build` — Expected: PASS, 158 pages (this proves the schema change parses and existing pages build).

- [ ] **Step 5: Remove the fixture**

Remove the temporary `music:` block from `post-impressionism.md` and delete `public/audio/does-not-exist.mp3` (keep the empty `public/audio/` out of git — git doesn't track empty dirs; that's fine).

Run: `npm run check` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts scripts/check-content.mjs
git commit -m "feat(music): periods music schema + audio existence gate"
```

(with the Claude co-author line per Global Constraints)

---

### Task 2: PeriodMusic component + page wiring + first track (Post-Impressionism)

**Files:**
- Create: `src/components/PeriodMusic.astro`
- Modify: `src/pages/periods/[slug].astro`
- Create: `public/audio/post-impressionism.mp3` (sourced)
- Modify: `src/content/periods/post-impressionism.md` (frontmatter only)

**Interfaces:**
- Consumes: `period.data.music` from Task 1's schema.
- Produces: `<PeriodMusic track={track} />` where `track` is one element of the `music` array. Curation tasks (3–5) only add frontmatter + files; they never touch components.

- [ ] **Step 1: Create the component**

Create `src/components/PeriodMusic.astro`:

```astro
---
interface Props {
  track: {
    title: string;
    composer: string;
    composed: string;
    performer: string;
    source: string;
    sourceUrl: string;
    license: string;
    file: string;
  };
}
const { track } = Astro.props;
---

<div class="period-music">
  <button
    class="music-toggle"
    type="button"
    aria-pressed="false"
    aria-label={`Play ${track.title} by ${track.composer}`}
  >
    <span class="music-glyph" aria-hidden="true">♪</span>
    <span class="music-state">Listen</span>
  </button>
  <p class="music-credit">
    {track.composer} — <em>{track.title}</em>, {track.composed} ·{' '}
    {track.performer} · <a href={track.sourceUrl}>{track.source}</a>
  </p>
  <audio preload="none" loop src={track.file}></audio>
</div>

<style>
  .period-music {
    display: flex;
    align-items: baseline;
    gap: 0.85rem;
    margin-top: 1.1rem;
  }
  .music-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    background: none;
    border: 1px solid var(--gilt);
    border-radius: 999px;
    padding: 0.32rem 0.95rem;
    color: var(--gilt);
    font-family: var(--sans);
    font-size: 0.72rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .music-toggle:hover {
    background: rgba(138, 109, 59, 0.09);
  }
  .music-credit {
    margin: 0;
    color: var(--muted);
    font-size: 0.82rem;
    letter-spacing: 0.04em;
  }
  .music-credit em {
    font-family: var(--serif);
    font-size: 1rem;
  }
  .music-credit a {
    border-bottom: 1px solid var(--gilt);
  }
  @media (max-width: 640px) {
    .period-music {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>

<script>
  function initPeriodMusic(): void {
    const root = document.querySelector<HTMLElement>('.period-music');
    if (!root) return;
    const button = root.querySelector<HTMLButtonElement>('.music-toggle');
    const state = root.querySelector<HTMLElement>('.music-state');
    const audio = root.querySelector<HTMLAudioElement>('audio');
    if (!button || !state || !audio) return;
    const playLabel = button.getAttribute('aria-label') ?? 'Play';
    audio.volume = 0.7;
    button.addEventListener('click', () => {
      if (audio.paused) void audio.play();
      else audio.pause();
    });
    const sync = (): void => {
      const playing = !audio.paused;
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? 'Pause the music' : playLabel);
      state.textContent = playing ? 'Pause' : 'Listen';
    };
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
  }
  document.addEventListener('astro:page-load', initPeriodMusic);
  // View transitions keep the old page's DOM alive during swap — stop sound explicitly.
  document.addEventListener('astro:before-swap', () => {
    document.querySelector<HTMLAudioElement>('.period-music audio')?.pause();
  });
</script>
```

- [ ] **Step 2: Wire it into the period page**

In `src/pages/periods/[slug].astro`:

Add to the imports in the frontmatter block:

```ts
import PeriodMusic from '../../components/PeriodMusic.astro';
```

Add at the end of the frontmatter block (after the `featured` const):

```ts
const track = period.data.music?.[0];
```

Replace the `.page-head` div with:

```astro
  <div class="page-head">
    <p class="kicker">{period.data.years}</p>
    <h1 class="display">{period.data.name}</h1>
    {track && <PeriodMusic track={track} />}
  </div>
```

- [ ] **Step 3: Source the first track — Satie, Gymnopédie No. 1**

Follow the Sourcing procedure in Global Constraints. Target piece: Erik Satie, *Gymnopédie No. 1* (1888) — solo piano, the canonical ambient piece. Known-good starting points: Musopen's Satie page and Wikimedia Commons search "Satie Gymnopédie". Output: `public/audio/post-impressionism.mp3`, LRA ≤ 12, duration ≥ 2 min.

- [ ] **Step 4: Add the frontmatter**

Append the `music:` block (shape in Global Constraints) to `src/content/periods/post-impressionism.md` with the real performer/source/sourceUrl/license values for the recording actually used, `composed: "1888"`, `file: "/audio/post-impressionism.mp3"`.

- [ ] **Step 5: Gates**

Run: `npm run check` — Expected: PASS.
Run: `npm run build` — Expected: PASS, 158 pages.

- [ ] **Step 6: Verify behavior in the browser**

Start the dev server (`astro dev --background`, check the port with `astro dev status`). On `/periods/post-impressionism/`:
- Player renders under the title: ♪ Listen button + credit line with working source link.
- Click Listen → music plays, button reads Pause, `aria-pressed="true"`.
- Click Pause → stops, button reads Listen.
- Play, then click an artwork card (navigates to a work page) → **audio stops** and the work page has no player.
- Visit `/periods/baroque/` (no music yet) → no player, page identical to before.
Then `astro dev stop`.

- [ ] **Step 7: Commit**

```bash
git add src/components/PeriodMusic.astro src/pages/periods/[slug].astro src/content/periods/post-impressionism.md public/audio/post-impressionism.mp3
git commit -m "feat(music): PeriodMusic player + Satie for Post-Impressionism"
```

---

### Task 3: Curate batch A — Gothic, Northern Renaissance, Renaissance

**Files:**
- Create: `public/audio/gothic-proto-renaissance.mp3`, `public/audio/northern-renaissance.mp3`, `public/audio/renaissance.mp3`
- Modify: `src/content/periods/gothic-proto-renaissance.md`, `src/content/periods/northern-renaissance.md`, `src/content/periods/renaissance.md` (frontmatter only)

**Interfaces:**
- Consumes: the `music` frontmatter shape and Sourcing procedure from Global Constraints; the schema from Task 1. Do NOT touch any component or page code.
- Produces: three period pages with working players (rendering is automatic once frontmatter + file exist).

For each period below, run the full Sourcing procedure (Global Constraints), then Steps A–C.

Target pieces (in preference order per period; sacred vocal recordings with free licenses are the scarcest — batch-A warning):

- **gothic-proto-renaissance** (c. 1290–1420): Gregorian/plainchant recording, or a movement of Machaut's *Messe de Nostre Dame* (c. 1365). Chant is inherently ambient; Commons has PD chant recordings.
- **northern-renaissance**: a Josquin des Prez motet (e.g. *Ave Maria… virgo serena*, c. 1485); alternates: any Franco-Flemish polyphony (Ockeghem, Obrecht) with a free recording.
- **renaissance**: Palestrina, *Sicut cervus* (1584); alternates: a Kyrie from *Missa Papae Marcelli*, or Victoria *O magnum mysterium*.

- [ ] **Step A (×3): Source, license-verify, encode** — per the Sourcing procedure; one MP3 per period, named by slug.

- [ ] **Step B (×3): Frontmatter** — append the `music:` block with real values; `composed` uses a display string ("c. 1365" style hedging is fine and matches the site voice).

- [ ] **Step C: Gates + spot check**

Run: `npm run check` — Expected: PASS.
Run: `npm run build` — Expected: PASS, 158 pages.
Dev server: each of the three period pages plays its track; credit line correct.

- [ ] **Step D: Commit (one per period, repo style)**

```bash
git add src/content/periods/<slug>.md public/audio/<slug>.mp3
git commit -m "feat(content): <composer> for <Period Name>"
```

If a period defeats honest sourcing effort (batch-A risk is real), skip it, leave its file/frontmatter absent, and report which alternates you tried and why they failed.

---

### Task 4: Curate batch B — Baroque, Rococo & Neoclassicism, Romanticism, Realism

**Files:**
- Create: `public/audio/baroque.mp3`, `public/audio/rococo-neoclassicism.mp3`, `public/audio/romanticism.mp3`, `public/audio/realism.mp3`
- Modify: the four matching `src/content/periods/*.md` (frontmatter only)

**Interfaces:**
- Consumes: the `music` frontmatter shape and Sourcing procedure from Global Constraints; the schema from Task 1. Do NOT touch any component or page code.
- Produces: four period pages with working players.

Target pieces (preference order per period; all have plentiful PD piano/chamber recordings on Musopen — this is the easy batch):

- **baroque**: Bach, Air from Orchestral Suite No. 3 BWV 1068 (1731); alternates: a slow Goldberg variation / Aria (keyboard), a largo from a Bach concerto.
- **rococo-neoclassicism**: a Mozart andante — Piano Concerto No. 21 K. 467 second movement (1785), or Piano Sonata K. 331 first-movement theme; alternates: a Haydn adagio.
- **romanticism**: a Chopin nocturne — Op. 9 No. 2 (1832) or Op. 27 No. 2; alternates: a Schubert impromptu (Op. 90 No. 3).
- **realism**: a Brahms intermezzo — Op. 118 No. 2 (1893) or Op. 117 No. 1; alternates: a quiet Schumann piano piece (*Träumerei*).

Watch the ambient gate especially on the Mozart concerto movement (orchestral tuttis can push LRA over 12 — if it fails, use the K. 331 solo-piano theme).

- [ ] **Step A (×4): Source, license-verify, encode** — per the Sourcing procedure.
- [ ] **Step B (×4): Frontmatter** — append `music:` blocks with real values.
- [ ] **Step C: Gates + spot check** — `npm run check` PASS; `npm run build` PASS, 158 pages; each page plays in the dev server.
- [ ] **Step D: Commit one per period** — same message shape as Task 3.

---

### Task 5: Curate batch C — Impressionism, Early Modernism

**Files:**
- Create: `public/audio/impressionism.mp3`, `public/audio/early-modernism.mp3`
- Modify: `src/content/periods/impressionism.md`, `src/content/periods/early-modernism.md` (frontmatter only)

**Interfaces:**
- Consumes: the `music` frontmatter shape and Sourcing procedure from Global Constraints; the schema from Task 1. Do NOT touch any component or page code.
- Produces: the last two period pages with working players.

Target pieces:

- **impressionism**: Debussy, *Clair de lune* (1905) or Arabesque No. 1 (1891) — solo piano, Musopen has PD recordings.
- **early-modernism**: quiet pre-1930 modernism, in preference order: a late Scriabin prelude (Op. 74, 1914), Ravel *Pavane pour une infante défunte* (1899, solo-piano version), Satie is taken, Schoenberg *Sechs kleine Klavierstücke* Op. 19 (1911). **Composition must be published before 1930** (site copyright line) and the recording itself free — this is the hardest license hunt after batch A; if only one of the three has a usable recording, that decides it.

- [ ] **Step A (×2): Source, license-verify, encode** — per the Sourcing procedure.
- [ ] **Step B (×2): Frontmatter** — append `music:` blocks with real values.
- [ ] **Step C: Gates + spot check** — `npm run check` PASS; `npm run build` PASS, 158 pages; both pages play in the dev server.
- [ ] **Step D: Commit one per period** — same message shape as Task 3.

---

### Task 6: Final verification + licensing audit

**Files:**
- Modify: none (read-only verification; fix-ups only if something fails)

**Interfaces:**
- Consumes: everything above.
- Produces: a written verification report for Jeff's browse-through.

- [ ] **Step 1: Full gates**

Run: `npm run check` — Expected: PASS.
Run: `npm run build` — Expected: PASS, 158 pages.

- [ ] **Step 2: Licensing audit**

For every period with music, produce a table: period · piece · performer · license · sourceUrl · file size · duration · LRA. Re-verify each `sourceUrl` still shows the claimed license (fetch the page). Every license must be PD/CC0/CC BY/CC BY-SA. Flag anything doubtful rather than papering over it.

- [ ] **Step 3: Behavior sweep in the browser**

Dev server up; on every period page with music: player renders, plays, pauses; play then navigate away → audio stops. On any period WITHOUT music (if a batch skipped one): page renders exactly as before, no player, no console errors. Check one period page on a narrow viewport (≤ 640px) — player stacks vertically, nothing overflows.

- [ ] **Step 4: Report**

Summarize: tracks shipped (with the audit table), periods skipped and why, total repo weight added, anything deferred. Jeff's browse-through is the acceptance test; do not merge — Jeff approves merges explicitly.
