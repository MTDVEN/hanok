/* ================================================================
   render.js — draw the village exactly as the page draws it, headless.
                node tools/render.js [roofs] [out.png]

   A QA preview, not part of the site. tools/qa-frame.html and a real
   browser are still the truth; this exists because checking a placement
   change should not cost a page load, a scroll, a wait for nine
   megabytes of PNG to decode and a screenshot that half the time comes
   back as a blank frame because the compositor has not caught up.

   It reads PLOTS and TYPES OUT OF js/village.js by regex rather than
   keeping its own copy. That is deliberate: a second copy of the plot
   table would drift from the real one within a day, and then this tool
   would be confidently drawing the wrong village. Only the small
   deterministic core — the hash, the RNG, assign() and flipped() — is
   ported, and those are the parts that must never change silently.

   Everything else follows js/village.js: bottom-centre anchoring, the
   ROW_W width, the per-type scale, cropY into the shipped band, the
   painter's-order sort by y, and the row haze.
================================================================= */

var fs   = require("fs");
var path = require("path");
var png  = require("./png.js");

var ROOT = path.join(__dirname, "..");
var DIR  = path.join(ROOT, "art", "village");
var SRC  = fs.readFileSync(path.join(ROOT, "js", "village.js"), "utf8");

var ROOFS = parseInt(process.argv[2], 10);
if (isNaN(ROOFS)) ROOFS = 20;
var OUT = process.argv[3] || path.join(__dirname, "render.png");

/* ---- lift the tables out of the engine --------------------------- */

function lift(name){
  var m = new RegExp("var " + name + " = (\\[[\\s\\S]*?\\n  \\]);").exec(SRC);
  if (!m) throw new Error("could not find " + name + " in js/village.js");
  /* the arrays are plain object literals with unquoted keys — Function
     is the honest way to read them and this is a dev tool reading a
     file from its own repo, not untrusted input */
  return Function("return " + m[1])();
}
var PLOTS = lift("PLOTS");
var TYPES = lift("TYPES");

var cm = /"field":\s*\[([\d.]+),\s*([\d.]+)\]/.exec(SRC);
var CROP = cm ? [parseFloat(cm[1]), parseFloat(cm[2])] : [0.3, 1];
function cropY(y){ return (y - CROP[0]) / (CROP[1] - CROP[0]); }

