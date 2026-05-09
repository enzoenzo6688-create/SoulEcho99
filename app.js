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

// ── STATE ──
let myUid = null;
let currentChatId = null;
let chatUnsub = null;
let toastTimer = null;
let idleTimer = null;
let hasInteracted = false;

// ── FRAGMENT COLORS ──
const COLORS = [
  'rgba(244,164,192,0.9)',
  'rgba(180,160,255,0.9)',
  'rgba(164,196,244,0.9)',
  'rgba(196,244,164,0.9)',
  'rgba(244,220,164,0.9)',
  'rgba(212,164,244,0.9)'
];

// ── 宇宙回聲語料庫 ──
const ECHO_RESPONSES = {
  tired: [
    '說出來了就不用一個人扛著了。',
    '累的時候不需要解釋為什麼累。',
    '你不需要撐得好看。'
  ],
  lonely: [
    '這裡有人看見你說的話。',
    '想說話這件事本身就很勇敢。',
    '你不是唯一一個有這種感覺的人。'
  ],
  confused: [
    '說不清楚沒關係。說不清楚本來就是這種感覺。',
    '有些事不需要說清楚，先說出來就好。',
    '不知道怎麼說，也可以只是待著。'
  ],
  okay: [
    '「還好」有時候是很重的兩個字。',
    '你願意待著，就夠了。',
    '嗯。我知道了。'
  ],
  short: [
    '嗯。我知道了。',
    '你說的，我聽到了。',
    '這裡有人在。'
  ],
  default: [
    '你說的，我聽到了。',
    '這裡有人在。',
    '說出來就不一樣了。',
    '謝謝你願意說。',
    '嗯。我知道了。'
  ]
};

// ── 種子碎片（冷啟動用）──
const SEED_FRAGMENTS = [
  { text: '今天沒有特別難過\n只是不想一個人待著', color: COLORS[0] },
  { text: '說了對不起\n但其實也不知道為什麼要道歉', color: COLORS[1] },
  { text: '好想睡著\n但又怕醒來', color: COLORS[2] },
  { text: '朋友說「不就這樣嗎」\n從此我就不說了', color: COLORS[3] },
  { text: '腦袋裡有很多話\n但說出來好像都變了形', color: COLORS[4] },
  { text: '其實還好\n只是有點需要有人說一聲「你辛苦了」', color: COLORS[5] },
  { text: '不知道在等什麼\n就是在等', color: COLORS[0] },
  { text: '今天對一個陌生人笑了\n那個笑比對朋友的都真', color: COLORS[2] }
];

// ── STAR CANVAS ──
const starCanvas = document.getElementById('star-canvas');
const sCtx = starCanvas.getContext('2d');
let stars = [];

function initStars() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  stars = Array.from({ length: 130 }, () => ({
    x: Math.random() * starCanvas.width,
    y: Math.random() * starCanvas.height,
    r: Math.random() * 1.3 + 0.2,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.006 + 0.002
  }));
}
function drawStars() {
  sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  stars.forEach(s => {
    s.phase += s.speed;
    const a = 0.06 + 0.32 * (0.5 + 0.5 * Math.sin(s.phase));
    sCtx.beginPath();
    sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sCtx.fillStyle = `rgba(255,255,255,${a})`;
    sCtx.fill();
  });
  requestAnimationFrame(drawStars);
}
window.addEventListener('resize', initStars);
initStars();
drawStars();

// ── AUTH ──
auth.onAuthStateChanged(user => {
  if (user) {
    myUid = user.uid;
    updateOnlineCount();
    setInterval(updateOnlineCount, 30000);
    db.collection('presence').doc(myUid).set({ t: firebase.firestore.FieldValue.serverTimestamp() });
    setInterval(() => db.collection('presence').doc(myUid).set({ t: firebase.firestore.FieldValue.serverTimestamp() }), 20000);
    checkSeedFragments();
    setupEntryScreen();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  } else {
    auth.signInAnonymously().catch(e => console.error(e));
  }
});

// ── ONLINE COUNT ──
async function updateOnlineCount() {
  try {
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const snap = await db.collection('presence').where('t', '>', since).get();
    const el = document.getElementById('online-num');
    if (el) el.textContent = Math.max(snap.size, 1);
  } catch(e) {}
}

