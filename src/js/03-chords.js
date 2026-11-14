/* ---------- chord logic ---------- */
var SC={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],locrian:[0,1,3,5,6,8,10],harmonic:[0,2,3,5,7,8,11],melodic:[0,2,3,5,7,9,11],phrygdom:[0,1,4,5,7,8,10],lyddom:[0,2,4,6,7,9,10],hungarian:[0,2,3,6,7,8,11],doubleh:[0,1,4,5,7,8,11]};
var lastVoice=null;
function smoothVoice(n){
  n=n.slice().sort(function(a,b){return a-b;});
  if(!lastVoice||!lastVoice.length)return n;
  var ref=lastVoice.reduce(function(a,b){return a+b;},0)/lastVoice.length,best=null,bc=1e9,cur=n.slice();
  for(var r=0;r<n.length;r++){
    for(var sh=-24;sh<=24;sh+=12){
      var c=cur.map(function(x){return x+sh;}),lo=c[0],hi=c[c.length-1];
      if(lo<43||hi>84)continue;
      var mean=c.reduce(function(a,b){return a+b;},0)/c.length;
      var cost=Math.abs(mean-ref)+(hi-lo>14?(hi-lo-14)*.3:0);
      if(cost<bc){bc=cost;best=c;}
    }
    cur.push(cur.shift()+12);
  }
  return best||n;
}
function voicing(n,v){
  if(v===0&&S.smooth)return smoothVoice(n);
  n=n.slice().sort(function(a,b){return a-b;});
  for(var i=0;i<Math.abs(v);i++){if(v>0)n.push(n.shift()+12);else n.unshift(n.pop()-12);}
  return n.map(function(x){while(x<40)x+=12;while(x>88)x-=12;return x;}).sort(function(a,b){return a-b;});
}
function chordName(pc,notes){
  var s={};notes.forEach(function(n){s[((n-pc)%12+12)%12]=1;});
  function h(x){return !!s[x];}
  var q='';
  if(h(3)&&h(6)&&!h(7))q='dim';else if(h(4)&&h(8)&&!h(7))q='aug';else if(h(3))q='m';else if(h(4))q='';else if(h(2))q='sus2';else if(h(5))q='sus4';
  var sus=q.indexOf('sus')===0,e='';
  if(h(11))e=(h(2)&&!sus)?'maj9':'maj7';
  else if(h(10))e=(h(2)&&!sus)?'9':'7';
  else if(h(9)&&q!=='dim')e='6';
  else if(h(2)&&!sus)e='add9';
  var name;
  if(q==='dim'&&e==='7')name='m7♭5';
  else if(q==='m'&&e.indexOf('maj')===0)name='m('+e+')';
  else if(sus&&e)name=e+q;
  else name=q+e;
  return NOTE[pc]+name;
}
function padChord(d){
  var sc=SC[S.scale];
  function at(i){return sc[i%7]+12*Math.floor(i/7);}
  var idx=[d,d+2,d+4];
  if(joy.y<-.7)idx[1]=d+3;else if(joy.y<-.3)idx[1]=d+1;
  if((joy.y>.3||S.jazz)&&joy.y<=.7)idx.push(d+6);else if(joy.y>.7)idx.push(d+6);
  if(joy.y>.7)idx.push(d+8);
  if(joy.x>.3)idx.push(d+5);
  if(joy.x>.7&&joy.y<=.7)idx.push(d+8);
  var base=48+S.key,rootAbs=base+sc[d];
  var shift=rootAbs>=base+7?-12:0;
  if(joy.x<-.3)shift-=12;
  var notes=idx.map(function(i){return base+at(i)+shift;});
  var pc=(S.key+sc[d])%12;
  var name=chordName(pc,notes);
  notes=voicing(notes,S.voicing);
  return {notes:notes,bass:36+pc,name:name,pc:pc,deg:d,sig:notes.join(',')};
}

