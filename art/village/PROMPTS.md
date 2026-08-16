# Village art — the prompt sheet (2026-08-13, session 6)

**Seven images. One valley plate with a branching footpath, and six
transparent building sprites that get overlaid onto it.**

Everything here is paste-ready. Nothing to assemble. Work top to
bottom. Full context in HANDOFF §9e.

---

> ## ⚑ ALL SEVEN IMAGES NOW EXIST (2026-08-14, session 9)
>
> They were made programmatically over the OpenArt MCP server, not by
> pasting into a canvas app, and **not the way the rest of this file
> describes.** The prompts below still stand and are still the source
> for a re-roll — but read this first, because the *method* changed and
> it is the method that made it work.
>
> **Tool.** VEN is on **OpenArt**, not Recraft. Model
> **`nano-banana-2`**, mode `image2image`, 1K square, 20 credits an
> image, up to 8 a batch. There is **no negative-prompt field** and **no
> transparency toggle**, so every negative in this file was folded into
> the positive prompt as "Avoid entirely: …", and the background is the
> flat mid-grey fallback in every case.
>
> **The plate.** `valley0.png` was already right. It was *edited*, not
> regenerated: "keep every part unchanged except the meadow floor, keep
> the existing trunk path and continue it". The v1 failure — mist gone,
> mountains flattened, celadon gone bright — never recurred, because an
> edit model with an edit instruction has nothing to regenerate. Four
> candidates, all four kept the mountains. Kept as
> `field-square.png`; the other three are in `alt/`.
>
> **The buildings — this is the big one.** Generating a building from
> its prompt gave a beautiful, useless picture: 75% of frame instead of
> 30%, ruled tile by tile, an architectural study that would never sit
> inside the valley painting. The reference crop was ignored because the
> prompt told the model not to copy its composition.
>
> So the buildings were not generated at all. **The matted reference
> crops WERE the buildings** — right scale, right looseness, right
> angle, right hand, because they are cut out of the valley painting
> itself. The winning instruction is one line:
>
> > *Keep the building EXACTLY as it is and do not redraw it. Erase the
> > ground, the grass and the feathered halo around it and replace all
> > of it with one flat even mid-grey field. Keep one soft grey-green
> > shadow beneath it.*
>
> Five of six came out first batch. Detail density now matches across
> the whole set for free — they were all painted at the same distance in
> the same picture — which is the thing §3's frame-fill percentages were
> straining to achieve by hand.
>
> **`b-walled` is the exception** and took three rounds, because a
> boundary wall seen from above reads as a tray. Round 1 was a tabletop
> slab three times too wide; round 2 fixed the proportions but left a
> glaring white courtyard that pulled the eye across the whole village;
> round 3 fixed it with *"NOT a tray"* and *"NOT white — the courtyard
> is bare trodden earth, clearly DARKER than the hanji walls"*, stated
> as two named faults rather than buried in a list. It was built by
> *adding* a wall and an outbuilding to the accepted `b-house`, so it
> stays in the same hand. Round-1 output is kept at `alt/b-walled-v1.png`.
>
> **Transparency** is done by `node tools/cutout.js in.png out.png
> --debug` — the headless half of `prep.html`. Border flood, soft alpha,
> unpremultiply the known grey out of the edge, drop specks, trim. The
> trim is what makes the bottom edge the ground line. `--debug` writes
> the same cut over flat magenta; **look at that, not the RGBA file** —
> two of the twelve candidates had the key eat through a roof whose
> slate grey drifted too close to the background, and that is invisible
> against white.
>
> **Placement is no longer hand-dragged.** `node tools/plots.js --write`
> reads the plate and finds the clearings, then fills the rest along the
> lanes and patches `PLOTS` into `js/village.js`. `node tools/render.js
> [roofs]` draws the whole village headlessly for checking. See HANDOFF
> §9h.

---

## 0. The reference images. They are now the whole mechanism.

**Custom styles are behind a higher Recraft tier than VEN pays for
(2026-08-14), so there is no style step.** Attach the matching
**`art/village/ref/matted/ref-*.png`** as an image reference on every
single building generation instead.

That is a smaller loss than it sounds. The per-generation reference was
always the thing that actually held the viewing angle — wording never
did it alone. What the style bought on top was *agreement across the
set*, and that now has to be checked by eye after each building instead
of being guaranteed up front: accept one, then hold every later one
against it (§5, check 3). If they stop agreeing after three or four
rolls each, take the one-generation fallback at the bottom of §6, which
buys the agreement back in a single image.

`node tools/refmat.js` produced the `matted/` set from the raw crops. It
floats each building on flat mid-grey, feathers away the rectangular
crop edge, and — the part that matters — **scales it to exactly the
frame fill its own prompt asks for**, so the reference and the wording
describe the same composition. The raw crops sit the building at ~60% of
frame against prompts asking for 25–46%, and a reference wins that
argument every time.

The originals are still there and unchanged:

| attach this on the generation | what it is | for |
|---|---|---|
| `ref/matted/ref-house.png` | the centre hanok | `b-house` |
| `ref/matted/ref-house2.png` | the right-hand hanok | `b-house` alt |
| `ref/matted/ref-lhouse.png` | the L-shaped hanok | `b-lhouse` |
| `ref/matted/ref-thatch.png` | the thatched farmhouse | `b-thatch` |
| `ref/matted/ref-pavilion.png` | the open pavilion | `b-pavilion` |
| `ref/matted/ref-gate.png` | the two-storey gate | `b-gate` |

**Never reference `hand drawn reference.jpg` or the four journey
paintings for a village building.** The old instruction in §6b said to
build the style from them, and *that is what caused the last set to
fail.* Those are close-up, near-eye-level architectural studies, and the
rejected `b-*.png` files are faithful reproductions of them — the model
did exactly what it was told. The matted crops make its target "a small
pale hanok seen from above" instead.

`b-walled.png` has no reference of its own — generate it last and use
your own accepted `b-lhouse.png` as its reference.

**Everything is 1024x1024 square.** Plate and buildings both.

---

## 1. THE PLATE — `art/village/field-square.png`

