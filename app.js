// ========== 牌表示データ ==========
const tileDisplay={
'🀇':{c:'一',s:'萬',sc:'suit-man'},'🀈':{c:'二',s:'萬',sc:'suit-man'},'🀉':{c:'三',s:'萬',sc:'suit-man'},
'🀊':{c:'四',s:'萬',sc:'suit-man'},'🀋':{c:'五',s:'萬',sc:'suit-man'},'🀌':{c:'六',s:'萬',sc:'suit-man'},
'🀍':{c:'七',s:'萬',sc:'suit-man'},'🀎':{c:'八',s:'萬',sc:'suit-man'},'🀏':{c:'九',s:'萬',sc:'suit-man'},
'🀙':{c:'一',s:'●',sc:'suit-pin'},'🀚':{c:'二',s:'●●',sc:'suit-pin'},'🀛':{c:'三',s:'●●●',sc:'suit-pin'},
'🀜':{c:'四',s:'●●',sc:'suit-pin'},'🀝':{c:'五',s:'●●',sc:'suit-pin'},'🀞':{c:'六',s:'●●',sc:'suit-pin'},
'🀟':{c:'七',s:'●●',sc:'suit-pin'},'🀠':{c:'八',s:'●●',sc:'suit-pin'},'🀡':{c:'九',s:'●●●',sc:'suit-pin'},
'🀐':{c:'一',s:'━',sc:'suit-sou'},'🀑':{c:'二',s:'┃┃',sc:'suit-sou'},'🀒':{c:'三',s:'┃┃┃',sc:'suit-sou'},
'🀓':{c:'四',s:'╏╏',sc:'suit-sou'},'🀔':{c:'五',s:'╏╏╏',sc:'suit-sou'},'🀕':{c:'六',s:'╏╏╏',sc:'suit-sou'},
'🀖':{c:'七',s:'╏╏╏',sc:'suit-sou'},'🀗':{c:'八',s:'╏╏╏',sc:'suit-sou'},'🀘':{c:'九',s:'╏╏╏',sc:'suit-sou'},
'🀀':{c:'東',s:'',sc:'suit-wind'},'🀁':{c:'南',s:'',sc:'suit-wind'},'🀂':{c:'西',s:'',sc:'suit-wind'},'🀃':{c:'北',s:'',sc:'suit-wind'},
'🀄':{c:'中',s:'',sc:'suit-drgR'},'🀅':{c:'發',s:'',sc:'suit-drgG'},'🀆':{c:'白',s:'',sc:'suit-drgW'}
};
function td(t){return tileDisplay[t]||{c:'?',s:'',sc:''};}

// ========== サウンド ==========
let audioCtx=null;
let soundOn=true;
function initAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();}
function playTone(freq,type,dur,vol){
  if(!soundOn||!audioCtx)return;
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.connect(g);g.connect(audioCtx.destination);
  o.frequency.value=freq;o.type=type||'sine';
  g.gain.setValueAtTime(vol||.06,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);
  o.start();o.stop(audioCtx.currentTime+dur);
}
function sfxClick(){initAudio();playTone(900,'square',.04,.04);}
function sfxCorrect(){initAudio();[523,659,784].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',.15,.07),i*70));}
function sfxWrong(){initAudio();playTone(180,'sawtooth',.25,.06);}
function sfxCombo(){initAudio();[659,784,988,1175].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',.12,.06),i*50));}
function sfxUnlock(){initAudio();[523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,'triangle',.2,.07),i*100));}

// ========== 紙吹雪 ==========
let confettiParts=[],confettiAnim=false;
function spawnConfetti(n){
  const cv=document.getElementById('confetti-canvas');if(!cv)return;
  cv.width=window.innerWidth;cv.height=window.innerHeight;
  const cols=['#ffd200','#e53935','#4caf50','#2196f3','#ff9800','#9c27b0','#00bcd4'];
  for(let i=0;i<(n||40);i++)confettiParts.push({x:Math.random()*cv.width,y:-20-Math.random()*40,vx:(Math.random()-.5)*5,vy:Math.random()*3+2,sz:Math.random()*7+4,col:cols[Math.floor(Math.random()*cols.length)],rot:Math.random()*360,rs:(Math.random()-.5)*8,life:1});
  if(!confettiAnim){confettiAnim=true;animConfetti();}
}
function animConfetti(){
  const cv=document.getElementById('confetti-canvas');if(!cv){confettiAnim=false;return;}
  const ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);
  confettiParts=confettiParts.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.rot+=p.rs;p.life-=.008;
    if(p.life<=0)return false;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.globalAlpha=p.life;
    ctx.fillStyle=p.col;ctx.fillRect(-p.sz/2,-p.sz/2,p.sz,p.sz/2);ctx.restore();return p.y<cv.height+20;
  });
  if(confettiParts.length>0)requestAnimationFrame(animConfetti);else{confettiAnim=false;ctx.clearRect(0,0,cv.width,cv.height);}
}

