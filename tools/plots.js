/* ================================================================
   plots.js — find the village's building plots in the plate itself.
                node tools/plots.js [--write] [--want N] [--shrink F]

   The plate is painted with about a dozen small clearings of bare worn
   earth scuffed into the meadow (art/village/PROMPTS.md §1). Those
   clearings ARE plots — that is what they were asked for. So rather
   than dragging markers around tools/place.html and hoping they land on
   them, this reads them off the painting.

   Five ideas do all the work:

   1. THE MEADOW ENVELOPE, not a rectangle. The valley is a bowl: it
      narrows to a neck at the mist line and opens out at the front, and
      pale boulders crowd both sides. A fixed box either clips the front
      or drops plots onto rock. So the floor is found by colour — the
      meadow is celadon, green above red, mid-toned; pines are green but
      dark, boulders and mist are warm or grey — and the envelope is
      then taken per scanline, so it follows the bowl.

   2. SHAPE SEPARATES A CLEARING FROM A LANE, and that separation is
      now the centre of the whole tool. Both are the same pale sandy
      paint, so no colour test can tell them apart. A lane is a ribbon a
      dozen pixels across; a clearing is a blob several times that.
      Erode the pale mask and the ribbons vanish while the blobs survive
      as cores; dilate those cores back and you have the CLEARINGS.
      Everything pale that is left over is the FOOTPATH NETWORK.
      A building may stand on a clearing. It may not stand on a lane.

   3. A SPRITE IS A BOX, NOT A POINT. This is the bug VEN reported —
      *"some are just in the middle of a footpath"* — and it was a
      one-point clearance test standing in for an area one. A plot is
      `p.w * type.scale` of the plate wide, which is 85–190px on a
      1024px plate, so an anchor sitting 7px clear of a lane still
      straddles that lane by eighty pixels either side. Both tests are
      now taken against the sprite's GROUND BAND — the strip of ground
      its platform actually covers — via a summed-area table, so the
      answer is exact and costs one subtraction per candidate.

   4. FIT THE BUILDING TO THE SPACE, don't reject the space. When a
      footprint clips a lane the plot is not thrown away; the building
      is shrunk until it fits, down to a floor of SHRINK_MIN of its
      row's width. That is what puts a sprite ON its clearing rather
      than beside it, and it is the same lever as "scale everything
      down" applied per plot instead of globally.

   5. A PLOT'S y IS ITS GROUND LINE. So y is the BOTTOM of a clearing,
      never its centre — a building stands at the near edge of its pad,
      and js/village.js anchors sprites bottom-centre.

   `TYPES` is read out of js/village.js rather than copied, the same
   way tools/render.js reads it: the footprint depends on the per-type
   scale multiplier, and a second copy of that table would be wrong
   within a day.

   Prints a PLOTS array in MASTER coordinates and writes
   tools/plots-debug.png with the lane network tinted, every clearing
   ringed, and each plot's real footprint drawn, so the result is
   checked against the painting rather than trusted.
   --write patches js/village.js in place.
================================================================= */

var fs   = require("fs");
var path = require("path");
var png  = require("./png.js");

var DIR    = path.join(__dirname, "..", "art", "village");
var MASTER = path.join(DIR, "field-square.png");
var ENGINE = path.join(__dirname, "..", "js", "village.js");

function arg(flag, dflt){
  var i = process.argv.indexOf(flag);
  return i >= 0 ? parseFloat(process.argv[i + 1]) : dflt;
}

var WANT   = arg("--want", 34);     // plots produced; must match config maxRoofs
var SHRINK = arg("--shrink", 0.71); // global size multiplier on ROW_W

/* bare earth: red leads green, and pale */
var WARM = 6, EARTH_LUMA = 150;

/* THE MEADOW IS GREEN AGAINST BLUE, NOT AGAINST RED. This test used to
   be "green leads red" and it was wrong in a way that cost VEN a whole
   quadrant of his village: he circled the open meadow at the back of the
   valley and asked why nothing was built there, and the answer was that
   the plate is a celadon wash over warm paper, so red leads green almost
   everywhere — median g−r is −4 in the back meadow, +1 in the middle,
   +3 at the front. Only 10% of the back meadow passed. Those points were
   never even candidates, which is why the rejection tally said nothing.

   Measured across seven sample regions, `g − b` separates the meadow
   from everything else in the bowl with a clear gap and nothing in it:

     meadow  back 38   mid 38   front 36
     rock    left 17   right 20
     pines   21
     mist / distant mountain   24

   `g − r` for the same regions is −4/+1/+3 against −10/−11/−12/−20 —
   overlapping, and the sign flips inside the meadow itself. Local
   contrast also nearly works (meadow 15–19, rock 23–27) but the mist
   reads 12 and would pass, which would put buildings up in the neck.

   The luma band still does real work at both ends: below GRASS_LO is
   the dark interior of a pine crown, above GRASS_HI is blown-out mist. */
var GREEN = 30, GRASS_LO = 118, GRASS_HI = 225;

var DARK_LUMA = 108;  // below this is pine needle, rock shadow or ink
var CLEAR     = 30;   // a plot keeps at least this many px clear of dark ink
var CLEAR_EDGE = 13;  // ...and this much at the corners of its footprint

/* ERODE was 6 and MIN 150, which found six clearings out of the twelve
   the plate actually carries: the small pads — the ones tucked against
   a lane, which are the best-looking sites in the painting — were being
   eroded away and then filtered out for good measure. VEN saw the
   result of that as buildings standing next to empty painted spots. */
var ERODE = 4;      // radius that kills a lane but not a clearing
var MIN   = arg("--min", 45);  // core pixels below this is a wide spot in a path
var REGROW = 2;     // dilate cores by ERODE + this to recover the pad
var LANE_OPEN = 1;  // opening radius that cleans the footpath mask
var SPECK = 60;     // pale blobs smaller than this are meadow highlight

var INSET   = 0.055;  // pull the envelope in off the rocks, in master fractions
var TOP     = 0.335;  // above this is neck, mist and ridge
var BOTTOM  = 0.930;
/* HOW FAR OFF THE FOOTPATHS A BUILDING MAY STAND, measured from the
   edge of its own footprint. This started at 42px on the reasoning that
   a house alone in the meadow reads as dropped there rather than sited,
   and while that is true of a whole village it is not true of every
   building in one — VEN, 2026-08-15: *"we dont need them all to have
   their own individual spot cut out on the background though, for
   example the straw roof huts can be on the grass."* Farmhouses stand
   in their fields.

   It is a cap, not a target. Candidates are still sorted by how closely
   they hug a lane and taken in that order, so the plots along the paths
   are claimed first and the open meadow only gets used once they run
   out. Widening it is what takes the village past two dozen: at 44 the
   valley holds 24 buildings however small they are, because the land
   within reach of a path is simply full. */
var NEAR_HI = arg("--near", 150);
var APART   = 0.052;  // minimum centre-to-centre spacing, master fractions
var GAP     = arg("--gap", 0.44);   // ...or this much of the two footprints' widths
var APART_PAD = 0.038;              // both relaxed for a plot on a landing
var GAP_PAD   = 0.30;
/* how much of a footprint must be meadow or painted clearing — the rest
   of the bowl is boulder slope and scree, which is warm and pale enough
   to pass for bare earth. See §4b, where the mask is built. */
var GROUND  = arg("--ground", 0.70);
/* A LANDING. How much of a sprite's ground band must fall on painted
   clearing before the plot counts as having a dedicated spot. Only
   `b-walled` needs one — it is the single building that arrives with its
   own boundary wall and swept yard, and VEN: *"b-walled buildings look a
   bit funny if they are not on a dedicated spot on the background like a
   landing... make sure that the only place that walled houses can go is
   on the landings."* A hut in the grass is a hut in the grass; a walled
   compound in the grass is a wall around nothing. */
