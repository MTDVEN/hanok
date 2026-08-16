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
      fig.innerHTML =
        '<svg viewBox="-10 -10 ' + (AW + 20) + " " + (AH + 20) +
        '" aria-hidden="true">' + artOf(sp) + "</svg>" +
        "<figcaption>" + sp.name + ' · <span lang="ko">' + sp.ko + "</span></figcaption>";
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

  var JOURNEY_MODE = (function(){
    var m = /[?&]journey=([a-z]+)/i.exec(location.search);
    return m ? m[1].toLowerCase() : "split";
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
  /* 1b. ?bg=global — the ghost never leaves AT ALL: the backdrop rides
        at GHOST strength down the village, manifesto and ledger
        instead of reaching 0 at the journey's end. VEN's proposal for
        the blank lower half of the page, 2026-08-16: *"make the
        background global so i can see what it looks like in the
        village section."* The default is unchanged — the fade-out
        comment in drawSplit still holds when this is off. Pairs with
        ?ghost=N to try the standing strength. */
  var BG_GLOBAL = /[?&]bg=global/i.test(location.search);
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

  var NS = "http://www.w3.org/2000/svg";
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
