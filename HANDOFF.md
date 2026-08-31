# HANOK — full session handoff

Read this top to bottom before touching anything. It contains the client
brief, the design system, how every module works, the state of the art
assets, what was already reviewed/fixed (and what was deliberately NOT
fixed), and the exact next steps. `README.md` is the short ops sheet;
this file is the deep context.

**THE TOKEN IS 기와 / GIWA** (Zico, 2026-08-21) — Korean for roof
tile, and the name of the Upbit L2 it launches on — **AND THE TICKER
IS `$TILES`** (VEN, 2026-08-29). The journey's four stops carry Zico's
actual pitch copy written onto the map sheet. **§9y** is that whole
pass; `CONFIG.token` is the one place to set both. Still his to send:
Namsangol's bridge/swap steps and the CA. (Jeonju's stop was blank
until session 14, when VEN forwarded Upbit's own framing and it took
the tile metaphor — **§9aa**.)

**THE HERO DRAWS `$TILES`, NOT THE HANGUL — SINCE 2026-08-30, AND
AFTER ONE FALSE START.** Zico marked up a screenshot and asked for the
mark to carry the ticker, smaller than the hangul it replaced; the
same change had been made and reverted the day before, when nobody had
asked for it. 기와 is still the project's NAME and is still on the
page in four places — the eyebrow, the footer word, the `<title>` and
the OG tags — and its brush strokes are still in `LETTERS`, so the way
back is `token.wordmark` in js/config.js. **§9ad** is that pass, and
it is also where the size lives: the mark's whole type size is the
width of `.hero__title` in css/site.css, and `?mark=N` tries a new one
without an edit.

**SESSION 16 (2026-08-28), READ FIRST IF YOU TOUCH THE COPY OR THE
CLEARINGS — AND THERE IS ONE UNFINISHED STEP.** VEN pasted two long
blocks of copy for stops 1 and 2 (555 and 664 characters, against the
~170 those notes held). They are in, the clearings are re-cut to hold
them, and stops 3 and 4 are untouched. Three things a fresh session
must know before touching any of it:

  1. **§9ac.6 IS DONE — 2026-08-30, and it took two goes: §9ad then
     §9ae.** The first re-measure was itself wrong — tools/widths.html
     had never loaded the webfont and measured every word in Times New
     Roman, 7-17% narrow (§9ae.5). With that fixed, `fallbackEm` is
     **0.483**, near the 0.486 this section estimated, and stops 2 and
     4 re-planned to §9ac.7's numbers to the thousandth — so the
     session-16 plan was right all along. mapnote no longer prints its
     `!` line, and the page's wrap now matches the plan or comes in
     one line under it.
  2. **`SIZE_CAP` is a ceiling, not the answer.** Stops 1 and 2 come
     out at 10.5 and 9 units because that is all their loops hold, not
     because anyone chose those numbers. Stop 2's search loop was
     already widened to the last of the room available (road west,
     coastline east, stop 1 above, stop 3 below) — at VEN's original
     loop *nothing fit at any size*. There is no size left to give.
     (Both stops have since been SPLIT and bought size back from their
     own loops: stop 1 to 11 in Zico's places, §9af; stop 2 to 9.5
     stacked down its one loop, §9ag — and §9ag's Open names the one
     lever left, the saddle north of the loop.)
  3. **Two long-standing bugs were fixed here**, both of which push
     text past its clearing and both invisible with the old copy:
     mapnote was stripping the commas out of the prose, and
     `fallbackEm` was a hand-written 0.44 against a measured 0.486.
     If you are reading old numbers in §9ab and they do not reproduce,
     this is why.

**§9ac** is the whole record.

**SESSION 15 (2026-08-27), READ FIRST IF YOU TOUCH THE MAP ART, THE
COPY, OR THE JOURNEY'S ENDING.** One long day with VEN, fourteen
parts, all LIVE, and the shape it settled into is this: each of
Zico's four notes is a plain rectangular block of the display serif
at a size fixed in SHEET units, and the map has a small clearing cut
to that block plus one margin (`tools/mapnote.js` → `tools/
mapclear.js`), the mountains standing everywhere else; the English
caption sits under its building on a searched anchor (with a mini
clearing where the paper was inked); the Korean name is where it
always was; the note writes itself on one brush-stroke mask; the
trail is the footsteps alone; and at the end of the road the camera
pans a little further so Jeonju's caption has paper beneath it. The
pipeline is README's THE CLEARINGS (five commands). **§9ab** is the
whole record — including everything VEN rejected on the way (a
shaped, ragged note; a handwriting face; larger clearings with small
text; the road inking on past the last stop), which is worth reading
before proposing any of them again. Traps found: `--terrain` (carve
the road on the pre-clearing sheet or it wanders into the paper
cleared for the text), the `.jmap__note` class collision (the band's
CSS swallowed the note), and the harness screenshot timeout (first
capture after a change fails, second works).

**SESSION 14 (2026-08-25), READ FIRST IF YOU TOUCH THE MAP'S LAYOUT.**
VEN looked at the journey on a phone and the copy was standing on the
mountains. Three things came out of it and all three are structural:
**(a)** the narrow-screen note is no longer a wash over the sheet —
`.jmap__view` gives up its height to a real paper band, and the camera
is measured off the view rather than the sticky; **(b)** `lq` is
capped at `LQ_MAX` 1.465, which is the scale `tools/maproute.js`
actually cleared paper for, and a phone had been drawing labels 53%
over it; **(c)** *do not put a second `overflow:hidden` around
`.jmap__cam`* — it hangs the renderer on load, same family as §7's
blend dropouts. §9aa has the whole record, including which QA harness
settings lie to you.

**SESSION 13 (2026-08-21), READ FIRST IF YOU TOUCH THE MAP ART.**
Zico's first client note since launch: Namsangol should look like a
village. It does now — six smaller hanok behind the walled house
(§9x). The transferable finding is a rule change: **never swap a
re-generated map sheet in wholesale again.** image2image re-renders
the entire page (mean 16.7 dRGB), which is invisible to the eye and
fatal to `maproute --base` — the first swap moved the JEONJU stop off
its village for no reason but normalisation. Use **`tools/mappatch.js`
(new)** to take only the changed clearing, and check the result by
diffing against `map-ink-master.png`: everything outside that clearing
must come back at 0.00. Second rule from the same session: **a
vignette may not grow into the corridor the road travels** — a roof at
x 0.63 sent the Namsangol road to x 0.27 and the seal with it, so the
patch is clipped at `--limit ...,0.598,...`, which is the widest it
goes. The clearing is now full; bigger is not available.

Last updated: 2026-08-27 (session 15 — the clearings, §9ab. Before
that: session 14 — the journey's copy on a phone, §9aa; session 12,
fourteen parts, all LIVE —
**THE JOURNEY IS NOW A MAP YOU WALK, deployed at
https://tilesongiwa.com.** Private repo `github.com/MTDVEN/hanok`,
branch `main`, push to main deploys.)

**SESSION 12 IN ONE PARAGRAPH (§9r–§9w are the detail).** The journey
section was rebuilt as a pirate-map sheet: `?journey=map` is the
default (`split` and `road` untouched and working). The four places
are PAINTED INTO the sheet as pictorial vignettes — edited into the
plain terrain with the four journey paintings as references, never
generated fresh. The camera glides on scroll along a smoothed "crane"
track of the road, slowing but never stopping through each place; the
trail ahead is FOOTSTEPS that vanish under the road as it inks itself
behind you; on arrival the seal stamps over the X, the place's Korean
name handwrites itself beside its building, and the English caption
writes in under the building on searched clear paper. Both seams of
the section cross-dissolve (hero fades out as the sheet materialises;
the sheet melts into the ghost landscape at the manifesto). VEN
iterated all of it live — fourteen parts, each recorded with what was
tried, rejected and why.

**Session 12's standing decisions and traps, shortest form:**
- **Nothing in the map's wiring is hand-placed.** `tools/maproute.js
  <sheet> --base <plain-prep>` finds the road (openness seam-carve),
  the stops (diff vs the pre-vignette sheet), the label anchors and
  the caption anchors (blank-paper searches), and the road's detours
  around the landmarks. Re-roll the art → one command → paste the two
  arrays. `tools/mapprep.js` turns a 4K master into the shipped PNG-8.
- **KEEP `map-ink-master-plain.png`** (project root, gitignored like
  all masters): it is the `--base` every re-route needs AND the start
  point for future edits. All four map masters live only in the
  working folder — **they want a backup**.
- **Threshold scrolling was built and REJECTED the same day** (§9u
  part 5, `?step=1` keeps it). Do not re-propose it without that
  context. Same for the screen-pinned vistas (`?vista=1`) and the
  info cards (`?info=1`) — superseded, kept as ways back.
- **Open decisions for VEN:** ink vs pirate sheet (`?map=pirate`; the
  pirate sheet has NO vignette pass yet — §9v has the recipe);
  footsteps (`?trail=dots` reverts); glide feel (`?glide=`,
  `?camsmooth=`).
- **Chrome QA on this machine:** background/never-painted tabs have
  ZERO layout — the map self-heals on first paint (part 5 hardening),
  but measurements in such a tab are garbage. The route debug render
  (`--debug`) is the authoritative placement check; it draws the road,
  stops, name boxes and caption bars on the sheet itself.

**If you read nothing else:**
- **START AT §9r–§9w (session 12, the journey rebuild), then §9q, then
  the "LAUNCH DAY" section at the very end** — LAUNCH DAY is the
  complete token-specific list. §9q carries the pre-map switch
  inventory and a hard-won tooling note (a minimized Chrome window
  freezes rAF, so screenshots come back blank and animation
  measurements are garbage — it reads exactly like a layout bug that
  is not there); §9r/§9s/§9u carry the map-mode switch tables.
- **`perRoof` is STILL undecided and it is the one open decision.** 60
  roofs at $100k fills the field at **$6.0M**; it was $2.0M when that
  number was chosen. ~$33k restores the original ceiling. Tokenomics,
  not layout.
- **§9n + §9o + §9p + §9q are the current state.** §9o: all four
  compounds a seeded 15% smaller (`PAD_FILL`) and the sleeping Z's
  built. §9p: repo, deploy, and the slider shipping on purpose. §9i
  block 1 is done; §9j is what it measured; **§9k, §9m and §9n are
  VEN's three markups and what they cost.** The four worth knowing: the meadow test compared the wrong
  pair of channels; the landing test was measured against the dilated
  mask instead of the painted clearing; one ground band described both
  a house and a walled compound; and every plot was being reserved
  against the widest building in the set.
  All of it is signed off and shipped — VEN reviewed the village, the
  compounds and the Z's in this session and then took the site live.
  `tools/render.png` (all 60) and `tools/render-6.png` (at $600k) are
  the current previews.
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
- The journey is the MAP (`?journey=map`, default, session 12);
  `?journey=split` keeps the two-column crossfade and `?journey=road`
  the old pseudo-3D road, both fully working. Nothing was deleted —
  VEN asked explicitly that alternatives stay. Bullets below that
  describe split as "the default" predate session 12.
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
> gotchas, and twelve sessions of review decisions (including things
> deliberately rejected — don't re-flag those, §9u part 5 especially).
>
> State: the site is LIVE at https://tilesongiwa.com (repo
> MTDVEN/hanok, push to main deploys). The journey is a pirate-map
> sheet you walk (`?journey=map`, default; split and road kept): the
> four places are painted INTO the sheet as vignettes, the camera
> glides a smoothed track between them, footsteps mark the trail, the
> Korean names handwrite themselves beside their buildings with the
> English captions under them. ALL of the map's wiring is generated by
> `tools/maproute.js` (with `--base` for a vignette sheet) — never
> hand-place a stop, label or caption; re-run the tool and paste. The
> village composites painted sprites over a plate; `PLOTS` is
> generated by tools/plots.js the same way. Nothing is half-finished.
>
> **I make the art in OpenArt (nano-banana-2, image2image), not you** —
> and landmark art is EDITED into existing sheets with references, not
> generated fresh (§6b, §9v). Don't hand-author pictorial SVG — write
> the prompt and build the machinery.
>
> Environment, or you will waste an hour:
> - Start the preview server yourself: `node tools/serve.js`
>   (background), then confirm it returns 200 before trusting it. It
>   does not survive between sessions.
> - Preview at `http://localhost:8137/index.html?motion=1` (with
>   `?preview=0` to hide the market-cap slider while judging).
> - Chrome MCP tabs on this machine are often BACKGROUND-CREATED with
>   ZERO layout: clientWidth 0, no paint, frozen rAF — measurements
>   there are garbage and screenshots are stale. The map self-heals on
>   first real paint. For placement questions use the route debug
>   render (`node tools/maproute.js art/journey/map-ink.png --base
>   <plain-prep> --debug`) — it draws road, stops, names and captions
>   on the sheet itself and is the authoritative check. §7 + §9q + §9w
>   have every workaround.
>
> What I want done this session: ______
>
> Likely candidates, in priority order:
> 1. The open judgement calls on the journey: ink vs pirate sheet
>    (`?map=pirate` — needs its own vignette pass first, recipe in
>    §9v), footsteps vs dots (`?trail=dots`), glide feel (`?glide=`,
>    `?camsmooth=`).
> 2. Polish the manifesto and the ledger — untouched since session 3,
>    now clearly the weakest part of the page.
> 3. Zico's deliverables landing — token name/ticker (hero strokes +
>    WORD in js/hero.js), manifesto copy, OG meta. The journey no
>    longer needs blurbs on the default path (map mode carries no
>    copy), but split/road/static still use `SPOTS[i].blurb`.
> 4. Launch day: js/config.js (CA, links, chart pool, perRoof — still
>    undecided), og.png, favicon.ico, absolutize og:image, og:url.
> 5. Weight: art/ is ~22.6MB deployed now (two map sheets ship until
>    the ink/pirate call — picking one saves ~2.3MB; §9r "Open" has
>    the sizing levers).
>
> Ask me before changing design direction. Everything else, use your
> judgement and verify with the tools first, Chrome second. When
> something has more than one plausible treatment, build them behind a
> URL switch and show me both rather than picking for me — and keep
> the loser in the code.

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

**Zico still owes us** (chase before launch). *This list is from
session 1 and most of it has since landed — struck through below, kept
for the record rather than deleted:*
- ~~Final token name~~ — **기와 / GIWA**, session 13 (§9y). The
  ticker is still `null` in the config but is almost certainly
  `TILES`; see LAUNCH DAY §2.
- ~~The website copy~~ — the four map notes are written. Stops 1 and
  2 were replaced wholesale on 2026-08-28 (§9ac); stop 3's bridge and
  swap steps are the one hole left in it, and say so on the sheet.
  The manifesto section and `SPOTS[i].blurb` are still placeholder.
- CA + buy/social links (launch day) — **still outstanding**
- ~~Confirmation on art placement after he sees the demo~~ — given
  across sessions 13–15

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
  The seal glyph is **韓 everywhere** — hanja, read 한, the character
  for Korea itself (한국 / 韓國, 대한민국 / 大韓民國) and still the
  one-character stand-in for the country in Korean newspaper
  headlines. Hanja in seal script is what a 도장 has always been
  carved in, so it is the right register even though the rest of the
  page is hangul. **It has ONE source since 2026-08-25**:
  `CONFIG.token.seal` in js/config.js, which resolves `?seal=`,
  sanitises it, and hands CSS `--seal-glyph` + `--seal-scale`. Three
  consumers read it (the hero stamp, the map markers, the
  `.manifesto__seal`/`.footer__seal` rule); **the favicon data-URI in
  index.html is the one copy that still has to move by hand.**
  `tools/seal.html` stamps every candidate at all three real sizes
  and is how the choice gets made.

  瓦 (roof tile, read `wa` — the 와 of 기와 and of 청와대 / 靑瓦臺)
  held the slot for one round on 2026-08-25 and was rejected on
  looks: its diagonal leaves the bottom-left of a square stamp empty,
  so it reads as falling over at 30px. VEN: *"the roof tile character
  doesnt look all that aesthetic"*, then *"lets just use han"*.
  Meaning lost to balance, which is the right trade at marker size.

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

### The domain — Vercel side done, DNS was VEN's

**(This section describes the state mid-session. The domain is LIVE —
see §9q for what actually happened when the records went in, including
the duplicate A record that broke it and the certificate it blocked.)**

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

---

## 9q. Session 11, part 4 — the site went live, and three things that surfaced only once it had

Everything below happened AFTER §9p, and §9p's "DNS is VEN's" section is
superseded by this one.

**THE SITE IS LIVE AT https://tilesongiwa.com** — apex and `www`, HTTPS,
certificate valid to 14 Nov 2026, auto-renewing.

### 1. The domain: a duplicate A record, and the certificate it silently blocked

VEN added the records and it still failed with `ERR_TIMED_OUT`. Three
distinct problems were stacked on top of each other, and separating
them is the useful part:

**(a) A leftover parking record on the apex.** Namecheap's default
`URL Redirect Record` on `@` was never deleted, so the apex had TWO A
records and the resolver alternated between them. Measured, because
"it works sometimes" is not a diagnosis: 12 samples of Google's
resolver gave **8× `216.198.79.1` (Vercel), 4× `192.64.119.65`
(Namecheap parking)**. Every visitor got one at random; a third of them
hit a dead IP. Reloading changed the answer, which is exactly why it
felt intermittent and unfixable.

**That duplicate is also why the TLS certificate never issued**, and
this is the bit worth remembering. Let's Encrypt validates over HTTP;
when its check landed on the parking IP the challenge failed, so Vercel
retried and never got a cert. It was not slow — it was blocked, and it
would have stayed blocked forever. `www` had no duplicate, so `www`
had a working certificate the whole time, which was the clue that
isolated the fault to the apex.

Deleting the stray record fixed both at once.

**(b) The diagnosis was nearly derailed by three red-herring 403s.**
`vercel domains ls` reports 0 domains, and `vercel domains inspect`,
`vercel certs issue` and `vercel alias set` all fail with *"You don't
have access to tilesongiwa.com"*. **That is normal and means nothing.**
Those commands operate on the ACCOUNT-LEVEL domain registry, which only
contains domains registered or transferred to Vercel; this one lives at
Namecheap. The domain was correctly attached to the project the whole
time — `get_project` lists it, and the edge served it. Do not chase
those errors.

Similarly, `vercel domains add` will say *"already assigned to another
project"* when it is already assigned to THIS one.

**(c) Caching, at two levels, long after the fix was correct.** Windows'
own cache (`ipconfig /flushdns`) did NOT help, because the stale copy
was upstream: VEN is on Virgin Media DNS (`194.168.4.100`) and its
cached record had 136s left. Google's public resolver was already
clean. The lesson for next time: **always verify against a public
resolver, never against the local machine**, and read the TTL to know
how long to wait rather than guessing:

```
nslookup tilesongiwa.com 8.8.8.8            # bypasses local + ISP cache
curl -s "https://dns.google/resolve?name=tilesongiwa.com&type=A"
```

**The final DNS, for reference.** Namecheap BasicDNS, exactly two host
records, nothing else:

| Type | Host | Value |
|---|---|---|
| A | `@` | `216.198.79.1` |
| CNAME | `www` | `cname.vercel-dns.com.` |

### 2. A REAL BUG the deploy exposed: reduced motion was deleting the copy

VEN: *"the journey section loads wrong."* It was not a deploy fault. His
OS has `prefers-reduced-motion` on, so the site served its accessibility
fallback — and that fallback was defective:

