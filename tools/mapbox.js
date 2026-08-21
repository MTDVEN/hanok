/* ================================================================
   Draw a label's REAL footprint onto the sheet —
     node tools/mapbox.js <sheet.png> <out.png> cx,cy,hw,up,dn [...]
   all normalised to the sheet; up to three boxes, coloured in turn.

   THIS IS THE AUTHORITY WHEN THE GRID AND THE EYE DISAGREE, and they
   do. maproute scores 25px cells: a thin dark ridge line barely moves
   a cell statistic while pale mist and hatching move it a lot, so the
   grid can call a block 'optimal' while a ridge runs straight through
   the words. VEN asked three times for Gyeongbokgung's block to move
   left and three different metrics said no; drawing the box settled
   it in one look, and the answer is in BLOCK_X in tools/maproute.js.

   Use the TEXT's half-extents, not the search box's — get them from a
   getBBox in the browser scaled to the largest label scale (lq tops
   out at 0.058*1000/(ZOOM_IN*LSIZE) = 1.465), or from HANDOFF 9z.
   Measured for the four stops: hw 0.074 / 0.078 / 0.084 / 0.070,
   up 0.0044, dn 0.026 (0.020 for a three-line block).
================================================================= */
var path=require("path"), fs=require("fs");
var png=require(path.join(__dirname,"png.js"));
var dec=require(path.join(__dirname,"mapdec.js"));
var a=process.argv.slice(2), img=dec.decode(fs.readFileSync(a[0])), W=img.width,H=img.height;
var out=Buffer.from(img.data);
a.slice(2).forEach(function(spec,i){
  var v=spec.split(",").map(Number);
  var cx=v[0]*W, cy=v[1]*H, hw=v[2]*W, up=v[3]*H, dn=v[4]*H;
  var col=[[200,40,40],[40,90,200],[30,150,60]][i%3];
  for(var y=Math.round(cy-up);y<=Math.round(cy+dn);y++)
   for(var x=Math.round(cx-hw);x<=Math.round(cx+hw);x++){
     if(x<0||y<0||x>=W||y>=H)continue;
     var edge = (x<cx-hw+3||x>cx+hw-3||y<cy-up+3||y>cy+dn-3);
     var o=(y*W+x)*4, al = edge?0.85:0.22;
     out[o]=Math.round(out[o]*(1-al)+col[0]*al);
     out[o+1]=Math.round(out[o+1]*(1-al)+col[1]*al);
     out[o+2]=Math.round(out[o+2]*(1-al)+col[2]*al);
   }
});
fs.writeFileSync(a[1], png.encode(W,H,4,6,out));
console.log("wrote "+a[1]);
