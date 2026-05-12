<template>
  <div class="mahjong-app">
    <header>
      <h1>🀄 何切るシミュレーター</h1>
      
      <div class="game-stats" v-if="isStarted && !isFinished">
        <div class="score-box">
          <span v-if="activeMode !== 'practice'">SCORE: {{ score }}</span>
          <span v-else>正解数: {{ score }}</span>
          <span v-if="combo > 1 && activeMode !== 'practice'" class="combo-text">{{ combo }} COMBO! 🔥</span>
        </div>
        
        <div class="mode-stats">
          <span v-if="activeMode === 'survival'" class="life-box">
            <span v-for="n in lives" :key="n">❤️</span>
            <span v-for="n in (3 - lives)" :key="'empty'+n">🖤</span>
          </span>
          <span v-if="activeMode === 'timeAttack'" class="timer-box" :class="{ 'time-danger': timeLeft <= 10 }">
            ⏳ 残り: {{ timeLeft }}秒
          </span>
          <span v-if="activeMode === 'practice'" style="color: #4caf50;">
            🌿 じっくり思考中
          </span>
        </div>

        <button @click="endGame" class="quit-btn">中断 🛑</button>
      </div>
    </header>

    <div v-if="!isStarted" class="start-screen">
      <h2>モードを選択してスタート</h2>
      <p class="high-score" v-if="highScore > 0">
        🏆 サバイバル最高記録: <span class="score-number">{{ highScore }}</span> pt
      </p>
      
      <div class="mode-select-container">
        <div class="mode-card" @click="startGame('survival')">
          <h3>❤️ サバイバル</h3>
          <p>ライフ3つで限界に挑むエンドレスモード。</p>
        </div>
        <div class="mode-card" @click="startGame('timeAttack')">
          <h3>⏳ タイムアタック</h3>
          <p>60秒間でどれだけスコアを稼げるか競う。</p>
        </div>
        <div class="mode-card practice-card" @click="startGame('practice')">
          <h3>🌿 フリー練習</h3>
          <p>ライフも制限時間もなし。自分のペースでじっくり学ぶ。</p>
        </div>
      </div>
    </div>

    <div v-else-if="!isFinished">
      <div class="status-board">
        <div class="question-header">第{{ questionCount }}問</div>
        <div class="situation-text">
          {{ currentQuestion.situation.round }} | {{ currentQuestion.situation.wind }} | 
          <span class="highlight">{{ currentQuestion.situation.turn }}巡目</span> | 
          <span class="highlight">{{ currentQuestion.situation.score }}</span>
        </div>
        <div class="dora-text">ドラ: {{ currentQuestion.situation.dora }}</div>
      </div>

      <div class="hand-area">
        <div 
          v-for="(tile, index) in currentQuestion.hand" 
          :key="index"
          class="tile"
          :class="{ 'disabled-tile': selectedTile }"
          @click="selectTile(tile)"
        >
          {{ tile }}
        </div>
      </div>

      <div class="action-info" v-if="selectedTile">
        <p>「{{ selectedTile }}」を切る！</p>
        <div class="judgment-mark" :class="judgment">
          {{ judgment === 'correct' ? '⭕ 正解！' : '❌ 不正解...' }}
        </div>
      </div>

      <div class="explanation-section">
        <button v-if="!selectedTile" @click="toggleExplanation" class="toggle-btn">
          {{ showExplanation ? '解説を閉じる' : '解答を見る' }}
        </button>
        
        <div v-if="showExplanation" class="explanation-box">
          <h3>【正解】{{ currentQuestion.correct }} 切り</h3>
          <p>{{ currentQuestion.explanation }}</p>
          <hr style="margin: 15px 0; border: 0; border-top: 1px solid #ccc;" />
          <button @click="nextQuestion" class="toggle-btn" style="background-color: #ff9800;">
            次の問題へ ➡️
          </button>
        </div>
      </div>
    </div>

    <div v-else class="result-screen">
      <h2>
        <span v-if="activeMode === 'timeAttack'">⏰ TIME UP! ⏰</span>
        <span v-else-if="activeMode === 'practice'">🌿 練習終了 🌿</span>
        <span v-else>💀 GAME OVER 💀</span>
      </h2>
      
      <p class="score-text">
        最終結果<br>
        <span class="score-number">{{ score }}</span> {{ activeMode === 'practice' ? '問正解' : 'pt' }}
      </p>
      <p v-if="isNewRecord && activeMode === 'survival'" class="perfect-msg">
        🎉 自己ベスト更新！おめでとうございます！ 🎉
      </p>
      <button @click="backToTitle" class="toggle-btn" style="background-color: #4caf50; margin-top: 20px;">
        タイトルに戻る 🏠
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const tileOrder = [
  '🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏',
  '🀙','🀚','🀛','🀜','🀝','🀞','🀟','🀠','🀡',
  '🀐','🀑','🀒','🀓','🀔','🀕','🀖','🀗','🀘',
  '🀀','🀁','🀂','🀃','🀄','🀅','🀆'
];

