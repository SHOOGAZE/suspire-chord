/* ---------- looper ---------- */
var loop={layer:1,playing:false,rec:false,bars:2,events:[],xy:[],xyFresh:false,t0:0,prev:-1e-6,pb:-1,metro:false,timer:null,active:[]};
function loopBeats(){return loop.bars*4;}
function loopBeat(){return ((ctx.currentTime-loop.t0)*S.bpm/60)%loopBeats();}
function inWin(b,a,z){return z>=a?(b>=a&&b<z):(b>=a||b<z);}
function click(acc){
  var o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+.005;
  o.type='square';o.frequency.value=acc?1500:1000;
  g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+.04);
  o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.05);o.onended=function(){try{o.disconnect();g.disconnect();}catch(e){}};
}
function flashEv(ev){
  var el=ev.deg!=null?padEls[ev.deg]:null;
  if(!el)return;
  el.classList.add('flash');
  setTimeout(function(){el.classList.remove('flash');},Math.max(120,ev.d*60/S.bpm*1000));
}
var LV={loop:1,l1:1,l2:1};
function fire(ev){
  critSpawn(ev.deg!=null?ev.deg:((ev.kpc||0)%7),ev.vel,ev.notes);
  var lv=LV.loop*(ev.layer===2?LV.l2:LV.l1);
  if(lv<=.01){flashEv(ev);return;}
  var c=chordOn(ev.notes,ev.mode,ev.bass,ev.vel*lv);
  loop.active.push(c);
  flashEv(ev);
  setTimeout(function(){c.stop();var i=loop.active.indexOf(c);if(i>=0)loop.active.splice(i,1);},ev.d*60/S.bpm*1000);
}
function loopTick(){
  if(!ctx)return;
  var now=ctx.currentTime;if(now<loop.t0)return;
  var pos=((now-loop.t0)*S.bpm/60)%loopBeats();
  loop.events.forEach(function(ev){if(inWin(ev.b,loop.prev,pos))fire(ev);});
  loop.xy.forEach(function(q){if(inWin(q.b,loop.prev,pos)&&joyApi.set)joyApi.set(q.x,q.y);});
  var bp=Math.floor(pos);
  if(bp!==loop.pb){loop.pb=bp;if(loop.metro)click(bp%4===0);}
  loop.prev=pos;
}
function loopStart(){
  ensureAudio();
  if(loop.timer){clearInterval(loop.timer);loop.timer=null;}
  var wasDrawing=loop.playing;
  loop.t0=ctx.currentTime+.05;loop.prev=-1e-6;loop.pb=-1;loop.playing=true;
  if(drum.on)drumsStart(loop.t0);
  loop.timer=setInterval(loopTick,10);
  if(!wasDrawing)requestAnimationFrame(loopDraw);
  loopUi();
}
function loopStop(){
  loop.playing=false;loop.rec=false;
  clearInterval(loop.timer);loop.timer=null;
  loop.active.forEach(function(c){c.stop();});loop.active=[];
  $('#loopBar').style.width='0%';
  beatsOff();
  loopUi();
}
function loopDraw(){
  if(!loop.playing)return;
  var now=ctx.currentTime;
  if(now>=loop.t0){
    var pos=((now-loop.t0)*S.bpm/60)%loopBeats();
    $('#loopBar').style.width=(pos/loopBeats()*100)+'%';
    setBeat(Math.floor(pos/loopBeats()*16));
  }
  requestAnimationFrame(loopDraw);
}