// ── SEED FRAGMENTS（冷啟動）──
async function checkSeedFragments() {
  try {
    const snap = await db.collection('fragments').limit(1).get();
    if (snap.empty) {
      // 植入種子碎片，分散在過去2小時
      const now = Date.now();
      for (let i = 0; i < SEED_FRAGMENTS.length; i++) {
        const minsAgo = 10 + i * 14;
        await db.collection('fragments').add({
          ...SEED_FRAGMENTS[i],
          uid: 'seed',
          ts: firebase.firestore.Timestamp.fromMillis(now - minsAgo * 60000),
          meCount: Math.floor(Math.random() * 4),
          stayCount: Math.floor(Math.random() * 2),
          responses: {},
          expiresAt: new Date(now + 2 * 60 * 60 * 1000),
          isSeed: true
        });
      }
    }
  } catch(e) { console.error('seed:', e); }
}

// ── ENTRY SCREEN SETUP ──
function setupEntryScreen() {
  // 10秒無互動顯示 idle hint
  idleTimer = setTimeout(() => {
    if (!hasInteracted) {
      document.getElementById('idle-hint').classList.add('show');
    }
  }, 10000);
}

// 選擇情緒選句
function selectPrompt(btn) {
  hasInteracted = true;
  clearTimeout(idleTimer);
  document.querySelectorAll('.prompt-bubble').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const text = btn.textContent;
  const ta = document.getElementById('entry-ta');
  ta.value = text;
  ta.focus();
  // Scroll to input
  document.getElementById('entry-input-wrap').scrollIntoView({ behavior: 'smooth' });
}

// 從 entry 放開
async function releaseFromEntry() {
  const ta = document.getElementById('entry-ta');
  const text = ta.value.trim();
  if (!text) {
    ta.focus();
    ta.placeholder = '說點什麼？';
    return;
  }
  await doRelease(text);
  showMainScreen();
}

function showMainScreen() {
  document.getElementById('entry-screen').style.display = 'none';
  document.getElementById('main-screen').style.display = 'block';
  listenFragments();
}

// ── LISTEN FRAGMENTS ──
function listenFragments() {
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000);
  db.collection('fragments')
    .where('ts', '>', since)
    .orderBy('ts', 'desc')
    .onSnapshot(snap => {
      const feed = document.getElementById('feed');
      const empty = document.getElementById('empty-state');
      snap.docChanges().forEach(ch => {
        if (ch.type === 'added') {
          const frag = { id: ch.doc.id, ...ch.doc.data() };
          if (!document.getElementById('frag-' + frag.id)) renderFragment(frag);
        }
        if (ch.type === 'modified') {
          const frag = { id: ch.doc.id, ...ch.doc.data() };
          updateFragDots(frag);
        }
        if (ch.type === 'removed') {
          const el = document.getElementById('frag-' + ch.doc.id);
          if (el) { el.style.transition = 'all 0.5s'; el.style.opacity = '0'; el.style.transform = 'translateY(-10px)'; setTimeout(() => el.remove(), 500); }
        }
      });
      empty.style.display = feed.children.length > 0 ? 'none' : 'block';
    });
}

function renderFragment(frag) {
  const feed = document.getElementById('feed');
  const el = document.createElement('div');
  el.className = 'fragment' + (frag.isEcho ? ' echo-frag' : '');
  el.id = 'frag-' + frag.id;
  const isMe = frag.uid === myUid;
  const isSeed = frag.isSeed;
  const ts = frag.ts ? timeAgo(frag.ts.seconds * 1000) : '剛剛';
  const color = frag.color || COLORS[0];
  const myResp = frag.responses?.[myUid];
  const hasResponse = (frag.meCount || 0) > 0 || (frag.stayCount || 0) > 0;

  el.innerHTML = `
    <div class="glow-dot ${hasResponse ? 'on' : ''}" id="gdot-${frag.id}" style="background:${color};"></div>
    ${frag.isEcho ? '<span class="echo-label">宇宙回聲</span>' : ''}
    <div class="fragment-text">${escHtml(frag.text)}</div>
    <div class="fragment-footer">
      <div class="fragment-time">${ts}</div>
      <div class="fragment-actions">
        ${!frag.isEcho ? `<button class="share-icon-btn" onclick="openShare('${frag.id}')" title="分享">↗</button>` : ''}
        ${(!isMe && !isSeed && !frag.isEcho) ? `
          <button class="resp-btn ${myResp === 'me' ? 'done' : ''}" id="me-${frag.id}" onclick="respond('${frag.id}','me',this)">
            ${myResp === 'me' ? '✦' : '我也是'}
          </button>
          <button class="resp-btn ${myResp === 'stay' ? 'done' : ''}" id="stay-${frag.id}" onclick="respond('${frag.id}','stay',this)">
            ${myResp === 'stay' ? '↝' : '陪你一下'}
          </button>
        ` : ''}
        ${isMe && !frag.isEcho ? `<span style="font-size:11px;color:rgba(255,255,255,0.15);font-weight:300;">${hasResponse ? '有人感受到了' : '已放開'}</span>` : ''}
      </div>
    </div>`;

  feed.insertBefore(el, feed.firstChild);
  setTimeout(() => { el.style.animation = 'breathe 7s ease-in-out infinite'; }, 700);
}