Run this **image-to-image from `valley0.png`** at a strength **clearly
lower than feels right**. The whole job is to touch the valley floor and
nothing else.

> **v1 over-produced (2026-08-14, first roll).** It asked for ~20
> clearings and 15+ spurs and got them: two near-mirrored halves of
> path, clearings scattered as even pale discs with no spur attached,
> reading as a circuit board. Worse, the strength was high enough to
> regenerate the whole frame — the mist between the ridges was gone, the
> mountains flattened into a back wall, the bowl became a plain and the
> celadon went bright green. VEN compared it against `valley0.png` and
> preferred the original, correctly. v1 is kept at the bottom of this
> section.
>
> **The tell is never the paths. It is the mountains.** If the ridges,
> the mist or the green have changed at all, the strength is too high,
> whatever the floor looks like.

```
A traditional Korean ink-and-watercolour landscape on aged parchment, seen from high above and looking steeply down into a wide empty highland valley. Keep the source picture almost exactly as it is: the same layered grey granite ridges and crags fading into soft mist along the top, the same dark pines and pale boulders crowding down both side edges and both bottom corners, the same deep enclosed bowl, the same muted sepia, celadon and blue-grey palette, the same thin grey-brown ink line over flat translucent washes, the same soft diffuse overcast light and the same warm parchment showing through every wash. Do not flatten the valley, do not push the mountains back into a wall, do not clear the mist, do not brighten or saturate the green. The only thing that changes anywhere in the picture is the floor of the valley.

Worn into the meadow floor is a small network of pale sandy footpaths, painted as soft dry-brush strokes with broken feathered edges. One trunk path enters at the very bottom edge of the picture, exactly at the centre, and climbs a short way before dividing low into two unequal lanes. The left lane wanders out and up and divides once; the right lane runs further and divides twice, at heights clearly different from the left. Four or five lanes in all, no more. Every lane is a soft irregular curve, never straight, thinning and paling as it climbs until it dissolves into the grass short of the mist. The two sides of the picture must not mirror each other.

Along these lanes the grass opens into about ten small flat clearings of bare worn pale earth — a scuff of paler ground with a soft trodden edge, barely more than a thinning of the grass, never a bright disc and never a hard oval. Each one sits at the end of a short thin spur or tucked directly against the side of a lane; not one of them floats alone in open grass. They are unevenly spaced, some close together, some far apart. The clearings low in the picture are the largest, those higher up much smaller, so the field falls away with distance. Every clearing is empty and level, cleared and waiting, with nothing standing on it.

The valley is otherwise completely empty and unbuilt: no houses, no roofs, no walls, no fences, no gates, no bridges, no people, no animals. The paths never cross one another, never loop back, never close a circuit and never form a ladder of matching pairs facing each other across a lane. Only the trunk touches the bottom edge; no path reaches the left, right or top edge. All the clearings sit well below the middle of the picture, and the whole upper third stays misty ridge, crag and pine.
```

**Plate negative prompt** (this one only — the buildings get a
different one):

```
buildings, houses, huts, roofs, hanok, temples, pagodas, walls, fences, gates, bridges, boats, rice paddies, cultivated fields, straight lines, grid, ladder pattern, crossing paths, closed loops, symmetrical, mirrored halves, branching diagram, circuit board, tree diagram, root system, veins, polka dots, evenly spaced spots, scattered white discs, bright white patches, paved road, river, stream, water, lake, people, figures, animals, text, watermark, signature, border, frame, eye-level view, low angle, horizon, blue sky, sunset, snow, autumn foliage, hard shadows, heavy saturation, vivid green, flat plain, open plateau, aerial map, plan view, aerial photograph, 3d render
```

**Judging it — check in this order:**

1. **The mountains, the mist and the green.** Hold it against
   `valley0.png`. Changed? Strength too high, re-roll lower. Nothing
   about the floor is worth losing the atmosphere for.
2. **Symmetry.** Do the two halves mirror? Re-roll — worn paths never do.
3. **The clearings.** Do they sit *on* the paths, or float in the grass?
   Floating ones are polka dots and read as a diagram.
4. **The trunk enters at the bottom centre** — the journey's road
   arrives there and the gate stands on it.
5. **Clearings sit below the middle.** Anything higher gets cropped and
   then feathered away.

Don't count them. A network that reads as village lanes beats an
accurate one, and plots get placed on whatever it actually produces.
**Spare clearings are the feature** — an empty pad next to a full one is
what makes the field read as room to grow.

**If two lower-strength rolls still drift**, stop re-rolling and switch
to the **area-edit brush** on `valley0.png` instead: mask just the
meadow floor and paint the lanes in, one at a time. A brush cannot drift
by construction, which is the same reason `patch.js` exists. Slower,
guaranteed to keep the painting VEN already likes.

<details>
<summary><strong>v1 — the prompt that produced the circuit board. Kept, not deleted.</strong></summary>

```
A traditional Korean ink-and-watercolour landscape on aged parchment, seen from high above and looking steeply down into a wide empty highland valley. Layered grey granite ridges and crags fade into mist across the top third; dark red pines and pale grey boulders crowd down both the left and right edges and both bottom corners, framing the valley floor like a bowl. The floor itself is one broad open meadow of soft sage and celadon green, faintly terraced with dry contour strokes, tufts of grass flicked in here and there, the warm parchment tone showing through every wash. Muted sepia, celadon and blue-grey palette, thin grey-brown ink line over flat translucent washes, soft diffuse overcast light, no hard shadows, no sky, no horizon line. The valley is completely empty and unbuilt: no houses, no roofs, no walls, no fences, no gates, no bridges, no people, no animals.

Worn into the meadow is a branching network of pale sandy footpaths, painted as soft dry-brush strokes with broken feathered edges. One trunk path enters at the very bottom edge of the picture, exactly at the centre, and climbs a short way before dividing low into two lanes. Each lane curves outward and upward in a long lazy S, and each divides again higher up, at different heights and on opposite sides, into three or four lanes in all. Every lane is a soft curve, never straight, and every lane grows thinner and paler as it climbs, dissolving into the grass rather than stopping at a point.

Branching off these lanes are many short thin spurs — fifteen or more — alternating irregularly to one side and then the other, each only a stub a small fraction of its lane's length, each much finer than the lane it leaves. Where a spur fades out, and here and there directly beside a lane with no spur at all, the grass opens into a small flat clearing: a shallow flattened oval of bare worn pale sandy earth, free of grass tufts, its edge soft and trodden rather than drawn, with the contour lines stopping short of it. There are around twenty of these clearings, standing well apart with open grass between them, spread across the meadow in three loose depth bands. The clearings low in the picture are the largest and their spurs the thickest; the clearings higher up are much smaller and their spurs are hair-thin, so the field falls away with distance. Every single clearing is empty and level, cleared and waiting, with nothing standing on it.

The paths never cross one another, never loop back, never close a circuit, and never form a ladder of matching pairs facing each other across a lane. Only the trunk touches the bottom edge; no path reaches the left, right or top edge. All the clearings sit in the lower half of the picture, none higher than halfway up and none in the front sixth, and none of them touch the pines or boulders at the sides. The whole upper half is misty ridge, crag and pine.
```

