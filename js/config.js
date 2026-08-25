/* ================================================================
   HANOK — site config. Everything launch-day lives here.
   Fill these in and nothing else needs touching.
================================================================= */

/* window.HANOK_REDUCED (the motion gate) is defined inline in the
   <head> of index.html so it can run before first paint. */

window.HANOK_CONFIG = {

  /* ---- the token's name -----------------------------------------
     Zico, 2026-08-21: the token is 기와 / GIWA — Korean for roof
     tiles, and the name of the Upbit L2 it launches on. `ko` is what
     the hero WRITES, and it is not free text: every character needs
     brush strokes in LETTERS (js/hero.js), so changing it means
     authoring those. `roman` is the eyebrow above it.

     `ticker` is still Zico's to give — he wrote "$XXX" in the brief,
     so null renders exactly that, a placeholder that reads as one.
     Fill it in and the hero, the <title> and the manifesto all follow;
     nothing else needs touching. */
  token: {
    ko: "기와",
    roman: "GIWA",
    ticker: null,       // e.g. "GIWA" — rendered as $GIWA

    /* THE SEAL GLYPH — one source, four consumers. It is stamped after
       the hero title, printed on the manifesto and footer seals, and
       carried by every marker on the journey map; the favicon in
       index.html is a static data-URI and is the ONE copy that has to
       be changed by hand alongside this. Until 2026-08-25 it was four
       hard-coded copies with no source at all.

       韓 — hanja, read 한, and the character for Korea itself: the 韓
       of 한국 / 韓國 and of 대한민국 / 大韓民國. Korean papers still
       use it as the one-character stand-in for the country in
       headlines, and hanja in seal script is what a 도장 has always
       been carved in, so it is the right register for a stamp even
       though everything else on the page is hangul.

       瓦 (the hanja for a roof tile, read `wa` — the 와 of 기와, and
       of 청와대 / 靑瓦臺, the Blue House, named for its blue tiles)
       was tried for exactly one round and rejected on looks. VEN,
       2026-08-25: *"the roof tile character doesnt look all that
       aesthetic"*, then *"lets just use han"*. He is right about the
       shape — 瓦's diagonal leaves the bottom-left of a square stamp
       empty, so it reads as falling over at 30px. Meaning lost to
       balance, which is the correct trade for a mark this small.

       `?seal=` overrides it, and tools/seal.html stamps every
       candidate at all three real sizes — that sheet is how this was
       decided and is the way to decide it again. One or two
       characters both work; two are set side by side at 0.62, which
       is how a two-character 도장 is cut. */
    seal: "韓"
  },

  /* Contract address. null = show "coming at launch". */
  ca: null,

  /* Links. null hides the corresponding button/anchor. */
  links: {
    buy: null,          // e.g. "https://pump.fun/coin/<ca>"
    x: null,            // e.g. "https://x.com/<handle>"
    dexscreener: null,  // e.g. "https://dexscreener.com/solana/<pair>"
    telegram: null
  },

  /* GeckoTerminal pool address for the live chart.
     null = deterministic mock candles (the "preview" ledger).
     e.g. pool: "So1anaPoolAddress..." + network: "solana"        */
  chart: {
    network: "solana",
    pool: null,
    timeframe: "minute",   // minute | hour | day
    aggregate: 15          // candle width in units of `timeframe`
  },

  /* Village + tally. Until a live source is wired these mock
     values drive the field. One hanok per `perRoof` of market cap. */
  village: {
    marketCap: 600_000,    // mock — swap for live MC at launch
    holders: 1284,         // mock — "villager tally"
    perRoof: 100_000,
    /* Must equal the number of entries in PLOTS (js/village.js), which
       tools/plots.js generates — `node tools/plots.js --want N --write`
       and set this to the count it reports. VEN 2026-08-14 asked for
       smaller buildings and more room to grow, then 2026-08-15 for the
       gaps at the top of the valley to be filled — *"if this means
       increase max capacity of buildings then so be it"*. 20 -> 24 ->
       34 -> 42 -> 55 -> 60, and 60 is the valley's ceiling under the
       current rules: --want 60, 70 and 90 all produce the same 60 plots,
       34 of them in the back row where the gaps were.

       The last step came from letting a plot be reserved for the SMALL
       buildings only instead of for the widest one that could ever
       arrive (js/village.js, FOOT_N in tools/plots.js). More sprites at
       cottage scale would raise it again; more at farmhouse scale would
       not.

       AT $100k A ROOF THE FIELD NOW FILLS AT $6.0M. That was $2.0M when
       the number was chosen and it has never been re-decided; ~$33k a
       roof would hold the original ceiling, ~$100k puts it at $6.0M.
       Tokenomics, not layout — VEN's call, still open. */
    maxRoofs: 60
  }
};

/* ---- the seal glyph, resolved once ------------------------------
   Three consumers read this and they must never disagree: js/hero.js
   stamps it after the title, js/journey.js puts it on every map
   marker, and css/site.css prints it on the manifesto and footer
   seals through `--seal-glyph`. CSS cannot read a query string, so
   the resolution happens HERE — config.js is the first script on the
   page — and is handed to CSS as a custom property.

   `--seal-scale` goes with it: a two-character 도장 is cut at about
   0.62 of a one-character one, side by side in the same square, and
   every consumer multiplies its own font-size by it rather than
   carrying a second set of numbers.

   The value is sanitised, not trusted. It reaches innerHTML in
   js/journey.js, and `?seal=` is a URL parameter anyone can put in a
   link — so angle brackets, quotes and ampersands come out and the
   length is capped at two characters. */
(function(){
  var C = window.HANOK_CONFIG.token;
  var m = /[?&]seal=([^&]*)/.exec(location.search);
  var g = m ? decodeURIComponent(m[1]) : C.seal;
  g = String(g || "").replace(/[<>&"'\\/]/g, "").trim().slice(0, 2);
  if (!g) g = "韓";
  C.seal = g;
  C.sealScale = g.length > 1 ? 0.62 : 1;
  var r = document.documentElement.style;
  r.setProperty("--seal-glyph", '"' + g + '"');
  r.setProperty("--seal-scale", String(C.sealScale));
})();
