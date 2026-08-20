/* ================================================================
   Prepare a journey map sheet for the web —
     node tools/mapprep.js <src.png> <dest.png> [width]

   OpenArt hands back a 3072x5504 truecolour PNG, ~26MB. That is a
   master, not an asset: the map draws full-bleed at up to ZOOM_IN
   (1.9x viewport width), so about 1500px of source is all any real
   screen can show, and the sheet is a flat aged watercolour that
   sits inside 256 colours comfortably.

   Two passes, the same two tools/optimize.js runs and for the same
   reasons:
     1. DOWNSCALE with a box filter. Bilinear smears at a 2:1-plus
        ratio; box is the right filter when you are throwing most of
        the pixels away.
     2. QUANTISE to a 256-colour palette (median cut) with
        Floyd-Steinberg dithering, written out as PNG-8.

   Dithering is NOT optional. The map's whole middle is a slow
   parchment gradient, and that is precisely what bands — banding in
   the open ground would read as "cheap" on the one asset the
   section is built around.

   The palette warning in HANDOFF §9h does NOT apply here. That rule
   is about the village SPRITES, which must agree with each other on
   colour; a map sheet is one standalone image and its own median-cut
   palette is the right one for it.

   No dependencies beyond zlib — same rule as crop.js. The PNG codec
   is duplicated rather than required, which is this project's
   standing trade: see the note at the top of tools/png.js.
================================================================= */

var zlib = require("zlib");
var fs   = require("fs");

/* ---- PNG ------------------------------------------------------- */

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

