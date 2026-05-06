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
      platform: 'youtube',
      name: v.snippet.title.replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
      artist: v.snippet.channelTitle,
      art: v.snippet.thumbnails?.medium?.url || '',
      url: 'https://youtu.be/' + v.id.videoId
    }));
  } catch (e) { return []; }
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
  none:   { n: '無光',   c: 'rgba(255,255,255,0.15)', price: 0 },
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
  none:      { n: '素顏',  s: '', price: 0 },
  headphone: { n: '耳機',  s: '<path d="M20 50 Q20 14 50 14 Q80 14 80 50" fill="none" stroke="#5865f2" stroke-width="6" stroke-linecap="round"/><rect x="11" y="47" width="13" height="19" rx="5" fill="#5865f2"/><rect x="76" y="47" width="13" height="19" rx="5" fill="#5865f2"/>', price: 0 },
  angel:     { n: '光環',  s: '<ellipse cx="50" cy="8" rx="27" ry="7" fill="none" stroke="#fbbf24" stroke-width="4"/>', price: 0 },
  devil:     { n: '惡魔角', s: '<path d="M24 36 L10 4 L38 28 Z M76 36 L90 4 L62 28 Z" fill="#ff4444"/>', price: 50 },
  cat:       { n: '貓耳',  s: '<path d="M19 43 L11 11 L43 34 Z M81 43 L89 11 L57 34 Z" fill="#aaa"/>', price: 50 },
  sprout:    { n: '嫩芽',  s: '<path d="M50 34 L50 11 Q50 2 66 7" fill="none" stroke="#22c55e" stroke-width="3.5" stroke-linecap="round"/><path d="M50 20 Q38 9 28 18" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>', price: 80 },
  ufo:       { n: '天線',  s: '<line x1="50" y1="34" x2="50" y2="9" stroke="#10b981" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="6" r="5" fill="#ff2442"/>', price: 80 },
  crown:     { n: '皇冠',  s: '<path d="M20 36 L20 20 L35 30 L50 8 L65 30 L80 20 L80 36 Z" fill="#fbbf24"/>', price: 120 },
  star:      { n: '星星',  s: '<path d="M50 5 L54 18 L68 18 L57 26 L61 40 L50 32 L39 40 L43 26 L32 18 L46 18 Z" fill="#fbbf24"/>', price: 120 },
  butterfly: { n: '蝴蝶',  s: '<path d="M50 30 Q30 10 15 20 Q25 35 50 38 Q75 35 85 20 Q70 10 50 30 Z" fill="#f472b6" opacity=".85"/>', price: 150 },
  lightning: { n: '閃電',  s: '<path d="M55 5 L38 35 L52 35 L45 65 L62 28 L48 28 Z" fill="#fbbf24"/>', price: 150 },
  moon:      { n: '月亮',  s: '<path d="M50 5 Q30 5 22 22 Q14 40 25 55 Q36 68 55 65 Q40 60 35 48 Q28 32 38 18 Q44 8 50 5 Z" fill="#e2e8f0"/>', price: 180 },
  sakura:    { n: '櫻花',  s: '<circle cx="50" cy="12" r="5" fill="#ffb7c5"/><circle cx="30" cy="30" r="5" fill="#ffb7c5"/><circle cx="70" cy="30" r="5" fill="#ffb7c5"/><circle cx="36" cy="52" r="5" fill="#ffb7c5"/><circle cx="64" cy="52" r="5" fill="#ffb7c5"/><circle cx="50" cy="34" r="7" fill="#ff9db0"/>', price: 200 },
  flame:     { n: '烈焰',  s: '<path d="M50 65 Q30 50 35 30 Q38 18 50 10 Q45 25 52 28 Q48 15 58 8 Q62 22 55 32 Q65 25 62 40 Q70 30 68 48 Q70 58 50 65 Z" fill="#ff6b35"/>', price: 200 },
  comet:     { n: '☄️ 彗星', s: '<path d="M50 35 Q30 15 10 25 Q20 32 50 35 Z" fill="#94a3b8"/><circle cx="50" cy="35" r="8" fill="#e2e8f0"/><path d="M55 30 Q70 20 85 28" fill="none" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round"/>', price: 0, locked: true },
  galaxy:    { n: '星河',  s: '<circle cx="30" cy="20" r="2" fill="#a855f7"/><circle cx="70" cy="15" r="3" fill="#5865f2"/><circle cx="50" cy="8" r="2" fill="#f472b6"/><circle cx="20" cy="35" r="2" fill="#14b8a6"/><circle cx="80" cy="30" r="2" fill="#fbbf24"/>', price: 250 }
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function colorWithAlpha(color, alpha) {
  if (color.startsWith('#')) return hexToRgba(color, alpha);
  if (color.startsWith('rgba')) return color.replace(/,[^,]+\)$/, `,${alpha})`);
  if (color.startsWith('rgb(')) return color.replace('rgb(','rgba(').replace(')',`,${alpha})`);
  return `rgba(255,255,255,${alpha})`;
}
function getEmo(k) { return emotions.find(e => e.k === k) || null; }

function drawAvatar(g = 'none', d = 'none', size = '100%') {
  const gc = (glows[g] || glows.none).c;
  const ds = (decos[d] || decos.none).s;
  const id = (g || 'x') + (d || 'x') + (Math.random() * 9999 | 0);
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
let otherUsers = {}; // uid -> { data, x, y, vx, vy, glowPhase, lightTimer }
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
let cosmosHue = 240; // degrees, shifts over time
let lastLogin = localStorage.getItem('se_last_login');
let loginStreakDays = parseInt(localStorage.getItem('se_streak') || '0');
let usersUnsub = null;
let broadcastUnsub = null;

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
    musicUrl: '', musicName: '', musicArt: '', musicPlatform: '',
    ownedGlows: ['none', 'cyan'], ownedDecos: ['none', 'headphone', 'angel'],
    firstHelpDone: false, invitedBy: null, chatted: []
  };
  const isNew = !snap.exists;
  myData = snap.exists ? { ...def, ...snap.data() } : { ...def };
  if (isNew) { myData.coins = 100; }
  await ref.set({ ...myData, lastSeen: firebase.firestore.FieldValue.serverTimestamp(), uid: myUid, room: 'lobby' }, { merge: true });
  if (isNew) showToast({ av: '🎉', title: '歡迎加入 SoulEcho！', sub: '首次加入獲得 🪙 100 代幣', btns: '' });

  initCanvas();
  initBgStars();
  syncUI();
  joinRoom('lobby');
  listenFriendRequests();
  listenChats();
  listenBroadcast();
  listenLights();
  listenEffects();
  checkInviteParam();
  checkDailyLogin();
  // Spawn 3 immediate shooting stars so user sees effects right away
  for (let i=0;i<3;i++) setTimeout(()=>{
    shootingStars.push({x:-50,y:50+Math.random()*H*0.5,vx:10+Math.random()*8,vy:(Math.random()-0.3)*3,len:180,life:1,color:['#fff','#ffd700','#d8a8ff'][i]});
  }, i*800);
  requestAnimationFrame(gameLoop);

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

async function logout() {
  if (!confirm('確定登出？')) return;
  await db.collection('users').doc(myUid).update({ lastSeen: new Date(0), room: '' });
  await auth.signOut();
  location.reload();
}

// ── CANVAS ──
function initCanvas() {
  canvas = document.getElementById('space-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('click', onCanvasClick);
  // Double-click = light wave
  canvas.addEventListener('dblclick', e => {
    const dx = e.clientX - myX, dy = e.clientY - myY;
    if (Math.sqrt(dx*dx+dy*dy) < 50) spawnLightWave(myX, myY);
  });
  // Long-press = wish star
  let pressTimer = null;
  canvas.addEventListener('touchstart', e => {
    pressTimer = setTimeout(() => {
      const t = e.touches[0];
      spawnWishStar(t.clientX, t.clientY);
    }, 600);
  }, { passive: true });
  canvas.addEventListener('touchend', e => {
    clearTimeout(pressTimer);
    e.preventDefault();
    const t = e.changedTouches[0];
    onCanvasClick({ clientX: t.clientX, clientY: t.clientY });
  }, { passive: false });
  canvas.addEventListener('touchmove', () => clearTimeout(pressTimer), { passive: true });
  // Shake detection
  let lastAcc = null;
  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', e => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      if (lastAcc) {
        const delta = Math.abs(a.x - lastAcc.x) + Math.abs(a.y - lastAcc.y) + Math.abs(a.z - lastAcc.z);
        if (delta > 40) shakeExplosion();
      }
      lastAcc = { x: a.x, y: a.y, z: a.z };
    });
  }
}

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  if (myX === 0 && myY === 0) { myX = W / 2; myY = H / 2; }
  initBgStars();
}

