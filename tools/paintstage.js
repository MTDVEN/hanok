/* ================================================================
   tools/paintstage.js — the PAINTERS' stage: Zico's real $TiLES on flat
   green, for OpenArt to paint the crew onto, and the check that the
   still it sends back kept every letter where it was.

     node tools/paintstage.js make  [name]              writes art/crew/_work/<name>-input.png
                                                        and art/crew/<name>.stage.json
     node tools/paintstage.js guides [name]             + the grey mannequins of art/crew/<name>.spec.json
                                                        → art/crew/_work/<name>-guides.png (headless Chrome)
     node tools/paintstage.js check <still.png> [name]  registers the letters in a returned still,
                                                        writes art/crew/_work/<name>-check.png

   The still that shipped (2026-09-30, art/crew/src/still-paint.png) is
   an edit of `<name>-guides.png` with images 2-3 of art/crew/README.md's
   ink cast as the style: THE MANNEQUINS SET THE SIZE. Told the size in
   words — even with a yardstick in the picture — the model drew everyone
   ~1.5x the approved crew; asked to shrink its own result it changed
   nothing; given a finished still as a character reference it copied
   that still, size and all. Drawn over mannequins, it kept them.

   VEN, 2026-09-30: the characters should *"look like they are painting
   the ticker "$TILES" rather than being on a laptop like they are or
   moving tiles around"*. A painter only reads as painting if the brush
   TOUCHES the letter, and a figure drawn against an approximation of a
   letter misses the real one — Zico's strokes are slanted, dry and
   ragged. So the still is an EDIT of the real lettering: the traced
   outlines (js/title-zico.js `all`) rendered in the site's ink on flat
   #00FF00, at the scale the crew is drawn at, and the model paints the
   villagers onto THAT. Every brush meets a real edge.

   One still carries the whole cast: one frame, one transform. The
   stage records which rectangle of the title's svg units the frame
   covers (`view`), so tools/crew.html can lift each figure out of the
   clip and js/crew.js can put it back on exactly the spot it was
   painted against. The letters themselves are removed from the clip by
   the same outlines (crew.html `stage=`), not keyed: they are ink, and
   so is the painters' linework.

   SCALE. The crew's approved size is a head of SIZE × cap × 67/467 svg
   units (js/crew.js; 15.6 on desktop). The frame is 530 units tall — the
   T-bar kneeler's head to below the ground line — which at 2K (1536px)
   is 2.9px a unit: a 45px head, and 32px once PixVerse renders it at
   1080p (the strips' heads have been 17-20px). Left to itself the model
   draws the people ~1.5x that; the prompt has to give it a yardstick
   that is IN the picture (a standing painter's head level with the
   bottom tips of the $'s bars).
================================================================= */

var fs = require("fs"), path = require("path"), png = require("./png.js");
var ROOT = path.join(__dirname, "..");
var INK = [0x21, 0x1B, 0x11], GREEN = [0, 255, 0];

/* the frame: svg units [x0, y0, w, h], and its size in px. 2752x1536 is
   what Nano Banana 2 returns for 16:9 at 2K, so the input is that size
   and the letters need no resampling either way; w follows from h.
   NOT 4K: its 5504x3072 is upscaled in tiles — the green came back in
   visibly different patches and one tile (the S's top) blurred, in both
   variants of the first try (2026-09-30). */
var FRAME = [2752, 1536], VIEW_H = 530, VIEW_X0 = -64, VIEW_Y0 = -45;
var VIEW = [VIEW_X0, VIEW_Y0, VIEW_H * FRAME[0] / FRAME[1], VIEW_H];

