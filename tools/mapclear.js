/* ================================================================
   Fade the terrain to bare paper inside marked clearings —
     node tools/mapclear.js <in.png> <out.png> --clear tools/clearings.json
                            [--debug]

   WHY THIS EXISTS. VEN, 2026-08-27, with the three red loops from his
   phone screenshot: the copy on the sheet was "ok" and would be
   better if *"the background IMAGE fades out to make space for the
   text and only leave the background colour (that being the old
   paper texture)"* — and it *"MUST be done in the parts of the
   screenshot marked in red."* So inside each loop the ink and the
   watercolour dissolve into the parchment, the way a 산수화 lets a
   ridge vanish into mist, and the paper that is left is the sheet's
   own — its tone, its stains, its grain — not a flat fill.

   It is done here, deterministically, and not by asking OpenArt to
   erase the mountains, for the reason HANDOFF §9x records: an
   image2image edit re-renders the whole page (mean 16.7 dRGB), which
   moves every measured thing on it. This touches nothing outside the
   loops, so `tools/maproute.js` finds the same road and the same
   stops, and the check is the same as mappatch's — diff the output
   against the input and everything outside a clearing must read 0.

   Run it on BOTH masters, with the same json: the shipped sheet AND
   `map-ink-master-plain.png`. maproute finds the stops by
   differencing the two, so a clearing present in one and not the
   other would read as a landmark.

   HOW THE PAPER IS MADE. There is no bare-paper layer to reveal — the
   master is one flat raster — so the paper under a mountain is
   synthesised from the paper around it, in two parts:

     TONE   the slow colour of the parchment (it darkens toward the
            edges and carries stains). A normalised blur of the
            pixels that ARE quiet paper, so under a ridge the tone is
            what the surrounding paper says it would be. Filled at
            two scales so a wide ridge still gets a value.
     GRAIN  the paper's fine texture, which the tone field has
            smoothed away. Taken from the sheet's own quiet areas —
            the residual of paper against its local mean — and laid
            over the cleared area in overlapping tiles with random
            offsets, so it never repeats visibly and never seams.

   Tone plus grain IS this sheet's paper: where the loop covers paper
   that was already bare, the result is indistinguishable from what
   was there, which is what makes the edge of a clearing invisible on
   open ground and a soft mist over ink.

   THE EDGE. Each loop is feathered over FEATHER px and its boundary
   is wandered by low-frequency noise (EDGE_NOISE), so it reads as
   mist thinning out rather than as an oval cut with scissors. The
   loops are polygons in normalised sheet coordinates, traced from
   VEN's markup — the one hand-placed thing in the map's pipeline
   apart from BLOCK_X, and for the same reason: it is a client
   decision about the picture, not a measurement. Keep them off the
   vignettes: the tool does not protect a building, and a loop drawn
   across one erases it.

   --keep <plain.png> protects the LANDMARKS. The four vignettes are
   the difference between the shipped sheet and the pre-vignette
   sheet (that is how maproute finds the stops, HANDOFF §9v), so with
   the plain sheet given, any cell where the two differ by more than
   KEEP_DIFF is a building or its ground wash and is held out of the
   fade, with a margin. That lets a loop be drawn right up against a
   village — Jeonju's has to be, there is no other paper near it —
   without the feather eating the village's eastern roofs. Give it
   when clearing the shipped sheet; the plain sheet has nothing to
   keep.

   --debug writes <out>-mask.png, the blend weight over the sheet.

   No dependencies beyond zlib — same rule as the other map tools.
================================================================= */

var fs   = require("fs");
var path = require("path");
var png  = require(path.join(__dirname, "png.js"));

/* ---- knobs ------------------------------------------------------ */

