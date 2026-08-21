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
  var SPOTS = [
    { d0: 1150, s: -1, name: "Gyeongbokgung Palace",   ko: "경복궁",  img: "art/gyeongbokgung.png", art: gate(),
      blurb: "The palace of shining happiness. Six centuries of court and quiet, burned and raised again, still facing the mountain it was built to answer." },
    { d0: 1900, s:  1, name: "Changdeokgung Palace",   ko: "창덕궁",  img: "art/changdeokgung.png", art: hall(),
      blurb: "Built to follow the land rather than flatten it. Its rear garden was kept for the king alone, and the trees there are older than the hands that planted them." },
    { d0: 2650, s: -1, name: "Namsangol Hanok Village",ko: "남산골",  img: "art/namsangol.png",     art: hanoks(),
      blurb: "Five houses carried stone by stone from across the city and set down together beneath the south mountain, so the old way of living would have somewhere to stand." },
    { d0: 3500, s:  1, name: "Jeonju Hanok Village",   ko: "전주",    img: "art/jeonju.png",        art: village(),
      blurb: "Eight hundred roofs held in one valley — the largest hanok village left, and the only one where someone still lives behind every door." }
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
      /* [x, y, labelX, labelY, captionX, captionY] — the last pair is
         the ENGLISH caption's anchor, centred under the landmark's
         ground wash (part 13, VEN's red lines) */
      stops: [[0.340, 0.120, 0.396, 0.136, 0.507, 0.182],
              [0.492, 0.360, 0.410, 0.329, 0.410, 0.453],
              [0.624, 0.601, 0.368, 0.632, 0.493, 0.694],
              [0.372, 0.857, 0.326, 0.872, 0.465, 0.942]]
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
  /* share of the road's total length over which a name writes — the
     window ENDS at the stop, so the last character lands exactly as
     the seal stamps */
  var WRITE = qs("write", 0.085);
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
    return m ? m[1].toLowerCase() : "foot";
  })();
  /* strength of the paper veil that seats the sheet on our paper. This
     is the job .scene-backdrop does with mix-blend-mode on the image
     itself, which the camera makes impossible here — see the long note
     on .jmap__sheet in css/site.css. 0 shows the sheet untouched. */
  var MAP_TONE = qs("maptone", 0.16);


  function buildMap(){
    var sheet = MAPS[MAP_SHEET] || MAPS.ink;
    var N = SPOTS.length;

    journey.classList.add("journey--map");
    if (stage) stage.remove();
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
      '<div class="jmap__cam">' +
        '<img class="jmap__sheet" src="' + sheet.img + '" alt="" decoding="async">' +
        '<svg class="jmap__ink" viewBox="0 0 ' + MW + " " + MH.toFixed(1) +
          '" preserveAspectRatio="none" aria-hidden="true">' +
          (TRAIL === "dots"
            ? '<path class="jmap__road" d="' + ROAD_D + '"/>'
            : '<g class="jmap__steps"></g>') +
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
      /* the eyebrow is the one piece of chrome left: section identity,
         pinned to the corner, outside the camera */
      '<p class="eyebrow jmap__eyebrow"><span lang="ko">여정</span> · the journey</p>' +
      (INFO ? '<div class="jmap__cards"><div class="jmap__stops"></div></div>' : "");
    sticky.appendChild(wrap);

    var cam    = wrap.querySelector(".jmap__cam"),
        inked  = wrap.querySelector(".jmap__inked"),
        walker = wrap.querySelector(".jmap__walker"),
        marks  = wrap.querySelector(".jmap__marks"),
        labHost = wrap.querySelector(".jmap__labels"),
        vHost  = wrap.querySelector(".jmap__vistas"),
        host   = wrap.querySelector(".jmap__stops");

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
    function camAt(len, u){
      if (CAMS <= 0) return pointAt(len);
      var t = cl(len / TOTAL) * SAMP, i0 = Math.floor(t), f = t - i0;
      var a = camSamples[i0], b = camSamples[Math.min(SAMP, i0 + 1)];
      var sm = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      /* pull onto the true road point on approach: 1 within 0.10 of a
         stop, released fully by 0.30 into the leg */
      var dist = Math.abs(u - Math.round(u));
      var w = 1 - smooth(cl((dist - 0.10) / 0.20));
      if (w <= 0) return sm;
      var tr = pointAt(len);
      return { x: sm.x + (tr.x - sm.x) * w, y: sm.y + (tr.y - sm.y) * w };
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
        e2.setAttribute("rx", "1.9");
        e2.setAttribute("ry", "3.4");
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
         move, and the same stamp the hero title ends on. 韓 is the
         seal glyph everywhere (§4) and a marker IS a stamp, so this is
         the one place seal red is allowed outside the hero/footer. */
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "jmap__mark");
      g.setAttribute("transform", "translate(" + (s[0] * MW).toFixed(1) +
                     " " + (s[1] * MH).toFixed(1) + ")");
      g.innerHTML =
        '<g class="jmap__x"><path d="M-11 -11 L11 11"/><path d="M11 -11 L-11 11"/></g>' +
        '<g class="jmap__seal">' +
          '<rect x="-15" y="-15" width="30" height="30" rx="5"/>' +
          '<text x="0" y="8">韓</text>' +
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
          labHost.appendChild(ge);
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
      var dist = Math.abs(u - Math.round(u));   /* 0 at a stop, .5 mid-leg */
      return zIn + (zOut - zIn) *
        smooth(cl((dist - ZHOLD * 0.5) / (0.5 - ZHOLD * 0.5)));
    }

    function lenAt(u){
      var k = Math.floor(u), f = u - k;
      if (k >= N - 1) return STOP_LEN[N - 1];
      if (k < 0) return STOP_LEN[0];
      return STOP_LEN[k] + (STOP_LEN[k + 1] - STOP_LEN[k]) * f;
    }

    /* ---- sizing, on resize only ------------------------------------ */

    var W = 0, H = 0, camW = 0, camH = 0, zIn = ZOOM_IN, zOut = ZOOM_OUT,
        zPan = ZOOM_PAN, zFit = 1, fx = FOCUS_X, fy = FOCUS_Y;

    function measure(){
      W = sticky.clientWidth; H = sticky.clientHeight;
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
      var cover = Math.max(1, H / camH);
      zOut = Math.max(ZOOM_OUT, cover);
      zIn  = Math.max(ZOOM_IN,  zOut * 1.35);
      zPan = Math.max(ZOOM_PAN, cover);
      zFit = Math.max(H / camH, 0.05);   /* ?cam=fixed: whole sheet */

      /* Phones: the vista (or ?info=1's card) is along the bottom, so
         the place you have arrived at goes above it; with neither
         there is nothing to clear and the marker stays centred. */
      var narrow = W <= 860;
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
      var lq = want / (unit * LSIZE);
      labels.forEach(function(lb){
        var tx = lb.ax != null ? lb.ax : lb.sx + lb.side * (23 + lq * lb.hw),
            ty = lb.ay != null ? lb.ay : lb.sy;
        lb.g.setAttribute("transform",
          "translate(" + tx.toFixed(1) + " " + ty.toFixed(1) +
          ") scale(" + lq.toFixed(3) + ")");
        if (lb.ge){
          /* under the building when the sheet carries an anchor,
             under the column otherwise */
          var etx = lb.ex != null ? lb.ex : tx,
              ety = lb.ey != null ? lb.ey : ty + lq * lb.efy;
          lb.ge.setAttribute("transform",
            "translate(" + etx.toFixed(1) + " " + ety.toFixed(1) +
            ") scale(" + lq.toFixed(3) + ")");
        }
      });
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
            } else {
              if (labels[k].g.style.display === "none")
                labels[k].g.style.display = "";
              if (labels[k].ge && labels[k].ge.style.display === "none")
                labels[k].ge.style.display = "";
              labels[k].mp.style.strokeDashoffset =
                (labels[k].L * (1 - wv)).toFixed(1);
              /* the English writes on its own mask, starting once the
                 Korean is 60% down and finishing with the seal — a
                 hand that moves on to the caption, not two hands */
              if (labels[k].emp)
                labels[k].emp.style.strokeDashoffset =
                  (labels[k].eL * (1 - cl((wv - 0.6) / 0.4))).toFixed(1);
            }
          }
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
