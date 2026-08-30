/* ================================================================
   Plan the notes and cut their clearings to them —
     node tools/mapnote.js tools/shape.json
          [--size 17] [--lh 1.5] [--margin 35] [--out tools/clearings.json]

   WHY THIS EXISTS. VEN, 2026-08-27, on the third pass at the notes:
   *"keep the original font, just make it fit in the clearings
   properly ... make it so that there is a uniform gap between the
   edge of the clearing and the edge of the block of text, if the
   clearing is too big (ie too much blank space) reduce the size of
   the clearing and restore the original background in those
   locations. I want a uniform block of text, i dont want parts of
   the text sticking out."*

   So the order of things is INVERTED from the earlier passes. The
   note is laid out first, as a plain rectangular block — the copy
   wrapped to one measure in the display serif, the caption above —
   at a size fixed in SHEET units, so it is the same block on every
   device; then the clearing is cut to that block plus one constant
   margin, and the terrain outside it is the terrain again. The
   block sits inside the loop VEN drew (tools/clearings-search.json),
   as high in it and as near the road as the loop allows, off the
   road, the landmark and the Korean name.

   INPUT is what `maproute --clear tools/clearings-search.json --plan
   --shape-out tools/shape.json` writes: per stop, the clean run of
   cells on every row of the loop (with --plan, "clean" ignores ink —
   the loop has not been cut yet — but keeps the road, the landmark
   and the name out). The copy comes from js/journey.js, the words'
   widths from tools/songmyung-widths.json (measured in the browser,
   see there), so the wrap here is the wrap the page will make.

   OUTPUT: --out (default tools/clearings.json), the loops mapclear
   cuts — a rounded rectangle round each block — and on stdout the
   MAP_CLEAR array for js/journey.js: the text block per stop (`box`,
   normalised) and its size (`fs`, in map units of a 1000-wide sheet).

   Then, in order: mapclear on both masters with the new json,
   mapprep, and maproute on the result (README, THE CLEARINGS).
================================================================= */

var fs   = require("fs");
var path = require("path");

/* ---- knobs (all overridable on the command line) ---------------- */

var SIZE   = 13.5;   // copy size, map units (sheet width = 1000). 17 until
                     // VEN: "scale down all of the english text" — a fifth
                     // smaller: ~21px on his 960px window, ~11px on a phone
var LH     = 1.38;   // line height, ems — the block's rhythm (COPY_LH in
                     // journey.js; 1.5 "looks too dispersed", VEN)
var MARGIN = 24;     // map units of paper between the text and the loop's line;
                     // mapclear's FEATHER must ramp inside this, see there
var CAP    = 0.82;   // caption size, ems of the copy (small caps, tracked .2em)
var CAP_SP = 0.2;    // that tracking
var MEAS_MAX = 36, MEAS_MIN = 18;   // measure, in characters, widest first
/* THE CAPTION is not in the block since 2026-08-27 (VEN: "move the
   ENGLISH names for each location back underneath the corresponding
   image, add a mini 'clearing' behind each name if required"). It
   sits at the anchor maproute --caption found under the building, at
   CAP_SIZE map units (CAPU in js/journey.js — the same number), and
   gets a small loop of its own only where the darkest cell under it
   (`cap.peak` in shape.json) is past CAP_INK — on the ground wash it
   needs none, which is what "if required" means. */
var CAP_SIZE = 9.5, CAP_MARGIN = 20, CAP_INK = 0.03;
/* per-stop ceilings on the measure (`--measmax 36,36,36,18`). Jeonju's is
   the low one: its name stands west of the seal and its note east of
   the village, and on a 390px phone at PHONE_ZOOM 2.0 the frame is 500
   units — a 23-character block there ran 15px off the right edge.
   IT IS A WIDTH, WRITTEN AS CHARACTERS: the measure is `chars *
   fallbackEm` for EVERY stop, measured words or not — fallbackEm sets
   the wrap target, it is not only the estimate for words the table is
   missing. So when fallbackEm was corrected from a hand-written 0.44
   to the measured 0.486 (2026-08-28) the same width became 18
   characters instead of 20.

   KEEP `MEAS_CAP[3] * fallbackEm` AT ABOUT 8.75. Every re-run of
   tools/widths.html recomputes fallbackEm over the whole vocabulary,
   so this number has to be re-derived with it: 20*0.44, 18*0.486 and
   18*0.483 are all ~8.7 em, the measure Jeonju's block has had since
   §9ab.12. It went briefly to 20 on 2026-08-30 against a fallbackEm of
   0.434, and 0.434 was itself wrong — tools/widths.html was measuring
   in Times, not Song Myung. The real number is 0.483, close to the
   0.486 that had been guessed, so the cap is 18 again.
   Leave it alone across a widths re-measure and its note quietly
   grows into the span a 390px phone's frame cannot hold. */
