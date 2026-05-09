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
let currentShareText = '';

// Fragment colors — soft, cosmic palette
const FRAG_COLORS = [
  'rgba(244,164,192,0.9)',
  'rgba(180,160,255,0.9)',
  'rgba(164,196,244,0.9)',
  'rgba(196,244,164,0.9)',
  'rgba(244,220,164,0.9)',
  'rgba(212,164,244,0.9)'
];

// ── STAR CANVAS ──
const starCanvas = document.getElementById('star-canvas');
const sCtx = starCanvas.getContext('2d');
let stars = [];

function initStars() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  stars = [];
  for (let i = 0; i < 120; i++) {
    stars.push({
      x: Math.random() * starCanvas.width,
      y: Math.random() * starCanvas.height,
      r: Math.random() * 1.3 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.006 + 0.002
    });
  }
}

function drawStars() {
  sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  stars.forEach(s => {
    s.phase += s.speed;
    const alpha = 0.08 + 0.35 * (0.5 + 0.5 * Math.sin(s.phase));
    sCtx.beginPath();
    sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sCtx.fillStyle = `rgba(255,255,255,${alpha})`;
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
    listenFragments();
    updateOnlineCount();
    checkInviteParam();
    setInterval(updateOnlineCount, 30000);
    db.collection('presence').doc(myUid).set({ t: firebase.firestore.FieldValue.serverTimestamp() });
    setInterval(() => db.collection('presence').doc(myUid).set({ t: firebase.firestore.FieldValue.serverTimestamp() }), 20000);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  } else {
    auth.signInAnonymously().catch(e => console.error('auth:', e));
  }
});

// ── ONLINE COUNT ──
async function updateOnlineCount() {
  try {
    const since = new Date(Date.now() - 5 * 60 * 1000);
    const snap = await db.collection('presence').where('t', '>', since).get();
    document.getElementById('online-num').textContent = Math.max(snap.size, 1);
  } catch(e) {}
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
          const existing = document.getElementById('frag-' + frag.id);
          if (!existing) prependFragment(frag);
        }
        if (ch.type === 'modified') {
          const frag = { id: ch.doc.id, ...ch.doc.data() };
          updateFragmentDots(frag);
        }
        if (ch.type === 'removed') {
          const el = document.getElementById('frag-' + ch.doc.id);
          if (el) { el.style.opacity = '0'; el.style.transform = 'translateY(-10px)'; el.style.transition = 'all 0.5s'; setTimeout(() => el.remove(), 500); }
        }
      });

      // Show/hide empty state
      const hasFrags = feed.children.length > 0;
      empty.style.display = hasFrags ? 'none' : 'block';
    });
}

function prependFragment(frag) {
  const feed = document.getElementById('feed');
  const el = document.createElement('div');
  el.className = 'fragment';
  el.id = 'frag-' + frag.id;
  el.style.animationDelay = '0s';

  const isMe = frag.uid === myUid;
  const ts = frag.ts ? timeAgo(frag.ts.seconds * 1000) : '剛剛';
  const color = frag.color || FRAG_COLORS[0];
  const meCount = frag.meCount || 0;
  const stayCount = frag.stayCount || 0;
  const myResponse = frag.responses?.[myUid] || null;

  el.innerHTML = `
    <div class="glow-dot" id="gdot-${frag.id}" style="background:${color};"></div>
    <div class="fragment-text">${escHtml(frag.text)}</div>
    <div class="fragment-footer">
      <div class="fragment-time">${ts}</div>
      <div class="fragment-actions">
        <button class="share-icon-btn" onclick="openShare('${frag.id}')" title="分享">↗</button>
        ${!isMe ? `
          <button class="resp-btn ${myResponse === 'me' ? 'done' : ''}" id="me-btn-${frag.id}" onclick="respond('${frag.id}','me',this)">
            ${myResponse === 'me' ? '✦' : '我也是'}
          </button>
          <button class="resp-btn ${myResponse === 'stay' ? 'done' : ''}" id="stay-btn-${frag.id}" onclick="respond('${frag.id}','stay',this)">
            ${myResponse === 'stay' ? '↝' : '陪你一下'}
          </button>
        ` : `<span style="font-size:11px;color:rgba(255,255,255,0.15);font-weight:300;letter-spacing:0.5px;">${meCount > 0 || stayCount > 0 ? '有人感受到了' : '已放開'}</span>`}
      </div>
    </div>`;

  feed.insertBefore(el, feed.firstChild);

  // Animate breathing after appear
  setTimeout(() => { el.style.animation = 'breathe 6s ease-in-out infinite'; }, 700);

  // If already has responses, light dot
  if (meCount > 0 || stayCount > 0) {
    const dot = document.getElementById('gdot-' + frag.id);
    if (dot) dot.classList.add('on');
  }
}

