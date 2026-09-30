/* tools/title-pens.js — the second half of tools/title.js: split the
   ink between the pens, trace each pen's share, write js/title-zico.js.
   See tools/title.js for the why. */

var fs = require("fs"), path = require("path"), png = require("./png.js");

module.exports = function(ink, PENS, DEBUG, WORK, ROOT){
  var A = ink.A, W = ink.W, H = ink.H, chamfer = ink.chamfer;
  var spec = JSON.parse(fs.readFileSync(PENS, "utf8")).pens;

  /* ---- centre-lines: Catmull-Rom through the points, as cubic Béziers
     (the SVG path the page draws) and densely sampled (for distances) */
  function bez(pts){
    var segs = [];
    for (var i = 0; i < pts.length - 1; i++){
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      segs.push([p1,
        [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
        [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
        p2]);
    }
    return segs;
  }
  function f1(v){ return (Math.round(v * 10) / 10).toString(); }
  function dOf(segs){
    return "M" + f1(segs[0][0][0]) + " " + f1(segs[0][0][1]) + segs.map(function(s){
      return "C" + [s[1], s[2], s[3]].map(function(p){ return f1(p[0]) + " " + f1(p[1]); }).join(" ");
    }).join("");
  }
  function sample(segs){
    var out = [];
    segs.forEach(function(s){
      for (var t = 0; t <= 1; t += 0.02){
        var u = 1 - t;
        out.push([u*u*u*s[0][0] + 3*u*u*t*s[1][0] + 3*u*t*t*s[2][0] + t*t*t*s[3][0],
                  u*u*u*s[0][1] + 3*u*u*t*s[1][1] + 3*u*t*t*s[2][1] + t*t*t*s[3][1]]);
      }
    });
    return out;
  }

  var pens = spec.map(function(p){
    var segs = bez(p.pts), pts = sample(segs), line = new Uint8Array(W * H);
    for (var k = 1; k < pts.length; k++){                        // rasterise the centre-line
      var a = pts[k - 1], b = pts[k], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2) + 1;
      for (var j = 0; j <= n; j++){
        var x = Math.round(a[0] + (b[0] - a[0]) * j / n), y = Math.round(a[1] + (b[1] - a[1]) * j / n);
        if (x >= 0 && y >= 0 && x < W && y < H) line[y * W + x] = 1;
      }
    }
    return { id: p.id, c: dOf(segs), D: chamfer(line, W, H) };
  });

  /* ---- every inked pixel to its nearest pen (ties: the earlier) ---- */
  var owner = new Int16Array(W * H).fill(-1);
  for (var k = 0; k < W * H; k++){
    if (A[k] <= 0.02) continue;
    var best = 0, bd = Infinity;
    for (var i = 0; i < pens.length; i++){ if (pens[i].D[k] < bd){ bd = pens[i].D[k]; best = i; } }
    owner[k] = best;
  }

  /* ---- trace one pen's share: marching squares at 0.5 ------------- */
  /* each share reaches OVERLAP px under its neighbours' ink: two shapes
     that meet edge to edge are each anti-aliased along the join and leave
     a faint light seam there — visible on the finished letters for the
     whole time the rest of the word is still being written */
  var OVERLAP = 1.6;
  var reach = pens.map(function(_, i){
    var own = new Uint8Array(W * H);
    for (var q = 0; q < W * H; q++) if (owner[q] === i) own[q] = 1;
    return chamfer(own, W, H);
  });
  function trace(i){
    /* the share (or, i < 0, the whole word), padded by one px so every
       contour closes */
    var w = W + 2, h = H + 2, F = new Float32Array(w * h);
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++){
      var q = y * W + x;
      if (i < 0 ? owner[q] >= 0 : (owner[q] === i || (owner[q] >= 0 && reach[i][q] <= OVERLAP))) F[(y + 1) * w + x + 1] = A[q];
    }
    var segs = [];
    function lerp(a, b){ return (0.5 - a) / (b - a); }
    for (y = 0; y < h - 1; y++) for (x = 0; x < w - 1; x++){
      var tl = F[y * w + x], tr = F[y * w + x + 1], br = F[(y + 1) * w + x + 1], bl = F[(y + 1) * w + x];
      var c = (tl > 0.5 ? 8 : 0) | (tr > 0.5 ? 4 : 0) | (br > 0.5 ? 2 : 0) | (bl > 0.5 ? 1 : 0);
      if (c === 0 || c === 15) continue;
      var T = [x + lerp(tl, tr), y], R = [x + 1, y + lerp(tr, br)], B = [x + lerp(bl, br), y + 1], L = [x, y + lerp(tl, bl)];
      var ctr = (tl + tr + br + bl) / 4;
      switch (c){
        case 1: segs.push([L, B]); break;           case 14: segs.push([B, L]); break;
        case 2: segs.push([B, R]); break;           case 13: segs.push([R, B]); break;
        case 3: segs.push([L, R]); break;           case 12: segs.push([R, L]); break;
        case 4: segs.push([R, T]); break;           case 11: segs.push([T, R]); break;
        case 6: segs.push([B, T]); break;           case 9:  segs.push([T, B]); break;
        case 7: segs.push([L, T]); break;           case 8:  segs.push([T, L]); break;
        case 5: if (ctr > 0.5){ segs.push([L, T]); segs.push([R, B]); } else { segs.push([L, B]); segs.push([R, T]); } break;
        case 10: if (ctr > 0.5){ segs.push([T, R]); segs.push([B, L]); } else { segs.push([T, L]); segs.push([B, R]); } break;
      }
    }
    /* stitch segments into closed loops by their endpoints */
    function key(p){ return Math.round(p[0] * 1000) + "," + Math.round(p[1] * 1000); }
    var byStart = {};
    segs.forEach(function(s, n){ (byStart[key(s[0])] = byStart[key(s[0])] || []).push(n); });
    var used = new Uint8Array(segs.length), loops = [];
    for (var s0 = 0; s0 < segs.length; s0++){
      if (used[s0]) continue;
      var loop = [segs[s0][0]], cur = s0;
      while (cur !== -1 && !used[cur]){
        used[cur] = 1; var endp = segs[cur][1]; loop.push(endp);
        var cand = (byStart[key(endp)] || []).filter(function(m){ return !used[m]; });
        cur = cand.length ? cand[0] : -1;
      }
      if (loop.length > 3) loops.push(loop);
    }
    /* simplify (Douglas-Peucker) and shift back by the padding */
    function dp(pts, eps){
      if (pts.length < 3) return pts;
      var a = pts[0], b = pts[pts.length - 1], dmax = 0, idx = 0;
      for (var m = 1; m < pts.length - 1; m++){
        var p = pts[m], den = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        var dd = Math.abs((b[1] - a[1]) * p[0] - (b[0] - a[0]) * p[1] + b[0] * a[1] - b[1] * a[0]) / den;
        if (dd > dmax){ dmax = dd; idx = m; }
      }
      if (dmax <= eps) return [a, b];
      return dp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(dp(pts.slice(idx), eps));
    }
    return loops.map(function(lp){
      /* a closed loop starts and ends on one point, which Douglas-Peucker
         reads as a zero-length line and collapses: split it at the point
         furthest from the start and simplify the two halves */
      var far = 0, fi = 0;
      for (var m = 1; m < lp.length; m++){
        var dd = Math.hypot(lp[m][0] - lp[0][0], lp[m][1] - lp[0][1]);
        if (dd > far){ far = dd; fi = m; }
      }
      var sp = dp(lp.slice(0, fi + 1), 0.3).slice(0, -1).concat(dp(lp.slice(fi), 0.3));
      if (sp.length < 3) return "";
      return "M" + sp.map(function(p){ return f1(p[0] - 1) + " " + f1(p[1] - 1); }).join("L") + "Z";
    }).join("");
  }

  var out = pens.map(function(p, i){
    /* the mask must reach this pen's furthest pixel from its line */
    var far = 0, px = 0;
    for (var k2 = 0; k2 < W * H; k2++) if (owner[k2] === i && A[k2] > 0.3){ px++; if (p.D[k2] > far) far = p.D[k2]; }
    /* + the overlap: the pen must uncover the sliver it borrows too */
    return { id: p.id, c: p.c, w: Math.ceil(2 * (far + OVERLAP) + 3), ink: trace(i), px: px };
  });

  var js = "/* GENERATED by tools/title.js from art/title/zico-ref.png + art/title/pens.json — do not edit.\n" +
    "   Zico's $TiLES as brush strokes in writing order: for each pen, its centre-line (c), the mask\n" +
    "   width that uncovers all of its ink (w), and that ink as a vector outline (ink, evenodd).\n" +
    "   all: the whole word as ONE outline, shown once the pens have lifted (shapes that touch\n" +
    "   leave faint anti-aliasing seams where they meet). */\n" +
    "window.HANOK_TITLE = " + JSON.stringify({ w: W, h: H, all: trace(-1), pens: out.map(function(o){ return { id: o.id, c: o.c, w: o.w, ink: o.ink }; }) }) + ";\n";
  fs.writeFileSync(path.join(ROOT, "js/title-zico.js"), js);
  console.log("wrote js/title-zico.js  " + Math.round(js.length / 1024) + "KB");
  out.forEach(function(o){ console.log("  " + o.id.padEnd(8) + " width " + String(o.w).padStart(3) + "  ink px " + String(o.px).padStart(6) + "  outline " + Math.round(o.ink.length / 1024) + "KB"); });

  if (DEBUG){
    /* each pen's share in its own colour, its centre-line in black */
    var COL = [[230,60,60],[60,140,230],[40,170,90],[230,150,30],[160,70,200],[30,190,190],[220,90,160],[120,120,40],[90,90,230],[200,120,60],[60,200,120],[180,40,110],[40,40,40],[100,180,40]];
    var o = Buffer.alloc(W * H * 3);
    for (var k3 = 0; k3 < W * H; k3++){
      var col = owner[k3] >= 0 ? COL[owner[k3] % COL.length] : [255, 255, 255], a3 = A[k3];
      o[k3 * 3] = 255 - (255 - col[0]) * a3; o[k3 * 3 + 1] = 255 - (255 - col[1]) * a3; o[k3 * 3 + 2] = 255 - (255 - col[2]) * a3;
    }
    pens.forEach(function(p){ for (var k4 = 0; k4 < W * H; k4++) if (p.D[k4] < 0.7){ o[k4 * 3] = 0; o[k4 * 3 + 1] = 0; o[k4 * 3 + 2] = 0; } });
    fs.writeFileSync(path.join(WORK, "2-pens.png"), png.encode(W, H, 3, 2, o));
    console.log("wrote art/title/_work/2-pens.png");
  }
};
