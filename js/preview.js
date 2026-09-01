/* ================================================================
   preview.js — scrub the market cap and watch the village grow.

   THIS SHIPS. It was tools/dev-slider.js, a dev-only toy behind
   `?dev=1` in a directory that never deployed; VEN, 2026-08-16, asked
   for it on the live site: *"I want it to have the slider but also
   make it minimisable. once the token to go with the website is live i
   will manually remove them and wire it up to a price checker, so that
   the houses corresponds to market cap."*

   So it is a TEMPORARY, DELIBERATE feature with a known removal date,
   and it is built to be deleted in one pass. To remove it when the
   token is live:

     1. delete this file
     2. delete the <script src="js/preview.js"> line in index.html
     3. delete "js/preview.js" from FILES in tools/build.js

   Nothing else references it. It touches the page through exactly one
   public call — window.HANOK.setVillage({ marketCap }) — which is the
   same door a live price feed will come through, so whatever replaces
   it inherits a proven interface.

   Why it exists: a still render says whether a building is in the right
   PLACE, but it says nothing about the order they arrive in, and the
   order is half of whether the village reads. `PLOTS` is in BUILD order
   — plot 0 is raised at $100k, the gate second, then outward — so the
   only way to judge that is to watch it happen. VEN, 2026-08-15: *"I
   want to see how buildings will render in as the price goes up."*
   Live, it does the same job for a visitor: the village's whole point
   is that it grows, and a still field never says so.

   The build-order numbers (the # toggle) are the other half, and they
   are for VEN rather than for visitors: they make a complaint sayable.
   "17 is wrong" is actionable; "one of them near the trees is wrong"
   is an afternoon. Hidden unless ?dev is present, now that this is
   public — see btnNum below.

   `?preview=0` turns the whole panel off without an edit.
================================================================= */

