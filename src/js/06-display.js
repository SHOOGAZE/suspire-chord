/* ---------- neon critters (one per pad) ---------- */
var crit={list:[],cv:null,cx:null,w:0,h:0,on:true,dirty:false,set:1};
var CRIT_RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function critSpawn(type,vel,notes){
  if(!crit.on||CRIT_RM)return;
  if(!crit.cv){crit.cv=document.getElementById('crit');if(!crit.cv)return;crit.cx=crit.cv.getContext('2d');}
  var w=crit.cv.clientWidth||300;
  if(crit.list.length>=4)crit.list.shift();
  var dir=Math.random()<.5?-1:1;
  crit.list.push({type:type%7,born:performance.now(),life:1900+Math.random()*500,x:w*(.18+Math.random()*.64),dir:dir,v:.7+.4*(vel||.8),ph:Math.random()*6,notes:notes||null,sv:[Math.random(),Math.random(),Math.random(),Math.random()],vel:vel||.8});
}
/* pixel machines: R(x,y,w,h) lit cells, D(x,y,w,h) dark holes; f = 0/1 frame, q = 0..3 phase */
var CRITS=[
  function robot(R,D,f,q){if(f)R(7,0,1,1);R(4,1,6,3);D(5,2,1,1);D(8,2,1,1);R(6,4,2,1);R(3,5,8,3);D(6,6,2,1);
    if(f){R(1,5,1,3);R(12,6,1,3);R(4,8,2,3);R(8,8,2,2);R(8,10,3,1);}else{R(1,6,1,3);R(12,5,1,3);R(3,8,2,2);R(9,8,2,3);R(3,10,3,1);}},
  function drone(R,D,f,q){R(5,5,4,2);D(6,6,2,1);R(2,4,3,1);R(9,4,3,1);
    if(f){R(1,3,4,1);R(9,3,4,1);}else{R(2,3,2,1);R(10,3,2,1);R(5,3,4,1);}
    R(5,7,1,2);R(8,7,1,2);if(q>1)R(6,9,2,1);},
  function cassette(R,D,f,q){R(1,2,12,8);D(3,3,8,3);D(4,8,6,1);
    if(f){R(4,3,1,1);R(6,3,1,1);R(5,4,1,1);R(4,5,1,1);R(6,5,1,1);R(8,3,1,1);R(10,3,1,1);R(9,4,1,1);R(8,5,1,1);R(10,5,1,1);}
    else{R(5,3,1,3);R(4,4,3,1);R(9,3,1,3);R(8,4,3,1);}},
  function tower(R,D,f,q){R(6,2,2,9);R(5,10,4,1);R(4,10,6,1);D(6,5,2,1);D(6,8,2,1);if(f)R(6,0,2,2);else R(6,1,2,1);
    if(f){R(2,2,1,5);R(11,2,1,5);R(0,3,1,3);R(13,3,1,3);}else{R(4,3,1,3);R(9,3,1,3);}},
  function alien(R,D,f,q){R(3,1,8,5);R(3,0,1,1);R(10,0,1,1);D(5,3,1,1);D(8,3,1,1);D(6,5,2,1);
    if(f){R(1,6,2,1);R(11,6,2,1);R(4,6,2,2);R(8,6,2,2);}else{R(2,6,2,2);R(10,6,2,2);R(5,6,1,2);R(8,6,1,2);}},
  function radar(R,D,f,q){R(1,1,12,9);D(2,2,10,7);R(7,6,1,1);R(3,3,1,1);R(10,8,1,1);
    if(q===0)R(7,3,1,3);else if(q===1){R(8,5,1,1);R(9,4,1,1);R(10,3,1,1);}else if(q===2)R(8,6,4,1);else{R(8,7,1,1);R(9,8,1,1);}
    if(q===1)R(9,3,1,1);if(q===3)R(10,3,1,1);},
  function chip(R,D,f,q){R(3,3,8,5);D(5,4,4,3);if(f)R(6,5,2,1);R(4,2,1,1);R(6,2,1,1);R(8,2,1,1);R(10,2,1,1);R(2,4,1,1);R(11,5,1,1);
    if(f){R(3,8,1,2);R(6,8,1,2);R(9,8,1,2);R(12,8,1,1);}else{R(2,8,1,1);R(5,8,1,2);R(8,8,1,2);R(11,8,1,2);}}
];
/* synthwave set: neon wireframes, drawn at ~50 units tall, origin bottom-centre */
var PK='#FF6FB5',VL='#B08CFF',SV=[.5,.5,.5,.5];
function swL(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.stroke();}
function swWire(c,V,E,t,cy,sc,tilt){
  var cy1=Math.cos(t),sy=Math.sin(t),cx=Math.cos(tilt),sx=Math.sin(tilt),P=V.map(function(v){
    var x=v[0]*cy1+v[2]*sy,z=-v[0]*sy+v[2]*cy1,y=v[1]*cx-z*sx;z=v[1]*sx+z*cx;
    return [x*sc,cy+y*sc,z];});
  E.forEach(function(e){var a=P[e[0]],b=P[e[1]],back=(a[2]+b[2])/2<0;c.strokeStyle=back?VL:PK;c.globalAlpha=(c.globalAlpha||1);swL(c,[a[0],a[1],b[0],b[1]]);});
}
var CUBE_V=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],
    CUBE_E=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]],
    PYR_V=[[0,-1.3,0],[-1,.8,-1],[1,.8,-1],[1,.8,1],[-1,.8,1]],
    PYR_E=[[0,1],[0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,1]];