Each stop in `SPOTS` carries a `blurb` (the actual prose — *"The palace
of shining happiness. Six centuries of court and quiet…"*). Split mode
rendered it. **The static fallback rendered the painting and a name
caption and dropped every word**, so a reduced-motion visitor got a
journey section with no journey in it.

That is a content bug wearing an accessibility costume, and it had been
shipping to real people, not just to VEN. Reduced motion is a request
to stop things MOVING, not a request for less of the page. Fixed: each
figure now carries its blurb in the body face at a 46ch measure, and
the column widened 460 → 560px to hold it (`.journey__blurb`).

**The fix still matters even though the fallback is now off by
default** (see 3) — `?motion=0` still reaches it.

### 3. Two policy changes VEN made, both deliberate, both with a way back

**Motion: the OS setting is no longer honoured.** `HANOK_REDUCED()` in
`index.html` now returns `false` unless `?motion=0`. VEN's call, made
with the trade-off stated explicitly.

- *Why:* the animation is most of what the page IS — the road you walk,
  the village that grows. Reduced motion gated 13 CSS rules and five JS
  modules, which stripped the page rather than calming it, and a
  visitor arriving from a token link saw four static pictures.
- *What it costs, recorded so nobody has to rediscover it:*
  `prefers-reduced-motion` is the one accessibility signal a browser
  volunteers, and scroll-pinning and parallax genuinely cause nausea and
  migraine for people with vestibular disorders. **We are overriding a
  request those people made deliberately.** If anyone ever reports the
  site making them unwell, this is the line to flip back, and it is a
  one-line change documented in place in `index.html`.
- `?motion=0` still serves the complete reduced-motion build, so that
  path is live and testable rather than dead code.

**The backdrop is global by default.** `BG_GLOBAL` in `js/journey.js`
was built in this session as an opt-in `?bg=global` switch so VEN could
judge it — and then not flipped, so the live site did not match what he
had been shown in the dev server. It is now the default.

The hero's landscape holds at ghost strength down the village,
manifesto and ledger instead of fading to nothing at the journey's end.
The curve, computed rather than eyeballed:

| journey progress | now (global) | before (fade) |
|---|---|---|
| 0.00 → 0.07 | 1.00 → 0.26 | 1.00 → 0.26 (identical) |
| 0.30 – 0.88 | 0.26 | 0.26 (identical) |
| 1.00 and past it | **0.26** | 0.000 |

Hero and journey are untouched; only the ending differs.
`progressOf()` clamps to 1 and the scroll listener is not
observer-gated, so the ghost persists to the footer.

Knobs: **`?ghost=N`** sets the standing strength (0.26 default; try
0.18 if it competes with the copy, 0.35 if it is too shy) and
**`?bg=fade`** restores the old fade-out. `?ghost=` is the first thing
to reach for — it decides whether the page reads as "one landscape" or
as a watermark, and **VEN has not yet judged it on a real screen.**

### The switch inventory, current

| switch | default | what it does |
|---|---|---|
| `?motion=0` | off | the full reduced-motion build (static journey, no Z's) |
| `?motion=1` | — | force motion on; now redundant, kept for QA |
| `?bg=fade` | off | backdrop fades out at the journey's end (old behaviour) |
| `?ghost=N` | 0.26 | standing strength of the global backdrop |
| `?sleep=0` / `?sleep=N` | 0.3 | share of dwellings with sleeping Z's |
| `?preview=0` | off | hide the market-cap slider |
| `?dev` | off | build-order badges on the slider + console line |
| `?seed=STR` | CA | re-roll which building lands on which plot |
| `?plate=NAME` | field | swap the plate crop |
| `?art=off` | off | inline SVG fallback instead of the paintings |

**Superseded by §9r's table** — the journey switches below are new and
`?journey=` now defaults to `map`.

### Verified at the end of the session

- `https://tilesongiwa.com` → **200**, `https://www.tilesongiwa.com` →
  **200**, `https://hanok-five.vercel.app` → **200**
- Deployed site, motion on: `journey--split`, 4 stops, **0 broken
  images**, 60 village plots, 11 sleeping Z's
- Deployed site, `?motion=0`: static column, 4 figures, **all four
  blurbs present**, 0 Z's
- Only failing request anywhere is `state-00.png`, which is the states
  engine probing for plates that were never generated and correctly
  falling back to sprite mode. Pre-existing and by design (§9e).
- Five commits, working tree clean, 75 files, 28MB of history
- Push → auto-deploy verified across four separate deploys, 3–4s each

### A tooling note for whoever picks this up

**Chrome screenshots and any scroll- or animation-dependent measurement
are useless while VEN's browser window is minimized.** A hidden tab
freezes the compositor and rAF: screenshots return blank parchment,
`getAnimations()` reports `currentTime: 0` forever, `outerHeight` is 0,
and scroll-driven inline styles never update — which reads exactly like
a layout bug that is not there. DOM queries, `getBoundingClientRect`
and network checks still work fine. This is the same phenomenon
`tools/render.js`'s header has always warned about; now it has a name.

When something must be judged visually, either ask VEN to bring the
window to the front, or do what this session did: compute the values
(the opacity table above), render headless with `tools/render.js`, or
stamp the geometry into a PNG with a scratchpad script.

---

## 9r. Session 12 (2026-08-20) — the journey became a map you walk

VEN: *"rather than the current scroll mechanism that we have, I want to
make it like a pirate map instead. Travelling between each location...
we are at the first of four locations, then as you scroll you go down a
long path to the second location on the pirate map, then third and then
fourth."*

So the journey is now a sheet of map, and scrolling walks it. The camera
sits on a place, pulls back, travels down the road, and settles on the
next — four arrivals, three journeys. **`?journey=map` is the new
default; `split` and `road` are untouched and still work.**

### The one thing to decide: which sheet

VEN could not judge the options described in words — *"I am not sure
what either of these would look like"* — which was the right answer to
a badly-posed question. Both were built instead, per VEN's own standing
rule about alternatives behind a switch:

- **`?map=ink` (default)** — a Korean 고지도-style sheet: ink ridges,
  pine forests, terraced valleys, a compass rose, wave scrolls along the
  coast. On palette with the hero and the village.
- **`?map=pirate`** — the treasure map: burnt and torn edges, a coiling
  sea serpent, a sailing junk, heavier browns. It still charts Korea,
  with hanok villages drawn on it, so it reads as a treasure map of
  *this* country rather than a Caribbean one pasted in.

Both ship until VEN picks. **Deleting the loser from `MAPS` in
`js/journey.js` drops it from the build automatically** — `tools/build.js`
lifts the filenames from that object. That is worth ~2.1MB.

### The art, and the two tools that came with it

Generated with OpenArt `nano-banana-2`, `image2image`, **4K at 9:16**
(the "1K square" note at the top of this file is stale — the model does
21:9 through 9:16 and 1K/2K/4K now), 50 credits an image, seeded with
`hand drawn reference.jpg` so the sheet inherited the site's hand. Four
candidates, two kept. 3072x5504 masters, ~26MB each.

- **`tools/mapprep.js`** — master → web asset. Box downscale then
  median-cut 256 + Floyd–Steinberg, written as PNG-8, exactly the two
  passes `optimize.js` runs. `node tools/mapprep.js <src> <dest> 1500`
  gives 1500x2688 at ~2.0MB. (§9h's shared-palette warning does NOT
  apply — that rule is about village sprites agreeing with each other;
  a map sheet is one standalone image.)
- **`tools/maproute.js`** — **finds the road, so nobody hand-drags it.**
  Same rule as `PLOTS` (§9j). Open ground is the one thing on a map that
  is both BRIGHT and SMOOTH, so `openness = norm(luminance) − 1.35 ·
  norm(local stdev)`, and the road is the highest-openness seam from the
  top edge to the bottom (one DP pass down the rows). Re-roll the art,
  re-run the tool, paste the two arrays. `--debug` draws the result over
  the map so it can be checked without a browser.

**A real fault in that tool, found in Chrome and fixed.** Stops were
first placed at the most *open* cell along the road — which is the
middle of the widest empty bowl. The camera zoomed in on Gyeongbokgung
and framed bare parchment with a seal floating on it; the mountains were
just outside the shot. Openness is the right score for a *road* and the
wrong one for a *stop*. Stops now score `open(cell) + 0.85 ·
mean detail in a ring 3–8 cells out` — clear where the marker lands,
something to look at around it.

### How it works

- **Art vs. structure.** The sheet is a painting; the road, the X marks
  and the seals are SVG over it. Deliberate: the road has to be followed
  to sub-pixel accuracy by a camera and revealed progressively, and a
  painted road can be neither. §6b's rule is intact — nothing pictorial
  is hand-authored in SVG.
- **The camera** is ONE transform on `.jmap__cam` (`translate3d` +
  `scale`, origin 0 0). `u` is position in *stop units* — 1.5 means
  halfway from the second place to the third. Dwell holds `u` at a whole
  number; travel eases it with `smooth()`, whose derivative is zero at
  both ends, so setting off and arriving are smooth against the standing
  still either side. Zoom dips to `ZOOM_OUT` mid-leg so you see where
  you are going.
- **Arc length is sampled ONCE** into a plain array (901 points) and
  lerped. `getPointAtLength` per frame is a geometry query and would
  undo the build-once discipline the rest of the file keeps.
- **The road inks itself in behind you** — dotted and faint ahead,
  solid ink behind, revealed by `stroke-dashoffset`. That is the
  signature move §4 always said the journey's line was for. It runs off
  the bottom edge still dotted, heading for the village.
- **X marks the spot, then the seal stamps over it** on arrival — the
  map convention and the site's own dojang in one move. This is the one
  place seal red is allowed outside the hero and footer stamps (§4): a
  marker *is* a stamp.
- **The copy is pinned to the screen, not to the sheet**, so it never
  scales with the camera. Its backing is a gradient, not a card edge —
  a hard-edged panel over a painting is exactly what §6 treated the
  journey's paintings to avoid.

### Three traps, all measured rather than guessed

1. **`mix-blend-mode` does not survive the camera.** Copying
   `.scene-backdrop`'s multiply onto `.jmap__sheet` was the obvious
   move. At `ZOOM_IN` that `<img>` is 2960x5304 CSS px, and a blended
   element must be rasterised into a texture first — 15.7M pixels of
   one. Chrome silently fails to paint the whole layer, leaving the
   road and seals drawn over bare paper, which reads exactly like a
   missing-image bug. Verified: at zoom 1.0 it painted, at 1.85 it did
   not, and `mixBlendMode='normal'` brought it straight back. The paper
   marriage is done by `.jmap__tone` instead — one viewport in size,
   about a twenty-third of the area, blending safely the way `.grain`
   always has. `?maptone=` sets it, 0.16 default.
2. **`MAP_FADE` is not `BG_FADE`.** BG_FADE (0.07) is split mode's
   number, tuned for a section that holds its first stop through the
   entry. Here the first DWELL is 0.10, so a 0.07 fade left the sheet
   half-transparent for most of the time you stand at Gyeongbokgung —
   you arrived at the first place before the map it is drawn on
   existed. Caught at p=0.04 with the sheet at 57%. Now 0.035.
3. **`var NS` was declared in the road block, below the dispatch.**
   `var` hoists the declaration and not the assignment, so map mode
   built its markers with `createElementNS(undefined, …)` — elements in
   the null namespace, which render as nothing and look like a CSS
   fault. Moved to the shared constants at the top.

Also caught before it shipped: **`tools/build.js` had no
`art/journey/`**, so the deploy would have served a road and four seals
on bare paper. The filenames are now *lifted* from `MAPS`, the same
"lift, don't type" pattern the village sprites use and for the same
reason — a missing file here is silent on the page.

### The switch inventory — journey section, current

| switch | default | what it does |
|---|---|---|
| `?journey=map` | **default** | the map you walk |
| `?journey=split` | — | the 2026-08-12 two-column crossfade, untouched |
| `?journey=road` | — | the original pseudo-3D road, untouched |
| `?map=ink` / `?map=pirate` | ink | which sheet — **VEN's call** |
| `?cam=follow` | follow | sit, pull back, travel, settle |
| `?cam=pan` | — | constant scale and speed; calmer, no zoom |
| `?cam=fixed` | — | whole sheet on screen. **Poor by construction** — a 9:16 sheet fitted to a 2.3:1 window is a 384px strip (measured at 1600x689). Kept because it was worth answering, not because it is good |
| `?zoomin=N` | 1.85 | scale when settled on a place |
| `?zoomout=N` | 1.00 | scale mid-journey |
| `?dwell=N` | 0.10 | share of the section spent standing at each stop |
| `?mapfade=N` | 0.035 | how fast the sheet arrives out of the hero |
| `?maptone=N` | 0.16 | paper veil seating the sheet on our paper |
| `?focusx=N` / `?focusy=N` | .68 / .50 | where on screen the arrived-at place sits |
| `?cardspan=N` | 0.40 | how long a card is up. **Must stay under 0.5** or two are legible at once |
| `?walker=0` | on | the ink dot at the head of the inked road |

### Verified

Measured in Chrome at 1600x689 (DOM measurement, not screenshots — see
the tooling note in §9q, which bit again this session: the tab was
backgrounded and the compositor returned stale frames that read as
layout bugs).

| p | zoom | card up | seals stamped | road inked |
|---|---|---|---|---|
| 0.00–0.10 | 1.85 | 1 | 1 | 7% |
| 0.20 | 1.00 | none | 1 | 18% |
| 0.30–0.40 | 1.85 | 2 | 1,2 | 28% |
| 0.50 | 1.00 | none | 1,2 | 49% |
| 0.60–0.70 | 1.85 | 3 | 1,2,3 | 70% |
| 0.80 | 1.00 | none | 1,2,3 | 82% |
| 0.90–1.00 | 1.85 | 4 | all four | 94% |

- **Never two cards at once**, at any p. The sheet's edge never enters
  frame at any p, at either width (`gap: no` throughout).
- `?map=pirate` loads; `?journey=split` still builds 4 stops and 4
  plates; `?journey=road` still builds the stage, 4 panels, 13 road
  paths and the village arrival; `?motion=0` still serves the static
  column **with all four blurbs** (§9q's fix holds).
- Phone, 390x844 via `tools/qa-frame.html`: copy 620→810, no overflow
  top or bottom, plate 93px, sheet covering on all four sides. The
  top clamp binds at the first stop — expected, and documented in place.
- No console errors. `node tools/build.js` → 27 files, 21.6MB, no
  MISSING lines, both sheets in `dist/art/journey/`.

### Open

- **Which sheet.** The whole point of shipping both.
- **Weight.** The two sheets are 2.0MB and 2.3MB, so `dist/` went
  ~17MB → 21.6MB. Picking one gets ~2.1MB back immediately. Beyond
  that they are already PNG-8 at 1500px; the honest next lever is
  dropping to ~1200px, which is a `tools/mapprep.js` re-run and a
  judgement call about how soft the sheet may look at `ZOOM_IN`. Folds
  into the pre-deploy pass that was already open (LAUNCH DAY §4).
- **640vh.** The section is longer than the 460vh it replaced, because
  three journeys need room to read as journeys. If it outstays its
  welcome, `?dwell=` and the `.journey--map` height are the two knobs.
- Whether the road should arrive at the village, now that map mode ends
  with it running off the bottom edge pointing there. See the note in
  `roadArrival()` in `js/village.js`.

---

## 9s. Session 12, part 2 — the glide, and the map lost its cards

VEN, having scrolled §9r's build: *"can you make the animation
smoother, it is a bit choppy as i scroll down. overall really cool
though. I think I want to make it so that we scroll past the actual
locations, remove the information about each location, I want to
scroll past each location and maybe subtle text of the name of each
location in korean that has a handwritten animation that it renders in
with."*

Two changes, both map-mode only. Split, road and static are untouched
and re-verified.

### 1. The glide — why it was choppy, and the fix

The camera was driven directly by scroll position, and **wheel
scrolling is stepped**: each tick jumps ~100px at once. Split mode hid
that because crossfading opacity has no velocity to notice; a
travelling camera teleports with every tick. So scroll now sets a
TARGET and a rAF loop eases the drawn position toward it —
`cur += (target − cur) · (1 − e^(−GLIDE·dt))`, time-based so it feels
identical at 60Hz and 144Hz. The loop stops the moment it converges;
there is no standing animation frame on an idle page. `?glide=N` sets
the rate (11/s default ≈ 90% of a step absorbed in ~200ms), `?glide=0`
restores the direct drive.

**The `inLoop` guard in `step()` is not decoration.** §7's QA trick
patches `requestAnimationFrame` to run synchronously, which would make
a self-scheduling loop infinitely recursive. Re-entry is detected and
answered by snapping to the target — a patched tab converges in one
scroll dispatch, so QA stays deterministic *without* needing
`?glide=0`, and nothing can hang.

### 2. The cards are gone; the names are written onto the sheet

The info column was split-mode content pasted onto a map. Now the map
carries everything itself: at each arrival the place's Korean name
(경복궁, 창덕궁, 남산골, 전주) **writes itself in** beside the marker —
stacked vertically like a 고지도 place label — finishing exactly as the
seal stamps. Scrub backwards and it un-writes, the same way the road
un-inks.

**How the handwriting works, because it is not what it looks like.**
Hand-authoring Hangul stroke paths for ten syllable blocks would be
hero-title-sized work per name. Instead the glyphs are Song Myung, and
the *writing* is the label's mask: `scribble()` lays a serpentine
brush path over each character cell in writing order, that path is the
only white in the mask, and revealing it with `stroke-dashoffset`
(driven by the same `walked` metric as the seal) inks the glyphs in
brush-width sweeps, character by character. Cheap, resolution-free,
and it rewinds for free.

Labels live in map units inside the camera — they belong to the sheet
and travel with the terrain — but their SIZE is set per viewport in
`measure()`: a map unit is 0.72px on a 390w phone vs 2.96px at 1600w,
so each label group is scaled to hit ~10% of viewport height (floored
at 34px). The scale wraps glyphs and mask together, so the writing
scales with the written. Measured: scale 0.97 at 1600x689, 1.96 at
390x844, label fully in view at both.

- **`?info=1` restores the card column wholesale** — kept as the way
  back. The blurbs in `SPOTS` stay regardless: split, road and static
  modes still use them, so Zico's copy still has a home.
- **`?en=1`** adds a small English caption under the Korean, fading in
  only after the name finishes writing. OFF by default — VEN asked for
  the Korean; this is the cheap way to judge whether Korean-only is
  too opaque for token visitors. `?labels=0` hides names entirely;
  `?vlabel=0` lays them horizontally; `?lsize=` `?write=` tune size
  and the write window.
- With the cards gone the camera centres its subject (`FOCUS_X` 0.5,
  was 0.68 to dodge the copy; `?info=1` restores 0.68). The eyebrow is
  the one piece of screen-pinned chrome left, in the top-left corner.
- In map mode with info off, the four journey paintings are no longer
  fetched at all — they still ship for the other three modes.

### Verified

- Default: 0 cards, 4 labels (3/3/3/2 tspans). Write progress along
  the road: hidden → 0.14 → 0.85 → 1.00 into each stop, complete
  exactly at arrival, all four standing at p=1.
- Glide under the §7 rAF patch: converges, no hang, deterministic.
- `?info=1` → 4 cards + wash back. `?labels=0` → none. `?en=1` → four
  captions. Split 4 stops, road 4 panels + stage, `?motion=0` 4
  figures + 4 blurbs.
- Live captures (window foregrounded per §9q's tooling note): stop 1
  settled with 경복궁 standing beside the seal; p=0.26 caught 창덕궁
  HALF-WRITTEN mid-stroke with seal 2 mid-stamp — the mechanism,
  photographed working.
- `node tools/build.js` → 27 files, 21.6MB, dist parses.

### Open (in addition to §9r's list, which stands)

- ~~The glide rate~~ — VEN felt it: *"the animation is so much
  better."* 11/s stands.
- Whether `?en=1` should ship on. VEN's call after seeing it.
- Label placement is side-of-marker by a simple rule (away from the
  sheet's nearer edge). If a name ever sits on busy terrain,
  `tools/maproute.js` is where a clearing-aware placement would go.

## 9t. Session 12, part 3 — the camera stopped stopping

VEN, on part 2: *"the animation is so much better, I still want to be
able to scroll past each place though."*

The dwell was the culprit. DWELL 0.10 froze the camera for ~54vh of
scroll at each stop — a third of the section where the wheel did
nothing visible. That dead-scroll is what "scroll past" was asking to
be rid of, both times he said it.

**DWELL is 0 now: there is no scroll position anywhere in the section
where the camera ignores the wheel.** Verified with 51 evenly spaced
scroll positions — the camera transform changed at every single one.
`?dwell=.10&ease=1` restores the old stop-and-hold exactly.

What replaced the holds, so an arrival still reads as one:

- **`EASE` (0.55)** — each leg's pacing is a blend of linear and
  smoothstep: `(1−EASE)·f + EASE·smooth(f)`. Its derivative bottoms
  out at `1−EASE` of cruise speed at the stops and never reaches
  zero — the camera slows into each town and glides through.
- **`ZHOLD` (0.14)** — the zoom plateaus at full for the first and
  last 14% of every leg, so the camera is all the way in while you
  pass THROUGH a place, not only at one instant. Measured profile:
  1.85 held through each stop, 1.0 mid-leg, continuous throughout.
- The seal and the name needed no change: both are driven by road
  length walked and complete exactly as you reach the marker.
- **`.journey--map` height 640vh → 560vh.** The 640 was sized when a
  third of it was standing still; with the holds gone that length made
  every leg half again slower than the tuned pacing.

**A real phone bug fixed on the way past:** `timeline()` was zooming
with the raw `ZOOM_IN`/`ZOOM_OUT` knobs, not the cover-floored
`zIn`/`zOut` that `measure()` computes. On a 390x844 phone cover is
1.21, so every mid-leg dipped to 1.00 and pulled bare paper into the
top and bottom of the frame. Now floored: measured z = 1.21 at all
three mid-legs, sheet edge never in frame.

Switch deltas against §9r/§9s: `?dwell=0` (was .10), new `?ease=.55`
and `?zhold=.14`.

## 9u. Session 12, part 4 — thresholds, the paintings return, and 1.65

VEN, on part 3: *"Can you make the scrolling threshold based rather
than gradual... when it isnt threshold based it is a bit choppy. Also
I want the images to come back, I want it to seem like you are
scrolling from location to location. Also can you zoom out the
background a tiny bit?"*

### 1. Threshold scrolling is the default (`?step=1`)

VEN's diagnosis was right: even glided, a scroll-linked camera
inherits the wheel's rhythm — every burst of ticks surges and settles.
Threshold mode cuts the wheel out of the motion entirely:

- The section divides into **one equal band of scroll per stop**
  (boundaries at p = 1/6, 1/2, 5/6). Scrolling only decides which band
  you are in.
- Crossing a boundary starts a **tween on the rAF clock** —
  smooth()-eased, `DUR·sqrt(legs)` ms (`?dur=1400`) — from wherever
  the camera is to the new stop. No amount of ragged scrolling can
  perturb a journey in flight; it can only retarget it, and a retarget
  re-plans from the current position, so a hard scroll across the
  whole sheet reads as ONE longer journey, not three queued ones.
- The road, zoom, seal and name all ride the tween, so the whole
  journey plays at one tempo.
- **`?step=0` restores the continuous scroll-linked camera** (with its
  part-2 glide), which is also the honest mode for scrubbing — in step
  mode most scroll positions inside a band draw nothing new, by
  design. Verified both ways: step mode snaps band-exact; step=0 still
  moves at all 41 sampled positions.
- If rAF freezes mid-tween (background tab), the pending frame fires
  on return, sees the elapsed time, and snaps to target — self-healing,
  no code needed.
- Refactor that fell out: `timeline()` split into `timelineU(p)`
  (pacing only, continuous mode) and **`zoomOf(u)`** — zoom now derives
  from distance-to-nearest-stop alone, so one function serves the
  tween and the scroll path identically.

### 2. The paintings are back, as VISTAS (`?vista=0` hides)

Not the cards — just the painting, screen-pinned left (bottom on
phones), fading up as you arrive at its place and away as you leave.
`VSPAN` 0.35 < 0.5, so at mid-leg both neighbours are fully gone —
never two places on screen. Same `artOf`/`settleArt` pipeline, so the
keyed treatment, ink stand-in and 404 fallback come free. Under
`?info=1` the cards already carry the painting, so the vista
suppresses itself. The camera's focus moves right of centre again
(`FOCUS_X` 0.68) to clear it, exactly as it did for the cards.

Composition at an arrival now: painting left, seal + handwritten
Korean name right-of-centre on the sheet — *"you are scrolling from
location to location."*

### 3. `ZOOM_IN` 1.85 → 1.65

"Zoom out the background a tiny bit," done as asked. `?zoomin=` if it
wants further tuning.

Verified: 4 vistas, band-exact handoffs, one at a time; `?info=1` → 4
cards + vistas suppressed; `?step=0` continuous alive; split/static
untouched; phone 390x844 vista 218px along the bottom, no overlap with
the label, sheet covering, z=1.65. dist rebuilt, 27 files.

### Part 5 — threshold REJECTED, same day. Continuous is the default.

VEN, having scrolled part 4: *"no i think change it back. I dont like
threshold anymore."*

`?step=0` is the default again — the part-3 continuous glide. The
vistas and the 1.65 zoom STAY (they were liked; only the scroll drive
was not). Threshold mode is kept whole behind **`?step=1`** — but note
the sequence before proposing it afresh: it was asked for by name,
built, felt, and rejected within the hour. It sounds like a chop fix
and it IS smooth; what it costs is the scroll's authority — inside a
band the wheel does nothing and the page moves on the tween's clock,
not the hand's. That trade is what was disliked.

**Hardening found on the way (real-visitor bug, fixed):** a tab opened
in the BACKGROUND has never been painted, and browsers defer its
layout — `clientWidth` is 0. `measure()` then made `cover = H/0 =
Infinity`, and a transform containing `Infinitypx` is invalid CSS that
the browser SILENTLY DROPS — the map just never appeared, with no
error anywhere. Now: `measure()` bails on 0x0 and leaves itself
unmeasured, `drawMap` no-ops while unmeasured, and `onScroll` +
`visibilitychange` re-measure the moment the tab has real geometry.
Surfaced by an MCP tab (they are created unpainted), but the visitor
case is ordinary: a link opened in a new background tab, visited
later.

---

## 9v. Session 12, part 6 — the places moved INTO the sheet

VEN, after the vista round: *"We need to discuss a good way to
integrate an image of each location into the background... what about
re-generating that background with the images integrated... in the
corresponding art style"*, then: *"I just want to be able to scroll
past the actual locations and it looks quite bad right now with the
current approach we took."*

He was right about why it looked bad: the vista was screen-pinned
while everything else lived on the sheet, painted at a foreign scale
with its own light. The fix is the old-map convention itself — the
landmarks are now PAINTED INTO THE MAP as pictorial vignettes, one at
each stop, by the same cartographer's hand. Arriving at the vignette
IS the image moment; nothing floats.

### How the sheet was made — EDIT, don't regenerate (§6b's rule held)

nano-banana-2 image2image, 5 references: the PLAIN ink sheet as the
base to edit + the four journey paintings as landmark references.
Prompt: keep the terrain unchanged, add four SMALL vignettes (≤1/5
sheet width) in the corridor clearings, top to bottom in visit order,
same ink-and-wash hand, soft ground shadow, NO text, NO trail. Two
variants; B chosen (organic Jeonju roof-mass beats variant A's walled
square; masters kept as `map-ink-master.png` / `-alt.png`).
50 credits each. Full-res crops checked before wiring: no text, no
style drift, terrain preserved.

**Masters at the project root, in .gitignore like every other master:**
`map-ink-master.png` (SHIPPED, has vignettes), `map-ink-master-alt.png`
(runner-up), **`map-ink-master-plain.png` (the pre-vignette terrain —
KEEP: it is both the `--base` for stop detection and the start point
for any future re-edit)**, `map-pirate-master.png`.

### Stops are found by DIFFERENCE now — `maproute --base`

Weight-tuning could NOT find the vignettes and it was tried twice:
detail-stdev cannot tell a painted landmark from a mountain range —
both are ink. At `INT_W` 0.85 the Namsangol stop landed 10% of the
sheet below its house; at 2.2 the Changdeokgung stop wandered into the
terraced fields. Do not try a third weighting.

`node tools/maproute.js art/journey/map-ink.png --base <plain-prep>`
subtracts the plain sheet's detail field from the vignette sheet's —
the only thing separating the two IS the landmarks — then picks the N
strongest road-adjacent rows (±10-row suppression so one vignette
cannot claim two stops). All four locked on first run, verified on the
debug render: markers at the palace terrace, the garden gate, the
hanok's doorstep, the village entrance.

**The label side is emitted too** (third element of each stop): summed
diff mass left vs right of the road sends the name to the lighter
side, so 경복궁 does not write itself across the palace roof — which
the old away-from-the-edge rule would have done at stop 1.
`js/journey.js` falls back to the edge rule for sheets without sides
(the pirate entry still has none).

### What changed in the site

- `MAPS.ink`: new sheet (1800x3225 prep, 3.0MB — up from 1500, because
  the vignettes carry detail the terrain never did; at 1.65 zoom on a
  1600w screen that is a 1.47x upscale vs 1.76 before), new path, new
  stops with sides.
- **`?vista=0` is the default** — the sheet carries the places.
  `?vista=1` restores the screen-pinned overlay for comparison,
  `?info=1` the full cards. With no vista the camera focus centres
  again (the FOCUS_X conditional was already written that way).
- dist 21.6 → 22.6MB (the 1MB is the richer sheet).
- The pirate sheet is UNCHANGED — plain terrain, no vignettes, edge
  rule labels. If VEN picks pirate it needs the same edit pass
  (`map-pirate-master.png` is the base; the workflow above is the
  recipe).

### Open

- VEN has not yet scrolled the vignette sheet (tab-visibility QA limits
  — the stops were verified on the debug render, not in motion).
- Label 1 sits close to the palace vignette's right eave by
  arithmetic; if it crowds, `?lsize=` smaller or nudge the 23-unit gap
  in measure().
- The four big paintings now appear ONLY in split/road/static modes
  (map mode fetches none of them unless ?vista=1/?info=1 — a small
  bandwidth win on the default path).

---

## 9w. Session 12, part 7 — the crane camera, and everything finds blank paper

VEN, with two screenshots (the seal against the hanok's wall + the
label across the mountains; the road cutting through Changdeokgung's
pond): *"i want the camera to not be as strictly linked to the path of
the black line... the sharp changes in directions"*, and *"they
overlap with the background rather than being put in a blank space."*

### 1. The camera rides a crane, not the road

A camera welded to `pointAt()` inherits every bend of the spline as a
lateral jerk — VEN's diagnosis was exact. The camera now follows a
heavily smoothed copy of the road (moving average over ±`?camsmooth=`
0.09 of its length) and is pulled back onto the TRUE road point on
approach to a stop (full within 0.10 of a stop, released by 0.30 into
the leg), so arrival framing is pixel-identical. The road, the walker
dot and the inking still ride the true path — only the camera is on
the crane. Verified: 101-sample sweep, no sheet-edge gaps, no
discontinuities. `?camsmooth=0` welds it back.

### 2. The road detours around landmarks; labels SEARCH for blank paper

Three faults, one root: nothing knew where the vignettes were.

- **`vig` field in maproute (--base):** detail-diff PLUS luminance-drop
  — the wash apron is smooth (detail-blind) but darkens parchment, so
  the two terms together cover the whole landmark. Dilated 2 cells
  into `vigPad`.
- **The seam is repelled by `vigPad`** (`VIG_W` 3.0, far past any
  terrain cost) — the road keeps a verge around every vignette and the
  marker lands beside the landmark, not against its wall.
- **Labels get a SEARCHED anchor** (stop elements 3+4, absolute
  fractions): a 2D scan for the quietest label-footprint of parchment,
  judged on ALL ink (nd + 2·vigPad), bounded by the ARRIVAL FRAME —
  measured ±0.30 of sheet width but only ±0.073 of height on a
  1600x689 desktop, so vertical freedom is ±4 rows. Three traps found
  and documented in place: side-rules can't see terrain; a fat road
  margin excludes the corridor (the blankest thing on the sheet, and
  where the road lives); a 7x8 "seal" exclusion blocked the pass when
  the seal is only ~2 cells. The debug render now draws each label
  footprint as a box, so "does the name sit on blank paper" is
  answerable without a browser.
- `js/journey.js` places labels at the anchor when present; sheets
  without one (pirate) fall back to the side rule. Verified live: all
  four labels at their anchors, 창덕궁 caught writing on blank paper.

Re-wiring after any future sheet edit is unchanged: one `maproute
--base` run, paste path + stops.

### Part 8 — the name is a CAPTION: it sits with its building

VEN, with three more screenshots: *"i still want the writing to be
next to the buildings though... next to (or above/below) the
building."* The blankness-first search had scattered 경복궁 and 창덕궁
across the frame from their buildings. Right call: a place name on a
map belongs WITH the thing it names.

`labelSpot` reworked, three changes that all mattered:

1. **Adjacency is the objective now**: score = terrain ink + 0.05 per
   cell of distance from the landmark. Blankness only breaks ties
   among adjacent spots; only heavy ridge ink is worth walking away
   from the building for.
2. **The landmark is a FLOOD-FILLED component**, seeded at the
   strongest vig cell beside the stop — not a thresholded bbox.
   image2image drift left vig residue across the sheet, a bbox
   swallowed a drifted haze patch half a frame away, and
   distance-to-landmark read zero in the far corner. Connectivity
   keeps the component honest.
3. **The candidate footprint is life-size** (3x7 cells, was 5x11 —
   twice the label's real desktop size), so it can fit the tight
   pockets beside a building — precisely where the names now go. A
   footprint may not touch the component at all: caption beside,
   never on.

Result, verified on the debug render and live label transforms:
경복궁 between marker and palace; 창덕궁 on the complex's right
shoulder; 남산골 in the clear corridor on the house's west flank
(VEN's "move it left" — it found fully blank paper there); Jeonju
adjacent-left of the village, where VEN already liked it.

### Part 9 — the entry dissolve rides the slide-in

VEN, with a screenshot of a viewport-tall blank slab between the hero
and the map: *"IT looks like a whole blank screen before we hit the
threshold that triggers the 'the journey' section to load."*

Exactly what it was. Every version of the entry keyed the dissolve to
`p` — progress through the PINNED section — and `p` is clamped at 0
for the entire viewport-height where the journey is still scrolling
INTO view. The sticky slab slid up empty (its opaque paper background
hiding the fixed landscape behind it) and only began fading once
pinned.

Two changes, one effect:

- **`preOf()`** — how far the section's top has climbed the viewport
  (0 at the fold, 1 at pin) — now drives both the map's opacity and
  the backdrop's settle to GHOST. The map materialises over the hero's
  mountains AS it rises, fully opaque the moment it pins; hero and map
  genuinely cross-dissolve while both are on screen. Sampled in the
  scroll handlers only (it moves only with real scroll), read by
  drawMap. **`?mapfade=` is gone** — its job no longer exists.
- **The sticky's opaque background is gone** (css note in place) — it
  sat between the semi-transparent map and the landscape, which is
  what made the slab BLANK rather than a crossfade. The sheet's
  cover-floored zoom means nothing else ever shows through.

Measured: map 0 → .25 → .50 → .75 → 1.00 across the slide-in,
backdrop 1.00 → .26 on the same motion, both stable after pinning.
Split mode untouched (BG_FADE is its own and still in use there).

### Part 10 — footsteps, and the seam finished

Two more from VEN: footsteps for the trail ("but be ready to revert"),
and the hero seam still not smooth ("make the hero fade out and then
the journey section fades in").

**Footsteps (`?trail=dots` is the whole revert).** The trail ahead is
now ~150 small ink prints a stride apart, alternating sides, each
turned to where the road goes — generated from the same arc-length
table the camera uses, never drawn by hand. Prints vanish under the
inked line as they are walked and come back on a scrub. The hide/show
is INCREMENTAL (an index pointer over the sorted list), so a frame
touches only the prints actually passed — the build-once discipline
holds. Verified: 152 prints, 74 hidden at mid-journey, restored
correctly on scrub-back.

**The seam.** Part 9's opacity dissolve was necessary but not
sufficient: uniform opacity cannot hide the sheet's GEOMETRIC top edge
— a hard line slid up the screen however transparent the sheet was
(VEN's screenshot showed it plainly). Two additions, both riding the
same `preOf()` value:
- the sheet's leading edge is FEATHERED with a retreating mask during
  the entry, removed entirely once pinned (a standing mask on a
  viewport-sized layer is a per-frame cost nothing here will pay);
- the hero's own content (`.hero__inner`, `.hero__scroll`) fades out
  in counterpoint — measured: hero .7/.3/0 against map .3/.7/1.
The sequence now literally reads hero-out / journey-in, which is what
VEN asked for in words.

### Part 11 — the exit mirrors the entry

VEN: *"the same fade effect at the bottom of the section"* — done as a
mirror. `postOf()` measures how far the section's bottom has climbed
the viewport after unpinning; the map's opacity multiplies by
(1 − exit), its TRAILING edge feathers with a bottom-anchored mask,
and it dissolves down into the standing ghost landscape as the
manifesto arrives. Same gating, mask removed while pinned. Measured:
opacity 1 → .75 → .50 → .25 across the exit with the mask present,
restored clean on scrolling back up.

### Part 12 — the English names write too

VEN: *"add the english names next to each korean name too please. Same
font and same written animation."* `?en=` defaults ON now. The caption
sits centred under the Korean column, same display face, small caps,
and it WRITES rather than fades: its own wavy mask stroke swept along
the line (a single pass IS handwriting at caption scale — the
per-character serpentine is for tall glyph cells), starting once the
Korean is 60% down and finishing with the seal, so one hand appears to
move from name to caption. Rewinds on a scrub like everything else.
Verified: four captions, each writing 0 → 1 over its approach.
`?en=0` hides them.

### Part 13 — the caption moved under the building

VEN, with three overlap screenshots and four red-lined ones: the wide
English line, centred under the narrow Korean column, stuck out into
roofs, ridges and the compass. The red lines all pointed to the same
place — just below each building's ground wash.

So the caption anchors under the LANDMARK now, not under the column.
`maproute --base` emits it as stop elements 5+6, taken from the
landmark's own flood-filled footprint: centred on it, a couple of
cells below its bottom edge — and since the component includes the
wash (the luminance term sees it), "below the component" IS "below
the wash", exactly the red lines. The caption is its own SVG group
(`.jmap__enlab`) with its own transform and write mask; sheets
without an anchor (pirate) fall back to under-the-column. The debug
render draws the caption bar too, so placement is checkable without
a browser.

One caveat, measured: on a short wide window (1600x689) stop 4's
caption sits just past the arrival frame's bottom edge and is seen a
beat later as the camera exits; on VEN's own window (taller frame,
±0.108 of sheet visible) all four are in frame at arrival.

### Part 14 — the caption SEARCHES the band under the building

VEN, three screenshots: Changdeokgung's caption on the ridge below it
("move right"), Namsangol's on the mountains ("move left"), Jeonju's
"non existent" — it sat ON the village's own bottom roofs, dark on
dark, because the flood component under-reads a big vignette's extent
and "3 cells below the component" was still on the art.

The blind drop is now a SEARCH: a caption-shaped footprint (wide and
short, its real aspect) scans the band below the component scoring RAW
ink only — sitting on the ground wash is fine and always looked good;
roofs and ridges are what kill it — plus a pull toward
centred-and-close, the arrival-frame bound, and a keep-out around the
Korean name. All three moved exactly the directions VEN pointed:
0.340→0.424 (right), 0.493→0.438 (left), and Jeonju's dropped to
clear paper below the village.

Checks run: debug-render crops of all four caption regions (each bar
on quiet paper — and the bars are drawn ~2x the caption's true width,
so the real text has margin); numeric overlap audit at both label
scales (no caption touches its name or seal on desktop; one
padded-box graze on phones at stop 3, real ink clears); parse, build,
push, live-asset check. The known caveat stands: on a short wide
window captions 2-4 sit just below the arrival frame and appear as
the camera moves on.

### Open

- `?camsmooth=` has not been felt on a real wheel.
- Footsteps are unjudged by VEN (`?trail=dots` reverts in one switch).

---

## 9x. Session 13 (2026-08-21) — Namsangol became a village, and the sheet stopped being swappable

Zico, first note of the day: *"for Namsangol Hanok Village visual on
the website, could we add some more buildings to make it seem a bit
more like a village"*, and when VEN asked whether he meant variety or
number: *"yeah just maybe some smaller buildings behind it, but
similar styles pls"*.

He was reading the map's THIRD vignette, and he was right about it.
Laid out against the other three, Namsangol was the odd one:
Gyeongbokgung is one grand hall (correct — it is a palace),
Changdeokgung is a complex with pavilions and a pond, Jeonju is a
proper eighteen-roof town — and Namsangol, the one with "Village" in
its name, was a single walled house alone in a clearing.

**It now has six smaller hanok stepping up the slope behind it** —
four tiled, two thatched, a lane, a pine — all drawn by the same hand,
all clearly smaller than the walled house, which is untouched.

### 1. The whole-sheet swap is DEAD. Patch the clearing instead.

This is the session's real finding and it will save the next person
half a day.

The §9v route — hand OpenArt the master, get an edited master back,
re-prep, re-route — **works for the picture and breaks the wiring.**
image2image re-renders the whole page: measured at **mean 16.7 dRGB
across the sheet** against the master it was given, with the drawing
itself faithfully preserved (every mountain came back as the same
mountain, drawn with slightly different strokes; the Gyeongbokgung and
Jeonju vignettes were indistinguishable by eye).

Harmless — until you remember the sheet is MEASURED. `maproute --base`
finds the stops by differencing against the plain sheet and normalises
over the whole grid, so a re-stroked sheet moves landmarks nobody
touched. On the first whole-sheet swap the **Jeonju stop slid from
0.372,0.857 to 0.307,0.911** — off the village it exists to frame —
purely because a new landmark had entered the normalisation. Three
signed-off vignettes should not move because the fourth was edited.

**`tools/mappatch.js` (new)** takes only the changed clearing:

```
node tools/mappatch.js map-ink-master.png <edited>.png <out>.png \
     --limit 0.34,0.49,0.598,0.66 --debug
```

- The region is FOUND, not typed: a cell counts as new work when the
  edited sheet differs there AND the base was quiet paper. New ink on
  bare parchment is exactly what an added building is; a re-stroked
  mountain fails the second test. Largest blob, dilated, wins.
- The pixels are chosen by the BASE's local contrast: take the edit
  where the base is smooth, keep the base where the base carries ink.
  Two things fall out free — the existing hanok cannot drift (it is
  ink, so it is kept), and a new roof is admitted on paper but clipped
  where the hanok already stands, which is the right occlusion for a
  building further away.
- The patch is tone-matched to the base over the paper it lands on
  first; a step in the parchment is the one seam the eye finds.
- `--debug` writes `<out>-mask.png`, the blend weight over the sheet.
  Read it before opening anything else.

**Proof it worked, and the check to run every time:** diff the shipped
master against `map-ink-master.png` — every cell outside the Namsangol
clearing reads < 2 dRGB and the terrain alignment error is **0.00**.
Then re-route: stops 2 and 4 came back at the values already in
`js/journey.js`, stop 3's label anchor (0.368, 0.632 — the west-flank
pocket VEN picked in §9w part 8) unchanged, and the road within 0.006
of its old line the whole way down.

### 2. The vignette may NOT grow into the road's corridor

The first good roll put a barn out at x 0.63, across the open channel
east of the house. `VIG_W` 3.0 is a hard repulsion, so the seam gave
up on that side entirely: the road went down the FAR side of the
valley through the rice terraces, x 0.60 → **x 0.27**, and took the
stop with it. At `ZOOM_IN` 1.65 the arrival frame is 1/1.65 = 0.606 of
sheet width centred on the marker, so the village would have sat with
its right-hand third off-screen. Not shippable.

Hence `--limit`. **0.598 is the widest right edge that still leaves
the road its pass** — walked up to in steps, not guessed, re-routing
at each one. Put the box edge in a GAP between buildings: at 0.575 it
cut a thatched roof in half and the fade was visible on screen; at
0.598 the whole building is inside and the road is unmoved.

**The clearing is now full.** Anyone asked to make this village bigger
should know the answer is no, not without the road detouring. Two
rounds were spent proving it: told to stay inside the house's width,
the model made the cluster *bigger*; told to spill west instead, it
scattered buildings across the mountains and the pine forest, where
the ink gate would have shredded them. Four rounds, 13 images, 650
credits.

### 3. What the prompt had to say

Same §6b rule as ever — EDIT, never generate — plus one new trick
worth keeping: **the style reference came from the sheet itself.** The
Jeonju cluster was cropped out of the master at full res and handed
back as reference 3 ("the size and hand of a single small house to
match"). A house drawn to match a house already on the page cannot
drift in weight, hatching or wash. Three references total: the full
sheet to edit, a close-up of the vignette to change, the Jeonju crop.

The instructions that actually moved the result, in order of value:
size stated as "the same small size as one house in reference 3";
"the nearest new roof must be partly hidden behind the existing
house's roof ridge" (kills the second-village-up-the-valley reading);
and naming the corridor as something that must stay empty.

### Files

- `map-ink-master-nams.png` — **the shipped master** (patched).
- `map-ink-master.png` — the pre-village accepted sheet. **KEEP: it is
  now the `--base` for mappatch as well as the start of any re-edit.**
- `map-ink-master-plain.png` — unchanged, still `maproute --base`.
- `map-ink-master-nams-raw.png` — the raw OpenArt return the patch was
  cut from. `-rawB` (a tighter hamlet) and `-rawC` (a full village,
  the one that broke the road) are kept beside it.
- All gitignored, all in the working folder only — **still no backup.**
- `art/journey/map-ink.png` 3.10 → 3.24MB; dist 22.6 → 22.7MB.

### Open

- Not yet seen in motion by anyone: the Chrome tab went background
  mid-session (§7's trap — `visibilityState: "hidden"`, frozen rAF,
  blank captures). The arrival was screenshotted live BEFORE that on
  the near-identical previous clip and looked right, and the final
  sheet was verified on the route debug render, which §9r calls the
  authoritative placement check. **VEN should scroll it.**
- Jeonju is the only other vignette with "Village" in its name and it
  already reads as a town, so nothing was done there. If Zico asks for
  the same treatment anywhere else, the recipe is this section.

---

## 9y. Session 13, part 2 — the token got its name, and the journey got its brief

Zico sent the page copy, top to bottom, and it changes what the site
IS: the journey stops being four pretty places and becomes the pitch.
**The token is 기와 / GIWA** — Korean for roof tile, and the name of
the Upbit L2 it launches on, which is why the tile metaphor was in the
brief all along.

### 1. The hero writes hangul now

`CONFIG.token.ko` drives the title and `js/hero.js` writes it stroke
by stroke exactly as before — VEN: *"lets give it the same written in
animation though, keep the animation just change the text."* Three
things had to be true for that to work and none of them were:

- **Every character needs strokes in `LETTERS`.** There is no font
  fallback and there cannot be one: the animation is
  stroke-dashoffset along real paths, and a webfont outline has no
  stroke order to write in. 기 is two strokes (ㄱ, ㅣ), 와 is five
  (ㅇ, then ㅗ's stem and bar, then ㅏ's stem and bar), all in Korean
  writing order — which is what makes it read as a hand rather than a
  reveal.
- **The first pass was unreadable and it was worth looking.** ㅇ and
  ㅗ ran together into one blot and ㅏ's bar landed inside the circle.
  Fixed by giving the three parts real air: ㅇ small and high, ㅗ's
  stem long enough to be seen, ㅏ's stem far enough right that its bar
  clears ㅇ.
- **ADVANCE, the seal gap and the viewBox are all per-word.** Hangul
  blocks are square (100 vs 96), 와's ㅏ bar reaches further right than
  a latin K's foot so the seal was being stamped on top of it (gap 2
  → 32, and the viewBox is now sized FROM the seal), and the trailing
  flourish is latin-only — off 와 it leaves from ㅏ's stem and makes
  the vowel look mis-written. `.hero__title` width 640 → 460px,
  because the viewBox is `X0 + chars·ADVANCE + 46` and two characters
  render twice the size of five at the same box width.

Under it, `#heroTicker`. Zico wrote "$XXX" and that is exactly what
renders until `CONFIG.token.ticker` is set — a placeholder that reads
as one, like the CA pill's "coming at launch". `js/main.js` writes the
real one into the hero, the manifesto and the `<title>` from that one
field.

Also from the brief: the tagline is *"One tile at a time.
Community-owned. Fair launch. Forever."*, the primary button is **DEX
Screener** (`#btnDex` → `links.dexscreener`; `btnBuy` is gone from the
markup, its wiring kept), the manifesto is Zico's rewrite, and the
eyebrow, `<title>`, og tags and the footer word all moved off 한옥.

### 2. Zico's copy is WRITTEN ON THE SHEET

Each stop now carries `copy: [...]` — pre-broken lines, drawn under
the English caption in the blank parchment beside its landmark. It
fades in over the last fifth of the approach rather than writing: four
lines swept on a mask read as a machine printing, and the mask
re-rasterises per line per frame. The hand writes the name; the note
is already on the paper when you arrive.

**The anchor is the caption's, and its footprint grew to match.**
maproute's caption search scored a 9x3-cell box; what gets drawn now
is a caption plus four lines, so it scores 13x6 (`CAP_W/CAP_UP/CAP_DN`)
— and that box is **sized for the biggest the block ever gets, not for
one window**. Labels scale to a target on-screen size, so their size in
SHEET units is a function of the viewport: lq tops out at
0.058·1000/(1.65·24) = **1.465**, reached on any window with H/W ≥
0.58 — VEN's own. Measured in the browser at lq 1.087 and scaled up,
the widest block is 0.084 of sheet width half-out against a 0.083
allowance: 0.7% over, a fifth of a grid cell, and the only one that
touches its edge. **Do not size this off a screenshot of one window** —
at lq 1.087 a 5-column box looks generous and overflows by a fifth on
a taller one.

`--debug` now draws that box life-size and asymmetric (one row up,
four down) instead of the old 2x-margin bar, so "the box is clear"
means the text is clear. All four verified on the render: palace and
hamlet on their clearings, complex above the terraces, Jeonju clear of
the compass rose.

### 3. VEN's red line: the block moved up under the building

*"can you make it so that the name is underneath the image where it is
marked in red rather than all the way down where it currently is."*
`CAP_NEAR` 0.006 → **0.02**. At the old weight a slightly quieter
patch five rows further down beat the paper directly under the
landmark; now only real ink is worth walking away for. Namsangol's
block went 0.694 → **0.663**, against a wall bottom at ~0.64.

The frame bound had to learn to **degrade rather than fail**: requiring
the whole block to finish inside the arrival frame (`FRAME_DN`) left
Changdeokgung and Jeonju with no candidate at all, because a big
vignette's own footprint already reaches ~8 rows below its stop — and
no anchor means falling back to under-the-column, the exact placement
part 13's red lines rejected. So the search runs bounded first and
unbounded only if nothing fits. Losing "visible at the instant of
arrival" is a far smaller loss than losing "under the building".

### 4. Phones do not get the sheet, and that is measured

`want` floors at 34px, so lq on a 390px phone is **2.20** against a
desktop's 1.09: the block grows to a quarter of the sheet's width — no
clearing on this map holds that — while its own text falls to about
**7px**. Both fatal, so under 861px (journey.js's own `narrow`
breakpoint) the copy comes off the paper into `.jmap__note`, a strip
under the map, one paragraph per stop.

The strip **cannot ride the writing value**: `wv` saturates at 1 on
arrival and stays there, which is right for ink on a map and wrong for
a strip where all four paragraphs share a bottom edge — past the third
stop you would be reading three notes printed over each other. It is
driven by distance along the road instead (`|u - k|`, `?notespan=`
0.50, so exactly one note is ever up), cached so it does not write a
style per frame.

### What Zico still owes, and it is visible on the page

- **The ticker.** "$XXX" until `CONFIG.token.ticker` is set.
- **Namsangol's steps.** He gave two headings — "How to access Giwa
  chain", "How to swap on Giwa chain" — and no steps. Nothing was
  invented: a guessed bridge or DEX on a token page is the one mistake
  that costs somebody money. The copy says the steps arrive at launch.
- **Jeonju.** He left it blank. An empty `copy` renders name and
  caption only, exactly as before. *(Written in session 14 from the
  brief VEN forwarded on 2026-08-25 — the interlocking-tiles metaphor
  and the culture-and-history line. §9aa.)*

### Open

- **Nothing here has been seen in motion.** The Chrome tab stayed
  `visibilityState: "hidden"` for the whole session (§7's trap —
  frozen rAF, blank captures), through a fresh tab and a resize. The
  hero was screenshotted via `?motion=0`, which draws instantly and
  needs no rAF; the sheet placement was verified on the route debug
  render and by a DOM geometry audit (every block's real bbox against
  the cleared footprint, scaled to worst-case lq). **The narrow strip
  has never been rendered — VEN should look at a phone width.**
  *(He did, 2026-08-25. It was wrong in three ways and §9aa is the
  fix. This bullet is why that section exists — an unrendered layout
  is an unknown layout, however good the geometry audit was.)*
- `?motion=0` shows static mode, which has no map and therefore none
  of Zico's copy — it still shows the old poetic `blurb`s. Only
  reachable by typing the parameter (the OS setting is not honoured),
  so it is a curiosity, not a launch blocker.

---

## 9z. Session 13, part 3 — the uprights got a hand, and the sheet was measured against the prose

Three notes from VEN, and the middle one turned into the session's real
finding.

### 1. "The straight lines look so uniform but the curved lines look so handwritten"

Exactly right, and the cause was geometric, not the ink filter. A bowed
stroke shows its own curvature; a single-arc vertical does not, so
displacement noise on its edge just wobbles a bar of constant width.
Two changes, and both were needed:

- **Every upright is an S now.** It leans out, settles back and
  finishes slightly off where it started — 기's ㅣ, 와's ㅏ stem, ㅗ's
  bar. A hand cannot draw the old path; a ruler cannot draw this one.
- **PRESSURE (`SWELL_A/B/W`).** Each stroke over 46 units gets a
  second, wider pass over its middle 20–80%, sampled off the real path
  with `getPointAtLength` so it follows curves and uprights alike. A
  brush is heaviest where the hand bears down and lifts at both ends;
  one constant width reads as a marker pen however rough its edge is.
  It reveals on the main stroke's progress remapped onto its own span,
  so the nib is never ahead of its own ink. Latin gets it too.
- `feTurbulence baseFrequency` 0.9 → 0.55: coarser noise wanders along
  a long edge instead of fuzzing it.

**`tools/heropng.js` renders the title to a PNG from hero.js's own
`LETTERS`** — flatten the cubics, stamp a disc along them, which is
exactly what a round-cap stroke is. Built because Chrome was dead (see
Open) and worth keeping: letterforms can now be judged without a
browser, the same way `maproute --debug` judges the sheet.

### 2. THE SHEET CANNOT HOLD A PARAGRAPH. Measured, not decided.

VEN, on Namsangol: *"move the whole block of text to the left so that
the right side of the text is no longer overlapping with the
mountains."* There was nowhere to move it to, and finding that out
took a new tool rather than another guess at weights.

**`maproute --why`** dumps the caption-block search: the eight best
candidates per stop with every term broken out, the ink profile of the
band by column, and a cell map of the clearing. Three things fell out
of it, in order:

1. **Mean ink is the wrong objective for a big box.** The placement
   VEN circled scored *clear*: over 78 cells, one ridge cell at 0.6
   against paper at 0.1 moves the mean by 0.006. An average cannot see
   a line clipping a corner. `PEAK_W` 0.8 now scores the worst cell
   too — harmless while the footprint was one caption line, essential
   once it was a paragraph.
2. **The keep-out around the Korean name was a flat 7x6** and it was
   what actually pinned the block: it forbade everything within 7
   columns of the name, so the block sat against that wall with
   mountains on its other side. The name is a narrow column (measured
   1.14 cells half-width, ±4.15 rows at the largest label scale) and a
   block hanging BELOW its foot does not collide with it at all. Now
   the two clear each other sideways **or** vertically.
3. **The arrival-frame bound was a wall and had to be a cost.** At
   Namsangol the clearing is pinched at the top and opens lower down —
   ten clean columns at row 86, eighteen at row 88 — and the bound
   barred every row below `gy0 + FRAME_DN`. `FRAME_W` 0.05/row lets
   the search buy clean paper two rows lower; that is ~70px, inside
   the frame on anything taller than the 1600x689 reference.

And then the arithmetic, which no amount of that could fix: **the
widest box of clean paper under Namsangol's village is SEVEN COLUMNS**
of the 72-column grid, 0.097 of the sheet's width. A caption plus four
lines of copy needs **12 to 15**. No position fixes it, no
line-breaking fixes it, and shrinking the type to fit puts it under
10px on VEN's own window — trading an overlap for something nobody can
read. What *does* fit is the caption alone: one line is three rows
tall instead of six, and a three-row box has twelve clean columns
there.

The prose left the sheet for about an hour on the strength of that,
and **VEN sent it straight back**: *"make it so that the text is back
on the page underneath the name of each location please. I liked how
it was before."* Right call, and part 4 below is how it was made to
work. `COPY_MODE` keeps both: `sheet` is the default, `?copy=strip`
is the note under the map, and phones get the strip whatever the
switch says (the sheet block is sized off the label scale, which
floors at 34px — at 390px wide the block is a quarter of the sheet
across and its own text falls to ~7px).

### 4. The wash was built and thrown away. Fix the collision instead.

A bloom of damp paper was put under each block — paper-coloured, so it
veiled terrain where the block had to overlap and was invisible where
it did not — doubling as the *"fade in like watercolours"* VEN asked
for. He rejected it on sight: *"remove the watercolour effect, I dont
like it."* It is deleted, not switched off, because everything it was
covering for is now fixed at the source. What survives of the
animation is the line-by-line fade: the copy comes up one line at a
time, each a beat behind the one above, finishing with the seal.

**Three placement faults came out of doing it properly**, and two were
real bugs of the same kind — a rule written about an anchor when it
should have been about a box:

1. **PEAK saturates in a tight clearing.** Every 13x6 candidate around
   Namsangol scores the same 0.82, so that term decided nothing and
   `CAP_NEAR`/`FRAME_W` were choosing on closeness alone — parking the
   block in the PINCHED top of the clearing instead of two rows lower
   where the paper is cleaner. `MEAN_W` 4.5 makes a third less ink
   beat two rows of distance.
2. **THE ROAD IS NOT ON THE SHEET.** js/journey.js draws it over the
   top from the very seam this file emits, so the ink field cannot see
   it and the block search walked straight through the footpath —
   VEN, on Changdeokgung: *"move this text to the left a bit so it
   isnt in the footpath."* The NAME search has had a road exclusion
   since the labels were first placed; the block never did. It counts
   as ink now (`ROAD_INK` 0.45, a moderate ridge, over `ROAD_HALF`
   1.6 cells either side).
   **Scoring it as a separate penalty first was wrong and instructive:**
   on its own scale it simply won every time, which shoved stop 1 off
   the corridor and *deeper* into the mountains — the opposite of what
   was asked. Folding it into the field it competes with is what made
   it behave.
3. **The block's EDGES must be inside the arrival frame**, not its
   anchor — the same mistake as the vertical bound, found the same
   way. A window sees 0.606 of the sheet's width at the settle zoom,
   so ±21.8 columns (`FRAME_X`); bounding the centre alone let stop
   1's block hang its last columns off the right of the screen at the
   moment it is meant to be read.

Result: Changdeokgung 0.465 → **0.438** (off the footpath), Namsangol
0.451 → **0.438** (VEN had already called it fine; this is one column,
inside the grid's own resolution), Jeonju 0.354 → 0.396.

### 5. THE GRID CAN BE WRONG AND THE EYE RIGHT. Draw the box.

VEN asked **three times** for Gyeongbokgung's block to move left off
the mountains. Three different metrics said it was already optimal —
local stdev; then dark-pixel fraction (`DARK_T`, added precisely
because stdev fires on mist and pale wash, which is a real improvement
and the reason stops 2-4 landed well); then both with the road folded
in. He was right every time.

**What finally settled it was drawing the block's real text footprint
onto the sheet at native resolution and looking.** At 0.549 the ridge
line runs through the box's right third — exactly what he circled. At
0.514 the box is on clean paper with the ridge just outside it. One
glance, no argument. `tools/mapbox.js` does that, and it is now the
authority whenever the grid and the eye disagree.

Why the grid cannot see it, as far as it was chased: at 72 columns a
cell is 25px, and a thin dark ridge line barely moves any statistic
over 625 pixels, while the mist and hatching to the west move it a lot
without ever crossing the words. **Cell statistics are coarser than
the question.** Three rounds of weight-tuning could not fix that and
should not have been attempted for as long as they were — the render
was available the whole time.

So `BLOCK_X` in tools/maproute.js carries one reviewed override,
stop 1 only, documented at its definition with the evidence and with
instructions to clear it on an art re-roll. It lives in the TOOL, not
in the pasted array, so a re-run reproduces it instead of silently
losing it — and it prints a line when it fires, so it can never apply
unnoticed.

Verified by render for all three blocks that carry copy: stop 1 under
the palace on clean paper, stop 2 below the complex clear of the
footpath and the terraces, stop 3 below-left of the village clear of
both.

### 6. Every em dash is off the page

VEN: *"remove all of these characters — in the whole website and
replace them with other appropriate punctuation, if even necessary."*
Done per sentence, not by find-and-replace: colons where a list
follows, full stops where two clauses were joined, commas where the
aside was parenthetical. `<title>` uses the site's own middot (and
`js/main.js`'s title rewrite had to follow — it matched on the dash).
The three stat placeholders were em dashes too and now read "at
launch", matching the market-cap slot beside them.

**Code comments keep theirs.** "The whole website" is the page; a
mechanical sweep of every comment in the repo would have buried the
real change in thousands of lines of noise. Audited on the BUILD, with
tags and comments stripped: zero em dashes in visible copy, zero in any
string the JS writes to the page.

### Open

- **Nothing in this pass was seen in a browser at all.** Chrome first
  went `visibilityState: "hidden"` (§7's trap), then the extension lost
  its localhost host permission, then the renderer stopped answering
  CDP entirely; after a reload it managed exactly one draw before
  freezing again. The hero was judged on `heropng.js`, the sheet on the
  route debug render, the em dashes on a text audit of `dist/`, and the
  copy's wiring on a DOM check (eleven lines, opacities being written
  per line). VEN is running the site himself on :8137 and marking up
  screenshots, which is the only reason any of this pass could be
  judged at all. **What nobody has seen is the line-by-line fade in
  motion, or the note strip at phone width.** The extension may need
  its localhost permission re-granted.
- `BLOCK_X` in tools/maproute.js holds one reviewed override (stop 1).
  It is the only hand-set number the map's wiring contains. Clear it
  and re-check by render on any art re-roll.

---

## 9aa. Session 14 (2026-08-25) — the copy stopped standing on the map

VEN looked at the journey on his phone, which §9z had asked for and
nobody had done, and drew three red circles on the screenshot: one
round the ridge east of Gyeongbokgung, one round the terraced fields,
one round the mountains above Jeonju. *"add the text in the journey
section and then make sure that it doesnt overlap with any mountains
in the background or anything in the background and none of the
images too."*

Two separate things were wrong, and only one of them was about text
placement.

### 1. The brief grew, and two stops carry the new lines

VEN forwarded what Upbit's own framing says: Giwa is launched by
Upbit, who hold **75% of the Korean market**; **giwa translates to
"tile"**; the tiles are the pfp, the logo and the brand; the official
metaphor is **small tiles interlocking into a strong protective
roof/foundation**; and it all **relates to Korean culture and
history**.

Where each line went, and why it went there:

- **Stop 1, Gyeongbokgung — what Giwa IS.** Rewritten to carry Upbit
  and the market share. It says **"about three quarters"**, not
  "75%": the share moves, the page carries no date, and a round claim
  that ages badly on a token site is worth less than an accurate one
  that does not.
- **Stop 4, Jeonju — what the tile MEANS.** It had been blank since
  §9z ("he left it blank"), and the interlocking-tiles metaphor plus
  the culture-and-history line is exactly what belongs at the END of
  the road rather than doubled up with the Upbit facts at the start.
  Jeonju is also the place on this map that argues it without needing
  to: eight hundred roofs in one valley.
- **"Tiles are the pfp, logo and brand" was NOT written in.** It is a
  fact about the chain's marketing, not about the token, and on the
  sheet it would read as a brand guideline rather than as a note in
  the margin of a map. Say so if it is asked for; it is a deliberate
  omission, not an oversight.
- Stops 2 and 3 are untouched — the charity line and the
  steps-at-launch placeholder are still Zico's words.

Both new blocks are four lines, which is what `CAP_DN` was sized for,
so **no anchor needed re-searching**. Verified rather than assumed:
every label and block bbox was read out of the browser, scaled to the
worst-case `lq` 1.465, and drawn onto the sheet at native resolution
(the §9z `tools/mapbox.js` method). Stops 2, 3 and 4 are on clean
paper at maximum scale; **stop 1's Korean column still grazes the
ridge outline at 1.465**, which is pre-existing and mild — the name
search's footprint in `labelSpot` is a little smaller than the box it
is clearing for. Left alone rather than hand-nudged, because nothing
on this sheet is hand-placed (§9w).

### 2. The phone: the strip was a wash over the mountains

`.jmap__note` was absolutely positioned over the bottom of the map
with a translucent parchment gradient behind it. That is a wash over
whatever terrain happens to be under it — the same thing VEN rejected
on sight in §9z — and on a phone it always has terrain under it,
because the sheet covers the screen edge to edge.

**There is no position that fixes this.** At 390px the whole sheet
width is on screen, so the only clean paper is paper the map does not
reach. And the copy cannot go back onto the sheet at that width: the
block would be a quarter of the sheet across while its own text fell
to about 7px (the arithmetic is in the note above `.jmap__note` in
js/journey.js and has not changed).

So the map now **stops above the note**:

- `.jmap__view` is new — an absolutely-positioned box inset from the
  bottom by `--jnote-h`, holding the camera and the tone layer.
  `measure()` sizes the camera off THIS element instead of the
  sticky, so `cover`, the edge clamp and `FOCUS_Y` are all computed
  against the frame the visitor actually sees.
- `.jmap__note` is a band at the bottom on opaque `--paper` with a
  hairline over it, the four notes stacked in one grid cell so the
  band's height is the tallest of them and never reflows mid-scroll.
- `measure()` publishes `--jnote-h` on `<html>` **before** it reads
  the view, and the order is load-bearing: the view's bottom inset IS
  that variable. There is no circularity — the band is absolutely
  positioned and sized by its own text.
- On anything over 860px the band is `display:none`, `--jnote-h` is
  `0px`, and `view === sticky` to the pixel. Desktop is untouched.

**The bottom-fixed chrome had to step over it.** The CA pill and the
preview bar are fixed to the WINDOW, not to the section, so VEN's
screenshot had the note's last line reading out from behind "coming
at lau…". Both now take `bottom: calc(their gap + var(--jnote-h))`
under an `html.has-jnote` class that `drawMap` toggles with the
entry/exit fade. The devbar rule lives in js/preview.js so it dies
with that file.

### 3. A NESTED CLIP HANGS THE RENDERER — new §7-class trap

The first version of `.jmap__view` had `overflow: hidden` on it. That
is the obvious thing to write and it **froze Chrome outright on
load** — not slow, unresponsive: CDP `Runtime.evaluate` timed out at
45s and screenshots could not be injected. Bisected with `git stash`
to be sure it was the change and not the harness.

`.jmap` already clips the section, and `.jmap__cam` is a 2960×5304
CSS-px layer with `will-change: transform` that `.jmap` puts an entry
MASK over. Wrapping that in a second clip was enough to tip it into
work it cannot do. **The view does not clip, and does not need to:**
the band below is opaque, so the sheet's overhang is covered anyway.

Same family as the two blend dropouts in §7 and the `mix-blend-mode`
note on `.jmap__sheet` — **this layer is far too big to be given any
compositing work that is not strictly needed.** Add nothing to its
ancestor chain without testing the load.

### 4. The English caption came off the sheet on phones

Its anchor is paper that `maproute` cleared at the largest scale a
desktop reaches. A phone is not on that scale — `want` floors at 34px
so `lq` is 2.24 at 390px — so the caption ran across Gyeongbokgung's
own roof AND off the right edge of the screen, in the same frame. It
renders at about 9px there in any case, and the band below now prints
the same name as its heading at a size that can be read. Hidden under
860px; the Korean name stays, because the written name is the whole
point of the labels (§9s part 2).

### 5. LQ_MAX — the contract with maproute, finally enforced

Every anchor on the sheet is a searched patch of blank paper, and the
search was sized for `lq` 1.465 (the arithmetic is above `CAP_W` in
tools/maproute.js). Nothing enforced that ceiling, so a phone drew
the labels half again as large as the clearing they were given — and
**the name written over the ridge in VEN's screenshot is that 53% and
nothing else.** No re-search can fix it, because the sheet is not
being drawn at the size the search was run for.

`lq` is now `Math.min(LQ_MAX, …)`. A ROOF, not a floor: every wider
screen is already under it and is unchanged, so this only ever moves
phones — and under 861px the caption and the copy are off the sheet,
so the only thing it moves is the Korean name.

**LQ_MAX ships at 1.8, not at 1.465, and that is VEN's call** made
with the table in part 8 in front of him: *"this one looks good.
?lqmax=1.8"*. 1.465 is the scale the anchors were cleared for and is
the defensible number; 1.8 is ~28px on a phone against ~23px, and the
ink behind the names goes 5.6% → 7.1% (Gyeongbokgung), 1.1% → 2.4%
(Namsangol), 0.3% → 1.9% (Changdeokgung), 0.0% → 0.0% (Jeonju).
Uncapped — which is what shipped before any of this — those numbers
are 8.7%, 6.9%, 6.5% and 0.6%.

### 6. Knobs added

- **`?lqmax=`** — the label-scale ceiling. `?lqmax=9` is the old
  behaviour exactly, for judging the trade in the browser.
- **`?copy=sheet` now beats the phone breakpoint** (class
  `jmap--onsheet`). It is unreadable there, which is the point: a
  knob that silently does nothing on the one device where the
  question is live is worse than one that shows you the answer.

### 7. QA notes for whoever is next

- **`tools/qa-frame.html` at `s=1` is the only reliable phone
  harness.** Scaled down (`s=0.55`, `s=0.62`) the sheet silently
  fails to paint — bare parchment with the road and seal drawn on
  nothing, which reads exactly like a missing-image bug and is not
  one. Confirmed against a stashed tree. Use `s=1` and scroll the
  OUTER page to see the bottom of the frame.
- **`?glide=0` is what makes the journey scriptable.** With the glide
  on, a `GO(p)` and the reading you take 400ms later are of different
  frames, and stepping backwards never converges inside a script.
  `?glide=0` draws synchronously from the scroll position. Do not
  sweep 30 positions in one loop with it on a phone-sized frame — the
  redraws are expensive enough to look like another freeze.
- **`SYNC()` in the harness lies about the notes.** It makes rAF
  synchronous, and the strip's opacities come back stale (0.001 where
  they should be 1). Use real waits, or `?glide=0`.
- On this machine the browser viewport tops out around 1280×495-551
  and `resize_window` cannot shrink it, which is why the harness
  exists at all (§7).

### 8. "Can the text be larger?" — measured, and the answer splits

VEN asked. It is two different questions with two different answers,
because there are two texts.

**The paragraph in the band: yes, freely, and it now is.** It is off
the sheet, so nothing can be behind it however large it gets — the
band just takes a few more pixels from `.jmap__view`. It was 12.5px
on a phone only because it used to be a wash over the map, where
every extra line was another line over a mountain. That constraint no
longer exists. Now ~15px (`clamp(.92rem, 3.9vw, 1rem)`), heading
.8rem, band ~147px on a 390x844 phone.

**The Korean name on the sheet: no, not without ink behind it.**
Measured by growing each name's real glyph box about its anchor and
counting pixels under `DARK_T` — dark fraction inside the box:

| lq (phone px) | 경복궁 | 창덕궁 | 남산골 | 전주 |
|---|---|---|---|---|
| 1.00 (15px)  | 1.12% | 0.00% | 0.35% | 0.00% |
| 1.20 (18px)  | 3.34% | 0.00% | 0.86% | 0.00% |
| **1.465 (23px)** | **5.57%** | **0.33%** | **1.14%** | **0.00%** |
| 1.80 (28px)  | 7.07% | 1.91% | 2.44% | 0.00% |
| 2.24 (35px)  | 8.65% | 6.48% | 6.91% | 0.64% |

So the shipped cap is already at or slightly past clean for three of
the four. Jeonju has real headroom (clean to lq 1.8); Changdeokgung
has a little; **Gyeongbokgung is on ink at every scale, including
1.0** — the pocket between the ridge and the palace's ground wash is
narrower than three stacked characters, full stop.

Two things were tried against that and both are recorded as negative
results rather than left for someone to re-derive:

- **Moving the name search onto the `dark` field** (the obvious
  unification with the block search). Not an improvement — the note
  above `NAME_HW` in tools/maproute.js has the before/after table and
  why Changdeokgung goes backwards. Reverted.
- **Laying the names horizontally** (`?vlabel=0`, so the box is wide
  and short instead of tall and narrow). Inconsistent: it helps
  Changdeokgung a lot (0.00% clean to lq 1.8) and Gyeongbokgung a
  little at 1.465, but makes Namsangol worse (1.14% → 3.69%) and
  Gyeongbokgung worse at any larger size. Not worth abandoning the
  고지도 vertical convention for.

**What would actually buy bigger names is a bigger clearing in the
art** — Gyeongbokgung's vignette sits too close to the ridge east of
it. That is a `tools/mappatch.js` job on the sheet, not a code
change, and it is the only lever left. `?lqmax=1.8` is one parameter
away if a few percent of ink behind two of the names is acceptable;
the table above is what it costs.

### 9. The seal got a single source (and stayed 韓)

VEN asked what the seal reads and whether it could say something
relevant. It read 韓 — "Han", Korea — chosen back when the site was
called HANOK and the token had no name.

The answer that survived is **architectural, not typographic**: the
glyph now comes from `CONFIG.token.seal` in js/config.js instead of
four hard-coded copies that could drift. config.js is the first
script on the page, so it resolves `?seal=`, sanitises it (it reaches
innerHTML in js/journey.js and a URL parameter is anyone's to set —
angle brackets, quotes and slashes come out, length capped at two),
and publishes `--seal-glyph` and `--seal-scale` for the CSS seals,
which cannot read a query string themselves. A two-character seal is
set side by side at 0.62, which is how a two-character 도장 is cut.
**The favicon in index.html is still a hand-kept copy** — it is a
static data-URI in the `<head>` and making it dynamic would cost a
favicon flash on every load.

The glyph itself went 韓 → 瓦 → 韓 inside one session. 瓦 is exactly
right by meaning and wrong by shape, and looking settled it in one
glance: `tools/seal.html` (new, dev-only, never ships) stamps every
candidate at 46/34/30px on the site's own paper. Keep it — the next
person to ask this question should look rather than read.

### 10. Still Zico's

Unchanged from §9z except Jeonju, which is now written: **the
ticker**, and **Namsangol's bridge and swap steps**. Nothing invented
there, for the same reason as before.

---

## 9ab. Session 15 (2026-08-27) — the mountains make way for the words

VEN, with the same three red loops from his 2026-08-25 phone
screenshot (the ridge east of Gyeongbokgung, the terraced fields, the
range south-east of Namsangol): the copy was *"ok"* according to Zico,
*"but this would most likely require us to edit the background in
order to make a little 'space' where the background IMAGE fades out to
make space for the text and only leave the background colour (that
being the old paper texture) ... it MUST be done in the parts of the
screenshot marked in red."*

It is done, and it is done in the art, not with a wash: inside each
loop the ink and the watercolour dissolve into bare parchment — the
way a 산수화 lets a ridge vanish into mist — and the text sits on the
paper that is left. Phones got the sheet back in the bargain, because
for the first time there is paper on it that can hold a paragraph.

### 1. `tools/mapclear.js` — fade the terrain to paper, deterministically

Not OpenArt. §9x's rule stands: image2image re-renders the whole page
and moves every measured thing on it, and "erase these mountains"
would have cost credits and a re-route for a result that could not be
tuned. This tool is ~450 lines of zlib-only Node like the others, and
it touches nothing outside the loops (the diff against its input is
zero there — checked, and it is the check to keep running).

How the paper under a mountain is made, since there is no paper layer
to reveal: **tone** (a normalised blur of the pixels that are quiet,
bright, paper-COLOURED parchment, behind which a harmonic fill
interpolates across the wide places) plus **grain** (the residual of
the sheet's own quiet paper against its local mean, tiled over the
clearing in overlapping raised-cosine windows at random offsets and
flips). Three things had to be learned to get the tone right, each
the reason for a knob:

- **The washes are not paper.** A plain colour-distance test let the
  pale violet and green washes through and tinted the first cleared
  cores pink. Chroma separates them: the parchment sits in a tight
  band with G a shade under the mean of R and B and R−B between ~30
  and 50 (`CHROMA_*`, `WARM_*`, measured on the sheet).
- **A mountain's shaded flank is not paper either.** It is smooth,
  bright and warm enough to pass every test above, and pinning the
  fill to it left a beige cloud in the middle of each clearing. Paper
  is what has no stroke anywhere near it: the mask is eroded
  `INK_CLEAR` (28px) from every ink pixel first.
- **A wide blur reaches the wrong places.** 220px ×3 pulled the
  coast's darker margin into the middle of the sheet. The harmonic
  fill (`FILL_S`/`FILL_IT`) takes the paper on every side of a ridge
  and nothing further.

Checked numerically as well as by eye: the mean colour of the cleared
cores against a ring of original paper around them is 240/220/201 vs
238/217/200.

**`--keep <plain.png>` protects the landmarks**, found the way maproute
finds the stops — a 32px cell that differs from the plain sheet by
`KEEP_DIFF` **and was quiet paper in the plain sheet** (`KEEP_QUIET`;
mappatch's rule, §9x). The second test is essential: without it the
re-stroked mountains counted as landmarks too and came back through
the fade in blobs. It is what lets Jeonju's loop hug its village.

The loops are `tools/clearings.json` — VEN's markup traced into
normalised polygons — **the one hand-drawn thing in the map's wiring**
apart from `BLOCK_X` (now empty, see 3). Two of his loops clipped a
vignette (the walled house's east third, the pond pavilion) and were
pulled off them; the second loop was extended over the WHOLE terrace,
because a half-faded terrace read as a smudge where a half-faded
mountain reads as mist. The edge is `FEATHER` 170px on the 3072px
master with a wandering boundary (`EDGE_NOISE`); the ridge's crest
east of the palace stays and its flank dissolves downward, which is
the look.

### 2. Jeonju got a fourth loop, and VEN did not draw it

On a phone, Jeonju's note had nowhere clean to go: south of the
village is eight rows of paper between the village and the sheet's
foot, the road cuts through it, and the only clean rectangle the
search could find was under the compass rose at the sheet's very
edge. So the range between the village and the coast is faded too
(loop 4), and Jeonju's phone box sits there. **Flagged to VEN as the
one thing he did not mark**; it is one line of clearings.json and a
re-run of the four commands in README to drop it. The cost is visible
on the sheet: loops 3 and 4 meet, so the east side is one long mist
bank from Namsangol to Jeonju.

### 3. maproute learned the clearings

- `--terrain <png>` carves the ROAD on the pre-clearing sheet. Bare
  paper is exactly what the seam hunts for, and cleared paper is
  reserved for text; carved on the cleared sheet the road would have
  wandered into it. The emitted path is within one cell of the
  shipped one everywhere (two cells at the sheet's foot, below
  Jeonju) — the shipped one is kept, since the seal nudges were
  measured against it.
- `--clear <json>` confines each stop's block search to its loop
  (inset `CLEAR_INSET` 2.5 cells, which is where the feather is fully
  clear), measures nearness to the landmark on both axes, and falls
  back to the band under the landmark when the loop cannot hold the
  desktop block — Jeonju's cannot (eight columns inside its inset, the
  block wants thirteen), so its desktop block is unchanged at
  0.396,0.934.
- **The arrival-frame bound became a span rule.** "Block within ±21
  columns of the seal" pinned stop 1's block onto the footpath: its
  clearing lies east of the road at 0.50, and a block centred under
  0.55 cannot clear it. The rule is now "seal and block together
  span at most the frame" (`SEAL_HW`), because the camera frames them
  together now (5).
- **A phone box per stop** (`MAP_CLEAR`): the largest clean
  rectangle in the loop — under `PHONE_DARK` AND `PHONE_SOFT` (a
  second field, the share of a cell under luma 196, which sees the
  ghost of a ridge at the feather where the dark count cannot), off
  the road by `ROAD_HALF + PHONE_VERGE`, off the name, off the
  landmark, paragraph-shaped (`PHONE_ASPECT_*`), near the landmark
  (`PHONE_NEAR`). Inset only `PHONE_INSET` 1.0 — the 2.5 cost five
  cells of a twenty-cell clearing. `--why` prints the search as a
  cell map of what stopped it.
- `BLOCK_X` is empty: the ridge stop 1's override stepped off is
  gone.
- **`PHONE_INSET` is declared next to `polyMask`, not with the other
  PHONE_ knobs.** Read before its `var` was assigned it was undefined,
  the inset went NaN, the mask came back empty without a word and the
  search fell back to a window capped at road+24 columns. DARK_T's
  trap, third time.

Results (art/journey/map-ink.png, grid 72×129): blocks 1-3 moved into
their loops — 0.514,0.174 → **0.688,0.205**; 0.438,0.446 →
**0.660,0.415**; 0.438,0.678 → **0.688,0.709** — all with mean and
peak ink 0.000. Stops and name anchors unchanged to ±0.001.

### 4. Phones: the copy is back on the sheet, re-flowed into its box

`.jmap__note` is no longer the phone's home; it is `?copy=strip` and
the home of sheets that have no boxes (`?map=solid`, pirate).
`measure()` decides `.jmap--strip` from the width and the sheet, and
there is no breakpoint in the CSS any more.

The phone block is **not the desktop block drawn smaller** (that was
7px, §9y). `setPhone` re-flows caption and copy to the box's width
(text measured on a canvas in the display face; `document.fonts.ready`
re-measures) at the largest size from `PTEXT` 11 down to `PTEXT_MIN`
8.5 at which the whole note fits the box's height, centred, hung
from the box's top edge so it sits nearest the landmark. The caption
is a heading on a note here — 0.82 of the copy, tracking eased to
.12em, wrapped when it must ("NAMSANGOL HANOK / VILLAGE") — and it
has no writing mask: it fades in as the first line. `setDesk`
restores the desktop markup on resize.

**`PHONE_ZOOM` 1.9, not ZOOM_IN's 1.65 and not 2.0.** The box is a
fixed patch of sheet and the words a fixed size of screen, so the
settle zoom sets how many lines fit: at 1.65 stop 2's nine-row box is
81px tall and holds nothing readable. 2.0 was measured and rejected
for one reason — at Jeonju the name stands west of the seal and the
note east of it, 393px across on a 390px phone, and the name lost its
first strokes off the left edge however the frame was placed. At 1.9
the notes come out 11 / 9.5 / 11 / 9.5 px with 17px to spare at the
widest stop.

### 5. The camera frames seal, name and note together

With the blocks in the clearings they stand further from their seals
(stop 1's a third of the sheet east of the road), and a seal-centred
camera cut the note at the moment it is meant to be read. `camAt`
now pulls, on the same approach weight it always used, onto the road
point shifted by `frameOff[k]`: the midpoint of seal, name and note
(each with a margin, `SEAL_M`/`NOTE_M`), moved only as far as keeps
their bare extents on screen, and — when even those are wider than
the frame — splitting the difference rather than favouring the seal.
Two versions were wrong first: a clamp on the seal alone
(`FRAME_EDGE_X`, now gone) put Jeonju's name off the left edge, and
the midpoint without a note margin put Jeonju's last letters one
pixel past the right. Down, the seal keeps to the middle 40%, so the
landmark stays in the picture on a short desktop window where the
note is below the fold at arrival anyway (§9w part 14's caveat, still
standing). `?frame=0` is seal-centred.

### 6. The line-by-line fade never showed, and now does

`drawMap` staggered the copy lines by setting an `opacity` ATTRIBUTE,
and `css/site.css` gave the same elements `opacity: .78` by class. A
class rule beats a presentation attribute, so every line stood at .78
from the moment the group was displayed; "nobody has seen the
line-by-line fade in motion" (§9z) was true because there was nothing
to see. It writes inline style now (`COPY_OP`/`CAP_OP` multiplied in,
the CSS value removed), and the stagger `step` tightens for the
phone's nine lines so the last lands before the seal. Measured
mid-approach: 0.72 / 0.55 / 0.36 / 0.18 / 0.04 / 0 across six lines.

### 7. What was seen, and how

The phone harness (`tools/qa-frame.html?w=390&h=844&s=1`, `?glide=0`)
gave real screenshots of stops 1-3 — seal and name beside the
building, the note on bare paper in the clearing, the ridge
dissolving above it — with a new trap: **the first screenshot after
any change to the camera or the outer scroll times out at 30s
("renderer may be frozen"); the second attempt, standalone, works.**
Batching a change and a capture fails every time. The desktop harness
at 1280×800 did not paint the sheet at all (§7's layer dropout at a
2112×3784px layer), so desktop placement was verified by the DOM
audit — every seal, name and block inside the frame at all four
stops, stop 3's block bottoming at y 707 — and by the route render.
Jeonju on a phone is verified by the DOM audit and the render only.

### 8. "Resize the text so that it fits nicely in the new gaps"

VEN, on seeing it: *"okay that is good BUT can we resize the text so
that it fits nicely in the new gaps/clearings that we created?"* Two
things were small about it. The phone fit only ever stepped DOWN from
11px, so a box with room to spare still got 11; and the desktop was
still drawing the old label-scale block — four authored lines at
~14px in a clearing a thousand pixels wide.

- **The fit is for every device now** (`setBlock`, was `setPhone`).
  A phone caps at `PTEXT` 13; a wider screen at `DTEXT_K` 0.014 of its
  width (18px at 1280, 22 at 1600) up to `DTEXT_MAX` 24, `?dtext=` to
  pin. On a desktop the caption is one line, so its handwriting mask
  is rebuilt at the fitted size and it still writes; a wrapped
  caption (phones) fades as the first line.
- **The box is scored by the type size the copy can reach in it**,
  not by area. Area preferred 14x20 at stop 1 when 19x16 was there;
  a paragraph wants width. maproute lifts each stop's copy length
  from js/journey.js (`COPY_N`, `--copy` overrides) and finds, per
  candidate, the largest size in cells at which that many characters
  re-flowed to the box's width fit its height — the same arithmetic
  setBlock does on the page — and takes the best. Verge 0.2, inset
  0.6, soft 0.13, to stop giving cells away.
- Phone results: **13 / 10 / 13 / 9.5 px** (was 11 / 9.5 / 11 / 9.5).
  Stops 2 and 4 are loop-limited — nine rows above the range, eleven
  columns between village and coast — and only a bigger loop moves
  them. Desktop at 1280x551: 17.9px, four to seven lines, every note
  inside the frame at arrival.
- **The vertical framing counts the landmark**, and when a short
  window cannot hold landmark and note together, the seal's side
  wins. Before that, the midpoint cut 창덕궁's first stroke off the top
  of a 551-tall window. `LAND_H` 80 units either side of the seal
  stands in for the vignette's extent (every one sits roughly centred
  on its stop).

### 9. "Scale up the text a bit so that it fits a bit better in each indentation"

VEN, on the fitted notes: *"can you scale up the text a bit so that
it fits a bit better in each indentation/clearing that we made but
make sure to start a new line wherever necessary because we dont want
it to overflow."* The fit was wrapping to a RECTANGLE inside each
clearing, and a clearing is not one: east of the road at stop 1 the
paper is 20 cells wide on the lower rows and 15 at the top, and the
box took the narrower width for every line.

- **maproute emits the clearing's shape**: for every grid row of the
  loop, the widest run of usable cells on the box's side of the road
  (`MAP_CLEAR[k].rows`, from `top` down, `dy` a row). The box stays
  as the fallback and the extent the tool reports.
- **setBlock wraps every line to the rows it sits on** — the
  intersection of their runs — and centres each line in its own run.
  The note follows the mist's edge: wider where the paper is wider,
  shifting with it; a band whose rows carry no run is skipped, so
  nothing ever lands on ink. The caption starts on the first row
  (in the clearing's upper half) that holds it whole, and wraps only
  where none does — taking the first row that fit a single word set
  "JEONJU / HANOK / VILLAGE" on three lines on a desktop and cost the
  caption its handwriting.
- Phone caps at `PTEXT` 15 now, desktop at `DTEXT_K` 0.016 (20.5px at
  1280) up to 26; verge 0.2, inset 0.4, soft 0.15, pad 4, leading 1.4.
- **Results, phone 390x844:** 15 / 12.5 / 15 / 12.5 px (was 13 / 10 /
  13 / 9.5). Desktop 1280x551: 20.5px at all four, the captions on
  their masks, every seal, name and note in frame.
- The last line of a greedy wrap can be a single word ("one."). Left
  as is; balancing the last two lines is the obvious next step if it
  reads as a widow.

### 10. The hand: a handwriting face, the note writes itself, the path shows

VEN, with a desktop screenshot at stop 1 (a 960px-wide window — a
1920 screenshot at 2x): *"i want the text to be a bit larger, I want
the gaps between each line of text to be a bit larger (in order to
simulate handwritten content) and i want a handwritten font and
rendering animation to be applied to all text in the journey
section. also ... the 'path' ... is not visible, make it obvious
where the path is or reduce the size of each clearing."*

- **The hand.** First pick was Nanum Pen Script on every word
  including the Korean names; VEN, on sight: *"I dont like this
  'handwritten' font, try another one. and revert the font of the
  korean characters please."* So: the Korean names are Song Myung
  again (the scribble mask never cared which face), and the ENGLISH —
  caption and note — takes one of three Latin hands from the same
  Google Fonts link as the serifs: `--font-hand` **Caveat** (default),
  `--font-hand-2` Kalam (`?hand=kalam`), `--font-hand-3` Patrick Hand
  (`?hand=patrick`); `?hand=0` is the serif for the English too. Song
  Myung sits second in each stack so the 기와 inside the note still
  has a Hangul glyph. In the hand the caption is a line of the same
  hand a shade larger (PCAP 1.05, tracking .02em, written as the
  place is named, not small caps), and the lines sit 1.65 apart
  (`?leading=`; 1.75 was tried and cost the phone's shallow clearings
  a size). The eyebrow "여정 · THE JOURNEY" is section chrome like
  every other section's and is left alone. Desktop 28px at 1280, 21
  at 960; phone about 13–16px, the loop-limited stops at 11.
- **The note writes itself.** One mask per block: a stroke along
  every line in reading order, caption first, each its own subpath
  (dashing continues across subpaths, and a subpath per line means
  the reveal never sweeps a diagonal between lines). One dashoffset a
  frame — the Korean name's cost, not a mask per line, which is what
  made the line fade the cheaper choice in §9y. It starts half-way
  through the name and takes the rest of the approach; `WRITE`
  0.085 → 0.11 so it has the road to do it in. `?fade=1` puts the
  line-by-line fade back.
- **Larger.** The desktop cap follows the window's width, and VEN's
  is 960px across, so he was getting 15px. `DTEXT_K` 0.016 → 0.022
  (21px at 960, 28 at 1280, 30 at the cap), phone `PTEXT` 15 → 18 in
  the hand (its glyphs are narrower and lighter than the serif's).
  **The start row is searched as well as the size:** hung from the
  clearing's top, stop 1's note began at the narrow tip of the wedge
  under the ridge; the wide paper was ten rows down. Every start row
  is tried for every size from the cap downward, and the first size
  that fits anywhere wins, at its highest start.
- **The path.** The clearings stay. Footsteps .42 → .66 and a fifth
  larger, with the dotted road drawn faintly under them
  (`.jmap__road--under`, .2) — `?trail=steps` is the prints alone
  (the previous default), `?trail=dots` the line alone.

### 11. The pipeline inverted: the note first, the clearing cut to it

VEN, with a desktop screenshot of the shaped note under the ridge:
*"keep the original font, just make it fit in the clearings properly
... make it so that there is a uniform gap between the edge of the
clearing and the edge of the block of text, if the clearing is too
big (ie too much blank space) reduce the size of the clearing and
restore the original background in those locations. I want a uniform
block of text, i dont want parts of the text sticking out."*

That is a cleaner rule than any of the fitting above, and it inverts
the order of things. **`tools/mapnote.js` (new)** lays each note out
FIRST — the copy wrapped to one measure in the display serif, the
caption above, at a size fixed in SHEET units so it is the same block
on every device — and cuts the clearing to that block plus one
constant `MARGIN` (24 units), as a rounded rectangle. Everything
outside is terrain again (the loops cover 10% of the sheet, from 19%).

- The note is placed inside the loop VEN drew — those are
  `tools/clearings-search.json` now, the SEARCH areas — as high in it
  and as near the road as it fits, off the road, the landmark and the
  name. `maproute --clear clearings-search.json --plan --shape-out
  tools/shape.json` supplies the usable rows (`--plan`: ink is
  ignored, the loop has not been cut yet). Sizes come out 16 / 13 /
  17 / 12 units: the corridors east of the road are narrow (~200
  units at stop 1 less two margins), so the measures are 20–26
  characters and the blocks tall.
- The wrap here IS the page's wrap: the words' widths in Song Myung
  are in `tools/songmyung-widths.json`, measured with canvas
  measureText in the browser (a word not there is 0.44em a
  character). LH 1.5 in the tool and `COPY_LH` in journey.js must
  agree, or the block runs past its clearing.
- `MAP_CLEAR` is now `{ box, fs }` per stop — the text block and its
  size — and `setBlock` simply wraps to the box's width at `fs` and
  centres the block in it. On a wide window `DTEXT_MAX` (32px) caps
  the size and the block sits centred a little smaller. No shape
  rows, no start-row search, no device-specific fitting any more.
- mapclear's `FEATHER` 170 → 70: the ramp has to sit inside the
  24-unit margin or the text lands on it.
- `PHONE_ZOOM` 1.9 → 2.0 (2.1 was tried: Jeonju's name and note no
  longer fit one frame), and Jeonju's measure is capped at 20
  characters (`MEAS_CAP`) for the same span. Phone: about 12.5 / 10 /
  13 / 9.4 px; VEN's 960px window: 25 / 21 / 27 / 19; 1280: 32 /
  27.5 / 32 / 25.
- **The serif is the default again** (`HAND` "0"); Caveat, Kalam and
  Patrick Hand stay behind `?hand=`. The note still writes itself.
- The framing publishes its inputs on `.jmap[data-frame]` for QA.

The trade this makes, and VEN should know it: the block is one size
in sheet units, so a phone reads it small (the two loop-limited stops
at ~10px) and a short desktop window reads a tall column whose last
lines arrive on scroll. The clearings could not be both tight on a
desktop and roomy for a phone; his ask was the desktop's.

### 12. A fifth smaller, tighter, one set of prints

VEN: *"scale down all of the english text in the 'the journey'
section and make sure the clearings scale down to appropriately hold
that now smaller text, also reduce the gaps between each row of text
slightly, it looks too dispersed. Also make it so there is only one
set of footsteps, do not edit the footsteps and keep the original
larger ones."*

- `SIZE_CAP` in mapnote (`--sizes`): each stop's ceiling a fifth
  under what it had — 13.5 / 11 / 13.5 / 10 units (from 16 / 13 / 17
  / 12). A common cap alone would not have moved the two narrow stops,
  which never reached it. With the smaller type the wide corridors
  take a wider measure: stops 1 and 2 are 36-character blocks of
  1+5 lines now, squat rather than tall. LH 1.38 in both tool and
  page (1.5 "looks too dispersed"). Re-cut, re-prepped: the loops are
  ~6% of the sheet.
- The "second set of footsteps" was the dotted road drawn under the
  prints in part 10. `TRAIL` defaults to `steps` — the prints alone,
  at the size and weight they have had since part 10; `?trail=foot`
  is prints over dots, `?trail=dots` the line.
- `PHONE_ZOOM` 2.0 → 2.1 (Jeonju's name and note span 475 units now).
  Phone: about 11 / 9 / 11 / 8.2 px — small, and the desktop's ask.

### 13. The English names back under their buildings

VEN: *"move the ENGLISH names for each location back underneath the
corresponding image, add a mini 'clearing' behind each name if
required."*

- `maproute --caption`: the block search places the caption ALONE
  (footprint CAP_W by one row up and down, the band under the
  landmark, not confined to the loop) and writes its anchor as
  elements 5+6 of MAP_STOPS — what they were for in part 14 — and
  the darkest REAL ink under it (the road-verge penalty excluded) to
  `--shape-out` as `cap.peak`. Anchors: 0.563,0.190 / 0.410,0.446 /
  0.424,0.678 / 0.438,0.934.
- mapnote cuts a small loop behind a caption only where `cap.peak`
  is past `CAP_INK` 0.03 — Gyeongbokgung's (0.10, the ridge's toe);
  the other three sit on the ground wash as they are, which is what
  "if required" means. The note blocks are the copy alone now
  (shorter: the loops are 6.5% of the sheet).
- On the page the caption is its own group again (`ge`, the wavy
  writing stroke it was built with) at a fixed sheet size `CAPU` 9.5
  (= `CAP_SIZE` in mapnote), and the note is a new group `gn`
  (`.jmap__block`) that setBlock fills, with its own mask `nmp`.
  **Not `.jmap__note`** — that is the band's class in css/site.css
  and its `display: none` took the whole note with it, silently.
  The framing counts the caption's box.
- A phone reads the caption at ~8px. It is a label under a building
  beside a 28px Korean name; the note has no heading there now.

### 14. A tail on the road, and Gyeongbokgung's caption by hand

VEN, two screenshots: Jeonju's caption washed out at the end —
*"extend the 'the journey' section vertically enough so that this
name is rendered properly"* — and Gyeongbokgung's caption: *"move it
up and to the left a bit (ie closer to the bottom of the image)"*.

- **The tail.** The road ended exactly where the pinned scroll did,
  so the last stop was reached at the instant the section began to
  unpin and its caption faded with the trailing edge (the exit
  dissolve, part 11 of session 12). Four rounds with VEN settled it:
  a hold on Jeonju (not enough — on his ~400px-tall window the
  village, caption and note together are as tall as the frame, and
  the caption landed under the market-cap bar); a walk on down the
  road to the sheet's foot ("you extended it a bit too much"; a
  quarter of it, "no its still too long"); and then the screenshot
  that said what he meant: the END STATE of the full walk was right —
  the village risen up the screen, the name clear beneath it — but
  the road inking on past the village was not ("dont worry about
  extending the footpath, that is irrelevant. Just the background").
  So: `TAIL` 0.06 (30vh of 490), and in it `timelineU` returns
  u > N-1 and `lenAt` carries the CAMERA down the rest of the road
  (`TAIL_WALK`; the zoom and the framing offset held at the stop's),
  while drawMap holds everything the road drives — the inking, the
  walker, the prints, the names and seals — at the last stop
  (`walked = min(camLen, STOP_LEN[N-1])`). `.journey--map` 560 →
  590vh so the legs kept their 460vh. **`TAIL_WALK` is 0.1, VEN's
  number, set by eye with the knob** (*"walk = 0.1 is enough"*): a
  tenth of the rest of the road, about 25 units of sheet. `TAIL` 0.06
  he left as it was (*"tail i dont understand it so just dont change
  whatever value its at now"*). `?tail=0` is the old ending, `?walk=`
  how far the camera goes.

### Where things stood when VEN went to sleep (end of session 15)

Everything above is LIVE at tilesongiwa.com (last push: the walk at
0.1). No open asks from VEN. What the next session inherits:

- **The pipeline** for any change to a note (copy, size, leading,
  margin): README's THE CLEARINGS, five commands, then paste
  `MAP_STOPS` (caption anchors) and `MAP_CLEAR` (note blocks) into
  js/journey.js. `SIZE_CAP`, `LH`, `MARGIN`, `CAP_SIZE` in
  tools/mapnote.js are the knobs; `COPY_LH` and `CAPU` in journey.js
  must match `LH` and `CAP_SIZE`.
- **The reviewed overrides**, both in tools/maproute.js: `CAP_XY`
  (stops 1 and 3), `BLOCK_X` (empty). Clear on an art re-roll.
- **The masters**: `map-ink-master-clear.png` (shipped) and
  `map-ink-master-plain-clear.png` (the `--base`), both regenerable
  from `-nams` / `-plain` + tools/clearings.json. Still gitignored,
  still not backed up anywhere.
- **Phones** read the same blocks ~2.5x smaller (about 11 / 9 / 11 /
  8 px, captions ~8px). VEN judged everything on his ~960x400 CSS
  desktop window today and has not looked at a phone since the
  clearings were cut to the blocks. If he does, the honest levers are
  `SIZE_CAP` (bigger blocks, bigger clearings) or `?copy=strip` (the
  band).
- **Still Zico's** (unchanged all session): the ticker, Namsangol's
  bridge and swap steps, the CA. LAUNCH DAY below is the list.
- **`CAP_XY` in maproute**: the caption anchor's reviewed override,
  BLOCK_X's contract — stop 1, 0.563,0.190 → 0.535,0.178, the ink
  under it measured there (0.138, so its small clearing moved with
  it); then stop 3, 0.424,0.678 → 0.424,0.664 (VEN: "move namsangol
  village up a little bit, i feel like it is a bit too far down"),
  which put it over the ground hatching at the wall's foot (0.077)
  and earned it a clearing of its own — the wall itself is held out
  by --keep. Six loops now. Cleared on an art re-roll like the rest.

### Files

- `tools/mapclear.js`, `tools/clearings.json` — new.
- `tools/mapnote.js`, `tools/clearings-search.json`,
  `tools/songmyung-widths.json`, `tools/shape.json` — new (part 11).
- `map-ink-master-clear.png` — **the shipped master**;
  `map-ink-master-plain-clear.png` — **the `--base` now**. Both cut
  from `-nams` / `-plain` by the same json; regenerable. Gitignored
  like every master; still no backup.
- `art/journey/map-ink.png` — re-prepped (2.9MB);
  `art/journey/map-ink-solid.png` — the previous shipped sheet, kept
  for `?map=solid` and as `--terrain`.
- The four commands, in order, are in README under THE CLEARINGS.

### Open

- **VEN has not seen it.** Everything above was judged on the harness
  and the render; the phone screenshots are the strongest evidence
  and Jeonju's has none. `?map=solid` is the sheet before, on the same
  URL, for the comparison he will want.
- Loop 4 (Jeonju) is his to keep or drop.
- `?pzoom=`, `?ptext=`, `?frame=` are the knobs if the phone reads
  too close, too small, or the seal too far off centre.
- The English caption under the phone's block has no writing mask;
  if the hand-written caption is missed on phones, `setPhone` is where
  it would go back, at the cost of a mask re-rasterisation per line.

---

## 9ac. Session 16 (2026-08-28) — Zico's long copy, and the two notes that grew

VEN pasted two blocks of copy separated by a rule of dashes: *"That
whole block of text should be in the first and second location only,
the partition between them with the dashes represents where the first
one ends and the second one starts. Can this be added but then also
they do look quite long so if needed scale down the text a bit, most
important bit is just making sure that the clearing in the background
wraps the text properly."*

They ARE long. Stop 1 goes from 170 characters to **555**, stop 2 from
150 to **664** — three and four times what those notes held. Stops 3
and 4 are untouched, to the thousandth.

### 1. Two bugs found on the way in, both of which overflow a clearing

Neither was visible with the old copy. Both would have bitten hard
with this one, and both are exactly the failure VEN named.

- **`tools/mapnote.js` ate the copy's commas.** It joined the `copy`
  array's lines by replacing every comma-plus-space with a space —
  which hits the commas INSIDE the prose too. So the tool planned the
  wrap over `Upbit` while the page drew `Upbit,`; every comma-bearing
  word then missed the widths table and fell back to an estimate. It
  survived because the old copy had five such words across four notes.
  The new copy has thirty. Fixed to take the quoted strings.
- **`fallbackEm` was a hand-written `0.44`.** The mean width of a
  character across the words that had actually been measured is
  **0.486** — the guess was 10% low, and low is the direction that
  wraps to fewer lines than the page draws, i.e. text past the paper.
  Recalibrated, and the file now says where the number comes from.
  `MEAS_CAP` is a width written as a character count, so Jeonju's 20
  became **18** to keep the same measure; its block comes back
  byte-identical to session 15's.

### 2. `tools/widths.html` — the widths are measured, not guessed

The words' widths had only ever been measured by hand in a console,
so any new copy arrived estimated. **`tools/widths.html` (new)** reads
the copy out of js/journey.js with the same lift mapnote uses,
measures every word with `measureText` at 100px in the real face —
the same call `textW` in journey.js wraps with — and **POSTs the
result back over `tools/songmyung-widths.json`**. `tools/serve.js`
gained a write endpoint for that one path and no other (405 on
anything else, 400 on non-JSON). One page open, no clipboard step.

`tools/mapnote.js` now prints a loud `!` line listing any word it had
to guess, so a stale widths file announces itself instead of quietly
costing a line.

**This has not been run yet** — the Chrome extension was not connected
this session (`list_connected_browsers` → `[]`), so the blocks below
are planned on the recalibrated 0.486 estimate for the 115 words of
new copy. Open `localhost:8137/tools/widths.html` once and re-run from
mapnote; expect the boxes to move by a line or so.

### 3. Stop 2's loop had to grow, and there was no version where it did not

At VEN's own loop, **nothing fit at any size down to 8 units** — 664
characters need roughly a 250x270-unit rectangle and his loop's
largest inscribed one is 167x250. The loop is walled: the road on the
west, the coastline's wave pattern on the east, stop 1's loop above
and stop 3's below. It was widened to the last of that room —
`clearings-search.json` stop 2 — east to the cliff, north to 0.348,
south to 0.584. That buys 9 units and not a half more; the terraced
hill east of the road is mostly gone, its western contours kept.

Stop 1 fits inside VEN's original loop, untouched, at 10.5.

### 4. What it costs, stated plainly

- **Sizes 10.5 / 9 / 13.5 / 10** (from 13.5 / 11 / 13.5 / 10). On a
  phone that is about **8.6 / 7.3 / 11 / 8** px — the first two notes
  are now the smallest type on the sheet, and stop 2 is smaller than
  anything shipped so far. This is the "scale down the text a bit"
  VEN authorised, and it is the whole of the room available.
- **Blocks of 16 and 18 lines** where every other note is 4 to 10.
- **The loops are 10.15% of the sheet**, from ~6%. Two large panels of
  bare parchment in the upper half, roughly 220x275 and 205x270 units.
  `?map=solid` is still the sheet before any of it.
- The stops come back at 0.341/0.120, 0.492/0.360, 0.623/0.601,
  0.375/0.857 — within a thousandth of what js/journey.js carries, so
  the road, the label anchors and the seal nudges all stand and
  `stops` was not re-pasted.

### 5. Not done, and deliberately

- **The ticker.** Zico's block 2 writes `$TILES` literally, and
  `tilesongiwa.com` says the same, but `CONFIG.token.ticker` is still
  `null` so the hero, the `<title>` and the manifesto still read
  `$XXX`. The sheet now says `$TILES` three times while the hero says
  `$XXX`. One line in js/config.js when VEN confirms it.
- The manifesto is still placeholder copy.
- **VEN has not seen this rendered.** No browser this session: the
  evidence is the sheet PNG with each planned line drawn at its true
  width inside its clearing, which is what the clearings were checked
  against.

### 6. THE ONE OUTSTANDING STEP — do this first next session

The widths were never measured for the new copy, because the Chrome
extension was not connected (`list_connected_browsers` → `[]`). The
blocks below are planned on the recalibrated 0.486 estimate for 115
of the copy's words. **Everything else is finished and consistent;
this is the only loose end.**

```
node tools/serve.js                       # if it is not already up
# open http://localhost:8137/tools/widths.html  — once, that is all.
# it measures and POSTs itself over tools/songmyung-widths.json
```

Then re-run steps 2–5 of README's THE CLEARINGS (step 1 does not
depend on the copy, and `tools/shape.json` is current):

```
node tools/mapnote.js tools/shape.json
node tools/mapclear.js map-ink-master-nams.png map-ink-master-clear.png \
     --clear tools/clearings.json --keep map-ink-master-plain.png --debug
node tools/mapclear.js map-ink-master-plain.png map-ink-master-plain-clear.png \
     --clear tools/clearings.json
node tools/mapprep.js map-ink-master-clear.png art/journey/map-ink.png 1800
node tools/maproute.js art/journey/map-ink.png --base map-ink-master-plain-clear.png \
     --terrain art/journey/map-ink-solid.png --clear tools/clearings.json --debug
```

Paste the new `MAP_CLEAR` over `MAPS.ink.clear`. Expect stops 1 and 2
to move by a line or so.

**Expect stops 3 and 4 to move a little too, and put them back.**
Their words are all already measured, but the wrap TARGET is
`chars * fallbackEm` — so `fallbackEm` steers every stop's wrap, not
just the words missing from the table, and widths.html recomputes it
over the whole vocabulary including the 115 new words. If stop 3 or 4
comes back off the values in §9ac.7, the fix is `MEAS_CAP`, which is a
width written as a character count:

> **keep `MEAS_CAP[3] * fallbackEm` at about 8.75.**
> It was `20 * 0.44` before this session and is `18 * 0.486` now, both
> ≈ 8.8 em — the measure Jeonju's block has had since §9ab.12, and the
> widest its note can be without running off a 390px phone's frame.

Stop 3 has no cap (36) and should re-land on its own; if it does not,
its box is in §9ac.7 to compare against.

If a stop's SIZE drops below 9, say so rather than shipping it — that
is a conversation with VEN, not a number to quietly accept.

`mapnote` prints a loud `!` line naming any word it had to guess. If
that line is absent, the widths are current and the plan is exact.

### 7. The numbers this session ended on, so a re-run can be checked

`node tools/mapnote.js tools/shape.json` prints, with the widths still
estimated:

```
  stop 1  10.5 units, 34-char measure, 0+16 lines, block 173x229 at 0.607,0.192
  stop 2   9   units, 36-char measure, 0+18 lines, block 157x221 at 0.621,0.378
  stop 3  13.5 units, 27-char measure, 0+4  lines, block 158x70  at 0.635,0.676
  stop 4  10   units, 18-char measure, 0+10 lines, block 83x135  at 0.691,0.800
```

and `MAPS.ink.clear` in js/journey.js is:

```
  { box: [0.607, 0.192, 0.781, 0.319], fs: 10.5 },
  { box: [0.621, 0.378, 0.778, 0.501], fs: 9 },
  { box: [0.635, 0.676, 0.793, 0.716], fs: 13.5 },   // unchanged since §9ab.12
  { box: [0.691, 0.800, 0.773, 0.876], fs: 10 }      // unchanged since §9ab.12
```

`mapclear` reports `loops 6 covering 10.15% of the sheet`. `maproute`
on the cut sheet returns stops `0.341,0.120 / 0.492,0.360 /
0.623,0.601 / 0.375,0.857`. `stops` and `sealNudge` in js/journey.js
were NOT re-pasted and must not be — see §9ab on why the nudge list
is kept separate.

### Where things stood at the end of session 16

**NOT pushed. NOT seen by VEN in a browser.** `git status` is dirty
with the ten files below plus `tools/widths.html` untracked. The
working tree is coherent — the sheet on disk matches
`tools/clearings.json` matches `MAPS.ink.clear` — so it is shippable
as-is if the estimated wrap is accepted; the honest move is to run
§9ac.6 first.

What the next session inherits:

- **The one outstanding step** is §9ac.6 above. Nothing else is
  half-finished.
- **The pipeline** is README's THE CLEARINGS, now SIX steps: step 0
  (measure the widths) was added this session and is the one people
  will skip. `SIZE_CAP`, `MEAS_CAP`, `LH`, `MARGIN`, `CAP_SIZE` in
  tools/mapnote.js are the knobs; `COPY_LH` and `CAPU` in journey.js
  must match `LH` and `CAP_SIZE`. **`SIZE_CAP` is a ceiling, not the
  answer** — stops 1 and 2 come out under it because their loops
  cannot hold the copy any larger.
- **`MEAS_CAP` is a width written as a character count** (`chars *
  fallbackEm`). If `fallbackEm` moves — and it will, the moment
  widths.html runs — Jeonju's cap has to move with it or its note
  grows past the phone frame. That is why it reads 18 and not 20.
- **The masters**: `map-ink-master-clear.png` (shipped) and
  `map-ink-master-plain-clear.png` (the `--base`), both regenerable
  from `-nams` / `-plain` + tools/clearings.json. Still gitignored,
  still not backed up anywhere. `map-ink-master-nams.png` and
  `map-ink-master-plain.png` are the two that must never be lost.
- **Phones.** The two long notes read at ~8.6 and ~7.3px. Nobody has
  looked. The levers, honestly: there is no size left in stop 2's
  loop, so the real options are `?copy=strip` (the band under the map
  on narrow screens) or shorter copy. Do not promise a bigger `SIZE_CAP`
  will fix it — it is already above what fits.
- **Still Zico's**: Namsangol's bridge and swap steps (stop 3 still
  says "written here at launch"), the CA. The ticker is now known in
  everything but the config — see §9ac.5.

### Files (session 16)

- `tools/widths.html` — **new**. Measures the copy's words in Song
  Myung in the browser and POSTs the result over
  `tools/songmyung-widths.json`. Dev only; `tools/` never deploys.
- `tools/serve.js` — gained a POST endpoint for that one path
  (`WRITABLE`). 405 on any other path or method, 400 on non-JSON,
  4MB cap. Static serving is unchanged.
- `tools/mapnote.js` — the comma fix, the unmeasured-word warning,
  `MEAS_CAP` 20 → 18 for Jeonju.
- `tools/songmyung-widths.json` — `fallbackEm` 0.44 → 0.486, and the
  `_` field now says where the number comes from and how to
  regenerate. **The 88 word entries are still session 15's; the new
  copy's 115 words are not in it yet.**
- `tools/clearings-search.json` — stop 2's loop widened.
- `tools/clearings.json`, `tools/shape.json` — regenerated.
- `js/journey.js` — `SPOTS[0].copy`, `SPOTS[1].copy`, the provenance
  comment above `SPOTS`, and `MAPS.ink.clear`.
- `art/journey/map-ink.png` — re-prepped (3.05MB).
- `README.md` — THE CLEARINGS step 0, the sizes paragraph.

### Open (session 16)

- **Run §9ac.6.** Everything else waits behind it.
- VEN has not seen the sheet in a browser. `?map=solid` is the sheet
  before the clearings, on the same URL, for the comparison.
- The two upper clearings are large and close together. If VEN wants
  them smaller the only lever is shorter copy — the sizes are already
  at what the loops hold.
- `CONFIG.token.ticker` still `null` while the sheet says `$TILES`.

---

## 9ad. Session 17 (2026-08-29 / 08-30) — the mark became the ticker, and the sheet was measured

Two sittings on one thread. On the 29th the slot under the mark
stopped being a ticker and became prose. On the 30th the mark itself
became the ticker. In between, that second change was made, reverted,
and made again — and the reversal is the part of this worth reading.

§§1-7 are the hero. **§§8-10 are the round after VEN looked at it**:
the writing animation had been starting as a scatter of stray dots,
Zico's stop 1 was still carrying the copy he had already shortened,
and fixing that meant running THE CLEARINGS — which finally closed
§9ac.6, the step that had been outstanding since 2026-08-28.

### 1. What Zico asked for, in his words

He marked up a screenshot of the live hero and listed it top to bottom:

  - `GIWA (기와)` in place of `GIWA · roof tiles`
  - the big lettering and the little red box → `$tiles`
  - the `$XXX` line → `understand the narrative, understand the lore`
  - *"then keep rest the same."*

VEN read the middle item back to him — *"so you want the big korean
writing to change to $TILES?"* — and Zico answered *"Yeah bro but
make it a bit smaller pls"*, then *"Doesnt need to be that big."*

That last line is the entire size brief, and it is a comparison: the
mark is to be smaller than the hangul it replaces. It is not a number,
so §4 below is how it was turned into one.

### 2. The same change was made and reverted the day before

On 2026-08-29 the wordmark was swapped to `$TILES` unasked, and VEN
put it straight back: *"i didnt tell you to change the korean
characters."* Three things were left behind by that round, and all
three are why the 30th took an hour instead of a day:

  - the `$ T I L E S` strokes in `LETTERS`, drawn to sit beside
    `H A N O K` rather than as their own alphabet
  - `CONFIG.token.wordmark`, split out from `token.ko` so the drawn
    mark and the project's name stopped being the same string
  - a loud note in js/config.js saying not to set it without VEN
    asking in those words

That note did its job and has been rewritten, not deleted: it now
records who asked and when. **기와 is still the project's name**, on
the page in the eyebrow, the footer word, the `<title>` and the OG
tags — Zico marked none of those, and "keep rest the same" covers
them. Only the drawn mark changed.

### 3. THE SEAL WAS PLACED BY A CONSTANT, AND THE CONSTANT WAS WRONG

`SEAL_GAP` was `HANGUL ? 32 : 2` — hand-tuned to 기와 and to HANOK,
the only two words that had ever been set. $TILES ends in S, which
reaches x=86 on the 100-unit grid where K stops at 84, and 2 units of
gap had nothing to give: **the stamp landed on top of the S.**

It is measured now. After the letters are built, `inkGroup.getBBox()`
gives the word's own right edge in the svg's user space — no stroke
width, no filter, deterministic for a given word — and the stamp goes
`SEAL_AIR` units past it, with the viewBox sized off that.
`SEAL_AIR = 37` is not a new taste: it is the air the hand-tuned
hangul gap worked out to, so **기와 lands within two units of where it
always did** — measured in Chrome, ink right 218.6 and the stamp at
256 against the old constant's 254. Those two units are the
over-stroke, which is offset `translate(1.6 -1.2)`: getBBox counts it
and the old arithmetic never did. Every other word now gets that same
air without another constant. A `try`/`catch` keeps the
old arithmetic as the fallback, because getBBox throws under a hidden
ancestor in Firefox.

### 4. The size: what "a bit smaller" turned into

The svg fills `.hero__title` and keeps its own aspect, so **that one
width is the whole type size** — and the same width draws two words at
wildly different sizes, because 기와's viewBox is 302 units wide and
$TILES's is 674. The old 460px box drew 181px-tall hangul. The same
460px would have drawn 72px caps, which is not "a bit smaller", it is
a different design.

**560px**, measured in the browser at a 1280px viewport:

| | 기와 @ 460 | $TILES @ 500 | $TILES @ 560 |
|---|---|---|---|
| cap height | 181px | 79px | 88px |
| ink width | ~445px | ~460px | ~515px |
| vs the tagline under it | 25% narrower | 22% narrower | about equal |

500 and 560 both answer the brief on height — less than half the
hangul either way. 560 won on width: at 500 the tagline underneath is
visibly wider than the mark above it and starts to compete, and at 560
the two agree. The vw ceiling went 74 → 84 at the same time, because
six letters need the phone's full measure where two hangul blocks did
not (386px viewport: 324px box, 51px caps, no overflow — checked).

**`?mark=N` sets it live** (js/hero.js writes `--mark-w`), so this is
re-judgeable on the real page against the real painting without an
edit. `?mark=460`, `?mark=660`.

### 5. The flourish belongs to a letter, not to a script

The trailing ink tail was drawn for HANOK and gated on `!HANGUL`, so
$TILES inherited it — and it shipped for a few minutes looking like a
comma. A flourish is the pen carrying on after the last stroke, so it
has to leave from where the pen actually stopped: K stops at the foot
of its right leg, bottom-right, and the tail falls out of it. **S
finishes at its bottom-LEFT (17,107)**, so a tail drawn at the
bottom-right hangs there attached to nothing and the mark reads as
`$TILES,`. It is a `FLOURISH` map keyed by the last character now —
K names its own, and a word ending in anything else does not get one.

### 6. A stray `*/` had silently deleted the lore line's whole rule

Found on the way in, in the uncommitted 2026-08-29 work. A comment
above `.hero__lore` closed four lines early, so the rest of the prose
became the prelude of an unparseable rule and **took the entire
`.hero__lore` block down with it** — CSS drops the rule and does not
warn. Verified rather than assumed: the same pattern in a probe
stylesheet parses 1 rule out of 2, and the one immediately after the
stray marker is the one that vanishes. The line had been rendering as
unstyled body text for a session.

### 7. QA notes for whoever is next

- **The hero animation does not run in a backgrounded tab.** rAF is
  throttled to nothing, so a screenshot taken right after a navigate
  catches three ink blobs and an empty hero, and it looks exactly like
  a broken build. It is not. Either take a second screenshot a beat
  later (the tab paints, the timeline uses absolute timestamps and
  catches up), or force the end state from the console: set every
  `#heroTitle svg path`'s `strokeDashoffset` to 0, the seal group's
  opacity to 1, then add `is-written` to `#hero` and `is-in` to
  `heroLore`/`heroTagline`/`heroActions`.
- `?motion=0` also paints the finished mark instantly — but it is the
  reduced-motion build, so the scene backdrop is not where it is in
  the real one. Good for type, not for the composition.
- **A phone viewport without a phone:** an iframe 390px wide pointing
  at the same server has its own viewport, so `vw` units resolve
  against it. That is how the 386px numbers above were measured.

### 8. The hero began as a scatter of black dots

VEN, on the first screenshot back: *"this screenshot was captured at
the very start of the animation ... You can see small black dots,
parts of the other letters that are exposed/showing before the
animation has rendered the text in."* He was right, and it was not a
rendering artefact of the screenshot — it shipped that way, and it had
shipped that way since the hero was first written.

The cause is one number. Each stroke hides itself with
`stroke-dasharray: len len` and `stroke-dashoffset: len`. That makes
the pattern period exactly `2·len`, so at the starting offset the
**next** dash begins at path position `len` — a zero-length dash
sitting on the stroke's end point. `stroke-linecap: round` renders a
zero-length dash as a DOT. Every stroke that had not started yet was
showing one, which is why the count of marks fell as the writing
progressed.

`[len, len + 4]` moves that boundary to `len + 4`, off the end of the
path, and changes nothing else — the revealed span is still
`s < len - offset`, so the timeline, the swell remap and the nib all
work exactly as before. The swell paths get the same treatment.

**It is visible in the backgrounded-tab freeze** (§7 above), which is
the one useful thing about that trap: navigate, screenshot at once,
and you are looking at frame zero. Before the fix that showed three
blobs on bare paper; after it, bare paper.

### 9. Zico's stop 1 got shorter, and the widths were finally measured

Zico had sent the copy with *"made first section a little shorter"*
under it and the shorter version was never taken up — the sheet still
carried the long one. VEN, with a screenshot of the note: *"this block
of text does not read as me and zico asked."* The cut is the last
three sentences of stop 1, the tile paragraph:

> ~~기와 is the fired clay tile that has sat on Korean roofs for
> centuries. Palaces, temples, hanok villages. The chain took both its
> name and its mark from that tile.~~ This is where the road starts.

Stop 2 he passed as it stands.

Changing `copy` means THE CLEARINGS from step 0, and step 0 was the
job that had been outstanding since 2026-08-28 — so both landed in one
pass. `tools/widths.html` measured all 157 words of the new copy in
Song Myung and **`fallbackEm` came back 0.434 against the 0.486 that
had been estimated for it**. That number is not just the guess for
missing words: the wrap target is `chars * fallbackEm` for every stop,
so it steers all four notes. Everything moved.

### 10. What moved, and why none of it is a new decision

```
          size          lines        block          why
  stop 1  10.5 -> 13    16 -> 13     174x229        shorter copy, same loop
  stop 2  9             18 -> 19     157 -> 140 wide   fallbackEm
  stop 3  13.5          4 -> 3       158 -> 195 wide   fallbackEm
  stop 4  10            10 -> 9      83 -> 84 wide     held, see below
```

**Stops 3 and 4 had been untouched to the thousandth since §9ab.12 and
are not any more.** That is the estimate unwinding rather than a new
taste: 0.486 was 10% high, so every measure it planned was 10% wide of
the character counts `MEAS_MAX` and `MEAS_CAP` were actually set in.
`36 * 0.434` = 15.6em is within a hair of the `36 * 0.44` = 15.8em the
tool was written against.

Stop 4 was held at its designed width by re-deriving `MEAS_CAP[3]` from
18 to 20, exactly as §9ac.6 instructs: `20 * 0.434` = 8.7em, the same
measure `20 * 0.44` and `18 * 0.486` both meant. It came back within a
line of where it was. **Stop 3 has no cap and re-planned wider and
shorter** — 3 lines across 195 units instead of 4 across 158 — which
uses its loop better than the estimate did, since the loop always had
room for ~200 units and the inflated em had been stepping the measure
down to 27 characters to avoid a width that was never really too wide.

**Stop 1's type is now the largest on the sheet** (13 against stop 2's
9, side by side and both Zico's prose). The block footprint is set by
VEN's traced loop, not by the copy, so shorter copy buys bigger type
rather than a smaller panel. `--sizes 10.5,11,13.5,10` on mapnote
matches them again in one re-run if that reads wrong to him.

**Checked, and it is right:** every planned block sits inside cleared
paper with its uniform margin (cropped out of the master with the box
drawn on it, all four), the page's drawn blocks land on the planned
boxes to within the glyph overhang, and sampling the shipped
`art/journey/map-ink.png` down the middle of stop 1's block returns
bare parchment at every point and terrain immediately below the
clearing's edge.

**One thing that is NOT new but is now measured.** Stop 1's note runs
past the bottom of the camera frame on a desktop: 144px at 1280x820,
227px at 1440x900, 450px at VEN's own 1280x551. The block's height in
sheet units is unchanged by this pass (229 against 229), so this is
exactly as true of the sheet VEN has been looking at — but nobody had
put a number on it. The README already says the camera lets the seal's
side win "when a short window cannot hold them all", so it is at least
a known direction; whether four lines of Zico's copy sitting below the
fold is acceptable is his call, and the levers are the loop (his own
markup), `SIZE_CAP`, or the settle zoom.

**maproute's stop 4 moved** — `0.375,0.857` in §9ac.7, `0.321,0.895`
now — because Jeonju's clearing changed height and the most-open-cell
search near that row saw different ground. `stops` is not re-pasted
(§9ab), js/journey.js keeps `0.374,0.857`, no clearing covers that
point on the new sheet, and the seal nudges still stand. The first
three stops came back identical.

### Files (session 17)

- `js/config.js` — `wordmark: "$TILES"`, and the note above it
  rewritten to record who asked
- `js/hero.js` — header note; measured seal placement (§3); the
  `FLOURISH` map (§5); the `?mark=` knob; the dash gap (§8)
- `css/site.css` — `.hero__title` width 460 → 560 and the vw ceiling
  74 → 84; the no-JS fallback sized for six latin characters; the
  stray `*/` (§6)
- `index.html` — the hero's `aria-label` and no-JS fallback, which
  are hand-kept and both still said 기와
- `js/journey.js` — `SPOTS[0].copy` cut to Zico's shorter block (§9);
  `MAPS.ink.clear` re-pasted from mapnote (§10)
- `tools/mapnote.js` — `MEAS_CAP[3]` 18 → 20, re-derived against the
  measured `fallbackEm` (§10)
- `tools/songmyung-widths.json` — measured, at last: 157 words,
  `fallbackEm` 0.434
- `tools/clearings.json`, `map-ink-master-clear.png`,
  `map-ink-master-plain-clear.png`, `art/journey/map-ink.png` — all
  regenerated by the pipeline
- `README.md` — launch checklist item 0 was still describing a null
  ticker and a hangul hero; the UNFINISHED banner is finished

### Open

- **THE LITTLE RED BOX.** Zico's line was *"big lettering and little
  red box to change to $tiles"*, which can be read as "the mark, which
  is those two things, becomes $TILES" or as "both of them go away and
  $TILES replaces them". **The seal was kept**, on the evidence that
  VEN reverted a default-off stamp on 2026-08-29 and that the same 韓
  is stamped on the manifesto, the footer and every marker on the
  journey map, so dropping it from the hero alone would break the one
  motif that runs the length of the page. `?stamp=0` is the hero
  without it — one URL, no edit, and that is the way to settle it
  rather than describing it.
- **Stop 1's note is now the biggest type on the sheet** and stop 2's
  is the smallest, with the same author and the same kind of prose.
  `--sizes 10.5,11,13.5,10` matches them in one re-run — §10.
- **Four lines of stop 1 sit below the camera frame on a desktop.**
  Measured in §10, unchanged by this pass, and never raised with VEN.
- §9ac.6 IS DONE. The clearings pipeline has been run end to end on
  measured widths and nothing in it is outstanding.

---

## 9ae. Session 17, part 3 (2026-08-30) — three notes, and the widths were measured in the wrong font

Zico, on a phone screenshot of stop 1 with three loops drawn down the
sheet: *"The text is slightly cropped in some parts, can you split it
into 3 so its spaced out a little."* Both halves of that turned out to
be the same bug, and finding it turned up a third that had been
poisoning the whole pipeline.

### 1. Why the note was cropped, and why splitting it fixes that

The note has to live inside VEN's traced loop, and that loop is a
**funnel**: 14 units of clean run on its top row, 306 at its widest,
~264 down the rest. A block is only placed where every row it spans is
clean for its full width — so a thirteen-line block can only stand in
the part of the funnel that is wide for thirteen rows, which is the
narrow column against the sheet's right edge (x 0.607 to 0.782).

On a phone the frame is `1000 / PHONE_ZOOM` = 476 map units across, and
it has to hold the seal (x 340), the Korean name and that column
(to 790) — 450 units of content with 26 to spare. Measured at the
settle point, the note's right edge came to **1px past the frame**. Any
drift at all and the last letters go, which is what Zico photographed.

Three shallow blocks each pick their own width and sit as near the road
as their own rows allow, which walks them left as they descend — the
staircase Zico drew, and it is not a coincidence: it is the shape of
the funnel. The note's right edge is now 8 to 14px INSIDE the frame at
every phone width tested (360, 390, 393, 430).

### 2. A stop's copy can be a list of blocks now

`SPOTS[i].copy` nests: `[["a"], ["b"], ["c"]]` is three notes,
`["a", "b"]` is one of two authored lines. Two helpers in js/journey.js
(`copyBlocks`, `copyLines`) are the only things allowed to read it —
a stray `.join(" ")` over the nested form prints commas onto the sheet.
`MAPS.ink.clear[i]` takes a matching list of boxes, and `setBlock`
renders all of a stop's blocks into ONE group on ONE writing mask: a
line record already carries its own `cx` and `y`, so a second block is
just more lines at other coordinates and nothing downstream needed to
know. tools/mapnote.js places a block per part, each below the last.

**Split at the client's own paragraph breaks.** Zico sent four
paragraphs and asked for three, so the opening sentence stays with the
specs it introduces: [1+2], [3], [4].

### 3. THE CLEARINGS OVERLAP ON PURPOSE

Three separate islands is what the markup literally drew, and it was
built that way first. It costs `3 x 2 x MARGIN` of the loop's height
instead of `2 x MARGIN` — 96 units of a loop that has ~430 — and
mapnote answered by dropping the type from 13 units to **8.5**, smaller
than anything on the sheet, on the note the client most wants read.

`GAP` (26 units, text edge to text edge) is deliberately smaller than
`2 x MARGIN`, so consecutive clearings overlap and mapclear cuts them
as one stepped region. It still reads as three blocks, because the eye
reads the TEXT's gaps and not the paper's edges. At 11 units the three
blocks span 0.192 to 0.317 — the same paper the single block had, so
nothing about the framing moved, and they are a half unit LARGER than
the 10.5 that note carried before Zico cut its last paragraph.

### 4. `mw` — the measure is not the box

A block is wrapped to a **measure** (`chars * fallbackEm`) and the box
is then only as wide as the longest line that came out of it. Those are
not the same number: six lines can leave 6 units unused, one line can
leave 40. The page re-wrapped to the BOX, so it wrapped at a narrower
measure than the tool had, and broke lines the plan had fitted — the
first split put "This is where the road starts." across two lines with
"starts." alone on the second.

Every entry in `MAPS.ink.clear` now carries `mw`, the measure it was
planned at, and js/journey.js reflows to that and centres the result in
`box`. A sheet planned before `mw` existed has none and falls back to
the box, which is what it always did.

### 5. THE WIDTHS WERE MEASURED IN TIMES NEW ROMAN

The one that matters. `tools/widths.html` is a standalone page under
`/tools/` and **it never loaded the webfont**. Its stack is
`"Song Myung", "Times New Roman", serif`, `document.fonts.load` had no
`@font-face` to fetch, and the guard — `document.fonts.check("100px " +
FONT)` — returned true the whole time, because Times New Roman is in
that stack and is installed. It measured every word in Times and said
it had measured Song Myung.

Times is **7 to 17% narrower**: `the` 1.222em against the real 1.432,
`and` 1.444 against 1.648, the space 0.25 against 0.226. So the tool
planned every note to a measure the page could not hold, in exactly the
direction the file's own header warns about, and the page drew one to
three lines more than the plan on every stop.

It had been hidden by a second error cancelling it: the page wrapped to
the box, which is narrower than the measure by about the same fraction.
Fixing §4 removed the cancellation and exposed this.

Fixed by linking the same Google Fonts href index.html uses, and by
checking `'100px "Song Myung"'` — the FAMILY, not the stack, since a
check over a stack can never fail. It refuses to save now if the face
is missing, rather than writing a file full of the wrong font.

**Two knock-on corrections.** `fallbackEm` is **0.483**, close to the
0.486 that had been *estimated* in session 16 and nothing like the
0.434 that the Times pass produced this morning; `MEAS_CAP[3]` is
therefore **18** again. And stops 2 and 4 re-planned to their §9ac.7
numbers to the thousandth — 9 units / 18 lines / 0.621,0.378 and 10
units / 10 lines / 0.691,0.800 — so the session-16 plan had been right
all along and the intermediate re-run was the wrong one.

### 6. What was checked

- The page's wrap against the plan, per stop, at a real phone viewport:
  **12 / 17 / 4 / 9** drawn against **12 / 18 / 4 / 10** planned. Stop
  1 exact; the other two come in one line UNDER their clearing, which
  is the safe direction. Before the font fix every stop was over.
- Every word width in the saved file against the browser's own
  `measureText` in the loaded face: `the` 1.432 = 1.432, `and` 1.648 =
  1.648, space 0.226 = 0.226.
- The three blocks cropped out of the master with their boxes drawn on
  them: all on cleared paper, uniform margin, and the three clearings
  merged into one stepped region.
- maproute returns 0.341/0.120, 0.492/0.360, 0.623/0.601, 0.375/0.857 —
  every stop within a thousandth or two of what js/journey.js carries,
  so `stops`, the road and the seal nudges all stand.
- The desktop overhang improved rather than regressed: stop 1's note
  runs 131px past the frame at 1280x820 (was 144), 170 at 1440x900 (was
  227), 400 at 1280x551 (was 450). Still not fixed — see Open.

### Files (session 17, part 3)

- `js/journey.js` — `copyBlocks`/`copyLines`; stop 1's copy split in
  three; `setBlock` lays out a list of boxes; `MAPS.ink.clear` re-pasted
- `tools/mapnote.js` — walks the brackets to read a split `copy`;
  `place()` puts a block per part; `GAP`, `SLACK` and `mw`;
  `MEAS_CAP[3]` back to 18
- `tools/widths.html` — the font link, the family check, the refusal to
  save without it, and the same bracket walk
- `tools/songmyung-widths.json` — re-measured in the real face
- `tools/clearings.json`, both masters, `art/journey/map-ink.png` —
  regenerated

### Open

- **Stop 1's note still runs past the bottom of the camera frame on a
  desktop** (§6). Better than it was, not fixed. The levers are VEN's
  own loop, `SIZE_CAP`, or the settle zoom, and which one is his call.
- Stop 2 is still 9 units, the smallest type on the sheet, and now sits
  under a stop 1 set at 11. Splitting stop 2 the same way is one nested
  `copy` and a re-run, if Zico wants it.
- `PHONE_ZOOM` 2.1 leaves stop 1 with 8-14px of margin on a phone. It
  is real slack now rather than 1px, but it is not much; 2.0 would give
  another 24 units if anything else ever grows. (22px after §9af moved
  the blocks to Zico's places.)
- **SUPERSEDED BY §9af**: the three blocks stacked in the old column
  were not what Zico drew. They are in his three places now.

---

## 9af. Session 17, part 4 (2026-08-30) — the three notes go where Zico drew them

VEN, on the three-notes commit (b07cc46): *"that isnt in the right
part of the website ... reference the screenshot and the current state
of the website in claude chrome and try again."* He was right. Zico's
screenshot had three loops drawn in three PLACES down the sheet, and
§9ae stacked all three blocks in the old column and called it split.

### 1. Where his loops are

Traced off his phone screenshot and mapped onto the sheet through three
landmarks that agree to within ten screenshot pixels — the seal
(0.340,0.120 at 70,690), the Korean name column (0.396,0.136 at
~160,745) and the English caption (0.535,0.178 at ~430,885); 1846 px
to the sheet's width, 3307 to its height:

  - **A** — beside the palace, in the mountain range to its right, at
    the seal's height. x 0.626-0.792, y 0.067-0.175.
  - **B** — where the note stood, opened LEFT to the road. x
    0.458-0.791, y 0.191-0.272.
  - **C** — lower-left, straddling the road. x 0.358-0.639, y
    0.289-0.364.

They are in `tools/clearings-search.json` as three loops for stop 1
(`part: 1..3`, in reading order), which the file could not hold before:
tools/maproute.js kept ONE polygon per stop, last wins — a latent bug
that had quietly made stop 1's mask in the final run the *caption's*
little loop, since clearings.json lists the caption loop after the
block loop. It keeps a list now, skips caption loops, runs the shape
search once per loop, and writes `shapes[]` to shape.json; mapnote puts
block i in loop i. VEN's original stop-1 loop is in git at 1cc6bdb.

### 2. His loops mark WHERE, not how much

Measured (scratch probe, same arithmetic as mapnote), the loops as
drawn hold:

```
            A (13 rows, 181 tall)   B (10 rows, 139 tall)   C (9 rows, 125 tall)
  P1+P2     9 units, 8 lines        11                      no
  P3        10                      12                      no
  P4        13.5                    13.5                    8.5, 2 lines
```

So the note — one voice, one size — lands at **8.5**: the top loop is
small for a 193-character paragraph, and the road takes the middle of
the third, leaving ~125 units of run either side. On his own screen at
the size he was looking at, loop A holds about 76 characters — the
first paragraph is two and a half times that. He drew places.

Two of them were grown where nothing stands, keeping his positions:
**A 26 units toward the palace and one row up** (no peak touched; the
palace's halo is what it meets), **C 20 units left**. That buys
**10.5** — the size the note had before he cut its last paragraph — and
the blocks come out 127x127 beside the palace, 185x69 where the note
was, 75x26 beside the road:

```
  var MAP_CLEAR[0] = [
    { box: [0.635, 0.075, 0.762, 0.146], fs: 10.5, mw: 126.8 },   // A, 9 lines
    { box: [0.566, 0.207, 0.751, 0.246], fs: 10.5, mw: 182.6 },   // B, 5 lines
    { box: [0.371, 0.308, 0.446, 0.322], fs: 10.5, mw:  76.1 }    // C, 2 lines
  ]
```

**"This is where the road starts." sits beside the road**, on two
lines, left of it — the tool's pick over the right side by its own box
score, and the better one: the right side would have read as a
continuation of B's column.

### 3. Three small things the parts needed

- **Each part picks its own measure.** The parts share one size — a
  size change between them reads as two voices — but the measure is a
  property of the loop, and a two-line closer in a loop the road cuts
  in half cannot be held to the six-line opener's column width.
  mapnote searches size alone and a size wins when every part places.
- **A short part may wrap under MEAS_MIN.** The 18-character floor
  keeps a paragraph from being set as a ribbon; a 30-character line is
  not a paragraph, and at 18 it could never fit a 125-unit run. The
  floor is now MEAS_MIN or half the text, never under ten.
- **maproute's copy-length reader** used the old flat regex, which
  did not match a nested `copy` at all — so stop 1 was skipped and
  every stop after it took the figure of the one before. It walks the
  brackets now, anchored on `name:` because a bare `copy: [` also
  matches the examples in journey.js's own comments, and carries one
  length per block.

### 4. Checked

- **Zico's phone (393x852, the iPhone his screenshot came from):** 15
  lines drawn against 16 planned (A one line under, the safe
  direction); the rightmost text at x=371 of 393 — **22px inside** the
  edge where his screenshot had it cut; the closing line at x=43-110
  beside the road; the whole note between y=118 and 468 of 852.
- The three blocks cropped out of the cut master with their boxes
  drawn on them: all on cleared paper with the uniform margin, A
  merged into the palace's halo.
- maproute returns 0.340/0.120, 0.493/0.360, 0.623/0.601, 0.375/0.857 —
  every stop EXACTLY what js/journey.js carries.
- mapnote prints no `!`; all 157 words measured in the real face.

### 5. The closer moved under its paragraph, then INTO it (VEN, same day)

*"can you put 'this is where the road starts' under the paragraph that
reads 'upbit...'"* — so the third block stacked under the second, in
Zico's second loop, and his third loop beside the road was retired.
Then, seeing that: *"put 'this is where the road starts' in the same
block as the text above it. The same container."* — so the copy is TWO
parts now, and the closer is the liquidity paragraph's last sentence,
wrapping with it. Stop 1 is two notes: 10 lines beside the palace, 6
where the note stood. The stacked-block state is one commit back.
Checked on the phone (393x852): 16 lines, the wrap breaking at
"...all that liquidity. This is where / the road starts.", 27px of
slack at the right edge, the note between y=101 and 381 of 852.
Desktop: the union is 23 units shorter than the stacked state's, whose numbers therefore bound it — fits at 1280x820, at most 31px over at 1440x900 and 277 at 1280x551. A bound, not a re-probe: the harness tab kept freezing.

That needed one more case in mapnote's `place()`: part i goes to loop
i, and once the loops run out the LAST loop takes every part left,
stacked `GAP` apart. One loop: all stacked. A loop per part: one each.
Two loops for three parts: the first alone, the other two under each
other. Loop B was grown 42 units down to hold both at size (the two
blocks need ~155 units of rows; it had 139).

**11 units**, not 10.5: the road-side loop had been the tightest
constraint on the shared size, and with it gone the top loop is the
limit. The closer sits 27 units under the "Upbit" paragraph, flush
with its left edge (both blocks hug the road side of their loop), on
one line:

```
  var MAP_CLEAR[0] = [
    { box: [0.635, 0.068, 0.751, 0.151], fs: 11, mw: 116.9 },   // A, 10 lines
    { box: [0.566, 0.215, 0.760, 0.255], fs: 11, mw: 191.3 },   // B, 5 lines
    { box: [0.566, 0.270, 0.713, 0.277], fs: 11, mw: 191.3 }    // under B, 1 line
  ]
```

The two clearings in loop B overlap (GAP < 2·MARGIN) and mapclear cuts
them as one; the paper beside the road that C had cleared is terrain
again. maproute returns 0.341/0.120, 0.493/0.360, 0.623/0.601,
0.372/0.857 — within three thousandths of js/journey.js everywhere,
`stops` not re-pasted.

**Checked on the phone (393x852):** 15 lines against 16 planned (A one under, the safe direction); the closer at y=400, 32px under "liquidity." and flush with the paragraph's left edge (x=210 against 205-220); the rightmost text 21px inside the edge; the whole note between y=108 and 400 of 852.

### Files (session 17, part 4)

- `tools/clearings-search.json` — stop 1's loop replaced by Zico's
  three (`part`, `who`); then the third retired and the second grown
  42 units down (§5)
- `tools/maproute.js` — a list of loops per stop, `shapes[]` in
  shape-out, the bracket-walking copy reader
- `tools/mapnote.js` — block i in loop i, the last loop taking the
  rest stacked; per-part measure; the measure floor for short parts
- `js/journey.js` — `MAPS.ink.clear[0]` re-pasted; the notes rewritten
- `tools/shape.json`, `tools/clearings.json`, both masters,
  `art/journey/map-ink.png` — regenerated

### Open

- **Loop A is Zico's, grown** 26 units toward the palace and a row up;
  as drawn it held his first paragraph at 9. Loop B is his, grown 42
  units down at VEN's word to take the closer. Loop C is retired (§5).
- **Desktop:** with the closer under B rather than lower-left the
  note's union is shorter again — **it FITS at 1280x820** (8px inside the bottom), runs 31px over at 1440x900 and 277 at 1280x551, against 152 / 194 / 422 with the closer beside the road and 131 / 170 / 400 for the single column. Same behaviour as
  always (the top wins; the last lines come up as the camera moves on),
  and the same three levers: VEN's loop, SIZE_CAP, the settle zoom.
- **DONE IN §9ag**: Stop 2 is still 9 units, under a stop 1 at 10.5.

---

## 9ag. Session 18 (2026-08-31) — stop 2 in three notes, and the loop chose the grouping

VEN: *"In the last session I asked you to chop up the first block of
text in 'the journey' section into smaller blocks. Can we do the same
with the second block of text?"* — stop 2, Changdeokgung, the $TILES
argument: one 18-line block at 9 units, the smallest type on the
sheet, exactly the case §9ae's Open had named.

### 1. No markup this time, so the parts stack

Zico drew loops for stop 1; nobody drew any for stop 2, and inventing
places is what §9af exists to warn about. So the split uses the
mapnote default a stop with no markup gets (§9af.3): the parts stack
down the stop's ONE search loop, `GAP` apart, each at its own
measure. The loops file was not touched.

### 2. The grouping was chosen by the loop, not by taste

The prose has four beats — the setup ("Every chain gets memecoins…"),
the claim ("The tile isn't a random symbol… That's the difference."),
the contrast ("A memecoin usually sits on top… built on."), the chant
("One tile is the token… made of."). Every grouping of them was run
through mapnote (the words never changing, 664 chars verified
byte-identical to HEAD each time):

```
  setup | claim | contrast+chant          8.5 units   (three notes)
  setup | claim | contrast | chant        8.5         (four)
  setup | claim+contrast | chant          9           (three)
  setup+claim | contrast+chant            9.5         (two)
  setup+claim | contrast | chant          9.5         (three)   <- shipped
```

Cutting the setup from the claim costs a full unit — the extra GAP
plus the ragged joint line push the tail into the loop's narrowing
south-west contour (the road bends east below the building, and the
run's left edge walks from 514 to 653 units over the loop's last
rows). Splitting the tail is free: short blocks may go NARROW
(placeOne's per-part measure), and narrow is what those rows hold.
8.5 would have been under §9ac.6's floor ("if a stop's SIZE drops
below 9, say so rather than shipping it") — it was not shipped, and
this table is the saying-so.

**Shipped: 10 / 4 / 6 lines at 9.5 units, up from 9.** The blocks
step RIGHT as they descend — the mirror of stop 1's staircase,
because this loop's funnel narrows on the other side:

```
  var MAP_CLEAR[1] = [
    { box: [0.593, 0.370, 0.759, 0.442], fs: 9.5, mw: 165.2 },
    { box: [0.607, 0.456, 0.774, 0.484], fs: 9.5, mw: 165.2 },
    { box: [0.663, 0.498, 0.781, 0.541], fs: 9.5, mw: 114.7 }
  ]
```

The pipeline ran end to end (README THE CLEARINGS; step 0 skipped
with cause: not one word changed, and mapnote printed no `!`).
Stops 1, 3 and 4 came back to the thousandth everywhere — plan,
clearings, MAP_CLEAR, and maproute's stops/name anchors on the cut
sheet — so `stops` was not re-pasted.

### 3. Checked

- **Adversarial pass, four independent agents:** a wrap re-derivation
  from the widths table reproduced 10/4/6 lines with every line
  inside its box and SLACK intact; the journey.js diff vs HEAD is
  exactly two hunks (SPOTS[1].copy, clear[1]); the three clearings
  are exact roundRects of box+MARGIN overlapping into ONE stepped
  region (GAP 25.1 < 2×MARGIN), the road 25 units off at the closest
  (loop 2's west edge — the tightest spot on the stop); the cut
  sheet's pixels are bare parchment in all three boxes (zero px under
  L170), feather inside the margin band, terrain untouched outside.
- **Phones, at the settle (marker centred, ±10px):** 19 lines drawn
  against 20 planned (block 1 one under, the safe direction — same as
  every split stop). Right-edge slack **8px at 360, 11 at 393, 13 at
  430**; the note between y=434 and 626 of 852 at 393×852. Tighter
  than stop 1's 21-27px but real; PHONE_ZOOM 2.0 is still the lever
  if anything else grows (§9ae).
- **Desktop (DOM audit; the 1280 harness still does not paint the
  sheet):** 20 lines, exactly the plan. The note runs past the frame
  bottom at settle: **−320px at 1280×820, −377 at 1440×900, against
  −181 / −206 for the old single block** — measured by swapping
  HEAD's journey.js in and out. Stop 2 was never inside a desktop
  frame at settle; the split costs ~140–170px more of the same
  behaviour the section has always had (the top wins; the last lines
  come up as the camera moves on). Stop 1's §9af numbers and levers
  apply unchanged.
- The copy reveal on the sheet was eyeballed at 393×852: three blocks
  down the footsteps trail, paper gaps reading clearly between them.
  (QA note for next time: the reveal mask advances one dashoffset per
  FRAME, so under qa-frame's SYNC it needs draw frames pumped —
  hundreds of GO() calls at the settle — before the copy is visible;
  text.style.opacity is constant 0.78 under the mask and proves
  nothing. And a frozen-then-recovered renderer can serve a STALE
  compositor frame: the screenshot after the retry may show an older
  state than the DOM. Trust the DOM audit; re-navigate before
  re-shooting.)

### Files (session 18)

- `js/journey.js` — SPOTS[1].copy nested in three (words untouched),
  its provenance comment, `MAPS.ink.clear[1]` re-pasted as the list
- `tools/shape.json`, `tools/clearings.json` — regenerated (stop 2:
  one loop → three overlapping clearings; stops 1/3/4 byte-identical)
- both masters, `art/journey/map-ink.png` — re-cut, re-prepped
- `HANDOFF.md` — this section; §9af's Open closed

### Open

- Stop 2 is 9.5 units — no longer the runt (stop 4 is 10, stop 1 11),
  but still the smallest with stop 4. **The one lever left to 10+:
  grow the loop north into the saddle below stop 1's second clearing**
  — 0.2952 to 0.348 is ~95 units of mountains that §9af's move of
  stop 1's blocks left free — at the cost of fading more terrain and
  putting paper above the building's latitude. Not done without VEN.
- The desktop over-run grew (~140–170px, numbers above). Same three
  levers as stop 1: the loop, SIZE_CAP, the settle zoom.
- 8px of phone slack at 360 is the tightest number on the sheet.

---

## LAUNCH DAY — everything still outstanding

VEN, 2026-08-16, wrapping the session: *"all adjustments will be made
closer to token launch date when more token specific tweaks will be
made like incorporation of the ticker and real token name and contract
address and all that good stuff."*

So the site is **done and live as a pre-launch site**. What remains is
token-specific and waits on Zico.

### 1. `js/config.js` — the whole launch checklist lives here

- **`ca`** — the contract address. `null` today, which makes the hero
  pill read "coming at launch". Setting it turns on copy-to-clipboard.
  **It also re-seeds the village** (`assign()` hashes it), so the
  building layout will change the moment the real CA lands. That is by
  design — but if VEN ever falls in love with a particular arrangement,
  pin it with `seed` instead.
- **`links`** — buy / X / dexscreener / telegram. `null` hides each.
- **`chart.pool`** — the GeckoTerminal pool address. `null` serves the
  deterministic mock candles; setting it switches to live candles on a
  2-minute refresh.
- **`village.marketCap` / `holders`** — mock values. Note
  `tools/build.js` **zeroes both in the deployed build** (`DEMO_ZERO`),
  so the live site opens on an empty valley, which is launch-day truth.
  The slider is how a visitor sees it grow.
- **`perRoof` — STILL UNDECIDED, and it is a tokenomics decision, not a
  layout one.** At $100k a roof, 60 plots means the field fills at
  **$6.0M**. That number was chosen when the field held 20 plots and
  filled at $2.0M, and it has never been re-decided. ~$33k a roof would
  restore the original ceiling. Flagged in §9j at $4.2M, §9n at $6.0M,
  and again here.

### 2. The name and the ticker

**The NAME is settled and shipped: 기와 / GIWA** (Zico, 2026-08-21,
§9y). The hero writes the hangul, the footer word, the `<title>` and
the OG tags all say it, and `LETTERS` in js/hero.js carries the brush
strokes for 기 and 와. Nothing here is outstanding. (This section said
"HANOK / 한옥 throughout" until 2026-08-28 — it had been stale since
session 13. If you find other HANOK references, they are stale too.)

**The TICKER is settled too: `TILES`** (VEN, 2026-08-29), which is
what the domain and Zico's map copy had said all along.
`CONFIG.token.ticker` carries it, `js/main.js` writes it into the
manifesto and the `<title>`, and nothing on the page reads `$XXX` any
more.

**The hero does not take the ticker from there — it DRAWS it.**
`CONFIG.token.wordmark` is `$TILES` since 2026-08-30 and is a set of
brush strokes, not text (§9ad). Two consequences worth keeping in
mind: setting `ticker` alone would no longer change the mark, and a
different ticker would mean drawing letters that do not exist in
`LETTERS` yet.

Should the NAME ever change (it should not), these are the places:

- `index.html` — `<title>`, OG/Twitter meta, the inline favicon SVG
  (the one hand-kept copy of `CONFIG.token.seal`), the footer word
- `js/hero.js` — `WORD` plus the per-letter stroke paths in `LETTERS`.
  **This is the expensive one:** the title is hand-drawn strokes on a
  100×140 grid, not text, so a new name means drawing new letters.
  Budget real time for it. `node tools/heropng.js [word]` renders them
  without a browser.
- `README.md` line 1 and `HANDOFF.md`'s brief
- `SPOTS[i].copy` in js/journey.js names the chain and the token in
  prose — and changing a single character there means re-running THE
  CLEARINGS from step 0, because the words are drawn on the map and
  the map has paper cut to fit them.

### 3. Remove the market-cap slider

When live pricing is wired, delete in one pass (the file header lists
these too):
1. `js/preview.js`
2. the `<script src="js/preview.js">` line in `index.html`
3. `"js/preview.js"` from `FILES` in `tools/build.js`

Then feed real market cap through the same door it used —
`window.HANOK.setVillage({ marketCap, holders })` — which is now a
proven interface.

### 4. Pre-deploy art optimisation, still not done

`art/` is ~22.6MB deployed (session 12 added the two map sheets —
picking ink vs pirate drops one, ~2.3MB; the ink sheet itself is 3.0MB
at 1800px, §9v has the sizing trade) and that is the one real cost on
a phone
connection. `field.png` is 2.0MB; the ten `b-*.png` are 65–730KB.
**The trap, and it has bitten this project before:** do not let
`tools/optimize.js` give each sprite its own median-cut palette, or the
buildings stop agreeing with each other on colour. Shared palette or no
quantisation (§9h).

### 5. Still open from earlier sessions, unchanged

- **§9i block 2** — the full-screen plate.
- **The manifesto and ledger redesign.** Untouched since session 3.
  ~2,900px of the lower page is four centred stacks on flat paper with
  no change of rhythm. The global backdrop (§9q.3) treats the symptom
  nicely; this is the cause, and the two compose.
- **PLAN.html phases 2 and 3** — villagers walking the lanes, birds
  over the ridge. Phase 3B (sleeping Z's) is done (§9o).
- **The two walk sheets** (`p-walk-a/b.png`) — phase 2's only art
  dependency, and the edit-a-crop trick does NOT apply: there are no
  villagers in the painting to cut out.
- **Zico's outstanding deliverables** — name, copy, final art direction
  sign-off, CA.

### 6. Housekeeping worth doing sometime

- **`tools/fakestates.js` is dead** (§9n) — a 15-plot-era `PLOTS` copy
  and a stale `BAND`. Delete it or re-sync it; do not half-trust it.
- **`tools/place.html`** likewise holds a hand-placed `PLOTS`. `PLOTS`
  is generated now.
- **The art masters are NOT in git** (§9p) — ~176MB of top-level
  `valley*.png`, traced `*.svg`, and `art/village/_fake` `/alt`
  `/_placeholder`. They exist only in VEN's working folder. **They want
  a real backup somewhere** — git history is permanent and this repo
  deliberately does not carry them.
