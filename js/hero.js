/* ================================================================
   HERO — the title writes itself.

   Each letter is a set of hand-authored brush strokes (single-line
   SVG paths). A shared timeline animates stroke-dashoffset in
   writing order while a nib dot rides the active stroke, then the
   red seal stamps and the rest of the hero fades in.

   To change the title: add letters to LETTERS (100x140 grid,
   baseline y=128) and set CONFIG.token.wordmark.

   THE TITLE IS $TILES SINCE 2026-08-30. It was hangul from
   2026-08-21 (Zico named the token 기와 / GIWA) until then, and it
   was swapped to latin once before and put straight back —
   2026-08-29, VEN: *"i didnt tell you to change the korean
   characters."* What makes this one stick is that Zico asked for it
   himself, on a marked-up screenshot, and confirmed it when VEN read
   it back to him: *"Yeah bro but make it a bit smaller pls."* The
   hangul strokes stay in LETTERS below — this has flipped twice now
   and `wordmark: "기와"` in js/config.js is the whole way back.

   Two things that matter if it changes again:

   - **Every character must exist in LETTERS.** There is no font
     fallback here and there cannot be one: the writing animation is
     stroke-dashoffset along real paths, and a glyph outline from a
     webfont has no stroke order to write in. An unknown character is
     skipped silently, so check the title actually renders.
   - **The strokes are in Korean writing order**, which is what makes
     the animation read as handwriting rather than as a reveal:
     consonant before vowel, and within a jamo top-to-bottom then
     left-to-right. 기 = ㄱ, ㅣ. 와 = ㅇ, then ㅗ's stem and bar, then
     ㅏ's stem and bar.

   ADVANCE is per-word, not universal: hangul blocks are square and
   want less side-bearing than the latin caps this file was built for.
================================================================= */