function title(){
  var src = fs.readFileSync(path.join(ROOT, "js/title-zico.js"), "utf8"), window = {};
  eval(src);
  return window.HANOK_TITLE;
}
/* "M x y L x y … Z M …" → polygons */
function polys(d){
  var out = [], cur = null, re = /([MLZ])([^MLZ]*)/g, m;
  while ((m = re.exec(d))){
    if (m[1] === "Z"){ if (cur && cur.length > 2) out.push(cur); cur = null; continue; }
    var n = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (m[1] === "M"){ if (cur && cur.length > 2) out.push(cur); cur = []; }
    for (var i = 0; i + 1 < n.length; i += 2) cur.push([n[i], n[i + 1]]);
  }
  if (cur && cur.length > 2) out.push(cur);
  return out;
}
/* coverage (0..1) of the polygons, evenodd, in a W×H raster where svg
   point (x, y) lands at ((x - v[0]) * W / v[2], (y - v[1]) * H / v[3]);
   SS×SS samples a pixel */
function raster(P, W, H, v, SS){
  var sx = W / v[2], sy = H / v[3], edges = [], cov = new Float32Array(W * H), row = new Float32Array(W * SS);
  P.forEach(function(p){
    for (var i = 0; i < p.length; i++){
      var a = p[i], b = p[(i + 1) % p.length];
      var x0 = (a[0] - v[0]) * sx, y0 = (a[1] - v[1]) * sy, x1 = (b[0] - v[0]) * sx, y1 = (b[1] - v[1]) * sy;
      if (y0 !== y1) edges.push(y0 < y1 ? [x0, y0, x1, y1] : [x1, y1, x0, y0]);
    }
  });
  edges.sort(function(e, f){ return e[1] - f[1]; });
  for (var y = 0; y < H; y++){
    row.fill(0);
    for (var s = 0; s < SS; s++){
      var yy = y + (s + 0.5) / SS, xs = [];
      for (var k = 0; k < edges.length; k++){
        var e = edges[k]; if (e[1] > yy) break;
        if (e[3] > yy) xs.push(e[0] + (yy - e[1]) * (e[2] - e[0]) / (e[3] - e[1]));
      }
      xs.sort(function(a, b){ return a - b; });
      for (var j = 0; j + 1 < xs.length; j += 2){
        var xa = Math.max(0, Math.round(xs[j] * SS)), xb = Math.min(W * SS, Math.round(xs[j + 1] * SS));
        for (var x = xa; x < xb; x++) row[x]++;
      }
    }
    for (var x2 = 0; x2 < W; x2++){
      var c = 0; for (var t = 0; t < SS; t++) c += row[x2 * SS + t];
      cov[y * W + x2] = c / (SS * SS);
    }
  }
  return cov;
}

