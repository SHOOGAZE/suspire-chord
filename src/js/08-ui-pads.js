/* ---------- UI: pads ---------- */
/* width of a chord name in ~0.62em units, so wide glyphs (m, #, \u266D, 7) get room */
function nameUnits(t){var u=0;for(var i=0;i<t.length;i++){var c=t.charAt(i);u+=(c==='m'||c==='M'||c==='W')?1.5:(c==='#'||c==='\u266D'||c==='\u00B0')?1.1:(c==='i'||c==='l'||c==='j')?.6:1;}return u;}
var HUES=[25,75,120,170,220,270,325];
var NUM=['I','II','III','IV','V','VI','VII'];
function romanFor(d){
  var sc=SC[S.scale],r=sc[d];
  var third=(sc[(d+2)%7]-r+12)%12,fifth=(sc[(d+4)%7]-r+12)%12;
  var n=NUM[d];if(third===3)n=n.toLowerCase();
  if(fifth===6)n+='\u00B0';else if(fifth===8)n+='+';
  return n;
}
function degLabel(d){var r=romanFor(d),q=r.indexOf('\u00B0')>=0?'\u00B0':r.indexOf('+')>=0?'+':(r===r.toLowerCase()?'m':'');return (d+1)+q;}
var NEXT=[[3,4,5,1],[4,3,6,0],[5,3,1,0],[4,0,1,5],[0,5,3,1],[3,1,4,0],[0,2,5,4]];
var padEls=[],PMKEY='suspire.padmap',PM=[0,1,2,3,4,5,6];
var PROGS=[['Free',[0,1,2,3,4,5,6]],['I V vi IV',[0,4,5,3]],['vi IV I V',[5,3,0,4]],['I vi IV V',[0,5,3,4]],['I IV V',[0,3,4]],['ii V I',[1,4,0]],['I iii IV V',[0,2,3,4]],['i VI III VII',[0,5,2,6]],['I V vi iii IV',[0,4,5,2,3]],['IV V iii vi',[3,4,2,5]],['I vi ii V',[0,5,1,4]],['vi V IV',[5,4,3]],['i VII VI',[0,6,5]],['i iv VII III',[0,3,6,2]]];
function pmValid(a){return Array.isArray(a)&&a.length===7&&a.every(function(x){return x>=0&&x<7&&x%1===0;});}
try{var pmRaw=JSON.parse(localStorage.getItem(PMKEY)||'null');if(pmValid(pmRaw))PM=pmRaw;}catch(e){}
function savePM(){try{localStorage.setItem(PMKEY,JSON.stringify(PM));}catch(e){}}
function padCh(i){var c=padChord(PM[i]);c.deg=i;c.dg=PM[i];return c;}
function pmFromChain(ch){var rest=[0,1,2,3,4,5,6].filter(function(x){return ch.indexOf(x)<0;});return ch.concat(rest).slice(0,7);}
function progLabel(){
  for(var i=0;i<PROGS.length;i++){if(pmFromChain(PROGS[i][1]).join()===PM.join())return i;}
  return -1;
}
function syncProg(){
  var sel=$('#progSel');if(!sel)return;
  var i=progLabel();sel.value=i<0?'c':String(i);
}
function buildPads(){
  var grid=$('#padGrid');
  for(var d=0;d<7;d++){
    (function(d){
      var b=document.createElement('button');
      b.className='pad';b.style.setProperty('--h',HUES[d]);
      b.innerHTML='<span class="num"></span><span class="nm"></span>';
      grid.appendChild(b);padEls.push(b);
      b.addEventListener('pointerdown',function(){
        if(!S.padEdit)return;
        PM[d]=(PM[d]+1)%7;savePM();updatePads();syncProg();
      });
      bindPointer(b,function(){return padCh(d);},true);
    })(d);
  }
  var ps=$('#progSel');
  PROGS.forEach(function(p,i){var o=document.createElement('option');o.value=String(i);o.textContent=i?p[0]:'Free';ps.appendChild(o);});
  var oc=document.createElement('option');oc.value='c';oc.textContent='Own';oc.hidden=true;ps.appendChild(oc);
  ps.addEventListener('change',function(){
    var i=parseInt(ps.value,10);if(isNaN(i))return;
    PM=pmFromChain(PROGS[i][1]);savePM();updatePads();
  });
  $('#padEdit').addEventListener('click',function(e){
    S.padEdit=!S.padEdit;e.currentTarget.setAttribute('aria-pressed',String(S.padEdit));
    $('#padGrid').classList.toggle('editing',S.padEdit);
  });
  syncProg();
  var h=document.createElement('button');
  h.className='pad hold holdBtn';h.textContent='Hold';h.setAttribute('aria-pressed','false');
  h.addEventListener('click',function(){setHold(!S.hold);});
  grid.appendChild(h);
}
function updatePads(){
  padEls.forEach(function(b,d){
    $('.num',b).textContent=S.numStyle==='num'?degLabel(PM[d]):(d+1)+' · '+romanFor(PM[d]);
    var nmEl=$('.nm',b),nmTxt=padChord(PM[d]).name;nmEl.textContent=nmTxt;nmEl.style.setProperty('--n',String(Math.max(3,nameUnits(nmTxt))));
    b.dataset.fn=['t','s','t','s','d','t','d'][PM[d]%7];
  });
  if(window.suspireLabel)window.suspireLabel();
}
function joyName(){
  var p=[];
  if(joy.y<-.7)p.push('sus4');else if(joy.y<-.3)p.push('sus2');
  if(joy.y>.7)p.push('9th');else if(joy.y>.3)p.push('7th');
  if(joy.x>.7)p.push('extra bright');else if(joy.x>.3)p.push('bright');
  if(joy.x<-.3)p.push('dark');
  return p.length?p.join(' \u00B7 '):'Plain triad';
}
var joyApi={set:null};
function xTone(x){return x<0?1+x*.62:1+x*.5;}
function recXy(x,y){
  if(!(loop.rec&&loop.playing&&ctx&&ctx.currentTime>=loop.t0))return;
  if(loop.xyFresh){loop.xy=[];loop.xyFresh=false;}
  var b=Math.round(loopBeat()*16)/16,idx=-1;
  for(var k=0;k<loop.xy.length;k++)if(loop.xy[k].b===b){idx=k;break;}
  var q={b:b,x:+x.toFixed(2),y:+y.toFixed(2)};
  if(idx>=0)loop.xy[idx]=q;else loop.xy.push(q);
}
function placeDot(x,y){
  var dot=$('#joyDot'),m=Math.max(Math.abs(x),Math.abs(y)),u=x,w=y;
  dot.style.left=((u+1)/2*100)+'%';dot.style.top=((1-w)/2*100)+'%';
  var j=$('#joy');
  j.querySelector('.edge.t').classList.toggle('on',y>.3);j.querySelector('.edge.b').classList.toggle('on',y<-.3);
  j.querySelector('.edge.r').classList.toggle('on',x>.3);j.querySelector('.edge.l').classList.toggle('on',x<-.3);
  j.classList.toggle('far',m>.7);
}
function bindJoy(){
  var el=$('#joy'),dot=$('#joyDot'),on=false;
  function move(e){
    var r=el.getBoundingClientRect();
    var u=(e.clientX-r.left)/r.width*2-1,w=-((e.clientY-r.top)/r.height*2-1);
    var x=Math.max(-1,Math.min(1,u)),y=Math.max(-1,Math.min(1,w));
    joy.x=x;joy.y=y;placeDot(x,y);
    $('#joyLabel').textContent=joyName();
    toneMod=xTone(x);applyParams();
    recXy(x,y);
    refreshLive();
  }
  var lastDown=0;
  el.addEventListener('pointerdown',function(e){
    var nowT=Date.now();
    if(nowT-lastDown<320&&S.joyLatch&&(joy.x||joy.y)){S.joyLatch=false;var lb=$('#latchBtn');if(lb)lb.setAttribute('aria-pressed','false');joy.x=0;joy.y=0;placeDot(0,0);$('#joyLabel').textContent=joyName();toneMod=1;applyParams();refreshLive();lastDown=0;e.preventDefault();return;}
    lastDown=nowT;
    e.preventDefault();ensureAudio();on=true;el.classList.add('drag');try{el.setPointerCapture(e.pointerId);}catch(x){}move(e);});
  el.addEventListener('pointermove',function(e){if(on)move(e);});
  function end(){
    if(!on)return;on=false;el.classList.remove('drag');
    if(S.joyLatch){recXy(joy.x,joy.y);return;}
    joy.x=0;joy.y=0;placeDot(0,0);
    $('#joyLabel').textContent=joyName();toneMod=1;applyParams();
    recXy(0,0);
    refreshLive();
  }
  joyApi.set=function(px,py){
    if(on)return;
    joy.x=px;joy.y=py;placeDot(px,py);
    $('#joyLabel').textContent=joyName();toneMod=xTone(px);applyParams();refreshLive();
  };
  el.addEventListener('pointerup',end);
  el.addEventListener('pointercancel',end);
  el.addEventListener('lostpointercapture',end);
}
