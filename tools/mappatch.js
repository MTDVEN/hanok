/* ================================================================
   Land a re-generated landmark back into the ACCEPTED map sheet —
     node tools/mappatch.js <base.png> <edited.png> <out.png> [--debug]

   WHY THIS EXISTS. Editing the sheet in OpenArt works (§9v: the four
   vignettes were painted into the plain terrain exactly that way) but
   image2image RE-RENDERS THE WHOLE PAGE. Measured on session 13's
   first roll: mean 16.7 dRGB across the sheet against the master it
   was handed, with the drawing itself preserved — every mountain came
   back as the same mountain drawn with slightly different strokes.

   That is harmless right up until something MEASURES the sheet. The
   stops are found by differencing against `map-ink-master-plain.png`
   and normalised over the whole grid, so a re-stroked sheet moves
   landmarks that were never touched: the first whole-sheet swap slid
   the Jeonju stop from 0.372,0.857 to 0.307,0.911 — off the village
   it exists to frame — for the sole reason that a new landmark had
   entered the normalisation. Three signed-off vignettes should not
   move because the fourth was edited.

   So the sheet is not swapped. Only the CHANGED CLEARING is taken,
   and the rest of the accepted master survives byte for byte. The
   check that this worked is exact and worth running every time:
   re-route the patched sheet and the untouched stops must come back
   at the values already in js/journey.js.

   HOW THE REGION IS FOUND — by difference, never by hand (same rule
   as the road, the stops and PLOTS). A cell is "new work" when the
   edited sheet differs from the base there AND the base was quiet
   paper: new ink on blank parchment is precisely what an added
   building is. Re-stroked mountains fail the second test, and that is
   the whole trick. The largest such blob, dilated, is the patch.

   HOW THE PIXELS ARE CHOSEN — by the BASE's local contrast:

     take the edited pixel where the base is smooth (bare paper, a
     wash apron), keep the base pixel where the base carries ink.

   Two things fall out of that for free and both are wanted:
     - existing linework inside the patch — the hanok, its wall, the
       mountains at the frame's edge — is KEPT from the accepted
       master, so the building the client asked to keep cannot drift;
     - a new roof drawn behind that hanok is admitted where it lies on
       paper and clipped where the hanok already stands, which is the
       correct occlusion for a building further away.

   The patch is tone-matched to the base over the paper it lands on
   before it is blended, because a re-render also shifts the paper a
   little and a step in the parchment is the one seam the eye finds.

   --limit x0,y0,x1,y1 (normalised) clips the admitted region to a box
   BEFORE the blob search. It exists because the sheet is not only a
   picture: `tools/maproute.js` reads it, and a vignette that grows
   across the corridor the road travels sends the seam — and with it
   the stop marker — off to the far side of the valley. Measured on
   session 13's second roll: a new barn reaching x 0.63 pushed the
   Namsangol road from x 0.60 to x 0.27, through the rice terraces,
   and left the seal a seventh of the sheet away from the village it
   marks. Clipping the patch is the deterministic version of asking
   the model to stay out of the channel. Put the box edge in a GAP
   between buildings, never through one.

   --debug also writes <out>-mask.png: the blend weight as greyscale
   over the sheet, which is how you check the region without opening
   a browser.

   No dependencies beyond zlib — same rule as the other map tools.
================================================================= */

var zlib = require("zlib");
var fs   = require("fs");

/* ---- knobs ------------------------------------------------------ */

var CELL      = 32;    // analysis cell, px. Fine enough to trace a roof.
var DIFF_ON   = 14;    // mean |dRGB| in a cell that counts as changed
var QUIET     = 13;    // base stdev at or under which a cell was "paper"
var GROW      = 3;     // cells the found region is dilated by
var FEATHER   = 40;    // px the region's edge is ramped over
var INK_LO    = 9;     // base local stdev fully treated as paper
var INK_HI    = 26;    // base local stdev fully treated as ink
var INK_R     = 3;     // px radius the ink field is measured over
var INK_BLUR  = 5;     // px the ink field is smeared, so a stroke
                       // protects its own shoulder as well as itself

/* ---- PNG (see the note atop tools/png.js — duplicated on purpose) */

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