var MEAS_CAP = [36, 36, 36, 18];
/* per-stop ceilings on the size (`--sizes 13.5,11,13.5,10`). SIZE alone
   is a common cap, and a narrow loop that could never reach it (the
   terraces, Jeonju) would not shrink with the others when SIZE is
   lowered — VEN asked for ALL the text a fifth smaller, so each stop's
   ceiling is a fifth under what it had (16 / 13 / 17 / 12). */
var SIZE_CAP = [13.5, 11, 13.5, 10];
var RADIUS = 30;     // the loop's corner radius, map units
/* map units of PAPER between one block of a split note and the next
   (`--gap 26`) — the paragraph space, measured text-edge to text-edge.

   IT IS DELIBERATELY SMALLER THAN 2*MARGIN, so consecutive clearings
   OVERLAP and mapclear cuts them as one stepped region rather than as
   three islands with terrain between. Three islands is what Zico's
   markup literally drew, and it was built and measured that way
   first: three separate clearings cost 3*2*MARGIN of the loop's
   height instead of 2*MARGIN, which is 96 units of a loop that only
   has ~430, and mapnote answered by dropping the type from 13 units
   to 8.5 — smaller than anything on the sheet, on the note the client
   most wants read. Overlapping the clearings buys all of that back and
   still reads as three blocks, because the eye reads the TEXT's gaps,
   not the paper's edges. */
var GAP = 26;
/* ems of tolerance added to a block's width — see block() */
var SLACK = 0.35;
/* `mw` — THE MEASURE THE WRAP WAS PLANNED AT, in map units, emitted
   beside every box. The box is only as wide as the longest line the
   wrap produced, which is NOT the width it was wrapped to: a six-line
   block can easily leave 6 units unused, a one-line block 40. The page
   used to re-wrap to the BOX, so it wrapped at a narrower measure than
   this tool did and broke lines this tool had fitted — 12 planned
   lines came out as 15 the first time stop 1 was split (2026-08-30),
   with "This is where the road starts." orphaning its last word.
   js/journey.js reflows to `mw` now and centres the result in `box`. */

/* ---- args ------------------------------------------------------- */

var argv = process.argv.slice(2), src = null, OUT = path.join(__dirname, "clearings.json"), i;
for (i = 0; i < argv.length; i++){
  if (argv[i] === "--size") SIZE = +argv[++i];
  else if (argv[i] === "--lh") LH = +argv[++i];
  else if (argv[i] === "--margin") MARGIN = +argv[++i];
  else if (argv[i] === "--out") OUT = argv[++i];
  else if (argv[i] === "--measmax") MEAS_CAP = argv[++i].split(",").map(Number);
  else if (argv[i] === "--sizes") SIZE_CAP = argv[++i].split(",").map(Number);
  else src = argv[i];
}
if (!src){
  console.error("usage: node tools/mapnote.js tools/shape.json [--size 17] [--lh 1.5] [--margin 35] [--out tools/clearings.json]");
  process.exit(1);
}

var shape  = JSON.parse(fs.readFileSync(src, "utf8"));
var widths = JSON.parse(fs.readFileSync(path.join(__dirname, "songmyung-widths.json"), "utf8"));
var js     = fs.readFileSync(path.join(__dirname, "..", "js", "journey.js"), "utf8");

