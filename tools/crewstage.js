/* ================================================================
   tools/crewstage.js — build the start and end stills of a carrier's
   DROP-OFF clip, so the clip joins the walking strips either side of
   it without a jump.

     node tools/crewstage.js <spec.json>

   Zico, 2026-09-30: the carriers should *"walk up to the guy on the
   ladder, add to a pile of tiles at the bottom of the ladder and then
   walk back off frame (where they rendered in from)"*. The walk in and
   the walk out are in-place walk cycles (tools/crew.html strips); the
   bit between them is a ONE-SHOT image2video clip whose first and last
   frames are these two stills:

     start = the carrier exactly as in frame 0 of the LOADED walk clip
             (same pixels, same place) + the pile as it stands
     end   = the same carrier in the same stride, UNLOADED (frame 0 of
             the empty walk clip) + the pile with their tiles added

   The turn to walk home is NOT in the clip: at its last frame the page
   swaps to the empty walk strip mirrored, an instant about-face — the
   2D-game convention, and far safer than asking a video model to turn
   a figure through 180 degrees between two stills.

   Because every figure is pasted at a known place on flat green, the
   page knows where each piece of each clip is (written to the spec's
   `out` json) and can hand over from strip to clip to strip on the
   same pixels.

   The spec names source stills (2752x1536, flat #00FF00) and boxes in
   those stills' pixels; see art/crew/stage-*.spec.json.
================================================================= */

var fs = require("fs"), path = require("path"), png = require("./png.js");
var ROOT = path.join(__dirname, "..");
var spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

var LO = 24, HI = 70, GREEN = [0, 255, 0];

function load(rel){ return png.decode(fs.readFileSync(path.join(ROOT, rel))); }

/* key a box of an image into an RGBA sprite (same maths as crew.html:
   alpha from greenness, green pulled to mean(R,B) where it leaked) */
function cut(im, box){
  var x0 = box[0], y0 = box[1], w = box[2] - box[0], h = box[3] - box[1];
  var out = { w: w, h: h, data: Buffer.alloc(w * h * 4) };
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++){
    var si = ((y0 + y) * im.w + x0 + x) * im.ch, di = (y * w + x) * 4;
    var r = im.data[si], g = im.data[si + 1], b = im.data[si + 2];
    var mx = r > b ? r : b, gn = g - mx;
    var a = gn <= LO ? 1 : gn >= HI ? 0 : 1 - (gn - LO) / (HI - LO);
    if (g > mx) g = (r + b) >> 1;
    out.data[di] = r; out.data[di + 1] = g; out.data[di + 2] = b; out.data[di + 3] = Math.round(a * 255);
  }
  return out;
}

