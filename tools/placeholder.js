/* ================================================================
   Placeholder village art —  node tools/placeholder.js

   Writes art/village/field.png plus the six b-*.png buildings so the
   layer engine in js/village.js can be built and verified BEFORE the
   Recraft art exists. They are deliberately crude: flat washes, right
   silhouette, real alpha. Nobody should ever ship these.

   Overwrite them with the real exports (art/village/PROMPTS.md) and
   nothing in the site needs to change — same filenames, same anchor
   (each building stands on the bottom edge of its own canvas).

   No dependencies: a minimal PNG writer over zlib.
================================================================= */

var zlib = require("zlib");
var fs   = require("fs");
var path = require("path");

var OUT = path.join(__dirname, "..", "art", "village");

/* ---- minimal PNG writer ---------------------------------------- */

var CRC = (function(){
  var t = new Int32Array(256), c, n, k;
  for (n = 0; n < 256; n++){
    c = n;
    for (k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf){
  var c = -1, i;
  for (i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data){
  var len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  var body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  var crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(w, h, rgba){
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // colour type: RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  /* one filter byte (0 = none) per scanline */
  var raw = Buffer.alloc(h * (w * 4 + 1)), y;
  for (y = 0; y < h; y++){
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy
      ? rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
      : Buffer.from(rgba.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

/* ---- a tiny raster surface ------------------------------------- */

function Surface(w, h){
  this.w = w; this.h = h;
  this.px = Buffer.alloc(w * h * 4);   // zeroed => fully transparent
}

Surface.prototype.blend = function(x, y, c, a){
  if (x < 0 || y < 0 || x >= this.w || y >= this.h || a <= 0) return;
  var p = (y * this.w + x) * 4, px = this.px;
  var dst = px[p + 3] / 255, src = a;
  var out = src + dst * (1 - src);
  if (out <= 0){ px[p + 3] = 0; return; }
  px[p]     = (c[0] * src + px[p]     * dst * (1 - src)) / out;
  px[p + 1] = (c[1] * src + px[p + 1] * dst * (1 - src)) / out;
  px[p + 2] = (c[2] * src + px[p + 2] * dst * (1 - src)) / out;
  px[p + 3] = out * 255;
};

Surface.prototype.rect = function(x0, y0, w, h, c, a){
  var x, y;
  for (y = Math.round(y0); y < Math.round(y0 + h); y++)
    for (x = Math.round(x0); x < Math.round(x0 + w); x++) this.blend(x, y, c, a);
};

/* even-odd scanline polygon fill, 3x vertical supersample for edges */
Surface.prototype.poly = function(pts, c, a){
  var minY = Infinity, maxY = -Infinity, i;
  for (i = 0; i < pts.length; i++){
    if (pts[i][1] < minY) minY = pts[i][1];
    if (pts[i][1] > maxY) maxY = pts[i][1];
  }
  var y0 = Math.max(0, Math.floor(minY)), y1 = Math.min(this.h - 1, Math.ceil(maxY));
  var cov = new Float32Array(this.w), y, s, sy, xs, j, k, x, from, to;
  for (y = y0; y <= y1; y++){
    cov.fill(0);
    for (s = 0; s < 3; s++){
      sy = y + (s + 0.5) / 3;
      xs = [];
      for (i = 0, j = pts.length - 1; i < pts.length; j = i++){
        if ((pts[i][1] > sy) !== (pts[j][1] > sy)){
          xs.push(pts[i][0] + (sy - pts[i][1]) / (pts[j][1] - pts[i][1]) * (pts[j][0] - pts[i][0]));
        }
      }
      xs.sort(function(p, q){ return p - q; });
      for (k = 0; k + 1 < xs.length; k += 2){
        from = Math.max(0, Math.ceil(xs[k] - 0.5));
        to   = Math.min(this.w - 1, Math.floor(xs[k + 1] - 0.5));
        for (x = from; x <= to; x++) cov[x] += 1 / 3;
      }
    }
    for (x = 0; x < this.w; x++) if (cov[x] > 0) this.blend(x, y, c, a * Math.min(1, cov[x]));
  }
};

/* ---- shapes ---------------------------------------------------- */

function bez(p0, p1, p2, p3, t){
  var m = 1 - t;
  return m*m*m*p0 + 3*m*m*t*p1 + 3*m*t*t*p2 + t*t*t*p3;
}

/* the same hanok silhouette js/village.js draws, sampled to a polygon */
function roofPoly(x, y, w, h, lift){
  var l = x, r = x + w, pts = [], i, t, N = 26;
  function seg(ax, ay, bx, by, cx, cy, dx, dy){
    for (i = 0; i <= N; i++){
      t = i / N;
      pts.push([bez(ax, bx, cx, dx, t), bez(ay, by, cy, dy, t)]);
    }
  }
  seg(l, y + h - lift, l + w*.28, y + h*1.04, r - w*.28, y + h*1.04, r, y + h - lift);
  seg(r, y + h - lift, r - w*.08, y + h*.5, r - w*.12, y + h*.2, r - w*.2, y);
  seg(r - w*.2, y, r - w*.34, y + h*.12, l + w*.34, y + h*.12, l + w*.2, y);
  seg(l + w*.2, y, l + w*.12, y + h*.2, l + w*.08, y + h*.5, l, y + h - lift);
  return pts;
}

var INK   = [33, 27, 17];
var PAPER = [235, 221, 185];
var PINE  = [92, 102, 72];

/* ---- the six buildings ----------------------------------------- */

/* Each is drawn in a 512x512 box, standing on the BOTTOM EDGE — that
   is the contract the engine relies on (a plot's y is the ground line,
   and .v-house is anchored bottom-centre). Keep it if you redraw. */

function building(kind){
  var S = new Surface(512, 512), g = 500;   // ground line, a little padding

  function bay(cx, w, wallH, roofW, roofH){
    var x = cx - w / 2, top = g - wallH;
    S.rect(x, top, w, wallH, PAPER, 1);
    S.rect(x, top, w, 3, INK, .8);
    S.rect(x, g - 4, w, 4, INK, .55);
    S.rect(x - 1, top, 3, wallH, PINE, .85);
    S.rect(x + w - 2, top, 3, wallH, PINE, .85);
    S.rect(cx - w * .5 + w * .5 - 2, top, 3, wallH, PINE, .4);
    /* bracket band */
    S.rect(x - 6, top - 8, w + 12, 8, PINE, .6);
    /* roof */
    S.poly(roofPoly(cx - roofW / 2, top - 8 - roofH, roofW, roofH, roofH * .4), INK, .78);
    S.rect(cx - roofW * .38, top - 8 - roofH - 2, roofW * .76, 5, INK, .95);
  }

  if (kind === "house"){
    bay(256, 190, 120, 260, 62);
    S.rect(232, 430, 46, 70, INK, .5);
  } else if (kind === "lhouse"){
    bay(160, 150, 96, 210, 52);
    bay(320, 175, 130, 240, 58);
    S.rect(300, 420, 42, 80, INK, .5);
  } else if (kind === "pavilion"){
    var top = g - 130;
    S.rect(150, g - 30, 212, 26, PAPER, 1);
    S.rect(150, g - 32, 212, 4, INK, .8);
    [166, 236, 306, 350].forEach(function(px){ S.rect(px, top, 9, 100, PINE, .95); });
    S.rect(150, top - 8, 212, 8, PINE, .6);
    S.poly(roofPoly(120, top - 8 - 64, 272, 64, 26), INK, .78);
    S.rect(190, top - 74, 132, 5, INK, .95);
  } else if (kind === "walled"){
    bay(268, 170, 112, 236, 58);
    /* boundary wall in front */
    S.rect(96, g - 46, 330, 42, PAPER, 1);
    S.rect(96, g - 50, 330, 6, INK, .7);
    S.rect(96, g - 4, 330, 4, INK, .5);
  } else if (kind === "thatch"){
    var x = 256, w = 175, wallH = 104, top2 = g - wallH;
    S.rect(x - w / 2, top2, w, wallH, PAPER, 1);
    S.rect(x - w / 2, top2, w, 3, INK, .8);
    /* rounded straw roof — a squat dome, not a tiled ridge */
    var pts = [], i, t;
    for (i = 0; i <= 40; i++){
      t = Math.PI * (i / 40);
      pts.push([x - 128 * Math.cos(t), top2 + 10 - 76 * Math.sin(t)]);
    }
    pts.push([x + 128, top2 + 14], [x - 128, top2 + 14]);
    S.poly(pts, INK, .58);
    S.rect(238, 440, 40, 60, INK, .5);
  } else if (kind === "gate"){
    var cx = 256, top3 = g - 168;
    S.rect(cx - 96, g - 150, 22, 150, PINE, .95);
    S.rect(cx + 74, g - 150, 22, 150, PINE, .95);
    S.rect(cx - 100, g - 168, 200, 20, PAPER, 1);
    S.rect(cx - 100, g - 170, 200, 5, INK, .8);
    S.poly(roofPoly(cx - 150, top3 - 62, 300, 58, 24), INK, .78);
    S.rect(cx - 110, top3 - 68, 220, 5, INK, .95);
    S.rect(cx - 74, g - 148, 148, 148, INK, .35);
  }

  /* ground shadow, so the engine's contact treatment can be judged */
  var i2;
  for (i2 = 0; i2 < 14; i2++){
    S.rect(256 - 150 + i2 * 2, g - 2 + i2 * 0.6, 300 - i2 * 4, 2, INK, .05 * (1 - i2 / 14));
  }
  return S;
}

/* ---- the base plate -------------------------------------------- */

function plate(){
  var W = 1820, H = 1024, S = new Surface(W, H), x, y;

  /* parchment, warmer toward the bottom */
  for (y = 0; y < H; y++){
    var t = y / H;
    var c = [223 - t * 14, 206 - t * 16, 165 - t * 18];
    for (x = 0; x < W; x++) S.blend(x, y, c, 1);
  }

  /* two mist-faded ranges across the top third */
  function range(baseY, amp, freq, alpha, seed){
    /* close the silhouette a little below its own crest, not at the
       bottom of the canvas — filling to H tints the whole lower field
       and leaves a hard step where the mist stops painting over it */
    var foot = baseY + 150, pts = [[0, foot], [0, baseY]], i, xx;
    for (i = 0; i <= 60; i++){
      xx = W * i / 60;
      pts.push([xx, baseY
        - amp * Math.sin(xx * freq + seed)
        - amp * .55 * Math.sin(xx * freq * 2.3 + seed * 1.7)]);
    }
    pts.push([W, baseY], [W, foot]);
    S.poly(pts, INK, alpha);
  }
  range(360, 78, 0.0042, .07, 1.1);
  range(430, 54, 0.0061, .06, 3.4);

  /* mist: paint the paper back over the base of the hills */
  for (y = 300; y < 560; y++){
    var m = (y - 300) / 260;
    for (x = 0; x < W; x++) S.blend(x, y, [223, 206, 165], m * .82);
  }

  /* ground contour lines */
  [620, 760, 910].forEach(function(gy, i){
    for (x = 0; x < W; x++){
      var yy = Math.round(gy + Math.sin(x * 0.0016 + i) * 12);
      S.blend(x, yy, INK, .14 - i * .02);
      S.blend(x, yy + 1, INK, .09 - i * .015);
    }
  });

  /* worn footpath entering bottom-centre */
  for (y = 700; y < H; y++){
    var u = (y - 700) / (H - 700);
    var cx = W * 0.5 + Math.sin(u * 2) * 26;
    var hw = 8 + u * 42;
    for (x = Math.round(cx - hw); x < cx + hw; x++){
      S.blend(x, y, [238, 226, 196], .5 * (1 - Math.abs(x - cx) / hw));
    }
  }

  /* a pine cluster left, rocks right — placeholders for the real art */
  [[190, 940, 150], [268, 900, 96]].forEach(function(p){
    S.rect(p[0] - 6, p[1] - p[2], 12, p[2], INK, .7);
    var i;
    for (i = 0; i < 4; i++){
      var ty = p[1] - p[2] * (.5 + i * .17), tw = (p[2] * .62) * (1 - i * .16);
      S.poly([[p[0] - tw / 2, ty], [p[0], ty - tw * .42], [p[0] + tw / 2, ty],
              [p[0], ty + tw * .12]], PINE, .82);
    }
  });
  S.poly([[1610, 960], [1650, 905], [1706, 918], [1730, 960]], INK, .3);
  S.poly([[1700, 962], [1738, 922], [1782, 936], [1796, 962]], INK, .22);

  return S;
}

/* ---- write ------------------------------------------------------ */

fs.mkdirSync(OUT, { recursive: true });

var jobs = [["field.png", plate()]];
["house", "lhouse", "pavilion", "walled", "thatch", "gate"].forEach(function(k){
  jobs.push(["b-" + k + ".png", building(k)]);
});

jobs.forEach(function(j){
  var buf = encodePNG(j[1].w, j[1].h, j[1].px);
  fs.writeFileSync(path.join(OUT, j[0]), buf);
  console.log(j[0].padEnd(16), j[1].w + "x" + j[1].h, (buf.length / 1024).toFixed(0) + "KB");
});
console.log("\nPlaceholders written to art/village/. Overwrite with the real exports.");
