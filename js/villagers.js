/* ================================================================
   VILLAGERS — people walking the village's paths. A TEST (branch
   crew-test), on with the crew: `?crew=ink` (`&cast=` without
   `village` leaves them out). Six walkers in six colours since session
   21 (WALKERS_NEW, art/crew/vill2); `?vill=old` = the first three.

   Zico, 2026-09-29: *"are you able to add animations? like a couple
   villagers running around the village at the bottom"*. The plan had
   been waiting since session 8 (PROMPTS.md §8, PLAN.html phase 2);
   what changed is the cast — Zico's tile-workers, drawn from the SAME
   high angle as the valley plate (a man with a tile-loaded A-frame, a
   woman with tiles in her arms, a running child) — and the motion,
   which is a real walk cycle now (tools/crew.html, `vill` strips)
   rather than two poses flipped.

   ROUTES are found on the painting, not drawn: tools/routes.js
   follows the dirt paths between named waypoints and writes
   art/village/routes.json in plate fractions. Each walker goes out
   along its route, stands a moment, turns and comes back.

   DEPTH: houses and walkers share one z-order by ground line (their
   feet), so someone walking up the valley passes BEHIND a house
   rather than over its roof. The Z's stay above everything.

   PACE is measured off the strips (steps per second × stride), so a
   planted foot does not slide: see WALKERS.

   Runs only while the plate is on screen; under reduced motion the
   villagers stand along their paths instead.
================================================================= */