function updateFragDots(frag) {
  const dot = document.getElementById('gdot-' + frag.id);
  if (dot && ((frag.meCount || 0) > 0 || (frag.stayCount || 0) > 0)) dot.classList.add('on');
  const myResp = frag.responses?.[myUid];
  if (myResp) {
    const me = document.getElementById('me-' + frag.id);
    const stay = document.getElementById('stay-' + frag.id);
    if (me && myResp === 'me') { me.classList.add('done'); me.textContent = '✦'; }
    if (stay && myResp === 'stay') { stay.classList.add('done'); stay.textContent = '↝'; }
  }
}

// ── RESPOND ──
async function respond(fragId, type, btn) {
  if (!myUid || btn.classList.contains('done')) return;
  btn.classList.add('done');
  btn.textContent = type === 'me' ? '✦' : '↝';
  const otherId = type === 'me' ? 'stay-' + fragId : 'me-' + fragId;
  const other = document.getElementById(otherId);
  if (other) { other.classList.add('done'); other.style.opacity = '0.3'; other.style.pointerEvents = 'none'; }

  try {
    await db.collection('fragments').doc(fragId).update({
      [`responses.${myUid}`]: type,
      [type === 'me' ? 'meCount' : 'stayCount']: firebase.firestore.FieldValue.increment(1)
    });
    if (type === 'me') {
      showToast('有個靈魂懂你說的');
    } else {
      showToast('正在靠近...');
      setTimeout(() => openAnonChat(fragId), 900);
    }
  } catch(e) { console.error(e); }
}

// ── RELEASE FRAGMENT ──
async function doRelease(text) {
  if (!text || !myUid) return null;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  try {
    const ref = await db.collection('fragments').add({
      text, uid: myUid, color,
      ts: firebase.firestore.FieldValue.serverTimestamp(),
      meCount: 0, stayCount: 0, responses: {},
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
    });
    showToast('你的話漂出去了');
    // 30秒後觸發宇宙回聲（如果沒有真人回應）
    setTimeout(() => triggerEchoIfNeeded(ref.id, text), 30000);
    return ref.id;
  } catch(e) { console.error(e); return null; }
}

// ── 宇宙回聲機制 ──
async function triggerEchoIfNeeded(fragId, text) {
  try {
    const snap = await db.collection('fragments').doc(fragId).get();
    if (!snap.exists) return;
    const frag = snap.data();
    // 如果已有真人回應，不觸發
    if ((frag.meCount || 0) > 0 || (frag.stayCount || 0) > 0) return;
    const echoText = selectEcho(text);
    // 在 feed 中直接插入回聲碎片（本地，不存 Firebase）
    const echoFrag = {
      id: 'echo-' + fragId,
      text: echoText,
      color: 'rgba(180,160,255,0.9)',
      isEcho: true,
      ts: { seconds: Date.now() / 1000 },
      uid: 'cosmos'
    };
    const feed = document.getElementById('feed');
    if (feed && !document.getElementById('frag-echo-' + fragId)) {
      renderFragment({ ...echoFrag, id: 'echo-' + fragId });
    }
  } catch(e) { console.error('echo:', e); }
}