var PAD_COVER = arg("--padcover", 0.55);
var PAD_BIG   = 75;   // ...and the landing must be this many px across

/* THE GROUND BAND — the strip of ground a sprite's stone platform
   actually covers, in fractions of its rendered WIDTH. It is not a
   rectangle. Measured off all six PNGs: every one of them comes to a
   POINT at the bottom, the near corner of its platform, and widens
   going back — the opaque span is 0.06–0.21 of the sprite's width at a
   depth of 2%, 0.32–0.57 at 10%, and 0.67–0.90 at 20%. So it is a
   trapezoid, tested as stacked strips: `[depth from, depth to,
   half-width]`.

   Testing the bounding box instead — full width by a third of it deep —
   is three times the area and the wrong shape, and it rejects every
   painted clearing in the plate, because a clearing is the end of a
   spur and the spur necessarily meets the front of whatever stands on
   it. The roof may overhang a lane all it likes; buildings do stand by
   roads. It is the platform that must be off the path.

   IT IS PER TYPE NOW, and both the default and the one override live in
   js/village.js beside TYPES — see the note there. Pooling them into a
   single trapezoid was right for the five sprites that are one building
   on one platform and badly wrong for the walled compound, which is a
   yard seen from above and covers 2.3x the depth this reserved. That
   single number is what VEN circled twice. */
/* how much of that band may be footpath. Not zero: the pale paint is
   scumbled and a lane's edge frays into the grass for a few pixels, so
   demanding an absolutely clean band rejects sites that read perfectly
   well. Two percent of the band is a few dozen stray pixels — far below
   a lane crossing it, which is hundreds. */
var LANE_TOL = 0.02;

var SHRINK_MIN = 0.66;  // a footprint may shrink to this much of its row
var PAD_FLOOR  = 0.55;  // ...or this much, when it is standing on a landing
var SHRINK_STEP = 0.06;

/* row bands by ground-line y, matching ROW_K in js/village.js */
function rowOf(y){ return y < 0.635 ? 0 : y < 0.755 ? 1 : 2; }
var ROW_W = [0.072, 0.098, 0.122].map(function(w){ return w * SHRINK; });
/* what fraction of the plots each depth row gets. Filling greedily
   front to back piles two thirds of the village into the foreground,
   because that is where the lanes are widest and the candidates most
   numerous; the village has to spread up the field. */
var QUOTA_F = [0.25, 0.35, 0.40];
var QUOTA = QUOTA_F.map(function(f){ return Math.round(WANT * f); });

/* ---- 0. the per-type scale multipliers, read from the engine ------ */

var SRC = fs.readFileSync(ENGINE, "utf8");
var tm = /var TYPES = (\[[\s\S]*?\n  \]);/.exec(SRC);
if (!tm) throw new Error("could not find TYPES in js/village.js");
var TYPES = Function("return " + tm[1])();
var bm = /var BAND = (\[\[[\s\S]*?\]\]);/.exec(SRC);
if (!bm) throw new Error("could not find the default BAND in js/village.js");
var BAND = Function("return " + bm[1])();

/* THE PLOT DOES NOT LEARN WHICH BUILDING IT GETS until render time —
   assignment is seeded from the contract address so a second token gets
   a different village out of the same six files, and baking the type
   into PLOTS would throw that away. So a plot is measured against the
   UNION of every building that can land on it: take each eligible type's
   band, fold in that type's own scale so everything is in units of the
   plot's width, and keep the widest half-width at every depth. Safe by
   construction — whatever arrives fits inside what was tested.

   Two unions, because there are two kinds of plot. A landing is the
   compound's, so it is measured against the compound alone; every other
   plot is measured against the five types that are not pad-only, which
   is a NARROWER hull than the old one-scale-per-row rule and is most of
   where the extra room for VEN's "empty spaces near the top" comes
   from. The old rule reserved b-walled's 1.5 scale on every row it was
   eligible for, including the plots it can no longer stand on. */
function bandOf(t){ return t.band || BAND; }
function scaledBand(t){
  var s = t.scale || 1;
  return bandOf(t).map(function(k){ return [k[0] * s, k[1] * s, k[2] * s]; });
}
var SLICES = 12;   // depth resolution of the union; SAT makes each free
function hull(types){
  var bands = (types.length ? types : [TYPES[0]]).map(scaledBand);
  var depth = 0;
  bands.forEach(function(b){ depth = Math.max(depth, b[b.length - 1][1]); });
  var out = [], i;
  for (i = 0; i < SLICES; i++){
    var d0 = depth * i / SLICES, d1 = depth * (i + 1) / SLICES, hw = 0;
    bands.forEach(function(b){
      b.forEach(function(k){
        if (d1 > k[0] + 1e-9 && d0 < k[1] - 1e-9) hw = Math.max(hw, k[2]);
      });
    });
    if (hw > 0) out.push([d0, d1, hw]);
  }
  out.depth = depth;                                       // in plot widths
  out.max = out.reduce(function(m, k){ return Math.max(m, k[2]); }, 0);
  return out;
}
function eligible(r){
  return TYPES.filter(function(t){
    return !t.pad && t.rows && t.rows.indexOf(r) >= 0;
  });
}
function scaledMax(t){
  return (t.scale || 1) * bandOf(t).reduce(function(m, k){
    return Math.max(m, k[2]);
  }, 0);
}

/* ONE UNION PER ROW WAS COSTING THE VILLAGE ITS BACK ROW. Reserving
   every plot against the widest type that could arrive is safe, but it
   is only cheap while the types are the same size. They are not: at row
   0 the eligible half-widths are

       b-store .40   b-pavilion .40   b-house .42
       b-lhouse .57  b-house2 .60  b-thatch .61  b-thatch2 .64

   so admitting the four big ones charged 52% more ground to all thirty
   of the small ones, and the gaps VEN circled at the top of the field
   are exactly where that surcharge ran out of room. The numbers also
   say where the line goes: there is a cliff between .42 and .57 and
   nothing but noise on either side of it, so two classes is the whole
   of the useful answer and a third would buy about 5%.

   So each plot is reserved against one of two hulls and SAYS WHICH.
   `add` tries the full union first, and only if the spot cannot hold
   the biggest building does it fall back to the small one — every plot
   that placed before this change still places the same way, at the same
   size, open to the same types, and the extra plots are ones that were
   being rejected outright. The narrow ones carry `hw`/`dp` (the ground
   they were actually reserved, in plot widths) into PLOTS, and
   js/village.js will not put a building bigger than that on them.

   The class is derived, not listed: everything within NARROW_F of the
   smallest eligible type. Add a sixth cottage at scale 1 and it joins
   the small class on its own. */
var NARROW_F = 1.15;
function smallOf(r){
  var el = eligible(r);
  if (!el.length) return el;
  var min = Math.min.apply(null, el.map(scaledMax));
  return el.filter(function(t){ return scaledMax(t) <= min * NARROW_F; });
}
var FOOT   = [0, 1, 2].map(function(r){ return hull(eligible(r)); });
var FOOT_N = [0, 1, 2].map(function(r){ return hull(smallOf(r)); });
var PAD_FOOT = hull(TYPES.filter(function(t){ return t.pad; }));
function footOf(row, pad, narrow){
  return pad ? PAD_FOOT : narrow ? FOOT_N[row] : FOOT[row];
}

/* WHAT THE ENGINE IS TOLD is `hw` and `dp` — one rectangle — where what
   was tested here is a hull with a shape. That is sound only while no
   type can fit inside the rectangle while poking outside the hull, which
   is true today (every small type is the shared band scaled by <= 1) and
   is not guaranteed by anything. So check it, once, out loud: a type
   that the engine's test would admit onto a narrow plot but whose band
   is not inside the narrow hull is a real bug and this is where it is
   cheap to catch. */