function initBgStars() {
  bgStars = [];
  // many tiny stars
  for (let i = 0; i < 300; i++) {
    bgStars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.2+0.2, speed: Math.random()*0.008+0.002, phase: Math.random()*Math.PI*2, type:'dot' });
  }
  // fewer bigger glowing stars
  for (let i = 0; i < 40; i++) {
    bgStars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*2.5+1, speed: Math.random()*0.005+0.001, phase: Math.random()*Math.PI*2, type:'glow' });
  }
  // floating dust particles
  for (let i = 0; i < 60; i++) {
    bgStars.push({ x: Math.random()*W, y: Math.random()*H, r: 0.5, speed: Math.random()*0.003+0.001, phase: Math.random()*Math.PI*2, type:'dust', vx:(Math.random()-0.5)*0.15, vy:(Math.random()-0.5)*0.15 });
  }
}

function spawnShootingStar() {
  if (shootingStars.length < 8 && Math.random() < 0.04) {
    const fromLeft = Math.random() > 0.5;
    shootingStars.push({
      x: fromLeft ? -20 : W + 20,
      y: Math.random() * H * 0.7,
      vx: fromLeft ? (6 + Math.random() * 8) : -(6 + Math.random() * 8),
      vy: (Math.random() - 0.3) * 4,
      len: 120 + Math.random() * 100,
      life: 1,
      color: ['#ffffff','#a8d8ff','#ffd8a8','#d8a8ff'][Math.floor(Math.random()*4)]
    });
  }
}

// ── GAME LOOP ──
function gameLoop(ts) {
  requestAnimationFrame(gameLoop);
  update(ts);
  render();
}

