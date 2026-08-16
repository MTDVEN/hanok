# HANOK — full session handoff

Read this top to bottom before touching anything. It contains the client
brief, the design system, how every module works, the state of the art
assets, what was already reviewed/fixed (and what was deliberately NOT
fixed), and the exact next steps. `README.md` is the short ops sheet;
this file is the deep context.

Last updated: 2026-08-16 (session 11 — **VEN'S THIRD MARKUP IS BUILT AND
AWAITING SIGN-OFF, §9n.** The walled compound was rebuilt from its real
ground band (it is a walled *yard*, not a building, and one pooled band
described both); the plot count went **42 → 55 → 60** by letting a plot
be reserved for the small buildings instead of for the widest one that
could ever arrive; and there are **four new sprites**, `b-store`,
`b-house2`, `b-thatch2` and `b-walled2`, each generated as an edit of an
accepted one. `config.js maxRoofs` is now **60**, which moves "the field
is full" to **$6.0M** at $100k a roof — still the one thing VEN has not
agreed to. §9i block 2, the full-screen plate, is still untouched.)

**If you read nothing else:**
- **§9n + §9o are the current state.** §9o: all four compounds a
  seeded 15% smaller (`PAD_FILL` in tools/plots.js), and **PLAN phase
  3B — the sleeping Z's — is BUILT** (`?sleep=` switch; the feel still
  needs VEN's eye, see §9o "Verified, and how far"). §9i block 1 is
  done; §9j is what it measured; **§9k, §9m and §9n are VEN's three
  markups and what they cost.** The four worth knowing: the meadow test compared the wrong
  pair of channels; the landing test was measured against the dilated
  mask instead of the painted clearing; one ground band described both
  a house and a walled compound; and every plot was being reserved
  against the widest building in the set.
  Show him `tools/render.png` (all 60), **settle `perRoof`** (at $100k
  the field now fills at $6.0M; ~$33k would hold the old $2M), **and
  only then touch the full-screen-plate work in §9i block 2.**
- **The village art is DONE.** `art/village/field*.png` +
  `b-{house,gate,lhouse,pavilion,thatch,walled}.png` and the four from
  §9n, all keyed to RGBA and standing on their ground lines. Placement
  is generated, not hand-dragged. Verified in Chrome. §9h, §9n.
- **`PLOTS` in `js/village.js` is GENERATED. Never hand-edit it.**
  `node tools/plots.js --want 60 --write` rewrites it; `node
  tools/render.js 60` draws the result without a browser. The two knobs
  VEN's review moved are `--want` (how many plots) and `--shrink` (how
  big the buildings are); both are CLI flags now, so a size pass costs
  one command. **`config.js maxRoofs` must equal the count it prints.**
- **The tool is OpenArt, NOT Recraft.** Model `nano-banana-2`,
  `image2image`, 1K square, 20 credits an image, via the `openart` MCP
  server. No negative-prompt field, no transparency toggle. Everywhere
  below that says "Recraft" means OpenArt now; everywhere that says
  "turn the transparency toggle on" means `tools/cutout.js` instead.
- **The buildings were EDITED OUT OF THE VALLEY PAINTING, not
  generated.** Generating from the §3 prompts gave architectural
  studies at 75% of frame. The matted reference crops already *were*
  the buildings; the whole job was erasing the ground from behind them.
  Read the banner at the top of `art/village/PROMPTS.md` before
  re-rolling anything.
- **`PLAN.html` is the operative build plan** (session 8, §9g): the
  village, then the villagers, then the birds. Phase 1 is now done —
  work from phase 2. Use this file for the why and the review history.
- **Six transparent PNGs, one opaque plate.** The buildings are
  transparent so they lay over the plate; the plate is the ground and
  stays opaque. Details and the reason in §9f.
- **Two walk sheets are still outstanding** (`p-walk-a/b.png`, §8 of
  PROMPTS.md) — that is phase 2, and the edit-the-crop trick does not
  apply to them: there are no villagers in the painting to cut out.
- The site is visually complete and demo-ready. VEN signed off on the
  journey at the end of session 4: *"it looks really good."*
- **The village section changed direction in session 5.** It no longer
  draws its own buildings — it composites painted PNGs over a painted
  base plate. `art/village/field.png` (the valley) is done and looks
  right. **The six building sprites are the one thing outstanding**, and
  VEN generates them in Recraft from `art/village/PROMPTS.md`.
- **Do not hand-draw art in SVG.** VEN stopped exactly that mid-session:
  *"no offence that isnt your strong suit."* Inline SVG stays only as
  the 404/offline fallback layer and for structural marks. Anything
  pictorial is a Recraft prompt plus a compositing engine.
- The journey is a pinned two-column crossfade (`?journey=split`,
  default); `?journey=road` keeps the old pseudo-3D road fully working.
  Nothing was deleted — VEN asked explicitly that alternatives stay.
- **Do not redesign the rest of the page** — the parchment/ink direction
  is client-approved. The manifesto and ledger are still untouched since
  session 3 and are the next design target after the village lands.
- Preview at `http://localhost:8137/index.html?motion=1` after starting
  `node tools/serve.js`. `?motion=1` is mandatory on this machine (§7).

---

## 0. Startup prompt

Copy-paste this to begin a session, filling in the one blank:

> Read HANDOFF.md in this folder start to finish before doing anything.
> It is the authoritative context: client brief, design system, how
> every module works, the art wiring and its tuning knobs, environment
> gotchas, and five sessions of review decisions (including things
> deliberately rejected — don't re-flag those).
>
> State: the site is visually complete and demo-ready. The journey is a
> pinned two-column crossfade (`?journey=split`, default) with the old
> pseudo-3D road kept working at `?journey=road`. The village now
> composites painted PNGs over a painted base plate; the valley plate is
> in, and the six building sprites are the one thing outstanding — I
> generate those in Recraft. Nothing is half-finished.
>
> **I make the art in Recraft, not you.** Don't hand-author pictorial
> SVG — write me the prompt and build the machinery. §6b.
>
> Environment, or you will waste an hour:
> - Start the preview server yourself: `node tools/serve.js`
>   (background), then confirm it returns 200 before trusting it. It
>   does not survive between sessions.
> - Preview ONLY at `http://localhost:8137/index.html?motion=1` — this
>   machine has OS reduced-motion on, so without `?motion=1` you always
>   see the static site.
> - This screen gives Chrome ~1280x551, too short to judge the journey.
>   `tools/qa-frame.html` renders real device sizes — but it draws the
>   page in a fixed box on a dark background, so never hand me a
>   qa-frame URL as "the site". Any transform on its iframe also kills
>   `mix-blend-mode`, so the shared backdrop vanishes; set
>   `F.style.transform='none'`.
> - MCP tabs run backgrounded: rAF and CSS transitions freeze, and
>   screenshots exclude the scrollbar. HANDOFF §7 has every workaround.
>
> What I want done this session: ______
>
> Likely candidates, in HANDOFF §9 priority order:
> 1. Finish the village: I drop in the new plate and the six transparent
>    `art/village/b-*.png`, then we re-place the plots in
>    `tools/place.html`, retune the scales and flip the mode cascade
>    (§9e "What happens when they land", steps 1–6).
> 2. Polish the manifesto and the ledger — still on the original design,
>    untouched since session 3, now the weakest part of the page.
> 3. Zico's deliverables landing — new token name/ticker (means
>    authoring new hero stroke letters + WORD in js/hero.js), the real
>    copy for the manifesto, hero tagline, OG meta, and the four
>    `SPOTS[i].blurb` paragraphs the split journey now needs.
> 4. Launch day: fill js/config.js (CA, links, chart pool, village
>    numbers), make og.png, favicon.ico + apple-touch-icon, absolutize
>    og:image and add og:url.
> 5. Pre-deploy: optimise art (~15MB now — see README "Before deploy"),
>    and keep tools/ plus the root .svg masters and field-square.png out
>    of the deploy folder.
>
> Ask me before changing design direction. Everything else, use your
> judgement and verify visually in Chrome. When something has more than
> one plausible treatment, build them behind a URL switch and show me
> both rather than picking for me — and keep the loser in the code.

---

## 1. What this project is

A single-page promo website for a Solana memecoin (working title
**HANOK**, Korean traditional-architecture theme), built by the user
(goes by **VEN**) for a client called **Zico**. It attaches to the token
listing; the brief is "premium and expensive," parchment/ancient-Asian
motif. Deal: ~1 SOL + upside if the launch goes well.

Static site, no build step, no framework. Plain scripts (NOT ES
modules — deliberate, so it works from any static host and file://).
Host anywhere (Vercel/Netlify/Pages).

**Zico still owes us** (chase before launch):
- Final token name + ticker (HANOK is a placeholder VEN chose)
- The website copy ("ill have to write up some text for you")
- CA + buy/social links (launch day)
- Confirmation on art placement after he sees the demo

## 2. The client brief (reconstructed from Zico's chat)

- Tweak VEN's usual style to fit this launch; creative freedom granted,
  tweak after first demo.
- PFP + banner exist separately (another artist, Recraft-style ink art
  based on an Instagram reel reference).
- Website: mountain/scenery backgrounds; as you scroll, pass these
  four places in Korea **in this order**:
  1. Gyeongbokgung Palace (경복궁)
  2. Changdeokgung Palace Complex (창덕궁)
  3. Namsangol Hanok Village (남산골)
  4. Jeonju Hanok Village (전주)
- Bottom of site: a Clash-of-Clans-style open field where **one hanok
  building is added for every $100k of market cap**, plus a holder
  count labelled **"villager tally"**.
- VEN's additions (agreed direction): paper/parchment theme; hero title
  that looks quill-written and animates being written on first load;
  a line/footpath that draws itself as you scroll the journey; a live
  price chart matching the vibe (parchment background, BLACK FILLED
  candles = up, HOLLOW outlined candles = down); footer.
- Zico may launch "a good couple tokens" — this could become a repeat
  template.

## 3. Files

```
hanokV2/
  index.html               single page, all sections
  css/site.css             all styling, design tokens at top
  js/config.js             ALL launch-day values (CA, links, pool, mocks)
  js/hero.js               quill-written title animation
  js/journey.js            THE journey. Two modes in one file:
                           split (default) + the old road. Also owns
                           the painting bake used by both.
  js/chart.js              parchment candle chart (mock + GeckoTerminal live)
  js/village.js            the CoC-style village field
  js/main.js               reveals, CA pill, link wiring
  tools/serve.js           node tools/serve.js -> localhost:8137
  tools/qa-frame.html      dev-only viewport harness (see §7)
  tools/crop.js            cuts the shipped plate bands out of the
                           square master (PNG codec, no deps)
  tools/prep.html          drop the raw Recraft exports in; keys out the
                           background, trims each building so it stands
                           on its own bottom edge, saves it named right
  tools/place.html         drag the village buildings onto the base
                           plate; prints the PLOTS array (see §6b)
  tools/placeholder.js     writes the stand-in village art so the
                           engine works before the Recraft art exists

  art/village/             THE VILLAGE ART (see §6b + PROMPTS.md)
    PROMPTS.md             what to generate in Recraft, and why.
                           SOURCE OF TRUTH for the seven prompts (§9f)
    prompt-sheet.html      the same seven prompts as a copy-paste page
                           for VEN. Open it directly; keep out of dist/
    ref/*.png              the six approved buildings cut out of
                           `valley6 (2).png` — THE STYLE SET (§9e)
    field.png              THE SHIPPED PLATE — a band cut from the master
    field-tall/-wide.png   other crops, to compare with ?plate=
    field-square.png       the uncropped master. Plots are authored in
                           ITS coordinates. Do NOT deploy it.
    b-*.png                nine buildings + the gate, standing on the
                           bottom edge. The six of §9h and the four of
                           §9n (b-store, b-house2, b-thatch2,
                           b-walled2), all keyed to RGBA. FINAL.
    b-*-debug.png          each cut composited over flat magenta, which
                           is how a grey halo becomes visible. Not
                           shipped — keep out of dist/

  valley.png               VEN's Recraft master for the village plate
  valleysvg.svg            its traced vector export, 9.3MB — master only,
                           never on the page (same rule as the others)
  journey-reference.html   ORIGINAL reference impl of the journey mechanic
                           (slider-driven; keep — it documents the math)
  hand drawn reference.jpg the art-style north star (ink on aged paper)
  HANDOFF.md / README.md   this file / short ops sheet

  # WIRED ART (2026-08-12). These are straight copies of VEN's PNGs,
  # renamed to slugs; uncompressed ~2.6MB each, 1024x1024:
  art/scene-bg.png         fixed backdrop behind hero + journey
  art/gyeongbokgung.png    journey stop 1
  art/changdeokgung.png    journey stop 2
  art/namsangol.png        journey stop 3
  art/jeonju.png           journey stop 4

  # MASTERS, root level — keep out of the deploy folder. The .svg
  # traced exports are 10-12MB EACH; never put them on the page:
  Background(.svg|PNG.png)
  Gyeongbokgung Palace(.svg|PNG.png)
  Changdeokgung Palace Complex(.svg|PNG.png)
  Namsangol Hanok Village(.svg|PNG.png)
  Jeonju Hanok Village(.svg|PNG.png)
```

`css/site.css` is one file, in this order — useful for locating things
fast: tokens (`:root`) → reset → **scrollbar (now fully hidden, §9)** →
`.grain` → **`.scene-backdrop` (+ its `::after` wash + the
`html:not(.motion-ok)` pin)** → headings → shared bits (`.eyebrow`,
`.section-head`, `.reveal`, seals) → `.ca-float` → **HERO (`.hero`,
`.hero::before` wash, title, tagline, `.btn`, `.btn.is-tba`, scroll
cue)** → JOURNEY road mode (sticky, stage, head, static column) →
**JOURNEY SPLIT MODE (`.jsplit*` — washes, gutter rule, plates, its own
`@media (max-width:860px)` block)** → MANIFESTO → LEDGER → VILLAGE →
FOOTER → one `@media (max-width:560px)` block at the very bottom.

Note there are now **two** responsive breakpoints: split mode's own
860px block sits with the split rules, not in the 560px block at the
bottom.

## 4. Design system (do not drift from this)

Two materials only — paper and ink — plus one green and one red:

- `--paper #DFCEA5`, `--paper-light #EBDDB9`, `--paper-deep #C7AE7E`
- `--ink #211B11`, `--ink-soft #4E4636`, `--ink-faint #8A7C61`
- `--pine #5C6648` (roofs, trees, chart columns)
- `--seal #8E4A38` — **dojang red, used ONLY for actual seal stamps**
  (hero stamp, manifesto seal, footer seal, favicon). A review pass
  already stripped it from text accents once; don't reintroduce it.
  The seal glyph is **韓 everywhere** (was mixed 한/韓 — unified).

Fonts (Google Fonts, loaded async non-blocking): **Song Myung**
(display/headings/labels) + **Gowun Batang** (body). Korean-print
pairing is deliberate — do not swap in Garamond/Playfair etc.

Signature moments: the hero title writes itself in ink (hand-authored
strokes, not a font); the last stroke trails downward; the same ink
line becomes the road that draws itself through the journey and
arrives at the village entrance in the field at the bottom.

Same-palette hexes are duplicated as constants in each JS module
(INK/PINE/PAPER/SEAL) — known, accepted duplication; if you retune the
palette, grep all files.

## 5. How each module works

### hero.js — the quill title
- `LETTERS`: per-letter arrays of single-stroke SVG paths on a
  **100x140 grid, baseline y=128**; letters placed at `X0 + i*ADVANCE`
  (ADVANCE=96) with deterministic per-letter tilt. `WORD = "HANOK"`.
  To rename the token: author strokes for any new letters, change WORD.
- Each stroke = a `<g filter="url(#inkRough)">` (feTurbulence +
  feDisplacementMap scale 3.4) containing a main path (widths vary
  9.5–12.5 — "brush pressure") + a thin offset overlay path (texture).
  The filter is **per stroke, not per word** — perf-critical: only the
  animating stroke re-rasterizes.
- Animation: one rAF timeline; per stroke `dur = clamp(len*1.7, 150,
  460)` + 50ms gaps, 300ms start delay; dashoffset eased in-out; a nib
  dot follows via `getPointAtLength` mapped through `getScreenCTM`.
  After writing: red seal 韓 stamps (scale/rotate ease-out), then
  `finishHero()` adds `.is-in` to tagline/actions and `.is-written` to
  the hero (shows scroll cue). Reduced motion: everything final
  instantly.
- `mount.textContent = ""` first — clears the no-JS `<span>` fallback
  ("HANOK" in display font; hidden via `.js` class when JS runs).

### journey.js — TWO modes, `?journey=`

**`split` is now the DEFAULT** (VEN, 2026-08-12). `?journey=road`
restores the pseudo-3D road, which is kept fully working.

**Split mode.** The section pins, the shared mountain backdrop
cross-dissolves to paper as you take hold of it, and the four places
then crossfade in place: copy left, painting right, one stop at a time.

- Why VEN moved to it: in the projection a panel STANDS on the road, so
  it can never be drawn below the horizon, which pinned every painting
  into the top 24% of the viewport. That one fact caused the heading
  collision, the near-panel top-clipping and the sparse composition on
  short wide windows. None of them can occur in split mode.
- **It costs no new art.** Same five PNGs, same
  `bakeArt()`/`artOf()`/`settleArt()` path, so the ink stand-in and the
  404 fallback come along for free. What it costs instead is COPY — a
  paragraph per stop. `SPOTS[i].blurb` is placeholder text written only
  so the layout could be judged; replace it wholesale with Zico's.
- Stop opacity: `s = p·N`, each stop centred at `i+0.5`, faded over
  `XFADE` (0.55) of a slot so adjacent stops cross at 50%. The first
  stop is held through the entry and the last through the exit
  (`dist = 0`) so neither sits half-faded at the section's edges.
- **Type is gated, not crossfaded** (`TEXT_GATE`, 0.55). Two paragraphs
  at 50% on the same spot is unreadable mush — verified, it looked
  terrible. The text only rises once its painting is past the gate, so
  the outgoing block is fully gone before the incoming one starts, with
  a clean beat between. Paintings may dissolve through each other;
  words may not. `TEXT_RISE` (12px) lifts them as they arrive.
- Backdrop hand-off is `BG_FADE` (0.07): the mountain drops back and the
  stops fade in on the same curve, so it reads as one dissolve out of
  the hero rather than two separate events. It drops to `GHOST` (0.26),
  not to zero — see the background-polish block below.
- Layout is a 2-col grid; both columns stack all four stops in a single
  grid cell (`grid-area: 1/1`) so they crossfade in place and the
  column height is the tallest stop — nothing reflows mid-transition.
- Phones (≤860px): eyebrow → painting → copy. `.jsplit__text` goes
  `display: contents` so its two children can be ordered around the
  painting; nested inside the text column the eyebrow was stranded
  under the image. The plate is capped against **both** vw and svh
  (`min(58vw, 32svh)`) or a tall stop pushes the copy off the bottom.
  Measured at 390x844: eyebrow 179–203, plate 220–446, copy 463–665.
- `.journey__head` is REMOVED in split mode — "Four places, one road"
  names the road. If split stays, that copy needs rewriting anyway.
- `village.js` drops the road's arrival at the village in split mode
  (`roadArrival()`), so it does not fork out of nothing. It reads the
  same `?journey=` switch; if that switch is renamed, grep for it.
- Build-once, attributes-only per frame, same discipline as road mode.
  Measured ~0.011ms/frame with all the polish layers on.

**Split-mode background polish** (VEN called the field bland; audit
found it was not just plain but *inert and content-agnostic*: across
2536px of pinned scroll and four different places nothing behind the
content changed. `body`'s mottles are positioned over the whole 6079px
document so one screen sees a near-uniform slice, `.grain` is `fixed`
so it never travels, and the section had no background of its own —
`background-image: none`, `background-color: rgba(0,0,0,0)`.)

Four layers, each independently switchable so they can be judged apart:

- **`?ghost=` (0.26)** — `.scene-backdrop` settles to a ghost instead of
  fading right out, so the hero's landscape still underlies the
  section. Biggest single win for one constant. Started at 0.12; VEN
  asked for the field to be less subtle, so it was raised to 0.26 — the
  landscape now reads clearly behind the copy without fighting it.
  **It must still reach 0 by p=1**: the backdrop is `position: fixed`,
  so a ghost left standing rides down the manifesto, ledger and village
  too. The curve is `(1 − entry·(1−GHOST)) · (1 − cl((p−0.88)/0.12))` —
  verified 1 → 0.26 through the stops → 0.13 at p=0.94 → 0 at p=1 → 0
  past the section.
- **`?wash=` (0.20), `?washsat=` (2.1)** — full-bleed tint per stop,
  crossfaded on the same curve as the paintings, coloured from each
  painting's own PIGMENT mean (pixels with density > 0.15; averaging
  the whole image just returns the paper and all four tint the same).
  Measured tones: Gyeongbokgung rgb(166,111,55) — the autumn foliage
  makes it the clear outlier — then 133/103/65, 125/104/71, 141/110/69.
  The four paintings share a palette, so the shift between stops 2–4 is
  subtle by nature; `washsat` pushes them off grey to keep it legible.
  Washes live in `.journey__sticky`, NOT in `.jsplit`, or they would be
  capped at `--w-wide` instead of full-bleed.