const roundPool = ['東1局', '東2局', '東3局', '東4局', '南1局', '南2局', '南3局', '南4局（オーラス）'];
const windPool = ['東家', '南家', '西家', '北家'];
const scorePool = ['平場', 'トップ目', 'ラス目', 'アガリトップ（大接戦）'];
const turnPool = [3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15];

const createWall = () => {
  let wall = [];
  tileOrder.forEach(tile => wall.push(tile, tile, tile, tile));
  return wall.sort(() => Math.random() - 0.5);
};

const analyzeHand = (hand, situation) => {
  const counts = {};
  hand.forEach(tile => { counts[tile] = (counts[tile] || 0) + 1; });
  const isolatedTiles = hand.filter(tile => counts[tile] === 1);

  let baseTile = hand[0];
  let baseExplanation = "";

  if (isolatedTiles.length > 0) {
    const jihai = isolatedTiles.find(t => tileOrder.indexOf(t) >= 27);
    const terminals = isolatedTiles.find(t => [0,8,9,17,18,26].includes(tileOrder.indexOf(t)));

    if (jihai) {
      baseTile = jihai;
      baseExplanation = `現在の手牌には孤立している字牌（${jihai}）があります。面子になる確率が低いため、最も優先して処理すべき牌です。`;
    } else if (terminals) {
      baseTile = terminals;
      baseExplanation = `孤立している端牌（${terminals}）が狙い目です。受け入れ枚数が限定されるため、この端牌から切るのがセオリーです。`;
    } else {
      baseTile = isolatedTiles[0];
      baseExplanation = `字牌や端牌の孤立はありませんが、「${isolatedTiles[0]}」が孤立牌です。ブロックオーバーを防ぐため数牌から整理しましょう。`;
    }
  } else {
    baseExplanation = `孤立している牌が1枚もない形です！対子や暗刻が多い形になっているため、今回は仮として一番左の「${hand[0]}」を推奨打牌としました。`;
  }

  let extraAdvice = "";
  if (situation.score === 'ラス目') {
    extraAdvice = `\n\n💡【状況アドバイス】現在は「ラス目」です。単にテンパイを急ぐだけでなく、あえて受け入れを狭めてでも高い手役（三色やドラ絡み）を狙う攻撃的な打牌も視野に入ります。`;
  } else if (situation.score === 'トップ目') {
    extraAdvice = `\n\n💡【状況アドバイス】現在は「トップ目」です。自分のアガリ以上に、他家に振り込まないことが重要です。孤立牌を切る際も、他家に危険な牌ならあえて抱えてベタオリの準備をする思考が求められます。`;
  } else if (situation.turn >= 12) {
    extraAdvice = `\n\n💡【状況アドバイス】すでに「${situation.turn}巡目」の終盤です。そろそろテンパイしている他家がいる可能性が高いため、自分の手牌の効率だけでなく、安全度を優先した打牌選択も考慮すべきです。`;
  } else if (situation.round === '南4局（オーラス）') {
    extraAdvice = `\n\n💡【状況アドバイス】「オーラス」です！順位が確定する最後の局なので、点数状況を常に意識し、条件を満たす最速・最適の一打を考えましょう。`;
  }

  return { tile: baseTile, explanation: `【牌理分析】` + baseExplanation + extraAdvice };
};

