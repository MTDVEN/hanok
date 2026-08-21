/* ================================================================
   Render the hero title to a PNG —
     node tools/heropng.js [word] [out.png]

   Written 2026-08-21, when VEN said the straight strokes looked
   ruled next to the curved ones and Chrome was unusable (frozen
   renderer, then a lost host permission). The letterforms are the
   one thing in this project that could not be checked without a
   browser, and now they can: it reads LETTERS out of js/hero.js
   itself, so it can never drift from what ships.

   No ink filter here on purpose — this is the GEOMETRY, which is
   where a stroke reads as ruled or as drawn. Render the hero title's brush strokes to a PNG, straight from
   js/hero.js's own LETTERS — so the letterforms can be judged without
   a browser. Round caps/joins are exact here: a stroke is just a disc
   stamped along the flattened path, which is what SVG draws too. */
var fs = require("fs");
var path = require("path");
var png = require(path.join(__dirname, "png.js"));

var SRC = fs.readFileSync(path.join(__dirname, "..", "js", "hero.js"), "utf8");
var i0 = SRC.indexOf("var LETTERS = {");
var i1 = SRC.indexOf("\n  };", i0);
var LETTERS = Function("return " + SRC.slice(i0 + 14, i1 + 4).replace(/;\s*$/, ""))();

var WORD = process.argv[2] || "기와";
var HANGUL = /[가-힣]/.test(WORD);
var ADVANCE = HANGUL ? 100 : 96, X0 = 22;
var m = /var SWELL_A = ([\d.]+), SWELL_B = ([\d.]+), SWELL_W = ([\d.]+)/.exec(SRC);
var SWELL_A = m ? +m[1] : 0.2, SWELL_B = m ? +m[2] : 0.8, SWELL_W = m ? +m[3] : 1.2;

var S = 4;                                  // supersample
var VW = X0 + WORD.length * ADVANCE + (HANGUL ? 32 : 2) + 46, VH = 176;
var W = VW * S, H = VH * S;
var buf = Buffer.alloc(W * H * 4, 0);
for (var p = 0; p < W * H; p++){ buf[p*4]=247; buf[p*4+1]=238; buf[p*4+2]=214; buf[p*4+3]=255; }

function cubic(p0,p1,p2,p3,t){
  var u=1-t, a=u*u*u, b=3*u*u*t, c=3*u*t*t, d=t*t*t;
  return [a*p0[0]+b*p1[0]+c*p2[0]+d*p3[0], a*p0[1]+b*p1[1]+c*p2[1]+d*p3[1]];
}
/* flatten "M x y C ..." into a dense polyline */
function flatten(d){
  var tok = d.replace(/([MC])/g, " $1 ").trim().split(/[\s,]+/), pts = [], cur = null, i = 0;
  while (i < tok.length){
    var t = tok[i++];
    if (t === "M"){ cur = [+tok[i++], +tok[i++]]; pts.push(cur.slice()); }
    else if (t === "C"){
      var c1=[+tok[i++],+tok[i++]], c2=[+tok[i++],+tok[i++]], e=[+tok[i++],+tok[i++]];
      for (var k=1;k<=40;k++) pts.push(cubic(cur,c1,c2,e,k/40));
      cur = e;
    } else if (!isNaN(+t)){
      var c1b=[+t,+tok[i++]], c2b=[+tok[i++],+tok[i++]], eb=[+tok[i++],+tok[i++]];
      for (var k2=1;k2<=40;k2++) pts.push(cubic(cur,c1b,c2b,eb,k2/40));
      cur = eb;
    }
  }
  return pts;
}
function lenOf(pts){
  var L=[0], t=0;
  for (var i=1;i<pts.length;i++){ t += Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]); L.push(t); }
  return L;
}
function disc(cx, cy, r, al){
  var x0=Math.floor(cx-r), x1=Math.ceil(cx+r), y0=Math.floor(cy-r), y1=Math.ceil(cy+r);
  for (var y=y0;y<=y1;y++) for (var x=x0;x<=x1;x++){
    if (x<0||y<0||x>=W||y>=H) continue;
    var dx=x+0.5-cx, dy=y+0.5-cy, dd=Math.sqrt(dx*dx+dy*dy);
    if (dd>r) continue;
    var a = al * Math.min(1, (r-dd));
    var o=(y*W+x)*4;
    buf[o]  = Math.round(buf[o]  *(1-a) + 33*a);
    buf[o+1]= Math.round(buf[o+1]*(1-a) + 27*a);
    buf[o+2]= Math.round(buf[o+2]*(1-a) + 17*a);
  }
}
function stamp(pts, wid, al, tf){
  for (var i=0;i<pts.length;i++){
    var q = tf(pts[i]);
    disc(q[0]*S, q[1]*S, wid*S/2, al);
  }
}
var si = 0;
WORD.split("").forEach(function(ch, ci){
  var paths = LETTERS[ch]; if (!paths) { console.log("  no strokes for " + ch); return; }
  var x = X0 + ci * ADVANCE, tilt = ((ci*137)%5-2)*0.7, rad = tilt*Math.PI/180;
  function tf(pt){
    var px=pt[0]-50, py=pt[1]-76;
    return [x + 50 + px*Math.cos(rad)-py*Math.sin(rad), 14 + 76 + px*Math.sin(rad)+py*Math.cos(rad)];
  }
  paths.forEach(function(d){
    var w = 9.5 + ((si++ * 7) % 4);
    var pts = flatten(d), L = lenOf(pts), tot = L[L.length-1];
    stamp(pts, w, 1, tf);
    if (tot > 46){
      var a = tot*SWELL_A, b = tot*SWELL_B, sub = [];
      for (var k=0;k<pts.length;k++) if (L[k]>=a && L[k]<=b) sub.push(pts[k]);
      stamp(sub, w*SWELL_W, 1, tf);
    }
    stamp(pts, Math.max(3, w*0.36), 0.45, function(pt){ var q=tf(pt); return [q[0]+1.6, q[1]-1.2]; });
  });
});
fs.writeFileSync(process.argv[3] || "hero.png", png.encode(W, H, 4, 6, buf));
console.log("wrote " + (process.argv[3]||"hero.png") + " " + W + "x" + H);
