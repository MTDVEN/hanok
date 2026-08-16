/* ================================================================
   Crop the village base plate —  node tools/crop.js

   Recraft hands back a 1:1 square. Dropped on the page whole, the
   village section becomes 1080px tall on a ~550px viewport: two
   screens of mountain before you reach the village, which is the part
   the section exists for.

   So the shipped plate is a BAND cut from the square master. This
   writes several bands from one master so they can be compared in the
   browser (?plate=NAME) rather than argued about.

   Plots are authored in the MASTER's coordinates and remapped per
   plate by PLATE_CROP in js/village.js — keep the numbers here and
   there in step. That is the one thing to be careful about: change a
   crop here without changing PLATE_CROP and every building floats off
   its ground line.

   No dependencies: PNG decode/encode over zlib. 8-bit, non-interlaced.
================================================================= */

var zlib = require("zlib");
var fs   = require("fs");
var path = require("path");

var DIR    = path.join(__dirname, "..", "art", "village");
var MASTER = path.join(DIR, "field-square.png");

/* name -> [top, bottom] as fractions of the master's height.
   MUST match PLATE_CROP in js/village.js. */
var BANDS = {
  "field":      [0.300, 1],   // default: mountain feet, full valley, foreground
  "field-tall": [0.195, 1],   // more mountain, taller section
  "field-wide": [0.547, 1]    // mostly field, shortest section
};

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
  var pos = 8, w = 0, h = 0, bd = 0, ct = 0, idat = [];
  while (pos < buf.length){
    var len  = buf.readUInt32BE(pos);
    var type = buf.toString("ascii", pos + 4, pos + 8);
    var data = buf.slice(pos + 8, pos + 8 + len);
    if (type === "IHDR"){
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bd = data[8]; ct = data[9];
      if (data[12] !== 0) throw new Error("interlaced PNGs are not supported");
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
  return { w: w, h: h, ch: ch, ct: ct, data: out };
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

/* ---- run -------------------------------------------------------- */

if (!fs.existsSync(MASTER)){
  console.error("missing " + path.relative(process.cwd(), MASTER) +
                "\nPut the uncropped Recraft square there first.");
  process.exit(1);
}

var img = decode(fs.readFileSync(MASTER));
console.log("master  " + img.w + "x" + img.h + "  " + img.ch + " channels\n");

Object.keys(BANDS).forEach(function(name){
  var band = BANDS[name];
  var y0 = Math.round(band[0] * img.h), y1 = Math.round(band[1] * img.h);
  var h  = y1 - y0, stride = img.w * img.ch;
  var out = Buffer.alloc(h * stride);
  img.data.copy(out, 0, y0 * stride, y1 * stride);

  var buf = encode(img.w, h, img.ch, img.ct, out);
  fs.writeFileSync(path.join(DIR, name + ".png"), buf);
  console.log(
    name.padEnd(13) + (img.w + "x" + h).padEnd(11) +
    (img.w / h).toFixed(2) + ":1   " +
    (buf.length / 1048576).toFixed(2) + "MB   " +
    "master y " + y0 + "-" + y1
  );
});

console.log("\nPLATE_CROP for js/village.js must match:");
console.log("  " + JSON.stringify(BANDS));

/* ---- state masters ----------------------------------------------
   VEN's chained village states (see art/village/PROMPTS.md): square
   masters named state-00.png … state-15.png in the repo ROOT, each
   generated FROM the previous one in Recraft. Every one gets the
   same "field" band cut, so all states line up with each other and
   with the plots. state-00 is the empty valley — usually a copy of
   valley.png itself. */

var stateBand = BANDS["field"];
var found = fs.readdirSync(path.join(__dirname, ".."))
  .filter(function(f){ return /^state-\d\d\.png$/.test(f); }).sort();

if (found.length){
  console.log("\nstate masters:");
  found.forEach(function(f){
    var im = decode(fs.readFileSync(path.join(__dirname, "..", f)));
    if (im.w !== img.w || im.h !== img.h){
      console.log("  " + f + "  SKIP — " + im.w + "x" + im.h +
                  " does not match the field master (" + img.w + "x" + img.h +
                  "); re-export at the same size");
      return;
    }
    var y0 = Math.round(stateBand[0] * im.h), y1 = Math.round(stateBand[1] * im.h);
    var h = y1 - y0, stride = im.w * im.ch;
    var out = Buffer.alloc(h * stride);
    im.data.copy(out, 0, y0 * stride, y1 * stride);
    var buf = encode(im.w, h, im.ch, im.ct, out);
    fs.writeFileSync(path.join(DIR, f), buf);
    console.log("  " + f.padEnd(15) + im.w + "x" + h + "   " +
                (buf.length / 1048576).toFixed(2) + "MB");
  });
}
