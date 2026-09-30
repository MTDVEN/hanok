/* ================================================================
   tools/title.js — Zico's $TiLES lettering, traced and cut into pen
   strokes so the hero can WRITE it.

     node tools/title.js            writes js/title-zico.js
     node tools/title.js --debug    + art/title/_work/*.png proofs

   Zico, 2026-09-30, sending art/title/zico-ref.png: *"this image has
   the example font"*; VEN: it *"needs to look handwritten and as if it
   was written with a brush … I need the brush strokes"* — and the
   title must still write itself.

   1. INK. The reference is black brush on vignetted brown paper, so
      darkness alone is useless (the corners are nearly as dark as the
      ink). Each pixel is judged against its LOCAL paper: a coarse
      background (per-block upper percentile, holes filled from their
      neighbours, bilinear) and alpha from the ratio luma / paper.
   2. PENS (art/title/pens.json) — the brush strokes as they were
      written, each a centre-line in writing order, authored over the
      reference. Each pen measures its own brush width along its line
      (its BAND), and every inked pixel belongs to the FIRST pen written
      whose band covers it — so a crossing is the earlier stroke's ink
      and every stroke lands whole (VEN, 2026-09-30: the $'s S showed
      holes where its bars were still to come). Ink outside every band
      goes to the nearest pen. Each pen still reveals only its own ink.
   3. TRACE. Each pen's share of the ink is traced to a vector outline
      (marching squares on the soft alpha, sub-pixel, then simplified):
      crisp at any size, exact to Zico's strokes. The pen's mask width
      is the furthest of its pixels from the centre-line, so it
      uncovers all of them and nothing else exists under it to uncover.
================================================================= */

var fs = require("fs"), path = require("path"), png = require("./png.js");
var ROOT = path.join(__dirname, ".."), DEBUG = process.argv.indexOf("--debug") >= 0;
var REF = path.join(ROOT, "art/title/zico-ref.png");
var PENS = path.join(ROOT, "art/title/pens.json");
var WORK = path.join(ROOT, "art/title/_work");
if (DEBUG) fs.mkdirSync(WORK, { recursive: true });

var im = png.decode(fs.readFileSync(REF));
/* the lettering's region in the reference (px) — the rest is paper */
var CROP = [20, 385, 760, 865];
var X0 = CROP[0], Y0 = CROP[1], W = CROP[2] - CROP[0], H = CROP[3] - CROP[1];

var L = new Float32Array(W * H);
for (var y = 0; y < H; y++) for (var x = 0; x < W; x++){
  var i = ((Y0 + y) * im.w + X0 + x) * im.ch;
  L[y * W + x] = 0.299 * im.data[i] + 0.587 * im.data[i + 1] + 0.114 * im.data[i + 2];
}

/* ---- 1. local paper and ink alpha ------------------------------------ */
var B = 24, bw = Math.ceil(W / B), bh = Math.ceil(H / B), bg = new Float32Array(bw * bh), ok = new Uint8Array(bw * bh);
for (var by = 0; by < bh; by++) for (var bx = 0; bx < bw; bx++){
  var vals = [];
  for (y = by * B; y < Math.min(H, (by + 1) * B); y++) for (x = bx * B; x < Math.min(W, (bx + 1) * B); x++) vals.push(L[y * W + x]);
  vals.sort(function(a, b){ return a - b; });
  var v = vals[Math.floor(vals.length * 0.8)];
  bg[by * bw + bx] = v; ok[by * bw + bx] = v > 70 ? 1 : 0;      // a block that is mostly ink has no paper to read
}
for (var pass = 0; pass < 40; pass++){                              // fill ink-covered blocks from their neighbours
  var changed = false;
  for (by = 0; by < bh; by++) for (bx = 0; bx < bw; bx++){
    var k = by * bw + bx; if (ok[k]) continue;
    var s = 0, n = 0;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){
      var nx = bx + d[0], ny = by + d[1]; if (nx < 0 || ny < 0 || nx >= bw || ny >= bh) return;
      var q = ny * bw + nx; if (ok[q]){ s += bg[q]; n++; }
    });
    if (n){ bg[k] = s / n; ok[k] = 2; changed = true; }
  }
  for (k = 0; k < ok.length; k++) if (ok[k] === 2) ok[k] = 1;
  if (!changed) break;
}
function paper(x, y){                                               // bilinear between block centres
  var fx = Math.max(0, Math.min(bw - 1.001, x / B - 0.5)), fy = Math.max(0, Math.min(bh - 1.001, y / B - 0.5));
  var ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
  var a = bg[iy * bw + ix], b = bg[iy * bw + ix + 1], c = bg[(iy + 1) * bw + ix], d = bg[(iy + 1) * bw + ix + 1];
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}
var A = new Float32Array(W * H);
/* ratio luma/paper: ≤LO ink, ≥HI paper. HI is high on purpose: the S's
   long tail is DRY brush — grey streaks at ~0.5 of the paper — and at a
   lower HI its middle vanished and the tail broke in two (2026-09-30) */
