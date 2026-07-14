# Timeline Extension — "Before and After"

Date: 2026-07-13
Status: Approved pending user review
Prior specs: 2026-07-13-collection-expansion-design.md (all conventions carry over).

## Purpose

Bracket the existing 8-period timeline (Renaissance → Post-Impressionism) with three
new eras: one before, two after. Grows the museum from 8 periods / 26 artists /
91 works to **11 periods / 33 artists / 112 works**.

## The new wings

| Order | Period | Years | Artists (3 works each) |
|---|--------|-------|------------------------|
| 1 | **Gothic & Proto-Renaissance** | c. 1290–1420 | Giotto · Duccio |
| 10 | **Symbolism & Fin de Siècle** | c. 1886–1918 | Klimt · Munch |
| 11 | **Early Modernism** | c. 1905–1929 | Picasso · Kandinsky · Matisse |

Existing periods renumber to orders 2–9 (unchanged otherwise).

Works (subject to the image floor; rule-4 substitution applies):
- **Giotto**: The Lamentation (Scrovegni Chapel), The Kiss of Judas (Scrovegni),
  Ognissanti Madonna (Uffizi).
- **Duccio**: Maestà, central panel (Museo dell'Opera del Duomo, Siena), Rucellai
  Madonna (Uffizi), Madonna and Child / "Stoclet Madonna" (Met, CC0 — the $45M+
  2004 purchase story).
- **Klimt**: The Kiss (Belvedere, Vienna), Portrait of Adele Bloch-Bauer I (Neue
  Galerie — Woman in Gold restitution story), Judith I (Belvedere).
- **Munch**: The Scream (1893 tempera, National Museum, Oslo), Madonna (1894–1895),
  The Sick Child (1885–1886, National Museum, Oslo).
- **Picasso**: The Old Guitarist (1903–1904, AIC CC0), Les Demoiselles d'Avignon
  (1907, MoMA), Family of Saltimbanques (1905, NGA).
- **Kandinsky**: Composition VII (1913, Tretyakov), Composition VIII (1923,
  Guggenheim), Improvisation 28 (second version) (1912, Guggenheim).
- **Matisse**: The Dance (1910, Hermitage), Woman with a Hat (1905, SFMOMA),
  The Joy of Life (1905–1906, Barnes Foundation). Matisse scans are the round's
  biggest sourcing risk — substitute freely within his pre-1930 catalogue.

## Copyright rules for Early Modernism (binding)

- **Pre-1930 works only.** No exceptions — this is the US public-domain line.
- Picasso (d. 1973): pre-1930 works are PD in the US but remain copyrighted in the
  EU until 2044. `imageLicense` must say so explicitly:
  `"Public domain in the US (published before 1930); may remain under copyright in the EU"`.
- Matisse (d. 1954) and Kandinsky (d. 1944): PD in both US and EU; use standard
  wording (or the source museum's CC0 wording).
- The site is local-only today. **Before any public deploy, the Picasso EU caveat
  must be revisited** — recorded in the deploy checklist (memory backlog).
- Hockney (living), Rockwell (d. 1978), and post-1929 Hopper are excluded until
  their copyrights allow; revisit list recorded for the future.

## Everything else unchanged

Content standards, image floors and sourcing procedure, story sections, year-string
convention, check/build gates, plain-git storage, per-artist task shape with
per-task fact-check reviews — all identical to the collection-expansion spec.
The 24-room walk cap already handles the larger pool; the daily pick adapts by
modulo. Site code changes: none beyond the three period files and renumbering.

## Acceptance

- 11 period pages in chronological ledger order; 33 artist pages; 112 work pages.
- `npm run check` + `npm run build` green (build page count = 1+1+11+1+33+112 = 159).
- Early Modernism work frontmatter carries the correct license wording per above.
- Jeff's browse-through.

## Out of scope

Deployment prep; any post-1929 work; Schiele, Rousseau, Mondrian, Klee, Gauguin,
Seurat, El Greco, Ingres, Watteau, Holbein (wait-list, unchanged).