[0, 1, 2].forEach(function(r){
  var f = FOOT_N[r], small = smallOf(r);
  eligible(r).forEach(function(t){
    if (small.indexOf(t) >= 0) return;
    var s = t.scale || 1, b = bandOf(t);
    var maxHW = scaledMax(t), depth = b[b.length - 1][1] * s;
    if (maxHW <= f.max + 1e-9 && depth <= f.depth + 1e-9)
      console.log("!! " + t.file + " fits row " + r + "'s narrow box (" +
        f.max.toFixed(2) + "x" + f.depth.toFixed(2) + ") but is not in the " +
        "narrow hull — js/village.js would place it on a plot this tool " +
        "never tested it on");
  });
});

var img = png.decode(fs.readFileSync(MASTER));
var W = img.w, H = img.h, ch = img.ch, N = W * H;

function luma(i){
  return 0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2];
}

/* ---- 1. the three colour masks ----------------------------------- */

var earth = new Uint8Array(N), grass = new Uint8Array(N), dark = new Uint8Array(N);
for (var p = 0; p < N; p++){
  var i = p * ch, r = img.data[i], g = img.data[i + 1], L = luma(i);
  if (r - g >= WARM && L >= EARTH_LUMA) earth[p] = 1;
  else if (g - img.data[i + 2] >= GREEN && L >= GRASS_LO && L <= GRASS_HI) grass[p] = 1;
  if (L < DARK_LUMA) dark[p] = 1;
}

/* ---- 2. morphology and distance ---------------------------------- */

function erode(src, r){
  var tmp = new Uint8Array(N), out = new Uint8Array(N), xx, yy, k, ok;
  for (yy = 0; yy < H; yy++) for (xx = 0; xx < W; xx++){
    ok = 1;
    for (k = -r; k <= r && ok; k++){
      var x2 = xx + k;
      if (x2 < 0 || x2 >= W || !src[yy * W + x2]) ok = 0;
    }
    tmp[yy * W + xx] = ok;
  }
  for (yy = 0; yy < H; yy++) for (xx = 0; xx < W; xx++){
    ok = 1;
    for (k = -r; k <= r && ok; k++){
      var y2 = yy + k;
      if (y2 < 0 || y2 >= H || !tmp[y2 * W + xx]) ok = 0;
    }
    out[yy * W + xx] = ok;
  }
  return out;
}

function dilate(src, r){
  var tmp = new Uint8Array(N), out = new Uint8Array(N), xx, yy, k, on;
  for (yy = 0; yy < H; yy++) for (xx = 0; xx < W; xx++){
    on = 0;
    for (k = -r; k <= r && !on; k++){
      var x2 = xx + k;
      if (x2 >= 0 && x2 < W && src[yy * W + x2]) on = 1;
    }
    tmp[yy * W + xx] = on;
  }
  for (yy = 0; yy < H; yy++) for (xx = 0; xx < W; xx++){
    on = 0;
    for (k = -r; k <= r && !on; k++){
      var y2 = yy + k;
      if (y2 >= 0 && y2 < H && tmp[y2 * W + xx]) on = 1;
    }
    out[yy * W + xx] = on;
  }
  return out;
}

/* Drop connected components smaller than `minPx`. The meadow is
   scumbled with warm highlights that answer the bare-earth test — 4,184
   separate blobs under fifty pixels each, a sixth of all the pale paint
   inside the valley. They are not footpaths and a footprint sitting on
   open grass must not be failed by them. */
function despeckle(src, minPx){
  var lab = new Int32Array(N).fill(-1), out = new Uint8Array(N), st = [];
  for (var s = 0; s < N; s++){
    if (!src[s] || lab[s] !== -1) continue;
    var id = s, run = [], nn = 0;
    st.push(s); lab[s] = id;
    while (st.length){
      var q = st.pop(), qx = q % W, qy = (q - qx) / W;
      run.push(q); nn++;
      var nb = [qx > 0 ? q - 1 : -1, qx < W - 1 ? q + 1 : -1,
                qy > 0 ? q - W : -1, qy < H - 1 ? q + W : -1];
      for (var k = 0; k < 4; k++){
        var m = nb[k];
        if (m >= 0 && src[m] && lab[m] === -1){ lab[m] = id; st.push(m); }
      }
    }
    if (nn >= minPx) for (var j = 0; j < run.length; j++) out[run[j]] = 1;
  }
  return out;
}

function invert(src){
  var out = new Uint8Array(N);
  for (var q = 0; q < N; q++) out[q] = src[q] ? 0 : 1;
  return out;
}

/* two-pass chamfer — exact enough at this scale and O(N) */
function chamfer(mask){
  var INF = 1e9, d = new Float32Array(N), q, yA, xA, yB, xB;
  for (q = 0; q < N; q++) d[q] = mask[q] ? 0 : INF;
  for (yA = 0; yA < H; yA++) for (xA = 0; xA < W; xA++){
    var iA = yA * W + xA, v = d[iA];
    if (xA > 0) v = Math.min(v, d[iA - 1] + 1);
    if (yA > 0) v = Math.min(v, d[iA - W] + 1);
    if (xA > 0 && yA > 0) v = Math.min(v, d[iA - W - 1] + 1.414);
    if (xA < W - 1 && yA > 0) v = Math.min(v, d[iA - W + 1] + 1.414);
    d[iA] = v;
  }
  for (yB = H - 1; yB >= 0; yB--) for (xB = W - 1; xB >= 0; xB--){
    var iB = yB * W + xB, v2 = d[iB];
    if (xB < W - 1) v2 = Math.min(v2, d[iB + 1] + 1);
    if (yB < H - 1) v2 = Math.min(v2, d[iB + W] + 1);
    if (xB < W - 1 && yB < H - 1) v2 = Math.min(v2, d[iB + W + 1] + 1.414);
    if (xB > 0 && yB < H - 1) v2 = Math.min(v2, d[iB + W - 1] + 1.414);
    d[iB] = v2;
  }
  return d;
}

/* summed-area table, so "is there any lane inside this rectangle" is
   four lookups instead of five thousand */
function sat(mask){
  var S = new Uint32Array((W + 1) * (H + 1));
  for (var y = 0; y < H; y++){
    var run = 0;
    for (var x = 0; x < W; x++){
      run += mask[y * W + x];
      S[(y + 1) * (W + 1) + x + 1] = S[y * (W + 1) + x + 1] + run;
    }
  }
  return S;
}
/* Clamp and round ONCE, and hand back the area of the box that was
   actually summed. Deriving the area from the unrounded floats instead
   reports coverage over 100% — a 34.2 x 7.5 strip is summed as 35 x 8,
   which is 9% more pixels than the divisor knows about. Harmless in a
   threshold, confusing in a printed diagnostic, and wrong either way. */
function box(x0, y0, x1, y1){
  x0 = Math.max(0, Math.min(W, Math.round(x0)));
  x1 = Math.max(0, Math.min(W, Math.round(x1)));
  y0 = Math.max(0, Math.min(H, Math.round(y0)));
  y1 = Math.max(0, Math.min(H, Math.round(y1)));
  return { x0: x0, y0: y0, x1: x1, y1: y1,
           area: Math.max(0, x1 - x0) * Math.max(0, y1 - y0) };
}
function boxSum(S, b){
  if (!b.area) return 0;
  return S[b.y1 * (W + 1) + b.x1] - S[b.y0 * (W + 1) + b.x1]
       - S[b.y1 * (W + 1) + b.x0] + S[b.y0 * (W + 1) + b.x0];
}

/* How far the nearest MASS of dark ink is. The foreground pines are
   open crowns with lit grass showing between the branches, so a
   scanline envelope — however it is measured — reads that speckle as
   meadow and hands back plots standing in a tree in the front corners.
   Pine needles and rock shadow are the darkest thing in the painting
   and nothing on the valley floor comes close, so "keep well away from
   dark ink" states the rule directly.

   Eroded first, because the meadow is flicked all over with dark grass
   tufts drawn in that same ink. A tuft is a stroke two or three pixels
   wide and vanishes; a pine crown or a boulder is a mass and survives.
   Without the erosion the tufts read as cover and there is nowhere in
   the valley left to build — the first run of this returned 7 plots. */