(function(){
  "use strict";

  var CFG   = window.HANOK_CONFIG || {},
      TOKEN = CFG.token || {},
      WORD  = TOKEN.wordmark || TOKEN.ko || "HANOK";

  /* stroke paths per letter, in writing order, on a 100x140 grid */
  var LETTERS = {
    /* ---- hangul --------------------------------------------------
       기 — ㄱ over the left, ㅣ full height at the right. ㄱ is ONE
       stroke: across, then down, the corner softened because a brush
       does not turn square. */
    "기": [
      "M13 31 C31 25 48 24 63 28 C62 48 57 68 47 87",
      /* NOT A RULED LINE. VEN: *"i do not like the fact that the
         straight lines look so uniform but the curved lines look so
         handwritten."* He was right, and the cause is geometric, not
         filtral: a bowed stroke shows its own curvature, a
         single-arc vertical does not. Every upright is an S now —
         it leans out, settles back, and finishes slightly off where
         it started, which is what a hand does and a ruler cannot. */
      "M79 15 C84 38 87 62 85 86 C84 106 81 120 80 133"
    ],
    /* 와 — ㅇ upper-left, ㅗ beneath it, ㅏ full height at the right.
       The three parts have to be given real air or they read as one
       blot: ㅇ is kept small and high, ㅗ's stem is long enough to be
       seen between them, and ㅏ's stem sits far enough right that its
       bar clears ㅇ entirely. */
    "와": [
      "M26 21 C13 21 6 30 6 39 C6 50 14 57 26 57 C38 57 44 48 44 38 C44 29 37 21 26 21",
      "M25 62 C27 69 28 76 26 84",
      "M2 89 C16 85 28 88 41 86 C47 85 52 86 57 88",
      "M71 17 C76 42 78 68 76 92 C75 111 72 123 71 133",
      "M72 61 C79 57 86 58 95 61"
    ],
    /* ---- latin, kept: the fallback title and any future word ---- */
    H: [
      "M22 26 C19 58 19 92 24 126",
      "M78 22 C81 56 81 92 76 126",
      "M14 76 C38 69 62 69 88 73"
    ],
    A: [
      "M50 22 C40 52 30 90 19 126",
      "M52 22 C62 54 72 92 83 128",
      "M30 93 C44 88 58 88 71 90"
    ],
    N: [
      "M23 26 C20 58 20 94 23 126",
      "M25 30 C43 60 60 92 77 122",
      "M78 124 C81 92 81 56 78 26"
    ],
    O: [
      "M55 25 C31 24 17 47 17 74 C17 104 34 128 57 127 C79 126 87 101 86 75 C85 50 76 28 58 25"
    ],
    K: [
      "M24 24 C21 58 21 94 26 128",
      "M80 27 C64 47 48 62 27 75",
      "M36 70 C51 87 67 106 84 128"
    ],

    /* ---- the ticker, 2026-08-29 ---------------------------------
       $ T I L E S — authored to join H A N O K rather than to be
       their own alphabet. The test that settled them was rendering
       `node tools/heropng.js HANOKTILES`: if you can see where one
       set stops and the other starts, they are not finished.

       Every stroke bows (VEN's rule, above). The two that would
       otherwise be ruled lines are $'s stem and T's — both are S
       curves that lean out and land a few units off where they
       started.

       I is drawn with a top and bottom bar on purpose: a bare
       upright at this weight reads as a stray mark rather than a
       letter, and $TILES puts it between two other verticals. */

    /* $ — stem first, then the S round it in one pass. Written this
       way because the stem is what makes it a currency mark; drawn
       S-first the second stroke has nothing to register against and
       the two halves come out misaligned. */
    "$": [
      "M48 15 C45 50 46 94 53 132",
      "M84 52 C82 34 65 25 50 27 C33 29 16 38 18 53 C20 66 37 71 52 77 C69 83 82 90 81 102 C80 114 61 122 45 119 C32 117 22 109 19 101"
    ],
    T: [
      "M12 31 C36 23 62 22 88 27",
      "M50 25 C47 58 47 94 53 128"
    ],
    I: [
      "M22 28 C40 23 60 22 79 27",
      "M51 26 C55 58 55 94 50 127",
      "M23 125 C41 130 59 130 78 126"
    ],
    /* L is ONE stroke — down the stem and away along the foot,
       which is how a hand writes it and why the corner is a curve
       rather than a joint. */
    L: [
      "M25 24 C20 56 21 92 23 122 C46 132 68 128 88 128"
    ],
    E: [
      "M24 28 C45 22 65 21 84 25",
      "M27 29 C22 59 23 95 26 123 C42 130 62 130 85 126",
      "M25 75 C43 70 59 70 76 73"
    ],
    S: [
      "M86 46 C83 30 68 23 53 25 C35 27 15 33 17 48 C19 60 36 66 53 72 C71 79 85 88 84 104 C83 120 64 130 46 127 C31 125 19 116 17 107"
    ]
  };

  /* Hangul blocks are square and read best tight; latin caps as drawn
     here need the wider step they were spaced for. */
  /* the pressure swell: which span of a stroke it covers, and how much
     wider than the stroke it is. Wide enough to be felt, narrow enough
     that the stroke never reads as two strokes. */
  var SWELL_A = 0.20, SWELL_B = 0.80, SWELL_W = 1.20;

  var HANGUL  = /[가-힣]/.test(WORD);
  var ADVANCE = HANGUL ? 100 : 96, X0 = 22, NS = "http://www.w3.org/2000/svg";

  var mount = document.getElementById("heroTitle");
  var hero  = document.getElementById("hero");
  if (!mount || !hero) return;

  var reduced = window.HANOK_REDUCED();

  function el(name, attrs, parent){
    var n = document.createElementNS(NS, name), k;
    for (k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  mount.textContent = "";   // drop the no-JS text fallback

  /* The seal stands clear of the last glyph, and the viewBox is sized
     from the seal rather than the other way round — 와's ㅏ bar
     reaches further right than a latin K's foot does, and at the old
     fixed gap the seal was stamped on top of it.

     WHERE "CLEAR" IS, IS NOW MEASURED — see the block after the
     letters loop. It used to be a constant per script (32 units for
     hangul, 2 for latin) tuned to the two words that had ever been
     set, and the day the wordmark became $TILES the stamp landed on
     top of the S: S reaches x=86 on the grid where K stops at 84,
     and 2 units of gap had no room to give.

     `?stamp=0` drops the stamp and ends the box just past the last
     letter, so the wordmark is not dragged off-centre by 80 units of
     empty paper. It is ON by default and stays that way — it was
     briefly made default-off on 2026-08-29 and reverted the same
     session. The trailing flourish overruns either box and is allowed
     to: the svg is `overflow: visible`. */
  var STAMP = !/[?&]stamp=0/.test(location.search);

  /* `?mark=N` sets the drawn mark's box width in px. That one number
     is the whole type size (css/site.css, .hero__title), and it is a
     knob rather than an edit because the size is a judgement made
     against the painting behind it — Zico asked for the mark smaller
     on 2026-08-30 and it will be looked at again. Digits only, capped:
     it reaches an inline style from the query string. */
  var markQ = /[?&]mark=([0-9]{2,4})/.exec(location.search);
  if (markQ) mount.style.setProperty("--mark-w", Math.min(2000, +markQ[1]) + "px");
  var sealX = X0 + WORD.length * ADVANCE + 32;      // provisional; measured below
  var svg = el("svg", { viewBox: "0 0 " + (sealX + 46) + " 176", "aria-hidden": "true" }, mount);

  /* rough ink edge. Applied per stroke (not to the whole word) so the
     browser only re-runs the filter over the stroke that is animating. */
  var defs = el("defs", {}, svg);
  defs.innerHTML =
    '<filter id="inkRough" x="-14%" y="-14%" width="128%" height="128%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="1" seed="7" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="3.4"/>' +
    '</filter>';

  var inkGroup = el("g", {}, svg);

  /* build strokes ------------------------------------------------ */

  var strokes = [];   // { main, over, len }

  function addStroke(d, transform, w, parent){
    var attrs = { filter: "url(#inkRough)" };
    if (transform) attrs.transform = transform;
    var g = el("g", attrs, parent || inkGroup);
    var main = el("path", {
      d: d, fill: "none", stroke: "#211B11",
      "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round"
    }, g);
    var over = el("path", {
      d: d, fill: "none", stroke: "#211B11", opacity: "0.45",
      "stroke-width": Math.max(3, w * 0.36),
      "stroke-linecap": "round",
      transform: "translate(1.6 -1.2)"
    }, g);
    var len = main.getTotalLength();
    [main, over].forEach(function(p){
      /* THE GAP IS LONGER THAN THE DASH, and it has to be. With
         [len, len] the pattern period is exactly 2·len, so at the
         starting offset the NEXT dash begins at path position len —
         a zero-length dash on the end point, which stroke-linecap
         round renders as a DOT. Every stroke that had not started
         yet was showing one, so the hero began as a scatter of black
         marks over the paper. VEN caught it on 2026-08-30.
         [len, len+4] moves that boundary to len+4, off the end of
         the path, and changes nothing else: the revealed span is
         still s < len - offset. */
      p.style.strokeDasharray = len + " " + (len + 4);
      p.style.strokeDashoffset = len;
    });

    /* PRESSURE. The other half of VEN's note: a stroke of one constant
       width reads as a marker pen however rough its edge is, because a
       brush is heaviest where the hand bears down and lifts at both
       ends. So each stroke gets a second, wider pass over its MIDDLE
       — sampled off the real path with getPointAtLength, so it follows
       curves and uprights alike — and the swell is what makes the two
       kinds of stroke look like the same tool at last.

       It reveals with the main stroke rather than on its own clock:
       its progress is the main's, remapped onto the span it covers,
       so the nib is never ahead of its own ink. Short strokes (the
       vowel bars) are left alone; a swell over 20 units is a blot. */
    var swell = null, sLen = 0;
    if (len > 46){
      var p0 = len * SWELL_A, p1 = len * SWELL_B, steps = 12, d2 = "", si;
      for (si = 0; si <= steps; si++){
        var pt = main.getPointAtLength(p0 + (p1 - p0) * si / steps);
        d2 += (si ? " L" : "M") + pt.x.toFixed(1) + " " + pt.y.toFixed(1);
      }
      swell = el("path", {
        d: d2, fill: "none", stroke: "#211B11",
        "stroke-width": (w * SWELL_W).toFixed(2),
        "stroke-linecap": "round", "stroke-linejoin": "round"
      }, g);
      sLen = swell.getTotalLength();
      swell.style.strokeDasharray = sLen + " " + (sLen + 4);   // see the note above
      swell.style.strokeDashoffset = sLen;
    }

    strokes.push({ main: main, over: over, len: len, swell: swell, sLen: sLen });
  }

  /* `?title=song` — THE TICKER SET IN SONG MYUNG, a test. Zico,
     2026-09-29: *"can also change font of $TILES to 'Song myung
     font'"*. A webfont glyph has no stroke order to write in (see the
     header), so this does not write itself: it is wiped on left to
     right, and the seal stamps after as usual. Built on the crew-test
     branch because the crew sits on the letters and has to be seen on
     both. The brush strokes stay the default. */
  var SONG = /[?&]title=song\b/.test(location.search);
  var songText = null, SONG_BASE = 148, SONG_CAP = 112;

  /* each letter's strokes go in a group of their own, so a letter's
     ink can be measured on its own (window.HANOK_HERO, below) */
  var letterGroups = [];
  var strokeIdx = 0;
  if (!SONG) WORD.split("").forEach(function(ch, i){
    var paths = LETTERS[ch];
    if (!paths) return;
    var x = X0 + i * ADVANCE;
    var tilt = ((i * 137) % 5 - 2) * 0.7;              // deterministic jitter
    var t = "translate(" + x + " 14) rotate(" + tilt + " 50 76)";
    var lg = el("g", {}, inkGroup), wMax = 0;
    paths.forEach(function(d){
      /* deterministic width variation — brush pressure, not marker pen */
      var w = 9.5 + ((strokeIdx++ * 7) % 4);
      if (w > wMax) wMax = w;
      addStroke(d, t, w, lg);
    });
    letterGroups.push({ ch: ch, i: i, g: lg, half: wMax * SWELL_W / 2 });
  });
  if (SONG){
    songText = el("text", {
      x: X0, y: SONG_BASE, fill: "#211B11", filter: "url(#inkRough)",
      "font-family": "'Song Myung', serif",
      /* a first guess at the size; set properly from the face's own
         cap height once it has loaded — see songFit() */
      "font-size": String(Math.round(SONG_CAP / 0.7))
    }, inkGroup);
    songText.textContent = WORD;
  }

  /* MEASURE THE INK, THEN PLACE THE STAMP. getBBox is the letters'
     own geometry in the svg's user space — no stroke width, no
     filter, and deterministic for a given word, so the viewBox this
     produces is stable and the CSS box below can still be tuned
     against it.

     SEAL_AIR is the one number left: units from the last stroke's
     geometry to the CENTRE of the 34-unit stamp. 37 is the air the
     hand-tuned hangul gap worked out to, so 기와 lands where it
     always did to within two units — measured in Chrome, ink right
     218.6, stamp at 256, against the old constant's 254. The two are
     the over-stroke: it is offset translate(1.6 -1.2), getBBox counts
     it and the old arithmetic never did. Every other word now gets
     that same air without a new constant.

     Measured BEFORE the flourish on purpose: the flourish leaves the
     baseline and curls down and back, so it is not what the seal has
     to stand clear of. If getBBox is unavailable — a hidden ancestor
     throws in Firefox — the provisional arithmetic above stands. */
  var SEAL_AIR = 37, inkRight = 0;
  function fitBox(){
    try { var bb = inkGroup.getBBox(); inkRight = bb.x + bb.width; } catch(e){}
    if (inkRight > 0){
      sealX = Math.round(inkRight + SEAL_AIR);
      svg.setAttribute("viewBox",
        "0 0 " + (STAMP ? sealX + 46 : Math.round(inkRight) + 6) + " 176");
    }
  }
  fitBox();

  /* ---- what the crew stands on (js/crew.js, crew-test branch) ----
     window.HANOK_HERO.ready resolves with each letter's INK box in the
     svg's own units — { ch, i, x0, x1, top, bottom } — plus the
     viewBox, so anything placed on the letters can be positioned in %
     of the title and scale with it. Brush letters are measured off
     their own strokes (geometry + half the widest stroke, swell
     included); Song Myung glyphs off canvas measureText in the loaded
     face, which is the only place a glyph's ink (not its em box) can
     be read. It resolves once, when the letters are final: at once
     for the brush, after the face has loaded for `?title=song`.

     A BOX IS NOT A SURFACE. Zico, 2026-09-30, on the crew: *"make sure
     the ladder guy is placing the tile on the top of something rather
     than leaving it floating"* — and the laptop-sitter on the $ was
     floating ~12px, because the $'s box top is the tip of its stem
     while the curve under her is far lower. So the title's INK is also
     published: the letters are rasterised once (the brush strokes
     fully written, rough-edge filter and all; a webfont drawn with
     fillText in the loaded face) and three questions can be asked of
     it, all in svg units:
       topAt(xa, xb)          the highest ink over that span
       profile(xa, xb)        the top of the ink in each 1-unit column
       inkIn(x0, y0, x1, y1)  the share of that rect that is ink
     If the raster fails the helpers fall back to the letter boxes.
     A late webfont (loaded after the 4s wait) re-publishes and fires
     `hanok:relayout` on #hero with the new geometry. */
  var readyResolve;
  window.HANOK_HERO = { svg: svg, ready: new Promise(function(r){ readyResolve = r; }) };
  var INK_S = 2;                       // raster px per svg unit
  function rasterInk(cb){
    var vb = svg.viewBox.baseVal, W = Math.ceil(vb.width * INK_S), Hh = Math.ceil(vb.height * INK_S);
    var cv = document.createElement("canvas"); cv.width = W; cv.height = Hh;
    var cx = cv.getContext("2d", { willReadFrequently: true });
    function done(ok){
      if (!ok) return cb(null);
      var d = cx.getImageData(0, 0, W, Hh).data, m = new Uint8Array(W * Hh);
      for (var i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 110 ? 1 : 0;
      cb({ w: W, h: Hh, s: INK_S, m: m });
    }
    if (SONG){
      cx.scale(INK_S, INK_S);
      cx.font = songText.getAttribute("font-size") + "px 'Song Myung'";
      for (var i = 0; i < WORD.length; i++){
        var p; try { p = songText.getStartPositionOfChar(i); } catch(e){ continue; }
        cx.fillText(WORD.charAt(i), p.x, SONG_BASE);
      }
      return done(true);
    }
    /* the strokes as they will be once written: a clone with every dash
       pattern cleared, drawn as an image (SVG-in-<img> keeps the filter) */
    var clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", NS);
    clone.setAttribute("width", W); clone.setAttribute("height", Hh);
    Array.prototype.forEach.call(clone.querySelectorAll("path"), function(p){
      p.style.strokeDasharray = "none"; p.style.strokeDashoffset = "0";
    });
    Array.prototype.forEach.call(clone.querySelectorAll("circle, text, rect"), function(n){
      if (!n.closest || !n.closest("defs")) n.parentNode.removeChild(n);
    });
    var url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
    var img = new Image();
    img.onload = function(){ cx.drawImage(img, 0, 0, W, Hh); URL.revokeObjectURL(url); done(true); };
    img.onerror = function(){ URL.revokeObjectURL(url); done(false); };
    img.src = url;
  }
  function inkApi(R, L){
    function col(x){ return Math.max(0, Math.min(R.w - 1, Math.round(x * R.s))); }
    function topCol(c){
      for (var y = 0; y < R.h; y++) if (R.m[y * R.w + c]) return y / R.s;
      return Infinity;
    }
    return {
      topAt: function(xa, xb){
        var t = Infinity;
        for (var c = col(Math.min(xa, xb)); c <= col(Math.max(xa, xb)); c++) t = Math.min(t, topCol(c));
        return t;
      },
      profile: function(xa, xb){
        var out = [];
        for (var x = Math.floor(xa); x <= Math.ceil(xb); x++) out.push(topCol(col(x)));
        return out;
      },
      inkIn: function(x0, y0, x1, y1){
        var a = col(x0), b = col(x1), c0 = Math.max(0, Math.round(y0 * R.s)), c1 = Math.min(R.h - 1, Math.round(y1 * R.s)), n = 0, hit = 0;
        for (var y = c0; y <= c1; y++) for (var c = a; c <= b; c++){ n++; hit += R.m[y * R.w + c]; }
        return n ? hit / n : 0;
      },
      raster: true
    };
  }
  function boxApi(L){
    /* no raster: answer from the letter boxes (the old behaviour) */
    function over(xa, xb){ return L.filter(function(l){ return l.x1 >= xa && l.x0 <= xb; }); }
    return {
      topAt: function(xa, xb){ var t = Infinity; over(xa, xb).forEach(function(l){ t = Math.min(t, l.top); }); return t; },
      profile: function(xa, xb){ var out = []; for (var x = Math.floor(xa); x <= Math.ceil(xb); x++) out.push(this.topAt(x, x)); return out; },
      inkIn: function(){ return 0; },
      raster: false
    };
  }
  function letterBoxes(){
    var out = [];
    if (SONG){
      var cx = document.createElement("canvas").getContext("2d"), PX = 200,
          k = +songText.getAttribute("font-size") / PX;
      cx.font = PX + "px 'Song Myung'";
      for (var i = 0; i < WORD.length; i++){
        var ch = WORD.charAt(i), m = cx.measureText(ch), sx;
        try { sx = songText.getStartPositionOfChar(i).x; } catch(e){ continue; }
        out.push({ ch: ch, i: i,
          x0: sx - m.actualBoundingBoxLeft * k, x1: sx + m.actualBoundingBoxRight * k,
          top: SONG_BASE - m.actualBoundingBoxAscent * k,
          bottom: SONG_BASE + m.actualBoundingBoxDescent * k });
      }
    } else {
      letterGroups.forEach(function(L){
        try {
          var b = L.g.getBBox();
          out.push({ ch: L.ch, i: L.i, x0: b.x - L.half, x1: b.x + b.width + L.half,
                     top: b.y - L.half, bottom: b.y + b.height + L.half });
        } catch(e){}
      });
    }
    return out;
  }
  var published = false;
  function publish(){
    var vb = svg.viewBox.baseVal, L = letterBoxes();
    /* the crew's scale comes off the letters' MEDIAN height (not the
       $, which overshoots): one swash on a new font's T must not grow
       every figure on the page */
    var hs = L.filter(function(l){ return l.ch !== "$"; })
              .map(function(l){ return l.bottom - l.top; }).sort(function(a, b){ return a - b; });
    var cap = hs.length ? hs[hs.length >> 1] : 110;
    rasterInk(function(R){
      var G = { vbW: vb.width, vbH: vb.height, letters: L, cap: cap };
      var api = R ? inkApi(R, L) : boxApi(L);
      for (var k in api) G[k] = api[k];
      window.HANOK_HERO.geom = G;
      if (!published){ published = true; readyResolve(G); }
      else { try { hero.dispatchEvent(new CustomEvent("hanok:relayout", { detail: G })); } catch(e){} }
    });
  }

  /* Song Myung arrives by an ASYNC stylesheet (media=print, swapped on
     load), so at this point its @font-face rules may not even exist —
     and document.fonts.check() over a face that is not registered
     answers TRUE (tools/widths.html measured in Times for exactly this
     reason until 2026-08-30: check the face, never the stack).
     So wait until a face of that family is actually IN the set, then
     until the six glyphs are loaded. Four seconds, then go anyway. */
  function whenSong(cb){
    var t0 = Date.now();
    (function poll(){
      var known = false;
      document.fonts.forEach(function(f){ if (/Song Myung/i.test(f.family)) known = true; });
      if (known){
        if (document.fonts.check("200px 'Song Myung'", WORD)) return cb(true);
        document.fonts.load("200px 'Song Myung'", WORD);
      }
      if (Date.now() - t0 > 4000) return cb(false);
      setTimeout(poll, 60);
    })();
  }
  /* size the face so its T stands SONG_CAP units tall, like the brush
     caps, then re-measure the box and move the seal after it */
  function songFit(){
    var cx = document.createElement("canvas").getContext("2d");
    cx.font = "200px 'Song Myung'";
    var capR = cx.measureText("T").actualBoundingBoxAscent / 200;
    if (capR > 0.3 && capR < 1.2) songText.setAttribute("font-size", (SONG_CAP / capR).toFixed(1));
    fitBox();
    if (seal) seal.setAttribute("transform", "translate(" + sealX + " 108)" +
      (seal.getAttribute("opacity") === "1" ? " rotate(-3)" : ""));
  }
  if (!SONG) publish();

  /* Trailing flourish off the last letter — the ink-line motif that
     leads the eye down toward the journey. IT BELONGS TO A LETTER,
     not to a script, and the map is why:

     A flourish is the pen carrying on after the last stroke, so it
     has to leave from where the pen actually stopped. K stops at the
     foot of its right leg, bottom-right, and the tail falls out of
     it. Nothing else here does. Off 와 the only exit is the foot of
     ㅏ's stem, where it reads as part of the vowel and makes the
     glyph look mis-written — and Korean brush writing does not tail
     a syllable block, so there is nothing to imitate either. Off S
     it is worse and it shipped for a few minutes on 2026-08-30:
     S finishes at its BOTTOM-LEFT (17,107), so a tail drawn at the
     bottom-right hangs there attached to nothing and the mark reads
     as "$TILES,".

     So: a letter that can carry one names its own, and a word ending
     in anything else simply does not get one. */
  var FLOURISH = { K: "M84 128 C97 149 74 160 62 171" };
  var lastCh = WORD.charAt(WORD.length - 1);
  if (FLOURISH[lastCh]){
    var fx = X0 + (WORD.length - 1) * ADVANCE;
    addStroke(FLOURISH[lastCh], "translate(" + fx + " 14)", 3.5);
  }

  /* nib */
  var nib = el("circle", { r: "4", fill: "#211B11", opacity: "0" }, svg);

  /* seal, stamped after the writing (sealX is set with the viewBox).
     Only built under `?stamp=1` — see STAMP above. */
  var seal = null;
  if (STAMP){
    seal = el("g", { opacity: "0", transform: "translate(" + sealX + " 108)" }, svg);
    el("rect", { x: "-17", y: "-17", width: "34", height: "34", rx: "6", fill: "#8E4A38" }, seal);
    // One source for the glyph: CONFIG.token.seal, resolved (and
    // `?seal=`-overridden) in js/config.js so the stamp here, the map
    // markers and the CSS seals cannot drift apart.
    var sealG = TOKEN.seal || "韓",
        sealQ = TOKEN.sealScale || 1;
    var sealText = el("text", {
      x: "0", y: String(9 * sealQ), "text-anchor": "middle",
      "font-family": "'Song Myung', serif",
      "font-size": String(22 * sealQ), fill: "#EBDDB9"
    }, seal);
    sealText.textContent = sealG;
  }

  /* reveal helpers ---------------------------------------------- */

  function finishHero(){
    hero.classList.add("is-written");
    /* for anything that waits on the mark (js/crew.js) — a class alone
       cannot be listened for */
    try { hero.dispatchEvent(new CustomEvent("hanok:written")); } catch(e){}
    /* The lore line rides in first and closest — it belongs to the
       mark above it, not to the tagline below. */
    ["heroLore", "heroTagline", "heroActions"].forEach(function(id, i){
      var n = document.getElementById(id);
      if (n) setTimeout(function(){ n.classList.add("is-in"); }, i * 180);
    });
  }

  function stampSeal(instant){
    if (!seal) return;                    // `?stamp=1` off — nothing to stamp
    if (instant){
      seal.setAttribute("opacity", "1");
      seal.setAttribute("transform", "translate(" + sealX + " 108) rotate(-3)");
      return;
    }
    var t0 = null;
    function frame(ts){
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / 240);
      var e = 1 - Math.pow(1 - p, 3);                      // ease-out
      var s = 1.7 - 0.7 * e;
      seal.setAttribute("opacity", String(Math.min(1, p * 1.6)));
      seal.setAttribute("transform",
        "translate(" + sealX + " 108) rotate(" + (-8 + 5 * e) + ") scale(" + s + ")");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* timeline ------------------------------------------------------ */

  /* `?title=song`: no strokes to write. Hidden behind a zero-width
     mask until the face has loaded (never show the fallback serif),
     then wiped on left to right through a soft-edged rect, and the
     seal stamps as it does after the brush. */
  if (SONG){
    if (reduced){
      stampSeal(true);
      finishHero();
      whenSong(function(ok){
        songFit(); publish();
        if (!ok) document.fonts.load("200px 'Song Myung'", WORD).then(function(){ songFit(); publish(); });
      });
      return;
    }
    var soft = el("filter", { id: "songSoft", x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs);
    el("feGaussianBlur", { stdDeviation: "9" }, soft);
    var wipe = el("mask", { id: "songWipe", maskUnits: "userSpaceOnUse",
                            x: "-60", y: "-60", width: "2400", height: "300" }, defs);
    var wipeR = el("rect", { x: "-40", y: "-40", width: "0", height: "260",
                             fill: "#fff", filter: "url(#songSoft)" }, wipe);
    inkGroup.setAttribute("mask", "url(#songWipe)");
    whenSong(function(ok){
      songFit(); publish();
      if (!ok) document.fonts.load("200px 'Song Myung'", WORD).then(function(){
        if (document.fonts.check("200px 'Song Myung'", WORD)){ songFit(); publish(); }
      });
      var span = svg.viewBox.baseVal.width + 80, t0 = null, DUR = 1500;
      function frame(ts){
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / DUR);
        var e = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2) / 2;
        wipeR.setAttribute("width", String(e * span));
        if (p < 1) return requestAnimationFrame(frame);
        inkGroup.removeAttribute("mask");
        stampSeal(false);
        setTimeout(finishHero, 220);
      }
      requestAnimationFrame(frame);
    });
    return;
  }

  if (reduced){
    strokes.forEach(function(s){
      s.main.style.strokeDashoffset = 0;
      s.over.style.strokeDashoffset = 0;
      if (s.swell) s.swell.style.strokeDashoffset = 0;
    });
    stampSeal(true);
    finishHero();
    return;
  }

  var START_DELAY = 300, STROKE_GAP = 50, t = START_DELAY;
  var timeline = strokes.map(function(s){
    var dur = Math.max(150, Math.min(460, s.len * 1.7));
    var item = { s: s, start: t, dur: dur };
    t += dur + STROKE_GAP;
    return item;
  });
  var writingEnd = t;

  function ease(p){ return p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p + 2, 2) / 2; }

  var begun = null, sealDone = false;
  function tick(ts){
    if (begun === null) begun = ts;
    var now = ts - begun, active = null;

    timeline.forEach(function(it){
      var p = (now - it.start) / it.dur;
      if (p <= 0) return;
      p = Math.min(1, p);
      var off = it.s.len * (1 - ease(p));
      it.s.main.style.strokeDashoffset = off;
      it.s.over.style.strokeDashoffset = off;
      /* the swell covers SWELL_A..SWELL_B of the stroke, so it is
         revealed on the main stroke's progress remapped onto that
         span — otherwise the heavy middle would arrive before the
         nib reaches it. */
      if (it.s.swell){
        var sp = (ease(p) - SWELL_A) / (SWELL_B - SWELL_A);
        sp = sp < 0 ? 0 : sp > 1 ? 1 : sp;
        it.s.swell.style.strokeDashoffset = it.s.sLen * (1 - sp);
      }
      if (p < 1) active = { it: it, p: p };
    });

    if (active){
      var pt = active.it.s.main.getPointAtLength(active.it.s.len * ease(active.p));
      var m = active.it.s.main.getScreenCTM(), sm = svg.getScreenCTM();
      /* getPointAtLength is in the path's local space; map through its
         transform relative to the svg root's user space */
      if (m && sm){
        var rel = sm.inverse().multiply(m);
        var x = rel.a * pt.x + rel.c * pt.y + rel.e;
        var y = rel.b * pt.x + rel.d * pt.y + rel.f;
        nib.setAttribute("cx", x);
        nib.setAttribute("cy", y);
        nib.setAttribute("opacity", "0.9");
      }
    } else {
      nib.setAttribute("opacity", "0");
    }

    if (now >= writingEnd + 160 && !sealDone){
      sealDone = true;
      stampSeal(false);
      setTimeout(finishHero, 220);
    }

    if (now < writingEnd + 1400) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

})();
