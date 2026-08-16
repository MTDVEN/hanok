/* ================================================================
   Placeholder state plates —  node tools/fakestates.js

   Writes art/village/state-00.png … state-15.png by compositing the
   extracted sprites (art/village/b-*.png) onto the square valley
   master at the PLOTS positions, then cropping to the field band.

   These are STAND-INS with two jobs:
     1. Prove the states engine (crossfade, fallback, prefetch) in the
        browser before any real art exists.
     2. Show VEN exactly WHERE and HOW BIG to inpaint building N when
        chaining the real states in Recraft: state-07 minus state-06
        is literally the answer to "where does building 7 go".

   VEN's real chained generations replace these files one by one,
   same names. Delete a fake and the engine falls back to the nearest
   lower state — partial replacement is safe at every step.

   The PLOTS/TYPES/SEED tables are duplicated from js/village.js and
   MUST match it, in keeping with the constants every module repeats —
   if you retune there, re-run this.

   No dependencies; codec shared in spirit with tools/extract.js.
================================================================= */

var zlib = require("zlib");
var fs   = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var DIR  = path.join(ROOT, "art", "village");

var MASTER = path.join(DIR, "field-square.png");
var BAND   = [0.410, 1];                     // PLATE_CROP "field"
var PAPER  = [0xDF, 0xCE, 0xA5];

/* ---- MUST match js/village.js ---------------------------------- */

var PLOTS = [
  { x: .585, y: .670, w: .095, row: 1 },
  { x: .500, y: .845, w: .110, row: 2, pin: "b-gate.png" },
  { x: .440, y: .663, w: .095, row: 1 },
  { x: .360, y: .810, w: .125, row: 2 },
  { x: .570, y: .585, w: .070, row: 0 },
  { x: .650, y: .815, w: .125, row: 2 },
  { x: .300, y: .677, w: .095, row: 1 },
  { x: .460, y: .578, w: .070, row: 0 },
  { x: .728, y: .688, w: .095, row: 1 },
  { x: .225, y: .835, w: .125, row: 2 },
  { x: .345, y: .592, w: .070, row: 0 },
  { x: .212, y: .712, w: .090, row: 1 },
  { x: .660, y: .598, w: .070, row: 0 },
  { x: .770, y: .800, w: .115, row: 2 },
  { x: .620, y: .573, w: .070, row: 0 },
  { x: .395, y: .738, w: .100, row: 1 },
  { x: .545, y: .712, w: .095, row: 1 },
  { x: .408, y: .607, w: .072, row: 0 },
  { x: .302, y: .772, w: .115, row: 2 },
  { x: .700, y: .760, w: .110, row: 2 }
];

var TYPES = [
  { file: "b-house.png",    scale: 1.0,  rows: [0, 1, 2] },
  { file: "b-lhouse.png",   scale: 1.35, rows: [1, 2]    },
  { file: "b-pavilion.png", scale: 0.95, rows: [0, 1, 2] },
  { file: "b-walled.png",   scale: 1.5,  rows: [1, 2]    },
  { file: "b-thatch.png",   scale: 1.45, rows: [0, 1]    },
  { file: "b-gate.png",     scale: 1.1,  rows: []        }
];

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
var SEED = hash32("hanok");

function assign(){
  var order = PLOTS.map(function(_, i){ return i; }).sort(function(a, b){
    return PLOTS[a].row - PLOTS[b].row || PLOTS[a].x - PLOTS[b].x;
  });
  var out = [], prev = null, prevRow = -1;
  order.forEach(function(i){
    if (PLOTS[i].pin){
      var pinned = TYPES.filter(function(t){ return t.file === PLOTS[i].pin; })[0];
      if (pinned){ out[i] = pinned; return; }
    }
    var ok = TYPES.filter(function(t){ return t.rows.indexOf(PLOTS[i].row) >= 0; });
    if (!ok.length) ok = TYPES.filter(function(t){ return t.rows.length; });
    var at = Math.floor(rnd(SEED ^ Math.imul(i + 1, 2654435761)) * ok.length) % ok.length;
    if (ok.length > 1 && PLOTS[i].row === prevRow && ok[at] === prev) at = (at + 1) % ok.length;
    out[i] = ok[at];
    prev = ok[at]; prevRow = PLOTS[i].row;
  });
  return out;
}
function flipped(i){ return rnd(SEED ^ Math.imul(i + 101, 40503)) < 0.45; }

