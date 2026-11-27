/* ---------- LINES: our own thin-line scenes (one per chord degree), drawn on #crit ---------- */
var crit={q:0,ms:0,nf:0,fa:0,src:null,nt:[48,52,55],cv:null,cx:null,on:true,hit:-1e5,hv:.8,sc:1,last:-1,t0:0,vy:[],key:'',cur:null,prev:null};
var CRIT_RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var OPC={B:'#B08CFF',G:'#FF4FA3',R:'#FF9A7A',W:'#FFE3F1',D:'rgba(255,111,181,.3)',P:'#F7B3D3'}; /* violet, hot pink, coral, cream, dim pink */
var SPN=64,SPV=[],OPS='"DM Sans",ui-sans-serif,system-ui,sans-serif';
function critSpawn(type,vel){crit.hit=performance.now();crit.hv=vel||.8;crit.sc=((type%7)+7)%7;}
function opL(c,p,col,lw,close){c.strokeStyle=col;c.lineWidth=lw||1.2;c.beginPath();c.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);if(close)c.closePath();c.stroke();}
var _fT='';
function opT(c,s,x,y,sz,col,wt,al){if(c.canvas.clientWidth<130&&sz<18)return;
  var f=(wt||200)+' '+Math.round(sz)+'px '+OPS;if(f!==c.font&&f!==_fT)c.font=f;_fT=f;c.fillStyle=col;c.textAlign=al||'left';c.textBaseline='alphabetic';c.fillText(s,x,y);}
function opM(c,s,x,y,col,al){if(c.canvas.clientWidth<130)return; /* too small for captions */
  c.font='500 8px "DM Mono",ui-monospace,monospace';c.fillStyle=col;c.textAlign=al||'left';c.textBaseline='alphabetic';c.fillText(s,x,y);}
function opC(c,x,y,r,col,lw){c.strokeStyle=col;c.lineWidth=lw||1.2;c.beginPath();c.arc(x,y,Math.max(.5,r),0,6.2832);c.stroke();}
function opBox(c,x,y,w,h,col,lw){c.strokeStyle=col;c.lineWidth=lw||1;c.strokeRect(Math.round(x)+.5,Math.round(y)+.5,w,h);}
function opCube(c,x,y,r,col){var p=[],i,a;for(i=0;i<6;i++){a=(-90+60*i)*Math.PI/180;p.push(x+r*Math.cos(a),y+r*Math.sin(a));}
  opL(c,p,col,1.2,true);for(i=1;i<6;i+=2)opL(c,[x,y,p[i*2],p[i*2+1]],col,1);}
