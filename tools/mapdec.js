var zlib=require("zlib"),fs=require("fs");
function decode(buf){
  if (buf.readUInt32BE(0)!==0x89504E47) throw new Error("not a PNG");
  var pos=8,w=0,h=0,bd=0,ct=0,idat=[],plte=null;
  while(pos<buf.length){
    var len=buf.readUInt32BE(pos),type=buf.toString("ascii",pos+4,pos+8),data=buf.slice(pos+8,pos+8+len);
    if(type==="IHDR"){w=data.readUInt32BE(0);h=data.readUInt32BE(4);bd=data[8];ct=data[9];if(data[12]!==0)throw new Error("interlaced");}
    else if(type==="PLTE")plte=data; else if(type==="IDAT")idat.push(data); else if(type==="IEND")break;
    pos+=12+len;
  }
  if(bd!==8)throw new Error("only 8-bit");
  var ch=ct===2?3:ct===6?4:ct===0?1:ct===4?2:ct===3?1:0;
  if(!ch)throw new Error("ct "+ct);
  var rawz=zlib.inflateSync(Buffer.concat(idat)),stride=w*ch,out=Buffer.alloc(h*stride),p=0,y,i;
  for(y=0;y<h;y++){
    var f=rawz[p++],line=rawz.slice(p,p+stride);p+=stride;
    var cur=out.slice(y*stride,(y+1)*stride),prev=y?out.slice((y-1)*stride,y*stride):null;
    for(i=0;i<stride;i++){
      var a=i>=ch?cur[i-ch]:0,b=prev?prev[i]:0,c=(prev&&i>=ch)?prev[i-ch]:0,v=line[i];
      if(f===1)v+=a;else if(f===2)v+=b;else if(f===3)v+=(a+b)>>1;
      else if(f===4){var pp=a+b-c,pa=Math.abs(pp-a),pb=Math.abs(pp-b),pc=Math.abs(pp-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c);}
      cur[i]=v&255;
    }
  }
  var rgba=Buffer.alloc(w*h*4),n=w*h;
  for(i=0;i<n;i++){
    var r,g,bl,al=255;
    if(ct===3){var q=out[i]*3;r=plte[q];g=plte[q+1];bl=plte[q+2];}
    else if(ch>=3){r=out[i*ch];g=out[i*ch+1];bl=out[i*ch+2];if(ch===4)al=out[i*ch+3];}
    else {r=g=bl=out[i*ch];if(ch===2)al=out[i*ch+1];}
    rgba[i*4]=r;rgba[i*4+1]=g;rgba[i*4+2]=bl;rgba[i*4+3]=al;
  }
  return {width:w,height:h,data:rgba};
}
module.exports={decode:decode};
