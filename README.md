# 기와 GIWA — launch site

Single-page static site. No build step: host the folder anywhere
(Vercel/Netlify/GitHub Pages) or preview with `node tools/serve.js`
(→ localhost:8137). That server sends `cache-control: no-store` on
purpose — without it Chrome caches heuristically and an edited
css/js file keeps serving the old copy, so your change looks like it
silently did nothing.

**Starting a fresh working session? Read `HANDOFF.md` first** — full
brief, architecture, art-wiring plan, and environment gotchas.

## Deploy

| | |
|---|---|
| repo | `github.com/MTDVEN/hanok` (private, branch `main`) |
| host | Vercel project `hanok`, team `mtdvens-projects` |
| live | `tilesongiwa.com` + `www` (domain at Namecheap) |
| fallback URL | `hanok-five.vercel.app` |

**Push to `main` and it deploys.** The repo is connected to the Vercel
project, and `vercel.json` tells it to run `node tools/build.js` and
serve `dist/`. So `dist/` is NOT committed — it is rebuilt on every
deploy, which is the only way it cannot go stale. `node tools/build.js`
locally does exactly what the deploy does, if you want to check it
first.

`vercel --prod` from this folder also works for an out-of-band deploy.

**What is deliberately not in the repo:** ~176MB of top-level art
masters (`valley*.png`, the traced `*.svg`, the source PNGs) plus
`art/village/_fake`, `/alt` and `/_placeholder`. See `.gitignore` — it
explains each exclusion. **Those masters are not backed up by git.**
They exist only in the working folder; if they matter, back them up
somewhere real.

## Launch-day checklist (all in `js/config.js`)

0. `token.ticker` — Zico has not named it, so the hero, the manifesto
   and the `<title>` all read "$XXX", a placeholder meant to look like
   one. Set it once and `js/main.js` writes it into all three.
   `token.ko` is what the hero WRITES, and it is not free text: every
   character needs brush strokes in `LETTERS` (js/hero.js), because
   the animation is stroke-dashoffset along real paths and a webfont
   glyph has no stroke order to write in.
1. `ca` — the contract address. The floating pill starts copying it.
2. `links` — buy / X / dexscreener / telegram. `null` hides footer links
   and marks hero buttons "at launch".
3. `chart.pool` — the GeckoTerminal pool address. The ledger switches
   from the mock preview to live candles and refreshes every 2 min.
4. `village.marketCap` + `village.holders` — until live wiring exists,
   update these by hand (or call `window.HANOK.setVillage({...})` from
   any script). One roof per $100k, 60 plots, so the field is full at
   $6.0M. `maxRoofs` must equal the number of entries in `PLOTS`, and
   **`PLOTS` is generated — `node tools/plots.js --want N --write`, then
   set `maxRoofs` to the count it prints.** Never hand-edit it.
   `node tools/render.js 60` draws the result without a browser.
   60 is the valley's ceiling under the current rules: `--want` 60, 70
   and 90 all produce the same table.

At deploy (once the domain exists):

5. Make `og:image` in index.html an absolute URL and add `og:url`;
   ship `og.png` (1200x630 screenshot of the hero).
6. Ship `/favicon.ico` + `apple-touch-icon.png` (Safari and most link
   unfurlers ignore the inline SVG icon).

## The art (wired 2026-08-12)

The five paintings live in `art/` as PNGs — copies of the originals in
the project root, renamed to slugs. They are **uncompressed, ~2.6MB
each** by VEN's call; see "Before deploy" below.

- **Background**: `art/scene-bg.png` on the `.scene-backdrop` div at
  the top of `index.html` — a fixed layer behind the hero AND the
  journey that stays put while they scroll; journey.js fades it out
  over the journey's last 14%. Tuning knobs are all in css/site.css:
  `object-position` on `.scene-backdrop img` (crop), `mix-blend-mode`
  + the `background` backing on `.scene-backdrop` (how it marries to
  the paper), and the `.scene-backdrop::after` gradient (the paper
  wash that keeps ink legible over the busy lower half).
