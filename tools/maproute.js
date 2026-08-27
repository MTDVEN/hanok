/* ================================================================
   Find the road across a journey map —
     node tools/maproute.js art/journey/map-ink.png [--stops 4] [--debug]

   The trail is NOT hand-dragged, for the same reason PLOTS is not
   (HANDOFF §9j): eyeballing coordinates off a thumbnail is slow, it
   is wrong by 3-5% every time, and it has to be redone from scratch
   the moment the art is re-rolled.

   It does not need to be. The map's open ground is the one thing on
   the sheet that is BRIGHT and SMOOTH — bare parchment. Mountains,
   forests and coastline are all dark, high-frequency ink. So
   "openness" is measurable:

       openness = normalised(mean luminance) - INK_W * normalised(local stdev)

   and the road is just the highest-openness route from the top edge
   to the bottom edge. That is a seam-carve: one dynamic-programming
   pass down the rows, each row's cell reachable from a cell within
   SLOPE columns of it on the row above.

   Two shaping terms, both earning their place:
     - EDGE_W pushes the road off the left and right margins. The
       copy card sits over one half of the screen, and a road pinned
       to a margin puts every marker under it.
     - The seam is smoothed before it is emitted. A raw seam is
       jittery at one-cell resolution, and a jittery road reads as a
       mistake rather than as a mountain pass.

   Stops are placed at even fractions DOWN THE SHEET, then nudged to
   the most open cell within SNAP rows — so a marker lands in a
   clearing rather than halfway up a ridge.

   Emits MAP_PATH and MAP_STOPS ready to paste into js/journey.js,
   in NORMALISED coordinates (0-1 of width, 0-1 of height) so they
   survive the sheet being re-prepped at another size.

   --debug writes <src>-route.png with the road and the stops drawn
   over the map, which is how you check it without a browser.
================================================================= */

var zlib = require("zlib");
var fs   = require("fs");

/* ---- knobs ------------------------------------------------------ */

var COLS   = 72;     // analysis grid; finer than this just chases noise
var INK_W  = 1.35;   // how hard local detail is punished vs. brightness
var EDGE_W = 2.20;   // how hard the margins are punished
var MARGIN = 0.17;   // fraction of width treated as margin at each side
var SLOPE  = 2;      // max columns the road may shift per grid row
var SMOOTH = 9;      // moving-average window over the raw seam, in rows
var SNAP   = 9;      // rows either side a stop may move to find its spot
var INSET  = 0.055;  // keep the first/last stop this far off the sheet edge

/* How much a stop is drawn toward nearby terrain.

   Openness alone is the WRONG score for a stop, and picking stops by
   it was a real fault, caught in Chrome: the most open cell on the
   sheet is the middle of the widest empty bowl, so the camera zoomed
   in on the first location and framed bare parchment with a seal
   floating on it. The mountains were just outside the shot.

   What a stop actually wants is detail in the RING around it — the
   thing you have travelled TO — over an open cell of its own, which
   the road's own seam already guarantees. So the cell keeps a small
   openness say and gains the mean detail of an annulus INT_R0..INT_R1
   cells out. The road is still chosen on openness alone; this only
   moves stops ALONG it.

   DO NOT TRY TO TUNE THESE WEIGHTS INTO FINDING THE VIGNETTES. It was
   tried (session 12 part 6) and it cannot work: detail-stdev cannot
   tell a painted landmark from a mountain range — both are ink. At
   0.85 the Namsangol stop landed 10% of the sheet below its house; at
   2.2 the Changdeokgung stop wandered into the terraced fields. For a
   sheet that carries landmark vignettes, pass the PRE-VIGNETTE sheet
   with --base: the vignettes are then found by DIFFERENCE — the only
   thing that separates the two sheets is exactly the thing being
   looked for — and stops lock onto them regardless of any weighting
   here. This ring score remains only for sheets with no vignettes. */
/* Luma below which a pixel counts as ink, and the field the BLOCK is
   scored on: the FRACTION of a cell that is that dark.

   It used to be scored on `nd`, the local standard deviation the road
   seam uses — and that is the wrong question for text. Stdev fires on
   any texture: mist, a pale wash, the paper's own grain. So the grid
   read the soft mountain haze west of Gyeongbokgung as expensive as a
   black ridge line east of it, judged the block already optimally
   placed, and would not move however the weights were pushed — while
   VEN, looking at the render, asked three times for it to go left.
   He was right and the metric was wrong. What makes a caption
   unreadable is DARK STROKES crossing it; wash behind text is fine
   and always looked fine (§9w part 14 said so about the caption
   band). Overlaid on the sheet, the two candidate boxes settle it in
   one look: the old one straddles a ridge, the new one sits in the
   gap. The road seam still uses stdev — for finding open GROUND that
   is the right measure. */
var DARK_T = 132;
/* DARK_T MUST BE DECLARED UP HERE: gridsOf() runs long before the
   knobs further down are assigned, and a `var` read before its
   assignment is undefined — `l < undefined` is false for every pixel,
   so the field came back empty and every candidate scored zero. */
var SOFT_T0 = 196;   /* same rule: the phone box's softer field (SOFT_T below) */

var INT_W  = 0.85;
var INT_R0 = 3, INT_R1 = 8;

/* --base only: how hard the road is pushed off the landmarks. Scaled
   far past any terrain cost on purpose — crossing a vignette must
   never be the cheap route. */
var VIG_W  = 3.0;

/* ---- PNG decode (see the note atop tools/png.js) ---------------- */

function decode(buf){
  if (buf.readUInt32BE(0) !== 0x89504E47) throw new Error("not a PNG");
  var pos = 8, w = 0, h = 0, bd = 0, ct = 0, idat = [], plte = null;
  while (pos < buf.length){
    var len  = buf.readUInt32BE(pos);
    var type = buf.toString("ascii", pos + 4, pos + 8);
    var data = buf.slice(pos + 8, pos + 8 + len);
    if (type === "IHDR"){
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bd = data[8]; ct = data[9];
      if (data[12] !== 0) throw new Error("interlaced PNG unsupported");
    } else if (type === "PLTE") plte = data;
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bd !== 8) throw new Error("only 8-bit PNGs");
  var ch = ct === 2 ? 3 : ct === 6 ? 4 : ct === 0 ? 1 : ct === 4 ? 2 : ct === 3 ? 1 : 0;
  if (!ch) throw new Error("unsupported colour type " + ct);

  var rawz = zlib.inflateSync(Buffer.concat(idat));
  var stride = w * ch, out = Buffer.alloc(h * stride), p = 0, y, i;
  for (y = 0; y < h; y++){
    var f = rawz[p++];
    var line = rawz.slice(p, p + stride); p += stride;
    var cur  = out.slice(y * stride, (y + 1) * stride);
    var prev = y ? out.slice((y - 1) * stride, y * stride) : null;
    for (i = 0; i < stride; i++){
      var a = i >= ch ? cur[i - ch] : 0;
      var b = prev ? prev[i] : 0;
      var c = (prev && i >= ch) ? prev[i - ch] : 0;
      var v = line[i];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4){
        var pp = a + b - c,
            pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[i] = v & 255;
    }
  }
  var rgb = Buffer.alloc(w * h * 3), n = w * h;
  for (i = 0; i < n; i++){
    if (ct === 3){
      var q = out[i] * 3;
      rgb[i * 3] = plte[q]; rgb[i * 3 + 1] = plte[q + 1]; rgb[i * 3 + 2] = plte[q + 2];
    } else if (ch >= 3){
      rgb[i * 3] = out[i * ch]; rgb[i * 3 + 1] = out[i * ch + 1]; rgb[i * 3 + 2] = out[i * ch + 2];
    } else {
      rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = out[i * ch];
    }
  }
  return { w: w, h: h, data: rgb };
}

