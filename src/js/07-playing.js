/* ---------- playing ---------- */
var liveSet=[],latched=null,latchedEl=null;
function clearLatchEl(){if(latchedEl){latchedEl.classList.remove('on');latchedEl=null;}}
function playStart(ch,vel){
  lastVoice=ch.notes.slice();
  critSpawn(ch.deg!=null?ch.deg:((ch.kpc||0)%7),vel,ch.notes);
  var h={ch:ch,mode:S.mode,ctl:chordOn(ch.notes,S.mode,ch.bass,vel),t:ctx.currentTime,vel:vel,rb:null};
  if(loop.rec&&loop.playing&&ctx.currentTime>=loop.t0)h.rb=loopBeat();
  return h;
}
function playStop(h){
  h.ctl.stop();
  if(h.rb!=null&&loop.playing){
    var lb=loopBeats(),b=Math.round(h.rb*4)/4;if(b>=lb)b=0;
    var d=Math.min(lb,Math.max(.25,(ctx.currentTime-h.t)*S.bpm/60));
    loop.events.push({b:b,d:d,notes:h.ch.notes,bass:h.ch.bass,mode:h.mode,deg:h.ch.deg,kpc:h.ch.kpc,vel:h.vel,layer:loop.layer,take:loop.take||0});
    loopUi();
  }
}
function hints(ch){
  padEls.forEach(function(b){b.classList.remove('n1','n2','n3');});
  var box=$('#nxt');
  if(ch.deg==null){box.textContent='';return;}
  var dg=ch.dg!=null?ch.dg:ch.deg;
  var L=[];(NEXT[dg]||[]).forEach(function(x){var p=PM.indexOf(x);if(p>=0&&L.indexOf(p)<0)L.push(p);});
  L=L.slice(0,3);
  L.forEach(function(d,i){padEls[d].classList.add('n'+(i+1));});
  box.textContent='NEXT  '+L.map(function(d){return padCh(d).name;}).join(' \u00B7 ');
}
function show(ch){
  hints(ch);curNotes=ch.notes;if(!an2)drawViz();
  var cn=$('#chordName');
  if(cn.textContent!==ch.name){cn.setAttribute('data-prev',cn.textContent);cn.classList.remove('flip');void cn.offsetWidth;cn.classList.add('flip');}
  cn.textContent=ch.name;
  $('#chordNotes').textContent=ch.notes.map(function(n){return NOTE[n%12];}).join(' · ');
}
function showMeta(){
  var m={chord:'Chord',strum:'Strum',slop:'Slop',arp:'Arp',pattern:'Pattern · '+PATTERNS[S.pattern].n,harp:'Harp'}[S.mode];
  $('#meta').textContent=(NOTE[S.key]+' '+S.scale+' · ')+S.bpm+' BPM · '+m+(S.hold?' · Hold':'');
  if(quickHook)quickHook();
}
var quickHook=null;
function pressEntry(make,el,live,vel){
  ensureAudio();
  if(S.hold&&latched){playStop(latched);latched=null;clearLatchEl();}
  var ch=make();
  var en={make:make,el:el,live:live,ch:ch,vel:vel,h:playStart(ch,vel)};
  if(el)el.classList.add('on');
  if(live)liveSet.push(en);
  show(ch);
  return en;
}
function releaseEntry(en){
  if(!en)return;
  var i=liveSet.indexOf(en);if(i>=0)liveSet.splice(i,1);
  if(S.hold){
    if(latched&&latched!==en.h)playStop(latched);
    if(latchedEl&&latchedEl!==en.el)latchedEl.classList.remove('on');
    latched=en.h;latchedEl=en.el;
  }else{
    if(en.el)en.el.classList.remove('on');
    playStop(en.h);
  }
}
function refreshLive(){
  updatePads();
  liveSet.forEach(function(en){
    lastVoice=en.ch.notes.slice();
    var ch=en.make();
    if(ch.sig!==en.ch.sig){
      if(en.h.ctl.morph){en.h.ctl.morph(ch.notes,ch.bass);en.h.ch=ch;en.ch=ch;show(ch);}
      else{playStop(en.h);en.ch=ch;en.h=playStart(ch,en.vel);show(ch);}
    }
  });
}
function bindPointer(el,make,live){
  var en=null;
  el.addEventListener('pointerdown',function(e){
    e.preventDefault();
    try{el.setPointerCapture(e.pointerId);}catch(x){}
    if(en)return;
    var r=el.getBoundingClientRect(),f=r.height?Math.max(0,Math.min(1,(e.clientY-r.top)/r.height)):.6;
    en=pressEntry(make,el,live,.62+.38*f);
  });
  function up(){if(!en)return;releaseEntry(en);en=null;}
  el.addEventListener('pointerup',up);
  el.addEventListener('pointercancel',up);
  el.addEventListener('lostpointercapture',up);
  el.addEventListener('contextmenu',function(e){e.preventDefault();});
}
function setHold(v){
  S.hold=v;
  $$('.holdBtn').forEach(function(b){b.setAttribute('aria-pressed',String(v));});
  var qh=document.getElementById('qHold');if(qh)qh.setAttribute('aria-pressed',String(v));
  if(!v&&latched){playStop(latched);latched=null;}
  if(!v)clearLatchEl();
  tags();
  showMeta();
}

