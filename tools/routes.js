/* ================================================================
   tools/routes.js — the villagers' walking routes, found on the plate.

     node tools/routes.js            writes art/village/routes.json
     node tools/routes.js --debug    + art/village/_work/routes-debug.png

   The walkers (js/village.js, crew-test branch) follow the dirt paths
   painted into art/village/field.png. Nothing is traced by hand: the
   paths are the one warm, bright thing in a green valley (path ~
   (215,190,155), grass ~(145,150,110)), so a colour test finds them,
   and each route is the CHEAPEST way through that mask between the
   waypoints named in ROUTES below — cheap along the middle of a path
   (cost falls with distance from its edge), dear off it — so a route
   rides the centreline and still bridges the odd pale gap where the
   brush thinned out.

   To add or move a route: edit ROUTES (plate pixels, 1024x717 — read
   them off the debug image), re-run, look at the debug image.
   Coordinates are written out as fractions of the plate, the same
   space .v-house sits in.
================================================================= */

var fs = require("fs"), path = require("path"), png = require("./png.js");
var ROOT = path.join(__dirname, ".."), DEBUG = process.argv.indexOf("--debug") >= 0;

/* waypoints in plate px. Each route is walked end to end and back.
   `run` marks a villager who runs instead of walks. */
var ROUTES = [
  { name: "trunk-left",  pts: [[548, 700], [486, 600], [335, 480]] },
  { name: "trunk-right", pts: [[548, 700], [560, 500], [755, 362]] },
  { name: "mid-up",      pts: [[445, 360], [416, 210]] },
  { name: "middle",      pts: [[586, 276], [575, 470], [520, 560]] }
];

var im = png.decode(fs.readFileSync(path.join(ROOT, "art/village/field.png")));
var W = im.w, H = im.h, d = im.data, CH = im.ch;

/* the path mask: warm, bright, not grass — and only inside the valley,
   so the misty paper round the edges (the same warm colour) is not a
   path. The box is where the valley floor is. */
var mask = new Uint8Array(W * H);
for (var y = 0; y < H; y++) for (var x = 0; x < W; x++){
  if (x < 170 || x > 890 || y < 20 || y > 712) continue;
  var i = (y * W + x) * CH, r = d[i], g = d[i + 1], b = d[i + 2];
  if (r > 185 && r - g > 10 && r - b > 34) mask[y * W + x] = 1;
}

/* chamfer distance to the nearest non-path pixel (3-4 metric, /3) */
var dt = new Float32Array(W * H);
for (var k = 0; k < W * H; k++) dt[k] = mask[k] ? 1e9 : 0;
function relax(x, y, dx, dy, c){
  var nx = x + dx, ny = y + dy;
  if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
  var a = y * W + x, b2 = ny * W + nx;
  if (dt[b2] + c < dt[a]) dt[a] = dt[b2] + c;
}
for (y = 0; y < H; y++) for (x = 0; x < W; x++){
  relax(x, y, -1, 0, 3); relax(x, y, 0, -1, 3); relax(x, y, -1, -1, 4); relax(x, y, 1, -1, 4);
}
for (y = H - 1; y >= 0; y--) for (x = W - 1; x >= 0; x--){
  relax(x, y, 1, 0, 3); relax(x, y, 0, 1, 3); relax(x, y, 1, 1, 4); relax(x, y, -1, 1, 4);
}
for (k = 0; k < W * H; k++) dt[k] /= 3;

/* Dijkstra on the pixel grid (binary heap) */
function cost(k){ return mask[k] ? 1 + 6 / (1 + dt[k]) : 45; }
function route(a, b){
  var N = W * H, dist = new Float32Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1);
  var heap = [], s = a[1] * W + a[0], t = b[1] * W + b[0];
  function push(n, pri){
    heap.push([pri, n]); var c = heap.length - 1;
    while (c > 0){ var p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; var tmp = heap[p]; heap[p] = heap[c]; heap[c] = tmp; c = p; }
  }
  function pop(){
    var top = heap[0], last = heap.pop();
    if (heap.length){ heap[0] = last; var c = 0;
      for (;;){ var l = 2 * c + 1, r2 = l + 1, m = c;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r2 < heap.length && heap[r2][0] < heap[m][0]) m = r2;
        if (m === c) break; var tmp = heap[m]; heap[m] = heap[c]; heap[c] = tmp; c = m; } }
    return top;
  }
  dist[s] = 0; push(s, 0);
  var DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
  while (heap.length){
    var cur = pop(), n = cur[1];
    if (cur[0] > dist[n]) continue;
    if (n === t) break;
    var cx = n % W, cy = (n / W) | 0;
    for (var j = 0; j < 8; j++){
      var nx = cx + DX[j], ny = cy + DY[j];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      var m = ny * W + nx, step = (j < 4 ? 1 : 1.4142) * cost(m), nd = dist[n] + step;
      if (nd < dist[m]){ dist[m] = nd; prev[m] = n; push(m, nd); }
    }
  }
  var out = [];
  for (var q = t; q !== -1; q = prev[q]) out.push([q % W, (q / W) | 0]);
  return out.reverse();
}

