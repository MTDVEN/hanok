/* ================================================================
   Build the deployable site —  node tools/build.js

   Writes dist/ containing ONLY what a visitor needs. Everything the
   repo carries for authoring — masters, dev tools, docs, placeholder
   art — stays out.

   Three rules worth knowing before you change this:

   1. **The village art is a hard dependency now.** This file used to
      ship a `state-NN.png` chain and nothing else; that route was
      abandoned in HANDOFF §9e and the states no longer exist, so the
      allow-list quietly shipped nothing and `dist/` came out with no
      `art/village/` at all. `js/village.js` mounts no `<img>` when the
      plate is missing — by design, so a dead src cannot paint Chrome's
      broken-image glyph — which means the failure is silent: the
      deploy simply shows the inline SVG fallback and looks fine.
      The building list is therefore LIFTED OUT OF `TYPES` in
      js/village.js rather than typed here — see FILES below. Add a
      sprite to the engine and it ships; there is nothing to remember.

   2. **config.js is rewritten in dist/, not in the repo.** DEMO_ZERO
      sets marketCap and holders to 0 so a public preview shows the
      empty valley rather than a fictional market cap. That is also
      exactly what launch day looks like. Set it false to show growth.

   3. **`fs.rmSync(DIST)` wipes dist/ including `dist/.vercel/`**, which
      is the local link to the Vercel project (`hanok`,
      prj_DGDPggbmI6NCnXLUALD0aHNjre3j). Nothing on Vercel is deleted —
      only the link — but the next deploy from dist/ will ask which
      project to use. The ID is recorded here so relinking is trivial.

   Deploy dist/ to any static host.
================================================================= */

var fs   = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var DIST = path.join(ROOT, "dist");

/* zero the village stats so they agree with the empty valley */
var DEMO_ZERO = true;

var FILES = [
  "index.html",
  "css/site.css",
  "js/config.js",
  "js/hero.js",
  "js/journey.js",
  "js/chart.js",
  "js/village.js",
  "js/main.js",
  /* the market-cap slider. TEMPORARY — out when the token is live and a
     price feed replaces it; js/preview.js's header lists all three
     lines to delete. */
  "js/preview.js",
  "art/scene-bg.png",
  "art/gyeongbokgung.png",
  "art/changdeokgung.png",
  "art/namsangol.png",
  "art/jeonju.png",
  /* the village: one opaque plate, and the transparent buildings, which
     are appended below. The `field-square` master and the
     `field-tall`/`field-wide` comparison crops stay out — plots are
     authored in the master's coordinates but it is never served, and
     nor are the `b-*-debug.png` cut checks. */
  "art/village/field.png"
];

/* THE BUILDING LIST IS LIFTED, NOT TYPED. It used to be six literals
   here with a note at the top of this file saying "if you change the
   village art, change FILES" — which is a rule a person has to remember
   at the exact moment they are thinking about something else, and a
   sprite that never reaches dist/ is SILENT: village.js mounts no <img>
   for a file it cannot load, so the page just quietly has fewer kinds
   of building on it. `TYPES` in js/village.js is the only list of
   sprites the site actually uses, so read that. Same lift as
   tools/plots.js and tools/render.js do. */
var VSRC = fs.readFileSync(path.join(ROOT, "js", "village.js"), "utf8");
var vm = /var TYPES = (\[[\s\S]*?\n  \]);/.exec(VSRC);
if (!vm) throw new Error("could not find TYPES in js/village.js — " +
                         "the village art cannot be shipped without it");
Function("return " + vm[1])().forEach(function(t){
  FILES.push("art/village/" + t.file);
});

function copy(rel){
  var src = path.join(ROOT, rel), dst = path.join(DIST, rel);
  if (!fs.existsSync(src)){ console.log("  MISSING  " + rel); return 0; }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return fs.statSync(src).size;
}

/* ---- run -------------------------------------------------------- */

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

var total = 0, n = 0, missing = 0;
FILES.forEach(function(f){
  var s = copy(f);
  if (s){ total += s; n++; } else { missing++; }
});

/* rewrite config for the demo */
if (DEMO_ZERO){
  var cfgPath = path.join(DIST, "js", "config.js");
  var cfg = fs.readFileSync(cfgPath, "utf8");
  cfg = cfg
    .replace(/marketCap:\s*[\d_]+/, "marketCap: 0")
    .replace(/holders:\s*[\d_]+/, "holders: 0")
    .replace(/(\/\* Village \+ tally)/,
      "/* DEMO BUILD: marketCap and holders zeroed by tools/build.js so\n" +
      "     the stats agree with an empty valley — which is also what\n" +
      "     launch day looks like. Set DEMO_ZERO = false to show growth. */\n\n  $1");
  fs.writeFileSync(cfgPath, cfg);
  console.log("\n  config.js rewritten for the demo (marketCap 0, holders 0)");
}

console.log("\n" + n + " files, " + (total / 1048576).toFixed(1) + "MB -> dist/");
/* A missing file is silent on the page — village.js deliberately mounts
   nothing rather than risk a broken-image glyph — so it has to be loud
   here instead. */
if (missing) console.log("!! " + missing + " file(s) MISSING above — dist/ is incomplete");