function update() {
  // Move toward target
  if (targetX !== null) {
    const dx = targetX - myX, dy = targetY - myY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 4) { targetX = null; targetY = null; myVx *= 0.8; myVy *= 0.8; }
    else { const speed = Math.min(4, dist * 0.08); myVx = (dx / dist) * speed; myVy = (dy / dist) * speed; }
  } else { myVx *= 0.88; myVy *= 0.88; }
  myX = Math.max(30, Math.min(W - 30, myX + myVx));
  myY = Math.max(60, Math.min(H - 80, myY + myVy));

  // Move others (gentle drift)
  for (const u of Object.values(otherUsers)) {
    if (!u.vx) { u.vx = (Math.random() - 0.5) * 0.4; u.vy = (Math.random() - 0.5) * 0.4; }
    u.vx += (Math.random() - 0.5) * 0.05;
    u.vy += (Math.random() - 0.5) * 0.05;
    u.vx = Math.max(-0.8, Math.min(0.8, u.vx));
    u.vy = Math.max(-0.8, Math.min(0.8, u.vy));
    u.x = Math.max(30, Math.min(W - 30, u.x + u.vx));
    u.y = Math.max(60, Math.min(H - 80, u.y + u.vy));
    u.glowPhase = (u.glowPhase || 0) + 0.04;
    if (u.lightTimer > 0) u.lightTimer -= 0.02;
  }

  // Shooting stars
  spawnShootingStar();
  shootingStars = shootingStars.filter(s => {
    s.x += s.vx; s.y += s.vy; s.life -= 0.02;
    return s.life > 0 && s.x < W + 100;
  });

  // Bg star twinkle
  bgStars.forEach(s => { s.phase += s.speed; });

  // Black hole spawn
  blackHoleTimer--;
  if (blackHoleTimer <= 0) {
    blackHoleTimer = 1800 + Math.random() * 1800; // every 30-60s
    blackHole = {
      x: W * 0.15 + Math.random() * W * 0.7,
      y: H * 0.2 + Math.random() * H * 0.5,
      r: 0, maxR: 40 + Math.random() * 30,
      life: 600, phase: 0
    };
  }
  if (blackHole) {
    blackHole.life--;
    blackHole.phase += 0.05;
    blackHole.r = Math.min(blackHole.maxR, blackHole.r + 0.5);
    // Pull nearby users toward black hole
    const pull = 0.3;
    const bdx = blackHole.x - myX, bdy = blackHole.y - myY;
    const bdist = Math.sqrt(bdx*bdx + bdy*bdy);
    if (bdist < 200 && bdist > blackHole.r + 20) { myVx += (bdx/bdist)*pull; myVy += (bdy/bdist)*pull; }
    for (const u of Object.values(otherUsers)) {
      const udx = blackHole.x - u.x, udy = blackHole.y - u.y;
      const udist = Math.sqrt(udx*udx + udy*udy);
      if (udist < 200 && udist > blackHole.r + 20) { u.vx += (udx/udist)*pull*0.5; u.vy += (udy/udist)*pull*0.5; }
    }
    if (blackHole.life <= 0) blackHole = null;
  }

  // Cosmos hue shift (every ~3 min cycles through colors)
  cosmosHue = (cosmosHue + 0.02) % 360;

  // Collision sparks between nearby stars
  for (const [uid, u] of Object.entries(otherUsers)) {
    const dx = u.x - myX, dy = u.y - myY;
    if (Math.sqrt(dx*dx+dy*dy) < 35) spawnSparks((myX+u.x)/2, (myY+u.y)/2);
  }

  // Update sparks
  sparks = sparks.filter(s => { s.x+=s.vx; s.y+=s.vy; s.vy+=0.1; s.life-=0.04; return s.life>0; });
  // Update wish stars
  wishStars = wishStars.filter(w => { w.life-=0.005; w.phase+=0.08; return w.life>0; });
  // Update light waves
  lightWaves = lightWaves.filter(w => { w.r+=4; w.life-=0.03; return w.life>0; });

  // Push position to firebase periodically
  if (!update._tick) update._tick = 0;
  update._tick++;
  if (update._tick % 90 === 0 && myUid) {
    db.collection('users').doc(myUid).update({
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(() => {});
  }
}

// ── RENDER ──
function render() {
  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  // Nebula clouds - richer
  const t = Date.now() / 8000;
  const nebulaPoints = [
    [W*0.25, H*0.35, W*0.55, 'rgba(88,101,242,0.07)'],
    [W*0.75, H*0.6,  W*0.45, 'rgba(168,85,247,0.06)'],
    [W*0.5,  H*0.2,  W*0.3,  'rgba(255,100,150,0.04)'],
    [W*0.1,  H*0.8,  W*0.35, 'rgba(20,184,166,0.04)'],
    [W*0.9,  H*0.2,  W*0.3,  'rgba(99,102,241,0.05)'],
  ];
  nebulaPoints.forEach(([nx,ny,nr,nc],i) => {
    const ox = Math.sin(t+i)*30, oy = Math.cos(t+i*1.3)*20;
    const ng = ctx.createRadialGradient(nx+ox,ny+oy,0,nx+ox,ny+oy,nr);
    ng.addColorStop(0, nc); ng.addColorStop(1, 'transparent');
    ctx.fillStyle = ng; ctx.fillRect(0,0,W,H);
  });

  // Background stars
  bgStars.forEach(s => {
    const b = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.phase));
    if (s.type === 'glow') {
      ctx.shadowColor = 'rgba(180,200,255,0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * b, 0, Math.PI*2);
      ctx.fillStyle = `rgba(200,220,255,${b * 0.9})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (s.type === 'dust') {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(168,180,255,${b * 0.3})`;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${b * 0.7})`;
      ctx.fill();
    }
    s.phase += s.speed;
  });

  // Shooting stars
  shootingStars.forEach(s => {
    const col = s.color || '#ffffff';
    const ex = s.vx > 0 ? s.x - s.len : s.x + s.len;
    const ey = s.y - Math.abs(s.vy) * (s.len / Math.abs(s.vx));
    const grad = ctx.createLinearGradient(s.x, s.y, ex, ey);
    grad.addColorStop(0, colorWithAlpha(col, s.life));
    grad.addColorStop(1, 'transparent');
    ctx.shadowColor = col;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    // head glow dot
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${s.life})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Constellation lines between nearby users
  const allUsers = [...Object.entries(otherUsers).map(([uid,u])=>({x:u.x,y:u.y})), {x:myX,y:myY}];
  for (let i = 0; i < allUsers.length; i++) {
    for (let j = i+1; j < allUsers.length; j++) {
      const dx = allUsers[i].x - allUsers[j].x, dy = allUsers[i].y - allUsers[j].y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < 180) {
        ctx.beginPath();
        ctx.moveTo(allUsers[i].x, allUsers[i].y);
        ctx.lineTo(allUsers[j].x, allUsers[j].y);
        ctx.strokeStyle = `rgba(168,180,255,${0.12*(1-dist/180)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
  // Cosmos color tint overlay
  const hsl = `hsla(${cosmosHue},60%,15%,0.04)`;
  ctx.fillStyle = hsl; ctx.fillRect(0,0,W,H);

  // Wish stars
  wishStars.forEach(w => {
    ctx.save();
    ctx.translate(w.x, w.y);
    const sz = 6 + 3*Math.sin(w.phase);
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 20;
    for (let i=0;i<5;i++) {
      ctx.save();
      ctx.rotate((i/5)*Math.PI*2 + w.phase*0.3);
      ctx.beginPath(); ctx.moveTo(0,-sz); ctx.lineTo(sz*0.3,0); ctx.lineTo(0,-sz*0.4); ctx.lineTo(-sz*0.3,0); ctx.closePath();
      ctx.fillStyle = `rgba(255,215,0,${w.life*0.9})`; ctx.fill();
      ctx.restore();
    }
    ctx.shadowBlur = 0; ctx.restore();
  });

  // Light waves
  lightWaves.forEach(w => {
    ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(168,180,255,${w.life * 0.6})`;
    ctx.lineWidth = 2; ctx.stroke();
    if (w.r > 20) {
      ctx.beginPath(); ctx.arc(w.x, w.y, w.r*0.6, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(200,220,255,${w.life*0.3})`; ctx.lineWidth = 1; ctx.stroke();
    }
  });

  // Sparks
  sparks.forEach(s => {
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r*s.life, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${s.r>1.5?'255,200,80':'180,220,255'},${s.life})`; ctx.fill();
  });

  // Black hole
  if (blackHole) {
    ctx.save();
    ctx.translate(blackHole.x, blackHole.y);
    // Accretion disk
    for (let i=0;i<3;i++) {
      ctx.beginPath();
      ctx.arc(0, 0, blackHole.r + i*12, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(${i===0?'168,100,255':i===1?'100,150,255':'255,150,100'},${0.3-i*0.08})`;
      ctx.lineWidth = 3-i; ctx.stroke();
    }
    // Core
    const bhg = ctx.createRadialGradient(0,0,0,0,0,blackHole.r);
    bhg.addColorStop(0,'rgba(0,0,0,1)'); bhg.addColorStop(0.7,'rgba(20,0,40,0.9)'); bhg.addColorStop(1,'transparent');
    ctx.fillStyle = bhg; ctx.beginPath(); ctx.arc(0,0,blackHole.r,0,Math.PI*2); ctx.fill();
    // Rotation glow
    ctx.rotate(blackHole.phase);
    ctx.beginPath();
    ctx.ellipse(0, 0, blackHole.r*1.8, blackHole.r*0.4, 0, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(168,85,247,0.4)`; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  // Draw other users
  for (const [uid, u] of Object.entries(otherUsers)) {
    drawStar(u.x, u.y, u.data, false, u.glowPhase, u.lightTimer > 0);
  }

  // Draw me
  drawStar(myX, myY, myData, true, Date.now() / 500, false);
}

function drawStar(x, y, data, isMe, phase, isLit) {
  const emo = getEmo(data.emotion);
  const starColor = emo ? emo.c : (glows[data.glow] || glows.none).c;
  const pulseR = 22 + 4 * Math.sin(phase);
  const needHelp = data.status === '🆘 需要幫助';

  ctx.save();
  ctx.translate(x, y);

  // Outer glow
  const glowSize = isLit ? pulseR * 3 : pulseR * (isMe ? 2.2 : 1.8);
  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
  const alpha = isLit ? 0.7 : (isMe ? 0.5 : 0.3 + 0.1 * Math.sin(phase));
  grd.addColorStop(0, colorWithAlpha(starColor, alpha));

  // Simpler glow using shadow
  ctx.shadowColor = starColor;
  ctx.shadowBlur = isLit ? 40 : (isMe ? 24 : 18);

  // Core star circle
  ctx.beginPath();
  ctx.arc(0, 0, pulseR * 0.7, 0, Math.PI * 2);
  ctx.fillStyle = isMe ? starColor : (isLit ? '#fff' : starColor);
  ctx.globalAlpha = isLit ? 1 : (isMe ? 1 : 0.85);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Need help ring pulse
  if (needHelp) {
    const ringR = pulseR + 8 + 4 * Math.abs(Math.sin(phase));
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,36,66,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Me indicator
  if (isMe) {
    ctx.beginPath();
    ctx.arc(0, 0, pulseR * 0.7 + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Name
  ctx.font = `700 ${isMe ? 12 : 11}px Outfit, sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.fillText(data.name || '靈魂', 0, -pulseR - 8);
  ctx.shadowBlur = 0;

  // Emotion tag (small planet label)
  if (emo) {
    ctx.font = '600 9px Outfit, sans-serif';
    ctx.fillStyle = emo.c;
    ctx.fillText(emo.n, 0, -pulseR - 20);
  }

  // Bubble text
  if (data.bubble) {
    const bw = Math.min(ctx.measureText(data.bubble).width + 16, 140);
    ctx.fillStyle = 'rgba(15,15,30,0.85)';
    roundRectPath(ctx, -bw / 2, -pulseR - 52, bw, 22, 8);
    ctx.fill();
    ctx.font = '600 10px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const truncated = data.bubble.length > 18 ? data.bubble.slice(0, 17) + '…' : data.bubble;
    ctx.fillText(truncated, 0, -pulseR - 36);
  }

  // Music pill
  if (data.musicName) {
    ctx.fillStyle = 'rgba(29,185,84,0.9)';
    roundRectPath(ctx, -50, pulseR + 10, 100, 18, 9);
    ctx.fill();
    ctx.font = '700 9px Outfit, sans-serif';
    ctx.fillStyle = '#fff';
    const mname = data.musicName.length > 14 ? data.musicName.slice(0, 13) + '…' : data.musicName;
    ctx.fillText('🎵 ' + mname, 0, pulseR + 23);
  }

  ctx.restore();
}

function spawnLightWave(x, y) {
  lightWaves.push({ x, y, r: 10, life: 1 });
  // Broadcast to others via Firestore
  if (myUid) db.collection('effects').add({ type:'wave', x, y, fromUid:myUid, ts:firebase.firestore.FieldValue.serverTimestamp() });
}

function spawnWishStar(x, y) {
  wishStars.push({ x, y, life: 1, phase: Math.random()*Math.PI*2 });
  showToast({ av:'⭐', title:'許願星種下了', sub:'它會閃耀 30 秒', btns:'' });
}

function spawnSparks(x, y) {
  if (sparks.length > 40) return;
  if (Math.random() > 0.1) return; // throttle
  for (let i=0;i<5;i++) {
    const angle = Math.random()*Math.PI*2, spd = 1+Math.random()*2;
    sparks.push({ x, y, vx:Math.cos(angle)*spd, vy:Math.sin(angle)*spd-1, r:Math.random()*2+0.5, life:1 });
  }
}

function shakeExplosion() {
  // Push all stars away
  for (const u of Object.values(otherUsers)) {
    const dx = u.x-myX, dy = u.y-myY, dist = Math.sqrt(dx*dx+dy*dy)||1;
    u.vx += (dx/dist)*8; u.vy += (dy/dist)*8;
  }
  spawnLightWave(myX, myY);
  for (let i=0;i<20;i++) {
    const angle=Math.random()*Math.PI*2, spd=3+Math.random()*4;
    sparks.push({x:myX,y:myY,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,r:2,life:1});
  }
  showToast({av:'💥',title:'星塵爆炸！',sub:'附近的靈魂都感受到了',btns:''});
}

function checkDailyLogin() {
  const today = new Date().toDateString();
  if (lastLogin !== today) {
    const yesterday = new Date(Date.now()-86400000).toDateString();
    if (lastLogin === yesterday) {
      loginStreakDays++;
    } else {
      loginStreakDays = 1;
    }
    localStorage.setItem('se_last_login', today);
    localStorage.setItem('se_streak', loginStreakDays);
    // Daily meteor reward
    setTimeout(() => {
      const reward = loginStreakDays >= 7 ? 30 : 10;
      db.collection('users').doc(myUid).update({coins: firebase.firestore.FieldValue.increment(reward)});
      myData.coins = (myData.coins||0) + reward;
      syncUI();
      // Trigger meteor animation landing on my star
      shootingStars.push({x:-50, y:50, vx:12, vy:6, len:150, life:1, color:'#ffd700', target:true});
      showToast({av:'🌠', title:`每日流星獎勵 +🪙${reward}`, sub: loginStreakDays>=7?`連續登入 ${loginStreakDays} 天！獲得彗星加成`:`連續登入第 ${loginStreakDays} 天`, btns:''});
      if (loginStreakDays >= 7 && !myData.ownedDecos?.includes('comet')) {
        myData.ownedDecos = [...(myData.ownedDecos||[]), 'comet'];
        db.collection('users').doc(myUid).update({ownedDecos: firebase.firestore.FieldValue.arrayUnion('comet')});
        showToast({av:'☄️', title:'解鎖彗星頭飾！', sub:'7天連續登入限定獎勵', btns:''});
      }
    }, 2000);
  }
}

// Listen for others' light wave effects
function listenEffects() {
  db.collection('effects').where('ts','>', new Date(Date.now()-5000)).onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if (ch.type==='added') {
        const d = ch.doc.data();
        if (d.fromUid !== myUid) lightWaves.push({x:d.x, y:d.y, r:10, life:1});
      }
    });
  });
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── CLICK HANDLING ──
function onCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  // Check if clicked on another user
  for (const [uid, u] of Object.entries(otherUsers)) {
    const dx = cx - u.x, dy = cy - u.y;
    if (Math.sqrt(dx * dx + dy * dy) < 30) {
      showStarPopup(uid, u);
      return;
    }
  }

  // Close popup
  document.getElementById('star-popup').style.display = 'none';

  // Move to click position
  targetX = cx;
  targetY = cy;
}