/* the copy and the names, lifted from SPOTS the way build.js lifts TYPES.

   TAKE THE QUOTED STRINGS, do not strip the array's commas with a
   replace: `copy` is prose and the prose has commas in it. Until
   2026-08-28 this joined the lines by replacing every comma-plus-
   space with a space, which ate the separators AND every comma inside
   a sentence, so the tool planned the wrap over "Upbit" while the
   page drew "Upbit,".
   Every comma-bearing word then missed the widths table and fell back
   to 0.44em a character — an under-estimate — so the block was
   planned shorter than it renders and the note ran past the paper cut
   for it. It survived because the old copy had five such words in
   four notes; the copy of 2026-08-28 has thirty. */
/* A STOP'S COPY IS A LIST OF BLOCKS since 2026-08-30 — one string per
   clearing. `copy: ["a", "b"]` is one block of two authored lines;
   `copy: [["a"], ["b"]]` is two blocks of one. So the brackets have to
   be walked rather than matched with one regex: find `copy: [`, scan
   to its partner counting depth and skipping string bodies, and group
   the quoted strings by the sub-array they sit in. COPY[k] is always
   an array, length 1 for an unsplit stop. */
function copyBlocksOf(body){
  var out = [], cur = null, depth = 0, inStr = false, buf = "", i, ch;
  for (i = 0; i < body.length; i++){
    ch = body[i];
    if (inStr){
      if (ch === '"'){ inStr = false; (cur || (cur = [])).push(buf); buf = ""; }
      else buf += ch;
      continue;
    }
    if (ch === '"'){ inStr = true; continue; }
    if (ch === "["){ depth++; if (depth === 2) cur = []; }
    else if (ch === "]"){ depth--; if (depth === 1 && cur){ out.push(cur); cur = null; } }
  }
  if (cur && cur.length) out.push(cur);        /* the flat form */
  return out.map(function(g){ return g.join(" ").replace(/\s+/g, " ").trim(); })
            .filter(function(t){ return t.length; });
}
var COPY = [], NAMES = [], re = /name:\s*"([^"]+)"[\s\S]*?copy:\s*\[/g, m;
while ((m = re.exec(js))){
  var i0 = re.lastIndex - 1, depth = 0, inStr = false, i, ch;
  for (i = i0; i < js.length; i++){
    ch = js[i];
    if (inStr){ if (ch === '"') inStr = false; continue; }
    if (ch === '"'){ inStr = true; continue; }
    if (ch === "[") depth++;
    else if (ch === "]" && !--depth) break;
  }
  NAMES.push(m[1]);
  COPY.push(copyBlocksOf(js.slice(i0, i + 1)));
  re.lastIndex = i + 1;
}
if (COPY.length !== shape.stops.length)
  throw new Error("found " + COPY.length + " copy blocks in js/journey.js for " + shape.stops.length + " stops");

/* SAY SO WHEN THE WRAP IS GUESSED. The plan is only as good as the
   widths: a word this table has not seen is estimated at fallbackEm a
   character, the page then draws the real one, and the difference
   comes out as a line the block was not planned for — text past the
   paper cut for it. Cheap to fix (open tools/widths.html on the dev
   server and save the result), and impossible to notice without this. */
var ALL = COPY.map(function(p){ return p.join(" "); });
var unmeasured = [];
ALL.forEach(function(t){
  t.split(" ").forEach(function(w){
    if (w && widths.words[w] == null && unmeasured.indexOf(w) < 0) unmeasured.push(w);
  });
});
if (unmeasured.length){
  var seen = 0, tot = 0;
  ALL.forEach(function(t){ t.split(" ").forEach(function(w){ tot++; if (widths.words[w] == null) seen++; }); });
  console.error("  ! " + unmeasured.length + " of the copy's distinct words are NOT measured (" +
                seen + " of " + tot + " on the sheet), so their width is a guess at " +
                widths.fallbackEm + "em a character:");
  console.error("    " + unmeasured.slice(0, 24).join(" ") + (unmeasured.length > 24 ? " …" : ""));
  console.error("    Run tools/widths.html on the dev server and save it over " +
                "tools/songmyung-widths.json, then re-run this.");
  console.error("");
}

/* the sheet: a 1000-wide map, its height from the grid's aspect */
var MW = 1000, MH = 1000 * shape.rows / shape.cols;