var LIS=[[1,1],[9,10],[8,9],[5,6],[4,5],[3,4],[5,7],[2,3],[5,8],[3,5],[4,7],[8,15]];
function lisRatio(semi){semi=((semi%12)+12)%12;return LIS[semi];}
function swEll(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,6.2832);c.stroke();}
var OCT_V=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],
    OCT_E=[[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]];
var SYNTH=[
  function lissajous(c,t,n){n=n&&n.length>1?n:[48,52,55];var s=n.slice().sort(function(a,b){return a-b;}),r1=lisRatio(s[1]-s[0]),r2=lisRatio((s[2]||s[1]+7)-s[0]);
    [[r1,PK,1],[r2,VL,.7]].forEach(function(q,qi){c.strokeStyle=q[1];c.beginPath();for(var i=0;i<=240;i++){var u=i/240*6.2832,x=26*Math.sin(q[0][0]*u+t*1.6*(qi?-1:1)+SV[0]*6.28*(qi?.5:1)),y=-26+(16+8*SV[1])*Math.sin(q[0][1]*u+SV[2]*3);if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();});},
  function ridges(c,t){var N=9,bg='rgba(20,6,15,.96)';c.lineWidth=1.4;for(var i=0;i<N;i++){var y0=-46+i*5.2,pts=[];for(var x=-34;x<=34;x+=2){var env=Math.exp(-Math.pow((x-(SV[2]-.5)*14)/(12+6*SV[3]),2)),h=env*(5+9*Math.abs(Math.sin(x*(.38+.3*SV[1])+i*1.7+SV[0]*9+t*2.2))+4*Math.sin(x*1.3-t*3+i+SV[3]*6))*(.6+.05*i);pts.push([x,y0-h*.55]);}
    c.beginPath();c.moveTo(-34,y0+1);pts.forEach(function(p){c.lineTo(p[0],p[1]);});c.lineTo(34,y0+1);c.closePath();c.save();c.shadowBlur=0;c.fillStyle=bg;c.fill();c.restore();
    c.strokeStyle=i%3===2?VL:PK;c.beginPath();pts.forEach(function(p,j){if(j)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);});c.stroke();}},
  function tunnel(c,t){for(var i=0;i<7;i++){var z=((t*.9+i/7)%1),sz=2+36*Math.pow(z,1.7);c.globalAlpha=Math.min(1,z*2.2)*(c.globalAlpha||1);c.strokeStyle=i%2?VL:PK;c.strokeRect(-sz+(SV[0]-.5)*10*(1-z),-26-sz*.62*(.8+.5*SV[1])+(SV[2]-.5)*8*(1-z),sz*2,sz*1.24*(.8+.5*SV[1]));}
    c.globalAlpha=1;c.strokeStyle=VL;[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(d){swL(c,[d[0]*3,-26+d[1]*2,d[0]*38,-26+d[1]*24]);});},
  function globe(c,t){var r=22,cy=-26;c.save();c.translate(0,cy);c.rotate((SV[0]-.5)*1.3);c.translate(0,-cy);c.strokeStyle=PK;swEll(c,0,cy,r,r);for(var m=0;m<6;m++){var a=t*(1+SV[2]*.7)+SV[3]*3+m*Math.PI/6;c.strokeStyle=m%2?VL:PK;swEll(c,0,cy,r*Math.abs(Math.cos(a)),r);}
    c.strokeStyle=VL;[-.6,0,.6].forEach(function(l){var rx=r*Math.cos(l);swEll(c,0,cy+r*Math.sin(l),rx,rx*(.08+.3*SV[1]));});c.restore();},
  function octa(c,t){swWire(c,OCT_V,OCT_E,t*1.8*(.7+SV[1]*.8)+SV[3]*6,-26,22,.2+SV[0]*1.0);c.globalAlpha=(c.globalAlpha||1)*.7;swWire(c,OCT_V,OCT_E,-t*1.1+SV[2]*6,-26,11,.9+SV[0]*.5);},
  function radial(c,t){var n=36,r0=9+SV[1]*5,cy=-26;for(var i=0;i<n;i++){var a=i/n*6.2832-1.5708+SV[2]*3,v=0;
      if(fBuf&&fBuf.length){var k=1+Math.floor(i%(n/2)*(fBuf.length*.35)/(n/2));v=fBuf[k]/255;}
      v=Math.max(v,.28+.22*Math.sin(t*6+i*(.5+.4*SV[0])+SV[3]*6));
      var r1=r0+v*17;c.strokeStyle=i%4===0?VL:PK;swL(c,[Math.cos(a)*r0,cy+Math.sin(a)*r0,Math.cos(a)*r1,cy+Math.sin(a)*r1]);}
    c.strokeStyle=PK;swEll(c,0,cy,r0-2,r0-2);},
  function torus(c,t){var R=13+SV[1]*5,rr=5+SV[2]*4,cy=-26,tt2=t*1.4*(.7+SV[3]*.7),cyaw=Math.cos(tt2),syaw=Math.sin(tt2),tl=.5+SV[0]*1.2,ct=Math.cos(tl),st=Math.sin(tl);
    function P(u,v){var x=(R+rr*Math.cos(v))*Math.cos(u),y=rr*Math.sin(v),z=(R+rr*Math.cos(v))*Math.sin(u),X=x*cyaw+z*syaw,Z=-x*syaw+z*cyaw,Y=y*ct-Z*st;return [X,cy+Y];}
    for(var i=0;i<12;i++){c.strokeStyle=i%2?VL:PK;c.beginPath();for(var j=0;j<=16;j++){var p=P(i/12*6.2832,j/16*6.2832);if(j)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);}c.stroke();}
    c.strokeStyle=PK;for(var q=0;q<4;q++){c.beginPath();for(var j2=0;j2<=36;j2++){var p2=P(j2/36*6.2832,q/4*6.2832);if(j2)c.lineTo(p2[0],p2[1]);else c.moveTo(p2[0],p2[1]);}c.stroke();}}
];
function critDraw(){
  var cv=crit.cv;if(!cv){return;}
  var L=crit.list;if(!L.length&&!crit.dirty)return;
  var dpr=window.devicePixelRatio||1,w=cv.clientWidth,h=cv.clientHeight;
  if(!w||!h)return;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
  var c=crit.cx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  var now=performance.now();crit.dirty=false;
  crit.list=L.filter(function(o){return now-o.born<o.life;});
  crit.list.forEach(function(o){
    var age=now-o.born,a=Math.min(1,age/110,(o.life-age)/400);
    if(crit.set===1){var k=Math.max(.6,Math.min(2.4,h*.84/52,w*.9/80))*(.9+.1*o.v),tt=age/1000+o.ph*.3;
      var xx=w/2;
      c.save();c.translate(xx,Math.round(h/2+25*k));c.scale(k,k);c.globalAlpha=a;
      var nn=o.notes&&o.notes.length?o.notes.slice().sort(function(x,y){return x-y;}):[48],rt=((nn[0]%12)+12)%12,minor=nn.length>1&&((nn[1]-nn[0])%12===3||(nn[1]-nn[0])%12===2),vv=Math.max(0,Math.min(1,o.vel||.8)),
          h1=(200+rt*(150/11)+(nn.length>3?15:0))%360,h2=(h1+(minor?-95:-55)+360)%360,lt=62+vv*14;
      PK='hsl('+h1.toFixed(0)+',100%,'+lt.toFixed(0)+'%)';VL='hsl('+h2.toFixed(0)+',95%,'+(lt-4).toFixed(0)+'%)';SV=o.sv||SV;
      c.lineWidth=(1.3+vv*2.2)/k;c.lineCap='round';c.lineJoin='round';c.strokeStyle=PK;c.fillStyle=PK;c.shadowColor='hsla('+h1.toFixed(0)+',100%,60%,.95)';c.shadowBlur=6+vv*10;
      SYNTH[o.type](c,tt,o.notes);c.restore();return;}
    var P=Math.max(3,Math.round(h*.46/11*(.85+.2*o.v))),q=Math.floor(age/150)%4,f=q%2;
    var moving=(o.type===0||o.type===4||o.type===6);
    var x=o.x+(moving?o.dir*age*.04:0);
    var m=8*P;if(x<m)x=m;if(x>w-m)x=w-m;x=Math.round(x/P)*P;
    var ground=Math.round((h-6)/P)*P;
    var fy=(o.type===1)?-Math.round(h*.18/P)*P:0;
    if(o.type===1)fy-=(Math.floor(age/300)%2)*P;
    c.save();c.translate(x,ground+fy);c.scale(o.type===5||o.type===2||o.type===3?1:o.dir,1);c.globalAlpha=a;
    var R=function(px,py,pw,ph){c.fillRect((px-7)*P,(py-11)*P,pw*P,ph*P);};
    var D=function(px,py,pw,ph){c.save();c.shadowBlur=0;c.fillStyle='#14050E';c.fillRect((px-7)*P,(py-11)*P,(pw||1)*P,(ph||1)*P);c.restore();};
    c.fillStyle='#FF6FB5';c.shadowColor='rgba(255,79,163,.9)';c.shadowBlur=8;
    CRITS[o.type](R,D,f,q);c.restore();
  });
  if(!crit.list.length){c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);crit.dirty=false;}
}
var waveC=null,waveX=null,lastBeat=-1,beatEls=[],vizMode=2,curNotes=[];
var VIZ=['WAVE','SPECTRUM','NOTES'],spk=[],chr=[0,0,0,0,0,0,0,0,0,0,0,0];
var PINK='#F0509A',PINK_HI='#F7B3D3';
function vizPrep(){
  if(!waveC)return null;
  var dpr=window.devicePixelRatio||1,w=waveC.clientWidth,h=waveC.clientHeight;
  if(!w||!h)return null;
  if(waveC.width!==Math.round(w*dpr)||waveC.height!==Math.round(h*dpr)){waveC.width=Math.round(w*dpr);waveC.height=Math.round(h*dpr);}
  var x=waveX;x.setTransform(dpr,0,0,dpr,0,0);if(vizMode===0){x.globalCompositeOperation='destination-out';x.fillStyle='rgba(0,0,0,.5)';x.fillRect(0,0,w,h);x.globalCompositeOperation='source-over';}else x.clearRect(0,0,w,h);x.shadowBlur=0;
  return {x:x,w:w,h:h};
}
function vizTag(c){
  c.x.shadowBlur=0;c.x.font='500 8px "DM Mono",ui-monospace,monospace';c.x.textAlign='right';c.x.textBaseline='top';
  c.x.fillStyle='rgba(255,79,163,.55)';c.x.fillText(VIZ[vizMode],c.w-1,0);
}
function drawWaveView(c,data){
  var x=c.x,w=c.w,h=c.h;
  x.strokeStyle='rgba(255,79,163,.16)';x.lineWidth=1;x.beginPath();x.moveTo(0,h/2);x.lineTo(w,h/2);x.stroke();
  x.strokeStyle=PINK;x.lineWidth=1.6;x.lineJoin='miter';x.shadowColor='rgba(240,80,154,.5)';x.shadowBlur=4;
  x.beginPath();
  if(!data){x.moveTo(0,h/2);x.lineTo(w,h/2);}
  else{
    var n=data.length,st=Math.max(1,Math.floor(w/120));
    for(var i=0;i<=w;i+=st){
      var v=(data[Math.min(n-1,Math.floor(i/w*n))]-128)/128*2.4;
      v=Math.max(-1,Math.min(1,v));
      var y=h/2-v*(h/2-2);
      if(i===0)x.moveTo(i,y);else x.lineTo(i,y);
    }
  }
  x.stroke();
  if(data){
    x.lineTo(w,h/2);x.lineTo(0,h/2);x.closePath();x.shadowBlur=0;
    var g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(255,79,163,.16)');g.addColorStop(.5,'rgba(255,79,163,.03)');g.addColorStop(1,'rgba(255,79,163,.16)');
    x.fillStyle=g;x.fill();
  }
}
function drawSpecView(c,hasData){
  var x=c.x,w=c.w,h=c.h,N=36,F0=55,F1=7000,sr=ctx?ctx.sampleRate:44100,nb=fBuf?fBuf.length:2048,bw=w/N,top=10,base=h-14;
  var ratio=Math.log(F1/F0);
  for(var k=0;k<N;k++){
    var v=0;
    if(hasData){
      var f0=F0*Math.exp(k/N*ratio),f1=F0*Math.exp((k+1)/N*ratio);
      var b0=Math.floor(f0*2*nb/sr),b1=Math.max(b0+1,Math.floor(f1*2*nb/sr));
      for(var b=b0;b<b1&&b<nb;b++)if(fBuf[b]>v)v=fBuf[b];
      v/=255;
    }
    spk[k]=Math.max(v,(spk[k]||0)*.9);
    var bh=Math.round(v*(base-top)),ph=Math.round(spk[k]*(base-top));
    x.fillStyle='rgba(255,79,163,'+(.35+v*.65).toFixed(2)+')';
    x.fillRect(Math.round(k*bw)+1,base-bh,Math.max(1,Math.round(bw)-2),bh);
    if(ph>1){x.fillStyle=PINK_HI;x.fillRect(Math.round(k*bw)+1,base-ph-2,Math.max(1,Math.round(bw)-2),1);}
  }
  x.fillStyle='rgba(255,79,163,.3)';x.fillRect(0,base+1,w,1);
  curNotes.forEach(function(m){
    var f=440*Math.pow(2,(m-69)/12);
    for(var o=-1;o<=1;o++){
      var ff=f*Math.pow(2,o);
      if(ff<F0||ff>F1)continue;
      var px=Math.log(ff/F0)/ratio*w;
      x.fillStyle=PINK_HI;x.fillRect(Math.round(px),base+2,1,4);
    }
  });
  x.font='500 8px "DM Mono",ui-monospace,monospace';x.textAlign='left';x.textBaseline='alphabetic';x.fillStyle='rgba(255,79,163,.45)';
  [100,500,2000].forEach(function(f){var px=Math.log(f/F0)/ratio*w;x.fillText(f>=1000?(f/1000)+'k':String(f),Math.round(px)+2,h-1);});
}
function drawNotesView(c,hasData){
  var x=c.x,w=c.w,h=c.h,sr=ctx?ctx.sampleRate:44100,nb=fBuf?fBuf.length:2048;
  var act={};curNotes.forEach(function(m){act[((m%12)+12)%12]=1;});
  var cur=[0,0,0,0,0,0,0,0,0,0,0,0];
  if(hasData){
    var lo=Math.floor(65*2*nb/sr),hi=Math.min(nb-1,Math.floor(2100*2*nb/sr));
    for(var b=lo;b<=hi;b++){
      var f=b*sr/(2*nb),m=69+12*Math.log(f/440)/Math.LN2,r=Math.round(m);
      if(Math.abs(m-r)>.42)continue;
      var pc=((r%12)+12)%12,v=fBuf[b]/255;
      if(v>cur[pc])cur[pc]=v;
    }
  }
  var colw=w/12,top=10,base=h-12;
  for(var i=0;i<12;i++){
    chr[i]=Math.max(cur[i],chr[i]*.88);
    var bh=Math.round(Math.pow(chr[i],.8)*(base-top)),on=!!act[i];
    x.fillStyle=on?'rgba(255,79,163,.12)':'rgba(255,79,163,.05)';
    x.fillRect(Math.round(i*colw)+2,top,Math.max(1,Math.round(colw)-4),base-top);
    if(bh>0){
      x.fillStyle=on?PINK:'rgba(255,79,163,.4)';
      if(on){x.shadowColor='rgba(240,80,154,.5)';x.shadowBlur=4;}
      x.fillRect(Math.round(i*colw)+2,base-bh,Math.max(1,Math.round(colw)-4),bh);
      x.shadowBlur=0;
    }
    if(on){x.fillStyle=PINK;x.fillRect(Math.round(i*colw)+2,base+1,Math.max(1,Math.round(colw)-4),1);}
    x.font=(on?'500 ':'400 ')+'8px "DM Mono",ui-monospace,monospace';x.textAlign='center';x.textBaseline='alphabetic';
    x.fillStyle=on?PINK_HI:'#8A4468';
    x.fillText(NOTE[i].replace('#','♯'),Math.round(i*colw+colw/2),h-1);
  }
}
function drawViz(){
  var c=vizPrep();if(!c)return;
  if(vizMode===0){
    if(an)an.getByteTimeDomainData(anBuf);
    drawWaveView(c,an?anBuf:null);
  }else{
    if(an2)an2.getByteFrequencyData(fBuf);
    if(vizMode===1)drawSpecView(c,!!an2);else drawNotesView(c,!!an2);
  }
  vizTag(c);
}
function buildVu(){
  waveC=$('#wave');waveX=waveC.getContext('2d');
  function cycle(){vizMode=(vizMode+1)%3;drawViz();}
  waveC.addEventListener('click',cycle);
  waveC.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();cycle();}});
  drawViz();
}
var gapV=0,gapLast=-1,appEl=null;
function gapLevel(){
  if(!an)return;
  if(!appEl)appEl=document.querySelector('.app');
  an.getByteTimeDomainData(anBuf);
  var pk=0;for(var i=0;i<anBuf.length;i++){var q=Math.abs(anBuf[i]-128)/128;if(q>pk)pk=q;}
  gapV=Math.max(Math.min(1,pk*1.8),gapV*.93);
  var qv=Math.round(gapV*20)/20;
  if(qv!==gapLast){gapLast=qv;appEl.style.setProperty('--gap',String(qv));}
}
function meterLoop(){drawViz();critDraw();gapLevel();requestAnimationFrame(meterLoop);}
function buildBeats(){
  var box=$('#beats');box.innerHTML='';beatEls=[];lastBeat=-1;
  for(var i=0;i<16;i++){var e=document.createElement('i');if(i%4===0)e.className='dn';box.appendChild(e);beatEls.push(e);}
}
function beatsOff(){if(lastBeat>=0&&beatEls[lastBeat])beatEls[lastBeat].classList.remove('on');lastBeat=-1;}
function setBeat(b){
  if(b===lastBeat)return;
  if(lastBeat>=0&&beatEls[lastBeat])beatEls[lastBeat].classList.remove('on');
  lastBeat=b;if(beatEls[b])beatEls[b].classList.add('on');
}
function tags(){
  $('#tagRec').classList.toggle('on',loop.rec);
  $('#tagLoop').classList.toggle('on',loop.playing);
  $('#tagHold').classList.toggle('on',S.hold);
}
function cp(e){return {b:e.b,d:e.d,notes:e.notes.slice(),bass:e.bass,mode:e.mode,deg:e.deg,kpc:e.kpc,vel:e.vel,layer:e.layer||1};}
function mutate(){
  if(!loop.events.length)return false;
  loop.undo=loop.events.map(cp);
  var modes=['chord','strum','slop','harp'],lb=loopBeats();
  var kept=loop.events.filter(function(){return Math.random()>.12;});
  loop.events=kept.length?kept:[cp(loop.undo[0])];
  loop.events.forEach(function(ev){
    var r=Math.random();
    if(r<.35){var n=ev.notes.slice();n.push(n.shift()+12);if(n[n.length-1]<=88)ev.notes=n.sort(function(a,b){return a-b;});}
    else if(r<.6){ev.mode=modes[Math.floor(Math.random()*modes.length)];}
    else if(r<.8){ev.b=(ev.b+(Math.random()<.5?-.25:.25)+lb)%lb;}
  });
  if(Math.random()<.5){
    var src=loop.events[Math.floor(Math.random()*loop.events.length)],c=cp(src);
    c.b=(c.b+lb/2)%lb;c.d=Math.min(c.d,lb/4);loop.events.push(c);
  }
  return true;
}
function loopUi(){
  $('#recBtn').setAttribute('aria-pressed',String(loop.rec));
  $('#playBtn').setAttribute('aria-pressed',String(loop.playing));
  $('#playBtn').textContent=loop.playing?'■ Stop':'▶ Play';
  $('#hRec').setAttribute('aria-pressed',String(loop.rec));
  $('#hPlay').setAttribute('aria-pressed',String(loop.playing));
  $('#hPlay').textContent=loop.playing?'■':'▶';
  tags();
  var n=loop.events.length;
  $('#loopInfo').textContent=(loop.rec?'Recording · ':'')+(n?n+(n===1?' chord':' chords'):'Empty')+(loop.xy.length>1?' \u00B7 motion':'');
}