var FEATHER    = 170;   // px (at master size) the loop's edge is ramped over
var EDGE_NOISE = 0.55;  // how far the edge wanders, as a share of FEATHER
var NOISE_CELL = 170;   // px, the wavelength of that wander
var QUIET_SD   = 7.5;   // local stdev at or under which a pixel is paper
var PAPER_LUMA = 175;   // and at least this bright
/* ...and the paper's CHROMA. Measured on the sheet (quiet, bright
   pixels only): the parchment sits in a tight band with G a shade
   under the mean of R and B, and R - B between about 30 and 50. The
   violet wash has G well below that (-6 and lower), the green wash
   well above (+3 and higher), and a plain colour-distance test let
   both through — which is what tinted the first cleared cores pink.
   Chroma separates them where luma and distance could not. */
var CHROMA_LO  = -5;    // G - (R+B)/2, at least
var CHROMA_HI  = 2.5;   // ...and at most
var WARM_LO    = 22;    // R - B, at least
var WARM_HI    = 56;    // ...and at most
/* ...and FAR FROM INK. The mountains' flanks carry a smooth warm-grey
   shading between their hatching strokes that passes every test
   above, and pinning the fill to it put a beige cloud in the middle
   of each clearing — the tone of a mountainside, not of the paper.
   Parchment is the stuff with no stroke anywhere near it, so the
   paper mask is eroded by this many px (at master size) from every
   ink pixel before the fill sees it. */
var INK_CLEAR  = 28;
var SD_R       = 3;     // px radius the local stdev is measured over
var TONE_R     = 40;    // px radius of the fine tone blur
var FILL_S     = 16;    // px per cell of the harmonic fill behind it
var FILL_IT    = 2500;  // Jacobi sweeps of that fill
var GRAIN_R    = 5;     // px radius the grain is measured against
var TILE       = 192;   // px, grain tile
var STEP       = 128;   // px, tile step (TILE - STEP overlaps)
var SEED       = 7;     // for the tile offsets; change to re-roll the grain
/* --keep: a 32px cell counts as landmark when the shipped sheet and
   the plain sheet differ by this much (mean |dRGB|). image2image drift
   between the two sits at ~17 across the whole page (§9x); a roof
   painted over paper is 80 and up. Grown by KEEP_GROW cells and
   ramped over KEEP_FEATHER px so the fade eases off around it. */
var KEEP_DIFF    = 40;
var KEEP_QUIET   = 13;   // ...and the plain sheet's luma stdev there was at most this
var KEEP_GROW    = 1;
var KEEP_FEATHER = 48;

/* ---- args ------------------------------------------------------- */

var argv = process.argv.slice(2), files = [], CLEAR = null, KEEP = null, DEBUG = false, i;
for (i = 0; i < argv.length; i++){
  if (argv[i] === "--clear") CLEAR = argv[++i];
  else if (argv[i] === "--keep") KEEP = argv[++i];
  else if (argv[i] === "--debug") DEBUG = true;
  else files.push(argv[i]);
}
if (files.length < 2 || !CLEAR){
  console.error("usage: node tools/mapclear.js <in.png> <out.png> --clear <clearings.json> [--keep <plain.png>] [--debug]");
  process.exit(1);
}
var loops = JSON.parse(fs.readFileSync(CLEAR, "utf8"));
if (!Array.isArray(loops) || !loops.length) throw new Error("no loops in " + CLEAR);

var img = png.decode(fs.readFileSync(files[0]));
var W = img.w, H = img.h, CH = img.ch, N = W * H;
if (CH < 3) throw new Error("want an RGB master");
console.log("  source  " + files[0] + "  " + W + "x" + H);

/* ---- helpers ---------------------------------------------------- */

function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
function smoothstep(t){ t = clamp01(t); return t * t * (3 - 2 * t); }

