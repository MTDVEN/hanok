# The title — Zico's $TiLES, written stroke by stroke

Zico sent the lettering he wants (2026-09-30, `zico-ref.png`): *"this
image has the example font"*. VEN: it *"needs to look handwritten and as
if it was written with a brush … I need the brush strokes"*, and the
title must still write itself. No font looks like it, so the title IS
Zico's lettering, traced and cut into its 13 brush strokes.

    node tools/title.js --debug     → js/title-zico.js (+ proofs in _work/)

1. **Ink** — the reference's paper is vignetted, so each pixel is judged
   against its LOCAL paper (luma / paper ratio: ≤0.35 ink, ≥0.86 paper;
   the high cut keeps the S-tail's grey dry streaks). Specks under 14px
   more than 14px from other ink are dropped.
2. **Pens** — `pens.json`: each brush stroke's centre-line in writing
   order ($: S-curve, left bar, right bar · T: bar, stem · i: stem, dot ·
   L · E: stem, top, middle, bottom · S with its tail), read off the
   ink's skeleton on a 10px grid. Each pen measures its own brush width
   all along its line (its **band**, below), and every inked pixel
   belongs to the **first pen written whose band covers it**; ink outside
   every band goes to the nearest pen. Each share reaches 1.6px under its
   neighbours so no seam shows where strokes meet.
3. **Trace** — each share → a vector outline (marching squares on the
   soft alpha, simplified), plus the whole word as ONE outline (`all`)
   that replaces the 13 shapes when the pen lifts. The pen's mask width
   reaches its furthest pixel. Crisp at any size, exact to Zico's strokes.

On the page (`js/hero.js`, ZICO mode, the default): each stroke's ink
sits behind a mask holding its pen; the pens are drawn in order (pace
0.95 ms per unit, 170–560 ms a stroke), the nib rides the pen, then the
masks come off, `all` takes over and the seal stamps. `?title=hand` is
the earlier hand-drawn brush lettering; `?titlefont=` / `?title=song` a
webfont written through a mask. The box's aspect (`--mark-ar`) caps the
width by the viewport height, so the tall mark stays on the first screen.

To adjust a stroke: edit its points in `pens.json` and re-run — the
`_work/2-pens.png` proof colours each pen's share with its centre-line,
and `_work/3-strokes.png` shows the word after each of the 13 strokes
(written ink dark, the stroke just landed red, ink still to come pale
grey — a hole in a written stroke shows as grey inside dark).

## Every stroke lands whole (2026-09-30)

VEN: *"during its animation parts of the strokes are missing … the "S"
shape of the "$" has rendered in but the lines on top of that have not
rendered in yet, you can see a gap in the bottom of the "S" shape where
the line is supposed to cross over. I want each stroke to be full with
no gaps."* The cause was the ownership rule: every pixel went to its
NEAREST pen, which cuts a crossing down the bisector — the $'s S (written
first) had a diamond-shaped hole at each of its crossings with the bars
until the bars were written, the T's bar a notch where its stem joins,
the E's stem bites where its arms join.

Now each pen scans across the ink on both sides of every point of its
centre-line (1px apart, dry-brush gaps up to 2px bridged) for how far
its brush reaches there. Where another stroke crosses, that scan runs
off along the other stroke — a spike as long as the crossing is wide —
so the reach is OPENED (running min, then running max, 20px each way):
spikes go, the brush's own swell and taper stay. A pixel inside that
band belongs to the first pen whose band covers it. So a crossing lands
with the first stroke through it and the later stroke is drawn over ink
that is already there; nothing lands early either, because a band is
the stroke's own width (checked on `3-strokes.png` and on the page).

**See it:** `?titlet=770` freezes the writing 770ms in — the $'s S down,
its bars still to come (`?titlet=1790` the T's bar, `?titlet=3120` the
E's stem). The one straight edge left mid-write is the S's top end,
where its centre-line stops on the right bar: that is the end of the
stroke, filled 0.4s later when the bar lands, not a gap.

## Timing

Each pen takes 0.95 ms per unit of its length, clamped to 170–560 ms,
after a 300 ms lead-in and with 50 ms between pens. The word writes in
**≈4.4 s**; the seal stamps 160 ms after the last pen lifts, and the
hero is flagged written 220 ms after that. HANDOFF §9ap.6 has every
stroke's length and time.

## Open — waiting on VEN's sign-off (2026-09-30)

- **The size**: `min(var(--mark-w, 760px), 92vw, calc(52svh *
  var(--mark-ar, 4)))`. `?mark=N` tries another width without an edit.
- **The speed** (above).
- **The 韓 seal**: kept for now, scaled by `ZK` 1.45. `?stamp=0` shows
  the title without it.
- **The lowercase i** is Zico's, and it is kept.
- **A higher-resolution original from Zico.** The reference is 768px
  wide, so dry-brush speckle under 14px² is dropped.

## Traps

- **Douglas-Peucker collapses a closed loop.** Its first and last points
  coincide, so the whole contour reads as one zero-length line; split
  each loop at the point furthest from its start and simplify the halves.
- **Shapes that touch leave seams.** Each is anti-aliased along the join,
  and a faint light line shows while the rest of the word is still being
  written. The 1.6px overlap and the single `all` outline at pen-lift fix
  it.
- **The S's tail is grey, not black.** Put the paper cut much below 0.86
  and the dry streaks drop out, leaving the tail ending in a gap.
- **The reference's paper is vignetted.** One global threshold eats the
  corners; judge each pixel against its local paper.
- **Patch scripts**: `s.replace(a, b)` with a `b` containing `$'` splices
  the file. Always pass a function: `s.replace(a, () => b)`.
- **A band's "past the end" test belongs at the ends only.** On the
  outside of a curve the normals fan out, so a pixel between two of them
  sits more than half a sample along from its nearest — testing that
  everywhere left a 1px dotted fringe of the later pen's ink along the
  earlier stroke's edge.