/* the opaque bounding box of a sprite (alpha > 40) */
function tight(sp){
  var x0 = sp.w, y0 = sp.h, x1 = -1, y1 = -1;
  for (var y = 0; y < sp.h; y++) for (var x = 0; x < sp.w; x++){
    if (sp.data[(y * sp.w + x) * 4 + 3] > 40){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return [x0, y0, x1 + 1, y1 + 1];
}

function mirror(sp){
  var out = { w: sp.w, h: sp.h, data: Buffer.alloc(sp.data.length) };
  for (var y = 0; y < sp.h; y++) for (var x = 0; x < sp.w; x++){
    sp.data.copy(out.data, (y * sp.w + (sp.w - 1 - x)) * 4, (y * sp.w + x) * 4, (y * sp.w + x) * 4 + 4);
  }
  return out;
}

/* scale a sprite by s (box filter down, nearest up — props only) */
function scale(sp, s){
  if (Math.abs(s - 1) < 1e-3) return sp;
  var w = Math.max(1, Math.round(sp.w * s)), h = Math.max(1, Math.round(sp.h * s));
  var out = { w: w, h: h, data: Buffer.alloc(w * h * 4) };
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++){
    var sx0 = Math.floor(x / s), sy0 = Math.floor(y / s), sx1 = Math.max(sx0 + 1, Math.floor((x + 1) / s)), sy1 = Math.max(sy0 + 1, Math.floor((y + 1) / s));
    var acc = [0, 0, 0, 0], n = 0;
    for (var yy = sy0; yy < Math.min(sp.h, sy1); yy++) for (var xx = sx0; xx < Math.min(sp.w, sx1); xx++){
      var i = (yy * sp.w + xx) * 4, a = sp.data[i + 3];
      acc[0] += sp.data[i] * a; acc[1] += sp.data[i + 1] * a; acc[2] += sp.data[i + 2] * a; acc[3] += a; n++;
    }
    var di = (y * w + x) * 4;
    if (acc[3]){ out.data[di] = acc[0] / acc[3]; out.data[di + 1] = acc[1] / acc[3]; out.data[di + 2] = acc[2] / acc[3]; }
    out.data[di + 3] = acc[3] / n;
  }
  return out;
}

function canvas(W, H){
  var c = { w: W, h: H, data: Buffer.alloc(W * H * 3) };
  for (var i = 0; i < W * H; i++){ c.data[i * 3] = GREEN[0]; c.data[i * 3 + 1] = GREEN[1]; c.data[i * 3 + 2] = GREEN[2]; }
  return c;
}
function paste(c, sp, X, Y){
  for (var y = 0; y < sp.h; y++) for (var x = 0; x < sp.w; x++){
    var cx = X + x, cy = Y + y;
    if (cx < 0 || cy < 0 || cx >= c.w || cy >= c.h) continue;
    var si = (y * sp.w + x) * 4, a = sp.data[si + 3] / 255, di = (cy * c.w + cx) * 3;
    if (!a) continue;
    c.data[di] = sp.data[si] * a + c.data[di] * (1 - a);
    c.data[di + 1] = sp.data[si + 1] * a + c.data[di + 1] * (1 - a);
    c.data[di + 2] = sp.data[si + 2] * a + c.data[di + 2] * (1 - a);
  }
}

/* ---- build ------------------------------------------------------- */
var W = spec.frame[0], H = spec.frame[1];
/* `shift` [dx, dy] moves the whole scene inside the frame (the woman
   stands at the right of her still, so her pile would touch the edge).
   The page lines the clip up by the CARRIER, so a shift costs nothing. */
var SH = spec.shift || [0, 0];
spec.loaded.box = [spec.loaded.box[0] + SH[0], spec.loaded.box[1] + SH[1], spec.loaded.box[2] + SH[0], spec.loaded.box[3] + SH[1]];
var emptyAt = [spec.empty.box[0] + SH[0], spec.empty.box[1] + SH[1]];
var loaded = load(spec.loaded.src), empty = load(spec.empty.src);
var srcBox = [spec.loaded.box[0] - SH[0], spec.loaded.box[1] - SH[1], spec.loaded.box[2] - SH[0], spec.loaded.box[3] - SH[1]];
var carrier = cut(loaded, srcBox);                     // pasted at its own place (+shift)
var walker  = cut(empty, spec.empty.box);
var cT = tight(carrier), wT = tight(walker);

/* the ground line is the loaded carrier's lowest opaque pixel */
var ground = spec.loaded.box[1] + cT[3];
/* the carrier's front foot: the right edge of his lowest band */
var front = spec.loaded.box[0] + cT[2];

var piles = spec.piles.map(function(p){
  var im = load(p.src), sp = cut(im, p.box), t = tight(sp);
  if (t[2] <= t[0]) throw new Error("empty pile box " + JSON.stringify(p.box));
  return scale({ w: t[2] - t[0], h: t[3] - t[1],
                 data: (function(){ var b = Buffer.alloc((t[2] - t[0]) * (t[3] - t[1]) * 4);
                   for (var y = t[1]; y < t[3]; y++) sp.data.copy(b, (y - t[1]) * (t[2] - t[0]) * 4, (y * sp.w + t[0]) * 4, (y * sp.w + t[2]) * 4);
                   return b; })() }, p.scale || 1);
});
var P0 = piles[0], P1 = piles[1];   // the pile before and after this carrier
var pileX = front + Math.round(spec.gap);              // left edge of the pile
var P0at = [pileX, ground - P0.h], P1at = [pileX, ground - P1.h];

var start = canvas(W, H);
paste(start, carrier, spec.loaded.box[0], spec.loaded.box[1]);
paste(start, P0, P0at[0], P0at[1]);

/* the unloaded walker at ITS OWN place in the empty still — that still
   was made as an edit of the loaded one, so the figure stands where the
   loaded carrier stood (checked: same box to 4px, feet on one line) */
var wmX = emptyAt[0], wmY = emptyAt[1], wmT = wT;
var end = canvas(W, H);
paste(end, walker, wmX, wmY);
paste(end, P1, P1at[0], P1at[1]);

var outDir = path.join(ROOT, "art/crew/_work");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, spec.name + "-start.png"), png.encode(W, H, 3, 2, start.data));
fs.writeFileSync(path.join(outDir, spec.name + "-end.png"), png.encode(W, H, 3, 2, end.data));

/* where everything is, in fractions of the stage frame, for crew.js */
function fr(x0, y0, w, h){ return [x0 / W, y0 / H, w / W, h / H].map(function(v){ return +v.toFixed(5); }); }
var rec = {
  name: spec.name, frame: [W, H], ground: +(ground / H).toFixed(5),
  shift: [+(SH[0] / W).toFixed(5), +(SH[1] / H).toFixed(5)],
  carrier: fr(spec.loaded.box[0] + cT[0], spec.loaded.box[1] + cT[1], cT[2] - cT[0], cT[3] - cT[1]),
  walker:  fr(wmX + wmT[0], wmY + wmT[1], wmT[2] - wmT[0], wmT[3] - wmT[1]),
  pile0:   fr(P0at[0], P0at[1], P0.w, P0.h),
  pile1:   fr(P1at[0], P1at[1], P1.w, P1.h)
};
fs.writeFileSync(path.join(ROOT, "art/crew", spec.name + ".stage.json"), JSON.stringify(rec, null, 2));
console.log(JSON.stringify(rec));