// ── ROOM SYSTEM ──
async function joinRoom(roomId) {
  currentRoom = roomId;
  if (usersUnsub) usersUnsub();

  // Update my room
  await db.collection('users').doc(myUid).update({
    room: roomId,
    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
  });
  myData.room = roomId;

  // Reset positions
  myX = W / 2 + (Math.random() - 0.5) * 100;
  myY = H / 2 + (Math.random() - 0.5) * 100;
  otherUsers = {};

  // Update room label
  const label = document.getElementById('room-label');
  if (roomId === 'lobby') {
    label.textContent = '✦ 大廳';
  } else {
    const emo = getEmo(roomId);
    label.textContent = emo ? emo.n + ' 星域' : roomId;
  }

  closePanel('room-select');

  // Listen to users in this room
  const since = new Date(Date.now() - 5 * 60 * 1000);
  usersUnsub = db.collection('users')
    .where('room', '==', roomId)
    .where('lastSeen', '>', since)
    .onSnapshot(snap => {
      snap.docChanges().forEach(ch => {
        const uid = ch.doc.id;
        if (uid === myUid) return;
        const data = ch.doc.data();
        if (ch.type === 'removed') { delete otherUsers[uid]; return; }
        if (!otherUsers[uid]) {
          otherUsers[uid] = {
            data, x: Math.random() * W * 0.8 + W * 0.1,
            y: Math.random() * (H - 160) + 70,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            glowPhase: Math.random() * Math.PI * 2,
            lightTimer: 0
          };
        } else {
          otherUsers[uid].data = data;
        }
      });
      updateCosmosMood();
      updateRoomCounts();
    });
}

function openRoomSelect() {
  renderRoomGrid();
  openPanel('room-select');
}

function renderRoomGrid() {
  const grid = document.getElementById('room-grid');
  grid.innerHTML = emotions.map(e => `
    <div class="room-card" style="background:${e.c}18;border-color:${e.c}40;" onclick="joinRoom('${e.k}')">
      <div class="room-card-emoji">${e.n.split(' ')[0]}</div>
      <div class="room-card-name">${e.n.split(' ').slice(1).join(' ')} 星域</div>
      <div class="room-card-count" id="rcount-${e.k}">0 人</div>
    </div>
  `).join('');
}

async function updateRoomCounts() {
  const since = new Date(Date.now() - 5 * 60 * 1000);
  // lobby
  const lobbySnap = await db.collection('users').where('room', '==', 'lobby').where('lastSeen', '>', since).get();
  const lobbyEl = document.getElementById('lobby-count');
  if (lobbyEl) lobbyEl.textContent = lobbySnap.size;
  // emotion rooms
  for (const e of emotions) {
    const snap = await db.collection('users').where('room', '==', e.k).where('lastSeen', '>', since).get();
    const el = document.getElementById('rcount-' + e.k);
    if (el) el.textContent = snap.size + ' 人';
  }
}

function updateCosmosMood() {
  const counts = {};
  for (const u of Object.values(otherUsers)) {
    if (u.data.emotion) counts[u.data.emotion] = (counts[u.data.emotion] || 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const moodEl = document.getElementById('cosmos-mood');
  if (top) {
    const emo = getEmo(top[0]);
    const total = Object.values(otherUsers).length;
    const pct = Math.round(top[1] / total * 100);
    moodEl.textContent = `今晚 ${pct}% 的靈魂感到 ${emo ? emo.n : top[0]}`;
  } else {
    moodEl.textContent = '';
  }
}

// ── BROADCAST ──
function listenBroadcast() {
  db.collection('broadcasts').orderBy('ts', 'desc').limit(1).onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if (ch.type === 'added') {
        const d = ch.doc.data();
        if (Date.now() - (d.ts?.seconds || 0) * 1000 < 10000) {
          showMeteor(d.text, d.fromName);
        }
      }
    });
  });
}

async function sendBroadcast() {
  const text = document.getElementById('broadcast-inp').value.trim();
  if (!text) return;
  document.getElementById('broadcast-inp').value = '';
  await db.collection('broadcasts').add({
    text, fromUid: myUid, fromName: myData.name,
    ts: firebase.firestore.FieldValue.serverTimestamp()
  });
  closePanel('broadcast-panel');
}

function showMeteor(text, name) {
  const container = document.getElementById('meteor-container');
  const el = document.createElement('div');
  el.className = 'meteor-text';
  el.textContent = `✦ ${name}：${text}`;
  const y = 60 + Math.random() * (H * 0.4);
  const dur = 6 + Math.random() * 4;
  el.style.cssText = `top:${y}px; animation-duration:${dur}s;`;
  container.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 500);
}

// ── STAR POPUP ──
function showStarPopup(uid, u) {
  const d = u.data;
  const popup = document.getElementById('star-popup');
  document.getElementById('star-popup-av').innerHTML = drawAvatar(d.glow, d.deco, '60px');
  document.getElementById('star-popup-name').textContent = d.name || '靈魂';

  const emo = getEmo(d.emotion);
  document.getElementById('star-popup-emotion').innerHTML = emo
    ? `<span style="background:${emo.c};color:#fff;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;">${emo.n}</span>` : '';

  document.getElementById('star-popup-bubble').textContent = d.bubble || '';
  document.getElementById('star-popup-music').innerHTML = d.musicName
    ? `<div style="background:rgba(29,185,84,.15);border-radius:8px;padding:5px 10px;font-size:11px;font-weight:700;color:#1db954;">🎵 ${d.musicName}</div>` : '';

  document.getElementById('sp-chat-btn').onclick = () => { openChat(uid, d.name, d.glow, d.deco); popup.style.display = 'none'; };
  document.getElementById('sp-add-btn').onclick = () => { sendFR(uid, d.name); popup.style.display = 'none'; };
  const isFriend = myFriends.has(uid);
  document.getElementById('sp-add-btn').textContent = isFriend ? '✓ 好友' : '➕ 好友';
  document.getElementById('sp-add-btn').disabled = isFriend;
  document.getElementById('sp-light-btn').onclick = () => { sendLight(uid); popup.style.display = 'none'; };

  popup.style.display = 'block';
}

function closeStarPopup() {
  document.getElementById('star-popup').style.display = 'none';
}

// ── SEND LIGHT ──
async function sendLight(toUid) {
  // Trigger glow on their star
  if (otherUsers[toUid]) otherUsers[toUid].lightTimer = 3;

  // Visual burst at their position
  const u = otherUsers[toUid];
  if (u) {
    const burst = document.createElement('div');
    burst.className = 'light-burst-fx';
    burst.style.cssText = `left:${u.x}px;top:${u.y}px;`;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 700);
  }

  // Notify them via Firestore
  await db.collection('lights').add({
    to: toUid, from: myUid,
    ts: firebase.firestore.FieldValue.serverTimestamp()
  });
  showToast({ av: '✨', title: '送光成功！', sub: '對方會感受到你的溫暖', btns: '' });
}