</details>

**Save it as `art/village/field-square.png`.** Do not run the plate
through `prep.html` — that would save it square under the wrong name
and put every building 30% of a plate-height off its ground line.

---

## 2. SHARED NEGATIVE PROMPT — paste on all six buildings

```
eye-level view, low angle, worm's eye view, looking up at the eaves, seen from below, soffit visible, close-up, architectural study, elevation drawing, photograph, photorealistic, 3d render, cgi, sharp focus, dense detail, intricate detail, individually drawn roof tiles, tile ends, dancheong, polychrome brackets, carved bracket sets, painted rafters, wood grain, lattice windows, individual stone courses, ground, grass, meadow, earth, soil, dirt, gravel, rocks, boulders, cliff, hillside, stone terrace, retaining wall, stone stairway climbing a hillside, path, road, trees, pine trees, bushes, shrubs, fruit trees, foliage, garden, vegetable plot, jars, landscape, background scenery, mountains, mist, clouds, sky, horizon, circular ground patch, oval of grass beneath, base plate, diorama base, tabletop, hard drop shadow, long cast shadow, black shadow, sticker edge, white halo, outline glow, paper texture, parchment grain, vignette, darkened corners, stained paper, torn paper edge, border, frame, people, figures, animals, lanterns, banners, text, watermark, signature, second building, cropped, cut off
```

It bans *hard / long / black* shadow but never plain "shadow" — each
building needs its own soft one. It deliberately does not ban "wall"
or "fence", because `b-walled` needs a boundary wall; the other five
ban those in their own text.

---

## 3. THE SIX BUILDINGS

The first and last paragraphs are nearly identical across all six **on
purpose** — that repetition is what makes them agree with each other
and with the plate. Don't trim or reword it per building.

The frame-fill percentage at the end of each is the building's real
size, not a composition preference. All six are painted at the same
apparent distance, so the compound doesn't get more detail per metre
than the hut. **Don't equalise them, and don't rescale afterwards in an
editor** — that reintroduces exactly the density mismatch that killed
the last set.

### `b-house.png` — small hanok house

```
Traditional Korean ink-and-watercolour painting, the same hand as a wide misty valley landscape: thin dry grey-brown ink outlines of even, modest weight, flat translucent washes inside them, soft brush edges, muted sepia and celadon palette, no gloss, no gradients, no digital shading. Seen from high above at a steep angle, looking down onto it from the hillside opposite — the whole roof plane is visible as one broad foreshortened shape including its far slope, the ridge sits high in the silhouette, the vertical timber posts stay vertical, and only a shallow band of the front wall and one gable end shows beneath the eaves. The underside of the eaves, the soffit and the bracket sets are never visible. One soft diffuse overcast light with no sun and no lit side and shadow side; the darkest tone anywhere in the picture is a mid grey-brown, never black.

A single small one-storey hanok house, three bays wide and one room deep, standing on a low pale grey-buff stone platform with three shallow steps at the front. A hipped-and-gabled tiled roof in slate blue-grey with a darker charcoal ridge, deep overhanging eaves, corners sweeping gently upward into small pointed tips, and a small triangular ochre timber gable panel at each end, so the whole building reads as one low wide chevron sitting on a pale bar. Walls of pale warm hanji buff panelled between slim reddish-brown timber posts and lintels, with three plain sliding doors along the long front side and a narrow raised timber verandah in front of them. About three fifths as tall as it is wide.

Painted small and loose, the way one small building is painted inside a wide landscape, not as an architectural study: a whole roof slope is about a dozen fine ruled parallel strokes and never tile by tile, doors and windows are plain rectangles with a simple frame, no lattice weave, no carved brackets, no dancheong colour, no signboards, no people. Pale and high-key, as though seen across a wide valley in soft misty air — hanji walls barely darker than cream, light blue-grey roof with a faint green cast, warm mid-brown timber, pale grey stone. Beneath it and touching its base, one soft grey-green watercolour shadow pooled tight under the eaves and against the stone platform, nearly symmetrical, leaning only very slightly forward and to the left, no wider than the roof above it and never spreading downward into a pool, a disc or a patch; its lowest edge is directly under the front of the building. The house stands on level unseen ground with the foot of its far side visible, so its footprint closes into a flat shape. Nothing else is in the picture at all: no ground, no grass, no earth, no rocks, no trees, no bushes, no garden, no fence, no wall, no path, no mist, no sky, no horizon, no second building. Completely transparent background; if transparency is not possible, one flat even mid-grey field, the same tone from corner to corner and right out to all four edges, with no texture, no paper grain, no vignette and no border. The house stands dead centre with its footprint balanced left and right about the centre of the frame, filling about 30% of the frame's width, with a wide empty margin on all four sides — every eave tip and roof corner well clear of the edges, nothing cropped, nothing touching any edge.
```

### `b-gate.png` — two-storey gate pavilion

