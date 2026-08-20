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
      D = new Float64Array(COLS * ROWS), gx, gy;
  for (gy = 0; gy < ROWS; gy++){
    var y0 = Math.floor(gy * im.h / ROWS),
        y1 = Math.max(y0 + 1, Math.floor((gy + 1) * im.h / ROWS));
    for (gx = 0; gx < COLS; gx++){
      var x0 = Math.floor(gx * im.w / COLS),
          x1 = Math.max(x0 + 1, Math.floor((gx + 1) * im.w / COLS));
      var s = 0, s2 = 0, n = 0, yy, xx;
      for (yy = y0; yy < y1; yy++){
        for (xx = x0; xx < x1; xx++){
          var p = (yy * im.w + xx) * 3;
          var l = 0.2126 * im.data[p] + 0.7152 * im.data[p + 1] + 0.0722 * im.data[p + 2];
          s += l; s2 += l * l; n++;
        }
      }
      var m = s / n;
      L[gy * COLS + gx] = m;
      D[gy * COLS + gx] = Math.sqrt(Math.max(0, s2 / n - m * m));
    }
  }
  return { lum: L, dev: D };
}

var G = gridsOf(img);
var lum = G.lum, dev = G.dev;

function norm(arr){
  var lo = Infinity, hi = -Infinity, i;
  for (i = 0; i < arr.length; i++){ if (arr[i] < lo) lo = arr[i]; if (arr[i] > hi) hi = arr[i]; }
  var span = hi - lo || 1, out = new Float64Array(arr.length);
  for (i = 0; i < arr.length; i++) out[i] = (arr[i] - lo) / span;
  return out;
}

var nl = norm(lum), nd = norm(dev);

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
      open[i] = nl[i] - INK_W * nd[i]
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
  function labelSpot(gy0, rx0){
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
       component decides. */
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
    return { lx: (bx + 0.5) / COLS, ly: (by + 0.5) / ROWS };
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
    picked.forEach(function(gy3){
      var pt2 = atRow(gy3);
      var spot = labelSpot(gy3, Math.round(road[gy3]));
      pt2.lx = spot.lx; pt2.ly = spot.ly;
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
         (p.lx != null ? ", " + f3(p.lx) + ", " + f3(p.ly) : "") + "]";
}).join(",\n"));
console.log("  ];");
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
    if (p.lx != null){
      var bw = Math.round(img.w * 0.045), bh = Math.round(img.h * 0.045);
      var cx2 = Math.round(p.lx * img.w), cy2 = Math.round(p.ly * img.h), x2, y2;
      for (y2 = -bh; y2 <= bh; y2++)
        for (x2 = -bw; x2 <= bw; x2++){
          var px2 = cx2 + x2, py2 = cy2 + y2;
          if (px2 < 0 || py2 < 0 || px2 >= img.w || py2 >= img.h) continue;
          var p2 = (py2 * img.w + px2) * 3;
          out[p2] = (out[p2] + 33) >> 1;
          out[p2 + 1] = (out[p2 + 1] + 27) >> 1;
          out[p2 + 2] = (out[p2 + 2] + 17) >> 1;
        }
    }
  });
  var dst = src.replace(/\.png$/i, "-route.png");
  fs.writeFileSync(dst, encodeRGB(img.w, img.h, out));
  console.log("  debug    " + dst);
  console.log("");
}
