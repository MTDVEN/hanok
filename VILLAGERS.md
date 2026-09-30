# Villagers — start here

The job: the animated **villagers walking the village** in the last section
of the page (`#village`, "Every $100k raises a roof"). This page is the short
way in; `HANDOFF.md` is the long history, if you ever need it.

Work on the **`crew-test`** branch; it has everything below. Do not push to
`main`: `main` deploys straight to the live site (tilesongiwa.com via Vercel).
Every push to `crew-test` gets its own preview at
https://hanok-git-crew-test-mtdvens-projects.vercel.app/

## Run it

No build step and no packages, just Node:

    node tools/serve.js
    → http://localhost:8137/index.html?crew=ink&motion=1

Scroll to the bottom. **The villagers only run with `?crew=ink`** (they are
still an opt-in test). The other switches that matter:

| switch | what it does |
|---|---|
| `?crew=ink` | turns the villagers (and the heading crew) on |
| `&cast=village` | only the villagers, no heading crew |
| `&motion=0` | the reduced-motion version (villagers stand still on their paths). Motion is ON by default, whatever the OS setting |
| `&preview=0` | hides the market-cap slider (bottom left). With it on, pressing `+` raises roofs, so you can see villagers walk among houses |

## Where things are

| file | what |
|---|---|
| `js/villagers.js` | **the villager engine** — who walks which path (`WALKERS`), how fast, pauses, turning, depth sorting with the houses |
| `js/village.js` | the village itself: the painted plate, the houses (`.v-house`), the sleeping Z's |
| `css/site.css` | styles: search for `VILLAGERS` (`.v-walker`, `.v-walker__win`) and `crew-frames` (the frame stepping) |
| `art/crew/vill-1..3.webp` + `art/crew/vill.json` | the three walk cycles (a man with a tile-loaded A-frame, a woman with tiles, a running child): one sprite strip each, 60 frames at 12fps, and the manifest describing them |
| `art/village/routes.json` | the walking routes (4), as points along the painted dirt paths, in fractions of the plate |
| `tools/routes.js` | finds those routes on the painting: `node tools/routes.js --debug` draws them over the plate in `art/village/_work/routes-debug.png`. Add a route = add waypoints to `ROUTES` in that file and re-run |
| `tools/crew.html` | turns a green-screen video into sprite strips (open it on the dev server) — see "New art" below |
| `art/crew/src/villagers.mp4` | the source clip the current strips were cut from |
| `art/village/field.png` | the valley plate (1024x717) |

## How the engine works (js/villagers.js)

- Each villager is a box one frame wide whose **background image is the
  strip**; stepping `background-position` plays the walk cycle (CSS
  `crew-frames` with `steps()`). Facing left = `scaleX(-1)` on that box.
- A small `requestAnimationFrame` loop moves each box along its route
  (`transform: translate`), at a **pace measured off the strip**
  (body-heights per second: `pace` in `WALKERS`) so the feet don't slide.
  Change the pace and they skate.
- At a route's end a villager stands still for 1.2–2.6 s (`PAUSE`), turns,
  and walks back.
- **Depth**: houses and villagers share one z-order by their feet's y, so a
  villager walking up the valley passes *behind* a house.
- It only runs while the village is on screen (IntersectionObserver); with
  reduced motion they stand still on their paths.

## New art (if you need other villagers or actions)

The pipeline used so far, all in `art/crew/README.md` (section "The
pipeline"):

1. A still of the figures on flat `#00FF00` green, in the site's ink-and-wash
   style (made with OpenArt, Nano Banana 2 image-to-image).
2. A 5 s video of them **walking in place** (camera tracking with them), with
   the same still as the first and last frame so it loops seamlessly
   (OpenArt, PixVerse V6).
3. `tools/crew.html?v=art/crew/src/<clip>.mp4&name=<set>&figs=<n>&k=0.14`
   keys out the green and writes one strip per figure + `<set>.json` into
   `art/crew/`.

Measure the new pace (steps x stride) before wiring it into `WALKERS`.

## House rules

- The look is ink and wash on parchment. Pictures come from the image
  generator and are composited, **never hand-drawn in SVG**.
- Keep old versions reachable behind a URL switch rather than deleting them;
  the owner compares options side by side.
- `tools/build.js` builds the deployable `dist/` from an allow-list, so a new
  file that the page needs must be added there, or the deploy silently
  lacks it.
