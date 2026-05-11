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

let myUid = null, currentChatId = null, chatUnsub = null, toastTimer = null;

const COLORS = [
  'rgba(244,164,192,0.9)',
  'rgba(180,160,255,0.9)',
  'rgba(164,196,244,0.9)',
  'rgba(196,244,164,0.9)',
  'rgba(244,220,164,0.9)',
  'rgba(212,164,244,0.9)'
];

const ECHO = {
  tired:   ['說出來了就不用一個人扛著了。','累的時候不需要解釋為什麼累。','你不需要撐得好看。'],
  lonely:  ['這裡有人看見你說的話。','想說話這件事本身就很勇敢。','你不是唯一一個有這種感覺的人。'],
  unclear: ['說不清楚沒關係。說不清楚本來就是這種感覺。','有些事不需要說清楚，先說出來就好。'],
  okay:    ['「還好」有時候是很重的兩個字。','你願意待著，就夠了。'],
  short:   ['嗯。我知道了。','你說的，我聽到了。','這裡有人在。'],
  default: ['你說的，我聽到了。','這裡有人在。','說出來就不一樣了。','嗯。我知道了。']
};

const SEEDS = [
  { text: '今天沒有特別難過\n只是不想一個人待著', color: COLORS[0] },
  { text: '說了對不起\n但其實也不知道為什麼要道歉', color: COLORS[1] },
  { text: '好想睡著\n但又怕醒來', color: COLORS[2] },
  { text: '朋友說「不就這樣嗎」\n從此我就不說了', color: COLORS[3] },
  { text: '腦袋裡有很多話\n但說出來好像都變了形', color: COLORS[4] },
  { text: '其實還好\n只是有點需要有人說一聲你辛苦了', color: COLORS[5] },
  { text: '不知道在等什麼\n就是在等', color: COLORS[0] },
  { text: '今天對一個陌生人笑了\n那個笑比對朋友的都真', color: COLORS[2] }
];

// ── STARS ──
const canvas = document.getElementById('star-canvas');
const sCtx = canvas.getContext('2d');
let stars = [];
function initStars() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = Array.from({length:130}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*1.3+0.2,
    phase: Math.random()*Math.PI*2,
    speed: Math.random()*0.006+0.002
  }));
}
function drawStars() {
  sCtx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s => {
    s.phase += s.speed;
    const a = 0.06 + 0.3*(0.5+0.5*Math.sin(s.phase));
    sCtx.beginPath();
    sCtx.arc(s.x,s.y,s.r,0,Math.PI*2);
    sCtx.fillStyle = `rgba(255,255,255,${a})`;
    sCtx.fill();
  });
  requestAnimationFrame(drawStars);
}
window.addEventListener('resize', initStars);
initStars(); drawStars();

// ── AUTH ──
auth.onAuthStateChanged(user => {
  if (user) {
    myUid = user.uid;
    init();
  } else {
    auth.signInAnonymously();
  }
});

async function init() {
  updateOnlineCount();
  setInterval(updateOnlineCount, 30000);
  db.collection('presence').doc(myUid).set({ t: firebase.firestore.FieldValue.serverTimestamp() });
  setInterval(() => db.collection('presence').doc(myUid).set({ t: firebase.firestore.FieldValue.serverTimestamp() }), 20000);
  await ensureSeeds();
  listenFragments();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
}

async function updateOnlineCount() {
  try {
    const since = new Date(Date.now()-5*60*1000);
    const snap = await db.collection('presence').where('t','>',since).get();
    document.getElementById('online-num').textContent = Math.max(snap.size,1);
  } catch(e){}
}

async function ensureSeeds() {
  try {
    const snap = await db.collection('fragments').limit(3).get();
    if (snap.size >= 3) return;
    const now = Date.now();
    for (let i=0; i<SEEDS.length; i++) {
      await db.collection('fragments').add({
        ...SEEDS[i], uid:'seed', isSeed:true,
        ts: firebase.firestore.Timestamp.fromMillis(now - (10+i*14)*60000),
        meCount: Math.floor(Math.random()*4),
        stayCount: Math.floor(Math.random()*2),
        responses: {},
        expiresAt: new Date(now+2*60*60*1000)
      });
    }
  } catch(e){ console.error('seed:',e); }
}

