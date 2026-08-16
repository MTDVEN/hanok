/* ================================================================
   Extract the village building sprites —  node tools/extract.js [name]

   VEN's Recraft exports (root b-*.png) came back as FULL SCENES —
   building + mountains + mist + pines — not isolated sprites; the
   custom style was built from landscape paintings and the style won
   over the "isolated object" instruction. tools/prep.html cannot cut
   these: its border-flood assumes a flat background, and this
   background is a painting.

   So each sprite is cut here, in three cooperating passes:

     1. KEEP-POLYGON (hand-authored per image, the part no threshold
        can do): pines and rocks physically TOUCH the buildings, so
        no automatic rule separates them. The polygon hugs the
        building generously and its edge is feathered.
     2. DENSITY KEYING (same idea as journey.js ?panels=key): alpha
        follows ink density relative to the painting's own paper, so
        paper and mist inside the polygon vanish and every kept edge
        stays painterly. The polygon edge is invisible wherever it
        crosses pale ground — which is why the polygons only need to
        be roughly right.
     3. CONNECTED COMPONENTS: anything inside the polygon that isn't
        connected to the building (mountain shards through a gap,
        mist speckles) is dropped.

   The result stands on its own bottom edge after the trim — the
   contract js/village.js relies on (a plot's y is the ground line).

   Outputs:
     art/village/<name>.png        the sprite (straight alpha)
     art/village/debug-<name>.png  the sprite composited on --paper,
                                   for judging halos and cut edges

   Iterating: tweak the polygon / keylo in CONFIGS, re-run for one
   image with  node tools/extract.js b-house  and look at the debug.

   No dependencies. PNG codec shared in spirit with tools/crop.js
   (copied, not required — crop.js runs its main on require).
================================================================= */

var zlib = require("zlib");
var fs   = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var OUT  = path.join(ROOT, "art", "village");

/* the page's sheet (--paper), for the debug composite */
var PAPER = [0xDF, 0xCE, 0xA5];

/* ----------------------------------------------------------------
   Per-image recipe. Polygon coords are in the 1024x1024 master's
   pixel space. keylo/keyhi are ink-density stops (journey.js keys at
   0.04/0.70; these scenes need per-image tuning because mist density
   varies). feather = px of softness on the polygon edge.
----------------------------------------------------------------- */

/* `poly` is the keep-region; `holes` are rings punched OUT of it —
   the gate's open doorway and the pavilion's railing openings, so the
   valley plate shows THROUGH them on the page instead of a keyed
   ghost of this scene's own background. Even-odd fill makes holes
   free: all rings go through the same scanline pass. */

var CONFIGS = {
  "b-house": {
    keylo: .05, keyhi: .55, feather: 10, maxW: 760, minPx: 2600,
    /* the whole top edge traces the ridge and both roof slopes at
       ~15px out — anything looser keeps a band of background trees */
    poly: [[215,515],[400,486],[599,490],[700,545],[790,598],[885,652],
           [890,672],[858,692],[770,700],[750,890],[650,980],[350,980],
           [295,875],[280,700],[105,690],[48,640],[95,600],[160,560]]
  },
  "b-gate": {
    keylo: .05, keyhi: .55, feather: 10, maxW: 760, minPx: 2600,
    /* left-bottom pulled to the leg's outer face (390) — a pine stood
       against the left leg. Top-right traces the roof slope. Doorway
       punched through, sized to the full opening. */
    poly: [[280,165],[700,195],[790,240],[870,285],[954,338],[940,430],
           [830,470],[830,560],[700,660],[700,900],[620,980],[420,980],
           [390,905],[395,640],[215,560],[215,470],[95,430],[70,360]],
    holes: [[[405,685],[640,685],[640,905],[405,905]]]
  },
  "b-lhouse": {
    keylo: .05, keyhi: .55, feather: 9, maxW: 860, minPx: 2600,
    poly: [[20,640],[100,590],[350,570],[530,555],[700,580],[1000,610],
           [1010,900],[850,930],[700,960],[300,960],[60,930],[15,880]]
  },
  "b-pavilion": {
    keylo: .05, keyhi: .55, feather: 10, maxW: 760,
    /* both eave lines traced tight (pine crosses the left one, the
       mountain sat over the right); railing openings punched up to
       the beam so the plate shows through the open pavilion */
    poly: [[38,330],[180,300],[330,268],[500,240],[640,300],[740,360],
           [840,425],[930,478],[900,560],[740,610],[740,780],[780,830],
           [760,880],[700,880],[700,960],[620,990],[350,990],[330,880],
           [270,870],[250,780],[250,610],[60,560],[25,470]],
    holes: [[[288,612],[395,612],[395,760],[288,760]],
            [[412,612],[538,612],[538,760],[412,760]],
            [[565,612],[648,612],[648,757],[565,757]]]
  },
  "b-walled": {
    keylo: .05, keyhi: .55, feather: 9, maxW: 900,
    poly: [[200,478],[810,462],[872,545],[900,800],[1010,830],[1010,990],
           [10,990],[10,830],[120,800],[130,540]]
  },
  "b-thatch": {
    keylo: .05, keyhi: .55, feather: 9, maxW: 900, minPx: 2600,
    /* top edge follows the thatch crest — a loose line left a sliver
       of sky above the roof full of background pine. One branch still
       crossed just above the left crest; punched out. */
    poly: [[225,545],[350,512],[560,492],[760,505],[885,525],[905,650],
           [940,700],[1010,740],[1010,990],[10,990],[10,760],[100,720],
           [185,650]],
    holes: [[[120,455],[285,455],[285,545],[120,545]]]
  }
};

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
  if (bd !== 8) throw new Error("only 8-bit PNGs (got " + bd + ")");
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