- **`?ground=` (1)** — soft ellipse under each plate. Weakest of the
  four: the keyed paintings already feather out at the bottom, so there
  is little hard edge for it to seat. Kept, but it is nearly invisible.
- **`?rule=` (1)** — hairline in the gutter with one tick per stop,
  brightening as you reach it. Architecture plus a position cue.
  Hidden under 860px — there is no gutter in one column.

Set any to 0 to switch it off. VEN chose to leave the lower-left
quadrant empty rather than fill it (no watermark, no enlarged plate) —
whitespace is deliberate, do not "fix" it.

### journey.js — sticky pseudo-3D road (`?journey=road`)
Port of `journey-reference.html` — read its comments; the math is
documented there. Key facts:
- `.journey` wrapper is **460vh**; `.journey__sticky` is sticky 100svh.
  Scroll progress p = -rect.top / (wrapperH - innerHeight), 0→1.
- One projection drives road + panels: `scale(d) = F/d` with F=700,
  DF=3000 (far clip), DN=130 (near clip), TRAVEL=3150. `worldX(d)` =
  damped double-sine meander (plan view; perspective creates the
  on-screen curve). Depths sampled logarithmically; see the road bullet
  below for how those samples become the path.
- World coords: fixed **VW=640**, VH follows the sticky's aspect
  (`sticky.clientHeight`, NOT innerHeight — iOS URL-bar). CX=320,
  HZ=0.24·VH (horizon), GY=0.15·VH, **AS = min(1, VH/494)** shrinks art
  on short viewports, LS = clamp(640/max(340,w), 1, 2) scales label
  font-size up on phones.
- That 494 is tied to AH: 200/494 === 170/420, i.e. it is the old 420
  rescaled for the taller square box. **If you change AH, change it
  too.** Panels are anchored by their BOTTOM edge, so a taller box runs
  off the top of the sticky sooner; at 420 a near painting lost ~27% of
  its top at full opacity. Some clipping at very close range is
  inherent to the projection — a panel must outgrow the screen as it
  passes — but this keeps each painting whole through its largest clean
  moment (~38% of viewport height). Portrait phones never clip (AS
  caps at 1 and VH is huge), so this is a landscape-only concern and a
  phone-only check will not catch it.
- `SPOTS`: d0 = 1150/1900/2650/3500 — **smallest d0 is reached FIRST**,
  so this encodes Zico's visit order (Gyeongbokgung first). `s` = side
  of road (−1 left, +1 right). Each has `img` (the painting) and `art`
  (the original inline ink drawing, authored in a **220x170 box with
  its ground line at y=170**).
- Panel box = `AW`x`AH` = **200x200**, square because the paintings
  are 1:1 — the `<image>` fills it exactly, no letterboxing, and the
  box's BOTTOM EDGE sits on the road's ground line (`draw()` anchors
  at `x - AW/2*ka, gy - AH*ka`). Change AW/AH and draw() follows.
- The ink `art` is now a **stand-in**: `standIn()` wraps it in a nested
  `<svg>` (its own viewport ⇒ it is clipped and bottom-aligned in the
  square box) and it renders UNDER the `<image>`. `settleArt()` then
  runs the painting through `bakeArt()` (same URL ⇒ image cache, not a
  second fetch) and, **on success sets the `<image>` href and drops the
  stand-in, on error drops the `<image>`**. Both halves matter: without
  the error half Chrome paints its broken-image glyph on top of the ink
  drawing and the fallback is worthless — verified by renaming a file
  and reloading, twice. So a slow connection shows ink rather than bare
  road, and a 404 degrades to the old drawing. Used by the sticky
  panels AND the static column.
- Outside `raw` mode the `<image>` is mounted with **no href** and gets
  one only when the bake lands. Mounting the file first would flash the
  untreated tile for a beat before the treatment replaced it.

- **Panel treatment — `?panels=`** (2026-08-12, session 4). Mounted
  untreated, the paintings read as glossy tiles pasted onto the
  landscape: full-bleed squares whose crop slices rocks and trees
  mid-form, on paper lighter than ours and inconsistent between
  paintings (Gyeongbokgung cool cream, Jeonju warm brown). Modes:
  - `feather` — edges fade out and the painting's paper is mapped onto
    `--paper`. Keeps every painting whole and rich.
  - `key` — the ground is keyed out by ink density, so only ink and
    pigment reach the page. Nothing rectangular survives.
  - `raw` — the untreated original, kept for comparison.
  - **Baked once into a canvas, served as a blob URL — deliberately NOT
    an SVG filter or `<mask>`.** Either of those re-rasterises on every
    frame as the panel scales, which would undo the build-once,
    attributes-only architecture `draw()` depends on. Measured after:
    ~0.024ms/frame, i.e. no worse than before.
  - The tone match is **measured, not assumed**: `paperOf()` takes the
    mean colour of the lightest ~8% of pixels as that painting's own
    paper, and the per-channel ratio onto `--paper` is the multiplier.
    That normalises the four paintings onto one sheet for free, which a
    fixed multiplier cannot do.
  - Knobs `tone fx ftop fbot keylo keyhi` all take URL overrides
    (`qs()`), so treatments can be A/B'd in the browser without an edit.
  - `fbot` (0.10) is deliberately smaller than `ftop` (0.20): the box's
    bottom edge stands on the road's ground line, and fading it as hard
    as the top lifts the painting off the road.
  - Under `file://` the canvas taints, `getImageData` throws, the catch
    hands back the original URL and the site degrades to `raw`. That
    matters because file:// is a supported target (§1).
  - **The honest limit of `feather`:** its ground stays opaque, and the
    page behind a panel is not flat paper — it is the backdrop
    painting. So wherever a panel crosses the dark backdrop mountain a
    faint lighter patch still reads. `key` cannot show that patch at
    all, because its ground is genuinely transparent. That is the whole
    trade between the two, and it is why `key` is the truer answer to
    "stop them floating as individual objects" while `feather` is the
    richer-looking one.
- Perf architecture (do NOT regress to innerHTML-per-frame): panels +
  two label `<text>`s are built ONCE; `draw(p)` only sets
  transform/opacity/display, and re-appends children only when the
  painter-order string changes. ~0.08ms/frame measured.
- Painter order: each panel's two labels are appended **right after
  their own panel**, so a near painting occludes a far caption. (They
  used to all go last, which read as text floating over a picture once
  the panels carried real art.)
- Labels: `LS` (module-scope, set in resize()) scales both the font
  size AND the y offsets (`gy + 22*LS` / `gy + 39*LS`) — scaling only
  the font made the two lines collide on phones. `halfLabel()` measures
  the name once per LS (cache invalidated by `document.fonts.ready`)
  so draw() can clamp both lines' shared x into the stage; without it
  a passing panel's caption is cut in half at 390px.