var CRC = (function(){
  var t = new Int32Array(256), c, n, k;
  for (n = 0; n < 256; n++){
    c = n;
    for (k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(b){
  var c = -1, i;
  for (i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data){
  var len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  var body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  var crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodeRGB(w, h, data){
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  var raw = Buffer.alloc(h * (w * 3 + 1)), y;
  for (y = 0; y < h; y++){
    raw[y * (w * 3 + 1)] = 0;
    data.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 6 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

/* ---- args ------------------------------------------------------- */

var argv  = process.argv.slice(2);
var files = argv.filter(function(a, i){
  return a.charAt(0) !== "-" && (i === 0 || argv[i - 1].charAt(0) !== "-" ||
         argv[i - 1] === "--debug");
});
var src   = files[0];
var DEBUG = argv.indexOf("--debug") >= 0;
/* --why dumps the caption-block search: the eight best candidates per
   stop with every term of the score broken out. Written when VEN said
   "move the block left" and the tool would not — guessing at weights
   is exactly what HANDOFF warns against, so look at the numbers. */
var WHY = argv.indexOf("--why") >= 0;
/* --plan: the box/shape search treats every cell inside the loop as
   paper, ink or not — for planning a clearing that has not been cut
   yet (tools/mapnote.js). The road, the landmark and the name still
   count. --shape-out <file> writes the per-stop shapes as JSON for
   that tool to read. */
var PLAN = argv.indexOf("--plan") >= 0;
/* --caption: the block search places the ENGLISH CAPTION ALONE — one
   line, under the building, in the band below the landmark as part
   14 had it — instead of the caption-plus-copy block (2026-08-27,
   VEN: "move the ENGLISH names for each location back underneath the
   corresponding image"). The copy lives in its clearing now
   (tools/mapnote.js), so the anchor this emits in MAP_STOPS is the
   caption's. The footprint is CAP_W wide and one row up and down; the
   loop does not confine it (it is under the building, not in the
   clearing); and the darkest cell under the chosen spot is written to
   --shape-out as `cap.peak`, which is how mapnote decides whether the
   caption needs a small clearing of its own. */
var CAPTION = argv.indexOf("--caption") >= 0;
var SHAPE_OUT = (function(){
  var i = argv.indexOf("--shape-out");
  return i >= 0 ? argv[i + 1] : null;
})();
var NSTOP = (function(){
  var i = argv.indexOf("--stops");
  return i >= 0 ? parseInt(argv[i + 1], 10) || 4 : 4;
})();
/* --base <png>: the SAME sheet BEFORE its landmark vignettes were
   painted in. When given, the stops are found by DIFFERENCE instead of
   by the ring score — see the note above the stops section. */
var BASE = (function(){
  var i = argv.indexOf("--base");
  return i >= 0 ? argv[i + 1] : null;
})();
/* --terrain <png>: carve the ROAD on this sheet instead of <src>.

   Since 2026-08-27 the shipped sheet carries three CLEARINGS — VEN's
   red loops, where tools/mapclear.js has faded the terrain to bare
   paper so the copy can sit on it. Bare paper is precisely what the
   seam hunts for, so run on the cleared sheet the road would wander
   into the very space that was cleared for the text, and take the
   stops with it. The road VEN signed off was carved on the sheet
   before the clearings; pass that sheet here and it is carved on it
   still. Everything else — the stops by difference, the name and
   block searches — reads <src>, which is what is actually drawn. */
var TERRAIN = (function(){
  var i = argv.indexOf("--terrain");
  return i >= 0 ? argv[i + 1] : null;
})();
/* --clear <json>: the clearings, the same file tools/mapclear.js cut
   them from. With it, a stop that has a loop confines its text block
   to that loop, and a second search finds the widest clean box inside
   it for the phone's larger block — see CLEAR_INSET and phoneBox. */
var CLEAR = (function(){
  var i = argv.indexOf("--clear");
  if (i < 0) return null;
  var lst = JSON.parse(fs.readFileSync(argv[i + 1], "utf8")), by = {};
  lst.forEach(function(l){ by[l.stop] = l.poly; });
  return by;
})();
/* The copy's length per stop, in characters, for the box score (see
   COPY_EM). Lifted from js/journey.js's SPOTS the way tools/build.js
   lifts TYPES — read the real file, never retype it; `--copy 182,147`
   overrides, and a stop with no figure gets 160. */
var COPY_N = (function(){
  var i = argv.indexOf("--copy"), out = [];
  if (i >= 0) return argv[i + 1].split(",").map(Number);
  try {
    var js = fs.readFileSync(require("path").join(__dirname, "..", "js", "journey.js"), "utf8");
    var re = /copy:\s*\[((?:\s*"[^"]*",?)+)\s*\]/g, m;
    while ((m = re.exec(js))) out.push(m[1].replace(/"/g, "").replace(/,\s*/g, " ").replace(/\s+/g, " ").trim().length);
  } catch (e){}
  return out;
})();

if (!src){
  console.error("usage: node tools/maproute.js <map.png> [--base <plain.png>] [--stops 4] [--debug]");
  process.exit(1);
}

var img = decode(fs.readFileSync(src));
var ROWS = Math.max(2, Math.round(COLS * img.h / img.w));

/* ---- openness field --------------------------------------------- */

/* mean luminance and stdev per cell, in one pass per cell. A function
   because --base runs it twice: the grid is COLS x ROWS regardless of
   the image's pixel size, so two preps of the same sheet at different
   widths land on comparable grids. */
function gridsOf(im){
  var L = new Float64Array(COLS * ROWS),
      K = new Float64Array(COLS * ROWS),
      F = new Float64Array(COLS * ROWS),
      D = new Float64Array(COLS * ROWS), gx, gy;
  for (gy = 0; gy < ROWS; gy++){
    var y0 = Math.floor(gy * im.h / ROWS),
        y1 = Math.max(y0 + 1, Math.floor((gy + 1) * im.h / ROWS));
    for (gx = 0; gx < COLS; gx++){
      var x0 = Math.floor(gx * im.w / COLS),
          x1 = Math.max(x0 + 1, Math.floor((gx + 1) * im.w / COLS));
      var s = 0, s2 = 0, n = 0, dk = 0, sf = 0, yy, xx;
      for (yy = y0; yy < y1; yy++){
        for (xx = x0; xx < x1; xx++){
          var p = (yy * im.w + xx) * 3;
          var l = 0.2126 * im.data[p] + 0.7152 * im.data[p + 1] + 0.0722 * im.data[p + 2];
          s += l; s2 += l * l; n++;
          if (l < DARK_T) dk++;
          if (l < SOFT_T0) sf++;
        }
      }
      var m = s / n;
      K[gy * COLS + gx] = dk / n;
      F[gy * COLS + gx] = sf / n;
      L[gy * COLS + gx] = m;
      D[gy * COLS + gx] = Math.sqrt(Math.max(0, s2 / n - m * m));
    }
  }
  return { lum: L, dev: D, dark: K, soft: F };
}

var G = gridsOf(img);
var lum = G.lum, dev = G.dev, dark = G.dark, soft = G.soft;

function norm(arr){
  var lo = Infinity, hi = -Infinity, i;
  for (i = 0; i < arr.length; i++){ if (arr[i] < lo) lo = arr[i]; if (arr[i] > hi) hi = arr[i]; }
  var span = hi - lo || 1, out = new Float64Array(arr.length);
  for (i = 0; i < arr.length; i++) out[i] = (arr[i] - lo) / span;
  return out;
}

var nl = norm(lum), nd = norm(dev);

/* the road's own view of the sheet: the pre-clearing terrain when
   --terrain is given (see the note at its definition), else <src> */
var tl = nl, td = nd;
if (TERRAIN){
  var TG = gridsOf(decode(fs.readFileSync(TERRAIN)));
  tl = norm(TG.lum); td = norm(TG.dev);
}

/* the clearings as cell masks, per stop index: inside the loop, and
   inside it by CLEAR_INSET cells — mapclear feathers the loop's edge
   over ~170px of a 3072px master, so the paper is only fully clear
   about three cells in from the line. A block on the ramp would sit
   on a ghost of the mountain. */
var CLEAR_INSET = 2.5;
/* the phone box's smaller inset — declared HERE, before polyMask runs,
   not down with the other PHONE_ knobs: read before its assignment it
   is undefined, the inset goes NaN, and the mask comes back empty
   without a word (DARK_T's trap, again) */
var PHONE_INSET = 0.4;
function polyMask(poly, inset){
  var m = new Uint8Array(COLS * ROWS), gx, gy;
  function inside(px, py){
    var hit = false, j, k;
    for (j = 0, k = poly.length - 1; j < poly.length; k = j++){
      var a = poly[j], b = poly[k];
      if ((a[1] > py) !== (b[1] > py) &&
          px < (b[0] - a[0]) * (py - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
    }
    return hit;
  }
  /* distance-to-edge inset: a cell counts only if the four points
     `inset` cells out from its centre are all inside too */
  for (gy = 0; gy < ROWS; gy++)
    for (gx = 0; gx < COLS; gx++){
      var cx = (gx + 0.5) / COLS, cy = (gy + 0.5) / ROWS, dx = inset / COLS, dy = inset / ROWS;
      if (inside(cx, cy) && inside(cx - dx, cy) && inside(cx + dx, cy) &&
          inside(cx, cy - dy) && inside(cx, cy + dy) &&
          inside(cx - dx * 0.7, cy - dy * 0.7) && inside(cx + dx * 0.7, cy - dy * 0.7) &&
          inside(cx - dx * 0.7, cy + dy * 0.7) && inside(cx + dx * 0.7, cy + dy * 0.7))
        m[gy * COLS + gx] = 1;
    }
  return m;
}
var clearMask = {}, clearLoose = {};
if (CLEAR) Object.keys(CLEAR).forEach(function(k){
  clearMask[k]  = polyMask(CLEAR[k], CLEAR_INSET);
  clearLoose[k] = polyMask(CLEAR[k], PHONE_INSET);   /* see PHONE_INSET */
});

/* With --base: the landmark field, before the seam runs.

   TWO signals, because a vignette is two things. Its buildings are
   detail the plain sheet lacks (nd - ndB fires); its soft watercolour
   ground wash is SMOOTH, so the detail diff is blind to it — which is
   how the seam first cut through Changdeokgung's pond, caught in
   VEN's screenshot. But the wash also DARKENS parchment that used to
   be bare, so the luminance drop (nlB - nl) sees exactly the part the
   detail diff misses. Terrain is identical in both sheets and scores
   ~zero on both terms.

   vig     the raw field — where the landmark actually is. Stops and
           the label search read this.
   vigPad  the same field max-dilated 2 cells — the landmark plus a
           margin. The ROAD penalty reads this, so the seam not only
           avoids the vignette but keeps a respectful verge, and the
           marker lands beside the landmark rather than against its
           wall. */
var vig = null, vigPad = null;
if (BASE){
  var bG2 = gridsOf(decode(fs.readFileSync(BASE)));
  var ndB = norm(bG2.dev), nlB = norm(bG2.lum);
  vig = new Float64Array(COLS * ROWS);
  for (var vi = 0; vi < vig.length; vi++)
    vig[vi] = Math.max(0, nd[vi] - ndB[vi]) + Math.max(0, nlB[vi] - nl[vi]);
  vigPad = new Float64Array(COLS * ROWS);
  (function(){
    var gx, gy, dy, dx;
    for (gy = 0; gy < ROWS; gy++)
      for (gx = 0; gx < COLS; gx++){
        var m = 0;
        for (dy = -2; dy <= 2; dy++){
          var yy = gy + dy;
          if (yy < 0 || yy >= ROWS) continue;
          for (dx = -2; dx <= 2; dx++){
            var xx = gx + dx;
            if (xx < 0 || xx >= COLS) continue;
            if (vig[yy * COLS + xx] > m) m = vig[yy * COLS + xx];
          }
        }
        vigPad[gy * COLS + gx] = m;
      }
  })();
}

var open = new Float64Array(COLS * ROWS);
(function(){
  var gx, gy;
  for (gy = 0; gy < ROWS; gy++)
    for (gx = 0; gx < COLS; gx++){
      var i = gy * COLS + gx;
      /* distance into the margin, 0 in the safe middle, 1 at the edge */
      var fx = (gx + 0.5) / COLS;
      open[i] = tl[i] - INK_W * td[i]
        - EDGE_W * Math.pow(Math.max(0, (MARGIN - fx) / MARGIN,
                                        (fx - (1 - MARGIN)) / MARGIN), 2)
        /* The road must never cross a landmark. A vignette's soft
           watercolour ground reads as bright, LOW-detail parchment to
           the openness score, so without this the seam happily cut
           through Changdeokgung's pond — caught in VEN's screenshot.
           The penalty is scaled far past anything terrain costs, so
           the seam detours around the vignette and the marker lands
           BESIDE the landmark in open ground rather than against its
           wall. */
        - (vigPad ? VIG_W * vigPad[i] : 0);
    }
})();

/* ---- seam carve down the sheet ----------------------------------- */

var cost = new Float64Array(COLS * ROWS),
    from = new Int32Array(COLS * ROWS);

(function(){
  var gx, gy;
  for (gx = 0; gx < COLS; gx++) cost[gx] = -open[gx];
  for (gy = 1; gy < ROWS; gy++){
    for (gx = 0; gx < COLS; gx++){
      var best = Infinity, bi = gx, d;
      for (d = -SLOPE; d <= SLOPE; d++){
        var px = gx + d;
        if (px < 0 || px >= COLS) continue;
        var c = cost[(gy - 1) * COLS + px];
        /* a small price on lateral movement, so the road only leaves a
           straight line when the terrain actually pays for it */
        c += Math.abs(d) * 0.06;
        if (c < best){ best = c; bi = px; }
      }
      cost[gy * COLS + gx] = best - open[gy * COLS + gx];
      from[gy * COLS + gx] = bi;
    }
  }
})();

var seam = new Array(ROWS);
(function(){
  var bx = 0, best = Infinity, gx;
  for (gx = 0; gx < COLS; gx++){
    var c = cost[(ROWS - 1) * COLS + gx];
    if (c < best){ best = c; bx = gx; }
  }
  var gy;
  for (gy = ROWS - 1; gy >= 0; gy--){ seam[gy] = bx; bx = from[gy * COLS + bx]; }
})();

/* smooth: a raw seam is jittery at one-cell resolution */
var road = new Array(ROWS);
(function(){
  var gy, k;
  for (gy = 0; gy < ROWS; gy++){
    var s = 0, n = 0;
    for (k = -SMOOTH; k <= SMOOTH; k++){
      var j = gy + k;
      if (j < 0 || j >= ROWS) continue;
      s += seam[j]; n++;
    }
    road[gy] = s / n;
  }
})();

function atRow(gy){
  return { x: (road[gy] + 0.5) / COLS, y: (gy + 0.5) / ROWS };
}

/* ---- stops ------------------------------------------------------- */

/* mean detail in a ring around a cell — "is there anything to look at
   from here", as opposed to `open`, which is "can I stand here" */
function interest(gx, gy){
  var s = 0, n = 0, dy, dx;
  for (dy = -INT_R1; dy <= INT_R1; dy++){
    var y2 = gy + dy;
    if (y2 < 0 || y2 >= ROWS) continue;
    for (dx = -INT_R1; dx <= INT_R1; dx++){
      var x2 = gx + dx;
      if (x2 < 0 || x2 >= COLS) continue;
      var r = Math.sqrt(dx * dx + dy * dy);
      if (r < INT_R0 || r > INT_R1) continue;
      s += nd[y2 * COLS + x2]; n++;
    }
  }
  return n ? s / n : 0;
}

var stops = [];

/* WITH --base: find the landmarks by DIFFERENCE. The base sheet is the
   same terrain before the vignettes were painted in, so subtracting
   its detail field leaves exactly the things that were added — the
   landmarks — towering over the residue of image-to-image drift. No
   weighting can be argued with: the signal IS the thing sought.

   Each stop is the road row nearest a landmark: per row, the strongest
   diff within DX cells of the road; peaks picked greedily with ±SUP
   rows suppressed so one big vignette cannot claim two stops. */
if (BASE){
  var DX = 14, SUP = 10;
  var loR = Math.ceil(INSET * (ROWS - 1)),
      hiR = Math.floor((1 - INSET) * (ROWS - 1));

  /* WHERE THE NAME GOES is a search, not a side. The first rule
     ("away from the sheet's nearer edge") wrote 경복북 across the
     palace roof; the second ("away from the landmark's mass") wrote
     남산골 across the mountains, because terrain is identical in both
     sheets and a diff cannot see it. What the label actually wants is
     the emptiest patch of parchment near the stop, judged on ALL ink
     — terrain (nd) and landmark (vigPad) alike. So: scan the stop's
     row band left and right, score each candidate label footprint
     (~5x11 cells, roughly the vertical name column), and take the
     quietest one that is not on the road itself. A mild nearness term
     keeps it from wandering to the far edge of the frame. Emitted as
     the stop's third element, an ABSOLUTE x fraction; js/journey.js
     places the column there and falls back to the side rule for
     sheets that have no third element. */
  /* THE NAME BELONGS TO ITS BUILDING — VEN, part 8: *"i still want the
     writing to be next to the buildings though... next to (or
     above/below) the building."* The first 2D search optimised pure
     blankness and scattered the names across the frame: 경복궁 in the
     far corner with the palace on the opposite side of the screen. A
     place name on a map is a CAPTION — its first duty is to sit with
     the thing it names, and only then to find quiet paper.

     So the score is now  ink + DIST_W · (cells from the landmark) —
     adjacency is the objective, blankness the tie-breaker among
     adjacent spots, and only genuinely heavy ink (a ridge at ~0.5
     when open paper is ~0.1) is worth walking more than a few cells
     away from the building for. The landmark's footprint is the vig
     blob nearest the stop (cells over 30% of the window's peak).

     The search bounds are still the ARRIVAL FRAME, measured: at the
     settle zoom a 1600x689 desktop window shows ±0.30 of the sheet's
     width around the stop but only ±0.073 of its height, so a label
     centre may wander ±18 cells across but only ±4 rows — past that
     the name writes itself half out of frame at the very moment it is
     read. (Phones show MORE height, not less.)

     Two exclusions, both sized by earlier mistakes: only a THIN strip
     along the road (the road lives in the blank corridor — a generous
     margin excludes exactly the paper the label wants) and a small
     box over the seal (~2 cells; a 7x8 version once fenced off the
     whole pass). */
  var DIST_W = 0.05;

/* The caption anchor's footprint, in grid cells. It stopped being a
   caption on 2026-08-21: Zico's copy is written under the English
   name now, so what has to land on blank paper is the whole BLOCK —
   a caption line plus up to four lines of body text.

   SIZED FOR THE BIGGEST THE BLOCK EVER GETS, not for one window.
   Labels are scaled to a target ON-SCREEN size (`want` in
   js/journey.js), so their size in SHEET units is a function of the
   viewport: lq = want·1000/(W·ZOOM_IN·LSIZE). On wide screens `want`
   is min(0.10·H, 0.058·W), and whichever binds, lq tops out at
   0.058·1000/(1.65·24) = 1.465 — reached whenever H/W ≥ 0.58, which
   is most real windows and VEN's own. Measured in the browser at
   lq 1.087 the widest block (Namsangol) is 0.0623 of sheet width
   half-out and 0.0193 below the anchor; at 1.465 that is 0.084 and
   0.026 — hence ±6 columns and 4 rows down (±0.083, 0.031). One row
   up covers the caption line with room to spare.

   Do NOT size this off a screenshot of one window: at lq 1.087 a
   5-column box looks generous and overflows by a fifth on a taller
   one. The phone case is not in this number at all — below 861px the
   copy leaves the sheet entirely (see .jmap__note in css/site.css).

   CAP_NEAR was 0.006 and is 0.02 because VEN drew a red line under
   Namsangol's wall: *"can you make it so that the name is underneath
   the image where it is marked in red rather than all the way down
   where it currently is."* At the old weight a slightly quieter patch
   five rows further down beat the one under the building; now only
   real ink is worth walking away from the landmark for. */
var CAP_W = 6, CAP_UP = 1, CAP_DN = CAPTION ? 1 : 4;   /* see --caption */
var CENTRE_W = 0.004;   /* pull toward the landmark's centre column */
var CAP_GAP = 2, CAP_BAND = 11, CAP_NEAR = 0.012;

/* How hard mean ink counts. It is the ONLY signal that discriminates
   here and it was being outvoted: over a 13x6 box in a clearing this
   tight, PEAK saturates (every candidate around Namsangol scores the
   same 0.82, so it decides nothing), which left CAP_NEAR and FRAME_W
   choosing the spot on closeness alone — and closeness put the block
   in the pinched top of the clearing rather than two rows lower where
   the paper is genuinely cleaner. At 3.0 a third less ink beats two
   rows of distance, which is the right trade now that the wash under
   the block carries legibility. */
/* REVIEWED OVERRIDES for the text block's x, by stop index.

   Everything else this file emits is measured and nothing in it is
   hand-placed — that rule is why the road, the stops and the anchors
   survive an art re-roll. This is the one exception and it is here,
   in the tool, rather than pasted into js/journey.js, so that a
   re-run reproduces it instead of quietly losing it.

   STOP 1, 0.549 -> 0.514. VEN asked three times for Gyeongbokgung's
   block to move left off the mountains, and three different metrics
   said it was already optimal: local stdev, then dark-pixel fraction,
   then both with the road folded in. He was right every time. Drawing
   the block's REAL text footprint onto the sheet at native resolution
   and looking settles it in one glance — at 0.549 the ridge line runs
   through the box's right third; at 0.514 the box is on clean paper
   with the ridge just outside it. (scratchpad/boxes.js draws these.)

   Why the grid cannot see it, as far as it was chased: the ridge
   there is a THIN dark line over pale ground, so it moves a 25px
   cell's dark fraction very little, while the mist and hatching to
   the west move it a lot without ever crossing the words. Cell
   statistics at 72 columns are simply coarser than the question.
   Do not delete this without rendering the alternative first.

   ON AN ART RE-ROLL: clear these to null, re-run, and re-check by
   render. They are corrections to THIS sheet, not to the method. */
/* CLEARED 2026-08-27, on the art change it was written for: the ridge
   east of Gyeongbokgung is faded to paper inside VEN's first loop
   (tools/clearings.json), so the ridge line the override stepped off
   is no longer there. Re-checked by render on the cleared sheet. The
   0.514 is kept in the note above as the record of why this list
   exists; the list itself is empty. */
var BLOCK_X = [null, null, null, null];

var MEAN_W = 4.5;

/* The road is drawn OVER the sheet by js/journey.js, so nothing in
   the ink field can see it and the block search walked straight
   through the footpath until VEN pointed at it. ROAD_HALF is the
   verge kept either side of the seam, in cells; ROAD_INK is what a
   cell of it is worth in the ink field. 0.45 is a moderate ridge:
   text over the trail should lose to clean paper and beat text over
   a mountain, which is exactly the trade at stops 1 and 2. */
var ROAD_HALF = 1.6, ROAD_INK = 0.12;
var FRAME_DN = 10;
/* half the arrival frame's width in columns: 0.606 of the sheet at
   ZOOM_IN 1.65, over a 72-column grid. */
var FRAME_X = 21;
/* half the seal's width plus a margin, in cells — the other end of
   the span the frame has to hold (see the span rule at the scan) */
var SEAL_HW = 3;
/* per row the block hangs below the short-window frame. Small on
   purpose: it must yield to clean paper, never outrank it. */
var FRAME_W = 0.03;

/* How hard the WORST cell in the block's footprint is punished, on top
   of the mean. See the note at the score itself: over 78 cells a mean
   cannot see a ridge line clipping one corner, which is exactly the
   overlap VEN drew a circle around. At 0.8 a box holding one ridge
   cell (~0.6) scores ~0.59 against a clean box's ~0.22, so it never
   wins on a slightly better average. */
var PEAK_W = 0.8;

/* The Korean name column's own half-extents, in cells/rows, measured
   in the browser at the largest label scale (getBBox of .jmap__label
   scaled to lq 1.465): 1.14 wide, 4.15 tall. Rounded out a little for
   the ink filter's overshoot. Used only to keep the text block off it
   — see the note at the check. */
var NAME_HW = 1.4, NAME_HH = 4.4;

/* The phone box search (see phoneBox in labelSpot). PHONE_DARK is the
   dark fraction a cell may carry and still be paper the block can use
   — a little above the "." of the --why maps, so the mist at a
   clearing's edge is admitted and a stroke is not. PHONE_VERGE is
   added to ROAD_HALF. The aspect bounds keep the box paragraph-shaped
   (a 2x20 strip is useless to a six-line note); PHONE_NEAR is how
   much area a box gives up per cell of distance from the landmark. */
var PHONE_DARK = 0.035, PHONE_VERGE = 0.2;
var PHONE_ASPECT_LO = 0.5, PHONE_ASPECT_HI = 4.0, PHONE_NEAR = 0.015;
/* THE BOX IS SCORED BY THE TYPE SIZE THE COPY CAN REACH IN IT, not by
   its area (2026-08-27, VEN: "resize the text so that it fits nicely
   in the new gaps"). Area preferred tall-and-narrow at stop 1 — 14x20
   cells — when a 19x16 box was there for the taking, and a paragraph
   wants width: at the same area the wider box sets larger type. So
   for each candidate the largest size (in cells) at which this stop's
   copy, re-flowed to the box's width, fits its height is found — the
   same arithmetic js/journey.js's setBlock does on the page, at the
   same ratios (average glyph COPY_EM wide, lines COPY_LH apart, the
   caption above) — and that size is the score. The copy's length is
   lifted from js/journey.js (COPY_N below). */
var COPY_EM = 0.50, COPY_LH = 1.42, COPY_HEAD = 1.6, COPY_WASTE = 1.12;
/* The phone box is not held CLEAR_INSET cells inside the loop the way
   the desktop block is — that inset costs five cells of a clearing
   that is only twenty wide. Instead it may go anywhere inside the
   loop (PHONE_INSET) that is actually clean, and "clean" is judged
   on a second, softer field as well as `dark`: the share of a cell
   under SOFT_T, which sees the faint ghost of a ridge at the feather
   where the dark count cannot (a stroke at 20% over paper is luma
   ~190 — well above DARK_T, well below SOFT_T0, which is declared up
   by DARK_T for the same hoisting reason). */
var PHONE_SOFT = 0.15;   /* PHONE_INSET itself is declared up by polyMask */

/* WHY THE NAME SEARCH IS STILL ON `nd` AND NOT ON `dark` — 2026-08-25.

   The obvious follow-up to the block search's move off local variance
   (see DARK_T) is to move the NAME search too: same field, same
   MEAN_W/PEAK_W pair, footprint grown from ±1x±3 cells to the box's
   real ±1x±4 at lq 1.465, road folded into the ink. It was built and
   measured and it is NOT an improvement, so it is not here.

   Dark fraction inside each name's own glyph box at lq 1.465, before
   and after, on the shipped sheet:

       Gyeongbokgung  5.57%  ->  5.57%   (same cell chosen)
       Changdeokgung  0.33%  ->  1.08%   (WORSE)
       Namsangol      1.14%  ->  1.14%
       Jeonju         0.00%  ->  0.00%

   Three stops are unmoved because within the search's window there is
   no better cell to find — the anchors were already the best the
   clearings hold. Changdeokgung goes backwards because the taller
   footprint touches the palace component, which is a hard skip, so the
   name is pushed off the pocket it had. Tuning the distance weight
   only trades that for worse: at 0.02 Gyeongbokgung's name walks 20
   columns off its palace, at 0.20 it climbs onto the ridge.

   The lesson is about the SHEET, not the metric. The pocket beside
   Gyeongbokgung is narrower than the name drawn at 1.465, so no
   scoring function can put it on clean paper there — only a bigger
   clearing in the art can. Do not re-derive this; measure first, and
   the harness for it is scratchpad-sized (grow the real glyph box
   about the anchor, count pixels under DARK_T). */

  /* cm: this stop's clearing mask (see --clear), or null; cml: the
     same loop with the smaller PHONE_INSET, for the box; stopIdx for
     the copy length the box is scored against */
  function labelSpot(gy0, rx0, cm, cml, stopIdx){
    /* The landmark itself, as a FLOOD-FILLED component, not a
       thresholded bounding box. image2image regenerates the whole
       sheet, so the vig field carries a residue of drift everywhere;
       a bbox over "every cell above threshold" swallowed a drifted
       haze patch half a frame away, distance-to-landmark read as zero
       there, and 경복궁 stayed in the far corner. Seeding at the
       strongest vig cell beside the stop (the stop was CHOSEN by this
       landmark, so it is guaranteed near) and growing only through
       connected cells keeps the component honest. */
    var seed = -1, sv = 0, cx, cy;
    for (cy = Math.max(0, gy0 - 8); cy <= Math.min(ROWS - 1, gy0 + 8); cy++)
      for (cx = Math.max(0, rx0 - 10); cx <= Math.min(COLS - 1, rx0 + 10); cx++)
        if (vig[cy * COLS + cx] > sv){ sv = vig[cy * COLS + cx]; seed = cy * COLS + cx; }
    var inBlob = new Uint8Array(COLS * ROWS);
    var bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
    if (seed >= 0 && sv > 0){
      var thr = sv * 0.25, stack = [seed];
      inBlob[seed] = 1;
      while (stack.length){
        var c = stack.pop(), cyy = (c / COLS) | 0, cxx = c % COLS;
        if (cxx < bx0) bx0 = cxx;
        if (cxx > bx1) bx1 = cxx;
        if (cyy < by0) by0 = cyy;
        if (cyy > by1) by1 = cyy;
        [c - 1, c + 1, c - COLS, c + COLS].forEach(function(nb){
          if (nb < 0 || nb >= COLS * ROWS || inBlob[nb]) return;
          if (Math.abs(nb % COLS - cxx) > 1) return;   /* no row wrap */
          if (vig[nb] <= thr) return;
          inBlob[nb] = 1; stack.push(nb);
        });
      }
    }
    var hasBlob = bx1 >= bx0;

    /* The candidate footprint matches the LABEL's real size — about 3
       cells wide and 7 tall at desktop scale, not the 5x11 the first
       version used. Twice-life-size footprints could not fit into the
       tight pockets beside a building, which is precisely where VEN
       wants the names. A footprint may not touch the landmark at all
       (hard skip — a caption beside a building, never on it); among
       the rest, terrain ink plus DIST_W per cell of distance from the
       component decides.

       On why this is scored on `nd` while the block below is scored on
       `dark`, and why the obvious unification was tried and dropped,
       see the long note above NAME_HW. */
    var best = Infinity, bx = rx0, by = gy0, dy, dx;
    for (cy = Math.max(6, gy0 - 4); cy <= Math.min(ROWS - 7, gy0 + 4); cy++){
      var rxc = Math.round(road[cy]);
      for (cx = Math.max(3, rx0 - 18); cx <= Math.min(COLS - 4, rx0 + 18); cx++){
        if (Math.abs(cx - rxc) < 2) continue;
        if (Math.abs(cx - rx0) < 3 && Math.abs(cy - gy0) < 4) continue; /* seal */
        var s = 0, n = 0, hit = false;
        for (dy = -3; dy <= 3 && !hit; dy++){
          var yy = cy + dy;
          if (yy < 0 || yy >= ROWS) continue;
          for (dx = -1; dx <= 1; dx++){
            var xx = cx + dx;
            if (xx < 0 || xx >= COLS) continue;
            if (inBlob[yy * COLS + xx]){ hit = true; break; }
            s += nd[yy * COLS + xx]; n++;
          }
        }
        if (hit || !n) continue;
        var m = s / n;
        if (hasBlob){
          var ddx = Math.max(0, bx0 - cx, cx - bx1),
              ddy = Math.max(0, by0 - cy, cy - by1);
          m += DIST_W * Math.sqrt(ddx * ddx + ddy * ddy);
        }
        if (m < best){ best = m; bx = cx; by = cy; }
      }
    }
    /* The ENGLISH caption anchor (part 13, red lines; part 14, the
       correction): a SEARCHED spot in the band below the landmark, not
       a blind drop. "A couple of cells under the component" assumed
       the paper there was quiet, and three of four times it was not —
       the caption landed on the ridge below Changdeokgung, the ridge
       beside Namsangol, and Jeonju's own bottom row of roofs (the
       flood component under-reads a big vignette's extent, so "below
       the component" was still ON the art — dark text on dark roofs
       read as missing entirely).

       So: scan a caption-shaped footprint (wide and short, its real
       aspect) over the band below the component, scoring RAW ink only
       — sitting on the ground wash is fine and looks good (stop 1 has
       always sat on it); it is roofs and ridges that kill it — plus a
       mild pull toward centred-and-close, an arrival-frame bound, and
       a keep-out around the Korean name so the two texts can never
       collide. */
    var ecx = null, ecy = null, ecpk = 0;
    if (hasBlob){
      var bcx = Math.round((bx0 + bx1) / 2);

      /* THE WHOLE BLOCK has to be inside the arrival frame, not just
         its anchor. The caption used to be one line, so bounding its
         centre was bounding the text; since 2026-08-21 Zico's copy
         hangs beneath it and the block runs CAP_DN rows further down.
         Bounding the centre alone would put the last line of a
         four-line note below the fold at the moment it is meant to be
         read. FRAME_DN is the short-window frame — a 1600x689 desktop
         sees ±0.073 of sheet height, about 9 rows.

         But it CANNOT be a hard requirement, and that was measured,
         not guessed: a big vignette's own footprint already reaches
         ~8 rows below its stop, so demanding the block finish inside
         the frame left Changdeokgung and Jeonju with no candidate at
         all — and no anchor means falling all the way back to
         under-the-column, which is the exact placement VEN's red
         lines rejected in part 13. So the bound is a PREFERENCE:
         search inside the frame, and only if nothing fits there,
         search again without it. Losing "visible at the instant of
         arrival" is a much smaller loss than losing "under the
         building" — the camera keeps moving and the block comes up a
         beat later, which is the caveat part 14 already recorded. */
      var why = [];
      /* WITH A CLEARING the block goes IN the clearing — that is what
         it was cleared for — so the search runs over the loop's own
         extent rather than the band under the landmark, and every
         cell of the footprint must be inside the (inset) loop. The
         nearness term then measures the block's distance to the
         landmark's box on both axes, since a clearing can lie beside
         a building as well as below it. */
      var cmx0 = COLS, cmx1 = -1, cmy0 = ROWS, cmy1 = -1;
      if (CAPTION) cm = null;   /* the caption is under the building, not in the loop */
      if (cm){
        var ci, cxx, cyy;
        for (ci = 0; ci < COLS * ROWS; ci++){
          if (!cm[ci]) continue;
          cxx = ci % COLS; cyy = (ci - cxx) / COLS;
          if (cxx < cmx0) cmx0 = cxx; if (cxx > cmx1) cmx1 = cxx;
          if (cyy < cmy0) cmy0 = cyy; if (cyy > cmy1) cmy1 = cyy;
        }
        if (cmx1 < 0) cm = null;   /* an empty loop is no loop */
      }
      function scan(){
        var bcy = null, bcx2 = null, cbest = Infinity, bpk = 0, cy2, cx2, dy2, dx2;
        var rowLo = cm ? Math.max(3, cmy0 + CAP_UP) : by1 + CAP_GAP,
            rowHi = cm ? Math.min(ROWS - 3, cmy1 - CAP_DN) : Math.min(ROWS - 3, by1 + CAP_BAND),
            colLo = cm ? Math.max(5, cmx0 + CAP_W) : Math.max(5, bcx - 12),
            colHi = cm ? Math.min(COLS - 6, cmx1 - CAP_W) : Math.min(COLS - 6, bcx + 12);
        for (cy2 = rowLo; cy2 <= rowHi; cy2++){
          /* THE ARRIVAL FRAME IS A COST, NOT A WALL. As a hard cut it
             was the reason VEN's block would not move: it forbade
             every row below gy0+FRAME_DN, and at Namsangol the
             clearing is PINCHED at the top and opens out lower down —
             ten clean columns at row 86, eighteen at row 88. Barred
             from row 88, the search had nowhere to go but the narrow
             part, and no amount of peak-ink weighting could help it.
             Two rows lower is ~70px on a real window and inside the
             frame on anything taller than the 1600x689 reference;
             clean paper is worth that and overlap is not. */
          var late = FRAME_W * Math.max(0, (cy2 + CAP_DN) - (gy0 + FRAME_DN));
          for (cx2 = colLo; cx2 <= colHi; cx2++){
            if (cm){
              /* the whole footprint inside the inset loop, or skip */
              var okc = true, qy, qx;
              for (qy = -CAP_UP; qy <= CAP_DN && okc; qy++)
                for (qx = -CAP_W; qx <= CAP_W; qx++)
                  if (!cm[(cy2 + qy) * COLS + cx2 + qx]){ okc = false; break; }
              if (!okc) continue;
              /* and not over the landmark, which a loop may skirt */
              var okb = true;
              for (qy = -CAP_UP; qy <= CAP_DN && okb; qy++)
                for (qx = -CAP_W; qx <= CAP_W; qx++)
                  if (inBlob[(cy2 + qy) * COLS + cx2 + qx]){ okb = false; break; }
              if (!okb) continue;
            }
            /* The BLOCK must be inside the arrival frame, not just its
               centre — the same mistake as the vertical bound, caught
               the same way. At the settle zoom a window sees 1/ZOOM_IN
               = 0.606 of the sheet's width, so ±21.8 columns around the
               marker; bounding the anchor alone let stop 1's block hang
               its last two columns off the right edge of the screen at
               the moment it is meant to be read.

               SINCE 2026-08-27 THE CAMERA FRAMES THE SEAL AND THE NOTE
               TOGETHER (see the framing block in js/journey.js), so
               the rule is no longer "block within ±FRAME_X of the
               marker" but "seal and block span at most the frame's
               width". The old rule pinned stop 1's block onto the
               footpath: its clearing lies east of the road, the road
               is at 0.50, and a block centred under 0.55 cannot clear
               it. SEAL_HW is the seal plus a margin, in cells. */
            var spanLo = Math.min(cx2 - CAP_W, rx0 - SEAL_HW),
                spanHi = Math.max(cx2 + CAP_W, rx0 + SEAL_HW);
            if (spanHi - spanLo > 2 * FRAME_X) continue;
            /* KEEP OFF THE KOREAN NAME, by the two boxes' MEASURED
               extents rather than by a flat 7x6.

               The flat version is what pinned Namsangol's block where
               VEN circled it: it forbade every position within 7
               columns of the name, so the block sat hard against that
               boundary with the mountains on its other side and
               nowhere left to go. But a block DIRECTLY BELOW the name
               does not collide with it at all — the name is a narrow
               vertical column (measured 1.14 cells half-width, ±4.15
               rows at the largest label scale) and the block hangs
               below its foot.

               So: clear it sideways OR clear it vertically. That frees
               the leftward move VEN asked for and still cannot let the
               two texts touch. */
            var sepX = Math.abs(cx2 - bx) >= NAME_HW + CAP_W + 0.6;
            var sepY = (cy2 - CAP_UP) >= by + NAME_HH ||
                       (cy2 + CAP_DN) <= by - NAME_HH;
            if (!sepX && !sepY) continue;

            /* KEEP OFF THE ROAD. VEN, on Changdeokgung: *"move this
               text to the left a bit so it isnt in the footpath."*

               The block search had no idea where the road was, and it
               could not have: the road is not ON the sheet, it is drawn
               over it by js/journey.js from the very seam this file
               emits. So the only thing that ever saw it was the NAME
               search, which has had a road exclusion since the labels
               were first placed. The block needs the same, measured the
               same way — the widest row of the block against the road's
               column AT THAT ROW, since the seam wanders.

               A cost rather than a cut, like the frame bound: on a
               sheet where the corridor IS the only open paper, a hard
               exclusion can leave a stop with nowhere legal at all. */
            var s2 = 0, n3 = 0, pk = 0, rdInk = 0, pkInk = 0;
            for (dy2 = -CAP_UP; dy2 <= CAP_DN; dy2++){
              var yy2 = cy2 + dy2;
              if (yy2 < 0 || yy2 >= ROWS) continue;
              for (dx2 = -CAP_W; dx2 <= CAP_W; dx2++){
                var xx2 = cx2 + dx2;
                if (xx2 < 0 || xx2 >= COLS) continue;
                var iv = dark[yy2 * COLS + xx2];
                if (iv > pkInk) pkInk = iv;   /* real ink alone, for --shape-out */
                /* THE ROAD COUNTS AS INK. It is not on the sheet —
                   js/journey.js draws it over the top from this very
                   seam — so the ink field cannot see it, and the block
                   search walked through the footpath until VEN pointed
                   at Changdeokgung. Adding it to the SAME field it is
                   competing with is what makes it behave: a first
                   attempt scored it as a separate penalty and, being
                   on a different scale, it simply won every time —
                   which shoved stop 1 off the corridor and deeper into
                   the mountains, the opposite of what was asked. */
                if (Math.abs(xx2 - road[yy2]) <= ROAD_HALF){
                  iv += ROAD_INK;
                  if (yy2 === cy2) rdInk = ROAD_INK;
                }
                s2 += iv; n3++;
                if (iv > pk) pk = iv;
              }
            }
            if (!n3) continue;
            /* MEAN INK IS THE WRONG OBJECTIVE FOR A BIG BOX, and VEN
               found it: *"move the whole block of text to the left so
               that the right side of the text is no longer overlapping
               with the mountains."* The box that placed it scored
               clear — because it is 78 cells and one ridge cell at
               0.6 against blank paper at 0.1 moves the mean by 0.006.
               An average cannot see a thin line crossing a corner; it
               drowns in the blank majority. That was invisible while
               the footprint was a single caption line and fatal once
               it became a paragraph.
               So the PEAK cell counts too, and heavily: any box with
               real ink anywhere in it now loses to one with none. */
            /* nearness: rows below the landmark's foot, or with a
               clearing the block box's gap to the landmark's box on
               whichever axis it lies (a loop can be beside as well) */
            var nearC = cm
              ? Math.max(0, (cy2 - CAP_UP) - by1, by0 - (cy2 + CAP_DN)) +
                Math.max(0, (cx2 - CAP_W) - bx1, bx0 - (cx2 + CAP_W)) * 0.6
              : (cy2 - by1);
            var m2 = MEAN_W * (s2 / n3) + PEAK_W * pk + late
                   + Math.abs(cx2 - bcx) * CENTRE_W + nearC * CAP_NEAR;
            if (WHY) why.push({ x: cx2, y: cy2, mean: MEAN_W * (s2 / n3), peak: pk,
                                pull: Math.abs(cx2 - bcx) * CENTRE_W,
                                near: nearC * CAP_NEAR + late, road: rdInk, total: m2 });
            if (m2 < cbest){ cbest = m2; bcx2 = cx2; bcy = cy2; bpk = pkInk; }
          }
        }
        return bcy == null ? null : { x: bcx2, y: bcy, pk: bpk };
      }
      var spot2 = scan();
      /* A loop too narrow for the desktop block (Jeonju's is eight
         columns inside its inset; the block wants thirteen) must not
         leave the stop with NO anchor — that falls all the way back to
         under-the-column, which part 13 rejected. Search the band
         under the landmark instead, as if there were no loop; the
         phone box below still uses the loop. */
      if (!spot2 && cm){
        console.log("  note    stop at row " + gy0 + ": its loop cannot hold the desktop block; " +
                    "searching under the landmark instead");
        cm = null;
        spot2 = scan();
      }
      if (spot2){ ecx = spot2.x; ecy = spot2.y; ecpk = spot2.pk; }
      if (WHY){
        why.sort(function(a, b){ return a.total - b.total; });
        console.log("  --why  stop at row " + gy0 + "  landmark cols " + bx0 + "-" + bx1 +
                    " (centre " + bcx + "), name col " + bx + " row " + by);
        /* The ink profile of the band the block has to live in, one
           character per column: the worst cell in that column over the
           block's own row span. This is the question "how wide is the
           clear corridor here, really", answered directly — a run of
           dots is paper the text can stand on. */
        if (ecy != null){
          var prof = "", pcx, pdy;
          for (pcx = 0; pcx < COLS; pcx++){
            var pv = 0;
            for (pdy = -CAP_UP; pdy <= CAP_DN; pdy++){
              var pyy = ecy + pdy;
              if (pyy < 0 || pyy >= ROWS) continue;
              if (dark[pyy * COLS + pcx] > pv) pv = dark[pyy * COLS + pcx];
            }
            prof += pv < 0.02 ? "." : pv < 0.05 ? ":" : pv < 0.10 ? "o" : pv < 0.18 ? "O" : "#";
          }
          console.log("         band ink by column (row " + ecy + "): " + prof);
          console.log("         chosen block spans cols " +
                      (ecx - CAP_W) + "-" + (ecx + CAP_W));
          /* and the raw cell map around the landmark, so the SHAPE of
             the clearing is visible — a run that is wide at one row
             and pinched two rows down is the difference between "the
             text fits" and "the text fits if it is narrow and tall". */
          var r0 = Math.max(0, by0 - 2), r1 = Math.min(ROWS - 1, by1 + CAP_BAND + 2);
          console.log("         cell map, cols " + Math.max(0, bcx - 20) +
                      "-" + Math.min(COLS - 1, bcx + 20) + ", rows " + r0 + "-" + r1 + ":");
          for (var mr = r0; mr <= r1; mr++){
            var line = "";
            for (var mc = Math.max(0, bcx - 20); mc <= Math.min(COLS - 1, bcx + 20); mc++){
              var mv = dark[mr * COLS + mc];
              line += mv < 0.02 ? "." : mv < 0.05 ? ":" : mv < 0.10 ? "o" : mv < 0.18 ? "O" : "#";
            }
            console.log("           " + (mr < 100 ? " " : "") + mr + " " + line);
          }
        }
        why.slice(0, 8).forEach(function(c){
          console.log("         x " + c.x + " y " + c.y +
                      "  total " + c.total.toFixed(4) +
                      "  = mean " + c.mean.toFixed(4) +
                      " + peak " + c.peak.toFixed(4) +
                      " + pull " + c.pull.toFixed(4) +
                      " + road " + (c.road || 0).toFixed(4) +
                      " + near " + c.near.toFixed(4));
        });
      }
    }
    /* THE PHONE'S BOX. On a phone the block is not the desktop's block
       drawn smaller: it is re-flowed to narrower lines at a size that
       can be read, so it is a different, larger shape, and js/journey.js
       FITS it into a box rather than hanging it off an anchor. This
       finds that box — the largest clean rectangle (cells under
       PHONE_DARK, off the road by a verge, off the Korean name, off
       the landmark, and inside the clearing when there is one),
       shaped like a paragraph rather than a strip, and near the
       landmark when it can be. Emitted as MAP_CLEAR; a stop with no
       clearing still gets one, searched round the stop, so Jeonju's
       phone block has somewhere measured to go. */
    var pb = null, pbRows = null;
    (function(){
      /* the loose loop's extent, when there is one */
      var lx0 = COLS, lx1 = -1, ly0 = ROWS, ly1 = -1, li;
      if (cml){
        for (li = 0; li < COLS * ROWS; li++){
          if (!cml[li]) continue;
          var lxx = li % COLS, lyy = (li - lxx) / COLS;
          if (lxx < lx0) lx0 = lxx; if (lxx > lx1) lx1 = lxx;
          if (lyy < ly0) ly0 = lyy; if (lyy > ly1) ly1 = lyy;
        }
        if (lx1 < 0) cml = null;
      }
      var ux0 = cml ? lx0 : Math.max(0, rx0 - 24), ux1 = cml ? lx1 : Math.min(COLS - 1, rx0 + 24),
          uy0 = cml ? ly0 : Math.max(0, gy0 - 6),  uy1 = cml ? ly1 : Math.min(ROWS - 1, gy0 + 24);
      var uw = ux1 - ux0 + 1, uh = uy1 - uy0 + 1, ux, uy;
      if (uw < 3 || uh < 3) return;
      var use = new Uint8Array(uw * uh);
      for (uy = 0; uy < uh; uy++)
        for (ux = 0; ux < uw; ux++){
          var gx = ux0 + ux, gy = uy0 + uy, gi = gy * COLS + gx;
          if (cml && !cml[gi]) continue;
          if (inBlob[gi]) continue;
          if (!PLAN && (dark[gi] >= PHONE_DARK || soft[gi] >= PHONE_SOFT)) continue;
          if (Math.abs(gx - road[gy]) <= ROAD_HALF + PHONE_VERGE) continue;
          if (Math.abs(gx - bx) <= NAME_HW + 0.5 && Math.abs(gy - by) <= NAME_HH + 0.5) continue;
          use[uy * uw + ux] = 1;
        }
      var S = new Int32Array((uw + 1) * (uh + 1));
      for (uy = 0; uy < uh; uy++)
        for (ux = 0; ux < uw; ux++)
          S[(uy + 1) * (uw + 1) + ux + 1] = S[uy * (uw + 1) + ux + 1] + S[(uy + 1) * (uw + 1) + ux]
                                           - S[uy * (uw + 1) + ux] + use[uy * uw + ux];
      function sum(x0, y0, x1, y1){
        return S[(y1 + 1) * (uw + 1) + x1 + 1] - S[y0 * (uw + 1) + x1 + 1]
             - S[(y1 + 1) * (uw + 1) + x0] + S[y0 * (uw + 1) + x0];
      }
      /* the largest type size, in cells, at which N characters of copy
         re-flowed to w cells fit h cells — the box's score */
      var N = (COPY_N[stopIdx] || 160) * COPY_WASTE;
      function typeSize(w, h){
        var lo = 0.05, hi = 4, it;
        for (it = 0; it < 24; it++){
          var s = (lo + hi) / 2, cpl = Math.floor(w / (COPY_EM * s));
          var lines = cpl > 0 ? Math.ceil(N / cpl) : Infinity;
          if (lines * COPY_LH * s + COPY_HEAD * s <= h) lo = s; else hi = s;
        }
        return lo;
      }
      var best = 0, bb = null, bs = 0, x0, y0, x1, y1;
      for (y0 = 0; y0 < uh; y0++)
        for (y1 = y0 + 2; y1 < uh; y1++)
          for (x0 = 0; x0 < uw; x0++)
            for (x1 = x0 + 2; x1 < uw; x1++){
              var w = x1 - x0 + 1, h = y1 - y0 + 1;
              if (w < h * PHONE_ASPECT_LO || w > h * PHONE_ASPECT_HI) continue;
              if (sum(x0, y0, x1, y1) !== w * h) continue;
              var gx0 = ux0 + x0, gx1 = ux0 + x1, gy0b = uy0 + y0, gy1b = uy0 + y1;
              var dd = hasBlob
                ? Math.max(0, bx0 - gx1, gx0 - bx1) + Math.max(0, by0 - gy1b, gy0b - by1) : 0;
              var ts = typeSize(w, h);
              var sc = ts * Math.max(0.2, 1 - PHONE_NEAR * dd);
              if (sc > best){ best = sc; bs = ts; bb = [gx0, gy0b, gx1 + 1, gy1b + 1]; }
            }
      if (bb) pb = bb;
      if (bb) console.log("  box     stop " + (stopIdx + 1) + "  " + (bb[2] - bb[0]) + "x" + (bb[3] - bb[1]) +
                          " cells, type up to " + bs.toFixed(2) + " cells for " + Math.round(N / COPY_WASTE) + " chars");

      /* THE SHAPE, row by row (2026-08-27, VEN: "scale up the text a
         bit so that it fits a bit better in each indentation/clearing
         ... start a new line wherever necessary"). A clearing is not
         a rectangle: east of the road at stop 1 the paper is 19 cells
         wide on the lower rows and 15 at the top, and a box takes the
         narrower width for every line. So each row of the loop is
         emitted with its widest run of usable cells on the box's side
         of the road, and js/journey.js wraps every line to the width
         of the rows it sits on. The box stays as the fallback and the
         extent the tool prints. */
      if (bb){
        var rows = [], ry, rx, r0 = -1, r1 = -1;
        for (ry = uy0; ry <= uy1; ry++){
          var bestRun = null, runStart = -1;
          for (rx = ux0; rx <= ux1 + 1; rx++){
            var on = rx <= ux1 && use[(ry - uy0) * uw + (rx - ux0)];
            if (on && runStart < 0) runStart = rx;
            if (!on && runStart >= 0){
              /* a run counts if it overlaps the box's columns */
              if (rx > bb[0] && runStart < bb[2] &&
                  (!bestRun || rx - runStart > bestRun[1] - bestRun[0])) bestRun = [runStart, rx];
              runStart = -1;
            }
          }
          rows.push(bestRun);
          if (bestRun){ if (r0 < 0) r0 = ry; r1 = ry; }
        }
        pbRows = { top: r0, rows: rows.slice(r0 - uy0, r1 - uy0 + 1) };
      }
      if (WHY){
        console.log("  --why  phone box " + (bb ? "cols " + bb[0] + "-" + bb[2] + " rows " + bb[1] + "-" + bb[3] +
                    " (" + (bb[2] - bb[0]) + "x" + (bb[3] - bb[1]) + " cells)" : "NONE"));
        /* what stopped it: one character per cell over the search
           window. '.' usable, 'm' outside the inset loop, 'b' the
           landmark, 'r' the road and its verge, 'n' the name, '#'
           ink; the chosen box is drawn in '=' */
        console.log("         phone search window cols " + ux0 + "-" + ux1 + ", rows " + uy0 + "-" + uy1 + ":");
        for (uy = 0; uy < uh; uy++){
          var ln = "";
          for (ux = 0; ux < uw; ux++){
            var gx2 = ux0 + ux, gy2 = uy0 + uy, gi2 = gy2 * COLS + gx2, ch;
            if (bb && gx2 >= bb[0] && gx2 < bb[2] && gy2 >= bb[1] && gy2 < bb[3]) ch = "=";
            else if (cml && !cml[gi2]) ch = "m";
            else if (inBlob[gi2]) ch = "b";
            else if (Math.abs(gx2 - road[gy2]) <= ROAD_HALF + PHONE_VERGE) ch = "r";
            else if (Math.abs(gx2 - bx) <= NAME_HW + 0.5 && Math.abs(gy2 - by) <= NAME_HH + 0.5) ch = "n";
            else if (dark[gi2] >= PHONE_DARK) ch = "#";
            else if (soft[gi2] >= PHONE_SOFT) ch = "s";
            else ch = ".";
            ln += ch;
          }
          console.log("           " + (gy2 < 100 ? " " : "") + (uy0 + uy) + " " + ln);
        }
      }
    })();

    return {
      lx: (bx + 0.5) / COLS, ly: (by + 0.5) / ROWS,
      ex: ecx != null ? (ecx + 0.5) / COLS : null,
      ey: ecy != null ? (ecy + 0.5) / ROWS : null,
      epk: ecpk,
      pb: pb ? [pb[0] / COLS, pb[1] / ROWS, pb[2] / COLS, pb[3] / ROWS] : null,
      shape: pbRows ? {
        top: pbRows.top / ROWS, dy: 1 / ROWS,
        rows: pbRows.rows.map(function(r){ return r ? [r[0] / COLS, r[1] / COLS] : null; })
      } : null
    };
  }

  (function(){
    var gy, dx;
    var rowScore = new Float64Array(ROWS);
    for (gy = 0; gy < ROWS; gy++){
      var rx = Math.round(road[gy]), best = 0;
      for (dx = -DX; dx <= DX; dx++){
        var x = rx + dx;
        if (x < 0 || x >= COLS) continue;
        if (vig[gy * COLS + x] > best) best = vig[gy * COLS + x];
      }
      rowScore[gy] = best;
    }
    var picked = [], k, gy2, s2;
    for (k = 0; k < NSTOP; k++){
      var bi = -1, bv = -Infinity;
      for (gy2 = loR; gy2 <= hiR; gy2++){
        if (rowScore[gy2] > bv){ bv = rowScore[gy2]; bi = gy2; }
      }
      if (bi < 0) break;
      picked.push(bi);
      for (s2 = bi - SUP; s2 <= bi + SUP; s2++)
        if (s2 >= 0 && s2 < ROWS) rowScore[s2] = -Infinity;
    }
    picked.sort(function(a, b){ return a - b; });
    picked.forEach(function(gy3, si3){
      var pt2 = atRow(gy3);
      var spot = labelSpot(gy3, Math.round(road[gy3]), clearMask[si3 + 1] || null,
                           clearLoose[si3 + 1] || null, si3);
      pt2.lx = spot.lx; pt2.ly = spot.ly;
      pt2.ex = spot.ex; pt2.ey = spot.ey;
      pt2.pb = spot.pb; pt2.shape = spot.shape; pt2.epk = spot.epk;
      if (BLOCK_X[si3] != null && pt2.ex != null){
        console.log("  review  stop " + (si3 + 1) + " block x " +
                    pt2.ex.toFixed(3) + " -> " + BLOCK_X[si3].toFixed(3) +
                    "  (BLOCK_X override, see the note at its definition)");
        pt2.ex = BLOCK_X[si3];
      }
      stops.push(pt2);
    });
  })();
  if (stops.length !== NSTOP){
    console.error("--base found only " + stops.length + " landmarks; wanted " + NSTOP);
    process.exit(1);
  }
} else (function(){
  var i;
  for (i = 0; i < NSTOP; i++){
    var f = NSTOP === 1 ? 0.5 : INSET + (1 - 2 * INSET) * (i / (NSTOP - 1));
    var gy = Math.round(f * (ROWS - 1));
    /* Nudge to the most open row within SNAP, so a marker lands in a
       clearing rather than halfway up a ridge — but never past INSET.
       The snap is free to move a stop the same distance as the inset
       itself, so without this the first and last stops walk right to
       the sheet's edge and the camera frames off-map paper when it
       arrives. Measured on map-pirate: stop 4 snapped to y=0.973. */
    var loRow = Math.ceil(INSET * (ROWS - 1)),
        hiRow = Math.floor((1 - INSET) * (ROWS - 1));
    var best = -Infinity, by = gy, k;
    for (k = -SNAP; k <= SNAP; k++){
      var j = gy + k;
      if (j < loRow || j > hiRow) continue;
      var gx = Math.round(road[j]);
      var o = open[j * COLS + gx] + INT_W * interest(gx, j);
      if (o > best){ best = o; by = j; }
    }
    stops.push(atRow(by));
  }
})();

/* ---- emit -------------------------------------------------------- */

function f3(v){ return (Math.round(v * 1000) / 1000).toFixed(3); }

/* subsample the road to control points — a dozen is plenty for a
   smooth curve and keeps the emitted array readable */
var CTRL = 14, ctrl = [];
(function(){
  var i;
  for (i = 0; i < CTRL; i++){
    var gy = Math.round(i / (CTRL - 1) * (ROWS - 1));
    ctrl.push(atRow(gy));
  }
})();

console.log("");
console.log("  " + src + "  " + img.w + "x" + img.h +
            "   grid " + COLS + "x" + ROWS);
console.log("  aspect " + (img.w / img.h).toFixed(4));
console.log("");
console.log("  /* GENERATED by tools/maproute.js — do not hand-edit.");
console.log("     Normalised to the sheet, so a re-prep at another size still fits. */");
console.log("  var MAP_PATH = [");
console.log(ctrl.map(function(p){ return "    [" + f3(p.x) + ", " + f3(p.y) + "]"; }).join(",\n"));
console.log("  ];");
console.log("  var MAP_STOPS = [");
console.log(stops.map(function(p){
  return "    [" + f3(p.x) + ", " + f3(p.y) +
         (p.lx != null ? ", " + f3(p.lx) + ", " + f3(p.ly) : "") +
         (p.ex != null ? ", " + f3(p.ex) + ", " + f3(p.ey) : "") + "]";
}).join(",\n"));
console.log("  ];");
if (stops.some(function(p){ return p.pb; })){
  console.log("  /* the note's clearing per stop: `box` [x0, y0, x1, y1] is the widest");
  console.log("     clean rectangle, `rows` the clean run of paper on each grid row");
  console.log("     from `top` down, one row `dy` tall — js/journey.js wraps each line");
  console.log("     to the row it sits on. See setBlock there and the shape in");
  console.log("     tools/maproute.js. */");
  console.log("  var MAP_CLEAR = [");
  console.log(stops.map(function(p){
    if (!p.pb) return "    null";
    var s = "    { box: [" + p.pb.map(f3).join(", ") + "]";
    if (p.shape){
      s += ",\n      top: " + f3(p.shape.top) + ", dy: " + (Math.round(p.shape.dy * 100000) / 100000) +
           ",\n      rows: [" + p.shape.rows.map(function(r){
             return r ? "[" + f3(r[0]) + ", " + f3(r[1]) + "]" : "null";
           }).join(", ") + "] }";
    } else s += " }";
    return s;
  }).join(",\n"));
  console.log("  ];");
}
if (SHAPE_OUT){
  fs.writeFileSync(SHAPE_OUT, JSON.stringify({
    cols: COLS, rows: ROWS,
    road: road.map(function(r){ return (r + 0.5) / COLS; }),
    stops: stops.map(function(p){
      return { x: p.x, y: p.y, lx: p.lx, ly: p.ly, box: p.pb, shape: p.shape,
               cap: p.ex != null ? { x: p.ex, y: p.ey, peak: +(p.epk || 0).toFixed(3) } : null };
    })
  }, null, 1));
  console.log("  shapes   " + SHAPE_OUT);
}
console.log("");

/* ---- debug render ------------------------------------------------ */

if (DEBUG){
  var out = Buffer.from(img.data);
  function dot(cx, cy, r, col){
    var x, y;
    for (y = -r; y <= r; y++)
      for (x = -r; x <= r; x++){
        if (x * x + y * y > r * r) continue;
        var px = Math.round(cx) + x, py = Math.round(cy) + y;
        if (px < 0 || py < 0 || px >= img.w || py >= img.h) continue;
        var p = (py * img.w + px) * 3;
        out[p] = col[0]; out[p + 1] = col[1]; out[p + 2] = col[2];
      }
  }
  var gy2;
  for (gy2 = 0; gy2 < ROWS; gy2++){
    var pt = atRow(gy2);
    dot(pt.x * img.w, pt.y * img.h, 5, [142, 74, 56]);
  }
  stops.forEach(function(p){
    dot(p.x * img.w, p.y * img.h, 26, [33, 27, 17]);
    dot(p.x * img.w, p.y * img.h, 17, [235, 221, 185]);
    /* the label footprint, as a filled box, so the debug render
       answers "does the name sit on blank paper" without a browser */
    function box(cxF, cyF, bwF, bhF, upF){
      var bw = Math.round(img.w * bwF), bh = Math.round(img.h * bhF);
      var up = Math.round(img.h * (upF == null ? bhF : upF));
      var cx2 = Math.round(cxF * img.w), cy2 = Math.round(cyF * img.h), x2, y2;
      for (y2 = -up; y2 <= bh; y2++)
        for (x2 = -bw; x2 <= bw; x2++){
          var px2 = cx2 + x2, py2 = cy2 + y2;
          if (px2 < 0 || py2 < 0 || px2 >= img.w || py2 >= img.h) continue;
          var p2 = (py2 * img.w + px2) * 3;
          out[p2] = (out[p2] + 33) >> 1;
          out[p2 + 1] = (out[p2 + 1] + 27) >> 1;
          out[p2 + 2] = (out[p2 + 2] + 17) >> 1;
        }
    }
    if (p.lx != null) box(p.lx, p.ly, 0.045, 0.045);      /* the name */
    /* The caption+copy BLOCK, drawn at exactly the footprint the
       search scored — one caption row up, three copy rows down. It
       used to be drawn at ~2x the caption's width as deliberate
       margin; now that real body text fills it, "the box is clear"
       has to mean the text is clear, so the box is life-size. */
    if (p.ex != null)
      box(p.ex, p.ey, CAP_W / COLS, CAP_DN / ROWS, CAP_UP / ROWS);
    /* the phone box, as an OUTLINE so the paper inside it can be read */
    if (p.pb){
      var qx0 = Math.round(p.pb[0] * img.w), qy0 = Math.round(p.pb[1] * img.h),
          qx1 = Math.round(p.pb[2] * img.w), qy1 = Math.round(p.pb[3] * img.h), t, u2;
      for (t = 0; t < 4; t++){
        for (u2 = qx0; u2 <= qx1; u2++){ dot(u2, qy0 + t, 0, [142, 74, 56]); dot(u2, qy1 - t, 0, [142, 74, 56]); }
        for (u2 = qy0; u2 <= qy1; u2++){ dot(qx0 + t, u2, 0, [142, 74, 56]); dot(qx1 - t, u2, 0, [142, 74, 56]); }
      }
    }
  });
  var dst = src.replace(/\.png$/i, "-route.png");
  fs.writeFileSync(dst, encodeRGB(img.w, img.h, out));
  console.log("  debug    " + dst);
  console.log("");
}