function opNm(m){return NOTE[((m%12)+12)%12].replace('#','♯');}
/* Each scene draws the chord itself: rings that breathe, the circle of fifths, voice threads, interval arcs, a bloom, ratio figures */
var LISR=[[1,1],[16,15],[9,8],[6,5],[5,4],[4,3],[7,5],[3,2],[8,5],[5,3],[7,4],[15,8]];
var FIF=function(pc){return (pc*7)%12;};
/* 0 BREATH: one ring per chord note, swelling like a sigh */
function scBreath(c,w,h,d){
  var cx=w/2,cy=h/2,u=Math.min(w,h)*.5,cols=[OPC.B,OPC.G,OPC.R,OPC.P],n=d.nt.length,i;
  var ex=Math.min(1,d.age/1700);if(ex<1)opC(c,cx,cy,u*(.2+.8*ex),OPC.G,1);
  for(i=0;i<n;i++){
    var m=d.nt[i],e=d.pc[((m%12)+12)%12],R=u*(.2+.62*(i+1)/n)*(1+.05*Math.sin(d.t*1.1+i*.9)+.16*d.pulse+.1*e),a=d.t*(.35+.12*i)+i*2;
    opC(c,cx,cy,R,cols[i%4],1.2);
    var px=cx+Math.cos(a)*R,py=cy+Math.sin(a)*R;opC(c,px,py,3,OPC.W,1.2);opM(c,opNm(m),px+(Math.cos(a)>=0?6:-6),py+3,cols[i%4],Math.cos(a)>=0?'left':'right');
  }
  opC(c,cx,cy,2,OPC.W,1.4);
}
/* 2 THREADS: every voice is a thread; when the chord changes they glide to their new pitch */
function scThreads(c,w,h,d){
  var n=Math.min(4,d.nt.length),cols=[OPC.P,OPC.G,OPC.B,OPC.R],i,x;
  for(i=0;i<n;i++){
    var m=d.nt[n-1-i+(d.nt.length-n)],ty=h*(.86-Math.max(0,Math.min(1,(m-45)/26))*.72);
    crit.vy[i]=crit.vy[i]==null?ty:crit.vy[i]+(ty-crit.vy[i])*.12;
    var y0=crit.vy[i],e=d.pc[((m%12)+12)%12],amp=h*(.012+.05*e+.04*d.pulse),f=2+((m%12)/12)*3,p=[];
    for(x=0;x<=w;x+=8){var u=x/w;p.push(x,y0+amp*Math.sin(u*6.2832*f+d.t*(1.2+i*.3))*Math.sin(u*3.1416));}
    opL(c,p,cols[i%4],1.2);
    var kx=((d.t*.09+i*.27)%1)*w;opC(c,kx,y0+amp*Math.sin(kx/w*6.2832*f+d.t*(1.2+i*.3))*Math.sin(kx/w*3.1416),3,OPC.W,1.2);
    opM(c,opNm(m),4,y0-5,cols[i%4]);
  }
}
/* 1 ORBIT: circle of fifths, the chord is a polygon, the previous chord stays as a dim ghost */
function poly(c,nt,cx,cy,R,col,lw){
  var pcs=[],pts=[];nt.forEach(function(m){var k=FIF(((m%12)+12)%12);if(pcs.indexOf(k)<0)pcs.push(k);});
  pcs.sort(function(x,y){return x-y;});
  pcs.forEach(function(k){var a=k*Math.PI/6-Math.PI/2;pts.push(cx+Math.cos(a)*R,cy+Math.sin(a)*R);});
  if(pts.length>=4)opL(c,pts,col,lw,true);return pts;
}
function scOrbit(c,w,h,d){
  var cx=w/2,cy=h/2,R=Math.min(w,h)*(w<130?.44:.36),k,a;
  opC(c,cx,cy,R,OPC.D,1);
  for(k=0;k<12;k++){a=k*Math.PI/6-Math.PI/2;opL(c,[cx+Math.cos(a)*R*.94,cy+Math.sin(a)*R*.94,cx+Math.cos(a)*R*1.06,cy+Math.sin(a)*R*1.06],OPC.D,1);
    opM(c,NOTE[(k*7)%12].replace('#','♯'),cx+Math.cos(a)*R*1.26,cy+Math.sin(a)*R*1.26+3,OPC.D,'center');}
  if(d.prev)poly(c,d.prev,cx,cy,R,OPC.B,1);
  var pts=poly(c,d.nt,cx,cy,R,OPC.G,1.5),i;
  for(i=0;i<pts.length;i+=2){opC(c,pts[i],pts[i+1],3.2+3*d.pulse,OPC.W,1.3);}
  opC(c,cx,cy,1.8,OPC.P,1.4);
}
/* 3 ARCS: the intervals of the chord as bridges over a semitone ruler */
function scArcs(c,w,h,d){
  var lo=d.nt[0],sp=Math.max(12,d.nt[d.nt.length-1]-lo),x0=w*.06,pw=w*.88,y=h*.62,i,k,cols=[OPC.G,OPC.B,OPC.R,OPC.P];
  var X=function(s){return x0+s/sp*pw;};
  opL(c,[x0,y,x0+pw,y],OPC.D,1);for(k=0;k<=sp;k++)opL(c,[X(k),y,X(k),y+(k%12===0?8:4)],OPC.D,1);
  for(i=0;i<d.nt.length;i++){
    var s=d.nt[i]-lo,xs=X(s);opC(c,xs,y,3.2+2*d.pulse,OPC.W,1.3);opM(c,opNm(d.nt[i]),xs,y+22,OPC.P,'center');
    if(i){var s0=d.nt[i-1]-lo,xm=(X(s0)+xs)/2,rr=(xs-X(s0))/2,col=cols[(i-1)%4];
      c.strokeStyle=col;c.lineWidth=1.3;c.beginPath();c.ellipse(xm,y,rr,Math.min(h*.4,rr*(.9+.25*d.pulse)),0,Math.PI,0);c.stroke();
      opT(c,''+(s-s0),xm,y-Math.min(h*.4,rr*.9)-6,h*.1,col,200,'center');}
  }
}
/* 4 LEAD: voice leading; each note of the new chord is joined to the nearest note of the previous one */
function scLead(c,w,h,d){
  var A=d.prev||d.nt,B=d.nt,xa=w*.22,xb=w*.78,all=A.concat(B),lo=Math.min.apply(null,all)-4,hi=Math.max.apply(null,all)+4,
      py=function(m){return h*.9-(m-lo)/Math.max(12,hi-lo)*h*.8;},cols=[OPC.P,OPC.G,OPC.R,OPC.W],t=Math.min(1,d.age/500),e=t*t*(3-2*t);
  opL(c,[xa,h*.08,xa,h*.92],OPC.D,1);opL(c,[xb,h*.08,xb,h*.92],OPC.D,1);
  A.forEach(function(m){opC(c,xa,py(m),3,OPC.B,1.2);opM(c,opNm(m),xa-9,py(m)+3,OPC.B,'right');});
  B.forEach(function(m,j){
    var a=A[0],k;for(k=0;k<A.length;k++)if(Math.abs(A[k]-m)<Math.abs(a-m))a=A[k];
    var ya=py(a),yb=py(m),mx=xa+(xb-xa)*e,my=ya+(yb-ya)*e;
    c.strokeStyle=cols[j%4];c.lineWidth=1.4;c.beginPath();c.moveTo(xa,ya);c.bezierCurveTo(xa+(mx-xa)*.5,ya,xa+(mx-xa)*.5,my,mx,my);c.stroke();
    if(e>.98){opC(c,xb,yb,3+2*d.pulse,OPC.W,1.3);opM(c,opNm(m),xb+9,yb+3,cols[j%4]);}
  });
}
/* 5 BLOOM: twelve petals, long where the pitch class rings; chord petals are outlined bright */
function scBloom(c,w,h,d){
  var cx=w/2,cy=h/2,R=Math.min(w,h)*.44,k,act={};
  d.nt.forEach(function(m){act[((m%12)+12)%12]=1;});
  for(k=0;k<12;k++){
    var a=k*Math.PI/6-Math.PI/2+d.t*.06,on=!!act[k],L=R*(.22+.6*d.pc[k]+(on?.22+.1*d.pulse:0)),wd=R*.14,ca=Math.cos(a),sa=Math.sin(a),px=-sa,py=ca;
    c.strokeStyle=on?OPC.G:OPC.D;c.lineWidth=on?1.4:1;c.beginPath();c.moveTo(cx,cy);
    c.quadraticCurveTo(cx+ca*L*.5+px*wd,cy+sa*L*.5+py*wd,cx+ca*L,cy+sa*L);c.quadraticCurveTo(cx+ca*L*.5-px*wd,cy+sa*L*.5-py*wd,cx,cy);c.stroke();
    if(on){opC(c,cx+ca*L,cy+sa*L,2.6,OPC.W,1.2);opM(c,NOTE[k].replace('#','♯'),cx+ca*(L+10),cy+sa*(L+10)+3,OPC.P,'center');}
  }
  opC(c,cx,cy,R*.06,OPC.R,1.3);
}
/* 6 RATIOS: each interval of the chord as the Lissajous figure of its frequency ratio */
function scRatio(c,w,h,d){
  var n=Math.min(3,d.nt.length-1),i,j,cols=[OPC.G,OPC.B,OPC.R],cw=w/n,s=Math.min(cw*.4,h*.32);
  for(i=0;i<n;i++){
    var sm=(d.nt[i+1]-d.nt[0]+120)%12,ra=LISR[sm],cx=cw*(i+.5),cy=h*.46,p=[];
    for(j=0;j<=180;j++){var u=j/180*6.2832;p.push(cx+s*Math.sin(ra[0]*u+d.t*.7),cy+s*(.92+.08*d.pulse)*Math.sin(ra[1]*u));}
    opL(c,p,cols[i],1.1);opM(c,ra[0]+':'+ra[1],cx,h*.9,cols[i],'center');
  }
}
var SCN=[scBreath,scOrbit,scThreads,scArcs,scLead,scBloom,scRatio];
function critDraw(){
  if(!crit.on)return;
  var now=performance.now();
  if(now-crit.fa<[33,50,66][crit.q])return; /* 30 fps, stepping down to 20 / 15 fps if this device is slow */
  crit.fa=now;
  var cv=crit.cv;
  if(!cv){cv=document.getElementById('crit');if(!cv)return;crit.cv=cv;crit.cx=cv.getContext('2d');}
  var dpr=crit.q?1:Math.min(1.5,window.devicePixelRatio||1),w=cv.clientWidth,h=cv.clientHeight;
  if(!w||!h)return;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
  var c=crit.cx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);c.lineCap='round';c.lineJoin='round';
  var live=!!an2,t=now/1000;
  if(live)an2.getByteFrequencyData(fBuf);
  var sr=ctx?ctx.sampleRate:44100,nb=fBuf?fBuf.length:2048,F0=55,F1=8000,ratio=Math.log(F1/F0),i,b;
  for(i=0;i<SPN;i++){
    var v=0;
    if(live){var b0=Math.floor(F0*Math.exp(i/SPN*ratio)*2*nb/sr),b1=Math.max(b0+1,Math.floor(F0*Math.exp((i+1)/SPN*ratio)*2*nb/sr));for(b=b0;b<b1&&b<nb;b++)if(fBuf[b]>v)v=fBuf[b];v/=255;}
    else v=CRIT_RM?.05:.05+.03*Math.sin(i*.55+t*1.6);
    SPV[i]=Math.max(v,(SPV[i]||0)*.86);
  }
  function band(a,z){var s=0;for(var k=a;k<z;k++)s+=SPV[k];return Math.min(1,s/(z-a)*1.6);}
  var pc=[0,0,0,0,0,0,0,0,0,0,0,0];
  if(live){var lo=Math.floor(65*2*nb/sr),hi=Math.min(nb-1,Math.floor(2100*2*nb/sr));
    for(b=lo;b<=hi;b++){var f=b*sr/(2*nb),m=69+12*Math.log(f/440)/Math.LN2,r=Math.round(m);if(Math.abs(m-r)>.42)continue;var k2=((r%12)+12)%12,vv=fBuf[b]/255;if(vv>pc[k2])pc[k2]=vv;}}
  if(crit.src!==curNotes){crit.src=curNotes;crit.nt=(curNotes&&curNotes.length?curNotes.slice():[48,52,55]).sort(function(x,y){return x-y;});}
  var nt=crit.nt;
  var age=now-crit.hit;
  if(age>9000)crit.sc=Math.floor(now/9000)%7; /* nobody playing: the display wanders through its scenes */
  
  var key=nt.join();if(key!==crit.key){crit.key=key;crit.prev=crit.cur;crit.cur=nt;}
    var d={prev:crit.prev,t:t,age:age,vel:crit.hv,pulse:Math.max(0,1-age/420)*crit.hv,nt:nt,pc:pc,lo:band(0,20),mi:band(20,42),hi:band(42,64)};
  var sc=crit.sc;if(sc!==crit.last){crit.last=sc;crit.t0=now;}
  c.globalAlpha=Math.min(1,(now-crit.t0)/260);
  SCN[sc](c,w,h,d);
  c.globalAlpha=1;
  /* self-tuning: if drawing costs too much on this phone, drop the frame rate and resolution */
  crit.ms=crit.ms*.92+(performance.now()-now)*.08;
  if(++crit.nf>45&&crit.ms>4&&crit.q<2){crit.q++;crit.nf=0;crit.ms=0;}
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
function meterLoop(){meterLoop.on=true;if(!crit.on)drawViz();critDraw();requestAnimationFrame(meterLoop);}
/* before the audio engine starts (first tap) only the display scenes idle */
(function pre(){if(meterLoop.on)return;critDraw();requestAnimationFrame(pre);})();
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

