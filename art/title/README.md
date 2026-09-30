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
   ink's skeleton on a 10px grid. Every inked pixel belongs to the
   nearest pen; each share reaches 1.6px under its neighbours so no seam
   shows where strokes meet.
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
`_work/2-pens.png` proof colours each pen's share with its centre-line.