// Listen for incoming lights
function listenLights() {
  db.collection('lights').where('to', '==', myUid).where('ts', '>', new Date(Date.now() - 5000))
    .onSnapshot(snap => {
      snap.docChanges().forEach(ch => {
        if (ch.type === 'added') {
          // Make my star glow
          const burst = document.createElement('div');
          burst.className = 'light-burst-fx';
          burst.style.cssText = `left:${myX}px;top:${myY}px;`;
          document.body.appendChild(burst);
          setTimeout(() => burst.remove(), 700);
          showToast({ av: '✨', title: '有人送你一道光', sub: '感受到了嗎？', btns: '' });
        }
      });
    });
}

// ── BUBBLE SHEET ──
function openBubbleSheet() {
  document.getElementById('bubble-ta').value = myData.bubble || '';
  document.getElementById('char-ct').textContent = `${(myData.bubble || '').length}/60`;
  selectedEmotion = myData.emotion || '';
  selectedMusic = myData.musicUrl ? { name: myData.musicName, url: myData.musicUrl, art: myData.musicArt } : null;
  renderEmoGrid();
  renderSelectedMusic();
  openPanel('bubble-sheet');
}

document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('bubble-ta');
  if (ta) ta.addEventListener('input', function () { document.getElementById('char-ct').textContent = `${this.value.length}/60`; });
});

function renderEmoGrid() {
  document.getElementById('emo-row').innerHTML = emotions.map(e =>
    `<button class="emo-pill ${selectedEmotion === e.k ? 'active' : ''}" style="background:${e.c};" onclick="selEmo('${e.k}')">${e.n}</button>`
  ).join('');
}
function selEmo(k) { selectedEmotion = selectedEmotion === k ? '' : k; renderEmoGrid(); }

function onMusicSearch(val) {
  clearTimeout(musicSearchTimer);
  const el = document.getElementById('yt-results');
  if (!val.trim()) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="music-loading">搜尋中...</div>';
  musicSearchTimer = setTimeout(async () => {
    const r = await ytSearch(val);
    if (!r.length) { el.innerHTML = '<div class="music-loading">沒有找到結果</div>'; return; }
    renderMusicResults(r, el);
  }, 500);
}
function renderMusicResults(results, el) {
  el.innerHTML = results.map((r, i) =>
    `<div class="music-result-item" onclick="selectMusic(${i})">
      <img class="music-result-art" src="${r.art || ''}" onerror="this.style.background='#222'">
      <div><div class="music-result-name">${r.name}</div><div class="music-result-artist">${r.artist}</div></div>
    </div>`
  ).join('');
  el._results = results;
}
function selectMusic(idx) {
  const el = document.getElementById('yt-results');
  selectedMusic = (el._results || [])[idx] || null;
  if (!selectedMusic) return;
  el.innerHTML = '';
  document.getElementById('yt-inp').value = '';
  renderSelectedMusic();
}
function renderSelectedMusic() {
  const el = document.getElementById('selected-music');
  if (!selectedMusic) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.innerHTML = `<div class="music-selected">
    <img class="music-result-art" src="${selectedMusic.art || ''}" onerror="this.style.background='#222'">
    <div style="flex:1;min-width:0;"><div class="music-selected-name">🎵 ${selectedMusic.name}</div><div class="music-selected-artist">${selectedMusic.artist || ''}</div></div>
    <button class="music-clear" onclick="clearMusic()">✕</button>
  </div>`;
}
function clearMusic() { selectedMusic = null; renderSelectedMusic(); }

async function saveBubble() {
  const bubble = document.getElementById('bubble-ta').value.trim();
  const u = {
    bubble, emotion: selectedEmotion,
    musicUrl: selectedMusic?.url || '', musicName: selectedMusic?.name || '',
    musicArt: selectedMusic?.art || '',
    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
  };
  myData = { ...myData, ...u };
  await db.collection('users').doc(myUid).update(u);
  closePanel('bubble-sheet');
  showToast({ av: '', title: '對話雲已更新 ✦', sub: '宇宙中的靈魂能看到你的狀態了', btns: '' });
}

// ── CHAT ──
function getChatId(a, b) { return [a, b].sort().join('_'); }

function openChat(uid, name, glow, deco) {
  closeStarPopup();
  chatTargetUid = uid;
  document.getElementById('chat-name').textContent = name;
  document.getElementById('chat-av').innerHTML = drawAvatar(glow, deco, '40px');
  document.getElementById('chat-fr-btn').innerHTML = myFriends.has(uid)
    ? `<span style="font-size:11px;color:#22c55e;font-weight:700;">✓ 好友</span>`
    : `<button onclick="sendFR('${uid}','${name}')" style="background:rgba(255,255,255,.08);border:none;border-radius:9px;padding:6px 11px;font-size:11px;font-weight:700;cursor:pointer;color:#fff;">➕ 加好友</button>`;

  if (chatUnsub) chatUnsub();
  const chatId = getChatId(myUid, uid);
  db.collection('chats').doc(chatId).set({ [`unread_${myUid}`]: 0 }, { merge: true });

  // Mark as read + listen typing
  const typingRef = db.collection('chats').doc(chatId);

  chatUnsub = db.collection('chats').doc(chatId).collection('messages')
    .orderBy('ts').onSnapshot(snap => {
      const c = document.getElementById('chat-msgs');
      c.innerHTML = '';
      snap.forEach(doc => {
        const m = doc.data(), mine = m.sender === myUid;
        const ts = m.ts ? new Date(m.ts.seconds * 1000).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '';
        const div = document.createElement('div');
        div.className = `msg ${mine ? 'mine' : 'theirs'}`;
        div.innerHTML = `${m.text}<div class="msg-t">${ts}${mine && m.read ? ' · 已讀' : ''}</div>`;
        c.appendChild(div);
      });
      c.scrollTop = c.scrollHeight;
      // Mark incoming as read
      if (snap.docs.length > 0) {
        const last = snap.docs[snap.docs.length - 1].data();
        if (last.sender !== myUid) {
          db.collection('chats').doc(chatId).collection('messages').doc(snap.docs[snap.docs.length - 1].id).update({ read: true }).catch(() => {});
        }
      }
    });

  // Listen typing indicator
  typingRef.onSnapshot(doc => {
    const d = doc.data();
    const isTyping = d && d[`typing_${uid}`] && Date.now() / 1000 - (d[`typing_${uid}`]?.seconds || 0) < 4;
    document.getElementById('typing-indicator').style.display = isTyping ? 'block' : 'none';
  });

  document.getElementById('chat-panel').classList.add('open');
  document.getElementById('chat-inp').focus();
}

function closeChat() {
  document.getElementById('chat-panel').classList.remove('open');
  if (chatUnsub) { chatUnsub(); chatUnsub = null; }
  chatTargetUid = null;
}

function onTyping() {
  if (!chatTargetUid) return;
  const chatId = getChatId(myUid, chatTargetUid);
  db.collection('chats').doc(chatId).set(
    { [`typing_${myUid}`]: firebase.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    db.collection('chats').doc(chatId).set({ [`typing_${myUid}`]: null }, { merge: true });
  }, 3000);
}