```
Traditional Korean ink-and-watercolour painting, the same hand as a wide misty valley landscape: thin dry grey-brown ink outlines of even, modest weight, flat translucent washes inside them, soft brush edges, muted sepia and celadon palette, no gloss, no gradients, no digital shading. Seen from high above at a steep angle, looking down onto it from the hillside opposite — the whole upper roof plane is visible as one broad foreshortened shape including its far slope, the ridge sits high in the silhouette, the vertical timber posts stay vertical, and only a shallow band of the front face and one side face shows beneath each roof. The underside of the eaves, the soffit and the bracket sets are never visible. One soft diffuse overcast light with no sun and no lit side and shadow side; the darkest tone anywhere in the picture is a mid grey-brown, never black.

A single two-storey Korean gate pavilion built to straddle a village path. Its lower storey is four heavy reddish-brown timber posts standing on low pale grey-buff stone footings, with pale warm hanji panels to either side of one wide central passage; the passage is painted as a deep cool shaded recess with the far door frame visible inside it, so it is never a see-through hole. Above sits an open upper storey with a plain low timber balustrade and pale panels between slender posts, and a small skirt roof projects over the passage below it. Two tiled roofs, both slate blue-grey with darker charcoal ridges, deep overhanging eaves and corners sweeping upward into small pointed tips, so the whole building reads as a compact tower with two stacked chevrons and a dark doorway at its foot. The tallest building of the set: about nine tenths as tall as it is wide.

Painted small and loose, the way one small building is painted inside a wide landscape, not as an architectural study: a whole roof slope is about a dozen fine ruled parallel strokes and never tile by tile, the balustrade is a few short verticals, no lattice weave, no carved brackets, no dancheong colour, no signboards, no people. Pale and high-key, as though seen across a wide valley in soft misty air — hanji panels barely darker than cream, light blue-grey roofs with a faint green cast, warm mid-brown timber, pale grey stone. Beneath it and touching its base, one soft grey-green watercolour shadow pooled tight against the stone footings, nearly symmetrical, leaning only very slightly forward and to the left, no wider than the roof above it and never spreading downward into a pool, a disc or a patch; its lowest edge is directly under the front of the gate. The gate stands on level unseen ground with the foot of its far posts visible, so its footprint closes into a flat shape. Nothing else is in the picture at all: no ground, no grass, no earth, no rocks, no trees, no bushes, no garden, no fence, no wall running away from it on either side, no path, no mist, no sky, no horizon, no second building. Completely transparent background; if transparency is not possible, one flat even mid-grey field, the same tone from corner to corner and right out to all four edges, with no texture, no paper grain, no vignette and no border. The gate stands dead centre with its footprint balanced left and right about the centre of the frame, filling about 36% of the frame's width, with a wide empty margin on all four sides — every eave tip and roof corner well clear of the edges, nothing cropped, nothing touching any edge.
```

### `b-thatch.png` — thatched farmhouse

```
Traditional Korean ink-and-watercolour painting, the same hand as a wide misty valley landscape: thin dry grey-brown ink outlines of even, modest weight, flat translucent washes inside them, soft brush edges, muted sepia and celadon palette, no gloss, no gradients, no digital shading. Seen from high above at a steep angle, looking down onto it from the hillside opposite — the whole roof is visible as one broad foreshortened shape including its far side, the rounded ridge sits high in the silhouette, the vertical timber posts stay vertical, and only a shallow band of the front wall and one end wall shows beneath the overhang. The underside of the overhang and the soffit are never visible. One soft diffuse overcast light with no sun and no lit side and shadow side; the darkest tone anywhere in the picture is a mid grey-brown, never black.

A single small farmhouse under a thick rounded golden thatched roof: a soft heavy dome of wheat-coloured straw with rounded corners and a rounded ridge, no ridge tiles and no pointed tips anywhere, its lower edge slightly ragged, one or two horizontal binding ropes, brimming well out over the walls on every side, so the whole building reads as a soft golden loaf resting on a low pale bar. Beneath it a low one-storey building three bays wide, its walls pale warm hanji buff and earth-toned mud plaster panelled between slim reddish-brown timber posts, with two plain doors along the long front side, standing on a low pale grey-buff stone footing. The thatch is the only warm gold in the picture and the ink line drawn around it stays thin. About three quarters as tall as it is wide.

Painted small and loose, the way one small building is painted inside a wide landscape, not as an architectural study: the thatch is a flat golden wash with a dozen or so sweeping strokes and never straw by straw, doors and windows are plain rectangles with a simple frame, no lattice weave, no individual stones, no people. Pale and high-key, as though seen across a wide valley in soft misty air — warm pale ochre-gold thatch, walls barely darker than cream, warm mid-brown timber, pale grey stone. Beneath it and touching its base, one soft grey-green watercolour shadow pooled tight under the overhang and against the stone footing, nearly symmetrical, leaning only very slightly forward and to the left, no wider than the roof above it and never spreading downward into a pool, a disc or a patch; its lowest edge is directly under the front of the house. The house stands on level unseen ground with the foot of its far side visible, so its footprint closes into a flat shape. Nothing else is in the picture at all: no ground, no grass, no earth, no rocks, no dry stone walls, no trees, no fruit trees, no bushes, no vegetable garden, no jars, no fence, no path, no mist, no sky, no horizon, no second building. Completely transparent background; if transparency is not possible, one flat even mid-grey field, the same tone from corner to corner and right out to all four edges, with no texture, no paper grain, no vignette and no border. The house stands dead centre with its footprint balanced left and right about the centre of the frame, filling about 28% of the frame's width, with a wide empty margin on all four sides — the full overhang of the thatch on every side well clear of the edges, nothing cropped, nothing touching any edge.
```

### `b-pavilion.png` — open pavilion on bare posts

