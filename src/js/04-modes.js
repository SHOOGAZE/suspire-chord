/* ---------- performance modes ---------- */
var PATTERNS=[
  {n:'Pump',s:'X...x...x...x...',g:.9},
  {n:'Offbeat',s:'..X...X...X...X.',g:.5},
  {n:'Push',s:'X..x..x...X.x...',g:.5},
  {n:'Gallop',s:'X.xxX.xxX.xxX.xx',g:.4},
  {n:'Eighths',s:'X.x.x.x.X.x.x.x.',g:.45},
  {n:'Skank',s:'....X.......X...',g:.35}
];
function arpSeq(notes){
  return function(i){
    var base=[],k;
    for(k=0;k<S.arpOct;k++)notes.forEach(function(m){base.push(m+12*k);});
    base.sort(function(a,b){return a-b;});
    var n=base.length,dir=S.arpDir;
    if(dir==='random')return base[Math.floor(Math.random()*n)];
    if(dir==='down')return base[n-1-(i%n)];
    if(dir==='updown'||dir==='downup'){var p=Math.max(1,2*n-2),q=i%p,j=q<n?q:p-q;return dir==='updown'?base[j]:base[n-1-j];}
    if(dir==='converge'){var r=i%n;return base[r%2===0?r/2:n-1-(r-1)/2];}
    return base[i%n];
  };
}
function chordOn(notes,mode,bass,vel){
  vel=vel||.85;
  var c={vs:[],tm:null};
  var now=ctx.currentTime+.01;
  function add(m,t,v,d){if(S.human>0){t+=Math.random()*S.human*.045;v*=1-Math.random()*S.human*.4;}var x=startVoice(m,t,v,d);if(!d){x.m=m;c.vs.push(x);}return x;}
  function addBass(t,d){if(S.bassLvl>0&&bass!=null){var x=startBass(bass,t,.9*S.bassLvl,d);if(!d){x.isBass=true;c.vs.push(x);}}}
  if(mode==='chord'){
    addBass(now);notes.forEach(function(m){add(m,now,vel);});
  }else if(mode==='strum'){
    addBass(now);notes.forEach(function(m,i){add(m,now+i*.04,vel*(1-i*.04));});
  }else if(mode==='slop'){
    addBass(now+Math.random()*.03);
    notes.slice().sort(function(){return Math.random()-.5;}).forEach(function(m){add(m,now+Math.random()*.11,vel*(.7+.3*Math.random()));});
  }else if(mode==='harp'){
    var ladder=[];
    for(var o=0;o<4;o++)notes.forEach(function(m){var x=m-12+12*o;if(x>=36&&x<=96&&ladder.indexOf(x)<0)ladder.push(x);});
    ladder.sort(function(a,b){return a-b;});
    addBass(now);
    ladder.forEach(function(m,i){add(m,now+i*.03,vel*(.95-.45*i/ladder.length));});
  }else if(mode==='arp'){
    var seq=arpSeq(notes),step=0,next=now;
    addBass(now);
    var tick=function(){while(next<ctx.currentTime+.12){var sd=60/S.bpm/S.arpRate;add(seq(step),next+((step%2)?S.swing*sd*.33:0),vel,Math.max(.03,sd*S.arpGate));step++;next+=sd;}};
    tick();c.tm=setInterval(tick,25);
  }else if(mode==='pattern'){
    var P=PATTERNS[S.pattern],st=0,sd2=60/S.bpm/4,nx=now;
    var tick2=function(){
      while(nx<ctx.currentTime+.12){
        var ch=P.s.charAt(st%16),so=(st%2)?S.swing*sd2*.33:0;
        if(ch!=='.'){
          var acc=ch==='X';
          notes.forEach(function(m){add(m,nx+so,vel*(acc?1:.75),sd2*P.g);});
          addBass(nx+so,sd2*.9);
        }
        st++;nx+=sd2;
      }
    };
    tick2();c.tm=setInterval(tick2,25);
  }
  /* the joystick changes the chord while it is held: keep common notes sounding, release the ones that left, fade the new ones in.
     The arp and pattern keep their place in the bar instead of starting over. */
  function target(nn){
    if(mode!=='harp')return nn.slice();
    var L=[];
    for(var o=0;o<4;o++)nn.forEach(function(m){var x=m-12+12*o;if(x>=36&&x<=96&&L.indexOf(x)<0)L.push(x);});
    return L.sort(function(a,b){return a-b;});
  }
  c.morph=function(nn,nb){
    var t=ctx.currentTime+.01;
    notes=nn.slice();
    if(mode==='arp'){seq=arpSeq(notes);bass=nb;return;}
    if(mode==='pattern'){bass=nb;return;}
    var want=target(nn),have=[];
    c.vs=c.vs.filter(function(x){
      if(x.isBass)return true;
      if(want.indexOf(x.m)>=0){have.push(x.m);return true;}
      x.rel(t);return false;
    });
    want.forEach(function(m){if(have.indexOf(m)<0)add(m,t,vel*.9);});
    if(nb!==bass){
      c.vs=c.vs.filter(function(x){if(x.isBass){x.rel(t);return false;}return true;});
      bass=nb;addBass(t);
    }
  };
  c.stop=function(){
    if(c.tm){clearInterval(c.tm);c.tm=null;}
    var t=ctx.currentTime;
    c.vs.forEach(function(x){x.rel(t);});
    c.vs=[];
  };
  return c;
}