function updateFragmentDots(frag) {
  const dot = document.getElementById('gdot-' + frag.id);
  if (dot && ((frag.meCount || 0) > 0 || (frag.stayCount || 0) > 0)) {
    dot.classList.add('on');
  }

  // Update button states if I just responded
  const myResponse = frag.responses?.[myUid];
  if (myResponse) {
    const meBtn = document.getElementById('me-btn-' + frag.id);
    const stayBtn = document.getElementById('stay-btn-' + frag.id);
    if (meBtn && myResponse === 'me') { meBtn.classList.add('done'); meBtn.textContent = '✦'; }
    if (stayBtn && myResponse === 'stay') { stayBtn.classList.add('done'); stayBtn.textContent = '↝'; }
  }
}

// ── RESPOND ──
async function respond(fragId, type, btn) {
  if (!myUid || btn.classList.contains('done')) return;
  btn.classList.add('done');
  btn.textContent = type === 'me' ? '✦' : '↝';

  const ref = db.collection('fragments').doc(fragId);
  try {
    await ref.update({
      [`responses.${myUid}`]: type,
      [type === 'me' ? 'meCount' : 'stayCount']: firebase.firestore.FieldValue.increment(1)
    });
    // Disable sibling button
    const otherId = type === 'me' ? 'stay-btn-' + fragId : 'me-btn-' + fragId;
    const other = document.getElementById(otherId);
    if (other) { other.classList.add('done'); other.disabled = true; other.style.opacity = '0.3'; }

    if (type === 'me') {
      showToast('有個靈魂懂你說的');
    } else {
      // Open anon chat
      showToast('正在連線...');
      setTimeout(() => openAnonChat(fragId), 800);
    }
  } catch(e) { console.error(e); }
}

// ── RELEASE FRAGMENT ──
function activateInput() {
  const ph = document.getElementById('input-ph');
  const ta = document.getElementById('input-ta');
  const footer = document.getElementById('input-footer');
  ph.style.display = 'none';
  ta.style.display = 'block';
  footer.style.display = 'flex';
  ta.focus();
  ta.addEventListener('input', () => {
    document.getElementById('char-count').textContent = ta.value.length + ' / 120';
  });
}

document.getElementById('input-box').addEventListener('click', activateInput);
document.getElementById('release-btn').addEventListener('click', releaseFragment);

async function releaseFragment() {
  const ta = document.getElementById('input-ta');
  const text = ta.value.trim();
  if (!text || !myUid) return;

  const color = FRAG_COLORS[Math.floor(Math.random() * FRAG_COLORS.length)];
  try {
    await db.collection('fragments').add({
      text, uid: myUid, color,
      ts: firebase.firestore.FieldValue.serverTimestamp(),
      meCount: 0, stayCount: 0, responses: {},
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
    });
    ta.value = '';
    ta.style.display = 'none';
    document.getElementById('input-ph').style.display = 'block';
    document.getElementById('input-footer').style.display = 'none';
    document.getElementById('char-count').textContent = '0 / 120';
    showToast('你的話漂出去了');
  } catch(e) { console.error(e); }
}

