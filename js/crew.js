/* ================================================================
   CREW — Zico's villagers on the heading. A TEST (branch crew-test).

   Zico, 2026-09-29: *"add some of the same characters on X around the
   heading. some building the header, some sitting at the top with
   laptops, some transporting tiles around."* This is the first of the
   three: the four laptop-sitters from his post of the roof, sat on the
   tops of the letters. Nothing shows without a switch:

     ?crew=x       the four as painted on @tilesonGIWA
     ?crew=ink     the same four, repainted in the site's ink and wash
     ?seat=spread  (default) one on each of T, I, E and S
     ?seat=pairs   two on the T's bar, two on the E's top bar
     ?crewsize=N   a seated figure's height as a fraction of the T's
                   height (default 0.62)

   They combine with the title switch: `?title=song` sets $TILES in
   Song Myung (Zico's other ask) and the crew sits on those glyphs.

   HOW IT MOVES. Each figure is one strip of frames (art/crew/<style>-
   <n>.webp, 60 frames, 12fps) cut by tools/crew.html from a video
   whose first and last frames are the same still — so the strip loops
   with no seam. It plays with a CSS steps() animation on a transform:
   nothing runs per frame in JS, the compositor does it. The loop runs
   only while the hero is on screen (the .crew--live class, the same
   discipline as the village's Z's), and a hidden tab freezes CSS
   animations on its own. Under reduced motion the strip holds frame 0
   and nothing enters: they are simply sitting there.

   WHERE THEY SIT is measured, not typed: js/hero.js publishes every
   letter's ink box in the title svg's own units (window.HANOK_HERO),
   the manifest says where on each strip the seat is, and everything is
   set in % of the title box — so the crew scales with the title on
   every screen and needs no resize handler.
================================================================= */

(function(){
  "use strict";

  var m = /[?&]crew=(x|ink)\b/.exec(location.search);
  if (!m) return;
  var STYLE = m[1];
  var SEAT  = (/[?&]seat=(spread|pairs)\b/.exec(location.search) || [])[1] || "spread";
  var sizeQ = /[?&]crewsize=([0-9.]+)/.exec(location.search);
  var SIZE  = sizeQ ? Math.min(1.5, Math.max(0.2, +sizeQ[1])) : 0.62;

  var hero  = document.getElementById("hero"),
      mount = document.getElementById("heroTitle"),
      H     = window.HANOK_HERO;
  if (!hero || !mount || !H) return;
  var reduced = window.HANOK_REDUCED();
  var DIR = "art/crew/";

  /* which letter each figure sits on, and where along its top (0 = the
     ink's left edge, 1 = its right edge). pairs shares a letter by
     putting the two figures either side of its middle. */
  var PLAN = {
    spread: [ { ch: "T", at: 0.5 }, { ch: "I", at: 0.5 }, { ch: "E", at: 0.46 }, { ch: "S", at: 0.5 } ],
    pairs:  [ { ch: "T", at: 0.27 }, { ch: "T", at: 0.73 }, { ch: "E", at: 0.3 }, { ch: "E", at: 0.74 } ]
  }[SEAT];

  Promise.all([
    H.ready,
    fetch(DIR + STYLE + ".json").then(function(r){
      if (!r.ok) throw new Error(STYLE + ".json " + r.status);
      return r.json();
    })
  ]).then(function(res){ build(res[0], res[1]); })
    .catch(function(e){ if (window.console) console.warn("[crew]", e); });

  function pct(v, of){ return (v / of * 100).toFixed(3) + "%"; }

  function build(T, man){
    var byCh = {};
    T.letters.forEach(function(l){ if (!byCh[l.ch]) byCh[l.ch] = l; });

    var layer = document.createElement("div");
    layer.className = "crew crew--" + STYLE;
    layer.setAttribute("aria-hidden", "true");

    /* a seated figure's full height (head to dangling feet) in svg
       units, from the T — the one letter every seat plan uses */
    var figH = T.cap * SIZE;
    /* how far a seat sinks into the letter's top edge, so they sit ON
       the stroke rather than hover a hair above its ink */
    var SINK = T.cap * 0.03;

    man.figures.forEach(function(f, n){
      var spot = PLAN[n], L = spot && byCh[spot.ch];
      if (!L) return;
      var figW = figH * f.w / f.h;
      var cx   = L.x0 + (L.x1 - L.x0) * spot.at;
      var seatY = L.top + SINK;
      var left = cx - figW / 2, top = seatY - f.seat * figH;

      var fig = document.createElement("div");
      fig.className = "crew__fig";
      fig.style.left   = pct(left, T.vbW);
      fig.style.top    = pct(top,  T.vbH);
      fig.style.width  = pct(figW, T.vbW);
      fig.style.height = pct(figH, T.vbH);
      /* enter one after another, left to right */
      fig.style.transitionDelay = (n * 140) + "ms";

      var strip = document.createElement("img");
      strip.className = "crew__strip";
      strip.alt = "";
      strip.decoding = "async";
      strip.src = DIR + f.file;
      strip.style.setProperty("--n", man.frames);
      strip.style.setProperty("--dur", (man.frames / man.fps).toFixed(3) + "s");
      fig.appendChild(strip);
      layer.appendChild(fig);
    });

    mount.classList.add("has-crew");
    mount.appendChild(layer);

    /* the loop runs only while the hero is on screen */
    if (window.IntersectionObserver){
      new IntersectionObserver(function(es){
        layer.classList.toggle("crew--live", es[0].isIntersecting);
      }, { rootMargin: "40px" }).observe(mount);
    } else {
      layer.classList.add("crew--live");
    }

    /* they climb on once the title has been written, not before —
       nobody sits on a letter that is not there yet */
    function enter(){ requestAnimationFrame(function(){ layer.classList.add("is-in"); }); }
    if (reduced || hero.classList.contains("is-written")) enter();
    else hero.addEventListener("hanok:written", enter, { once: true });
  }
})();
