/* ================================================================
   patch.js — build the village growth states from a FEW paintings.

     node tools/patch.js valley0.png "valley6 (2).png"
     node tools/patch.js                     (uses MASTERS below)

   THE PROBLEM THIS SOLVES
   Recraft flattens. Every generation repaints the whole frame, so a
   chain of twenty "add one more house" edits slowly drifts into a
   different valley — measured on VEN's own chain: 22.6 mean ΔRGB
   outside the new building at step 0→1, ~10 thereafter, monotone.
   Twenty-one states generated that way would crossfade as "the
   picture changed", not "a house was built".

   THE FIX
   Geometry does not drift. Every 64px tile in VEN's chain matches at
   offset (0,0), start to finish — only surface texture repaints. So
   the new buildings can be cut out and pasted onto the ONE approved
   empty valley, and everything else discarded.

   That means the number of PAINTINGS stops being tied to the number
   of STATES. Two paintings — empty valley and full village — are
   enough to derive every frame in between. Feed it more paintings
   and it just gets more buildings; it never needs one per state.

   HOW
   For each consecutive pair of paintings: RGB-euclidean diff > THRESH
   gives a seed mask; connected components under MIN_AREA are dropped
   (drift is thin scattered line-work and never forms a large blob, a
   building is a solid mass — measured separation margin 4.5-27x);
   each surviving blob is closed, hole-filled, given a collar and
   feathered. Its colour is corrected by the median offset of the
   surrounding annulus, measured AGAINST THE BASE, because the base is
   the plate it will actually be glued to. Then the blobs are ordered
   into a growth story and composited cumulatively.

   Output: state-00.png … state-NN.png as SQUARE masters in the repo
   root. Run `node tools/crop.js` afterwards to cut the shipped band.
================================================================= */

var fs   = require("fs");
var path = require("path");
var png  = require("./png.js");

var ROOT = path.join(__dirname, "..");

/* The paintings, in the order they were made. First one is the empty
   valley and becomes both state-00 and the ground every later
   building is pasted onto. */
var MASTERS = [
  "valley0.png",
  "valley1.png",
  "valley2.png",
  "valley3 (2).png",
  "valley4 (2).png",
  "valley5 (2).png",
  "valley6 (2).png"
];

/* Tuning. These were swept (7 thresholds x 4 denoise radii) against
   VEN's real files; this is the winning configuration and the sweep
   found it on the first pass. Morphological OPENING was tried and
   actively hurts — it fragments the buildings while the drift
   survives — which is why there is no denoise radius here. */
var THRESH   = 70;   // RGB-euclidean distance that counts as changed
var MIN_AREA = 2000; // px; below this it is drift, not a building
var CLOSE_R  = 14;   // seal the gaps inside a building's line-work
var COLLAR_R = 5;    // take a little ground with it, for the shadow
var FEATHER  = 10;   // px of soft edge on the finished mask
var ANN_IN   = 12;   // tone-match annulus, inner offset from the solid
var ANN_OUT  = 40;   // ... and outer

/* ---- small raster helpers --------------------------------------- */

/* Separable dilate/erode with a SQUARE structuring element. Square
   rather than disc because it is O(n·r) instead of O(n·r²) and the
   mask gets feathered afterwards anyway — nobody can see the corners
   through a 10px blur. */
function dilate(m, w, h, r){
  if (r <= 0) return m;
  var tmp = new Uint8Array(w * h), out = new Uint8Array(w * h), x, y, i;
  for (y = 0; y < h; y++){
    for (x = 0; x < w; x++){
      var on = 0;
      for (i = -r; i <= r; i++){
        var xx = x + i;
        if (xx >= 0 && xx < w && m[y * w + xx]){ on = 1; break; }
      }
      tmp[y * w + x] = on;
    }
  }
  for (y = 0; y < h; y++){
    for (x = 0; x < w; x++){
      var on2 = 0;
      for (i = -r; i <= r; i++){
        var yy = y + i;
        if (yy >= 0 && yy < h && tmp[yy * w + x]){ on2 = 1; break; }
      }
      out[y * w + x] = on2;
    }
  }
  return out;
}

function erode(m, w, h, r){
  var inv = new Uint8Array(w * h), i;
  for (i = 0; i < m.length; i++) inv[i] = m[i] ? 0 : 1;
  var d = dilate(inv, w, h, r);
  var out = new Uint8Array(w * h);
  for (i = 0; i < d.length; i++) out[i] = d[i] ? 0 : 1;
  return out;
}

