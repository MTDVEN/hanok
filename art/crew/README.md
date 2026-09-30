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
$TILES in *"a better font"*, tiles laid ON something (never mid-air),
and the carriers to *"walk up to the guy on the ladder, add to a pile of
tiles at the bottom of the ladder and then walk back off frame (where
they rendered in from)"*. The sizes and the delivery are done. The font
became **Zico's own lettering**: his reference arrived the same day
(`art/title/README.md`), and it is the default title now.

**THE PAINTERS (session 21, 2026-09-30) — the cast now.** VEN: *"change
the characters in the main hero section to look like they are painting
the ticker "$TILES" rather than being on a laptop like they are or moving
tiles around."* Five villagers paint Zico's lettering: a boy with an ink
pot dabs the foot of the $'s bar; a young man crouched on the T's bar
brushes its top, his ink bowl beside him; a young woman sits on the E's
arm touching up the S; a young man sweeps a GIANT brush along the tip of
the S's tail; a woman reaches up with a long-handled brush to the S's
lower curve. One still, one loop, painted ONTO the real lettering so
every brush meets real ink (below: "The painters"). Each arrives the
moment the stroke he works on has been written. The laptop-sitters, the
tile delivery and the first builders are all kept (`?cast=sit,carry`,
`build`); VEN's ladder brief (HANDOFF §9ap.4) is superseded by this one.

## Look at it

`node tools/serve.js`, then (or on the Vercel preview of the branch):