// ========== 画面エフェクト ==========
function screenShake(){const el=document.getElementById('app');el.classList.add('shake');setTimeout(()=>el.classList.remove('shake'),400);}
function screenFlash(color){
  let fl=document.getElementById('screen-flash');if(!fl){fl=document.createElement('div');fl.id='screen-flash';fl.className='screen-flash';document.body.appendChild(fl);}
  fl.className='screen-flash '+color;setTimeout(()=>fl.className='screen-flash',300);
}
function showComboPop(n){
  const el=document.createElement('div');el.className='combo-big';el.textContent=n+' COMBO! 🔥';
  document.body.appendChild(el);setTimeout(()=>el.remove(),900);
}

// ========== 牌データ =
const tileOrder = ['🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏','🀙','🀚','🀛','🀜','🀝','🀞','🀟','🀠','🀡','🀐','🀑','🀒','🀓','🀔','🀕','🀖','🀗','🀘','🀀','🀁','🀂','🀃','🀄','🀅','🀆'];
const tileInfo = {
  '🀇':{name:'一萬',reading:'いちまん',suit:'萬子'},'🀈':{name:'二萬',reading:'にまん',suit:'萬子'},'🀉':{name:'三萬',reading:'さんまん',suit:'萬子'},
  '🀊':{name:'四萬',reading:'よんまん',suit:'萬子'},'🀋':{name:'五萬',reading:'ごまん',suit:'萬子'},'🀌':{name:'六萬',reading:'ろくまん',suit:'萬子'},
  '🀍':{name:'七萬',reading:'ななまん',suit:'萬子'},'🀎':{name:'八萬',reading:'はちまん',suit:'萬子'},'🀏':{name:'九萬',reading:'きゅうまん',suit:'萬子'},
  '🀙':{name:'一筒',reading:'いっぴん',suit:'筒子'},'🀚':{name:'二筒',reading:'りゃんぴん',suit:'筒子'},'🀛':{name:'三筒',reading:'さんぴん',suit:'筒子'},
  '🀜':{name:'四筒',reading:'すーぴん',suit:'筒子'},'🀝':{name:'五筒',reading:'うーぴん',suit:'筒子'},'🀞':{name:'六筒',reading:'ろっぴん',suit:'筒子'},
  '🀟':{name:'七筒',reading:'ちーぴん',suit:'筒子'},'🀠':{name:'八筒',reading:'はっぴん',suit:'筒子'},'🀡':{name:'九筒',reading:'きゅうぴん',suit:'筒子'},
  '🀐':{name:'一索',reading:'いーそう',suit:'索子'},'🀑':{name:'二索',reading:'りゃんぞう',suit:'索子'},'🀒':{name:'三索',reading:'さんぞう',suit:'索子'},
  '🀓':{name:'四索',reading:'すーそう',suit:'索子'},'🀔':{name:'五索',reading:'うーそう',suit:'索子'},'🀕':{name:'六索',reading:'ろーそう',suit:'索子'},
  '🀖':{name:'七索',reading:'ちーそう',suit:'索子'},'🀗':{name:'八索',reading:'ぱーそう',suit:'索子'},'🀘':{name:'九索',reading:'きゅうそう',suit:'索子'},
  '🀀':{name:'東',reading:'トン',suit:'字牌'},'🀁':{name:'南',reading:'ナン',suit:'字牌'},'🀂':{name:'西',reading:'シャー',suit:'字牌'},'🀃':{name:'北',reading:'ペー',suit:'字牌'},
  '🀄':{name:'中',reading:'チュン',suit:'字牌'},'🀅':{name:'發',reading:'ハツ',suit:'字牌'},'🀆':{name:'白',reading:'ハク',suit:'字牌'}
};
const suitTiles = {
  '萬子': tileOrder.slice(0,9), '筒子': tileOrder.slice(9,18),
  '索子': tileOrder.slice(18,27), '字牌': tileOrder.slice(27)
};

// ========== 役データと段位システム ==========
const ranks = [
  {title:'初心者',xp:0},{title:'九級',xp:50},{title:'八級',xp:100},{title:'七級',xp:200},
  {title:'六級',xp:300},{title:'五級',xp:450},{title:'四級',xp:600},{title:'三級',xp:800},
  {title:'二級',xp:1000},{title:'一級',xp:1250},{title:'初段',xp:1500},{title:'二段',xp:2000},
  {title:'三段',xp:2500},{title:'四段',xp:3500},{title:'雀豪',xp:5000},{title:'雀聖',xp:8000}
];