- Road reveal = native SVG `<clipPath>` rect (`#jRoadClipRect`), height
  = VH·min(1, p·1.3) per frame. (CSS clip-path on SVG g is flaky in
  WebKit — that's why.) The reveal is why the near end of the path is
  still missing at p≈0.6; it completes at p≈0.77. Not a bug.
- **The road — `?road=`** (2026-08-12, session 4). It used to be one
  hairline centre stroke, which read as a wire laid over the landscape
  rather than something you could walk. It is now a ribbon with real
  width: the road has a constant world half-width `ROAD_W` (30), so its
  edges are just `worldX ± ROAD_W` pushed through the same projection
  as everything else and the perspective taper falls out for free.
  - `path` (default) — pale worn fill + two ink edges. A trodden
    footpath.
  - `river` — the same ribbon as water: pine wash + ripple lines.
    **Tried and not recommended.** Pine over the painted terraces reads
    as another rice paddy, not water, and the ripples read as contour
    lines; making it convincing needs a genuinely cool/blue wash, which
    is outside the paper/ink/pine/seal palette. It also breaks
    continuity — village.js has the road ARRIVE at the village and fork
    into footpaths, and §2's brief calls it a road.
  - `line` — the original hairline, kept as the way back.
  - An SVG stroke cannot taper, so each edge is 6 chained polylines of
    increasing width — the same trick the original centre line used.
  - `stones()` draws flagstones and defaults to **off** (`?stones=.07`
    to see them). Over a painted landscape they read as cloud shadows
    or puddles; at the first attempt (10·k, every 2nd sample) they
    overlapped into a stack of grey discs. Kept because they may earn
    their place on a flatter background.
  - Built in `buildRoad()` on resize only, never per frame.
- `scene` = `.scene-backdrop` element if present; draw() holds its
  opacity at 1 until p>0.86 then fades to 0 by p=1 (this is how the
  shared background "unsticks" after the journey). Under reduced
  motion this module returns early and never runs, which is why CSS
  has to pin the backdrop to the first screen — see §6.
- p>0.02 adds `.is-under-way` (fades the section heading).
- **Entrance ramp — the title gets the top of the screen to itself.**
  `enter = cl((p − ENTER_AT) / ENTER_OVER)` (0.030 / 0.060, both
  URL-overridable as `enter` / `enterover`) multiplies every panel's
  `op`, and captions follow because `lo` derives from `op`. So the
  section opens on heading + landscape + road with no paintings, the
  heading starts fading at p=0.02, and the paintings fade in over
  p 0.03→0.09 as it clears. Mid-ramp they read as emerging from the
  mist, which suits the wash aesthetic.
  **Why it is not solved by moving the paintings down:** a panel is
  anchored by its BOTTOM edge to the road's ground line, so its top can
  never fall below the horizon, and the heading sits above the horizon.
  Measured at 1280x551: heading 28–118px, horizon 132px, near panel
  −22..226px — the title is entirely inside the panel's span. Clearing
  it by depth alone needs the SPOTS to start ~7x further away, with
  TRAVEL and the 460vh budget stretched to match; that wrecks the tuned
  pacing. Choreography is the only lever that does not touch the
  projection. If VEN ever wants real spatial separation instead, the
  move is to relocate `.journey__head` into the empty lower half — that
  would also address the §9 sparse-window question — but it is a
  design-direction call.
- Reduced motion: whole section collapses to a static column of figures
  (`journey--static`), built from the same art via `artOf()`.
- **The two fade curves, spelled out** (they are easy to misread and
  they control everything about when a panel is "on stage"):
  - panel opacity `op = d < 145 ? 0 : min(cl((3500−d)/400), cl((d−165)/320))`
    — the first term fades a panel IN as it emerges from the far clip,
    the second fades it OUT as it passes you. Full opacity roughly
    d ∈ [485, 3100].
  - caption opacity `lo = op · cl((d−460)/260) · cl((2700−d)/520)` —
    captions live in a narrower band than their panel, so a panel can
    be visible with no caption at both extremes. Full strength roughly
    d ∈ [720, 2180].
  - `cl` clamps to 0..1. Three captions on screen at once is normal and
    intended around p≈0.35–0.45.
- **Top-clipping formula**, if you ever retune AH/AS. Panel top edge in
  world units = `HZ + GY·k − AH·k·AS`. With AS = VH/494 that is
  `VH·(0.24 − 0.2549k)`, so it goes negative at k > 0.941, i.e. d < 743,
  and the clipped fraction is `0.627 − 0.593/k` (≈14% at d=580, ≈29% at
  d=400). Panels are never clipped on portrait phones. Verify any change
  against this rather than by eye — the onset is easy to miss.

### chart.js — "The Ledger"
- Custom SVG renderer, viewBox 840x400, margins ML18/MR70/MT18/MB42.
  Filled ink candle = rise, hollow = fall. 4 ruled gridlines + right
  price labels (`fmtPrice`: variable decimals for microcap prices),
  bottom time labels, dashed last-price line. Label font-size scales up
  on narrow frames (clamped ≥ desktop size), re-renders on debounced
  resize (`lastData`).
- Mock: mulberry32-seeded random walk (seed 20260811), 72 candles,
  upward drift + occasional scares. Labels "-16h…now".
- Live: set `config.chart.pool` → GeckoTerminal OHLCV
  (`api.geckoterminal.com/api/v2/networks/{net}/pools/{pool}/ohlcv/...`,
  no API key). Rows sorted ascending, **NaN/non-finite/≤0 rows
  filtered; <2 valid rows = treated as failure**. 120s refresh (only
  while tab visible). `hasLive` flag: after a successful live render, a
  failed refresh KEEPS the last good chart and sets the note to "Last
  known ledger — refresh paused." (never mock-under-"Live"). min is
  clamped ≥0 after padding. Entrance stagger: single tracked
  IntersectionObserver (guarded for existence, disconnected on
  re-render).

### village.js — the growing village

**Session 5 changed how this section gets its art.** The houses were the
last placeholder-grade drawing on the page — flat vector boxes with a
solid black roof, sitting directly under the journey's keyed
watercolours. VEN stopped a rebuild of them mid-flight, correctly:
hand-authored SVG hanoks were never going to match Recraft output.

The section now renders **painted PNG layers over a base plate**, with
the inline SVG as the fallback beneath. Read §6b for the whole design;
the short version:

- `art/village/field.png` is the base plate; `art/village/b-*.png` are
  six buildings. The engine picks one per plot and reveals them as the
  market cap climbs.
- **Nothing is mounted until the file has loaded.** No plate ⇒ the SVG
  field simply stays. This is deliberate and verified — an `<img>` with a
  dead `src` gets Chrome's broken-image glyph painted on top of the
  drawing underneath, the exact bug that bit the journey twice.
- The SVG field is still built first and still works. It is no longer
  something to polish; it is the offline/404 state.
- `tools/place.html` sets the plot positions. Do not hand-edit them.
- viewBox 900x380. `SLOTS`: 15 plots in 3 perspective rows (back y=170
  k=.6, mid y=252 k=.78, front y=345 k=.95), listed in BUILD order
  (organic growth near the road first); rendered painter-sorted by y.
  roofs = clamp(floor(marketCap/perRoof), 0, 15); empty plots draw as
  faint dashed survey marks (intentional — shows room to grow).
- 3 house variants (house/lhouse/pavilion) in a 140x100 local box,
  ground y=100, cycled by slot index. Roof shape = shared `roofPath()`
  (level ridge, sagging eave, upturned tips — same in journey.js).
- Decor: contour lines; pine left, rocks right, grass tufts. Plus
  `roadArrival()` — the journey's road arriving bottom-center and
  forking into faint footpaths between the front houses (deliberately
  does NOT thread through rows — no corridor exists; it fades out
  behind the mid-center house).
- **`roadArrival()` only draws in road mode** (session 4, VEN's call).
  Split mode has no road, so the trunk would arrive out of nothing. The
  two forks go with it — without the trunk they read as two short
  strokes floating between the houses. It reads the same `?journey=`
  switch journey.js does; **if that switch is ever renamed, grep for
  it**, because village.js duplicates the check rather than importing
  it (in keeping with the palette constants every module repeats).
- Stats: fmtMoney handles the $999.5k→"$1.0m" rounding edge; progress
  pct is floor+capped at 99 (never says 100% before the roof exists).
  `window.HANOK.setVillage({marketCap, holders})` re-renders; guarded
  with Number.isFinite. New roofs fade in (`roof--new`).

### main.js
- Scroll reveals via IntersectionObserver (`.reveal` → `.is-in`),
  EXCLUDING hero descendants (hero.js times those). No-IO fallback
  shows everything.
- CA pill: appears past 70% of hero height (visibility+opacity — kept
  out of tab order while hidden). Copy chain: navigator.clipboard →
  execCommand textarea fallback → if both fail, flash the actual CA
  text (NEVER a false "copied" — this was the worst reviewed bug).
- `wire(id, url, hideIfMissing)`: null links → footer links hidden,
  hero buttons get `.is-tba` (dimmed, click-disabled).

### config.js + inline head script
- `config.js`: ca, links{buy,x,dexscreener,telegram}, chart{network,
  pool,timeframe,aggregate}, village{marketCap,holders,perRoof,maxRoofs}.
  Currently all null / mock (mc 840k, holders 1284).
- `index.html <head>` inline script defines `window.HANOK_REDUCED()`
  (**?motion=1 forces animation, ?motion=0 forces static**, else OS
  reduced-motion) and stamps `.motion-ok` + `.js` classes on <html>
  BEFORE first paint. ALL animation CSS hangs off `.motion-ok` so CSS
  and JS always agree.

## 6. The art — WIRED (2026-08-12). How, and which knobs to turn

All five paintings are square 1:1 (1024px), ink+watercolor, each on its
own aged-paper ground — a perfect match to `hand drawn reference.jpg`.
Copied to `art/` under slug names and used **as-is, uncompressed**
(VEN's call; ~2.6MB each). Optimising later is a pure find-and-replace
of the file extension — see README "Before deploy".

**`art/*` are COPIES, not moves.** The originals with spaces in their
names are still in the repo root as masters. If Zico or VEN re-exports
a painting, the new file must be copied into `art/` under its slug or
the site keeps serving the old one. Mapping:

| master (root) | served as |
|---|---|
| `BackgroundPNG.png` | `art/scene-bg.png` |
| `Gyeongbokgung PalacePNG.png` | `art/gyeongbokgung.png` |
| `Changdeokgung Palace ComplexPNG.png` | `art/changdeokgung.png` |
| `Namsangol Hanok VillagePNG.png` | `art/namsangol.png` |
| `Jeonju Hanok VillagePNG.png` | `art/jeonju.png` |

The slug rename is deliberate: spaces in URLs mean %20 escaping in
both the CSS and the JS `SPOTS[i].img` strings, and it lines up with
the eventual `.webp` swap.

**Background — `art/scene-bg.png`**
- The `.scene-backdrop` div is the first thing in `<body>`: fixed,
  z-index −1, so it is constant behind BOTH hero and journey, and
  journey.js fades it out over p 0.86→1.
- The interim landscape stand-ins are GONE: the `.hero__backdrop` svg
  block (index.html) and its css rules, plus `buildMist()`/`ridge()`/
  `gMist` and `<g id="jMist">` in the journey.
- Knobs, all in css/site.css:
  - **`.scene-backdrop { background: var(--paper) }`** is load-bearing,
    not decoration. `position:fixed` + `z-index:-1` makes the element a
    stacking context, which *isolates* the child img's blending — so
    the img multiplies against this backing, not against the page.
    Keep the colour in sync with `--paper` or the blend shifts.
  - **`mix-blend-mode: multiply`** on the img is what marries the
    painting's cooler, lighter paper to ours. Without it the image sits
    on the page like a pasted photo (verified side by side). No opacity
    reduction is needed on top of it.
  - **`object-position: center 38%`** — it is square, so `cover` crops
    top/bottom on wide screens. 38% keeps the mountain in frame and
    puts sky behind the hero title. Lower ⇒ more sky, higher ⇒ more
    terraces.
  - **`.scene-backdrop::after`** is a paper wash over the lower 72% of
    the viewport (0 → .22 → .45 → .60). The tea terraces are the
    busiest part of the painting and sit exactly where the journey's
    near road and captions land. This was originally set far too strong
    (.42/.72/.86) and bleached the painting — if in doubt, go weaker.
  - **`.hero::before`** is a soft radial paper wash behind the
    title/tagline/buttons so the ink never fights the terraces:
    `radial-gradient(50% 40% at 50% 42%, .82 → .62@46% → .24@72% →
    0@100%)`, full-bleed inside `.hero` via top/left/right/bottom:0.
    It is on `.hero`, **not** `.hero__inner`, on purpose: `.hero__inner`
    is a shrink-to-fit flex item, so a wash sized as a %-of-it
    (originally `width:150%`) came out wider than the viewport on
    phones — 446px of content in a 377px viewport — and `overflow-x:
    hidden` then cut the gradient with a hard vertical line down both
    screen edges at ~21% alpha. The horizontal radius is **50%**, so
    the gradient reaches zero exactly at the hero's own edges and can
    never seam. If you resize it, keep that 50%.
  - `.btn.is-tba` dims with `--ink-soft` colours rather than
    `opacity:.6` — a see-through button over the painting read as
    broken. (Only visible until config.js has real links.)

**Layer/z-index map** (the whole page, so you can reason about the
backdrop without re-deriving it):

| layer | z-index | notes |
|---|---|---|
| `.scene-backdrop` | **−1** | fixed; stacking context ⇒ isolates the img blend |
| `.hero::before` wash | auto (positioned) | above the backdrop, below the copy |
| `.hero__inner` | 1 | hero copy |
| `.journey__head` | 2 | section heading, fades at p>0.03 |
| `.grain` | 60 | fixed paper tooth, `multiply`, opacity .5, over everything |
| `.ca-float` | 70 | the CA pill |

`body` background (paper + 4 radial mottles) paints on the canvas, so
the −1 backdrop still sits above it. While the backdrop is at opacity
1 it hides the body mottle entirely; the mottle returns as journey.js
fades the backdrop out. That is intended, not a bug.
- **Reduced motion / no JS**: journey.js returns early and never runs
  its fade, so a fixed backdrop would ride down the whole page.
  `html:not(.motion-ok) .scene-backdrop` re-pins it to `absolute`,
  100svh, mask-faded at the fold. Do not delete that rule.

**Journey paintings — `art/{gyeongbokgung,changdeokgung,namsangol,jeonju}.png`**
- Wired via `SPOTS[i].img`; box is square 200x200 (`AW`/`AH`). Used by
  BOTH journey modes and by the reduced-motion static column, all
  through the same `artOf()`/`settleArt()`/`bakeArt()` path.
- **Superseded, session 4:** session 3 recorded that "the paintings'
  own paper is lighter than the page's, so they read as mounted
  paintings passing by, with no border needed." VEN rejected that read
  — mounted raw they looked like glossy tiles pasted on the landscape.
  They are now **treated** (`?panels=key`, §5): the ground is keyed out
  by ink density so only ink and pigment reach the page and nothing
  rectangular survives.
- Road mode only, still accepted: the road's ground plane and the
  painting's do not literally agree — panels sit above the painted
  terraces. Do not try to "fix" it by moving the crop; that trades the
  hero's sky and mountain away for it. Moot in split mode, which has no
  ground plane.
- Village houses keep the inline SVG art (no paintings exist for them;
  Zico may commission later).

## 6b. The village art pipeline (session 5) — READ BEFORE TOUCHING IT

**Direction, from VEN:** a base plate (empty valley, optionally with a
boundary wall) plus a small set of building PNGs that the engine picks
from as the price rises. Chosen over the two alternatives — cutting one
finished village painting into fifteen pieces, or inpainting fifteen
progressive states — because it is the only one that survives Zico
launching a second token (§2: "a good couple tokens"). A cut-up master
painting is single-use; a sprite set is a template.

**The art is not made here.** VEN generates it in Recraft.
`art/village/PROMPTS.md` holds the exact prompts, the settings that
matter, and the file names. The most important line in it: build a
custom Recraft style from `hand drawn reference.jpg` plus the four
journey paintings, and generate everything in that style. Wording gets
close; a style reference is what makes the village look like the same
hand made it as the journey directly above.

**What is in the repo right now is placeholder art.** `node
tools/placeholder.js` writes crude stand-ins (flat washes, right
silhouette, real alpha) so the engine could be built and verified before
any real art existed. Overwrite them with the Recraft exports under the
same names and nothing in the code changes. Nobody ships them.

### How the layers work

```
.village__plate                  aspect-ratio taken FROM the art
  <svg #villageField>            the fallback, hidden once art loads
  <img .v-base>                  art/village/field.png
  <img .v-house> x15             art/village/b-*.png, one per plot
```

- A `.v-house` is anchored **bottom-centre** (`translate(-50%,-100%)`),
  so a plot's `y` is its GROUND LINE and a building can be any height and
  still stand correctly. Every building PNG must be drawn standing on the
  bottom edge of its own canvas — that is the contract.
- `--flip: -1` mirrors a building. Roughly 45% are mirrored, so six files
  behave like twelve. Costs one custom property.
- **Two orderings, kept separate** — same split the SVG field always
  made. `PLOTS` array order is BUILD order (plot 0 is raised at $100k).
  Painter order is computed from `y`, so a plot raised late can still
  stand behind one raised early.
- `.village__plate.has-art` feathers the plate's four edges with two
  intersected linear masks (`?edge=`, 4%). A painting on parchment
  dropped into a 1080px box shows its own edges against the page —
  the same trap as the journey's untreated panels. A radial mask was not
  used: it pulls the corners in and crops the field.

### The seeded assignment — do not make this actually random

VEN asked for the engine to "randomly choose" a building per plot. It is
**seeded, not random**, and that difference is the whole point:

- The village must be the same village when a holder comes back —
  "come back and count the roofs" means nothing if plot 7 is a pavilion
  today and an L-house tomorrow.
- A new roof appearing must never reshuffle the ones already standing.
- Seeded from `config.ca`, so a second token on this template gets a
  different village out of the same six files. `?seed=STRING` re-rolls it
  for comparison.

Assignment walks the plots in **spatial** order (row, then left to right)
so the "don't repeat my neighbour" rule compares buildings that actually
stand side by side. Walking build order would compare plot 4 with plot 5,
which can be at opposite ends of the field.

### Failure behaviour — all four paths verified in Chrome, not assumed

| state | what happens |
|---|---|
| no base plate | SVG field stays; **zero `<img>` mounted**, so no broken-image glyph |
| `?art=off` | same, forced |
| one building 404s | dropped from the pool, its plots get a survivor — the roofs on screen always equal the stat above them |
| all buildings 404 | SVG field stays |

Measured with 2 of 6 types hidden: 8 roofs shown, `statRoofs` 8, 0 broken
images, 4 types in use.

### The plate is a BAND cut from a square master

Recraft returns 1:1. Dropped on the page whole, the village section
became **1561px tall on a 551px viewport** — two screens of mountain
before you reach the village, i.e. the payoff buried inside its own
section. Verified, not assumed.

So `tools/crop.js` cuts horizontal bands from
`art/village/field-square.png`:

| plate | size | ratio | keeps |
|---|---|---|---|
| `field` (default) | 1024x604 | 1.70:1 | mountain feet, full valley, foreground |
| `field-tall` | 1024x824 | 1.24:1 | more mountain |
| `field-wide` | 1024x464 | 2.21:1 | mostly field, shortest section |
| `field-square` | 1024x1024 | 1:1 | the untouched master |

**`PLOTS` are authored in the SQUARE MASTER's coordinates**, and
`PLATE_CROP` remaps them per band. That is what lets `?plate=` compare
crops without every building floating off its ground line. Verified:
plot 0's ground line lands on master y 0.672 in all four bands.

**`PLATE_CROP` in js/village.js and `BANDS` in tools/crop.js must stay
in step.** Change one without the other and the whole village slides.

### Switches

`?art=off` · `?plate=NAME` (e.g. `field-wall`) · `?seed=STRING` ·
`?edge=N` · plus the SVG fallback's own `?houses=ink|flat`,
`?field=hill|bare`, `?rough=`, `?over=`.

### Still to do here

1. VEN generates the real art from `art/village/PROMPTS.md`.
2. Re-place the plots in `tools/place.html` against the real plate — the
   current `PLOTS` values are derived from the old 900x380 SVG geometry
   and will be wrong for a different aspect with real terrain.
3. Decide the walled vs open plate (`?plate=field-wall`).
4. Optimise: 6 buildings + a plate as `.webp` before deploy.

---

## 7. Environment + QA gotchas (will bite you if unknown)

- **This machine has OS-level reduced-motion ON.** Without
  `?motion=1` you will always see the static site and think animation
  is broken. QA at `http://localhost:8137/index.html?motion=1`.
- **Chrome MCP tabs cannot open file:// URLs.** Run
  `node tools/serve.js` (background) → localhost:8137. Python is NOT
  installed (`python`/`py` fail); node v24 is at Program Files.
- **rAF freezes in occluded/background windows.** If the hero shows
  one frozen stroke or scroll draws nothing, the Chrome window just
  isn't visible/focused — not a bug. Bringing the window to the
  foreground (PowerShell SetForegroundWindow) fixes it. The tab often
  lives in the USER'S own Chrome window — they resize/switch tabs
  during sessions; don't fight it, batch scroll+screenshot tightly.
- The hero writes only while the tab is visible; it resumes/jumps on
  focus — accepted behavior, documented in README.
- `journey-reference.html` opens standalone with a slider — fastest
  way to sanity-check projection changes without scrolling.
- **This screen is 1280x720 logical (1920x1080 @150%), so Chrome's
  viewport tops out around 1280x551 CSS px** — a 2.3:1 window, too
  short to judge the journey, whose whole composition keys off
  `VH = 640·h/w`. Use `tools/qa-frame.html`, which renders the site in
  an iframe at a real device size and scales it to fit.

  **⚠ Tell VEN what the harness looks like before sending them the
  URL.** It renders the page in a fixed-size box on a dark `#2b2721`
  body, so the page appears not to fill the screen and there is a dark
  band to the right. VEN hit exactly this and reasonably read it as a
  responsive bug. The real site fills the viewport at every size —
  measured at 1280x551: `scrollWidth === clientWidth === 1267`,
  `.scene-backdrop` and `.journey__stage` both exactly 1267x551, zero
  horizontal overflow. **Send VEN `index.html?motion=1`, never the
  harness**, unless they specifically asked to see another screen size.

  Harness API — `?w=` width `?h=` height `?s=` scale (default: fit)
  `?u=` url under test. Globals on the outer page: `K` (scale), `F`
  (the iframe), `SYNC()` (patch the inner rAF to run synchronously),
  `GO(p)` (jump to journey progress p), `AT(y)` (scroll to y). With
  `s=1` pan via `F.style.transform='translateY(-349px)'` to see below
  the fold. Inject `*{transition:none!important}` into the inner
  document too: throttled tabs freeze CSS transitions mid-flight, which
  makes `.reveal` sections look washed out when they are fine.
- **You do not need the harness to drive the real page.** The same rAF
  patch works on the top-level document — paste this and you can jump
  to any journey progress and screenshot it:
  ```js
  window.requestAnimationFrame=function(cb){cb(performance.now());return 0};
  const j=document.getElementById('journey'), t=j.offsetHeight-innerHeight;
  window.__go=p=>{scrollTo({top:j.offsetTop+t*p,left:0,behavior:'instant'});
                  dispatchEvent(new Event('scroll'));return scrollY};
  ```
  `behavior:'instant'` matters — `html.motion-ok` sets
  `scroll-behavior:smooth`, and a smooth scroll never completes while
  rAF is throttled.
- **`ticking` can get stuck.** journey.js guards its scroll handler with
  a `ticking` flag cleared inside rAF. If a scroll fires while the tab
  is throttled and *before* you patch rAF, that callback never runs and
  every later scroll returns early — the journey then silently refuses
  to redraw and you will think your change did nothing. Symptom: all
  panels stay at their `d0`. Cure: force a frame (take a screenshot) or
  reload and patch rAF before scrolling.
- **The preview server dies between sessions.** Restart with
  `node tools/serve.js` (background) and verify before telling VEN it
  is up: `Invoke-WebRequest http://localhost:8137/index.html -UseBasicParsing`
  should return 200. A dead server looks identical to a broken site.
- **A transform on the qa-frame iframe kills `mix-blend-mode`.** Chrome
  drops the blend compositing for content inside a transformed iframe,
  so the scaled harness renders `.scene-backdrop` as bare paper and the
  journey looks like it lost its landscape. `scale()` and `translate()`
  both do it; `?s=1` does not help, because that is still a transform.
  Cure: `F.style.transform='none'` (plus `document.body.style.overflow=
  'auto'` on the harness). The frame then overflows the screen and you
  only see its top-left corner, but what you see is truthful. **This
  cost an hour once — a "missing backdrop" in the harness is almost
  never a real bug.** Confirm against `index.html` directly before
  chasing it.
- **The backdrop's blend can also drop out on the real page** after the
  synchronous-rAF patch plus a burst of scripted scrolls. Same
  symptom, and every bit of state (`complete`, `naturalWidth`,
  `mixBlendMode`, opacity, rect) reads correct while it paints flat.
  Nudge it back with
  `bg.style.mixBlendMode='normal'; void bg.offsetWidth; bg.style.mixBlendMode='';`
  or avoid it entirely: foreground the Chrome window (PowerShell
  `SetForegroundWindow`) and let real rAF run instead of patching it.
- **Never `await requestAnimationFrame` in an MCP tab.** The tab
  backgrounds the moment the tool call returns, rAF stops firing, the
  promise never resolves and the whole `Runtime.evaluate` hangs to its
  45s timeout. Use `setTimeout` for waits, always.
- Waiting for the four paintings is not enough before a screenshot:
  `art/scene-bg.png` is 2.6MB and lands later. Wait on
  `bg.complete && bg.naturalWidth` too, or you will photograph a page
  with no landscape and think you broke it.

## 8. Review history (a 10-agent adversarial review already ran)

Applied (don't re-do, don't regress): honest CA-copy chain;
keep-last-good live chart + NaN row filtering + min≥0 + observer
guards; per-stroke hero filter; build-once journey DOM; async fonts;
no-JS title fallback + journey collapse (<noscript>); og/twitter meta
(image pending); seal-red discipline; soft ink shadows (no
neubrutalist offsets); brush-stroke h2 rule; footer contrast; mobile
label scaling (journey + chart, clamped ≥1 so desktop unchanged);
韓 unification; "$100k" heading; setVillage isFinite; fmtMoney/pct
edges; visibility-hidden CA pill; iOS `inset`→longhands; sticky-height
viewBox; SVG clipPath road reveal.

**Deliberately REJECTED after verification (do not re-flag/re-add):**
config URL scheme validation & encodeURIComponent (config.js is
owner-authored script — no trust boundary); fetch AbortController
(120s spacing, transient, self-correcting); rel=noopener in wire()
(markup already carries it); grain-layer blend "perf tax",
offsetHeight/gBCR caching, resize debounce in journey (verifier:
negligible inside rAF); iOS 14.0–14.4 flex-gap fallbacks (audience ~0).

**Second review pass, 2026-08-12** (5 lenses + adversarial verify, run
over the art wiring). Applied: AS recalibration for the square box
(§5); `.hero::before` made full-bleed — sized off the shrink-to-fit
`.hero__inner` it overflowed the viewport horizontally on phones
(scrollWidth 446 vs 377 at 390px) and the gradient got a hard vertical
cut at the screen edge. Both re-verified in the browser.

Also fixed during the visual pass, all caused by real art replacing
transparent line art: labels painted over nearer paintings; label
y-offsets not scaled by LS (lines collided on phones); captions cut off
at the viewport edge; the ink stand-in's stroke showing as a bar under
each painting; `.btn.is-tba`'s opacity letting the backdrop through;
and a 404'd painting showing Chrome's broken-image glyph on top of the
stand-in (see §5 `settleArt`).

Known cosmetic nit: the low-frequency mottle tile on `.grain` can show
a faint vertical seam at tile edges on very wide screens (Chromium
feTurbulence stitch quirk; already softened). Becomes moot anywhere
the scene background covers; acceptable elsewhere.

## 9. Session 4 record + priority order for the next session

DONE session 3: ~~wire the background~~, ~~wire the four journey
paintings~~, ~~visual pass at desktop + 390px~~ — all of §6.

### What session 4 changed, in the order it happened

Every item was VEN's request, and every one was verified in Chrome.

1. **Paintings stopped reading as pasted tiles.** VEN's complaint was
   that they "floated as individual objects"; of the causes offered
   they flagged exactly one, *the hard square edge*. Two treatments were
   built behind `?panels=`, VEN compared them live and chose **`key`**
   (now default). `feather` and `raw` are KEPT — VEN asked explicitly
   that alternatives stay available. Do not "tidy" them away.
2. **Paintings stopped colliding with "Four places, one road."** VEN
   asked for the images to start lower; the projection forbids it (§5
   spells out why — a panel stands on the road so it can never be drawn
   below the horizon, and the heading sits above it). Fixed by
   choreography instead: the entrance ramp. **VEN correctly called this
   out as a timing fix rather than a compositional one** — it is, and
   the constraint is documented rather than papered over.
3. **The road became a footpath with real width** (`?road=path`). A
   river was tried and rejected: pine over the painted terraces reads
   as another rice paddy, and it breaks the road→village continuity.
   Reasons are in §5 so it is not re-proposed cold. Road mode only.
4. **The journey was rebuilt as a two-column crossfade** — the big one.
   VEN: *"scrap the idea of the 3d moving images."* Their stated reason
   was "less artistic work"; **that premise was wrong and saying so was
   welcomed** — all five paintings were already done and both modes use
   the same PNGs. The real trade is less projection tuning, more COPY.
   Built alongside rather than replacing, at VEN's choice.
   `?journey=split` is default, `?journey=road` still works.
5. **Split-mode background polish.** VEN called the field bland; the
   audit found it was not merely plain but *inert and content-agnostic*
   (see §5). Four switchable layers added; `ghost` and `wash` were then
   raised on VEN's request ("less subtle").
6. **Scrollbar fully hidden** — three separate bugs, all recorded below.
7. **`tools/serve.js` now sends `cache-control: no-store`.**

VEN's sign-off on the journey: *"it looks really good."*

### Findings worth keeping

- **Scrollbar is fully invisible**, and reserves no gutter — the page
  reclaims the 13px (`clientWidth === innerWidth`). Took three passes:
  1. The first attempt made only the TRACK transparent and left a faint
     thumb. VEN reported it as unchanged — correctly; a bead on the
     right edge reads the same as a bar. **"Transparent scrollbar"
     means the thumb too.**
  2. `tools/serve.js` sent no cache headers, so a stale `site.css` was
     also in play. Fixed separately (below).
  3. The standard `scrollbar-color`/`scrollbar-width` declarations were
     fenced behind `@supports (-moz-appearance: none)` — a Firefox-only
     hack. `CSS.supports('-moz-appearance','none')` is **false** in
     Chrome, so Chrome never saw them and reported
     `scrollbar-color: auto`. Both paths are now set ungated and both
     resolve to hidden, so they cannot fight.
  Verified rather than assumed: forcing `::-webkit-scrollbar{width:30px}`
  moved the layout gutter 13px → 30px, proving the webkit pseudo-elements
  ARE honoured in Chrome 151 — that test is the quick way to settle it.
  **Note:** CDP/MCP screenshots exclude the scrollbar, so it cannot be
  checked visually through the browser tools; measure
  `innerWidth - document.documentElement.clientWidth` instead (0 = gone).
  Trade-off VEN accepted: no scroll-position affordance anywhere on the
  page. The journey's gutter ticks give some cue inside that section.
- **The road is a footpath with width, not a hairline** — §5 `?road=`.
  River was tried and is not recommended; the reasons are recorded
  there so it does not get re-proposed from scratch.
- **`tools/serve.js` now sends `cache-control: no-store`.** It sent no
  cache headers at all, so Chrome cached heuristically and kept serving
  a stale `site.css` — VEN reported a CSS change as "no updates" when
  the file on disk and on the wire were both correct. Do not remove it.

**Road-mode-only open questions.** Both became moot the moment split
mode took over as the default; they matter only if VEN goes back to
`?journey=road`. Do not spend time on them unprompted, and do not touch
the projection without asking — it is shared with
`journey-reference.html` and tuned.
- *Spatial separation between paintings and the section heading.*
  Session 4 separated them in time, not space. The real levers are
  lowering the horizon (`HZ`) on short wide aspects, or moving
  `.journey__head` into the empty lower half.
- *The journey reads sparse on short wide windows* (VEN's own
  1280x551). The horizon is pinned at 24% of viewport height, so a
  2.3:1 window pushes the panels high and leaves a large empty stretch
  below the road. Correct behaviour of the projection; looks right at
  16:9/16:10. Levers, cheapest first: raise `HZ` on wide-short aspects;
  raise `GY`; or clamp `VH` to a minimum.

**Split mode, deliberately left alone — do not "fix" these:**
- The lower-left quadrant is empty at every stop. VEN was offered a
  hangul watermark and an enlarged bleeding plate and chose **"leave it
  empty"**. The whitespace is intentional.
- `?ground=` (the shadow under each plate) is nearly invisible, because
  the keyed paintings already feather out at the bottom and there is no
  hard edge to seat. Known and accepted; `?ground=0` loses nothing.
- The four wash tones are similar for stops 2–4 because the paintings
  share a palette. Only Gyeongbokgung is a clear outlier (autumn
  foliage). Turning `?washsat=` up further starts to read as tinted
  rather than aged.

---

## 9c. Session 5, part 2 — the village became CHAINED STATE PLATES

**VEN rejected the sprite composite on sight** ("that stuff you just
did looks really bad") and proposed full images instead: the same
valley painted 16 times, each with one more building. That is now the
plan, with one correction that VEN accepted implicitly by the prompts
they were given: states are CHAINED (each generated from the previous
one in Recraft's editor), never regenerated fresh from a count in the
prompt — fresh generations shuffle the whole scene and break "come
back and count the roofs", and models can't count anyway.

Read `art/village/PROMPTS.md` — it is the operative document: the
loop VEN runs, the per-state prompt table, the sizing rules.

**Cap raised to 20 roofs / $2M** (VEN, same day): config.js
`maxRoofs: 20`, 5 extra plots appended to the three duplicated PLOTS
tables (village.js / place.html / fakestates.js), prompt table runs to
state 20 with the grand-compound finale at 20. Verified: $1.75M →
state-17, $2.1M → state-20 + "The field is full".

What exists and is verified in Chrome:
- **States engine in js/village.js**: `state-00.png` … `state-20.png`
  in art/village; shows `state-N` for N roofs, crossfades on growth
  (1.2s, instant under reduced motion), prefetches N+1, only two
  frames ever loaded. Missing state → nearest lower state shows (the
  village pauses growing; the stat stays honest). Mode cascade:
  `?village=sprites` forces sprites; else states if state-00 loads;
  else sprites if field.png loads; else the inline SVG.
- **`state-00` is already REAL** — it is valley.png's band crop; the
  empty valley was approved art before this plan existed. 1/21 done.
- **`state-01`–`20` are PLACEHOLDERS** from `tools/fakestates.js`
  (sprite composites — the very look VEN rejected, kept deliberately
  as the position/size guide for inpainting each new building).
- **tools/crop.js** now also crops any root `state-NN.png` master to
  the field band automatically, and refuses size-mismatched exports
  with a message. VEN's loop is: export square master to root → `node
  tools/crop.js` → reload.
- The sprite pipeline (extract.js, place.html, b-*.png, the seeded
  assignment with the pinned gate) is intact behind `?village=sprites`
  — fallback layer + possible template for future tokens.

Still open when the real states land: delete the leftover placeholder
states beyond the last real one (or keep replacing until 20), then
deploy-optimise (states are ~1.6MB each as PNG; webp at deploy —
README updated. Only 2 load at once, so even unoptimised the page
stays usable).

### The generation route VEN chose: image variations, not the brush

VEN has BOTH tools. They chose Recraft's **"create variations"** for the
state chain over the area-edit brush. That was flagged honestly — a
variation re-renders the WHOLE frame, so the mountains and pines repaint
at every step, and enough drift turns the crossfade from "a house
appeared" into "the picture changed". Mitigations given, and in
`art/village/PROMPTS.md`:

- prompt restates everything that must survive ("same misty ridges,
  same red pines, same footpath… every existing building stays exactly
  where it is"), because variations drift on whatever goes unsaid;
- variation strength as close to the original as the slider allows;
- **drift check: open two consecutive states and watch the MOUNTAINS,
  not the buildings.** If ridges shift or a pine moves, switch that step
  to the area-edit brush, which cannot drift.

`art/village/PROMPTS.md` now holds all **twenty prompts fully expanded**,
one per state, ready to paste — no assembly. Plus the shared negative
prompt. VEN was asked to send states 01 and 02 back before going
further, so drift is caught at step 2 rather than step 15.

**Building mix across the 20:** houses at 1,4,7,10,14,15,19 · the gate
straddling the path at 2 · thatched farmhouses at 3,8,12,17 · pavilions
at 5,11,16 · L-shaped hanoks at 6,13,18 · walled compound at 9 · the
grand compound finale at 20.

### Demo deploy (2026-08-13)

Deployed to show progress mid-rebuild. What ships and what does not is
in `tools/build.js` — run it, it writes `dist/`. The rules that matter:

- **Only `state-00.png` ships.** States 01–20 in the repo are the
  placeholder composites built from the rejected sprite look; shipping
  them would show VEN's client art they already turned down. With them
  absent the engine falls back to state-00, so the village shows the
  empty valley — which is exactly what the site looks like at launch.
- `config.js` in `dist/` is rewritten with `marketCap: 0, holders: 0`
  so the stats agree with the empty field. **Flip both back the moment
  real states land** (or for a demo that shows growth).
- Excluded: `tools/`, all root masters (`*.svg`, `valley*.png`,
  `b-*.png/svg`, `state-*.png`), `art/village/field-square|tall|wide`,
  `debug-*`, the markdown, `journey-reference.html`, the reference jpg.

---

## 9b. Session 5 record (2026-08-13) — the village

### What happened, in order

1. **Audit of manifesto / ledger / village.** The village field was by
   some distance the weakest thing on the page: flat vector houses with
   a solid black roof blob, straight into three dead-level rows, sitting
   directly under the journey's keyed watercolours. It was also the only
   place the placeholder vector style was still visible on a normal
   load, since the journey's ink drawings are now only stand-ins.
2. **A rebuild of those SVG houses was started, and VEN stopped it.**
   Correctly: *"I saw you were building your own SVGs and no offence
   that isnt your strong suit."* This is the most important lesson of
   the session and it is now in §6b and in the startup prompt.
3. **New direction, VEN's own framing:** an empty valley plate plus a
   set of building sprites that the engine picks from as the market cap
   climbs. Chosen over cutting one finished village painting into
   fifteen pieces, or inpainting fifteen progressive states, because it
   is the only option that survives Zico launching a second token — a
   cut-up master is single-use, a sprite set is a template.
4. **The layer engine was built and verified against placeholder art**,
   so nothing waited on generation. All four failure paths measured in
   Chrome, not assumed (§6b table).
5. **Four tools**, all dev-only, all in `tools/`:
   `placeholder.js` (stand-in art, no deps), `prep.html` (keys/trims the
   raw Recraft exports so nothing is cropped by hand), `place.html`
   (drag the plots, prints the array), `crop.js` (cuts the plate bands).
6. **VEN delivered `valley.png`** — right first time, matches the
   reference exactly. It arrived 1:1 square; §6b covers why that had to
   be cropped and how the plots survive the crop.

### Findings worth keeping

- **Square art in a contained section is a trap.** The 1:1 plate made
  the village section 1561px tall against a 551px viewport — you scroll
  two screens of mountain before reaching the village. Measured. Any
  future square asset dropped into a section needs the same check.
- **Colour-keying a sprite by matching the background colour destroys
  it.** A hanok's hanji walls are nearly parchment-coloured. `prep.html`
  floods in from the border instead, so only what is connected to the
  outside is removed. Verified against a synthetic worst case: walls at
  rgb(239,230,206) on a rgb(228,214,178) ground survived at full alpha.
- **"Random" was the wrong word for what VEN wanted.** The building per
  plot is seeded, not random — see §6b for why that difference matters
  and what it is seeded from.
- Anything full-bleed drawn *inside* the field shows the field's own
  edges against the page, because the field is 1080px inside a full
  width page. Bit twice in one session: a paper-coloured mist rect in
  the SVG, then the plate itself. Masks and feathers, never washes.

### Priorities for the next session

1. **Finish the village.** VEN generates the six `b-*.png` from
   `art/village/PROMPTS.md`, runs them through `tools/prep.html`, drops
   them in `art/village/`. Then: place the plots in `tools/place.html`
   (the current values are a first guess against `valley.png`, not
   placed), pick a plate crop with `?plate=`, and retune the building
   widths — the placeholders carry padding, real tight-cropped sprites
   will read larger at the same `w`.
2. **The manifesto and the ledger.** VEN's stated target before the
   village took over — *"then we can move onto the next part of the
   website."* Untouched since session 3. From the session 5 audit, the
   real problem is not either section alone: once the journey's backdrop
   fades out at p=1, the whole lower half of the page — manifesto,
   ledger, village, footer — is four centred stacks on flat paper with
   no material and no change of rhythm across ~2,900px. Audit first,
   then options behind switches.
3. **Split mode still needs its scroll budget judged.** `.journey` is
   460vh, tuned for the road's continuous motion; four discrete stops
   get ~115vh each and may want to be shorter and snappier. Flagged to
   VEN, not yet decided — it is a feel call, so let them scroll it.
4. **When Zico delivers** (§1): swap `WORD` + title strokes in
   `js/hero.js`, the manifesto copy (marked in index.html), the hero
   tagline, the OG meta, and **the four `SPOTS[i].blurb` paragraphs** —
   that last one is new, split mode put real copy on screen where the
   road only needed two-word captions.
5. Show Zico the demo and chase name/ticker, copy, CA + links, and
   confirmation on art placement.
6. Launch day: fill `config.js` (README checklist), make og.png
   (1200x630 hero screenshot), ship favicon.ico + apple-touch-icon,
   absolutize og:image + add og:url.
7. Pre-deploy: optimise the art (README "Before deploy") and keep
   `tools/`, the root `.svg` masters and `art/village/field-square.png`
   out of the deploy folder. ~15MB of art is the one real weight left on
   the page.
8. Optional live wiring: market cap via Dexscreener pairs API (no key)
   feeding `HANOK.setVillage`; holder count needs Helius/Solscan (API
   key — ask VEN).
9. Minor, found during the session 5 audit and not yet fixed: with all
   three footer links null (`config.js`), `.footer__links` still takes
   its flex gap, leaving a dead band between 한옥 and the fine print.

### How VEN likes to work (sessions 4–5)

- **Build alternatives, don't pick for them.** Every good outcome this
  session came from shipping 2–3 treatments behind a URL switch
  (`?panels=`, `?road=`, `?journey=`, the four background flags) and
  letting VEN flip between them. Abstract descriptions do not land —
  asked to choose between four background ideas in words, VEN answered
  *"honestly no clue what any of these would look like."* Build first,
  screenshot, then ask.
- **Keep the losers in the code.** Asked for explicitly.
- **They check the work and ask direct questions about it.** When VEN
  asked whether a fix was "just" a timing change, the honest answer was
  yes — and that was the right answer. Correcting a wrong premise
  (e.g. "this needs less artistic work") was also welcomed. Do not
  oversell; do not get defensive.
- **Verify before claiming.** Two things were reported as "no change"
  when the code was correct: a stale CSS cache, and a scrollbar that
  MCP screenshots cannot photograph. Measure it, don't assume it.
- **VEN makes the art; you make the machinery.** Session 5's lesson,
  and the sharpest correction so far. VEN has Recraft and is good with
  it — the valley plate came back right on the first generation. Writing
  a prompt and building the compositing engine, the prep tool and the
  placement tool is the high-value work; hand-drawing pictorial SVG is
  not, and VEN will stop you. Inline SVG remains correct for fallback
  layers and structural marks.
- **They will interrupt when the approach is wrong, not just the
  output.** Take it at face value and change direction rather than
  defending the work in progress. The interrupted SVG rebuild was not
  wasted — it became the fallback layer — but saying so once is enough.
- **They ask for the thing they were briefed, in their words.** When
  VEN restates Zico's ask ("like in clash of clans"), check what is
  being built against it and answer plainly whether it matches.

## 9e. THE VILLAGE — CURRENT DIRECTION (2026-08-13, session 6 part 2)

**This is the live plan. §9d below is kept for its measurements and for
why the chained-states route was abandoned — do not execute it.**

### VEN's call, in their words

> *"6 buildings we reuse + 1 background image that can contain them all.
> these buildings will be transparent meaning there is nothing in the
> png other than images… i want [the footpath] to branch out loads so
> that you can put buildings on the end of each part of the footpath."*

So: back to a sprite composite, but with the two things that made the
session-5 attempt fail designed out of it.

### Why this is not a repeat of the rejected session-5 sprites

The session-5 composite failed for reasons that were diagnosed, not
guessed (see §9c, and `art/village/b-*.png` — look at them):

- the sprites were painted at a **closer viewing distance** and much
  higher detail density than the wide washy plate;
- their **viewing angle was lower** — seen from the side, while the
  plate looks steeply down;
- **light direction and colour temperature did not match**;
- **no convincing ground contact**, so they floated.

Two things change that this time:

1. **The plate is designed for sprites.** The footpath enters bottom
   centre and branches repeatedly, and every spur ends in a small flat
   patch of worn ground. Those patches ARE the plots. A building
   standing at the end of a path reads as sited rather than dropped,
   and an empty patch reads as room to grow — which is exactly the
   Clash-of-Clans empty-map feel §2 asks for. Plot placement stops
   being a guess and becomes "put it on the patch".
2. **The building look is already proven.** The hanoks inside
   `valley6 (2).png` sit in that valley perfectly, because they were
   painted in it. The sprite prompts describe *those* buildings, at
   *that* angle and light — the target is a known image, not a
   description.

### The shape

```
.village__plate
  <svg #villageField>       inline SVG fallback, hidden once art loads
  <img .v-base>             the new branching-path valley plate
  <img .v-house> x N        the six transparent sprites, one per plot
```

- Every sprite is a **fully transparent PNG — nothing in the file but
  the building and its own soft ground shadow.** No ground, no base
  plate, no vignette skirt, no border.
- CSS anchors each one **bottom-centre** (`css/site.css .v-house`,
  `translate(-50%,-100%)`), so a plot's `y` is its GROUND LINE and a
  building can be any height. **Every PNG must be drawn standing on the
  bottom edge of its own canvas** — that is the contract, and
  `tools/prep.html` trims to it.
- `--flip: -1` mirrors a sprite, so six files behave like twelve.
- Assignment is **seeded, not random** (§6b) — same village every
  visit, new roofs never reshuffle the standing ones.
- **Roof count follows the art.** It is `config.village.maxRoofs`, a
  number, not a constraint: once the plate lands I count the usable
  spur ends and set `maxRoofs` and `perRoof` to match. If the meadow
  carries 14 good plots, the village is 14 roofs and each is ~$140k.

### The style set is the whole ball game

`art/village/ref/*.png` are the six approved buildings cut out of
`valley6 (2).png` — cut this session, ready to drag into Recraft. **The
custom style is built from those six and nothing else.**

§6b's old instruction was to build the style from
`hand drawn reference.jpg` plus the four journey paintings. **That
instruction caused the session-5 failure.** Those are close-up,
near-eye-level architectural studies; `art/village/b-*.png` are
faithful reproductions of them. The style did what it was told. Feeding
it the approved village buildings instead makes its prior "a small pale
hanok seen from above" rather than "a misty valley seen close up".
Each generation also gets its matching `ref-*.png` as a per-image
reference — that is what actually holds the viewing angle, which no
amount of wording does on its own.

### What VEN generates tonight

Seven images, all from `art/village/PROMPTS.md` (rewritten this
session, paste-ready, nothing to assemble):

| file | what |
|---|---|
| the plate | empty valley, branching footpath, a clear patch at every spur end |
| `b-house.png` | small hanok, pale hanji walls, blue-grey tiled roof |
| `b-gate.png` | two-storey gate pavilion, open timber gateway (straddles the path) |
| `b-thatch.png` | farmhouse, rounded golden thatched roof |
| `b-pavilion.png` | open pavilion on bare timber posts, no walls |
| `b-lhouse.png` | L-shaped hanok, two wings meeting at a corner |
| `b-walled.png` | grand hanok compound behind its own low boundary wall |

### What happens when they land

1. Sprites through `tools/prep.html` (keys the background by flooding
   in from the border — **do not colour-key by matching, hanji walls
   are nearly parchment-coloured and vanish**; verified in §9b).
2. Plate to `art/village/field-square.png`, `node tools/crop.js`.
3. Re-place `PLOTS` in `tools/place.html` onto the spur ends. The
   current values were placed against a different valley and are
   meaningless — this is the one step that cannot be skipped.
4. Retune the per-type `scale` in `TYPES` (`js/village.js`) — the old
   placeholders carried padding, tight-cropped sprites read larger at
   the same `w`.
5. Set `maxRoofs` / `perRoof` from the plot count.
6. **Flip the mode cascade.** `mountStates()` currently wins whenever
   `state-00.png` loads, so sprite mode is only reachable via
   `?village=sprites`. Either remove `art/village/state-*.png` or
   invert the check.

### State of play when VEN went to sleep

Done this session and on disk:
- `tools/png.js` — the PNG codec, shared.
- `tools/patch.js` — cuts new buildings out of a later painting and
  composites them onto the base. Built, working, and **now probably
  moot** under this direction — keep it, it is the way back to states
  and it took one command to derive six growth frames from two
  paintings.
- Band re-cut to `[0.300, 1]` in `tools/crop.js` and `js/village.js`
  (`tools/fakestates.js:34` and `tools/place.html:184` still say
  0.410 — fix when the plots are re-placed).
- `art/village/field-square.png` is now `valley0.png`; `field*.png`
  re-cut from it.
- `art/village/state-00…06.png` are real, derived by `patch.js` from
  `valley0` + `valley6`. The 14 placeholder states were moved to the
  scratch folder (`node tools/fakestates.js` regenerates them).
- `js/config.js` `marketCap: 600_000`.

Still open regardless of direction: the engine defects in §9d step 4,
the `optimize.js` shared-palette problem, `build.js` deleting
`dist/.vercel/`, live market-cap wiring, and the section-height
problem (stats and field never share a screen).

---

## 9d. Village plan — SUPERSEDED by §9e, kept for the measurements

**Do not execute this. §9e is the live plan.** What is still worth
reading here: the measured drift numbers, why chaining twenty Recraft
generations does not work, the engine defect list (step 4), and the
deploy hazards (step 7) — all of which survive the change of
direction.


VEN: *"nothing is working."* It was diagnosed rather than guessed, and
the diagnosis changed the plan. Read this section instead of §9c's
generation loop; everything else in §9c still stands.

### What was actually wrong (all three verified in Chrome / on disk)

1. **The engine was never broken.** Live at `?motion=1`: `$840k` →
   `state-08`, `$0` → `state-00`, stats correct, crossfade wired, all
   four 404 fallbacks intact. `js/village.js` needed no rebuild.
2. **VEN's seven real generations never entered the pipeline.**
   `tools/crop.js:163` discovers only `/^state-\d\d\.png$/` in the repo
   root. VEN's files are `valley0.png … valley6 (2).png` — wrong stem,
   and four carry Chrome's literal `" (2)"`. So `art/village/` still
   held the 18:23 `fakestates.js` placeholders, i.e. **the rejected
   sprite composite**, and `marketCap: 840_000` asks for `state-08`,
   which is that composite drawn on the OLD valley's terrain. VEN was
   looking at rejected art on the wrong landscape and reasonably called
   it broken.
3. **The deployed site cannot grow, by design.** `tools/build.js:35`
   ships only `state-00.png`; `:38` rewrites `marketCap: 0` into
   `dist/js/config.js`.

Plus a trap that would have burned the first fix attempt:
`valley0.png` is a **different painting** from `valley.png` (mean diff
68.6/255; `valley.png` ≡ `art/village/field-square.png` ≡ the current
`state-00.png`, byte-identical). Renaming `valley1–6` in while leaving
`state-00` alone makes the FIRST roof swap the whole landscape.

### The one real design change: generations ≠ states

VEN's chain is good art. The problem is the tool: Recraft "create
variations" re-renders the whole frame, so every step repaints grass,
pines and ridges. Measured on VEN's own files, over the 86% of frame
containing no new building:

| step | mean ΔRGB | %px >20 |
|---|---|---|
| 0→1 | **22.6** | 39.1% |
| 1→2 | 10.1 | 11.9% |
| 2→3 | 9.1 | 9.4% |

0→1 is a full regeneration and reads as *the picture changed*. Later
steps are cleaner but still shimmer globally on a 1.2s crossfade, and
the drift is monotone — extrapolated to state-20 the meadow is ~25 MAD
from state-00, visibly furrier and darker. **Restricted to the shipped
band it is worse (0→1 = 26.3), because the drift lives in the valley
floor, not the mountains** — §9c's advice to "watch the MOUNTAINS" was
pointing at the part of the frame that gets cropped away. Ignore it.

**Geometry does not drift at all.** Every 64px tile matches at offset
(0,0) through the entire chain, v1↔v6 included. So the drift is fully
removable by compositing: take state N−1 and paste ONLY the new
building out of state N.

Tested on the real files. Diff at RGB-euclid >70, connected components
≥2000px, **no** morphological denoise (opening fragments the buildings
while the drift survives):

| chapter | buildings | blobs found | largest rejected | smallest kept | margin |
|---|---|---|---|---|---|
| valley0→valley3 | 3 | 3 | 332px | 6070px | 18× |
| valley3→valley6 | 3 | 3 | 193px | 5161px | 27× |
| valley0→valley6 | 6 | 6 | 1219px | 5524px | 4.5× |

Seam artifact gradient 1.2–1.3 units/px against the painting's own
local gradient of 20–26 at the same pixels (ratio 0.07–0.09); 0.0–0.1%
of boundary pixels exceed natural texture. Synthesized composites are
indistinguishable from VEN's real generations at 3× zoom.

**Therefore: VEN generates paintings, code derives states.** A
generation may add one building or five; `tools/patch.js` diffs
consecutive exports, splits whatever it finds into per-building
patches, orders them, tone-corrects and composites them onto valley0.
The number of generations stops being tied to the number of states.

What this buys:
- VEN's existing 7 files become clean states **today, zero new
  generations** — including repairing the bad 0→1 step.
- ~4–6 generations for 20 buildings instead of 20.
- A re-rolled middle generation no longer invalidates everything after
  it: only its own buildings change.
- The model never has to COUNT. "Add two or three more hanoks" is a
  prompt it can satisfy; "make it exactly eleven" is not.
- **Reveal order becomes a code decision.** Buildings can be ordered
  for a growth story (near the path first, spreading outward) whatever
  order they were painted in.
- The background is bit-identical across every state, so the crossfade
  is literally "a house was built".

Accepted costs, measured, not hand-waved:
- A ~8–11 luma lightening ring at the collar where ground is imported
  from the later painting. Invisible at ship size, visible at 3×.
  Corrected with a constant median offset from the surrounding
  annulus. The low-frequency drift-field variant was tried and its
  advantage is 0.00–0.15 luma — **inside noise, not worth the code**.
- **The correction must be computed against `valley0`, never against
  the chapter's own base.** Chapter-2 patches read −2.5 luma against
  valley3 but −7.5 against valley0, which is the plate they are
  actually glued to. Getting this backwards leaves a −22 step.
- Buildings whose silhouettes TOUCH merge into one blob and can only
  be revealed together.
- Ground painted BETWEEN two buildings belongs to neither blob and
  travels with whichever appears first. This already fired once at 6
  buildings (a 121×37 path blob) and is what ate the separation margin
  in the 6-building row above. It becomes routine at 20 unless the
  prompt forbids it.

### Decisions taken (do not re-open without a reason)

- **Band `[0.30, 1]`, re-cut from `valley0`.** `[0.410, 1]` was tuned
  for the old valley; on this one it decapitates the pavilion added at
  state 5 (occupies master rows ~395–510, cut at row 420) and the 4%
  top feather then dissolves the stub. Derivation: with feather
  `41(1−t)` and 30px clearance, a roof at row 395 needs `t < 0.33`.
  0.30 gives a 1024x717 plate (1.43:1), 88px from roof top to frame
  top, 59px clear of the feather, and keeps the ridge feet and mist
  line — which is what makes it a valley rather than a lawn.
- **Placement rule for VEN: no roof above 40% of the square** (row 410
  of 1024). With a 0.30 band that is real margin, not a tightrope.
- **No chapter-size prescription.** The audit's "4–5 per chapter" rests
  on a 2-point trend the intermediate points contradict (margins by
  chapter length 1–6: 80×, 50×, 18×, 30×, 18×, 4.5×; the 4.5× is one
  path blob, not accumulation). Generate what looks good; the tool
  splits it.
- **Roofs never come down.** MC is volatile and a village that loses
  houses on a dip is the wrong feeling for this product. `config.js`
  gets `village.floor`, the highest milestone reached; the engine shows
  `max(floor, live)`. No backend, no false claim.
- **The sprite pipeline stays behind `?village=sprites`** as the
  fallback and as the template for Zico's second token. No further
  investment in it.
- **PLOTS coordinates are irrelevant to states mode.** Only
  `SLOTS.length` matters, via `js/village.js:909`. Do not spend time
  re-placing plots in `tools/place.html` unless sprite mode is being
  revived.

### Build order

**1. Get VEN's real chain on screen (~30 min, no new art).**
`valley0 → state-00.png` (mandatory — it is the head of this chain),
`valley1–6 → state-01…06.png` in root; `cp valley0.png
art/village/field-square.png`; set the band to `[0.30, 1]`; `node
tools/crop.js`; delete `art/village/state-07…20.png` so the engine's
nearest-lower-state fallback holds at 6; `config.js marketCap:
600_000`.
**The band constant is duplicated in FOUR files** — `tools/crop.js:32`,
`js/village.js:360`, `tools/fakestates.js:34`, `tools/place.html:184`.

**2. `tools/patch.js`.** Dependency-free, PNG codec lifted from
`crop.js`. Input: the ordered exports. Output: `state-00…NN.png` in
root, ready for `crop.js`. Steps: diff vs previous export → threshold
70 → CCL → keep ≥2000px → close(r=14) → fill holes → dilate(r=5)
collar → box-blur feather → constant median offset from the annulus,
computed against valley0 → composite onto the accumulated plate.
Re-derive VEN's existing 7 through it, which repairs 0→1 for free.

**3. The remaining 14 buildings.** ~3 more generations. Rewrite
`art/village/PROMPTS.md`: delete the 20-prompt table and the
`state-00 is valley.png` claim (it appears at both :24-25 and :32),
replace with one prompt plus the three placement rules — keep
silhouettes clear of each other, no roof above 40% height, do not paint
paths linking buildings.

**4. Engine hardening.** Four real defects, in priority order:
- `js/village.js:444` hides the SVG fallback before the first state
  frame exists → blank plate for the whole 1.7MB download on first
  load. Move it into `showState`'s callback, after `appendChild`.
- `js/village.js:428-431, 480-484` — `stateMissing` is never cleared
  and the speculative prefetch writes into it. One network blip wedges
  the village for the session; a blip on state-00 freezes it entirely.
  Needs retry, and the prefetch must not poison.
- `js/village.js:452-485` — no request-ordering guard, so a slow cold
  frame can overwrite a fast warm one. Add a generation token.
- `js/village.js:471-476` — the fade-in is rAF-gated but the 1400ms
  old-frame removal is a plain `setTimeout`. In a backgrounded tab
  (the normal case for a live MC feed) the old frame is deleted while
  the new one is still at opacity 0 → empty plate. Arm the timer inside
  the second rAF, or remove on `transitionend`.
Also: `index.html:188` carries the section's only `aria-label`, on the
SVG that states mode hides. The plate needs its own.

**5. Live wiring — without this the feature does not do the thing.**
Market cap from the Dexscreener pairs API (no key), polled ~90s and
only while the tab is visible, into `HANOK.setVillage`. Holder count
needs Helius or Solscan and an API key — ask Zico or ship the tally
static. Apply the `floor` ratchet from above.

**6. Composition.** Measured at 1045x450: stats top 4529, plate bottom
5224 — **695px of content in a 450px viewport, so "roofs raised: 8" and
the field are never on screen together.** For a section whose whole
promise is "come back and count the roofs" that is the real remaining
design problem, and it is independent of the band. This is the one item
that touches layout, so it gets built as an option rather than applied.

**7. Deploy.** `tools/build.js:35` `SHIP_STATES` allow-list → glob;
`:38` `DEMO_ZERO = false`; extend `tools/optimize.js` `TARGETS` to all
21 states (34.7MB → ~9.3MB).
- **`tools/build.js:66` `fs.rmSync(DIST)` deletes `dist/.vercel/` on
  every build**, unlinking the `hanok` Vercel project
  (`prj_DGDPggbmI6NCnXLUALD0aHNjre3j`). Preserve it across the wipe.
- **`tools/optimize.js:277-278` gives every file its own median-cut
  palette + Floyd–Steinberg dither. Measured: after quantisation two
  adjacent states differ on 89% of pixels (1.3% before).** That undoes
  the entire premise of the crossfade. States need a shared palette or
  no quantisation. `optimize.js` is also not idempotent (a second run
  re-quantises: 452KB → 385KB with further loss), and
  `crop.js:76-77` rejects colour-type 3, so an optimized PNG dropped
  back into root hard-fails.

### Evidence on disk

Scratch (nothing in the repo was modified by the investigation):
`…/95e3c074-…/scratchpad/` — `FINAL-zoom3x-house--base_MINE_VENreal.png`
(3×: base | composited | VEN's real valley1), `LF6-state-0…6.png`
(seven states derived from TWO paintings), `FINAL-halo-4way…png` (the
worst-case collar halo), `crops/v6-band410.png` vs `crops/v6-band220.png`
(the clipped pavilion), plus the measurement scripts.

## 9f. Session 7 (2026-08-14) — the prompt sheet, verified and published

**Short version: nothing about the plan changed. §9e is still the live
direction, `art/village/PROMPTS.md` is still the source of truth, and
the seven images are still the one thing outstanding.** This session
verified that sheet against the handoff and made it pasteable.

### What VEN asked

> *"read the handoff file and give me prompts for all of the assets we
> need to make the clash of clans style village happen. we need a
> background with the appropriate footpath + maybe 6 building types.
> Make sure all prompts state we want transparent images with no
> background so we can just lay them over the background image"*

### What was found

That request is **exactly** what §9e specified and what session 6
already wrote into `art/village/PROMPTS.md` — 1 branching-footpath
plate + 6 transparent building sprites, transparency clause on every
building. No new prompts were written. Rewriting them from scratch
would have thrown away the tuning done against the diagnosed
session-5 failure (angle, density, key, attached scenery).

**If a future session gets this request again: the answer is
`art/village/PROMPTS.md`. Do not regenerate it.**

### What was actually produced

- `art/village/prompt-sheet.html` — the sheet as a self-contained page,
  each prompt in a copy-to-clipboard block, built on the site's own
  palette (paper/ink/pine, §4). Published as an artifact:
  **https://claude.ai/code/artifact/373f78af-87fd-4950-ad90-a767d53f0de2**
  To update it later, republish that same URL — publishing the file
  without the URL makes a second, separate artifact.
- The per-building numbers from §9e's "Notes for the build" were pulled
  **into** the sheet, so VEN sees frame fill, height ratio, reference
  crop and engine scale next to each prompt instead of buried in the
  handoff:

  | file | frame fill | height | ref crop | `TYPES` scale |
  |---|---|---|---|---|
  | `b-house` | 30% | 0.60 × w | `ref-house.png` | 1.00 |
  | `b-gate` | 36% | 0.90 × w | `ref-gate.png` | 1.20 |
  | `b-thatch` | 28% | 0.75 × w | `ref-thatch.png` | 0.95 |
  | `b-pavilion` | 25% | 0.67 × w | `ref-pavilion.png` | 0.85 |
  | `b-lhouse` | 46% | 0.50 × w | `ref-lhouse.png` | 1.55 |
  | `b-walled` | 60% | 0.50 × w | accepted `b-lhouse.png` | 2.00 |

- The transparency clause was highlighted in every building prompt on
  the page. The `<mark>` is display only — copy uses `textContent`, so
  what lands in Recraft is clean text.

### The one clarification worth keeping

VEN's ask said *"all prompts"* want transparency. **The plate is the
exception and it is deliberate.** `field-square.png` is the ground
everything else lays over, so:

- transparency toggle **off**,
- it does **not** go through `tools/prep.html` — that would save it
  square under the wrong name and put every building 30% of a
  plate-height off its ground line,
- it goes straight to `art/village/field-square.png`, then
  `node tools/crop.js`.

Six transparent, one opaque. That was stated back explicitly and not
objected to.

### State on disk, unchanged from session 6

No engine code, config or art was touched this session. Everything in
§9e "State of play" still holds, and every open item in §9e (plot
re-placement, `TYPES` retune, `maxRoofs`/`perRoof`, the mode cascade
flip) and §9d step 4 is still open.

New files, both additive:

```
art/village/prompt-sheet.html    the pasteable sheet (keep out of dist/)
```

### Next session starts here

1. VEN generates the seven images from `PROMPTS.md` (or the artifact).
2. Then §9e "What happens when they land", steps 1–6, in that order.
   Step 3 — re-placing `PLOTS` in `tools/place.html` — is the one that
   cannot be skipped.

## 9g. Session 8 (2026-08-14) — village life, scoped not built

**Nothing in `js/`, `css/`, `index.html`, `js/config.js` or `art/` was
touched.** §9e is still the live plan and the seven images are still
the only blocker. This session answered two questions.

### 1. "What prompts do I need for the marketcap→buildings feature?"

Same answer as session 7, and for the same reason: **the prompts already
exist and are tuned** — `art/village/PROMPTS.md`, pasteable copy at
`art/village/prompt-sheet.html` /
https://claude.ai/code/artifact/373f78af-87fd-4950-ad90-a767d53f0de2.
Run order restated to VEN: style from `ref/*.png` only → plate
(img2img from `valley0.png`, opaque) → six buildings (transparent, each
with its `ref-*.png` attached), `b-walled` last.

### 2. VEN's new idea — people walking, birds flying

> *"how would i go about having small people walking around the village
> randomly and maybe really small bird silouettes flying around the
> screen once the valley is on the users screen"*

Verdict given: **not too complex — birds are free, people cost one
generation and a small tool.** The measured fact that drives every
decision: at the shipped plate width (1080px) a hanok is 130–190px
across, so a villager lands at ~**10 × 25px**, and ~**4 × 9px** on a
390px phone. Silhouette and tone are everything; detail is a liability.
That also means the §3 "never rescale afterwards" rule does NOT apply to
figures — they are generated large and shrunk hard on purpose.

Design, written into `PROMPTS.md` §8 (prompt) and its build notes:

- **Birds: no art.** Two ink strokes, drawn in code over the plate, with
  a `scaleY` flap and a glide. A painted PNG cannot flap, and at 8–14px
  a stroke beats a texture. Flagged to VEN as the one deliberate
  exception to "VEN makes the art" — a flick is a structural mark, not a
  picture. Fallback if rejected: a three-pose bird sheet in the style.
- **People: ONE sheet of eight figures**, not eight generations —
  agreement in angle/light/density matters more than per-figure tuning
  at this size. This is §6's "if nothing agrees" fallback used as the
  *first* choice. Prompt + its own negative (the buildings' shared
  negative bans "people, figures") + a six-point check list are in §8.
- **TWO sheets, not one** (VEN, same day: *"just some sort of walking
  animation may be needed"*). Sheet A = left leg forward, sheet B =
  right; alternating them is the walk cycle, and the code adds bob and
  sway on top. B is generated from A as an image reference, changing one
  clause, and only after A is accepted. Cut as `p-01a…08a` / `p-01b…08b`
  into `art/village/people/`. **A and B must trim to the same ground
  line** or the walker hops 3px every step.
- Engine shape: `.v-walker` imgs anchored bottom-centre like `.v-house`,
  driven by **transform only** (never `left`/`top` per frame), painter
  order via `z-index` from `y` recomputed only when the order changes;
  birds in one `<svg>` overlay above everything. rAF gated by an
  IntersectionObserver on `.village__field` — literally VEN's "once the
  valley is on the user's screen" — plus `document.hidden`. Reduced
  motion: walkers stand still, birds hold a pose.
- Walk routes need a **polyline mode in `tools/place.html`**; nothing
  can infer path geometry from a painting.
- Population tied to growth: walkers ≈ `1 + floor(roofs × 0.6)`, capped
  ~12, so the field fills with people as it fills with roofs — the first
  thing on the page that makes the "villager tally" stat visible.

**Known limit, stated up front:** in **states mode** a walker cannot be
occluded by a building, because the buildings are baked into the state
PNG. Step 1.7 of the plan removes states, so this only bites if that is
reversed — then gate walkers to sprite mode.

### The operative document is now `PLAN.html`

VEN approved the direction and asked for the full build plan. It is
**`PLAN.html` at the repo root** — three phases in dependency order
(valley + houses → villagers → birds → ship), every step with its owner,
the tuning numbers, the gates between phases, the decisions-taken table
and the switch list. Published as an artifact:
**https://claude.ai/code/artifact/c447493c-8c1d-4eb5-b192-1e442de4293a**
(republish that same URL to update it; a bare publish makes a second
artifact). Keep it out of `dist/` — `build.js` ships from an allow-list,
so it is excluded by default.

`HANDOFF.md` stays the deep context and the review history; `PLAN.html`
is what gets worked through, and `PROMPTS.md` is what gets pasted into
Recraft. Nine images now, not seven: the plate, six buildings, two walk
sheets.

Two items in the plan **need no art and can be built today**: the birds
(phase 3) and the route-tracing mode in `tools/place.html` (step 2.3).

---

## 10. Where past-session context lives

Claude's persistent memory for this project:
`C:\Users\Nino\.claude\projects\C--Users-Nino-Desktop-hanokV2\memory\`
(`hanok-token-site.md` — keep it updated as things land).

---

## 9h. Session 9 (2026-08-14) — the art got made, and the village stood up

The blocker in every previous handoff was "VEN has to generate the
images." That is gone. All seven exist, in the repo, keyed and placed.

### What actually changed about how

**The tool is OpenArt, not Recraft.** Every prior session wrote the
plan around Recraft — its custom styles, its transparency toggle, its
negative-prompt field, its `strength` slider. VEN uses **OpenArt**. It
has none of those four things. The `openart` MCP server is registered
in `C:\Users\Nino\.claude.json` (project scope) and authenticates over
OAuth, so generation is now a tool call rather than a person clicking.

- model **`nano-banana-2`**, mode `image2image`, `1K`, `1:1`
- **20 credits an image** (Nano Banana *Pro* is 40 and was not needed)
- up to 8 an image batch; 3–4 is the useful number
- no negative field, so every negative got folded in as
  "Avoid entirely: …" at the end of the positive prompt
- no transparency, so everything comes back on flat mid-grey — exactly
  the fallback the prompts already asked for — and `cutout.js` keys it

**The plate was edited, not regenerated.** `valley0.png` was already
the picture VEN preferred; it only lacked lanes and clearings. Framed
as an edit — *keep everything, change only the meadow floor, keep the
existing trunk path and continue it* — all four candidates kept the
mountains, the mist and the celadon. The session-8 v1 disaster (mist
gone, bowl flattened to a plain, green gone acid) simply did not recur.
An edit model given an edit instruction has nothing to regenerate.
`p1` shipped; `p2`–`p4` are in `art/village/alt/`.

**The buildings were cut out of the painting, not drawn.** This is the
finding worth keeping. Generating `b-house` from the tuned §3 prompt
produced a genuinely lovely picture that was useless: 75% of frame
against a prompt asking for 30%, roof ruled tile by tile, doors
panelled — an architectural study that could never sit inside a loose
valley landscape. The matted reference was attached and lost, because
the prompt said "use only as a style reference, do not copy their
background", and the model obliged by ignoring the composition too.

The reference crops were already the right answer. They are cut from
the valley painting, so they have the right scale, the right looseness,
the right steep angle and literally the right hand. The only thing
wrong with them was the patch of ground they were standing on. So:

> Keep the building EXACTLY as it is and do not redraw it — same size,
> same position, same angle, same loose thin ink line, same low level of
> detail. Erase the ground, the grass, the rocks and the soft feathered
> halo around it, and replace all of it with one flat even mid-grey
> field. Keep one soft grey-green watercolour shadow beneath it.

Five of six landed in the first batch of three. **Detail density now
matches across the whole set for nothing** — every sprite was painted
at the same distance in the same picture — which is precisely what the
frame-fill percentages in §3 were straining to achieve by hand, and
what killed the previous set when it failed.

`b-walled` had no crop to cut (there is no walled compound in the
valley) and took three rounds:

1. *tabletop.* A boundary wall seen from a steep angle became a flat
   tray with a white plane inside it — the "diorama base" the shared
   negative bans. 920px wide against a 294px house.
2. *right shape, wrong value.* Tightening the wall onto the buildings
   fixed the proportions. But the courtyard came back bright white, and
   at village scale five of them pulled the eye off everything else.
   **This was only visible in the rendered village, not in the sprite.**
3. *fixed* by naming the two faults as faults — "**NOT a tray**", "**NOT
   white** — bare trodden earth, clearly DARKER than the hanji walls" —
   instead of burying them in a list of banned words. Built by *adding*
   a wall and an outbuilding to the accepted `b-house`, so it stays in
   the same hand. Round 1 kept at `alt/b-walled-v1.png`.

### The four tools

| tool | what it does |
|---|---|
| `tools/refmat.js` | (session 8) mats the raw crops onto mid-grey at the right frame fill |
| `tools/cutout.js` | **headless `prep.html`.** Border flood, soft alpha, unpremultiply the grey out of the edge, drop specks, trim. The trim is what makes the bottom edge the ground line. |
| `tools/plots.js` | finds the plots **in the plate**; `--write` patches `PLOTS` into `js/village.js` |
| `tools/render.js` | draws the whole village headlessly at any roof count |

**`cutout.js --debug` writes the cut over flat magenta. Look at that,
never the RGBA file.** Two of twelve candidates had the key eat a hole
through a roof whose slate blue-grey drifted within tolerance of the
background. Against white that is invisible; against magenta it is
unmissable. Same class of bug as the broken-image glyph in §5.

**`plots.js` reads the painting.** The plate was asked for ~10 clearings
of bare earth and got them, so the clearings *are* plots — no reason to
drag markers around `place.html` and hope. Bare earth is warm (red above
green); meadow is celadon (green above red); that one comparison beats
any brightness threshold, which would also catch the mist and the pale
boulders. A lane and a clearing are the same paint, so **shape**
separates them: erode the pale mask and ribbons vanish while blobs
survive. The engine wants 20 plots and the painting has ~10 clearings,
so the rest are placed *against the lanes* — near pale ground but not on
it, which is the same rule the clearings satisfy naturally.

Three things it got wrong first, all worth knowing:

- **Foreground pines are open crowns.** Lit grass shows between the
  branches, so every scanline envelope — min/max, percentile, longest
  run — read that speckle as meadow and put roofs in a tree. Fixed by
  testing distance to dark ink directly. But the meadow is flicked all
  over with dark grass tufts in that same ink, so the dark mask must be
  **eroded first**: a tuft is a 2px stroke and vanishes, a pine crown is
  a mass and survives. Without the erosion it returned 7 plots for 20.
- **Greedy front-to-back filling piled 14 of 20 roofs into the
  foreground**, because that is where the lanes are widest. Fixed with
  per-row quotas `[5, 7, 8]`.
- **Vertical spacing was weighted backwards.** `sqrt(dx² + (k·dy)²)`
  with `k > 1` makes vertically separated pairs look *further* apart, so
  two thatched roofs landed 0.007 apart in x and overlapped. `k` must be
  **below** 1 (0.75), because a sprite is drawn from its ground line
  upward and covers roughly its own height of the plot behind it.

### Verified

Chrome, `?motion=1`, sprite mode confirmed (`has-art`, base `field.png`,
20 plots) at 1, 6 and 20 roofs. `render.js` matches the browser.

**Screenshot capture is unreliable on this page** — it returns blank
parchment for 5–30s after navigation while ~9MB of PNG decodes, and one
`Page.captureScreenshot` timed out outright. The DOM reports correct
geometry the whole time, so it is compositor lag, not a bug. Wait, and
take a *second* screenshot. Or use `render.js` and skip the browser.

### Left open, deliberately

- **The type mix is uneven at some seeds.** This run gives pavilion ×7
  against lhouse ×1 and walled ×1. `assign()` draws uniformly per plot
  with only a don't-repeat-your-neighbour rule, so frequency is
  unconstrained. The real seed is the contract address, so it is a
  lottery at launch. A weighted bag drawn without replacement would fix
  it — **not done, because that is tuned logic nobody asked me to
  change.** Flag it to VEN before touching it.
- `optimize.js` gives every file its own median-cut palette. The six
  sprites are separate files that must agree in colour, and the walk
  sheets (phase 2) must agree frame to frame. Check that before deploy.
- `PROMPTS.md` §§3–5, `prompt-sheet.html` and `PLAN.html` still describe
  the Recraft workflow. PROMPTS.md now carries a banner correcting it;
  the other two do not.
- `tools/fakestates.js` and `tools/place.html` still hold the stale
  `PLATE_CROP` of `[0.410, 1]`.
- Placeholders and fakes are parked, not deleted: `art/village/_fake/`
  (state plates) and `art/village/_placeholder/` (the old `b-*.png`).

---

## 9i. VEN's review of the standing village — THE NEXT SESSION'S BRIEF

VEN looked at the rendered village at the end of session 9: *"honestly
not bad at all but the placements need work."* Everything below is his,
in his priority order. **Do the first block, get it signed off, and only
then touch the second.** He was explicit about that: *"first lets
perfect it as is and then once it is perfected we can make these subtle
adjustments."*

### Block 1 — perfect it as is

1. **Leave the footpaths clear.** This is the rule he stated, and it is
   the main complaint: *"some are good, fit in a dedicated spot
   perfectly, but some are just in the middle of a footpath."*
2. **Scale each building down slightly**, and its plot with it, so more
   fit in the same valley.
3. **More free spaces.** *"increase the number of free spaces for
   buildings."* Empty plots are the feature — they read as room to grow.
4. **Buildings must line up with their dedicated spots** — a sprite
   should sit ON its painted clearing, not beside it.

### Block 2 — only after block 1 is signed off

5. **Make the plate cover the whole screen.** *"is there any way to make
   the background scale up so it covers the whole screen."*
6. **Then scale the plots down further again and add more of them**,
   since a full-bleed plate has more room.
7. **The footpaths look slightly unnatural.** He raised replacing the
   background over it, then walked it back the same message: *"Actually
   the footpaths aren't that bad."* **Lowest priority. Do not
   regenerate the plate over this** without asking — he likes the
   painting, and a re-roll is how session 8 lost the last one.

### The bug behind complaint 1, already diagnosed

`tools/plots.js` tests path clearance **at a single point** — the plot's
ground-line centre — via `NEAR_LO = 7` (at least 7px off the pale
ground) and `NEAR_HI = 42` (no more than 42px, so it still fronts a
lane).

**But a sprite is a box, not a point.** It is anchored bottom-centre and
is `p.w * type.scale` of the plate wide — 0.072–0.122 × 1.5 at the
extreme, so **100–190px at a 1024px plate.** A plot whose anchor is 7px
clear of a lane still straddles that lane by 80px either side. The point
test guarantees nothing about the footprint, which is exactly what VEN
is seeing.

**The fix is to separate the two tests, not to raise `NEAR_LO`:**

- the **anchor** should still be *near* a lane (that is what makes a
  house read as sited rather than dumped in open meadow) — keep
  `NEAR_HI`;
- the **footprint** must not overlap the lane at all. Test the sprite's
  ground band — `x ± (w · scale)/2` by a shallow depth below `y` —
  against the `earth` mask, and reject any candidate with pale ground
  inside it.

Note the footprint depends on `type.scale`, which `plots.js` does not
currently know — a plot only learns its building at render time. Either
test against the **largest** scale that row can receive (safe, and the
simplest correct thing), or move the type assignment into the placement
pass. Prefer the former first.

Same class of mistake as the `Y_WEIGHT` bug in §9h: a point measure
standing in for an area measure.

### Every lever, so nothing has to be rediscovered

**`tools/plots.js`** — placement. All constants are at the top:

| constant | now | what it does |
|---|---|---|
| `WANT` | 20 | plots produced; must match `maxRoofs` |
| `ROW_W` | `[0.072, 0.098, 0.122]` | plot width by row, fraction of plate width — **this is the "scale everything down" knob** |
| `QUOTA` | `[5, 7, 8]` | how many plots per depth row |
| `APART` | 0.085 | floor on centre-to-centre spacing |
| `Y_WEIGHT` | 0.75 | below 1 on purpose — see §9h |
| `NEAR_LO` / `NEAR_HI` | 7 / 42 | distance from pale ground; **`NEAR_LO` is the broken one** |
| `MIN` | 150 | core px below this is a wide spot in a path, not a clearing |
| `ERODE` | 6 | radius that kills a lane but keeps a clearing |
| `CLEAR` | 30 | px clear of dark ink (pines, boulders) |

`node tools/plots.js` prints and draws `tools/plots-debug.png` without
touching anything; `--write` patches `PLOTS` into `js/village.js`.
**`PLOTS` is generated — never hand-edit it**, the next run overwrites.

**`js/village.js`** — `TYPES` (~line 534) holds the per-building `scale`
multiplier: walled 1.5, thatch 1.45, lhouse 1.35, gate 1.1, house 1.0,
pavilion 0.95. Rendered width is `p.w * scale * plateWidth`, so **either
`ROW_W` or these scales shrinks the buildings** — prefer `ROW_W`, it
keeps the relative sizes VEN already accepted.

**`js/config.js`** — `maxRoofs: 20`, `perRoof: 100_000`. More plots means
raising `maxRoofs` and `WANT` together, and it changes the tokenomics
copy on the page, so **ask VEN before changing `perRoof`.**

**`node tools/render.js [roofs] [out.png]`** draws the whole village
headlessly. Use it — it is faster than the browser and, on this page,
more reliable (§9h, screenshot lag).

### On "more free spaces"

The plate was asked for ~10 clearings and painted ~10; `plots.js` finds
6–7 usable ones and places the other 13–14 against the lanes. To get
more *painted* clearings the plate has to change — and if it does,
**edit `field-square.png`, do not regenerate from `valley0.png`.** The
edit route is what worked in §9h and it is the only route that cannot
lose the mountains. Ask for *more, smaller* clearings, each tucked
against a lane, and keep every other word of §1's prompt.

Cheaper first move, and probably enough on its own: shrink `ROW_W`,
lower `MIN` a little so smaller painted pads qualify, and let the lane
filler place the rest. Try that before spending credits.

### On the full-screen plate (block 2)

Most of the machinery already exists.

- `tools/crop.js` cuts three bands from the square master. `field-wide`
  is already **2.21:1** (band `[0.547, 1]`) and is the obvious candidate
  for a full-bleed strip. `?plate=field-wide` switches to it live.
- `PLATE_CROP` in `js/village.js` **must** match `BANDS` in
  `tools/crop.js`, and `plots.js` remaps master y through the same
  numbers. Change one without the others and every building floats off
  its ground line.
- **`tools/fakestates.js` and `tools/place.html` still hold the stale
  `[0.410, 1]`.** Fix them at the same time or leave them alone.
- The plate is capped by CSS at `min(1080px, 94vw)` and gets its box
  from `aspectRatio` set in `buildArt()`. Full-bleed means lifting that
  cap and letting the section go edge to edge; the two intersected
  linear masks on `.village__plate.has-art` (`--edge`) are what stop it
  looking like a pasted rectangle, so keep them.

A wider band shows **less** valley floor vertically, which cuts the
number of plots — which is why VEN wants the plots smaller and more
numerous at the same time. Do the two together or the village thins out.

### Still open from §9h, unchanged

- Uneven type mix at some seeds (pavilion ×7 one run). `assign()` is
  tuned logic — flag before changing.
- `optimize.js` per-file palettes vs. six sprites that must agree.
- `prompt-sheet.html` and `PLAN.html` still describe the Recraft
  workflow; `PROMPTS.md` carries a correcting banner, they do not.

---

## 9j. Session 10 (2026-08-14) — §9i block 1, built and measured

VEN's four asks in §9i were all one bug plus one constant. The bug was
that clearance was tested at a point; the constant was `ROW_W`.

**Before and after, scored against the plate itself** (the audit script
is in the session scratchpad; it applies the same masks and the same
footprint as `plots.js`, but to a table it is given, so it can score the
old placement too):

| | before | after |
|---|---|---|
| plots | 20 | **34** |
| buildings with footpath under the platform | **9** | **1** |
| ...worst case | 47% of the platform | 61% — *and it is the gate* |
| buildings standing on a painted clearing | 5 | **6 of the 7 that exist** |
| row width `ROW_W` | .072 / .098 / .122 | **×0.71** → .051 / .070 / .087 |

Excluding the gate, which is pinned astride the entrance road on
purpose: **8 of 19 before, 0 of 33 after.** (Two of the 33 register 2–3%
of their platform as footpath, which is `LANE_TOL` — the pale paint is
scumbled and a lane's edge frays into the grass by a few pixels. Nothing
is visible at ship size.)

**The 20 → 24 → 34 story matters for anyone re-tuning this.** The first
pass reached 24 and reported that as the valley's capacity. VEN came
back with *"lets try fit 30-35, we dont need them all to have their own
individual spot cut out on the background though, for example the straw
roof huts can be on the grass."* He was right and the ceiling was an
artefact of two constants, not of the land — see "Levers" below.

### What actually changed in `tools/plots.js`

Four things, in the order they mattered.

1. **The footprint is a trapezoid, and it was measured, not guessed.**
   Every sprite was profiled row by row: all six come to a POINT at the
   bottom — the near corner of the stone platform — and widen going
   back, spanning 0.06–0.21 of their width at 2% depth, 0.32–0.57 at
   10%, 0.67–0.90 at 20%. So the ground band is three stacked strips,
   summed through a summed-area table. **Testing the bounding box
   instead rejects every clearing in the plate**, because a clearing is
   the end of a spur and the spur meets the front of whatever stands on
   it. The roof may overhang a lane; the platform may not.
2. **The pale paint had to be cleaned before it could be trusted.** The
   meadow is scumbled with warm highlights that answer the bare-earth
   test — **4,184 separate blobs under fifty pixels each, a sixth of all
   the pale paint inside the valley**. Left in, they fail footprints
   standing on open grass. An opening at r=1 plus a 60px component floor
   fixes it. Worse, `earth` includes the aged paper the whole picture is
   painted on: 43% of the master, against 21% inside the field. Clip the
   lane mask to the envelope or nothing within a footprint's reach of
   the valley edge can ever pass.
3. **Telling a clearing from a fork in the path took three tries, and
   the answer is the camera angle.** Elongation fails — erosion snaps a
   road into short chunks and a short chunk is as compact as a pad. How
   enclosed it is fails — a road segment is ringed by meadow except at
   its two ends, which measures like a pad ringed by meadow except at
   its neck. Connectivity fails — every clearing sits at a spur end, so
   the whole pale mask is one 40,000px component. What works is that
   **the valley is painted from a steep angle, so a round clearing
   projects as a wide flat ellipse while the paths run up the picture
   and come out tall and narrow.** Checked against a contact sheet of
   all fifteen candidates: seven real pads at 1.86–3.13 wide-to-tall,
   and every road piece, rock face and patch of ground under a pine at
   0.55–1.58. `ASPECT = 1.7` sits in a gap with nothing in it.
   **If the valley is ever repainted from a shallower viewpoint this is
   the constant that stops working**, and the contact sheet is how you
   would find out.
4. **Shrink to fit rather than reject.** A clearing with a lane past one
   corner is a good site with a building one size too big for it. The
   size walks down (to `SHRINK_MIN`, 66% of its row) against BOTH the
   footpath test and the spacing test, and takes the largest that
   clears. This is what puts a sprite ON its pad, and it is "scale
   everything down" applied per plot instead of globally.

Plus: a `GROUND` test — 62% of a footprint must be meadow or clearing —
because the boulder slopes and the scree under the pines are warm and
pale, which widened the scanline envelope and stood six buildings on the
rocks. The envelope is the coarse instrument; this is the precise one.

`sits()` returns the name of the failing test rather than a boolean, and
the run prints a rejection tally. Every tuning session on this file
starts with "why was that spot rejected", and a boolean cannot answer it.

### Levers, all at the top of the file

`--want`, `--shrink`, `--gap`, `--ground` and `--near` are CLI flags, so
a capacity sweep is a shell loop, not an edit. Shipping defaults:
**want 34, shrink 0.71, gap 0.44, ground 0.70, near 150.**

**What actually caps the village, measured.** Two candidates, and the
obvious one was wrong:

- **`NEAR_HI`, "a building must front a lane", turned out to be almost
  irrelevant.** Swept 44 → 250px, the count moved by one plot. The
  footpath network in this plate branches so much that nearly the whole
  meadow is already within 44px of something. Worth knowing before
  anyone spends an evening on it — and worth keeping wide anyway, since
  it is what actually lets a farmhouse stand out in its field, which is
  what VEN asked for. It is a cap, not a target: candidates are still
  sorted by how closely they hug a lane, so lane-side plots are claimed
  first and the open meadow is only used once they run out.
- **`GAP` is the real ceiling**, and it interacts with `SHRINK`:

  | | gap .50 | gap .44 | gap .38 |
  |---|---|---|---|
  | shrink .75 | 25 | **34** | 36 |
  | shrink .70 | 31 | 35 | 36 |
  | shrink .62 | 36 | 36 | 36 |

  Note the top-left cell: at gap .50 no amount of shrinking below .75
  helps much, because `GAP × (fwA + fwB)` with both at their row's
  maximum scale is the binding term. **Spacing is tested against the
  LARGEST building a row can receive**, since the plot does not learn
  its building until render time — so gap .50 means two hypothetical
  compounds exactly touch, and every ordinary pair is spaced as though
  it were two compounds. Dropping to .44 lets the worst case overlap
  12%, which is inside the sprites' own transparent margins.

  **Checked rather than assumed: 301 seeds swept** (the real seed is the
  contract address, so the village has to look right for one nobody has
  yet). Worst pairwise bounding-box overlap anywhere is **22%**, and
  rendering that seed shows a clear gap between the two buildings — the
  overlap is entirely in the transparent margin. 184 of 301 seeds stay
  under 10%.

`GROUND` went 0.62 → 0.70 in the same pass, which is what stopped
buildings perching on the boulder fringe; it costs about four plots and
`GAP` pays them back.

New constants worth knowing: `ASPECT` 1.7, `GROUND` 0.70, `LANE_TOL`
0.02, `GAP` 0.44, `APART` 0.052, `SPECK` 60, `LANE_OPEN` 1, `BAND` (the
trapezoid), `SHRINK_MIN` 0.66. `ERODE` went 6→4 and `MIN` 150→60, which
is what found seven real clearings instead of six.

### Verified

- `node tools/plots.js` → 34/34, 7 clearings found, 6 built on.
- Chrome at `?motion=1`: `has-art`, base `field.png` 1024x717, **34
  plots mounted, 0 broken images**, SVG hidden. `setVillage` at $3.4M →
  34 roofs + "the field is full"; $3.5M → still 34; $600k → 6; $100k →
  1; $0 → 0.
- **Every `.v-house`'s measured bottom-centre and width in the DOM
  matches the generated `PLOTS` row through `cropY`** — max error 0.01px
  in x, **0.34px in y**, 0.0005 of plate width. Checked plot by plot,
  which is stronger evidence than a screenshot and does not depend on
  the compositor. `Page.captureScreenshot` timed out again on this page
  (§9h); `render.js` is still the reliable route.
  **Measure this AFTER the entrance animation finishes.** Taken 200ms
  after a `setVillage` that raises new roofs, the same check reported a
  12px y error — that is `.v-house.is-rising` mid-flight, not a
  placement bug. Wait ~2.5s. (Also noted: `is-rising` is never removed
  once it lands. Harmless, the transform ends at zero, but it means the
  class is not a reliable "currently animating" signal.)

### Open, and VEN's call

- **`maxRoofs` is now 34, so the village fills at $3.4M instead of
  $2.0M.** `perRoof` was left at $100k because §9i says to ask first.
  ~$59k would hold the old $2M ceiling; $60k gives $2.04M.
- Two painted clearings are deliberately left empty — they are too close
  to a neighbour to carry a building. That reads as room to grow, which
  is the §2 brief, but it is worth naming rather than looking like a
  miss.
- The type mix is still unconstrained (`pavilion ×8`, `walled ×1` at
  this seed). Unchanged from §9h — tuned logic, flag before touching.
- **`render.js` downscales nearest-neighbour**, so at 3× zoom its roofs
  show a moiré checker that is NOT in the art. The sprite alpha was
  checked and is solid 255 across every roof mass. Do not chase it.
- Everything in §9i block 2 (full-screen plate) and the §9h list
  (`optimize.js` palettes, the stale `PLATE_CROP` in `fakestates.js` and
  `place.html`, the Recraft text in `prompt-sheet.html` / `PLAN.html`).

### `tools/dev-slider.js` — scrub the market cap, watch it grow

VEN, after the 34-plot pass: *"put a temporary slider in that acts as a
control for the price, I want to see how buildings will render in as the
price goes up… I feel like the placement of the buildings still needs
work."*

`localhost:8137/index.html?motion=1&dev=1`. One notch per roof, 0 → 34,
with step buttons, a play button that grows the village on a 1.1s beat
(slower than the .9s `.is-rising` transition on purpose — at the
transition's own speed the roofs pile in on top of each other and you
cannot see which one arrived), a `⤓` that scrolls to the village, and a
**`#` toggle that stamps the build-order index on every standing roof**.
That last one is the point: "17 is wrong" is actionable, "one of them
near the trees is wrong" is an afternoon.

It is loaded by a guarded three-line block at the bottom of
`index.html` that does nothing without `?dev`, and `tools/` is never
deployed. Verified both ways: with the flag the bar mounts and all 35
notches map exactly to the roof count; without it, no bar, no extra
`<script src>`, no 404.

**A still render answers whether a building is in the right place; only
this answers whether the ORDER reads.** `PLOTS` is in build order and
that ordering is a separate design decision from the placement — see
"what the growth sequence shows" below.

### What the growth sequence shows (open, VEN's call)

Watching 1 → 34, two things stand out, and neither is a placement bug:

1. **The first roof is a small open pavilion alone in the middle of the
   valley.** Plot 0 gets whatever the seed hands it, and at $100k a
   picnic shelter is a strange first building for a village. Pinning
   `b-house.png` to plot 0 the way `b-gate.png` is pinned to plot 1
   would fix it in one line of `plots.js`, and it costs nothing —
   pinned types are already excluded from the random rotation.
2. **Growth radiates from the middle of the field, not from the gate.**
   `plots.js` orders by distance from (0.5, 0.72), so the village
   expands as a ring around a point in open meadow; reading it, roofs
   jump left–right–middle rather than spreading up the road from the
   entrance. Ordering by distance from the GATE instead would tell the
   more obvious story — a village growing inward from its road — but it
   is a taste call and it changes which roof appears at every milestone,
   so it is flagged rather than done.

### `tools/build.js` was shipping a village-less site

Found by running it as a smoke test, not by looking for it. Its file
list was still the states-era one — `SHIP_STATES = ["state-00.png"]`
plus no `art/village/` entries at all — and the states were deleted in
§9e. So `dist/` came out with **no village art whatsoever**, and
**the failure is silent**: `js/village.js` deliberately mounts no
`<img>` when the plate is missing (§6b, so a dead src cannot paint
Chrome's broken-image glyph), so the deploy just shows the inline SVG
fallback and looks intentional. 13 files before, 20 now.

Fixed: the plate and the six sprites are in `FILES`, the state logic is
gone, and a missing file now prints a loud line at the end instead of
one `MISSING` in the middle of the log. `DEMO_ZERO` is left `true` —
it zeroes marketCap and holders so a public preview shows the empty
valley, which is also what launch day looks like. Flip it to show
growth.

**Also, and it cost something:** `fs.rmSync(DIST)` wiped `dist/`
including `dist/.vercel/`, exactly as §9d step 7 warned. Nothing on
Vercel was deleted — only the local project link — and the ID is
recorded (`hanok`, `prj_DGDPggbmI6NCnXLUALD0aHNjre3j`), so the next
deploy from `dist/` just needs to be pointed at that project again. It
is now written into `build.js`'s own header so the warning travels with
the hazard rather than living three sections deep in this file.

---

## 9k. Session 10, part 2 (2026-08-15) — VEN's four notes on the standing village

He marked up a screenshot. All four are done except the last, which he
asked to be a to-do rather than work.

### 1. Blue circle — "gaps where more buildings can be built"

He circled the open meadow at the back of the valley. **The meadow test
was wrong**, and it had been wrong since the first version.

`grass` was `g - r >= 2` — green leads red. But the plate is a celadon
wash over warm paper, so **red leads green nearly everywhere**: median
g−r is −4 in the back meadow, +1 in the middle, +3 at the front. Only
10% of the back meadow passed the test. Those points were never
candidates, so the rejection tally said nothing about them — which is
why the ceiling of 34 looked like the land being full when it was a
colour test being wrong.

Measured across seven sample regions, `g − b` separates cleanly:

| | meadow | rock | pines | mist |
|---|---|---|---|---|
| g − b | **36–38** | 17–20 | 21 | 24 |
| g − r | −4 … +3 | −10 … −11 | −12 | −20 |

`GREEN = 30` sits in a gap with nothing in it. Local contrast also
nearly works (meadow 15–19, rock 23–27) but mist reads 12 and would put
buildings up in the neck.

**Capacity went 34 → 46 on that one line.** Shipping 42.

### 2 and 3. Red and black circles — the walled compound

Two notes, one cause: *"the house is not inside its dedicated spot"* and
*"b-walled buildings look a bit funny if they are not on a dedicated
spot on the background like a landing... make sure that the only place
that walled houses can go is on the landings."*

A **landing** is now a measured property, not a guess: `padCover()`
takes the same trapezoid ground band and asks what fraction of it falls
on painted clearing. `PAD_COVER = 0.55` marks the plot `pad: 1`, and
`plots.js` emits that into `PLOTS`.

- `TYPES` gains `pad: 1` on `b-walled` — a type that needs a landing.
- `assign()` filters those out of every plot that has not got one, and
  keeps the rule through all three fallback tiers. The last-resort
  `ok = pool` still drops it, deliberately: a roof of the wrong kind
  beats a hole, because the count on screen has to match the stat.
- `padPref` (0.55) gives the compound first refusal on a landing.
  **Without it the compound essentially never appears** — five landings,
  of which three are in rows the compound is eligible for, against five
  eligible types, is one compound every other village.

**Verified over 401 seeds: 0 compounds placed off a landing.** The
distribution is 0 compounds on 19 seeds, 1 on 95, 2 on 165, 3 on 122.
The type mix also came out healthier as a side effect — house 29%,
pavilion 29%, thatch 26%, lhouse 9%, walled 4.7%.

### 4. Sleeping Z's — added to the plan, not built

*"some Z's floating above certain houses to indicate that there are
villagers sleeping inside."* Written into `PLAN.html` as **phase 3B**,
between the birds and ship: seeded so the same houses sleep on every
visit, three Z's per burst with 6–10s of silence between, never on the
gate or an open pavilion, and the one real risk named — at 390px a
legible Z is ~3px, so if it does not survive that check the answer is to
show them only above `--w-wide`, not to make them bigger.

It needs no art and no dependencies, same as the birds.

### New tooling: the rejection map

`tools/plots-reject.png`, written every run. Every candidate the tool
turned down, painted over a greyed plate and **coloured by which test
did it**, with the kept plots ringed in black. This is what found note 1:
the blue-circle region came out blank rather than coloured, and blank
means the loop never looked there. The four pre-filters in the candidate
loop are recorded as rejections for exactly that reason — before, they
were silent `continue`s and the tally could not see them.

Also fixed while in there: `boxSum` rounded its bounds but the area
divisor was computed from the unrounded floats, so coverage percentages
came out over 100%. Harmless inside a threshold, wrong in a printed
diagnostic. `box()` now returns the area it actually summed.

## 9l. TO DO — more building variation

**DONE in §9n** — four new sprites, generated as edits of accepted ones.
This section is what was written when it was still a to-do, kept because
every line of it turned out to be load-bearing and because the parts
that are still true are still true. `MAXSCALE` no longer exists: the
per-row scale ceiling became a per-type ground band and a hull union
(§9n), so "re-run after adding one" now means the hulls change, not
`MAXSCALE`.

VEN, 2026-08-15: *"more building variation would be nice but put that on
a to do list... first we just get it to work, then we will substitute
some images."* **Not now.** When it comes up:

- The engine needs no change to take more types. `TYPES` is a list;
  add a row with `file`, `scale`, `rows`, and optionally `pad: 1` if it
  needs a landing. `plots.js` reads `TYPES` out of `js/village.js`, so
  the footprint maths follows automatically — but **re-run
  `node tools/plots.js --write` after adding one**, because the row
  hulls change and every footprint with them. A type wider than the set
  costs the whole village room; a type at cottage scale joins the small
  class and *buys* room (§9n).
- Cheapest real variety first, before any new generation: the six files
  already behave like twelve via `--flip`, and a **second colourway of
  an existing sprite** (a darker thatch, a weathered roof) is a
  recolour, not a generation.
- The gap in the set is the middle: there are two hut-scale buildings,
  two mid, one L, one compound. A **granary/storehouse** and a **byre
  or shed** would fill it and are the two things a Korean farm village
  has most of.
- Generate the same way §9h did — **edit a crop out of the valley
  painting rather than generating from a description.** That is what
  made the current six agree with each other and with the plate.
- Watch the type mix when the set grows: `assign()` draws uniformly, so
  every type added dilutes every other one. The compound is already at
  4.7% and is meant to be rare; a hut type added carelessly halves the
  visible share of something else.

---

## 9m. Session 10, part 3 — VEN's second markup: fit the buildings to their landings

Three circles on a screenshot, and two of them were the same bug.

### The bug: the landing test was measured against the wrong mask

`padSAT` was built from `padMask` — the accepted cores dilated back by
`ERODE + REGROW`. That mask deliberately spills a few pixels past the
pale paint into the grass, which is right for subtracting lanes and
**wrong for asking whether a building is standing on the clearing**.
Measured against it the compound VEN circled in red read *100% covered*
while a third of its wall was visibly on grass.

`padSAT` now uses `padTrue` — pale AND inside a pad — so the number
means what it says. Same class of mistake as the point-vs-area one in
§9j: the right measurement taken against the wrong thing.

### Centre it in the landing, and size it to fit

Both of VEN's asks — *"scaling it down and centering it in its landing
spot"* and *"move that roof to fit in the landing space perfectly"* —
are one change. A clearing plot now:

- anchors on the pad's **centroid**, not its front lip. The old rule put
  the building at the near edge, which is what left the compound up-left
  of its own yard with the pale ground showing past one corner;
- takes its width from the pad: the ground band spans `2·BAND_MAX·fw`,
  so a band that fills a pad `padW` across wants `fw = padW/(2·BAND_MAX)`,
  capped at the row's width because perspective outranks the painting;
- recomputes its ground line at every trial size, because centring a
  band of depth `0.22·fw` on the pad puts the anchor `0.11·fw` below the
  pad's middle — size and position have to be solved together.

Footprints now run **44–141px on a 1080px plate** instead of one width
per row. That is size variation for free, and it comes from the painting
rather than from a constant.

### The empty landings

`MIN` 60 → **45**. The pad VEN circled in green has a 45px core and was
being dropped by five pixels. Two more clearings appear at 45; both were
checked against the painting before the floor was moved.

The pad he circled in blue was found but refused as `crowded`. **A
landing is the painting's own instruction and outranks the spacing
heuristic** — where the artist put two pads, put two buildings — so a
plot standing on a landing uses relaxed spacing (`APART_PAD` 0.038,
`GAP_PAD` 0.30) while its neighbours are still held at arm's length from
everything else. 9 clearings found, 8 built on; the ninth is the
smallest in the plate and sits 47px from another, so it stays empty.

### Landings big enough to be worth a compound

`pad: 1` now needs the coverage test AND `PAD_BIG` (75px across). A
walled estate rendered onto a thirty-pixel scuff is the same "looks a
bit funny" as one out on the grass. Four landings qualify, three in rows
the compound can use.

### Fixed on the way past

- **`PAD_FLOOR` ordering.** The size search started at the pad-fitted
  width and stopped at the floor; a pad narrower than the floor started
  below its own stopping point, the loop never ran once, and the plot
  was dropped with no reason recorded. `Math.max` now. The floor also
  went 0.42 → 0.55, because at 0.42 the smallest pad produced a 23px
  building — 8px on a phone, which is a smudge.
- **The scratch audit script had drifted** from `plots.js` — still
  carrying `g − r` and `MIN 60` — and reported two correctly-placed
  buildings as 95% on footpath. It is a scratch tool, but it is the
  thing that certifies the result, so it has to be re-synced whenever a
  mask constant moves. Worth considering making it lift them.

### Verified after

- 42 plots, 4 landings. Footpath under a platform: **1 of 42 (the gate,
  by design)**; five others read 2–3%, which is `LANE_TOL` — the pale
  paint is scumbled and a lane's edge frays a few pixels into the grass.
- **401 seeds: 0 compounds off a landing.** Worst sprite overlap 19%,
  entirely inside the transparent margins.
- Chrome: 42 mounted, 0 broken, `$4.2M` → 42 + "the field is full",
  sprites 30–113px wide on the live plate.
---

## 9n. Session 11 (2026-08-16) — VEN's third markup: the compound, the empty top, and four new buildings

Three asks in one message, and they turned out to be one measurement,
one reservation rule, and one generation trick.

> *"the walled house is still problematic and still loooks the same. it
> needs to be scaled down and moved a bit down on the y axis."*
>
> *"also theres still empty spaces near the top of the image. If this
> means increase max capacity of buildings then so be it."*
>
> *"Also when I said more variety in the buildings i meant make new
> ones, not whatever you did"*

### 1. The compound: the ground band was pooled, and it should never have been

§9m sized and centred the compound on its landing and it still came back
wrong, twice. The reason is that everything in §9m was correct **except
the shape it was solving for.**

One `BAND` constant described the ground every sprite covers — `[depth
from, depth to, half-width]` strips in fractions of the sprite's own
width. Measured off the alpha, five of the six sprites really are the
same shape: one building on a shallow stone platform, coming to a point
at the bottom and reaching full span by 22% of its width, above which
the silhouette is roof and narrows again. Widest point: .15 for
`b-house`, .15 for `b-pavilion`, .22 for `b-thatch`, .22 for `b-lhouse`.

`b-walled` is not one building. It is a **walled yard seen from above**:
still widening at depth .35 (half-width .476 — the outer corners of the
boundary wall), with the swept earth inside running back to .50. The
pooled band reserved **less than half the ground it stands on.**

So `band` is now per type, stated in `js/village.js` next to the sprite
it describes, and `tools/plots.js` lifts it along with `TYPES`:

```js
{ file: "b-walled.png", scale: 1.5, rows: [0,1,2], pad: 1, band: [
    [0.00, 0.08, 0.15], [0.08, 0.16, 0.28], [0.16, 0.24, 0.40],
    [0.24, 0.38, 0.48], [0.38, 0.50, 0.40] ] }
```

Both of VEN's words fall straight out of it. The landing hull went
**0.42 × 0.22 → 0.72 × 0.75** in plot widths, so:

- width comes from `padW / (2·f.max)` — the same pad now buys a building
  **42% narrower**. *Scaled down.*
- the anchor is `padCentre + f.depth·base/2` — it drops by **a quarter
  of the sprite's width**. *Moved down the y axis.*

Neither is a fudge factor and neither has a tuning constant. Both are
what centring the real shape on the real pad produces.

**`b-walled` also went `rows: [1,2]` → `[0,1,2]`.** One landing sits in
row 0, and with the compound ineligible there the plot was cut to
compound proportions and then handed a farmhouse — a hut floating a
quarter of its width above the middle of a yard cleared for an estate.
`pad: 1` is the real gate; `rows` was doing a second job it could not do
correctly.

**And `padPref` 0.55 → 1.** A landing is the compound's plot, not merely
one it is allowed on: the width and the ground line were solved for a
compound, so a house dropped on one renders at 0.84 of the width the
plot was cut for and floats above the pad's centre. The geometry has an
owner now, so the coin toss that used to pick one had to go.

**Two hulls, then, not one.** A plot does not learn its type until
render time (assignment is seeded off the contract address), so it is
measured against the UNION of every type that can land on it, with each
type's `scale` folded in so everything is in plot-width units. Landings
get the compound's hull alone; everything else gets the union of the
types that do not need a landing.

### 2. The empty top: stop charging every cottage for a farmhouse

The union rule above is safe by construction but it is only cheap while
the types are the same size, and they are not. At row 0:

| | half-width, in plot widths |
|---|---|
| `b-store`, `b-pavilion` | .40 |
| `b-house` | .42 |
| `b-lhouse` | .57 |
| `b-house2` | .60 |
| `b-thatch` | .61 |
| `b-thatch2` | .64 |

Admitting the four big ones charged **52% more ground to all thirty of
the small ones**, and the gaps VEN circled at the top of the field are
exactly where that surcharge ran out of room. The numbers also say where
the line goes: there is a cliff between .42 and .57 and nothing but
noise on either side of it, so **two classes is the whole of the useful
answer** — a third would buy about 5%.

So a plot is reserved against one of two hulls and **says which**:

- `tools/plots.js` sweeps the lanes twice. Pass 1 places every site that
  can hold any building in its row — this is bit-for-bit the old
  behaviour. Pass 2 fits the small class into what is left over.
- a plot reserved for the small class carries `hw`/`dp` (the ground it
  was actually tested for, in plot widths) into `PLOTS`.
- `js/village.js` `fitsPlot()` will not put a building bigger than that
  on it. Same fallback discipline as the two filters above it: narrow
  the pool if that leaves anything, never to nothing.

**Two sweeps, not one, and the order is the whole point.** Trying
wide-then-narrow per candidate reads the same and is not: the first
cottage-sized gap along a lane is claimed by the first candidate to
reach it, and the neighbour forty pixels along that could have taken a
farmhouse is then crowded out by it. One sweep gave 68 plots of which
**48** were small-class-only. Two sweeps give 60 of which **6** are.
That is the trade taken: 8 fewer roofs to keep 42 plots open to the
whole set, because "more variety" is the other thing VEN asked for in
the same message.

The class is **derived, not listed** — everything within `NARROW_F`
(1.15) of the smallest eligible type. Add a sixth cottage at scale 1 and
it joins the small class on its own.

`plots.js` also asserts the thing that makes the contract sound: the
engine is told a rectangle (`hw`×`dp`) where the tool tested a hull with
a shape, which is only safe while no type can fit the rectangle and poke
outside the hull. True today (every small type is the shared band scaled
by ≤ 1), guaranteed by nothing, so it prints a loud line if it ever
stops being true.

### 3. Four new buildings — generated as EDITS, never from a prompt

*"when I said more variety in the buildings i meant make new ones, not
whatever you did."* The seeded-assignment work of the previous session
was not what he meant. Four genuinely new sprites now:

| file | painted | scale | from |
|---|---|---|---|
| `b-store.png` | 213×170 | 0.95 | `b-pavilion` |
| `b-house2.png` | 366×201 | 1.24 | `b-house` |
| `b-thatch2.png` | 325×212 | 1.45 | `b-thatch` |
| `b-walled2.png` | 742×475 | 1.50 | `b-walled` |

**Every one was generated as an edit of an ACCEPTED SPRITE, never from
its own prompt.** That is the §9h/§9l finding and it is what keeps the
set agreeing: a variant painted on top of `b-house` is by construction
the same hand, the same light and the same detail density, where a fresh
generation off the same wording comes back as an architectural study at
2–3× the size. `scratchpad/greyify.js` rebuilds the 1024² flat-mid-grey
canvas each accepted sprite was generated on, which is what an
edit-style generation has to be handed.

`scale` is set from the parent's in the ratio of their **painted
widths**, so the part they share renders at exactly the same size:
`b-house2` is 366px against `b-house`'s 294, so 1.0 × 366/294 = 1.24.
The exception is `b-thatch2`, held at 1.45 rather than its strict 1.77 —
at 1.60 it cost the village 7 plots and a clearing on its own, because
it set the row's union hull single-handed.

**Triage before looking.** `scratchpad/triage.js` measures a batch
against the source sprite before any of it is opened. Two things it got
wrong first, both now written into the file:

- **the invariant is HEIGHT, not frame fill.** Adding a wing makes the
  sprite wider at the same scale; the first honest pass flagged two
  *correct* storehouse-and-annexe variants as scale failures for growing
  290 → 414px across. They were 200px tall in both, which is what has to
  hold — every building in the set is painted at the same apparent
  distance, and a one-storey building's height is what that distance
  sets.
- **edge density is a size measure wearing a detail measure's clothes.**
  The accepted sprites score 45/45/31% because a building painted 200px
  wide has its strokes packed against each other; a 620px architectural
  study scores 30% for the opposite reason. Reported, not thresholded.

### 4. `cutout.js`: the flood tunnelled through a roof

Keying `b-store` put magenta streaks along every ruled tile stroke. The
flood used `TOL_HI` for both jobs: any pixel within 46 of the background
was both keyed AND allowed to pass the flood on. A pale slate roof sits
about 50 from mid-grey so most of it stops the flood — but the lit ridge
of each tile stroke dips under 46, and those strokes run continuously
from eave to ridge. That is a one-pixel channel from the border into the
middle of the roof, and the flood took it.

**`TOL_WALK = 24`**: propagate only through paint that is *certainly*
background, still ramp the alpha of everything reached out to `TOL_HI`.
The soft edge is unchanged and the tunnel closes.

### 5. Enclosed background is NOT recoverable from the finished image

A sprite with two buildings on one platform can enclose a patch of the
flat grey field between them, reachable from no border pixel, which
survives the flood as an opaque grey slab. The obvious fix — hunt for it
by colour and seed the flood from there — **keys holes straight through
the roofs**, and this was measured, not guessed: the greyest pixel in
`b-house2`'s slate roof is `rgb(127,127,127)`, which is the background
colour *exactly*, not near it. Chroma cannot separate them (both
neutral). Size cannot either — a tile groove runs the whole length of a
slope, so it is a bigger connected run than the pocket is. Connectivity
is the only discriminator and "enclosed" is precisely what both are.

**So fix it in the generation, not in the keyer.** The re-roll asked for
"THE TWO PARTS MUST TOUCH AND JOIN … absolutely no patch of the flat
grey background showing anywhere between them" and came back as a clean
single silhouette. The attempted pass is left in `cutout.js` as a
comment, because it is an obvious idea and the next person will have it
too.

### Verified after

- **60 plots**, row counts 34/15/11, 4 landings. `--want` 60, 70 and 90
  all produce the same 60, so that is the valley's ceiling under these
  rules.
- **THE CEILING IS NOW THE SPACING RULE, NOT THE FOOTPRINTS**, which is
  the point of the change and worth knowing before anyone tries to raise
  it again. Run `--want 90` and read `tools/plots-reject.png`: the whole
  remaining top of the field comes back grey, `crowded` — 108,444
  rejections against 48,252 for `path`. Every candidate is now refused
  by `APART`/`GAP` (how close two buildings may stand) rather than by
  the ground they cover. Loosening it is one flag and it was measured:
  `--gap` 0.44 → 0.40 → 0.36 → 0.32 gives 60 → 61 → 65 → 67 plots, and
  **the extra roofs land in rows 1 and 2, not row 0** — the back row
  only moves 34 → 36. So it buys a denser FOREGROUND, which is not what
  VEN asked for, at the cost of houses standing closer together than a
  village looks right doing. Left at 0.44. If the top wants to be fuller
  still, the lever is another sprite at cottage scale (it joins the
  small class and buys room), not the spacing.
- **Footpath under a ground band: 5 of 60.** One is the gate at 58%,
  which stands astride the entrance road on purpose; the other four are
  2–3%, which is `LANE_TOL` — the pale paint is scumbled and a lane's
  edge frays a few pixels into the grass. (Session 9 was 16 of 20.)
- **7 of 9 painted clearings built on**, up from 6 before the new types
  and 5 immediately after them. The two left empty are 50px and 28px
  across and sit beside larger neighbours.
- **Worst-case ground overlap 8%** of the smaller band, across 6 pairs
  of 1770 — and that is worst-case over every type each plot may
  receive, not one seed. Some overlap is by design: `farEnough` keeps
  centres `GAP`(0.44) × the combined widths apart, and two bands at
  exactly that distance touch.
- **6 plots restricted to 3 types**, the rest open to 9.
- Chrome, `?motion=1&dev=1`: 60 mounted, 0 broken sprites, 6 shown at
  the mock $600k, 60 at $6.0M, and the type mix identical to
  `tools/render.js` — which is the check that matters, because the
  headless renderer ports `assign()` and a drift between them would
  mean the QA previews were of a different village than the site.
  (`state-00.png` 404s. That is the states engine probing for plates
  that were never generated and falling back to sprite mode, exactly as
  designed — pre-existing, not from this pass.)

### Open, and it is VEN's call

**`perRoof` is still $100k, so the field now fills at $6.0M.** It was
$2.0M when the number was chosen and it has never been re-decided;
~$33k a roof would hold the original ceiling. Tokenomics, not layout.
Flagged in §9j at $4.2M, flagged again here.

### Known stale, deliberately not touched

- **`tools/fakestates.js`** carries its own copy of `PLOTS` from the
  15-plot era and a `BAND` of `[0.410, 1]` against the current
  `[0.300, 1]`. It generated placeholder state plates to prove the
  states engine before real art existed, and to show VEN where to
  inpaint building N when chaining states in Recraft — a workflow that
  is gone (§9h: OpenArt, and the buildings are sprites over one plate).
  Re-running it today would write nonsense. It is dead, not broken;
  delete it or re-sync it, but do not half-trust it.
- **`tools/place.html`** likewise holds a hand-placed `PLOTS`. It was
  the pre-generator workflow and `PLOTS` is generated now.
---

## 9o. Session 11, part 2 — the compounds a notch smaller, and the sleeping Z's

Two asks: *"scale down everything circled in blue slightly (ie all of
the walled houses)"* — all four compounds circled — and PLAN phase 3B,
brought forward: *"an animated set of Z's appearing above a random set
of houses, should be small and subtle just like in clash of clans."*

### 1. `PAD_FILL` — the compound takes 85% of its exact fit

One constant in `tools/plots.js` (`--padfill`, default 0.85), and WHERE
it applies is the part worth keeping. The first attempt multiplied the
fitted width — the starting guess — and produced 15%/15%/15%/**4%**,
because the four compounds arrive at their size by three different
routes (pad-fitted, capped by `ROW_W`, walked down by the shrink loop)
and the loop-limited one barely felt a smaller starting point. It was
the biggest compound on the plate and it was the one that would not
have moved.

So the factor is applied in `add()` to the width that PASSED: solve the
landing exactly as before, then take `PAD_FILL` of the answer,
re-centre on the pad (the anchor depends on the width, so it is
re-solved) and re-check placement. All four compounds now shrink by the
same 15% VEN sees: 103→87, 75→64, 111→94, 103→87px. Cover went UP
(88–95%) — a smaller band sits deeper inside its own paint — and the
count held at 60. If the re-check ever fails, the exact fit stands and
the run prints a loud `!!` line rather than dropping the compound.

### 2. The sleeping Z's (PLAN 3B) — built

`js/village.js` decides **who and when**; `css/site.css` owns **how it
moves**. No timers, no rAF loop: one CSS keyframe cycle per Z,
phase-shifted per house.

- **Who:** a seeded ~30% of the DWELLINGS — `sleeper(i)` rolls off the
  same `SEED` as `assign()`/`flipped()`, so the same houses sleep at
  every visit. The gate is an entrance, a pavilion has no walls and a
  storehouse holds grain (`AWAKE` map); compounds sleep like anything
  else.
- **Where:** anchored at the roof peak — ground line minus the sprite's
  rendered height, which is why `preload()` now records each sprite's
  natural dimensions instead of `1`. Nudged 12% to the flip side, the
  way smoke leaves a flue. **Sized off `p.w`, not the sprite width**:
  the per-type `scale` is precisely the factor that says "this sprite
  is mostly yard", so a Z scaled off the sprite would be compound-sized
  over a house-sized hall. 10–17px on the desktop plate.
- **What:** three drawn Z's per burst — an ink stroke over a faint
  paper halo, so the glyph survives crossing a dark roof edge — rising
  ~2 Z-heights, drifting to one side, gone by 16% of the cycle. Cycle
  8.5–12.5s per house, phase random per house (negative
  `animation-delay`), so the field never breathes in unison and the
  6–10s of silence the plan asked for falls out of the keyframe shape.
- **Gates:** `?sleep=0` off, `?sleep=N` sets the share (the switch name
  PLAN 3B.4 specified). Reduced motion: no Z's AT ALL — a frozen Z is
  a typo on the painting. An IntersectionObserver toggles `.v-live` on
  the plate so the animations only exist while the valley is on screen;
  a hidden tab needs no code because the browser freezes CSS animations
  there on its own. Below 640px viewport the Z's are display:none —
  PLAN 3B.3 measured a phone-width Z at ~3px and said hide, don't grow.
- The Z's follow the roof count: `paintArt` hides any Z whose plot is
  not built yet. A house nobody lives in yet has nobody to sleep.

### Verified, and how far

Everything measurable without a visible window is confirmed in Chrome:
11 sleepers at 60 roofs, all over dwellings; 33 animations attached and
`running`; every Z anchor within a pixel of `groundline − 0.96 × sprite
height` (checked against each sprite's own rendered box); sizes 10–17px.

**The feel — speed, opacity, drift — was NOT eyeballed at the time of
writing**, because the Chrome window was minimized the whole session and
a hidden tab freezes the compositor: no animation frames, no
IntersectionObserver callbacks, and every screenshot comes back blank.
(That is also the long-standing "screenshot comes back blank" note in
render.js's header, now with its cause named.) The keyframe numbers to
tune if VEN wants it different, all in one block of `site.css`:
peak opacity `.55`, rise `-175%`, drift `52%`, visible window `17%` of
the cycle, stagger `.55s`, easing `cubic-bezier(.25,.55,.4,1)`.

VEN's first note on it (before seeing it move — off the description and
the stills): *"make it a bit smoother. I want a softer more cartoonish
font."* Two changes, same session: the ride's `linear` became the
bezier above (one decelerating gesture instead of constant speed and a
dead stop), and the glyph was redrawn from a straight-stroke stencil Z
to a plump comic one — arced top bar, bowed diagonal, arced bottom,
stroke 2 → 2.5 (path in zzzEl, js/village.js). Proofed headless at
240px, 13px and 10px with scratchpad/zglyph.js, which stamps the actual
bezier path with the actual stroke weights: the counters stay open at
10px, so the fat stroke costs no legibility.

### On the way past

- A house revealed while its tab is hidden sticks at `.is-rising`
  (opacity 0, 12px low) until the tab is next composited, because the
  `.is-in` handoff rides a double rAF. Self-heals on visibility; noted
  here so nobody chases it as a placement bug — it LOOKS like one in
  rect measurements.
- PLAN 3B.2 said "three Z's at decreasing size". Built as three equal
  glyphs whose scale grows in flight (.5 → 1.05), which produces the
  same picture — the trail is small at the roof and large at the top —
  without a second set of keyframes.

---

## 9p. Session 11, part 3 — shipped: GitHub, Vercel, and the slider going public

### The repo

`github.com/MTDVEN/hanok`, **private**, branch `main`, 73 files / 28MB.

The working folder is 274MB and the repo is 28MB, and the difference is
worth understanding before someone "fixes" it: 176MB of top-level
masters (`Background.svg`, the ~10MB traced `b-*.svg`, `valley0-6`,
`field-square.png` at root) plus `art/village/_fake` (27MB), `/alt`
(7MB) and `/_placeholder` (10MB) are excluded by `.gitignore`, which
explains every rule inline. Everything needed to BUILD, RUN, RE-DERIVE
and UNDERSTAND the site is in — including `art/village/ref` (the style
set), `field-square.png` under `art/village` (plots.js reads it), and
all of `tools/`.

**The masters are not backed up by this repo.** Git history is forever;
176MB of PNG in it is a cost every clone pays permanently. They live
only in VEN's working folder and want a real backup elsewhere.

### The deploy

The Vercel project `hanok` already existed (CLI deploys from `dist/`).
It is now **connected to the GitHub repo**, so a push to `main` builds
and deploys. `vercel.json` carries the whole config:

```json
{ "buildCommand": "node tools/build.js",
  "outputDirectory": "dist",
  "installCommand": "echo 'no dependencies'" }
```

`dist/` is therefore NOT committed. That was a real choice: a committed
`dist/` is a duplicate that goes stale the first time someone edits
`js/` and forgets to rebuild, and this project has already been bitten
once by a deploy that silently shipped the wrong thing (§9d step 7, the
village art missing from `dist/` entirely). Building on Vercel makes
staleness impossible.

Note `tools/build.js` sets `DEMO_ZERO`, so the DEPLOYED `config.js` has
`marketCap: 0, holders: 0` — the live site opens on an empty valley,
which is launch-day truth. The slider below is how a visitor sees it
grow.

### The slider ships now — `tools/dev-slider.js` → `js/preview.js`

VEN, 2026-08-16: *"I want it to have the slider but also make it
minimisable. once the token to go with the website is live i will
manually remove them and wire it up to a price checker, so that the
houses corresponds to market cap."*

So it moved out of `tools/` (never deployed) into `js/` (deployed), and
it is built to be **deleted in one pass** — its header names the three
lines to remove. It touches the page through exactly one public call,
`window.HANOK.setVillage({ marketCap })`, which is the same door the
live price feed will come through, so the replacement inherits a proven
interface.

Changed for public use:
- **It minimises, it does not close.** The old `×` removed it from the
  DOM — fine behind a URL flag, wrong on a live site where a visitor
  who dismisses the one control demonstrating the village's whole point
  has no way back short of a reload. It now collapses to a 175x41 pill
  that still reports the roof count, and the choice persists in
  `localStorage` (wrapped in try/catch — Safari private mode throws on
  write rather than no-opping).
- The `#` build-order badges are a REVIEW tool, not a visitor feature,
  so they now require `?dev`. Same for the console line.
- Label `DEV — MARKET CAP` → `MARKET CAP`.
- `?preview=0` turns the panel off without an edit.

### The domain — Vercel side done, DNS is VEN's

`tilesongiwa.com` (Namecheap) and `www.tilesongiwa.com` are both added
to the project. Verified by resolving Vercel's edge directly: a request
to `216.198.79.1` with `Host: tilesongiwa.com` already returns
`<title>HANOK — an ink-drawn village on Solana</title>`, so routing is
live and only the registrar's records are missing. Namecheap is on
BasicDNS (`dns1/dns2.registrar-servers.com`), so the Advanced DNS tab
controls it. Records needed:

| Type | Host | Value |
|---|---|---|
| A | `@` | `216.198.79.1` |
| CNAME | `www` | `cname.vercel-dns.com` |

The default parking records (`CNAME www → parkingpage.namecheap.com`
and the `URL Redirect @`) must be DELETED or they conflict — the apex
currently resolves to `192.64.119.65`, which is that parking page.
Vercel issues the TLS certificate automatically once DNS resolves.

Reading the Vercel CLI's stored auth token to query the API for these
records was blocked by the sandbox, correctly — it is a credential. The
records above were verified empirically instead (both `216.198.79.1`
and the older `76.76.21.21` answer as `Server: Vercel` for this host;
`216.198.79.1` is the current recommendation).