function encodeRGBA(w, h, rgba){
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  var stride = w * 4, raw = Buffer.alloc(h * (stride + 1)), y;
  for (y = 0; y < h; y++){
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

/* ---- helpers ---------------------------------------------------- */

function smooth(t){ return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); }

/* mean colour of the brightest ~8% — "this painting's paper".
   Same method as journey.js paperOf(). */
function paperLum(px, w, h, ch){
  var hist = new Int32Array(256), n = w * h, i, p, lum;
  for (i = 0; i < n; i++){
    p = i * ch;
    lum = (0.2126 * px[p] + 0.7152 * px[p + 1] + 0.0722 * px[p + 2]) | 0;
    hist[lum]++;
  }
  var want = n * 0.08, seen = 0, cut = 255;
  for (i = 255; i >= 0; i--){ seen += hist[i]; if (seen >= want){ cut = i; break; } }
  var s = 0, m = 0;
  for (i = 0; i < n; i++){
    p = i * ch;
    lum = 0.2126 * px[p] + 0.7152 * px[p + 1] + 0.0722 * px[p + 2];
    if (lum >= cut){ s += lum; m++; }
  }
  return m ? s / m : 255;
}

/* scanline-rasterize rings (outer poly + holes) into a 0/255 mask.
   Even-odd fill across ALL rings at once — a point inside the outer
   ring and inside a hole crosses an even number of edges, so holes
   need no special handling. */
function polyMask(rings, w, h){
  var mask = new Uint8Array(w * h), y, x, r, i, j, k;
  for (y = 0; y < h; y++){
    var sy = y + 0.5, xs = [];
    for (r = 0; r < rings.length; r++){
      var poly = rings[r];
      for (i = 0, j = poly.length - 1; i < poly.length; j = i++){
        if ((poly[i][1] > sy) !== (poly[j][1] > sy)){
          xs.push(poly[i][0] + (sy - poly[i][1]) / (poly[j][1] - poly[i][1]) *
                  (poly[j][0] - poly[i][0]));
        }
      }
    }
    xs.sort(function(a, b){ return a - b; });
    for (k = 0; k + 1 < xs.length; k += 2){
      var from = Math.max(0, Math.ceil(xs[k] - 0.5)),
          to   = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
      for (x = from; x <= to; x++) mask[y * w + x] = 255;
    }
  }
  return mask;
}

/* separable box blur on a Uint8 plane (two passes ≈ soft falloff) */
function blurPlane(src, w, h, rad, passes){
  var a = Float32Array.from(src), b = new Float32Array(w * h), p, x, y, k, s, c;
  for (p = 0; p < (passes || 1); p++){
    for (y = 0; y < h; y++){
      for (x = 0; x < w; x++){
        s = 0; c = 0;
        for (k = -rad; k <= rad; k++)
          if (x + k >= 0 && x + k < w){ s += a[y * w + x + k]; c++; }
        b[y * w + x] = s / c;
      }
    }
    for (x = 0; x < w; x++){
      for (y = 0; y < h; y++){
        s = 0; c = 0;
        for (k = -rad; k <= rad; k++)
          if (y + k >= 0 && y + k < h){ s += b[(y + k) * w + x]; c++; }
        a[y * w + x] = s / c;
      }
    }
  }
  return a;
}

/* connected components over alpha>thresh; returns keep mask.
   Components smaller than minPx are dropped — mountain shards that
   slipped through a polygon gap, mist speckles. */
function keepComponents(alpha, w, h, thresh, minPx){
  var label = new Int32Array(w * h), next = 0, sizes = [], stack = [], i, x, y;
  label.fill(-1);
  for (i = 0; i < w * h; i++){
    if (alpha[i] <= thresh || label[i] >= 0) continue;
    var id = next++, count = 0;
    stack.length = 0; stack.push(i); label[i] = id;
    while (stack.length){
      var q = stack.pop(); count++;
      x = q % w; y = (q / w) | 0;
      if (x > 0     && label[q - 1] < 0 && alpha[q - 1] > thresh){ label[q - 1] = id; stack.push(q - 1); }
      if (x < w - 1 && label[q + 1] < 0 && alpha[q + 1] > thresh){ label[q + 1] = id; stack.push(q + 1); }
      if (y > 0     && label[q - w] < 0 && alpha[q - w] > thresh){ label[q - w] = id; stack.push(q - w); }
      if (y < h - 1 && label[q + w] < 0 && alpha[q + w] > thresh){ label[q + w] = id; stack.push(q + w); }
    }
    sizes[id] = count;
  }
  var keep = new Uint8Array(w * h);
  for (i = 0; i < w * h; i++)
    if (label[i] >= 0 && sizes[label[i]] >= minPx) keep[i] = 255;
  return keep;
}

/* bilinear downscale of straight-alpha RGBA */
function downscale(rgba, w, h, outW){
  if (outW >= w) return { w: w, h: h, data: rgba };
  var outH = Math.round(h * outW / w), out = Buffer.alloc(outW * outH * 4);
  var x, y, c;
  for (y = 0; y < outH; y++){
    var sy = (y + 0.5) * h / outH - 0.5,
        y0 = Math.max(0, Math.floor(sy)), y1 = Math.min(h - 1, y0 + 1),
        fy = sy - y0;
    for (x = 0; x < outW; x++){
      var sx = (x + 0.5) * w / outW - 0.5,
          x0 = Math.max(0, Math.floor(sx)), x1 = Math.min(w - 1, x0 + 1),
          fx = sx - x0;
      var p00 = (y0 * w + x0) * 4, p10 = (y0 * w + x1) * 4,
          p01 = (y1 * w + x0) * 4, p11 = (y1 * w + x1) * 4,
          o = (y * outW + x) * 4;
      /* weight colour by alpha so transparent neighbours don't bleed
         their (paper-coloured) RGB into the edge */
      var a00 = rgba[p00 + 3], a10 = rgba[p10 + 3],
          a01 = rgba[p01 + 3], a11 = rgba[p11 + 3];
      var w00 = (1 - fx) * (1 - fy) * a00, w10 = fx * (1 - fy) * a10,
          w01 = (1 - fx) * fy * a01,       w11 = fx * fy * a11;
      var wa = w00 + w10 + w01 + w11;
      var aOut = (1 - fx) * (1 - fy) * a00 + fx * (1 - fy) * a10 +
                 (1 - fx) * fy * a01 + fx * fy * a11;
      for (c = 0; c < 3; c++){
        out[o + c] = wa > 0
          ? (rgba[p00 + c] * w00 + rgba[p10 + c] * w10 +
             rgba[p01 + c] * w01 + rgba[p11 + c] * w11) / wa
          : 0;
      }
      out[o + 3] = aOut;
    }
  }
  return { w: outW, h: outH, data: out };
}

/* ---- the pipeline ----------------------------------------------- */

function extract(name){
  var cfg = CONFIGS[name];
  var srcPath = path.join(ROOT, name + ".png");
  if (!fs.existsSync(srcPath)){ console.log(name.padEnd(12) + "SKIP (no master in root)"); return; }

  var img = decode(fs.readFileSync(srcPath));
  var w = img.w, h = img.h, ch = img.ch, px = img.data;

  var pLum = paperLum(px, w, h, ch) || 255;
  var kSpan = cfg.keyhi - cfg.keylo || 1;

  /* polygon mask (outer ring + punched holes), feathered */
  var rings = [cfg.poly].concat(cfg.holes || []);
  var poly = blurPlane(polyMask(rings, w, h), w, h, cfg.feather, 2);

  /* alpha = density keying × feathered polygon */
  var alpha = new Float32Array(w * h), i, p;
  for (i = 0; i < w * h; i++){
    p = i * ch;
    var dens = 1 - (0.2126 * px[p] + 0.7152 * px[p + 1] + 0.0722 * px[p + 2]) / pLum;
    alpha[i] = smooth((dens - cfg.keylo) / kSpan) * (poly[i] / 255) * 255;
  }

  /* drop disconnected leftovers; soften the keep edge slightly */
  var keep = keepComponents(alpha, w, h, 55, cfg.minPx || 1500);
  var keepSoft = blurPlane(keep, w, h, 2, 1);
  for (i = 0; i < w * h; i++) alpha[i] *= Math.min(1, keepSoft[i] / 200);

  /* assemble RGBA */
  var rgba = Buffer.alloc(w * h * 4);
  for (i = 0; i < w * h; i++){
    p = i * ch;
    rgba[i * 4]     = px[p];
    rgba[i * 4 + 1] = px[p + 1];
    rgba[i * 4 + 2] = px[p + 2];
    rgba[i * 4 + 3] = Math.max(0, Math.min(255, alpha[i]));
  }

  /* trim to content */
  var x0 = w, y0 = h, x1 = -1, y1 = -1, x, y;
  for (y = 0; y < h; y++) for (x = 0; x < w; x++){
    if (rgba[(y * w + x) * 4 + 3] > 8){
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  if (x1 < 0){ console.log(name.padEnd(12) + "EMPTY — polygon/key mismatch"); return; }
  var tw = x1 - x0 + 1, th = y1 - y0 + 1;
  var trimmed = Buffer.alloc(tw * th * 4);
  for (y = 0; y < th; y++)
    rgba.copy(trimmed, y * tw * 4, ((y + y0) * w + x0) * 4, ((y + y0) * w + x1 + 1) * 4);

  var fin = downscale(trimmed, tw, th, cfg.maxW);

  var sprite = encodeRGBA(fin.w, fin.h, fin.data);
  fs.writeFileSync(path.join(OUT, name + ".png"), sprite);

  /* debug composite over the page's paper */
  var dbg = Buffer.alloc(fin.w * fin.h * 4);
  for (i = 0; i < fin.w * fin.h; i++){
    var a = fin.data[i * 4 + 3] / 255;
    dbg[i * 4]     = fin.data[i * 4]     * a + PAPER[0] * (1 - a);
    dbg[i * 4 + 1] = fin.data[i * 4 + 1] * a + PAPER[1] * (1 - a);
    dbg[i * 4 + 2] = fin.data[i * 4 + 2] * a + PAPER[2] * (1 - a);
    dbg[i * 4 + 3] = 255;
  }
  fs.writeFileSync(path.join(OUT, "debug-" + name + ".png"), encodeRGBA(fin.w, fin.h, dbg));

  console.log(name.padEnd(12) + (fin.w + "x" + fin.h).padEnd(10) +
              (sprite.length / 1024).toFixed(0) + "KB   paper " + pLum.toFixed(0));
}

/* ---- run -------------------------------------------------------- */

var only = process.argv[2];
var names = only ? [only] : Object.keys(CONFIGS);
if (only && !CONFIGS[only]){
  console.error("unknown name: " + only + "\nknown: " + Object.keys(CONFIGS).join(", "));
  process.exit(1);
}
names.forEach(extract);
console.log("\nInspect art/village/debug-*.png; sprites are art/village/b-*.png");