(function(){
  "use strict";

  var q = location.search;
  if (!/[?&]crew=ink\b/.test(q)) return;
  var castQ = /[?&]cast=([a-z,]+)/.exec(q);
  if (castQ && castQ[1].split(",").indexOf("village") < 0) return;

  var plate = document.getElementById("villagePlate");
  if (!plate) return;
  var reduced = window.HANOK_REDUCED();

  /* who walks where. `fig` is the strip in vill.json (1 the A-frame
     man, 2 the woman with tiles, 3 the running child). `h` is the
     figure's height as a fraction of the plate's WIDTH — the man at
     0.03 is ~32px on the 1080 plate, about half a cottage's height.
     At 0.026 they were right-sized and still vanished: tan cloth on a
     tan path. The shadow under each (css) is what makes them read. `pace` is body-heights per
     second, measured off the strip: steps every 6 / 6 / 5.2 frames at
     12fps, full stride 0.48 / 0.52 / 0.62 of the figure's height.
     `at` is where on the route they start (0..1), `dir` which way. */
  var WALKERS_OLD = [
    { route: "trunk-left",  fig: 1, h: 0.030,  pace: 0.97, at: 0.15, dir:  1 },
    { route: "trunk-right", fig: 2, h: 0.0264, pace: 1.03, at: 0.55, dir:  1 },
    { route: "mid-up",      fig: 3, h: 0.022,  pace: 1.45, at: 0.30, dir: -1 },
    { route: "middle",      fig: 1, h: 0.030,  pace: 0.97, at: 0.70, dir: -1 }
  ];
  /* THE SECOND CAST (2026-09-30, session 21). VEN: *"I want them to stand
     out more, variation in clothes colour and hair colour."* Tan on a tan
     path vanished; these six each wear their own strong colour, with hair
     from black to chestnut to white (art/crew/vill2.json, one clip):
       1 the tile man with his A-frame — indigo jacket, black topknot
       2 a woman with tiles — white jacket, crimson skirt, brown bun
       3 a child running — rainbow saekdong sleeves
       4 an elder with a stick — all white, white hair and beard
       5 a woman with a basket on her head — sky blue and navy, black braid
       6 a young man with tiles on his shoulder — mustard, chestnut hair
     `h` is ONE human scale: ADULT (the young man's height, a fraction of
     the plate's width) × each figure's height in the clip over his, so the
     A-frame and the basket stand above heads and the child is a child. At
     0.032 they are ~12% bigger than the first cast. `pace` is measured off
     each strip's own planted foot (tools/crew.html `pace=1`), written into
     the manifest — set it here only to override. `?vill=old` = the first
     three, all in tan. */
  /* `?villsize=0.04` tries another adult height (digits only, clamped) */
  var sizeQ = /[?&]villsize=(0?\.[0-9]{1,4})\b/.exec(q);
  var ADULT = sizeQ ? Math.min(0.08, Math.max(0.015, +sizeQ[1])) : 0.032, REF_FIG = 6;
  var WALKERS_NEW = [
    { route: "trunk-left",  fig: 1, at: 0.15, dir:  1 },
    { route: "trunk-right", fig: 2, at: 0.55, dir:  1 },
    { route: "mid-up",      fig: 3, at: 0.30, dir: -1 },
    { route: "middle",      fig: 4, at: 0.25, dir:  1 },
    { route: "trunk-right", fig: 5, at: 0.20, dir: -1 },
    { route: "trunk-left",  fig: 6, at: 0.70, dir: -1 }
  ];
  var OLD = /[?&]vill=old\b/.test(q);
  var SET = OLD ? "vill" : "vill2", WALKERS = OLD ? WALKERS_OLD : WALKERS_NEW;
  var PAUSE = [1.2, 2.6];           // seconds standing at a route's end

  function whenArt(cb){
    if (plate.classList.contains("has-art")) return cb();
    new MutationObserver(function(_, mo){
      if (plate.classList.contains("has-art")){ mo.disconnect(); cb(); }
    }).observe(plate, { attributes: true, attributeFilter: ["class"] });
  }

  whenArt(function(){
    Promise.all([
      fetch("art/village/routes.json").then(function(r){ return r.json(); }),
      fetch("art/crew/" + SET + ".json").then(function(r){ return r.json(); })
    ]).then(function(res){ start(res[0], res[1]); })
      .catch(function(e){ if (window.console) console.warn("[villagers]", e); });
  });

  /* ground-line z-order: .v-house is anchored at its foot (top: y%),
     so its top IS its ground line */
  function zOf(yFrac){ return 100 + Math.round(yFrac * 1000); }

  function start(R, man){
    var routes = {};
    R.routes.forEach(function(r){ routes[r.name] = r.pts; });

    Array.prototype.forEach.call(plate.querySelectorAll(".v-house"), function(h){
      h.style.zIndex = zOf(parseFloat(h.style.top) / 100);
    });
    Array.prototype.forEach.call(plate.querySelectorAll(".v-zzz"), function(z){
      z.style.zIndex = 2000;
    });

    var W = 0, H = 0;
    function measure(){ W = plate.clientWidth; H = plate.clientHeight; }
    measure();
    if (window.ResizeObserver) new ResizeObserver(function(){ measure(); layout(); }).observe(plate);

    var walkers = [], ref = man.figures[REF_FIG - 1];
    WALKERS.forEach(function(w, i){
      var pts = routes[w.route], f = man.figures[w.fig - 1];
      if (!pts || !f) return;
      /* the second cast: height off one human scale, pace off the strip */
      if (w.h == null) w.h = ref ? ADULT * f.box[3] / ref.box[3] : ADULT;
      if (w.pace == null) w.pace = f.pace || 1;
      /* mover > frame box: the mover takes the per-frame translate;
         the box shows one frame of the strip as its background (the
         crew's technique — see js/crew.js) and mirrors to face left */
      var el = document.createElement("div");
      el.className = "v-walker";
      var win = document.createElement("div");
      win.className = "v-walker__win";
      win.style.backgroundImage = "url(art/crew/" + f.file + ")";
      win.style.setProperty("--n", man.frames);
      win.style.setProperty("--dur", (man.frames / man.fps).toFixed(3) + "s");
      /* each villager's stride starts at a different point */
      win.style.animationDelay = (-(i * 1.37) % (man.frames / man.fps)).toFixed(2) + "s";
      el.appendChild(win);
      plate.appendChild(el);
      walkers.push({ w: w, f: f, pts: pts, el: el, strip: win,
                     s: 0, len: 0, seg: [], dir: w.dir, wait: 0, face: w.dir });
    });

    /* route length in current plate px; `s` is kept as a FRACTION so a
       resize does not teleport anyone */
    function layout(){
      walkers.forEach(function(k){
        var acc = [0], L = 0;
        for (var j = 1; j < k.pts.length; j++){
          L += Math.hypot((k.pts[j][0] - k.pts[j - 1][0]) * W, (k.pts[j][1] - k.pts[j - 1][1]) * H);
          acc.push(L);
        }
        k.len = L; k.seg = acc;
        var hPx = k.w.h * W;
        k.el.style.width  = (hPx * k.f.w / k.f.h).toFixed(1) + "px";
        k.el.style.height = hPx.toFixed(1) + "px";
        k.speed = k.w.pace * hPx / (L || 1);          // route fractions per second
      });
    }
    layout();

    function pointAt(k, frac){
      var d = frac * k.len, a = k.seg, j = 1;
      while (j < a.length - 1 && a[j] < d) j++;
      var t = (d - a[j - 1]) / ((a[j] - a[j - 1]) || 1);
      var p = k.pts[j - 1], q2 = k.pts[j];
      return { x: p[0] + (q2[0] - p[0]) * t, y: p[1] + (q2[1] - p[1]) * t,
               dx: (q2[0] - p[0]) * W, dy: (q2[1] - p[1]) * H };
    }

    function place(k){
      var p = pointAt(k, k.s);
      /* face the way they are walking — but only when the path really
         goes left or right, or a walker climbing straight up the valley
         would flip with every wiggle */
      var mdx = p.dx * k.dir;
      if (Math.abs(p.dx) > Math.abs(p.dy) * 0.35) k.face = mdx >= 0 ? 1 : -1;
      k.strip.classList.toggle("is-flipped", k.face < 0);
      var wPx = parseFloat(k.el.style.width), hPx = parseFloat(k.el.style.height);
      k.el.style.transform = "translate(" + (p.x * W - wPx / 2).toFixed(1) + "px," +
                                            (p.y * H - hPx * 0.97).toFixed(1) + "px)";
      k.el.style.zIndex = zOf(p.y);
    }

    walkers.forEach(function(k){ k.s = k.w.at; place(k); });
    plate.classList.add("has-walkers");
    if (reduced) return;                               // they stand where they are

    /* seeded pause lengths, so a reload looks the same */
    var seed = 7;
    function rnd(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

    var live = false, last = 0;
    function tick(ts){
      if (!live) return;
      var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
      last = ts;
      walkers.forEach(function(k){
        if (k.wait > 0){
          k.wait -= dt;
          if (k.wait <= 0){ k.dir = -k.dir; k.el.classList.remove("is-idle"); }
          return;
        }
        k.s += k.dir * k.speed * dt;
        if (k.s >= 1 || k.s <= 0){
          k.s = Math.max(0, Math.min(1, k.s));
          k.wait = PAUSE[0] + rnd() * (PAUSE[1] - PAUSE[0]);
          k.el.classList.add("is-idle");
        }
        place(k);
      });
      requestAnimationFrame(tick);
    }
    function setLive(on){
      if (on === live) return;
      live = on; last = 0;
      plate.classList.toggle("v-walking", on);
      if (on) requestAnimationFrame(tick);
    }
    if (window.IntersectionObserver){
      new IntersectionObserver(function(es){ setLive(es[0].isIntersecting); },
                               { rootMargin: "80px" }).observe(plate);
    } else setLive(true);
  }
})();
