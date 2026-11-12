/* ---------- UI: wiring ---------- */
function setView(v){
  S.view=v;
  $('#padsView').hidden=v!=='pads';$('#keysView').hidden=v!=='keys';
  $('#tabPads').setAttribute('aria-selected',String(v==='pads'));
  $('#tabKeys').setAttribute('aria-selected',String(v==='keys'));
  showMeta();
}
function setMode(m){
  S.mode=m;
  $$('#modeChips .chip').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-m')===m));});
  $$('#stageModes .chip').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-m')===m));});
  $('#arpOpts').hidden=m!=='arp';$('#patOpts').hidden=m!=='pattern';
  $('#modeHint').textContent={
    chord:'All notes sound together while you hold.',
    strum:'Notes roll upward, like a strummed guitar.',
    slop:'Loose, uneven timing for a played-by-hand feel.',
    arp:'Notes repeat one at a time while you hold.',
    pattern:'The chord plays a rhythm while you hold.',
    harp:'A glide up through four octaves of the chord.'
  }[m];
  showMeta();
}
function buildPatterns(){
  var box=$('#patOpts');
  PATTERNS.forEach(function(p,i){
    var b=document.createElement('button');b.className='chip small';b.textContent=p.n;b.setAttribute('aria-pressed',String(i===S.pattern));
    b.addEventListener('click',function(){S.pattern=i;$$('#patOpts .chip').forEach(function(x,j){x.setAttribute('aria-pressed',String(j===i));});showMeta();});
    box.appendChild(b);
  });
}
function buildInsts(){
  var box=$('#insts');
  Object.keys(INST).forEach(function(k){
    var b=document.createElement('button');b.className='chip';b.textContent=INST[k].n;b.setAttribute('data-i',k);b.setAttribute('aria-pressed',String(k===S.inst));
    b.addEventListener('click',function(){selectInst(k);});
    box.appendChild(b);
  });
}
function selectInst(k){
  S.inst=k;
  $$('#insts .chip').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-i')===k));});
  if(k==='sample'&&!S.sample)$('#sampleName').textContent='No sample yet. Plays Saw.';
}
var DEF={tone:.75,chorus:.3,delay:.15,reverb:.3,vol:.8,atk:.5,rel:.5,trem:0,trate:.4};
var knobs={};
function bindKnob(id,key,fmt){
  var el=$('#'+id),out=$('#'+id+'Out'),ticks=[];
  for(var i=0;i<11;i++){
    var t=document.createElement('span');t.className='tick';
    t.style.transform='rotate('+(-135+i*27)+'deg) translateY(calc(var(--kr) * -1))';
    el.appendChild(t);ticks.push(t);
  }
  var cap=document.createElement('div');cap.className='cap';var ind=document.createElement('i');ind.className='ind';cap.appendChild(ind);el.appendChild(cap);
  function draw(){
    var v=S[key];
    ind.style.transform='rotate('+(-135+v*270)+'deg)';
    ticks.forEach(function(t,i){t.classList.toggle('lit',i/10<=v+1e-6);});
    out.textContent=fmt(v);
    el.setAttribute('aria-valuenow',String(Math.round(v*100)));
  }
  function set(v){S[key]=Math.max(0,Math.min(1,v));draw();applyParams();}
  knobs[key]=set;
  var sy=0,sx=0,sv=0,on=false;
  el.addEventListener('pointerdown',function(e){
    e.preventDefault();on=true;sy=e.clientY;sx=e.clientX;sv=S[key];
    try{el.setPointerCapture(e.pointerId);}catch(x){}
    el.focus();
  });
  el.addEventListener('pointermove',function(e){if(on)set(sv+((sy-e.clientY)+(e.clientX-sx))/160);});
  function end(){on=false;}
  el.addEventListener('pointerup',end);
  el.addEventListener('pointercancel',end);
  el.addEventListener('lostpointercapture',end);
  el.addEventListener('dblclick',function(){set(DEF[key]);});
  el.addEventListener('keydown',function(e){
    var k=e.key,d=0;
    if(k==='ArrowUp'||k==='ArrowRight')d=.05;
    else if(k==='ArrowDown'||k==='ArrowLeft')d=-.05;
    else if(k==='Home'){e.preventDefault();set(0);return;}
    else if(k==='End'){e.preventDefault();set(1);return;}
    if(d){e.preventDefault();set(S[key]+d);}
  });
  draw();
}
function init(){
  NOTE.forEach(function(n,i){var o=document.createElement('option');o.value=i;o.textContent=n;$('#keySel').appendChild(o);});
  buildPads();buildKeys();buildPatterns();buildInsts();bindJoy();buildVu();buildBeats();
  updatePads();show(padChord(0));showMeta();
  $('#padsView').addEventListener('pointerdown',function(){ensureAudio();},true);

  $$('.seg button[data-view]').forEach(function(b){b.addEventListener('click',function(){setView(b.getAttribute('data-view'));});});
  $$('.tabs3 button').forEach(function(b){b.addEventListener('click',function(){
    var id=b.getAttribute('data-panel');
    $$('.tabs3 button').forEach(function(x){x.setAttribute('aria-selected',String(x===b));});
    var pn=$('.panels');if(pn)pn.setAttribute('data-cap',b.textContent);
    ['panelPerf','panelLoop','panelSound','panelCircle'].forEach(function(k){$('#'+k).hidden=k!==id;});
  });});
  $('#keySel').addEventListener('change',function(e){S.key=parseInt(e.target.value,10);updatePads();show(padChord(0));showMeta();});
  $('#scaleSel').addEventListener('change',function(e){S.scale=e.target.value;updatePads();show(padChord(0));showMeta();});
  var FIFTHS=[['C',0],['G',7],['D',2],['A',9],['E',4],['B',11],['F\u266F',6],['D\u266D',1],['A\u266D',8],['E\u266D',3],['B\u266D',10],['F',5]];
  var PARENT_OFF={major:0,minor:3,dorian:10,phrygian:8,lydian:7,mixolydian:5,locrian:1,harmonic:3,melodic:3,phrygdom:8,lyddom:7,hungarian:3,doubleh:0};
  var fsvg=$('#fifths'),fseg=[];
  function pol(r,a){var t=a*Math.PI/180;return [(100+r*Math.cos(t)).toFixed(2),(100+r*Math.sin(t)).toFixed(2)];}
  function wedge(r0,r1,i){
    var c=-90+i*30,a0=c-14.4,a1=c+14.4,p=pol(r1,a0),q=pol(r1,a1),u=pol(r0,a1),w=pol(r0,a0);
    return 'M'+p+' A'+r1+' '+r1+' 0 0 1 '+q+' L'+u+' A'+r0+' '+r0+' 0 0 0 '+w+' Z';
  }
  function circleBuild(){
    var NS='http://www.w3.org/2000/svg',h='';
    for(var i=0;i<12;i++){
      var po=pol(80,-90+i*30),pi=pol(48,-90+i*30);
      h+='<path class="seg out" data-ring="maj" data-i="'+i+'" d="'+wedge(63,96,i)+'"/>';
      h+='<path class="seg inn" data-ring="min" data-i="'+i+'" d="'+wedge(34,61,i)+'"/>';
      h+='<text class="lab" x="'+po[0]+'" y="'+po[1]+'" dy=".35em">'+FIFTHS[i][0]+'</text>';
      h+='<text class="lab sm" x="'+pi[0]+'" y="'+pi[1]+'" dy=".35em">'+NOTE[(FIFTHS[i][1]+9)%12].replace('#','\u266F')+'m</text>';
    }
    h+='<text class="mid" x="100" y="100" dy=".35em"></text>';
    fsvg.innerHTML=h;
    fseg=$$('.seg',fsvg);
  }
  function circleDraw(){
    var parent=(S.key+(PARENT_OFF[S.scale]||0))%12,pi=0;
    for(var i=0;i<12;i++)if(FIFTHS[i][1]===parent)pi=i;
    fseg.forEach(function(e){
      var i=+e.getAttribute('data-i'),maj=e.getAttribute('data-ring')==='maj',cls='seg '+(maj?'out':'inn');
      if(i===pi)cls+=((maj&&S.scale==='major')||(!maj&&S.scale==='minor'))?' on':' par';
      else if(maj&&(i===(pi+1)%12||i===(pi+11)%12))cls+=' nb';
      e.setAttribute('class',cls);
    });
    var sig=pi===0?'no \u266F\u266D':(pi<=6?pi+' \u266F':(12-pi)+' \u266D');
    $('.mid',fsvg).textContent=sig;
    var rel=S.scale==='major'?NOTE[(parent+9)%12]+'m':(S.scale==='minor'?NOTE[parent]:NOTE[parent]+' major');
    $('#cinfo').innerHTML='<div><span class="label">Key</span><b>'+NOTE[S.key]+' '+S.scale+'</b></div>'+
      '<div><span class="label">Signature</span><b>'+sig+'</b></div>'+
      '<div><span class="label">'+(S.scale==='major'?'Relative':'Parent')+'</span><b>'+rel+'</b></div>'+
      '<div><span class="label">Neighbors</span><b>'+FIFTHS[(pi+11)%12][0]+' \u00B7 '+FIFTHS[(pi+1)%12][0]+'</b></div>';
  }
  fsvg.addEventListener('click',function(e){
    var t=e.target.closest?e.target.closest('[data-ring]'):null;if(!t)return;
    var i=+t.getAttribute('data-i');
    if(t.getAttribute('data-ring')==='maj'){S.key=FIFTHS[i][1];S.scale='major';}
    else{S.key=(FIFTHS[i][1]+9)%12;S.scale='minor';}
    $('#keySel').value=String(S.key);$('#scaleSel').value=S.scale;
    updatePads();var ch=padChord(0);show(ch);showMeta();circleDraw();
    ensureAudio();var c=chordOn(ch.notes,'chord',ch.bass,.8);setTimeout(function(){c.stop();},650);
  });
  circleBuild();circleDraw();
  $('#keySel').addEventListener('change',circleDraw);
  $('#scaleSel').addEventListener('change',circleDraw);

  $$('#typeBtns .chip').forEach(function(b){b.addEventListener('click',function(){
    S.kType=b.getAttribute('data-t');
    $$('#typeBtns .chip').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});
  });});
  $$('#extBtns .chip').forEach(function(b){b.addEventListener('click',function(){
    var e=b.getAttribute('data-e');S.kExt[e]=!S.kExt[e];b.setAttribute('aria-pressed',String(!!S.kExt[e]));
  });});
  $('#octDown').addEventListener('click',function(){S.kOct=Math.max(1,S.kOct-1);$('#octVal').textContent=S.kOct;});
  $('#octUp').addEventListener('click',function(){S.kOct=Math.min(5,S.kOct+1);$('#octVal').textContent=S.kOct;});
  var hk=$('#holdKeys');hk.classList.add('holdBtn');hk.addEventListener('click',function(){setHold(!S.hold);});

  $$('#modeChips .chip').forEach(function(b){b.addEventListener('click',function(){setMode(b.getAttribute('data-m'));});});
  $('#arpRate').addEventListener('change',function(e){S.arpRate=parseInt(e.target.value,10);});
  $('#arpDir').addEventListener('change',function(e){S.arpDir=e.target.value;});
  function setStage(v,keep){S.stage=v;if(window.suspireReloc)setTimeout(window.suspireReloc,0);var a=document.querySelector('.app');a.classList.toggle('stage',v);$('#dockHandle').setAttribute('aria-expanded',String(!v));if(!keep){try{localStorage.setItem('suspire.stage',v?'1':'0');}catch(e){}}}
  (function(){var st=null;try{st=localStorage.getItem('suspire.stage');}catch(e){}setStage(st===null?true:st==='1',true);})();
  (function(){
    var h=$('#dockHandle'),y0=null,moved=false;
    h.addEventListener('pointerdown',function(e){y0=e.clientY;moved=false;try{h.setPointerCapture(e.pointerId);}catch(_){}});
    h.addEventListener('pointermove',function(e){
      if(y0===null)return;var dy=e.clientY-y0;
      if(dy>18){setStage(true);moved=true;y0=e.clientY;}
      else if(dy<-18){setStage(false);moved=true;y0=e.clientY;}
    });
    h.addEventListener('pointerup',function(){if(y0!==null&&!moved)setStage(!S.stage);y0=null;});
    h.addEventListener('pointercancel',function(){y0=null;});
  })();
  $$('#stageModes .chip').forEach(function(b){b.addEventListener('click',function(){setMode(b.getAttribute('data-m'));});});
  $('#latchBtn').addEventListener('click',function(){S.joyLatch=!S.joyLatch;this.setAttribute('aria-pressed',String(S.joyLatch));if(!S.joyLatch&&(joy.x||joy.y)&&joyApi.set)joyApi.set(0,0);});
  $('#arpOct').addEventListener('change',function(e){S.arpOct=parseInt(e.target.value,10);});
  $('#arpGate').addEventListener('input',function(e){S.arpGate=parseFloat(e.target.value);$('#arpGateOut').textContent=pct(S.arpGate);});
  function voxLabel(){$('#voxOut').textContent=S.voicing===0?(S.smooth?'Auto':'Root'):(S.voicing>0?'Inv +':'Inv \u2212')+Math.abs(S.voicing);}
  $('#smoothBtn').addEventListener('click',function(){S.smooth=!S.smooth;this.setAttribute('aria-pressed',String(S.smooth));voxLabel();refreshLive();});
  voxLabel();
  $('#vox').addEventListener('input',function(e){
    S.voicing=parseInt(e.target.value,10);
    $('#voxOut').textContent=S.voicing===0?(S.smooth?'Auto':'Root'):(S.voicing>0?'Inv +':'Inv −')+Math.abs(S.voicing);
    updatePads();
  });
  $('#bassLvl').addEventListener('input',function(e){S.bassLvl=parseFloat(e.target.value);$('#bassLvlOut').textContent=pct(S.bassLvl);});

  $('#recBtn').addEventListener('click',function(){
    ensureAudio();
    if(!loop.playing)loopStart();
    loop.rec=!loop.rec;if(loop.rec)loop.xyFresh=true;loopUi();
  });
  $('#playBtn').addEventListener('click',function(){if(loop.playing)loopStop();else loopStart();});
  $('#hRec').addEventListener('click',function(){$('#recBtn').click();});
  $('#hPlay').addEventListener('click',function(){$('#playBtn').click();});
  $('#layerBtn').addEventListener('click',function(e){loop.layer=loop.layer===1?2:1;e.currentTarget.textContent='Layer '+loop.layer;e.currentTarget.setAttribute('aria-pressed',String(loop.layer===2));$('#slotInfo').textContent='Recording into layer '+loop.layer+'. Clear only wipes this layer.';});
  $('#clearBtn').addEventListener('click',function(){loop.events=loop.events.filter(function(e){return (e.layer||1)!==loop.layer;});if(!loop.events.length)loop.xy=[];loopUi();});
  $('#barsSel').addEventListener('change',function(e){loop.bars=parseInt(e.target.value,10);loop.prev=-1e-6;buildBeats();if(loop.playing){loop.t0=ctx.currentTime+.05;}});
  $('#metroBtn').addEventListener('click',function(e){loop.metro=!loop.metro;e.currentTarget.setAttribute('aria-pressed',String(loop.metro));ensureAudio();});
  function setBpm(v){
    v=Math.max(50,Math.min(200,v));
    if(loop.playing&&ctx){var pos=(ctx.currentTime-loop.t0)*S.bpm/60;loop.t0=ctx.currentTime-pos*60/v;}
    S.bpm=v;$('#bpmVal').textContent=v;applyParams();showMeta();
  }
  $('#bpmDown').addEventListener('click',function(){setBpm(S.bpm-2);});
  $('#bpmUp').addEventListener('click',function(){setBpm(S.bpm+2);});

  ['swing','human'].forEach(function(k){
    var el=$('#'+k),out=$('#'+k+'Out');
    el.addEventListener('input',function(){S[k]=parseFloat(el.value);out.textContent=pct(S[k]);});
  });
  $('#mutBtn').addEventListener('click',function(){
    $('#slotInfo').textContent=mutate()?'Loop mutated. Undo brings the last one back.':'Record a loop first.';
    loopUi();
  });
  $('#undoBtn').addEventListener('click',function(){
    if(loop.undo){loop.events=loop.undo;loop.undo=null;$('#slotInfo').textContent='Back to the previous loop.';loopUi();}
  });

  var MEMKEY='chordwell.slots',mem=[],armed=false,slotEls=[];
  try{var raw=localStorage.getItem(MEMKEY);mem=raw?JSON.parse(raw):[];}catch(e){mem=[];}
  if(!Array.isArray(mem))mem=[];
  function saveMem(){try{localStorage.setItem(MEMKEY,JSON.stringify(mem));}catch(e){}}
  function slotUi(){slotEls.forEach(function(b,i){b.classList.toggle('full',!!mem[i]);});}
  function applySlot(d){
    loop.events=(d.events||[]).map(cp);loop.undo=null;loop.xy=(d.xy||[]).slice();
    loop.bars=[1,2,4].indexOf(d.bars)>=0?d.bars:2;$('#barsSel').value=String(loop.bars);
    loop.prev=-1e-6;buildBeats();
    if(loop.playing&&ctx)loop.t0=ctx.currentTime+.05;
    setBpm(d.bpm||96);
    S.key=d.key||0;$('#keySel').value=String(S.key);
    S.scale=SC[d.scale]?d.scale:'major';$('#scaleSel').value=S.scale;
    setMode(['chord','strum','slop','arp','pattern','harp'].indexOf(d.mode)>=0?d.mode:'chord');
    selectInst(INST[d.inst]&&d.inst!=='sample'?d.inst:'saw');
    ['swing','human'].forEach(function(k){S[k]=+d[k]||0;$('#'+k).value=S[k];$('#'+k+'Out').textContent=pct(S[k]);});
    if(d.drum){setDrumCfg(d.drum.kit,d.drum.pat,d.drum.lvl);}
    if(pmValid(d.pm))PM=d.pm.slice();else PM=[0,1,2,3,4,5,6];savePM();
    updatePads();syncProg();show(padChord(0));showMeta();loopUi();circleDraw();
  }
  for(var si=0;si<8;si++){
    (function(i){
      var b=document.createElement('button');b.className='chip small slot';b.textContent=String(i+1);
      b.setAttribute('aria-label','Memory slot '+(i+1));
      b.addEventListener('click',function(){
        var info=$('#slotInfo');
        if(armed){
          mem[i]={xy:loop.xy.slice(),events:loop.events.map(cp),bars:loop.bars,bpm:S.bpm,key:S.key,scale:S.scale,mode:S.mode,inst:S.inst,swing:S.swing,human:S.human,pm:PM.slice(),drum:{kit:drum.kit,pat:drum.pat,lvl:drum.lvl}};
          saveMem();armed=false;$('#storeBtn').setAttribute('aria-pressed','false');slotUi();
          info.textContent='Saved to slot '+(i+1)+'.';
        }else if(mem[i]){applySlot(mem[i]);info.textContent='Loaded slot '+(i+1)+'.';}
        else info.textContent='Slot '+(i+1)+' is empty.';
      });
      $('#slots').appendChild(b);slotEls.push(b);
    })(si);
  }
  slotUi();
  $('#storeBtn').addEventListener('click',function(e){
    armed=!armed;e.currentTarget.setAttribute('aria-pressed',String(armed));
    $('#slotInfo').textContent=armed?'Tap a slot to save the current loop and settings.':'Store cancelled.';
  });


  /* ---------- export ---------- */
  function saveBlob(blob,name){
    var url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(url);a.remove();},4000);
  }
  function vlq(n){var b=[n&127];while((n>>=7)>0)b.unshift((n&127)|128);return b;}
  function buildMidi(){
    var PPQ=480,ev=[];
    loop.events.forEach(function(e){
      var t0=Math.round(e.b*PPQ),t1=t0+Math.max(30,Math.round(e.d*PPQ)),v=Math.max(1,Math.min(127,Math.round((e.vel||.8)*110)));
      var lc=(e.layer===2)?2:0;
      e.notes.forEach(function(n){ev.push([t0,1,0x90+lc,n,v]);ev.push([t1,0,0x80+lc,n,0]);});
      if(e.bass!=null&&S.bass){ev.push([t0,1,0x91+lc,e.bass,Math.max(1,v-10)]);ev.push([t1,0,0x81+lc,e.bass,0]);}
    });
    if(drum.on){var P=DPATS[drum.pat];
      for(var bi=0;bi<loop.bars;bi++)for(var si2=0;si2<16;si2++)'kschor'.split('').forEach(function(v){
        var c=P[v]&&P[v].charAt(si2);if(!c||c==='0')return;var tk=Math.round((bi*16+si2)*PPQ/4);
        ev.push([tk,1,0x99,DNOTE[v],c==='2'?105:70]);ev.push([tk+60,0,0x89,DNOTE[v],0]);});}
    ev.sort(function(a,b){return a[0]-b[0]||a[1]-b[1];});
    var tr=[],uspq=Math.round(60000000/S.bpm);
    tr.push(0,0xFF,0x51,3,(uspq>>16)&255,(uspq>>8)&255,uspq&255);
    tr.push(0,0xFF,0x58,4,4,2,24,8);
    var last=0;
    ev.forEach(function(x){tr=tr.concat(vlq(x[0]-last),[x[2],x[3],x[4]]);last=x[0];});
    var end=loopBeats()*PPQ;tr=tr.concat(vlq(Math.max(0,end-last)),[0xFF,0x2F,0]);
    var h=[0x4D,0x54,0x68,0x64,0,0,0,6,0,0,0,1,(PPQ>>8)&255,PPQ&255];
    var L=tr.length;
    var t=[0x4D,0x54,0x72,0x6B,(L>>>24)&255,(L>>16)&255,(L>>8)&255,L&255];
    return new Blob([new Uint8Array(h.concat(t,tr))],{type:'audio/midi'});
  }
  function wavBlob(chs,sr){
    var n=chs[0].length,buf=new ArrayBuffer(44+n*4),v=new DataView(buf);
    function w(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));}
    w(0,'RIFF');v.setUint32(4,36+n*4,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);
    v.setUint32(24,sr,true);v.setUint32(28,sr*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*4,true);
    for(var i=0;i<n;i++)for(var c=0;c<2;c++){var x=Math.max(-1,Math.min(1,chs[c][i]));v.setInt16(44+i*4+c*2,x<0?x*32768:x*32767,true);}
    return new Blob([buf],{type:'audio/wav'});
  }
  var bouncing=false;
  function bounceWav(){
    var info=$('#slotInfo');
    if(bouncing)return;
    if(!loop.events.length){info.textContent='Record a loop first.';return;}
    ensureAudio();
    var sp=ctx.createScriptProcessor(4096,2,2),L=[],R=[],sr=ctx.sampleRate;
    var secs=loopBeats()*60/S.bpm,total=Math.ceil((secs+2.6)*sr),got=0,metro=loop.metro;
    bouncing=true;loop.metro=false;
    if(loop.playing)loopStop();
    info.textContent='Bouncing… '+Math.ceil(secs+2.6)+' s';
    sp.onaudioprocess=function(e){
      if(got>=total)return;
      L.push(new Float32Array(e.inputBuffer.getChannelData(0)));R.push(new Float32Array(e.inputBuffer.getChannelData(1)));
      got+=4096;
      if(got>=total)finish();
    };
    var done=false;
    function finish(){
      if(done)return;done=true;
      try{master.disconnect(sp);sp.disconnect();}catch(_){}
      loopStop();loop.metro=metro;bouncing=false;
      function cat(a){var o=new Float32Array(total),p=0;a.forEach(function(x){var m=Math.min(x.length,total-p);o.set(x.subarray(0,m),p);p+=m;});return o;}
      saveBlob(wavBlob([cat(L),cat(R)],sr),'suspire-loop.wav');
      info.textContent='WAV saved ('+Math.round(secs)+' s loop + tail).';
    }
    master.connect(sp);sp.connect(ctx.destination);
    loopStart();
  }
  $('#expMid').addEventListener('click',function(){
    var info=$('#slotInfo');
    if(!loop.events.length){info.textContent='Record a loop first.';return;}
    saveBlob(buildMidi(),'suspire-loop.mid');info.textContent='MIDI saved: '+loop.events.length+' chords, '+S.bpm+' BPM.';
  });
  $('#expWav').addEventListener('click',bounceWav);
  $('#expJson').addEventListener('click',function(){
    saveBlob(new Blob([JSON.stringify({app:'suspire',v:1,slots:mem,pm:PM})],{type:'application/json'}),'suspire-slots.json');
    $('#slotInfo').textContent='Backup saved.';
  });
  $('#impJson').addEventListener('click',function(){$('#impFile').click();});
  $('#impFile').addEventListener('change',function(e){
    var f=e.target.files&&e.target.files[0],info=$('#slotInfo');if(!f)return;
    f.text().then(function(t){
      var j=JSON.parse(t);
      if(!j||j.app!=='suspire'||!Array.isArray(j.slots))throw 0;
      mem=j.slots.slice(0,8).map(function(x){return x&&typeof x==='object'&&Array.isArray(x.events)?x:null;});
      saveMem();if(pmValid(j.pm)){PM=j.pm;savePM();updatePads();syncProg();}slotUi();
      info.textContent='Restored '+mem.filter(Boolean).length+' slots.';
    }).catch(function(){info.textContent='That file is not a SUSPIRE backup.';});
    e.target.value='';
  });


  /* ---------- drums + vibes UI ---------- */
  KITS.forEach(function(k,i){var o=document.createElement('option');o.value=i;o.textContent=k.n;$('#kitSel').appendChild(o);});
  DPATS.forEach(function(p,i){var o=document.createElement('option');o.value=i;o.textContent=p.n;$('#dpatSel').appendChild(o);});
  $('#dpatSel').value=String(drum.pat);
  function setDrumCfg(k,p,l){
    if(KITS[k]){drum.kit=k;$('#kitSel').value=String(k);drumKit();}
    if(DPATS[p]){drum.pat=p;$('#dpatSel').value=String(p);}
    if(l!=null){drum.lvl=Math.max(0,Math.min(1,+l||0));$('#drumLvl').value=drum.lvl;$('#drumLvlOut').textContent=pct(drum.lvl);if(drumG)drumG.gain.setTargetAtTime(drum.lvl,ctx.currentTime,.02);}
  }
  function setDrums(on){
    $('#drumBtn').setAttribute('aria-pressed',String(on));
    if(on){ensureAudio();drumsStart(loop.playing?loop.t0+Math.ceil(((ctx.currentTime-loop.t0)*S.bpm/60)/4)*4*60/S.bpm:ctx.currentTime+.05);}
    else drumsStop();
  }
  $('#drumBtn').addEventListener('click',function(){setDrums(!drum.on);});
  $('#kitSel').addEventListener('change',function(e){drum.kit=+e.target.value;drumKit();});
  $('#dpatSel').addEventListener('change',function(e){drum.pat=+e.target.value;});
  $('#drumLvl').addEventListener('input',function(e){setDrumCfg(drum.kit,drum.pat,+e.target.value);});
  bindKnob('atk','atk',function(v){return 'x'+mult(v).toFixed(1);});
  bindKnob('rel','rel',function(v){return 'x'+mult(v).toFixed(1);});
  bindKnob('trem','trem',pct);
  bindKnob('trate','trate',function(v){return (.8+v*9).toFixed(1)+' Hz';});
  $('#numBtn').addEventListener('click',function(e){
    S.numStyle=S.numStyle==='num'?'roman':'num';
    e.currentTarget.setAttribute('aria-pressed',String(S.numStyle==='num'));
    e.currentTarget.textContent='Labels: '+(S.numStyle==='num'?'Numbers':'Roman');
    updatePads();
  });
  var VIBES=[
    {n:'Suspire',inst:'suspire',tone:.75,chorus:.3,delay:.15,reverb:.3,bpm:84,mode:'chord',atk:.5,rel:.5,trem:0,swing:0,kit:0,pat:3},
    {n:'Dream',inst:'pad',tone:.6,chorus:.55,delay:.35,reverb:.7,bpm:72,mode:'chord',atk:.75,rel:.8,trem:0,swing:0,kit:2,pat:3},
    {n:'Lo-fi',inst:'epiano',tone:.5,chorus:.35,delay:.2,reverb:.25,bpm:78,mode:'chord',atk:.5,rel:.55,trem:.25,swing:.3,kit:0,pat:5},
    {n:'Night drive',inst:'saw',tone:.6,chorus:.4,delay:.4,reverb:.4,bpm:104,mode:'arp',atk:.45,rel:.5,trem:0,swing:0,kit:1,pat:0},
    {n:'Hymn',inst:'organ',tone:.55,chorus:.2,delay:.1,reverb:.65,bpm:66,mode:'chord',atk:.55,rel:.7,trem:.3,swing:0,kit:2,pat:6},
    {n:'Cinema',inst:'strings',tone:.7,chorus:.3,delay:.2,reverb:.6,bpm:70,mode:'chord',atk:.6,rel:.75,trem:0,swing:0,kit:2,pat:2}
  ];
  function applyVibe(v){
    selectInst(v.inst);setMode(v.mode);setBpm(v.bpm);
    ['tone','chorus','delay','reverb','atk','rel','trem'].forEach(function(k){knobs[k](v[k]);});
    S.swing=v.swing;$('#swing').value=S.swing;$('#swingOut').textContent=pct(S.swing);
    setDrumCfg(v.kit,v.pat);
    $$('#vibes .chip').forEach(function(b){b.setAttribute('aria-pressed',String(b.textContent===v.n));});
    vibeLabel();
  }
  var vibeIdx=0;
  function vibeLabel(){$('#vibeBtn').textContent=VIBES[vibeIdx].n+' \u25B8';}
  $('#vibeBtn').addEventListener('click',function(){vibeIdx=(vibeIdx+1)%VIBES.length;applyVibe(VIBES[vibeIdx]);});
  VIBES.forEach(function(v,vi){
    var b=document.createElement('button');b.className='chip';b.textContent=v.n;b.setAttribute('aria-pressed',v.n==='Suspire'?'true':'false');
    b.addEventListener('click',function(){vibeIdx=vi;applyVibe(v);});$('#vibes').appendChild(b);
  });
  vibeLabel();

  (function(){
    var seen=false;try{seen=localStorage.getItem('suspire.seen')==='1';}catch(e){}
    if(seen)return;var h=$('#hint');
    function hide(){h.classList.remove('show');try{localStorage.setItem('suspire.seen','1');}catch(e){}document.removeEventListener('pointerdown',hide,true);}
    setTimeout(function(){h.classList.add('show');},700);
    setTimeout(hide,9000);
    document.addEventListener('pointerdown',function(){setTimeout(hide,1500);},{capture:true,once:true});
  })();
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&ctx&&ctx.state!=='running'){try{ctx.resume();}catch(e){}}});
  if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}

  /* ---------- quick buttons (Play layout) ---------- */
  var MODES=['chord','strum','slop','arp','pattern','harp'],MNAME={chord:'Chord',strum:'Strum',slop:'Slop',arp:'Arp',pattern:'Pattern',harp:'Harp'};
  function qUpdate(){
    $('#qKey').innerHTML='<small>Key</small>'+NOTE[S.key];
    $('#qSound').innerHTML='<small>Sound</small>'+VIBES[vibeIdx].n;
    $('#qMode').innerHTML='<small>Mode</small>'+MNAME[S.mode];
    $('#qJazz').setAttribute('aria-pressed',String(!!S.jazz));
    $('#qDrums').setAttribute('aria-pressed',String(drum.on));
    $('#qHold').setAttribute('aria-pressed',String(S.hold));
  }
  quickHook=qUpdate;
  $('#qKey').addEventListener('click',function(){var sel=$('#keySel');sel.value=String((S.key+7)%12);sel.dispatchEvent(new Event('change'));qUpdate();});
  $('#qSound').addEventListener('click',function(){vibeIdx=(vibeIdx+1)%VIBES.length;applyVibe(VIBES[vibeIdx]);});
  $('#qMode').addEventListener('click',function(){setMode(MODES[(MODES.indexOf(S.mode)+1)%MODES.length]);});
  $('#qJazz').addEventListener('click',function(){S.jazz=!S.jazz;updatePads();show(padChord(0));qUpdate();});
  $('#qDrums').addEventListener('click',function(){$('#drumBtn').click();qUpdate();});
  $('#qHold').addEventListener('click',function(){setHold(!S.hold);});
  qUpdate();

  $('#critBtn').addEventListener('click',function(e){var st=crit.on?(crit.set===1?0:-1):1;if(st===-1){crit.on=false;}else{crit.on=true;crit.set=st;}e.currentTarget.setAttribute('aria-pressed',String(crit.on));e.currentTarget.textContent='Display: '+(!crit.on?'Off':(crit.set===1?'Synthwave':'Machines'));crit.list=[];document.querySelector('.app').classList.toggle('critOn',crit.on);});
  document.querySelector('.app').classList.add('critOn');
  (function(){var ap=document.querySelector('.app'),mq=window.matchMedia('(orientation:portrait)'),sq=$('#vizSq');
    function reloc(){var on=ap.classList.contains('stage')&&mq.matches,cv=$('#crit'),m=document.querySelector('.master'),
      cvHome=on?sq:document.querySelector('.screen'),mHome=on?document.querySelector('.tpad'):document.querySelector('.tele');
      if(cv.parentNode!==cvHome){cvHome.insertBefore(cv,cvHome.firstChild);crit.cv=null;crit.list=[];}
      if(m.parentNode!==mHome){mHome.appendChild(m);}
      var bt=$('#beats'),bHome=on?$('#padsView'):document.querySelector('.screen');if(bt.parentNode!==bHome)bHome.appendChild(bt);
    }
    window.suspireReloc=reloc;reloc();(mq.addEventListener?mq.addEventListener('change',reloc):mq.addListener(reloc));
    function nv(){$('#vibeBtn').click();}sq.addEventListener('click',nv);sq.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();nv();}});})();
  (function(){var sh=$('#sheet'),body=$('#sheetBody'),btn=$('#setBtn'),sels={key:$('#keySel'),scale:$('#scaleSel'),prog:$('#progSel')};
    function txt(sel){var o=sel.options[sel.selectedIndex];return o?o.text:'';}
    function label(){$('#setTxt').textContent=txt(sels.key)+' '+txt(sels.scale)+' \u00B7 '+txt(sels.prog);}
    window.suspireLabel=label;
    function group(title,sel,cls){var g=document.createElement('div');g.className='sg';var h=document.createElement('div');h.className='sgT';h.textContent=title;g.appendChild(h);var w=document.createElement('div');w.className='sgW '+cls;
      Array.prototype.forEach.call(sel.options,function(o){if(o.hidden)return;var b=document.createElement('button');b.type='button';b.textContent=o.text;b.setAttribute('aria-pressed',String(o.value===sel.value));
        b.addEventListener('click',function(){sel.value=o.value;sel.dispatchEvent(new Event('change',{bubbles:true}));label();Array.prototype.forEach.call(w.children,function(c){c.setAttribute('aria-pressed','false');});b.setAttribute('aria-pressed','true');});w.appendChild(b);});
      g.appendChild(w);return g;}
    function build(){body.innerHTML='';body.appendChild(group('Key',sels.key,'k'));body.appendChild(group('Scale',sels.scale,'s'));body.appendChild(group('Progression',sels.prog,'p'));}
    function open(){label();build();sh.hidden=false;void sh.offsetWidth;sh.classList.add('open');}
    function close(){sh.classList.remove('open');setTimeout(function(){sh.hidden=true;},220);}
    btn.addEventListener('click',open);$('#sheetBg').addEventListener('click',close);$('#sheetDone').addEventListener('click',close);
    Object.keys(sels).forEach(function(k){sels[k].addEventListener('change',label);});label();})();
  (function(){var n=$('#chordName'),t=$('#chordNotes');function sync(){$('#hcName').textContent=n.textContent;$('#hcNotes').textContent=t.textContent;}
    var mo=new MutationObserver(sync);mo.observe(n,{childList:true,characterData:true,subtree:true});mo.observe(t,{childList:true,characterData:true,subtree:true});sync();})();
  (function(){function paint(){var P=DPATS[drum.pat],ee=beatEls;if(!ee.length)return;for(var i=0;i<16;i++){var h=drum.on&&((P.k&&P.k.charAt(i)!=='0')||(P.s&&P.s.charAt(i)!=='0')||(P.c&&P.c.charAt(i)!=='0'));ee[i].classList.toggle('hit',!!h);}}
    setInterval(paint,500);paint();})();
  /* pixel boot: pink grains gather into the wordmark */
  (function(){var sp=$('#splash'),cv=$('#splashCv');if(!sp||!cv)return;
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){sp.remove();return;}
    var done=false;function end(){if(done)return;done=true;sp.classList.add('out');setTimeout(function(){sp.remove();},500);}
    sp.addEventListener('pointerdown',end);setTimeout(end,3200);
    function run(){var dpr=Math.min(2,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
      var c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
      var fs=Math.min(64,W*.13),G=Math.max(3,Math.round(fs/14)),off=document.createElement('canvas');off.width=Math.ceil(W);off.height=Math.ceil(fs*1.6);
      var o=off.getContext('2d');o.fillStyle='#fff';o.font='700 '+fs+'px "Pixelify Sans",monospace';o.textAlign='center';o.textBaseline='middle';o.fillText('SUSPIRE',off.width/2,off.height/2);
      var d=o.getImageData(0,0,off.width,off.height).data,P=[],oy=H/2-off.height/2-6;
      for(var y=0;y<off.height;y+=G)for(var x=0;x<off.width;x+=G){if(d[((y+(G>>1))*off.width+x+(G>>1))*4+3]>140)P.push({tx:x,ty:y+oy,sx:Math.random()*W,sy:Math.random()*H,dl:Math.random()*.35,sz:G-1,tw:Math.random()});}
      var t0=performance.now();
      (function f(t){if(done||!sp.parentNode)return;var e=(t-t0)/1000;c.clearRect(0,0,W,H);
        P.forEach(function(p){var k=Math.max(0,Math.min(1,(e-p.dl)/.9));k=1-Math.pow(1-k,3);var x=p.sx+(p.tx-p.sx)*k,y=p.sy+(p.ty-p.sy)*k;
          var a=.25+.75*k;if(k>=1){a=.82+.18*Math.sin(e*6+p.tw*6.28);}
          c.globalAlpha=a;c.fillStyle=k>=1&&p.tw>.9?'#FFB3D6':'#F0509A';c.shadowColor='rgba(240,80,154,.8)';c.shadowBlur=k>=1?8:0;c.fillRect(Math.round(x/G)*G,Math.round(y/G)*G,p.sz,p.sz);});
        c.globalAlpha=Math.min(1,Math.max(0,(e-1.2)/.6))*.7;c.shadowBlur=0;c.fillStyle='#8C7A86';c.font='500 '+Math.max(10,fs*.2)+'px "DM Mono",monospace';c.textAlign='center';c.fillText('CHORD INSTRUMENT',W/2,oy+off.height+Math.max(14,fs*.5));
        if(e>1.9)end();requestAnimationFrame(f);})(t0);}
    var go=function(){if(!done)run();};
    if(document.fonts&&document.fonts.load){Promise.race([document.fonts.load('700 40px "Pixelify Sans"'),new Promise(function(r){setTimeout(r,700);})]).then(go,go);}else go();})();
  (function(){var ap=document.querySelector('.app'),b=$('#visBtn');function set(v,keep){ap.classList.toggle('vis',v);b.setAttribute('aria-pressed',String(v));crit.list=[];crit.dirty=true;if(!keep){try{localStorage.setItem('suspire.vis',v?'1':'0');}catch(e){}}}
    var st=null;try{st=localStorage.getItem('suspire.vis');}catch(e){}set(st==='1',true);b.addEventListener('click',function(){set(!ap.classList.contains('vis'));});})();
  bindKnob('tone','tone',pct);
  bindKnob('chorus','chorus',pct);
  bindKnob('delay','delay',pct);
  bindKnob('reverb','reverb',pct);
  bindKnob('vol','vol',pct);
  $('#sampleRoot').addEventListener('change',function(e){S.sampleRoot=parseInt(e.target.value,10);});
  $('#sampleFile').addEventListener('change',function(e){
    var f=e.target.files&&e.target.files[0];if(!f)return;
    ensureAudio();
    f.arrayBuffer().then(function(ab){return ctx.decodeAudioData(ab);}).then(function(buf){
      S.sample=buf;selectInst('sample');
      $('#sampleName').textContent=f.name.slice(0,22)+' \u00B7 '+buf.duration.toFixed(1)+' s';
    }).catch(function(){
      $('#sampleName').textContent='This file could not be read. Try a WAV, MP3 or M4A clip.';
    });
  });

  var KMAP={a:0,w:1,s:2,e:3,d:4,f:5,t:6,g:7,y:8,h:9,u:10,j:11},kheld={};
  document.addEventListener('keydown',function(e){
    if(e.repeat||e.metaKey||e.ctrlKey||e.altKey)return;
    var tag=(e.target&&e.target.tagName)||'';
    if(tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA')return;
    var key=(e.key||'').toLowerCase(),make=null,el=null,live=false;
    if(S.view==='pads'&&/^[1-7]$/.test(key)){var d=parseInt(key,10)-1;make=function(){return padCh(d);};el=padEls[d];live=true;}
    else if(S.view==='keys'&&KMAP.hasOwnProperty(key)){var pc=KMAP[key];make=function(){return keysChord(pc);};el=keyEls[pc];}
    if(!make||kheld[e.code])return;
    e.preventDefault();
    kheld[e.code]=pressEntry(make,el,live);
  });
  document.addEventListener('keyup',function(e){
    var en=kheld[e.code];if(en){releaseEntry(en);delete kheld[e.code];}
  });
  var tele=$('.tele'),app=$('.app'),gl={raf:0,x:0,y:0};
  document.addEventListener('pointermove',function(e){
    gl.x=e.clientX;gl.y=e.clientY;var ar=app.getBoundingClientRect();app.style.setProperty('--ax',Math.max(-20,Math.min(120,(e.clientX-ar.left)/ar.width*100)).toFixed(1)+'%');app.style.setProperty('--ay',Math.max(-20,Math.min(120,(e.clientY-ar.top)/ar.height*100)).toFixed(1)+'%');
    if(gl.raf)return;
    gl.raf=requestAnimationFrame(function(){
      gl.raf=0;var r=tele.getBoundingClientRect();
      var px=Math.max(-20,Math.min(120,(gl.x-r.left)/r.width*100)),py=Math.max(-40,Math.min(140,(gl.y-r.top)/r.height*100));
      tele.style.setProperty('--gx',px.toFixed(1)+'%');tele.style.setProperty('--gy',py.toFixed(1)+'%');
    });
  },{passive:true});
  loopUi();
}
init();
})();