/* separable box blur in place, `pass` times */
function boxBlur(F, w, h, r, pass){
  var B = new Float32Array(w * h), x, y, p;
  for (p = 0; p < pass; p++){
    for (y = 0; y < h; y++){
      var row = y * w, acc = 0, cnt = 0;
      for (x = 0; x <= r && x < w; x++){ acc += F[row + x]; cnt++; }
      for (x = 0; x < w; x++){
        B[row + x] = acc / cnt;
        var add = x + r + 1, sub = x - r;
        if (add < w){ acc += F[row + add]; cnt++; }
        if (sub >= 0){ acc -= F[row + sub]; cnt--; }
      }
    }
    for (x = 0; x < w; x++){
      var acc2 = 0, cnt2 = 0;
      for (y = 0; y <= r && y < h; y++){ acc2 += B[y * w + x]; cnt2++; }
      for (y = 0; y < h; y++){
        F[y * w + x] = acc2 / cnt2;
        var addy = y + r + 1, suby = y - r;
        if (addy < h){ acc2 += B[addy * w + x]; cnt2++; }
        if (suby >= 0){ acc2 -= B[suby * w + x]; cnt2--; }
      }
    }
  }
  return F;
}

/* bilinear sample of a reduced field at full-res coordinates */
function sampler(F, fw, fh, scale){
  return function(x, y){
    var u = (x + 0.5) / scale - 0.5, v = (y + 0.5) / scale - 0.5;
    if (u < 0) u = 0; if (v < 0) v = 0;
    if (u > fw - 1) u = fw - 1; if (v > fh - 1) v = fh - 1;
    var u0 = u | 0, v0 = v | 0, u1 = Math.min(fw - 1, u0 + 1), v1 = Math.min(fh - 1, v0 + 1);
    var fu = u - u0, fv = v - v0;
    return F[v0 * fw + u0] * (1 - fu) * (1 - fv) + F[v0 * fw + u1] * fu * (1 - fv) +
           F[v1 * fw + u0] * (1 - fu) * fv + F[v1 * fw + u1] * fu * fv;
  };
}

/* seeded PRNG — the grain must come out the same every run, or the
   diff-against-input check has noise in it */