const yakuData = [
  {name:'リーチ',kanji:'立直',han:'1翻',desc:'門前でテンパイ時に「リーチ」と宣言。1000点棒を場に出す。宣言後は手牌変更不可。'},
  {name:'一発',kanji:'一発',han:'1翻',desc:'リーチ宣言後、1巡以内にアガること。途中で鳴きが入ると無効。'},
  {name:'門前清自摸和',kanji:'ツモ',han:'1翻',desc:'門前（鳴いていない状態）で自分のツモでアガること。'},
  {name:'タンヤオ',kanji:'断么九',han:'1翻',desc:'手牌すべてが中張牌（2〜8の数牌）のみ。1・9・字牌を含まない。'},
  {name:'ピンフ',kanji:'平和',han:'1翻',desc:'4面子すべて順子、雀頭が役牌でなく、両面待ち。門前限定。'},
  {name:'一盃口',kanji:'イーペーコー',han:'1翻',desc:'同種・同数の順子が2組。例：🀇🀈🀉🀇🀈🀉。門前限定。'},
  {name:'役牌（白）',kanji:'白',han:'1翻',desc:'🀆白の刻子（3枚）があること。鳴いてもOK。'},
  {name:'役牌（發）',kanji:'發',han:'1翻',desc:'🀅發の刻子（3枚）があること。鳴いてもOK。'},
  {name:'役牌（中）',kanji:'中',han:'1翻',desc:'🀄中の刻子（3枚）があること。鳴いてもOK。'},
  {name:'自風牌',kanji:'自風牌',han:'1翻',desc:'自分の風（東家なら東など）の刻子。鳴いてもOK。'},
  {name:'場風牌',kanji:'場風牌',han:'1翻',desc:'場の風（東場なら東）の刻子。鳴いてもOK。'},
  {name:'嶺上開花',kanji:'リンシャンカイホウ',han:'1翻',desc:'カンした後の嶺上牌でアガること。'},
  {name:'槍槓',kanji:'チャンカン',han:'1翻',desc:'他家の加カンした牌でロンアガリ。'},
  {name:'海底摸月',kanji:'ハイテイ',han:'1翻',desc:'山の最後の牌をツモしてアガること。'},
  {name:'河底撈魚',kanji:'ホウテイ',han:'1翻',desc:'最後の捨て牌でロンアガリすること。'},
  {name:'ダブルリーチ',kanji:'ダブル立直',han:'2翻',desc:'第一ツモでリーチ宣言。それまで誰も鳴いていないこと。'},
  {name:'三色同順',kanji:'サンショク',han:'2翻',desc:'萬子・筒子・索子で同じ数字の順子。例：123萬+123筒+123索'},
  {name:'三色同刻',kanji:'サンショクドウコー',han:'2翻',desc:'萬子・筒子・索子で同じ数字の刻子。例：555萬+555筒+555索'},
  {name:'一気通貫',kanji:'イッツー',han:'2翻',desc:'同種の数牌で123・456・789の3順子を作る。'},
  {name:'対々和',kanji:'トイトイ',han:'2翻',desc:'4面子すべてが刻子（同じ牌3枚）。順子なし。'},
  {name:'三暗刻',kanji:'サンアンコー',han:'2翻',desc:'鳴かずに揃えた暗刻が3つあること。'},
  {name:'三槓子',kanji:'サンカンツ',han:'2翻',desc:'カンを3回成功させていること。'},
  {name:'小三元',kanji:'ショウサンゲン',han:'2翻',desc:'三元牌のうち2種を刻子、1種を雀頭。実質4翻相当。'},
  {name:'混老頭',kanji:'ホンロウトウ',han:'2翻',desc:'1・9の数牌と字牌のみ。2〜8を含まない。'},
  {name:'七対子',kanji:'チートイツ',han:'2翻',desc:'7組の対子で手を構成する特殊形。門前限定。'},
  {name:'混全帯么九',kanji:'チャンタ',han:'2翻',desc:'すべての面子・雀頭に1・9か字牌が含まれる。'},
  {name:'混一色',kanji:'ホンイツ',han:'3翻',desc:'1種類の数牌＋字牌のみで構成。鳴くと2翻。'},
  {name:'純全帯么九',kanji:'ジュンチャン',han:'3翻',desc:'すべての面子・雀頭に1・9が含まれる。字牌なし。'},
  {name:'二盃口',kanji:'リャンペーコー',han:'3翻',desc:'一盃口が2組ある形。門前限定。'},
  {name:'清一色',kanji:'チンイツ',han:'6翻',desc:'1種類の数牌のみで構成。字牌も不可。鳴くと5翻。'},
  {name:'国士無双',kanji:'コクシムソウ',han:'役満',desc:'1・9全種＋字牌全種を1枚ずつ＋どれか1枚の13種14枚。'},
  {name:'四暗刻',kanji:'スーアンコー',han:'役満',desc:'暗刻を4つ作る。門前限定の最高峰。'},
  {name:'大三元',kanji:'ダイサンゲン',han:'役満',desc:'白・發・中の三元牌すべてを刻子にする。'},
  {name:'字一色',kanji:'ツーイーソー',han:'役満',desc:'手牌すべてが字牌のみ。'},
  {name:'緑一色',kanji:'リューイーソー',han:'役満',desc:'索子の2・3・4・6・8と發のみで構成。'},
  {name:'清老頭',kanji:'チンロウトウ',han:'役満',desc:'1と9の数牌のみで構成。字牌なし。'},
  {name:'小四喜',kanji:'ショウスーシー',han:'役満',desc:'風牌3種を刻子、1種を雀頭。'},
  {name:'大四喜',kanji:'ダイスーシー',han:'役満',desc:'東南西北すべてを刻子。'},
  {name:'四槓子',kanji:'スーカンツ',han:'役満',desc:'カンを4回成功させる。最も出にくい役。'},
  {name:'天和',kanji:'テンホー',han:'役満',desc:'親の配牌でいきなりアガっている状態。'},
  {name:'地和',kanji:'チーホー',han:'役満',desc:'子の第一ツモでアガること。鳴きなし条件。'},
  {name:'九蓮宝燈',kanji:'チューレンポートー',han:'役満',desc:'1種の数牌で1112345678999＋同種1枚。'},
];
const hanCategories = ['1翻','2翻','3翻','6翻','役満'];

