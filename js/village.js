/* ================================================================
   VILLAGE — one hanok per $100k of market cap.

   Fifteen plots in a field; the road from the journey arrives at
   the front and the village grows around it. Empty plots are drawn
   as faint survey marks so the room to grow is visible.

   Live wiring later:  window.HANOK.setVillage({ marketCap, holders })

   ---- URL switches (session 5) ---------------------------------
   The houses were the last placeholder-grade art left on the page:
   flat vector boxes with a solid black roof blob, sitting next to
   the journey's keyed watercolours. Both treatments are kept, same
   discipline as ?panels= / ?road= in journey.js.

     ?houses=ink   (default) tiled roofs, timber posts, bracket
                   band, stone base, per-plot variation
     ?houses=flat  the original flat art, untouched

     ?field=hill   (default) a far ridge + mist behind the village
     ?field=bare   the original empty upper field

     ?rough=1      ink wobble on the buildings; ?rough=0 turns the
                   displacement filter off entirely
================================================================= */

(function(){
  "use strict";

  var svg = document.getElementById("villageField");
  if (!svg) return;
  var plate = document.getElementById("villagePlate");

  var CFG = (window.HANOK_CONFIG || {}).village ||
            { marketCap: 0, holders: 0, perRoof: 100000, maxRoofs: 20 };
  var reduced = window.HANOK_REDUCED();

  var INK = "#211B11", PINE = "#5C6648", PAPER = "#EBDDB9", SEAL = "#8E4A38";
  /* the page's own sheet (--paper), for mist that recedes into it */
  var SHEET = "#DFCEA5";

  /* ---- URL switches ---------------------------------------------- */

  function word(name, dflt){
    var m = new RegExp("[?&]" + name + "=([a-z]+)", "i").exec(location.search);
    return m ? m[1].toLowerCase() : dflt;
  }
  function num(name, dflt){
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(location.search);
    var v = m ? parseFloat(decodeURIComponent(m[1])) : NaN;
    return isFinite(v) ? v : dflt;
  }

  var HOUSES = word("houses", "ink");
  var FIELD  = word("field",  "hill");
  var ROUGH  = num("rough", 1);
  /* ?sleep=0 turns the sleeping Z's off; ?sleep=N sets the share of
     dwellings that sleep (PLAN 3B.4 named the switch, so this is it) */
  var SLEEP  = num("sleep", 0.3);

  function n(v){ return Math.round(v * 10) / 10; }

  /* deterministic per-plot variation in -1..1. Seeded, so a re-render
     never reshuffles the village — the same plot is always the same
     house. */
  function jit(i, salt){
    var x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1;
  }

  function roofPath(x, y, w, h, lift){
    /* same hanok silhouette as journey.js: level ridge, sagging eave,
       upturned tips */
    var l = x, r = x + w;
    return "M" + l + " " + (y + h - lift) +
      " C" + (l + w * .28) + " " + (y + h * 1.04) + " " + (r - w * .28) + " " + (y + h * 1.04) + " " + r + " " + (y + h - lift) +
      " C" + (r - w * .08) + " " + (y + h * .5) + " " + (r - w * .12) + " " + (y + h * .2) + " " + (r - w * .2) + " " + y +
      " C" + (r - w * .34) + " " + (y + h * .12) + " " + (l + w * .34) + " " + (y + h * .12) + " " + (l + w * .2) + " " + y +
      " C" + (l + w * .12) + " " + (y + h * .2) + " " + (l + w * .08) + " " + (y + h * .5) + " " + l + " " + (y + h - lift) + " Z";
  }

  /* ================================================================
     FLAT — the original three variants, kept verbatim. ?houses=flat
  ================================================================= */

  function flatHouse(){
    return '<path d="M30 100 v-40 h80 v40" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>' +
           '<path d="' + roofPath(18, 32, 104, 26, 11) + '" fill="' + INK + '"/>' +
           '<path d="M60 100 v-24 h20 v24" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
  }

  function flatLhouse(){
    return '<path d="M14 100 v-32 h56 v32" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.8"/>' +
           '<path d="' + roofPath(6, 44, 72, 22, 9) + '" fill="' + INK + '"/>' +
           '<path d="M62 100 v-42 h64 v42" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.8"/>' +
           '<path d="' + roofPath(54, 30, 80, 24, 10) + '" fill="' + INK + '"/>' +
           '<path d="M80 100 v-20 h18 v20" fill="none" stroke="' + INK + '" stroke-width="2.2"/>';
  }

  function flatPavilion(){
    return '<rect x="34" y="90" width="72" height="10" fill="none" stroke="' + INK + '" stroke-width="2.6"/>' +
           '<path d="M46 90 v-30 M70 90 v-30 M94 90 v-30" stroke="' + PINE + '" stroke-width="4.6"/>' +
           '<rect x="38" y="52" width="64" height="8" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.4"/>' +
           '<path d="' + roofPath(26, 26, 88, 24, 10) + '" fill="' + INK + '"/>';
  }

  /* ================================================================
     INK — the same three buildings redrawn in the site's own
     vocabulary. What made the flat version read as clip-art, and
     what each piece here answers:

       solid black roof blob  -> tiled roof: body at .82 ink, pale
                                 tile ribs fanning ridge-to-eave, and
                                 the darkest values saved for the
                                 ridge beam and the eave edge. That
                                 is how the roofs read in
                                 `hand drawn reference.jpg` — grey
                                 tile, black only at the edges.
       nothing under the eave -> the bracket band (공포). One pine
                                 strip with ink ticks; the single
                                 strongest hanok signal there is.
       flat paper rectangles  -> stone base course, timber posts,
                                 lattice door.
       fifteen identical boxes-> jit() varies width, wall height,
                                 door position and roof lift per plot.
       floating on the paper  -> a soft ground ellipse per plot.

     All of it stays inside the two-material rule: paper, ink, and
     pine for timber. No new colour enters the palette.
  ================================================================= */

  function shadow(cx, gy, rx){
    return '<ellipse cx="' + n(cx) + '" cy="' + n(gy + 2) + '" rx="' + n(rx) +
           '" ry="4.5" fill="' + INK + '" opacity=".09"/>';
  }

  function roof(x, y, w, h, lift, seed){
    var l = x, r = x + w, s = "", i;

    /* body — never pure black, or it goes back to being a blob */
    s += '<path d="' + roofPath(x, y, w, h, lift) + '" fill="' + INK + '" opacity=".74"/>';

    /* tile ribs, fanning out from the ridge to the wider eave */
    var ribs = 4 + Math.round(w / 20);
    for (i = 1; i < ribs; i++){
      var t  = i / ribs;
      var x0 = l + w * .2 + t * w * .6, y0 = y + h * .16;
      var x1 = l + w * .06 + t * w * .88, y1 = y + h * .88;
      s += '<path d="M' + n(x0) + ' ' + n(y0) + ' Q' + n((x0 + x1) / 2) + ' ' +
           n((y0 + y1) / 2 + h * .06) + ' ' + n(x1) + ' ' + n(y1) +
           '" fill="none" stroke="' + PAPER + '" stroke-width="1.1" opacity=".38"/>';
    }

    /* ridge beam sitting on top of the tiles */
    s += '<path d="M' + n(l + w * .13) + ' ' + n(y + h * .09) +
         ' C' + n(l + w * .34) + ' ' + n(y - h * .04) +
         ' '  + n(r - w * .34) + ' ' + n(y - h * .04) +
         ' '  + n(r - w * .13) + ' ' + n(y + h * .09) +
         '" fill="none" stroke="' + INK + '" stroke-width="' + n(Math.max(2.2, h * .13)) +
         '" stroke-linecap="round"/>';

    /* eave edge — the heavy line the whole roof hangs from */
    s += '<path d="M' + n(l) + ' ' + n(y + h - lift) +
         ' C' + n(l + w * .28) + ' ' + n(y + h * 1.04) +
         ' '  + n(r - w * .28) + ' ' + n(y + h * 1.04) +
         ' '  + n(r) + ' ' + n(y + h - lift) +
         '" fill="none" stroke="' + INK + '" stroke-width="1.7" stroke-linecap="round"/>';

    return s;
  }

  function brackets(x, y, w){
    /* 공포 — the bracketing between wall head and eave */
    var s = '<path d="M' + n(x) + ' ' + n(y) + ' h' + n(w) + ' v5 h' + n(-w) +
            ' Z" fill="' + PINE + '" opacity=".6"/>', i;
    var cnt = Math.max(3, Math.round(w / 15));
    for (i = 0; i <= cnt; i++){
      s += '<path d="M' + n(x + w * i / cnt) + ' ' + n(y) +
           ' v5" stroke="' + INK + '" stroke-width="1.2" opacity=".5"/>';
    }
    return s;
  }

  function bay(x, gy, w, wallH, seed){
    /* stone base -> paper wall -> timber posts -> head beam */
    var s = "", top = gy - wallH, i;

    s += '<path d="M' + n(x - 5) + ' ' + n(gy) + ' h' + n(w + 10) +
         '" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/>';
    s += '<path d="M' + n(x - 3) + ' ' + n(gy - 4.5) + ' h' + n(w + 6) +
         '" stroke="' + INK + '" stroke-width="1.2" opacity=".4"/>';

    s += '<path d="M' + n(x) + ' ' + n(gy) + ' V' + n(top) + ' H' + n(x + w) +
         ' V' + n(gy) + '" fill="' + PAPER + '" stroke="' + INK +
         '" stroke-width="2.4" stroke-linejoin="round"/>';

    var posts = Math.max(2, Math.round(w / 24));
    for (i = 0; i <= posts; i++){
      var edge = (i === 0 || i === posts);
      s += '<path d="M' + n(x + w * i / posts) + ' ' + n(gy) + ' V' + n(top + 2) +
           '" stroke="' + PINE + '" stroke-width="' + (edge ? 3.2 : 2) +
           '" opacity="' + (edge ? ".9" : ".45") + '"/>';
    }

    s += '<path d="M' + n(x - 3) + ' ' + n(top + 3) + ' h' + n(w + 6) +
         '" stroke="' + INK + '" stroke-width="1.6" opacity=".55"/>';
    return s;
  }

  function door(cx, gy, w, h){
    var x = cx - w / 2, top = gy - h, s = "", i;
    s += '<path d="M' + n(x) + ' ' + n(gy) + ' V' + n(top) + ' H' + n(x + w) +
         ' V' + n(gy) + '" fill="none" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M' + n(cx) + ' ' + n(gy) + ' V' + n(top) +
         '" stroke="' + INK + '" stroke-width="1.1" opacity=".65"/>';
    for (i = 1; i <= 3; i++){
      s += '<path d="M' + n(x + 1.5) + ' ' + n(top + h * i / 4) + ' h' + n(w - 3) +
           '" stroke="' + INK + '" stroke-width="1" opacity=".4"/>';
    }
    return s;
  }

  /* Eave overhang, per side. Generous — a hanok roof reaches well past
     its wall — but the first pass used +17 on an 80-wide wall and every
     house read as a mushroom cap on a stalk. */
  var OVER = num("over", 11);

  function inkHouse(seed){
    var w     = 80 + jit(seed, 1) * 7,
        wallH = 34 + jit(seed, 2) * 4,
        x     = 70 - w / 2,
        gy    = 100,
        rh    = 22,
        bandY = gy - wallH - 3,
        s     = "";
    s += shadow(70, gy, w * .78);
    s += bay(x, gy, w, wallH, seed);
    s += door(70 + jit(seed, 3) * 9, gy, 17, wallH * .64);
    s += brackets(x - 6, bandY, w + 12);
    s += roof(x - OVER, bandY - rh, w + OVER * 2, rh, 9 + jit(seed, 4) * 1.2, seed);
    return s;
  }

  function inkLhouse(seed){
    /* two wings, the near one taller — an L-plan house seen corner-on */
    var gy = 100, s = "";
    var wA = 50 + jit(seed, 1) * 5, wB = 60 + jit(seed, 2) * 5,
        hA = 29 + jit(seed, 3) * 3, hB = 39 + jit(seed, 4) * 3;
    var xA = 16, xB = 68;

    s += shadow(70, gy, 62);
    /* far wing first — painter order within the building */
    s += bay(xA, gy, wA, hA, seed);
    s += brackets(xA - 5, gy - hA - 3, wA + 10);
    s += roof(xA - OVER * .85, gy - hA - 3 - 19, wA + OVER * 1.7, 19, 8, seed);

    s += bay(xB, gy, wB, hB, seed + 5);
    s += door(xB + wB * .5 + jit(seed, 6) * 6, gy, 16, hB * .55);
    s += brackets(xB - 6, gy - hB - 3, wB + 12);
    s += roof(xB - OVER, gy - hB - 3 - 21, wB + OVER * 2, 21, 9, seed + 5);
    return s;
  }

  function inkPavilion(seed){
    /* 정자 — an open pavilion: raised deck, bare posts, no walls */
    var gy = 100, s = "", i;
    var w = 70 + jit(seed, 1) * 6, x = 70 - w / 2, deckY = gy - 12,
        postH = 30 + jit(seed, 2) * 3, topY = deckY - postH;

    s += shadow(70, gy, w * .8);
    /* stone stylobate */
    s += '<path d="M' + n(x - 8) + ' ' + n(gy) + ' h' + n(w + 16) +
         '" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/>';
    s += '<path d="M' + n(x - 4) + ' ' + n(deckY) + ' h' + n(w + 8) + ' v' + n(12) +
         ' h' + n(-(w + 8)) + ' Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.2"/>';
    /* posts */
    for (i = 0; i <= 3; i++){
      s += '<path d="M' + n(x + w * i / 3) + ' ' + n(deckY) + ' V' + n(topY) +
           '" stroke="' + PINE + '" stroke-width="' + (i === 0 || i === 3 ? 4 : 3) + '"/>';
    }
    /* railing between the posts */
    s += '<path d="M' + n(x) + ' ' + n(deckY - 9) + ' h' + n(w) +
         '" stroke="' + INK + '" stroke-width="1.4" opacity=".55"/>';
    s += '<path d="M' + n(x) + ' ' + n(topY + 3) + ' h' + n(w) +
         '" stroke="' + INK + '" stroke-width="1.6" opacity=".6"/>';
    s += brackets(x - 6, topY, w + 12);
    s += roof(x - OVER * 1.15, topY - 22, w + OVER * 2.3, 22, 10, seed);
    return s;
  }

  var VARIANTS = HOUSES === "flat"
    ? [flatHouse, flatLhouse, flatPavilion]
    : [inkHouse, inkLhouse, inkPavilion];

  /* ---- plots, in the order the village grows them ---------------
     y = ground line, k = perspective scale. Painter order is by y. */

  /* ---- the plots ------------------------------------------------

     ONE list, used by both renderings, so the painted village and the
     SVG fallback can never drift apart.

       x, y  the building's GROUND-LINE CENTRE, as a fraction of the
             SQUARE MASTER (art/village/field-square.png). y is where it
             stands, not where its top is — a building can be any height
             and still sit correctly. Authoring against the master, not
             against whichever band is shipping, is what lets ?plate=
             switch crops without every building floating off its
             ground; PLATE_CROP does the remap.
       w     its width, as a fraction of the plate's WIDTH. The bands
             are cut vertically only, so width needs no remapping.
       row   0 back / 1 mid / 2 front. Decides scale in the SVG, and
             which building types are eligible in the painted one.

     Array ORDER is build order: plot 0 is raised first, at $100k.
     Painter order is by y and is computed separately — a plot raised
     late can still stand behind one raised early.

     These values are derived from the old 900x380 SVG field, i.e. they
     are placeholders. The real plate is a different aspect with real
     terrain, so re-place them against it in tools/place.html — do not
     hand-edit numbers here. */

  var ROW_K = [0.60, 0.78, 0.95];

  /* Placed against valley.png's actual terrain: back row on the upper
     terraces at the mist line, mid row on the central fields, front
     row on the foreground grass, all clear of the big left pine and
     the right rock outcrop. `pin` forces a building onto a plot: the
     gate stands astride the entrance path — the journey's road
     arrives through it — and is pulled from the random pool so the
     village only ever has one. Build order tells a story: first roof
     where the path ends, the gate second. */
  var PLOTS = [
    { x: .521, y: .743, w: .049, row: 1 },
    { x: .514, y: .905, w: .078, row: 2, pin: "b-gate.png" },
    { x: .452, y: .747, w: .049, row: 1, hw: .42, dp: .22 },
    { x: .502, y: .647, w: .049, row: 1 },
    { x: .439, y: .675, w: .059, row: 1, pad: 1 },
    { x: .580, y: .682, w: .049, row: 1 },
    { x: .463, y: .823, w: .061, row: 2 },
    { x: .612, y: .755, w: .049, row: 1 },
    { x: .572, y: .813, w: .061, row: 2 },
    { x: .383, y: .743, w: .057, row: 1, hw: .42, dp: .22 },
    { x: .411, y: .802, w: .061, row: 2, hw: .42, dp: .22 },
    { x: .449, y: .599, w: .036, row: 0 },
    { x: .365, y: .675, w: .049, row: 1 },
    { x: .526, y: .570, w: .051, row: 0 },
    { x: .588, y: .586, w: .043, row: 0, pad: 1 },
    { x: .660, y: .688, w: .049, row: 1 },
    { x: .383, y: .602, w: .042, row: 0 },
    { x: .660, y: .803, w: .061, row: 2, hw: .42, dp: .22 },
    { x: .334, y: .793, w: .064, row: 2, pad: 1 },
    { x: .567, y: .894, w: .061, row: 2, hw: .42, dp: .22 },
    { x: .380, y: .867, w: .061, row: 2 },
    { x: .445, y: .907, w: .061, row: 2, hw: .42, dp: .22 },
    { x: .460, y: .527, w: .039, row: 0 },
    { x: .330, y: .615, w: .051, row: 0 },
    { x: .299, y: .715, w: .049, row: 1 },
    { x: .674, y: .619, w: .036, row: 0 },
    { x: .705, y: .749, w: .065, row: 1 },
    { x: .509, y: .503, w: .042, row: 0 },
    { x: .403, y: .514, w: .046, row: 0 },
    { x: .564, y: .491, w: .042, row: 0 },
    { x: .276, y: .638, w: .049, row: 1 },
    { x: .352, y: .530, w: .036, row: 0 },
    { x: .633, y: .921, w: .087, row: 2 },
    { x: .647, y: .526, w: .039, row: 0 },
    { x: .696, y: .556, w: .048, row: 0 },
    { x: .246, y: .754, w: .057, row: 1 },
    { x: .324, y: .908, w: .061, row: 2 },
    { x: .297, y: .561, w: .042, row: 0 },
    { x: .756, y: .677, w: .059, row: 1, pad: 1 },
    { x: .471, y: .452, w: .048, row: 0 },
    { x: .747, y: .575, w: .036, row: 0 },
    { x: .227, y: .617, w: .039, row: 0 },
    { x: .205, y: .681, w: .049, row: 1 },
    { x: .690, y: .486, w: .045, row: 0 },
    { x: .644, y: .448, w: .035, row: 0, hw: .42, dp: .22 },
    { x: .412, y: .425, w: .051, row: 0 },
    { x: .249, y: .533, w: .048, row: 0 },
    { x: .578, y: .410, w: .039, row: 0 },
    { x: .817, y: .645, w: .049, row: 1 },
    { x: .330, y: .434, w: .036, row: 0, hw: .42, dp: .22 },
    { x: .454, y: .362, w: .039, row: 0 },
    { x: .277, y: .430, w: .051, row: 0 },
    { x: .838, y: .580, w: .036, row: 0 },
    { x: .681, y: .399, w: .042, row: 0 },
    { x: .729, y: .429, w: .051, row: 0 },
    { x: .538, y: .351, w: .039, row: 0 },
    { x: .366, y: .357, w: .036, row: 0 },
    { x: .890, y: .588, w: .045, row: 0 },
    { x: .797, y: .429, w: .036, row: 0 },
    { x: .225, y: .403, w: .036, row: 0 }
  ];

  /* Each shipped plate is a horizontal band cut from the square master
     by tools/crop.js. These are the [top, bottom] fractions it cut at,
     and they MUST match BANDS in that file — change one without the
     other and every building floats off its ground line. */
  var PLATE_CROP = {
    "field":        [0.300, 1],
    "field-tall":   [0.195, 1],
    "field-wide":   [0.547, 1],
    "field-square": [0, 1]
  };

  /* master y -> this plate's y */
  function cropY(y, name){
    var c = PLATE_CROP[name] || [0, 1];
    return (y - c[0]) / (c[1] - c[0]);
  }

  /* the SVG field's own coordinates, derived from the same plots.
     The fallback keeps its original 900x380 box, so it uses the plots
     unmapped — it is not a crop of anything. */
  var SLOTS = PLOTS.map(function(p){
    return { x: p.x * 900, y: p.y * 380, k: ROW_K[p.row] };
  });

  /* The three ground lines are dead straight, so fifteen houses line
     up like a spreadsheet. A few px of seeded scatter breaks the rows
     without touching the perspective — k stays tied to the row, and
     jit() is deterministic so painter order never reshuffles. This is
     the SVG only; painted buildings go exactly where they were placed.
     Flat mode keeps the original exact positions. */
  if (HOUSES !== "flat"){
    SLOTS = SLOTS.map(function(sl, i){
      return { x: sl.x + jit(i, 11) * 9, y: sl.y + jit(i, 12) * 6, k: sl.k };
    });
  }

  /* ================================================================
     STATE PLATES — art/village/state-00.png … state-15.png.

     VEN's direction (2026-08-13, after seeing the sprite composite and
     rejecting it): one full painting per market-cap step, each frame
     generated FROM the previous one in Recraft (inpaint one building,
     everything else untouched), so every pixel of every state was
     painted together and nothing can read as pasted on. state-00 is
     the empty valley; state-N has N buildings. The site simply
     crossfades between neighbouring frames as roofs rise.

     Wins over the sprite composite: internal consistency is the
     model's job, not ours — light, scale, perspective and ground
     contact are automatically right. Cost: 15 chained generations,
     and a redone middle state invalidates the ones after it.

     Only TWO frames are ever in memory: the one showing, and its
     crossfade partner. A missing state falls back to the nearest
     lower one, so partial art delivery (states 0–7 done, 8–15 not
     yet) degrades to "the village pauses growing", never to a hole.

     Mode resolution at boot, first match wins:
       ?village=sprites  -> skip states, use the sprite composite
       ?art=off          -> inline SVG
       state-00 loads    -> states mode
       field.png loads   -> sprite composite mode
       nothing loads     -> inline SVG
  ================================================================= */

  var stateMode = false, stateShown = -1, stateMissing = {};

  function stateSrc(i){ return ART_DIR + "state-" + (i < 10 ? "0" + i : i) + ".png"; }

  /* load state i, falling back to the nearest lower state that
     exists; cb(img, index) or cb(null) if none do */
  function loadState(i, cb){
    if (i < 0){ cb(null, -1); return; }
    if (stateMissing[i]){ loadState(i - 1, cb); return; }
    var im = new Image();
    im.onload  = function(){ cb(im, i); };
    im.onerror = function(){ stateMissing[i] = 1; loadState(i - 1, cb); };
    im.src = stateSrc(i);
  }

  function mountStates(){
    if (!plate || !ART_ON){ return; }
    if (word("village", "") === "sprites"){ mountArt(); return; }
    loadState(0, function(im){
      if (!im){ mountArt(); return; }   // no states -> sprite mode
      stateMode = true;
      plate.style.aspectRatio = im.naturalWidth + " / " + im.naturalHeight;
      plate.classList.add("has-art");
      if (EDGE !== null) plate.style.setProperty("--edge", EDGE + "%");
      svg.style.display = "none";
      showState(lastCount < 0 ? 0 : lastCount, true);
    });
  }

  function showState(count, immediate){
    var want = Math.max(0, Math.min(count, CFG.maxRoofs || 20));
    loadState(want, function(im, got){
      if (!im || got === stateShown) return;
      stateShown = got;

      var img = document.createElement("img");
      img.className = "v-state";
      img.alt = "";
      img.decoding = "async";
      img.src = im.src;

      var old = plate.querySelectorAll(".v-state");
      plate.appendChild(img);

      if (immediate || reduced){
        Array.prototype.forEach.call(old, function(o){ o.remove(); });
      } else {
        /* crossfade: the new frame fades in over the old, then the
           old is dropped. Frames share every pixel except the new
           building, so only the building appears to change. */
        img.classList.add("is-fading");
        requestAnimationFrame(function(){ requestAnimationFrame(function(){
          img.classList.remove("is-fading");
        }); });
        setTimeout(function(){
          Array.prototype.forEach.call(old, function(o){ o.remove(); });
        }, 1400);
      }

      /* prime the next frame so the next roof's crossfade is instant */
      if (got + 1 <= (CFG.maxRoofs || 20) && !stateMissing[got + 1]){
        var pre = new Image();
        pre.onerror = function(){ stateMissing[got + 1] = 1; };
        pre.src = stateSrc(got + 1);
      }
    });
  }

  /* ================================================================
     THE PAINTED VILLAGE — art/village/*.png stacked over the plate.

     A base plate plus six building PNGs; the engine picks one per plot
     and reveals them as the market cap climbs. See
     art/village/PROMPTS.md for what to generate and why.

     Which building lands on which plot is decided ONCE and
     deterministically. It has to look arbitrary but be stable: "come
     back and count the roofs" means nothing if plot 7 is a pavilion
     today and an L-house tomorrow, and a new roof appearing must never
     reshuffle the ones already standing. Seeding from the contract
     address also means a second token built on this template gets a
     different village out of the same six files.

       ?art=off      force the inline SVG field
       ?plate=NAME   use art/village/NAME.png as the base
       ?seed=STRING  re-roll the village to compare arrangements
       ?edge=N       feather on the plate's edges, in % (0 = hard edge)
  ================================================================= */

  var ART_DIR  = "art/village/";
  var ART_ON   = word("art", "on") !== "off";
  var PLATE    = raw("plate") || "field";
  var BASE_IMG = PLATE + ".png";
  var EDGE     = isFinite(num("edge", NaN)) ? num("edge", 4) : null;

  /* Atmospheric haze, per row (?haze=, 0..~1.5, 0 = off). The sprites
     were painted close-up — denser and darker than the washy plate —
     so unhazed they read as pasted on rather than standing in the
     valley's air. Back row fades hardest, front row not at all; the
     same depth cue the plate's own mist uses. */
  var HAZE = num("haze", 1);
  function rowFilter(row){
    var f = [ .24, .12, 0 ][row] * HAZE;   // fade fraction by row
    if (f <= 0) return "";
    return "saturate(" + n(1 - f * .9) + ") contrast(" + n(1 - f * .55) +
           ") brightness(" + n(1 + f * .32) + ")";
  }

  /* `scale` multiplies the plot's width: the sprites are not the same
     kind of thing — b-walled and b-thatch are whole compounds with
     their gardens, b-house is one building — and rendering an estate
     at hut width breaks the illusion faster than any misplacement.
     Ratios come from the buildings' real-world footprints, not the
     PNG dimensions (the vignette skirts vary per image). */
  /* `pad: 1` means the building needs a LANDING — a plot whose ground
     band actually sits on a painted clearing in the plate, which
     tools/plots.js measures and marks. Only the walled compound has it.
     VEN, 2026-08-15: *"b-walled buildings look a bit funny if they are
     not on a dedicated spot on the background like a landing... make
     sure that the only place that walled houses can go is on the
     landings."* It is the one building that arrives with its own
     boundary wall and swept earth yard, so on open grass it reads as a
     wall around nothing; a hut in a field is just a hut in a field.
     `padPref` then biases the roll toward it on the few plots that
     qualify — without that, three eligible landings against five
     eligible types means the compound simply never appears at most
     contract addresses. */
  /* `band` — THE GROUND THIS SPRITE ACTUALLY COVERS, as `[depth from,
     depth to, half-width]` strips in fractions of its own rendered
     WIDTH, measured up from the bottom of the image. tools/plots.js
     reads it to decide where the building may stand and how big it may
     be; a type that omits it gets the shared default below.

     Only the compound carries one, and the reason is worth keeping.
     Every other sprite is ONE BUILDING: a shallow stone platform seen
     from the front corner, coming to a point at the bottom and widening
     to its full span by 22% of its width, above which the silhouette is
     roof and eaves and narrows again. Measured off the alpha, the widest
     point is at depth .15 for b-house, .15 for b-pavilion, .22 for
     b-thatch, .22 for b-lhouse — all inside the default band.

     b-walled is not one building, it is a WALLED YARD seen from above.
     Its silhouette is still widening at depth .35 (half-width .476, the
     outer corners of the boundary wall) and the swept earth inside runs
     back to .50. So the default band reserved less than half the ground
     it stands on — which put it a third of a yard past its landing and,
     because the anchor is placed to centre the band on the pad, sitting
     too high in it. VEN, twice: *"this looks unnatural... scale it down
     and center it in its landing spot"*, then *"it needs to be scaled
     down and moved a bit down on the y axis."* Both are that one
     mis-measurement, and both fall out of stating the real shape. */
  var TYPES = [
    { file: "b-house.png",    scale: 1.0,  rows: [0, 1, 2] },
    { file: "b-lhouse.png",   scale: 1.35, rows: [1, 2]    },
    { file: "b-pavilion.png", scale: 0.95, rows: [0, 1, 2] },
    /* rows: all three. It was [1, 2] on the reasoning that a compound is
       too big for the back of the valley, and that stopped being true
       when the landing started setting the size — a pad at the mist line
       is a small pad and buys a small compound. Left as it was, the one
       landing the plate carries up there was cut to compound proportions
       and then handed a farmhouse, because no pad-eligible type was left
       to take it. `pad: 1` is the real gate here; `rows` was doing a
       second job it could not do correctly. */
    { file: "b-walled.png",   scale: 1.5,  rows: [0, 1, 2], pad: 1, band: [
        [0.00, 0.08, 0.15], [0.08, 0.16, 0.28], [0.16, 0.24, 0.40],
        [0.24, 0.38, 0.48], [0.38, 0.50, 0.40]
      ] },
    { file: "b-thatch.png",   scale: 1.45, rows: [0, 1]    },

    /* ---- session 11: four more, so six files stop having to be a
       village. VEN: *"when I said more variety in the buildings i meant
       make new ones."* Each was generated as an EDIT of an accepted
       sprite rather than from its own prompt — that is the session-9
       finding and it is what keeps the set agreeing: a variant painted
       on top of b-house is by construction the same hand, the same
       light and the same detail density, where a fresh generation off
       the same wording came back as an architectural study at twice the
       size. See HANDOFF §9n.

       `scale` is set from the parent's, in the ratio of their painted
       widths, so the part they share renders at exactly the same size:
       b-house2 is 366px wide against b-house's 294, so 1.0 * 366/294.
       The exception is b-thatch2, held below its strict 1.77 — every
       non-landing plot is reserved against the widest type its row can
       receive, so one oversized building costs the whole village room,
       and room is what VEN asked for. */
    { file: "b-store.png",    scale: 0.95, rows: [0, 1, 2] },
    { file: "b-house2.png",   scale: 1.24, rows: [0, 1, 2], band: [
        [0.00, 0.05, 0.15], [0.05, 0.10, 0.33], [0.10, 0.18, 0.48]
      ] },
    { file: "b-thatch2.png",  scale: 1.45, rows: [0, 1], band: [
        [0.00, 0.06, 0.16], [0.06, 0.13, 0.33], [0.13, 0.24, 0.44]
      ] },
    { file: "b-walled2.png",  scale: 1.5,  rows: [0, 1, 2], pad: 1, band: [
        [0.00, 0.08, 0.15], [0.08, 0.16, 0.28], [0.16, 0.24, 0.40],
        [0.24, 0.38, 0.48], [0.38, 0.50, 0.40]
      ] },

    { file: "b-gate.png",     scale: 1.1,  rows: []        }   // pin-only: one gate, at the entrance
  ];
  /* the shared band, for the five sprites that are one building on one
     platform. Keep it here rather than in plots.js: the tool lifts this
     table instead of copying it, so there is one place to change. */
  var BAND = [[0.00, 0.07, 0.16], [0.07, 0.14, 0.30], [0.14, 0.22, 0.42]];

  /* HOW MUCH GROUND ONE SPRITE COVERS — its band's widest half-width and
     its full depth, with the type's own scale folded in, so both are in
     units of the PLOT's width and can be compared with the `hw`/`dp` a
     plot carries.

     Those two numbers are tools/plots.js saying "I only tested this spot
     for a building this size". Most plots do not carry them and take
     anything their row allows; the ones that do are the gaps between the
     big buildings, which exist at all because the tool stopped reserving
     every plot against the widest sprite in the set. Ignore them and a
     farmhouse lands on a cottage's plot, overlapping the neighbour that
     was placed forty pixels away on the strength of it not being there.
     See HANDOFF §9n. */
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

  /* A LANDING IS THE COMPOUND'S PLOT, not merely one it is allowed on.
     This was 0.55 — a coin toss per landing — and it has to be 1. A plot
     marked `pad` is sized and anchored by tools/plots.js against the
     compound's own band: its width comes from the painted clearing and
     its ground line from centring that band on the clearing's middle. A
     house dropped on one instead would render at 0.84 of the width the
     plot was cut for and float above the pad's centre, because its band
     is a fifth as deep. The geometry has an owner now, so the roll that
     used to pick one has to go. */
  var padPref = 1;

  function raw(name){
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

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

  var SEED = hash32(String(raw("seed") || CFG.seed ||
                           (window.HANOK_CONFIG || {}).ca || "hanok"));

  /* Walk the plots in SPATIAL order — row, then left to right — so the
     "don't repeat my neighbour" rule compares buildings that actually
     stand side by side. Walking build order would compare plot 4 with
     plot 5, which can be at opposite ends of the field. */
  function assign(pool){
    var order = PLOTS.map(function(_, i){ return i; }).sort(function(a, b){
      return PLOTS[a].row - PLOTS[b].row || PLOTS[a].x - PLOTS[b].x;
    });
    var out = [], prev = null, prevRow = -1;
    order.forEach(function(i){
      /* a pinned plot always gets its named building (if it loaded);
         pinned types have rows: [] so they never enter the rotation */
      if (PLOTS[i].pin){
        var pinned = pool.filter(function(t){ return t.file === PLOTS[i].pin; })[0];
        if (pinned){ out[i] = pinned; return; }
      }
      /* A building that needs a landing may only stand on a plot that
         has one; every other building may stand anywhere it fits. The
         fallbacks below keep that rule too — the last one drops it only
         when nothing else loaded at all, because a roof of the wrong
         kind is still better than a hole (the count on screen has to
         match the stat above it). */
      var fits = pool.filter(function(t){ return !t.pad || PLOTS[i].pad; });
      /* ...and not bigger than the ground this plot was measured for.
         Same rule as the two above it: narrow the pool if that leaves
         anything, never to nothing — with the small sprites missing, a
         building of the wrong size still beats a hole. */
      var room = fits.filter(function(t){ return fitsPlot(t, PLOTS[i]); });
      if (room.length) fits = room;
      var ok = fits.filter(function(t){ return t.rows.indexOf(PLOTS[i].row) >= 0; });
      if (!ok.length) ok = fits.filter(function(t){ return t.rows.length; });
      if (!ok.length) ok = fits;
      if (!ok.length) ok = pool;
      var roll = rnd(SEED ^ Math.imul(i + 1, 2654435761));
      var at = Math.floor(roll * ok.length) % ok.length;
      if (ok.length > 1 && PLOTS[i].row === prevRow && ok[at] === prev) at = (at + 1) % ok.length;
      /* landings are scarce, so give the pad-only building first refusal
         on one rather than letting it lose a uniform draw four times out
         of five and never appear */
      if (PLOTS[i].pad){
        var wants = ok.filter(function(t){ return t.pad; });
        if (wants.length && rnd(SEED ^ Math.imul(i + 7, 2246822519)) < padPref)
          at = ok.indexOf(wants[Math.floor(roll * wants.length) % wants.length]);
      }
      out[i] = ok[at];
      prev = ok[at];
      prevRow = PLOTS[i].row;
    });
    return out;
  }

  /* Mirroring roughly half of them is free variety: six files behave
     like twelve, and it costs one CSS custom property. */
  function flipped(i){ return rnd(SEED ^ Math.imul(i + 101, 40503)) < 0.45; }

  var artHouses = null;
  var artZzz = null;

  function preload(files, done){
    var left = files.length, ok = {};
    if (!left){ done(ok); return; }
    files.forEach(function(f){
      var im = new Image();
      /* the dimensions are kept, not just the fact of loading: the Z's
         need to know where a sprite's roof PEAK is, and a .v-house is
         anchored bottom-centre so its top edge is groundline minus its
         rendered height — which is width times this aspect ratio */
      im.onload = function(){ ok[f] = { w: im.naturalWidth, h: im.naturalHeight }; step(); };
      im.onerror = step;
      im.src = ART_DIR + f;
    });
    function step(){ if (--left === 0) done(ok); }
  }

  function mountArt(){
    if (!plate || !ART_ON) return;
    var base = new Image();
    /* No onerror branch is needed beyond doing nothing: with no plate we
       simply stay on the inline SVG, which is the normal state until the
       paintings exist. What must NOT happen is an <img> with a dead src
       left in the DOM — Chrome paints its broken-image glyph on top of
       the drawing underneath, which is exactly the bug that bit the
       journey (HANDOFF §5, settleArt). Nothing is mounted until the
       file has actually loaded. */
    base.onload = function(){
      preload(TYPES.map(function(t){ return t.file; }), function(loaded){
        var pool = TYPES.filter(function(t){ return loaded[t.file]; });
        /* A building that 404s is dropped from the pool and its plots
           get one of the survivors, rather than leaving a hole: the
           roofs on screen must always equal the number in the stat
           directly above them. */
        if (pool.length) buildArt(base, pool, loaded);
      });
    };
    base.src = ART_DIR + BASE_IMG;
  }

  /* ---- sleeping Z's (PLAN phase 3B) -------------------------------

     VEN, 2026-08-16: *"an animated set of Z's appearing above a random
     set of houses, should be small and subtle just like in clash of
     clans."*

     Everything that decides WHO sleeps and WHEN is seeded, same
     discipline as assign() and flipped(): the village must be identical
     on every visit, and that includes which chimneys have Z's over
     them. The animation itself is pure CSS (see .v-zzz in site.css) —
     one keyframe loop per Z, phase-shifted per house with a negative
     delay, so there are no timers to leak and nothing to pause.

     Who sleeps: a seeded ~30% of the DWELLINGS. The gate is an
     entrance, a pavilion has no walls, and a storehouse holds grain —
     Z's over any of those read as a bug, not a joke. The walled
     compounds sleep like anything else; the Z rises off the inner
     hall's roof. */
  var AWAKE = { "b-gate.png": 1, "b-pavilion.png": 1, "b-store.png": 1 };
  function sleeper(i){ return rnd(SEED ^ Math.imul(i + 29, 0x85EBCA6B)) < SLEEP; }

  function zzzEl(i, p, t, dim, plateAspect){
    var wFrac = p.w * (t.scale || 1);              // sprite width / plate width
    var hFrac = wFrac * (dim.h / dim.w) * plateAspect;  // height / plate height
    var el = document.createElement("div");
    el.className = "v-zzz";
    el.setAttribute("data-plot", i);
    el.hidden = true;
    /* anchored at the roof peak: the ground line minus the sprite's
       rendered height, nudged off-centre the way smoke leaves a flue —
       and nudged to the same side the sprite is flipped to.

       SIZED OFF p.w, NOT THE SPRITE WIDTH. The per-type `scale` is
       exactly the factor that says "this sprite is mostly yard" — a
       compound at 1.5 is a house plus its walls and swept earth — so a
       Z scaled off the sprite would be compound-sized over a
       house-sized hall. p.w is the size of dwelling the plot holds. */
    var side = flipped(i) ? -1 : 1;
    el.style.left = n((p.x + side * p.w * 0.12) * 100) + "%";
    el.style.top  = n((cropY(p.y, PLATE) - hFrac * 0.96) * 100) + "%";
    el.style.width = n(p.w * 0.26 * 100) + "%";
    /* the cycle: a ~2.5s burst of three, then 6-10s of quiet. Both the
       length and the phase are per-house, so the field never breathes
       in unison; the negative delay starts each cycle mid-flight. */
    var T = 8.5 + rnd(SEED ^ Math.imul(i + 47, 0xC2B2AE35)) * 4;
    el.style.setProperty("--zt", T.toFixed(2) + "s");
    el.style.setProperty("--zp", "-" + (rnd(SEED ^ Math.imul(i + 83, 0x27D4EB2F)) * T).toFixed(2) + "s");
    /* three Z's, one glyph each: an ink Z over a faint paper halo, so
       it stays legible crossing a dark roof edge. Drawn, not typed —
       a font glyph at 10px is a UI label, and no font in the page's
       palette is playful. VEN, on the first pass: *"a softer more
       cartoonish font"* — the straight-stroke stencil Z was too stiff.
       So the glyph is a plump comic Z: the top bar arcs up, the
       diagonal bows, the bottom bar arcs down, and the fat round-capped
       stroke (see .v-zzz__ink) does the rest. Same three strokes, drawn
       the way a hand doodles them rather than the way a ruler does. */
    for (var k = 0; k < 3; k++){
      var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      s.setAttribute("viewBox", "0 0 12 14");
      var halo = document.createElementNS("http://www.w3.org/2000/svg", "path");
      var z    = document.createElementNS("http://www.w3.org/2000/svg", "path");
      var d = "M2.6 3.3 Q6 1.7 9.4 3.1 Q6.2 6.4 2.8 10.7 Q6.2 12.6 9.5 10.9";
      halo.setAttribute("d", d); z.setAttribute("d", d);
      halo.setAttribute("class", "v-zzz__halo");
      z.setAttribute("class", "v-zzz__ink");
      s.appendChild(halo); s.appendChild(z);
      el.appendChild(s);
    }
    return el;
  }

  function buildArt(base, pool, dims){
    var chosen = assign(pool), frag = document.createDocumentFragment();

    var bg = document.createElement("img");
    bg.className = "v-base";
    bg.alt = "";
    bg.src = base.src;
    frag.appendChild(bg);

    PLOTS.map(function(_, i){ return i; })
      .sort(function(a, b){ return PLOTS[a].y - PLOTS[b].y; })
      .forEach(function(i){
        var p = PLOTS[i], h = document.createElement("img");
        h.className = "v-house";
        h.alt = "";
        h.decoding = "async";
        h.src = ART_DIR + chosen[i].file;
        h.hidden = true;
        h.style.left  = n(p.x * 100) + "%";
        h.style.top   = n(cropY(p.y, PLATE) * 100) + "%";
        h.style.width = n(p.w * (chosen[i].scale || 1) * 100) + "%";
        var fl = rowFilter(p.row);
        if (fl) h.style.filter = fl;
        if (flipped(i)) h.style.setProperty("--flip", "-1");
        h.setAttribute("data-plot", i);
        frag.appendChild(h);
      });

    /* the Z layer goes on AFTER every house, so a Z drifting off a back
       roof passes in front of the sprites below it instead of clipping
       behind them. Skipped wholesale under reduced motion — a Z that
       does not float is not asleep, it is a typo on the painting. */
    if (SLEEP > 0 && !reduced){
      var pa = base.naturalWidth / base.naturalHeight;
      PLOTS.forEach(function(p, i){
        var t = chosen[i], dim = t && dims[t.file];
        if (!dim || AWAKE[t.file] || p.pin || !sleeper(i)) return;
        frag.appendChild(zzzEl(i, p, t, dim, pa));
      });
    }

    plate.appendChild(frag);
    /* the art sets the box, rather than being cropped into it */
    plate.style.aspectRatio = base.naturalWidth + " / " + base.naturalHeight;
    plate.classList.add("has-art");
    if (EDGE !== null) plate.style.setProperty("--edge", EDGE + "%");
    svg.style.display = "none";
    artHouses = plate.querySelectorAll(".v-house");
    artZzz = plate.querySelectorAll(".v-zzz");
    /* the Z loops only run while the valley is actually on screen
       (PLAN 3B.4): .v-live attaches the animations in CSS, so scrolled
       past they cost nothing at all. Off-screen time is not banked —
       re-entering restarts each house's cycle at its seeded phase,
       which is indistinguishable for something this sporadic. A hidden
       TAB needs no code: the browser freezes CSS animations there on
       its own. */
    if (artZzz.length){
      if (window.IntersectionObserver){
        new IntersectionObserver(function(es){
          plate.classList.toggle("v-live", es[0].isIntersecting);
        }, { rootMargin: "60px" }).observe(plate);
      } else {
        plate.classList.add("v-live");
      }
    }
    paintArt(lastCount, true);
  }

  function paintArt(count, immediate){
    if (!artHouses) return;
    Array.prototype.forEach.call(artHouses, function(h){
      var i = +h.getAttribute("data-plot"), was = h.hidden;
      if (i >= count){
        h.hidden = true;
        h.classList.remove("is-rising", "is-in");
        return;
      }
      h.hidden = false;
      if (immediate || reduced || !was) return;
      h.classList.add("is-rising");
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        h.classList.add("is-in");
      }); });
    });
    /* the Z's follow their houses — same count rule, nothing extra. A
       house that has not been built yet has nobody in it to sleep. */
    if (artZzz) Array.prototype.forEach.call(artZzz, function(z){
      z.hidden = +z.getAttribute("data-plot") >= count;
    });
  }

  /* The road arriving at the village only makes sense when the journey
     actually has a road of its own to arrive from. Only `?journey=road`
     does; in map mode (the default since 2026-08-20) and split mode it
     would arrive out of nothing, so the entrance trunk and the two
     footpaths that fork off it go with it — VEN's call, 2026-08-12.

     Map mode is arguably the one case where an arrival could be earned
     back: the sheet's road runs off the bottom edge still dotted, which
     is the village it is heading for. Left alone deliberately — the two
     sections are 640vh apart and joining them is a design call for VEN,
     not a tidy-up.
     The forks are not kept on their own: without the trunk they read as
     two short strokes floating between the houses.

     This reads the same ?journey= switch journey.js does. A small
     duplication, in keeping with the palette constants every module
     already repeats — but if that switch is ever renamed, grep for it. */
  function roadArrival(){
    var m = /[?&]journey=([a-z]+)/i.exec(location.search);
    if ((m ? m[1].toLowerCase() : "map") !== "road") return "";
    return (
      '<path d="M462 378 C466 358 468 330 472 310" fill="none" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M472 310 C474 296 476 284 478 272" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M478 272 C480 262 481 254 481 246" fill="none" stroke="' + INK + '" stroke-width="1" stroke-linecap="round" opacity=".45"/>' +
      '<path d="M470 312 C452 304 434 298 420 294" fill="none" stroke="' + INK + '" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>' +
      '<path d="M474 302 C496 292 516 286 530 282" fill="none" stroke="' + INK + '" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>'
    );
  }

  /* ---- the field the village stands in ---------------------------

     `?field=bare` is the original: three contour lines and nothing
     above them, which left the top ~40% of a 900x380 box empty — a
     dead band between the stats and the first roof, and no reason for
     the village to be *here* rather than anywhere. `hill` gives it a
     far ridge, a few distant roofs and a mist that recedes into the
     page, so the field reads as the floor of a valley and picks the
     journey's landscape back up after the backdrop has faded out. */

  function ridge(){
    if (FIELD !== "hill") return "";
    var s = "";

    /* Everything here is masked, never washed over. The first attempt
       faded the hills with a paper-coloured rect on top; because the
       field is only 1080px wide inside a full-bleed page, that rect's
       own edges were visible as a lighter box floating in the middle of
       the section. A mask adds no paint at all, so there is no edge to
       see. If you touch this, do not go back to a wash. */
    s += '<g mask="url(#vFade)">';

    /* far range — no outline; distance is carried by value alone */
    s += '<path d="M0 130 C46 104 78 112 118 88 C150 68 176 92 214 80' +
         ' C252 68 276 44 316 58 C352 70 372 96 414 86' +
         ' C452 76 476 52 516 62 C556 72 578 98 622 90' +
         ' C664 82 692 58 734 70 C778 82 800 104 842 96' +
         ' C868 91 884 100 900 96 L900 190 L0 190 Z"' +
         ' fill="' + INK + '" opacity=".085"/>';

    /* nearer range, offset so the two read as separate distances */
    s += '<path d="M0 158 C44 138 74 146 116 128 C156 111 184 132 226 124' +
         ' C270 116 296 96 340 108 C380 119 400 138 444 130' +
         ' C486 122 512 104 556 114 C598 124 620 142 664 134' +
         ' C708 126 734 110 778 120 C820 130 862 142 900 136 L900 196 L0 196 Z"' +
         ' fill="' + INK + '" opacity=".12"/>';

    /* a few tiny roofs on the far slope: the village goes on past the
       frame, rather than being fifteen plots alone in a field */
    [[186, 122, 18], [428, 116, 15], [672, 126, 17]].forEach(function(r){
      s += '<path d="' + roofPath(r[0], r[1], r[2], 5.5, 2.4) + '" fill="' + INK + '" opacity=".34"/>';
      s += '<path d="M' + (r[0] + 4) + ' ' + (r[1] + 7.5) + ' h' + (r[2] - 8) +
           ' v4.5 h' + -(r[2] - 8) + ' Z" fill="' + INK + '" opacity=".2"/>';
    });

    return s + '</g>';
  }

  function pineTree(x, gy, h, seed){
    /* A Korean red pine: a trunk that bends, and foliage carried in a
       few irregular clumps out at the ends of the branches — the shape
       in `hand drawn reference.jpg`.

       Two earlier tries are worth not repeating: a single filled blob
       read as a mushroom, and four evenly-spaced horizontal tufts read
       as a Christmas tree. Irregularity is the whole point — the clumps
       must differ in size, height AND side, or the eye reads a pattern. */
    var s = "", i, lean = jit(seed, 7) * 7;

    /* trunk, bending as it rises */
    s += '<path d="M' + n(x) + ' ' + n(gy) +
         ' C' + n(x - 4 + lean * .2) + ' ' + n(gy - h * .34) +
         ' '  + n(x + 5 + lean * .7) + ' ' + n(gy - h * .62) +
         ' '  + n(x + lean) + ' ' + n(gy - h * .88) +
         '" fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"/>';

    /* clumps: [along the trunk, which side, size] — deliberately uneven */
    var clumps = [[.52, -1, 1], [.68, 1, .82], [.84, -1, .66], [.95, .35, .5]];
    for (i = 0; i < clumps.length; i++){
      var c  = clumps[i],
          ty = gy - h * c[0],
          tx = x + lean * c[0] + c[1] * (13 + i * 2) * (1 + jit(seed, 20 + i) * .25),
          tw = (30 * c[2]) * (1 + jit(seed, 30 + i) * .2),
          th = tw * (.42 + jit(seed, 40 + i) * .08),
          bx = x + lean * c[0];

      /* the branch that carries it */
      s += '<path d="M' + n(bx) + ' ' + n(ty + th * .5) + ' Q' + n((bx + tx) / 2) + ' ' +
           n(ty + th * .5 - 2) + ' ' + n(tx - c[1] * tw * .18) + ' ' + n(ty + th * .35) +
           '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>';

      /* the foliage — a flattened, lopsided cushion, not a disc */
      s += '<path d="M' + n(tx - tw * .5) + ' ' + n(ty + th * .3) +
           ' C' + n(tx - tw * .46) + ' ' + n(ty - th * .7) +
           ' '  + n(tx - tw * .05) + ' ' + n(ty - th) +
           ' '  + n(tx + tw * .22) + ' ' + n(ty - th * .72) +
           ' C' + n(tx + tw * .5) + ' ' + n(ty - th * .55) +
           ' '  + n(tx + tw * .56) + ' ' + n(ty + th * .1) +
           ' '  + n(tx + tw * .3) + ' ' + n(ty + th * .34) +
           ' C' + n(tx + tw * .05) + ' ' + n(ty + th * .5) +
           ' '  + n(tx - tw * .3) + ' ' + n(ty + th * .5) +
           ' '  + n(tx - tw * .5) + ' ' + n(ty + th * .3) + ' Z"' +
           ' fill="' + PINE + '" opacity="' + n(.84 - i * .06) + '"/>';
      /* a couple of needle strokes so it is drawn, not stamped */
      s += '<path d="M' + n(tx - tw * .34) + ' ' + n(ty - th * .12) + ' q' + n(tw * .3) +
           ' ' + n(-th * .5) + ' ' + n(tw * .62) + ' ' + n(-th * .18) +
           '" fill="none" stroke="' + INK + '" stroke-width=".9" opacity=".28"/>';
    }
    return s;
  }

  function decorBack(){
    var s = ridge();
    /* contour lines of the field */
    s += '<path d="M30 150 C240 138 660 138 870 152" fill="none" stroke="' + INK + '" stroke-width="1.4" opacity=".22"/>' +
         '<path d="M20 232 C250 218 650 218 880 234" fill="none" stroke="' + INK + '" stroke-width="1.4" opacity=".18"/>' +
         '<path d="M26 322 C260 306 640 306 874 324" fill="none" stroke="' + INK + '" stroke-width="1.4" opacity=".14"/>' +
         roadArrival();

    if (HOUSES === "flat"){
      /* original pine + rocks */
      s += '<path d="M60 380 C54 344 62 316 52 290" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
           '<path d="M18 296 C30 272 68 268 84 286 C96 260 60 246 42 258 C22 240 -4 258 6 278 C-6 288 2 300 18 296 Z" fill="' + PINE + '" opacity=".92"/>';
    } else {
      s += pineTree(58, 378, 96, 3);
      s += pineTree(846, 300, 58, 9);
    }

    s += '<path d="M818 358 c-2 -14 10 -24 24 -20 c6 -10 22 -8 26 2 c10 0 14 10 10 18 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.2"/>' +
         '<path d="M852 344 c4 4 4 10 2 14" fill="none" stroke="' + INK + '" stroke-width="1.4" opacity=".6"/>';
    return s;
  }

  function decorFront(){
    var s = "", i, xs = [110, 240, 640, 828, 520];
    for (i = 0; i < xs.length; i++){
      var gx = xs[i], gy = 358 + (i % 2) * 8;
      s += '<path d="M' + gx + " " + gy + " q3 -9 6 0 M" + (gx + 7) + " " + gy +
           ' q3 -7 6 0" fill="none" stroke="' + INK + '" stroke-width="1.6" opacity=".4"/>';
    }
    return s;
  }

  /* An empty plot. `flat` keeps the dashed rectangle; the ink field
     draws the stone foundation a hanok would stand on plus a surveyor's
     stake, because a dashed box on a web page reads as a loading
     skeleton rather than as ground waiting for a house. */
  function emptyPlot(sl){
    var k = sl.k;
    if (HOUSES === "flat"){
      return '<rect x="' + (sl.x - 42 * k) + '" y="' + (sl.y - 8 * k) +
             '" width="' + 84 * k + '" height="' + 14 * k +
             '" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-dasharray="5 6" opacity=".18"/>';
    }
    /* Just the cleared ground and its stone footings. A stake with a
       pennant was tried and dropped — at this size it read as a golf
       flag, and fifteen of them turned the field into a course. The
       plot has to whisper "room here", not label itself. */
    var w = 74 * k, x = sl.x - w / 2, y = sl.y, s = "", i;
    s += '<path d="M' + n(x) + ' ' + n(y) + ' q' + n(w / 2) + ' ' + n(-2.5 * k) + ' ' + n(w) + ' 0' +
         '" fill="none" stroke="' + INK + '" stroke-width="' + n(1.6 * k) +
         '" opacity=".22" stroke-linecap="round"/>';
    for (i = 0; i < 4; i++){
      s += '<circle cx="' + n(x + w * (.08 + i * .28)) + '" cy="' + n(y - 3 * k) +
           '" r="' + n(1.7 * k) + '" fill="' + INK + '" opacity=".17"/>';
    }
    return s;
  }

  /* ---- render ---------------------------------------------------- */

  var lastCount = -1;

  function defs(){
    var s = '<defs>';
    if (ROUGH > 0){
      s += '<filter id="vRough" x="-14%" y="-14%" width="128%" height="128%">' +
             '<feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="1" seed="4" result="n"/>' +
             '<feDisplacementMap in="SourceGraphic" in2="n" scale="' + n(1.5 * ROUGH) + '"/>' +
           '</filter>';
    }
    /* luminance mask that dissolves the far hills into the page.
       White keeps, black drops — and nothing is painted, so the field's
       own edges never show (see ridge()). */
    s += '<linearGradient id="vFadeGrad" gradientUnits="userSpaceOnUse" x1="0" y1="56" x2="0" y2="196">' +
           '<stop offset="0" stop-color="#fff"/>' +
           '<stop offset=".42" stop-color="#fff" stop-opacity=".92"/>' +
           '<stop offset=".78" stop-color="#fff" stop-opacity=".38"/>' +
           '<stop offset="1" stop-color="#000"/>' +
         '</linearGradient>' +
         '<mask id="vFade" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="380">' +
           '<rect x="0" y="0" width="900" height="380" fill="url(#vFadeGrad)"/>' +
         '</mask>';
    return s + '</defs>';
  }

  function fmtMoney(v){
    if (v >= 1e9) return "$" + (v / 1e9).toFixed(1) + "b";
    if (Math.round(v / 1e3) >= 1000) return "$" + (v / 1e6).toFixed(1) + "m";  // 999.5k+ rounds up, not "$1000k"
    if (v >= 1e3) return "$" + Math.round(v / 1e3) + "k";
    return "$" + Math.round(v);
  }

  function render(mc, holders){
    var perRoof = CFG.perRoof || 100000;
    var maxRoofs = Math.min(CFG.maxRoofs || 20, SLOTS.length);
    var count = Math.max(0, Math.min(maxRoofs, Math.floor(mc / perRoof)));

    if (stateMode) showState(count);
    else if (artHouses) paintArt(count);
    else renderSvg(count);
    lastCount = count;
    renderStats(mc, holders, count, maxRoofs, perRoof);
  }

  function renderSvg(count){
    var rough = (HOUSES !== "flat" && ROUGH > 0) ? ' filter="url(#vRough)"' : "";

    var items = SLOTS.map(function(sl, i){
      return { sl: sl, i: i, built: i < count };
    }).sort(function(a, b){ return a.sl.y - b.sl.y; });

    var s = defs() + decorBack();
    items.forEach(function(it){
      var sl = it.sl, k = sl.k;
      if (it.built){
        var art = VARIANTS[it.i % VARIANTS.length](it.i);
        var isNew = lastCount >= 0 && it.i >= lastCount;
        s += '<g class="roof' + (isNew ? " roof--new" : "") + '"' + rough + ' transform="translate(' +
             n(sl.x - 70 * k) + " " + n(sl.y - 100 * k) + ") scale(" + k + ')">' + art + "</g>";
      } else {
        s += emptyPlot(sl);
      }
    });
    s += decorFront();
    svg.innerHTML = s;

    /* rise-in for roofs added since the last render */
    if (!reduced){
      svg.querySelectorAll("g.roof--new").forEach(function(node){
        node.style.opacity = "0";
        node.style.transition = "opacity .8s ease";
        requestAnimationFrame(function(){ requestAnimationFrame(function(){
          node.style.opacity = "1";
        }); });
      });
    }
  }

  function renderStats(mc, holders, count, maxRoofs, perRoof){
    var elMc = document.getElementById("statMc"),
        elRoofs = document.getElementById("statRoofs"),
        elHold = document.getElementById("statHolders"),
        elNext = document.getElementById("villageNext");
    if (elMc)    elMc.textContent = mc > 0 ? fmtMoney(mc) : "at launch";
    if (elRoofs) elRoofs.textContent = String(count);
    if (elHold)  elHold.textContent = holders > 0 ? holders.toLocaleString("en-US") : "at launch";
    if (elNext){
      if (count >= maxRoofs){
        elNext.textContent = "The field is full. The village endures.";
      } else {
        var toward = mc - count * perRoof,
            pct = Math.min(99, Math.floor(100 * toward / perRoof)),
            at = fmtMoney((count + 1) * perRoof);
        elNext.textContent = "Next roof rises at " + at + ", " + pct + "% of the way there.";
      }
    }
  }

  /* Draw the SVG field immediately, then look for the paintings. The
     order matters: the section is never empty while the art loads, and
     if the art never arrives nothing has to be undone. Same shape as
     journey.js's stand-in -> settleArt hand-off. mountStates falls
     back to mountArt which falls back to the SVG already showing. */
  render(CFG.marketCap || 0, CFG.holders || 0);
  mountStates();

  window.HANOK = window.HANOK || {};
  window.HANOK.setVillage = function(v){
    v = v || {};
    if (Number.isFinite(v.marketCap)) CFG.marketCap = v.marketCap;
    if (Number.isFinite(v.holders)) CFG.holders = v.holders;
    render(CFG.marketCap, CFG.holders);
  };

})();
