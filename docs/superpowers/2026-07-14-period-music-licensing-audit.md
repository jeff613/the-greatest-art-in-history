# Period Music — Licensing & Ambience Audit

Date: 2026-07-14 (state at merge of the period-music feature)
Spec: `specs/2026-07-13-period-music-design.md` · Plan: `plans/2026-07-13-period-music.md`

Every recording's license was verified to cover the **recording/performance**
(not just the composition) on its source page at curation time, then
independently re-verified by a reviewer agent per task, then re-fetched once
more in a final 10/10 audit sweep. Ambience gate: loudness range (LRA, via
`ffmpeg -af ebur128`) ≤ 12 LU; duration ≥ 2 min. `sourceUrl` in each period's
frontmatter is the exact page for the file actually used.

| Period | Piece · Performer | License | Duration | Size | LRA |
|---|---|---|---|---|---|
| Gothic & Proto-Renaissance | *Rorate Caeli* (Gregorian chant) · Inritter | CC BY-SA 4.0 | 2:22 | 2.1 MB | 9.6 |
| Northern Renaissance | Clemens non Papa, *Ego Flos Campi* · The Tudor Consort | CC BY 3.0 | 3:28 | 2.7 MB | 10.6 |
| Renaissance | Palestrina, *Missa Papae Marcelli* — Kyrie · European Archive Music | CC0 | 3:33 | 1.9 MB | 7.3 |
| Baroque & Dutch Golden Age | Bach, Air BWV 1068 · USAF Strings | PD (US gov work) | 3:03 | 3.4 MB | 10.1 |
| Rococo & Neoclassicism | Haydn, Hob. XVI:46 — II. Adagio · Ivan Ilić | CC BY 3.0 | 6:20 | 5.4 MB | 12.0 |
| Romanticism | Schubert, Impromptu Op. 90 No. 3 · Chiara Bertoglio | CC BY 3.0 | 5:57 | 4.5 MB | 11.5 |
| Realism | Schumann, *Träumerei* (guitar) · Edigar Monteiro | CC BY-SA 3.0 | 2:38 | 2.8 MB | 7.2 |
| Impressionism | Debussy, *Première Arabesque* · Patrizia Prati | CC BY-SA 4.0 | 4:52 | 3.5 MB | 11.7 |
| Post-Impressionism | Satie, Gymnopédie No. 1 · Daria Baiocchi | CC BY-SA 4.0 | 3:11 | 1.2 MB | 11.1 |
| Early Modernism | Holst, *The Planets* — II. Venus · USAF Heritage of America Band | PD (US gov work) | 8:20 | 7.3 MB | 12.1 † |

† Shipped under Jeff's explicit 0.1 LU waiver of the ≤ 12 gate (2026-07-14),
after the preferred Scriabin Op. 74 recordings failed objectively (durations
1:30/1:27 < 2 min; LRA 18.9/20.9).

Total audio weight: ~34 MB. CC BY / CC BY-SA attribution is satisfied by the
rendered credit line (performer + source link + license linked to its deed).

## Pre-deploy caveats (also in AGENTS.md backlog)

- `baroque.mp3` and `early-modernism.mp3` are **PD in the US only**
  (17 U.S.C. §105 government-work doctrine) — same shape as the Picasso EU
  caveat; resolve before any EU-reachable deploy.
- `northern-renaissance.mp3`: Commons file page carries a pending
  `{{Licencereview}}`; CC BY 3.0 independently confirmed at its Free Music
  Archive origin. Re-check before deploy.
- Weakest provenance link: the Gothic chant is a Commons "own work"
  self-declaration (uploader = performer); nothing further is verifiable.

## Notable curation history

- Chopin (3 recordings) and *Clair de lune* (2 recordings) failed the LRA gate
  in every free recording found — hence Schubert and the Arabesque.
- Two Commons uploads tagged "public domain from musopen.com" were rejected
  after embedded metadata traced them to non-free origins (Piano Society; a
  performer's copyrighted album). Cross-check `ffprobe` tags on any re-upload.
- MIDI/synthesized realizations were rejected as not being genuine recordings
  (a MIDI Mozart briefly shipped and was replaced by the Ilić Haydn).
- Early Modernism went Ravel (sax+piano, owner-vetoed: too impressionist,
  1899) → Elgar (interim) → Holst Venus (owner-chosen with waiver).