/* ---- widths ----------------------------------------------------- */

function wordEm(w){
  var v = widths.words[w];
  return v != null ? v : w.length * widths.fallbackEm;
}
/* a line's width in ems at the copy size: words, spaces, and the .01em
   tracking js/journey.js sets per character */
function lineEm(words){
  var em = 0, chars = 0, j;
  for (j = 0; j < words.length; j++){ em += wordEm(words[j]); chars += words[j].length; }
  em += (words.length - 1) * widths.space;
  chars += words.length - 1;
  return em + Math.max(0, chars - 1) * 0.01;
}
function capLineEm(words){
  var s = words.join(" ");
  return (s.length * widths.capEm + Math.max(0, s.length - 1) * CAP_SP) * CAP;
}
/* greedy wrap to a measure in ems; returns lines as word arrays */
function wrap(words, measureEm, emOf){
  var lines = [], cur = [], j;
  for (j = 0; j < words.length; j++){
    var t = cur.concat([words[j]]);
    if (cur.length && emOf(t) > measureEm){ lines.push(cur); cur = [words[j]]; }
    else cur = t;
  }
  if (cur.length) lines.push(cur);
  return lines;
}

/* ---- the block ---------------------------------------------------- */

/* lay the note out at size S (units) to a measure of `chars` characters:
   the block's width and height in units, and its lines */
function block(text, S, chars){
  var measure = chars * widths.fallbackEm;                 /* ems */
  var lines = wrap(text.split(" "), measure, lineEm);
  var w = 0, j;
  for (j = 0; j < lines.length; j++) w = Math.max(w, lineEm(lines[j]));
  /* the same arithmetic as setBlock in js/journey.js — the copy alone,
     the caption is under the building now */
  var h = lines.length * LH - 0.3;
  /* THE BOX GETS A HAIR MORE THAN THE TEXT MEASURES. The page wraps to
     the box with its own canvas measureText, and the two arithmetics
     are not bit-identical: this one sums word widths plus a constant
     `space`, the page measures the whole string with its real spaces
     in it. A few thousandths of an em either way is invisible in a
     six-line block and decides the wrap in a ONE-line one — "This is
     where the road starts." came back broken after "road" the first
     time stop 1 was split (2026-08-30). SLACK is ems, and it widens
     the box and its clearing, never the measure the wrap was planned
     at. */
  return { w: w * S + SLACK * S, mw: measure * S, h: h * S, cap: [], lines: lines, S: S, chars: chars };
}

/* a rounded rectangle, normalised, r units of corner */
function roundRect(lx0, ly0, lx1, ly1, r){
  var poly = [], c;
  r = Math.min(r, (lx1 - lx0) / 2, (ly1 - ly0) / 2);
  [[lx1 - r, ly0 + r, -Math.PI / 2, 0], [lx1 - r, ly1 - r, 0, Math.PI / 2],
   [lx0 + r, ly1 - r, Math.PI / 2, Math.PI], [lx0 + r, ly0 + r, Math.PI, Math.PI * 1.5]].forEach(function(cn){
    for (c = 0; c <= 4; c++){
      var a = cn[2] + (cn[3] - cn[2]) * c / 4;
      poly.push([+((cn[0] + r * Math.cos(a)) / MW).toFixed(4), +((cn[1] + r * Math.sin(a)) / MH).toFixed(4)]);
    }
  });
  return poly;
}

/* ---- placement ---------------------------------------------------- */

/* the usable runs per row, in units */
function runsOf(st){
  var sh = st.shape, out = [], j;
  for (j = 0; j < sh.rows.length; j++){
    var r = sh.rows[j];
    out.push(r ? [r[0] * MW, r[1] * MW] : null);
  }
  return { top: sh.top * MH, dy: sh.dy * MH, runs: out };
}

/* the x-interval the block's centre may take so that the block plus
   its margin sits inside every row it spans, or null */
