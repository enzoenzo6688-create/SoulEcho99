// ── FIREBASE ──
firebase.initializeApp({
  apiKey: 'AIzaSyAweHWtgCnW1rgTTmUl7uzrdwIdnJ7jy5M',
  authDomain: 'soulecho-23f2b.firebaseapp.com',
  projectId: 'soulecho-23f2b',
  storageBucket: 'soulecho-23f2b.firebasestorage.app',
  messagingSenderId: '985367696091',
  appId: '1:985367696091:web:14ac4db77b1cadd22972fe'
});
const db = firebase.firestore();
const auth = firebase.auth();

// ── YOUTUBE ──
const YT_KEY = 'AIzaSyAYXt-tYsdu-v_Y0iQI5m_zNEeCTXz3HPU';
async function ytSearch(q) {
  if (!q.trim()) return [];
  try {
    const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&key=' + YT_KEY + '&q=' + encodeURIComponent(q) + '+music';
    const r = await fetch(url);
    const d = await r.json();
    if (d.error) { console.error('YT API:', d.error.message); return []; }
    return (d.items || []).map(v => ({
      name: v.snippet.title.replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
      artist: v.snippet.channelTitle,
      art: v.snippet.thumbnails?.medium?.url || '',
      url: 'https://youtu.be/' + v.id.videoId
    }));
  } catch (e) { return []; }
}

