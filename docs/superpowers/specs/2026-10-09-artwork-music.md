# Artwork, artist and period music

Artwork pages in both languages reuse PeriodMusic above the story. Playback
starts only on Listen. Another piece cycles the eligible recordings, preserving
whether the listener was playing or paused. Navigation stops audio. Period pages
retain their original opening recording and offer the same icon-only control,
with alternatives drawn from their artworks' eligible tracks, deduplicated by
audio file. Both languages use the same ordering.
Artist pages offer the same control above the biography, using the deduplicated
music choices associated with their artworks' dates.

`src/lib/artwork-music.ts` holds overlapping listening windows, separate from the
frozen collection schema. These are curatorial associations, not claims that a
piece existed in the exact year a painting was made. Composition dates remain
visible. Medieval chant spans a long tradition; later choices span neighbouring
decades within a musical era. A stable artwork-slug hash varies the opening track
and keeps the same choice across languages. All 163 artworks have 2-4 choices.
The existing ten tracks reuse the period metadata and Chinese translations.

## Four added recordings

Verified 2026-10-09. Each is a human performance. Exact source-file pages:

- [Resurrexi](https://commons.wikimedia.org/wiki/File:The_Tudor_Consort_-_02_-_Introit_-_Resurrexi_et_Adhuc_Tecum_Sum.ogg): The Tudor Consort, traditional Gregorian Easter introit, CC BY 3.0. [Original FMA license](https://freemusicarchive.org/music/The_Tudor_Consort/Giovanni_Animuccia_Missa_Victimae_Paschali_Laudes/02_Introit_-_Resurrexi_et_Adhuc_Tecum_Sum/). Metadata confirms performer and source; no conflicting copyright tag.
- [Du Fay, Se la face ay pale](https://commons.wikimedia.org/wiki/File:Guillaume_Dufay_-_Se_La_Face_Ay_Pale.ogg): Asteria, 15th century, CC BY-SA 2.5. Commons upload identifies Asteria and explicitly licenses the recording; no embedded copyright or performer tags to independently corroborate. [Asteria's own site](https://asteriamusica.org/reviews.html) corroborates this repertoire and voices/lute instrumentation. Provenance remains the Commons uploader's declaration.
- [Lobo, Versa est in luctum](https://commons.wikimedia.org/wiki/File:The_Tudor_Consort_-_06_-_Alonso_Lobo_-_Versa_est_in_Luctum.ogg): The Tudor Consort, Alastair Carey, 1598, CC BY 3.0. [FMA original](https://freemusicarchive.org/music/The_Tudor_Consort/Live_in_Concert/06_Versa_est_in_Luctum/) verified by fetching HTML, including its BY 3.0 deed. Embedded artist/title/copyright agree. [Score catalogue date](https://imslp.org/wiki/Versa_est_in_luctum_(Lobo%2C_Alonso)).
- [Gibbons, Out of the Deep](https://commons.wikimedia.org/wiki/File:The_Tudor_Consort_-_01_-_Orlando_Gibbons_-_Out_of_the_Deep.ogg): The Tudor Consort, Alastair Carey, early 17th century, CC BY 3.0. [FMA original](https://freemusicarchive.org/music/The_Tudor_Consort/Live_in_Concert/01_Out_of_the_Deep/) corroborates license, performer, conductor and human performance. Embedded tags agree. Use this 2010 recording, not the different 2005 Commons recording whose page has conflicting composer attribution.

The three Tudor Consort Commons uploads have pending license reviews; original
FMA licenses were checked separately. Recheck before public deployment, alongside
the existing period-music audit's US-only and pending-review caveats.

## Encoding and ambience

Original Ogg recordings downloaded from upload.wikimedia.org. MP3 encoding:
`ffmpeg -i original.ogg -codec:a libmp3lame -q:a 4 output.mp3`.
Du Fay and Gibbons additionally use `-af loudnorm=I=-23:LRA=9:TP=-2` before
encoding to reduce volume swings for background listening. Their original LRA
was 12.4 and 14.8 LU respectively. Rendered credits disclose adjusted loudness
and dynamics, and link the original license. The Du Fay derivative remains
CC BY-SA 2.5. No cuts, looping extensions, MIDI or synthesized performances.

Final files measured with `ffmpeg -af ebur128`:

| File | Duration | Bytes | LRA |
| --- | --- | --- | --- |
| dufay-se-la-face.mp3 | 2:45.53 | 2,676,788 | 10.5 LU |
| lobo-versa-est.mp3 | 4:52.34 | 3,787,238 | 10.9 LU |
| gibbons-out-of-the-deep.mp3 | 5:28.61 | 4,346,252 | 10.3 LU |
| resurrexi.mp3 | 5:00.41 | 4,859,463 | 9.8 LU |

All final files meet duration >= 2 min, LRA <= 12 LU and size <= 10 MB.
Addition: 15.7 MB (decimal). Existing period tracks were not re-encoded.

## Layout and controls

Listen and the icon-only next-piece button stay together in one control group.
The icon has a localized accessible name and tooltip, an 8px gap from Listen,
and a 32px square hit area. Credits sit alongside on wide screens and below on
phones, with an explicit line height so Chinese biography typography does not
change their spacing. Track changes update the visible attribution and label.

Top spacing belongs to the containing page: period headers supply 1.1rem below
the title; artwork and artist players start at the reading-room inset. Artist
controls align with the adjacent painting on wide screens. The first artwork
story heading omits its normal inter-section top spacing, avoiding a double gap
after the player. Later story headings retain their established spacing.

## Validation

- `npm run check`: content/image checks and all 223 Chinese entries pass.
- `npm run build`: all 452 pages build successfully.
- All 163 artwork playlists have 2-4 choices, use existing audio files, and
  match across languages. All 14 recordings appear as opening selections.
- All 60 artist/period playlists have alternatives, no duplicate files, and
  identical ordering across languages.
- Chromium playback checks: play/pause, changing tracks while paused or playing,
  navigation cleanup, English/Chinese controls, and mobile overflow.
- Spacing audit: 80 track layouts across representative artwork, artist and
  period pages at 320, 390, 768 and 1440px in both languages. No horizontal
  overflow or control/credit overlap; button centers align. Desktop and phone
  screenshots were visually reviewed, including the long Holst credit.

Native iOS Safari playback was not retested in this change.
