/* ================================================================
   MAIN — shared wiring: scroll reveals, the floating CA pill,
   and link config. Section modules live in their own files.
================================================================= */

(function(){
  "use strict";

  var CFG = window.HANOK_CONFIG || {};

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
        flash("at launch");
        return;
      }
      var fail = function(){
        flash(copyFallback(CFG.ca) ? "copied" : CFG.ca);   // show the real CA if all else fails
      };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(CFG.ca).then(function(){ flash("copied"); }, fail);
      } else {
        fail();
      }
    });
  }

  var flashTimer = null;
  function flash(text){
    if (!pillValue) return;
    var prev = CFG.ca ? CFG.ca.slice(0, 4) + "…" + CFG.ca.slice(-4) : "coming at launch";
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

  wire("btnBuy", links.buy, false);
  wire("btnX", links.x, false);
  wire("footX", links.x, true);
  wire("footDex", links.dexscreener, true);
  wire("footTg", links.telegram, true);

})();