// ========== 何切る用データ ==========
const roundPool = ['東1局','東2局','東3局','東4局','南1局','南2局','南3局','南4局（オーラス）'];
const windPool = ['東家','南家','西家','北家'];
const scorePool = ['平場','トップ目','ラス目','アガリトップ（大接戦）'];
const turnPool = [3,4,5,6,7,8,9,10,12,14,15];

// ========== ユーティリティ ==========
function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function pick(arr,n){ return shuffle(arr).slice(0,n); }

// ========== クイズ生成 ==========
function genTileQuiz(){
  const questions=[];
  const tiles=Object.keys(tileInfo);
  for(let i=0;i<10;i++){
    const t=tiles[Math.floor(Math.random()*tiles.length)];
    const correct=tileInfo[t].name;
    const wrongs=shuffle(tiles.filter(x=>tileInfo[x].name!==correct)).slice(0,3).map(x=>tileInfo[x].name);
    const opts=shuffle([correct,...wrongs]);
    questions.push({tile:t,question:`この牌の名前は？`,options:opts,correct,explain:`${t} は「${correct}」（${tileInfo[t].reading}）です。${tileInfo[t].suit}に属します。`});
  }
  return questions;
}

function genMeldQuiz(){
  const questions=[];
  for(let i=0;i<10;i++){
    const r=Math.random();
    let tiles3,correct,explain;
    if(r<0.35){
      const suit=Math.floor(Math.random()*3);
      const start=Math.floor(Math.random()*7);
      tiles3=[tileOrder[suit*9+start],tileOrder[suit*9+start+1],tileOrder[suit*9+start+2]];
      correct='順子（シュンツ）';
      explain=`${tiles3.join('')} は連続する同じ種類の数牌3枚なので「順子」です。`;
    } else if(r<0.7){
      const idx=Math.floor(Math.random()*tileOrder.length);
      tiles3=[tileOrder[idx],tileOrder[idx],tileOrder[idx]];
      correct='刻子（コーツ）';
      explain=`${tiles3.join('')} は同じ牌が3枚なので「刻子」です。`;
    } else {
      let t3;
      do {
        t3=pick(tileOrder,3);
      } while(isValidMeld(t3));
      tiles3=t3;
      correct='面子ではない';
      explain=`${tiles3.join('')} は順子でも刻子でもないため、面子にはなりません。`;
    }
    questions.push({tiles:tiles3,question:'この3枚は面子（メンツ）になる？',options:['順子（シュンツ）','刻子（コーツ）','面子ではない'],correct,explain});
  }
  return questions;
}

function isValidMeld(t3){
  if(t3[0]===t3[1]&&t3[1]===t3[2]) return true;
  const idxs=t3.map(t=>tileOrder.indexOf(t)).sort((a,b)=>a-b);
  const suit0=Math.floor(idxs[0]/9), suit1=Math.floor(idxs[1]/9), suit2=Math.floor(idxs[2]/9);
  if(suit0===suit1&&suit1===suit2&&suit0<3&&idxs[1]-idxs[0]===1&&idxs[2]-idxs[1]===1) return true;
  return false;
}

function genYakuQuiz(){
  const questions=[];
  for(let i=0;i<10;i++){
    const y=yakuData[Math.floor(Math.random()*yakuData.length)];
    const wrongs=shuffle(yakuData.filter(x=>x.name!==y.name)).slice(0,2).map(x=>x.name);
    const opts=shuffle([y.name,...wrongs]);
    questions.push({question:y.desc,options:opts,correct:y.name,explain:`正解は「${y.name}」（${y.kanji}）${y.han}です。`});
  }
  return questions;
}