var darkDist = chamfer(erode(dark, 4));
function clearOfCover(px, py, need){
  var xx = Math.round(px), yy = Math.round(py);
  if (xx < 0 || yy < 0 || xx >= W || yy >= H) return false;
  return darkDist[yy * W + xx] >= need;
}

/* ---- 3. the meadow envelope, per scanline ------------------------ */

var y0 = Math.round(TOP * H), y1 = Math.round(BOTTOM * H);
var inset = Math.round(INSET * W);
var lo = new Int32Array(H).fill(-1), hi = new Int32Array(H).fill(-1);

for (var y = y0; y < y1; y++){
  var xs = [];
  for (var x = 0; x < W; x++) if (grass[y * W + x] || earth[y * W + x]) xs.push(x);
  if (xs.length < 40) continue;
  /* percentiles, not min/max — one stray green pixel in the pines
     must not drag the envelope out over the rocks */
  var a = xs[Math.floor(xs.length * 0.04)], b = xs[Math.floor(xs.length * 0.96)];
  if (b - a < inset * 2 + 20) continue;
  lo[y] = a + inset; hi[y] = b - inset;
}

function inField(px, py){
  py = Math.round(py); px = Math.round(px);
  if (py < y0 || py >= y1 || lo[py] < 0) return false;
  return px >= lo[py] && px <= hi[py];
}

/* ---- 4. the pale paint, cleaned --------------------------------- */

var inside = new Uint8Array(N);
for (var z = 0; z < N; z++){
  if (!earth[z]) continue;
  var zx = z % W, zy = (z - zx) / W;
  if (zy < y0 || zy >= y1 || lo[zy] < 0 || zx < lo[zy] || zx > hi[zy]) continue;
  inside[z] = 1;
}
var pale = despeckle(dilate(erode(inside, LANE_OPEN), LANE_OPEN), SPECK);
var thick = chamfer(invert(pale));

/* ---- 5. clearings: erode, label, keep, grow back ----------------- */

/* A CLEARING IS A POCKET; A JUNCTION IS PART OF THE ROAD. Erosion alone
   cannot tell them apart, and the difference matters more than anything
   else in this file, because a blob called a clearing is a blob a
   building is allowed to stand on. The footpath network forks and
   swells, and every wide spot at a fork survives erosion exactly the way
   a small painted pad does — five of the fourteen "clearings" the first
   pass found were pieces of the trunk road, which is how buildings ended
   up standing in it.

   Two shape tests were tried on the blob itself and both failed for the
   same reason. Elongation: erosion snaps a road into short chunks
   wherever it narrows, and a short chunk is as compact as a pad. How
   enclosed it is: at these sizes a road segment is ringed by meadow
   except at its two ends, which measures the same as a pad ringed by
   meadow except at its neck. The blob does not carry the answer.

   Connectivity was tried third and does not work either: every clearing
   in this plate sits at the end of a spur, so it is joined to the
   footpath network and the whole pale mask is one 40,000px component.

   THE VIEWPOINT IS WHAT SEPARATES THEM. The valley is painted from a
   steep angle above, so the ground is foreshortened hard: a roughly
   round clearing projects as a WIDE FLAT ellipse, while the paths run
   up the picture towards the viewer and their segments come out tall
   and narrow. Checked by eye against a contact sheet of all fifteen
   candidates — every one of the seven real pads measures 1.86 to 3.13
   wide-to-tall, and every road piece, rock face and patch of ground
   under a pine measures 0.55 to 1.58. Nothing lands in between,
   which is the kind of margin worth trusting.

   It is a fact about this camera angle rather than about this painting,
   so it survives a re-cut plate — but if the valley is ever repainted
   from a shallower viewpoint, this is the constant that stops working,
   and the contact-sheet check is how you find that out. */
var ASPECT = 1.7;   // a clearing is at least this much wider than it is tall

var core = erode(pale, ERODE);
var label = new Int32Array(N).fill(-1), blobs = [], stack = [];
var accepted = new Uint8Array(N);

for (var s = 0; s < N; s++){
  if (!core[s] || label[s] !== -1) continue;
  var id = blobs.length, px2 = [], n = 0, rmax = 0;
  var bx0 = 1e9, bx1 = -1, by0 = 1e9, by1 = -1;
  stack.push(s); label[s] = id;
  while (stack.length){
    var q = stack.pop(), qx = q % W, qy = (q - qx) / W;
    n++; px2.push(q);
    if (thick[q] > rmax) rmax = thick[q];
    if (qx < bx0) bx0 = qx;
    if (qx > bx1) bx1 = qx;
    if (qy < by0) by0 = qy;
    if (qy > by1) by1 = qy;
    var nb = [qx > 0 ? q - 1 : -1, qx < W - 1 ? q + 1 : -1,
              qy > 0 ? q - W : -1, qy < H - 1 ? q + W : -1];
    for (var k2 = 0; k2 < 4; k2++){
      var m = nb[k2];
      if (m >= 0 && core[m] && label[m] === -1){ label[m] = id; stack.push(m); }
    }
  }
  if (n < MIN) continue;
  var padW = bx1 - bx0 + 2 * ERODE, padH = by1 - by0 + 2 * ERODE;
  var aspect = padW / padH;
  if (aspect < ASPECT) continue;            // a piece of the road, not a pad
  /* The pad's CENTROID, not its front lip. The building is centred on
     its landing and sized to it (see fitPad below), so what is wanted
     here is the middle of the painted shape — VEN: *"scaling it down and
     centering it in its landing spot"*, and *"move that roof to fit in
     the landing space perfectly."* Standing it at the near edge instead
     was what left the compound sitting up-left of its own yard with the
     pale ground showing past its bottom-right corner. */
  var sx2 = 0, sy2 = 0;
  px2.forEach(function(q3){ sx2 += q3 % W; sy2 += (q3 - (q3 % W)) / W; });
  var cx = sx2 / n, cyPad = sy2 / n;
  /* Stand the building a little INSIDE the pad rather than on its very
     front lip. Two reasons: the lip is usually where the spur meets the
     clearing, so an anchor there puts the near corner of the platform on
     the path; and leaving a rim of bare earth in front of the house
     reads as its yard, which is what a clearing is for. */
  if (!inField(cx, cyPad) || !clearOfCover(cx, cyPad, CLEAR)) continue;
  px2.forEach(function(q4){ accepted[q4] = 1; });
  /* y is left to fitPad(): the ground line depends on how big the
     building ends up, because centring a band of depth 0.22*fw on the
     pad puts its bottom edge 0.11*fw below the pad's middle. */
  blobs.push({ n: n, cx: cx, cy: cyPad, wpx: padW, hpx: padH,
               x: cx / W, y: cyPad / H, r: rmax, aspect: aspect });
}

/* Grow the kept cores back to the pads they came from, and clip to the
   pale paint so the growth cannot bleed into the meadow. Everything
   pale that is NOT a pad is the footpath network — that is the whole
   trick, and it is why a colour test could never have done this.

   Clipped to the envelope as well, and that is not a detail: the aged
   paper the valley is painted on is warm and pale, so it answers the
   bare-earth test, and it is 40% of the master. Left in, the footpath
   mask is mostly parchment, nothing within a footprint's reach of the
   valley's edge can ever pass, and every building shrinks to its floor
   trying. The vignette is kept OUT of the lane mask and handled where
   it belongs — sits() requires both ends of the ground band to be
   inside the meadow envelope. */