/* ---- PNG codec (8-bit, non-interlaced) -------------------------- */

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
  var pos = 8, w = 0, h = 0, bd = 0, ct = 0, idat = [];
  while (pos < buf.length){
    var len  = buf.readUInt32BE(pos);
    var type = buf.toString("ascii", pos + 4, pos + 8);
    var data = buf.slice(pos + 8, pos + 8 + len);
    if (type === "IHDR"){
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bd = data[8]; ct = data[9];
      if (data[12] !== 0) throw new Error("interlaced PNG unsupported");
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bd !== 8) throw new Error("only 8-bit PNGs");
  var ch = ct === 2 ? 3 : ct === 6 ? 4 : ct === 0 ? 1 : ct === 4 ? 2 : 0;
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
  return { w: w, h: h, ch: ch, data: out };
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

/* ---- compositing ------------------------------------------------ */

/* bilinear-resample RGBA sprite to width outW */
function resample(sp, outW){
  var outH = Math.max(1, Math.round(sp.h * outW / sp.w));
  var out = Buffer.alloc(outW * outH * 4), x, y, c;
  for (y = 0; y < outH; y++){
    var sy = (y + 0.5) * sp.h / outH - 0.5,
        y0 = Math.max(0, Math.floor(sy)), y1 = Math.min(sp.h - 1, y0 + 1),
        fy = sy - y0;
    for (x = 0; x < outW; x++){
      var sx = (x + 0.5) * sp.w / outW - 0.5,
          x0 = Math.max(0, Math.floor(sx)), x1 = Math.min(sp.w - 1, x0 + 1),
          fx = sx - x0;
      var p00 = (y0 * sp.w + x0) * 4, p10 = (y0 * sp.w + x1) * 4,
          p01 = (y1 * sp.w + x0) * 4, p11 = (y1 * sp.w + x1) * 4,
          o = (y * outW + x) * 4;
      for (c = 0; c < 4; c++){
        out[o + c] = sp.data[p00 + c] * (1 - fx) * (1 - fy) +
                     sp.data[p10 + c] * fx * (1 - fy) +
                     sp.data[p01 + c] * (1 - fx) * fy +
                     sp.data[p11 + c] * fx * fy;
      }
    }
  }
  return { w: outW, h: outH, data: out };
}

/* alpha-over onto an RGB canvas, bottom-centre anchored at (cx, gy),
   mirrored if flip, hazed toward paper by f (0..1) */
function stamp(canvas, W, H, sp, cx, gy, flip, f){
  var x0 = Math.round(cx - sp.w / 2), y0 = Math.round(gy - sp.h), x, y;
  for (y = 0; y < sp.h; y++){
    var ty = y0 + y;
    if (ty < 0 || ty >= H) continue;
    for (x = 0; x < sp.w; x++){
      var tx = x0 + (flip ? sp.w - 1 - x : x);
      if (tx < 0 || tx >= W) continue;
      var p = (y * sp.w + x) * 4, a = sp.data[p + 3] / 255;
      if (a <= 0) continue;
      var q = (ty * W + tx) * 3, c;
      for (c = 0; c < 3; c++){
        var v = sp.data[p + c];
        v = v * (1 - f) + PAPER[c] * f;           // atmospheric haze
        canvas[q + c] = v * a + canvas[q + c] * (1 - a);
      }
    }
  }
}

/* ---- run -------------------------------------------------------- */

if (!fs.existsSync(MASTER)){
  console.error("missing art/village/field-square.png"); process.exit(1);
}

var master = decode(fs.readFileSync(MASTER));
if (master.ch !== 3){ console.error("expected RGB master"); process.exit(1); }
var W = master.w, H = master.h;

var sprites = {};
TYPES.forEach(function(t){
  var p = path.join(DIR, t.file);
  if (fs.existsSync(p)) sprites[t.file] = decode(fs.readFileSync(p));
});

var chosen = assign();
var HAZE = [0.30, 0.15, 0.04];                  // per row, toward paper

var order = PLOTS.map(function(_, i){ return i; })
  .sort(function(a, b){ return PLOTS[a].y - PLOTS[b].y; });   // painter order

var bandY0 = Math.round(BAND[0] * H), bandH = H - bandY0;

for (var n = 0; n <= PLOTS.length; n++){
  var canvas = Buffer.from(master.data);        // fresh copy of the valley
  /* stamp every BUILT plot in painter order (back to front) */
  for (var k = 0; k < order.length; k++){
    var i = order[k];
    if (i >= n) continue;
    var t = chosen[i], sp = sprites[t.file];
    if (!sp) continue;
    var p = PLOTS[i];
    var w = Math.max(8, Math.round(p.w * (t.scale || 1) * W));
    stamp(canvas, W, H, resample(sp, w), p.x * W, p.y * H, flipped(i), HAZE[p.row]);
  }
  /* crop to the field band and write */
  var out = Buffer.alloc(bandH * W * 3);
  canvas.copy(out, 0, bandY0 * W * 3, H * W * 3);
  var name = "state-" + (n < 10 ? "0" + n : n) + ".png";
  var buf = encode(W, bandH, 3, 2, out);
  fs.writeFileSync(path.join(DIR, name), buf);
  console.log(name.padEnd(14) + W + "x" + bandH + "  " + (buf.length / 1024).toFixed(0) + "KB");
}
console.log("\nPlaceholder states written. VEN's real chained generations replace them 1:1.");