const generateSingleQuestion = (questionNumber) => {
  const wall = createWall();
  let hand = wall.slice(0, 14);
  const doraIndicator = wall[14];
  hand.sort((a, b) => tileOrder.indexOf(a) - tileOrder.indexOf(b));

  const currentSituation = {
    round: roundPool[Math.floor(Math.random() * roundPool.length)],
    wind: windPool[Math.floor(Math.random() * windPool.length)],
    score: scorePool[Math.floor(Math.random() * scorePool.length)],
    turn: turnPool[Math.floor(Math.random() * turnPool.length)],
    dora: doraIndicator
  };

  const analysis = analyzeHand(hand, currentSituation);

  return {
    situation: currentSituation,
    hand: hand,
    correct: analysis.tile,
    explanation: analysis.explanation
  };
};

const activeMode = ref('');
const timeLeft = ref(0);
let timerId = null;

const isStarted = ref(false);
const isFinished = ref(false);
const score = ref(0);
const lives = ref(3);
const combo = ref(0);
const highScore = ref(0);
const isNewRecord = ref(false);

const questionCount = ref(1);
const currentQuestion = ref({});
const selectedTile = ref(null);
const showExplanation = ref(false);
const judgment = ref(null);

onMounted(() => {
  const savedScore = localStorage.getItem('mahjongHighScore');
  if (savedScore) highScore.value = parseInt(savedScore, 10);
});

const startGame = (mode) => {
  activeMode.value = mode;
  score.value = 0;
  combo.value = 0;
  questionCount.value = 1;
  isNewRecord.value = false;
  
  if (mode === 'survival') {
    lives.value = 3;
  } else if (mode === 'timeAttack') {
    timeLeft.value = 60;
    timerId = setInterval(() => {
      timeLeft.value--;
      if (timeLeft.value <= 0) endGame();
    }, 1000);
  }
  
  currentQuestion.value = generateSingleQuestion(questionCount.value);
  isStarted.value = true;
  isFinished.value = false;
};

const selectTile = (tile) => {
  if (selectedTile.value || isFinished.value) return;
  selectedTile.value = tile;

  if (tile === currentQuestion.value.correct) {
    judgment.value = 'correct';
    combo.value++;
    if (activeMode.value === 'practice') {
      score.value++;
    } else {
      score.value += 100 * combo.value;
    }
  } else {
    judgment.value = 'incorrect';
    combo.value = 0;
    if (activeMode.value === 'survival') {
      lives.value--;
      if (lives.value <= 0) setTimeout(endGame, 1500);
    }
  }
  showExplanation.value = true;
};

const toggleExplanation = () => {
  showExplanation.value = !showExplanation.value;
};

const nextQuestion = () => {
  questionCount.value++;
  currentQuestion.value = generateSingleQuestion(questionCount.value);
  selectedTile.value = null;
  judgment.value = null;
  showExplanation.value = false;
};

// 🟢 中断ボタンからも呼ばれる終了処理
const endGame = () => {
  if (timerId) clearInterval(timerId);
  if (activeMode.value === 'survival' && score.value > highScore.value && score.value > 0) {
    highScore.value = score.value;
    isNewRecord.value = true;
    localStorage.setItem('mahjongHighScore', highScore.value);
  }
  isFinished.value = true;
};