var padMask = dilate(accepted, ERODE + REGROW);
var lane = new Uint8Array(N), padTrue = new Uint8Array(N), padN = 0, laneN = 0;
for (var z2 = 0; z2 < N; z2++){
  if (!pale[z2]) continue;
  if (padMask[z2]){ padTrue[z2] = 1; padN++; continue; }
  lane[z2] = 1; laneN++;
}
var laneSAT = sat(lane);
var laneDist = chamfer(lane);
/* THE REAL PAINTED CLEARING, not the dilated core. `padMask` is the
   accepted cores grown back by ERODE+REGROW, so it spills a few pixels
   past the pale paint into the grass — which is what you want for
   subtracting the lanes, and exactly what you do not want for asking
   "is this building standing on the landing". Measured against padMask
   the compound read 100% covered while a third of its wall was visibly
   on grass, which is the discrepancy VEN circled in red. */
var padSAT = sat(padTrue);

/* WHAT IS ACTUALLY BUILDABLE is meadow, plus the clearings scuffed into
   it. Everything else in the bowl — the boulder slopes down both sides,
   the scree under the pines, the mist at the neck — answers the
   bare-earth test as readily as a footpath does, because it is warm and
   pale, and that is enough to widen the scanline envelope out over the
   rocks and stand six buildings on them. The envelope is a coarse
   instrument; this is the precise one, and it is measured over the
   footprint rather than at a point, for the same reason everything else
   here is. */
var buildable = new Uint8Array(N);
for (var z3 = 0; z3 < N; z3++)
  buildable[z3] = (grass[z3] || (padMask[z3] && pale[z3])) ? 1 : 0;
var groundSAT = sat(buildable);

/* ---- 5. plots: the gate, then the clearings, then along the lanes - */

var taken = [];
/* y is weighted DOWN, not up. Two roofs side by side are fine; two
   roofs stacked one above the other occlude, because a sprite is drawn
   from its ground line upward and covers roughly its own height of the
   plot behind it. Counting vertical separation for less than horizontal
   is what forces that pair apart — weighting it up did the opposite and
   let two thatched roofs land almost on the same x. */
var Y_WEIGHT = 0.75;

/* `pw` is the PLOT's width as a fraction of the plate; the hull's strips
   are already in those units, so the per-type scale never has to be
   carried around beside it. `gw` is the ground the building actually
   covers, left to right — the number that matters for spacing and the
   only one worth printing. */
function footprint(px, py, pw, row, pad, narrow){
  var f = footOf(row, pad, narrow), base = pw * W, cx = px * W, cy = py * H;
  return { base: base, gw: 2 * f.max * base, depth: f.depth * base,
           cx: cx, cy: cy,
           strips: f.map(function(s){
             return { x0: cx - s[2] * base, x1: cx + s[2] * base,
                      y0: cy - s[1] * base, y1: cy - s[0] * base };
           }) };
}

/* Does this building stand clear of the footpaths, on ground that is
   actually in the field, without a boulder or a pine under one end?
   Returns "" when it does and the failing test's name when it does
   not — a boolean here is a tool you cannot debug, and every tuning
   session on this file starts with "why was that spot rejected". */
function sits(px, py, pw, row, pad, narrow){
  var f = footprint(px, py, pw, row, pad, narrow), area = 0, hit = 0, good = 0;
  f.strips.forEach(function(s){
    var b = box(s.x0, s.y0, s.x1, s.y1);
    area += b.area;
    hit  += boxSum(laneSAT, b);
    good += boxSum(groundSAT, b);
  });
  if (hit > LANE_TOL * area) return "path";
  if (good < GROUND * area) return "rough";
  var back = f.strips[f.strips.length - 1];
  if (!inField(back.x0, back.y1) || !inField(back.x1, back.y1)) return "off-field";
  if (!clearOfCover(px * W, py * H, CLEAR)) return "cover";
  var edge = "";
  [[back.x0, back.y1], [back.x1, back.y1],
   [back.x0, back.y0], [back.x1, back.y0]].forEach(function(c){
    if (!clearOfCover(c[0], c[1], CLEAR_EDGE)) edge = "cover-edge";
  });
  if (edge) return edge;
  /* and it must still FRONT a lane — a house alone in the middle of the
     meadow reads as dropped there. Measured from the footprint's edge,
     not from the anchor: the two tests used to contradict each other,
     because a lane 42px from the anchor of a 150px-wide building is
     forty pixels INSIDE it. */
  var d = laneDist[Math.round(py * H) * W + Math.round(px * W)];
  return d <= f.gw / 2 + NEAR_HI ? "" : "stranded";
}

/* Spacing has to scale with the sprite, not be one number: a row-2
   compound is a sixth of the plate wide and a row-0 hut a twelfth, so a
   spacing that keeps the huts apart lets the compounds overlap. */
function farEnough(px, py, gw, onPad){
  /* A LANDING IS THE PAINTING'S OWN INSTRUCTION and outranks the spacing
     heuristic. The plate has two pairs of clearings painted close
     together; at the general spacing the second of each pair is refused
     as crowded, which is what left the pad VEN circled in blue standing
     empty next to a house. Where the artist put two pads, put two
     buildings. Only the plot standing on the landing gets the relaxed
     numbers — its neighbours are still held at arm's length from
     everything else. */
  var apart = onPad ? APART_PAD : APART, gap = onPad ? GAP_PAD : GAP;
  for (var t = 0; t < taken.length; t++){
    var need = Math.max(apart, (gw + taken[t].gw) * gap);
    var dx = taken[t].x - px, dy = (taken[t].y - py) * Y_WEIGHT;
    if (dx * dx + dy * dy < need * need) return false;
  }
  return true;
}

/* SHRINK TO FIT RATHER THAN REJECT — the single most useful thing in
   this pass. A clearing with a lane running past one corner is still a
   good site and a neighbour half a width away is still a neighbour; the
   building is simply one size too big for the gap it has been given. So
   walk the size down and take the largest that clears both the footpaths
   and the buildings already standing. Both tests are inside the loop
   because either can be the one that a smaller building satisfies. */
/* CENTRE THE BUILDING IN ITS LANDING, AND SIZE IT TO FIT.

   The ground band is `f.max` wide either side of the anchor and
   `f.depth` deep above it, in plot widths, so its middle sits
   `f.depth/2` above the anchor. To centre it on a pad centred at
   (cx, cy) the anchor goes at `cy + f.depth*base/2` — which depends on
   the size, so the two have to be solved together and the ground line is
   recomputed at every trial width rather than fixed up front.

   Width comes from the pad: the band spans `2*f.max*base`, so one that
   exactly fills a pad `padW` across wants `base = padW/(2*f.max)`.
   Capped at the row's own width, because perspective outranks the
   painting — a big pad at the back of the valley must not produce a
   building bigger than its row. Allowed BELOW the usual floor, though:
   a small landing should get a small building, and VEN asked for more
   size variation anyway.

   Both of VEN's asks for the compound come out of this once the band is
   the real one. `f.max` went 0.42 -> 0.72 in plot widths, so the same
   pad now buys a building 42% narrower; `f.depth` went 0.22 -> 0.75, so
   the anchor drops by a quarter of the sprite's width. Scaled down, and
   moved down the y axis.

   PAD_FILL — and then a shade smaller than that. VEN, 2026-08-16,
   circling all four compounds: *"scale down everything circled in blue
   slightly."* The factor is applied in add(), to the width that
   PASSED, not here to the starting guess — the four compounds arrive
   at their size by three different routes (pad-fitted, capped by
   ROW_W, walked down by the shrink loop) and a factor on the starting
   guess shrinks the first two kinds while leaving the third almost
   untouched: measured at 0.85-on-the-fit, three compounds lost 15% and
   the loop-limited one lost 4%, and it was the biggest of the four.
   Scaling the accepted width shrinks what VEN actually sees, by the
   same fraction, on all of them. */
var PAD_FILL = arg("--padfill", 0.85);
function fitPad(pad, f, row){
  return Math.min(ROW_W[row], (pad.wpx / (2 * f.max)) / W);
}