var rnd = (function(){
  var s = SEED >>> 0 || 1;
  return function(){ s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
})();

/* ---- 1. the mask, at quarter resolution ------------------------- */

var Q = 4, qw = Math.ceil(W / Q), qh = Math.ceil(H / Q), qn = qw * qh;
var mask = new Float32Array(qn), x, y;

/* scanline polygon fill */
loops.forEach(function(lp){
  var poly = (lp.poly || lp).map(function(p){ return [p[0] * W / Q, p[1] * H / Q]; });
  var ymin = Infinity, ymax = -Infinity;
  poly.forEach(function(p){ if (p[1] < ymin) ymin = p[1]; if (p[1] > ymax) ymax = p[1]; });
  for (y = Math.max(0, Math.floor(ymin)); y <= Math.min(qh - 1, Math.ceil(ymax)); y++){
    var yc = y + 0.5, xs = [], j;
    for (j = 0; j < poly.length; j++){
      var a = poly[j], b = poly[(j + 1) % poly.length];
      if ((a[1] <= yc) !== (b[1] <= yc))
        xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
    }
    xs.sort(function(p, q){ return p - q; });
    for (j = 0; j + 1 < xs.length; j += 2){
      var x0 = Math.max(0, Math.round(xs[j])), x1 = Math.min(qw - 1, Math.round(xs[j + 1]));
      for (x = x0; x <= x1; x++) mask[y * qw + x] = 1;
    }
  }
});
var inside = 0; for (i = 0; i < qn; i++) if (mask[i]) inside++;
console.log("  loops   " + loops.length + "  covering " + (100 * inside / qn).toFixed(2) + "% of the sheet");
if (!inside) throw new Error("the loops cover nothing — are the coordinates normalised?");

/* feather: box blur x2 over about FEATHER either side of the edge */
boxBlur(mask, qw, qh, Math.max(1, Math.round(FEATHER / Q / 2.2)), 2);

/* the edge wanders: value noise, two octaves, moves the ramp about */
(function(){
  var cell = NOISE_CELL / Q, gw = Math.ceil(qw / cell) + 2, gh = Math.ceil(qh / cell) + 2;
  var g1 = new Float32Array(gw * gh), g2 = new Float32Array(gw * gh * 4), k;
  for (k = 0; k < g1.length; k++) g1[k] = rnd() * 2 - 1;
  for (k = 0; k < g2.length; k++) g2[k] = rnd() * 2 - 1;
  function val(G, gw2, c, x, y){
    var u = x / c, v = y / c, u0 = u | 0, v0 = v | 0, fu = u - u0, fv = v - v0;
    fu = fu * fu * (3 - 2 * fu); fv = fv * fv * (3 - 2 * fv);
    return G[v0 * gw2 + u0] * (1 - fu) * (1 - fv) + G[v0 * gw2 + u0 + 1] * fu * (1 - fv) +
           G[(v0 + 1) * gw2 + u0] * (1 - fu) * fv + G[(v0 + 1) * gw2 + u0 + 1] * fu * fv;
  }
  for (y = 0; y < qh; y++)
    for (x = 0; x < qw; x++){
      var m = mask[y * qw + x];
      if (m <= 0.001 || m >= 0.999) continue;
      var n = 0.7 * val(g1, gw, cell, x, y) + 0.3 * val(g2, gw * 2, cell / 2, x, y);
      /* only the ramp moves — the noise is gated by m(1-m) so the
         solid core and the untouched outside never change */
      mask[y * qw + x] = smoothstep(m + EDGE_NOISE * n * 2 * m * (1 - m));
    }
})();
/* the landmarks, held out (see --keep in the header) */
if (KEEP){
  var K = png.decode(fs.readFileSync(KEEP));
  if (K.w !== W || K.h !== H) throw new Error("--keep sheet differs in size");
  var KC = 32, kw = Math.ceil(W / KC), kh = Math.ceil(H / KC), kcell = new Uint8Array(kw * kh), kx, ky, kn = 0;
  for (ky = 0; ky < kh; ky++)
    for (kx = 0; kx < kw; kx++){
      var d = 0, n = 0, ls = 0, ls2 = 0, yy, xx;
      for (yy = ky * KC; yy < Math.min(H, (ky + 1) * KC); yy += 2)
        for (xx = kx * KC; xx < Math.min(W, (kx + 1) * KC); xx += 2){
          var pa = (yy * W + xx) * CH, pb = (yy * W + xx) * K.ch;
          d += Math.abs(img.data[pa] - K.data[pb]) + Math.abs(img.data[pa + 1] - K.data[pb + 1]) +
               Math.abs(img.data[pa + 2] - K.data[pb + 2]);
          var lk = 0.2126 * K.data[pb] + 0.7152 * K.data[pb + 1] + 0.0722 * K.data[pb + 2];
          ls += lk; ls2 += lk * lk; n++;
        }
      /* mappatch's rule (§9x): new work is a change ON QUIET PAPER. A
         re-stroked mountain differs plenty — image2image redraws every
         stroke a little — but the plain sheet was never quiet there,
         so it is not a landmark and the fade may have it. */
      var lm = ls / n, lsd = Math.sqrt(Math.max(0, ls2 / n - lm * lm));
      if (d / (3 * n) >= KEEP_DIFF && lsd <= KEEP_QUIET){ kcell[ky * kw + kx] = 1; kn++; }
    }
  /* grow, then to quarter res, then feather, then cut it out of the mask */
  var kgrown = new Uint8Array(kw * kh);
  for (ky = 0; ky < kh; ky++)
    for (kx = 0; kx < kw; kx++){
      if (!kcell[ky * kw + kx]) continue;
      var gy2, gx2;
      for (gy2 = -KEEP_GROW; gy2 <= KEEP_GROW; gy2++)
        for (gx2 = -KEEP_GROW; gx2 <= KEEP_GROW; gx2++){
          var ny = ky + gy2, nx = kx + gx2;
          if (nx >= 0 && ny >= 0 && nx < kw && ny < kh) kgrown[ny * kw + nx] = 1;
        }
    }
  var keep = new Float32Array(qn);
  for (y = 0; y < qh; y++)
    for (x = 0; x < qw; x++)
      keep[y * qw + x] = kgrown[((y * Q / KC) | 0) * kw + ((x * Q / KC) | 0)] ? 1 : 0;
  boxBlur(keep, qw, qh, Math.max(1, Math.round(KEEP_FEATHER / Q / 2)), 2);
  var cut = 0;
  for (i = 0; i < qn; i++){
    if (keep[i] <= 0.001 || mask[i] <= 0.001) continue;
    mask[i] *= (1 - smoothstep(keep[i]));
    cut++;
  }
  console.log("  keep    " + kn + " landmark cells held out of the fade; " + cut + " mask cells trimmed");
}
var maskAt = sampler(mask, qw, qh, Q);

/* ---- 2. what is paper ------------------------------------------- */

/* luma at half resolution, and the local stdev on it */
var HW = Math.ceil(W / 2), HH = Math.ceil(H / 2), hn = HW * HH;
var L2 = new Float32Array(hn);
for (y = 0; y < HH; y++)
  for (x = 0; x < HW; x++){
    var p = ((y * 2) * W + (x * 2)) * CH;
    L2[y * HW + x] = 0.2126 * img.data[p] + 0.7152 * img.data[p + 1] + 0.0722 * img.data[p + 2];
  }
var sd = (function(){
  var w = HW, h = HH, r = Math.max(1, Math.round(SD_R / 2));
  var s = new Float64Array((w + 1) * (h + 1)), q = new Float64Array((w + 1) * (h + 1));
  for (y = 0; y < h; y++){
    var rs = 0, rq = 0;
    for (x = 0; x < w; x++){
      var v = L2[y * w + x]; rs += v; rq += v * v;
      s[(y + 1) * (w + 1) + x + 1] = s[y * (w + 1) + x + 1] + rs;
      q[(y + 1) * (w + 1) + x + 1] = q[y * (w + 1) + x + 1] + rq;
    }
  }
  function box(T, x0, y0, x1, y1){
    return T[y1 * (w + 1) + x1] - T[y0 * (w + 1) + x1] - T[y1 * (w + 1) + x0] + T[y0 * (w + 1) + x0];
  }
  var D = new Float32Array(w * h);
  for (y = 0; y < h; y++){
    var y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    for (x = 0; x < w; x++){
      var x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1), n = (x1 - x0) * (y1 - y0);
      var m = box(s, x0, y0, x1, y1) / n;
      D[y * w + x] = Math.sqrt(Math.max(0, box(q, x0, y0, x1, y1) / n - m * m));
    }
  }
  return D;
})();

