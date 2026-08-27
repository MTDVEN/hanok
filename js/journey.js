/* ================================================================
   JOURNEY — sticky pseudo-3D road past four places in Korea.

   Ported from journey-reference.html. One projection drives both
   the road and the location panels so they share a vanishing
   point; the slider is replaced by scroll progress through the
   460vh `.journey` wrapper. Per the reference: no CSS 3D.

   ART: each entry in SPOTS carries `img` (the final square painting,
   mounted in a local AWxAH box standing on the road's ground line)
   and `art` (the original inline ink drawing, authored in a 220x170
   box with its ground line at y=170). The ink drawing is now only a
   stand-in: it is drawn under the painting and dropped the moment
   the painting loads, so a slow connection never shows bare road.
================================================================= */

(function(){
  "use strict";

  var journey = document.getElementById("journey");
  var stage   = document.getElementById("journeyStage");
  if (!journey || !stage) return;

  var gImgs = document.getElementById("jImgs"),
      gRoad = document.getElementById("jRoad");

  var reduced = window.HANOK_REDUCED();

  /* ---- stand-in ink drawings ------------------------------------ */

  var INK = "#211B11", PINE = "#5C6648", PAPER = "#EBDDB9", SEAL = "#8E4A38";
  /* the dojang's GLYPH, as opposed to SEAL above which is its colour.
     One source for all three consumers — see the note in js/config.js. */
  var SEAL_TOKEN = (window.HANOK_CONFIG || {}).token || {},
      SEAL_G = SEAL_TOKEN.seal || "韓",
      SEAL_Q = SEAL_TOKEN.sealScale || 1;

  /* Declared up here, not down in the road block where it used to live:
     map mode builds SVG too, and it runs BEFORE that line. `var` hoists
     the declaration but not the assignment, so leaving it below made
     createElementNS(undefined, ...) — elements in the null namespace,
     which render as nothing and look exactly like a CSS fault. */
  var NS = "http://www.w3.org/2000/svg";

  function roofPath(x, y, w, h, lift){
    /* classic hanok silhouette: a level ridge, an eave line that sags
       in the middle and kicks up at the tips */
    var l = x, r = x + w;
    return "M" + l + " " + (y + h - lift) +
      " C" + (l + w * .28) + " " + (y + h * 1.04) + " " + (r - w * .28) + " " + (y + h * 1.04) + " " + r + " " + (y + h - lift) +
      " C" + (r - w * .08) + " " + (y + h * .5) + " " + (r - w * .12) + " " + (y + h * .2) + " " + (r - w * .2) + " " + y +
      " C" + (r - w * .34) + " " + (y + h * .12) + " " + (l + w * .34) + " " + (y + h * .12) + " " + (l + w * .2) + " " + y +
      " C" + (l + w * .12) + " " + (y + h * .2) + " " + (l + w * .08) + " " + (y + h * .5) + " " + l + " " + (y + h - lift) + " Z";
  }

  function gate(){  /* Gyeongbokgung — two-tier gate on a stone base */
    var s = "";
    s += '<rect x="30" y="112" width="160" height="58" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>';
    ["62","102","142"].forEach(function(ax){
      s += '<path d="M' + ax + ' 170 v-34 a14 14 0 0 1 28 0 v34" transform="translate(-14 0)" fill="' + INK + '" opacity=".85"/>';
    });
    s += '<rect x="46" y="86" width="128" height="26" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M52 92 h116 M52 100 h116" stroke="' + INK + '" stroke-width="1.6" opacity=".5"/>';
    s += '<path d="' + roofPath(24, 56, 172, 30, 13) + '" fill="' + INK + '"/>';
    s += '<rect x="64" y="34" width="92" height="22" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="' + roofPath(48, 6, 124, 28, 12) + '" fill="' + INK + '"/>';
    return s;
  }

  function hall(){  /* Changdeokgung — one grand hall on a terrace */
    var s = "";
    s += '<rect x="18" y="150" width="184" height="10" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    s += '<rect x="28" y="160" width="164" height="10" fill="none" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M48 150 v-44 M76 150 v-44 M104 150 v-44 M132 150 v-44 M160 150 v-44 M172 150 v-44" stroke="' + PINE + '" stroke-width="5"/>';
    s += '<rect x="40" y="96" width="140" height="12" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="' + roofPath(26, 58, 168, 34, 14) + '" fill="' + INK + '"/>';
    s += '<path d="' + roofPath(58, 26, 104, 26, 11) + '" fill="' + INK + '"/>';
    s += '<path d="M110 96 v54" stroke="' + INK + '" stroke-width="2" opacity=".45"/>';
    return s;
  }

  function hanoks(){  /* Namsangol — two small houses and a pine */
    var s = "";
    s += '<path d="M28 170 v-38 h56 v38" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="' + roofPath(16, 106, 80, 24, 10) + '" fill="' + INK + '"/>';
    s += '<path d="M44 170 v-22 h20 v22" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
    s += '<path d="M104 170 v-46 h64 v46" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="' + roofPath(92, 96, 90, 26, 11) + '" fill="' + INK + '"/>';
    s += '<path d="M120 152 h34 M120 140 h34" stroke="' + INK + '" stroke-width="1.8" opacity=".5"/>';
    /* pine tree */
    s += '<path d="M196 170 C192 148 196 132 190 116" fill="none" stroke="' + INK + '" stroke-width="4"/>';
    s += '<path d="M170 118 C178 104 202 102 210 112 C216 96 196 88 184 94 C172 84 158 96 164 108 C158 114 162 122 170 118 Z" fill="' + PINE + '" opacity=".9"/>';
    return s;
  }

  function village(){  /* Jeonju — a dense row of roofs */
    var s = "", i;
    var xs = [0, 52, 108, 160], ys = [128, 118, 124, 132], ws = [66, 72, 66, 60];
    for (i = 0; i < 4; i++){
      s += '<path d="M' + (xs[i] + 8) + ' 170 v-' + (166 - ys[i] - 26) + ' h' + (ws[i] - 16) + ' v' + (166 - ys[i] - 26) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.6"/>';
      s += '<path d="' + roofPath(xs[i], ys[i], ws[i], 20, 9) + '" fill="' + INK + '"/>';
    }
    s += '<path d="M20 170 h180" stroke="' + INK + '" stroke-width="2" opacity=".4"/>';
    return s;
  }

  /* depth = when you reach it: smallest d0 is passed first, so this
     is Zico's visit order — Gyeongbokgung first, Jeonju last. */
  /* `blurb` is PLACEHOLDER COPY — split mode needs a paragraph per stop
     and Zico still owes the real text (§1). Written only so the layout
     can be judged; none of it is final, replace it wholesale. */
  /* Client copy goes into innerHTML in map mode, so it is escaped on
     the way in. Nothing in SPOTS needs it today; the next paste from
     Zico might. */
  function esc(s){
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* `blurb` is split/road/static mode's paragraph — the pinned column
     has room for a sentence with rhythm. `copy` is MAP mode's, and it
     is a different job: it is written onto the sheet itself, in a
     block of blank parchment beside the landmark, so every line is
     pre-broken and none of them may run long. Keep lines at or under
     ~52 characters — the block's footprint is what maproute searches
     blank paper for, and a longer line is a line over a mountain.

     THE CONTENT IS ZICO'S, 2026-08-21, revised 2026-08-25 against the
     brief VEN forwarded (Upbit's own framing of the chain). Four
     stops, four beats: the palace says what Giwa IS, the complex says
     what the project intends, the village says how to get on-chain,
     and Jeonju says what the tile MEANS.

     What the 2026-08-25 brief added, and where each line of it went:
       - "Giwa chain is launched by Upbit cex. They have 75% of market
         share in korea."  ->  stop 1. Written as "about three
         quarters", not "75%": it is a share that moves, the page has
         no date on it, and a round claim that ages badly on a token
         site is worth less than an accurate one that does not.
       - "Giwa directly translates to Tile"  ->  stop 1, kept.
       - "Small tiles interlocking to form a strong protective
         roof/foundation" + "relates to korean culture and history"
         ->  stop 4, which had been blank. It is the metaphor's
         payoff, so it belongs at the END of the road rather than
         doubled up with the Upbit facts at the start — and Jeonju,
         eight hundred roofs in one valley, is the place on this map
         that argues it without needing to say so.
       - "Tiles are also the pfp, logo and brand" is the one line NOT
         written in. It is a fact about the chain's marketing, not
         about the token, and on the sheet it would read as a brand
         guideline rather than as a note in the margin of a map.

     One gap remains, Zico's to fill and not invented here: Namsangol's
     steps. He gave the two headings ("How to access Giwa chain", "How
     to swap on Giwa chain") and no steps, and a guessed bridge or DEX
     on a token page is the one mistake that costs somebody money. It
     says so instead. */
  var SPOTS = [
    { d0: 1150, s: -1, name: "Gyeongbokgung Palace",   ko: "경복궁",  img: "art/gyeongbokgung.png", art: gate(),
      blurb: "The palace of shining happiness. Six centuries of court and quiet, burned and raised again, still facing the mountain it was built to answer.",
      copy: ["An L2 from Upbit, the exchange that carries",
             "about three quarters of all crypto traded",
             "in Korea. 기와 means roof tile, and the chain",
             "takes both its name and its mark from one."] },
    { d0: 1900, s:  1, name: "Changdeokgung Palace",   ko: "창덕궁",  img: "art/changdeokgung.png", art: hall(),
      blurb: "Built to follow the land rather than flatten it. Its rear garden was kept for the king alone, and the trees there are older than the hands that planted them.",
      copy: ["More than a meme. Partnerships with local and",
             "larger charities are coming, and a share of",
             "funds goes to re-roofing homes for families",
             "in need."] },
    { d0: 2650, s: -1, name: "Namsangol Hanok Village",ko: "남산골",  img: "art/namsangol.png",     art: hanoks(),
      blurb: "Five houses carried stone by stone from across the city and set down together beneath the south mountain, so the old way of living would have somewhere to stand.",
      copy: ["How to reach Giwa chain, and how to swap",
             "once you are on it. The steps are written",
             "here at launch."] },
    { d0: 3500, s:  1, name: "Jeonju Hanok Village",   ko: "전주",    img: "art/jeonju.png",        art: village(),
      blurb: "Eight hundred roofs held in one valley: the largest hanok village left, and the only one where someone still lives behind every door.",
      copy: ["Eight hundred roofs, and not one tile among",
             "them holds alone. Small pieces interlock",
             "into a roof that shelters the whole street.",
             "Korea has built that way for six centuries."] }
  ];

  /* The paintings are square 1:1, so the panel box is square too and
     the image fills it exactly (no letterboxing). Its bottom edge is
     what sits on the road's ground line. */
  var AW = 200, AH = 200;

  /* ---- panel finishing: how a painting meets the page -------------

     Mounted raw, the paintings read as glossy tiles pasted onto the
     landscape: they are full-bleed squares (the crop slices rocks and
     trees mid-form, so the boundary is unmistakable) and their paper
     is lighter than ours — and not even consistent with each other,
     Gyeongbokgung being cool cream where Jeonju is warm brown.

     Three treatments, switchable with ?panels= . Keep all three:
     VEN picked `key`, but the others are the way back if the art is
     re-exported or the call changes.

       key      (default, VEN's pick 2026-08-12) the paper is keyed out
                by ink density measured against that painting's OWN
                ground, so only ink and pigment survive and sit
                straight on the page. Nothing rectangular survives at
                any position, because the ground is truly transparent.
       feather  soft-edged and toned onto --paper: the square dissolves
                and the papers agree. Richer, but its ground stays
                opaque, so a faint lighter patch reads wherever a panel
                crosses the dark backdrop mountain.
       raw      the original hard-edged tile. Keep it — it is how you
                check whether a future art re-export needs treating.

     Both are baked ONCE into a canvas and handed back as a blob URL —
     NOT applied as an SVG filter or mask. A filter/mask on a panel
     re-rasterises every frame as the panel scales, which would undo
     the build-once/attributes-only architecture draw() depends on.
     Baked, the per-frame cost is exactly what it was before.

     Tuning knobs are all URL-overridable so they can be A/B'd in the
     browser without an edit — e.g.
       ?motion=1&panels=feather&tone=0.45&fx=0.2
     Under file:// the canvas taints and getImageData throws; that is
     caught and the painting is served raw, same as today. */

  function qs(name, dflt){
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(location.search);
    var v = m ? parseFloat(decodeURIComponent(m[1])) : NaN;
    return isFinite(v) ? v : dflt;
  }

  /* VEN chose `key` on 2026-08-12. The other modes are deliberately
     KEPT, not deleted — they are the way back if the art is re-exported
     or the call changes. Nothing else in the file depends on which one
     is default. */
  var PANEL_MODE = (function(){
    var m = /[?&]panels=([a-z]+)/i.exec(location.search);
    return m ? m[1].toLowerCase() : "key";
  })();

  /* fraction of the box that fades out, per edge. The bottom fades
     less: that edge stands on the road's ground line, and fading it as
     hard as the top lifts the painting off the road. */
  var FX  = qs("fx",  0.16),
      FTOP = qs("ftop", 0.20),
      FBOT = qs("fbot", 0.10);
  /* 0 = keep the painting's own paper, 1 = land it exactly on --paper */
  var TONE = qs("tone", 1);
  /* key mode: ink density (1 - lum/paperLum) is remapped through this
     window, so the paper goes fully transparent and the ink stays solid */
  var KEY_LO = qs("keylo", 0.04),
      KEY_HI = qs("keyhi", 0.70);

  /* The section title gets the top of the screen to itself: no painting
     is drawn until the heading has begun to clear, then they fade in
     together over ENTER_OVER of scroll.

     They cannot simply be placed lower instead. A panel stands ON the
     road, anchored by its bottom edge to the ground line, so its top
     can never fall below the horizon — and the heading sits ABOVE the
     horizon (measured at 1280x551: heading 28-118px, horizon 132px,
     near panel -22..226px). Pushing the SPOTS further down the road
     only clears the title if they start roughly 7x further away, which
     would need TRAVEL and the 460vh budget stretched to match and would
     wreck the tuned pacing. Choreography is the only lever that
     separates them without touching the projection. */
  var ENTER_AT   = qs("enter",     0.030),
      ENTER_OVER = qs("enterover", 0.060);

  var PAPER_RGB = [0xDF, 0xCE, 0xA5];   /* --paper */
  var baked = {};
  /* mean colour of each painting's PIGMENT (paper excluded) — split
     mode tints the section with it so the field changes per stop */
  var artTone = {};

  function smooth(t){ return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); }

  /* The tone match is MEASURED, not assumed. Each painting sits on its
     own aged paper — Gyeongbokgung's is cool cream where Jeonju's is
     warm brown — so one fixed multiplier would leave the four
     disagreeing with each other as well as with the page. Take the mean
     colour of the lightest ~8% of pixels as "this painting's paper";
     the per-channel ratio that maps that onto --paper is the multiplier,
     and it normalises all four onto one sheet for free. */
  function paperOf(px){
    var n = px.length, hist = new Int32Array(256), i, lum, count = 0;
    for (i = 0; i < n; i += 4){
      lum = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) | 0;
      hist[lum]++; count++;
    }
    var want = count * 0.08, seen = 0, cut = 255;
    for (i = 255; i >= 0; i--){ seen += hist[i]; if (seen >= want){ cut = i; break; } }
    var r = 0, g = 0, b = 0, m = 0;
    for (i = 0; i < n; i += 4){
      lum = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) | 0;
      if (lum >= cut){ r += px[i]; g += px[i + 1]; b += px[i + 2]; m++; }
    }
    return m ? [r / m, g / m, b / m] : [255, 255, 255];
  }

  /* how hard to push one channel, lerped by TONE and kept sane if a
     painting turns up with an unexpectedly dark or light ground */
  function toneRatio(our, theirs){
    var s = theirs > 1 ? our / theirs : 1;
    if (s > 1.15) s = 1.15;
    if (s < 0.35) s = 0.35;
    return 1 + TONE * (s - 1);
  }

  /* cb(url) with the treated painting, or cb(null) if the file itself
     failed to load. If only the canvas work fails we hand back the
     original URL, so a tainted canvas degrades to today's look. */
  function bakeArt(src, cb){
    if (baked[src]){ cb(baked[src]); return; }
    var img = new Image();
    img.onerror = function(){ cb(null); };
    img.onload = function(){
      if (PANEL_MODE === "raw"){ baked[src] = src; cb(src); return; }
      try {
        var w = img.naturalWidth, h = img.naturalHeight;
        var c = document.createElement("canvas");
        c.width = w; c.height = h;
        var ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var id = ctx.getImageData(0, 0, w, h), px = id.data;

        /* edge falloff as two 1-D profiles, multiplied per pixel — the
           product (rather than a min) double-fades the corners, which
           are the most card-like part of the square */
        var fx = new Float32Array(w), fy = new Float32Array(h), i, j, u, v;
        for (i = 0; i < w; i++){
          u = (i + 0.5) / w;
          fx[i] = Math.min(smooth(u / FX), smooth((1 - u) / FX));
        }
        for (j = 0; j < h; j++){
          v = (j + 0.5) / h;
          fy[j] = Math.min(smooth(v / FTOP), smooth((1 - v) / FBOT));
        }

        /* map this painting's own paper onto ours */
        var pw = paperOf(px);
        var sR = toneRatio(PAPER_RGB[0], pw[0]),
            sG = toneRatio(PAPER_RGB[1], pw[1]),
            sB = toneRatio(PAPER_RGB[2], pw[2]);
        var pLum = (0.2126 * pw[0] + 0.7152 * pw[1] + 0.0722 * pw[2]) || 255;

        var keying = PANEL_MODE === "key", kSpan = KEY_HI - KEY_LO || 1;
        var p = 0, a, r, g, b, fyj, dens;
        var tr = 0, tg = 0, tb = 0, tn = 0;
        for (j = 0; j < h; j++){
          fyj = fy[j];
          for (i = 0; i < w; i++, p += 4){
            r = px[p]; g = px[p + 1]; b = px[p + 2];
            a = fx[i] * fyj;
            /* ink density relative to THIS painting's paper, so the
               ground keys out exactly instead of leaving a grey box */
            dens = 1 - (0.2126 * r + 0.7152 * g + 0.0722 * b) / pLum;
            /* anything meaningfully darker than the paper counts as
               pigment — averaging the whole image would just return the
               paper again and all four stops would tint identically */
            if (dens > 0.15){ tr += r; tg += g; tb += b; tn++; }
            if (keying) a *= smooth((dens - KEY_LO) / kSpan);
            px[p]     = r * sR;
            px[p + 1] = g * sG;
            px[p + 2] = b * sB;
            px[p + 3] = px[p + 3] * a;
          }
        }
        artTone[src] = tn ? [tr / tn, tg / tn, tb / tn] : PAPER_RGB.slice();

        ctx.putImageData(id, 0, 0);
        c.toBlob(function(blob){
          var url = blob ? URL.createObjectURL(blob) : src;
          baked[src] = url;
          cb(url);
        });
        return;
      } catch (e){ /* tainted canvas (file://) or no 2d context */ }
      baked[src] = src;
      cb(src);
    };
    img.src = src;
  }

  /* Fit the 220x170 ink stand-in into that box, standing on its floor.
     A nested <svg> gives it its own viewport, which clips it: the
     terrace strokes sit right on y=170 and would otherwise show as a
     bar under the painting's bottom edge. */
  function standIn(sp){
    var vh = 220 * AH / AW;
    return '<svg data-standin="" x="0" y="0" width="' + AW + '" height="' + AH +
           '" viewBox="0 ' + (170 - vh) + ' 220 ' + vh + '">' + sp.art + "</svg>";
  }

  function artOf(sp){
    if (!sp.img) return standIn(sp);
    /* No href yet unless we are serving the file untreated: settleArt
       sets it once the treatment is baked. Mounting the raw file here
       would flash the untreated tile before the bake lands. */
    var href = PANEL_MODE === "raw" ? ' href="' + sp.img + '"' : "";
    return standIn(sp) + "<image" + href + ' x="0" y="0" width="' + AW +
      '" height="' + AH + '" preserveAspectRatio="xMidYMid meet"/>';
  }

  /* Settle a panel once we know whether its painting arrived: on load
     the stand-in goes, on failure the <image> goes — Chrome paints its
     broken-image glyph over an <image> that 404s, which would sit on
     top of the ink drawing and defeat the whole fallback. bakeArt
     rides the image cache, so this is not a second fetch. */
  function settleArt(root, sp, done){
    if (!sp.img) return;
    bakeArt(sp.img, function(url){
      var im = root.querySelector("image");
      if (!url){
        if (im) im.parentNode.removeChild(im);
      } else {
        if (im) im.setAttribute("href", url);
        var ph = root.querySelector("[data-standin]");
        if (ph) ph.parentNode.removeChild(ph);
      }
      /* fires after artTone[] is populated, so callers can tint */
      if (done) done(url);
    });
  }

  /* ---- reduced motion: a quiet static column -------------------- */

  if (reduced){
    journey.classList.add("journey--static");
    stage.remove();
    var holder = journey.querySelector(".journey__sticky");
    SPOTS.forEach(function(sp){
      var fig = document.createElement("figure");
      fig.className = "journey__figure";
      /* THE BLURB COMES TOO. It did not, and that was a real fault
         rather than a cosmetic one: reduced motion is a request to stop
         things MOVING, not a request for less of the page, and this
         branch was quietly serving four pictures with name labels while
         split mode got the writing. A visitor with the OS setting on —
         which is a common accessibility preference, and is on for VEN's
         own machine, which is how it surfaced — read a journey section
         with no journey in it. Same copy, same order, same markup class
         as split mode's paragraph so it inherits the same type. */
      fig.innerHTML =
        '<svg viewBox="-10 -10 ' + (AW + 20) + " " + (AH + 20) +
        '" aria-hidden="true">' + artOf(sp) + "</svg>" +
        "<figcaption><b>" + sp.name + '</b> · <span lang="ko">' + sp.ko + "</span>" +
        '<span class="journey__blurb">' + sp.blurb + "</span></figcaption>";
      holder.appendChild(fig);
      settleArt(fig, sp);
    });
    return;
  }

  /* ================================================================
     SPLIT MODE — `?journey=split` (default), VEN 2026-08-12.

     An alternative to the pseudo-3D road. The section pins, the shared
     mountain backdrop cross-dissolves to paper as you take hold of it,
     and the four places then crossfade in place: copy on the left,
     painting on the right, one stop on screen at a time.

     Why it exists: in the projection a panel STANDS on the road, so it
     can never be drawn below the horizon, which pinned every painting
     into the top 24% of the viewport. That single fact caused the
     heading collision, the near-panel top-clipping and the sparse
     composition on short wide windows. None of them can occur here.

     It costs no new art: the same five PNGs through the same
     bakeArt()/artOf()/settleArt() path, so the stand-in and the 404
     fallback come along for free. `?journey=road` restores the
     original road, which is left fully working.

     Reduced motion never reaches this — it returns above into the
     static column, which serves both modes.
  ================================================================= */

  /* THREE modes now, and nothing has been deleted — VEN's standing
     rule. `map` is the default from 2026-08-20; `split` was the
     default from 2026-08-12 and is untouched; `road` is the original
     pseudo-3D projection and still works. */
  var JOURNEY_MODE = (function(){
    var m = /[?&]journey=([a-z]+)/i.exec(location.search);
    return m ? m[1].toLowerCase() : "map";
  })();

  /* fraction of a stop's slot spent crossfading (0 = hard cuts) */
  var XFADE = qs("xfade", 0.55);
  /* Paintings may dissolve through each other; TYPE MAY NOT. Two
     paragraphs at 50% on the same spot is unreadable mush. The text is
     gated to the top of its painting's opacity, so the outgoing block
     is fully gone before the incoming one starts — a hand-off, not a
     crossfade, with a brief clean beat between them. */
  var TEXT_GATE = qs("textgate", 0.55);
  /* px the text lifts as it arrives — enough to feel like a turn of
     the page, not enough to read as a slide-in effect */
  var TEXT_RISE = qs("textrise", 12);
  /* how much of the section the mountain takes to hand over to paper */
  var BG_FADE = qs("bgfade", 0.07);

  /* ---- background polish, all four independently switchable -------
     The audit: across 2536px of pinned scroll and four different
     places, NOTHING behind the content changed. body's mottles are
     positioned over the whole 6079px document so one screen sees a
     near-uniform slice, .grain is fixed so it never travels, and the
     section itself had no background of its own. The field was not
     just plain, it was inert and content-agnostic. */

  /* 1. the mountain never leaves entirely — it settles to a ghost, so
        the hero's landscape still underlies the section. 0 = old
        behaviour (fades right out). */
  var GHOST = qs("ghost", 0.26);
  /* 1b. THE BACKDROP IS GLOBAL, and this is now the default. The ghost
        never leaves: it rides at GHOST strength down the village,
        manifesto and ledger instead of reaching 0 at the journey's
        end, so the whole page sits in one landscape rather than the
        lower half sitting on blank paper.

        VEN's proposal for that blank lower half, 2026-08-16: *"make
        the background global so i can see what it looks like in the
        village section"*, then, having seen it: *"the background isnt
        global like we made it in the dev server."* Built as an opt-in
        switch to be judged, judged, kept.

        `?bg=fade` restores the old behaviour — the backdrop fading to
        nothing over the journey's last 12% — and `?ghost=N` still sets
        the standing strength, which is the knob to reach for first if
        it ever reads as too strong behind the copy.

        NOTE the load-bearing detail this replaces: .scene-backdrop is
        position:fixed, so what used to force it to 0 by the section's
        end was the only thing stopping it riding down the rest of the
        page. That is no longer a bug to prevent, it is the feature —
        but if you ever restore the fade, restore it for that reason. */
  var BG_GLOBAL = !/[?&]bg=fade\b/i.test(location.search);
  /* 2. tint the field with the CURRENT stop's own pigment colour, so
        the background changes as the places do. 0 = off. */
  var WASH  = qs("wash", 0.20);
  /* pigment means sit close to grey; push them off it or all four
     stops tint the same and the whole point is lost */
  var WASH_SAT = qs("washsat", 2.1);
  /* 3. seat the keyed paintings on the page instead of floating */
  var GROUND = qs("ground", 1);
  /* 4. hairline in the gutter + one tick per stop */
  var RULE = qs("rule", 1);

  function punch(c, amt){
    var l = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2], out = [], i, v;
    for (i = 0; i < 3; i++){
      v = l + (c[i] - l) * amt;
      out.push(v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
    }
    return out;
  }

  function buildSplit(){
    journey.classList.add("journey--split");
    if (stage) stage.remove();
    /* "Four places, one road" names the road, which split mode does not
       have. The left column carries the eyebrow instead. */
    var head = journey.querySelector(".journey__head");
    if (head) head.remove();

    var sticky = journey.querySelector(".journey__sticky");
    var scene  = document.querySelector(".scene-backdrop");

    var wrap = document.createElement("div");
    wrap.className = "jsplit";
    /* The eyebrow is a sibling of .jsplit__stops rather than a wrapper
       child so that on phones .jsplit__text can go `display:contents`
       and all three reorder independently — eyebrow, painting, copy.
       Nested inside the text column it was stranded under the image. */
    wrap.innerHTML =
      '<div class="jsplit__text">' +
        '<p class="eyebrow jsplit__eyebrow"><span lang="ko">여정</span> · the journey</p>' +
        '<div class="jsplit__stops"></div>' +
      '</div>' +
      '<div class="jsplit__art"></div>';
    sticky.appendChild(wrap);

    if (GROUND) journey.classList.add("has-ground");

    /* washes go in the sticky, behind .jsplit, so they are full-bleed
       rather than confined to the content's max-width */
    var washHost = null;
    if (WASH > 0){
      washHost = document.createElement("div");
      washHost.className = "jsplit__washes";
      sticky.insertBefore(washHost, wrap);
    }

    var textHost = wrap.querySelector(".jsplit__stops"),
        artHost  = wrap.querySelector(".jsplit__art"),
        N        = SPOTS.length;

    var ticks = [];
    if (RULE){
      var rule = document.createElement("div");
      rule.className = "jsplit__rule";
      rule.innerHTML = new Array(SPOTS.length + 1).join('<i class="jsplit__tick"></i>');
      wrap.appendChild(rule);
      ticks = [].slice.call(rule.children);
    }

    var items = SPOTS.map(function(sp, i){
      var t = document.createElement("article");
      t.className = "jsplit__stop";
      t.innerHTML =
        '<p class="jsplit__idx">0' + (i + 1) + ' <span>/ 0' + N + "</span></p>" +
        "<h3>" + sp.name + "</h3>" +
        '<p class="jsplit__ko" lang="ko">' + sp.ko + "</p>" +
        '<p class="jsplit__body">' + sp.blurb + "</p>";
      textHost.appendChild(t);

      var f = document.createElement("figure");
      f.className = "jsplit__plate";
      f.innerHTML = '<svg viewBox="0 0 ' + AW + " " + AH + '" aria-hidden="true">' + artOf(sp) + "</svg>";
      artHost.appendChild(f);

      var w = null;
      if (washHost){
        w = document.createElement("div");
        w.className = "jsplit__wash";
        washHost.appendChild(w);
      }

      /* the tone is only known once the painting has been through the
         bake, so the tint is applied from settleArt's callback */
      settleArt(f, sp, function(){
        if (!w) return;
        var tone = artTone[sp.img];
        if (!tone) return;
        var c = punch(tone, WASH_SAT);
        w.style.backgroundColor = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
      });

      return { t: t, f: f, w: w };
    });

    /* build once, then only touch opacity/display — same discipline the
       road mode keeps, so this stays off the per-frame budget */
    function setOp(el, op){
      if (op <= 0.005){
        if (el.style.display !== "none") el.style.display = "none";
        return;
      }
      if (el.style.display === "none") el.style.display = "";
      el.style.opacity = op.toFixed(3);
    }

    function drawSplit(p){
      /* mountain hands over to paper; the stops fade up on the same
         curve, so it reads as one cross-dissolve out of the hero */
      var entry = cl(p / BG_FADE);
      /* It settles to GHOST rather than 0 — and then it MUST still
         reach 0 by the end, because .scene-backdrop is position:fixed
         and a ghost left standing would ride down the manifesto,
         ledger and village too. UNLESS that is exactly what was asked
         for: ?bg=global drops the exit term and lets it ride. */
      if (scene)
        scene.style.opacity =
          ((1 - entry * (1 - GHOST)) *
           (BG_GLOBAL ? 1 : 1 - cl((p - 0.88) / 0.12))).toFixed(3);

      var s = p * N, i, c, dist;
      for (i = 0; i < N; i++){
        c = i + 0.5;
        dist = Math.abs(s - c);
        /* hold the first stop through the entry and the last through
           the exit, so neither sits half-faded at the section's edges */
        if ((i === 0 && s < c) || (i === N - 1 && s > c)) dist = 0;
        var op = cl((0.5 + XFADE / 2 - dist) / XFADE) * entry;
        var tp = cl((op - TEXT_GATE) / (1 - TEXT_GATE));
        setOp(items[i].f, op);
        setOp(items[i].t, tp);
        if (tp > 0.005)
          items[i].t.style.transform = "translateY(" + ((1 - tp) * TEXT_RISE).toFixed(1) + "px)";
        if (items[i].w) setOp(items[i].w, op * WASH);
        if (ticks[i]) ticks[i].style.opacity = (0.22 + 0.78 * op).toFixed(3);
      }
    }

    function progressOf(){
      var rect = journey.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      return total <= 0 ? 0 : cl(-rect.top / total);
    }

    var ticking = false, lastP = -1;
    function onScroll(){
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function(){
        ticking = false;
        var p = progressOf();
        if (Math.abs(p - lastP) < 0.0004) return;
        lastP = p;
        drawSplit(p);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function(){ lastP = -1; onScroll(); });
    drawSplit(progressOf());
  }

  /* ================================================================
     MAP MODE — `?journey=map` (DEFAULT), VEN 2026-08-20.

     VEN: *"rather than the current scroll mechanism that we have, I
     want to make it like a pirate map instead. Travelling between each
     location... we are at the first of four locations, then as you
     scroll you go down a long path to the second location on the
     pirate map, then third and then fourth."*

     So the section is now a sheet of map, and scrolling walks it. The
     camera sits on a place, pulls back, travels down the road to the
     next one and settles again — four arrivals, three journeys. The
     road inks itself in behind you as you go, which is the same
     signature move the hero title makes and what the design system
     always said the journey's line was for (§4).

     WHAT IS ART AND WHAT IS NOT. The sheet is a painting — terrain,
     coastline, compass rose, and on the pirate sheet a serpent and a
     junk. The road, the markers and the seals are SVG drawn over it.
     That split is deliberate and it is the whole reason this is
     tunable: the road has to be followed to sub-pixel accuracy by a
     camera and revealed progressively, and a painted road can be
     neither. It also keeps §6b's rule intact — nothing pictorial is
     hand-authored in SVG here, only structural marks.

     THE ROAD IS GENERATED, NOT HAND-DRAGGED — same rule as PLOTS in
     village.js (§9j). `node tools/maproute.js art/journey/map-ink.png
     --debug` finds it by measuring the sheet: open ground is the one
     thing on a map that is bright AND smooth, so the road is the
     highest-"openness" seam from the top edge to the bottom, and the
     stops are the most open cells along it. Re-roll the art, re-run
     the tool, paste the two arrays. Do not nudge these by hand — you
     will be wrong by a few percent and it will have to be redone.

     TWO SHEETS, and this is VEN's to judge, not mine to pick. The
     site is Korean parchment-and-ink and a skull-and-galleon map is a
     real style break, so both were made:
       ?map=ink     (default) a Korean 고지도-style sheet — ink ridges,
                    pine forests, terraced valleys, a compass rose. On
                    palette with the hero and the village.
       ?map=pirate  the treasure map — burnt and torn edges, a coiling
                    sea serpent, a sailing junk, heavier browns. Still
                    charts Korea, with hanok villages drawn on it, so
                    it reads as a treasure map of THIS country rather
                    than a Caribbean one pasted in.
     Keep the loser in the tree until VEN has seen both on a real
     screen; only one needs to ship (see the note in tools/build.js).
  ================================================================= */

  /* GENERATED by tools/maproute.js — do not hand-edit. Normalised to
     the sheet, so re-prepping the art at another size still fits. */
  var MAPS = {
    /* The ink sheet CARRIES THE FOUR PLACES since 2026-08-20 part 6:
       the vignettes were painted into it by editing the plain sheet
       (master: map-ink-master.png; the pre-vignette terrain is
       map-ink-master-plain.png — KEEP it, it is the --base that
       tools/maproute.js needs to find the stops by difference, and
       the starting point for any future re-edit). Stops sit AT the
       vignettes; each stop's third element is the label side, chosen
       away from the vignette's mass so a name never writes across a
       roof.

       2026-08-21 (Zico: "could we add some more buildings to make it
       seem a bit more like a village"): NAMSANGOL now has six smaller
       hanok stepping up the slope behind the walled house, which is
       the third vignette only — the shipped sheet is
       `map-ink-master-nams.png`, and it was NOT swapped in wholesale.
       The OpenArt edit re-renders the whole page, so only the changed
       clearing was taken, by `tools/mappatch.js`; the rest of the
       accepted sheet is untouched. That is why stops 1, 2 and 4 below
       are unmoved to the thousandth and stop 3's label anchor is
       unchanged too. The village had to be CLIPPED off the corridor
       east of the house (`--limit 0.34,0.49,0.598,0.66`): a roof over
       that channel sends the road down the far side of the valley and
       the seal with it. tools/mappatch.js's header has the
       measurement, and 0.598 is the widest clip that still leaves the
       road its pass — it was walked up to, not guessed. */
    ink: {
      img: "art/journey/map-ink.png", w: 1800, h: 3225,
      path: [
        [0.221, 0.004], [0.289, 0.081], [0.413, 0.159], [0.503, 0.236],
        [0.505, 0.306], [0.489, 0.384], [0.530, 0.461], [0.610, 0.539],
        [0.610, 0.616], [0.551, 0.694], [0.518, 0.764], [0.401, 0.841],
        [0.305, 0.919], [0.293, 0.996]
      ],
      /* [x, y, labelX, labelY] — the road now detours around every
         vignette (maproute's VIG_W penalty), so the marker stands in
         open ground beside its landmark, and each label's anchor is
         SEARCHED: the quietest patch of parchment inside the arrival
         frame, judged on all ink. Both fixes from VEN's screenshots
         (part 7): the seal on the hanok's wall, the road through
         Changdeokgung's pond, the name across the mountains. */
      /* [x, y, labelX, labelY, blockX, blockY] — the last pair anchors
         the TEXT BLOCK: the English caption plus Zico's copy under it
         (2026-08-21). maproute searches blank paper at the block's
         full footprint, sized for the largest the labels ever scale
         to, so what it clears is what gets drawn. VEN's red line under
         Namsangol's wall is why the search now hugs the landmark
         (CAP_NEAR) instead of taking the quietest patch it could find
         five rows further down. */
      /* 2026-08-27, THE CLEARINGS. VEN, with three red loops on his
         phone screenshot: the copy would be better if *"the background
         IMAGE fades out to make space for the text and only leave the
         background colour (that being the old paper texture)"*. So the
         shipped sheet now has the terrain faded to bare parchment
         inside his loops — `tools/mapclear.js`, from
         `tools/clearings.json` — and the text blocks live IN them:
         stops 1-3's block anchors moved into their loops (searched
         there by maproute --clear), and each stop carries a `clear`
         box below, the widest clean paper in its loop, which is where
         the PHONE draws its larger, re-flowed block. A fourth loop
         was cut beside Jeonju, which VEN did not mark: on a phone its
         note had nowhere clean to go at all. Say the word and it is
         one line of clearings.json.

         The road is carved on the PRE-clearing sheet (maproute
         --terrain art/journey/map-ink-solid.png) so it did not wander
         into the paper cleared for the text; the emitted path is
         within one grid cell of the one below everywhere, and the one
         below is the one the seal nudges were measured against, so it
         is kept. `?map=solid` is the sheet before any of this. */
      /* elements 5+6 are the ENGLISH CAPTION's anchor again (maproute
         --caption, 2026-08-27): searched under the building, as part
         14 had it. The copy is in `clear` below. */
      stops: [[0.340, 0.120, 0.396, 0.136, 0.535, 0.178],
              [0.493, 0.360, 0.410, 0.329, 0.410, 0.446],
              [0.623, 0.601, 0.368, 0.632, 0.424, 0.664],
              [0.374, 0.857, 0.326, 0.872, 0.438, 0.934]],
      /* the note's clearing per stop, from maproute --clear (MAP_CLEAR):
         `box` [x0, y0, x1, y1] is the widest clean rectangle, `rows`
         the clean run of paper on each grid row from `top` down, one
         row `dy` tall — setBlock wraps every line to the row it sits
         on, so the note follows the clearing's shape. Paste, never
         hand-edit. */
      /* THE NOTES, from tools/mapnote.js (2026-08-27, VEN: "a uniform
         block of text ... a uniform gap between the edge of the
         clearing and the edge of the block"): `box` is the text block
         [x0, y0, x1, y1], `fs` its copy size in map units, and the
         clearing in the art is cut one margin outside that box — the
         same block on every device. Paste, never hand-edit; the
         pipeline is README's THE CLEARINGS. */
      clear: [
        { box: [0.566, 0.215, 0.778, 0.265], fs: 13.5 },
        { box: [0.580, 0.409, 0.749, 0.449], fs: 11 },
        { box: [0.635, 0.676, 0.793, 0.716], fs: 13.5 },
        { box: [0.691, 0.800, 0.773, 0.876], fs: 10 }
      ],

      /* SEAL NUDGE — [dx, dy] per stop, normalised like everything
         else, added to the MARKER only (js/journey.js §markers). It
         moves the X and the seal together; the stop itself does not
         move, so the road, STOP_LEN and the label anchors are all
         still exactly where maproute put them.

         It is a SEPARATE LIST on purpose. maproute does not write
         this file — it prints MAP_PATH and MAP_STOPS to paste over
         `stops` above — so a correction typed INTO `stops` is deleted
         the next time the road is regenerated, silently and with no
         way to tell it was ever there. Kept out here, a re-paste
         leaves it standing.

         Why any of it: maproute lands a stop on the most open cell
         near its row, which is the right rule for a MARKER (open
         parchment, clear of the landmark) but is blind to the road it
         just drew — the seam moves on after the snap, so the seal can
         end up sitting a little off the line it is supposed to mark.
         Measured against the drawn road, the four seals were 9.7 left,
         1.7 left, 9.1 RIGHT and 6.5 left of it.

         VEN, 2026-08-26, from screenshots and without the numbers:
         *"can we make it so that the one in screenshot 1 moves a bit
         to the left, the one in screenshot two moves a tiny bit to the
         right. the other two in the the journey section are fine."*
         That is Namsangol and Gyeongbokgung — the 9.1 and the 9.7,
         the two worst of the four, called by eye. So the two he named
         are moved onto the line exactly (dx = the measured gap) and
         the two he passed are left alone rather than "fixed" to match:
         a seal a little off a line reads as a stamp placed by hand,
         and centring all four would cost that. Only correct what
         actually looks wrong.

         To re-measure after the sheet or the road changes, in the
         console with the map on screen: for each `.jmap__mark`, walk
         `path.jmap__inked` with getPointAtLength and take the road's
         x where it crosses the marker's y. dx is that minus the
         marker's x, over MW. */
      sealNudge: [[ 0.0097, 0],    // Gyeongbokgung — right, onto the line
                  [ 0,      0],    // Changdeokgung — 1.7 out, VEN: fine
                  [-0.0091, 0],    // Namsangol     — left, onto the line
                  [ 0,      0]]    // Jeonju        — 6.5 out, VEN: fine
    },
    /* THE SHEET BEFORE THE CLEARINGS — `?map=solid`. The same terrain
       with every mountain standing, and the anchors that were searched
       for it. No `clear` boxes, so on a phone the copy goes to the band
       under the map (session 14's layout) exactly as it did. Kept as
       the way back, per VEN's standing rule. */
    solid: {
      img: "art/journey/map-ink-solid.png", w: 1800, h: 3225,
      path: [
        [0.221, 0.004], [0.289, 0.081], [0.413, 0.159], [0.503, 0.236],
        [0.505, 0.306], [0.489, 0.384], [0.530, 0.461], [0.610, 0.539],
        [0.610, 0.616], [0.551, 0.694], [0.518, 0.764], [0.401, 0.841],
        [0.305, 0.919], [0.293, 0.996]
      ],
      stops: [[0.340, 0.120, 0.396, 0.136, 0.514, 0.174],
              [0.492, 0.360, 0.410, 0.329, 0.438, 0.446],
              [0.624, 0.601, 0.368, 0.632, 0.438, 0.678],
              [0.372, 0.857, 0.326, 0.872, 0.396, 0.934]],
      sealNudge: [[ 0.0097, 0], [0, 0], [-0.0091, 0], [0, 0]]
    },
    pirate: {
      img: "art/journey/map-pirate.png", w: 1500, h: 2688,
      path: [
        [0.689, 0.004], [0.614, 0.081], [0.535, 0.159], [0.480, 0.236],
        [0.428, 0.306], [0.414, 0.384], [0.433, 0.461], [0.476, 0.539],
        [0.514, 0.616], [0.547, 0.694], [0.565, 0.764], [0.588, 0.841],
        [0.602, 0.919], [0.593, 0.996]
      ],
      stops: [[0.557, 0.128], [0.414, 0.360], [0.511, 0.609], [0.601, 0.888]]
    }
  };

  var MAP_SHEET = (function(){
    var m = /[?&]map=([a-z0-9-]+)/i.exec(location.search);
    return m ? m[1].toLowerCase() : "ink";
  })();

  /* How the camera moves. `follow` is what VEN described and the only
     one tuned; the other two are kept so the choice can be seen rather
     than argued about.
       follow  (default) sit on a stop, pull back, travel the road,
               settle on the next. Zoom dips mid-journey so you see
               where you are going.
       pan     constant scale, constant speed — the sheet just unrolls.
               Calmer, and the honest option if the zoom ever reads as
               too much movement.
       fixed   the whole sheet on screen at once, only the road inking
               and the seals landing. NOTE: the sheet is 9:16 and a
               desktop window is about 2.3:1, so "fit the whole sheet"
               means fitting its HEIGHT — the map shrinks to a ~300px
               strip on a 1280x551 window. It is included because it
               was worth answering, not because it is good. Do not
               make it the default without re-cropping the art. */
  var CAM = (function(){
    var m = /[?&]cam=([a-z]+)/i.exec(location.search);
    return m ? m[1].toLowerCase() : "follow";
  })();

  /* scale when settled on a place / at the middle of a journey. Both
     are floors: a phone's viewport is taller than the sheet is at
     scale 1, so `cover` below raises them rather than showing paper. */
  /* 1.85 → 1.65, VEN part 4: "zoom out the background a tiny bit" */
  var ZOOM_IN  = qs("zoomin",  1.65),
      ZOOM_OUT = qs("zoomout", 1.00),
      ZOOM_PAN = qs("zoompan", 1.30);
  /* Share of the section spent standing still at each stop — ZERO
     since 2026-08-20 part 3. VEN: *"I still want to be able to scroll
     past each place."* The dwell was ~54vh of scroll per stop where
     the camera stood frozen — a third of the section where scrolling
     did nothing visible, which is exactly the dead feeling he was
     naming. Every pixel of scroll moves the camera now; each place is
     something you pass through, not a station you are held at.
     `?dwell=.10&ease=1` restores the old stop-and-hold exactly. */
  var DWELL = qs("dwell", 0);
  /* share of the pinned scroll spent standing on the LAST stop before
     the section unpins — see timelineU */
  var TAIL = qs("tail", 0.14);
  /* What replaced the dwell, so an arrival still reads as one:
     EASE bends each leg's pacing toward smoothstep without reaching
     it — speed drops to (1-EASE) of cruise as you pass a place, and
     NEVER to zero. 0 = constant-speed cruise, 1 = full stop at every
     place (only meaningful with a dwell to stop into). */
  var EASE = qs("ease", 0.55);
  /* ...and ZHOLD plateaus the zoom at full for the first and last
     ZHOLD of each leg, so the camera is all the way in while you
     glide THROUGH a place rather than only at one instant. */
  var ZHOLD = qs("zhold", 0.14);
  /* THE ENTRY DISSOLVE RIDES THE SLIDE-IN, NOT THE PINNED SCROLL.

     `?mapfade=` died here (part 9). Every version of it keyed the
     map's arrival to p — progress through the PINNED section — and p
     is clamped at 0 for the entire viewport-height where the journey
     is still scrolling INTO view. VEN's screenshot showed the cost: a
     whole blank screen between the hero and the first pixel of map,
     because the sticky slab slid up empty and only started dissolving
     after it had pinned. It read exactly like a section waiting on a
     loading threshold.

     Now the dissolve is driven by `preOf()` — how far the section's
     top has risen through the viewport. The map materialises over the
     hero's mountains AS its edge climbs the screen, semi-transparent
     at the fold, fully opaque by the moment it pins — at which point
     the journey's own scroll takes over with nothing left to fade.
     The backdrop hands over to its ghost on the same value, so hero
     and map genuinely cross-dissolve while both are on screen, which
     is what "one dissolve out of the hero" was always supposed to
     mean. Requires the sticky to have NO opaque background of its own
     — see the note in css/site.css. */
  /* THE INFO CARDS ARE OFF BY DEFAULT — VEN, 2026-08-20 part 2:
     *"remove the information about each location, I want to scroll
     past each location and maybe subtle text of the name of each
     location in korean that has a handwritten animation."*

     So the map carries only its own furniture now: the road, the
     markers, and the place names written onto the sheet (see LABELS
     below). `?info=1` restores the card column wholesale — kept as
     the way back, same rule as every other superseded treatment. The
     blurbs in SPOTS stay regardless: split, road and static mode all
     still use them. */
  var INFO = qs("info", 0);
  /* The screen-pinned vistas are OFF since part 6 — VEN: *"it looks
     quite bad right now with the current approach"* — because the
     places are now IN THE SHEET: the ink map carries a painted
     vignette of each location at its stop, so the location art no
     longer needs to float above the map at a foreign scale. The
     camera arriving at the vignette IS the image moment. `?vista=1`
     restores the overlay for comparison; under ?info=1 the cards
     carry the painting instead. */
  var VISTA = qs("vista", 0);
  /* distance in stop-units over which a vista is on screen. Under 0.5
     for the same reason as CARD_SPAN: at u = k+0.5 both neighbours
     must be gone, or two places are on screen at once. */
  var VSPAN = qs("vspan", 0.35);
  /* where on the SCREEN the place you have arrived at is put. With a
     vista (or the ?info=1 column) on the left, the marker is pushed
     right of centre to keep out from under it; bare map centres it.
     The phone block overrides both. */
  var FOCUS_X = qs("focusx", (INFO || VISTA) ? 0.68 : 0.50),
      FOCUS_Y = qs("focusy", 0.50);
  /* ---- the place names, written onto the sheet --------------------
     `?labels=0` hides them. The glyphs are Song Myung — hand-authoring
     Hangul stroke paths for ten syllable blocks is hero-title-sized
     work per name, and §6b's spirit applies. The WRITING is real
     though: a serpentine brush path covering each character cell is
     used as a mask stroke and revealed by dashoffset, so the name
     inks in character by character as you arrive — and un-writes if
     you scrub back, same as the road. */
  var LABELS = qs("labels", 1);
  /* stacked vertically like a 고지도 place name; ?vlabel=0 lays them
     horizontally instead */
  var VLAB = qs("vlabel", 1);
  /* character size in map units; the on-screen size is set per
     viewport in measure(), this is just the authoring scale */
  var LSIZE = qs("lsize", 24);
  /* CEILING ON THE LABEL SCALE, and it is not a taste knob — it is the
     contract between this file and tools/maproute.js.

     Every anchor on the sheet is a patch of blank paper that the tool
     SEARCHED, and it sized that search for the largest scale a desktop
     ever reaches: lq 1.465 (the arithmetic is in the block above CAP_W
     in tools/maproute.js). A phone does not obey that number. `want`
     floors at 34px, so on a 390px screen lq comes out at 2.24 — half
     again as wide and tall as the paper that was cleared for it, and
     the name written over the ridge behind Gyeongbokgung in VEN's
     2026-08-25 screenshot is that 53% and nothing else. No anchor can
     be re-searched out of it, because the sheet is not being drawn at
     the size the search was run for.

     So the scale stops near where the clearing stops. The ROOF of a
     knob, not a floor — every wider screen is already under it and is
     untouched, so this only ever changes phones. `?lqmax=9` is the
     old uncapped behaviour exactly.

     1.8, NOT 1.465, AND THE 0.335 IS VEN'S CALL, made on 2026-08-25
     with the measurement in front of him. 1.465 is the scale the
     anchors were CLEARED for and is the defensible number; 1.8 is
     ~28px on a phone against 1.465's ~23px, and what it costs is
     measured rather than guessed — dark ink inside the name's own
     glyph box goes 5.6% -> 7.1% at Gyeongbokgung, 1.1% -> 2.4% at
     Namsangol, 0.3% -> 1.9% at Changdeokgung, and 0.0% -> 0.0% at
     Jeonju. He looked at both and picked the larger: *"this one looks
     good. ?lqmax=1.8"*. The full table is in HANDOFF §9aa.8.

     THIS ONLY MOVES THE KOREAN NAME. Under 861px the English caption
     and Zico's copy are off the sheet entirely (they are in the band
     — see .jmap__note in css/site.css), so nothing else on the sheet
     is drawn past the paper that was searched for it. On a desktop
     lq is ~1.09 and every cap here is inert. */
  var LQ_MAX = qs("lqmax", 1.8);
  /* share of the road's total length over which a name writes — the
     window ENDS at the stop, so the last character lands exactly as
     the seal stamps */
  var WRITE = qs("write", 0.11);   /* 0.085 until the note wrote too (2026-08-27) */
  /* THE HAND — VEN, 2026-08-27: *"a handwritten font and rendering
     animation to be applied to all text in the journey section"*, then
     of the first pick (Nanum Pen Script): *"I dont like this
     'handwritten' font, try another one. and revert the font of the
     korean characters please."* So the Korean names are the display
     serif again, and the English is one of three Latin hands:
     `caveat` (default), `kalam`, `patrick`; `0` is the serif for the
     English too. See --font-hand in css/site.css. The animation is the
     writing mask every label already had, now on the note too
     (setBlock); `?fade=1` puts the line-by-line fade back in its place. */
  var HAND = (function(){
    var m = /[?&]hand=([a-z0-9]+)/i.exec(location.search);
    /* the SERIF is the default again — VEN, on the third pass: "keep
       the original font"; the three hands stay one switch away */
    var h = m ? m[1].toLowerCase() : "0";
    return h === "kalam" || h === "patrick" || h === "caveat" ? h : "0";
  })();
  var FADE = qs("fade", 0);
  /* English caption under the Korean — ON since part 12 (VEN: "add
     the english names next to each korean name too please. Same font
     and same written animation"). Same display face, and it WRITES
     rather than fades: its own wavy mask stroke swept left to right,
     starting once the Korean is most of the way down and finishing
     with the seal. `?en=0` hides it. */
  var EN = qs("en", 1);
  /* ---- scroll drive: continuous (default) or threshold ------------
     CONTINUOUS is the default again. Threshold mode was asked for,
     built, felt, and REJECTED the same day — VEN, part 4: *"make the
     scrolling threshold based rather than gradual"*; then part 5,
     having scrolled it: *"no i think change it back. I dont like
     threshold anymore."* Keep that sequence in mind before proposing
     it afresh: the idea sounds like a chop fix (the travel plays on
     its own clock, so the wheel cannot perturb it) and it IS smooth —
     what it costs is the scroll's authority. Inside a band the wheel
     does nothing, and the page moves when the tween decides, not when
     the hand does. That trade is what was disliked, not the smoothness.

     `?step=1` turns threshold mode back on: one band of scroll per
     stop, crossing a boundary tweens to that stop over DUR·sqrt(legs)
     ms, retargets re-plan from the current position. Kept working —
     it is the way back if the call changes near launch. */
  var STEP = qs("step", 0);
  var DUR  = qs("dur", 1400);
  /* the glide — continuous mode's chop fix (?step=0). Scroll sets a
     target, a rAF loop eases toward it, time-based so 60Hz and 144Hz
     feel identical. 11/s ≈ 90% of a wheel step absorbed in ~200ms.
     `?glide=0` on top of ?step=0 is the fully direct drive. */
  var GLIDE = qs("glide", 11);
  /* distance in stop-units over which a card is on screen. MUST stay
     under 0.5, or two cards are legible at once — the same rule split
     mode's TEXT_GATE enforces, for the same reason: paintings may
     dissolve through each other, words may not. */
  var CARD_SPAN = qs("cardspan", 0.40);
  var CARD_RISE = qs("cardrise", 14);
  /* a small ink dot at the head of the inked road — "you are here" */
  var WALKER = qs("walker", 1);
  /* the trail ahead: footsteps (default since part 10) or the dotted
     line. `?trail=dots` is the whole revert — VEN asked for footsteps
     with the way back kept warm, so nothing else may depend on which
     one is standing. */
  var TRAIL = (function(){
    var m = /[?&]trail=([a-z]+)/i.exec(location.search);
    /* `steps` — the prints alone — since VEN, 2026-08-27: "make it so
       there is only one set of footsteps"; the dotted road under them
       read as a second, smaller set. `foot` draws both, `dots` the line. */
    return m ? m[1].toLowerCase() : "steps";
  })();
  /* strength of the paper veil that seats the sheet on our paper. This
     is the job .scene-backdrop does with mix-blend-mode on the image
     itself, which the camera makes impossible here — see the long note
     on .jmap__sheet in css/site.css. 0 shows the sheet untouched. */
  var MAP_TONE = qs("maptone", 0.16);

  /* ---- the phone's block (2026-08-27) -----------------------------
     Under 861px Zico's copy is BACK ON THE SHEET, inside the clearings
     (see MAPS.ink.clear), instead of in the band below the map. It is
     not the desktop block drawn smaller — that scaled off the label
     scale and came out at 7px (§9y) — it is re-flowed into the box
     the tool measured for it, at the largest size that fits:
       PTEXT      the size it tries first, px on screen at the settle
                  zoom; it steps down from here until the note fits
       PTEXT_MIN  ...and no smaller than this. Below it the box is too
                  small for the words and the fit is reported.
       PHONE_ZOOM the settle zoom on phones. Higher than the desktop's
                  ZOOM_IN because the box is a fixed patch of SHEET
                  and the words are a fixed size of SCREEN: at 1.65 a
                  nine-row box is 81px tall, at 1.9 it is 93, and that
                  is the difference between five lines fitting and
                  not. Not 2.0, which was measured too: at Jeonju the
                  name stands west of the seal and the note east of
                  it, 393px across on a 390px phone at 2.0, so the name
                  lost its first strokes off the left edge however the
                  frame was placed. At 1.9 the widest stop has 17px to
                  spare and the notes are 11 / 9.5 / 11 / 9.5 px.
     `?copy=strip` restores the band. */
  /* the pen's glyphs are narrower and lighter than the serif's, so the
     same legibility wants a larger size: the caps step up with the hand */
  var PTEXT = qs("ptext", HAND === "0" ? 15 : 18), PTEXT_MIN = qs("ptextmin", HAND === "0" ? 8.5 : 10);
  var PHONE_ZOOM = qs("pzoom", 2.1);   /* 1.9 → 2.0 once the blocks were fixed in
                                          sheet units, 2.1 once they were scaled
                                          down: Jeonju's name and note span 475
                                          units now, and 2.1 shows 476 */
  /* ...AND ON EVERY WIDER SCREEN TOO (VEN, 2026-08-27: "resize the
     text so that it fits nicely in the new gaps/clearings"). The
     desktop block used to be the label-scale block — four authored
     lines at ~14px in a clearing a thousand pixels wide. Now it is
     fitted to the same box the phone uses, and the box on a desktop is
     huge, so the cap is what sets the size: DTEXT_K of the window's
     width (22px at 1600), never past DTEXT_MAX. `?dtext=20` pins it. */
  /* 0.016 → 0.022 on 2026-08-27, VEN on a 960px-wide window: "I want the
     text to be a bit larger" — 21px there, 28 at 1280, the cap at 1600+ */
  var DTEXT = qs("dtext", 0), DTEXT_K = qs("dtextk", 0.022), DTEXT_MAX = qs("dtextmax", 32);
  /* THE CAPTION'S SIZE, in map units, fixed like the note's (VEN,
     2026-08-27: the English names back under their buildings). It is
     CAP_SIZE in tools/mapnote.js — the same number, or the caption's
     small clearing is cut for a different width than is drawn. */
  var CAPU = qs("capu", 9.5);
  /* since the blocks were fixed in sheet units (tools/mapnote.js) only
     DTEXT_MAX is read: the ceiling in px a wide window may draw the
     note at, past which it sits centred in its box a little smaller */
  /* THE CAMERA FRAMES THE SEAL AND THE NOTE TOGETHER. With the blocks
     in the clearings they sit further from their seals than they used
     to — stop 1's is a third of the sheet east of the road — and a
     camera that centres on the seal cuts the note off at the moment
     it is meant to be read. So on arrival the camera centres on the
     midpoint of seal, name and note instead, as far as FRAME_PULL
     (1 = the midpoint, 0 = the old seal-centred framing), moved only
     as far as keeps all three — and the landmark, LAND_H either side
     of the seal — on screen; where they cannot all fit, the seal's
     side wins over the note's. `?frame=0` is the way back. */
  var FRAME_PULL = qs("frame", 1);
  var SEAL_M = 40, NOTE_M = 40, LAND_H = 80;


  function buildMap(){
    var sheet = MAPS[MAP_SHEET] || MAPS.ink;
    var N = SPOTS.length;

    journey.classList.add("journey--map");
    if (stage) stage.remove();
    if (HAND !== "0"){
      journey.classList.add("jmap--hand");
      if (HAND === "kalam") journey.classList.add("jmap--hand-2");
      if (HAND === "patrick") journey.classList.add("jmap--hand-3");
    }
    /* "Four places, one road" named the road mode's road. The map has
       its own, and the eyebrow rides on the card instead. */
    var head = journey.querySelector(".journey__head");
    if (head) head.remove();

    var sticky = journey.querySelector(".journey__sticky");
    var scene  = document.querySelector(".scene-backdrop");
    /* the hero's content, faded out over the entry so the seam reads
       hero-out / journey-in (see the entry block in drawMap) */
    var heroInner = document.querySelector(".hero__inner"),
        heroCue   = document.querySelector(".hero__scroll"),
        lastEnt   = -1, lastExit = -1;

    /* map units: 1000 wide, height from the sheet's true pixel aspect
       so the overlay lands on the painting exactly */
    var MW = 1000, MH = 1000 * sheet.h / sheet.w;

    /* ---- the road, as one smooth curve through the control points --
       Catmull-Rom converted to cubic Béziers. The tool emits a
       polyline; a polyline drawn at 2x zoom shows every corner. */
    function spline(pts){
      function X(p){ return (p[0] * MW).toFixed(2); }
      function Y(p){ return (p[1] * MH).toFixed(2); }
      var d = "M" + X(pts[0]) + " " + Y(pts[0]), i;
      for (i = 0; i < pts.length - 1; i++){
        var p0 = pts[i - 1] || pts[i], p1 = pts[i],
            p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
        d += "C" +
          ((p1[0] + (p2[0] - p0[0]) / 6) * MW).toFixed(2) + " " +
          ((p1[1] + (p2[1] - p0[1]) / 6) * MH).toFixed(2) + " " +
          ((p2[0] - (p3[0] - p1[0]) / 6) * MW).toFixed(2) + " " +
          ((p2[1] - (p3[1] - p1[1]) / 6) * MH).toFixed(2) + " " +
          X(p2) + " " + Y(p2);
      }
      return d;
    }
    var ROAD_D = spline(sheet.path);

    var wrap = document.createElement("div");
    wrap.className = "jmap";
    wrap.innerHTML =
      /* THE CAMERA'S VIEWPORT, which is NOT the whole section.

         It used to be — .jmap was the frame and the note below the
         map was an absolutely-positioned wash floating on top of
         whatever terrain happened to be under it. VEN, 2026-08-25,
         with three red circles drawn on a phone screenshot: the copy
         may not sit over the mountains, the terraced fields or the
         buildings. On a phone it cannot avoid them by moving, because
         the sheet covers the screen edge to edge — the only place
         with no ink on it is a place the map does not reach. So the
         map now STOPS above the note and the note owns real paper.

         Everything the camera moves lives in here and is clipped by
         it; measure() sizes the camera off THIS box, not the sticky,
         so the zoom floor, the edge clamp and the focus point are all
         computed against the frame the visitor actually sees. On wide
         screens the note is display:none, the view is the full sticky
         and every number is exactly what it was. */
      '<div class="jmap__view">' +
      '<div class="jmap__cam">' +
        '<img class="jmap__sheet" src="' + sheet.img + '" alt="" decoding="async">' +
        '<svg class="jmap__ink" viewBox="0 0 ' + MW + " " + MH.toFixed(1) +
          '" preserveAspectRatio="none" aria-hidden="true">' +
          /* `foot` (default): the dotted road faintly UNDER the prints
             since 2026-08-27 — VEN could not find the path across the
             cleared paper — `steps` the prints alone, `dots` the line */
          (TRAIL === "dots"
            ? '<path class="jmap__road" d="' + ROAD_D + '"/>'
            : (TRAIL === "steps" ? "" : '<path class="jmap__road jmap__road--under" d="' + ROAD_D + '"/>') +
              '<g class="jmap__steps"></g>') +
          '<path class="jmap__inked" d="' + ROAD_D + '"/>' +
          (WALKER ? '<circle class="jmap__walker" r="6"/>' : "") +
          /* labels UNDER marks, so the seal stamps over a name that
             strays too close rather than vanishing behind it */
          '<g class="jmap__labels"></g>' +
          '<g class="jmap__marks"></g>' +
        "</svg>" +
      "</div>" +
      (MAP_TONE > 0
        ? '<div class="jmap__tone" style="opacity:' + MAP_TONE + '"></div>' : "") +
      /* the vistas — the four paintings, screen-pinned so they never
         scale with the camera, one visible at a time on arrival */
      (VISTA ? '<div class="jmap__vistas"></div>' : "") +
      "</div>" +   /* /.jmap__view */
      /* the eyebrow is the one piece of chrome left: section identity,
         pinned to the corner, outside the camera */
      '<p class="eyebrow jmap__eyebrow"><span lang="ko">여정</span> · the journey</p>' +
      /* ZICO'S COPY, NARROW-SCREEN HOME.

         On the sheet the copy is sized off the label scale, and that
         scale is deliberately window-relative: `want` floors at 34px,
         so on a 390px phone lq is 2.20 against a desktop's 1.09. Two
         things follow and both are fatal there — the block grows to a
         quarter of the sheet's width, which no clearing on this map
         can hold, and the copy itself renders at about 7px, which
         nobody can read. The sheet is simply not where a paragraph
         lives on a phone.

         So under 861px the block comes off the sheet and sits in a
         strip under the map, one <p> per stop, cross-faded by the
         same value that fades the SVG copy. Both are built once and
         only their opacity is touched, so the draw loop stays
         attributes-only. CSS picks which one is on.

         SINCE 2026-08-25 THE STRIP IS NOT AN OVERLAY. It is a band in
         the flow at the bottom of .jmap, on the page's own parchment,
         and .jmap__view gives up exactly its height — so there is no
         terrain behind these words at all, at any scroll position.
         The wash-over-mountains version is what VEN's red circles
         were drawn on; see the note at .jmap__view above. */
      '<div class="jmap__note" aria-hidden="true"></div>' +
      (INFO ? '<div class="jmap__cards"><div class="jmap__stops"></div></div>' : "");
    sticky.appendChild(wrap);

    var view   = wrap.querySelector(".jmap__view"),
        cam    = wrap.querySelector(".jmap__cam"),
        inked  = wrap.querySelector(".jmap__inked"),
        walker = wrap.querySelector(".jmap__walker"),
        marks  = wrap.querySelector(".jmap__marks"),
        labHost = wrap.querySelector(".jmap__labels"),
        vHost  = wrap.querySelector(".jmap__vistas"),
        noteHost = wrap.querySelector(".jmap__note"),
        host   = wrap.querySelector(".jmap__stops");

    /* How far either side of a place, in stop units, its note stays on
       the strip. Under half a unit and the strip is empty for most of
       the road; over it and two notes overlap in the middle of a leg. */
    var NOTE_SPAN = qs("notespan", 0.50);

    /* WHERE ZICO'S COPY LIVES. `sheet` (default, VEN's call: *"make it
       so that the text is back on the page underneath the name of each
       location, I liked how it was before"*) writes it into the
       parchment under each caption. `strip` puts it in a note below
       the map instead, and is what phones get regardless — see the
       breakpoint in css/site.css.

       THE BLOCK CANNOT ALWAYS BE ON CLEAN PAPER. `maproute --why`
       measures the clearing under Namsangol's village at SEVEN COLUMNS
       of the 72-column grid; a caption plus copy needs 12 to 15. No
       position fits, no line-breaking fits, and shrinking the type to
       fit puts it under 10px. A wash under the block was built to
       cover for that and VEN rejected it, so the search does the work
       instead: it counts the road as ink, bounds the block's edges to
       the arrival frame, and weighs mean ink above closeness. Where it
       still has to touch terrain, it touches the least it can. */
    /* SINCE 2026-08-27 phones get the sheet too, when the sheet has
       clearings to put the block in (MAPS.ink.clear): the block is
       re-flowed and fitted into its box — see the phone block in
       measure(). A sheet WITHOUT boxes (solid, pirate) still sends
       phones to the band, which is what `.jmap--strip` now means:
       measure() sets it from the width and the sheet, `?copy=strip`
       forces it on, `?copy=sheet` forces it off (on a sheet without
       boxes that is the old 7px block — unreadable, which is the
       point of being able to look at it). */
    var COPY_MODE = (function(){
      var m = /[?&]copy=(sheet|strip)/i.exec(location.search);
      return m ? m[1].toLowerCase() : "";
    })();
    var HAS_BOXES = !!(sheet.clear && sheet.clear.some(function(b){ return !!b; }));

    /* The note under the map, one paragraph per stop, built once. It is
       built in BOTH modes and CSS decides which is on: phones get it
       whatever `copy=` says, because the sheet block is sized off the
       label scale and that scale floors at 34px — at 390px wide the
       block would be a quarter of the sheet across while its own text
       fell to about 7px. Neither is survivable, and it is cheaper to
       carry four paragraphs than to branch. */
    var notes = SPOTS.map(function(sp){
      var body = (sp.copy && sp.copy.length) ? sp.copy.join(" ") : "";
      if (!body) return null;
      var p = document.createElement("p");
      p.className = "jmap__note-p";
      p.style.opacity = "0";
      p.innerHTML = "<b>" + esc(sp.name) + "</b>" + esc(body);
      noteHost.appendChild(p);
      return p;
    });

    /* ---- arc-length table ------------------------------------------
       getPointAtLength is a geometry query; doing it per frame inside a
       scroll handler is exactly the kind of per-frame layout work the
       rest of this file is built to avoid. Sample it ONCE into a plain
       array and lerp, so the draw path touches no SVG geometry at all. */
    var SAMP = 900, samples = [], TOTAL = inked.getTotalLength(), i;
    for (i = 0; i <= SAMP; i++){
      var q = inked.getPointAtLength(TOTAL * i / SAMP);
      samples.push({ x: q.x, y: q.y });
    }
    function pointAt(len){
      var t = cl(len / TOTAL) * SAMP, i0 = Math.floor(t), f = t - i0;
      var a = samples[i0], b = samples[Math.min(SAMP, i0 + 1)];
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }

    /* ---- the camera's own track -------------------------------------
       The camera does NOT ride the road — VEN, part 7: *"i want the
       camera to not be as strictly linked to the path of the black
       line... the sharp changes in directions"* is exactly right: a
       camera welded to pointAt() inherits every bend of the spline as
       a lateral jerk. So the camera follows a heavily SMOOTHED copy of
       the road (a moving average over ±CAMS of its length — think of
       the road as the walker's path and this as the crane above it),
       and is pulled back onto the TRUE road point as it nears a stop,
       so arrival framing is pixel-identical to before. Both tracks and
       the blend weight are smooth, so the composite is too. The road,
       the walker and the inking still use the true path — only the
       camera is on the crane. ?camsmooth=0 welds it back on. */
    var CAMS = qs("camsmooth", 0.09);
    var camSamples = (function(){
      var K = Math.max(1, Math.round(SAMP * CAMS)), out = [], i2, k2;
      for (i2 = 0; i2 <= SAMP; i2++){
        var sx2 = 0, sy2 = 0, n2 = 0;
        for (k2 = -K; k2 <= K; k2++){
          var j2 = i2 + k2;
          if (j2 < 0 || j2 > SAMP) continue;
          sx2 += samples[j2].x; sy2 += samples[j2].y; n2++;
        }
        out.push({ x: sx2 / n2, y: sy2 / n2 });
      }
      return out;
    })();
    /* per stop, how far the arrival framing is moved off the seal so
       the note is in the picture too — set by measure(), see
       FRAME_PULL. Map units. */
    var frameOff = [];
    function camAt(len, u){
      /* pull onto the true road point on approach: 1 within 0.10 of a
         stop, released fully by 0.30 into the leg — and, since the
         blocks moved into the clearings, onto the road point SHIFTED
         toward the note (frameOff), on the same weight, so the seal
         and the note arrive in frame together and the shift melts
         away as the camera moves on */
      var k = Math.round(Math.min(u, N - 1)), off = frameOff[k] || { x: 0, y: 0 };
      var dist = Math.abs(Math.min(u, N - 1) - k);
      var w = 1 - smooth(cl((dist - 0.10) / 0.20));
      if (CAMS <= 0){
        var tp = pointAt(len);
        return { x: tp.x + off.x * w, y: tp.y + off.y * w };
      }
      var t = cl(len / TOTAL) * SAMP, i0 = Math.floor(t), f = t - i0;
      var a = camSamples[i0], b = camSamples[Math.min(SAMP, i0 + 1)];
      var sm = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      if (w <= 0) return sm;
      var tr = pointAt(len);
      return { x: sm.x + (tr.x + off.x - sm.x) * w, y: sm.y + (tr.y + off.y - sm.y) * w };
    }
    /* where each stop sits along the road, in length units */
    var STOP_LEN = sheet.stops.map(function(s){
      var sx = s[0] * MW, sy = s[1] * MH, best = 0, bd = Infinity, k;
      for (k = 0; k <= SAMP; k++){
        var dx = samples[k].x - sx, dy = samples[k].y - sy, d = dx * dx + dy * dy;
        if (d < bd){ bd = d; best = k; }
      }
      return TOTAL * best / SAMP;
    });
    /* the seal lands over the last stretch of the approach */
    var STAMP_OVER = TOTAL * 0.035;
    /* the name writes over a longer stretch of the same approach, both
       ending at the stop: the last character lands as the seal stamps */
    var WRITE_LEN = TOTAL * WRITE;

    inked.style.strokeDasharray = TOTAL.toFixed(1) + " " + TOTAL.toFixed(1);

    /* ---- footsteps -------------------------------------------------
       The trail ahead as footprints — small ink ellipses stood a
       stride apart, alternating left and right of the line, each
       turned to face where the road goes. Built ONCE from the same
       arc-length table the camera uses; each print knows its length
       along the road, and drawMap hides prints as they are walked
       (the solid ink line replaces them), showing them again on a
       scrub back. The hide/show is INCREMENTAL — an index pointer
       moves over the sorted list — so a frame touches only the prints
       the walker actually passed, not all ~140 of them. */
    var steps = null, stepIdx = 0;
    var sg = wrap.querySelector(".jmap__steps");
    if (sg){
      steps = [];
      var STRIDE = 13, L2;
      for (L2 = 9; L2 < TOTAL - 5; L2 += STRIDE){
        var a2 = pointAt(L2), b2 = pointAt(Math.min(TOTAL, L2 + 2));
        var ang = Math.atan2(b2.y - a2.y, b2.x - a2.x);
        var sd = (steps.length % 2) ? 1 : -1;
        var e2 = document.createElementNS(NS, "ellipse");
        e2.setAttribute("rx", "2.3");   /* 1.9 x 3.4 until 2026-08-27; see .jmap__steps */
        e2.setAttribute("ry", "4.1");
        e2.setAttribute("transform",
          "translate(" + (a2.x + Math.cos(ang + Math.PI / 2) * 3.4 * sd).toFixed(1) +
          " " + (a2.y + Math.sin(ang + Math.PI / 2) * 3.4 * sd).toFixed(1) +
          ") rotate(" + (ang * 180 / Math.PI - 90).toFixed(1) + ")");
        sg.appendChild(e2);
        steps.push({ len: L2, el: e2 });
      }
    }

    /* ---- markers and cards ---------------------------------------- */

    var items = SPOTS.map(function(sp, idx){
      var s = sheet.stops[idx];

      /* X marks the spot until you get there, then the seal stamps
         over it — the map convention and the site's own dojang in one
         move, and the same stamp the hero title ends on. The glyph is
         CONFIG.token.seal, resolved once in js/config.js (§4), and a
         marker IS a stamp, so this is the one place seal red is
         allowed outside the hero/footer. */
      /* the hand nudge that sits the seal on the road — see sealNudge
         in MAPS.ink. Marker only: `s` itself is untouched, so the road
         and the labels stay on maproute's numbers. A sheet with no
         list, or a shorter one, simply gets no nudge. */
      var nud = (sheet.sealNudge || [])[idx] || [0, 0];

      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "jmap__mark");
      g.setAttribute("transform",
                     "translate(" + ((s[0] + nud[0]) * MW).toFixed(1) +
                     " " + ((s[1] + nud[1]) * MH).toFixed(1) + ")");
      g.innerHTML =
        '<g class="jmap__x"><path d="M-11 -11 L11 11"/><path d="M11 -11 L-11 11"/></g>' +
        '<g class="jmap__seal">' +
          '<rect x="-15" y="-15" width="30" height="30" rx="5"/>' +
          '<text x="0" y="' + (8 * SEAL_Q).toFixed(1) + '">' +
            esc(SEAL_G) + "</text>" +
        "</g>";
      marks.appendChild(g);

      /* the card column only exists under ?info=1 — the paintings and
         blurbs are then fetched and baked exactly as before */
      var card = null;
      if (INFO && host){
        card = document.createElement("article");
        card.className = "jmap__card";
        card.innerHTML =
          '<figure class="jmap__plate"><svg viewBox="0 0 ' + AW + " " + AH +
            '" aria-hidden="true">' + artOf(sp) + "</svg></figure>" +
          '<div class="jmap__head">' +
            '<p class="jmap__idx">0' + (idx + 1) + ' <span>/ 0' + N + "</span></p>" +
            "<h3>" + sp.name + "</h3>" +
            '<p class="jmap__ko" lang="ko">' + sp.ko + "</p>" +
          "</div>" +
          '<p class="jmap__body">' + sp.blurb + "</p>";
        host.appendChild(card);
        settleArt(card, sp);
      }

      /* the vista: the painting alone, through the same pipeline as
         everything else that shows one */
      var vista = null;
      if (vHost){
        vista = document.createElement("figure");
        vista.className = "jmap__vista";
        vista.innerHTML = '<svg viewBox="0 0 ' + AW + " " + AH +
          '" aria-hidden="true">' + artOf(sp) + "</svg>";
        vHost.appendChild(vista);
        settleArt(vista, sp);
      }

      return { card: card, vista: vista, x: g.querySelector(".jmap__x"),
               seal: g.querySelector(".jmap__seal") };
    });

    /* ---- the place names, written onto the sheet -------------------
       On the map, in map units, inside the camera — a label BELONGS to
       the sheet, like a name on any old map, so it scales and travels
       with the terrain. The glyphs are set in the display face; the
       handwriting is the mask: scribble() lays a serpentine brush path
       over each character cell in writing order, that path is the only
       white in the label's mask, and drawMap reveals it with
       dashoffset on the same `walked` metric the seal uses. The window
       ends exactly at the stop, so the last character lands as the
       seal stamps, and scrubbing backwards un-writes the name the same
       way it un-inks the road. */
    function scribble(cells, S){
      var R = 4, hw = S * 0.60, step = S * 1.12 / R, d = "";
      cells.forEach(function(c){
        var top = c.y - S * 0.56 + step * 0.5, j;
        for (j = 0; j < R; j++){
          var y = top + j * step, dir = (j % 2 ? -1 : 1);
          d += (d ? " L" : "M") + (c.x - dir * hw).toFixed(1) + " " + y.toFixed(1) +
               " L" + (c.x + dir * hw).toFixed(1) + " " + (y + step * 0.3).toFixed(1);
        }
      });
      return d;
    }

    var labels = [];
    if (LABELS){
      SPOTS.forEach(function(sp, i2){
        var s = sheet.stops[i2], chars = sp.ko.split(""), n2 = chars.length;
        var S = LSIZE, LH = S * 1.14;
        /* Label anchor. A sheet routed with maproute --base carries a
           SEARCHED anchor per stop (elements 3+4): the quietest patch
           of parchment inside the arrival frame, judged on all ink —
           terrain and vignette alike. Without one (the pirate sheet)
           the label falls back to a side beside the marker, away from
           the sheet's nearer edge. */
        var side = s[0] < 0.5 ? 1 : -1;
        var ax = s.length >= 4 ? s[2] * MW : null,
            ay = s.length >= 4 ? s[3] * MH : null;
        /* character cells in writing order, centred on local (0,0) —
           vertical like a 고지도 place name, or a row under ?vlabel=0 */
        var cells = chars.map(function(_, k2){
          return VLAB ? { x: 0, y: (k2 - (n2 - 1) / 2) * LH }
                      : { x: (k2 - (n2 - 1) / 2) * LH, y: 0 };
        });
        var lastY = cells[cells.length - 1].y;
        var mx0 = -(VLAB ? S : (n2 * LH / 2 + S)),
            my0 = cells[0].y - S,
            mw  = -2 * mx0,
            mh  = lastY - cells[0].y + 2 * S;

        var g2 = document.createElementNS(NS, "g");
        g2.setAttribute("class", "jmap__label");
        g2.style.display = "none";
        g2.innerHTML =
          '<defs><mask id="jml' + i2 + '" maskUnits="userSpaceOnUse" x="' +
            mx0 + '" y="' + my0 + '" width="' + mw + '" height="' + mh + '">' +
            '<rect x="' + mx0 + '" y="' + my0 + '" width="' + mw + '" height="' + mh + '" fill="#000"/>' +
            '<path d="' + scribble(cells, S) + '" fill="none" stroke="#fff" stroke-width="' +
              (S * 0.46).toFixed(1) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
          "</mask></defs>" +
          '<text mask="url(#jml' + i2 + ')" font-size="' + S + '" text-anchor="middle" lang="ko">' +
            cells.map(function(c, k2){
              return '<tspan x="' + c.x.toFixed(1) + '" y="' + c.y.toFixed(1) +
                     '" dominant-baseline="central">' + chars[k2] + "</tspan>";
            }).join("") +
          "</text>";
        labHost.appendChild(g2);

        /* The English caption is its OWN group, because it no longer
           lives under the Korean column — VEN part 13, with red lines
           drawn on four screenshots: centred under a narrow column,
           the wide caption line stuck out into roofs, ridges and the
           compass. It anchors UNDER THE BUILDING instead (elements
           5+6 of the stop, emitted by maproute --base from the
           landmark's own footprint: the quiet lower edge of its
           ground wash). Same face, and it writes on a wavy stroke
           swept along the line — a single pass IS handwriting at
           caption scale; the per-character serpentine is for tall
           glyph cells. Sheets without a caption anchor (pirate) fall
           back to under-the-column. */
        var ge = null, emp = null, eL = 0;
        if (EN){
          var F = S * 0.26;
          var ew2 = sp.name.length * F * 0.82 + F * 2;
          var seg = ew2 / 6, d2 = "M" + (-ew2 / 2).toFixed(1) + " 0", si;
          for (si = 1; si <= 6; si++)
            d2 += " L" + (-ew2 / 2 + seg * si).toFixed(1) + " " +
                  ((si % 2 ? -1 : 1) * F * 0.16).toFixed(1);
          ge = document.createElementNS(NS, "g");
          ge.setAttribute("class", "jmap__label jmap__enlab");
          ge.style.display = "none";
          ge.innerHTML =
            '<defs><mask id="jme' + i2 + '" maskUnits="userSpaceOnUse" x="' +
            (-ew2 / 2 - F).toFixed(1) + '" y="' + (-F * 1.4).toFixed(1) +
            '" width="' + (ew2 + 2 * F).toFixed(1) + '" height="' + (F * 2.8).toFixed(1) + '">' +
            '<rect x="' + (-ew2 / 2 - F).toFixed(1) + '" y="' + (-F * 1.4).toFixed(1) +
            '" width="' + (ew2 + 2 * F).toFixed(1) + '" height="' + (F * 2.8).toFixed(1) + '" fill="#000"/>' +
            '<path d="' + d2 + '" fill="none" stroke="#fff" stroke-width="' +
            (F * 1.8).toFixed(1) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
            "</mask></defs>" +
            '<text class="jmap__en" mask="url(#jme' + i2 + ')" x="0" y="0" font-size="' +
            F.toFixed(1) + '" text-anchor="middle">' + sp.name + "</text>";

          /* ZICO'S COPY, written on the sheet under the caption.

             It FADES rather than writes, and that is deliberate: the
             per-line mask sweep that makes one caption look
             handwritten costs a mask re-rasterisation per line per
             frame, and four lines of body text swept at once reads as
             a machine printing, not a hand. The hand writes the name;
             the note is already on the paper when you arrive.

             The whole block is one <g> so the draw loop touches a
             single opacity, and it hangs off the caption's own anchor
             — maproute sizes the blank-paper search to the block, not
             to the caption alone (COPY_ROWS in tools/maproute.js), so
             what is measured is what is drawn. */
          var copy = sp.copy || [];
          /* with a clearing per stop (MAPS.ink.clear) the copy is its own
             group, built by setBlock; the caption keeps this one and its
             writing stroke. Without (solid, pirate) it hangs under the
             caption as it always did. */
          var gn = null;
          if (copy.length && HAS_BOXES){
            gn = document.createElementNS(NS, "g");
            gn.setAttribute("class", "jmap__label jmap__enlab jmap__block");
            gn.style.display = "none";
          } else if (copy.length){
            var CF = F * 0.80, CLH = CF * 1.42, cg = "";
            copy.forEach(function(line, li){
              cg += '<text x="0" y="' + (F * 1.55 + li * CLH).toFixed(1) +
                    '" font-size="' + CF.toFixed(1) + '" text-anchor="middle"' +
                    ' opacity="0">' + esc(line) + "</text>";
            });

            /* NO WASH UNDER THE BLOCK. One was built — a bloom of damp
               paper that veiled whatever terrain the block had to sit
               on — and VEN rejected it on sight: *"remove the
               watercolour effect, I dont like it."* It is gone rather
               than switched off, because the thing it was covering for
               is now fixed at the source: the search keeps the block
               off the road and off the ridges instead of hiding the
               collision. The line-by-line fade below is what remains of
               *"some sort of animation to fade in"*. */
            var cwrap = document.createElementNS(NS, "g");
            cwrap.setAttribute("class", "jmap__copy");
            cwrap.innerHTML = cg;
            ge.appendChild(cwrap);
          }
          labHost.appendChild(ge);
          if (gn) labHost.appendChild(gn);
        }

        var mp = g2.querySelector("mask path");
        var LL = mp.getTotalLength();
        mp.style.strokeDasharray = LL.toFixed(1) + " " + LL.toFixed(1);
        mp.style.strokeDashoffset = LL.toFixed(1);
        if (ge){
          emp = ge.querySelector("mask path");
          eL = emp.getTotalLength();
          emp.style.strokeDasharray = eL.toFixed(1) + " " + eL.toFixed(1);
          emp.style.strokeDashoffset = eL.toFixed(1);
        }
        labels.push({
          g: g2, mp: mp, L: LL, lw: -1,
          ge: ge, emp: emp, eL: eL,
          cg: ge ? ge.querySelector(".jmap__copy") : null,
          lines: ge ? ge.querySelectorAll(".jmap__copy > text") : null,
          cw: -1,
          /* the copy lines' fade stagger — 0.13 for the desktop's four
             lines, tightened for the phone's re-flowed eight or nine so
             the last line still lands before the seal (measure()) */
          step: 0.13,
          /* for the phone block and the framing: the stop's copy, the
             caption's authored size, the desktop markup to restore, and
             the box the tool cleared for the phone (MAPS.ink.clear) */
          sp: sp, F: EN ? F : 0, geHTML: ge ? ge.innerHTML : null, mode: "desk", idx: i2,
          /* the note's own group and writing mask, when the sheet has a
             clearing for it (see gn above) */
          gn: EN ? gn : null, nmp: null, nL: 0, capBox: null,
          pb: (sheet.clear && sheet.clear[i2]) ? sheet.clear[i2] : null, blk: null,
          ex: s.length >= 6 ? s[4] * MW : null,
          ey: s.length >= 6 ? s[5] * MH : null,
          /* under-the-column fallback offset, in label-local units */
          efy: lastY + S * 1.05,
          sx: s[0] * MW, sy: s[1] * MH, side: side,
          ax: ax, ay: ay,
          /* half-extent toward the marker, so measure() can keep a
             constant gap to the seal at any label scale */
          hw: VLAB ? S * 0.75 : n2 * LH / 2 + S * 0.2
        });
      });
    }

    /* ---- position and zoom ------------------------------------------
       `u` is position in STOP UNITS: 0 = at the first place, 1.5 =
       halfway down the road from the second to the third. In STEP
       mode u comes from the tween (see the scroll drive); in
       continuous mode timelineU maps scroll progress to u with the
       DWELL/EASE pacing kept from part 3.

       zoomOf derives the zoom from u ALONE — distance to the nearest
       stop — so one function serves the tween and the scroll path
       identically: full in within ZHOLD of a place, easing out to
       zOut at mid-leg. It reads the COVER-FLOORED zIn/zOut that
       measure() computes, not the raw knobs. The raw values were a
       real phone bug: 390/0.558 = 699px of sheet under an 844px
       viewport means cover = 1.21, and a mid-leg zoom of 1.00 pulled
       bare paper into the top and bottom of the frame. */
    function legEase(f){
      return (1 - EASE) * f + EASE * smooth(f);
    }
    function timelineU(p){
      /* THE TAIL (VEN, 2026-08-27, with Jeonju's caption washed out in
         the exit dissolve: "extend the 'the journey' section vertically
         enough so that this name is rendered properly", then, still
         unable to see it: "extend the LENGTH of the section so that it
         actually has space to render underneath the image
         COMFORTABLY"). The road used to end exactly where the pinned
         scroll did, so the last stop was reached at the instant the
         section began to unpin and its name faded with the trailing
         edge. A hold on Jeonju was the first answer and it was not
         enough: on a short window the village, its caption and its
         note together are as tall as the screen, and the caption
         lands in the last pixels under the bottom-fixed chrome. So
         the last TAIL of the scroll WALKS ON — u runs past N-1 and
         lenAt carries the camera down the rest of the road to the
         sheet's foot, the village rising up the screen and the
         caption coming clear beneath it, before the section lets go.
         css/site.css's height grew to match so the legs kept their
         pacing. `?tail=0` is the old ending. */
      if (TAIL > 0 && p > 1 - TAIL) return (N - 1) + (p - (1 - TAIL)) / TAIL;
      p = Math.min(1, p / (1 - TAIL));
      var d = DWELL, t = (1 - N * d) / (N - 1), pos = 0, k;
      for (k = 0; k < N; k++){
        if (p < pos + d || k === N - 1) return k;
        pos += d;
        if (p < pos + t) return k + legEase((p - pos) / t);
        pos += t;
      }
      return N - 1;
    }
    function zoomOf(u){
      if (u > N - 1) u = N - 1;                 /* the tail keeps the settle zoom */
      var dist = Math.abs(u - Math.round(u));   /* 0 at a stop, .5 mid-leg */
      return zIn + (zOut - zIn) *
        smooth(cl((dist - ZHOLD * 0.5) / (0.5 - ZHOLD * 0.5)));
    }

    function lenAt(u){
      var k = Math.floor(u), f = u - k;
      /* past the last stop (the tail): the rest of the road, to its end */
      if (u > N - 1) return STOP_LEN[N - 1] + (TOTAL - STOP_LEN[N - 1]) * Math.min(1, u - (N - 1));
      if (k >= N - 1) return STOP_LEN[N - 1];
      if (k < 0) return STOP_LEN[0];
      return STOP_LEN[k] + (STOP_LEN[k + 1] - STOP_LEN[k]) * f;
    }

    /* ---- sizing, on resize only ------------------------------------ */

    var W = 0, H = 0, camW = 0, camH = 0, zIn = ZOOM_IN, zOut = ZOOM_OUT,
        zPan = ZOOM_PAN, zFit = 1, fx = FOCUS_X, fy = FOCUS_Y;

    /* ---- the phone block: measure, re-flow, fit, rebuild ------------
       Text is measured on a canvas in the display face at 100px and
       scaled — SVG text at size s is w(100)·s/100 — with letter-spacing
       added per gap, so the re-flow knows the real width of a line
       before it is drawn. The face arrives after first paint; the
       fonts.ready hook below re-measures. */
    var DISPLAY_FONT = (getComputedStyle(document.documentElement)
                          .getPropertyValue(HAND === "0" ? "--font-display" :
                                            HAND === "kalam" ? "--font-hand-2" :
                                            HAND === "patrick" ? "--font-hand-3" : "--font-hand") || "").trim() ||
                       '"Song Myung", serif';
    /* ask for the hand up front, so fonts.ready (below) fires with it
       loaded and the note is measured in the face it is set in */
    if (document.fonts && document.fonts.load){
      try { document.fonts.load("100px " + DISPLAY_FONT, "An L2 from Upbit"); } catch (e){}
    }
    var mctx = null, wcache = {};
    function textW(str, px, spacingEm){
      var key = str + "|" + spacingEm;
      var w100 = wcache[key];
      if (w100 == null){
        if (mctx === null){
          try { mctx = document.createElement("canvas").getContext("2d"); } catch (e){ mctx = false; }
        }
        if (mctx){ mctx.font = "100px " + DISPLAY_FONT; w100 = mctx.measureText(str).width; }
        else w100 = str.length * 50;
        if (spacingEm) w100 += Math.max(0, str.length - 1) * spacingEm * 100;
        wcache[key] = w100;
      }
      return w100 * px / 100;
    }
    /* greedy fill to maxW px at the given size */
    function reflow(text, maxW, px, spacingEm){
      var words = text.split(/\s+/).filter(Boolean), lines = [], cur = "", i3;
      for (i3 = 0; i3 < words.length; i3++){
        var t = cur ? cur + " " + words[i3] : words[i3];
        if (cur && textW(t, px, spacingEm) > maxW){ lines.push(cur); cur = words[i3]; }
        else cur = t;
      }
      if (cur) lines.push(cur);
      return lines;
    }
    /* the copy's size in label units as the desktop builds it (CF in
       the label block: F·0.8, F = S·0.26); the phone's caption is set
       a little UNDER its copy — on a phone the caption is a heading on
       a note, not the name of the place (the Korean name beside the
       building is that) — with its tracking eased so it fits the box */
    var CFu = LSIZE * 0.26 * 0.80;
    /* in the hand the caption is a line of the same hand a shade larger
       and barely tracked, and the lines sit further apart — VEN: "the
       gaps between each line of text to be a bit larger (in order to
       simulate handwritten content)" */
    var PCAP = HAND === "0" ? 0.82 : 1.05, PCAP_SP = HAND === "0" ? 0.12 : 0.02, PPAD = 4,
        COPY_LH = qs("leading", HAND === "0" ? 1.38 : 1.65);
    /* 1.38 for the serif (1.5 "looks too dispersed", VEN): it is the LH
       tools/mapnote.js plans the block's height with — change one,
       change the other, or the block runs past its clearing */
    /* 1.65, not the 1.75 first tried: on a phone the two asks pull
       against each other — every tenth of leading is a line the
       shallow clearings cannot hold, and 1.75 cost stops 1 and 2 a
       size (12.5 / 10.5 px against 14 / 11 at 1.6). `?leading=` */
    /* standing strengths of the copy and the caption; the fade in
       drawMap multiplies them (they used to be in css/site.css, where
       the class rule beat the fade's attribute — see the note there) */
    var COPY_OP = 0.78, CAP_OP = 0.80;

    /* the desktop markup back: the caption on its writing mask, the
       authored lines under it */
    function setDesk(lb){
      if (lb.mode === "desk") return;
      lb.ge.innerHTML = lb.geHTML;
      lb.ge.classList.remove("jmap__enlab--phone");
      lb.emp = lb.ge.querySelector("mask path");
      lb.eL = lb.emp.getTotalLength();
      lb.emp.style.strokeDasharray = lb.eL.toFixed(1) + " " + lb.eL.toFixed(1);
      lb.emp.style.strokeDashoffset = lb.eL.toFixed(1);
      lb.cg = lb.ge.querySelector(".jmap__copy");
      lb.lines = lb.ge.querySelectorAll(".jmap__copy > text");
      lb.step = 0.13; lb.cw = -1; lb.lw = -1;
      lb.mode = "desk";
    }
    /* THE NOTE, A UNIFORM BLOCK IN A CLEARING CUT TO IT (VEN,
       2026-08-27, third pass: "keep the original font, just make it
       fit in the clearings properly ... a uniform gap between the edge
       of the clearing and the edge of the block of text ... I want a
       uniform block of text, i dont want parts of the text sticking
       out"). The block is planned by tools/mapnote.js at a size fixed
       in SHEET units (`c.fs`) and a measure (`c.box`), and the
       clearing is cut one margin outside that box — so here the copy
       is simply wrapped to the box's width in the same face and drawn
       at that size, centred in the box. The same block on every
       device; what changes with the screen is only how large the
       sheet is drawn. On a wide window the size is capped in px
       (DTEXT_MAX) and the block sits centred in its box a little
       smaller, the margin growing evenly round it.

       The whole note writes itself on one mask, a stroke per line as
       its own subpath (dashing continues across subpaths, and a
       subpath per line never sweeps a diagonal between lines) — one
       dashoffset a frame, the Korean name's cost. `?fade=1` is the
       line-by-line fade instead. Returns the block's extents in map
       units for the framing. */
    function setBlock(lb, c, unit, cap, narrow){
      var sp = lb.sp, box = c.box;
      var bx0 = box[0] * MW, by0 = box[1] * MH, bx1 = box[2] * MW, by1 = box[3] * MH;
      var text = (sp.copy || []).join(" "), name = HAND === "0" ? sp.name.toUpperCase() : sp.name;
      var capSp = HAND !== "0" ? PCAP_SP : 0.2;
      /* the size: the planned one, unless that is more px than the
         window should carry */
      var S = c.fs || 17, cf = S * unit;
      if (cap && cf > cap){ cf = cap; S = cf / unit; }
      var capPx = cf * PCAP, bw = (bx1 - bx0) * unit;
      /* the copy alone: the caption is under the building (its own
         group, `ge`, placed in measure()) since 2026-08-27 */
      var capLines = [], lines = reflow(text, bw, cf, 0.01);
      var capLH = capPx * 1.25, LHpx = cf * COPY_LH;
      var h = (capLines.length ? capLines.length * capLH + cf * 0.55 : 0) + lines.length * LHpx - cf * 0.3;
      if (h > (by1 - by0) * unit + 1)
        console.warn("journey: the note for " + sp.name + " runs " + Math.round(h - (by1 - by0) * unit) +
                     "px past its box — re-run tools/mapnote.js");
      /* centred in the box, both ways */
      var cx = (bx0 + bx1) / 2, top = (by0 + by1) / 2 - h / unit / 2, y = top, out = [], j;
      for (j = 0; j < capLines.length; j++){
        out.push({ t: capLines[j], y: y + ((capLH - capPx) / 2 + capPx * 0.78) / unit, cx: cx,
                   w: textW(capLines[j], capPx, capSp) / unit, cap: true });
        y += capLH / unit;
      }
      if (capLines.length) y += cf * 0.55 / unit;
      for (j = 0; j < lines.length; j++){
        out.push({ t: lines[j], y: y + ((LHpx - cf) / 2 + cf * 0.78) / unit, cx: cx,
                   w: textW(lines[j], cf, 0.01) / unit, cap: false });
        y += LHpx / unit;
      }
      var fit = { cf: cf, lines: out, bottom: y - (LHpx - cf) / unit };

      /* build: sizes in label units, the group scaled by sq so the
         copy lands at cf px */
      var sq = fit.cf / (CFu * unit), capF = CFu * PCAP;
      var caps = fit.lines.filter(function(l){ return l.cap; }),
          copys = fit.lines.filter(function(l){ return !l.cap; });
      var masked = !FADE, html = "";
      function X(l){ return (l.cx / sq).toFixed(2); }
      function Y(l){ return (l.y / sq).toFixed(2); }
      if (masked){
        var mx0 = Infinity, mx1 = -Infinity, my0 = Infinity, my1 = -Infinity, dM = "";
        fit.lines.forEach(function(l){
          var sz = l.cap ? capF : CFu, x0 = l.cx / sq - l.w / sq / 2 - sz * 0.3,
              x1 = l.cx / sq + l.w / sq / 2 + sz * 0.3, yc = l.y / sq - sz * 0.28;
          dM += "M" + x0.toFixed(1) + " " + yc.toFixed(1) + " L" + x1.toFixed(1) + " " + yc.toFixed(1) + " ";
          mx0 = Math.min(mx0, x0); mx1 = Math.max(mx1, x1);
          my0 = Math.min(my0, yc - sz); my1 = Math.max(my1, yc + sz);
        });
        html += '<defs><mask id="jmn' + lb.idx + '" maskUnits="userSpaceOnUse" x="' +
          (mx0 - CFu).toFixed(1) + '" y="' + (my0 - CFu).toFixed(1) +
          '" width="' + (mx1 - mx0 + 2 * CFu).toFixed(1) + '" height="' + (my1 - my0 + 2 * CFu).toFixed(1) + '">' +
          '<rect x="' + (mx0 - CFu).toFixed(1) + '" y="' + (my0 - CFu).toFixed(1) +
          '" width="' + (mx1 - mx0 + 2 * CFu).toFixed(1) + '" height="' + (my1 - my0 + 2 * CFu).toFixed(1) + '" fill="#000"/>' +
          '<path d="' + dM.trim() + '" fill="none" stroke="#fff" stroke-width="' +
          (Math.max(capF, CFu) * 1.4).toFixed(1) + '" stroke-linecap="round"/>' +
          "</mask></defs>";
      }
      html += '<g' + (masked ? ' mask="url(#jmn' + lb.idx + ')"' : "") + ">";
      html += caps.map(function(l){
        return '<text class="jmap__en"' + (masked ? "" : ' style="opacity:0"') +
               ' x="' + X(l) + '" y="' + Y(l) + '" font-size="' + capF.toFixed(2) +
               '" text-anchor="middle">' + esc(l.t) + "</text>";
      }).join("");
      html += '<g class="jmap__copy">' + copys.map(function(l){
        return '<text x="' + X(l) + '" y="' + Y(l) + '" font-size="' + CFu.toFixed(2) +
               '" text-anchor="middle"' + (masked ? ' style="opacity:' + COPY_OP + '"' : ' style="opacity:0"') +
               ">" + esc(l.t) + "</text>";
      }).join("") + "</g></g>";
      /* into the note's own group; the caption's (ge) is untouched */
      var host = lb.gn;
      host.innerHTML = html;
      host.classList.toggle("jmap__enlab--phone", !!narrow);
      if (masked){
        lb.nmp = host.querySelector("mask path");
        lb.nL = lb.nmp.getTotalLength();
        lb.nmp.style.strokeDasharray = lb.nL.toFixed(1) + " " + lb.nL.toFixed(1);
        lb.nmp.style.strokeDashoffset = lb.nL.toFixed(1);
        lb.lines = [];   /* the mask does the arriving; nothing to fade */
      } else {
        lb.nmp = null;
        lb.lines = host.querySelectorAll("text");
      }
      lb.cg = host.querySelector(".jmap__copy");
      lb.step = Math.min(0.13, 0.37 / Math.max(1, lb.lines.length - 1));
      lb.cw = -1; lb.lw = -1;
      lb.mode = "box";
      host.setAttribute("transform", "scale(" + sq.toFixed(4) + ")");
      var ex0 = Infinity, ex1 = -Infinity;
      fit.lines.forEach(function(l){
        ex0 = Math.min(ex0, l.cx - l.w / 2); ex1 = Math.max(ex1, l.cx + l.w / 2);
      });
      return { x0: ex0, x1: ex1, y0: top, y1: fit.bottom };
    }
    /* the desktop block's extents in map units, from the same measure */
    function deskExtent(lb, etx, ety, lq, unit){
      var sp = lb.sp, F = lb.F, CF = F * 0.8, CLH = CF * 1.42, n = (sp.copy || []).length, li2;
      var wmax = textW(sp.name.toUpperCase(), F * lq * unit, 0.2);
      for (li2 = 0; li2 < n; li2++) wmax = Math.max(wmax, textW(sp.copy[li2], CF * lq * unit, 0.01));
      var wU = wmax / unit;
      return { x0: etx - wU / 2, x1: etx + wU / 2, y0: ety - F * lq,
               y1: ety + (n ? (F * 1.55 + (n - 1) * CLH + CF * 0.3) : F * 0.3) * lq };
    }

    function measure(){
      /* WHICH HOME THE COPY HAS is decided first, because the band's
         height feeds everything below: the sheet on a phone when the
         sheet has boxes for it, the band otherwise — see COPY_MODE. */
      var narrow0 = (wrap.clientWidth || window.innerWidth) <= 860;
      var strip = COPY_MODE === "strip" || (COPY_MODE !== "sheet" && narrow0 && !HAS_BOXES);
      wrap.classList.toggle("jmap--strip", strip);

      /* THE BAND'S HEIGHT IS PUBLISHED FIRST, and the order is
         load-bearing. .jmap__view's bottom inset IS --jnote-h, so the
         view cannot be measured until the band has been. The band is
         absolutely positioned and sized by its own text, so nothing
         about it depends on the view and there is no circularity —
         one write, one forced layout, then every read below is of the
         settled box.

         It also reaches the CA pill and the preview bar, both of which
         are fixed to the WINDOW rather than to this section and would
         otherwise print themselves over the last line of the copy
         (VEN's screenshot, 2026-08-25). See .ca-float in css/site.css.
         Done in measure() because this is the one place in the file
         already allowed to touch layout, and it only changes with the
         viewport. */
      document.documentElement.style.setProperty(
        "--jnote-h", noteHost.offsetHeight + "px");

      /* THE VIEW, NOT THE STICKY. On a phone the note band takes the
         bottom of the section, and every number below is about the
         frame the camera actually fills: `cover` must floor the zoom
         against the SHORTER box or bare paper shows above the band,
         the edge clamp must clamp to it, and FOCUS_Y must centre in
         it. On wide screens the band is display:none, --jnote-h is
         0px and view == sticky to the pixel. */
      W = view.clientWidth; H = view.clientHeight;
      /* A tab that has never been painted (opened in the background —
         browsers defer layout) measures 0x0. Everything downstream of
         a zero here is poison with no error to see: camH 0 makes
         cover = H/0 = Infinity, the zooms go Infinite, and assigning
         a transform containing "Infinitypx" is INVALID CSS, which the
         browser silently drops — so the map just never appears and
         nothing ever threw. Bail and leave W at 0: drawMap no-ops on
         it, and onScroll + visibilitychange keep retrying until the
         tab has real geometry. */
      if (!W || !H){ W = 0; return; }
      camW = W; camH = W * sheet.h / sheet.w;
      cam.style.width  = camW.toFixed(1) + "px";
      cam.style.height = camH.toFixed(1) + "px";

      /* At scale 1 the sheet fills the width exactly — which on a
         DESKTOP also covers the height, because 9:16 is far taller
         than any window. On a PHONE it does not: 390/0.558 = 699px of
         sheet under an 844px viewport, and the gap would show as bare
         paper top and bottom. So every scale is floored at `cover`. */
      var narrow = W <= 860;
      var cover = Math.max(1, H / camH);
      zOut = Math.max(ZOOM_OUT, cover);
      /* phones settle closer — see PHONE_ZOOM */
      zIn  = Math.max(narrow ? PHONE_ZOOM : ZOOM_IN, zOut * 1.35);
      zPan = Math.max(ZOOM_PAN, cover);
      zFit = Math.max(H / camH, 0.05);   /* ?cam=fixed: whole sheet */

      /* Phones: the vista (or ?info=1's card) is along the bottom, so
         the place you have arrived at goes above it; with neither
         there is nothing to clear and the marker stays centred. */
      fx = narrow ? 0.50 : FOCUS_X;
      fy = (narrow && (INFO || VISTA)) ? 0.33 : FOCUS_Y;

      /* Label scale, per viewport. Labels live in map units, and a map
         unit is W·zIn/1000 px at the settle zoom — 2.96px at 1600w but
         only 0.72px at 390w, where a 24-unit character would be 17px.
         So each label group is scaled to hit a target ON-SCREEN size:
         ~10% of the viewport height, floored at 34px, capped so it
         stays subordinate on very wide screens. The scale wraps both
         the glyphs and their mask (the mask's userSpace is inside the
         group transform), so the writing scales with the writing. */
      var unit = W * zIn / 1000;
      var want = Math.max(34, Math.min(0.10 * H, 0.058 * W));
      var lq = Math.min(LQ_MAX, want / (unit * LSIZE));
      var visW = 1000 / zIn, visH = 1000 * H / (W * zIn);   /* the frame, in map units */
      labels.forEach(function(lb, k){
        var tx = lb.ax != null ? lb.ax : lb.sx + lb.side * (23 + lq * lb.hw),
            ty = lb.ay != null ? lb.ay : lb.sy;
        lb.g.setAttribute("transform",
          "translate(" + tx.toFixed(1) + " " + ty.toFixed(1) +
          ") scale(" + lq.toFixed(3) + ")");
        lb.blk = null;
        if (lb.ge){
          if (!strip && lb.pb && lb.gn){
            /* THE CAPTION UNDER THE BUILDING, at its fixed sheet size
               (CAPU), on the anchor maproute --caption searched for it
               (elements 5+6) — VEN, 2026-08-27: "move the ENGLISH names
               for each location back underneath the corresponding
               image". Its writing stroke is the one built with it. */
            var etx = lb.ex != null ? lb.ex : tx,
                ety = lb.ey != null ? lb.ey : ty + lq * lb.efy,
                cq = CAPU / lb.F;
            lb.ge.setAttribute("transform",
              "translate(" + etx.toFixed(1) + " " + ety.toFixed(1) + ") scale(" + cq.toFixed(3) + ")");
            var cwU = textW(lb.sp.name.toUpperCase(), CAPU * unit, 0.2) / unit;
            lb.capBox = { x0: etx - cwU / 2, x1: etx + cwU / 2, y0: ety - CAPU * 0.85, y1: ety + CAPU * 0.3 };
            /* the note, in its clearing: the planned size (c.fs, sheet
               units); the only cap is a px ceiling for wide windows */
            var cap = narrow ? 0 : (DTEXT || DTEXT_MAX);
            lb.blk = setBlock(lb, lb.pb, unit, cap, narrow);   /* lb.pb is the note: box + fs */
          } else {
            lb.capBox = null;
            setDesk(lb);
            /* under the building when the sheet carries an anchor,
               under the column otherwise */
            var etx = lb.ex != null ? lb.ex : tx,
                ety = lb.ey != null ? lb.ey : ty + lq * lb.efy;
            lb.ge.setAttribute("transform",
              "translate(" + etx.toFixed(1) + " " + ety.toFixed(1) +
              ") scale(" + lq.toFixed(3) + ")");
            if (!strip) lb.blk = deskExtent(lb, etx, ety, lq, unit);
          }
        }
        /* THE ARRIVAL FRAMING — see FRAME_PULL. The camera's target at
           this stop is the midpoint of the seal, the name column and
           the block, clamped so the seal keeps to the middle of the
           screen; camAt applies it on the approach weight. */
        var mx = lb.sx, my = lb.sy, blk = lb.blk;
        var lo = Math.min(mx - SEAL_M, tx - 30), hi = Math.max(mx + SEAL_M, tx + 30),
            loY = Math.min(my - SEAL_M, ty - 30), hiY = Math.max(my + SEAL_M, ty + 30);
        if (blk){
          /* the note keeps a margin of its own from the screen's edge
             — at Jeonju on a phone the midpoint alone put its last
             letters one pixel past the frame */
          lo = Math.min(lo, blk.x0 - NOTE_M); hi = Math.max(hi, blk.x1 + NOTE_M);
          loY = Math.min(loY, blk.y0 - NOTE_M); hiY = Math.max(hiY, blk.y1 + NOTE_M);
        }
        var cb = lb.capBox;
        if (cb){
          lo = Math.min(lo, cb.x0 - 20); hi = Math.max(hi, cb.x1 + 20);
          loY = Math.min(loY, cb.y0 - 20); hiY = Math.max(hiY, cb.y1 + 20);
        }
        var fxU = (lo + hi) / 2, fyU = (loY + hiY) / 2;
        /* ACROSS: the margined midpoint, moved only as far as keeps
           the bare extents of seal, name and note all on screen with
           a few units to spare. When even the bare extents are wider
           than the frame (Jeonju on a phone: the name west of the
           seal, the note east of it, 499 of 500 units), split the
           difference between them rather than favour the seal —
           clamping on the seal alone put the name off the left edge. */
        var nhw = lq * LSIZE * 0.5;   /* the name column's real half-width */
        var lo0 = Math.min(mx - 15, tx - nhw, blk ? blk.x0 : Infinity, cb ? cb.x0 : Infinity),
            hi0 = Math.max(mx + 15, tx + nhw, blk ? blk.x1 : -Infinity, cb ? cb.x1 : -Infinity),
            minC = hi0 - visW / 2 + 12, maxC = lo0 + visW / 2 - 12;
        /* (the 6 units of bias toward the seal's side, when they cannot
           all fit, is the name's side bearing: Jeonju's 전 measured 2px
           past the left edge on a phone at an even split, and the
           note's right margin has more to give) */
        fxU = minC <= maxC ? Math.max(minC, Math.min(maxC, fxU)) : (lo0 + hi0) / 2 - 6;
        /* DOWN: the same, with the landmark counted in (LAND_H either
           side of the seal — every vignette sits roughly centred on its
           stop) and, when the frame is too short for landmark and note
           together (a 1280x551 desktop: 261 units tall against stop
           1's 290), the TOP wins: seal, name and building stay whole
           and the note's last lines come up as the camera moves on —
           §9w part 14's caveat, kept on purpose. A midpoint that split
           the difference here cut 창덕궁's first stroke off the top of
           a short window. */
        var nhh = lq * ((lb.sp.ko.length - 1) / 2 * LSIZE * 1.14 + LSIZE * 0.55);
        var lo0Y = Math.min(my - LAND_H, ty - nhh, blk ? blk.y0 : Infinity, cb ? cb.y0 : Infinity),
            hi0Y = Math.max(my + LAND_H, ty + nhh, blk ? blk.y1 : -Infinity, cb ? cb.y1 : -Infinity),
            minCy = hi0Y - visH / 2 + 12, maxCy = lo0Y + visH / 2 - 12;
        fyU = minCy <= maxCy ? Math.max(minCy, Math.min(maxCy, fyU)) : maxCy;
        frameOff[k] = { x: (fxU - mx) * FRAME_PULL, y: (fyU - my) * FRAME_PULL };
        /* for QA: the framing's inputs, readable off the DOM */
        frameOff[k].why = [Math.round(lo0Y), Math.round(hi0Y), Math.round(minCy), Math.round(maxCy),
                           Math.round(my), Math.round(ty), Math.round(nhh), blk ? Math.round(blk.y0) : null,
                           blk ? Math.round(blk.y1) : null, Math.round(visH)];
      });
      wrap.setAttribute("data-frame", JSON.stringify(frameOff.map(function(o){
        return [Math.round(o.x), Math.round(o.y)].concat(o.why || []);
      })));
    }

    /* ---- draw ------------------------------------------------------ */

    function setOp(el, op){
      if (op <= 0.005){
        if (el.style.display !== "none") el.style.display = "none";
        return;
      }
      if (el.style.display === "none") el.style.display = "";
      el.style.opacity = op.toFixed(3);
    }

    function drawMap(p, u){
      if (!W) return;   /* unmeasured (never-painted tab) — see measure() */
      /* Hero and map cross-dissolve over the SLIDE-IN (preNow — see
         the block comment where ?mapfade= used to live): the sheet
         rises from the fold turning opaque over the hero's mountains,
         and the backdrop settles to GHOST on the same value, so both
         are done the moment the section pins. It is the same country
         either way — mountains becoming the map of those mountains.
         With BG_GLOBAL on the ghost then rides the rest of the page. */
      var entry = preNow, exit = postNow;
      if (scene)
        scene.style.opacity =
          ((1 - entry * (1 - GHOST)) *
           (BG_GLOBAL ? 1 : 1 - cl((p - 0.88) / 0.12))).toFixed(3);
      wrap.style.opacity = (entry * (1 - exit)).toFixed(3);
      /* The seams (VEN, parts 10-11: "this is not smooth at all",
         "the same fade effect at the bottom"): uniform opacity cannot
         hide the sheet's GEOMETRIC edges — a hard line slid up the
         screen however transparent the sheet was. So the leading edge
         is FEATHERED during the entry (mask retreating as the section
         pins) with the hero's content fading in counterpoint, and the
         TRAILING edge mirrors it on the way out — the map dissolving
         down into the standing ghost landscape as the manifesto
         arrives. Gated on change, and the mask is REMOVED while the
         section is pinned — a mask on a viewport-sized layer is not
         something to leave standing per frame. */
      if (entry !== lastEnt || exit !== lastExit){
        lastEnt = entry; lastExit = exit;
        if (entry < 0.999){
          wrap.style.webkitMaskImage = wrap.style.maskImage =
            "linear-gradient(to bottom, transparent 0, #000 " +
            Math.round((1 - entry) * H * 0.9) + "px)";
        } else if (exit > 0.001){
          wrap.style.webkitMaskImage = wrap.style.maskImage =
            "linear-gradient(to top, transparent 0, #000 " +
            Math.round(exit * H * 0.9) + "px)";
        } else if (wrap.style.maskImage){
          wrap.style.webkitMaskImage = wrap.style.maskImage = "";
        }
        var heroOp = (1 - entry).toFixed(3);
        if (heroInner) heroInner.style.opacity = heroOp;
        if (heroCue)   heroCue.style.opacity = heroOp;
        /* the bottom-fixed chrome steps over the note band only while
           the band is actually standing — see --jnote-h in measure() */
        document.documentElement.classList.toggle(
          "has-jnote", entry > 0.5 && exit < 0.5);
      }

      var z = CAM === "follow" ? zoomOf(u)
            : CAM === "fixed" ? zFit : zPan;
      var walked = lenAt(u), px, py;

      if (CAM === "fixed"){
        px = 0.5 * camW; py = 0.5 * camH;
      } else {
        var pt = camAt(walked, u);
        px = pt.x / MW * camW; py = pt.y / MH * camH;
      }

      var tx = (CAM === "fixed" ? 0.5 : fx) * W - z * px,
          ty = (CAM === "fixed" ? 0.5 : fy) * H - z * py;
      /* Never let the sheet's edge inside the frame. Without this a
         stop near a margin pulls bare paper into view at full zoom,
         and the map stops reading as a sheet you are flying over.

         It BINDS on tall narrow screens, and that is expected rather
         than a bug to chase. Measured at 390x844: the sheet is 699px
         tall at scale 1, so at ZOOM_IN there are only ~105px of map
         above the first stop, and FOCUS_Y wants 279. The clamp wins,
         and the marker rides higher up the screen than at the middle
         stops. Every alternative is worse — a lower FOCUS_Y would have
         to be under 0.124 to avoid it, and the zoom would have to
         reach 4.9x. Covering the viewport matters more than hitting
         the focus point exactly. */
      tx = Math.min(0, Math.max(W - z * camW, tx));
      ty = Math.min(0, Math.max(H - z * camH, ty));

      cam.style.transform = "translate3d(" + tx.toFixed(1) + "px," +
        ty.toFixed(1) + "px,0) scale(" + z.toFixed(4) + ")";

      /* the road inks itself in behind you */
      inked.style.strokeDashoffset = (TOTAL - walked).toFixed(1);
      if (walker){
        var wp = pointAt(walked);
        walker.setAttribute("cx", wp.x.toFixed(1));
        walker.setAttribute("cy", wp.y.toFixed(1));
      }
      /* footprints vanish under the ink as they are walked, and come
         back on a scrub — incremental, see the build note */
      if (steps){
        while (stepIdx < steps.length && steps[stepIdx].len <= walked){
          steps[stepIdx].el.style.display = "none"; stepIdx++;
        }
        while (stepIdx > 0 && steps[stepIdx - 1].len > walked){
          stepIdx--; steps[stepIdx].el.style.display = "";
        }
      }

      var k;
      for (k = 0; k < N; k++){
        if (items[k].card){
          var dist = Math.abs(u - k);
          var op = cl((CARD_SPAN - dist) / (CARD_SPAN * 0.55));
          setOp(items[k].card, op);
          if (op > 0.005)
            items[k].card.style.transform =
              "translateY(" + ((1 - op) * CARD_RISE).toFixed(1) + "px)";
        }

        /* the vista fades up as you arrive and away as you leave; at
           u = k+0.5 both neighbours are fully gone (VSPAN < 0.5) */
        if (items[k].vista){
          var vd = Math.abs(u - k);
          var vop = cl((VSPAN - vd) / (VSPAN * 0.55));
          setOp(items[k].vista, vop);
          if (vop > 0.005)
            items[k].vista.style.transform =
              "translateY(" + ((1 - vop) * CARD_RISE).toFixed(1) + "px)";
        }

        /* the name writes in over the approach, ending at the stop.
           Guarded on change: masks re-rasterise their target when the
           mask mutates, so the offset is only touched while a write is
           actually in progress. */
        if (labels[k]){
          var wv = cl((walked - STOP_LEN[k] + WRITE_LEN) / WRITE_LEN);
          if (wv !== labels[k].lw){
            labels[k].lw = wv;
            if (wv <= 0){
              if (labels[k].g.style.display !== "none")
                labels[k].g.style.display = "none";
              if (labels[k].ge && labels[k].ge.style.display !== "none")
                labels[k].ge.style.display = "none";
              if (labels[k].gn && labels[k].gn.style.display !== "none")
                labels[k].gn.style.display = "none";
            } else {
              if (labels[k].g.style.display === "none")
                labels[k].g.style.display = "";
              if (labels[k].ge && labels[k].ge.style.display === "none")
                labels[k].ge.style.display = "";
              if (labels[k].gn && labels[k].gn.style.display === "none")
                labels[k].gn.style.display = "";
              labels[k].mp.style.strokeDashoffset =
                (labels[k].L * (1 - wv)).toFixed(1);
              /* the English writes on its own mask, starting once the
                 Korean is 60% down and finishing with the seal — a
                 hand that moves on to the caption, not two hands */
              /* ...and since 2026-08-27 the whole note writes on that
                 mask, so it starts earlier (half-way through the name)
                 and takes the rest of the approach */
              if (labels[k].emp)
                labels[k].emp.style.strokeDashoffset =
                  (labels[k].eL * (1 - cl((wv - 0.6) / 0.4))).toFixed(1);
              /* the note writes on its own mask, from half-way through
                 the name to the seal */
              if (labels[k].nmp)
                labels[k].nmp.style.strokeDashoffset =
                  (labels[k].nL * (1 - cl((wv - 0.45) / 0.55))).toFixed(1);
              /* THE COPY ARRIVES A LINE AT A TIME. VEN asked for *"some
                 sort of animation to fade in like watercolours almost"*
                 and then rejected the wash that came with it, so this
                 is what is left of it — and it is the better half. Each
                 line is a beat behind the one above, so the block reads
                 top to bottom the way it would be written, instead of
                 appearing whole. The hand writes the name, then the
                 note settles under it a line at a time.

                 Attributes only, and gated on change like everything
                 else in this loop: no filter, no blur, nothing that
                 re-rasterises per frame. */
              var cop = cl((wv - 0.62) / 0.38);
              if (labels[k].cg && cop !== labels[k].cw){
                labels[k].cw = cop;
                var ln = labels[k].lines, li2, stp = labels[k].step;
                for (li2 = 0; li2 < ln.length; li2++){
                  var lp = cl((cop - 0.18 - li2 * stp) / 0.45);
                  /* INLINE STYLE, not the `opacity` attribute it used to
                     be. css/site.css gave these elements a standing
                     opacity by class, and a class rule beats a
                     presentation attribute, so the attribute never
                     showed: every line stood at .78 from the moment the
                     group was displayed and the fade was never seen —
                     which §9z's "nobody has seen the line-by-line fade
                     in motion" was an honest account of. The standing
                     strengths are COPY_OP and CAP_OP now, multiplied in. */
                  ln[li2].style.opacity =
                    ((ln[li2].classList.contains("jmap__en") ? CAP_OP : COPY_OP) *
                     lp * lp * (3 - 2 * lp)).toFixed(3);
                }
              }
            }
          }
        }

        /* THE NARROW-SCREEN NOTE SHOWS ONE PLACE AT A TIME, and it
           cannot ride the writing value the way the sheet's copy does.
           `wv` saturates at 1 on arrival and stays there — correct for
           ink on a map, which is written once and stays written, and
           wrong for a strip where all four paragraphs are stacked at
           the same bottom edge: past the third stop you would be
           reading three notes printed over each other.

           So the strip is driven by DISTANCE along the road instead —
           u is in stop units, so |u - k| is how far this place is from
           the camera — and it fades out behind you as it fades in
           ahead. Cached, because this runs outside the change-guard
           above and would otherwise write a style every frame. */
        if (notes[k]){
          var nv = cl(1 - Math.abs(u - k) / NOTE_SPAN);
          var ns = (nv * nv * (3 - 2 * nv)).toFixed(3);
          if (notes[k]._o !== ns){ notes[k]._o = ns; notes[k].style.opacity = ns; }
        }

        /* the seal slams down over the last stretch of the approach */
        var st = cl((walked - STOP_LEN[k] + STAMP_OVER) / STAMP_OVER);
        var e  = smooth(st);
        items[k].seal.style.opacity = e.toFixed(3);
        items[k].seal.setAttribute("transform",
          "rotate(" + ((1 - e) * -14).toFixed(2) + ") scale(" +
          (1 + (1 - e) * 0.75).toFixed(3) + ")");
        items[k].x.style.opacity = (0.45 * (1 - e)).toFixed(3);
      }
    }

    function progressOf(){
      var rect = journey.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      return total <= 0 ? 0 : cl(-rect.top / total);
    }
    /* how far the section's top has climbed the viewport: 0 with its
       edge at the fold, 1 once pinned. The entry dissolve rides this,
       not p — p is clamped at 0 for that whole stretch, which is what
       used to scroll a blank screen past (VEN's screenshot, part 9).
       Only changes with real scroll, so it is sampled in the scroll
       handlers and read by drawMap, never computed per rAF frame. */
    var preNow = 0, postNow = 0;
    function preOf(){
      var top = journey.getBoundingClientRect().top;
      return top <= 0 ? 1 : cl(1 - top / window.innerHeight);
    }
    /* the exit mirror (part 11, VEN: "the same fade effect at the
       bottom"): how far the section's BOTTOM has climbed the viewport
       after unpinning — 0 while pinned, 1 once the journey has left.
       The map fades down into the standing ghost landscape with its
       trailing edge feathered, exactly the entry played backwards. */
    function postOf(){
      var b = journey.getBoundingClientRect().bottom;
      return b >= window.innerHeight ? 0 : cl(1 - b / window.innerHeight);
    }

    /* ---- the scroll drive -------------------------------------------
       Two systems, one draw path. Both end at drawMap(p, u).

       STEP (default): the section divides into N equal bands of
       scroll, one per stop. Scrolling only decides WHICH band you are
       in; crossing a boundary starts a TWEEN — smooth()-eased, on the
       rAF clock, DUR·sqrt(legs) ms — from wherever the camera is to
       the new stop. The wheel cannot perturb a journey in flight; it
       can only retarget it, and a retarget re-plans from the current
       position, so overshooting three thresholds in one hard scroll
       reads as one longer journey rather than three queued ones.

       CONTINUOUS (?step=0, and always for ?cam=pan/fixed): the part-3
       behaviour, kept whole — scroll maps to u through timelineU and
       the exponential glide melts the wheel steps.

       The `inLoop` guard in both loops is for QA, not visitors: §7's
       rAF patch makes requestAnimationFrame SYNCHRONOUS, which would
       make a self-scheduling loop infinitely recursive. Re-entry is
       answered by snapping to the target — a patched tab converges in
       one scroll dispatch and stays deterministic. */
    var STEPPING = STEP && CAM === "follow";
    var curP = 0, curU = -1, raf = 0, inLoop = false;

    /* -- step mode -- */
    var stopAt = -1, tw = null;
    function tick(now){
      raf = 0;
      if (!tw) return;
      if (inLoop){ curU = tw.to; tw = null; drawMap(curP, curU); return; }
      var f = cl((now - tw.t0) / tw.dur);
      curU = tw.from + (tw.to - tw.from) * smooth(f);
      var done = f >= 1;
      if (done){ curU = tw.to; tw = null; }
      inLoop = true;
      drawMap(curP, curU);
      if (!done) raf = requestAnimationFrame(tick);
      inLoop = false;
    }
    function stepScroll(){
      curP = progressOf();
      preNow = preOf(); postNow = postOf();
      var ts = Math.round(curP * (N - 1));
      if (curU < 0){                       /* first draw: land settled */
        stopAt = ts; curU = ts; drawMap(curP, curU); return;
      }
      if (ts !== stopAt){
        stopAt = ts;
        tw = { from: curU, to: ts, t0: performance.now(),
               dur: DUR * Math.sqrt(Math.max(0.25, Math.abs(ts - curU))) };
        if (!raf) raf = requestAnimationFrame(tick);
      }
      /* between thresholds only the entry fade can change — cheap */
      if (!tw) drawMap(curP, curU);
    }

    /* -- continuous mode -- */
    var target = 0, lastT = 0;
    function glide(now){
      raf = 0;
      if (inLoop){ curP = target; drawMap(curP, uOf(curP)); return; }
      var dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000));
      lastT = now;
      curP += (target - curP) * (1 - Math.exp(-GLIDE * dt));
      var done = Math.abs(target - curP) < 0.0003;
      if (done) curP = target;
      inLoop = true;
      drawMap(curP, uOf(curP));
      if (!done) raf = requestAnimationFrame(glide);
      inLoop = false;
    }
    function uOf(p){
      return CAM === "follow" ? timelineU(p) : p * (N - 1);
    }
    function glideScroll(){
      target = progressOf();
      preNow = preOf(); postNow = postOf();
      if (GLIDE <= 0 || curU < 0){
        curP = target; curU = 0;   /* mark initialised */
        drawMap(curP, uOf(curP)); return;
      }
      if (!raf){ lastT = performance.now(); raf = requestAnimationFrame(glide); }
    }

    function onScroll(){
      /* A tab that has never been painted (background-created — MCP
         tabs do this) can lay out at width 0, which bakes a 0px camera
         into measure(). No resize fires when it first paints, so
         re-measure lazily the moment we see it. */
      if (!W) measure();
      if (STEPPING) stepScroll(); else glideScroll();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function(){
      measure(); curU = -1; tw = null; onScroll();
    });
    /* first activation of a background-opened tab: layout arrives but
       no resize fires, so the 0x0 bail in measure() would otherwise
       stand until the visitor happens to scroll */
    document.addEventListener("visibilitychange", function(){
      if (!document.hidden && !W){ measure(); curU = -1; tw = null; onScroll(); }
    });
    /* the display face arrives after first paint: the phone block was
       re-flowed against the fallback's widths, so measure again once
       it is here (same as road mode's caption remeasure) */
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(function(){ measure(); curU = -1; tw = null; onScroll(); });
    measure();
    onScroll();
  }

  if (JOURNEY_MODE === "map"){ buildMap(); return; }
  if (JOURNEY_MODE === "split"){ buildSplit(); return; }

  /* ---- projection (from the reference) -------------------------- */

  var F = 700, DF = 3000, DN = 130, TRAVEL = 3150;
  var VW = 640;                        // fixed world width; height follows aspect
  var CX = VW / 2, VH = 420, HZ = 100, GY = 62;
  var AS = 1;                          // art scale: shrinks panels on short viewports
  var LS = 1;                          // label scale: bigger captions on phones
  var L = Math.log(DF) - Math.log(DN);

  function scale(d){ return F / d; }
  function cl(a){ return a < 0 ? 0 : a > 1 ? 1 : a; }

  function worldX(d){
    var u   = (Math.log(DF) - Math.log(Math.max(d, DN))) / L,
        phi = u * 3.4 * Math.PI,
        amp = 95 * Math.min(1, Math.pow(d / 700, 0.6));
    return amp * (Math.sin(phi) + 0.28 * Math.sin(2.7 * phi + 1.1)) / 1.2;
  }

  /* side offset shrinks a little on narrow screens so panels stay on */
  function sideOffset(){
    var narrow = window.innerWidth < 640;
    return narrow ? 168 : 230;
  }

  /* ---- panels are built ONCE; draw() only touches attributes ------ */

  var sticky = journey.querySelector(".journey__sticky");
  var scene = document.querySelector(".scene-backdrop");
  var lastOrder = "";

  var panels = SPOTS.map(function(sp){
    var g = document.createElementNS(NS, "g");
    g.innerHTML = artOf(sp);
    settleArt(g, sp);
    var name = document.createElementNS(NS, "text");
    name.setAttribute("text-anchor", "middle");
    name.setAttribute("font-family", "Song Myung, serif");
    name.setAttribute("fill", INK);
    name.textContent = sp.name;
    var ko = document.createElementNS(NS, "text");
    ko.setAttribute("text-anchor", "middle");
    ko.setAttribute("font-family", "Gowun Batang, serif");
    ko.setAttribute("fill", "#4E4636");
    ko.textContent = sp.ko;
    return { sp: sp, g: g, name: name, ko: ko };
  });

  /* Half the on-screen width of a panel's name, measured once per
     label per label-scale. At phone widths a passing panel drifts off
     the edge and an unclamped caption gets cut in half, so draw()
     needs to know how wide the text actually is. Measuring forces a
     layout, hence the cache; the fonts arrive async, so the cache is
     dropped once they do. */
  function halfLabel(pn){
    if (pn.hwLS !== LS){
      var w = 0;
      try { w = pn.name.getComputedTextLength(); } catch (e){}
      if (w > 0){ pn.hw = w / 2; pn.hwLS = LS; }
    }
    return pn.hw || 0;
  }

  /* road reveal via a native SVG clipPath (CSS clip-path on SVG
     elements is unreliable in WebKit) */
  var defsEl = document.createElementNS(NS, "defs");
  defsEl.innerHTML = '<clipPath id="jRoadClip"><rect id="jRoadClipRect" x="0" y="0" width="640" height="0"/></clipPath>';
  stage.appendChild(defsEl);
  gRoad.setAttribute("clip-path", "url(#jRoadClip)");
  var roadClipRect = document.getElementById("jRoadClipRect");

  /* ---- road + mist, rebuilt on resize --------------------------- */

  /* ---- the road -------------------------------------------------

     A single hairline stroke read as a wire laid over the landscape,
     not as something you could walk. It is now a ribbon with real
     width: the road has a constant world half-width, so its edges are
     just `worldX ± ROAD_W` pushed through the same projection as
     everything else, and the perspective taper falls out for free.

     Modes, switchable with ?road= :
       path   (default) a trodden footpath — pale worn fill, two ink
              edges, flagstones once they are big enough to read
       river  the same ribbon as water: pine wash and ripple lines
       line   the original hairline, kept as the way back

     A note before picking `river`: village.js has the road ARRIVE at
     the village and fork into footpaths between the front houses, and
     §2's brief calls it a road/footpath. A river would break that
     continuity and village.js would need rethinking with it.

     Widths are per-chunk, same trick as the original: an SVG stroke
     cannot taper, so each edge is 6 chained polylines of increasing
     width. Built on resize only, never per frame. */

  var ROAD_MODE = (function(){
    var m = /[?&]road=([a-z]+)/i.exec(location.search);
    return m ? m[1].toLowerCase() : "path";
  })();
  var ROAD_W = qs("roadw", 30);        /* half-width, world units */
  /* Flagstone opacity, default OFF. Over a painted landscape they read
     as cloud shadows or puddles rather than stone — the plain worn path
     is the cleaner, more expensive-looking read. Kept as a knob because
     they may earn their place on a flatter background: ?stones=.07 */
  var STONE_OP = qs("stones", 0);

  function roadSamples(){
    var pts = [], i, d, k, wx;
    for (i = 0; i <= 90; i++){
      d  = DF * Math.pow(DN / DF, i / 90);
      k  = scale(d);
      wx = worldX(d);
      pts.push({ k: k, y: HZ + GY * k,
                 cx: CX + wx * k,
                 lx: CX + (wx - ROAD_W) * k,
                 rx: CX + (wx + ROAD_W) * k });
    }
    return pts;
  }

  /* one edge, tapered from w0 at the horizon to w1 at your feet */
  function edge(pts, key, w0, w1, op){
    var s = "", c, a, b, j, dd;
    for (c = 0; c < 6; c++){
      a = c * 15; b = Math.min(90, a + 15);
      dd = "M " + pts[a][key].toFixed(1) + " " + pts[a].y.toFixed(1);
      for (j = a + 1; j <= b; j++)
        dd += " L " + pts[j][key].toFixed(1) + " " + pts[j].y.toFixed(1);
      s += '<path d="' + dd + '" fill="none" stroke="' + INK +
           '" stroke-opacity="' + op + '" stroke-width="' +
           (w0 + c * (w1 - w0) / 5).toFixed(2) + '" stroke-linecap="round"/>';
    }
    return s;
  }

  /* the surface between the two edges */
  function ribbon(pts){
    var dd = "M " + pts[0].lx.toFixed(1) + " " + pts[0].y.toFixed(1), i;
    for (i = 1; i <= 90; i++) dd += " L " + pts[i].lx.toFixed(1) + " " + pts[i].y.toFixed(1);
    for (i = 90; i >= 0; i--) dd += " L " + pts[i].rx.toFixed(1) + " " + pts[i].y.toFixed(1);
    return dd + " Z";
  }

  /* Flagstones. Depth is sampled logarithmically, so a fixed index step
     puts them far apart on screen near you and crowded near the
     horizon: step wide, drop anything under ~2px (it reads as dirt on
     the lens, not stone), and nudge alternate stones off-centre so the
     line of them does not look machined. Sized well under ROAD_W so
     the path still shows around them — at 10*k they overlapped into a
     stack of discs. */
  function stones(pts){
    if (STONE_OP <= 0) return "";
    var s = "", i, p, rx, ry, off;
    for (i = 90; i >= 0; i -= 5){
      p = pts[i];
      rx = 5.5 * p.k; ry = 2.0 * p.k;
      if (rx < 2) continue;
      off = (i % 10 ? 1 : -1) * 3.2 * p.k;
      s += '<ellipse cx="' + (p.cx + off).toFixed(1) + '" cy="' + p.y.toFixed(1) +
           '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) +
           '" fill="' + INK + '" fill-opacity="' + STONE_OP + '"/>';
    }
    return s;
  }

  function ripples(pts){
    var s = "", i, p, w;
    for (i = 88; i >= 0; i -= 3){
      p = pts[i];
      w = 15 * p.k;
      if (w < 2.5) continue;
      s += '<path d="M' + (p.cx - w).toFixed(1) + " " + p.y.toFixed(1) +
           " q" + w.toFixed(1) + " " + (-2.4 * p.k).toFixed(1) + " " + (2 * w).toFixed(1) + ' 0"' +
           ' fill="none" stroke="' + INK + '" stroke-opacity=".2" stroke-width="' +
           Math.max(0.6, 0.45 * p.k).toFixed(2) + '"/>';
    }
    return s;
  }

  function buildRoad(){
    var pts = roadSamples(), s;
    if (ROAD_MODE === "line"){
      s = edge(pts, "cx", 1.3, 3.4, 1);
    } else if (ROAD_MODE === "river"){
      s  = '<path d="' + ribbon(pts) + '" fill="' + PINE + '" fill-opacity=".26"/>';
      s += ripples(pts);
      s += edge(pts, "lx", 0.8, 2.0, 0.5) + edge(pts, "rx", 0.8, 2.0, 0.5);
    } else {
      s  = '<path d="' + ribbon(pts) + '" fill="' + PAPER + '" fill-opacity=".40"/>';
      s += stones(pts);
      s += edge(pts, "lx", 0.9, 2.4, 0.7) + edge(pts, "rx", 0.9, 2.4, 0.7);
    }
    gRoad.innerHTML = s;
  }

  function resize(){
    var w = journey.clientWidth || window.innerWidth;
    /* the svg fills the sticky (100svh), not window.innerHeight — on
       iOS these differ while the URL bar collapses */
    var h = (sticky && sticky.clientHeight) || window.innerHeight;
    VH = Math.round(VW * h / Math.max(1, w));
    HZ = Math.round(VH * 0.24);
    GY = Math.round(VH * 0.15);
    /* 494 is the old 420 rescaled for the taller square box
       (200/494 === 170/420), so a painting still reaches the on-screen
       size the projection was tuned for. It is not cosmetic: the panel
       box is anchored by its BOTTOM edge, so the taller it is the
       sooner its top runs off the sticky. At 420 a near painting lost
       ~27% of its top while still at full opacity — invisible with the
       old transparent line art, obvious on a framed painting. Some
       clipping at very close range is inherent to the projection;
       this keeps each painting whole through its largest clean moment
       (~38% of viewport height) instead of cutting it before then. */
    AS = Math.min(1, VH / 494);
    stage.setAttribute("viewBox", "0 0 " + VW + " " + VH);

    /* labels keep a readable on-screen size on narrow viewports;
       never below 1 so desktop keeps its full-size captions. draw()
       spaces the two lines by the same factor, or they collide once
       the type grows. */
    LS = Math.min(2, Math.max(1, 640 / Math.max(340, w)));
    panels.forEach(function(pn){
      pn.name.setAttribute("font-size", (13.5 * LS).toFixed(1));
      pn.ko.setAttribute("font-size", (11.5 * LS).toFixed(1));
    });

    buildRoad();
    lastP = -1;   // force redraw
  }

  /* ---- per-frame draw ------------------------------------------- */

  var lastP = -1;

  function draw(p){
    var off = p * TRAVEL;

    /* start fading the heading just before the paintings arrive, so the
       two never share the top of the screen */
    journey.classList.toggle("is-under-way", p > 0.02);

    var enter = cl((p - ENTER_AT) / ENTER_OVER);

    /* road grows from the horizon toward the viewer */
    roadClipRect.setAttribute("height", (VH * Math.min(1, p * 1.3)).toFixed(1));

    /* the shared landscape (when present) holds until the journey ends,
       then fades so the rest of the page sits on plain paper — to a
       floor of GHOST instead of 0 under ?bg=global, same deal as split
       mode: road mode has no ghost of its own, so the global backdrop
       arrives by fading down to one */
    if (scene) scene.style.opacity =
      p > 0.86 ? String(Math.max(BG_GLOBAL ? GHOST : 0, (1 - p) / 0.14)) : "1";

    var so = sideOffset();

    var sorted = panels
      .map(function(pn){ return { pn: pn, d: pn.sp.d0 - off }; })
      .sort(function(a, b){ return b.d - a.d; });         // painter's algorithm

    /* re-append only when depth order flips. Each panel's labels go in
       right behind it, so a near painting occludes a far caption —
       with real art on the panels, globally-on-top labels read as
       text floating over the picture. */
    var order = sorted.map(function(it){ return it.pn.sp.d0; }).join(",");
    if (order !== lastOrder){
      lastOrder = order;
      sorted.forEach(function(it){
        gImgs.appendChild(it.pn.g);
        gImgs.appendChild(it.pn.name);
        gImgs.appendChild(it.pn.ko);
      });
    }

    sorted.forEach(function(it){
      var pn = it.pn, d = it.d;
      var op = d < 145 ? 0 : Math.min(cl((3500 - d) / 400), cl((d - 165) / 320)) * enter;

      if (op <= 0.01){
        pn.g.setAttribute("display", "none");
        pn.name.setAttribute("display", "none");
        pn.ko.setAttribute("display", "none");
        return;
      }

      var k  = scale(d),
          x  = CX + (worldX(d) + pn.sp.s * so) * k,
          gy = HZ + GY * k,
          lo = op * cl((d - 460) / 260) * cl((2700 - d) / 520),
          ka = k * AS;

      pn.g.removeAttribute("display");
      pn.g.setAttribute("opacity", op.toFixed(2));
      pn.g.setAttribute("transform", "translate(" +
        (x - AW / 2 * ka).toFixed(1) + " " + (gy - AH * ka).toFixed(1) +
        ") scale(" + ka.toFixed(3) + ")");

      if (lo > 0.02){
        pn.name.removeAttribute("display");
        pn.ko.removeAttribute("display");

        /* both lines share one centre so they stay stacked, held
           inside the stage so the caption is never half off-screen */
        var hw = halfLabel(pn), lx = x;
        if (hw > 0 && VW > 2 * (hw + 8))
          lx = Math.min(Math.max(x, hw + 8), VW - hw - 8);

        pn.name.setAttribute("x", lx.toFixed(1));
        pn.name.setAttribute("y", (gy + 22 * LS).toFixed(1));
        pn.name.setAttribute("opacity", lo.toFixed(2));
        pn.ko.setAttribute("x", lx.toFixed(1));
        pn.ko.setAttribute("y", (gy + 39 * LS).toFixed(1));
        pn.ko.setAttribute("opacity", (lo * 0.85).toFixed(2));
      } else {
        pn.name.setAttribute("display", "none");
        pn.ko.setAttribute("display", "none");
      }
    });
  }

  /* ---- scroll wiring -------------------------------------------- */

  function progress(){
    var rect = journey.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    return cl(-rect.top / total);
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      ticking = false;
      var p = progress();
      if (Math.abs(p - lastP) < 0.0004) return;
      lastP = p;
      draw(p);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function(){ resize(); onScroll(); });

  /* the display font arrives after first paint — remeasure the
     captions once it does, or they stay clamped to fallback widths */
  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){
      panels.forEach(function(pn){ pn.hwLS = -1; });
      lastP = -1;
      onScroll();
    });
  }

  resize();
  draw(progress());

})();