/* anything not reachable from the border is inside the building */
function fillHoles(m, w, h){
  var seen = new Uint8Array(w * h), stack = [], x, y;
  for (x = 0; x < w; x++){ stack.push(x); stack.push((h - 1) * w + x); }
  for (y = 0; y < h; y++){ stack.push(y * w); stack.push(y * w + w - 1); }
  while (stack.length){
    var p = stack.pop();
    if (seen[p] || m[p]) continue;
    seen[p] = 1;
    var px = p % w, py = (p - px) / w;
    if (px > 0)     stack.push(p - 1);
    if (px < w - 1) stack.push(p + 1);
    if (py > 0)     stack.push(p - w);
    if (py < h - 1) stack.push(p + w);
  }
  var out = new Uint8Array(w * h), i;
  for (i = 0; i < m.length; i++) out[i] = (m[i] || !seen[i]) ? 1 : 0;
  return out;
}

/* box blur on a 0..255 alpha plane, twice — near enough gaussian */
function feather(m, w, h, r){
  var a = new Float32Array(w * h), i;
  for (i = 0; i < m.length; i++) a[i] = m[i] ? 255 : 0;
  var pass = function(src){
    var t = new Float32Array(w * h), x, y, k;
    for (y = 0; y < h; y++){
      var row = y * w, acc = 0;
      for (k = -r; k <= r; k++) acc += src[row + Math.min(w - 1, Math.max(0, k))];
      for (x = 0; x < w; x++){
        t[row + x] = acc / (2 * r + 1);
        acc -= src[row + Math.min(w - 1, Math.max(0, x - r))];
        acc += src[row + Math.min(w - 1, Math.max(0, x + r + 1))];
      }
    }
    var t2 = new Float32Array(w * h);
    for (x = 0; x < w; x++){
      var acc2 = 0;
      for (k = -r; k <= r; k++) acc2 += t[Math.min(h - 1, Math.max(0, k)) * w + x];
      for (y = 0; y < h; y++){
        t2[y * w + x] = acc2 / (2 * r + 1);
        acc2 -= t[Math.min(h - 1, Math.max(0, y - r)) * w + x];
        acc2 += t[Math.min(h - 1, Math.max(0, y + r + 1)) * w + x];
      }
    }
    return t2;
  };
  return pass(pass(a));
}

/* 4-connected labelling, returns [{px:[indices], x0,y0,x1,y1, area}] */
function components(m, w, h){
  var seen = new Uint8Array(w * h), out = [], i;
  for (i = 0; i < m.length; i++){
    if (!m[i] || seen[i]) continue;
    var stack = [i], px = [], x0 = w, y0 = h, x1 = 0, y1 = 0;
    seen[i] = 1;
    while (stack.length){
      var p = stack.pop();
      px.push(p);
      var cx = p % w, cy = (p - cx) / w;
      if (cx < x0) x0 = cx; if (cx > x1) x1 = cx;
      if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
      var nb = [cx > 0 ? p - 1 : -1, cx < w - 1 ? p + 1 : -1,
                cy > 0 ? p - w : -1, cy < h - 1 ? p + w : -1], k;
      for (k = 0; k < 4; k++){
        var q = nb[k];
        if (q >= 0 && m[q] && !seen[q]){ seen[q] = 1; stack.push(q); }
      }
    }
    out.push({ px: px, x0: x0, y0: y0, x1: x1, y1: y1, area: px.length });
  }
  return out;
}

function median(arr){
  if (!arr.length) return 0;
  arr.sort(function(a, b){ return a - b; });
  return arr[arr.length >> 1];
}

/* ---- find the buildings added between two paintings -------------- */

