/* ---------- audio engine ---------- */
var tremG=null,drumG=null,drumF=null;
var ctx=null,bus,toneF,mix,comp,master,chorusG,delayG,delayN,revG,an=null,anBuf=null,an2=null,fBuf=null;
function impulse(sec){
  var sr=ctx.sampleRate,n=Math.floor(sr*sec),pre=Math.floor(sr*.022),att=Math.floor(sr*.01),b=ctx.createBuffer(2,n,sr);
  for(var c=0;c<2;c++){
    var d=b.getChannelData(c),y=0;
    for(var i=pre;i<n;i++){
      var t=(i-pre)/(n-pre),k=.85*Math.pow(.1,t)+.07;
      y+=k*((Math.random()*2-1)-y);
      d[i]=y*Math.pow(1-t,2.6)*(i-pre<att?(i-pre)/att:1);
    }
  }
  return b;
}
function satCurve(){var n=1024,c=new Float32Array(n),k=1.4,m=Math.tanh(k);for(var i=0;i<n;i++){var x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/m;}return c;}
function ensureAudio(){
  if(ctx){if(ctx.state==='suspended')ctx.resume();return;}
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
  var AC=window.AudioContext||window.webkitAudioContext;
  ctx=new AC();
  bus=ctx.createGain();
  (function(){var tl=ctx.createOscillator();tremG=ctx.createGain();tremG.gain.value=0;tl.frequency.value=4;tl.connect(tremG);tremG.connect(bus.gain);tl.start();window.__tl=tl;})();
  toneF=ctx.createBiquadFilter();toneF.type='lowpass';toneF.Q.value=.5;
  mix=ctx.createGain();
  comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;comp.attack.value=.01;comp.release.value=.2;
  master=ctx.createGain();
  var sat=ctx.createWaveShaper();sat.curve=satCurve();sat.oversample='2x';
  var satOut=ctx.createGain();satOut.gain.value=.78;
  bus.connect(sat);sat.connect(satOut);satOut.connect(toneF);toneF.connect(mix);
  chorusG=ctx.createGain();chorusG.connect(mix);
  [-0.8,0.8].forEach(function(pan,i){
    var d=ctx.createDelay(.05);d.delayTime.value=.016+i*.005;
    var lfo=ctx.createOscillator();lfo.frequency.value=.35+i*.17;
    var lg=ctx.createGain();lg.gain.value=.004;
    lfo.connect(lg);lg.connect(d.delayTime);lfo.start();
    var p=ctx.createStereoPanner();p.pan.value=pan;
    toneF.connect(d);d.connect(p);p.connect(chorusG);
  });
  delayN=ctx.createDelay(2);
  var dwow=ctx.createOscillator(),dwg=ctx.createGain();dwow.frequency.value=.37;dwg.gain.value=.0012;dwow.connect(dwg);dwg.connect(delayN.delayTime);dwow.start();
  var fb=ctx.createGain();fb.gain.value=.38;
  var dlp=ctx.createBiquadFilter();dlp.type='lowpass';dlp.frequency.value=2300;
  delayG=ctx.createGain();
  var dsend=ctx.createGain();dsend.gain.value=1;
  toneF.connect(dsend);dsend.connect(delayN);delayN.connect(dlp);dlp.connect(fb);fb.connect(delayN);dlp.connect(delayG);delayG.connect(mix);
  var conv=ctx.createConvolver();conv.buffer=impulse(2.4);
  revG=ctx.createGain();
  toneF.connect(revG);revG.connect(conv);conv.connect(mix);
  drumF=ctx.createBiquadFilter();drumF.type='lowpass';drumF.frequency.value=12000;drumG=ctx.createGain();drumG.gain.value=drum.lvl;drumF.connect(drumG);drumG.connect(mix);
  /* safety limiter after the compressor: straight up to 0.8, then a soft knee, so loud stacks never clip the speakers or a recording */
  var lim=ctx.createWaveShaper(),lc=new Float32Array(2049),li,lx,la;
  for(li=0;li<2049;li++){lx=li/1024-1;la=Math.abs(lx);lc[li]=la<=.8?lx:(lx<0?-1:1)*(.8+.18*Math.tanh((la-.8)/.18));}
  lim.curve=lc;lim.oversample='2x';
  mix.connect(comp);comp.connect(lim);lim.connect(master);master.connect(ctx.destination);
  an=ctx.createAnalyser();an.fftSize=512;anBuf=new Uint8Array(an.fftSize);master.connect(an);
  an2=ctx.createAnalyser();an2.fftSize=4096;an2.smoothingTimeConstant=.8;fBuf=new Uint8Array(an2.frequencyBinCount);master.connect(an2);
  applyParams();
  var ap=document.querySelector('.app');if(ap)ap.classList.add('live');
  meterLoop();
}
function applyParams(){
  if(!ctx)return;
  var t=ctx.currentTime;
  toneF.frequency.setTargetAtTime(Math.min(18000,400*Math.pow(45,S.tone)*toneMod),t,.03);
  toneF.Q.setTargetAtTime(.5+S.res*S.res*16,t,.03);
  chorusG.gain.value=S.chorus*.9;
  delayG.gain.value=S.delay*.8;
  delayN.delayTime.value=.75*60/S.bpm;
  revG.gain.value=S.reverb*.9;
  master.gain.value=S.vol*.9;
  if(tremG){var td=S.trem*.45;bus.gain.setTargetAtTime(1-td,t,.05);tremG.gain.setTargetAtTime(td,t,.05);if(window.__tl)window.__tl.frequency.setTargetAtTime(.8+S.trate*9,t,.05);}
}
function mult(x){return Math.pow(4,(x-.5)*2);}
function mtof(m){return 440*Math.pow(2,(m-69)/12);}