/* Douglas-Peucker, then a light Chaikin pass so the walk is smooth */
function simplify(pts, eps){
  if (pts.length < 3) return pts;
  var a = pts[0], b = pts[pts.length - 1], dmax = 0, idx = 0;
  for (var i = 1; i < pts.length - 1; i++){
    var p = pts[i], num = Math.abs((b[1] - a[1]) * p[0] - (b[0] - a[0]) * p[1] + b[0] * a[1] - b[1] * a[0]);
    var den = Math.hypot(b[1] - a[1], b[0] - a[0]) || 1, dd = num / den;
    if (dd > dmax){ dmax = dd; idx = i; }
  }
  if (dmax <= eps) return [a, b];
  return simplify(pts.slice(0, idx + 1), eps).slice(0, -1).concat(simplify(pts.slice(idx), eps));
}
function chaikin(pts){
  var out = [pts[0]];
  for (var i = 0; i < pts.length - 1; i++){
    var p = pts[i], q = pts[i + 1];
    out.push([p[0] * .75 + q[0] * .25, p[1] * .75 + q[1] * .25], [p[0] * .25 + q[0] * .75, p[1] * .25 + q[1] * .75]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

var result = { plate: "art/village/field.png", w: W, h: H, routes: [] };
ROUTES.forEach(function(R){
  var raw = [];
  for (var i = 0; i < R.pts.length - 1; i++){
    var seg = route(R.pts[i], R.pts[i + 1]);
    raw = raw.concat(i ? seg.slice(1) : seg);
  }
  var off = raw.filter(function(p){ return !mask[p[1] * W + p[0]]; }).length;
  var pts = chaikin(simplify(raw, 1.6));
  var len = 0;
  for (var j = 1; j < pts.length; j++) len += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
  console.log(R.name + ": " + raw.length + " px -> " + pts.length + " pts, " + Math.round(len) +
              "px long, " + off + " px off the painted path");
  result.routes.push({ name: R.name, run: !!R.run,
    pts: pts.map(function(p){ return [+(p[0] / W).toFixed(4), +(p[1] / H).toFixed(4)]; }) });
  R.drawn = pts;
});
fs.writeFileSync(path.join(ROOT, "art/village/routes.json"), JSON.stringify(result));
console.log("wrote art/village/routes.json");

if (DEBUG){
  var o = Buffer.alloc(W * H * 3);
  for (k = 0; k < W * H; k++){
    var sh = mask[k] ? 0.75 : 0.45;
    o[k * 3] = d[k * CH] * sh; o[k * 3 + 1] = d[k * CH + 1] * sh; o[k * 3 + 2] = d[k * CH + 2] * sh;
  }
  var COL = [[255, 60, 60], [60, 160, 255], [255, 220, 40], [200, 80, 255]];
  ROUTES.forEach(function(R, n){
    var c = COL[n % COL.length], pts = R.drawn;
    for (var j = 1; j < pts.length; j++){
      var a = pts[j - 1], b = pts[j], steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2);
      for (var s2 = 0; s2 <= steps; s2++){
        var px = Math.round(a[0] + (b[0] - a[0]) * s2 / steps), py = Math.round(a[1] + (b[1] - a[1]) * s2 / steps);
        for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++){
          var X = px + ox, Y = py + oy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
          var q = (Y * W + X) * 3; o[q] = c[0]; o[q + 1] = c[1]; o[q + 2] = c[2];
        }
      }
    }
  });
  fs.mkdirSync(path.join(ROOT, "art/village/_work"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "art/village/_work/routes-debug.png"), png.encode(W, H, 3, 2, o));
  console.log("wrote art/village/_work/routes-debug.png");
}
