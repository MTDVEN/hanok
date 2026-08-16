/* ================================================================
   refmat.js — mat the reference crops for Recraft.

   VEN's Recraft plan does not include custom styles (2026-08-14), so
   the per-generation image reference is now the ONLY thing holding the
   viewing angle and the key. That makes the quality of those reference
   images matter a lot more than it did.

   `art/village/ref/ref-*.png` are rectangular crops lifted straight out
   of `valley6 (2).png`, so each one is a hard-edged box of valley with a
   building in the middle. Two problems with feeding that to a reference:
   the box edge is a rectangle the model can copy, and the ground in the
   corners is exactly the "attached scenery" fault we are trying to
   avoid.

   This writes `art/village/ref/matted/ref-*.png`: the same crop, floated
   on a flat mid-grey 1024 square and feathered at its edges so no
   rectangle survives. Mid grey because that is the same fallback ground
   the prompts ask for — a colour no part of a hanok uses, so nothing
   about it reads as scenery.

   The important part is FILL. Each crop is scaled so it occupies
   exactly the fraction of the frame its own prompt asks for, so the
   reference and the wording describe the same composition instead of
   pulling against each other. Matting them all at one margin put the
   house at ~60% of frame against a prompt asking for 30%, and a
   reference wins that argument every time.

   Nothing here touches the originals. `node tools/refmat.js`
================================================================= */

var fs   = require("fs");
var path = require("path");
var png  = require("./png.js");

var SRC   = path.join(__dirname, "..", "art", "village", "ref");
var OUT   = path.join(SRC, "matted");

var SIDE    = 1024;  // square, same canvas the generations run at
var FEATHER = 0.10;  // of the scaled crop's shortest side
var GREY    = 128;

/* frame fill per building, straight out of art/village/PROMPTS.md §3 */
var FILL = {
  "ref-house.png":    0.30,
  "ref-house2.png":   0.30,
  "ref-gate.png":     0.36,
  "ref-thatch.png":   0.28,
  "ref-pavilion.png": 0.25,
  "ref-lhouse.png":   0.46
};

/* bilinear upscale, RGB in / RGB out */
function scale(img, f){
  var w = Math.round(img.w * f), h = Math.round(img.h * f);
  var out = Buffer.alloc(w * h * 3), x, y, c;
  for (y = 0; y < h; y++){
    var sy = Math.min(img.h - 1.0001, (y + 0.5) / f - 0.5);
    if (sy < 0) sy = 0;
    var y0 = Math.floor(sy), y1 = Math.min(img.h - 1, y0 + 1), fy = sy - y0;
    for (x = 0; x < w; x++){
      var sx = Math.min(img.w - 1.0001, (x + 0.5) / f - 0.5);
      if (sx < 0) sx = 0;
      var x0 = Math.floor(sx), x1 = Math.min(img.w - 1, x0 + 1), fx = sx - x0;
      for (c = 0; c < 3; c++){
        var a = img.data[(y0 * img.w + x0) * img.ch + c],
            b = img.data[(y0 * img.w + x1) * img.ch + c],
            d = img.data[(y1 * img.w + x0) * img.ch + c],
            e = img.data[(y1 * img.w + x1) * img.ch + c];
        var top = a + (b - a) * fx, bot = d + (e - d) * fx;
        out[(y * w + x) * 3 + c] = Math.round(top + (bot - top) * fy);
      }
    }
  }
  return { w: w, h: h, ch: 3, data: out };
}

/* 0..1 ramp: 0 at the crop's outer edge, 1 once `f` px inside it */
function edgeAlpha(x, y, w, h, f){
  if (f <= 0) return 1;
  var d = Math.min(x, y, w - 1 - x, h - 1 - y) / f;
  if (d >= 1) return 1;
  if (d <= 0) return 0;
  return d * d * (3 - 2 * d);          // smoothstep — a linear ramp still reads as a line
}

function mat(file){
  var img = png.decode(fs.readFileSync(path.join(SRC, file)));
  if (img.ch < 3) throw new Error(file + ": expected an RGB crop");

  var fill = FILL[file] || 0.30;
  var s = scale(img, (SIDE * fill) / img.w);
  var ox = Math.round((SIDE - s.w) / 2),
      oy = Math.round((SIDE - s.h) / 2);
  var f  = Math.round(Math.min(s.w, s.h) * FEATHER);

  var out = Buffer.alloc(SIDE * SIDE * 3, GREY);
  for (var y = 0; y < s.h; y++){
    for (var x = 0; x < s.w; x++){
      var a = edgeAlpha(x, y, s.w, s.h, f);
      if (a <= 0) continue;
      var si = (y * s.w + x) * 3, di = ((y + oy) * SIDE + (x + ox)) * 3;
      for (var c = 0; c < 3; c++){
        out[di + c] = Math.round(s.data[si + c] * a + GREY * (1 - a));
      }
    }
  }

  fs.writeFileSync(path.join(OUT, file), png.encode(SIDE, SIDE, 3, 2, out));
  return Math.round(fill * 100) + "% fill, " + s.w + "x" + s.h + " on " + SIDE;
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

fs.readdirSync(SRC)
  .filter(function(f){ return /^ref-.*\.png$/.test(f); })
  .forEach(function(f){
    console.log("  " + f.padEnd(20) + mat(f));
  });

console.log("\nmatted -> art/village/ref/matted/  (originals untouched)");
