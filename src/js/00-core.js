(function(){
'use strict';
var NOTE=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function pct(x){return Math.round(x*100)+'%';}

var S={joyLatch:false,smooth:true,view:'pads',key:0,scale:'major',mode:'chord',hold:false,bass:true,voicing:0,bpm:96,inst:'suspire',
  arpRate:4,arpDir:'up',arpOct:2,arpGate:.85,pattern:0,kType:'maj',kExt:{},kOct:3,tone:.75,chorus:.3,delay:.15,reverb:.3,vol:.8,sampleRoot:60,sample:null,swing:0,human:0,bassLvl:.8,atk:.5,rel:.5,trem:0,trate:.4,numStyle:'roman'};
var joy={x:0,y:0};
var toneMod=1;

