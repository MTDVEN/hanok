# The crew — Zico's villagers, animated

Branch `crew-test`, started 2026-09-30. Zico, 2026-09-29: *"add some of
the same characters on X around the heading. some building the header,
some sitting at the top with laptops, some transporting tiles around"*
and *"a couple villagers running around the village at the bottom"*.
VEN, the same day, after comparing the two styles: *"Repainting in the
site's ink is a must, then we can adjust the position and quantity of
them later on."* So **everything is ink**, and **every placement is one
line of data** (`SCENE` in `js/crew.js`, `WALKERS` in
`js/villagers.js`).

## Look at it

`node tools/serve.js`, then (or on the Vercel preview of the branch):

| URL | what |
|---|---|
| `index.html?crew=ink` | **the whole cast**: laptop-sitters on $ T I S, a ladder and a tile-layer on L and E, two carriers bringing tiles, and villagers walking the village paths |
| `&cast=sit,build,carry,village` | show only some groups (any subset) |
| `&title=song` | $TILES set in Song Myung (Zico's other ask); everyone sits on those glyphs |
| `&crewsize=0.7` | people's size (the approved sitter was 0.62 of the T) |
| `&motion=0` | everyone holds still (carriers stand part way along) |
| `index.html?crew=x` | the laptop-sitters only, as painted on X — the comparison VEN rejected, kept |

Nothing shows without `?crew=`. The live site is untouched.

## The sets

| set | from | clip | strips | on the page |
|---|---|---|---|---|
| `ink` | Zico's roof post (laptops), repainted | `src/ink-laptops.mp4` | 4 × ~170KB | sit on $, T, I, S |
| `x` | the same, as painted | `src/x-laptops.mp4` | 4 × ~165KB | `?crew=x` only |
| `build` | Zico's tiling post, repainted | `src/builders.mp4` | ladder 640KB, kneeler 390KB | ladder on the L (mirrored), tile-layer on the E |
| `carry` | new pose, same hand | `src/carriers.mp4` | 425 + 300KB | walk the foot of the letters BEHIND the ink |
| `vill` | same cast from the valley's high angle | `src/villagers.mp4` | 108 + 76 + 67KB | walk the village paths |

Heading cast ~2.4MB, village ~250KB. The obvious next saving is 8fps
(40 frames) for the slow sets — about a third off.

## The pipeline

1. **Edit, don't generate.** Nano Banana 2 `image2image`, 16:9, 2K:
   Zico's picture (content) + the approved `ink` still (style) → the
   figures alone on flat `#00FF00`, spaced apart so each can be cut.
   New poses (carriers, village walkers) take the previous ink stills
   as references so the cast stays one set. **Check every laptop for a
   logo** — the model added Apple's to all four; a second edit removed
   them.
2. **Loop**: PixVerse V6 `image2video`, 720p, 5s, **the same still as
   startFrame AND endFrame** → the clip ends where it began, so the
   strip loops with no seam. Walkers are asked for a *tracking shot*
   (camera moves with them) so they walk **in place** — measured
   afterwards: torso drift ≤ 3px.
3. **Cut**: `tools/crew.html?v=art/crew/src/<clip>.mp4&name=<set>&figs=N`
   — WebCodecs decode (hidden tabs never load a `<video>`), green key
   with an edge despill, figures found by the empty columns between
   them over ALL frames, one strip per figure. `k=` keeps every figure
   of a clip at ONE scale (a ladder stays taller than the kneeler next
   to it); `h=` forces one height instead; `q=` WebP quality (0.8).
   Used: `ink`/`x` `h=120`, `build` `k=0.42`, `carry` `k=0.32`,
   `vill` `k=0.14`.
4. **Pace**, for anything that travels: count steps and stride in the
   strip (the foot spread oscillates; its peaks are steps) → body-
   heights per second. Carriers 0.52 / 0.60, villagers 0.97 / 1.03 /
   1.45 (the child runs). Move them at exactly that and the planted
   foot does not slide.
5. **Village routes**: `node tools/routes.js --debug` finds the dirt
   paths by colour and walks the cheapest line through them between
   waypoints → `art/village/routes.json` (+ a debug overlay in
   `art/village/_work/`). Add a route = add waypoints, re-run.

### Generation record

| step | historyId | chosen resource |
|---|---|---|
| sitters, green (3) | `31BpeXDMBH7zQSTknQIz` | C `hmNCnxWcjTuV5quYvkUf` |
| logos off (2) | `V2LhaUjX3leB3R52fDBD` | 2 `wbsTtj6fjo4XPkMDjwiQ` → `x` |
| sitters, ink (3) | `OFoorh6SWMxlg5znwBt1` | A `YoLk1NVVyvonjLetDMO0` → `ink` |
| builders, ink (3) | `dEjtXp3Emdw6O6VZZ7SL` | C `rRQc0G4vpOK2PpRBsNsF` (B had floating legs) |
| carriers, ink (3) | `2jmGLCjOpwz4b9a2nzu3` | C `mySq5my64eCuSLgOWJpl` (A/B leaked laptop-sitters in) |
| villagers, ink (3) | `5uuTkHlk1h1NWqEcC1Ig` | A `0gxZDWw68g85h6xcPDfD` (the steepest angle) |
| clips | `oU96zJhdPwq2vmhxRqjB` x · `iNkqFW58surUEXtC9Kqb` ink · `O7Pn3jujZCCd0DLBdsBd` builders · `ns5qdOVk0yS8WjwlRxEj` carriers · `ufOWjxG9EUB1JWnaNbMa` villagers | |

860 credits in all (2K stills 30 each, clips 70). 3,140 left. The
account runs **one generation at a time** (`PARALLEL_LIMIT_EXCEEDED`).

## How the page does it

- **Frame box**: each figure is a box one frame wide whose *background*
  is the strip, stepped by `background-position` with
  `steps(n, jump-none)`. A mirror is `scaleX(-1)` on that box.
- **Placement** (`js/crew.js`): `js/hero.js` publishes every letter's
  ink box (`window.HANOK_HERO.ready`); a figure is pinned by one point
  of its strip to one point of a letter, in % of the title box, at one
  human scale (head height per set, `HEAD_PX`).
- **Three planes**: carriers behind the ink, the ink, everyone else in
  front. A person is nearly as tall as a letter — walking in front,
  they blotted out $TILES.
- **Village** (`js/villagers.js`): walkers share a ground-line z-order
  with the houses (so they pass behind them), face the way they walk,
  pause at a route's end and turn back; soft ink shadow underneath so
  tan cloth reads on a tan path.
- Everything pauses off screen; `?motion=0` holds still.

## Traps found on the way

- **Chrome defers media loading in hidden tabs** → WebCodecs + mp4box.js.
- **H.264 halves colour resolution** → yellow edges where skin meets
  green; `crew.html` warms G toward mean(R,B) within 2px of the edge.
- **An `<img>` strip sliding in a clipped window VANISHED when
  mirrored** — Chrome dropped a 7920px image hanging thousands of px
  off-screen, depending on where it sat (fine on the brush title, gone
  on Song Myung). The individual `scale` property made it worse. The
  background-strip box above has nothing laid out off-screen.
- **Headless `--screenshot` fires before big images decode** (figures
  missing at random). Capture over CDP in real time instead
  (`captureScreenshot` after load; scroll with `scrollIntoView`).
- **The extension's screenshots are unusable here** (hidden tab):
  see memory `hanok-qa-headless`.

## Next

- VEN tunes placement and numbers (`SCENE`, `WALKERS`, `?crewsize`).
- Weight: 8fps for sitters/builders; drop `x` once it is no longer
  wanted for comparison.
- More village life when the roofs rise (walkers ≈ roofs, per the old
  PLAN) — a `WALKERS` list per market-cap band.