// ── COLOR UTILS ──
function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return `rgba(168,180,255,${alpha})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function colorWithAlpha(color, alpha) {
  if (!color) return `rgba(255,255,255,${alpha})`;
  if (color.startsWith('#')) return hexToRgba(color, alpha);
  if (color.startsWith('rgba')) return color.replace(/,[^,]+\)$/, `,${alpha})`);
  if (color.startsWith('rgb(')) return color.replace('rgb(','rgba(').replace(')',`,${alpha})`);
  return `rgba(255,255,255,${alpha})`;
}

// ── CONSTANTS ──
const emotions = [
  { k: 'family', n: '🏠 家庭', c: '#ff6b6b' },
  { k: 'study',  n: '📚 課業', c: '#5865f2' },
  { k: 'love',   n: '💕 感情', c: '#ff4d8d' },
  { k: 'friend', n: '🤝 友情', c: '#22c55e' },
  { k: 'work',   n: '💼 工作', c: '#f59e0b' },
  { k: 'self',   n: '✨ 自我', c: '#a855f7' },
  { k: 'other',  n: '💭 其他', c: '#888'    }
];
const statuses = ['💬 想聊天', '🆘 需要幫助', '🤝 可以幫忙', '☕ 隨便逛逛', '🔕 請勿打擾'];
const titles = ['新手靈魂', '助人新星', '暖心使者', '互助達人', '靈魂大師', '高級領主'];
const glows = {
  none:   { n: '無光',   c: 'rgba(255,255,255,0.2)', price: 0 },
  cyan:   { n: '青光',   c: '#00e5ff', price: 0 },
  gold:   { n: '金光',   c: '#fbbf24', price: 50 },
  red:    { n: '赤焰',   c: '#ff2442', price: 50 },
  purple: { n: '紫霧',   c: '#a855f7', price: 80 },
  green:  { n: '翠綠',   c: '#22c55e', price: 80 },
  pink:   { n: '玫瑰',   c: '#f472b6', price: 100 },
  silver: { n: '銀河',   c: '#94a3b8', price: 120 },
  orange: { n: '烈日',   c: '#fb923c', price: 120 },
  indigo: { n: '靛藍',   c: '#6366f1', price: 150 },
  teal:   { n: '青玉',   c: '#14b8a6', price: 150 },
  rainbow:{ n: '彩虹',   c: '#fbbf24', price: 300 }
};
const decos = {
  none:      { n: '素顏',   s: '', price: 0 },
  headphone: { n: '耳機',   s: '<path d="M20 50 Q20 14 50 14 Q80 14 80 50" fill="none" stroke="#5865f2" stroke-width="6" stroke-linecap="round"/><rect x="11" y="47" width="13" height="19" rx="5" fill="#5865f2"/><rect x="76" y="47" width="13" height="19" rx="5" fill="#5865f2"/>', price: 0 },
  angel:     { n: '光環',   s: '<ellipse cx="50" cy="8" rx="27" ry="7" fill="none" stroke="#fbbf24" stroke-width="4"/>', price: 0 },
  devil:     { n: '惡魔角', s: '<path d="M24 36 L10 4 L38 28 Z M76 36 L90 4 L62 28 Z" fill="#ff4444"/>', price: 50 },
  cat:       { n: '貓耳',   s: '<path d="M19 43 L11 11 L43 34 Z M81 43 L89 11 L57 34 Z" fill="#aaa"/>', price: 50 },
  sprout:    { n: '嫩芽',   s: '<path d="M50 34 L50 11 Q50 2 66 7" fill="none" stroke="#22c55e" stroke-width="3.5" stroke-linecap="round"/><path d="M50 20 Q38 9 28 18" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>', price: 80 },
  ufo:       { n: '天線',   s: '<line x1="50" y1="34" x2="50" y2="9" stroke="#10b981" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="6" r="5" fill="#ff2442"/>', price: 80 },
  crown:     { n: '皇冠',   s: '<path d="M20 36 L20 20 L35 30 L50 8 L65 30 L80 20 L80 36 Z" fill="#fbbf24"/>', price: 120 },
  star:      { n: '星星',   s: '<path d="M50 5 L54 18 L68 18 L57 26 L61 40 L50 32 L39 40 L43 26 L32 18 L46 18 Z" fill="#fbbf24"/>', price: 120 },
  butterfly: { n: '蝴蝶',   s: '<path d="M50 30 Q30 10 15 20 Q25 35 50 38 Q75 35 85 20 Q70 10 50 30 Z" fill="#f472b6" opacity=".85"/>', price: 150 },
  lightning: { n: '閃電',   s: '<path d="M55 5 L38 35 L52 35 L45 65 L62 28 L48 28 Z" fill="#fbbf24"/>', price: 150 },
  moon:      { n: '月亮',   s: '<path d="M50 5 Q30 5 22 22 Q14 40 25 55 Q36 68 55 65 Q40 60 35 48 Q28 32 38 18 Q44 8 50 5 Z" fill="#e2e8f0"/>', price: 180 },
  sakura:    { n: '櫻花',   s: '<circle cx="50" cy="12" r="5" fill="#ffb7c5"/><circle cx="30" cy="30" r="5" fill="#ffb7c5"/><circle cx="70" cy="30" r="5" fill="#ffb7c5"/><circle cx="36" cy="52" r="5" fill="#ffb7c5"/><circle cx="64" cy="52" r="5" fill="#ffb7c5"/><circle cx="50" cy="34" r="7" fill="#ff9db0"/>', price: 200 },
  flame:     { n: '烈焰',   s: '<path d="M50 65 Q30 50 35 30 Q38 18 50 10 Q45 25 52 28 Q48 15 58 8 Q62 22 55 32 Q65 25 62 40 Q70 30 68 48 Q70 58 50 65 Z" fill="#ff6b35"/>', price: 200 },
  comet:     { n: '☄️彗星', s: '<path d="M50 35 Q30 15 10 25 Q20 32 50 35 Z" fill="#94a3b8"/><circle cx="50" cy="35" r="8" fill="#e2e8f0"/><path d="M55 30 Q70 20 85 28" fill="none" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round"/>', price: 0 }
};

// ── DAILY QUIZ ──
const dailyQuizzes = [
  { q: '今天你最像哪顆星？', options: [
    { text: '🌟 耀眼的明星', emo: 'self' },
    { text: '🌑 安靜的暗星', emo: 'other' },
    { text: '💫 流浪的彗星', emo: 'friend' },
    { text: '🌈 彩色的星雲', emo: 'love' }
  ]},
  { q: '現在的你需要什麼？', options: [
    { text: '🤗 一個擁抱', emo: 'family' },
    { text: '👂 有人聆聽', emo: 'self' },
    { text: '💪 加油打氣', emo: 'study' },
    { text: '🎵 一首好歌', emo: 'other' }
  ]},
  { q: '你今天的能量是？', options: [
    { text: '🔥 滿格衝刺', emo: 'work' },
    { text: '🌊 隨波逐流', emo: 'other' },
    { text: '🌱 緩慢生長', emo: 'self' },
    { text: '❄️ 需要充電', emo: 'friend' }
  ]}
];

const EMOJI_REACTIONS = ['❤️', '👀', '💀', '🫂', '🔥', '😭', '✨', '💯'];

function getEmo(k) { return emotions.find(e => e.k === k) || null; }

function drawAvatar(g = 'none', d = 'none', size = '100%') {
  const gc = (glows[g] || glows.none).c;
  const ds = (decos[d] || decos.none).s;
  const id = (g||'x') + (d||'x') + (Math.random()*9999|0);
  return `<svg viewBox="-12 -24 124 136" xmlns="http://www.w3.org/2000/svg" style="width:${size};height:${size};overflow:visible;">
    <defs>
      <filter id="f${id}"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <clipPath id="c${id}"><circle cx="50" cy="50" r="46"/></clipPath>
    </defs>
    <circle cx="50" cy="50" r="48" fill="rgba(20,20,40,0.9)" stroke="${gc}" stroke-width="5" filter="url(#f${id})"/>
    <g clip-path="url(#c${id})">
      <rect width="100" height="100" fill="#1a1a2e"/>
      <circle cx="50" cy="40" r="22" fill="#2a2a4e"/>
      <ellipse cx="50" cy="92" rx="34" ry="26" fill="#2a2a4e"/>
    </g>
    <g>${ds}</g>
  </svg>`;
}

// ── STATE ──
let myUid = null, myData = {};
let otherUsers = {};
let currentRoom = 'lobby';
let myX = 0, myY = 0, myVx = 0, myVy = 0;
let targetX = null, targetY = null;
let selectedEmotion = '', selectedMusic = null, musicSearchTimer = null;
let myFriends = new Set(), incomingReqs = [], currentFTab = 'friends', toastTimer = null;
let chatTargetUid = null, chatUnsub = null, typingTimer = null;
let pendingRewardHelperUid = null;
let canvas, ctx, W, H;
let bgStars = [], shootingStars = [], wishStars = [], sparks = [], lightWaves = [];
let blackHole = null, blackHoleTimer = 300;
let cosmosHue = 240;
let starBits = [];
let floatingEmojis = [];
let floatingMessages = [];
let weeklyTop = [];
let usersUnsub = null;
let lastLogin = localStorage.getItem('se_last_login');
let loginStreakDays = parseInt(localStorage.getItem('se_streak') || '0');
let quizAnswered = localStorage.getItem('se_quiz_' + new Date().toDateString());
let matchedUid = null;

// ── INIT ──
auth.onAuthStateChanged(user => {
  if (user) {
    myUid = user.uid;
    document.getElementById('login-screen').style.display = 'none';
    initUser(user);
  } else {
    auth.signInAnonymously().catch(() => {
      document.getElementById('login-content').innerHTML =
        '<button onclick="auth.signInAnonymously()" style="padding:14px 28px;background:#fff;color:#222;border:none;border-radius:16px;font-size:15px;font-weight:800;cursor:pointer;font-family:Outfit,sans-serif;">點我進入</button>';
    });
  }
});

async function initUser(user) {
  const ref = db.collection('users').doc(myUid);
  const snap = await ref.get();
  const def = {
    name: '匿名靈魂', glow: 'cyan', deco: 'headphone',
    status: '💬 想聊天', helped: 0, received: 0, coins: 0,
    igHandle: '', bubble: '', emotion: '',
    musicUrl: '', musicName: '', musicArt: '',
    ownedGlows: ['none', 'cyan'], ownedDecos: ['none', 'headphone', 'angel'],
    firstHelpDone: false, invitedBy: null, chatted: [], starBitsCollected: 0
  };
  const isNew = !snap.exists;
  myData = snap.exists ? { ...def, ...snap.data() } : { ...def };
  if (isNew) myData.coins = 100;
  await ref.set({ ...myData, lastSeen: firebase.firestore.FieldValue.serverTimestamp(), uid: myUid, room: 'lobby' }, { merge: true });
  if (isNew) showToast({ av: '🎉', title: '歡迎加入 SoulEcho！', sub: '首次加入獲得 🪙 100 代幣', btns: '' });

  initCanvas();
  initBgStars();
  spawnStarBits();
  syncUI();
  joinRoom('lobby');
  listenFriendRequests();
  listenChats();
  listenBroadcast();
  listenReactions();
  listenWallMessages();
  checkDailyLogin();
  fetchWeeklyTop();
  checkInviteParam();
  requestAnimationFrame(gameLoop);

  // Show daily quiz after 2s if not answered today
  if (!quizAnswered) setTimeout(showDailyQuiz, 2000);

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

async function logout() {
  if (!confirm('確定登出？')) return;
  await db.collection('users').doc(myUid).update({ lastSeen: new Date(0), room: '' });
  await auth.signOut(); location.reload();
}

// ── CANVAS ──
function initCanvas() {
  canvas = document.getElementById('space-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('dblclick', e => {
    const dx = e.clientX - myX, dy = e.clientY - myY;
    if (Math.sqrt(dx*dx+dy*dy) < 50) spawnLightWave(myX, myY);
  });
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    spawnWishStar(e.clientX, e.clientY);
  });
  window.addEventListener('keydown', e => { if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); shakeExplosion(); } });
  let pressTimer = null;
  canvas.addEventListener('touchstart', e => {
    pressTimer = setTimeout(() => { const t = e.touches[0]; spawnWishStar(t.clientX, t.clientY); }, 600);
  }, { passive: true });
  canvas.addEventListener('touchend', e => {
    clearTimeout(pressTimer);
    e.preventDefault();
    const t = e.changedTouches[0];
    onCanvasClick({ clientX: t.clientX, clientY: t.clientY });
  }, { passive: false });
  canvas.addEventListener('touchmove', () => clearTimeout(pressTimer), { passive: true });
  if (window.DeviceMotionEvent) {
    let lastAcc = null;
    window.addEventListener('devicemotion', e => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      if (lastAcc) {
        const delta = Math.abs(a.x-lastAcc.x)+Math.abs(a.y-lastAcc.y)+Math.abs(a.z-lastAcc.z);
        if (delta > 40) shakeExplosion();
      }
      lastAcc = { x: a.x, y: a.y, z: a.z };
    });
  }
}

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  if (!myX) { myX = W/2; myY = H/2; }
  initBgStars();
}

function initBgStars() {
  bgStars = [];
  for (let i = 0; i < 300; i++) bgStars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.2+0.2, speed: Math.random()*0.008+0.002, phase: Math.random()*Math.PI*2, type:'dot' });
  for (let i = 0; i < 40; i++) bgStars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*2.5+1, speed: Math.random()*0.005+0.001, phase: Math.random()*Math.PI*2, type:'glow' });
  for (let i = 0; i < 60; i++) bgStars.push({ x: Math.random()*W, y: Math.random()*H, r: 0.5, speed: Math.random()*0.003+0.001, phase: Math.random()*Math.PI*2, type:'dust', vx:(Math.random()-0.5)*0.15, vy:(Math.random()-0.5)*0.15 });
}

// ── STAR BITS ──
function spawnStarBits() {
  starBits = [];
  for (let i = 0; i < 20; i++) {
    starBits.push({
      x: Math.random()*W, y: Math.random()*(H-150)+60,
      phase: Math.random()*Math.PI*2,
      collected: false,
      color: ['#ffd700','#00e5ff','#f472b6','#22c55e','#a855f7'][Math.floor(Math.random()*5)]
    });
  }
}

function collectStarBits() {
  let collected = 0;
  starBits = starBits.filter(b => {
    if (b.collected) return false;
    const dx = myX - b.x, dy = myY - b.y;
    if (Math.sqrt(dx*dx+dy*dy) < 30) {
      collected++;
      b.collected = true;
      // Fly toward me effect
      sparks.push({ x: b.x, y: b.y, vx: dx/10, vy: dy/10, r: 3, life: 1, color: b.color });
      return false;
    }
    return true;
  });
  if (collected > 0) {
    const reward = collected;
    myData.coins = (myData.coins||0) + reward;
    myData.starBitsCollected = (myData.starBitsCollected||0) + reward;
    db.collection('users').doc(myUid).update({ coins: firebase.firestore.FieldValue.increment(reward), starBitsCollected: firebase.firestore.FieldValue.increment(reward) });
    syncUI();
    popCoin(`+${reward} 🌟`);
  }
  // Respawn if all collected
  if (starBits.length === 0) setTimeout(spawnStarBits, 5000);
}

// ── GAME LOOP ──
function gameLoop() {
  requestAnimationFrame(gameLoop);
  update();
  render();
}

function update() {
  if (targetX !== null) {
    const dx = targetX-myX, dy = targetY-myY, dist = Math.sqrt(dx*dx+dy*dy);
    if (dist < 4) { targetX = null; targetY = null; myVx *= 0.8; myVy *= 0.8; }
    else { const speed = Math.min(4, dist*0.08); myVx = (dx/dist)*speed; myVy = (dy/dist)*speed; }
  } else { myVx *= 0.88; myVy *= 0.88; }
  myX = Math.max(30, Math.min(W-30, myX+myVx));
  myY = Math.max(60, Math.min(H-80, myY+myVy));

  // Collect star bits
  collectStarBits();

  for (const u of Object.values(otherUsers)) {
    if (!u.vx) { u.vx=(Math.random()-0.5)*0.4; u.vy=(Math.random()-0.5)*0.4; }
    u.vx += (Math.random()-0.5)*0.05; u.vy += (Math.random()-0.5)*0.05;
    u.vx = Math.max(-0.8, Math.min(0.8, u.vx)); u.vy = Math.max(-0.8, Math.min(0.8, u.vy));
    u.x = Math.max(30, Math.min(W-30, u.x+u.vx)); u.y = Math.max(60, Math.min(H-80, u.y+u.vy));
    u.glowPhase = (u.glowPhase||0) + 0.04;
    if (u.lightTimer > 0) u.lightTimer -= 0.02;
  }

  // Shooting stars
  if (shootingStars.length < 8 && Math.random() < 0.025) {
    const fromLeft = Math.random() > 0.5;
    shootingStars.push({ x: fromLeft?-20:W+20, y: Math.random()*H*0.7, vx: fromLeft?(7+Math.random()*7):-(7+Math.random()*7), vy:(Math.random()-0.3)*3, len:140+Math.random()*80, life:1, color:['#fff','#ffd700','#d8a8ff','#a8d8ff'][Math.floor(Math.random()*4)] });
  }
  shootingStars = shootingStars.filter(s => { s.x+=s.vx; s.y+=s.vy; s.life-=0.018; return s.life>0&&s.x>-200&&s.x<W+200; });

  // Black hole
  blackHoleTimer--;
  if (blackHoleTimer <= 0) {
    blackHoleTimer = 1800+Math.random()*1800;
    blackHole = { x:W*0.15+Math.random()*W*0.7, y:H*0.2+Math.random()*H*0.5, r:0, maxR:40+Math.random()*30, life:600, phase:0 };
  }
  if (blackHole) {
    blackHole.life--; blackHole.phase+=0.05;
    blackHole.r = Math.min(blackHole.maxR, blackHole.r+0.5);
    const pull = 0.25;
    const bdx=blackHole.x-myX, bdy=blackHole.y-myY, bdist=Math.sqrt(bdx*bdx+bdy*bdy);
    if (bdist<200&&bdist>blackHole.r+20) { myVx+=(bdx/bdist)*pull; myVy+=(bdy/bdist)*pull; }
    for (const u of Object.values(otherUsers)) {
      const udx=blackHole.x-u.x, udy=blackHole.y-u.y, udist=Math.sqrt(udx*udx+udy*udy);
      if (udist<200&&udist>blackHole.r+20) { u.vx+=(udx/udist)*pull*0.5; u.vy+=(udy/udist)*pull*0.5; }
    }
    if (blackHole.life<=0) blackHole=null;
  }

  cosmosHue = (cosmosHue+0.015)%360;

  // Collision sparks
  for (const u of Object.values(otherUsers)) {
    const dx=u.x-myX, dy=u.y-myY;
    if (Math.sqrt(dx*dx+dy*dy)<35) spawnSparks((myX+u.x)/2,(myY+u.y)/2);
  }

  sparks = sparks.filter(s => { s.x+=s.vx; s.y+=s.vy; s.vy+=0.08; s.life-=0.035; return s.life>0; });
  wishStars = wishStars.filter(w => { w.life-=0.004; w.phase+=0.08; return w.life>0; });
  lightWaves = lightWaves.filter(w => { w.r+=5; w.life-=0.03; return w.life>0; });
  floatingEmojis = floatingEmojis.filter(e => { e.x+=e.vx; e.y+=e.vy; e.vy-=0.05; e.life-=0.02; e.scale=Math.min(1, e.scale+0.05); return e.life>0; });
  floatingMessages = floatingMessages.filter(m => { m.life-=0.003; m.y-=0.2; return m.life>0; });

  bgStars.forEach(s => { if(s.type==='dust'){s.x+=s.vx;s.y+=s.vy;if(s.x<0)s.x=W;if(s.x>W)s.x=0;if(s.y<0)s.y=H;if(s.y>H)s.y=0;} s.phase+=s.speed; });

  if (!update._tick) update._tick=0;
  update._tick++;
  if (update._tick%90===0&&myUid) db.collection('users').doc(myUid).update({ lastSeen:firebase.firestore.FieldValue.serverTimestamp() }).catch(()=>{});
}

// ── RENDER ──
function render() {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,W,H);

  // Animated nebula
  const t = Date.now()/8000;
  const nebulaPoints = [
    [W*0.25,H*0.35,W*0.55,`hsla(${cosmosHue},70%,50%,0.06)`],
    [W*0.75,H*0.6, W*0.45,`hsla(${(cosmosHue+60)%360},60%,50%,0.05)`],
    [W*0.5, H*0.2, W*0.3, `hsla(${(cosmosHue+120)%360},70%,60%,0.04)`],
    [W*0.1, H*0.8, W*0.35,`hsla(${(cosmosHue+180)%360},60%,50%,0.04)`],
    [W*0.9, H*0.2, W*0.3, `hsla(${(cosmosHue+240)%360},60%,50%,0.04)`]
  ];
  nebulaPoints.forEach(([nx,ny,nr,nc],i) => {
    const ox=Math.sin(t+i)*30, oy=Math.cos(t+i*1.3)*20;
    const ng=ctx.createRadialGradient(nx+ox,ny+oy,0,nx+ox,ny+oy,nr);
    ng.addColorStop(0,nc); ng.addColorStop(1,'transparent');
    ctx.fillStyle=ng; ctx.fillRect(0,0,W,H);
  });

  // Background stars
  bgStars.forEach(s => {
    const b = 0.3+0.7*(0.5+0.5*Math.sin(s.phase));
    if (s.type==='glow') {
      ctx.shadowColor=`hsl(${cosmosHue},80%,80%)`; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r*b,0,Math.PI*2);
      ctx.fillStyle=`rgba(200,220,255,${b*0.9})`; ctx.fill();
      ctx.shadowBlur=0;
    } else if (s.type==='dust') {
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(168,180,255,${b*0.3})`; ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${b*0.7})`; ctx.fill();
    }
  });

  // Shooting stars
  shootingStars.forEach(s => {
    const ex = s.vx>0 ? s.x-s.len : s.x+s.len;
    const ey = s.y - (s.vy/Math.abs(s.vx||1))*s.len;
    const grad = ctx.createLinearGradient(s.x,s.y,ex,ey);
    grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
    grad.addColorStop(0.3, colorWithAlpha(s.color, s.life*0.6));
    grad.addColorStop(1,'transparent');
    ctx.shadowColor=s.color||'#fff'; ctx.shadowBlur=8;
    ctx.strokeStyle=grad; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(ex,ey); ctx.stroke();
    ctx.beginPath(); ctx.arc(s.x,s.y,2.5,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,255,255,${s.life})`; ctx.fill();
    ctx.shadowBlur=0;
  });

  // Star Bits
  starBits.forEach(b => {
    const pulse = 0.7+0.3*Math.sin(b.phase+Date.now()/400);
    ctx.shadowColor=b.color; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.arc(b.x,b.y,5*pulse,0,Math.PI*2);
    ctx.fillStyle=b.color; ctx.fill();
    // 4-point sparkle
    ctx.strokeStyle=`rgba(255,255,255,0.7)`; ctx.lineWidth=1;
    const sz=8*pulse;
    ctx.beginPath(); ctx.moveTo(b.x-sz,b.y); ctx.lineTo(b.x+sz,b.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x,b.y-sz); ctx.lineTo(b.x,b.y+sz); ctx.stroke();
    ctx.shadowBlur=0;
    b.phase+=0.05;
  });

  // Wish stars
  wishStars.forEach(w => {
    ctx.save(); ctx.translate(w.x,w.y);
    const sz=7+3*Math.sin(w.phase);
    ctx.shadowColor='#ffd700'; ctx.shadowBlur=20;
    for (let i=0;i<5;i++) {
      ctx.save(); ctx.rotate((i/5)*Math.PI*2+w.phase*0.3);
      ctx.beginPath(); ctx.moveTo(0,-sz); ctx.lineTo(sz*0.3,0); ctx.lineTo(0,-sz*0.4); ctx.lineTo(-sz*0.3,0); ctx.closePath();
      ctx.fillStyle=`rgba(255,215,0,${w.life*0.9})`; ctx.fill();
      ctx.restore();
    }
    ctx.shadowBlur=0; ctx.restore();
  });

  // Light waves
  lightWaves.forEach(w => {
    for (let i=0;i<3;i++) {
      ctx.beginPath(); ctx.arc(w.x,w.y,w.r*(1-i*0.2),0,Math.PI*2);
      ctx.strokeStyle=`rgba(168,180,255,${w.life*(0.5-i*0.12)})`; ctx.lineWidth=2-i*0.5; ctx.stroke();
    }
  });

  // Sparks
  sparks.forEach(s => {
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2);
    ctx.fillStyle = s.color ? colorWithAlpha(s.color, s.life) : `rgba(255,200,80,${s.life})`;
    ctx.fill();
  });

  // Black hole
  if (blackHole) {
    ctx.save(); ctx.translate(blackHole.x,blackHole.y);
    for (let i=0;i<4;i++) {
      ctx.beginPath(); ctx.arc(0,0,blackHole.r+i*14,0,Math.PI*2);
      ctx.strokeStyle=`hsla(${(cosmosHue+i*30)%360},80%,60%,${0.35-i*0.07})`; ctx.lineWidth=3-i*0.5; ctx.stroke();
    }
    const bhg=ctx.createRadialGradient(0,0,0,0,0,blackHole.r);
    bhg.addColorStop(0,'rgba(0,0,0,1)'); bhg.addColorStop(0.8,'rgba(10,0,20,0.95)'); bhg.addColorStop(1,'transparent');
    ctx.fillStyle=bhg; ctx.beginPath(); ctx.arc(0,0,blackHole.r,0,Math.PI*2); ctx.fill();
    ctx.rotate(blackHole.phase);
    ctx.beginPath(); ctx.ellipse(0,0,blackHole.r*2,blackHole.r*0.5,0,0,Math.PI*2);
    ctx.strokeStyle=`hsla(${cosmosHue},80%,60%,0.4)`; ctx.lineWidth=2; ctx.stroke();
    ctx.restore();
  }

  // Constellation lines
  const allU=[...Object.entries(otherUsers).map(([,u])=>({x:u.x,y:u.y})),{x:myX,y:myY}];
  for (let i=0;i<allU.length;i++) for (let j=i+1;j<allU.length;j++) {
    const dx=allU[i].x-allU[j].x, dy=allU[i].y-allU[j].y, dist=Math.sqrt(dx*dx+dy*dy);
    if (dist<180) { ctx.beginPath(); ctx.moveTo(allU[i].x,allU[i].y); ctx.lineTo(allU[j].x,allU[j].y); ctx.strokeStyle=`rgba(168,180,255,${0.15*(1-dist/180)})`; ctx.lineWidth=1; ctx.stroke(); }
  }

  // Other users
  for (const [,u] of Object.entries(otherUsers)) drawStar(u.x,u.y,u.data,false,u.glowPhase,u.lightTimer>0);

  // Me
  drawStar(myX,myY,myData,true,Date.now()/500,false);

  // Floating emojis
  floatingEmojis.forEach(e => {
    ctx.save(); ctx.globalAlpha=e.life; ctx.font=`${Math.round(20*e.scale)}px serif`;
    ctx.textAlign='center'; ctx.fillText(e.emoji,e.x,e.y); ctx.restore();
  });

  // Floating wall messages
  floatingMessages.forEach(m => {
    if (!m.uid) return;
    const u=otherUsers[m.uid]||(m.uid===myUid?{x:myX,y:myY}:null);
    if (!u) return;
    ctx.save(); ctx.globalAlpha=m.life;
    const bw=Math.min(ctx.measureText(m.text).width*1.2+20,160);
    ctx.fillStyle='rgba(20,10,40,0.85)';
    roundRectPath(ctx,u.x-bw/2,u.y-90,bw,24,8); ctx.fill();
    ctx.font='600 10px Outfit,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.textAlign='center';
    const short=m.text.length>20?m.text.slice(0,19)+'…':m.text;
    ctx.fillText(short, u.x, u.y-73);
    ctx.restore();
  });

  // Weekly top banner
  if (weeklyTop.length>0) {
    ctx.save(); ctx.globalAlpha=0.6;
    ctx.font='700 11px Outfit,sans-serif'; ctx.fillStyle='#ffd700'; ctx.textAlign='center';
    const topText='🏆 ' + weeklyTop.slice(0,3).map((t,i)=>['🥇','🥈','🥉'][i]+t.name).join('  ');
    ctx.fillText(topText, W/2, H-20);
    ctx.restore();
  }
}

