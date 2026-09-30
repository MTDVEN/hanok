/* ================================================================
   CREW — Zico's villagers on the heading. A TEST (branch crew-test).

   Zico, 2026-09-29: *"add some of the same characters on X around the
   heading. some building the header, some sitting at the top with
   laptops, some transporting tiles around."* VEN, 2026-09-30, having
   compared the two styles: *"Repainting in the site's ink is a must,
   then we can adjust the position and quantity of them later on."*

     ?crew=ink     the whole crew, in ink: four laptop-sitters, the L as
                   a building site (a ladder and a tile-layer), and two
                   carriers walking tiles along the foot of the letters
     ?crew=x       the laptop-sitters only, as painted on @tilesonGIWA
                   (kept for comparison; builders/carriers exist in ink)
     ?cast=sit,build,carry   which groups to show (default: all)
     ?crewsize=N   head size, as the old seated-height fraction of the
                   T (default 0.62 — what VEN approved)

   They combine with `?title=song` (Song Myung $TILES).

   THE SCENE IS DATA. Every villager is one line of SCENE below —
   which strip, which letter, where on it — so moving or dropping one
   is a one-line change, which is how VEN said the placing will go.

   HOW THEY MOVE. Each figure is one strip of frames (art/crew/<set>-
   <n>.webp) cut by tools/crew.html from a clip whose first and last
   frames are the same still, so every strip loops without a seam. The
   strip is the BACKGROUND of a one-frame box and steps across it
   (background-position, steps()). It was an <img> sliding inside a
   clipped window first, and Chrome dropped the mirrored ones outright
   — a 7920px image hanging far off-screen — so nothing oversized is
   laid out any more, and a mirror is just scaleX(-1) on a small box. Carriers also travel: a
   second CSS animation carries their window along the ground line,
   fading them in at the start and out when they reach the ladder. No
   JS runs per frame. Everything runs only while the hero is on screen
   (.crew--live); under reduced motion nobody moves or travels.

   SCALE. Every set is drawn at ONE human scale: a figure's height in
   svg units is its height in the clip × HEAD / (head height in that
   clip). HEAD_PX below was measured off each set's still.

   WHERE is measured, not typed: js/hero.js publishes every letter's
   ink box in the title svg's units (window.HANOK_HERO), and all
   placement is in % of the title box, so the crew scales with the
   title and needs no resize handler.
================================================================= */