function genWaitQuiz(){
  const questions=[];
  const waitData = [
    {hand:['🀇','🀈'], wait:['🀆','🀉'], q:'両面（リャンメン）待ちです。待ち牌は何？', a:'三・六萬', opts:['一・四萬','二・五萬','三・六萬','四・七萬']},
    {hand:['🀙','🀛'], wait:['🀚'], q:'嵌張（カンチャン）待ちです。待ち牌は何？', a:'二筒', opts:['一筒','二筒','三筒','四筒']},
    {hand:['🀐','🀑'], wait:['🀒'], q:'辺張（ペンチャン）待ちです。待ち牌は何？', a:'三索', opts:['一索','二索','三索','四索']},
    {hand:['🀀'], wait:['🀀'], q:'単騎（タンキ）待ちです。待ち牌は何？', a:'東', opts:['東','南','西','北']},
    {hand:['🀄','🀄','🀅','🀅'], wait:['🀄','🀅'], q:'双碰（シャボ）待ちです。待ち牌は何？', a:'中・發', opts:['白・發','中・發','東・南','西・北']},
    {hand:['🀝','🀝','🀝','🀞'], wait:['🀜','🀟','🀞'], q:'変則待ち（ノベタンなど）です。待ち牌は何？', a:'四・七・五筒', opts:['三・六筒','四・七・五筒','二・五・八筒','一・四・七筒']},
    {hand:['🀇','🀇','🀇','🀈','🀉'], wait:['🀈','🀊'], q:'複合形（エントツなど）の待ちです。', a:'二・四萬', opts:['一・四萬','二・五萬','二・四萬','三・六萬']},
    {hand:['🀙','🀚','🀛','🀛','🀛'], wait:['🀙','🀜'], q:'複合形の待ちです。', a:'一・四筒', opts:['一・四筒','二・五筒','三・六筒','四・七筒']},
    {hand:['🀐','🀑','🀒','🀓','🀔'], wait:['🀏','🀒','🀕'], q:'三面張（多面待ち）です。', a:'一・四・七索', opts:['二・五・八索','一・四・七索','三・六・九索','一・九索']},
    {hand:['🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏'], wait:['🀇','🀊','🀍'], q:'九連宝燈の一歩手前です。何待ち？（純正ではない）', a:'一・四・七萬', opts:['一・四・七萬','二・五・八萬','三・六・九萬','一から九までの萬子すべて']}
  ];
  for(let i=0;i<10;i++){
    const d=waitData[i%waitData.length];
    const opts=shuffle([...d.opts]);
    questions.push({tiles:d.hand, question:d.q, options:opts, correct:d.a, explain:`正解は「${d.a}」です。待ちの形をしっかり覚えましょう！`});
  }
  return shuffle(questions);
}

function genScoreQuiz(){
  const questions=[];
  const scoreData = [
    {q:'親の満貫（マンガン）の点数は？', a:'12000点', opts:['8000点','12000点','16000点','24000点'], exp:'親の満貫は12000点（ツモなら4000オール）です。'},
    {q:'子の満貫（マンガン）の点数は？', a:'8000点', opts:['8000点','12000点','16000点','24000点'], exp:'子の満貫は8000点（ツモなら2000/4000）です。'},
    {q:'子の跳満（ハネマン）の点数は？', a:'12000点', opts:['8000点','12000点','16000点','18000点'], exp:'子の跳満（6〜7翻）は12000点です。'},
    {q:'親の倍満（バイマン）の点数は？', a:'24000点', opts:['16000点','18000点','24000点','32000点'], exp:'親の倍満（8〜10翻）は24000点です。'},
    {q:'子の役満の点数は？', a:'32000点', opts:['24000点','32000点','48000点','役満は点数なし'], exp:'子の役満（13翻〜）は32000点です。'},
    {q:'基本となる符（副底・フーテイ）はいくつ？', a:'20符', opts:['10符','20符','30符','40符'], exp:'アガった時に必ず与えられる基本の符は20符です。'},
    {q:'門前（メンゼン）でロンアガリした時の加符は？', a:'10符', opts:['0符','2符','10符','20符'], exp:'門前ロン（メンゼン加符）は10符加算されます。'},
    {q:'ツモアガリした時の加符は？', a:'2符', opts:['0符','2符','10符','20符'], exp:'ツモアガリは原則として2符加算されます（ピンフツモを除く）。'},
    {q:'中張牌（2〜8）の暗刻（アンコ）は何符？', a:'4符', opts:['2符','4符','8符','16符'], exp:'中張牌の暗刻は4符です。ヤオチュー牌なら倍の8符になります。'},
    {q:'子の「1翻30符」の点数は？', a:'1000点', opts:['1000点','1500点','2000点','3900点'], exp:'子の1翻30符は1000点（ゴットー）です。麻雀の基本となる点数です。'}
  ];
  for(let i=0;i<10;i++){
    const d=scoreData[i%scoreData.length];
    const opts=shuffle([...d.opts]);
    questions.push({question:d.q, options:opts, correct:d.a, explain:d.exp});
  }
  return shuffle(questions);
}

