/* ================================================================
   LEDGER — candles drawn in ink.

   Filled ink candle = rise, hollow candle = fall (the whole chart
   stays two-tone, like the rest of the sheet).

   Runs on deterministic mock data until CONFIG.chart.pool is set,
   then pulls OHLCV from GeckoTerminal and refreshes itself.
================================================================= */

(function(){
  "use strict";

  var svg = document.getElementById("ledgerChart");
  if (!svg) return;

  var CFG = (window.HANOK_CONFIG || {}).chart || {};
  var note = document.getElementById("ledgerNote");
  var reduced = window.HANOK_REDUCED();

  var INK = "#211B11", SOFT = "#4E4636", PAPER = "#EBDDB9";
  var W = 840, H = 400, ML = 18, MR = 70, MT = 18, MB = 42;

  /* ---- mock data: a deterministic random walk ------------------- */

  function mulberry32(a){
    return function(){
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function mockCandles(n){
    var rnd = mulberry32(20260811), out = [], price = 0.00052, i;
    for (i = 0; i < n; i++){
      var drift = (rnd() - 0.44) * 0.055;
      if (rnd() < 0.06) drift -= 0.05;              // the occasional scare
      var open = price,
          close = open * (1 + drift),
          hi = Math.max(open, close) * (1 + rnd() * 0.018),
          lo = Math.min(open, close) * (1 - rnd() * 0.018);
      out.push({ o: open, h: hi, l: lo, c: close });
      price = close;
    }
    return out;
  }

  /* ---- formatting ----------------------------------------------- */

  function fmtPrice(p){
    if (p >= 1)      return "$" + p.toFixed(2);
    if (p >= 0.01)   return "$" + p.toFixed(4);
    if (p >= 0.0001) return "$" + p.toFixed(6);
    return "$" + p.toPrecision(3);
  }

  /* ---- render ---------------------------------------------------- */

  var lastData = null, entranceIO = null, hasLive = false;

  function render(candles, labels){
    lastData = { candles: candles, labels: labels };

    var iw = W - ML - MR, ih = H - MT - MB;
    var min = Infinity, max = -Infinity;
    candles.forEach(function(k){
      if (k.l < min) min = k.l;
      if (k.h > max) max = k.h;
    });
    var pad = (max - min) * 0.08 || 1;
    min = Math.max(0, min - pad); max += pad;

    /* keep axis text readable when the fixed viewBox shrinks on phones;
       never below 1 so desktop text keeps its size */
    var fw = svg.clientWidth || (svg.parentElement && svg.parentElement.clientWidth) || W;
    var fs = (12.5 * Math.min(2, Math.max(1, W / Math.max(420, fw)))).toFixed(1);

    function y(p){ return MT + ih * (1 - (p - min) / (max - min)); }
    var slot = iw / candles.length, bw = Math.max(3, slot * 0.62);

    var s = "";

    /* faint ruled lines, like a ledger page */
    var g;
    for (g = 0; g <= 4; g++){
      var gy = MT + ih * g / 4, price = max - (max - min) * g / 4;
      s += '<line x1="' + ML + '" y1="' + gy.toFixed(1) + '" x2="' + (W - MR) +
           '" y2="' + gy.toFixed(1) + '" stroke="' + INK + '" stroke-width="1" opacity="0.14"/>';
      s += '<text x="' + (W - MR + 10) + '" y="' + (gy + 4).toFixed(1) +
           '" font-family="Gowun Batang, serif" font-size="' + fs + '" fill="' + SOFT + '">' +
           fmtPrice(price) + "</text>";
    }

    /* candles */
    candles.forEach(function(k, i){
      var cx = ML + slot * (i + 0.5),
          up = k.c >= k.o,
          top = y(Math.max(k.o, k.c)),
          bot = y(Math.min(k.o, k.c)),
          bh  = Math.max(1.6, bot - top);

      s += '<g class="candle" data-i="' + i + '">' +
             '<line x1="' + cx.toFixed(1) + '" y1="' + y(k.h).toFixed(1) +
             '" x2="' + cx.toFixed(1) + '" y2="' + y(k.l).toFixed(1) +
             '" stroke="' + INK + '" stroke-width="1.4"/>' +
             '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + top.toFixed(1) +
             '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '"' +
             (up ? ' fill="' + INK + '"'
                 : ' fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"') +
           "/></g>";
    });

    /* time labels */
    (labels || []).forEach(function(lb){
      var cx = ML + slot * (lb.i + 0.5);
      s += '<text x="' + cx.toFixed(1) + '" y="' + (H - 14) +
           '" text-anchor="middle" font-family="Gowun Batang, serif" font-size="' + fs + '" fill="' + SOFT + '">' +
           lb.t + "</text>";
    });

    /* last price marker */
    var last = candles[candles.length - 1];
    s += '<line x1="' + ML + '" y1="' + y(last.c).toFixed(1) + '" x2="' + (W - MR) +
         '" y2="' + y(last.c).toFixed(1) + '" stroke="' + INK +
         '" stroke-width="1" stroke-dasharray="2 5" opacity="0.5"/>';

    svg.innerHTML = s;

    /* staggered entrance, once, when the ledger scrolls into view */
    if (!reduced && !svg.dataset.entered && "IntersectionObserver" in window){
      var nodes = svg.querySelectorAll("g.candle");
      nodes.forEach(function(n, i){
        n.style.opacity = "0";
        n.style.transition = "opacity .45s ease " + (i * 14) + "ms";
      });
      if (entranceIO) entranceIO.disconnect();   // re-renders must not stack observers
      entranceIO = new IntersectionObserver(function(entries){
        if (!entries[0].isIntersecting) return;
        svg.dataset.entered = "1";
        nodes.forEach(function(n){ n.style.opacity = "1"; });
        entranceIO.disconnect();
        entranceIO = null;
      }, { threshold: 0.25 });
      entranceIO.observe(svg);
    }
  }

  /* labels rescale with the frame */
  var resizeTimer = null;
  window.addEventListener("resize", function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      if (lastData) render(lastData.candles, lastData.labels);
    }, 150);
  });

  /* ---- data sources --------------------------------------------- */

  function showMock(){
    var candles = mockCandles(72);
    render(candles, [
      { i: 6,  t: "-16h" }, { i: 24, t: "-12h" },
      { i: 42, t: "-7h"  }, { i: 60, t: "-3h"  }, { i: 70, t: "now" }
    ]);
  }

  function showLive(){
    var url = "https://api.geckoterminal.com/api/v2/networks/" + CFG.network +
              "/pools/" + CFG.pool + "/ohlcv/" + (CFG.timeframe || "minute") +
              "?aggregate=" + (CFG.aggregate || 15) + "&limit=72";
    fetch(url, { headers: { accept: "application/json" } })
      .then(function(r){ if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function(j){
        var rows = (((j || {}).data || {}).attributes || {}).ohlcv_list || [];
        if (!rows.length) throw new Error("empty");
        rows = rows.slice().sort(function(a, b){ return a[0] - b[0]; });
        var candles = rows
          .map(function(r){ return { t: r[0], o: +r[1], h: +r[2], l: +r[3], c: +r[4] }; })
          .filter(function(k){
            return isFinite(k.o) && isFinite(k.h) && isFinite(k.l) && isFinite(k.c) && k.l > 0;
          });
        if (candles.length < 2) throw new Error("bad rows");
        var labels = [], step = Math.max(1, Math.floor(candles.length / 4));
        for (var i = 0; i < candles.length; i += step){
          var d = new Date(candles[i].t * 1000);
          labels.push({ i: i, t: d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0") });
        }
        render(candles, labels);
        hasLive = true;
        if (note) note.textContent = "Live from the ledger, redrawn every few minutes.";
      })
      .catch(function(){
        if (hasLive){
          /* keep the last good live render; just say it's paused */
          if (note) note.textContent = "Last known ledger. Refresh paused.";
        } else {
          if (note) note.textContent = "A preview, drawn in ink. The real ledger begins at launch.";
          showMock();   // the sheet is never blank
        }
      });
  }

  if (CFG.pool){
    showLive();
    setInterval(function(){
      if (document.visibilityState === "visible") showLive();
    }, 120000);
  } else {
    showMock();
  }

})();