function fitAt(R, y0, y1, halfW){
  var r0 = Math.floor((y0 - R.top) / R.dy), r1 = Math.floor((y1 - R.top - 1e-6) / R.dy), j;
  if (r0 < 0 || r1 >= R.runs.length) return null;
  var lo = -Infinity, hi = Infinity;
  for (j = r0; j <= r1; j++){
    if (!R.runs[j]) return null;
    lo = Math.max(lo, R.runs[j][0] + halfW);
    hi = Math.min(hi, R.runs[j][1] - halfW);
  }
  return lo <= hi ? [lo, hi] : null;
}

/* ONE BLOCK PER PART — IN ITS OWN LOOP, OR STACKED IN ONE.

   A stop whose copy is split (COPY[k].length > 1) gets a clearing per
   part. Where the shape file carries one loop per part (`shapes`, from
   maproute --plan over a clearings-search.json with several loops for
   the stop), block i goes in loop i — that is Zico's markup for
   Gyeongbokgung, 2026-08-30: three loops down the sheet, "split it
   into 3 so its spaced out a little", one beside the palace, one where
   the note was, one lower-left across the road. With a single loop the
   blocks stack down it, GAP apart, which is how the first cut of this
   was built and what a stop with no markup of its own still gets.

   The parts share ONE SIZE — they are one note read in sequence, and a
   size change between them reads as two voices — but each picks its
   OWN MEASURE: the measure is a property of the loop the block sits
   in, not of the voice, and a one-line closing part in a loop that
   straddles the road has to be allowed to break in two without forcing
   the six-line opening part narrow with it. So the search is over size
   alone, descending, and a size wins when EVERY part finds a home at
   it, each at the widest measure its loop allows. */
function placeOne(R, sx, text, S, measMax, yMin){
  var bottom = R.top + R.runs.length * R.dy, chars, y;
  /* MEAS_MIN keeps a paragraph from being set as a ribbon, but a
     thirty-character closing line is not a paragraph: in a loop the
     road cuts in two — Zico's third, 2026-08-30 — the widest run is
     ~125 units, and an 18-character floor (87 units of text plus the
     margins) can never fit it, while the same words on two lines of
     fifteen fit easily. So the floor is MEAS_MIN or half the text,
     whichever is less, and never under ten. */
  var minChars = Math.max(10, Math.min(MEAS_MIN, Math.ceil(text.length / 2)));
  for (chars = measMax; chars >= minChars; chars--){
    var b = block(text, S, chars), halfW = b.w / 2 + MARGIN;
    /* the rows this block needs are its own PLUS its margin band top
       and bottom — the clearing has to clear the text on every side,
       whether or not it merges with a neighbour */
    for (y = yMin; y + b.h + MARGIN <= bottom; y += R.dy / 2){
      var iv = fitAt(R, y - MARGIN, y + b.h + MARGIN, halfW);
      if (!iv) continue;
      /* as near the road as the interval allows — in a funnel loop
         that is what walks stacked blocks left as they descend */
      return { b: b, cx: Math.max(iv[0], Math.min(iv[1], sx)), y0: y };
    }
  }
  return null;
}
function place(Rs, sx, parts, S, measMax){
  /* part i goes to loop i, and once the loops run out the LAST loop
     takes every part left, stacked GAP apart. One loop: all stacked.
     A loop per part: one each. Two loops for three parts: the first
     alone, the other two under each other — VEN, 2026-08-30: *"put
     'this is where the road starts' under the paragraph that reads
     'upbit...'"*, which is the closer stacked under the second block
     in Zico's second loop, and the third loop retired. */
  var out = [], i, g, li, prev = -1, yMin = 0;
  for (i = 0; i < parts.length; i++){
    li = Math.min(i, Rs.length - 1);
    if (li !== prev) yMin = Rs[li].top + MARGIN;
    g = placeOne(Rs[li], sx, parts[i], S, measMax, yMin);
    if (!g) return null;
    out.push(g);
    yMin = g.y0 + g.b.h + GAP;
    prev = li;
  }
  return out;
}

