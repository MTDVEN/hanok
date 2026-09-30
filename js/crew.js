/* ================================================================
   CREW — Zico's villagers on the heading. A TEST (branch crew-test).

   Zico, 2026-09-29: *"add some of the same characters on X around the
   heading. some building the header, some sitting at the top with
   laptops, some transporting tiles around."* VEN, 2026-09-30, having
   compared the two styles: *"Repainting in the site's ink is a must,
   then we can adjust the position and quantity of them later on."*
   Zico, 2026-09-30, on the first cut: the characters too big and the
   lettering too small; tiles must land ON something, never mid-air;
   the carriers should *"walk up to the guy on the ladder, add to a
   pile of tiles at the bottom of the ladder and then walk back off
   frame (where they rendered in from)"*.

     ?crew=ink     the crew, in ink: four laptop-sitters and two tile
                   carriers who deliver to a pile at the foot of the
                   building site
     ?crew=x       the laptop-sitters only, as painted on @tilesonGIWA
     ?cast=sit,carry,build   which groups (default sit,carry — the
                   builders wait to be redrawn for the new font; `build`
                   still shows the first ones)
     ?crewsize=N   people's size as the seated height's fraction of the
                   letters' height (default 0.42; 0.55 on phones, where
                   0.42 leaves a head ~3.5px)
     ?relay=1      carriers take turns, never crossing (default: they
                   pass each other on the way)
     ?carryplane=front   carriers and pile in front of the letters
                   (default: behind, so $TILES stays whole)
     ?crewt=S      freeze the scene at S seconds (QA screenshots)

   THE SCENE IS DATA — every villager is one line of SCENE, every
   delivery parameter one line of DELIVERY.

   HOW THEY MOVE. Each figure is one strip of frames (art/crew/<set>-
   <n>.webp, cut by tools/crew.html) set as the BACKGROUND of a one-
   frame box and stepped across it; a mirror is scaleX(-1) on that box.
   Sitters loop by CSS; carriers are driven frame by frame from one
   clock (deliver()). Everything runs only while the hero is on screen;
   under reduced motion nobody moves.

   WHERE THEY STAND is measured off the INK, not the letters' boxes:
   js/hero.js rasterises the title and answers topAt / profile / inkIn
   (a box top is the highest point of a letter — the $'s stem tip — and
   a figure pinned to it floats over the curve below). Figures rest on
   the highest ink under their contact span, sunk SINK units into it
   (a 1px gap reads as floating, an overlap reads as resting), sliding
   to the flattest spot nearby when the surface slopes.

   SCALE. Every set is drawn at ONE human scale: a figure's height in
   svg units is its height in the clip × HEAD / (head height in that
   clip). HEAD_PX was measured off each set's still.
================================================================= */

