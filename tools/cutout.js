/* ================================================================
   cutout.js — key a flat-background export to RGBA and trim it.
                node tools/cutout.js <in.png> <out.png> [--debug]

   The headless half of tools/prep.html. prep.html is a browser tool a
   human drives; this runs the same idea from the command line so a whole
   set of buildings can be generated and cut in one pass without anyone
   dragging files onto a page.

   OpenArt has no transparency toggle, so every building comes back on
   the fallback background the prompts ask for: one flat even mid-grey
   field, corner to corner. That is deliberate — grey is a colour no part
   of a hanok uses, so it keys clean, where a cream background sits so
   close to the hanji walls that the tolerance has to be tight and leaves
   a rim.

   Three passes, same order as prep.html:

     1. FLOOD FROM THE BORDER, never a global colour key. A hanok's
        hanji walls are nearly the same value as the paper; a global key
        eats them and punches holes through the building. Flooding only
        clears background that is actually connected to the outside.
     2. SOFT ALPHA + UNPREMULTIPLY. Edge pixels are part building, part
        grey. Their alpha ramps over a tolerance band, then the known
        grey is divided back out, so a pale eave tip does not keep a
        grey fringe when it lands on the green plate.
     3. DROP THE SPECKS. Anything left that isn't connected to the main
        silhouette — stray marks, a rogue dot of texture — goes.

   Then it trims to the content. That trim is the whole point: the
   bottom edge of the output becomes the GROUND LINE, which is the only
   contract js/village.js has (a plot's y anchors a sprite's
   bottom-centre). The painted shadow's lowest edge is what lands there.

   --debug also writes <out>-debug.png, the same cut composited over flat
   magenta. Grey halos and leftover background are invisible against
   white and obvious against that.
================================================================= */

var fs   = require("fs");
var path = require("path");
var png  = require("./png.js");

/* Colour distance below TOL_LO is certainly background, above TOL_HI is
   certainly building; between the two the alpha ramps. Generous, because
   the flood already guarantees we only ever look at pixels reachable
   from the border. */
var TOL_LO = 10;
var TOL_HI = 46;
/* HOW FAR THE FLOOD MAY TRAVEL, which is not the same question as how
   transparent a pixel it reaches should be, and conflating the two is
   what put magenta streaks through a storehouse roof.

   The flood used TOL_HI for both: any pixel within 46 of the background
   was both keyed AND allowed to pass the flood on. A pale slate roof
   sits about 50 from mid-grey, so most of it stops the flood — but the
   lit ridge of each ruled tile stroke dips under 46, and those strokes
   run continuously from the eave to the ridge. That is a one-pixel
   channel from the border into the middle of the roof, and the flood
   took it, keying out the roof stroke by stroke.

   So: propagate only through paint that is CERTAINLY background, and
   still ramp the alpha of everything reached out to TOL_HI. The soft
   edge is unchanged — an eave tip's fringe is reached from outside
   either way — and the tunnel closes, because a channel of pixels at
   30–45 is no longer a road. */
var TOL_WALK = 24;
var SPECK  = 0.02;   // drop components smaller than this fraction of the biggest

function dist(d, i, r, g, b){
  var dr = d[i] - r, dg = d[i + 1] - g, db = d[i + 2] - b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/* the background colour, read off the four corners rather than assumed —
   the model rarely hands back exactly the grey it was asked for */
function background(img){
  var w = img.w, h = img.h, ch = img.ch, S = 6;
  var r = 0, g = 0, b = 0, n = 0, cx, cy, x, y;
  var corners = [[0, 0], [w - S, 0], [0, h - S], [w - S, h - S]];
  for (var c = 0; c < 4; c++){
    cx = corners[c][0]; cy = corners[c][1];
    for (y = cy; y < cy + S; y++){
      for (x = cx; x < cx + S; x++){
        var i = (y * w + x) * ch;
        r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; n++;
      }
    }
  }
  return [r / n, g / n, b / n];
}

/* pass 1 + 2 — flood in from every border pixel, ramp the alpha.
   `extra` adds more seeds; see pockets() below. */
function key(img, bg, alpha, extra){
  var w = img.w, h = img.h, ch = img.ch, N = w * h;
  alpha = alpha || new Uint8Array(N).fill(255);
  var seen  = new Uint8Array(N);
  var stack = [], x, y;

  if (extra) stack = stack.concat(extra);
  else {
    for (x = 0; x < w; x++){ stack.push(x); stack.push((h - 1) * w + x); }
    for (y = 0; y < h; y++){ stack.push(y * w); stack.push(y * w + w - 1); }
  }

  while (stack.length){
    var p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;

    var d = dist(img.data, p * ch, bg[0], bg[1], bg[2]);
    if (d >= TOL_HI) continue;                  // hit the building, stop here

    var a = d <= TOL_LO ? 0 : (d - TOL_LO) / (TOL_HI - TOL_LO);
    alpha[p] = Math.round(a * 255);

    if (d >= TOL_WALK) continue;   // keyed, but not a road for the flood

    x = p % w; y = (p - x) / w;
    if (x > 0)     stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0)     stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  return alpha;
}

/* POCKETS OF BACKGROUND THE BORDER CANNOT REACH — tried, and it cannot
   be done by colour. Left here as a warning, because it is an obvious
   idea and the next person will have it too.

   The case is real: a sprite with two buildings on one platform can
   have a patch of the flat grey field enclosed between them, reachable
   from no border pixel, which survives the flood as an opaque grey slab
   in the middle of the sprite. The obvious fix is to hunt for it by
   colour — any big run of still-opaque pixels that is certainly
   background — and seed the same flood from there.

   It keys holes straight through the roofs. Measured on b-house2: the
   greyest pixel in the main slate roof is rgb(127,127,127), which is
   the background colour EXACTLY, not near it. Chroma does not save it
   (both are neutral), and size does not either — a tile groove runs the
   whole length of a slope, so it is a bigger connected run than the
   pocket is.

   Connectivity is the only thing that tells them apart, and "enclosed"
   is precisely what both of them are. So the border flood is already
   the right answer and the pocket is not recoverable from the finished
   image: fix it in the generation, by asking for the two buildings to
   share one platform with no gap behind them. */

/* pass 3 — keep the main silhouette and anything of real size, bin the rest */
function despeck(alpha, w, h){
  var N = w * h, label = new Int32Array(N).fill(-1), sizes = [], q = [];
  for (var s = 0; s < N; s++){
    if (alpha[s] < 8 || label[s] !== -1) continue;
    var id = sizes.length, n = 0;
    q.push(s); label[s] = id;
    while (q.length){
      var p = q.pop(); n++;
      var x = p % w, y = (p - x) / w;
      var nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1,
                y > 0 ? p - w : -1, y < h - 1 ? p + w : -1];
      for (var k = 0; k < 4; k++){
        var m = nb[k];
        if (m >= 0 && label[m] === -1 && alpha[m] >= 8){ label[m] = id; q.push(m); }
      }
    }
    sizes.push(n);
  }
  if (!sizes.length) return 0;
  var big = Math.max.apply(null, sizes), dropped = 0;
  for (var i = 0; i < N; i++){
    if (label[i] >= 0 && sizes[label[i]] < big * SPECK){ alpha[i] = 0; dropped++; }
  }
  return dropped;
}