function newBuildings(base, prev, next){
  var w = prev.w, h = prev.h, ch = prev.ch, n = w * h;
  var seed = new Uint8Array(n), i;
  for (i = 0; i < n; i++){
    var o = i * ch;
    var dr = prev.data[o]     - next.data[o];
    var dg = prev.data[o + 1] - next.data[o + 1];
    var db = prev.data[o + 2] - next.data[o + 2];
    seed[i] = Math.sqrt(dr * dr + dg * dg + db * db) > THRESH ? 1 : 0;
  }

  var blobs = components(seed, w, h).filter(function(c){ return c.area >= MIN_AREA; });

  return blobs.map(function(c){
    var solid = new Uint8Array(n), k;
    for (k = 0; k < c.px.length; k++) solid[c.px[k]] = 1;
    solid = erode(dilate(solid, w, h, CLOSE_R), w, h, CLOSE_R);
    solid = fillHoles(solid, w, h);
    var body = dilate(solid, w, h, COLLAR_R);

    /* Tone: the ground inside the collar comes from `next`, whose
       grass has drifted away from the base's. Measure that drift in
       a ring around the building and subtract it. Measured AGAINST
       THE BASE — using `prev` instead leaves a ~10 luma step once
       more than one painting separates them. */
    var ring = new Uint8Array(n), inner = dilate(solid, w, h, ANN_IN),
        outer = dilate(solid, w, h, ANN_OUT);
    for (k = 0; k < n; k++) ring[k] = (outer[k] && !inner[k]) ? 1 : 0;

    var dr2 = [], dg2 = [], db2 = [];
    for (k = 0; k < n; k++){
      if (!ring[k]) continue;
      var o2 = k * ch;
      dr2.push(next.data[o2]     - base.data[o2]);
      dg2.push(next.data[o2 + 1] - base.data[o2 + 1]);
      db2.push(next.data[o2 + 2] - base.data[o2 + 2]);
    }

    return {
      alpha:  feather(body, w, h, FEATHER),
      offset: [median(dr2), median(dg2), median(db2)],
      src:    next,
      cx:     (c.x0 + c.x1) / 2,
      cy:     (c.y0 + c.y1) / 2,
      area:   c.area,
      box:    [c.x0, c.y0, c.x1, c.y1]
    };
  });
}

/* ---- run --------------------------------------------------------- */

var args = process.argv.slice(2);
var list = args.length ? args : MASTERS;

list.forEach(function(f){
  if (!fs.existsSync(path.join(ROOT, f))){
    console.error("missing: " + f);
    process.exit(1);
  }
});

console.log("paintings: " + list.length);
var imgs = list.map(function(f){ return png.decode(fs.readFileSync(path.join(ROOT, f))); });
var base = imgs[0], w = base.w, h = base.h, ch = base.ch, n = w * h;

imgs.forEach(function(im, i){
  if (im.w !== w || im.h !== h || im.ch !== ch){
    console.error(list[i] + " is " + im.w + "x" + im.h + ", expected " + w + "x" + h);
    process.exit(1);
  }
});

var all = [];
for (var i = 1; i < imgs.length; i++){
  var found = newBuildings(base, imgs[i - 1], imgs[i]);
  console.log("  " + list[i - 1] + " -> " + list[i] + ": " + found.length +
              " building" + (found.length === 1 ? "" : "s") +
              found.map(function(b){ return " [" + b.area + "px]"; }).join(""));
  all = all.concat(found);
}

/* Growth story: the village grows outward from where the footpath
   enters, bottom centre. Order is a code decision now, not a
   consequence of the order they happened to be painted in. */
var ENTRY = [w * 0.5, h];
all.sort(function(a, b){
  var da = Math.hypot(a.cx - ENTRY[0], a.cy - ENTRY[1]);
  var db = Math.hypot(b.cx - ENTRY[0], b.cy - ENTRY[1]);
  return da - db;
});

console.log("\n" + all.length + " buildings -> state-00 .. state-" +
            String(all.length).padStart(2, "0"));

var acc = Buffer.from(base.data);
var name = function(k){ return "state-" + String(k).padStart(2, "0") + ".png"; };
fs.writeFileSync(path.join(ROOT, name(0)), png.encode(w, h, ch, base.ct, acc));
console.log("  " + name(0).padEnd(14) + "(empty valley)");

all.forEach(function(b, k){
  var p;
  for (p = 0; p < n; p++){
    var a = b.alpha[p] / 255;
    if (a <= 0.002) continue;
    var o = p * ch, c;
    for (c = 0; c < 3; c++){
      var v = b.src.data[o + c] - b.offset[c];
      acc[o + c] = Math.max(0, Math.min(255, Math.round(acc[o + c] * (1 - a) + v * a)));
    }
  }
  fs.writeFileSync(path.join(ROOT, name(k + 1)), png.encode(w, h, ch, base.ct, acc));
  console.log("  " + name(k + 1).padEnd(14) + "+building at " +
              Math.round(b.cx) + "," + Math.round(b.cy) +
              "  tone " + b.offset.join("/"));
});

console.log("\nnow run:  node tools/crop.js");