// ── FEED ──
function listenFragments() {
  // Simple query - no composite index needed
  db.collection('fragments')
    .limit(30)
    .onSnapshot(snap => {
      snap.docChanges().forEach(ch => {
        if (ch.type==='added') {
          const f = {id:ch.doc.id,...ch.doc.data()};
          if (!document.getElementById('frag-'+f.id)) renderFrag(f);
        }
        if (ch.type==='modified') updateDots({id:ch.doc.id,...ch.doc.data()});
        if (ch.type==='removed') {
          const el = document.getElementById('frag-'+ch.doc.id);
          if (el) { el.style.transition='all 0.5s'; el.style.opacity='0'; setTimeout(()=>el.remove(),500); }
        }
      });
      // scroll to top to show latest
      const feed = document.getElementById('feed');
      if (feed) feed.scrollTop = 0;
    });
}

function renderFrag(f) {
  const feed = document.getElementById('feed');
  const el = document.createElement('div');
  el.className = 'fragment' + (f.isEcho?' echo-frag':'');
  el.id = 'frag-'+f.id;
  const isMe = f.uid===myUid;
  const isSeed = f.isSeed;
  const ts = f.ts ? timeAgo(f.ts.seconds*1000) : '剛剛';
  const color = f.color || COLORS[0];
  const myR = f.responses?.[myUid];
  const hasR = (f.meCount||0)>0 || (f.stayCount||0)>0;

  el.innerHTML = `
    <div class="glow-dot ${hasR?'on':''}" id="gdot-${f.id}" style="background:${color};"></div>
    ${f.isEcho?'<span class="echo-label">宇宙回聲</span>':''}
    <div class="fragment-text">${esc(f.text)}</div>
    <div class="fragment-footer">
      <div class="fragment-time">${ts}</div>
      <div class="fragment-actions">
        ${!f.isEcho?`<button class="share-icon-btn" onclick="openShare('${f.id}')">↗</button>`:''}
        ${(!isMe&&!isSeed&&!f.isEcho)?`
          <button class="resp-btn ${myR==='me'?'done':''}" id="me-${f.id}" onclick="respond('${f.id}','me',this)">${myR==='me'?'✦':'我也是'}</button>
          <button class="resp-btn ${myR==='stay'?'done':''}" id="stay-${f.id}" onclick="respond('${f.id}','stay',this)">${myR==='stay'?'↝':'陪你一下'}</button>
        `:''}
        ${isMe&&!f.isEcho?`<span style="font-size:11px;color:rgba(255,255,255,0.15);font-weight:300;">${hasR?'有人感受到了':'已放開'}</span>`:''}
      </div>
    </div>`;

  feed.insertBefore(el, feed.firstChild);
  setTimeout(()=>{ el.style.animation='breathe 7s ease-in-out infinite'; }, 700);
}

function updateDots(f) {
  const dot = document.getElementById('gdot-'+f.id);
  if (dot && ((f.meCount||0)>0||(f.stayCount||0)>0)) dot.classList.add('on');
  const myR = f.responses?.[myUid];
  if (myR) {
    const me = document.getElementById('me-'+f.id);
    const stay = document.getElementById('stay-'+f.id);
    if (me&&myR==='me') { me.classList.add('done'); me.textContent='✦'; }
    if (stay&&myR==='stay') { stay.classList.add('done'); stay.textContent='↝'; }
  }
}

// ── RESPOND ──
async function respond(fragId, type, btn) {
  if (!myUid||btn.classList.contains('done')) return;
  btn.classList.add('done');
  btn.textContent = type==='me'?'✦':'↝';
  const other = document.getElementById((type==='me'?'stay':'me')+'-'+fragId);
  if (other) { other.classList.add('done'); other.style.opacity='0.3'; other.style.pointerEvents='none'; }
  try {
    await db.collection('fragments').doc(fragId).update({
      [`responses.${myUid}`]: type,
      [type==='me'?'meCount':'stayCount']: firebase.firestore.FieldValue.increment(1)
    });
    if (type==='me') showToast('有個靈魂懂你說的');
    else { showToast('正在靠近...'); setTimeout(()=>openAnonChat(fragId),900); }
  } catch(e){ console.error(e); }
}

// ── INPUT ──
function usePrompt(btn) {
  const ta = document.getElementById('input-ta');
  ta.value = btn.textContent;
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
  document.getElementById('char-count').textContent = ta.value.length+' / 120';
}