/* paper mask at half res: quiet, bright, and paper-coloured (see the
   chroma knobs). pm is the mean of what passed, for the fill's seed. */
var P2 = new Uint8Array(hn), Q2 = new Uint8Array(hn), paperN = 0, pm = [0, 0, 0];
for (y = 0; y < HH; y++)
  for (x = 0; x < HW; x++){
    var k3 = y * HW + x;
    if (sd[k3] > QUIET_SD || L2[k3] < PAPER_LUMA) continue;
    Q2[k3] = 1;   /* ink-free, whatever its colour — the grain donors' test */
    var p3 = ((y * 2) * W + (x * 2)) * CH;
    var r3 = img.data[p3], g3 = img.data[p3 + 1], b3 = img.data[p3 + 2];
    var chroma = g3 - (r3 + b3) / 2, warm = r3 - b3;
    if (chroma < CHROMA_LO || chroma > CHROMA_HI || warm < WARM_LO || warm > WARM_HI) continue;
    P2[k3] = 1; paperN++;
    pm[0] += r3; pm[1] += g3; pm[2] += b3;
  }
pm = pm.map(function(v){ return v / Math.max(1, paperN); });
console.log("  paper   " + (100 * paperN / hn).toFixed(1) + "% of the sheet is bare parchment, mean rgb " +
            pm.map(function(v){ return v.toFixed(1); }).join(" / "));

/* erode: a paper pixel within INK_CLEAR of any non-quiet pixel is
   dropped. Separable running max of (1 - Q2), which is the same as a
   dilation of the ink. */
