# The crew — Zico's villagers, animated

Branch `crew-test`, started 2026-09-30. Zico, 2026-09-29: *"add some of
the same characters on X around the heading. some building the header,
some sitting at the top with laptops, some transporting tiles around"*
and *"a couple villagers running around the village at the bottom"*.

**Done: the four laptop-sitters on the heading, in two styles.** Not
done: the builders, the tile carriers, the village walkers — see
"Next" at the bottom.

## Look at it

`node tools/serve.js`, then:

| URL | what |
|---|---|
| `index.html?crew=x` | the four as painted on @tilesonGIWA |
| `index.html?crew=ink` | the same four repainted in the site's ink and wash |
| `&seat=pairs` | two on the T's bar, two on the E's (default `spread`: one each on T, I, E, S) |
| `&title=song` | $TILES set in Song Myung (Zico's other ask), crew sits on those glyphs |
| `&crewsize=0.7` | figure height as a fraction of the T's (default 0.62) |

Nothing shows without `?crew=`. The live site is untouched.

## What is in this folder

- `x.json`, `ink.json` — manifests `js/crew.js` reads: frames, fps, and
  per figure its strip, size and `seat` (the fraction of the strip where
  it meets the letter).
- `x-1..4.webp`, `ink-1..4.webp` — one strip per figure, 60 frames at
  12fps, 120px tall, ~200KB each. These ship (tools/build.js lifts them
  from the manifests).
- `src/x-laptops.jpg` — Zico's original, 1320×1315, from his post
  https://x.com/tilesonGIWA/status/2098443907319165394 (the original
  resolution came off `pbs.twimg.com/media/HR8rm8tW0AI-RFc.jpg?name=orig`).
- `src/x-laptops.mp4`, `src/ink-laptops.mp4` — the two chosen clips, so
  the strips can be re-cut at another size or rate without regenerating.
- `_work/` (gitignored) — every still, both raw clips, QA contact sheets.

## The pipeline — four steps, all repeatable

1. **Edit, don't generate** (the rule that made the village buildings
   work). Nano Banana 2 `image2image`, 16:9, 2K, Zico's picture as the
   reference: keep the four EXACTLY, remove the roof/house/mountains,
   flat `#00FF00`, seat them in one level row, spaced apart so each can
   be cut on its own. Chose C of 3 (A made one figure cross-legged, B
   turned them to face camera).
2. **The model added an Apple logo to every lid.** A second edit removed
   them (chose 2 of 2). Check for this on every laptop, every time — a
   trademark cannot go on the site.
3. **Ink version**: one more edit of the logo-free still — "Joseon genre
   painting in the manner of Kim Hong-do", composition held EXACTLY, same
   green. Chose A of 3 (C painted paper grain into the green, which does
   not key).
4. **The loop**: PixVerse V6 `image2video`, 720p, 5s, **the same still as
   startFrame AND endFrame**, so the clip ends where it began and the strip
   loops with no seam. Prompt asks for small motion only (typing, head
   tilts, one glance at a neighbour, swinging feet), locked camera, flat
   green held. 70 credits a clip.
5. **Cut**: `tools/crew.html?v=art/crew/src/x-laptops.mp4&name=x&figs=4`
   (and `ink`). Decodes with WebCodecs, keys the green, finds the figures
   by the empty columns between them over ALL frames (so no box jitter),
   packs one strip per figure, POSTs them into `art/crew/` through
   `tools/serve.js` (its one write path besides the widths file).

### The generation record

| step | historyId | chosen resource |
|---|---|---|
| green still (3) | `31BpeXDMBH7zQSTknQIz` | C `hmNCnxWcjTuV5quYvkUf` |
| logos off (2) | `V2LhaUjX3leB3R52fDBD` | 2 `wbsTtj6fjo4XPkMDjwiQ` → the `x` still |
| ink (3) | `OFoorh6SWMxlg5znwBt1` | A `YoLk1NVVyvonjLetDMO0` → the `ink` still |
| x clip | `oU96zJhdPwq2vmhxRqjB` | `PzxAHVoXUjeQSaYkW7G1` |
| ink clip | `iNkqFW58surUEXtC9Kqb` | `eyNhLkyEEQyfhxhOQm1c` |

380 credits in all (8 images at 2K = 30 each, 2 clips at 70). 3,620 left.
The account runs **one generation at a time** — a second submit fails
with `PARALLEL_LIMIT_EXCEEDED`.

## Traps found on the way

- **Chrome defers media loading in hidden tabs.** The MCP tab is hidden,
  so a `<video>` sat at readyState 0 forever. WebCodecs has no such gate:
  mp4box.js demuxes, `VideoDecoder` decodes.
- **H.264 stores colour at half resolution**, so where skin meets the
  green the chroma averages to YELLOW — opaque pixels that are not
  greener than their red. `crew.html` pulls G to the mean of R and B,
  but only within 2px of the edge, so the washes keep their colour.
- **The MCP's screenshots cannot be trusted for this page** — tiled,
  stale or half-painted frames. Use headless Chrome
  (`chrome.exe --headless=new --screenshot`) for stills. It cannot show
  motion: virtual time does not drive the hero's rAF. For motion, drive
  a real-time headless Chrome over CDP (scratchpad `cdp-shots.js`,
  2026-09-30) — that is how the loop was confirmed playing.

## Next

- **Builders** (Zico's tile-laying post, status 2092579024652435896): a
  ladder against a letter, one worker passing tiles up, one laying them.
  Same pipeline; the ladder is a still prop.
- **Carriers**: a walk cycle (a clip of a worker walking in place, side
  on, tiles on an A-frame) moved along the baseline in code.
- **Village walkers**: `art/village/PROMPTS.md` §8 already has the plan
  — two poses flipped, ~10×25px, routes traced on the paths — recast as
  Zico's villagers.
- Weight: ~820KB per style as it stands. 8fps (40 frames) or WebP 0.8
  would roughly halve it once the look is chosen.