(function(){
  "use strict";

  var m = /[?&]crew=(x|ink)\b/.exec(location.search);
  if (!m) return;
  var STYLE = m[1];
  var castQ = /[?&]cast=([a-z,]+)/.exec(location.search);
  var CAST  = castQ ? castQ[1].split(",") : ["sit", "build", "carry"];
  if (STYLE === "x") CAST = ["sit"];
  var sizeQ = /[?&]crewsize=([0-9.]+)/.exec(location.search);
  var SIZE  = sizeQ ? Math.min(1.5, Math.max(0.2, +sizeQ[1])) : 0.62;

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
  /* the laptop-sitter VEN approved was 0.62 of the T tall with a
     67px head in a 467px figure: HEAD = SIZE × cap × (67 / 467) */
  var HEAD_OF_SIT = 67 / 467;
  /* the share of each carrier's cycle spent walking — must match the
     70% keyframe of crew-walk in css/site.css */
  var WALK_SHARE = 0.7;

  /* ---- THE SCENE ------------------------------------------------
     kind "sit"   — seated on the letter's top edge. `at` is how far
                    along the top (0 = the ink's left, 1 = its right).
     kind "stand" — any figure pinned by ONE point of its own strip
                    (ax, ay: fractions of the strip frame, measured
                    after `flip`) to one point of the letter (lx, ly:
                    fractions of the letter's ink box) plus dx, dy in
                    svg units.
     kind "walk"  — travels along the ground line from `from` to `to`
                    (svg x units; the title is ~650 wide), feet on the
                    line, fading in at the start and out at `to`, then
                    a pause before the next trip. `pace` is the speed
                    the feet were drawn at, in body-heights per second —
                    MEASURED off the strip (a step every 7.6 frames,
                    feet 0.46 h apart at full stride), so the planted
                    foot does not slide. Change it and they skate.
                    `behind` draws them BEHIND the ink: a person is
                    nearly as tall as a letter, and walking in front
                    they blot out $TILES as they pass — behind, the
                    strokes stay whole and they show between them.
                    `rest` is where along the trip they stand when
                    nothing moves (reduced motion).
  ------------------------------------------------------------------ */
  var SCENE = [
    /* the laptop-sitters. The E is the tile-layer's now, so the sitter
       who was on it moved to the $'s shoulder. */
    { group: "sit", set: STYLE, fig: 4, kind: "sit", ch: "$", at: 0.72 },
    { group: "sit", set: STYLE, fig: 1, kind: "sit", ch: "T", at: 0.5 },
    { group: "sit", set: STYLE, fig: 2, kind: "sit", ch: "I", at: 0.5 },
    { group: "sit", set: STYLE, fig: 3, kind: "sit", ch: "S", at: 0.5 },

    /* the building site. The ladder leans on the L's stem from the
       right (flipped, so its top points left): (0.105, 0.163) is the
       tip of its rail in the strip, set against the stem's right edge
       just below the top; its feet land on the L's foot. */
    { group: "build", set: "build", fig: 1, kind: "stand", flip: true,
      ax: 0.105, ay: 0.163, ch: "L", lx: 0.2, ly: 0.07 },
    /* the tile-layer kneels on the E's top bar facing the ladder,
       laying tiles; (0.5, 0.93) is under her knee */
    { group: "build", set: "build", fig: 2, kind: "stand",
      ax: 0.5, ay: 0.93, ch: "E", lx: 0.55, ly: 0, dy: 9 },

    /* two carriers bring tiles from beyond the $ to the ladder */
    { group: "carry", set: "carry", fig: 1, kind: "walk", from: -70, to: 335, pace: 0.52, delay: 0,
      behind: true, rest: 0.62 },
    { group: "carry", set: "carry", fig: 2, kind: "walk", from: -70, to: 335, pace: 0.60, delay: 5.5,
      behind: true, rest: 0.22 }
  ];

  var sets = {};
  SCENE.forEach(function(a){ if (CAST.indexOf(a.group) >= 0) sets[a.set] = 1; });

  Promise.all([H.ready].concat(Object.keys(sets).map(function(s){
    return fetch(DIR + s + ".json").then(function(r){
      if (!r.ok) throw new Error(s + ".json " + r.status);
      return r.json().then(function(j){ return [s, j]; });
    });
  }))).then(function(res){
    var T = res[0], man = {};
    res.slice(1).forEach(function(p){ man[p[0]] = p[1]; });
    build(T, man);
  }).catch(function(e){ if (window.console) console.warn("[crew]", e); });

  function pct(v, of){ return (v / of * 100).toFixed(3) + "%"; }

  function build(T, man){
    var byCh = {}, ground = 0;
    T.letters.forEach(function(l){
      if (!byCh[l.ch]) byCh[l.ch] = l;
      if (l.ch !== "$" && l.bottom > ground) ground = l.bottom;
    });

    var HEAD = SIZE * T.cap * HEAD_OF_SIT;
    var SINK = T.cap * 0.03;

    var layer = document.createElement("div");
    layer.className = "crew crew--" + STYLE;
    layer.setAttribute("aria-hidden", "true");
    /* a second layer under the svg, for whoever walks behind the ink */
    var back = document.createElement("div");
    back.className = "crew crew--" + STYLE + " crew--behind";
    back.setAttribute("aria-hidden", "true");

    var n = 0;
    SCENE.forEach(function(a){
      if (CAST.indexOf(a.group) < 0) return;
      var M = man[a.set], f = M && M.figures[a.fig - 1];
      if (!f) return;
      var clipH = M.frameH || 720;
      var hU = f.box[3] * clipH * HEAD / HEAD_PX[a.set];
      var wU = hU * f.w / f.h;
      var left, top, L = a.ch ? byCh[a.ch] : null;

      if (a.kind === "sit"){
        if (!L) return;
        left = L.x0 + (L.x1 - L.x0) * a.at - wU / 2;
        top  = L.top + SINK - f.seat * hU;
      } else if (a.kind === "stand"){
        if (!L) return;
        var px = L.x0 + (L.x1 - L.x0) * a.lx + (a.dx || 0);
        var py = L.top + (L.bottom - L.top) * a.ly + (a.dy || 0);
        left = px - a.ax * wU;
        top  = py - a.ay * hU;
      } else {                                         // walk
        left = a.from;
        top  = ground + (a.dy || 2) - 0.97 * hU;
      }

      var fig = document.createElement("div");
      fig.className = "crew__fig" + (a.kind === "walk" ? " crew__fig--walk" : "");
      fig.style.left   = pct(left, T.vbW);
      fig.style.top    = pct(top,  T.vbH);
      fig.style.width  = pct(wU,   T.vbW);
      fig.style.height = pct(hU,   T.vbH);
      fig.style.transitionDelay = (n++ * 140) + "ms";

      if (a.kind === "walk"){
        /* the whole trip in the figure's own widths, so a transform
           can carry it (translate % is of the element itself) */
        fig.style.setProperty("--trip", ((a.to - a.from) / wU * 100).toFixed(2) + "%");
        /* the trip takes WALK_SHARE of the cycle; the rest is the
           pause out of sight before the next load */
        var secs = (a.to - a.from) / (a.pace * hU) / WALK_SHARE;
        fig.style.setProperty("--walkdur", secs.toFixed(2) + "s");
        fig.style.setProperty("--walkdelay", (a.delay || 0) + "s");
        fig.style.setProperty("--rest", a.rest == null ? 0.4 : a.rest);
      }

      /* the frame box: the strip is its background, stepped across it.
         A flipped figure (the ladder leaning left) mirrors this box. */
      var inner = document.createElement("div");
      inner.className = "crew__inner" + (a.flip ? " is-flipped" : "");
      inner.style.backgroundImage = "url(" + DIR + f.file + ")";
      inner.style.setProperty("--n", M.frames);
      inner.style.setProperty("--dur", (M.frames / M.fps).toFixed(3) + "s");
      fig.appendChild(inner);
      (a.behind ? back : layer).appendChild(fig);
    });

    mount.classList.add("has-crew");
    mount.insertBefore(back, mount.firstChild);
    mount.appendChild(layer);
    var layers = [back, layer];

    if (window.IntersectionObserver){
      new IntersectionObserver(function(es){
        layers.forEach(function(l){ l.classList.toggle("crew--live", es[0].isIntersecting); });
      }, { rootMargin: "40px" }).observe(mount);
    } else {
      layers.forEach(function(l){ l.classList.add("crew--live"); });
    }

    /* they climb on once the title has been written — nobody sits on a
       letter that is not there yet */
    function enter(){ requestAnimationFrame(function(){
      layers.forEach(function(l){ l.classList.add("is-in"); });
    }); }
    if (reduced || hero.classList.contains("is-written")) enter();
    else hero.addEventListener("hanok:written", enter, { once: true });
  }
})();