async function sendMsg() {
  const inp = document.getElementById('chat-inp');
  const text = inp.value.trim();
  if (!text || !chatTargetUid) return;
  inp.value = '';
  const chatId = getChatId(myUid, chatTargetUid);

  // First chat bonus
  const chatted = myData.chatted || [];
  if (!chatted.includes(chatTargetUid)) {
    myData.chatted = [...chatted, chatTargetUid];
    myData.coins = (myData.coins || 0) + 5;
    await db.collection('users').doc(myUid).update({
      chatted: firebase.firestore.FieldValue.arrayUnion(chatTargetUid),
      coins: firebase.firestore.FieldValue.increment(5)
    });
    popCoin('+5 🪙');
    showToast({ av: '', title: '初次互動獎勵！', sub: '你獲得 🪙 5 代幣', btns: '' });
    syncUI();
  }

  await db.collection('chats').doc(chatId).collection('messages').add({
    text, sender: myUid, read: false,
    ts: firebase.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('chats').doc(chatId).set({
    participants: [myUid, chatTargetUid],
    lastMsg: text,
    lastTs: firebase.firestore.FieldValue.serverTimestamp(),
    [`unread_${chatTargetUid}`]: firebase.firestore.FieldValue.increment(1),
    [`typing_${myUid}`]: null
  }, { merge: true });
}

function listenChats() {
  db.collection('chats').where('participants', 'array-contains', myUid).onSnapshot(snap => {
    let total = 0;
    snap.docChanges().forEach(ch => {
      const d = ch.doc.data();
      const other = d.participants?.find(u => u !== myUid);
      if (ch.type === 'modified' && other && other !== chatTargetUid) {
        const un = d[`unread_${myUid}`] || 0;
        if (un > 0) {
          db.collection('users').doc(other).get().then(u => {
            if (u.exists) {
              const ud = u.data();
              showToast({
                av: drawAvatar(ud.glow, ud.deco, '40px'), title: ud.name,
                sub: `💬 ${d.lastMsg}`,
                btns: `<button class="tbtn open" onclick="openChat('${other}','${ud.name}','${ud.glow}','${ud.deco}');hideToast()">查看</button>`
              });
            }
          });
        }
      }
      total += d[`unread_${myUid}`] || 0;
    });
    const badge = document.getElementById('friends-badge');
    if (total > 0) { badge.style.display = 'flex'; badge.textContent = total > 9 ? '9+' : total; }
    else badge.style.display = 'none';
  });
}

// ── HELP ──
function listenHelpRequests() {
  db.collection('helpRequests').where('status', 'in', ['open', 'helping']).onSnapshot(snap => {
    const list = [];
    snap.forEach(doc => { list.push({ id: doc.id, ...doc.data() }); });
    renderHelpList(list);
  });
}
async function postHelpRequest() {
  const text = document.getElementById('help-input').value.trim();
  if (!text) return;
  document.getElementById('help-input').value = '';
  await db.collection('helpRequests').add({
    text, fromUid: myUid, fromName: myData.name,
    fromGlow: myData.glow, fromDeco: myData.deco,
    status: 'open', helperUid: null,
    ts: firebase.firestore.FieldValue.serverTimestamp()
  });
}
async function acceptHelp(id) {
  await db.collection('helpRequests').doc(id).update({ status: 'helping', helperUid: myUid });
  const req = (await db.collection('helpRequests').doc(id).get()).data();
  nav('space');
  openChat(req.fromUid, req.fromName, req.fromGlow || 'cyan', req.fromDeco || 'none');
  setTimeout(() => { document.getElementById('chat-inp').value = '我看到你的求助，我可以幫忙！'; }, 400);
}
async function completeHelp(id, helperUid) {
  await db.collection('helpRequests').doc(id).update({ status: 'done' });
  await db.collection('users').doc(myUid).update({ received: firebase.firestore.FieldValue.increment(1) });
  myData.received = (myData.received || 0) + 1;
  if (!myData.firstHelpDone) {
    myData.firstHelpDone = true;
    await db.collection('users').doc(myUid).update({ firstHelpDone: true });
    if (myData.invitedBy) await db.collection('users').doc(myData.invitedBy).update({ coins: firebase.firestore.FieldValue.increment(100) });
  }
  syncUI();
  if (helperUid) openRewardModal(helperUid);
}
async function helperComplete(id) {
  await db.collection('helpRequests').doc(id).update({ status: 'done' });
  await db.collection('users').doc(myUid).update({ helped: firebase.firestore.FieldValue.increment(1), coins: firebase.firestore.FieldValue.increment(20) });
  myData.helped = (myData.helped || 0) + 1;
  myData.coins = (myData.coins || 0) + 20;
  // Gold glow effect on my star
  setTimeout(() => {
    for (let i=0;i<15;i++) {
      const angle=Math.random()*Math.PI*2, spd=2+Math.random()*3;
      sparks.push({x:myX,y:myY,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,r:2.5,life:1});
    }
  }, 100);
  syncUI(); popCoin('+20 🪙');
  showToast({ av: '', title: '感謝你的幫助！', sub: '你獲得了 🪙 20 代幣', btns: '' });
}
async function cancelHelp(id) { await db.collection('helpRequests').doc(id).update({ status: 'done' }); }

function renderHelpList(list) {
  const el = document.getElementById('help-list');
  if (!list.length) { el.innerHTML = '<div class="empty"><div class="emoji">🌟</div><p>目前沒有求助</p></div>'; return; }
  el.innerHTML = list.map(h => {
    const isMe = h.fromUid === myUid, isHelper = h.helperUid === myUid;
    const ts = h.ts ? new Date(h.ts.seconds * 1000).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '';
    const tagCls = h.status === 'open' ? 'tag-open' : h.status === 'helping' ? 'tag-helping' : 'tag-done';
    const tagTxt = h.status === 'open' ? '🔴 等待幫助' : h.status === 'helping' ? '🟢 幫助中' : '✅ 已完成';
    return `<div class="help-card">
      <span class="status-tag ${tagCls}">${tagTxt}</span>
      <div class="help-card-top">
        <div style="width:40px;height:40px;">${drawAvatar(h.fromGlow, h.fromDeco, '40px')}</div>
        <div><div class="help-card-name">${h.fromName}</div><div class="help-card-time">${ts}</div></div>
      </div>
      <div class="help-card-text">${h.text}</div>
      <div class="help-card-btns">
        ${isMe && h.status !== 'done' ? `<button class="hbtn done" onclick="completeHelp('${h.id}','${h.helperUid || ''}')">✅ 已解決</button><button class="hbtn cancel" onclick="cancelHelp('${h.id}')">取消</button>` : ''}
        ${isHelper && h.status === 'helping' ? `<button class="hbtn done" onclick="helperComplete('${h.id}')">✅ 完成幫助</button>` : ''}
        ${!isMe && !isHelper && h.status === 'open' ? `<button class="hbtn accept" onclick="acceptHelp('${h.id}')">🤝 我來幫忙</button>` : ''}
        ${!isMe ? `<button class="hbtn cancel" onclick="openChat('${h.fromUid}','${h.fromName}','${h.fromGlow || 'cyan'}','${h.fromDeco || 'none'}')">💬 聊天</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ── REWARD MODAL ──
function openRewardModal(helperUid) {
  pendingRewardHelperUid = helperUid;
  document.getElementById('my-coin-display').textContent = myData.coins || 0;
  document.getElementById('coin-slider').value = 10;
  document.getElementById('coin-val').textContent = 10;
  document.getElementById('reward-btn-val').textContent = 10;
  document.getElementById('coin-slider').oninput = function () {
    document.getElementById('coin-val').textContent = this.value;
    document.getElementById('reward-btn-val').textContent = this.value;
  };
  document.getElementById('reward-modal').classList.add('open');
}
async function confirmReward() {
  const amount = parseInt(document.getElementById('coin-slider').value) || 10;
  if ((myData.coins || 0) < amount) { showToast({ av: '', title: '代幣不足', sub: `你只有 🪙 ${myData.coins || 0}`, btns: '' }); closeRewardModal(); return; }
  await db.collection('users').doc(myUid).update({ coins: firebase.firestore.FieldValue.increment(-amount) });
  myData.coins = (myData.coins || 0) - amount;
  if (pendingRewardHelperUid) await db.collection('users').doc(pendingRewardHelperUid).update({ coins: firebase.firestore.FieldValue.increment(amount) });
  closeRewardModal(); syncUI();
  showToast({ av: '', title: `已送出 🪙 ${amount} 代幣`, sub: '謝謝對方的幫助！', btns: '' });
}
function closeRewardModal() { document.getElementById('reward-modal').classList.remove('open'); pendingRewardHelperUid = null; }

function popCoin(text) {
  const el = document.createElement('div');
  el.className = 'coin-pop';
  el.textContent = text;
  el.style.cssText = `left:${20 + Math.random() * 60}%;top:40%;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// ── FRIENDS ──
async function sendFR(toUid, toName) {
  const ex = await db.collection('friendRequests').where('from', '==', myUid).where('to', '==', toUid).get();
  if (!ex.empty) { showToast({ av: '', title: '已發送過了', sub: '', btns: '' }); return; }
  await db.collection('friendRequests').add({
    from: myUid, to: toUid, fromName: myData.name,
    fromGlow: myData.glow, fromDeco: myData.deco,
    status: 'pending', ts: firebase.firestore.FieldValue.serverTimestamp()
  });
  showToast({ av: '', title: '好友申請已送出 ✓', sub: '', btns: '' });
}
function listenFriendRequests() {
  db.collection('friendRequests').where('to', '==', myUid).where('status', '==', 'pending').onSnapshot(snap => {
    incomingReqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById('req-tab').textContent = incomingReqs.length ? `申請請求 (${incomingReqs.length})` : '申請請求';
    snap.docChanges().forEach(ch => {
      if (ch.type === 'added') {
        const r = ch.doc.data();
        showToast({
          av: drawAvatar(r.fromGlow, r.fromDeco, '40px'), title: r.fromName, sub: '想加你為好友',
          btns: `<button class="tbtn ok" onclick="acceptFR('${ch.doc.id}');hideToast()">接受</button><button class="tbtn no" onclick="rejectFR('${ch.doc.id}');hideToast()">拒絕</button>`
        });
      }
    });
    if (currentFTab === 'requests') renderRequests();
  });
  db.collection('friendRequests').where('from', '==', myUid).where('status', '==', 'accepted').onSnapshot(snap => { snap.forEach(d => myFriends.add(d.data().to)); updateFriendCount(); });
  db.collection('friendRequests').where('to', '==', myUid).where('status', '==', 'accepted').onSnapshot(snap => { snap.forEach(d => myFriends.add(d.data().from)); updateFriendCount(); if (currentFTab === 'friends') renderFriends(); });
}
async function acceptFR(id) { await db.collection('friendRequests').doc(id).update({ status: 'accepted' }); }
async function rejectFR(id) { await db.collection('friendRequests').doc(id).update({ status: 'rejected' }); }
function updateFriendCount() { document.getElementById('s-friends').textContent = myFriends.size; }
function switchFTab(t) {
  currentFTab = t;
  document.querySelectorAll('.ftab').forEach(el => el.classList.remove('active'));
  document.getElementById(t === 'friends' ? 'ftab-friends' : 'req-tab').classList.add('active');
  t === 'friends' ? renderFriends() : renderRequests();
}
async function renderFriends() {
  const c = document.getElementById('friends-content');
  if (!myFriends.size) { c.innerHTML = '<div class="empty"><div class="emoji">👻</div><p>還沒有好友<br>複製邀請連結傳給朋友吧！</p></div>'; return; }
  c.innerHTML = '';
  for (const uid of myFriends) {
    const snap = await db.collection('users').doc(uid).get();
    if (!snap.exists) continue;
    const d = snap.data(), chatId = getChatId(myUid, uid);
    const cs = await db.collection('chats').doc(chatId).get();
    const lastMsg = cs.exists ? (cs.data().lastMsg || '點擊開始聊天') : '點擊開始聊天';
    const unread = cs.exists ? (cs.data()[`unread_${myUid}`] || 0) : 0;
    const card = document.createElement('div');
    card.className = 'friend-card';
    card.onclick = () => { nav('space'); openChat(uid, d.name, d.glow, d.deco); };
    card.innerHTML = `<div style="width:52px;height:52px;">${drawAvatar(d.glow, d.deco, '52px')}</div>
      <div class="friend-info"><div class="friend-name">${d.name}</div><div class="friend-last">💬 ${lastMsg}</div></div>
      ${unread > 0 ? `<div class="unread-dot">${unread}</div>` : ''}`;
    c.appendChild(card);
  }
}
function renderRequests() {
  const c = document.getElementById('friends-content');
  if (!incomingReqs.length) { c.innerHTML = '<div class="empty"><div class="emoji">📭</div><p>沒有待處理的申請</p></div>'; return; }
  c.innerHTML = incomingReqs.map(r =>
    `<div class="friend-card">
      <div style="width:52px;height:52px;">${drawAvatar(r.fromGlow, r.fromDeco, '52px')}</div>
      <div class="friend-info"><div class="friend-name">${r.fromName}</div><div class="friend-last">想加你為好友</div></div>
      <div class="req-btns"><button class="rbtn ok" onclick="acceptFR('${r.id}')">接受</button><button class="rbtn no" onclick="rejectFR('${r.id}')">拒絕</button></div>
    </div>`
  ).join('');
}
function copyInviteLink() {
  navigator.clipboard.writeText(`${location.origin}/?invite=${myUid}`)
    .then(() => showToast({ av: '', title: '複製成功！', sub: '朋友完成第一次幫助，你獲得 🪙 100', btns: '' }));
}
function checkInviteParam() {
  const p = new URLSearchParams(location.search), inv = p.get('invite');
  if (inv && inv !== myUid) {
    db.collection('users').doc(inv).get().then(snap => {
      if (!snap.exists) return;
      const d = snap.data();
      showToast({
        av: drawAvatar(d.glow, d.deco, '40px'), title: d.name, sub: '邀請你進入宇宙',
        btns: `<button class="tbtn ok" onclick="sendFRAndSetInviter('${inv}','${d.name}');hideToast()">加好友</button><button class="tbtn no" onclick="hideToast()">略過</button>`
      });
    });
    history.replaceState({}, '', location.pathname);
  }
}
async function sendFRAndSetInviter(uid, name) {
  if (!myData.invitedBy) { myData.invitedBy = uid; await db.collection('users').doc(myUid).update({ invitedBy: uid }); }
  sendFR(uid, name);
}

// ── TOAST ──
function showToast({ av, title, sub, btns }) {
  if (toastTimer) clearTimeout(toastTimer);
  document.getElementById('toast-av').innerHTML = av;
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-sub').textContent = sub;
  document.getElementById('toast-btns').innerHTML = btns;
  document.getElementById('toast').classList.add('show');
  toastTimer = setTimeout(hideToast, 6000);
}
function hideToast() { document.getElementById('toast').classList.remove('show'); }

// ── SHOP ──
function renderShopView() {
  const og = myData.ownedGlows || ['none', 'cyan'];
  const od = myData.ownedDecos || ['none', 'headphone', 'angel'];
  document.getElementById('shop-glow-grid').innerHTML = Object.entries(glows).map(([k, v]) => {
    const own = og.includes(k), eq = myData.glow === k;
    return `<div class="shop-item ${eq ? 'equipped' : own ? 'owned' : ''}" onclick="shopAction('glow','${k}',${v.price},${own})">
      <div style="height:56px;">${drawAvatar(k, 'none', '56px')}</div>
      <small>${v.n}</small>
      ${eq ? `<div class="equipped-tag">✓ 裝備中</div>` : own ? `<div class="owned-tag">已擁有</div>` : `<div class="price-tag">🪙 ${v.price}</div>`}
    </div>`;
  }).join('');
  document.getElementById('shop-deco-grid').innerHTML = Object.entries(decos).map(([k, v]) => {
    const own = od.includes(k), eq = myData.deco === k;
    return `<div class="shop-item ${eq ? 'equipped' : own ? 'owned' : ''}" onclick="shopAction('deco','${k}',${v.price},${own})">
      <div style="height:56px;">${drawAvatar('none', k, '56px')}</div>
      <small>${v.n}</small>
      ${eq ? `<div class="equipped-tag">✓ 裝備中</div>` : own ? `<div class="owned-tag">已擁有</div>` : `<div class="price-tag">🪙 ${v.price}</div>`}
    </div>`;
  }).join('');
}
async function shopAction(type, key, price, isOwned) {
  if (isOwned) {
    myData[type] = key;
    await db.collection('users').doc(myUid).update({ [type]: key });
    syncUI(); renderShopView();
    showToast({ av: '', title: '裝備已更換 ✦', sub: '', btns: '' });
    return;
  }
  if ((myData.coins || 0) < price) { showToast({ av: '', title: '代幣不足', sub: `還需要 🪙 ${price - (myData.coins || 0)}`, btns: '' }); return; }
  if (!confirm(`花費 🪙 ${price} 購買？`)) return;
  myData.coins = (myData.coins || 0) - price;
  myData[type] = key;
  const ok = type === 'glow' ? 'ownedGlows' : 'ownedDecos';
  myData[ok] = [...(myData[ok] || []), key];
  await db.collection('users').doc(myUid).update({ coins: myData.coins, [type]: key, [ok]: firebase.firestore.FieldValue.arrayUnion(key) });
  syncUI(); renderShopView(); popCoin(`-${price} 🪙`);
  showToast({ av: '', title: '購買成功！', sub: '已自動裝備', btns: '' });
}

// ── PROFILE ──
async function updateProfile(k, v) {
  myData[k] = v;
  await db.collection('users').doc(myUid).update({ [k]: v });
  syncUI();
}
function syncUI() {
  if (!myUid) return;
  document.getElementById('me-avatar').innerHTML = drawAvatar(myData.glow, myData.deco, '86px');
  document.getElementById('me-name').value = myData.name || '';
  document.getElementById('ig-handle').value = myData.igHandle || '';
  document.getElementById('s-helped').textContent = myData.helped || 0;
  document.getElementById('s-recv').textContent = myData.received || 0;
  document.getElementById('s-coins').textContent = myData.coins || 0;
  document.getElementById('hud-coin-val').textContent = myData.coins || 0;
  const total = (myData.helped || 0) + (myData.received || 0);
  document.getElementById('me-title').textContent = titles[Math.min(Math.floor(total / 10), titles.length - 1)];
  document.getElementById('status-pills').innerHTML = statuses.map(s =>
    `<div class="spill ${myData.status === s ? 'active' : ''}" onclick="updateProfile('status','${s}')">${s}</div>`
  ).join('');
  renderShopView();
}

// ── NAV ──
function nav(v) {
  document.querySelectorAll('.view').forEach(e => e.style.display = 'none');
  document.querySelectorAll('.overlay-panel').forEach(e => e.style.display = 'none');
  document.getElementById('star-popup').style.display = 'none';
  if (v === 'space') {
    // back to space - nothing to show, canvas is always there
  } else {
    const el = document.getElementById('view-' + v);
    if (el) {
      el.style.display = 'block';
      if (v === 'friends') renderFriends();
      if (v === 'me') renderShopView();
      if (v === 'help') listenHelpRequests();
    }
  }
}

// ── PANEL HELPERS ──
function openPanel(id) {
  document.querySelectorAll('.overlay-panel').forEach(e => e.style.display = 'none');
  const el = document.getElementById(id);
  if (el) { el.style.display = 'block'; el.scrollTop = 0; }
  if (id === 'bubble-sheet') {
    renderEmoGrid();
    document.getElementById('bubble-ta').value = myData.bubble || '';
    selectedEmotion = myData.emotion || '';
    selectedMusic = myData.musicUrl ? { name: myData.musicName, url: myData.musicUrl, art: myData.musicArt } : null;
    renderSelectedMusic();
  }
  if (id === 'room-select') renderRoomGrid();
}
function closePanel(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// ── SOUL CARD ──
function openSoulCard() { document.getElementById('card-modal').classList.add('open'); drawSoulCard(); }
async function drawSoulCard() {
  const canvas = document.getElementById('soul-canvas'), ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#08080a'); bg.addColorStop(.5, '#120b1e'); bg.addColorStop(1, '#080c1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 4000; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * .022})`; ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1); }
  const gc = (glows[myData.glow] || glows.none).c;
  const emo = getEmo(myData.emotion), accent = emo ? emo.c : gc;
  [[W * .5, H * .28, 200, gc + '44'], [W * .15, H * .65, 140, colorWithAlpha('#a855f7', 0.15)], [W * .85, H * .55, 110, colorWithAlpha('#5865f2', 0.13)]].forEach(([x, y, r, c]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  ctx.strokeStyle = accent + '99'; ctx.lineWidth = 2;
  [[22, 22, 58, 22, 22, 58], [W - 22, 22, W - 58, 22, W - 22, 58], [22, H - 22, 58, H - 22, 22, H - 58], [W - 22, H - 22, W - 58, H - 22, W - 22, H - 58]].forEach(([x1, y1, x2, y2, x3, y3]) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.moveTo(x1, y1); ctx.lineTo(x3, y3); ctx.stroke();
  });
  const svgBlob = new Blob([drawAvatar(myData.glow, myData.deco, '200px')], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);
  await new Promise(res => { const img = new Image(); img.onload = () => { ctx.drawImage(img, W / 2 - 96, H * .08, 192, 192); URL.revokeObjectURL(svgUrl); res(); }; img.src = svgUrl; });
  const emoY = H * .08 + 198;
  if (emo) { ctx.fillStyle = emo.c; rrect(ctx, W / 2 - 46, emoY, 92, 24, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 11px Outfit,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(emo.n, W / 2, emoY + 16); }
  const nameY = emoY + (emo ? 38 : 18);
  ctx.save(); ctx.shadowColor = accent; ctx.shadowBlur = 24; ctx.fillStyle = '#fff'; ctx.font = '900 32px Outfit,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(myData.name || '匿名靈魂', W / 2, nameY); ctx.restore();
  const tg = ctx.createLinearGradient(W / 2 - 52, nameY + 10, W / 2 + 52, nameY + 36); tg.addColorStop(0, '#f59e0b'); tg.addColorStop(1, '#ef4444');
  ctx.fillStyle = tg; rrect(ctx, W / 2 - 54, nameY + 10, 108, 28, 8); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 12px Outfit,sans-serif'; ctx.fillText(document.getElementById('me-title').textContent, W / 2, nameY + 28);
  if (myData.igHandle) { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '600 12px Outfit,sans-serif'; ctx.fillText(`@${myData.igHandle}`, W / 2, nameY + 50); }
  let cY = nameY + (myData.igHandle ? 68 : 52);
  if (myData.bubble) { ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1; rrect(ctx, 32, cY, W - 64, myData.bubble.length > 28 ? 56 : 36, 12); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '400 13px Outfit,sans-serif'; ctx.fillText(`"${myData.bubble.slice(0, 32)}"`, W / 2, cY + 20); if (myData.bubble.length > 32) ctx.fillText(myData.bubble.slice(32, 60), W / 2, cY + 38); cY += myData.bubble.length > 28 ? 72 : 52; }
  if (myData.musicName) { ctx.fillStyle = '#1db954'; rrect(ctx, W / 2 - 90, cY, 180, 32, 10); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 12px Outfit,sans-serif'; ctx.fillText(`🎵  ${myData.musicName.slice(0, 24)}`, W / 2, cY + 21); cY += 46; }
  const divY = H * .7; ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(40, divY); ctx.lineTo(W - 40, divY); ctx.stroke();
  [{ n: myData.helped || 0, l: '幫助次數' }, { n: myData.coins || 0, l: '🪙 代幣' }, { n: myFriends.size, l: '好友數' }].forEach((s, i) => {
    const x = 68 + i * 128; ctx.fillStyle = '#fff'; ctx.font = '900 26px Outfit,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(s.n, x, divY + 38); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = '600 10px Outfit,sans-serif'; ctx.fillText(s.l, x, divY + 56);
  });
  const profileUrl = `${location.origin}/?invite=${myUid}`;
  try { const qrDataUrl = await QRCode.toDataURL(profileUrl, { width: 80, margin: 1, color: { dark: '#ffffff', light: '#00000000' } }); await new Promise(res => { const qi = new Image(); qi.onload = () => { ctx.drawImage(qi, W - 96, H - 100, 72, 72); res(); }; qi.src = qrDataUrl; }); } catch (e) {}
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.font = '700 11px Outfit,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('✦ SoulEcho', 24, H - 22);
  ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.font = '400 9px Outfit,sans-serif'; ctx.fillText('掃描 QR 認識我', W - 96, H - 12);
}
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }
function downloadCard() { const a = document.createElement('a'); a.download = `SoulEcho_${myData.name || 'card'}.png`; a.href = document.getElementById('soul-canvas').toDataURL('image/png'); a.click(); }
async function shareToIG() {
  const canvas = document.getElementById('soul-canvas'), profileUrl = `${location.origin}/?invite=${myUid}`;
  canvas.toBlob(async blob => {
    const file = new File([blob], 'soulecho.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'SoulEcho', text: profileUrl }); return; } catch (e) {} }
    downloadCard();
    await navigator.clipboard.writeText(profileUrl).catch(() => {});
    setTimeout(() => { window.open('instagram://story-camera', '_blank'); }, 300);
    showToast({ av: '', title: '圖片已儲存！連結已複製', sub: 'IG 限動 → 上傳 → 加連結貼紙', btns: '' });
  }, 'image/png');
}

// ── PWA ──
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
  if (!localStorage.getItem('pwa_dismissed')) document.getElementById('install-banner').classList.add('show');
});
function installPWA() { if (!deferredPrompt) return; deferredPrompt.prompt(); deferredPrompt.userChoice.then(() => { document.getElementById('install-banner').classList.remove('show'); deferredPrompt = null; }); }
function dismissInstall() { document.getElementById('install-banner').classList.remove('show'); localStorage.setItem('pwa_dismissed', '1'); }
window.addEventListener('appinstalled', () => document.getElementById('install-banner').classList.remove('show'));