- **Journey panels**: each `SPOTS` entry in `js/journey.js` has an
  `img`. The box is `AW`x`AH` (200x200 — the paintings are square);
  its bottom edge sits on the road's ground line. The old inline ink
  drawing is still there as `art` and shows as a stand-in until the
  painting loads.
- **Panel treatment** (`?panels=` in journey.js): the paintings are
  full-bleed squares on their own aged paper, so mounted untreated they
  read as glossy tiles pasted on the landscape. Each one is baked once
  through a canvas at load and served as a blob URL — never as an SVG
  filter or mask, which would re-rasterise every frame and wreck the
  per-frame budget. **`key` is the default** (VEN's pick): it keys the
  ground out entirely so only ink and pigment land on the page, and
  nothing rectangular survives at any position. `feather` softens the
  square away and maps the painting's measured paper onto `--paper`;
  `raw` is the untreated original. **Keep all three** — VEN asked for
  the alternatives to stay available. Knobs (`tone`, `fx`, `ftop`,
  `fbot`, `keylo`, `keyhi`) are URL-overridable for A/B without an edit.
- **Village**: a painted plate (`art/village/field.png`) with ten
  transparent building PNGs (`art/village/b-*.png`) laid over it, one
  per plot, anchored bottom-centre so a plot's `y` is its ground line.
  Which building lands on which plot is **seeded from the contract
  address**, so the village is the same on every visit and a second
  token gets a different one from the same ten files. A plot may also
  carry `hw`/`dp` — the ground it was measured for — and then only the
  buildings that fit it are eligible (HANDOFF §9n). `VARIANTS` (the
  inline ink houses, 140x100 box, ground at y=100) is now only the
  offline/404 fallback. `?art=off` forces it; `?plate=NAME` swaps the
  crop; `?seed=STRING` re-rolls the assignment. A seeded ~30% of the
  dwellings show sleeping Z's above the roof (`?sleep=0` off,
  `?sleep=N` sets the share; nothing under reduced motion).
- **Title**: hand-drawn stroke paths in `js/hero.js` (`LETTERS`,
  100x140 grid, baseline y=128). Change `WORD` + add letters to
  change the name.

### Before deploy

- Optimise `art/*.png` (WebP or resized PNG): background ≤ ~400KB,
  journey panels ≤ ~200KB — they render at ≤ ~500px. Then just change
  the extensions in `index.html` and the four `SPOTS[i].img` paths.
  ~15MB of art on a phone connection is the one real cost left.
- Optimise `art/village/` too: `field.png` is 2.0MB and the ten
  `b-*.png` are 65–730KB. **The sprites must keep agreeing with each
  other on colour**, so do not let `tools/optimize.js` give each one its
  own median-cut palette — see HANDOFF §9h. The `b-*-debug.png` files
  are cut-quality checks and must not ship. (The `state-*.png` chain is
  gone; that route was abandoned in §9e.)
- Keep OUT of the deploy folder:
  - `tools/`
  - the root `*.svg` masters (10–12MB each) **and `valleysvg.svg`**
  - `valley.png`
  - `art/village/field-square.png` (the uncropped master — plots are
    authored in its coordinates, but it is never served) and the
    `field-tall` / `field-wide` comparison crops.

## Placeholder copy

The manifesto section in `index.html` is marked with a comment —
replace with Zico's text when it arrives. Hero tagline + OG meta tags
should get the same pass.

**`SPOTS[i].blurb` in `js/journey.js`** is the biggest one: split mode
puts a paragraph per location on screen, and all four are placeholder
text written only so the layout could be judged. This is the main new
dependency split mode introduces — the road mode only needed two-word
captions.

## QA

