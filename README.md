# HANOK — launch site

Single-page static site. No build step: host the folder anywhere
(Vercel/Netlify/GitHub Pages) or preview with `node tools/serve.js`
(→ localhost:8137). That server sends `cache-control: no-store` on
purpose — without it Chrome caches heuristically and an edited
css/js file keeps serving the old copy, so your change looks like it
silently did nothing.

**Starting a fresh working session? Read `HANDOFF.md` first** — full
brief, architecture, art-wiring plan, and environment gotchas.

## Launch-day checklist (all in `js/config.js`)

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
- `?journey=split|road` switches the whole journey section. `split`
  (default) is the pinned two-column crossfade — copy left, painting
  right. `road` is the original pseudo-3D road, kept working. The
  `?road=` / `?panels=` knobs below apply to road mode; `?panels=` also
  treats the paintings in split mode.
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