var loops = [], clear = [];
shape.stops.forEach(function(st, k){
  if (!st.shape){ loops.push(null); clear.push(null); return; }
  var parts = COPY[k], sx = st.x * MW, best = null, S;
  /* one loop per part when the shape file has them and they pair up;
     otherwise the stop's single loop for all of them */
  var Rs = (st.shapes && st.shapes.length > 1 && st.shapes.every(Boolean))
    ? st.shapes.map(function(sh){ return runsOf({ shape: sh }); })
    : [runsOf(st)];
  if (Rs.length > parts.length)
    console.error("  stop " + (k + 1) + ": " + Rs.length + " loops for " + parts.length +
                  " block(s) — the extra loop(s) get nothing");
  /* the largest size that places every part; each at the widest
     measure its own loop allows, at the highest start */
  var measMax = Math.min(MEAS_MAX, MEAS_CAP[k] || MEAS_MAX);
  for (S = Math.min(SIZE, SIZE_CAP[k] || SIZE); S >= 8 && !best; S -= 0.5)
    best = place(Rs, sx, parts, S, measMax);
  if (!best){
    console.error("  stop " + (k + 1) + ": no block fits its loop — widen the loop or lower --size");
    loops.push(null); clear.push(null); return;
  }
  var boxes = best.map(function(g){
    var b2 = g.b, x0 = g.cx - b2.w / 2, x1 = g.cx + b2.w / 2, y0 = g.y0, y1 = y0 + b2.h;
    console.log("  stop " + (k + 1) + (best.length > 1 ? "." + (best.indexOf(g) + 1) : "  ") + " " +
                b2.S + " units, " + b2.chars + "-char measure, " +
                b2.cap.length + "+" + b2.lines.length + " lines, block " +
                Math.round(b2.w) + "x" + Math.round(b2.h) +
                " at " + (x0 / MW).toFixed(3) + "," + (y0 / MH).toFixed(3));
    /* the loop: a rounded rectangle MARGIN outside the block */
    loops.push({ stop: k + 1, poly: roundRect(x0 - MARGIN, y0 - MARGIN, x1 + MARGIN, y1 + MARGIN, RADIUS) });
    return { box: [x0 / MW, y0 / MH, x1 / MW, y1 / MH], fs: b2.S, mw: +b2.mw.toFixed(1) };
  });
  clear.push(boxes.length > 1 ? boxes : boxes[0]);

  /* the caption's own small clearing, only where the paper under the
     anchor carries real ink */
  if (st.cap){
    var cw = capLineEm(NAMES[k].toUpperCase().split(" ")) / CAP * CAP_SIZE,   /* units, at CAP_SIZE */
        ccx = st.cap.x * MW, ccy = st.cap.y * MH;
    var cb = { x0: ccx - cw / 2, x1: ccx + cw / 2, y0: ccy - CAP_SIZE * 0.85, y1: ccy + CAP_SIZE * 0.3 };
    console.log("          caption at " + st.cap.x.toFixed(3) + "," + st.cap.y.toFixed(3) +
                ", " + Math.round(cw) + " units wide, ink under it " + st.cap.peak +
                (st.cap.peak >= CAP_INK ? " -> its own clearing" : " -> on the paper as it is"));
    if (st.cap.peak >= CAP_INK)
      loops.push({ stop: k + 1, caption: true,
                   poly: roundRect(cb.x0 - CAP_MARGIN, cb.y0 - CAP_MARGIN, cb.x1 + CAP_MARGIN, cb.y1 + CAP_MARGIN, CAP_MARGIN) });
  }
});

fs.writeFileSync(OUT, JSON.stringify(loops.filter(Boolean), null, 1));
console.log("  written " + OUT);
console.log("");
console.log("  /* the note per stop: `box` is the text block [x0, y0, x1, y1],");
console.log("     `fs` its copy size in map units — from tools/mapnote.js, the");
console.log("     clearing is cut MARGIN outside it. Paste over MAPS.ink.clear. */");
console.log("  var MAP_CLEAR = [");
function one(c){
  return "{ box: [" + c.box.map(function(v){ return v.toFixed(3); }).join(", ") +
         "], fs: " + c.fs + ", mw: " + c.mw + " }";
}
console.log(clear.map(function(c){
  if (!c) return "    null";
  if (!Array.isArray(c)) return "    " + one(c);
  return "    [" + c.map(function(b){ return "\n      " + one(b); }).join(",") + "\n    ]";
}).join(",\n"));
console.log("  ];");