const backToTitle = () => {
  if (timerId) clearInterval(timerId);
  isStarted.value = false;
  isFinished.value = false;
  selectedTile.value = null;
  judgment.value = null;
  showExplanation.value = false;
  activeMode.value = '';
};
</script>

<style scoped>
.mahjong-app { max-width: 800px; margin: 0 auto; text-align: center; font-family: sans-serif; padding: 20px; }

.status-board { background-color: #2c3e50; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.question-header { font-size: 14px; color: #90caf9; margin-bottom: 5px; font-weight: bold; }
.situation-text { font-size: 18px; margin-bottom: 5px; }
.situation-text .highlight { color: #ffca28; font-weight: bold; }
.dora-text { font-size: 16px; color: #e0e0e0; }

.hand-area { display: flex; justify-content: center; gap: 5px; margin-bottom: 20px; flex-wrap: wrap; }
.tile { display: flex; justify-content: center; align-items: center; width: 44px; height: 60px; font-size: 38px; background: linear-gradient(135deg, #ffffff 0%, #f0ebd8 100%); border: 1px solid #dcdcdc; border-radius: 4px; border-right: 2px solid #b5aead; border-bottom: 4px solid #b5aead; box-shadow: 2px 2px 5px rgba(0,0,0,0.3); cursor: pointer; user-select: none; transition: all 0.1s; }
.tile:hover { transform: translateY(-5px); border-bottom: 6px solid #b5aead; box-shadow: 2px 6px 8px rgba(0,0,0,0.2); }
.disabled-tile { pointer-events: none; opacity: 0.8; }
.action-info { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
.toggle-btn { padding: 10px 20px; font-size: 16px; background-color: #1e88e5; color: white; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.2s; }
.toggle-btn:hover { background-color: #1565c0; filter: brightness(1.1); }
.explanation-box { margin-top: 15px; padding: 15px; background-color: #e8f5e9; border: 1px solid #4caf50; border-radius: 8px; text-align: left; line-height: 1.6; white-space: pre-wrap; }
.judgment-mark { font-size: 32px; margin-top: 10px; animation: popIn 0.3s ease-out forwards; }
.correct { color: #d32f2f; }
.incorrect { color: #1976d2; }
@keyframes popIn { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
.result-screen, .start-screen { background-color: #fff9c4; padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-top: 20px; }
.score-text { font-size: 24px; font-weight: bold; margin: 20px 0; line-height: 1.5; }
.score-number { font-size: 48px; color: #e65100; }
.perfect-msg { color: #d32f2f; font-weight: bold; font-size: 20px; animation: popIn 0.5s ease-out forwards; margin-bottom: 20px;}

.game-stats { display: flex; justify-content: space-between; align-items: center; background-color: #333; color: white; padding: 10px 20px; border-radius: 8px; margin-bottom: 20px; font-weight: bold; }
.score-box { font-size: 20px; }
.combo-text { color: #ffeb3b; margin-left: 10px; animation: popIn 0.3s ease-out; display: inline-block; }
.mode-stats { font-size: 20px; letter-spacing: 2px; }
.high-score { font-size: 20px; font-weight: bold; color: #f57c00; margin-bottom: 20px; }
.time-danger { color: #ff5252; animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0.5; } }

/* 🟢 追加：中断ボタンのデザイン */
.quit-btn {
  background-color: #555;
  color: white;
  border: 1px solid #777;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.quit-btn:hover {
  background-color: #e53935;
  border-color: #e53935;
}

.mode-select-container { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
.mode-card { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer; border-left: 6px solid #e53935; transition: transform 0.1s; text-align: left; }
.mode-card:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); background-color: #fffde7; }
.mode-card h3 { margin: 0 0 10px 0; color: #333; font-size: 22px; }
.mode-card p { margin: 0; color: #666; font-size: 14px; }
.mode-card:nth-child(2) { border-left-color: #1e88e5; }
.practice-card { border-left-color: #4caf50; }
</style>
