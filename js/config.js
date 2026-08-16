/* ================================================================
   HANOK — site config. Everything launch-day lives here.
   Fill these in and nothing else needs touching.
================================================================= */

/* window.HANOK_REDUCED (the motion gate) is defined inline in the
   <head> of index.html so it can run before first paint. */

window.HANOK_CONFIG = {

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