document.getElementById('input-ta').addEventListener('input', function() {
  document.getElementById('char-count').textContent = this.value.length ? this.value.length+' / 120' : '';
});

document.getElementById('release-btn').addEventListener('click', async () => {
  const ta = document.getElementById('input-ta');
  const text = ta.value.trim();
  if (!text) { ta.focus(); return; }
  const color = COLORS[Math.floor(Math.random()*COLORS.length)];
  try {
    const ref = await db.collection('fragments').add({
      text, uid:myUid, color,
      ts: firebase.firestore.FieldValue.serverTimestamp(),
      meCount:0, stayCount:0, responses:{},
      expiresAt: new Date(Date.now()+2*60*60*1000)
    });
    ta.value = '';
    document.getElementById('char-count').textContent = '';
    showToast('你的話漂出去了');
    setTimeout(()=>maybeEcho(ref.id,text),30000);
  } catch(e){ console.error(e); }
});

async function maybeEcho(fragId, text) {
  try {
    const snap = await db.collection('fragments').doc(fragId).get();
    if (!snap.exists) return;
    const f = snap.data();
    if ((f.meCount||0)>0||(f.stayCount||0)>0) return;
    if (document.getElementById('frag-echo-'+fragId)) return;
    const echoText = pickEcho(text);
    renderFrag({
      id:'echo-'+fragId, text:echoText,
      color:'rgba(180,160,255,0.9)',
      isEcho:true,
      ts:{seconds:Date.now()/1000},
      uid:'cosmos', meCount:0, stayCount:0, responses:{}
    });
  } catch(e){}
}

function pickEcho(text) {
  let pool;
  if (text.length<8) pool=ECHO.short;
  else if (/累|疲|倦|撐|辛苦/.test(text)) pool=ECHO.tired;
  else if (/孤|一個人|沒人|找誰|寂寞/.test(text)) pool=ECHO.lonely;
  else if (/說不清|不知道|搞不懂|亂/.test(text)) pool=ECHO.unclear;
  else if (/還好|其實|只是|待著/.test(text)) pool=ECHO.okay;
  else pool=ECHO.default;
  return pool[Math.floor(Math.random()*pool.length)];
}

// ── ANON CHAT ──
function openAnonChat(fragId) {
  currentChatId = 'chat_'+fragId;
  document.getElementById('chat-overlay').classList.remove('hidden');
  const msgs = document.getElementById('chat-msgs');
  msgs.innerHTML = '<div class="chat-system">你們在宇宙中相遇了<br>這段對話只存在於此刻</div>';
  if (chatUnsub) chatUnsub();
  chatUnsub = db.collection('tempChats').doc(currentChatId)
    .collection('messages').orderBy('ts')
    .onSnapshot(snap => {
      snap.docChanges().forEach(ch => {
        if (ch.type==='added') {
          const m=ch.doc.data();
          const div=document.createElement('div');
          div.className='chat-msg '+(m.uid===myUid?'mine':'theirs');
          div.textContent=m.text;
          msgs.appendChild(div);
          msgs.scrollTop=msgs.scrollHeight;
        }
      });
    });
  document.getElementById('chat-input').focus();
}

