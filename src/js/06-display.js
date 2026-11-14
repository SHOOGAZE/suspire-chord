/* ---------- neon critters (one per pad) ---------- */
var crit={list:[],cv:null,cx:null,w:0,h:0,on:true,dirty:false,set:1};
var CRIT_RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function critSpawn(type,vel,notes){
  if(!crit.on||CRIT_RM)return;
  if(!crit.cv){crit.cv=document.getElementById('crit');if(!crit.cv)return;crit.cx=crit.cv.getContext('2d');}
  var w=crit.cv.clientWidth||300;
  if(crit.list.length>=4)crit.list.shift();
  crit.alt=crit.alt||[0,0,0,0,0,0,0];var tp=type%7;crit.alt[tp]^=1;
  var dir=Math.random()<.5?-1:1;
  crit.list.push({alt:crit.alt[tp],type:tp,born:performance.now(),life:1900+Math.random()*500,x:w*(.18+Math.random()*.64),dir:dir,v:.7+.4*(vel||.8),ph:Math.random()*6,notes:notes||null,sv:[Math.random(),Math.random(),Math.random(),Math.random()],vel:vel||.8});
}
/* synthwave set: neon wireframes, drawn at ~50 units tall, origin bottom-centre */
var LZ=420,PK='#FF6FB5',VL='#B08CFF',SV=[.5,.5,.5,.5];
function swL(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.stroke();}
function swWire(c,V,E,t,cy,sc,tilt){
  var cy1=Math.cos(t),sy=Math.sin(t),cx=Math.cos(tilt),sx=Math.sin(tilt),P=V.map(function(v){
    var x=v[0]*cy1+v[2]*sy,z=-v[0]*sy+v[2]*cy1,y=v[1]*cx-z*sx;z=v[1]*sx+z*cx;
    return [x*sc,cy+y*sc,z];});
  E.forEach(function(e){var a=P[e[0]],b=P[e[1]],back=(a[2]+b[2])/2<0;c.strokeStyle=back?VL:PK;c.globalAlpha=(c.globalAlpha||1);swL(c,[a[0],a[1],b[0],b[1]]);});
}
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
function inPoly(c,pts,close){c.beginPath();pts.forEach(function(q,i){if(i)c.lineTo(q[0],q[1]);else c.moveTo(q[0],q[1]);});if(close)c.closePath();c.stroke();}
/* abstract line-art: two shapes per pad (the second one comes on every other tap), all driven by the chord and the random seed SV */
var ABST=[
  function string(c,t){var cy=-26,n=2+Math.floor(SV[0]*3),i,x;[PK,VL].forEach(function(col,k){c.strokeStyle=col;c.beginPath();for(x=-34;x<=34;x+=1.5){var env=Math.sin((x+34)/68*Math.PI*(k?n+1:n));var y=cy+env*14*Math.sin(t*(7+k*3)+SV[1]*6);if(x>-34)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();});
    c.strokeStyle=PK;inPoly(c,[[-34,cy-9],[-34,cy+9]],false);inPoly(c,[[34,cy-9],[34,cy+9]],false);},
  function pendula(c,t){var i,n=7,top=-48;c.strokeStyle=VL;inPoly(c,[[-30,top],[30,top]],false);for(i=0;i<n;i++){var L=16+i*3.2,a=.5*Math.sin(t*(2.2-i*.11)+SV[2]*3),x0=-24+i*8,x=x0+Math.sin(a)*L,y=top+Math.cos(a)*L;c.strokeStyle=i%2?VL:PK;inPoly(c,[[x0,top],[x,y]],false);swEll(c,x,y,2.6,2.6);}},
  function spiro(c,t){var cy=-26,R=21,r=5+SV[0]*8,d=6+SV[1]*8,k,i,ph=t*.6;c.strokeStyle=PK;c.beginPath();for(i=0;i<=260;i++){k=i/260*6.2832*5;var x=(R-r)*Math.cos(k+ph)+d*Math.cos((R-r)/r*k),y=cy+(R-r)*Math.sin(k+ph)-d*Math.sin((R-r)/r*k);if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();c.strokeStyle=VL;swEll(c,0,cy,R,R);},
  function grid(c,t){var cy=-26,i,j,N=9,pts=[];for(i=0;i<N;i++){pts[i]=[];for(j=0;j<N;j++){var x=(i-4)*7.5,y=(j-4)*5.5,dx=x-Math.sin(t*1.3+SV[0]*5)*14,dy=y-Math.cos(t*1.1+SV[1]*5)*9,dd=Math.sqrt(dx*dx+dy*dy)+4,w=60/(dd*dd+30);pts[i][j]=[x-dx*w*.35,cy+y-dy*w*.35];}}
    for(i=0;i<N;i++){c.strokeStyle=i%2?VL:PK;c.beginPath();for(j=0;j<N;j++){if(j)c.lineTo(pts[i][j][0],pts[i][j][1]);else c.moveTo(pts[i][j][0],pts[i][j][1]);}c.stroke();}
    c.strokeStyle=VL;for(j=0;j<N;j+=2){c.beginPath();for(i=0;i<N;i++){if(i)c.lineTo(pts[i][j][0],pts[i][j][1]);else c.moveTo(pts[i][j][0],pts[i][j][1]);}c.stroke();}},
  function tree(c,t){var sw=Math.sin(t*1.2)*.07;(function br(x,y,a,l,d){if(d<0||l<2)return;var x2=x+Math.sin(a)*l,y2=y-Math.cos(a)*l;c.strokeStyle=d%2?VL:PK;inPoly(c,[[x,y],[x2,y2]],false);br(x2,y2,a-.45-SV[0]*.3+sw,l*.74,d-1);br(x2,y2,a+.4+SV[1]*.3+sw,l*.74,d-1);})(0,0,0,15,5);},
  function atom(c,t){var cy=-26,i;c.strokeStyle=PK;swEll(c,0,cy,3,3);for(i=0;i<3;i++){var a=i*1.0472+SV[0]*2,ca=Math.cos(a),sa=Math.sin(a);c.strokeStyle=i%2?VL:PK;c.save();c.translate(0,cy);c.rotate(a);swEll(c,0,0,26,9);c.restore();var ph=t*(2+i*.6)+i*2,ex=Math.cos(ph)*26,ey=Math.sin(ph)*9;c.fillStyle=c.strokeStyle;c.beginPath();c.arc(ex*ca-ey*sa,cy+ex*sa+ey*ca,2.2,0,6.2832);c.fill();}},
  function scope(c,t){var cy=-26,i;c.strokeStyle=VL;inPoly(c,[[-32,cy-20],[32,cy-20],[32,cy+20],[-32,cy+20]],true);for(i=1;i<4;i++){inPoly(c,[[-32+i*16,cy-20],[-32+i*16,cy+20]],false);}inPoly(c,[[-32,cy],[32,cy]],false);c.strokeStyle=PK;c.beginPath();for(i=0;i<=120;i++){var x=-32+i*.5333,e=Math.sin(i/120*3.1416),y=cy+(Math.sin(i*.35+t*8)*.6+Math.sin(i*.9-t*5+SV[0]*5)*.4)*17*(.35+.65*e);if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}
  ,function rose(c,t,n){var cy=-26,k=2+Math.floor(SV[0]*3),i;[PK,VL].forEach(function(col,q){c.strokeStyle=col;c.beginPath();for(i=0;i<=300;i++){var th=i/300*6.2832*(k%2?1:2),r=(q?15:23)*Math.cos((k+q*.5)*th+t*(q?-.8:.6));var x=r*Math.cos(th+t*.3),y=cy+r*Math.sin(th+t*.3);if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();});},
  function polys(c,t,n){var cy=-26,m=3+Math.floor(SV[1]*4),i,j;for(i=0;i<5;i++){var r=24-i*4.4,a=t*(i%2?-1:1)*(.6+i*.2)+i*.4+SV[2]*3;c.strokeStyle=i%2?VL:PK;var pts=[];for(j=0;j<m;j++)pts.push([Math.cos(a+j/m*6.2832)*r,cy+Math.sin(a+j/m*6.2832)*r]);inPoly(c,pts,true);}},
  function ribbon(c,t){var cy=-26,q,x;for(q=0;q<4;q++){c.strokeStyle=q%2?VL:PK;c.beginPath();for(x=-34;x<=34;x+=1.5){var y=cy+Math.sin(x/(9+SV[0]*8)+t*(1.5+q*.4)+q*1.4)*(9-q*1.6)+Math.sin(x/5+t*2.2+q)*3*(q%2?1:-1);if(x>-34)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}},
  function moire(c,t){var cy=-26,i,ox=Math.sin(t*.9+SV[0]*5)*9,oy=Math.cos(t*.7+SV[1]*5)*5;for(i=1;i<=7;i++){c.strokeStyle=PK;swEll(c,-ox,cy-oy,i*3.6,i*3.6);c.strokeStyle=VL;swEll(c,ox,cy+oy,i*3.6,i*3.6);}},
  function hexrip(c,t){var cy=-26,i,j;for(i=0;i<6;i++){var z=((t*.45+i/6)%1),r=3+z*27;c.globalAlpha=(c.globalAlpha||1)*0+(1-z)*.95;c.strokeStyle=i%2?VL:PK;var pts=[];for(j=0;j<6;j++)pts.push([Math.cos(j/6*6.2832+SV[0]*2)*r,cy+Math.sin(j/6*6.2832+SV[0]*2)*r*.9]);inPoly(c,pts,true);}c.globalAlpha=1;},
  function galaxy(c,t){var cy=-26,arm,i,A=2+Math.floor(SV[2]*3);for(arm=0;arm<A;arm++){c.strokeStyle=arm%2?VL:PK;c.beginPath();for(i=0;i<=90;i++){var u=i/90,th=u*7+arm/A*6.2832+t*.9,r=2+u*26;var x=Math.cos(th)*r,y=cy+Math.sin(th)*r*.62;if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}c.strokeStyle=PK;swEll(c,0,cy,2,2);},
  function pulse(c,t){var cy=-26,x,sp=((t*.5)%1)*80-40;c.strokeStyle=VL;inPoly(c,[[-34,cy],[34,cy]],false);c.strokeStyle=PK;c.beginPath();for(x=-34;x<=34;x+=1){var d=x-sp,y=cy-(Math.exp(-d*d/6)*20-Math.exp(-(d+4)*(d+4)/3)*7+Math.exp(-(d-4)*(d-4)/3)*8)*(.6+SV[0]*.6);if(x>-34)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}
];
function critDraw(){
  var cv=crit.cv;
  if(!cv){cv=document.getElementById('crit');if(!cv)return;crit.cv=cv;crit.cx=cv.getContext('2d');}
  var L=crit.list;
  if(!L.length&&!crit.dirty)return;
  var dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth,h=cv.clientHeight;
  if(!w||!h)return;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
  var c=crit.cx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  var now=performance.now();crit.dirty=false;
  crit.list=L.filter(function(o){return now-o.born<o.life;});
  crit.list.forEach(function(o){
    var age=now-o.born,a=Math.min(1,age/70,(o.life-age)/400);
    var ARR=crit.set===1?SYNTH:ABST,ti=crit.set===1?o.type:o.type+7*o.alt;
    {var k=Math.max(.6,Math.min(2.4,h*.84/52,w*.9/80))*(.9+.1*o.v),tt=age/1000+o.ph*.3;
      var xx=w/2;
      c.save();c.translate(xx,Math.round(h/2+25*k));c.scale(k,k);c.globalAlpha=a;
      var nn=o.notes&&o.notes.length?o.notes.slice().sort(function(x,y){return x-y;}):[48],rt=((nn[0]%12)+12)%12,minor=nn.length>1&&((nn[1]-nn[0])%12===3||(nn[1]-nn[0])%12===2),vv=Math.max(0,Math.min(1,o.vel||.8)),
          h1=(200+rt*(150/11)+(nn.length>3?15:0))%360,h2=(h1+(minor?-95:-55)+360)%360,lt=62+vv*14;
      PK='hsl('+h1.toFixed(0)+',100%,'+lt.toFixed(0)+'%)';VL='hsl('+h2.toFixed(0)+',95%,'+(lt-4).toFixed(0)+'%)';SV=o.sv||SV;
      c.lineWidth=(1.3+vv*2.2)/k;c.lineCap='round';c.lineJoin='round';c.strokeStyle=PK;c.fillStyle=PK;c.shadowColor='hsla('+h1.toFixed(0)+',100%,60%,.95)';c.shadowBlur=6+vv*10;
      /* laser stroke: every line draws itself in, with a hot head that cools to the chord colour */
      var dp=Math.min(1,age/(LZ+120*(1-vv)));
      if(dp<1){var e=dp*dp*(3-2*dp),hot=1-dp;
        c.setLineDash([e*300,4000]);c.lineWidth*=1+.35*hot;c.shadowBlur*=1+.5*hot;
        var hl='hsl('+h1.toFixed(0)+',100%,'+(lt+(96-lt)*hot).toFixed(0)+'%)';c.strokeStyle=hl;
        var keepPK=PK;PK=hl;ARR[ti](c,tt,o.notes);PK=keepPK;c.setLineDash([]);c.restore();return;}
      ARR[ti](c,tt,o.notes);c.restore();return;}
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
function meterLoop(){drawViz();critDraw();requestAnimationFrame(meterLoop);}
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
function cp(e){return {b:e.b,d:e.d,notes:e.notes.slice(),bass:e.bass,mode:e.mode,deg:e.deg,kpc:e.kpc,vel:e.vel,layer:e.layer||1,take:e.take||0};}
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
  var n=loop.events.length;var ub=$('#takeBtn');if(ub)ub.disabled=!n;
  $('#loopInfo').textContent=(loop.rec?'Recording · ':'')+(n?n+(n===1?' chord':' chords'):'Empty')+(loop.xy.length>1?' \u00B7 motion':'');
}