(function(){
  var r = Math.max(1, Math.round(INK_CLEAR / 2)), ink = new Uint8Array(hn), tmp = new Uint8Array(hn), k;
  for (k = 0; k < hn; k++) ink[k] = Q2[k] ? 0 : 1;
  for (y = 0; y < HH; y++){
    var row = y * HW;
    for (x = 0; x < HW; x++){
      var hit = 0, x0 = Math.max(0, x - r), x1 = Math.min(HW - 1, x + r), xx;
      for (xx = x0; xx <= x1; xx++) if (ink[row + xx]){ hit = 1; break; }
      tmp[row + x] = hit;
    }
  }
  var kept = 0;
  for (x = 0; x < HW; x++)
    for (y = 0; y < HH; y++){
      var hit2 = 0, y0 = Math.max(0, y - r), y1 = Math.min(HH - 1, y + r), yy;
      for (yy = y0; yy <= y1; yy++) if (tmp[yy * HW + x]){ hit2 = 1; break; }
      if (hit2) P2[y * HW + x] = 0;
      else if (P2[y * HW + x]) kept++;
    }
  console.log("  paper   " + (100 * kept / hn).toFixed(1) + "% after keeping " + INK_CLEAR + "px clear of ink");
  if (kept < hn * 0.02) throw new Error("almost no paper survives the ink erosion — lower INK_CLEAR");
})();

/* ---- 3. the tone under the ink, at quarter resolution ----------- */

var tone = [null, null, null], c;
(function(){
  var den = new Float32Array(qn), num = [new Float32Array(qn), new Float32Array(qn), new Float32Array(qn)];
  for (y = 0; y < HH; y++)
    for (x = 0; x < HW; x++){
      if (!P2[y * HW + x]) continue;
      var qx = (x >> 1), qy = (y >> 1), qi = qy * qw + qx, p4 = ((y * 2) * W + (x * 2)) * CH;
      den[qi] += 1;
      num[0][qi] += img.data[p4]; num[1][qi] += img.data[p4 + 1]; num[2][qi] += img.data[p4 + 2];
    }
  /* fine pass: a normalised blur of the paper that is actually there,
     which carries the local stains and gradients up to the edge of
     the ink */
  var denF = Float32Array.from(den), numF = num.map(function(a){ return Float32Array.from(a); });
  boxBlur(denF, qw, qh, Math.round(TONE_R / Q), 2);
  numF.forEach(function(a){ boxBlur(a, qw, qh, Math.round(TONE_R / Q), 2); });

  /* behind it, a HARMONIC fill: under a ridge the tone is the smooth
     interpolation of the paper on every side of it, not a wide blur
     that reaches whatever happens to be far away (the first version
     blurred 220px x3 and pulled the coast's darker margin and the
     washes into the middle of the clearing). Cells with paper are
     pinned to their mean; the rest relax to their neighbours. */
  var S = FILL_S / Q, fw = Math.ceil(qw / S), fh = Math.ceil(qh / S), fn = fw * fh;
  var fden = new Float32Array(fn), fnum = [new Float32Array(fn), new Float32Array(fn), new Float32Array(fn)];
  for (y = 0; y < qh; y++)
    for (x = 0; x < qw; x++){
      var fi = ((y / S) | 0) * fw + ((x / S) | 0), qi2 = y * qw + x;
      fden[fi] += den[qi2];
      fnum[0][fi] += num[0][qi2]; fnum[1][fi] += num[1][qi2]; fnum[2][fi] += num[2][qi2];
    }
  var known = new Uint8Array(fn), nk = 0;
  for (i = 0; i < fn; i++) if (fden[i] >= 0.25 * S * S * 4){ known[i] = 1; nk++; }
  var fill = [null, null, null];
  for (c = 0; c < 3; c++){
    var A = new Float32Array(fn), B2 = new Float32Array(fn), it;
    for (i = 0; i < fn; i++) A[i] = known[i] ? fnum[c][i] / fden[i] : pm[c];
    for (it = 0; it < FILL_IT; it++){
      var src = (it & 1) ? B2 : A, dst = (it & 1) ? A : B2;
      for (y = 0; y < fh; y++)
        for (x = 0; x < fw; x++){
          var k = y * fw + x;
          if (known[k]){ dst[k] = src[k]; continue; }
          var s = 0, n = 0;
          if (x > 0){ s += src[k - 1]; n++; }
          if (x < fw - 1){ s += src[k + 1]; n++; }
          if (y > 0){ s += src[k - fw]; n++; }
          if (y < fh - 1){ s += src[k + fw]; n++; }
          dst[k] = n ? s / n : src[k];
        }
    }
    fill[c] = (FILL_IT & 1) ? B2 : A;
  }
  console.log("  tone    harmonic fill on a " + fw + "x" + fh + " grid, " + nk + " cells pinned to paper");
  var fillAt = fill.map(function(F){ return sampler(F, fw, fh, S); });
  for (c = 0; c < 3; c++){
    tone[c] = new Float32Array(qn);
    for (y = 0; y < qh; y++)
      for (x = 0; x < qw; x++){
        i = y * qw + x;
        var wf = clamp01(denF[i] / 1.4);          /* trust the fine pass as it fills */
        var fine = denF[i] > 1e-4 ? numF[c][i] / denF[i] : pm[c];
        tone[c][i] = fine * wf + fillAt[c](x, y) * (1 - wf);
      }
  }
})();
var toneAt = tone.map(function(T){ return sampler(T, qw, qh, Q); });