// ========== 何切るロジック（既存） ==========
function createWall(){ let w=[]; tileOrder.forEach(t=>w.push(t,t,t,t)); return shuffle(w); }

function analyzeHand(hand,sit){
  const counts={}; hand.forEach(t=>{counts[t]=(counts[t]||0)+1;});
  const iso=hand.filter(t=>counts[t]===1);
  let tile=hand[0],exp='';
  if(iso.length>0){
    const ji=iso.find(t=>tileOrder.indexOf(t)>=27);
    const term=iso.find(t=>[0,8,9,17,18,26].includes(tileOrder.indexOf(t)));
    if(ji){tile=ji;exp=`孤立した字牌（${ji}）は面子になりにくいため優先して切ります。`;}
    else if(term){tile=term;exp=`孤立した端牌（${term}）は受入れが少ないため切ります。`;}
    else{tile=iso[0];exp=`「${iso[0]}」が孤立牌です。ブロック整理のため切ります。`;}
  } else { exp=`孤立牌がない形です。仮として「${hand[0]}」を推奨打牌とします。`; }
  let extra='';
  if(sit.score==='ラス目') extra='\n💡ラス目：高打点を狙う攻撃的な選択も視野に。';
  else if(sit.score==='トップ目') extra='\n💡トップ目：振り込み回避を優先。';
  else if(sit.turn>=12) extra=`\n💡${sit.turn}巡目：安全度も考慮すべき終盤。`;
  else if(sit.round==='南4局（オーラス）') extra='\n💡オーラス：順位条件を意識した一打を。';
  return {tile,explanation:'【牌理分析】'+exp+extra};
}

// ========== 何切る 厳選プリセット ==========
const presetQuestions = [
  {
    hand: ['🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏','🀙','🀚','🀛','🀀','🀀'],
    correct: '🀀', waits: ['🀀'],
    explanation: '純正九蓮宝燈のイーシャンテン！東を落とせばテンパイ。'
  },
  {
    hand: ['🀛','🀜','🀝','🀝','🀞','🀟','🀟','🀟','🀐','🀑','🀒','🀓','🀔','🀕'],
    correct: '🀝', waits: ['🀚','🀝','🀠'],
    explanation: '筒子の形に注目。三筒を切れば二筒・三筒・五筒・八筒の多面待ちになります（三面張）。'
  },
  {
    hand: ['🀇','🀇','🀈','🀈','🀉','🀉','🀙','🀙','🀚','🀚','🀛','🀛','🀀','🀁'],
    correct: '🀁', waits: ['🀀'],
    explanation: '七対子か二盃口のイーシャンテン。孤立している風牌を処理します。'
  },
  {
    hand: ['🀇','🀈','🀉','🀋','🀌','🀍','🀙','🀚','🀛','🀐','🀑','🀒','🀓','🀔'],
    correct: '🀓', waits: ['🀒','🀕'],
    explanation: '完全イーシャンテンの形。三索を切ることで両面待ち（二索・五索）が確定します。'
  }
];

function genQuestion(){
  if(Math.random()<0.3){
    const pq = presetQuestions[Math.floor(Math.random()*presetQuestions.length)];
    return {
      situation: {round:'東1局',wind:'東家',turn:Math.floor(Math.random()*6)+6,score:'25000',dora:tileOrder[Math.floor(Math.random()*tileOrder.length)]},
      hand: [...pq.hand], correct: pq.correct, waits: pq.waits || [], explanation: '【厳選良問】\n'+pq.explanation
    };
  }
  const w=createWall(); let h=w.slice(0,14); const dora=w[14];
  h.sort((a,b)=>tileOrder.indexOf(a)-tileOrder.indexOf(b));
  const sit={round:roundPool[Math.floor(Math.random()*roundPool.length)],wind:windPool[Math.floor(Math.random()*windPool.length)],score:scorePool[Math.floor(Math.random()*scorePool.length)],turn:turnPool[Math.floor(Math.random()*turnPool.length)],dora};
  const a=analyzeHand(h,sit);
  return {situation:sit,hand:h,correct:a.tile,waits:['?'],explanation:a.explanation};
}

// ========== Vue App ==========
const {createApp,ref,computed,onMounted} = Vue;