/* WHICH CLEARINGS ARE LANDINGS. Not every painted clearing is one: the
   plate carries three that are 30–60px across, too small to be worth a
   walled estate, and the point of the flag is to reserve the ones that
   are. The distinction has to be made HERE rather than after the fact,
   because it decides which hull the plot is cut with. Sizing every
   clearing to the compound and then handing three of them a farmhouse
   leaves the building a third narrower than the ground that was cleared
   for it and floating a quarter of its width above the middle of it —
   the same class of mistake as the pooled band, one level up. */
var PAD_ROWS = {};
TYPES.forEach(function(t){
  if (t.pad) (t.rows || []).forEach(function(r){ PAD_ROWS[r] = 1; });
});
function isLanding(b){ return b.wpx >= PAD_BIG && !!PAD_ROWS[rowOf(b.y)]; }

/* WHICH SIZE CLASSES THE CURRENT SWEEP MAY USE. 0 = try the full union
   and then the small one, which is what the gate and the clearings get:
   a painted clearing left empty is the fault VEN circled, so it takes
   whatever it can hold. The lanes are swept twice instead — 1, every
   spot that can hold ANY building in its row, then 2, the small class
   into what is left over. One sweep trying wide-then-narrow per
   candidate reads the same and is not: the first cottage-sized gap
   along a lane is claimed by the first candidate to reach it, and the
   neighbour forty pixels along that could have taken a farmhouse is
   then crowded out by it. Two sweeps put that the right way round — big
   buildings choose first, cottages fill in behind them — and it moved
   the split from 20 wide / 48 small to 54 / 6. */
var PASS = 0;

/* `pad` is the painted clearing to centre on and size to; `landing`
   says whether the building that lands here will be a compound, and so
   which ground hull the plot is cut with. A small clearing gets the
   first without the second: centred and fitted to the paint, but at
   ordinary-building proportions. */
function add(px, py, from, pin, pad, landing){
  var row = rowOf(py);
  if (pin){
    /* the gate is the one building that MUST stand on the path — it is
       the village entrance and the journey's road arrives through it */
    var pf = hull(TYPES.filter(function(t){ return t.file === pin; }));
    var w0 = 0.110 * SHRINK;
    taken.push({ x: px, y: py, w: w0, gw: 2 * pf.max * w0,
                 row: row, from: from, pin: pin });
    return true;
  }
  var wMax = ROW_W[row];
  /* A landing may take a building smaller than its row's usual floor —
     the pad is the authority on a plot that has one — but not smaller
     than PAD_FLOOR, or the smallest pads produce a hut that is 23px on
     the plate and 8px on a phone, which is a smudge rather than a
     building. `Math.max` rather than a bare assignment because a pad
     narrower than the floor would otherwise start the search below its
     own stopping point, the loop would never run once, and the plot
     would be dropped with no reason recorded. */
  /* the full union first, then the small one — see FOOT_N. A landing is
     the compound's and has only its own hull, so it does not fall back;
     shrinking a compound plot into a cottage plot would leave the paint
     it was cut from half empty. */
  var floor = (landing ? PAD_FLOOR : SHRINK_MIN) * wMax;
  var why = "", ax, ay, ci;
  var CLASS = landing || FOOT_N[row].max >= FOOT[row].max ? [0]
            : PASS === 1 ? [0] : PASS === 2 ? [1] : [0, 1];
  for (ci = 0; ci < CLASS.length; ci++){
    var narrow = CLASS[ci] === 1;
    var f = footOf(row, !!landing, narrow);
    var w = pad ? Math.max(fitPad(pad, f, row), floor) : wMax;
    while (w >= floor - 1e-9){
      var gw = 2 * f.max * w;
      ax = px;
      ay = pad ? (pad.cy / H) + (f.depth * w * W / 2) / H : py;
      why = sits(ax, ay, w, row, !!landing, narrow);
      if (!why && !farEnough(ax, ay, gw, !!landing)) why = "crowded";
      if (!why && landing && PAD_FILL < 1){
        /* the compound has its size; now take PAD_FILL of it, re-centre
           on the pad (the anchor depends on the width, so it has to be
           re-solved) and re-check. A smaller band on the same centre
           can only fail `stranded` or a cover corner, and in practice
           fails neither — but if it ever does, the exact fit stands and
           the run says so, rather than a compound silently vanishing. */
        var w2 = Math.max(w * PAD_FILL, floor);
        var ay2 = (pad.cy / H) + (f.depth * w2 * W / 2) / H;
        if (!sits(px, ay2, w2, row, true, narrow) &&
            farEnough(px, ay2, 2 * f.max * w2, true)){
          w = w2; ay = ay2; gw = 2 * f.max * w;
        } else {
          console.log("!! landing at " + px.toFixed(3) + "," + py.toFixed(3) +
                      " kept its exact fit — the PAD_FILL size failed placement");
        }
      }
      if (!why){
        taken.push({ x: ax, y: ay, w: w, gw: gw, row: row, from: from,
                     pin: null, pad: padCover(ax, ay, w, row, !!landing, narrow),
                     padW: pad ? pad.wpx : 0, isPad: !!landing,
                     hw: narrow ? f.max : 0, dp: narrow ? f.depth : 0 });
        return true;
      }
      w -= wMax * SHRINK_STEP;
    }
  }
  if (PASS !== 1) reject(from, why, px, py);   // pass 2 gets the last word
  return false;
}

/* IS THIS BUILDING ACTUALLY STANDING ON ITS LANDING? Not "is there a
   clearing near it" — the fraction of the sprite's own ground band that
   falls on painted clearing. VEN's two complaints about the walled
   compound were the same measurement missing: one was sitting beside its
   landing rather than on it, and one was out on open grass, and *"b-walled
   buildings look a bit funny if they are not on a dedicated spot"*.
   A compound is the one building with its own boundary wall and yard, so
   it is the one that needs real ground under it; a hut does not. */
function padCover(px, py, pw, row, pad, narrow){
  var f = footprint(px, py, pw, row, pad, narrow), area = 0, hit = 0;
  f.strips.forEach(function(s){
    var b = box(s.x0, s.y0, s.x1, s.y1);
    area += b.area;
    hit  += boxSum(padSAT, b);
  });
  return area ? hit / area : 0;
}

/* Rejections are tallied AND kept with their coordinates, because the
   question that actually gets asked of this tool is "why is there a hole
   in the village HERE" — VEN circled one on a screenshot — and a total
   cannot answer it. tools/plots-reject.png paints every rejected
   candidate over a greyed plate, coloured by which test turned it down.
   Reading that map is how the open meadow at the back turned out to be
   failing `stranded` rather than being crowded out. */
var rejects = {}, rejectPts = [];
function reject(from, why, px, py){
  var k = from + ":" + why;
  rejects[k] = (rejects[k] || 0) + 1;
  if (px !== undefined) rejectPts.push({ x: px, y: py, why: why });
}
var REJECT_COL = {
  "path":       [214,  40, 160],
  "rough":      [150,  95,  40],
  "crowded":    [110, 110, 120],
  "cover":      [ 20, 110,  60],
  "cover-edge": [ 40, 150,  90],
  "off-field":  [ 40,  90, 210],
  "stranded":   [240, 150,  30],
  "on-lane":    [250, 210, 235],
  "not-meadow": [ 60,  55,  50],
  "no-lane-near": [  0, 170, 200]
};

/* THE GATE FIRST, and on the trunk itself rather than near it. The
   journey's road arrives at the bottom centre and the gate has to
   stand astride where it lands, so the trunk is measured off the
   painting: the run of bare earth crossing the front of the field
   closest to the centre. */
