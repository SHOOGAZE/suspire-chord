/* ---------- UI: keys ---------- */
var keyEls={};
function buildKeys(){
  var kb=$('#kb'),whites=[0,2,4,5,7,9,11],blacks=[[1,0],[3,1],[6,3],[8,4],[10,5]];
  whites.forEach(function(pc){
    var b=document.createElement('button');b.className='wk';b.textContent=NOTE[pc];b.setAttribute('aria-label',NOTE[pc]);
    kb.appendChild(b);keyEls[pc]=b;
    bindPointer(b,function(){return keysChord(pc);},false);
  });
  blacks.forEach(function(x){
    var b=document.createElement('button');b.className='bk';b.setAttribute('aria-label',NOTE[x[0]]);
    b.style.left=(((x[1]+1)/7)*100-4.5)+'%';
    kb.appendChild(b);keyEls[x[0]]=b;
    bindPointer(b,function(){return keysChord(x[0]);},false);
  });
}

