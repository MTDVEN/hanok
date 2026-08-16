/* ================================================================
   HERO — the title writes itself.

   Each letter is a set of hand-authored brush strokes (single-line
   SVG paths). A shared timeline animates stroke-dashoffset in
   writing order while a nib dot rides the active stroke, then the
   red seal stamps and the rest of the hero fades in.

   To change the title: add letters to LETTERS (100x140 grid,
   baseline y=128) and change WORD.
================================================================= */

(function(){
  "use strict";

  var WORD = "HANOK";

  /* stroke paths per letter, in writing order, on a 100x140 grid */
  var LETTERS = {
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
    ]
  };

  var ADVANCE = 96, X0 = 22, NS = "http://www.w3.org/2000/svg";

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

  var width = X0 + WORD.length * ADVANCE + 46;
  var svg = el("svg", { viewBox: "0 0 " + width + " 176", "aria-hidden": "true" }, mount);

  /* rough ink edge. Applied per stroke (not to the whole word) so the
     browser only re-runs the filter over the stroke that is animating. */
  var defs = el("defs", {}, svg);
  defs.innerHTML =
    '<filter id="inkRough" x="-14%" y="-14%" width="128%" height="128%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="3.4"/>' +
    '</filter>';

  var inkGroup = el("g", {}, svg);

  /* build strokes ------------------------------------------------ */

  var strokes = [];   // { main, over, len }

  function addStroke(d, transform, w){
    var attrs = { filter: "url(#inkRough)" };
    if (transform) attrs.transform = transform;
    var g = el("g", attrs, inkGroup);
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
      p.style.strokeDasharray = len + " " + len;
      p.style.strokeDashoffset = len;
    });
    strokes.push({ main: main, over: over, len: len });
  }

  var strokeIdx = 0;
  WORD.split("").forEach(function(ch, i){
    var paths = LETTERS[ch];
    if (!paths) return;
    var x = X0 + i * ADVANCE;
    var tilt = ((i * 137) % 5 - 2) * 0.7;              // deterministic jitter
    var t = "translate(" + x + " 14) rotate(" + tilt + " 50 76)";
    paths.forEach(function(d){
      /* deterministic width variation — brush pressure, not marker pen */
      addStroke(d, t, 9.5 + ((strokeIdx++ * 7) % 4));
    });
  });

  /* trailing flourish off the last letter — the ink-line motif that
     leads the eye down toward the journey */
  var fx = X0 + (WORD.length - 1) * ADVANCE;
  addStroke("M84 128 C97 149 74 160 62 171", "translate(" + fx + " 14)", 3.5);

  /* nib */
  var nib = el("circle", { r: "4", fill: "#211B11", opacity: "0" }, svg);

  /* seal, stamped after the writing */
  var sealX = X0 + WORD.length * ADVANCE + 2;
  var seal = el("g", { opacity: "0", transform: "translate(" + sealX + " 108)" }, svg);
  el("rect", { x: "-17", y: "-17", width: "34", height: "34", rx: "6", fill: "#8E4A38" }, seal);
  var sealText = el("text", {
    x: "0", y: "9", "text-anchor": "middle",
    "font-family": "'Song Myung', serif", "font-size": "22", fill: "#EBDDB9"
  }, seal);
  sealText.textContent = "韓";   // same glyph as the CSS seals + favicon

  /* reveal helpers ---------------------------------------------- */

  function finishHero(){
    hero.classList.add("is-written");
    ["heroTagline", "heroActions"].forEach(function(id, i){
      var n = document.getElementById(id);
      if (n) setTimeout(function(){ n.classList.add("is-in"); }, i * 180);
    });
  }

  function stampSeal(instant){
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

  if (reduced){
    strokes.forEach(function(s){
      s.main.style.strokeDashoffset = 0;
      s.over.style.strokeDashoffset = 0;
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