var GATE_Y = 0.905;
var gy2 = Math.round(GATE_Y * H), runs = [], run = null;
for (var xG = 0; xG < W; xG++){
  if (earth[gy2 * W + xG]){
    if (!run) run = { a: xG, b: xG }; else run.b = xG;
  } else if (run){ runs.push(run); run = null; }
}
if (run) runs.push(run);
/* the WIDEST run near the middle, not merely the nearest one: the trunk
   is the broad road at the front of the field, and a thin spur of the
   same colour crossing closer to centre would otherwise win and stand
   the gate beside the road instead of astride it */
var best = null, bestW = 0;
runs.forEach(function(r2){
  var mid = (r2.a + r2.b) / 2 / W, wide = r2.b - r2.a;
  if (Math.abs(mid - 0.5) > 0.22 || wide < 8) return;
  if (wide > bestW){ bestW = wide; best = mid; }
});
add(best !== null ? best : 0.5, GATE_Y, "trunk", "b-gate.png");

/* then every painted clearing that still fits — biggest first, so the
   pads that can carry a compound are claimed before a hut takes one */
blobs.sort(function(a2, b2){ return b2.n - a2.n; });
var padTried = blobs.length;
blobs.forEach(function(b3){
  b3.landing = isLanding(b3);
  if (taken.length < WANT &&
      add(b3.x, b3.y, "clearing", null, b3, b3.landing)) b3.built = 1;
});
var onClearings = taken.filter(function(t){ return t.from === "clearing"; }).length;

/* Then fill against the lanes — but PER ROW, to a quota. */
var cands = [[], [], []];
for (var yC = y1 - 1; yC >= y0; yC--){
  if (lo[yC] < 0) continue;
  for (var xC = lo[yC]; xC <= hi[yC]; xC += 2){
    /* These four are pre-filters, not rejections, and that distinction
       hid the answer to VEN's first note. He circled the open meadow at
       the back and asked why nothing was built there; the rejection
       tally said nothing, because those points were never candidates in
       the first place. They are recorded now for exactly that reason —
       a blank area on plots-reject.png means the loop never looked. */
    if (lane[yC * W + xC]){ reject("lane", "on-lane", xC / W, yC / H); continue; }
    if (!grass[yC * W + xC] && !padMask[yC * W + xC]){
      reject("lane", "not-meadow", xC / W, yC / H); continue;
    }
    var dC = laneDist[yC * W + xC];
    if (dC > NEAR_HI + ROW_W[2] * FOOT[2].max * W){
      reject("lane", "no-lane-near", xC / W, yC / H); continue;
    }
    if (!clearOfCover(xC, yC, CLEAR)){
      reject("lane", "cover", xC / W, yC / H); continue;
    }
    cands[rowOf(yC / H)].push({ x: xC / W, y: yC / H, d: dC });
  }
}
/* inside a row, prefer the candidates hugging a lane most closely */
cands.forEach(function(list){ list.sort(function(a3, b4){ return a3.d - b4.d; }); });

function countRow(r3){
  return taken.filter(function(t){ return t.row === r3; }).length;
}
function fill(){
  [0, 1, 2].forEach(function(r4){
    cands[r4].forEach(function(c){
      if (taken.length >= WANT || countRow(r4) >= QUOTA[r4]) return;
      add(c.x, c.y, "lane");
    });
  });
  /* anything the quotas could not place goes wherever it still fits */
  [2, 1, 0].forEach(function(r5){
    cands[r5].forEach(function(c){
      if (taken.length >= WANT) return;
      add(c.x, c.y, "lane");
    });
  });
}
PASS = 1; fill();     // every site that can hold any building in its row
PASS = 2; fill();     // then the small class into the gaps between them
PASS = 0;

/* ---- 6. order, row, width, and the gate -------------------------- */

var plots = taken.map(function(t){
  return { x: +t.x.toFixed(3), y: +t.y.toFixed(3), w: +t.w.toFixed(3),
           gw: t.gw, row: t.row, from: t.from, pin: t.pin, isPad: t.isPad,
           /* `pad: 1` is the flag js/village.js reads to decide whether a
              building that needs a landing may stand here, and it is now
              simply "this plot was cut with the compound's hull". It has
              to be the same fact, not a second test agreeing with the
              first: the width and the ground line were solved for a
              compound, so anything else standing here is the wrong size
              and floating. `cover` — how much of the sprite's ground band
              really falls on painted clearing — is carried for the report
              and checked below, where a bad one is worth seeing rather
              than worth silently downgrading. */
           /* `hw`/`dp` — the ground this plot was reserved, in plot
              widths, and only when that is less than its row's full
              union. js/village.js reads them as a ceiling on which
              buildings may stand here. Absent means "the whole row is
              welcome", which is most plots. */
           hw: t.hw || 0, dp: t.dp || 0,
           cover: t.pad || 0, pad: t.isPad ? 1 : 0 };
});

function d2(pp, ax, ay){ return (pp.x - ax) * (pp.x - ax) + (pp.y - ay) * (pp.y - ay); }

var gi = -1;
plots.forEach(function(pp, i2){ if (pp.pin) gi = i2; });
var gate = gi >= 0 ? plots.splice(gi, 1)[0] : null;

/* build order tells the story: first roof in the middle of the field,
   the gate second, then outward from the centre as the village grows */
plots.sort(function(a4, b5){ return d2(a4, 0.5, 0.72) - d2(b5, 0.5, 0.72); });
var ordered = [];
if (plots.length) ordered.push(plots.shift());
if (gate) ordered.push(gate);
ordered = ordered.concat(plots);

/* ---- 7. report --------------------------------------------------- */

console.log("plate " + W + "x" + H + "   shrink " + SHRINK.toFixed(2) +
            "   row widths " + ROW_W.map(function(w2){ return w2.toFixed(3); }).join("/") +
            "\nground hulls (half-width x depth, in plot widths): rows " +
            FOOT.map(function(f){
              return f.max.toFixed(2) + "x" + f.depth.toFixed(2);
            }).join("/") + "   landing " +
            PAD_FOOT.max.toFixed(2) + "x" + PAD_FOOT.depth.toFixed(2) +
            "\n              small class " +
            FOOT_N.map(function(f){
              return f.max.toFixed(2) + "x" + f.depth.toFixed(2);
            }).join("/") + " = " +
            smallOf(0).map(function(t){ return t.file.replace(/^b-|\.png$/g, ""); })
              .join(", "));
console.log("pale paint: " + padN + "px of clearing, " + laneN + "px of footpath   (" +
            padTried + " clearings found, " + onClearings + " built on)");
console.log("plots: " + ordered.length + "/" + WANT +
            "   row counts " + [0, 1, 2].map(function(r6){
              return ordered.filter(function(t){ return t.row === r6; }).length;
            }).join("/") + "   quota " + QUOTA.join("/") +
            "   (" + ordered.filter(function(t){ return t.hw; }).length +
            " reserved for the small class only)\n");
console.log("clearings found (x, ground y, core px, inscribed r, wide-to-tall):");
blobs.forEach(function(b7){
  console.log("   " + b7.x.toFixed(3) + "  " + b7.y.toFixed(3) + "  " +
    String(b7.n).padStart(5) + "px  r=" + b7.r.toFixed(0).padStart(3) +
    "  aspect " + b7.aspect.toFixed(2) + "  " + String(b7.wpx).padStart(3) + "px wide" +
    (b7.built ? "   BUILT" : ""));
});
console.log("");
/* A landing whose compound is not actually standing on the paint is the
   bug VEN circled in red, and it used to be caught by quietly clearing
   the flag — which left the plot cut to compound proportions with a hut
   on it, trading a visible fault for an invisible one. Say it instead. */
var thin = ordered.filter(function(pp){
  return pp.pad && pp.cover < PAD_COVER;
});
if (thin.length){
  console.log("!! " + thin.length + " landing(s) below " +
    Math.round(PAD_COVER * 100) + "% cover — the compound is off its paint:");
  thin.forEach(function(pp){
    console.log("     " + pp.x.toFixed(3) + "," + pp.y.toFixed(3) +
                "  " + Math.round(pp.cover * 100) + "%");
  });
  console.log("");
}
console.log("rejected: " + (Object.keys(rejects).length
  ? Object.keys(rejects).sort().map(function(k){ return k + " x" + rejects[k]; }).join("   ")
  : "nothing") + "\n");