function selectEcho(text) {
  const lower = text.toLowerCase();
  let pool;
  if (text.length < 8) pool = ECHO_RESPONSES.short;
  else if (/累|疲|倦|撐|辛苦/.test(lower)) pool = ECHO_RESPONSES.tired;
  else if (/孤|一個人|沒人|找誰|寂寞/.test(lower)) pool = ECHO_RESPONSES.lonely;
  else if (/說不清|不知道|搞不懂|亂/.test(lower)) pool = ECHO_RESPONSES.confused;
  else if (/還好|其實|只是|待著/.test(lower)) pool = ECHO_RESPONSES.okay;
  else pool = ECHO_RESPONSES.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── MAIN SCREEN INPUT ──
document.getElementById('input-box').addEventListener('click', () => {
  const ph = document.getElementById('input-ph');
  const ta = document.getElementById('input-ta');
  const footer = document.getElementById('input-footer');
  ph.style.display = 'none';
  ta.style.display = 'block';
  footer.style.display = 'flex';
  ta.focus();
});

document.getElementById('input-ta').addEventListener('input', function() {
  document.getElementById('char-count').textContent = this.value.length + ' / 120';
});

document.getElementById('release-btn').addEventListener('click', async () => {
  const ta = document.getElementById('input-ta');
  const text = ta.value.trim();
  if (!text) return;
  await doRelease(text);
  ta.value = '';
  ta.style.display = 'none';
  document.getElementById('input-ph').style.display = 'block';
  document.getElementById('input-footer').style.display = 'none';
  document.getElementById('char-count').textContent = '0 / 120';
});

// ── ANON CHAT ──
function openAnonChat(fragId) {
  currentChatId = 'chat_' + fragId;
  document.getElementById('chat-overlay').classList.remove('hidden');
  const msgs = document.getElementById('chat-msgs');
  msgs.innerHTML = '<div class="chat-system">你們在宇宙中相遇了<br>這段對話只存在於此刻</div>';
  if (chatUnsub) chatUnsub();
  chatUnsub = db.collection('tempChats').doc(currentChatId)
    .collection('messages').orderBy('ts')
    .onSnapshot(snap => {
      snap.docChanges().forEach(ch => {
        if (ch.type === 'added') {
          const m = ch.doc.data();
          const div = document.createElement('div');
          div.className = 'chat-msg ' + (m.uid === myUid ? 'mine' : 'theirs');
          div.textContent = m.text;
          msgs.appendChild(div);
          msgs.scrollTop = msgs.scrollHeight;
        }
      });
    });
  document.getElementById('chat-input').focus();
}

document.getElementById('chat-close').addEventListener('click', () => {
  if (chatUnsub) { chatUnsub(); chatUnsub = null; }
  currentChatId = null;
  document.getElementById('chat-overlay').classList.add('hidden');
  document.getElementById('chat-msgs').innerHTML = '';
  document.getElementById('chat-input').value = '';
  showToast('這段相遇已經被宇宙收藏了');
});

document.getElementById('chat-send').addEventListener('click', sendAnonMsg);
document.getElementById('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendAnonMsg(); });

async function sendAnonMsg() {
  const inp = document.getElementById('chat-input');
  const text = inp.value.trim();
  if (!text || !currentChatId) return;
  inp.value = '';
  try {
    await db.collection('tempChats').doc(currentChatId).collection('messages').add({
      text, uid: myUid, ts: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch(e) { console.error(e); }
}

// ── SHARE CARD ──
async function openShare(fragId) {
  try {
    const snap = await db.collection('fragments').doc(fragId).get();
    if (!snap.exists) return;
    const frag = snap.data();
    drawShareCard(frag.text, frag.color);
    document.getElementById('share-overlay').classList.remove('hidden');
  } catch(e) { console.error(e); }
}

function drawShareCard(text, color) {
  const canvas = document.getElementById('share-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f0a1e'); bg.addColorStop(0.5, '#14093a'); bg.addColorStop(1, '#0a0f2a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // Stars
  for (let i = 0; i < 80; i++) {
    const a = Math.random() * 0.35 + 0.04;
    ctx.beginPath(); ctx.arc(Math.random()*W, Math.random()*H, Math.random()*1.2+0.2, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
  }
  // Nebula
  const ng = ctx.createRadialGradient(W*.3,H*.4,0,W*.3,H*.4,W*.5);
  ng.addColorStop(0,'rgba(120,90,200,0.07)'); ng.addColorStop(1,'transparent');
  ctx.fillStyle=ng; ctx.fillRect(0,0,W,H);
  // Brackets
  ctx.strokeStyle='rgba(180,160,255,0.22)'; ctx.lineWidth=1.5;
  [[24,24],[W-24,24],[24,H-24],[W-24,H-24]].forEach(([x,y])=>{
    const dx=x<W/2?26:-26, dy=y<H/2?26:-26;
    ctx.beginPath(); ctx.moveTo(x+dx,y); ctx.lineTo(x,y); ctx.lineTo(x,y+dy); ctx.stroke();
  });
  // Logo
  ctx.font='300 11px "Noto Sans TC",sans-serif'; ctx.fillStyle='rgba(255,255,255,0.18)';
  ctx.textAlign='center'; ctx.fillText('SOUL ECHO', W/2, 50);
  // Glow
  const glow = ctx.createRadialGradient(W/2,H*0.3,0,W/2,H*0.3,80);
  glow.addColorStop(0,(color||'rgba(180,160,255,0.9)').replace('0.9','0.25')); glow.addColorStop(1,'transparent');
  ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
  // Dot
  ctx.beginPath(); ctx.arc(W/2,H*0.3,7,0,Math.PI*2);
  ctx.fillStyle=color||'rgba(180,160,255,0.9)'; ctx.fill();
  // Divider
  ctx.strokeStyle='rgba(180,160,255,0.1)'; ctx.lineWidth=0.5;
  ctx.beginPath(); ctx.moveTo(48,H*0.38); ctx.lineTo(W-48,H*0.38); ctx.stroke();
  // Text
  ctx.font='300 16px "Noto Sans TC",sans-serif';
  ctx.fillStyle='rgba(255,255,255,0.82)'; ctx.textAlign='center';
  const lines = wrapText(ctx, text, W-100, 16);
  const startY = H*0.38+50;
  lines.forEach((line,i) => ctx.fillText(line, W/2, startY+i*30));
  // Bottom
  ctx.strokeStyle='rgba(180,160,255,0.07)'; ctx.lineWidth=0.5;
  ctx.beginPath(); ctx.moveTo(48,H-62); ctx.lineTo(W-48,H-62); ctx.stroke();
  ctx.font='300 11px "Noto Sans TC",sans-serif';
  ctx.fillStyle='rgba(255,255,255,0.14)'; ctx.textAlign='center';
  ctx.fillText('沒有帳號，沒有名字，只有此刻', W/2, H-44);
  ctx.fillStyle='rgba(180,160,255,0.3)';
  ctx.fillText('soul-echo99.vercel.app', W/2, H-26);
}

function wrapText(ctx, text, maxW) {
  const lines = []; let line = '';
  for (const ch of text) {
    if (ch === '\n') { lines.push(line); line=''; continue; }
    if (ctx.measureText(line+ch).width > maxW && line) { lines.push(line); line=ch; }
    else line+=ch;
  }
  if (line) lines.push(line);
  return lines.slice(0, 7);
}

document.getElementById('dl-btn').addEventListener('click', () => {
  const a = document.createElement('a'); a.download='soulecho.png';
  a.href=document.getElementById('share-canvas').toDataURL('image/png'); a.click();
});
document.getElementById('ig-btn').addEventListener('click', async () => {
  const canvas = document.getElementById('share-canvas');
  canvas.toBlob(async blob => {
    const file = new File([blob],'soulecho.png',{type:'image/png'});
    if (navigator.canShare?.({files:[file]})) {
      try { await navigator.share({files:[file],title:'SoulEcho'}); return; } catch(e) {}
    }
    document.getElementById('dl-btn').click();
    showToast('圖片已儲存，分享到 IG 限動吧');
    setTimeout(() => { try { window.open('instagram://story-camera','_blank'); } catch(e) {} }, 400);
  }, 'image/png');
});
document.getElementById('cl-btn').addEventListener('click', () => {
  document.getElementById('share-overlay').classList.add('hidden');
});

// ── TOAST ──
function showToast(msg) {
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── UTILS ──
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}
function timeAgo(ms) {
  const m = Math.floor((Date.now()-ms)/60000);
  if (m < 1) return '剛剛';
  if (m < 60) return m+'分鐘前';
  const h = Math.floor(m/60);
  return h < 2 ? '1小時前' : h+'小時前';
}

// ── PWA ──
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
});