```
Traditional Korean ink-and-watercolour painting, the same hand as a wide misty valley landscape: thin dry grey-brown ink outlines of even, modest weight, flat translucent washes inside them, soft brush edges, muted sepia and celadon palette, no gloss, no gradients, no digital shading. Seen from high above at a steep angle, looking down onto it from the hillside opposite — the whole roof plane is visible as one broad foreshortened shape including its far slope, it dominates the silhouette, the vertical timber posts stay vertical, and the posts and deck read as a shallow band beneath it. The underside of the eaves, the soffit and the bracket sets are never visible. One soft diffuse overcast light with no sun and no lit side and shadow side; the darkest tone anywhere in the picture is a mid grey-brown, never black.

A single small open pavilion with no walls at all: six slim reddish-brown timber posts standing on a raised pale timber deck, which stands in turn on a low pale grey-buff stone platform with two shallow steps. Over them a hipped-and-gabled tiled roof in slate blue-grey with a darker charcoal ridge, deep overhanging eaves, corners sweeping upward into small pointed tips, and a small triangular ochre gable panel at each end, so the whole building reads as one chevron roof resting on thin legs. Between the near posts, paint the shaded timber underside of the roof, the far posts and the far edge of the deck in soft mid-brown, clearly darker than the background, so that no part of the pavilion is see-through and there is no hole anywhere in its silhouette. The smallest building of the set: about two thirds as tall as it is wide.

Painted small and loose, the way one small building is painted inside a wide landscape, not as an architectural study: the roof slope is about a dozen fine ruled parallel strokes and never tile by tile, the posts and railing are plain tapering strokes, no carved brackets, no dancheong colour, no individual stones, no people. Pale and high-key, as though seen across a wide valley in soft misty air — light blue-grey roof with a faint green cast, warm mid-brown timber posts and deck, pale grey stone. Beneath it and touching its base, one soft grey-green watercolour shadow pooled tight under the deck and against the stone platform, nearly symmetrical, leaning only very slightly forward and to the left, no wider than the roof above it and never spreading downward into a pool, a disc or a patch; its lowest edge is directly under the front of the pavilion. The pavilion stands on level unseen ground with the foot of its far posts visible, so its footprint closes into a flat shape. Nothing else is in the picture at all: no ground, no grass, no earth, no rocks, no trees, no bushes, no garden, no fence, no wall, no path, no mist, no sky, no horizon, no second building. Completely transparent background; if transparency is not possible, one flat even mid-grey field, the same tone from corner to corner and right out to all four edges, with no texture, no paper grain, no vignette and no border. The pavilion stands dead centre with its footprint balanced left and right about the centre of the frame, filling about 25% of the frame's width, with a wide empty margin on all four sides — every eave tip and roof corner well clear of the edges, nothing cropped, nothing touching any edge.
```

### `b-lhouse.png` — L-shaped hanok

```
Traditional Korean ink-and-watercolour painting, the same hand as a wide misty valley landscape: thin dry grey-brown ink outlines of even, modest weight, flat translucent washes inside them, soft brush edges, muted sepia and celadon palette, no gloss, no gradients, no digital shading. Seen from high above at a steep angle, looking down onto it from the hillside opposite — both roof planes are visible as broad foreshortened shapes including their far slopes, both ridges read clearly, the vertical timber posts stay vertical, and only a shallow band of wall shows beneath the eaves. The underside of the eaves, the soffit and the bracket sets are never visible. One soft diffuse overcast light with no sun and no lit side and shadow side; the darkest tone anywhere in the picture is a mid grey-brown, never black.

A single L-shaped one-storey hanok: two wings of unequal length meeting at a right-angled corner, the longer wing running away to the left and the shorter wing turning towards the viewer, so the whole building reads as an angular wedge with a clearly visible inner corner. One continuous tiled roof in slate blue-grey follows the L, a darker charcoal ridge along each wing, a valley where the two ridges meet, deep overhanging eaves, corners sweeping upward into small pointed tips, and a small triangular ochre gable panel at each open end. Walls of pale warm hanji buff panelled between slim reddish-brown timber posts, a row of plain sliding doors along the inner face of each wing, and a narrow raised timber verandah running in front of them, the inner corner sitting in soft shade. The whole house stands on one low pale grey-buff stone platform with a short flight of steps in the crook of the L. About half as tall as it is wide.

Painted small and loose, the way one small building is painted inside a wide landscape, not as an architectural study: a whole roof slope is about a dozen fine ruled parallel strokes and never tile by tile, doors and windows are plain rectangles with a simple frame, no lattice weave, no carved brackets, no dancheong colour, no signboards, no people. Pale and high-key, as though seen across a wide valley in soft misty air — hanji walls barely darker than cream, light blue-grey roofs with a faint green cast, warm mid-brown timber, pale grey stone. Beneath it and touching its base, one soft grey-green watercolour shadow pooled tight under the eaves of both wings and against the stone platform, balanced across the whole footprint and nearly symmetrical, leaning only very slightly forward and to the left, never spreading downward into a pool, a disc or a patch; its lowest edge is directly under the front of the nearer wing. The house stands on level unseen ground with the foot of its far side visible, so its footprint closes into a flat shape. Nothing else is in the picture at all: no ground, no grass, no earth, no rocks, no trees, no bushes, no garden, no paved courtyard, no fence, no wall, no path, no mist, no sky, no horizon, no second building. Completely transparent background; if transparency is not possible, one flat even mid-grey field, the same tone from corner to corner and right out to all four edges, with no texture, no paper grain, no vignette and no border. The house stands dead centre with its footprint balanced left and right about the centre of the frame, filling about 46% of the frame's width, with a wide empty margin on all four sides — every eave tip and roof corner of both wings well clear of the edges, nothing cropped, nothing touching any edge.
```

### `b-walled.png` — grand hanok compound (generate this one LAST)