var INST={
  suspire:{n:'Suspire',a:.5,d:2.4,s:.78,r:2.2,p:.27},
  saw:{n:'Saw',a:.008,d:.5,s:.6,r:.22,p:.2},
  pad:{n:'Pad',a:.7,d:1,s:.85,r:1.4,p:.2},
  strings:{n:'Strings',a:.3,d:.6,s:.85,r:.7,p:.18},
  piano:{n:'Piano',a:.002,d:3,s:.2,r:.3,p:.24},
  epiano:{n:'E-Piano',a:.003,d:1.8,s:.12,r:.3,p:.3},
  brass:{n:'Brass',a:.06,d:.3,s:.85,r:.15,p:.2},
  flute:{n:'Flute',a:.08,d:.3,s:.9,r:.2,p:.33},
  organ:{n:'Organ',a:.008,d:.05,s:1,r:.07,p:.2},
  choir:{n:'Choir',a:.35,d:.8,s:.85,r:.9,p:.3},
  bell:{n:'Bell',a:.003,d:2.6,s:.08,r:1.2,p:.26},
  tape:{n:'Tape Keys',a:.006,d:1.4,s:.25,r:.5,p:.26},
  pluck:{n:'Pluck',a:.002,d:.45,s:.04,r:.18,p:.3},
  sample:{n:'Sample',a:.004,d:.05,s:1,r:.25,p:.5}
};
var active=[],MAXV=20,BUDGET=110,nbuf=null;
function noiseBuf(){
  if(!nbuf){nbuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);var d=nbuf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  return nbuf;
}
function osc(type,freq,det,gain,dest,t,src){
  var o=ctx.createOscillator();o.type=type;o.frequency.value=freq;o.detune.value=det||0;
  var gn=ctx.createGain();gn.gain.value=gain;o.connect(gn);gn.connect(dest);o.start(t);src.push(o);
  return o;
}
function hit(t,dur,type,freq,q,gain,dest,src,loop){
  var sr=ctx.createBufferSource();sr.buffer=noiseBuf();sr.loop=!!loop;
  var f=ctx.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
  var gn=ctx.createGain();gn.gain.setValueAtTime(gain,t);if(dur)gn.gain.setTargetAtTime(0,t,dur/3);
  sr.connect(f);f.connect(gn);gn.connect(dest);sr.start(t);src.push(sr);
}
function lpf(freq,q,dest){var f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=freq;f.Q.value=q||.6;f.connect(dest);return f;}
function vibNode(rate,depth,t,src,delay,ramp){
  var o=ctx.createOscillator();o.frequency.value=rate;
  var gn=ctx.createGain();gn.gain.setValueAtTime(0,t);gn.gain.setValueAtTime(0,t+delay);gn.gain.linearRampToValueAtTime(depth,t+delay+ramp);
  o.connect(gn);o.start(t);src.push(o);return gn;
}
function lfoInto(param,rate,depth,t,src){
  var o=ctx.createOscillator();o.frequency.value=rate;var gn=ctx.createGain();gn.gain.value=depth;
  o.connect(gn);gn.connect(param);o.start(t);src.push(o);
}
var BUILD={
  suspire:function(f,m,v,t,g,src){
    var top=Math.min(f*(3.4+2*v),6500),lo=Math.max(f*1.1,180);
    var lp=lpf(lo,.7,g);
    lp.frequency.setValueAtTime(lo,t);
    lp.frequency.setTargetAtTime(top,t,.45);
    lp.frequency.setTargetAtTime(top*.55,t+1.4,1.6);
    var vib=vibNode(4.6,6,t,src,.7,1.6);
    [-11,0,11].forEach(function(d){var o=osc('sawtooth',f,d,.2,lp,t,src);vib.connect(o.detune);});
    var o2=osc('triangle',f/2,3,.2,lp,t,src);vib.connect(o2.detune);
    osc('sine',f/2,-4,.1,lp,t,src);
    var br=ctx.createBufferSource();br.buffer=noiseBuf();br.loop=true;
    var bf=ctx.createBiquadFilter();bf.type='bandpass';bf.frequency.value=Math.min(2600+f*.5,5200);bf.Q.value=.9;
    var bg=ctx.createGain();bg.gain.setValueAtTime(0,t);bg.gain.linearRampToValueAtTime(.05,t+.35);bg.gain.setTargetAtTime(.007,t+.45,.9);
    br.connect(bf);bf.connect(bg);bg.connect(g);br.start(t);src.push(br);
  },
  choir:function(f,m,v,t,g,src){
    var mix=ctx.createGain();mix.gain.value=1;
    [[760,5,2.4],[1150,6,1.5]].forEach(function(F){var b=ctx.createBiquadFilter();b.type='bandpass';b.frequency.value=F[0];b.Q.value=F[1];var o=ctx.createGain();o.gain.value=F[2];mix.connect(b);b.connect(o);o.connect(g);});
    var vib=vibNode(5.2,9,t,src,.25,.8);
    [-9,0,9].forEach(function(d){var o=osc('sawtooth',f,d,.22,mix,t,src);vib.connect(o.detune);});
  },
  bell:function(f,m,v,t,g,src){
    var car=ctx.createOscillator(),mod=ctx.createOscillator(),ig=ctx.createGain();
    car.type='sine';mod.type='sine';car.frequency.value=f;mod.frequency.value=f*3.5;
    ig.gain.setValueAtTime(f*(1.2+1.6*v),t);ig.gain.setTargetAtTime(f*.05,t,.5);
    mod.connect(ig);ig.connect(car.frequency);car.connect(g);car.start(t);mod.start(t);src.push(car,mod);
    var pg=ctx.createGain();pg.gain.setValueAtTime(.3,t);pg.gain.setTargetAtTime(0,t+.01,.35);pg.connect(g);
    osc('sine',f*2.76,0,1,pg,t,src);
  },
  tape:function(f,m,v,t,g,src){
    var lp=lpf(Math.min(f*4.5,7000),.5,g);
    var wob=vibNode(.9,14,t,src,0,.01);
    var o1=osc('triangle',f,-6,.6,lp,t,src),o2=osc('sine',f*2,5,.18,lp,t,src);wob.connect(o1.detune);wob.connect(o2.detune);
  },
  pluck:function(f,m,v,t,g,src){
    var hi=Math.min(f*9,12000),lp=lpf(hi,.8,g);
    lp.frequency.setValueAtTime(hi,t);lp.frequency.setTargetAtTime(Math.max(f*1.4,200),t,.09);
    osc('sawtooth',f,-5,.4,lp,t,src);osc('square',f,5,.18,lp,t,src);
  },
  saw:function(f,m,v,t,g,src){
    var lp=lpf(Math.min(16000,f*(4+4*v)),.6,g);
    osc('sawtooth',f,-8,.5,lp,t,src);osc('sawtooth',f,8,.5,lp,t,src);
  },
  pad:function(f,m,v,t,g,src){
    var base=Math.min(f*3.2,5500),lp=lpf(base,.5,g);
    lp.frequency.setValueAtTime(base*.35,t);lp.frequency.exponentialRampToValueAtTime(base,t+.9);
    lfoInto(lp.frequency,.13,base*.45,t,src);
    [-14,0,14].forEach(function(d){osc('sawtooth',f,d,.3,lp,t,src);});
    osc('triangle',f/2,0,.22,lp,t,src);
  },
  strings:function(f,m,v,t,g,src){
    var lp=lpf(500,.7,g);
    lp.frequency.setValueAtTime(500,t);lp.frequency.exponentialRampToValueAtTime(Math.min(f*5.5,9000),t+.6);
    var vib=vibNode(5.3,7,t,src,.35,.7);
    [-12,-5,5,12].forEach(function(d){var o=osc('sawtooth',f,d,.26,lp,t,src);vib.connect(o.detune);});
    osc('triangle',f/2,0,.1,lp,t,src);
    hit(t,0,'bandpass',Math.min(f*3,4000),.8,.012,lp,src,true);
  },
  piano:function(f,m,v,t,g,src){
    var vel=.5+.5*v;
    var lp=lpf(Math.min(15000,600+f*(3+9*v)),.4,g);
    var Bc=.00007*Math.pow(f/110,1.6),base=3.4*Math.pow(.5,(m-45)/30);
    for(var n=1;n<=7;n++){
      var fn=n*f*Math.sqrt(1+Bc*n*n);if(fn>11000)break;
      var a=Math.pow(n,-1.1)*(n>1?vel:1),tau=base/(1+.7*(n-1));
      var pg=ctx.createGain();pg.gain.setValueAtTime(a,t);pg.gain.setTargetAtTime(0,t+.02,tau);pg.connect(lp);
      osc('sine',fn,0,1,pg,t,src);
      if(n<=3)osc('sine',fn,1.4+.5*n,.7,pg,t,src);
    }
    hit(t,.03,'bandpass',Math.min(5000,f*6),.9,.1*v,lp,src,false);
  },
  epiano:function(f,m,v,t,g,src){
    var tr=ctx.createGain();tr.gain.value=.86;tr.connect(g);
    var lp=lpf(Math.min(14000,f*9),.5,tr);
    var car=ctx.createOscillator(),mod=ctx.createOscillator(),ig=ctx.createGain();
    car.type='sine';mod.type='sine';car.frequency.value=f;mod.frequency.value=f;
    ig.gain.setValueAtTime(f*(1+2.6*v),t);ig.gain.setTargetAtTime(f*.18,t,.35);
    mod.connect(ig);ig.connect(car.frequency);car.connect(lp);car.start(t);mod.start(t);src.push(car,mod);
    var bg=ctx.createGain();bg.gain.setValueAtTime(.08*v,t);bg.gain.setTargetAtTime(0,t,.07);bg.connect(lp);
    osc('sine',f*7,0,1,bg,t,src);
    lfoInto(tr.gain,4.6,.12,t,src);
  },
  brass:function(f,m,v,t,g,src){
    var top=Math.min(f*7.5,11000),rest=Math.min(f*4.2,7000);
    var lp=lpf(450,.6,g);
    lp.frequency.setValueAtTime(450,t);lp.frequency.exponentialRampToValueAtTime(top,t+.1);lp.frequency.setTargetAtTime(rest,t+.1,.25);
    var vib=vibNode(5.5,5,t,src,.5,.5);
    [-4,4].forEach(function(d){
      var o=osc('sawtooth',f,d,.5,lp,t,src);
      o.detune.setValueAtTime(d-40,t);o.detune.linearRampToValueAtTime(d,t+.08);
      vib.connect(o.detune);
    });
    osc('sine',f/2,0,.12,lp,t,src);
  },
  flute:function(f,m,v,t,g,src){
    var lp=lpf(Math.min(f*8,9000),.5,g);
    var vib=vibNode(5.5,8,t,src,.3,.7);
    var o1=osc('sine',f,0,.7,lp,t,src);vib.connect(o1.detune);
    osc('sine',f*2,0,.1,lp,t,src);osc('triangle',f*3,0,.03,lp,t,src);
    hit(t,0,'bandpass',Math.min(f*2.5,5000),1.2,.05,lp,src,true);
    hit(t,.07,'bandpass',Math.min(f*4,6000),1,.12,lp,src,false);
  },
  organ:function(f,m,v,t,g,src){
    var tr=ctx.createGain();tr.gain.value=.84;tr.connect(g);
    [[.5,.45],[1,1],[1.5,.35],[2,.6],[3,.25],[4,.2]].forEach(function(b){osc('sine',f*b[0],0,b[1]*.5,tr,t,src);});
    lfoInto(tr.gain,6.2,.1,t,src);
    hit(t,.012,'highpass',2500,.7,.08,tr,src,false);
  }
};
function reg(v){
  var now=ctx.currentTime;
  active=active.filter(function(x){return !x.dead();});
  active.push(v);
  /* a voice costs about as many audio nodes as it has sources: cap both the count and the total, so a piano chord on top of a loop cannot flood the audio thread */
  var cost=0,i;for(i=0;i<active.length;i++)cost+=active[i].cost||4;
  while(active.length>1&&(active.length>MAXV||cost>BUDGET)){var o=active.shift();cost-=o.cost||4;o.rel(now);}
}
function finish(g,src,t,a,r,dur){
  var done=false,endT=1e9;
  function rel(rt){
    if(done)return;done=true;
    rt=Math.max(rt,t+a+.005);
    g.gain.cancelScheduledValues(rt);
    g.gain.setTargetAtTime(0,rt,r/3);
    var end=rt+r*1.6+.05;endT=end;
    src.forEach(function(n){try{n.stop(end);}catch(e){}});
    if(src.cleanup)setTimeout(src.cleanup,Math.max(0,end-ctx.currentTime)*1000+150);
    setTimeout(function(){try{g.disconnect();}catch(e){}if(src.pan){try{src.pan.disconnect();}catch(e){}}},Math.max(0,end-ctx.currentTime)*1000+250);
  }
  if(dur)rel(t+dur);
  return {rel:rel,dead:function(){return ctx.currentTime>endT;}};
}
/* slow pitch drift: four shared LFOs, one small gain per voice (a private oscillator per voice was the heaviest part of a chord) */
var driftLfo=null;
function driftVoice(src,t){
  if(!driftLfo){driftLfo=[.13,.21,.34,.5].map(function(f){var o=ctx.createOscillator();o.frequency.value=f;o.start();return o;});}
  var dg=ctx.createGain(),any=false;
  dg.gain.value=3+Math.random()*4;
  src.slice().forEach(function(n){if(n.detune){dg.connect(n.detune);any=true;}});
  if(any){var L=driftLfo[Math.floor(Math.random()*driftLfo.length)];L.connect(dg);src.cleanup=function(){try{L.disconnect(dg);dg.disconnect();}catch(e){}};}
}
function startVoice(m,t,v,dur){
  var useSample=S.inst==='sample'&&S.sample;
  var key=(S.inst==='sample'&&!S.sample)?'saw':S.inst,I=INST[key];
  var f=mtof(m),g=ctx.createGain(),src=[];
  g.gain.value=0;
  var pan=ctx.createStereoPanner();pan.pan.value=Math.max(-.55,Math.min(.55,(m-64)/44));
  g.connect(pan);pan.connect(bus);src.pan=pan;
  var peak=v*I.p;
  if(useSample){
    var b=ctx.createBufferSource();b.buffer=S.sample;
    b.playbackRate.value=Math.pow(2,(m-S.sampleRoot)/12);
    b.connect(g);b.start(t);src.push(b);
  }else BUILD[key](f,m,v,t,g,src);
  driftVoice(src,t);
  g.gain.setValueAtTime(0,t);
  var A=I.a*mult(S.atk),R=I.r*mult(S.rel);
  g.gain.linearRampToValueAtTime(peak,t+A);
  g.gain.setTargetAtTime(peak*I.s,t+A,I.d/3);
  var vo=finish(g,src,t,A,R,dur);vo.cost=src.length+2;reg(vo);return vo;
}
function startBass(m,t,v,dur){
  var f=mtof(m),g=ctx.createGain(),lp=ctx.createBiquadFilter(),o1=ctx.createOscillator(),o2=ctx.createOscillator();
  lp.type='lowpass';lp.frequency.value=480;
  o1.type='sine';o2.type='triangle';o1.frequency.value=f;o2.frequency.value=f;
  var g2=ctx.createGain();g2.gain.value=.4;
  o1.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(g);g.connect(bus);
  var peak=v*.3;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+.012);g.gain.setTargetAtTime(peak*.8,t+.012,.15);
  o1.start(t);o2.start(t);
  return finish(g,[o1,o2],t,.012,.25,dur);
}