document.getElementById('chat-close').addEventListener('click',()=>{
  if(chatUnsub){chatUnsub();chatUnsub=null;}
  currentChatId=null;
  document.getElementById('chat-overlay').classList.add('hidden');
  document.getElementById('chat-msgs').innerHTML='';
  document.getElementById('chat-input').value='';
  showToast('這段相遇已經被宇宙收藏了');
});
document.getElementById('chat-send').addEventListener('click',sendMsg);
document.getElementById('chat-input').addEventListener('keydown',e=>{if(e.key==='Enter')sendMsg();});
async function sendMsg(){
  const inp=document.getElementById('chat-input');
  const text=inp.value.trim();
  if(!text||!currentChatId) return;
  inp.value='';
  await db.collection('tempChats').doc(currentChatId).collection('messages').add({
    text,uid:myUid,ts:firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ── SHARE ──
async function openShare(fragId){
  try{
    const snap=await db.collection('fragments').doc(fragId).get();
    if(!snap.exists) return;
    drawCard(snap.data().text, snap.data().color);
    document.getElementById('share-overlay').classList.remove('hidden');
  }catch(e){}
}
function drawCard(text,color){
  const c=document.getElementById('share-canvas'),ctx=c.getContext('2d'),W=c.width,H=c.height;
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#0f0a1e');bg.addColorStop(0.5,'#14093a');bg.addColorStop(1,'#0a0f2a');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  for(let i=0;i<80;i++){ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*1.2+0.2,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.3+0.04})`;ctx.fill();}
  const ng=ctx.createRadialGradient(W*.3,H*.4,0,W*.3,H*.4,W*.5);ng.addColorStop(0,'rgba(120,90,200,0.07)');ng.addColorStop(1,'transparent');ctx.fillStyle=ng;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(180,160,255,0.2)';ctx.lineWidth=1.5;
  [[24,24],[W-24,24],[24,H-24],[W-24,H-24]].forEach(([x,y])=>{const dx=x<W/2?26:-26,dy=y<H/2?26:-26;ctx.beginPath();ctx.moveTo(x+dx,y);ctx.lineTo(x,y);ctx.lineTo(x,y+dy);ctx.stroke();});
  ctx.font='300 11px "Noto Sans TC",sans-serif';ctx.fillStyle='rgba(255,255,255,0.18)';ctx.textAlign='center';ctx.fillText('SOUL ECHO',W/2,50);
  const gw=ctx.createRadialGradient(W/2,H*0.3,0,W/2,H*0.3,80);
  gw.addColorStop(0,(color||COLORS[1]).replace('0.9','0.22'));gw.addColorStop(1,'transparent');ctx.fillStyle=gw;ctx.fillRect(0,0,W,H);
  ctx.beginPath();ctx.arc(W/2,H*0.3,7,0,Math.PI*2);ctx.fillStyle=color||COLORS[1];ctx.fill();
  ctx.strokeStyle='rgba(180,160,255,0.1)';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(48,H*0.38);ctx.lineTo(W-48,H*0.38);ctx.stroke();
  ctx.font='300 16px "Noto Sans TC",sans-serif';ctx.fillStyle='rgba(255,255,255,0.82)';ctx.textAlign='center';
  wrapText(ctx,text,W-100).forEach((l,i)=>ctx.fillText(l,W/2,H*0.38+50+i*30));
  ctx.strokeStyle='rgba(180,160,255,0.07)';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(48,H-62);ctx.lineTo(W-48,H-62);ctx.stroke();
  ctx.font='300 11px "Noto Sans TC",sans-serif';ctx.fillStyle='rgba(255,255,255,0.14)';ctx.textAlign='center';ctx.fillText('沒有帳號，沒有名字，只有此刻',W/2,H-44);
  ctx.fillStyle='rgba(180,160,255,0.3)';ctx.fillText('soul-echo99.vercel.app',W/2,H-26);
}
function wrapText(ctx,text,maxW){
  const lines=[];let line='';
  for(const ch of text){if(ch==='\n'){lines.push(line);line='';continue;}if(ctx.measureText(line+ch).width>maxW&&line){lines.push(line);line=ch;}else line+=ch;}
  if(line)lines.push(line);return lines.slice(0,7);
}
document.getElementById('dl-btn').addEventListener('click',()=>{const a=document.createElement('a');a.download='soulecho.png';a.href=document.getElementById('share-canvas').toDataURL('image/png');a.click();});
document.getElementById('ig-btn').addEventListener('click',async()=>{
  const c=document.getElementById('share-canvas');
  c.toBlob(async blob=>{
    const file=new File([blob],'soulecho.png',{type:'image/png'});
    if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'SoulEcho'});return;}catch(e){}}
    document.getElementById('dl-btn').click();
    showToast('圖片已儲存，分享到 IG 限動吧');
    setTimeout(()=>{try{window.open('instagram://story-camera','_blank');}catch(e){}},400);
  },'image/png');
});
document.getElementById('cl-btn').addEventListener('click',()=>document.getElementById('share-overlay').classList.add('hidden'));

// ── TOAST ──
function showToast(msg){
  clearTimeout(toastTimer);
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

// ── UTILS ──
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');}
function timeAgo(ms){
  const m=Math.floor((Date.now()-ms)/60000);
  if(m<1)return'剛剛';if(m<60)return m+'分鐘前';
  const h=Math.floor(m/60);return h<2?'1小時前':h+'小時前';
}