var sm = /var SEED = hash32\(String\(raw\("seed"\) \|\|\s*CFG\.seed \|\|/.exec(SRC);
var SEED_STR = process.argv.indexOf("--seed") >= 0
  ? process.argv[process.argv.indexOf("--seed") + 1] : "hanok";

/* ---- the deterministic core, ported verbatim --------------------- */

function hash32(str){
  var h = 2166136261 >>> 0, i;
  for (i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function rnd(seed){
  var t = (seed + 0x6D2B79F5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
  t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
var SEED = hash32(SEED_STR);
/* lifted, not copied — this is exactly the kind of constant that drifts */
var pm = /var padPref = ([\d.]+);/.exec(SRC);
var PAD_PREF = pm ? parseFloat(pm[1]) : 0.55;
/* likewise the default ground band, and with it the size test a plot's
   `hw`/`dp` applies — see the engine's ground()/fitsPlot() */
var bm = /var BAND = (\[\[[\s\S]*?\]\]);/.exec(SRC);
var BAND = bm ? Function("return " + bm[1])() : [[0, 0.22, 0.42]];
function ground(t){
  var s = t.scale || 1, b = t.band || BAND;
  return { hw: b.reduce(function(m, k){ return Math.max(m, k[2]); }, 0) * s,
           dp: b[b.length - 1][1] * s };
}
function fitsPlot(t, p){
  if (!p.hw) return true;
  var g = ground(t);
  return g.hw <= p.hw + 1e-6 && g.dp <= p.dp + 1e-6;
}

function assign(pool){
  var order = PLOTS.map(function(_, i){ return i; }).sort(function(a, b){
    return PLOTS[a].row - PLOTS[b].row || PLOTS[a].x - PLOTS[b].x;
  });
  var out = [], prev = null, prevRow = -1;
  order.forEach(function(i){
    if (PLOTS[i].pin){
      var pinned = pool.filter(function(t){ return t.file === PLOTS[i].pin; })[0];
      if (pinned){ out[i] = pinned; return; }
    }
    var fits = pool.filter(function(t){ return !t.pad || PLOTS[i].pad; });
    var room = fits.filter(function(t){ return fitsPlot(t, PLOTS[i]); });
    if (room.length) fits = room;
    var ok = fits.filter(function(t){ return t.rows.indexOf(PLOTS[i].row) >= 0; });
    if (!ok.length) ok = fits.filter(function(t){ return t.rows.length; });
    if (!ok.length) ok = fits;
    if (!ok.length) ok = pool;
    var roll = rnd(SEED ^ Math.imul(i + 1, 2654435761));
    var at = Math.floor(roll * ok.length) % ok.length;
    if (ok.length > 1 && PLOTS[i].row === prevRow && ok[at] === prev) at = (at + 1) % ok.length;
    if (PLOTS[i].pad){
      var wants = ok.filter(function(t){ return t.pad; });
      if (wants.length && rnd(SEED ^ Math.imul(i + 7, 2246822519)) < PAD_PREF)
        at = ok.indexOf(wants[Math.floor(roll * wants.length) % wants.length]);
    }
    out[i] = ok[at];
    prev = ok[at];
    prevRow = PLOTS[i].row;
  });
  return out;
}
function flipped(i){ return rnd(SEED ^ Math.imul(i + 101, 40503)) < 0.45; }

/* the CSS filter the page puts on the back rows, in the same order:
   saturate, then contrast, then brightness */
function haze(row){
  var f = [0.24, 0.12, 0][row];
  return { sat: 1 - f * 0.9, con: 1 - f * 0.55, bri: 1 + f * 0.32 };
}

/* ---- draw -------------------------------------------------------- */

var plate = png.decode(fs.readFileSync(path.join(DIR, "field.png")));
var W = plate.w, H = plate.h;
var buf = Buffer.alloc(W * H * 3);
for (var q = 0; q < W * H; q++)
  for (var c = 0; c < 3; c++) buf[q * 3 + c] = plate.data[q * plate.ch + c];

var sprites = {};
var pool = TYPES.filter(function(t){
  var f = path.join(DIR, t.file);
  if (!fs.existsSync(f)) return false;
  sprites[t.file] = png.decode(fs.readFileSync(f));
  return true;
});
if (!pool.length) throw new Error("no building sprites in " + DIR);

var chosen = assign(pool);

/* painter's order — back to front, same sort the page uses */
var order = PLOTS.map(function(_, i){ return i; })
  .sort(function(a, b){ return PLOTS[a].y - PLOTS[b].y; });

var drawn = 0;
order.forEach(function(i){
  if (i >= ROOFS) return;                       // paintArt hides plot >= count
  var p = PLOTS[i], t = chosen[i], img = sprites[t.file];
  if (!img) return;

  var dw = Math.round(p.w * (t.scale || 1) * W);
  var dh = Math.round(dw * img.h / img.w);
  var cx = p.x * W, gy = cropY(p.y) * H;        // ground line
  var ox = Math.round(cx - dw / 2), oy = Math.round(gy - dh);
  var fl = flipped(i), hz = haze(p.row);
  drawn++;

  for (var y = 0; y < dh; y++){
    var ty = oy + y;
    if (ty < 0 || ty >= H) continue;
    for (var x = 0; x < dw; x++){
      var tx = ox + x;
      if (tx < 0 || tx >= W) continue;
      var sx = Math.min(img.w - 1, Math.floor((fl ? dw - 1 - x : x) * img.w / dw));
      var sy = Math.min(img.h - 1, Math.floor(y * img.h / dh));
      var si = (sy * img.w + sx) * img.ch;
      var a  = img.ch === 4 ? img.data[si + 3] / 255 : 1;
      if (a <= 0) continue;

      var rgb = [img.data[si], img.data[si + 1], img.data[si + 2]];
      if (hz.sat !== 1 || hz.con !== 1 || hz.bri !== 1){
        var L = 0.213 * rgb[0] + 0.715 * rgb[1] + 0.072 * rgb[2];
        for (var k = 0; k < 3; k++){
          var v = L + (rgb[k] - L) * hz.sat;          // saturate
          v = (v - 127.5) * hz.con + 127.5;           // contrast
          v = v * hz.bri;                             // brightness
          rgb[k] = v < 0 ? 0 : v > 255 ? 255 : v;
        }
      }
      var di = (ty * W + tx) * 3;
      for (var c2 = 0; c2 < 3; c2++)
        buf[di + c2] = Math.round(rgb[c2] * a + buf[di + c2] * (1 - a));
    }
  }
});

fs.writeFileSync(OUT, png.encode(W, H, 3, 2, buf));
console.log("plate " + W + "x" + H + "   " + drawn + " of " + PLOTS.length +
            " roofs   seed \"" + SEED_STR + "\"   -> " + path.relative(ROOT, OUT));

var tally = {};
PLOTS.forEach(function(_, i){
  if (i >= ROOFS) return;
  tally[chosen[i].file] = (tally[chosen[i].file] || 0) + 1;
});
console.log("  " + Object.keys(tally).sort().map(function(k){
  return k.replace(/^b-|\.png$/g, "") + " x" + tally[k];
}).join("   "));
