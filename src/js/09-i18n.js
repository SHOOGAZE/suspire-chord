/* ---------- language: English and Russian ----------
   The page is written in English. In Russian mode every exact phrase found in RU is swapped in place,
   including text the app writes later, by watching the DOM. Chord names, note names and sound names stay as they are. */
var LANG='en';
try{var sl=localStorage.getItem('suspire.lang');LANG=(sl==='ru'||sl==='en')?sl:(/^ru/i.test(navigator.language||'')?'ru':'en');}catch(e){}
var RU={
'Chord set':'Набор аккордов','Done':'Готово','Key':'Тональность','Scale':'Лад','Major':'Мажор','Minor':'Минор','Dorian':'Дорийский','Phrygian':'Фригийский','Lydian':'Лидийский','Mixolydian':'Миксолидийский','Locrian':'Локрийский','Harmonic minor':'Гармонический минор','Harm. minor':'Гарм. минор','Mel. minor':'Мел. минор','Phryg. dom.':'Фриг. дом.','Lyd. dom.':'Лид. дом.','Hung. minor':'Венг. минор','Dbl. harmonic':'Двойн. гарм.','Melodic minor':'Мелодический минор','Phrygian dominant':'Фригийский доминантовый','Lydian dominant':'Лидийский доминантовый','Hungarian minor':'Венгерский минор','Double harmonic':'Двойной гармонический','Progression':'Прогрессия','Free':'Свободно','Own':'Своя',
'HOW TO PLAY':'КАК ИГРАТЬ','TAP A PAD':'ТАП ПО ПЭДУ','play a chord':'играет аккорд','PAD + KNOB':'ПЭД + РУЧКА','hold one, turn the other':'держи одно, крути другое','JOYSTICK':'ДЖОЙСТИК','dark / bright, jazzy / sus':'тёмный / яркий, джаз / сус','HOLD A KNOB':'УДЕРЖИ РУЧКУ','choose what it steers':'выбери, чем она управляет','DRAG BPM':'ТЯНИ BPM','tempo · tap 3x to set it':'темп · три тапа в такт задают его','SOUND NAME':'НАЗВАНИЕ ЗВУКА','tap for the next sound':'тап — следующий звук','CHORD SET':'НАБОР АККОРДОВ','key, scale, progression':'тональность, лад, прогрессия','DICE · UNDO':'КУБИК · ОТМЕНА','new progression · drop last take':'новая прогрессия · убрать последний дубль','REC, PLAY':'ЗАПИСЬ, ПУСК','loop what you play':'зацикли то, что играешь','GOT IT':'ПОНЯТНО',
'REC':'ЗАП','LOOP':'ЛУП','HOLD':'ДЕРЖ','Visual':'Визуал','Edit':'Правка','Dice':'Кубик','Show or hide the panels':'Показать или скрыть панели','Undo':'Отмена','Hold':'Держать','Chord':'Аккорд','Strum':'Страм','Slop':'Слоп','Arp':'Арп','Pat':'Пат','Harp':'Арфа','Perform':'Игра','Loop':'Луп','Sound':'Звук','Circle':'Круг','Jazzy':'Джаз','Sus':'Сус','Dark':'Тёмный','Bright':'Яркий','Plain triad':'Чистое трезвучие','Latch':'Фиксация','Mode':'Режим','Jazz 7ths':'Джаз 7-е','Drums':'Ударные','Pattern':'Паттерн','Up':'Вверх','Down':'Вниз','Up/down':'Вверх/вниз','Down/up':'Вниз/вверх','Converge':'К центру','Random':'Случайно','1 oct':'1 окт','2 oct':'2 окт','3 oct':'3 окт','Gate':'Гейт','Pump':'Памп','Offbeat':'Офбит','Push':'Пуш','Gallop':'Галоп','Eighths':'Восьмые','Skank':'Скэнк','Smooth':'Плавно','Voicing':'Расклад','Auto':'Авто','Bass':'Бас','Feel':'Ощущения','Swing':'Свинг','Human':'Живость',
'● Rec':'● Запись','▶ Play':'▶ Пуск','Clear':'Очистить','Mutate':'Мутация','Tape':'Лента','Analog':'Аналог','Soft':'Мягкий','Pulse':'Пульс','Boom bap':'Бум-бэп','Half time':'Хаф-тайм','Dream':'Мечта','Four floor':'Четыре на пол','Lo-fi shuffle':'Лоу-фай шаффл','Ballad':'Баллада','Trap':'Трэп','Bars':'Такты','Click':'Клик','Empty':'Пусто','Store':'Сохранить','Backup':'Бэкап','Restore':'Вернуть','no ♯♭':'без ♯♭','Signature':'Знаки','Relative':'Параллельная','Neighbors':'Соседи','Saw':'Пила','Pad':'Пэд','Strings':'Струнные','Piano':'Пианино','E-Piano':'Электропиано','Brass':'Медные','Flute':'Флейта','Organ':'Орган','Choir':'Хор','Bell':'Колокол','Tape Keys':'Плёнка','Pluck':'Щипок','Sample':'Сэмпл','Load sample':'Загрузить сэмпл','No sample yet.':'Сэмпла пока нет.',
'Filter':'Фильтр','Reso':'Резо','Chorus':'Хорус','Delay':'Дилей','Reverb':'Реверб','Shape':'Форма','Attack':'Атака','Release':'Спад','Tremolo':'Тремоло','Rate':'Скорость','Drums ':'Ударные','Loop ':'Луп','Layer 1':'Слой 1','Layer 2':'Слой 2','Level':'Уровень',
'Tap pads · drag the dish · pull the handle up for settings':'Тапай пэды · тяни джойстик · потяни ручку вверх для настроек','Chord instrument':'Аккордовый инструмент',
'Chord set ':'Набор аккордов','How to play':'Как играть','Encoder function':'Функция энкодера','Sound: tap for the next one':'Звук: тап — следующий','Scene. Tap for next vibe':'Сцена. Тап — следующий вайб','Record':'Запись','Play or stop':'Пуск или стоп','Tempo: drag up or down, tap to tap the tempo':'Темп: тяни вверх или вниз, тапай в такт','Visual mode':'Визуальный режим','Next vibe':'Следующий вайб','Visualizer. Tap to change the view':'Визуализатор. Тап меняет вид','Tap to change the view':'Тап меняет вид','Filter encoder':'Энкодер: Фильтр','Reso encoder':'Энкодер: Резо','Change what this encoder controls':'Сменить функцию энкодера','Chord pads':'Аккордовые пэды','Tap a pad to change which chord it plays':'Тапни пэд, чтобы сменить его аккорд','New progression in this key':'Новая прогрессия в этой тональности','Undo the last recorded take':'Отменить последний записанный дубль','Play mode':'Режим игры','Hide or show the menu':'Скрыть или показать меню','Controls':'Управление','Timbre pad: drag to change the chord color':'Тембровый пэд: тяни, чтобы менять цвет аккорда','Keep the pad where you leave it':'Оставить пэд там, где отпустил','Key: tap to move up a fifth':'Тональность: тап — вверх на квинту','Sound: next vibe':'Звук: следующий вайб','Play mode: next':'Режим игры: следующий','Seventh chords on every pad':'Септаккорды на всех пэдах','Drums on or off':'Ударные вкл/выкл','Keep chords ringing':'Держать звучание аккордов','Arp rate':'Скорость арпеджио','Arp order':'Порядок арпеджио','Arp octaves':'Октавы арпеджио','Each chord takes the inversion closest to the previous one':'Каждый аккорд берёт обращение, ближайшее к предыдущему','Animated scenes on the display when you play':'Анимированные сцены на дисплее во время игры','Recording layer':'Слой записи','Record into layer 1 or 2. Clear only wipes the layer you are on.':'Запись в слой 1 или 2. Очистка стирает только текущий слой.','Drum kit':'Набор ударных','Drum pattern':'Паттерн ударных','Slower':'Медленнее','Faster':'Быстрее','Export the loop as a MIDI file':'Экспорт лупа в MIDI','Bounce the loop to a WAV file':'Рендер лупа в WAV','Save all slots to a file':'Сохранить все ячейки в файл','Restore slots from a backup file':'Вернуть ячейки из файла','Circle of fifths. Tap a key to change the key.':'Квинтовый круг. Тап по тональности меняет её.','Vibe':'Вайб','Pitch of C':'Высота ноты До','Resonance':'Резонанс','Tremolo rate':'Скорость тремоло','Show chords as roman numerals or Nashville numbers':'Показывать аккорды римскими цифрами или по Нэшвиллу',
'Memory slot':'Ячейка памяти'
};
var RUW=[[/\bNEXT\b/g,'ДАЛЕЕ'],[/\bmajor\b/g,'мажор'],[/\bminor\b/g,'минор'],[/^Layer\b/,'Слой'],[/^Display:/,'Дисплей:'],[/^Labels:/,'Подписи:'],[/\bRoman\b/,'Римские'],[/\bChord\b/g,'Аккорд'],[/^Memory slot\b/,'Ячейка памяти'],[/\bMajor\b/,'мажор'],[/\bMinor\b/,'минор'],[/\bFree\b/,'своб.'],[/\bOwn\b/,'своя']];
function trRu(s){
  var k=s.trim();if(!k)return s;
  if(RU[k]!=null)return s.replace(k,RU[k]);
  var o=k;RUW.forEach(function(w){o=o.replace(w[0],w[1]);});
  return o===k?s:s.replace(k,o);
}
var i18nObs=null;
function i18nText(n){
  if(!n.parentNode)return;var p=n.parentNode.nodeName;if(p==='SCRIPT'||p==='STYLE')return;
  var cur=n.data;
  if(LANG==='ru'){
    if(n.__ru!==undefined&&cur===n.__ru)return;
    var t=trRu(cur);if(t!==cur){n.__en=cur;n.__ru=t;n.data=t;}
  }else if(n.__ru!==undefined&&cur===n.__ru){n.data=n.__en;n.__ru=undefined;}
}
var I18A=['aria-label','title'];
function i18nAttr(e,a){
  var v=e.getAttribute(a);if(v==null)return;e.__ia=e.__ia||{};var st=e.__ia[a];
  if(LANG==='ru'){
    if(st&&v===st.ru)return;
    var t=trRu(v);if(t!==v){e.__ia[a]={en:v,ru:t};e.setAttribute(a,t);}
  }else if(st&&v===st.ru){e.setAttribute(a,st.en);e.__ia[a]=null;}
}
function i18nWalk(root){
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n,list=[];
  while((n=w.nextNode()))list.push(n);list.forEach(i18nText);
  var els=root.nodeType===1?[root].concat([].slice.call(root.querySelectorAll('[aria-label],[title]'))):[];
  els.forEach(function(e){I18A.forEach(function(a){i18nAttr(e,a);});});
}
function setLang(l){
  LANG=l;try{localStorage.setItem('suspire.lang',l);}catch(e){}
  document.documentElement.lang=l;i18nWalk(document.body);
  [].forEach.call(document.querySelectorAll('.langRow button'),function(b){b.setAttribute('aria-pressed',b.dataset.l===l?'true':'false');});
  var sb=$('#sheetLang');if(sb)sb.textContent=l==='ru'?'EN':'РУ';
}
function i18nStart(){
  document.documentElement.lang=LANG;
  if(window.MutationObserver){
    i18nObs=new MutationObserver(function(recs){
      recs.forEach(function(r){
        if(r.type==='characterData')i18nText(r.target);
        else if(r.type==='attributes')i18nAttr(r.target,r.attributeName);
        else r.addedNodes.forEach(function(n){if(n.nodeType===3)i18nText(n);else if(n.nodeType===1)i18nWalk(n);});
      });
    });
    i18nObs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:I18A});
  }
  [].forEach.call(document.querySelectorAll('.langRow button'),function(b){b.addEventListener('click',function(){setLang(b.dataset.l);});});
  var sb=$('#sheetLang');if(sb)sb.addEventListener('click',function(){setLang(LANG==='ru'?'en':'ru');});
  setLang(LANG);
}