function run(inFile, outFile, debug){
  var img = png.decode(fs.readFileSync(inFile));
  var w = img.w, h = img.h, ch = img.ch, N = w * h, i, p, pocketPx = 0;

  /* already has real transparency? then it only needs the trim */
  var alpha, bg = null;
  var hasAlpha = false;
  if (ch === 4){
    for (i = 0; i < N && !hasAlpha; i++) if (img.data[i * 4 + 3] < 250) hasAlpha = true;
  }
  if (hasAlpha){
    alpha = new Uint8Array(N);
    for (i = 0; i < N; i++) alpha[i] = img.data[i * 4 + 3];
  } else {
    bg = background(img);
    alpha = key(img, bg);
  }

  var dropped = despeck(alpha, w, h);

  /* trim — the bottom of this box becomes the ground line */
  var x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (p = 0; p < N; p++){
    if (alpha[p] < 8) continue;
    var x = p % w, y = (p - x) / w;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  if (x1 < 0) throw new Error(path.basename(inFile) + ": nothing survived the key");

  var ow = x1 - x0 + 1, oh = y1 - y0 + 1;
  var out = Buffer.alloc(ow * oh * 4);
  var dbg = debug ? Buffer.alloc(ow * oh * 3) : null;

  for (var oy = 0; oy < oh; oy++){
    for (var ox = 0; ox < ow; ox++){
      var si = ((oy + y0) * w + (ox + x0));
      var a  = alpha[si], di = (oy * ow + ox) * 4;
      for (var c = 0; c < 3; c++){
        var v = img.data[si * ch + c];
        /* unpremultiply the known background out of the soft edge */
        if (bg && a > 0 && a < 255){
          v = (v - bg[c] * (1 - a / 255)) / (a / 255);
          v = v < 0 ? 0 : v > 255 ? 255 : v;
        }
        out[di + c] = Math.round(v);
        if (dbg){
          var f = a / 255;
          dbg[(oy * ow + ox) * 3 + c] = Math.round(v * f + [255, 0, 255][c] * (1 - f));
        }
      }
      out[di + 3] = a;
    }
  }

  fs.writeFileSync(outFile, png.encode(ow, oh, 4, 6, out));
  if (dbg){
    var d = outFile.replace(/\.png$/, "") + "-debug.png";
    fs.writeFileSync(d, png.encode(ow, oh, 3, 2, dbg));
  }

  return {
    src: w + "x" + h, out: ow + "x" + oh,
    bg: bg ? bg.map(Math.round).join(",") : "had alpha",
    dropped: dropped, pockets: pocketPx
  };
}

/* ---- cli --------------------------------------------------------- */

var args  = process.argv.slice(2);
var debug = args.indexOf("--debug") >= 0;
args = args.filter(function(a){ return a !== "--debug"; });

if (args.length < 2){
  console.error("usage: node tools/cutout.js <in.png> <out.png> [--debug]");
  process.exit(1);
}

var r = run(args[0], args[1], debug);
console.log(
  path.basename(args[0]).padEnd(22) + r.src + " -> " + r.out.padEnd(11) +
  "bg " + r.bg + (r.dropped ? "   dropped " + r.dropped + "px of speck" : "") +
  (r.pockets ? "   keyed " + r.pockets + "px of enclosed background" : "")
);