function drawStar(x, y, data, isMe, phase, isLit) {
  const emo = getEmo(data.emotion);
  const starColor = emo ? emo.c : (glows[data.glow]||glows.none).c;
  const pulseR = 22+4*Math.sin(phase);
  const needHelp = data.status==='🆘 需要幫助';
  ctx.save(); ctx.translate(x,y);
  ctx.shadowColor=starColor; ctx.shadowBlur=isLit?45:(isMe?28:20);
  ctx.beginPath(); ctx.arc(0,0,pulseR*0.72,0,Math.PI*2);
  ctx.fillStyle=isMe?starColor:(isLit?'#fff':starColor);
  ctx.globalAlpha=isLit?1:(isMe?1:0.88); ctx.fill();
  ctx.shadowBlur=0; ctx.globalAlpha=1;
  if (needHelp) {
    const ringR=pulseR+8+4*Math.abs(Math.sin(phase));
    ctx.beginPath(); ctx.arc(0,0,ringR,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,36,66,0.65)'; ctx.lineWidth=2.5; ctx.stroke();
  }
  if (isMe) {
    ctx.beginPath(); ctx.arc(0,0,pulseR*0.72+5,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.45)'; ctx.lineWidth=1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.font=`700 ${isMe?12:11}px Outfit,sans-serif`; ctx.fillStyle='#fff'; ctx.textAlign='center';
  ctx.shadowColor='rgba(0,0,0,0.9)'; ctx.shadowBlur=5;
  ctx.fillText(data.name||'靈魂', 0, -pulseR-8); ctx.shadowBlur=0;
  if (emo) { ctx.font='600 9px Outfit,sans-serif'; ctx.fillStyle=emo.c; ctx.fillText(emo.n,0,-pulseR-20); }
  if (data.bubble) {
    const bw=Math.min(ctx.measureText(data.bubble).width*1.1+16,145);
    ctx.fillStyle='rgba(15,15,30,0.88)';
    roundRectPath(ctx,-bw/2,-pulseR-54,bw,23,7); ctx.fill();
    ctx.font='600 10px Outfit,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.82)';
    const t=data.bubble.length>18?data.bubble.slice(0,17)+'…':data.bubble;
    ctx.fillText(t,0,-pulseR-37);
  }
  if (data.musicName) {
    ctx.fillStyle='rgba(29,185,84,0.92)';
    roundRectPath(ctx,-52,pulseR+10,104,19,9); ctx.fill();
    ctx.font='700 9px Outfit,sans-serif'; ctx.fillStyle='#fff';
    const mn=data.musicName.length>14?data.musicName.slice(0,13)+'…':data.musicName;
    ctx.fillText('🎵 '+mn,0,pulseR+24);
  }
  ctx.restore();
}

function roundRectPath(ctx,x,y,w,h,r) {
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

// ── CLICK ──
function onCanvasClick(e) {
  const cx=e.clientX, cy=e.clientY;
  for (const [uid,u] of Object.entries(otherUsers)) {
    const dx=cx-u.x, dy=cy-u.y;
    if (Math.sqrt(dx*dx+dy*dy)<32) { showStarPopup(uid,u); return; }
  }
  document.getElementById('star-popup').style.display='none';
  targetX=cx; targetY=cy;
}

// ── DAILY QUIZ ──
function showDailyQuiz() {
  const quiz = dailyQuizzes[Math.floor(Math.random()*dailyQuizzes.length)];
  const modal = document.createElement('div');
  modal.id = 'quiz-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="background:#0f0f1e;border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:28px 22px;width:100%;max-width:340px;text-align:center;">
      <div style="font-size:28px;margin-bottom:12px;">🌌</div>
      <div style="font-size:16px;font-weight:900;margin-bottom:6px;">每日靈魂測驗</div>
      <div style="font-size:14px;color:#888;margin-bottom:20px;">${quiz.q}</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${quiz.options.map((o,i) => `
          <button onclick="answerQuiz('${o.emo}',this)" style="padding:13px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);border-radius:14px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:Outfit,sans-serif;transition:all .2s;" onmouseover="this.style.background='rgba(255,255,255,.12)'" onmouseout="this.style.background='rgba(255,255,255,.06)'">${o.text}</button>
        `).join('')}
      </div>
      <button onclick="document.getElementById('quiz-modal').remove()" style="margin-top:14px;background:none;border:none;color:#555;font-size:13px;cursor:pointer;font-family:Outfit,sans-serif;">跳過</button>
    </div>`;
  document.body.appendChild(modal);
}

function answerQuiz(emo, btn) {
  const modal = document.getElementById('quiz-modal');
  // Highlight answer
  btn.style.borderColor = (getEmo(emo)||{c:'#fff'}).c;
  btn.style.background = colorWithAlpha((getEmo(emo)||{c:'#5865f2'}).c, 0.2);
  // Give coin reward
  myData.coins = (myData.coins||0)+5;
  db.collection('users').doc(myUid).update({ coins: firebase.firestore.FieldValue.increment(5) });
  syncUI(); popCoin('+5 🪙');
  localStorage.setItem('se_quiz_'+new Date().toDateString(), emo);
  quizAnswered = emo;
  setTimeout(() => {
    modal.remove();
    showToast({ av:'🌌', title:'靈魂已記錄', sub:'今日測驗完成 +🪙5', btns:'' });
  }, 800);
}

// ── SOUL MATCH ──
async function findSoulMatch() {
  const since = new Date(Date.now()-5*60*1000);
  const snap = await db.collection('users').where('room','==',currentRoom).where('lastSeen','>',since).get();
  const candidates = snap.docs.filter(d => d.id!==myUid && d.data().emotion===myData.emotion);
  if (!candidates.length) { showToast({av:'🌌',title:'宇宙正在尋找...',sub:'目前沒有相同情緒的靈魂，稍後再試',btns:''}); return; }
  const match = candidates[Math.floor(Math.random()*candidates.length)].data();
  matchedUid = match.uid;
  const modal = document.createElement('div');
  modal.id = 'match-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="background:#0f0f1e;border:1.5px solid rgba(168,85,247,.4);border-radius:24px;padding:28px 22px;width:100%;max-width:320px;text-align:center;animation:popIn .3s cubic-bezier(.32,.72,0,1)">
      <div style="font-size:36px;margin-bottom:8px;">✨</div>
      <div style="font-size:13px;color:#a855f7;font-weight:700;letter-spacing:1px;margin-bottom:4px;">宇宙覺得你們有緣</div>
      <div style="font-size:20px;font-weight:900;margin-bottom:6px;">${match.name}</div>
      <div style="margin-bottom:16px;">${drawAvatar(match.glow,match.deco,'70px')}</div>
      ${match.bubble?`<div style="font-size:12px;color:#888;margin-bottom:16px;">"${match.bubble}"</div>`:''}
      <div style="display:flex;gap:10px;justify-content:center;">
        <button onclick="openChat('${match.uid}','${match.name}','${match.glow}','${match.deco}');document.getElementById('match-modal').remove()" style="padding:12px 20px;background:#5865f2;border:none;border-radius:12px;color:#fff;font-size:13px;font-weight:800;cursor:pointer;font-family:Outfit,sans-serif;">💬 打個招呼</button>
        <button onclick="document.getElementById('match-modal').remove()" style="padding:12px 16px;background:rgba(255,255,255,.08);border:none;border-radius:12px;color:#aaa;font-size:13px;cursor:pointer;font-family:Outfit,sans-serif;">略過</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

// ── EMOJI REACTIONS ──
function sendEmojiTo(uid, emoji) {
  const u = otherUsers[uid];
  if (!u) return;
  // Animate toward target
  floatingEmojis.push({ x:myX, y:myY, tx:u.x, ty:u.y, emoji, vx:(u.x-myX)/30, vy:(u.y-myY)/30, life:1, scale:0 });
  // Save to Firestore
  db.collection('reactions').add({ to:uid, from:myUid, fromName:myData.name, emoji, ts:firebase.firestore.FieldValue.serverTimestamp() });
  closeStarPopup();
}

function listenReactions() {
  db.collection('reactions').where('to','==',myUid).where('ts','>',new Date(Date.now()-5000)).onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if (ch.type==='added') {
        const d=ch.doc.data();
        // Show emoji on my star
        floatingEmojis.push({ x:myX-40+Math.random()*80, y:myY-60, emoji:d.emoji, vx:(Math.random()-0.5)*0.5, vy:-1.5, life:1, scale:0 });
        showToast({ av:d.emoji, title:d.fromName||'某個靈魂', sub:'對你送出了 '+d.emoji, btns:'' });
      }
    });
  });
}

// ── STAR WALL MESSAGES ──
async function sendWallMessage(toUid, text) {
  await db.collection('wallMessages').add({ to:toUid, from:myUid, fromName:myData.name, text, ts:firebase.firestore.FieldValue.serverTimestamp() });
  showToast({ av:'💌', title:'留言已送出', sub:'對方下次上線就會看到', btns:'' });
}

function listenWallMessages() {
  db.collection('wallMessages').where('to','==',myUid).where('ts','>',new Date(Date.now()-3600000)).onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if (ch.type==='added') {
        const d=ch.doc.data();
        floatingMessages.push({ uid:myUid, text:d.text, life:1, y:myY });
        showToast({ av:'💌', title:d.fromName+'留言給你', sub:d.text, btns:'' });
      }
    });
  });
}

// ── WEEKLY TOP ──
async function fetchWeeklyTop() {
  try {
    const snap = await db.collection('users').orderBy('helped','desc').limit(5).get();
    weeklyTop = snap.docs.map(d=>({name:d.data().name, helped:d.data().helped||0})).filter(u=>u.helped>0);
  } catch(e) {}
  setTimeout(fetchWeeklyTop, 5*60*1000);
}

// ── BROADCAST ──
function listenBroadcast() {
  db.collection('broadcasts').orderBy('ts','desc').limit(1).onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if (ch.type==='added') {
        const d=ch.doc.data();
        if (Date.now()-(d.ts?.seconds||0)*1000<10000) showMeteor(d.text,d.fromName);
      }
    });
  });
}
async function sendBroadcast() {
  const text=document.getElementById('broadcast-inp').value.trim();
  if (!text) return;
  document.getElementById('broadcast-inp').value='';
  await db.collection('broadcasts').add({ text, fromUid:myUid, fromName:myData.name, ts:firebase.firestore.FieldValue.serverTimestamp() });
  closePanel('broadcast-panel');
}
function showMeteor(text, name) {
  const container=document.getElementById('meteor-container');
  const el=document.createElement('div');
  el.className='meteor-text';
  el.textContent=`✦ ${name}：${text}`;
  const y=60+Math.random()*(H*0.35), dur=7+Math.random()*4;
  el.style.cssText=`top:${y}px;animation-duration:${dur}s;`;
  container.appendChild(el);
  setTimeout(()=>el.remove(),(dur+1)*1000);
}

// ── EFFECTS ──
function spawnLightWave(x,y) {
  lightWaves.push({x,y,r:10,life:1});
  db.collection('effects').add({ type:'wave', x, y, fromUid:myUid, ts:firebase.firestore.FieldValue.serverTimestamp() }).catch(()=>{});
}
function spawnWishStar(x,y) {
  wishStars.push({x,y,life:1,phase:Math.random()*Math.PI*2});
  showToast({av:'⭐',title:'許願星種下了！',sub:'它會閃耀 30 秒',btns:''});
}
function spawnSparks(x,y) {
  if (sparks.length>40||Math.random()>0.1) return;
  for(let i=0;i<5;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*2;sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-0.5,r:Math.random()*2+0.5,life:1});}
}
function shakeExplosion() {
  for(const u of Object.values(otherUsers)){const dx=u.x-myX,dy=u.y-myY,d=Math.sqrt(dx*dx+dy*dy)||1;u.vx+=(dx/d)*9;u.vy+=(dy/d)*9;}
  spawnLightWave(myX,myY);
  for(let i=0;i<25;i++){const a=Math.random()*Math.PI*2,s=3+Math.random()*5;sparks.push({x:myX,y:myY,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2.5,life:1});}
  showToast({av:'💥',title:'星塵爆炸！',sub:'附近的靈魂都感受到了',btns:''});
}
async function sendLight(toUid) {
  if (otherUsers[toUid]) otherUsers[toUid].lightTimer=3;
  const u=otherUsers[toUid];
  if (u){const b=document.createElement('div');b.style.cssText=`position:fixed;left:${u.x}px;top:${u.y}px;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(255,235,100,.8),transparent);transform:translate(-50%,-50%);pointer-events:none;z-index:99998;animation:lightBurst .6s ease-out forwards;`;document.body.appendChild(b);setTimeout(()=>b.remove(),700);}
  await db.collection('lights').add({to:toUid,from:myUid,ts:firebase.firestore.FieldValue.serverTimestamp()});
  showToast({av:'✨',title:'送光成功！',sub:'對方感受到你的溫暖了',btns:''});
}
function listenLights() {
  db.collection('lights').where('to','==',myUid).where('ts','>',new Date(Date.now()-5000)).onSnapshot(snap=>{
    snap.docChanges().forEach(ch=>{
      if(ch.type==='added'){
        const b=document.createElement('div');b.style.cssText=`position:fixed;left:${myX}px;top:${myY}px;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(255,235,100,.8),transparent);transform:translate(-50%,-50%);pointer-events:none;z-index:99998;animation:lightBurst .6s ease-out forwards;`;document.body.appendChild(b);setTimeout(()=>b.remove(),700);
        showToast({av:'✨',title:'有人送你一道光',sub:'感受到了嗎？',btns:''});
      }
    });
  });
}
function checkDailyLogin() {
  const today=new Date().toDateString(), yesterday=new Date(Date.now()-86400000).toDateString();
  if (lastLogin!==today) {
    loginStreakDays = lastLogin===yesterday ? loginStreakDays+1 : 1;
    localStorage.setItem('se_last_login',today); localStorage.setItem('se_streak',loginStreakDays);
    const reward=loginStreakDays>=7?30:10;
    setTimeout(()=>{
      myData.coins=(myData.coins||0)+reward;
      db.collection('users').doc(myUid).update({coins:firebase.firestore.FieldValue.increment(reward)});
      syncUI();
      shootingStars.push({x:-50,y:80,vx:14,vy:5,len:180,life:1,color:'#ffd700'});
      showToast({av:'🌠',title:`每日流星獎勵 +🪙${reward}`,sub:loginStreakDays>=7?`連續 ${loginStreakDays} 天！`:  `連續登入第 ${loginStreakDays} 天`,btns:''});
      if(loginStreakDays>=7&&!myData.ownedDecos?.includes('comet')){myData.ownedDecos=[...(myData.ownedDecos||[]),'comet'];db.collection('users').doc(myUid).update({ownedDecos:firebase.firestore.FieldValue.arrayUnion('comet')});showToast({av:'☄️',title:'解鎖彗星頭飾！',sub:'7天連續登入限定獎勵',btns:''});}
    },2500);
  }
}
db.collection('effects').where('ts','>',new Date(Date.now()-5000)).onSnapshot(snap=>{snap.docChanges().forEach(ch=>{if(ch.type==='added'&&ch.doc.data().fromUid!==myUid)lightWaves.push({x:ch.doc.data().x,y:ch.doc.data().y,r:10,life:1});});});

// ── ROOM SYSTEM ──
async function joinRoom(roomId) {
  currentRoom=roomId;
  if (usersUnsub) usersUnsub();
  await db.collection('users').doc(myUid).update({room:roomId,lastSeen:firebase.firestore.FieldValue.serverTimestamp()});
  myData.room=roomId;
  myX=W/2+(Math.random()-0.5)*150; myY=H/2+(Math.random()-0.5)*150;
  otherUsers={};
  const label=document.getElementById('room-label');
  label.textContent = roomId==='lobby'?'✦ 大廳':(getEmo(roomId)?.n||roomId)+' 星域';
  closePanel('room-select');
  const since=new Date(Date.now()-5*60*1000);
  usersUnsub=db.collection('users').where('room','==',roomId).where('lastSeen','>',since).onSnapshot(snap=>{
    snap.docChanges().forEach(ch=>{
      const uid=ch.doc.id; if(uid===myUid)return;
      const data=ch.doc.data();
      if(ch.type==='removed'){delete otherUsers[uid];return;}
      if(!otherUsers[uid]){otherUsers[uid]={data,x:W*0.1+Math.random()*W*0.8,y:60+Math.random()*(H-160),vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4,glowPhase:Math.random()*Math.PI*2,lightTimer:0};}
      else otherUsers[uid].data=data;
    });
    updateCosmosMood(); updateRoomCounts();
  });
}

function openRoomSelect() { renderRoomGrid(); openPanel('room-select'); }
function renderRoomGrid() {
  document.getElementById('room-grid').innerHTML=emotions.map(e=>`
    <div class="room-card" style="background:${e.c}18;border-color:${e.c}40;" onclick="joinRoom('${e.k}')">
      <div class="room-card-emoji">${e.n.split(' ')[0]}</div>
      <div class="room-card-name">${e.n.split(' ').slice(1).join(' ')} 星域</div>
      <div class="room-card-count" id="rcount-${e.k}">0 人</div>
    </div>`).join('');
}
async function updateRoomCounts() {
  const since=new Date(Date.now()-5*60*1000);
  const ls=await db.collection('users').where('room','==','lobby').where('lastSeen','>',since).get();
  const le=document.getElementById('lobby-count'); if(le) le.textContent=ls.size;
  for(const e of emotions){const s=await db.collection('users').where('room','==',e.k).where('lastSeen','>',since).get();const el=document.getElementById('rcount-'+e.k);if(el)el.textContent=s.size+' 人';}
}
function updateCosmosMood() {
  const counts={};
  for(const u of Object.values(otherUsers)) if(u.data.emotion) counts[u.data.emotion]=(counts[u.data.emotion]||0)+1;
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  const el=document.getElementById('cosmos-mood');
  if(top){const emo=getEmo(top[0]);const total=Object.values(otherUsers).length;el.textContent=`今晚 ${Math.round(top[1]/total*100)}% 的靈魂感到 ${emo?emo.n:top[0]}`;}
  else el.textContent='';
}

// ── STAR POPUP ──
function showStarPopup(uid, u) {
  const d=u.data, popup=document.getElementById('star-popup');
  document.getElementById('star-popup-av').innerHTML=drawAvatar(d.glow,d.deco,'60px');
  document.getElementById('star-popup-name').textContent=d.name||'靈魂';
  const emo=getEmo(d.emotion);
  document.getElementById('star-popup-emotion').innerHTML=emo?`<span style="background:${emo.c};color:#fff;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;">${emo.n}</span>`:'';
  document.getElementById('star-popup-bubble').textContent=d.bubble||'';
  document.getElementById('star-popup-music').innerHTML=d.musicName?`<div style="background:rgba(29,185,84,.15);border-radius:8px;padding:5px 10px;font-size:11px;font-weight:700;color:#1db954;">🎵 ${d.musicName}</div>`:'';
  // Emoji reactions
  document.getElementById('star-popup-reactions').innerHTML=EMOJI_REACTIONS.map(e=>`<button onclick="sendEmojiTo('${uid}','${e}')" style="background:none;border:none;font-size:20px;cursor:pointer;padding:4px;border-radius:8px;transition:transform .15s;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'">${e}</button>`).join('');
  document.getElementById('sp-chat-btn').onclick=()=>{openChat(uid,d.name,d.glow,d.deco);popup.style.display='none';};
  document.getElementById('sp-add-btn').textContent=myFriends.has(uid)?'✓ 好友':'➕ 好友';
  document.getElementById('sp-add-btn').disabled=myFriends.has(uid);
  document.getElementById('sp-add-btn').onclick=()=>{sendFR(uid,d.name);popup.style.display='none';};
  document.getElementById('sp-light-btn').onclick=()=>{sendLight(uid);popup.style.display='none';};
  document.getElementById('sp-wall-btn').onclick=()=>{ const t=prompt('留一句匿名話給 '+d.name+'（對方下次上線看到）'); if(t?.trim()) sendWallMessage(uid,t.trim()); popup.style.display='none'; };
  popup.style.display='block';
}
function closeStarPopup() { document.getElementById('star-popup').style.display='none'; }

// ── BUBBLE ──
function openBubbleSheet() {
  document.getElementById('bubble-ta').value=myData.bubble||'';
  document.getElementById('char-ct').textContent=`${(myData.bubble||'').length}/60`;
  selectedEmotion=myData.emotion||'';
  selectedMusic=myData.musicUrl?{name:myData.musicName,url:myData.musicUrl,art:myData.musicArt}:null;
  renderEmoGrid(); renderSelectedMusic(); openPanel('bubble-sheet');
}
document.addEventListener('DOMContentLoaded',()=>{ const ta=document.getElementById('bubble-ta'); if(ta) ta.addEventListener('input',function(){document.getElementById('char-ct').textContent=`${this.value.length}/60`;});});
function renderEmoGrid(){document.getElementById('emo-row').innerHTML=emotions.map(e=>`<button class="emo-pill ${selectedEmotion===e.k?'active':''}" style="background:${e.c};" onclick="selEmo('${e.k}')">${e.n}</button>`).join('');}
function selEmo(k){selectedEmotion=selectedEmotion===k?'':k;renderEmoGrid();}
function onMusicSearch(val){clearTimeout(musicSearchTimer);const el=document.getElementById('yt-results');if(!val.trim()){el.innerHTML='';return;}el.innerHTML='<div class="music-loading">搜尋中...</div>';musicSearchTimer=setTimeout(async()=>{const r=await ytSearch(val);if(!r.length){el.innerHTML='<div class="music-loading">沒有找到結果</div>';return;}renderMusicResults(r,el);},500);}
function renderMusicResults(results,el){el.innerHTML=results.map((r,i)=>`<div class="music-result-item" onclick="selectMusic(${i})"><img class="music-result-art" src="${r.art||''}" onerror="this.style.background='#222'"><div><div class="music-result-name">${r.name}</div><div class="music-result-artist">${r.artist}</div></div></div>`).join('');el._results=results;}
function selectMusic(idx){const el=document.getElementById('yt-results');selectedMusic=(el._results||[])[idx]||null;if(!selectedMusic)return;el.innerHTML='';document.getElementById('yt-inp').value='';renderSelectedMusic();}
function renderSelectedMusic(){const el=document.getElementById('selected-music');if(!selectedMusic){el.style.display='none';return;}el.style.display='block';el.innerHTML=`<div class="music-selected"><img class="music-result-art" src="${selectedMusic.art||''}" onerror="this.style.background='#222'"><div style="flex:1;min-width:0;"><div class="music-selected-name">🎵 ${selectedMusic.name}</div><div class="music-selected-artist">${selectedMusic.artist||''}</div></div><button class="music-clear" onclick="clearMusic()">✕</button></div>`;}
function clearMusic(){selectedMusic=null;renderSelectedMusic();}
async function saveBubble(){const bubble=document.getElementById('bubble-ta').value.trim();const u={bubble,emotion:selectedEmotion,musicUrl:selectedMusic?.url||'',musicName:selectedMusic?.name||'',musicArt:selectedMusic?.art||'',lastSeen:firebase.firestore.FieldValue.serverTimestamp()};myData={...myData,...u};await db.collection('users').doc(myUid).update(u);closePanel('bubble-sheet');showToast({av:'',title:'對話雲已更新 ✦',sub:'',btns:''});}

// ── CHAT ──
function getChatId(a,b){return[a,b].sort().join('_');}
function openChat(uid,name,glow,deco){
  closeStarPopup();chatTargetUid=uid;
  document.getElementById('chat-name').textContent=name;
  document.getElementById('chat-av').innerHTML=drawAvatar(glow,deco,'40px');
  document.getElementById('chat-fr-btn').innerHTML=myFriends.has(uid)?`<span style="font-size:11px;color:#22c55e;font-weight:700;">✓ 好友</span>`:`<button onclick="sendFR('${uid}','${name}')" style="background:rgba(255,255,255,.08);border:none;border-radius:9px;padding:6px 11px;font-size:11px;font-weight:700;cursor:pointer;color:#fff;">➕ 加好友</button>`;
  if(chatUnsub)chatUnsub();
  const chatId=getChatId(myUid,uid);
  db.collection('chats').doc(chatId).set({[`unread_${myUid}`]:0},{merge:true});
  const typingRef=db.collection('chats').doc(chatId);
  chatUnsub=db.collection('chats').doc(chatId).collection('messages').orderBy('ts').onSnapshot(snap=>{
    const c=document.getElementById('chat-msgs');c.innerHTML='';
    snap.forEach(doc=>{const m=doc.data(),mine=m.sender===myUid;const ts=m.ts?new Date(m.ts.seconds*1000).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}):'';const div=document.createElement('div');div.className=`msg ${mine?'mine':'theirs'}`;div.innerHTML=`${m.text}<div class="msg-t">${ts}${mine&&m.read?' · 已讀':''}</div>`;c.appendChild(div);});
    c.scrollTop=c.scrollHeight;
    if(snap.docs.length>0){const last=snap.docs[snap.docs.length-1];if(last.data().sender!==myUid)db.collection('chats').doc(chatId).collection('messages').doc(last.id).update({read:true}).catch(()=>{});}
  });
  typingRef.onSnapshot(doc=>{const d=doc.data();const isTyping=d&&d[`typing_${uid}`]&&Date.now()/1000-(d[`typing_${uid}`]?.seconds||0)<4;document.getElementById('typing-indicator').style.display=isTyping?'block':'none';});
  document.getElementById('chat-panel').classList.add('open');
  document.getElementById('chat-inp').focus();
}
function closeChat(){document.getElementById('chat-panel').classList.remove('open');if(chatUnsub){chatUnsub();chatUnsub=null;}chatTargetUid=null;}
function onTyping(){if(!chatTargetUid)return;const chatId=getChatId(myUid,chatTargetUid);db.collection('chats').doc(chatId).set({[`typing_${myUid}`]:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});clearTimeout(typingTimer);typingTimer=setTimeout(()=>db.collection('chats').doc(chatId).set({[`typing_${myUid}`]:null},{merge:true}),3000);}
async function sendMsg(){
  const inp=document.getElementById('chat-inp'),text=inp.value.trim();
  if(!text||!chatTargetUid)return;inp.value='';
  const chatId=getChatId(myUid,chatTargetUid);
  const chatted=myData.chatted||[];
  if(!chatted.includes(chatTargetUid)){myData.chatted=[...chatted,chatTargetUid];myData.coins=(myData.coins||0)+5;await db.collection('users').doc(myUid).update({chatted:firebase.firestore.FieldValue.arrayUnion(chatTargetUid),coins:firebase.firestore.FieldValue.increment(5)});popCoin('+5 🪙');showToast({av:'',title:'初次互動獎勵！',sub:'你獲得 🪙 5 代幣',btns:''});syncUI();}
  await db.collection('chats').doc(chatId).collection('messages').add({text,sender:myUid,read:false,ts:firebase.firestore.FieldValue.serverTimestamp()});
  await db.collection('chats').doc(chatId).set({participants:[myUid,chatTargetUid],lastMsg:text,lastTs:firebase.firestore.FieldValue.serverTimestamp(),[`unread_${chatTargetUid}`]:firebase.firestore.FieldValue.increment(1),[`typing_${myUid}`]:null},{merge:true});
}
function listenChats(){db.collection('chats').where('participants','array-contains',myUid).onSnapshot(snap=>{let total=0;snap.docChanges().forEach(ch=>{const d=ch.doc.data(),other=d.participants?.find(u=>u!==myUid);if(ch.type==='modified'&&other&&other!==chatTargetUid){const un=d[`unread_${myUid}`]||0;if(un>0)db.collection('users').doc(other).get().then(u=>{if(u.exists){const ud=u.data();showToast({av:drawAvatar(ud.glow,ud.deco,'40px'),title:ud.name,sub:`💬 ${d.lastMsg}`,btns:`<button class="tbtn open" onclick="openChat('${other}','${ud.name}','${ud.glow}','${ud.deco}');hideToast()">查看</button>`});}});}total+=d[`unread_${myUid}`]||0;});const badge=document.getElementById('friends-badge');if(total>0){badge.style.display='flex';badge.textContent=total>9?'9+':total;}else badge.style.display='none';});}

// ── HELP ──
function listenHelpRequests(){db.collection('helpRequests').where('status','in',['open','helping']).onSnapshot(snap=>{const list=[];snap.forEach(doc=>{list.push({id:doc.id,...doc.data()});});renderHelpList(list);});}
async function postHelpRequest(){const text=document.getElementById('help-input').value.trim();if(!text)return;document.getElementById('help-input').value='';await db.collection('helpRequests').add({text,fromUid:myUid,fromName:myData.name,fromGlow:myData.glow,fromDeco:myData.deco,status:'open',helperUid:null,ts:firebase.firestore.FieldValue.serverTimestamp()});}
async function acceptHelp(id){await db.collection('helpRequests').doc(id).update({status:'helping',helperUid:myUid});const req=(await db.collection('helpRequests').doc(id).get()).data();nav('space');openChat(req.fromUid,req.fromName,req.fromGlow||'cyan',req.fromDeco||'none');setTimeout(()=>{document.getElementById('chat-inp').value='我看到你的求助，我可以幫忙！';},400);}
async function completeHelp(id,helperUid){await db.collection('helpRequests').doc(id).update({status:'done'});await db.collection('users').doc(myUid).update({received:firebase.firestore.FieldValue.increment(1)});myData.received=(myData.received||0)+1;if(!myData.firstHelpDone){myData.firstHelpDone=true;await db.collection('users').doc(myUid).update({firstHelpDone:true});if(myData.invitedBy)await db.collection('users').doc(myData.invitedBy).update({coins:firebase.firestore.FieldValue.increment(100)});}syncUI();if(helperUid)openRewardModal(helperUid);}
async function helperComplete(id){await db.collection('helpRequests').doc(id).update({status:'done'});await db.collection('users').doc(myUid).update({helped:firebase.firestore.FieldValue.increment(1),coins:firebase.firestore.FieldValue.increment(20)});myData.helped=(myData.helped||0)+1;myData.coins=(myData.coins||0)+20;for(let i=0;i<15;i++){const a=Math.random()*Math.PI*2,s=2+Math.random()*3;sparks.push({x:myX,y:myY,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2.5,life:1,color:'#ffd700'});}syncUI();popCoin('+20 🪙');showToast({av:'',title:'感謝你的幫助！',sub:'你獲得了 🪙 20 代幣',btns:''});}
async function cancelHelp(id){await db.collection('helpRequests').doc(id).update({status:'done'});}
function renderHelpList(list){const el=document.getElementById('help-list');if(!list.length){el.innerHTML='<div class="empty"><div class="emoji">🌟</div><p>目前沒有求助</p></div>';return;}el.innerHTML=list.map(h=>{const isMe=h.fromUid===myUid,isHelper=h.helperUid===myUid;const ts=h.ts?new Date(h.ts.seconds*1000).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}):'';const tagCls=h.status==='open'?'tag-open':h.status==='helping'?'tag-helping':'tag-done';const tagTxt=h.status==='open'?'🔴 等待幫助':h.status==='helping'?'🟢 幫助中':'✅ 已完成';return`<div class="help-card"><span class="status-tag ${tagCls}">${tagTxt}</span><div class="help-card-top"><div style="width:40px;height:40px;">${drawAvatar(h.fromGlow,h.fromDeco,'40px')}</div><div><div class="help-card-name">${h.fromName}</div><div class="help-card-time">${ts}</div></div></div><div class="help-card-text">${h.text}</div><div class="help-card-btns">${isMe&&h.status!=='done'?`<button class="hbtn done" onclick="completeHelp('${h.id}','${h.helperUid||''}')">✅ 已解決</button><button class="hbtn cancel" onclick="cancelHelp('${h.id}')">取消</button>`:''}${isHelper&&h.status==='helping'?`<button class="hbtn done" onclick="helperComplete('${h.id}')">✅ 完成幫助</button>`:''}${!isMe&&!isHelper&&h.status==='open'?`<button class="hbtn accept" onclick="acceptHelp('${h.id}')">🤝 我來幫忙</button>`:''}${!isMe?`<button class="hbtn cancel" onclick="openChat('${h.fromUid}','${h.fromName}','${h.fromGlow||'cyan'}','${h.fromDeco||'none'}')">💬 聊天</button>`:''}</div></div>`;}).join('');}

// ── REWARD ──
function openRewardModal(helperUid){pendingRewardHelperUid=helperUid;document.getElementById('my-coin-display').textContent=myData.coins||0;document.getElementById('coin-slider').value=10;document.getElementById('coin-val').textContent=10;document.getElementById('reward-btn-val').textContent=10;document.getElementById('coin-slider').oninput=function(){document.getElementById('coin-val').textContent=this.value;document.getElementById('reward-btn-val').textContent=this.value;};document.getElementById('reward-modal').classList.add('open');}
async function confirmReward(){const amount=parseInt(document.getElementById('coin-slider').value)||10;if((myData.coins||0)<amount){showToast({av:'',title:'代幣不足',sub:`你只有 🪙 ${myData.coins||0}`,btns:''});closeRewardModal();return;}await db.collection('users').doc(myUid).update({coins:firebase.firestore.FieldValue.increment(-amount)});myData.coins=(myData.coins||0)-amount;if(pendingRewardHelperUid)await db.collection('users').doc(pendingRewardHelperUid).update({coins:firebase.firestore.FieldValue.increment(amount)});closeRewardModal();syncUI();showToast({av:'',title:`已送出 🪙 ${amount} 代幣`,sub:'謝謝對方的幫助！',btns:''});}
function closeRewardModal(){document.getElementById('reward-modal').classList.remove('open');pendingRewardHelperUid=null;}
function popCoin(text){const el=document.createElement('div');el.className='coin-pop';el.textContent=text;el.style.cssText=`left:${20+Math.random()*60}%;top:40%;`;document.body.appendChild(el);setTimeout(()=>el.remove(),1000);}

// ── FRIENDS ──
async function sendFR(toUid,toName){const ex=await db.collection('friendRequests').where('from','==',myUid).where('to','==',toUid).get();if(!ex.empty){showToast({av:'',title:'已發送過了',sub:'',btns:''});return;}await db.collection('friendRequests').add({from:myUid,to:toUid,fromName:myData.name,fromGlow:myData.glow,fromDeco:myData.deco,status:'pending',ts:firebase.firestore.FieldValue.serverTimestamp()});showToast({av:'',title:'好友申請已送出 ✓',sub:'',btns:''});}
function listenFriendRequests(){
  db.collection('friendRequests').where('to','==',myUid).where('status','==','pending').onSnapshot(snap=>{incomingReqs=snap.docs.map(d=>({id:d.id,...d.data()}));document.getElementById('req-tab').textContent=incomingReqs.length?`申請請求 (${incomingReqs.length})`:'申請請求';snap.docChanges().forEach(ch=>{if(ch.type==='added'){const r=ch.doc.data();showToast({av:drawAvatar(r.fromGlow,r.fromDeco,'40px'),title:r.fromName,sub:'想加你為好友',btns:`<button class="tbtn ok" onclick="acceptFR('${ch.doc.id}');hideToast()">接受</button><button class="tbtn no" onclick="rejectFR('${ch.doc.id}');hideToast()">拒絕</button>`});}});if(currentFTab==='requests')renderRequests();});
  db.collection('friendRequests').where('from','==',myUid).where('status','==','accepted').onSnapshot(snap=>{snap.forEach(d=>myFriends.add(d.data().to));updateFriendCount();});
  db.collection('friendRequests').where('to','==',myUid).where('status','==','accepted').onSnapshot(snap=>{snap.forEach(d=>myFriends.add(d.data().from));updateFriendCount();if(currentFTab==='friends')renderFriends();});
}
async function acceptFR(id){await db.collection('friendRequests').doc(id).update({status:'accepted'});}
async function rejectFR(id){await db.collection('friendRequests').doc(id).update({status:'rejected'});}
function updateFriendCount(){document.getElementById('s-friends').textContent=myFriends.size;}
function switchFTab(t){currentFTab=t;document.getElementById('ftab-friends').classList.toggle('active',t==='friends');document.getElementById('req-tab').classList.toggle('active',t==='requests');t==='friends'?renderFriends():renderRequests();}
async function renderFriends(){const c=document.getElementById('friends-content');if(!myFriends.size){c.innerHTML='<div class="empty"><div class="emoji">👻</div><p>還沒有好友<br>複製邀請連結傳給朋友吧！</p></div>';return;}c.innerHTML='';for(const uid of myFriends){const snap=await db.collection('users').doc(uid).get();if(!snap.exists)continue;const d=snap.data(),chatId=getChatId(myUid,uid);const cs=await db.collection('chats').doc(chatId).get();const lastMsg=cs.exists?(cs.data().lastMsg||'點擊開始聊天'):'點擊開始聊天';const unread=cs.exists?(cs.data()[`unread_${myUid}`]||0):0;const card=document.createElement('div');card.className='friend-card';card.onclick=()=>{nav('space');openChat(uid,d.name,d.glow,d.deco);};card.innerHTML=`<div style="width:52px;height:52px;">${drawAvatar(d.glow,d.deco,'52px')}</div><div class="friend-info"><div class="friend-name">${d.name}</div><div class="friend-last">💬 ${lastMsg}</div></div>${unread>0?`<div class="unread-dot">${unread}</div>`:''}`;c.appendChild(card);}}
function renderRequests(){const c=document.getElementById('friends-content');if(!incomingReqs.length){c.innerHTML='<div class="empty"><div class="emoji">📭</div><p>沒有待處理的申請</p></div>';return;}c.innerHTML=incomingReqs.map(r=>`<div class="friend-card"><div style="width:52px;height:52px;">${drawAvatar(r.fromGlow,r.fromDeco,'52px')}</div><div class="friend-info"><div class="friend-name">${r.fromName}</div><div class="friend-last">想加你為好友</div></div><div class="req-btns"><button class="rbtn ok" onclick="acceptFR('${r.id}')">接受</button><button class="rbtn no" onclick="rejectFR('${r.id}')">拒絕</button></div></div>`).join('');}
function copyInviteLink(){navigator.clipboard.writeText(`${location.origin}/?invite=${myUid}`).then(()=>showToast({av:'',title:'複製成功！',sub:'朋友完成第一次幫助，你獲得 🪙 100',btns:''}));}
function checkInviteParam(){const p=new URLSearchParams(location.search),inv=p.get('invite');if(inv&&inv!==myUid){db.collection('users').doc(inv).get().then(snap=>{if(!snap.exists)return;const d=snap.data();showToast({av:drawAvatar(d.glow,d.deco,'40px'),title:d.name,sub:'邀請你進入宇宙',btns:`<button class="tbtn ok" onclick="sendFRAndSetInviter('${inv}','${d.name}');hideToast()">加好友</button><button class="tbtn no" onclick="hideToast()">略過</button>`});});history.replaceState({},'',location.pathname);}}
async function sendFRAndSetInviter(uid,name){if(!myData.invitedBy){myData.invitedBy=uid;await db.collection('users').doc(myUid).update({invitedBy:uid});}sendFR(uid,name);}

// ── TOAST ──
function showToast({av,title,sub,btns}){if(toastTimer)clearTimeout(toastTimer);document.getElementById('toast-av').innerHTML=av;document.getElementById('toast-title').textContent=title;document.getElementById('toast-sub').textContent=sub;document.getElementById('toast-btns').innerHTML=btns;document.getElementById('toast').classList.add('show');toastTimer=setTimeout(hideToast,6000);}
function hideToast(){document.getElementById('toast').classList.remove('show');}

// ── SHOP ──
function renderShopView(){
  const og=myData.ownedGlows||['none','cyan'],od=myData.ownedDecos||['none','headphone','angel'];
  document.getElementById('shop-glow-grid').innerHTML=Object.entries(glows).map(([k,v])=>{const own=og.includes(k),eq=myData.glow===k;return`<div class="shop-item ${eq?'equipped':own?'owned':''}" onclick="shopAction('glow','${k}',${v.price},${own})"><div style="height:56px;">${drawAvatar(k,'none','56px')}</div><small>${v.n}</small>${eq?`<div class="equipped-tag">✓ 裝備中</div>`:own?`<div class="owned-tag">已擁有</div>`:`<div class="price-tag">🪙 ${v.price}</div>`}</div>`;}).join('');
  document.getElementById('shop-deco-grid').innerHTML=Object.entries(decos).map(([k,v])=>{const own=od.includes(k),eq=myData.deco===k;return`<div class="shop-item ${eq?'equipped':own?'owned':''}" onclick="shopAction('deco','${k}',${v.price},${own})"><div style="height:56px;">${drawAvatar('none',k,'56px')}</div><small>${v.n}</small>${eq?`<div class="equipped-tag">✓ 裝備中</div>`:own?`<div class="owned-tag">已擁有</div>`:`<div class="price-tag">🪙 ${v.price}</div>`}</div>`;}).join('');
}
async function shopAction(type,key,price,isOwned){if(isOwned){myData[type]=key;await db.collection('users').doc(myUid).update({[type]:key});syncUI();renderShopView();showToast({av:'',title:'裝備已更換 ✦',sub:'',btns:''});return;}if((myData.coins||0)<price){showToast({av:'',title:'代幣不足',sub:`還需要 🪙 ${price-(myData.coins||0)}`,btns:''});return;}if(!confirm(`花費 🪙 ${price} 購買？`))return;myData.coins=(myData.coins||0)-price;myData[type]=key;const ok=type==='glow'?'ownedGlows':'ownedDecos';myData[ok]=[...(myData[ok]||[]),key];await db.collection('users').doc(myUid).update({coins:myData.coins,[type]:key,[ok]:firebase.firestore.FieldValue.arrayUnion(key)});syncUI();renderShopView();popCoin(`-${price} 🪙`);showToast({av:'',title:'購買成功！',sub:'已自動裝備',btns:''});}

// ── PROFILE ──
async function updateProfile(k,v){myData[k]=v;await db.collection('users').doc(myUid).update({[k]:v});syncUI();}
function syncUI(){
  if(!myUid)return;
  document.getElementById('me-avatar').innerHTML=drawAvatar(myData.glow,myData.deco,'86px');
  document.getElementById('me-name').value=myData.name||'';
  document.getElementById('ig-handle').value=myData.igHandle||'';
  document.getElementById('s-helped').textContent=myData.helped||0;
  document.getElementById('s-recv').textContent=myData.received||0;
  document.getElementById('s-coins').textContent=myData.coins||0;
  document.getElementById('hud-coin-val').textContent=myData.coins||0;
  const total=(myData.helped||0)+(myData.received||0);
  document.getElementById('me-title').textContent=titles[Math.min(Math.floor(total/10),titles.length-1)];
  document.getElementById('status-pills').innerHTML=statuses.map(s=>`<div class="spill ${myData.status===s?'active':''}" onclick="updateProfile('status','${s}')">${s}</div>`).join('');
  renderShopView();
}

// ── NAV ──
function nav(v){document.querySelectorAll('.view').forEach(e=>e.style.display='none');document.querySelectorAll('.overlay-panel').forEach(e=>e.style.display='none');document.getElementById('star-popup').style.display='none';if(v!=='space'){const el=document.getElementById('view-'+v);if(el){el.style.display='block';if(v==='friends')renderFriends();if(v==='me')renderShopView();if(v==='help')listenHelpRequests();}}}
function openPanel(id){document.querySelectorAll('.overlay-panel').forEach(e=>e.style.display='none');const el=document.getElementById(id);if(el){el.style.display='block';el.scrollTop=0;}if(id==='room-select')renderRoomGrid();}
function closePanel(id){const el=document.getElementById(id);if(el)el.style.display='none';}

// ── SOUL CARD ──
function openSoulCard(){document.getElementById('card-modal').classList.add('open');drawSoulCard();}
async function drawSoulCard(){
  const c=document.getElementById('soul-canvas'),ctx=c.getContext('2d'),W=c.width,H=c.height;
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#08080a');bg.addColorStop(.5,'#120b1e');bg.addColorStop(1,'#080c1a');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  for(let i=0;i<4000;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*.022})`;ctx.fillRect(Math.random()*W,Math.random()*H,1,1);}
  const gc=(glows[myData.glow]||glows.none).c,emo=getEmo(myData.emotion),accent=emo?emo.c:gc;
  [[W*.5,H*.28,200,colorWithAlpha(gc,0.27)],[W*.15,H*.65,140,'rgba(168,85,247,0.15)'],[W*.85,H*.55,110,'rgba(88,101,242,0.13)']].forEach(([x,y,r,col])=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);});
  ctx.strokeStyle=colorWithAlpha(accent,0.6);ctx.lineWidth=2;[[22,22,58,22,22,58],[W-22,22,W-58,22,W-22,58],[22,H-22,58,H-22,22,H-58],[W-22,H-22,W-58,H-22,W-22,H-58]].forEach(([x1,y1,x2,y2,x3,y3])=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.moveTo(x1,y1);ctx.lineTo(x3,y3);ctx.stroke();});
  const svgBlob=new Blob([drawAvatar(myData.glow,myData.deco,'200px')],{type:'image/svg+xml'});const svgUrl=URL.createObjectURL(svgBlob);
  await new Promise(res=>{const img=new Image();img.onload=()=>{ctx.drawImage(img,W/2-96,H*.08,192,192);URL.revokeObjectURL(svgUrl);res();};img.src=svgUrl;});
  const emoY=H*.08+198;if(emo){ctx.fillStyle=emo.c;rrect(ctx,W/2-46,emoY,92,24,7);ctx.fill();ctx.fillStyle='#fff';ctx.font='700 11px Outfit,sans-serif';ctx.textAlign='center';ctx.fillText(emo.n,W/2,emoY+16);}
  const nameY=emoY+(emo?38:18);ctx.save();ctx.shadowColor=accent;ctx.shadowBlur=24;ctx.fillStyle='#fff';ctx.font='900 32px Outfit,sans-serif';ctx.textAlign='center';ctx.fillText(myData.name||'匿名靈魂',W/2,nameY);ctx.restore();
  const tg=ctx.createLinearGradient(W/2-52,nameY+10,W/2+52,nameY+36);tg.addColorStop(0,'#f59e0b');tg.addColorStop(1,'#ef4444');ctx.fillStyle=tg;rrect(ctx,W/2-54,nameY+10,108,28,8);ctx.fill();ctx.fillStyle='#fff';ctx.font='700 12px Outfit,sans-serif';ctx.fillText(document.getElementById('me-title').textContent,W/2,nameY+28);
  if(myData.igHandle){ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='600 12px Outfit,sans-serif';ctx.fillText(`@${myData.igHandle}`,W/2,nameY+50);}
  let cY=nameY+(myData.igHandle?68:52);
  if(myData.bubble){ctx.fillStyle='rgba(255,255,255,.07)';ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=1;rrect(ctx,32,cY,W-64,myData.bubble.length>28?56:36,12);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.75)';ctx.font='400 13px Outfit,sans-serif';ctx.fillText(`"${myData.bubble.slice(0,32)}"`,W/2,cY+20);if(myData.bubble.length>32)ctx.fillText(myData.bubble.slice(32,60),W/2,cY+38);cY+=myData.bubble.length>28?72:52;}
  if(myData.musicName){ctx.fillStyle='#1db954';rrect(ctx,W/2-90,cY,180,32,10);ctx.fill();ctx.fillStyle='#fff';ctx.font='700 12px Outfit,sans-serif';ctx.fillText(`🎵  ${myData.musicName.slice(0,24)}`,W/2,cY+21);cY+=46;}
  const divY=H*.7;ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(40,divY);ctx.lineTo(W-40,divY);ctx.stroke();
  [{n:myData.helped||0,l:'幫助次數'},{n:myData.coins||0,l:'🪙 代幣'},{n:myFriends.size,l:'好友數'}].forEach((s,i)=>{const x=68+i*128;ctx.fillStyle='#fff';ctx.font='900 26px Outfit,sans-serif';ctx.textAlign='center';ctx.fillText(s.n,x,divY+38);ctx.fillStyle='rgba(255,255,255,.35)';ctx.font='600 10px Outfit,sans-serif';ctx.fillText(s.l,x,divY+56);});
  const profileUrl=`${location.origin}/?invite=${myUid}`;
  try{const qrDataUrl=await QRCode.toDataURL(profileUrl,{width:80,margin:1,color:{dark:'#ffffff',light:'#00000000'}});await new Promise(res=>{const qi=new Image();qi.onload=()=>{ctx.drawImage(qi,W-96,H-100,72,72);res();};qi.src=qrDataUrl;});}catch(e){}
  ctx.fillStyle='rgba(255,255,255,.18)';ctx.font='700 11px Outfit,sans-serif';ctx.textAlign='left';ctx.fillText('✦ SoulEcho',24,H-22);ctx.fillStyle='rgba(255,255,255,.1)';ctx.font='400 9px Outfit,sans-serif';ctx.fillText('掃描 QR 認識我',W-96,H-12);
}
function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
function downloadCard(){const a=document.createElement('a');a.download=`SoulEcho_${myData.name||'card'}.png`;a.href=document.getElementById('soul-canvas').toDataURL('image/png');a.click();}
async function shareToIG(){const canvas=document.getElementById('soul-canvas'),profileUrl=`${location.origin}/?invite=${myUid}`;canvas.toBlob(async blob=>{const file=new File([blob],'soulecho.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'SoulEcho',text:profileUrl});return;}catch(e){}}downloadCard();await navigator.clipboard.writeText(profileUrl).catch(()=>{});setTimeout(()=>{window.open('instagram://story-camera','_blank');},300);showToast({av:'',title:'圖片已儲存！連結已複製',sub:'IG 限動 → 上傳 → 加連結貼紙',btns:''});});} 

// ── PWA ──
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;if(!localStorage.getItem('pwa_dismissed'))document.getElementById('install-banner').classList.add('show');});
function installPWA(){if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>{document.getElementById('install-banner').classList.remove('show');deferredPrompt=null;});}
function dismissInstall(){document.getElementById('install-banner').classList.remove('show');localStorage.setItem('pwa_dismissed','1');}
window.addEventListener('appinstalled',()=>document.getElementById('install-banner').classList.remove('show'));