```
Traditional Korean ink-and-watercolour painting, the same hand as a wide misty valley landscape: thin dry grey-brown ink outlines of even, modest weight, flat translucent washes inside them, soft brush edges, muted sepia and celadon palette, no gloss, no gradients, no digital shading. Seen from high above at a steep angle, looking down onto it from the hillside opposite — the whole roof plane is visible as one broad foreshortened shape including its far slope, the ridge sits high in the silhouette, the vertical timber posts stay vertical, you look down over the top of the boundary wall into the courtyard, and only a shallow band of hall wall shows beneath the eaves. The underside of the eaves, the soffit and the bracket sets are never visible. One soft diffuse overcast light with no sun and no lit side and shadow side; the darkest tone anywhere in the picture is a mid grey-brown, never black.

A single grand hanok compound, the finest house in a village. In the middle a large stately one-storey hanok with a wide tiled roof in slate blue-grey, a heavy charcoal ridge, deep overhanging eaves and corners sweeping well upward into pointed tips, standing on a tall pale grey-buff stone platform with a broad flight of steps; walls of pale warm hanji buff panelled between reddish-brown timber posts, a long row of plain sliding doors and a narrow verandah across the front, and one smaller subsidiary roof set back to one side. Around it on all four sides a low boundary wall of pale plastered stone capped with a thin run of the same slate blue-grey tile, enclosing a courtyard of pale swept bare earth, with one small tiled gateway in the middle of the near wall whose timber doors are closed, so the wall forms an unbroken ring. The wall is low enough that the whole hall stands clear above it, and it stops well short of the picture's sides so it never runs out of frame. Nothing at all outside the boundary wall, and nothing in the courtyard: no trees, no plants, no jars, no paving pattern. The largest building of the set, reading as a long low pale band with a broad roof rising behind it. About half as tall as it is wide.

Painted small and loose, the way one building is painted inside a wide landscape, not as an architectural study: a whole roof slope is about a dozen fine ruled parallel strokes and never tile by tile, the boundary wall is a flat pale wash with one ink line for its tiled cap and never stone by stone, doors and windows are plain rectangles with a simple frame, no lattice weave, no carved brackets, no dancheong colour, no signboards, no people. Pale and high-key, as though seen across a wide valley in soft misty air — hanji walls and boundary wall barely darker than cream, light blue-grey roofs and coping with a faint green cast, warm mid-brown timber, pale grey stone. Along the foot of the boundary wall and touching it, one soft grey-green watercolour shadow tucked tight against the wall, nearly symmetrical, leaning only very slightly forward and to the left, never spreading downward into a pool, a disc or a patch; its lowest edge is directly under the front of the wall. The compound stands on level unseen ground with the foot of its far wall visible, so its footprint closes into a flat shape. Nothing else is in the picture at all: no ground, no grass, no earth, no rocks, no trees, no bushes, no garden, no outer fence, no second wall, no outbuildings, no path, no mist, no sky, no horizon. Completely transparent background; if transparency is not possible, one flat even mid-grey field, the same tone from corner to corner and right out to all four edges, with no texture, no paper grain, no vignette and no border. The compound stands dead centre with its footprint balanced left and right about the centre of the frame, filling about 60% of the frame's width, with a clear empty margin on all four sides — every eave tip, roof corner and both ends of the boundary wall well clear of the edges, nothing cropped, nothing touching any edge.
```

---

## 4. Transparency — do all three of these

1. **Turn Recraft's transparent-background toggle ON.** It controls the
   alpha channel.
2. **Keep the background clause at the end of each prompt anyway.** The
   toggle controls alpha; the prompt controls what gets *painted*. A
   model that paints a patch of grass hands you grass at full opacity.
3. **Run every export through `tools/prep.html` regardless** — that is
   what trims each building so it stands on the bottom edge of its own
   canvas, which is the contract the engine depends on.

**If the toggle fails, the fallback background is flat MID GREY — never
cream or parchment.** `prep.html` keys by flooding inward from the
border, and a cream background sits so close to the hanji walls that
the tolerance has to be tight, leaving a rim. Grey is a colour no part
of the building uses, so it keys clean.

If Recraft's own **Remove Background** is available, prefer it over
prep.html's keyer — it's segmentation, so it can also clear enclosed
holes, which the flood fill structurally cannot. `prep.html` detects
existing alpha and skips keying automatically, so matted and un-matted
exports can be dropped in together.