var LO = 0.35, HI = 0.86;
for (y = 0; y < H; y++) for (x = 0; x < W; x++){
  var r = L[y * W + x] / Math.max(20, paper(x, y));
  A[y * W + x] = r <= LO ? 1 : r >= HI ? 0 : (HI - r) / (HI - LO);
}

/* drop specks: connected components (alpha > .5) under MIN_AREA px that
   are not within NEAR px of a big one (dry-brush hairs sit close to
   their stroke; paper cracks and grain do not) */
var MIN_AREA = 14, NEAR = 14;                                          // dry streaks sit near each other
var lab = new Int32Array(W * H), sizes = [0], nl = 0;
for (k = 0; k < W * H; k++){
  if (A[k] <= 0.5 || lab[k]) continue;
  nl++; var st = [k], cnt = 0; lab[k] = nl;
  while (st.length){
    var p = st.pop(), px = p % W, py = (p / W) | 0; cnt++;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++){
      var qx = px + dx, qy = py + dy; if (qx < 0 || qy < 0 || qx >= W || qy >= H) continue;
      var q = qy * W + qx; if (A[q] > 0.5 && !lab[q]){ lab[q] = nl; st.push(q); }
    }
  }
  sizes.push(cnt);
}
var big = new Uint8Array(W * H);
for (k = 0; k < W * H; k++) if (lab[k] && sizes[lab[k]] >= MIN_AREA) big[k] = 1;
/* distance to big ink (chamfer) — hairs within NEAR px survive */
var dBig = chamfer(big, W, H);
for (k = 0; k < W * H; k++){
  if (A[k] > 0 && !(lab[k] && sizes[lab[k]] >= MIN_AREA) && dBig[k] > NEAR) A[k] = 0;
}

function chamfer(mask, w, h){                                       // distance to the nearest 1-pixel (3-4 metric, /3)
  var D = new Float32Array(w * h);
  for (var k2 = 0; k2 < w * h; k2++) D[k2] = mask[k2] ? 0 : 1e9;
  for (var y2 = 0; y2 < h; y2++) for (var x2 = 0; x2 < w; x2++){
    var o = y2 * w + x2; if (!D[o]) continue;
    if (x2 > 0) D[o] = Math.min(D[o], D[o - 1] + 3);
    if (y2 > 0){ D[o] = Math.min(D[o], D[o - w] + 3); if (x2 > 0) D[o] = Math.min(D[o], D[o - w - 1] + 4); if (x2 < w - 1) D[o] = Math.min(D[o], D[o - w + 1] + 4); }
  }
  for (y2 = h - 1; y2 >= 0; y2--) for (x2 = w - 1; x2 >= 0; x2--){
    o = y2 * w + x2; if (!D[o]) continue;
    if (x2 < w - 1) D[o] = Math.min(D[o], D[o + 1] + 3);
    if (y2 < h - 1){ D[o] = Math.min(D[o], D[o + w] + 3); if (x2 < w - 1) D[o] = Math.min(D[o], D[o + w + 1] + 4); if (x2 > 0) D[o] = Math.min(D[o], D[o + w - 1] + 4); }
  }
  for (k2 = 0; k2 < w * h; k2++) D[k2] /= 3;
  return D;
}

if (DEBUG){
  var o = Buffer.alloc(W * H * 3);
  for (k = 0; k < W * H; k++){ var a = A[k]; o[k * 3] = o[k * 3 + 1] = o[k * 3 + 2] = Math.round(255 * (1 - a)); }
  fs.writeFileSync(path.join(WORK, "1-alpha.png"), png.encode(W, H, 3, 2, o));
  console.log("wrote art/title/_work/1-alpha.png  " + W + "x" + H);
}

module.exports = { A: A, W: W, H: H, X0: X0, Y0: Y0, chamfer: chamfer };
if (!fs.existsSync(PENS)){ console.log("no art/title/pens.json yet — ink only"); return; }
require("./title-pens.js")(module.exports, PENS, DEBUG, WORK, ROOT);