/* ---- 4. grain donors -------------------------------------------- */

/* windows of TILE px that are (almost) entirely paper, anywhere on
   the sheet: the residual of each against its own local mean is a
   swatch of this paper's grain */
var donors = [];
(function(){
  var tx, ty;
  for (ty = 0; ty + TILE <= H; ty += TILE >> 1)
    for (tx = 0; tx + TILE <= W; tx += TILE >> 1){
      var ok = 0, tot = 0, pap = 0;
      for (y = ty; y < ty + TILE; y += 4)
        for (x = tx; x < tx + TILE; x += 4){
          var hk = (y >> 1) * HW + (x >> 1);
          tot++; if (Q2[hk]) ok++; if (P2[hk]) pap++;
        }
      /* EVERY sample must be ink-free: at 98.5% a hairline of ink got
         through and was tiled across the clearing as a scratch. Most
         of it must be parchment rather than wash, but a wash's grain
         is the same grain (the residual is mean-subtracted), so that
         test is loose. */
      if (ok === tot && pap >= 0.9 * tot) donors.push([tx, ty]);
    }
  console.log("  grain   " + donors.length + " donor windows of " + TILE + "px" +
              (donors.length < 4 ? "  (few — the grain will repeat; fine for a --base sheet)" : ""));
  if (!donors.length) throw new Error("no bare paper to sample grain from");
})();

/* residual of a donor window: pixel - local box mean (radius GRAIN_R) */
function residual(tx, ty){
  var n = TILE * TILE, R = [new Float32Array(n), new Float32Array(n), new Float32Array(n)], cc;
  var pad = GRAIN_R;
  for (cc = 0; cc < 3; cc++){
    for (y = 0; y < TILE; y++)
      for (x = 0; x < TILE; x++){
        var s = 0, cnt = 0, yy, xx;
        for (yy = -pad; yy <= pad; yy++){
          var py = ty + y + yy; if (py < 0 || py >= H) continue;
          for (xx = -pad; xx <= pad; xx++){
            var px = tx + x + xx; if (px < 0 || px >= W) continue;
            s += img.data[(py * W + px) * CH + cc]; cnt++;
          }
        }
        R[cc][y * TILE + x] = img.data[((ty + y) * W + tx + x) * CH + cc] - s / cnt;
      }
  }
  return R;
}
var donorCache = {};
function donorResidual(k){
  if (!donorCache[k]) donorCache[k] = residual(donors[k][0], donors[k][1]);
  return donorCache[k];
}

/* ---- 5. blend ---------------------------------------------------- */