var mode = process.argv[2], NAME;
if (mode === "make"){
  NAME = process.argv[3] || "paint";
  var P = polys(title().all), W = FRAME[0], H = FRAME[1];
  var cov = raster(P, W, H, VIEW, 3), o = Buffer.alloc(W * H * 3);
  for (var k = 0; k < W * H; k++) for (var c = 0; c < 3; c++) o[k * 3 + c] = Math.round(GREEN[c] + (INK[c] - GREEN[c]) * cov[k]);
  fs.mkdirSync(path.join(ROOT, "art/crew/_work"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "art/crew/_work", NAME + "-input.png"), png.encode(W, H, 3, 2, o));
  var stage = { name: NAME, note: "the svg-unit rectangle [x0, y0, w, h] of $TiLES that the still's frame covers (tools/paintstage.js)",
                view: VIEW.map(function(v){ return +v.toFixed(3); }), frame: FRAME };
  fs.writeFileSync(path.join(ROOT, "art/crew", NAME + ".stage.json"), JSON.stringify(stage, null, 2) + "\n");
  console.log("wrote art/crew/_work/" + NAME + "-input.png " + W + "x" + H + " and art/crew/" + NAME + ".stage.json  view " + stage.view.join(", ") +
    "  (" + (W / VIEW[2]).toFixed(3) + " px/unit)");
} else if (mode === "guides"){
  /* the lettering plus the spec's mannequins, as an SVG in the title's own
     units over the stage's view; Chrome is the renderer on this machine */
  NAME = process.argv[3] || "paint";
  var st0 = JSON.parse(fs.readFileSync(path.join(ROOT, "art/crew", NAME + ".stage.json"), "utf8"));
  var spec = JSON.parse(fs.readFileSync(path.join(ROOT, "art/crew", NAME + ".spec.json"), "utf8"));
  var GREY = "#9a9a9a", V = st0.view;
  function shape(s){
    if (s[0] === "c") return '<circle cx="' + s[1] + '" cy="' + s[2] + '" r="' + s[3] + '" fill="' + (s[4] || GREY) + '"/>';
    if (s[0] === "e") return '<ellipse cx="' + s[1] + '" cy="' + s[2] + '" rx="' + s[3] + '" ry="' + s[4] + '" fill="' + (s[5] || GREY) + '"/>';
    if (s[0] === "p") return '<path d="' + s[1] + '" fill="' + (s[2] || GREY) + '"/>';
    if (s[0] === "l") return '<polyline points="' + s[1].map(function(p){ return p.join(","); }).join(" ") + '" fill="none" stroke="' + (s[3] || GREY) +
      '" stroke-width="' + s[2] + '" stroke-linecap="round" stroke-linejoin="round"/>';
    if (s[0] === "b"){                                  // a brush: wooden handle, black bristle tip ending at the letter
      var a = s[1], b = s[2], w = s[3], hl = s[4] || 5, l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      var m = [b[0] - (b[0] - a[0]) / l * hl, b[1] - (b[1] - a[1]) / l * hl];
      return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + m[0] + '" y2="' + m[1] + '" stroke="#b08a5a" stroke-width="' + w + '" stroke-linecap="round"/>' +
             '<line x1="' + m[0] + '" y1="' + m[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#111" stroke-width="' + (w * 1.8) + '" stroke-linecap="round"/>';
    }
    return "";
  }
  var svgs = '<svg xmlns="http://www.w3.org/2000/svg" width="' + st0.frame[0] + '" height="' + st0.frame[1] + '" viewBox="' + V.join(" ") + '" preserveAspectRatio="none">' +
    '<rect x="' + V[0] + '" y="' + V[1] + '" width="' + V[2] + '" height="' + V[3] + '" fill="#00ff00"/>' +
    '<path d="' + title().all + '" fill="#211B11" fill-rule="evenodd"/>' +
    spec.mannequins.map(function(mq){ return mq.shapes.map(shape).join(""); }).join("") + '</svg>';
  var html = path.join(ROOT, "art/crew/_work", NAME + "-guides.html"), out = path.join(ROOT, "art/crew/_work", NAME + "-guides.png");
  fs.writeFileSync(html, '<!doctype html><html><body style="margin:0;background:#0f0">' + svgs + '</body></html>');
  var cp = require("child_process"), os = require("os");
  var CH = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
  cp.spawnSync(CH, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--user-data-dir=" + path.join(os.tmpdir(), "hanok-paintstage"), "--window-size=" + st0.frame.join(","),
    "--screenshot=" + out, "file:///" + html.replace(/\\/g, "/")], { stdio: "ignore" });
  console.log(fs.existsSync(out) ? "wrote art/crew/_work/" + NAME + "-guides.png (" + spec.mannequins.length + " mannequins)" : "!! Chrome did not write the guides — check $CHROME");
} else if (mode === "check"){
  /* where are the letters in the still? Its dark pixels against the
     outlines, over small shifts and scales, both at 1/4 size; the best
     overlap is where the model put them (figures' hair and linework are
     dark too, but they are a sliver of the letters' area) */
  NAME = process.argv[4] || "paint";
  var st = JSON.parse(fs.readFileSync(path.join(ROOT, "art/crew", NAME + ".stage.json"), "utf8"));
  var im = png.decode(fs.readFileSync(process.argv[3])), D = im.w > 4000 ? 8 : 4, w = Math.floor(im.w / D), h = Math.floor(im.h / D);
  var dark = new Uint8Array(w * h);
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++){
    var n = 0, s2 = 0;
    for (var dy = 0; dy < D; dy++) for (var dx = 0; dx < D; dx++){
      var i = ((y * D + dy) * im.w + x * D + dx) * im.ch;
      s2 += 0.299 * im.data[i] + 0.587 * im.data[i + 1] + 0.114 * im.data[i + 2]; n++;
    }
    dark[y * w + x] = s2 / n < 90 ? 1 : 0;
  }
  var P2 = polys(title().all), nDark = 0;
  for (var q = 0; q < w * h; q++) nDark += dark[q];
  /* IoU of the outlines (at scale sc about the frame's corner, shifted
     ox, oy px) with the dark pixels — counted over the letter pixels only */
  function iouAt(sc, list){
    return function(ox, oy){
      var inter = 0;
      for (var j = 0; j < list.length; j += 2){
        var x2 = list[j] + ox, y2 = list[j + 1] + oy;
        if (x2 >= 0 && y2 >= 0 && x2 < w && y2 < h) inter += dark[y2 * w + x2];
      }
      return inter / Math.max(1, list.length / 2 + nDark - inter);
    };
  }
  function letterList(sc){
    var m0 = raster(P2, w, h, [st.view[0], st.view[1], st.view[2] / sc, st.view[3] / sc], 1), out = [];
    for (var y2 = 0; y2 < h; y2++) for (var x2 = 0; x2 < w; x2++) if (m0[y2 * w + x2] > 0.5) out.push(x2, y2);
    return out;
  }
  /* shift first at scale 1 (±80px), then scale ±3% around that shift */
  var best = { iou: -1 }, f1 = iouAt(1, letterList(1));
  for (var oy = -10; oy <= 10; oy++) for (var ox = -10; ox <= 10; ox++){
    var iou = f1(ox, oy); if (iou > best.iou) best = { iou: iou, sc: 1, ox: ox, oy: oy };
  }
  for (var sc = 0.97; sc <= 1.0301; sc += 0.005){
    var fs2 = iouAt(sc, letterList(sc)), b0 = best;
    for (var oy2 = b0.oy - 3; oy2 <= b0.oy + 3; oy2++) for (var ox2 = b0.ox - 3; ox2 <= b0.ox + 3; ox2++){
      var iou2 = fs2(ox2, oy2); if (iou2 > best.iou) best = { iou: iou2, sc: sc, ox: ox2, oy: oy2 };
    }
  }
  best.ox *= D; best.oy *= D;
  console.log("letters in the still: scale " + best.sc.toFixed(3) + ", shift " + best.ox + "," + best.oy + " px (±" + D / 2 + "), IoU with the outlines " + best.iou.toFixed(3) +
    (best.iou > 0.75 && Math.abs(best.sc - 1) < 0.006 && Math.abs(best.ox) <= D && Math.abs(best.oy) <= D ? "  — kept in place" : "  — MOVED OR REDRAWN: check the overlay"));
  /* overlay at 1/4: black both, blue outline only, red still-dark only */
  var m1 = raster(P2, w, h, st.view, 2), ov = Buffer.alloc(w * h * 3);
  for (var k2 = 0; k2 < w * h; k2++){
    var A1 = m1[k2] > 0.5, B1 = dark[k2], col = A1 && B1 ? [0, 0, 0] : A1 ? [40, 90, 255] : B1 ? [230, 30, 30] : [235, 235, 235];
    ov[k2 * 3] = col[0]; ov[k2 * 3 + 1] = col[1]; ov[k2 * 3 + 2] = col[2];
  }
  fs.writeFileSync(path.join(ROOT, "art/crew/_work", NAME + "-check.png"), png.encode(w, h, 3, 2, ov));
  console.log("wrote art/crew/_work/" + NAME + "-check.png (black = letters kept, blue = letter lost, red = new dark: the painters)");
} else {
  console.log("usage: node tools/paintstage.js make [name] | guides [name] | check <still.png> [name]");
}