(function(){
  "use strict";

  if (window.__hanokDev) return;
  window.__hanokDev = 1;

  if (/[?&]preview=0/.test(location.search)) return;
  /* the build-order badges are a review tool, not a visitor feature */
  var DEV = /[?&]dev\b/.test(location.search);

  var CFG = (window.HANOK_CONFIG || {}).village || {};
  var PER = CFG.perRoof || 100000;
  var MAX = CFG.maxRoofs || 20;
  var plate = document.querySelector(".village__plate");
  if (!plate || !window.HANOK || !window.HANOK.setVillage){
    console.warn("[dev] village not ready — slider not mounted");
    return;
  }

  /* ---- chrome ---------------------------------------------------- */

  var css = document.createElement("style");
  css.textContent =
    "#devbar{position:fixed;left:16px;bottom:16px;z-index:200;" +
      "background:#1b1814;color:#e8dcc2;border:1px solid #4a4137;border-radius:8px;" +
      "padding:10px 12px;font:12px/1.45 ui-monospace,Menlo,Consolas,monospace;" +
      "box-shadow:0 8px 28px rgba(0,0,0,.45);width:300px;user-select:none;" +
      "transition:width .18s ease,bottom .3s ease}" +
    /* Step over the journey's note band on a phone, the same way the
       CA pill does — otherwise this dev panel sits on top of Zico's
       copy and every screenshot of the journey looks broken. Dies
       with the file; --jnote-h is 0px wherever the band is not up. */
    ".has-jnote #devbar{bottom:calc(16px + var(--jnote-h,0px))}" +
    /* MINIMISED: the panel keeps its header and drops everything else,
       so what is left is a small labelled pill that still reports the
       roof count — a collapsed control that shows nothing looks like a
       stray button. `width:auto` lets it shrink to that content. */
    "#devbar.min{width:auto;padding:7px 10px}" +
    "#devbar.min .body{display:none}" +
    "#devbar .r{display:flex;align-items:center;gap:8px}" +
    "#devbar .body .r{margin-top:8px}" +
    "#devbar .mini{color:#f3e7cb;font-weight:600;display:none}" +
    "#devbar.min .mini{display:inline}" +
    "#devbar.min .tag{letter-spacing:.1em}" +
    "#devbar b{color:#f3e7cb;font-weight:600}" +
    "#devbar .tag{color:#8a7c61;letter-spacing:.14em;font-size:9px}" +
    "#devbar input[type=range]{flex:1;accent-color:#c9a227;min-width:0}" +
    "#devbar button{background:#2b2620;color:#e8dcc2;border:1px solid #4a4137;" +
      "border-radius:5px;padding:3px 8px;cursor:pointer;font:inherit}" +
    "#devbar button:hover{background:#3a332b}" +
    "#devbar button.on{background:#c9a227;color:#1b1814;border-color:#c9a227}" +
    "#devbar .sp{flex:1}" +
    ".v-num{position:absolute;transform:translate(-50%,-50%);z-index:5;" +
      "background:#c9a227;color:#1b1814;font:600 10px/16px ui-monospace,monospace;" +
      "min-width:16px;height:16px;text-align:center;border-radius:8px;" +
      "pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.5)}";
  document.head.appendChild(css);

  var bar = document.createElement("div");
  bar.id = "devbar";
  bar.innerHTML =
    '<div class="r"><span class="tag">' + (window.HANOK_T || String)("MARKET CAP") + '</span>' +
      '<span class="mini" id="dvMini">0 ' + (window.HANOK_T || String)("roofs") + '</span>' +
      '<span class="sp"></span>' +
      '<button id="dvHide" title="' + (window.HANOK_T || String)("minimise") + '" aria-expanded="true">–</button></div>' +
    '<div class="body">' +
      '<div class="r"><b id="dvMc">$0</b><span class="sp"></span>' +
        '<span id="dvN">0 / ' + MAX + ' ' + (window.HANOK_T || String)("roofs") + '</span></div>' +
      '<div class="r"><input type="range" id="dvR" min="0" max="' + MAX + '" step="1" value="0" ' +
        'aria-label="market cap"></div>' +
      '<div class="r">' +
        '<button id="dvPrev" title="' + (window.HANOK_T || String)("one roof back") + '">◀</button>' +
        '<button id="dvPlay" title="' + (window.HANOK_T || String)("grow the village") + '">▶ ' + (window.HANOK_T || String)("play") + '</button>' +
        '<button id="dvNext" title="' + (window.HANOK_T || String)("one roof on") + '">▶</button>' +
        '<span class="sp"></span>' +
        (DEV ? '<button id="dvNum" title="show build order">#</button>' : '') +
        '<button id="dvGo" title="' + (window.HANOK_T || String)("scroll to the village") + '">⤓</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(bar);

  var range = bar.querySelector("#dvR"),
      outMc = bar.querySelector("#dvMc"),
      outN  = bar.querySelector("#dvN"),
      outMini = bar.querySelector("#dvMini"),
      btnPlay = bar.querySelector("#dvPlay"),
      btnNum  = bar.querySelector("#dvNum");

  /* ---- the one thing it does ------------------------------------- */

  /* Half a roof past the threshold, so the reading is unambiguously
     inside the band rather than sitting exactly on `Math.floor`'s edge
     — scrubbing to "$1.2m" and getting 11 roofs because of a float is
     the kind of thing that wastes an hour of someone's review. */
  function apply(n){
    var mc = n === 0 ? 0 : Math.round((n + 0.5) * PER);
    window.HANOK.setVillage({ marketCap: mc });
    outMc.textContent = fmt(n * PER);
    outN.textContent = n + " / " + MAX + " " + (window.HANOK_T || String)("roofs");
    outMini.textContent = n + " " + (window.HANOK_T || String)("roofs");
    if (numbers) drawNumbers();
  }

  function fmt(v){
    if (Math.round(v / 1e3) >= 1000) return "$" + (v / 1e6).toFixed(2) + "m";
    if (v >= 1e3) return "$" + Math.round(v / 1e3) + "k";
    return "$" + Math.round(v);
  }

  range.addEventListener("input", function(){ stop(); apply(+range.value); });

  function step(d){
    stop();
    range.value = Math.max(0, Math.min(MAX, +range.value + d));
    apply(+range.value);
  }
  bar.querySelector("#dvPrev").addEventListener("click", function(){ step(-1); });
  bar.querySelector("#dvNext").addEventListener("click", function(){ step(1); });

  /* ---- play ------------------------------------------------------ */

  var timer = null;
  /* slower than the .is-rising transition (.9s) on purpose — at the
     transition's own speed the roofs pile in on top of each other and
     you cannot see which one arrived */
  var BEAT = 1100;

  function stop(){
    if (!timer) return;
    clearInterval(timer); timer = null;
    btnPlay.textContent = "▶ " + (window.HANOK_T || String)("play");
    btnPlay.classList.remove("on");
  }
  function play(){
    if (timer) { stop(); return; }
    if (+range.value >= MAX){ range.value = 0; apply(0); }
    btnPlay.textContent = "⏸ " + (window.HANOK_T || String)("pause");
    btnPlay.classList.add("on");
    timer = setInterval(function(){
      if (+range.value >= MAX){ stop(); return; }
      range.value = +range.value + 1;
      apply(+range.value);
    }, BEAT);
  }
  btnPlay.addEventListener("click", play);

  /* ---- build-order numbers --------------------------------------- */

  var numbers = false, layer = null;

  function drawNumbers(){
    if (layer) layer.remove();
    layer = document.createElement("div");
    layer.style.cssText = "position:absolute;inset:0;pointer-events:none";
    /* Read the position off the sprite's own inline style rather than
       recomputing it from PLOTS: if the two ever disagree, the badge
       shows where the building actually IS, which is the thing being
       judged. */
    plate.querySelectorAll(".v-house").forEach(function(h){
      if (h.hidden) return;
      var b = document.createElement("span");
      b.className = "v-num";
      b.textContent = h.getAttribute("data-plot");
      b.style.left = h.style.left;
      b.style.top  = h.style.top;
      layer.appendChild(b);
    });
    plate.appendChild(layer);
  }

  if (btnNum) btnNum.addEventListener("click", function(){
    numbers = !numbers;
    btnNum.classList.toggle("on", numbers);
    if (numbers) drawNumbers();
    else if (layer){ layer.remove(); layer = null; }
  });

  bar.querySelector("#dvGo").addEventListener("click", function(){
    document.getElementById("village").scrollIntoView({ block: "center" });
  });

  /* ---- minimise -------------------------------------------------- */

  /* It MINIMISES, it does not close. The old × removed the bar from the
     DOM, which was fine for a dev toy behind a URL flag and is not fine
     on the live site: a visitor who dismisses the one control that
     demonstrates the village growing has no way back short of a
     reload. Collapsing keeps the way back visible.

     The choice persists, because being asked twice is the actual
     annoyance. localStorage is wrapped — Safari's private mode throws
     on write rather than no-opping, and a preview panel is not worth
     an uncaught exception. */
  var KEY = "hanok.preview.min";
  function remember(v){ try { localStorage.setItem(KEY, v ? "1" : "0"); } catch (e){} }
  function recall(){ try { return localStorage.getItem(KEY) === "1"; } catch (e){ return false; } }

  var btnHide = bar.querySelector("#dvHide");
  function setMin(v){
    bar.classList.toggle("min", v);
    btnHide.textContent = v ? "+" : "–";
    btnHide.title = (window.HANOK_T || String)(v ? "expand" : "minimise");
    btnHide.setAttribute("aria-expanded", v ? "false" : "true");
    if (v) stop();          // don't leave a timer running behind a closed panel
  }
  btnHide.addEventListener("click", function(){
    var v = !bar.classList.contains("min");
    setMin(v); remember(v);
  });
  setMin(recall());

  /* start where config.js has it, so the first thing on screen is the
     state the site is actually in */
  range.value = Math.max(0, Math.min(MAX, Math.floor((CFG.marketCap || 0) / PER)));
  apply(+range.value);

  if (DEV)
    console.log("[dev] market-cap slider mounted — " + MAX + " roofs at " +
                fmt(PER) + " each, field full at " + fmt(MAX * PER));
})();