function encode(w, h, ch, ct, data){
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = ct;
  var stride = w * ch, raw = Buffer.alloc(h * (stride + 1)), y;
  for (y = 0; y < h; y++){
    raw[y * (stride + 1)] = 0;
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

/* ---- fields ------------------------------------------------------ */

function lumaOf(img){
  var n = img.w * img.h, L = new Float32Array(n), i;
  for (i = 0; i < n; i++)
    L[i] = 0.2126 * img.data[i * 3] + 0.7152 * img.data[i * 3 + 1] +
           0.0722 * img.data[i * 3 + 2];
  return L;
}

/* local standard deviation over a (2r+1)^2 window, by summed-area
   tables — the whole sheet is 17M pixels and a naive window is not
   worth waiting for. */
function stdevField(L, w, h, r){
  var s = new Float64Array((w + 1) * (h + 1)),
      q = new Float64Array((w + 1) * (h + 1)), x, y;
  for (y = 0; y < h; y++){
    var rs = 0, rq = 0;
    for (x = 0; x < w; x++){
      var v = L[y * w + x];
      rs += v; rq += v * v;
      s[(y + 1) * (w + 1) + x + 1] = s[y * (w + 1) + x + 1] + rs;
      q[(y + 1) * (w + 1) + x + 1] = q[y * (w + 1) + x + 1] + rq;
    }
  }
  function box(T, x0, y0, x1, y1){
    return T[y1 * (w + 1) + x1] - T[y0 * (w + 1) + x1] -
           T[y1 * (w + 1) + x0] + T[y0 * (w + 1) + x0];
  }
  var D = new Float32Array(w * h);
  for (y = 0; y < h; y++){
    var y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    for (x = 0; x < w; x++){
      var x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
      var n = (x1 - x0) * (y1 - y0);
      var m = box(s, x0, y0, x1, y1) / n;
      D[y * w + x] = Math.sqrt(Math.max(0, box(q, x0, y0, x1, y1) / n - m * m));
    }
  }
  return D;
}

/* separable box blur, `pass` times — a cheap Gaussian */
function blur(F, w, h, r, pass){
  var A = F, B = new Float32Array(w * h), x, y, p, i;
  for (p = 0; p < (pass || 1); p++){
    for (y = 0; y < h; y++){
      var acc = 0, cnt = 0, row = y * w;
      for (x = 0; x <= r && x < w; x++){ acc += A[row + x]; cnt++; }
      for (x = 0; x < w; x++){
        B[row + x] = acc / cnt;
        var add = x + r + 1, sub = x - r;
        if (add < w){ acc += A[row + add]; cnt++; }
        if (sub >= 0){ acc -= A[row + sub]; cnt--; }
      }
    }
    for (x = 0; x < w; x++){
      var acc2 = 0, cnt2 = 0;
      for (y = 0; y <= r && y < h; y++){ acc2 += B[y * w + x]; cnt2++; }
      for (y = 0; y < h; y++){
        A[y * w + x] = acc2 / cnt2;
        var addy = y + r + 1, suby = y - r;
        if (addy < h){ acc2 += B[addy * w + x]; cnt2++; }
        if (suby >= 0){ acc2 -= B[suby * w + x]; cnt2--; }
      }
    }
  }
  for (i = 0; i < 0; i++);   /* A is F, mutated in place */
  return A;
}

/* ---- run --------------------------------------------------------- */

var argv  = process.argv.slice(2),
    aPath = argv[0], bPath = argv[1], oPath = argv[2],
    DEBUG = argv.indexOf("--debug") >= 0;

var LIMIT = (function(){
  var i = argv.indexOf("--limit");
  if (i < 0) return null;
  var v = (argv[i + 1] || "").split(",").map(Number);
  if (v.length !== 4 || v.some(isNaN))
    throw new Error("--limit wants x0,y0,x1,y1 as fractions of the sheet");
  return v;
})();

if (!aPath || !bPath || !oPath){
  console.error("usage: node tools/mappatch.js <base.png> <edited.png> <out.png> " +
                "[--limit x0,y0,x1,y1] [--debug]");
  process.exit(1);
}

var A = decode(fs.readFileSync(aPath)),
    B = decode(fs.readFileSync(bPath));
if (A.w !== B.w || A.h !== B.h)
  throw new Error("sheets differ in size: " + A.w + "x" + A.h + " vs " + B.w + "x" + B.h);

var W = A.w, H = A.h, N = W * H;
console.log("  base    " + aPath + "  " + W + "x" + H);
console.log("  edited  " + bPath);

var LA = lumaOf(A), LB = lumaOf(B);

/* --- 1. find the new work, by cell ------------------------------- */

var CW = Math.ceil(W / CELL), CH = Math.ceil(H / CELL);
var newWork = new Uint8Array(CW * CH), cx, cy, x, y;
var changed = 0, quietChanged = 0;

for (cy = 0; cy < CH; cy++){
  var y0 = cy * CELL, y1 = Math.min(H, y0 + CELL);
  for (cx = 0; cx < CW; cx++){
    var x0 = cx * CELL, x1 = Math.min(W, x0 + CELL);
    var d = 0, s = 0, s2 = 0, n = 0;
    for (y = y0; y < y1; y += 2){
      for (x = x0; x < x1; x += 2){
        var i = y * W + x, p = i * 3;
        d += (Math.abs(A.data[p] - B.data[p]) +
              Math.abs(A.data[p + 1] - B.data[p + 1]) +
              Math.abs(A.data[p + 2] - B.data[p + 2])) / 3;
        var l = LA[i]; s += l; s2 += l * l; n++;
      }
    }
    d /= n;
    var m = s / n, sd = Math.sqrt(Math.max(0, s2 / n - m * m));
    if (d >= DIFF_ON) changed++;
    var inBox = !LIMIT || (x1 > LIMIT[0] * W && x0 < LIMIT[2] * W &&
                           y1 > LIMIT[1] * H && y0 < LIMIT[3] * H);
    if (d >= DIFF_ON && sd <= QUIET && inBox){ newWork[cy * CW + cx] = 1; quietChanged++; }
  }
}
console.log("  cells   " + CW + "x" + CH + "  changed " + changed +
            "  changed-on-quiet-paper " + quietChanged);
if (!quietChanged) throw new Error("no new work found — the sheets differ nowhere on bare paper");

/* largest connected blob of new work: one edit, one patch */
var lab = new Int32Array(CW * CH).fill(-1), best = -1, bestN = 0, blobs = 0;
(function(){
  var stack = [], i;
  for (i = 0; i < CW * CH; i++){
    if (!newWork[i] || lab[i] >= 0) continue;
    var id = blobs++, cnt = 0;
    stack.push(i); lab[i] = id;
    while (stack.length){
      var j = stack.pop(); cnt++;
      var jx = j % CW, jy = (j - jx) / CW, dx, dy;
      for (dy = -2; dy <= 2; dy++) for (dx = -2; dx <= 2; dx++){
        var nx = jx + dx, ny = jy + dy;
        if (nx < 0 || ny < 0 || nx >= CW || ny >= CH) continue;
        var k = ny * CW + nx;
        if (newWork[k] && lab[k] < 0){ lab[k] = id; stack.push(k); }
      }
    }
    if (cnt > bestN){ bestN = cnt; best = id; }
  }
})();
console.log("  blobs   " + blobs + ", largest " + bestN + " cells");

/* dilate the winner, and report its box */
var reg = new Uint8Array(CW * CH), bx0 = CW, by0 = CH, bx1 = 0, by1 = 0;
for (cy = 0; cy < CH; cy++) for (cx = 0; cx < CW; cx++){
  if (lab[cy * CW + cx] !== best) continue;
  var dx2, dy2;
  for (dy2 = -GROW; dy2 <= GROW; dy2++) for (dx2 = -GROW; dx2 <= GROW; dx2++){
    var nx2 = cx + dx2, ny2 = cy + dy2;
    if (nx2 < 0 || ny2 < 0 || nx2 >= CW || ny2 >= CH) continue;
    /* the dilation must not walk back out of --limit, or the channel
       the box was drawn to protect is quietly re-entered */
    if (LIMIT && ((nx2 + 1) * CELL <= LIMIT[0] * W || nx2 * CELL >= LIMIT[2] * W ||
                  (ny2 + 1) * CELL <= LIMIT[1] * H || ny2 * CELL >= LIMIT[3] * H)) continue;
    reg[ny2 * CW + nx2] = 1;
    if (nx2 < bx0) bx0 = nx2; if (nx2 > bx1) bx1 = nx2;
    if (ny2 < by0) by0 = ny2; if (ny2 > by1) by1 = ny2;
  }
}
console.log("  region  x " + (bx0 * CELL / W).toFixed(3) + "-" + ((bx1 + 1) * CELL / W).toFixed(3) +
            "   y " + (by0 * CELL / H).toFixed(3) + "-" + ((by1 + 1) * CELL / H).toFixed(3));

/* --- 2. per-pixel weight ----------------------------------------- */

/* region -> pixels, then feathered */
var wgt = new Float32Array(N);
for (y = 0; y < H; y++){
  var cyy = (y / CELL) | 0;
  for (x = 0; x < W; x++) wgt[y * W + x] = reg[cyy * CW + ((x / CELL) | 0)] ? 1 : 0;
}
blur(wgt, W, H, Math.max(1, Math.round(FEATHER / 2)), 2);

/* the base's ink field gates it: paper takes the edit, ink keeps the base */
var ink = stdevField(LA, W, H, INK_R);
blur(ink, W, H, INK_BLUR, 1);
var i2;
for (i2 = 0; i2 < N; i2++){
  var t = (ink[i2] - INK_LO) / (INK_HI - INK_LO);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  t = t * t * (3 - 2 * t);                     /* smoothstep */
  wgt[i2] *= (1 - t);
}

/* --- 3. tone-match the edit to the base, on the paper it lands on -- */

var sumA = [0, 0, 0], sumB = [0, 0, 0], cnt = 0;
for (i2 = 0; i2 < N; i2++){
  if (wgt[i2] < 0.85) continue;
  var p2 = i2 * 3;
  /* only paper: a cell the edit has just drawn a roof on would drag
     the average toward the new ink and tint the whole patch */
  if (LB[i2] < 200) continue;
  sumA[0] += A.data[p2]; sumA[1] += A.data[p2 + 1]; sumA[2] += A.data[p2 + 2];
  sumB[0] += B.data[p2]; sumB[1] += B.data[p2 + 1]; sumB[2] += B.data[p2 + 2];
  cnt++;
}
var shift = [0, 0, 0];
if (cnt > 500){
  shift[0] = (sumA[0] - sumB[0]) / cnt;
  shift[1] = (sumA[1] - sumB[1]) / cnt;
  shift[2] = (sumA[2] - sumB[2]) / cnt;
}
console.log("  tone    " + cnt + " paper px, shift rgb " +
            shift.map(function(v){ return v.toFixed(2); }).join(" / "));

/* --- 4. blend ----------------------------------------------------- */

var out = Buffer.from(A.data), touched = 0, k2;
for (i2 = 0; i2 < N; i2++){
  var m2 = wgt[i2];
  if (m2 <= 0.002) continue;
  touched++;
  var q2 = i2 * 3;
  for (k2 = 0; k2 < 3; k2++){
    var nv = B.data[q2 + k2] + shift[k2];
    nv = nv < 0 ? 0 : nv > 255 ? 255 : nv;
    out[q2 + k2] = Math.round(A.data[q2 + k2] * (1 - m2) + nv * m2);
  }
}
console.log("  blended " + touched + " px  (" + (100 * touched / N).toFixed(2) + "% of the sheet)");

fs.writeFileSync(oPath, encode(W, H, 3, 2, out));
console.log("  written " + oPath + "  " + (fs.statSync(oPath).size / 1048576).toFixed(1) + "MB");

if (DEBUG){
  var mpath = oPath.replace(/\.png$/i, "") + "-mask.png";
  var g = Buffer.alloc(N * 3);
  for (i2 = 0; i2 < N; i2++){
    var v2 = Math.round(255 * wgt[i2]);
    /* the base underneath at a quarter strength, so the region can be
       read against the drawing rather than in the dark */
    var base = LA[i2] * 0.25;
    g[i2 * 3] = Math.min(255, v2 + base);
    g[i2 * 3 + 1] = Math.min(255, v2 * 0.5 + base);
    g[i2 * 3 + 2] = Math.min(255, v2 * 0.2 + base);
  }
  fs.writeFileSync(mpath, encode(W, H, 3, 2, g));
  console.log("  debug   " + mpath);
}