- `?motion=1` forces animations on, `?motion=0` forces them off
  (otherwise the visitor's reduced-motion setting decides).
- **`?dev=1` adds a market-cap slider** (`index.html?motion=1&dev=1`) —
  one notch per roof, step buttons, a play button that grows the whole
  village, and `#` to stamp the build-order number on each standing
  roof. Dev only: the loader in `index.html` does nothing without the
  flag and `tools/` is never deployed.
- The hero writes itself only while the tab is visible (browsers pause
  animation frames in background tabs — it resumes on focus).
- `?journey=map|split|road` switches the whole journey section.
  **`map` (default)** is a sheet of map you walk: the camera sits on a
  place, pulls back, travels down a road that inks itself in behind
  you, and settles on the next. `split` is the pinned two-column
  crossfade — copy left, painting right. `road` is the original
  pseudo-3D road. All three kept working. The `?road=` / `?panels=`
  knobs below apply to road mode; `?panels=` also treats the paintings
  in split and map mode.
- **`?map=ink|pirate` picks the sheet, and this is the open decision.**
  `ink` (default) is a Korean 고지도-style map on palette with the rest
  of the site; `pirate` is the treasure-map treatment — burnt edges, a
  sea serpent, a sailing junk — still charting Korea. Both ship until
  the call is made; deleting the loser from `MAPS` in `js/journey.js`
  drops it from `tools/build.js` automatically and saves ~2.1MB.
- Map mode has no info cards (VEN, 2026-08-20 part 2): each place's
  Korean name handwrites itself onto the sheet as you arrive instead —
  the glyphs are Song Myung, the writing is a serpentine mask stroke
  revealed by dashoffset, and scrubbing back un-writes it. `?info=1`
  restores the card column; `?labels=0` hides the names; `?en=1` adds
  a small English caption after the Korean finishes; `?vlabel=0` lays
  names horizontally; `?lsize=24` `?write=.085` tune size and window.
- Map-mode scroll is GLIDED: scroll sets a target and a rAF loop eases
  the camera toward it, which is what melts stepped wheel scrolling.
  `?glide=11` sets the rate, `?glide=0` restores the direct drive (use
  for deterministic QA measurement).
- The trail ahead is FOOTSTEPS (part 10) — prints vanish under the ink
  as walked, return on a scrub. `?trail=dots` restores the dotted line
  wholesale. The hero cross-fades out as the map materialises over it
  (feathered edge + counterpoint fade, part 9/10) — no knobs, it rides
  the section's slide-in.
- The camera rides a SMOOTHED copy of the road (part 7), pulled onto
  the exact road point at each stop — `?camsmooth=.09` sets the
  smoothing window, `0` welds it back to the line. Stops carry
  searched label anchors (elements 3+4) so names land on blank paper;
  regenerate with `maproute --base` as above.
- Map-mode scrolling is CONTINUOUS with the glide (the part-3 drive).
  `?step=1` switches to threshold mode — one band of scroll per stop,
  crossing a boundary plays a timed journey on the rAF clock
  (`?dur=1400` ms/leg) — built to order in part 4 and rejected by VEN
  the same day (the wheel loses authority inside a band). It stays
  working as the way back; don't re-propose it without that context.
- THE PLACES ARE IN THE SHEET (part 6): the ink map carries a painted
  vignette of each location at its stop — arriving at it is the image
  moment. Regenerate the wiring after any sheet re-edit with
  `node tools/maproute.js art/journey/map-ink.png --base <plain-prep>`
  — the `--base` (a prep of `map-ink-master-plain.png`, the
  pre-vignette terrain) finds the stops by difference and emits the
  label side per stop. Never hand-place stops on a vignette sheet, and
  never delete the plain master. `?vista=1` restores the screen-pinned
  painting overlay (off by default; `?vspan=.35` its window);
  `?info=1` the full cards.
- The last `?tail=.042` (20vh) of the pinned scroll walks on a quarter of the way (`?walk=.25`) past Jeonju toward
  the sheet's foot, so its caption comes clear beneath the village
  before the section unpins (HANDOFF §9ab.14); `.journey--map` is
  580vh to give that walk its scroll. `?tail=0` ends the road at the
  last stop as before.
- Map-mode camera: `?cam=follow` (default) / `pan` (constant scale, no
  zoom) / `fixed` (whole sheet — poor by construction on a wide window,
  see HANDOFF §9r). Tuning: `?zoomin=1.65` `?zoomout=1.00` `?dwell=0`
  `?ease=.55` `?zhold=.14` (zoom plateau through each place)
  `?maptone=.16` `?focusx=` (.68 with a vista or
  `?info=1`, else .5) `?focusy=.50` `?cardspan=.40` (must stay under
  0.5) `?walker=0`.
- The map art is generated, and so is the road on it. `node
  tools/mapprep.js <master.png> art/journey/map-NAME.png 1500` turns an
  OpenArt master into the shipped PNG-8; `node tools/maproute.js
  art/journey/map-NAME.png --debug` finds the road and the four stops by
  measuring the sheet and prints the two arrays to paste into
  `js/journey.js`. Never hand-edit those arrays — same rule as `PLOTS`.
- `node tools/heropng.js [word]` draws the hero title's brush strokes
  to a PNG straight from `LETTERS` in js/hero.js — the letterforms are
  checkable without a browser, and the tool cannot drift from what
  ships because it reads the real file. No ink filter: it renders the
  GEOMETRY, which is where a stroke reads as ruled or as drawn.
- **Zico's copy is written on the sheet under each caption**, fading
  in a line at a time on arrival. A watercolour wash was tried under
  it and rejected (HANDOFF §9z). `?copy=strip` moves the copy to
  a note under the map instead.
- **THE CLEARINGS (2026-08-27, HANDOFF §9ab).** Each note is a
  uniform block of the display serif, and its clearing is cut to
  that block plus one margin; outside it the terrain stands. The
  pipeline, in order:
  1. `node tools/maproute.js art/journey/map-ink-solid.png --base
     map-ink-master-plain.png --clear tools/clearings-search.json
     --plan --caption --shape-out tools/shape.json` — the usable rows
     inside VEN's loops (`clearings-search.json`, his markup traced:
     the one hand-drawn thing here; the fourth loop, Jeonju, is the
     one he did not draw), and the English caption's anchor under
     each building (paste its MAP_STOPS: elements 5+6).
  2. `node tools/mapnote.js tools/shape.json` — lays the four notes
     out (the copy from js/journey.js, the words' widths from
     `songmyung-widths.json`), writes `tools/clearings.json` (a
     rounded rectangle `MARGIN` outside each block, plus a small one
     behind any caption that would sit on ink) and prints `MAP_CLEAR`
     to paste over `MAPS.ink.clear`.
  3. `node tools/mapclear.js map-ink-master-nams.png
     map-ink-master-clear.png --clear tools/clearings.json --keep
     map-ink-master-plain.png --debug`, and the SAME loops on the
     plain base: `node tools/mapclear.js map-ink-master-plain.png
     map-ink-master-plain-clear.png --clear tools/clearings.json`.
  4. `node tools/mapprep.js map-ink-master-clear.png
     art/journey/map-ink.png 1800`.
  5. `node tools/maproute.js art/journey/map-ink.png --base
     map-ink-master-plain-clear.png --terrain art/journey/map-ink-solid.png
     --clear tools/clearings.json --debug` — the stops must come back
     at the values in js/journey.js (the path is kept; the seal nudges
     were measured against it). `--terrain` carves the road on the
     pre-clearing sheet, since bare paper is what the seam hunts for.