**The shadow goes in the PNG, not in code.** A CSS shadow follows the
alpha silhouette, so it would trace the flared eave tips as a dark
fringe in mid-air — and the code-drawn shadow already failed once on
this page (the journey's `?ground=` ellipse: "nearly invisible").
A painted watercolour smudge in the same hand as the plate is the right
answer. That's why every prompt asks for it soft, tight to the base and
nearly symmetrical: `prep.html` trims at the lowest visible pixel, so
**the shadow's bottom edge becomes the ground line**, and ~45% of
buildings get mirrored, which mirrors the shadow with them.

---

## 5. Check each one before generating the next

The six have to agree with each other, so the first accepted file
becomes the standard for the rest.

**In Recraft:**

1. **Angle** — can you see the underside of any eave, or a bracket set?
   Reject. You must be looking down onto the top of the roof.
2. **Density** — individual tiles, dancheong, or a door lattice drawn?
   Reject.
3. **Key** — hold it next to `valley6 (2).png`. Darker or more
   saturated than the buildings in that painting? Reject. The rejected
   set measured roughly half the brightness of the approved ones, and
   that was the loudest single mismatch.
4. **Isolation** — any grass, earth, rock, tree, bush or fence attached
   to it? Reject.
5. **Ground** — any disc, patch, plate or rectangle of ground *under*
   it? Reject. (Its own stone plinth is fine — it should have one.)
6. **Shadow** — hard-edged, offset, long or black? Reject.
7. **Holes** — the gate passage and the gaps between pavilion posts must
   be painted dark, not see-through.
8. **Frame** — anything touching an edge, especially an eave tip?
   Reject. It crops the silhouette and it poisons the border colour the
   keyer samples.

**In `tools/prep.html`, after keying:**

9. **Check the filename dropdown on every card.** `b-lhouse` is a trap:
   the auto-guess matches on substring and "lhouse" contains "house",
   so the L-house selects the `b-house.png` slot. Miss it and you ship
   two houses and no L-house.
10. At 400%, the cut edge is one soft pixel — not a fringe of leaf and
    rock shapes.
11. **Nothing survives below the base.** One speck 20px down sets the
    trim and floats the whole building 20px above its plot.
12. **Nothing survives on one side only.** Asymmetric residue slides
    the building sideways off its plot.
13. No holes punched through walls, roof or deck.

---

## 6. If it comes back wrong

| what you got | what to do |
|---|---|
| Standing on grass / a rock / a garden | Re-roll. Neither the keyer nor Remove Background can rescue it — the scenery is welded to the building's foot. If it happens every roll, the style is winning: rebuild it from the `ref-*.png` crops only. |
| Eye-level, soffits and brackets visible | Re-roll with the matching `ref-*.png` attached as an image reference. This is fault #1 from last time and wording alone does not fix it. |
| Tile-by-tile roof, dancheong, lattice | It's filling too much of the frame. Cut the frame fill and re-roll. |
| Dark, saturated, high contrast | Re-roll against the "pale and high-key" clause. Do not fix it later with `?haze=` — haze is a depth cue, not colour correction. |
| A rim survives after keying | That's a vignette or a paper stain. Push key strength to 70–90; past that it starts eating pale wall. If it still rims, re-roll on flat grey. |
| Holes punched in the walls | Key strength too high, or the background is too close to the hanji cream. Drop to 25–30, or re-roll on flat grey. |
| Already transparent, but with an opaque ground disc | The trap. `prep.html` sees the alpha and skips keying entirely, so the disc sails through. Flatten onto a solid colour first, then key. |
| Nothing agrees after three or four rolls each | Fall back to **one** generation of all six: same style, same negative, subject "six separate Korean village buildings standing in a row on a flat empty background, well apart, none touching, each with its own soft shadow at its base", in the sizes above. Cut them apart roughly in any viewer — `prep.html` trims. One manual step, guaranteed agreement on angle, light and density. |
| Plate reads as a circuit board | The forks are too high and too symmetric. Re-run at lower strength, insisting on the low first fork and different fork heights. |
| Plate's clearings sit above halfway | Unusable — they get cropped, then feathered away. Re-roll. |

---

## 7. Where everything goes

```
art/village/field-square.png     the plate   -> then: node tools/crop.js
art/village/b-house.png          }
art/village/b-gate.png           }
art/village/b-thatch.png         }  through tools/prep.html first,
art/village/b-pavilion.png       }  which saves them under these names
art/village/b-lhouse.png         }
art/village/b-walled.png         }
```

Preview at **`localhost:8137/index.html?motion=1&village=sprites`** —
the `&village=sprites` matters, because `state-00.png` still exists and
the engine prefers it otherwise.

---

## 8. Village life — the walkers and the birds

**Two extra generations. Everything above still comes first** — this is
only worth doing while the custom style is already built and loaded.

VEN's idea: *small people walking around the village, and small bird
silhouettes flying, once the valley is on screen.*

**The birds need no art.** At the size they read on the page a bird is
two ink strokes — a flick, not a picture — and a painted PNG cannot
flap its wings. They are drawn in code, in the same ink, over the
plate. That is the one place where drawing beats generating, and it is
the same allowance the fallback layers already have. If the code birds
come back looking wrong, the fallback is a three-pose bird sheet
generated in this style, and the swap costs nothing.

**The people do need art — eight figures, in two poses, two sheets.**
Eight separate rolls would never agree with each other; one sheet is
the same fallback trick §6 already recommends for the six buildings,
and here it is the *first* choice rather than the fallback, because
these figures are too small for per-image tuning to be worth anything.
**Sheet A is the left leg forward, sheet B the right** — alternating
them is the walk cycle. VEN asked for a real walking animation, so B is
required, not optional; the code adds the bob and the sway on top.

### Sizes, so the rest of this makes sense

At the shipped plate width (1080px) a hanok is ~130–190px across, so a
villager comes out about **10 × 25px**. On a 390px phone it is about
**4 × 9px** — a fleck of ink. That single fact drives every choice
below: silhouette and tone are the whole game, and detail is a
liability. It also means the "don't rescale afterwards in an editor"
rule from §3 **does not apply here** — these are generated large and
shrunk hard on purpose, because nothing at 25px survives being painted
at 25px.

### `p-walk-a.png` — sheet A, eight walkers, left leg forward

Same custom style as the buildings. Transparency toggle ON. 1024x1024.

```
Traditional Korean ink-and-watercolour painting, the same hand as a wide misty valley landscape: thin dry grey-brown ink outlines of even, modest weight, flat translucent washes inside them, soft brush edges, muted sepia and celadon palette, no gloss, no gradients, no digital shading. Seen from high above at a steep angle, looking down onto them from the hillside opposite — you look down onto the tops of their hats and shoulders, every figure is strongly foreshortened, the head sits high in the silhouette and the feet are tucked close in beneath the body. No face is visible on anyone. One soft diffuse overcast light with no sun and no lit side and shadow side; the darkest tone anywhere in the picture is a mid grey-brown, never black.

Eight small Korean villagers in plain Joseon-era country dress, standing well apart in two even rows of four, each one alone and completely separate from the others. Every figure is caught mid-stride walking, the left leg clearly forward and the right arm swung forward with it, the body turned slightly to one side. Top row, left to right: a man in pale off-white hanbok under a wide flat dark horsehair hat; a woman in a pale cream jacket and a full dust-blue skirt; a farmer in dun hemp under a broad conical straw hat that reads from above as a pale disc; a man carrying a wooden A-frame back-rack loaded with a bundle of firewood. Bottom row, left to right: a woman with a shallow bundle balanced flat on her head and her arms half raised to it; a man in a faded indigo coat walking slowly with his hands behind his back; a small child in a short pale tunic, two thirds the height of the adults, running; an old man in a long pale robe leaning on a thin stick. Each figure is one closed silhouette with no gap showing between the arms and the body.

Painted very small and very loose, the way distant figures are flicked into a wide landscape, never as figure studies: each person is five or six brush marks — a soft blot for the hat or head, one broad wash for the body, two short tapering strokes for the legs — with no face, no eyes, no hands, no fingers, no hair detail, no fabric folds, no pattern and no outline drawn any tighter than the ink line on a distant roof. Pale and high-key, as though seen across a wide valley in soft misty air: off-white and cream cloth barely darker than the paper, dusty indigo and faded dun as the only accents, and a single small dark hat as the one near-black note on the figures that wear one. Beneath each figure and touching its feet, one small soft grey-green watercolour shadow, no wider than the figure and pooled tight beneath it, never a hard disc, never offset to one side, never long. Nothing else is in the picture at all: no ground, no grass, no earth, no path, no rocks, no trees, no buildings, no animals, no baskets or jars set down on the ground, no mist, no sky, no horizon. Completely transparent background; if transparency is not possible, one flat even mid-grey field, the same tone from corner to corner and right out to all four edges, with no texture, no paper grain, no vignette and no border. The eight figures stand in two clean rows with wide empty space all around each one, no figure touching another and no figure touching any edge; each adult stands about one seventh of the picture's height.
```

**Villager negative prompt** — the buildings' shared negative bans
"people, figures", so this asset needs its own:

```
eye-level view, low angle, worm's eye view, seen from below, front view, portrait, close-up, character sheet, turnaround, model sheet, face, eyes, nose, mouth, facial features, hair detail, hands, fingers, detailed clothing, fabric folds, embroidery, pattern, silk, gold, dancheong, bright colours, red, orange, heavy saturation, sharp focus, dense detail, photorealistic, photograph, 3d render, cgi, anime, cartoon, chibi, outline glow, sticker edge, white halo, ground, grass, earth, dirt, path, road, rocks, buildings, houses, roofs, trees, foliage, landscape, background scenery, mountains, mist, sky, horizon, shadow disc, oval of ground beneath, hard drop shadow, long cast shadow, black shadow, base plate, diorama base, tabletop, paper texture, parchment grain, vignette, border, frame, text, watermark, signature, numbers, labels, figures touching, overlapping figures, crowd, group, row of identical figures, cropped, cut off
```

### Judging the sheet

1. **Angle** — can you see anyone's face? Reject. You should be looking
   down onto hats and shoulders.
2. **Density** — anyone painted with fingers, eyes or folds of cloth?
   Reject. At 25px that becomes a dark smudge, and a dark smudge is
   exactly the mismatch that killed the first sprite set.
3. **Key** — hold it against `valley6 (2).png`. Any figure darker or
   more saturated than the buildings in that painting? Reject.
4. **Isolation** — grass, a basket on the ground, a dog, or a disc of
   ground under anyone? Reject.
5. **Separation** — any two figures touching or overlapping? Reject.
   They have to be cut apart.
6. **Shadow** — soft, tight, directly underneath. Offset, hard or long,
   reject. As with the buildings, the shadow's bottom edge becomes the
   ground line.

### `p-walk-b.png` — sheet B, the same eight, right leg forward

**Only start this once sheet A is accepted.** Use sheet A itself as an
image reference, keep the identical style and negative prompt, and
change exactly one clause in the middle paragraph:

> …caught mid-stride walking, **the right leg clearly forward and the
> left arm swung forward with it**, the body turned slightly to one
> side…

Everything else — the eight descriptions in the same left-to-right
order, the same two rows, the same sizes — stays word for word. What
matters is that figure 3 on sheet B is recognisably the same farmer as
figure 3 on sheet A. If the cast comes back reshuffled or redressed,
re-roll B; do not renumber A to match it.

**Judging B against A:** flick between the two at 100%. Same eight
people, same clothes, same hats, same heights, only the legs and arms
changed? Accept. If the two sheets disagree on anything else the swap
reads as a twitch rather than a step, and one sheet used alone with the
code bob is the better fallback.

### Where they go

Cut each sheet into eight loose crops in any viewer — generous margins,
nothing needs to be tight — and keep the numbering identical across the
two:

```
art/village/people/p-01a.png … p-08a.png     from sheet A
art/village/people/p-01b.png … p-08b.png     from sheet B
```

Both sets go through `tools/prep.html`, which trims each figure to its
own bottom edge — the same ground-line contract the buildings have.
**A and B must trim to the same ground line**, so check that no stray
speck survives under either one; a 3px difference makes the walker jump
every step. The filename slots get added to prep.html when the art
lands.

---

## Notes for the build (not for VEN)

When the art lands:

- **Re-place `PLOTS` in `tools/place.html`** onto the plate's clearings.
  Current values were placed against a different valley. Non-skippable.
- **Widen the plots.** A house measures ~162px in the 1024 master
  (`w ≈ .158`), while the current mid-row `w: .095` renders one at 97px
  — 40% small. Start row 0 ≈ .120, row 1 ≈ .150, row 2 ≈ .175.
- **Retune `TYPES` scale** (`js/village.js:534-541`), measured off
  `valley6 (2).png` with the small house as 1.00:
  house **1.00** · pavilion **0.85** · thatch **0.95** · gate **1.20** ·
  lhouse **1.55** · walled **2.00**. Note thatch drops from 1.45 — the
  rejected file contained a whole farmyard; the farmhouse is actually
  *smaller* than a house.
- **Pin `b-walled`** to the last plot in build order with `rows: []`, so
  there is exactly one estate and it is the finale. The seeded
  assignment cannot express "the finale" on its own.
- **`?haze=`** — `rowFilter()` exists because the old sprites were
  painted close-up and read denser than the plate. These six remove
  that defect, so the honest setting is ~**0.4–0.5**, kept as a depth
  cue rather than a patch.
- **Flip the mode cascade** (`js/village.js:413-416`) or remove
  `art/village/state-*.png`, so sprites are the default rather than
  `?village=sprites`.
- `tools/fakestates.js:34` and `tools/place.html:184` still carry the
  old `[0.410, 1]` band; `tools/crop.js` and `js/village.js` are on
  `[0.300, 1]`. Reconcile when re-placing plots.

For §8 (village life) — full build plan in `PLAN.html`:

- `tools/prep.html`'s filename dropdown needs `p-01a…p-08b` slots, or it
  cannot save the cut figures. Same substring trap as `b-lhouse`, worse:
  sixteen near-identical names. **A and B must trim to the same ground
  line** or the walker jumps on every step.
- `tools/place.html` needs a second mode that records **polylines**, not
  points, so the walk routes can be traced onto the plate's lanes. The
  walkers follow those; nothing infers path geometry from the painting.
- Walkers are driven by `transform` only — never `left`/`top` per frame
  — so the loop stays compositor-side, same discipline as `draw()` in
  journey.js. Painter order via `z-index` from `y`, recomputed only when
  the order string changes.
- The loop runs off an IntersectionObserver on `.village__field` and
  stops on `document.hidden`; under reduced motion the walkers stand
  still and the birds hold a fixed pose rather than disappearing.
- **In states mode a walker cannot be occluded by a building**, because
  the buildings are baked into the state PNG. Keep walk routes in the
  open lanes, or gate the walkers to sprite mode.