console.log("  #   x      y      row  w      footprint  on-pad  source");
ordered.forEach(function(pp, i3){
  console.log("  " + String(i3 + 1).padStart(2) + "  " +
    pp.x.toFixed(3) + "  " + pp.y.toFixed(3) + "   " + pp.row + "  " +
    pp.w.toFixed(3) + "  " + String(Math.round(pp.gw * W)).padStart(6) + "px  " +
    String(Math.round(pp.cover * 100)).padStart(3) + "%  " +
    pp.from + (pp.pad ? "  LANDING" : "") + (pp.pin ? "   <- " + pp.pin : ""));
});

var body = ordered.map(function(pp){
  return "    { x: " + pp.x.toFixed(3).replace(/^0/, "") +
         ", y: " + pp.y.toFixed(3).replace(/^0/, "") +
         ", w: " + pp.w.toFixed(3).replace(/^0/, "") +
         ", row: " + pp.row +
         (pp.hw ? ", hw: " + pp.hw.toFixed(2).replace(/^0/, "") +
                  ", dp: " + pp.dp.toFixed(2).replace(/^0/, "") : "") +
         (pp.pad ? ", pad: 1" : "") +
         (pp.pin ? ", pin: \"" + pp.pin + "\"" : "") + " }";
}).join(",\n");
var arr = "  var PLOTS = [\n" + body + "\n  ];";
console.log("\n" + arr);

/* ---- 8. debug overlay -------------------------------------------- */

var out = Buffer.alloc(N * 3);
for (var qq = 0; qq < N; qq++)
  for (var c2 = 0; c2 < 3; c2++) out[qq * 3 + c2] = img.data[qq * ch + c2];

/* the two pale masks, so a clearing misread as a lane is visible rather
   than inferred: footpaths go magenta, clearings go cyan */
for (var qz = 0; qz < N; qz++){
  var iz = qz * 3;
  if (lane[qz]){
    out[iz] = Math.min(255, out[iz] * 0.55 + 140);
    out[iz + 1] = out[iz + 1] * 0.45;
    out[iz + 2] = Math.min(255, out[iz + 2] * 0.55 + 110);
  } else if (padMask[qz] && earth[qz]){
    out[iz] = out[iz] * 0.45;
    out[iz + 1] = Math.min(255, out[iz + 1] * 0.55 + 110);
    out[iz + 2] = Math.min(255, out[iz + 2] * 0.55 + 130);
  }
}
/* the envelope, so a bad edge is visible rather than inferred */
for (var yE = y0; yE < y1; yE++){
  if (lo[yE] < 0) continue;
  [lo[yE], hi[yE]].forEach(function(xE){
    var iE = (yE * W + xE) * 3;
    out[iE] = 250; out[iE + 1] = 210; out[iE + 2] = 120;
  });
}
function px(xx, yy, col){
  xx = Math.round(xx); yy = Math.round(yy);
  if (xx < 0 || yy < 0 || xx >= W || yy >= H) return;
  for (var c3 = 0; c3 < 3; c3++) out[(yy * W + xx) * 3 + c3] = col[c3];
}
function rect(x0, y0b, x1, y1b, col){
  for (var xx = x0; xx <= x1; xx++){ px(xx, y0b, col); px(xx, y1b, col); }
  for (var yy = y0b; yy <= y1b; yy++){ px(x0, yy, col); px(x1, yy, col); }
}
function ring(cx3, cy3, r7, col){
  for (var dy = -r7; dy <= r7; dy++) for (var dx = -r7; dx <= r7; dx++){
    var dd = dx * dx + dy * dy;
    if (dd > r7 * r7 || dd < (r7 - 2) * (r7 - 2)) continue;
    px(cx3 + dx, cy3 + dy, col);
  }
}
ordered.forEach(function(pp, i4){
  var col = pp.pin ? [205, 35, 35]
          : i4 === 0 ? [30, 80, 205]
          : pp.from === "clearing" ? [20, 20, 20] : [120, 70, 160];
  var f2 = footprint(pp.x, pp.y, pp.w, pp.row, pp.isPad, !!pp.hw);
  f2.strips.forEach(function(s){
    rect(Math.round(s.x0), Math.round(s.y0), Math.round(s.x1), Math.round(s.y1), col);
  });
  ring(pp.x * W, pp.y * H, 5, col);
});
/* every clearing the plate carries, built on or not — the whole point
   of VEN's fourth complaint is spots that got left empty */
blobs.forEach(function(b6){
  ring(b6.x * W, b6.y * H, 16, [250, 190, 40]);
});
fs.writeFileSync(path.join(__dirname, "plots-debug.png"), png.encode(W, H, 3, 2, out));

/* ---- 8b. the rejection map --------------------------------------- */

var rej = Buffer.alloc(N * 3);
for (var qr = 0; qr < N; qr++){
  /* the plate, greyed and lightened, so the dots read on top of it */
  var L = 0.299 * img.data[qr * ch] + 0.587 * img.data[qr * ch + 1] +
          0.114 * img.data[qr * ch + 2];
  var g2 = Math.round(190 + L * 0.22);
  rej[qr * 3] = rej[qr * 3 + 1] = rej[qr * 3 + 2] = g2 > 255 ? 255 : g2;
}
rejectPts.forEach(function(r){
  var col = REJECT_COL[r.why] || [0, 0, 0];
  var xx = Math.round(r.x * W), yy = Math.round(r.y * H);
  if (xx < 0 || yy < 0 || xx >= W || yy >= H) return;
  var i2 = (yy * W + xx) * 3;
  for (var c4 = 0; c4 < 3; c4++) rej[i2 + c4] = col[c4];
});
ordered.forEach(function(pp){
  ring(pp.x * W, pp.y * H, 9, [10, 10, 10]);   // draws into `out`, not `rej`
});
ordered.forEach(function(pp){
  for (var dy2 = -9; dy2 <= 9; dy2++) for (var dx2 = -9; dx2 <= 9; dx2++){
    var dd2 = dx2 * dx2 + dy2 * dy2;
    if (dd2 > 81 || dd2 < 36) continue;
    var xx2 = Math.round(pp.x * W + dx2), yy2 = Math.round(pp.y * H + dy2);
    if (xx2 < 0 || yy2 < 0 || xx2 >= W || yy2 >= H) continue;
    var i3 = (yy2 * W + xx2) * 3;
    rej[i3] = 10; rej[i3 + 1] = 10; rej[i3 + 2] = 10;
  }
});
fs.writeFileSync(path.join(__dirname, "plots-reject.png"), png.encode(W, H, 3, 2, rej));
console.log("wrote tools/plots-reject.png   every candidate that was turned down," +
            " coloured by which test did it:\n  " +
            Object.keys(REJECT_COL).map(function(k3){
              return k3 + " rgb(" + REJECT_COL[k3].join(",") + ")";
            }).join("   ") + "\n  black rings = the plots that were kept");
console.log("\nwrote tools/plots-debug.png   magenta = footpath (keep clear)," +
            " cyan = painted clearing,\n  boxes are real footprints:" +
            " black = on a clearing, purple = along a lane," +
            " blue = first roof, red = the gate");

/* ---- 9. optional patch ------------------------------------------- */

if (process.argv.indexOf("--write") >= 0){
  var re = /  var PLOTS = \[[\s\S]*?\n  \];/;
  if (!re.test(SRC)) throw new Error("could not find the PLOTS array in js/village.js");
  fs.writeFileSync(ENGINE, SRC.replace(re, arr));
  console.log("patched js/village.js");
}