- **The note is the same block on every device** (VEN: "a uniform
  block of text ... a uniform gap between the edge of the clearing and
  the edge of the block"): `MAP_CLEAR[k]` is `{ box, fs }`, the text
  block and its size in sheet units, from tools/mapnote.js; `setBlock`
  wraps the copy to the box's width at that size and centres it. What
  changes with the screen is only how large the sheet is drawn —
  phones at settle zoom `?pzoom=2.1` (about 11 / 9 / 11 / 8 px), a
  960px window ~21px, wider windows capped at `?dtextmax=32` (the
  block then sits centred a little smaller). Sizes are `SIZE_CAP` in
  tools/mapnote.js (`--sizes 13.5,11,13.5,10`), leading `LH` there and
  `?leading=1.38` here — the two must agree. The camera frames seal,
  name, landmark and note together at every stop, the seal's side
  winning when a short window cannot hold them all (`?frame=0`
  restores seal-centred). `?copy=strip` is the band; `?map=solid` is
  the sheet before the clearings, with the band on phones as before.
- **The hand (HANDOFF §9ab.10–11):** the serif is the default again
  (VEN: "keep the original font"); `?hand=caveat` / `kalam` /
  `patrick` set the caption and the note in a Latin hand, the Korean
  names staying Song Myung. The note writes itself on one brush-stroke
  mask (`?fade=1` for the old line fade); lines sit `?leading=1.5`
  apart (the value tools/mapnote.js plans with — change both). The
  trail is the footsteps alone (`?trail=foot` adds a faint dotted road
  under them, `?trail=dots` is the line alone).
- `node tools/mapbox.js <sheet> <out> cx,cy,hw,up,dn` draws a label's
  REAL footprint on the sheet. **This is the authority when the grid
  and the eye disagree** — a 25px cell statistic cannot see a thin
  ridge line crossing the words, and three rounds of weight-tuning
  lost to one render (HANDOFF §9z). `BLOCK_X` in maproute carries the
  one reviewed override that came out of it.
- `node tools/maproute.js ... --why` dumps the caption-block search —
  best candidates with every score term, the band's ink profile by
  column, and a cell map of the clearing — and, with `--clear`, the
  phone box search as a map of what stopped it (`m` outside the loop,
  `r` road, `b` landmark, `n` name, `#` ink, `s` a ghost of ink). Use
  it before touching any weight: it is how "the clearing under
  Namsangol is seven columns wide and the text needs twelve" was
  established rather than guessed.
- **Re-editing ONE vignette: patch it in, never swap the sheet.**
  OpenArt re-renders the whole page even when the drawing survives, and
  a re-stroked sheet moves stops nobody touched (it moved Jeonju's).
  `node tools/mappatch.js map-ink-master.png <edited>.png <out>.png
  --limit x0,y0,x1,y1 --debug` finds the changed clearing by difference
  and takes only that, keeping every existing stroke from the accepted
  master. Then re-prep, re-route, and confirm the untouched stops come
  back at the values already in `js/journey.js`. `--limit` also keeps a
  growing vignette out of the road's corridor — see HANDOFF §9x.
- `?xfade=` `?textgate=` `?textrise=` `?bgfade=` tune split mode's
  crossfade, the text hand-off gate, its rise, and how fast the
  mountain backdrop hands over to paper.
- Split-mode background polish, each switchable with `=0`:
  `?ghost=.26` (mountain settles to a ghost instead of vanishing),
  `?wash=.20` + `?washsat=2.1` (field tinted with the current stop's
  own pigment colour), `?ground=1` (shadow under the plate),
  `?rule=1` (gutter hairline + one tick per stop). See HANDOFF §5.
- The scrollbar is hidden site-wide and reserves no gutter. MCP/CDP
  screenshots exclude scrollbars, so verify with
  `innerWidth - document.documentElement.clientWidth` (0 = gone), not
  by eye through the browser tools.
- `?panels=key|feather|raw` switches the journey panel treatment
  (`key` is VEN's pick and the default); the tuning knobs above take
  URL overrides too. Keep all three — they are the way back.
- `?road=path|river|line` switches the journey road. `path` (default)
  is a trodden footpath with real width; `line` is the original
  hairline. `?roadw=` sets its half-width, `?stones=.07` turns the
  flagstones on (off by default — over a painted landscape they read as
  cloud shadows). `river` is kept but not recommended: see HANDOFF §5.
- `?enter=` / `?enterover=` (default .03 / .06) control when the journey
  paintings fade in. They hold off until the section heading has
  cleared, because a panel stands on the road and so can never be drawn
  below the horizon, while the heading sits above it — see HANDOFF §5.
- `tools/qa-frame.html` renders the site in an iframe at a real device
  size on a screen too small to show it, e.g.
  `localhost:8137/tools/qa-frame.html?w=390&h=844&s=1` or
  `?w=1440&h=900` (`s` = scale, default fit; `u` = url under test).
  Dev-only — do not deploy `tools/`.
  **Any transform on that iframe kills `mix-blend-mode` in Chrome**, so
  the scaled harness shows bare paper where `.scene-backdrop` should
  be. Set `F.style.transform='none'` to get a truthful render (the
  frame then overflows the screen — that is the trade).
