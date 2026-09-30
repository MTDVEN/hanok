# The crew — Zico's villagers, animated

Branch `crew-test`, started 2026-09-30. Zico, 2026-09-29: *"add some of
the same characters on X around the heading. some building the header,
some sitting at the top with laptops, some transporting tiles around"*
and *"a couple villagers running around the village at the bottom"*.
VEN, the same day, after comparing the two styles: *"Repainting in the
site's ink is a must, then we can adjust the position and quantity of
them later on."* So **everything is ink**, and **every placement is one
line of data** (`SCENE` / `DELIVERY` in `js/crew.js`, `WALKERS` in
`js/villagers.js`).

Zico's second round (2026-09-30): characters smaller, lettering bigger,
$TILES in *"a better font"* (example image not yet received), tiles laid
ON something (never mid-air), and the carriers to *"walk up to the guy
on the ladder, add to a pile of tiles at the bottom of the ladder and
then walk back off frame (where they rendered in from)"*. Done except the
font and the builders, which wait for the font (see Next).

## Look at it

`node tools/serve.js`, then (or on the Vercel preview of the branch):

| URL | what |
|---|---|
| `index.html?crew=ink` | laptop-sitters on $ T I S, and two carriers delivering tiles to a pile, plus villagers on the village paths |
| `&cast=sit,carry,build,village` | pick groups. `build` = the FIRST builders, out of the default until redrawn for the new font |
| `&relay=1` | carriers take turns instead of passing each other |
| `&carryplane=front` | carriers and pile in front of the letters (default behind, so $TILES stays whole) |
| `&title=song` | $TILES in Song Myung |
| `&crewsize=0.5` | people's size (default 0.42; 0.55 on phones ≤560px) |
| `&crewt=12.5` | freeze the scene at 12.5 s (QA: every hand-over can be screenshotted exactly) |
| `&motion=0` | one still moment: the first carrier crouched at the pile |
| `index.html?crew=x` | the laptop-sitters as painted on X — the comparison VEN rejected, kept |

Nothing shows without `?crew=`. The live site is untouched.

## The sets

| set | from | clip | strips | on the page |
|---|---|---|---|---|
| `ink` | Zico's roof post (laptops), repainted | `src/ink-laptops.mp4` | 4 × ~170KB | sit on $, T, I, S |
| `x` | the same, as painted | `src/x-laptops.mp4` | 4 × ~165KB | `?crew=x` only |
| `build` | Zico's tiling post, repainted | `src/builders.mp4` | 640 + 390KB | `?cast=…,build` only (to be redrawn) |
| `carry` | loaded carriers, walking in place | `src/carriers.mp4` | 425 + 300KB | walk IN to the pile |
| `carrye` | the same two, unloaded (edit of the loaded still) | `src/carriers-empty.mp4` | 397 + 278KB | walk OUT, mirrored |
| `drop-m` | ONE-SHOT: the man stacks his A-frame's tiles on the pile | `src/drop-m.mp4` | 465KB (61 frames) | the drop-off; also the pile before/after |
| `drop-w` | ONE-SHOT: the woman sets her tiles on it and pats them | `src/drop-w.mp4` | 296KB (49 frames) | the drop-off; also the pile after |
| `vill` | same cast from the valley's high angle | `src/villagers.mp4` | 108 + 76 + 67KB | walk the village paths |

## The pipeline

1. **Edit, don't generate.** Nano Banana 2 `image2image`, 16:9, 2K:
   Zico's picture (content) + the approved `ink` still (style) → the
   figures alone on flat `#00FF00`, spaced apart so each can be cut.
   New poses take the previous ink stills as references so the cast
   stays one set. **Check every laptop for a logo** — the model added
   Apple's to all four; a second edit removed them.
2. **Loop**: PixVerse V6 `image2video`, 720p, 5s, **the same still as
   startFrame AND endFrame** → the strip loops with no seam. Walkers are
   asked for a *tracking shot* so they walk **in place**.
3. **One-shot actions** (the drop-offs): `node tools/crewstage.js
   art/crew/stage-drop-m.spec.json` builds a START still (the carrier
   exactly as in frame 0 of the loaded walk clip + the pile as it
   stands) and an END still (the same stride, unloaded, + the pile with
   their tiles added), and writes `<name>.stage.json` (where carrier and
   pile sit in the frame). PixVerse with those as start/end frames makes
   the clip; ONE change, ONE facing — **the about-face home is a sprite
   flip in code, never something the video model is asked to turn**.
   Piles: cut from one generated sheet (`src/still-piles.png`, three
   sizes on one footprint). The woman's scene is shifted left in her
   frame (`shift`) so her pile clears the edge.