// ── ANON CHAT ──
function openAnonChat(fragId) {
  const chatId = 'chat_' + fragId;
  currentChatId = chatId;
  document.getElementById('chat-overlay').classList.remove('hidden');
  document.getElementById('chat-overlay').style.display = 'flex';

  const msgs = document.getElementById('chat-msgs');
  msgs.innerHTML = '<div class="chat-system">你們在宇宙中相遇了<br>離開後這段對話就會消失</div>';

  if (chatUnsub) chatUnsub();
  chatUnsub = db.collection('tempChats').doc(chatId)
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

async function sendAnonMsg() {
  const inp = document.getElementById('chat-input');
  const text = inp.value.trim();
  if (!text || !currentChatId) return;
  inp.value = '';
  try {
    await db.collection('tempChats').doc(currentChatId)
      .collection('messages').add({
        text, uid: myUid,
        ts: firebase.firestore.FieldValue.serverTimestamp()
      });
  } catch(e) { console.error(e); }
}

function closeAnonChat() {
  if (chatUnsub) { chatUnsub(); chatUnsub = null; }
  currentChatId = null;
  document.getElementById('chat-overlay').style.display = 'none';
  document.getElementById('chat-overlay').classList.add('hidden');
  document.getElementById('chat-msgs').innerHTML = '';
  document.getElementById('chat-input').value = '';
  showToast('這段相遇已經被宇宙收藏了');
}

document.getElementById('chat-close').addEventListener('click', closeAnonChat);
document.getElementById('chat-send').addEventListener('click', sendAnonMsg);
document.getElementById('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendAnonMsg(); });

// ── SHARE CARD ──
async function openShare(fragId) {
  const snap = await db.collection('fragments').doc(fragId).get();
  if (!snap.exists) return;
  const frag = snap.data();
  currentShareText = frag.text;
  drawShareCard(frag.text, frag.color);
  document.getElementById('share-overlay').style.display = 'flex';
  document.getElementById('share-overlay').classList.remove('hidden');
}

function drawShareCard(text, color) {
  const canvas = document.getElementById('share-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f0a1e');
  bg.addColorStop(0.5, '#14093a');
  bg.addColorStop(1, '#0a0f2a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.save();
  for (let i = 0; i < 80; i++) {
    const sx = Math.random() * W, sy = Math.random() * H;
    const sr = Math.random() * 1.2 + 0.2;
    const alpha = Math.random() * 0.4 + 0.05;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }
  ctx.restore();

  // Nebula glow
  const ng = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.5);
  ng.addColorStop(0, 'rgba(120,90,200,0.08)');
  ng.addColorStop(1, 'transparent');
  ctx.fillStyle = ng;
  ctx.fillRect(0, 0, W, H);

  // Corner brackets
  ctx.strokeStyle = 'rgba(180,160,255,0.25)';
  ctx.lineWidth = 1.5;
  const br = 28;
  [[24,24],[W-24,24],[24,H-24],[W-24,H-24]].forEach(([x,y]) => {
    const dx = x < W/2 ? br : -br;
    const dy = y < H/2 ? br : -br;
    ctx.beginPath();
    ctx.moveTo(x + dx, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy);
    ctx.stroke();
  });

  // Logo
  ctx.font = '300 11px "Noto Sans TC", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.letterSpacing = '4px';
  ctx.textAlign = 'center';
  ctx.fillText('SOUL ECHO', W / 2, 52);

  // Glow dot
  const dotX = W / 2, dotY = H * 0.3;
  const glowGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 60);
  glowGrad.addColorStop(0, color ? color.replace('0.9)', '0.3)') : 'rgba(180,160,255,0.3)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
  ctx.fillStyle = color || 'rgba(180,160,255,0.9)';
  ctx.fill();

  // Divider
  ctx.strokeStyle = 'rgba(180,160,255,0.12)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(48, H * 0.38);
  ctx.lineTo(W - 48, H * 0.38);
  ctx.stroke();

  // Fragment text
  ctx.font = '300 16px "Noto Sans TC", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '0.3px';

  const words = text;
  const lines = wrapText(ctx, words, W - 100, 16);
  const lineH = 28;
  const textStartY = H * 0.38 + 48;
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, textStartY + i * lineH);
  });

  // Bottom divider
  const bottomY = H - 60;
  ctx.strokeStyle = 'rgba(180,160,255,0.08)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(48, bottomY);
  ctx.lineTo(W - 48, bottomY);
  ctx.stroke();

  // Bottom text
  ctx.font = '300 11px "Noto Sans TC", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.textAlign = 'center';
  ctx.fillText('沒有帳號，沒有名字，只有此刻', W / 2, bottomY + 22);

  ctx.font = '300 10px "Noto Sans TC", sans-serif';
  ctx.fillStyle = 'rgba(180,160,255,0.3)';
  ctx.fillText('soul-echo99.vercel.app', W / 2, bottomY + 40);
}

function wrapText(ctx, text, maxW, fontSize) {
  const lines = [];
  const chars = text.split('');
  let line = '';
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
    if (ch === '\n') { lines.push(line.replace('\n','')); line = ''; }
  }
  if (line) lines.push(line);
  return lines.slice(0, 8);
}

function downloadShareCard() {
  const canvas = document.getElementById('share-canvas');
  const a = document.createElement('a');
  a.download = 'soulecho.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}

async function shareToIG() {
  const canvas = document.getElementById('share-canvas');
  canvas.toBlob(async blob => {
    const file = new File([blob], 'soulecho.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'SoulEcho' }); return; } catch(e) {}
    }
    downloadShareCard();
    showToast('圖片已儲存，分享到 IG 限動吧');
    setTimeout(() => { try { window.open('instagram://story-camera', '_blank'); } catch(e) {} }, 400);
  }, 'image/png');
}

function closeShare() {
  document.getElementById('share-overlay').style.display = 'none';
  document.getElementById('share-overlay').classList.add('hidden');
}

document.getElementById('dl-btn').addEventListener('click', downloadShareCard);
document.getElementById('ig-btn').addEventListener('click', shareToIG);
document.getElementById('cl-btn').addEventListener('click', closeShare);

// ── TOAST ──
function showToast(msg) {
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── UTILS ──
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>');
}

function timeAgo(ms) {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1) return '剛剛';
  if (m < 60) return m + ' 分鐘前';
  if (h < 2) return '1 小時前';
  return h + ' 小時前';
}

function checkInviteParam() {
  const p = new URLSearchParams(location.search);
  if (p.get('from') === 'ig') showToast('歡迎來到 SoulEcho');
  history.replaceState({}, '', location.pathname);
}

// ── PWA ──
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (!localStorage.getItem('pwa_dismissed')) {
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('show');
  }
});
window.addEventListener('appinstalled', () => {
  const banner = document.getElementById('install-banner');
  if (banner) banner.classList.remove('show');
});
