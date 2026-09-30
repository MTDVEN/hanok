/* ================================================================
   MAIN — shared wiring: scroll reveals, the floating CA pill,
   and link config. Section modules live in their own files.
================================================================= */

(function(){
  "use strict";

  var CFG = window.HANOK_CONFIG || {};

  /* ---- the ticker ------------------------------------------------
     Written into the manifesto and the <title> from one place, so
     launch day is a single edit in js/config.js. A slot left unwired
     keeps the "$XXX" already in the markup — the same
     read-as-unfinished placeholder as the CA pill's "coming at
     launch", and deliberately not a guess at the real ticker.

     **THE HERO IS NOT ON THIS LIST, ON PURPOSE** (VEN, 2026-08-29).
     The hero DRAWS the ticker, as brush strokes from
     CONFIG.token.wordmark — see LETTERS in js/hero.js. The line under
     the mark is #heroLore and carries prose, so writing the ticker
     into it would delete that copy. If the ticker ever needs to
     appear as text in the hero again, add a NEW element with
     .js-ticker on it; do not put #heroLore back in this selector. */

  var TOKEN = CFG.token || {};
  if (TOKEN.ticker){
    var tick = "$" + String(TOKEN.ticker).replace(/^\$/, "");
    Array.prototype.forEach.call(
      document.querySelectorAll(".js-ticker"),
      function(el){ el.textContent = tick; }
    );
    /* The separator is a middot, not an em dash: VEN, 2026-08-21, asked
       for every em dash to leave the page. Keep this in step with the
       <title> in index.html or the replace silently matches nothing. */
    document.title = document.title.replace(/^[^·]*·/,
      (TOKEN.ko ? TOKEN.ko + " " : "") + tick + " ·");
  }

  /* ---- scroll reveals (hero reveals are timed by hero.js) ------- */

  var toReveal = Array.prototype.filter.call(
    document.querySelectorAll(".reveal"),
    function(el){ return !el.closest("#hero"); }
  );

  if ("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    toReveal.forEach(function(el){ io.observe(el); });
  } else {
    toReveal.forEach(function(el){ el.classList.add("is-in"); });
  }

  /* ---- floating CA pill ----------------------------------------- */

  var pillWrap = document.getElementById("caFloat"),
      pill = document.getElementById("caCopy"),
      pillValue = document.getElementById("caValue"),
      hero = document.getElementById("hero");

  if (pillValue && CFG.ca){
    pillValue.textContent = CFG.ca.slice(0, 4) + "…" + CFG.ca.slice(-4);
  }

  if (pillWrap && hero){
    var onScroll = function(){
      var past = window.scrollY > hero.offsetHeight * 0.7;
      pillWrap.classList.toggle("is-on", past);
      pillWrap.setAttribute("aria-hidden", past ? "false" : "true");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Copy must never claim success it didn't have — a visitor pasting
     stale clipboard contents into a swap is the worst failure this
     page can produce. Clipboard API first, execCommand fallback,
     honest failure state last (showing the full CA to copy by hand). */
  function copyFallback(text){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  if (pill){
    pill.addEventListener("click", function(){
      if (!CFG.ca){
        flash((window.HANOK_T || String)("at launch"));
        return;
      }
      var fail = function(){
        flash(copyFallback(CFG.ca) ? (window.HANOK_T || String)("copied") : CFG.ca);   // show the real CA if all else fails
      };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(CFG.ca).then(function(){ flash((window.HANOK_T || String)("copied")); }, fail);
      } else {
        fail();
      }
    });
  }

  var flashTimer = null;
  function flash(text){
    if (!pillValue) return;
    var prev = CFG.ca ? CFG.ca.slice(0, 4) + "…" + CFG.ca.slice(-4) : (window.HANOK_T || String)("coming at launch");
    pillValue.textContent = text;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function(){ pillValue.textContent = prev; }, 1400);
  }

  /* ---- links ----------------------------------------------------- */

  var links = CFG.links || {};

  function wire(id, url, hideIfMissing){
    var el = document.getElementById(id);
    if (!el) return;
    if (url){
      el.href = url;
      el.target = "_blank";
    } else if (hideIfMissing){
      el.style.display = "none";
    } else {
      el.classList.add("is-tba");
      el.setAttribute("aria-disabled", "true");
      el.addEventListener("click", function(e){ e.preventDefault(); });
    }
  }

  /* Zico's call, 2026-08-21: the hero's primary button is DEX Screener,
     not a buy link — so it reads links.dexscreener, the same url the
     footer uses. `links.buy` is still honoured if a #btnBuy is ever
     put back. */
  wire("btnDex", links.dexscreener, false);
  wire("btnBuy", links.buy, false);
  wire("btnX", links.x, false);
  wire("footX", links.x, true);
  wire("footDex", links.dexscreener, true);
  wire("footTg", links.telegram, true);

  /* ---- how to join (index.html #join) -----------------------------
     Zico's step 3 has two lines that are blanks until launch: "CA:
     [paste official mainnet CA]" and "Buy: [DEX / launchpad link]".
     They are filled from here, never typed into the markup, so launch
     day stays the one edit in js/config.js. His closing line — "Until
     that line is filled, any other $TILES is not ours." — is only true
     while it is empty, so it leaves when the CA arrives. */
  var T = window.HANOK_T || String;
  var joinCa = document.getElementById("joinCa"),
      joinBuy = document.getElementById("joinBuy"),
      joinWarn = document.getElementById("joinWarn");
  if (joinCa){
    joinCa.textContent = CFG.ca || T("at launch");
    /* a value to copy is set in the monospace; a placeholder is not */
    if (!CFG.ca) joinCa.classList.remove("join__v");
  }
  if (joinBuy){
    joinBuy.textContent = "";
    if (links.buy){
      var ja = document.createElement("a");
      ja.href = links.buy;
      ja.target = "_blank";
      ja.rel = "noopener";
      ja.textContent = links.buy.replace(/^https?:\/\//, "");
      joinBuy.appendChild(ja);
    } else joinBuy.textContent = T("at launch");
  }
  if (joinWarn && CFG.ca) joinWarn.hidden = true;

})();