4. **Cut**: `tools/crew.html?v=art/crew/src/<clip>.mp4&name=<set>&figs=N`
   — WebCodecs decode, green key + despill, magenta recolour (H.264
   chroma ringing), figures found by empty columns over ALL frames (the
   heaviest `figs` kept; specks dropped), one strip per figure.
   `k=` one scale for a whole clip, `h=` one height, `q=` WebP quality,
   `oneshot=1` keeps the last frame (a one-shot's end state),
   `surf=blue` keys a blue stand-in surface (built, unused yet — the
   builder review says use CYAN instead, see Next).
   Used: `ink`/`x` `h=120`; `build` `k=0.42`; `carry`, `carrye`,
   `drop-m`, `drop-w` `k=0.32` (one scale, so hand-overs match);
   `vill` `k=0.14`.
5. **Pace**, for anything that travels: steps × stride off the strip →
   body-heights per second. Carriers loaded 0.52 / 0.60, unloaded 0.63 /
   0.74; villagers 0.97 / 1.03 / 1.45.
6. **Village routes**: `node tools/routes.js --debug`.

### Generation record

| step | historyId | chosen resource |
|---|---|---|
| sitters, green (3) | `31BpeXDMBH7zQSTknQIz` | C `hmNCnxWcjTuV5quYvkUf` |
| logos off (2) | `V2LhaUjX3leB3R52fDBD` | 2 `wbsTtj6fjo4XPkMDjwiQ` → `x` |
| sitters, ink (3) | `OFoorh6SWMxlg5znwBt1` | A `YoLk1NVVyvonjLetDMO0` → `ink` |
| builders, ink (3) | `dEjtXp3Emdw6O6VZZ7SL` | C `rRQc0G4vpOK2PpRBsNsF` |
| carriers, ink (3) | `2jmGLCjOpwz4b9a2nzu3` | C `mySq5my64eCuSLgOWJpl` → `src/still-carry.png` |
| carriers unloaded (3) | `rXBPuAvVMmtFVa3b8GJd` | B `Yj41kXfaYf5ZjjOqQ4f2` → `src/still-carry-empty.png` |
| tile piles (2) | `vvWrPH7cvRyoplFDQ2ID` | B `pRpfgLh3MXAs5bIxumls` → `src/still-piles.png` |
| villagers, ink (3) | `5uuTkHlk1h1NWqEcC1Ig` | A `0gxZDWw68g85h6xcPDfD` |
| loop clips | `oU96zJhdPwq2vmhxRqjB` x · `iNkqFW58surUEXtC9Kqb` ink · `O7Pn3jujZCCd0DLBdsBd` builders · `ns5qdOVk0yS8WjwlRxEj` carriers · `rTq29WKhgrQpqH9OwJC9` carriers unloaded · `ufOWjxG9EUB1JWnaNbMa` villagers | |
| drop-offs | `wewepZDqdfIctc7Xr55b` man (5s) · `Mf1EOSBQvWonclnJemym` woman (4s) | |

1,206 credits in all; 2,794 left. One generation at a time.

## How the page does it

- **Frame box**: each figure is a box one frame wide whose *background*
  is the strip, stepped by `background-position`; a mirror is
  `scaleX(-1)` on that box.
- **Standing on the ink, not on boxes**: `js/hero.js` rasterises the
  title once (the brush strokes fully written, filter and all; a
  webfont with fillText) and publishes `topAt / profile / inkIn`.
  Figures rest on the highest ink under their contact span, sunk 1.5
  units, sliding to the flattest spot nearby. (The $ sitter had been
  floating 15 units over the curve, because the $'s box top is its stem.)
- **The delivery** (`deliver()` in `js/crew.js`): each carrier = loaded
  walk in → drop-off clip → mirrored unloaded walk out, all placed in
  ONE clip-frame coordinate system (scale `Sc`), so the three strips
  hand over on the same pixels. The pile between visits is a clip-path
  window onto the drop strips' own first/last frames. One clock,
  **kept in integer ticks of 1/12 s**; `render(t)` is a pure function of
  it (no timers; paused tabs resume in place). The walk-in's strip phase
  is set so its last tick is the loop's last frame and the drop clip's
  frame 0 follows exactly. The pile resets only while everyone is ≥4
  pile-widths away. The site: every clear stretch of the ground line
  (on the raster) that fits the pile; winner = least ink over the
  crouching carrier (brush: under the T's right arm).
- **Sizes**: title `min(760px, 92vw)` (was 560 / 84vw); people 0.42 of
  the letters' median height, 0.55 on phones.

## Traps found on the way

- **Chrome defers media loading in hidden tabs** → WebCodecs + mp4box.js.
- **H.264 halves colour resolution** → yellow edges (G despill) and
  magenta ringing (recoloured to the figures' warm chroma at the same
  brightness).
- **An `<img>` strip sliding in a clipped window VANISHED when
  mirrored** → background-strip boxes.
- **Two clocks disagree by 1e-15 s**: in seconds, a carrier's own
  phase and the pile's reached the same boundary by different sums; for
  one frame the woman was still walking while the pile thought her drop
  had begun, and the pile vanished. Integer ticks fixed it.
- **`String.replace` with a replacement containing `$'`** (as in "the
  $'s box") inserts the rest of the file: patch scripts must pass a
  function, `s.replace(a, () => b)`.
- **Headless `--screenshot` fires before big images decode** → capture
  over CDP in real time; **the extension's screenshots are unusable
  here** (see memory `hanok-qa-headless`).

## Next

- **The font** — Zico's example image hasn't come through yet. Once it
  is chosen: set the title size from a ~130px desktop cap, check case
  (Zico wrote "$Tiles"; lookups are case-insensitive, but lowercase
  tops change every contact), re-check the pile site.
- **Builders v2, after the font** (review of 2026-09-30): the ladder is
  only ~0.55 of the letter at the new size, and both builders lay tiles
  on air. Composite a flat CYAN (not blue: H.264 leaves a teal hairline
  between blue and green) stand-in cut from the real glyph's edge into
  the edit input, one builder per still, 9:16 for the ladder man with
  the ladder drawn longer than any cap (clip it at the baseline on the
  page); the ladder stands just right of the pile.
- Weight: 8fps for the slow sets; drop `x` when no longer wanted.