(function(){
  "use strict";

  var q = location.search;
  var m = /[?&]crew=(x|ink)\b/.exec(q);
  if (!m) return;
  var STYLE = m[1];
  var castQ = /[?&]cast=([a-z,]+)/.exec(q);
  var CAST  = castQ ? castQ[1].split(",") : ["sit", "carry"];
  if (STYLE === "x") CAST = ["sit"];
  var PHONE = !!(window.matchMedia && window.matchMedia("(max-width: 560px)").matches);
  var sizeQ = /[?&]crewsize=([0-9.]+)/.exec(q);
  var SIZE  = sizeQ ? Math.min(1.5, Math.max(0.2, +sizeQ[1])) : (PHONE ? 0.55 : 0.42);
  var RELAY = /[?&]relay=1\b/.test(q);
  var FRONT = /[?&]carryplane=front\b/.test(q);
  var tQ    = /[?&]crewt=([0-9.]+)/.exec(q);
  var FIXED_T = tQ ? +tQ[1] : null;

  var hero  = document.getElementById("hero"),
      mount = document.getElementById("heroTitle"),
      H     = window.HANOK_HERO;
  if (!hero || !mount || !H) return;
  var reduced = window.HANOK_REDUCED();
  var DIR = "art/crew/";

  /* head height (hair to chin) in clip pixels, per set, read off each
     set's still — what makes a kneeling worker and a laptop-sitter
     come out the same size of person */
  var HEAD_PX = { ink: 67, x: 67, build: 60, carry: 62 };
  /* every carrier clip (loaded, unloaded, drop-off) was built from the
     carriers' still at one scale, so they share one clip-frame scale */
  var CARRY_HEAD_PX = HEAD_PX.carry;
  /* the laptop-sitter VEN approved was 0.62 of the T tall with a 67px
     head in a 467px figure: HEAD = SIZE × cap × (67 / 467) */
  var HEAD_OF_SIT = 67 / 467;
  /* how far a contact sinks into the ink: the rough brush edge wanders
     ±1.7 units, and an overlap reads as resting where a gap floats */
  var SINK = 1.5;

  /* ---- THE SCENE ------------------------------------------------
     kind "sit"   — seated on the ink under the letter: `at` is how far
                    across the letter (0 = its left, 1 = its right).
     kind "stand" — pinned by ONE point of its strip (ax, ay: fractions
                    of the frame, after `flip`) to a point of the letter
                    (lx, ly: fractions of its box) + dx, dy; with
                    `rest: true` the point rests on the ink under it.
     `ch` is matched case-insensitively.
  ------------------------------------------------------------------ */
  var SCENE = [
    { group: "sit", set: STYLE, fig: 4, kind: "sit", ch: "$", at: 0.72 },
    { group: "sit", set: STYLE, fig: 1, kind: "sit", ch: "T", at: 0.5 },
    { group: "sit", set: STYLE, fig: 2, kind: "sit", ch: "I", at: 0.5 },
    { group: "sit", set: STYLE, fig: 3, kind: "sit", ch: "S", at: 0.5 },

    /* the FIRST builders, kept for comparison (?cast=...,build). They
       are to be redrawn once the new font is chosen: the ladder is too
       short at the new size and both lay their tile on thin air. */
    { group: "build", set: "build", fig: 1, kind: "stand", flip: true,
      ax: 0.105, ay: 0.163, ch: "L", lx: 0.2, ly: 0.07 },
    { group: "build", set: "build", fig: 2, kind: "stand", rest: true,
      ax: 0.5, ay: 0.93, ch: "E", lx: 0.55, ly: 0 }
  ];

  /* ---- THE DELIVERY ----------------------------------------------
     site     where the pile goes. "auto": every stretch of the ground
              line with no ink on it (measured on the title's own raster)
              that is wide enough for the pile is a candidate, the pile
              at its RIGHT end (the carrier crouches to its left, and the
              new ladder will stand just right of it). The winner is the
              one where the least ink covers the carriers while they
              crouch there — clear ground is not enough: in Song Myung
              the widest bay put the whole delivery behind the $. For
              the brush $TILES it is the bay under the T's right arm.
     paceIn/paceOut  body-heights per second, MEASURED off each strip
              (steps × stride): loaded 0.52 / 0.60, unloaded 0.63 /
              0.74. Any other speed makes the feet skate.
     stage    the drop clip's layout (art/crew/<stage>.stage.json):
              where the carrier and the pile sit in its frame.
  ------------------------------------------------------------------ */
  var DELIVERY = {
    group: "carry",
    site: "auto",
    fade: 0.5,                   // body heights to fade in / out over
    rest: 1.5,                   // seconds of nobody-in-sight per round
    swap: 1.0,                   // s: one clip's pile hands over to the next's
    reset: 4.5,                  // s: the pile settles back, unwatched
    carriers: [
      { loaded: ["carry", 1], empty: ["carrye", 1], drop: ["drop-m", 1], stage: "drop-m",
        paceIn: 0.52, paceOut: 0.63 },
      { loaded: ["carry", 2], empty: ["carrye", 2], drop: ["drop-w", 1], stage: "drop-w",
        paceIn: 0.60, paceOut: 0.74 }
    ]
  };

  var DELIVER = CAST.indexOf(DELIVERY.group) >= 0;
  var sets = {};
  SCENE.forEach(function(a){ if (CAST.indexOf(a.group) >= 0) sets[a.set] = 1; });
  if (DELIVER) DELIVERY.carriers.forEach(function(c){
    sets[c.loaded[0]] = sets[c.empty[0]] = sets[c.drop[0]] = 1;
    sets[c.stage + ".stage"] = 1;
  });

  function warn(msg){ if (window.console) console.warn("[crew] " + msg); }

  var man = {}, current = null;
  Promise.all([H.ready].concat(Object.keys(sets).map(function(s){
    return fetch(DIR + s + ".json").then(function(r){
      if (!r.ok) throw new Error(s + ".json " + r.status);
      return r.json().then(function(j){ man[s] = j; });
    });
  }))).then(function(res){
    current = build(res[0]);
    /* a webfont that loads late moves the letters: build again on the
       new geometry (the carriers' clock carries on) */
    hero.addEventListener("hanok:relayout", function(e){
      var t = current ? current.destroy() : 0;
      current = build(e.detail, t);
    });
  }).catch(function(e){ warn(String(e)); });

  function pct(v, of){ return (v / of * 100).toFixed(3) + "%"; }

  /* ================================================================ */
  function build(G, t0){
    var byCh = {}, ground = 0;
    G.letters.forEach(function(l){
      var k = l.ch.toUpperCase();
      if (!byCh[k]) byCh[k] = l;
      if (l.ch !== "$" && l.bottom > ground) ground = l.bottom;
    });
    function letter(ch){
      var L = byCh[String(ch).toUpperCase()];
      if (!L) warn("no letter '" + ch + "' in the title — figure skipped");
      return L;
    }

    var HEAD = SIZE * G.cap * HEAD_OF_SIT;

    var layer = document.createElement("div");
    layer.className = "crew crew--" + STYLE;
    layer.setAttribute("aria-hidden", "true");
    /* a second layer under the svg, for whoever walks behind the ink */
    var back = document.createElement("div");
    back.className = "crew crew--" + STYLE + " crew--behind";
    back.setAttribute("aria-hidden", "true");

    /* where a contact span rests: the highest ink under it. If that
       stretch of surface is not flat, slide (up to `room` units either
       way) to the flattest nearby — a seat on a slope floats at one end */
    function restOn(xa, xb, room){
      function spread(a, b){
        var p = G.profile(a, b).filter(isFinite);
        if (!p.length) return Infinity;
        return Math.max.apply(null, p) - Math.min.apply(null, p);
      }
      var best = 0, bestS = spread(xa, xb);
      if (bestS > 3 && room > 0){
        for (var d = 1; d <= room; d++){
          [d, -d].forEach(function(dd){
            var s2 = spread(xa + dd, xb + dd);
            if (s2 + 0.05 * Math.abs(dd) < bestS + 0.05 * Math.abs(best)){ best = dd; bestS = s2; }
          });
        }
      }
      if (bestS > 6) warn("uneven surface under a figure (" + bestS.toFixed(1) + "u) at x " + Math.round(xa));
      return { dx: best, top: G.topAt(xa + best, xb + best) };
    }

    var n = 0;
    SCENE.forEach(function(a){
      if (CAST.indexOf(a.group) < 0) return;
      var M = man[a.set], f = M && M.figures[a.fig - 1];
      if (!f) return;
      var L = letter(a.ch);
      if (!L) return;
      var clipH = M.frameH || 720;
      var hU = f.box[3] * clipH * HEAD / HEAD_PX[a.set];
      var wU = hU * f.w / f.h;
      var left, top;

      if (a.kind === "sit"){
        var cx = L.x0 + (L.x1 - L.x0) * a.at;
        var r = restOn(cx - 0.3 * wU, cx + 0.3 * wU, Math.round((L.x1 - L.x0) * 0.2));
        if (!isFinite(r.top)){ warn("no ink under the sitter on '" + a.ch + "'"); return; }
        left = cx + r.dx - wU / 2;
        top  = r.top + SINK - f.seat * hU;
      } else if (a.kind === "stand"){
        var px = L.x0 + (L.x1 - L.x0) * a.lx + (a.dx || 0);
        var py = L.top + (L.bottom - L.top) * a.ly + (a.dy || 0);
        if (a.rest){
          var r2 = restOn(px - 0.15 * wU, px + 0.15 * wU, 0);
          if (isFinite(r2.top)) py = r2.top + SINK;
        }
        left = px - a.ax * wU;
        top  = py - a.ay * hU;
      } else return;

      var fig = document.createElement("div");
      fig.className = "crew__fig";
      fig.style.left   = pct(left, G.vbW);
      fig.style.top    = pct(top,  G.vbH);
      fig.style.width  = pct(wU,   G.vbW);
      fig.style.height = pct(hU,   G.vbH);
      fig.style.transitionDelay = (n++ * 140) + "ms";

      /* the frame box: the strip is its background, stepped across it.
         A flipped figure (the ladder leaning left) mirrors this box. */
      var inner = document.createElement("div");
      inner.className = "crew__inner" + (a.flip ? " is-flipped" : "");
      inner.style.backgroundImage = "url(" + DIR + f.file + ")";
      inner.style.setProperty("--n", M.frames);
      inner.style.setProperty("--dur", (M.frames / M.fps).toFixed(3) + "s");
      fig.appendChild(inner);
      layer.appendChild(fig);
    });

    var run = DELIVER ? deliver(G, ground, HEAD, FRONT ? layer : back, t0 || 0) : null;

    mount.classList.add("has-crew");
    mount.insertBefore(back, mount.firstChild);
    mount.appendChild(layer);
    var layers = [back, layer];

    var onScreen = !window.IntersectionObserver, entered = false, io = null, dead = false;
    function setLive(){
      if (run && !dead) run.live(onScreen && entered && !reduced && !document.hidden && FIXED_T == null);
    }
    if (window.IntersectionObserver){
      io = new IntersectionObserver(function(es){
        onScreen = es[0].isIntersecting;
        layers.forEach(function(l){ l.classList.toggle("crew--live", onScreen); });
        setLive();
      }, { rootMargin: "40px" });
      io.observe(mount);
    } else {
      layers.forEach(function(l){ l.classList.add("crew--live"); });
    }
    document.addEventListener("visibilitychange", setLive);

    /* they climb on once the title has been written — nobody sits on a
       letter that is not there yet */
    function enter(){ requestAnimationFrame(function(){
      if (dead) return;
      layers.forEach(function(l){ l.classList.add("is-in"); });
      entered = true; setLive();
    }); }
    if (reduced || hero.classList.contains("is-written")) enter();
    else hero.addEventListener("hanok:written", enter, { once: true });

    return {
      destroy: function(){
        /* a rebuild (late webfont) can come before the title is written:
           this build must never wake up again */
        dead = true;
        hero.removeEventListener("hanok:written", enter);
        var t = run ? run.clock() : 0;
        if (run) run.live(false);
        if (io) io.disconnect();
        document.removeEventListener("visibilitychange", setLive);
        layers.forEach(function(l){ if (l.parentNode) l.parentNode.removeChild(l); });
        return t;
      }
    };
  }

  /* ================================================================
     deliver() — the carriers' round, driven by ONE clock.

     Every carrier clip frame is 16:9 and was cut at one still scale, so
     one factor maps clip-frame fractions to svg units: Sc per frame
     WIDTH (Sc·ar per frame height). A strip whose figure box in its
     frame is [bx, by, bw, bh] sits at (X0 + bx·Sc, Y0 + by·Sc·ar) for a
     frame origin (X0, Y0). The drop clips were staged with the carrier
     where the walk strips have him (the woman's shifted left, recorded
     as `shift`), so one origin per carrier lines up all three strips,
     and the pile's spot fixes that origin.

     render(t) is a pure function of the clock: which of a carrier's
     three boxes shows, which frame, where, how faded; which pile. So
     nothing drifts, a paused tab picks up where it was, ?crewt= can
     freeze any moment, and there are no timers.
  ================================================================= */
  function deliver(G, ground, HEAD, plane, t0){
    var C0 = DELIVERY.carriers[0], M0 = man[C0.loaded[0]];
    /* THE SCHEDULE IS KEPT IN WHOLE TICKS of the strips' frame rate.
       In seconds, a carrier's own clock and the pile's clock reached the
       same boundary by different sums and disagreed by 1e-15 s — for
       one frame the woman was still walking while the pile already
       thought her drop had begun, and the pile vanished (2026-09-30).
       Integers compare exactly. */
    var FPS = M0.fps || 12;
    var FW = M0.frameW || 1280, FH = M0.frameH || 720, ar = FH / FW;
    var Sc = FW * HEAD / CARRY_HEAD_PX;
    var gY = ground + 2;                                  // feet line, svg units
    var cap = G.cap;

    /* ---- the site: widest clear stretch of the ground line ------- */
    var pileW = Math.max.apply(null, DELIVERY.carriers.map(function(c){
      var S = man[c.stage + ".stage"]; return Math.max(S.pile0[2], S.pile1[2]) * Sc; }));
    var band0 = gY - 0.3 * cap, runs = [], s = null;
    for (var x = 0; x <= G.vbW; x++){
      var clear = x < G.vbW && G.inkIn(x, band0, x + 1, gY - 1) < 0.02;
      if (clear && s === null) s = x;
      if (!clear && s !== null){ runs.push([s, x]); s = null; }
    }
    /* bays between letters only (not the open paper either side), wide
       enough for the pile with a margin */
    var first = G.letters[0], lastL = G.letters[G.letters.length - 1];
    var bays = runs.filter(function(r){ return r[0] > first.x0 && r[1] < lastL.x1 && r[1] - r[0] >= pileW + 4; });
    /* how much of a carrier's drop-off would the ink hide at pile x? */
    function hidden(px){
      var worst = 0;
      DELIVERY.carriers.forEach(function(c){
        var S = man[c.stage + ".stage"], fd = man[c.drop[0]].figures[c.drop[1] - 1];
        var X0 = px - S.pile0[0] * Sc, Y0 = gY - S.ground * Sc * ar;
        var x0 = X0 + fd.box[0] * Sc, y0 = Y0 + fd.box[1] * Sc * ar;
        worst = Math.max(worst, G.inkIn(x0, y0, x0 + fd.box[2] * Sc, y0 + fd.box[3] * Sc * ar));
      });
      return worst;
    }
    var pileX;
    if (bays.length){
      bays.forEach(function(b){ b.x = b[1] - 2 - pileW; b.hid = hidden(b.x); });
      bays.sort(function(a, b){ return (a.hid - b.hid) || ((b[1] - b[0]) - (a[1] - a[0])); });
      pileX = bays[0].x;
    } else {
      warn("no clear ground wide enough for the pile — using the gap after the first letter");
      pileX = first.x1 + 2;
    }

    function box(fig, flip, z){
      var b = document.createElement("div");
      b.className = "crew__fig crew__fig--js";
      b.style.width  = pct(fig.box[2] * Sc, G.vbW);
      b.style.height = pct(fig.box[3] * Sc * ar, G.vbH);
      b.style.zIndex = z;
      var inner = document.createElement("div");
      inner.className = "crew__inner is-js" + (flip ? " is-flipped" : "");
      inner.style.backgroundImage = "url(" + DIR + fig.file + ")";
      b.appendChild(inner);
      plane.appendChild(b);
      var v = { box: b, inner: inner, fig: fig, frame: -1, n: 0, on: true };
      off(v);
      return v;
    }
    /* OFF is near-transparent, not display:none: a box that stays in
       the render tree keeps its (wide) image decoded and rastered, so a
       swap never shows a blank frame while it decodes */
    function off(v){ if (v.on){ v.box.style.opacity = "0.001"; v.on = false; } }
    function put(v, X0, Y0, frame, nFrames, alpha){
      v.box.style.left = pct(X0 + v.fig.box[0] * Sc, G.vbW);
      v.box.style.top  = pct(Y0 + v.fig.box[1] * Sc * ar, G.vbH);
      if (frame !== v.frame || nFrames !== v.n){
        v.inner.style.backgroundSize = (nFrames * 100) + "% 100%";
        v.inner.style.backgroundPosition = (nFrames > 1 ? frame / (nFrames - 1) * 100 : 0).toFixed(4) + "% 0";
        v.frame = frame; v.n = nFrames;
      }
      v.box.style.opacity = (alpha == null ? 1 : Math.max(0.001, alpha)).toFixed(3);
      v.on = true;
    }

    var cs = DELIVERY.carriers.map(function(c){
      var Mi = man[c.loaded[0]], Mo = man[c.empty[0]], Md = man[c.drop[0]], S = man[c.stage + ".stage"];
      var fi = Mi.figures[c.loaded[1] - 1], fo = Mo.figures[c.empty[1] - 1], fd = Md.figures[c.drop[1] - 1];
      var Y0 = gY - S.ground * Sc * ar;
      var Xd = pileX - S.pile0[0] * Sc;                   // drop clip origin: its pile on the spot
      var Xw = Xd + S.shift[0] * Sc;                      // walk strips' origin at the pile
      var hIn = fi.box[3] * Sc * ar, hOut = fo.box[3] * Sc * ar;
      var vIn = c.paceIn * hIn, vOut = c.paceOut * hOut;
      /* start just off the title's left edge, beyond the fade; the walk
         time is snapped to whole 1/12 s ticks and the strip's phase set
         so the LAST tick of the walk is frame n-1 — the drop clip's
         frame 0 is then the loop's next frame, exactly */
      if (Mi.fps !== FPS || Mo.fps !== FPS || Md.fps !== FPS) warn("carrier strips not all at " + FPS + " fps");
      var arriveLeft = Xw + fi.box[0] * Sc;
      var need = arriveLeft + fi.box[2] * Sc + DELIVERY.fade * hIn;
      var Tin = Math.max(1, Math.ceil(need / vIn * FPS));          // ticks
      var dist = vIn * Tin / FPS;
      var phi = ((-Tin) % Mi.frames + Mi.frames) % Mi.frames;
      var Td = Md.frames, Tout = Math.ceil(dist / vOut * FPS);      // ticks
      return { S: S, Y0: Y0, Xd: Xd, Xw: Xw, vIn: vIn, vOut: vOut, dist: dist,
               hIn: hIn, hOut: hOut, Tin: Tin, Td: Td, Tout: Tout, C: Tin + Td + Tout, phi: phi,
               Mi: Mi, Mo: Mo, Md: Md,
               /* the loaded carrier walking in is drawn over one walking out */
               vin: box(fi, false, 3), vdrop: box(fd, false, 2), vout: box(fo, true, 1) };
    });

    /* the pile between visits: windows onto the drop strips' own first
       and last frames, so every hand-over is the same pixels */
    function pileProp(c, frame, pb){
      var v = box(c.vdrop.fig, false, 0), fb = v.fig.box;
      var l = (pb[0] - fb[0]) / fb[2], t = (pb[1] - fb[1]) / fb[3];
      var r = 1 - (pb[0] + pb[2] - fb[0]) / fb[2], b = 1 - (pb[1] + pb[3] - fb[1]) / fb[3];
      v.inner.style.clipPath = "inset(" + [t, r, b, l].map(function(q2){
        return (Math.max(0, q2) * 100 - 0.5).toFixed(2) + "%"; }).join(" ") + ")";
      v.show = function(alpha){ put(v, c.Xd, c.Y0, frame, c.Md.frames, alpha); };
      return v;
    }
    var pStart = cs.map(function(c){ return pileProp(c, 0, c.S.pile0); });
    var pEnd   = cs.map(function(c){ return pileProp(c, c.Md.frames - 1, c.S.pile1); });

    /* ---- the round ---------------------------------------------------
       pass  (default) carriers staggered by P/n, crossing on the way
       relay one at a time: the next sets off as the last one leaves
       Pile time u runs from the first drop-off. Drop i fills
       [A_i, A_i+Td_i); between drops the finished clip's pile hands
       over to the next clip's first frame (a short crossfade, SWAP);
       after the last drop the pile settles back to the first clip's
       frame 0 (RESET) in the quietest stretch before u = P. */
    var n = cs.length, P, offs;
    var rest = Math.round(DELIVERY.rest * FPS), SWAP = Math.round(DELIVERY.swap * FPS),
        RESET = Math.round(DELIVERY.reset * FPS), HALF = Math.round(FPS / 2);
    function mod(a, b){ return ((a % b) + b) % b; }
    function schedule(){
      if (RELAY){
        offs = []; var acc = 0;
        cs.forEach(function(c){ offs.push(acc); acc += c.C + rest; });
        P = acc;
      } else {
        offs = cs.map(function(_, i){ return Math.round(i * P / n); });
      }
    }
    P = 0; cs.forEach(function(c){ P = Math.max(P, c.C); }); P += rest;
    schedule();
    var A, R0, R1, a0;
    function carrierRight(c, i, T){                       // right edge of what shows, or null
      var tau = mod(T - offs[i], P);
      if (tau < c.Tin){ var x = c.Xw - c.vIn * (c.Tin - tau) / FPS; return x + (c.vin.fig.box[0] + c.vin.fig.box[2]) * Sc; }
      if (tau < c.Tin + c.Td) return pileX;
      if (tau < c.C){ var x2 = c.Xw - c.vOut * (tau - c.Tin - c.Td) / FPS; return x2 + (c.vout.fig.box[0] + c.vout.fig.box[2]) * Sc; }
      return null;
    }
    /* THE PILE IS NEVER SEEN SHRINKING WHILE ANYONE IS NEAR IT: the
       reset needs a stretch where everyone is at least FAR units away */
    var FAR = 4 * pileW;
    function plan(){
      a0 = offs[0] + cs[0].Tin;
      A = cs.map(function(c, i){ return mod(offs[i] + c.Tin - a0, P); });
      for (var i = 0; i < n; i++){
        if (i > 0 && A[i] <= A[i - 1]) return false;
        var end = A[i] + cs[i].Td, next = i + 1 < n ? A[i + 1] : P;
        if (next - end < (i + 1 < n ? SWAP + FPS : RESET + FPS)) return false;
      }
      var from = A[n - 1] + cs[n - 1].Td + HALF, to = P - HALF, best = -Infinity, bestAt = from;
      for (var u = from; u + RESET <= to; u++){
        var worst = Infinity;
        for (var w = u; w <= u + RESET; w += 3){
          cs.forEach(function(c, i2){
            var xr = carrierRight(c, i2, w + a0);
            if (xr !== null) worst = Math.min(worst, pileX - xr);
          });
        }
        if (worst > best){ best = worst; bestAt = u; }
      }
      R0 = bestAt; R1 = R0 + RESET;
      return best >= FAR || P > 120 * FPS;
    }
    for (var guard = 0; guard < 240 && !plan(); guard++){
      if (RELAY) rest += HALF; else P += HALF;
      schedule();
    }

    function render(t){
      /* everything below is decided on the integer tick T; only the
         crossfades read the continuous clock, for smoothness */
      var T = Math.floor(t * FPS + 1e-6);
      cs.forEach(function(c, i){
        var tau = mod(T - offs[i], P);
        var showIn = false, showDrop = false, showOut = false;
        if (tau < c.Tin){
          /* position steps with the frames: the planted foot stays put
             between frames instead of sliding and jumping */
          var x = c.Xw - c.vIn * (c.Tin - tau) / FPS, gone = x - (c.Xw - c.dist);
          put(c.vin, x, c.Y0, (c.phi + tau) % c.Mi.frames, c.Mi.frames, Math.min(1, gone / (DELIVERY.fade * c.hIn)));
          showIn = true;
        } else if (tau < c.Tin + c.Td){
          put(c.vdrop, c.Xd, c.Y0, tau - c.Tin, c.Md.frames);
          showDrop = true;
        } else if (tau < c.C){
          var k2 = tau - c.Tin - c.Td;
          var x2 = c.Xw - c.vOut * k2 / FPS, left = x2 - (c.Xw - c.dist);
          put(c.vout, x2, c.Y0, k2 % c.Mo.frames, c.Mo.frames, Math.min(1, Math.max(0, left) / (DELIVERY.fade * c.hOut)));
          showOut = true;
        }
        if (!showIn) off(c.vin);
        if (!showDrop) off(c.vdrop);
        if (!showOut) off(c.vout);
      });

      /* the pile — hidden while a drop clip (which draws it) plays */
      var u = mod(T - a0, P), uc = mod(t * FPS - a0, P), shown = [];
      var dropping = false, done = 0;
      for (var j = 0; j < n; j++){
        if (u >= A[j] && u < A[j] + cs[j].Td) dropping = true;
        if (u >= A[j] + cs[j].Td) done = j + 1;
      }
      if (!dropping){
        if (done === 0){
          shown.push([pStart[0], 1]);
        } else if (done < n){
          /* hand over from clip done-1's last frame to clip done's first */
          var s0 = (A[done - 1] + cs[done - 1].Td + A[done]) / 2 - SWAP / 2, kx = (uc - s0) / SWAP;
          if (kx <= 0) shown.push([pEnd[done - 1], 1]);
          else if (kx >= 1) shown.push([pStart[done], 1]);
          else { shown.push([pEnd[done - 1], 1 - kx]); shown.push([pStart[done], kx]); }
        } else {
          var kr = (uc - R0) / (R1 - R0);
          if (kr <= 0) shown.push([pEnd[n - 1], 1]);
          else if (kr >= 1) shown.push([pStart[0], 1]);
          else { shown.push([pEnd[n - 1], 1 - kr]); shown.push([pStart[0], kr]); }
        }
      }
      pStart.concat(pEnd).forEach(function(v){
        var hit = shown.filter(function(sh){ return sh[0] === v; })[0];
        if (hit) v.show(hit[1]); else off(v);
      });
    }

    /* every strip decoded before the clock starts */
    var urls = {};
    cs.forEach(function(c){ [c.vin, c.vdrop, c.vout].forEach(function(v){ urls[DIR + v.fig.file] = 1; }); });
    var decoded = Promise.all(Object.keys(urls).map(function(u){
      var im = new Image(); im.src = u;
      return im.decode ? im.decode().catch(function(){}) : Promise.resolve();
    }));

    var clock = t0 || 0, last = 0, on = false, raf = 0, ready = false;
    function tick(ts){
      if (!on || !ready) return;
      var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
      last = ts; clock += dt;
      render(clock);
      raf = requestAnimationFrame(tick);
    }
    decoded.then(function(){
      ready = true;
      if (FIXED_T != null) render(FIXED_T);
      /* reduced motion: one still moment that tells the story — the
         first carrier crouched at the pile, mid-delivery */
      else if (reduced) render((offs[0] + cs[0].Tin + cs[0].Td * 0.4) / FPS);
      else { render(clock); if (on){ last = 0; raf = requestAnimationFrame(tick); } }
    });

    var api = {
      clock: function(){ return clock; },
      render: render,
      live: function(v){
        if (v === on) return;
        on = v; last = 0;
        if (on && ready) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf);
      },
      debug: function(){
        return { units: "ticks of 1/" + FPS + " s", P: P, relay: RELAY, A: A, a0: a0, reset: [R0, R1], pileX: pileX, pileW: pileW, Sc: Sc,
                 bays: bays, carriers: cs.map(function(c, i){
                   return { off: offs[i], Tin: c.Tin, Td: c.Td, Tout: c.Tout, C: c.C, phi: c.phi, Xd: c.Xd, Xw: c.Xw }; }) };
      }
    };
    window.HANOK_CREW = api;
    return api;
  }
})();