createApp({
  setup(){
    const page=ref('home');
    const unlockedStep=ref(1);
    const stepCleared=ref({1:false,2:false,3:false,4:false,6:false});

    // ========== Phase 4: 実績システム ==========
    const achievements = ref([
      { id: 'first_play', name: '初めの一歩', desc: '初めて何切るをプレイする', icon: '🐣', unlocked: false },
      { id: 'combo_5', name: 'コンボメイカー', desc: '何切るで5コンボ達成', icon: '🔥', unlocked: false },
      { id: 'survival_5000', name: 'サバイバー', desc: 'サバイバルでスコア5000達成', icon: '❤️‍🔥', unlocked: false },
      { id: 'quiz_master', name: 'クイズ王', desc: 'いずれかのクイズで満点を取る', icon: '👑', unlocked: false },
      { id: 'rank_up', name: '初昇段', desc: '九級に到達する', icon: '🔰', unlocked: false }
    ]);
    const showAchieveModal = ref(false);

    function checkAchievement(id) {
      const ach = achievements.value.find(a => a.id === id);
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        saveAchievements();
        sfxUnlock();
        showComboPop('実績解除: ' + ach.name + ' ' + ach.icon);
        addXP(100); // 実績解除ボーナス
      }
    }

    function saveAchievements() {
      localStorage.setItem('mahjongAchievements', JSON.stringify(achievements.value.map(a => ({ id: a.id, unlocked: a.unlocked }))));
    }

    function shareToX(text) {
      const url = encodeURIComponent('https://koshi0417.github.io/mahjong-simulator/');
      const textEnc = encodeURIComponent(text + '\n#麻雀道場 #何切る #麻雀');
      window.open(`https://twitter.com/intent/tweet?text=${textEnc}&url=${url}`, '_blank');
    }
    // =========================================

    // タブ
    const tileTab=ref('萬子');
    const yakuTab=ref('1翻');

    // クイズ共通
    const quizStep=ref(0);
    const quizQs=ref([]);
    const quizIdx=ref(0);
    const quizScore=ref(0);
    const quizSel=ref(null);

    // ゲーム
    const activeMode=ref('');
    const timeLeft=ref(0);
    let timerId=null;
    const score=ref(0);
    const lives=ref(3);
    const combo=ref(0);
    const highScore=ref(0);
    const isNewRecord=ref(false);
    const questionCount=ref(1);
    const currentQ=ref({});
    const selectedTile=ref(null);
    const showExpl=ref(false);
    const judgment=ref(null);

    // XP & 段位
    const totalXP=ref(0);
    const currentRank=computed(()=>{
      let r=ranks[0];
      for(let i=0;i<ranks.length;i++){if(totalXP.value>=ranks[i].xp) r=ranks[i]; else break;}
      return r;
    });
    const nextRank=computed(()=>{
      for(let i=0;i<ranks.length;i++){if(totalXP.value<ranks[i].xp) return ranks[i];}
      return null;
    });
    const xpProgress=computed(()=>{
      if(!nextRank.value) return 100;
      let currRankXP=0;
      for(let i=ranks.length-1;i>=0;i--){if(totalXP.value>=ranks[i].xp){currRankXP=ranks[i].xp;break;}}
      const needed = nextRank.value.xp - currRankXP;
      const earned = totalXP.value - currRankXP;
      return Math.floor((earned/needed)*100);
    });

    function addXP(amount){
      const oldRank = currentRank.value.title;
      totalXP.value+=amount;
      localStorage.setItem('mahjongXP', totalXP.value);
      if(currentRank.value.title !== oldRank){
        setTimeout(()=>{sfxUnlock();screenFlash('green');showComboPop('昇段: '+currentRank.value.title);}, 500);
      }
    }

    // 計算
    const currentTiles=computed(()=>suitTiles[tileTab.value]||[]);
    const filteredYaku=computed(()=>yakuData.filter(y=>y.han===yakuTab.value));
    const currentQuiz=computed(()=>quizQs.value[quizIdx.value]||{});

    onMounted(()=>{
      const s=localStorage.getItem('mjStep');
      if(s){const d=JSON.parse(s);unlockedStep.value=d.unlocked||1;stepCleared.value=d.cleared||{1:false,2:false,3:false,4:false,6:false};}
      else{stepCleared.value={1:false,2:false,3:false,4:false,6:false};}
      const hs=localStorage.getItem('mahjongHighScore');
      if(hs) highScore.value=parseInt(hs,10);
      const savedXP=localStorage.getItem('mahjongXP');
      if(savedXP) totalXP.value=parseInt(savedXP,10);
      
      const savedAch = localStorage.getItem('mahjongAchievements');
      if (savedAch) {
        const parsed = JSON.parse(savedAch);
        parsed.forEach(pa => {
          const ach = achievements.value.find(a => a.id === pa.id);
          if (ach) ach.unlocked = pa.unlocked;
        });
      }
    });

    function saveProgress(){localStorage.setItem('mjStep',JSON.stringify({unlocked:unlockedStep.value,cleared:stepCleared.value}));}

    function goStep(n){
      if(n>unlockedStep.value) return;
      if(n===5){page.value='step5';return;}
      page.value='step'+n+'-learn';
    }

    function startQuiz(step){
      quizStep.value=step;
      quizIdx.value=0; quizScore.value=0; quizSel.value=null;
      if(step===1) quizQs.value=genTileQuiz();
      else if(step===2) quizQs.value=genMeldQuiz();
      else if(step===3) quizQs.value=genYakuQuiz();
      else if(step===4) quizQs.value=genWaitQuiz();
      else if(step===6) quizQs.value=genScoreQuiz();
      page.value='quiz';
    }

    function selectQuizAnswer(opt){
      if(quizSel.value!==null) return;
      sfxClick();quizSel.value=opt;
      if(opt===currentQuiz.value.correct){
        quizScore.value++;sfxCorrect();screenFlash('green');spawnConfetti(20);
        addXP(2); // クイズ正解で2XP
      }
      else{sfxWrong();screenShake();screenFlash('red');}
    }

    function nextQuizQ(){
      if(quizIdx.value<9){quizIdx.value++;quizSel.value=null;}
      else{
        const passed=quizScore.value>=7;
        if(passed){
          stepCleared.value[quizStep.value]=true;
          let nextUnlock = quizStep.value+1;
          if(quizStep.value===4) nextUnlock = 6; // STEP4クリアでSTEP5(ゲーム)とSTEP6(計算)を同時解放
          
          if(quizStep.value<6 && nextUnlock>unlockedStep.value){
            unlockedStep.value = nextUnlock; sfxUnlock();
          }
          saveProgress();spawnConfetti(60);
          addXP(50); // クイズクリアボーナス
          if(quizScore.value===10) checkAchievement('quiz_master');
        }
        page.value='quiz-result';
      }
    }

    // ゲーム機能（既存）
    function startGame(mode){
      activeMode.value=mode; score.value=0; combo.value=0; questionCount.value=1; isNewRecord.value=false;
      if(mode==='survival') lives.value=3;
      else if(mode==='timeAttack'){timeLeft.value=60;timerId=setInterval(()=>{timeLeft.value--;if(timeLeft.value<=0)endGame();},1000);}
      currentQ.value=genQuestion(); selectedTile.value=null; showExpl.value=false; judgment.value=null;
      page.value='game';
      checkAchievement('first_play');
    }

    function selectTile(t){
      if(selectedTile.value||page.value!=='game') return;
      sfxClick();selectedTile.value=t;
      if(t===currentQ.value.correct){
        judgment.value='correct';combo.value++;
        let gain=activeMode.value==='practice'?1:100*combo.value;
        score.value+=gain;
        addXP(activeMode.value==='practice'?5:10*combo.value); // XP追加
        sfxCorrect();screenFlash('green');spawnConfetti(25);
        if(combo.value>=3){sfxCombo();showComboPop(combo.value);}
        if(combo.value>=5) checkAchievement('combo_5');
        if(activeMode.value==='survival' && score.value>=5000) checkAchievement('survival_5000');
      } else{
        judgment.value='incorrect';combo.value=0;
        addXP(1); // 失敗でも1XP
        sfxWrong();screenShake();screenFlash('red');
        if(activeMode.value==='survival'){lives.value--;if(lives.value<=0)setTimeout(endGame,1500);}
      }
      showExpl.value=true;
    }

    function nextQuestion(){
      questionCount.value++; currentQ.value=genQuestion();
      selectedTile.value=null; judgment.value=null; showExpl.value=false;
    }

    function endGame(){
      if(timerId){clearInterval(timerId);timerId=null;}
      if(activeMode.value==='survival'&&score.value>highScore.value&&score.value>0){
        highScore.value=score.value;isNewRecord.value=true;localStorage.setItem('mahjongHighScore',highScore.value);
      }
      page.value='game-result';
    }

    function goHome(){
      if(timerId){clearInterval(timerId);timerId=null;}
      page.value='home'; selectedTile.value=null; judgment.value=null; showExpl.value=false;
    }

    function toggleExpl(){showExpl.value=!showExpl.value;}

    function stepStatus(n){
      if(n===5) return unlockedStep.value>=5 ? 'unlocked' : 'locked'; // STEP5(何切る)にはクリア状態がない
      if(stepCleared.value[n]) return 'cleared';
      if(n<=unlockedStep.value) return 'unlocked';
      return 'locked';
    }

    const soundEnabled=ref(true);
    function toggleSound(){soundEnabled.value=!soundEnabled.value;soundOn=soundEnabled.value;}

    return {
      page,unlockedStep,stepCleared,tileTab,yakuTab,
      quizStep,quizQs,quizIdx,quizScore,quizSel,currentQuiz,
      activeMode,timeLeft,score,lives,combo,highScore,isNewRecord,
      questionCount,currentQ,selectedTile,showExpl,judgment,
      currentTiles,filteredYaku,soundEnabled,
      totalXP,currentRank,nextRank,xpProgress,
      suitTiles,tileInfo,yakuData,hanCategories,tileOrder,td,tileDisplay,
      achievements,showAchieveModal,shareToX,
      goStep,startQuiz,selectQuizAnswer,nextQuizQ,
      startGame,selectTile,nextQuestion,endGame,goHome,toggleExpl,stepStatus,toggleSound
    };
  }
}).mount('#app');