| URL | what |
|---|---|
| `index.html?crew=ink` | **the painters** on the heading (each arrives as his stroke is written), plus villagers on the village paths |
| `&paintin=end` | the painters arrive together once the title is written (the alternative) |
| `&cast=paint,sit,carry,build,village` | pick groups. `sit,carry` = the laptop-sitters and the tile delivery (the cast before the painters), `build` = the first builders |
| `?titlet=770` | freeze the title's writing at 770ms (here: the $'s S down, its bars to come) |
| `&relay=1` | carriers take turns instead of passing each other |
| `&carryplane=front` | carriers and pile in front of the letters (default behind, so $TILES stays whole) |
| `&titlefont=Black+Han+Sans` | $TILES in ANY Google font (`Family:wght@900` for a weight), still written by hand: the glyphs are uncovered through a mask by the brush letters' pen strokes stretched onto each glyph, the nib riding along |
| `&title=song` | $TILES in Song Myung |
| `&crewsize=0.5` | the sitters' and carriers' size (default 0.42; 0.55 on phones ≤560px). Not the painters: their size is the size they were painted at |
| `&crewt=12.5` | freeze the scene at 12.5 s — the carriers' clock and, since session 21, every looping figure's frame (QA) |
| `&motion=0` | one still moment: the painters on frame 0 (the old cast: the first carrier crouched at the pile) |
| `index.html?crew=x` | the laptop-sitters as painted on X — the comparison VEN rejected, kept |
| `index.html?crew=ink&cast=sit,carry&title=hand` | the old cast on the earlier brush letters it was fitted to (on Zico's lettering its pile search fails, a console warning). The painters are never shown on `title=hand` |

Nothing shows without `?crew=`. The live site is untouched.

## The sets

| set | from | clip | strips | on the page |
|---|---|---|---|---|
| `paint` | Zico's real lettering + grey mannequins, edited into five painters (`src/still-paint.png`) | `src/paint.mp4` (take 3 of 3) | 5 strips, 243–522KB, 1.75MB in all | the default cast: each painter back on the spot he was painted against |
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
| painters, 4K, told the size in words (2) | `s1jM0soOAleJaj0RwCfb` | none: 4K tiling, people ~1.5x |
| painters, 2K, a yardstick in the words (3) | `rrPn0LRyw8QKddPMBIr4` | A `6Vj4fT58xIYRhMorSmWk`: the staging kept, still ~1.5x |
| "make them smaller" edit of A (2) | `05M0Crr7d2JnfOB0tr2v` | none: came back unchanged |
| mannequins + A as a reference (3) | `jEbnsJrNtxD9tMEG4YUf` | none: all three copied A, size and all |
| **mannequins only** (3) | `98kMn9lyz8DSOLiGAR2w` | **C `ZystbFqPVHfLqM6CgsUu` → `src/still-paint.png`** |
| painters' loop, 1080p 5s | `ZM6V7jRU03jatB4J1GnR` take 1 · `JRsDJeAtDzHGDmIYmKQ0` takes 2 + 3 | **take 3 `z77HVMkMgSyr8G3qw5jO` → `src/paint.mp4`** |

1,206 credits in sessions 1–20; 880 in session 21 (the painters: 430 on
stills, 450 on three 1080p loops); **1,914 left**. One generation at a
time.

## The painters — how they were made (session 21)

A painter reads as painting only if his brush meets the letter, and a
figure drawn against a stand-in misses Zico's slanted, ragged strokes. So
the painters were painted ONTO the real lettering, all five in one still
and one loop, and each goes back on the page exactly where he was painted:

1. `node tools/paintstage.js make` — the traced title (`js/title-zico.js`
   `all`) in the site's ink on flat `#00FF00`, 2752×1536, and
   `art/crew/paint.stage.json`: the rectangle of the title's svg units
   the frame covers (`view` [-64, -45, 949.6, 530]; 2.9px a unit).
2. `node tools/paintstage.js guides` — the same plus five flat grey
   MANNEQUINS from `art/crew/paint.spec.json`, at the crew's approved
   size (a standing adult 117 units, head r 8; the boy 100), placed and
   posed, brush tips on the letters. **The mannequins are what set the
   size** — see Traps.
3. Nano Banana 2 image2image, 2K, 16:9: `_work/paint-guides.png` + the
   ink cast's `_work/build-c.png` and `src/still-carry.png` as the style.
   The prompt: turn each mannequin into a villager EXACTLY as big as it,
   head where its head is, brush tip where its brush touches; keep every
   letter exactly; flat green. (Full prompt in the generation record's
   history on OpenArt.)
4. `node tools/paintstage.js check <still>` — registers the letters in the
   returned still against the outlines (the chosen one: scale 1.000,
   shift 0,0, IoU 0.93 — the painters' own dark hair and outlines are the
   rest). A still whose letters moved is rejected here.
5. PixVerse V6 image2video, 1080p, 5s, the still as start AND end frame.
   PixVerse kept the still's 43:24 exactly (1920×1072), so the clip is a
   plain scale of the still.
6. `tools/crew.html?v=art/crew/src/paint.mp4&name=paint&figs=5&k=0.65&stage=paint&dil=6`
   — finds the lettering in frame 0 by its outlines (scale and shift per
   axis, searched), lifts it out of every frame (everything darker than
   `ink`=100 inside the outlines grown `dil` px: the letters are ink like
   the painters' linework, so they cannot be keyed), separates the
   figures as connected shapes (`sep=cc`, default with `stage=`), and
   writes the frame's `view` into `paint.json`.
7. `js/crew.js` kind `"paint"`: a figure's box in the frame × `view` = its
   place on the title. `on` is the pen whose stroke brings him in.

Figures, left to right (the strips' numbering): 1 the boy (on `$-left`),
2 the kneeler (`T-bar`), 3 the giant brush (`S`), 4 the sitter on the E
(`S` — she touches up the S), 5 the long brush (`S`).

## How the page does it

- **Frame box**: each figure is a box one frame wide whose *background*
  is the strip, stepped by `background-position`; a mirror is
  `scaleX(-1)` on that box.
- **Painters are placed by their picture, not by data**: box × `view`.
  `dx`/`dy` in SCENE nudge one; a new spot means a new still (his brush
  was painted against THAT ink). They fade in on the spot, never hop (a
  hop lifts the brush off the ink): `hero.js` records each pen as it
  lands (`HANOK_HERO.done`, event `hanok:stroke`) and a painter arrives
  with his `on` pen — the boy as the $'s first bar lands (~1.1s), the
  kneeler with the T's bar (~1.8s), the other three with the S (~4.4s).
  `?paintin=end` brings all five in with the finished title instead. They
  are shown only on Zico's lettering (`HANOK_HERO.zico`): on `?title=hand`
  they would stand on nothing. The loop is the sitters' CSS stepping;
  `?crewt=S` now freezes it too.
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
- **Sizes**: title `min(var(--mark-w, 760px), 92vw, calc(52svh *
  var(--mark-ar, 4)))` (was 560 / 84vw; the svh cap keeps the tall
  lettering on the first screen); people 0.42 of the letters' median
  height, 0.55 on phones.

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

Found making the painters (session 21):

- **Nano Banana 2 at 4K is upscaled in tiles**: the green came back in
  visibly different patches and one tile (the S's top) blurred, in both
  variants. Generate at 2K.
- **The model does not take a size from words.** Told the painters were
  small (then given a yardstick in the picture, "a standing villager's
  head no higher than the tips of the $'s bars"), it drew them ~1.5x the
  approved crew every time. Asked to shrink its own result, it returned
  it unchanged. Given that result as a character reference beside grey
  mannequins, it copied the reference wholesale. **Grey mannequins drawn
  at the right size, with no finished still among the references, is
  what worked** (all five within ~15% of the target).
- **A big brush touching a letter makes the video model PAINT it.** In
  all three loops the giant brush's bristles repainted the S's tail tip as
  wet strands — and the still already had its bristles widening the tip.
  That ink is not in the outlines, so it survives the cut and lies over
  the real tail on the page: it reads as his fresh stroke, and it moves
  as he works. Asking for "no new ink … he never lifts the brush" calmed
  the other four, not him. The small brushes added no ink.
- **WebP is limited to 16383px a side**, and a strip is frames × width:
  the giant brush at `k=0.8` was 21780px wide. `k=0.65` fits (15480).
- **PixVerse keeps the still's aspect**: 2752×1536 in, 1920×1072 out (not
  1080), so `view` needs no crop correction; the cut measures it anyway.

## Next

**The painters are VEN's to judge** (session 21, not yet seen by him):

- the painters themselves, and the arrival: each as his stroke lands
  (default) or all at the end (`?paintin=end`);
- size, spots and number. A spot is baked into the still: moving a
  painter means moving his mannequin in `paint.spec.json` and running the
  pipeline again (steps 2–6 above); dropping one is deleting his SCENE
  line; `dx`/`dy` nudge;
- the giant brush's wet ink over the tail's tip (Traps) — his fresh
  stroke, or a calmer figure;
- the seal sits just above the long-brush woman's brush (`?stamp=0`
  drops it);
- weight: 1.75MB of strips; `q=0.7` or 8fps would cut it.

**Superseded the same day, kept for the record:** VEN's earlier brief —
two laptop-sitters out of sync, carriers delivering to the foot of a
ladder, a ladder man placing a tile that fades (HANDOFF §9ap.4). Its
recipes, in case it comes back:

- **Two laptop-sitters on two letters, legs NOT in sync.** Keep two of
  `ink-1..4`. They come from one clip and start together, so today they
  swing in lockstep; give one a negative `animation-delay` of a whole
  number of frames (e.g. 23 of 60). Zico's tops are slanted brush ends,
  so measure them on the raster and show VEN options.
- **Two carriers walk tiles to the foot of the ladder, leave them and
  walk back.** `deliver()` does all of this already. The pile's site
  becomes *the ladder's foot* instead of the searched bay, which fails on
  the new lettering (`[crew] no clear ground wide enough for the pile`).
- **The man on the ladder places a tile on top of the letter it leans
  on; the tile fades; the loop restarts.** This needs new art: the old
  builders are too small (the ladder is ~0.55 of a letter) and lay tiles
  on air. The review of 2026-09-30:
  - composite a flat CYAN stand-in cut from the real glyph's edge into
    the edit input (not blue: H.264 leaves a teal hairline between blue
    and green);
  - one builder per still, 9:16 for the ladder man, with the ladder
    drawn longer than any cap (clip it at the baseline on the page);
  - he takes his tile from the carriers' pile;
  - the placed tile is its own sprite, faded on the carriers' clock so
    the whole scene stays one loop.
- **Case**: Zico's lettering has a lowercase i (`ch` "i"). `SCENE`
  lookups are case-insensitive, but every contact on a lowercase letter
  differs from the old caps.
- **Weight**: 8fps for the slow sets; drop `x` when no longer wanted.
