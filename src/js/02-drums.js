/* ---------- drums ---------- */
var KITS=[
  {n:'Tape',kf:[120,44],kd:.34,tone:190,nz:2400,sd:.17,hat:6500,hd:.035,lp:5200,sat:1},
  {n:'Analog',kf:[160,46],kd:.46,tone:210,nz:3200,sd:.2,hat:8500,hd:.04,lp:16000,sat:0},
  {n:'Soft',kf:[95,52],kd:.26,tone:170,nz:1900,sd:.14,hat:5200,hd:.03,lp:3600,sat:0}
];
var DPATS=[
  {n:'Pulse',k:'2000100020001000',s:'0000200000002000',h:'0101010101010101'},
  {n:'Boom bap',k:'2000001020100000',s:'0000200000002000',h:'1010101010101011'},
  {n:'Half time',k:'2000000000100000',s:'0000000020000000',h:'1010101010101010'},
  {n:'Dream',k:'2000000000100000',r:'0000100000001000',h:'0010001000100010',o:'0000000000000010'},
  {n:'Four floor',k:'2000200020002000',c:'0000200000002000',h:'1000100010001000',o:'0010001000100010'},
  {n:'Lo-fi shuffle',k:'2000001000100000',s:'0000200000002000',h:'1001101001101010'},
  {n:'Ballad',k:'2000000000001000',s:'0000000020000000',h:'1000100010001000'},
  {n:'Trap',k:'2000000100200000',s:'0000000020000000',h:'1010101011111111'}
];
var DNOTE={k:36,s:38,h:42,o:46,c:39,r:37};
var drum={on:false,kit:0,pat:3,lvl:.7,step:0,base:0,timer:null};
function dNoise(t,type,f,q,gain,dec,dest){
  var sr=ctx.createBufferSource();sr.buffer=noiseBuf();sr.loop=true;
  var fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
  var g=ctx.createGain();g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dec);
  sr.connect(fl);fl.connect(g);g.connect(dest);sr.start(t,Math.random()*.5);sr.stop(t+dec+.05);sr.onended=function(){try{sr.disconnect();fl.disconnect();g.disconnect();}catch(e){}};
}
function dTone(t,type,f0,f1,fdur,gain,dec,dest){
  var o=ctx.createOscillator(),g=ctx.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+fdur);
  g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dec);
  o.connect(g);g.connect(dest);o.start(t);o.stop(t+dec+.05);o.onended=function(){try{o.disconnect();g.disconnect();}catch(e){}};
}
function drumHit(v,t,a){
  var K=KITS[drum.kit],d=drumF,lvl=a>1?1:.62;
  if(v==='k'){dTone(t,'sine',K.kf[0],K.kf[1],.09,1.1*lvl,K.kd,d);dTone(t,'triangle',K.kf[0]*2,K.kf[1]*2,.03,.18*lvl,.05,d);}
  else if(v==='s'){dTone(t,'triangle',K.tone*1.3,K.tone,.05,.5*lvl,.11,d);dNoise(t,'bandpass',K.nz,.7,.75*lvl,K.sd,d);}
  else if(v==='h'){dNoise(t,'highpass',K.hat,.7,.34*lvl,K.hd,d);}
  else if(v==='o'){dNoise(t,'highpass',K.hat*.9,.7,.3*lvl,K.hd*7,d);}
  else if(v==='c'){[0,.011,.024].forEach(function(x){dNoise(t+x,'bandpass',1500,1.1,.6*lvl,.03,d);});dNoise(t+.03,'bandpass',1400,.9,.5*lvl,K.sd*1.4,d);}
  else if(v==='r'){dTone(t,'square',1750,1500,.01,.18*lvl,.025,d);dNoise(t,'highpass',3500,.8,.12*lvl,.02,d);}
}
function drumTick(){
  if(!ctx||!drum.on)return;
  var P=DPATS[drum.pat],sd=60/S.bpm/4;
  while(drum.base<ctx.currentTime+.12){
    var i=drum.step%16,t=drum.base+(i%2?S.swing*sd*.4:0);
    if(t>=ctx.currentTime-.01){'kschor'.split('').forEach(function(v){var c=P[v]&&P[v].charAt(i);if(c&&c!=='0')drumHit(v,Math.max(t,ctx.currentTime),+c);});}
    drum.base+=sd;drum.step++;
  }
}
function drumsStart(t0){
  ensureAudio();
  if(drum.timer)clearInterval(drum.timer);
  drum.on=true;drum.step=0;drum.base=t0||ctx.currentTime+.05;
  drumKit();
  drum.timer=setInterval(drumTick,25);drumTick();
}
function drumsStop(){drum.on=false;if(drum.timer){clearInterval(drum.timer);drum.timer=null;}}
function drumKit(){if(!drumF)return;var K=KITS[drum.kit];drumF.frequency.setTargetAtTime(K.lp,ctx.currentTime,.02);}