function encodeIndexed(w, h, idx, pal){
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 3;                       // 8-bit, palette
  var raw = Buffer.alloc(h * (w + 1)), y;
  for (y = 0; y < h; y++){
    raw[y * (w + 1)] = 0;
    idx.copy(raw, y * (w + 1) + 1, y * w, (y + 1) * w);
  }
  var plte = Buffer.alloc(pal.length);
  pal.forEach(function(v, i){ plte[i] = v; });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk("IHDR", ihdr),
    chunk("PLTE", plte),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

/* ---- downscale (box filter) ------------------------------------ */

function downscale(img, outW){
  if (outW >= img.w) return img;
  var outH = Math.max(1, Math.round(img.h * outW / img.w));
  var out = Buffer.alloc(outW * outH * 3), x, y;
  for (y = 0; y < outH; y++){
    var sy0 = Math.floor(y * img.h / outH),
        sy1 = Math.max(sy0 + 1, Math.floor((y + 1) * img.h / outH));
    for (x = 0; x < outW; x++){
      var sx0 = Math.floor(x * img.w / outW),
          sx1 = Math.max(sx0 + 1, Math.floor((x + 1) * img.w / outW));
      var r = 0, g = 0, b = 0, n = 0, yy, xx;
      for (yy = sy0; yy < sy1; yy++){
        for (xx = sx0; xx < sx1; xx++){
          var p = (yy * img.w + xx) * 3;
          r += img.data[p]; g += img.data[p + 1]; b += img.data[p + 2]; n++;
        }
      }
      var o = (y * outW + x) * 3;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n;
    }
  }
  return { w: outW, h: outH, data: out };
}

/* ---- median-cut palette ---------------------------------------- */

/* Sampled to ~200k points rather than optimize.js's every-3rd-pixel.
   That tool runs on 620px plates; this one runs on a sheet ten times
   the area, and one array-of-three per sampled pixel is what actually
   costs the memory. 200k is far past the point where the palette
   stops changing. */
function palette(img, want){
  var n = img.w * img.h;
  var step = Math.max(1, Math.round(n / 200000));
  var pts = [], i;
  for (i = 0; i < n; i += step){
    pts.push([img.data[i * 3], img.data[i * 3 + 1], img.data[i * 3 + 2]]);
  }
  var boxes = [pts];
  while (boxes.length < want){
    var bi = -1, best = -1, c, j;
    for (i = 0; i < boxes.length; i++){
      if (boxes[i].length < 2) continue;
      var lo = [255, 255, 255], hi = [0, 0, 0];
      for (j = 0; j < boxes[i].length; j++)
        for (c = 0; c < 3; c++){
          if (boxes[i][j][c] < lo[c]) lo[c] = boxes[i][j][c];
          if (boxes[i][j][c] > hi[c]) hi[c] = boxes[i][j][c];
        }
      var spread = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
      if (spread > best){ best = spread; bi = i; }
    }
    if (bi < 0 || best <= 0) break;

    var box = boxes[bi], lo2 = [255, 255, 255], hi2 = [0, 0, 0], k, cc;
    for (k = 0; k < box.length; k++)
      for (cc = 0; cc < 3; cc++){
        if (box[k][cc] < lo2[cc]) lo2[cc] = box[k][cc];
        if (box[k][cc] > hi2[cc]) hi2[cc] = box[k][cc];
      }
    var axis = 0, span = hi2[0] - lo2[0];
    if (hi2[1] - lo2[1] > span){ axis = 1; span = hi2[1] - lo2[1]; }
    if (hi2[2] - lo2[2] > span){ axis = 2; }
    box.sort(function(a, b){ return a[axis] - b[axis]; });
    var mid = box.length >> 1;
    boxes.splice(bi, 1, box.slice(0, mid), box.slice(mid));
  }

  var pal = [];
  boxes.forEach(function(box){
    if (!box.length) return;
    var r = 0, g = 0, b = 0, j2;
    for (j2 = 0; j2 < box.length; j2++){ r += box[j2][0]; g += box[j2][1]; b += box[j2][2]; }
    pal.push(Math.round(r / box.length), Math.round(g / box.length), Math.round(b / box.length));
  });
  while (pal.length < want * 3) pal.push(0, 0, 0);
  return pal;
}

function makeMatcher(pal){
  var cache = new Int16Array(32768).fill(-1), np = pal.length / 3;
  return function(r, g, b){
    var key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    var hit = cache[key];
    if (hit >= 0) return hit;
    var best = 0, bd = Infinity, i;
    for (i = 0; i < np; i++){
      var dr = r - pal[i * 3], dg = g - pal[i * 3 + 1], db = b - pal[i * 3 + 2];
      var d = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
      if (d < bd){ bd = d; best = i; }
    }
    cache[key] = best;
    return best;
  };
}

function quantise(img, pal){
  var match = makeMatcher(pal), w = img.w, h = img.h;
  var buf = Float32Array.from(img.data);
  var idx = Buffer.alloc(w * h), x, y, c;
  for (y = 0; y < h; y++){
    for (x = 0; x < w; x++){
      var p = (y * w + x) * 3;
      var r = Math.max(0, Math.min(255, buf[p])),
          g = Math.max(0, Math.min(255, buf[p + 1])),
          b = Math.max(0, Math.min(255, buf[p + 2]));
      var i = match(r | 0, g | 0, b | 0);
      idx[y * w + x] = i;
      var err = [r - pal[i * 3], g - pal[i * 3 + 1], b - pal[i * 3 + 2]];
      for (c = 0; c < 3; c++){
        if (x + 1 < w)              buf[p + 3 + c]           += err[c] * 7 / 16;
        if (y + 1 < h && x > 0)     buf[p + (w - 1) * 3 + c] += err[c] * 3 / 16;
        if (y + 1 < h)              buf[p + w * 3 + c]       += err[c] * 5 / 16;
        if (y + 1 < h && x + 1 < w) buf[p + (w + 1) * 3 + c] += err[c] * 1 / 16;
      }
    }
  }
  return idx;
}

/* ---- run -------------------------------------------------------- */

var src  = process.argv[2],
    dest = process.argv[3],
    W    = parseInt(process.argv[4], 10) || 1500;

if (!src || !dest){
  console.error("usage: node tools/mapprep.js <src.png> <dest.png> [width]");
  process.exit(1);
}

var before = fs.statSync(src).size;
var img = decode(fs.readFileSync(src));
console.log("  source   " + img.w + "x" + img.h + "  " + (before / 1048576).toFixed(1) + "MB");

img = downscale(img, W);
var pal = palette(img, 256);
var out = encodeIndexed(img.w, img.h, quantise(img, pal), pal);
fs.writeFileSync(dest, out);

console.log("  written  " + img.w + "x" + img.h + "  " +
            (out.length / 1024).toFixed(0) + "KB  ->  " + dest);
console.log("  aspect   " + (img.w / img.h).toFixed(4) +
            "   (MAP_ASPECT in js/journey.js)");