/* bounding box of the mask at full res, so the grain tiling and the
   blend only visit the sheet that changes */
var bx0 = W, by0 = H, bx1 = 0, by1 = 0;
for (y = 0; y < qh; y++)
  for (x = 0; x < qw; x++)
    if (mask[y * qw + x] > 0.001){
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
      if (y < by0) by0 = y; if (y > by1) by1 = y;
    }
bx0 = Math.max(0, bx0 * Q - Q); by0 = Math.max(0, by0 * Q - Q);
bx1 = Math.min(W - 1, (bx1 + 2) * Q); by1 = Math.min(H - 1, (by1 + 2) * Q);

/* grain over the box: overlapping tiles, each from a random donor at a
   random flip, weighted by a raised cosine and normalised */
var GW = bx1 - bx0 + 1, GH = by1 - by0 + 1, gn = GW * GH;
var grain = [new Float32Array(gn), new Float32Array(gn), new Float32Array(gn)],
    gwt = new Float32Array(gn);
(function(){
  var tx, ty, hann = new Float32Array(TILE), k;
  for (k = 0; k < TILE; k++) hann[k] = 0.5 - 0.5 * Math.cos(2 * Math.PI * (k + 0.5) / TILE);
  for (ty = -STEP; ty < GH; ty += STEP)
    for (tx = -STEP; tx < GW; tx += STEP){
      var d = donorResidual((rnd() * donors.length) | 0);
      var flipX = rnd() < 0.5, flipY = rnd() < 0.5;
      for (y = 0; y < TILE; y++){
        var gy = ty + y; if (gy < 0 || gy >= GH) continue;
        var sy = flipY ? TILE - 1 - y : y;
        for (x = 0; x < TILE; x++){
          var gx = tx + x; if (gx < 0 || gx >= GW) continue;
          var sx = flipX ? TILE - 1 - x : x, wv = hann[x] * hann[y], gi = gy * GW + gx, si = sy * TILE + sx;
          grain[0][gi] += d[0][si] * wv; grain[1][gi] += d[1][si] * wv; grain[2][gi] += d[2][si] * wv;
          gwt[gi] += wv;
        }
      }
    }
})();

var out = Buffer.from(img.data), touched = 0, full = 0;
for (y = by0; y <= by1; y++)
  for (x = bx0; x <= bx1; x++){
    var m = maskAt(x, y);
    if (m <= 0.002) continue;
    touched++; if (m >= 0.998) full++;
    var gi2 = (y - by0) * GW + (x - bx0), gw2 = gwt[gi2] || 1, p5 = (y * W + x) * CH;
    for (c = 0; c < 3; c++){
      var paper = toneAt[c](x, y) + grain[c][gi2] / gw2;
      var v = img.data[p5 + c] * (1 - m) + paper * m;
      out[p5 + c] = v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
    }
  }
console.log("  blended " + touched + " px (" + (100 * touched / N).toFixed(2) + "% of the sheet), " +
            full + " fully cleared");

fs.writeFileSync(files[1], png.encode(W, H, CH, img.ct, out));
console.log("  written " + files[1] + "  " + (fs.statSync(files[1]).size / 1048576).toFixed(1) + "MB");

if (DEBUG){
  var mpath = files[1].replace(/\.png$/i, "") + "-mask.png";
  var g = Buffer.alloc(N * 3);
  for (y = 0; y < H; y++)
    for (x = 0; x < W; x++){
      var i3 = y * W + x, p6 = i3 * CH, base = (0.2126 * img.data[p6] + 0.7152 * img.data[p6 + 1] + 0.0722 * img.data[p6 + 2]) * 0.25;
      var v2 = Math.round(255 * maskAt(x, y));
      g[i3 * 3] = Math.min(255, v2 + base);
      g[i3 * 3 + 1] = Math.min(255, v2 * 0.5 + base);
      g[i3 * 3 + 2] = Math.min(255, v2 * 0.2 + base);
    }
  fs.writeFileSync(mpath, png.encode(W, H, 3, 2, g));
  console.log("  debug   " + mpath);
}
