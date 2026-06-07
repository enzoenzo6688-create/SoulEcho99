// ── FIREBASE ──
firebase.initializeApp({
  apiKey:'AIzaSyAweHWtgCnW1rgTTmUl7uzrdwIdnJ7jy5M',
  authDomain:'soulecho-23f2b.firebaseapp.com',
  projectId:'soulecho-23f2b',
  storageBucket:'soulecho-23f2b.firebasestorage.app',
  messagingSenderId:'985367696091',
  appId:'1:985367696091:web:14ac4db77b1cadd22972fe'
});
const db=firebase.firestore(), auth=firebase.auth();

// ── YOUTUBE ──
const YT='AIzaSyAYXt-tYsdu-v_Y0iQI5m_zNEeCTXz3HPU';
let ytTimer=null, selMusic=null;
function ytSearch(q){
  clearTimeout(ytTimer);
  const el=document.getElementById('yt-res');
  if(!q.trim()){el.innerHTML='';return;}
  el.innerHTML='<div style="color:rgba(255,255,255,.3);font-size:12px;padding:10px;">搜尋中…</div>';
  ytTimer=setTimeout(async()=>{
    try{
      const r=await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&key=${YT}&q=${encodeURIComponent(q)}+music`);
      const d=await r.json();
      if(d.error){el.innerHTML='<div style="color:rgba(255,255,255,.3);font-size:12px;padding:10px;">找不到結果</div>';return;}
      el.innerHTML='';
      (d.items||[]).forEach((v,i)=>{
        const div=document.createElement('div');
        div.className='mitem';
        div.innerHTML=`<img class="mart" src="${v.snippet.thumbnails?.default?.url||''}" onerror="this.style.background='#333'"><div><div class="mname">${v.snippet.title.replace(/&#39;/g,"'").replace(/&amp;/g,'&')}</div><div class="martist">${v.snippet.channelTitle}</div></div>`;
        div.onclick=()=>{
          selMusic={name:v.snippet.title.replace(/&#39;/g,"'").replace(/&amp;/g,'&'),artist:v.snippet.channelTitle,url:'https://youtu.be/'+v.id.videoId,art:v.snippet.thumbnails?.medium?.url||''};
          el.innerHTML='';
          document.getElementById('yt-inp').value='';
          const s=document.getElementById('yt-sel');
          s.style.display='block';
          s.innerHTML=`<div class="msel"><img class="mart" src="${selMusic.art||''}" onerror="this.style.background='#333'"><div style="flex:1;min-width:0;"><div class="mname">🎵 ${selMusic.name}</div><div class="martist">${selMusic.artist}</div></div><button onclick="selMusic=null;document.getElementById('yt-sel').style.display='none'" style="background:none;border:none;color:rgba(255,255,255,.4);font-size:16px;cursor:pointer;">✕</button></div>`;
        };
        el.appendChild(div);
      });
    }catch(e){el.innerHTML='';}
  },600);
}

// ── CONSTANTS ──
const EMOTIONS=[
  {k:'family',n:'🏠 家庭',c:'#ff6b6b'},
  {k:'study', n:'📚 課業',c:'#5865f2'},
  {k:'love',  n:'💕 感情',c:'#ff4d8d'},
  {k:'friend',n:'🤝 友情',c:'#22c55e'},
  {k:'work',  n:'💼 工作',c:'#f59e0b'},
  {k:'self',  n:'✨ 自我',c:'#a855f7'},
  {k:'other', n:'💭 其他',c:'#777'}
];
const STATUSES=['💬 想聊天','🆘 需要幫助','🤝 可以幫忙','☕ 隨便逛逛','🔕 請勿打擾'];
const ECHO_LINES={
  tired:['說出來了就不用一個人扛著了。','累的時候不需要解釋為什麼。','你不需要撐得好看。'],
  lonely:['這裡有人看見你說的話。','你不是唯一一個有這種感覺的人。','想說話這件事本身就很勇敢。'],
  unclear:['說不清楚沒關係，說出來就好。','有些事不需要弄清楚，先說就好。'],
  okay:['「還好」有時候是很重的兩個字。','你願意待著，就夠了。'],
  default:['嗯。我知道了。','你說的，我聽到了。','這裡有人在。','說出來就不一樣了。']
};

function getEmo(k){return EMOTIONS.find(e=>e.k===k)||null;}
function pickEcho(text){
  if(text.length<6)return pick(ECHO_LINES.default);
  if(/累|疲|倦|撐|辛苦/.test(text))return pick(ECHO_LINES.tired);
  if(/孤|一個人|沒人|找誰|寂寞/.test(text))return pick(ECHO_LINES.lonely);
  if(/說不清|不知道|搞不懂/.test(text))return pick(ECHO_LINES.unclear);
  if(/還好|其實|只是|待/.test(text))return pick(ECHO_LINES.okay);
  return pick(ECHO_LINES.default);
}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}

// ── STATE ──
let myUid=null, myData={name:'靈魂',emotion:'',bubble:'',status:'💬 想聊天',musicName:'',musicUrl:'',musicArt:''};
let otherUsers={}, currentRoom='lobby', usersUnsub=null;
let myX=0, myY=0, myVx=0, myVy=0, targetX=null, targetY=null;
let bgStars=[], sparks=[], lightWaves=[];
let canvas, ctx, W, H;
let chatTargetUid=null, chatUnsub=null, typingTimer=null;
let selEmo='', toastTimer=null;
let entryText='';

// ── CANVAS ──
function initCanvas(){
  canvas=document.getElementById('cv');
  ctx=canvas.getContext('2d');
  resize();
  window.addEventListener('resize',resize);
  canvas.addEventListener('click',onCanvasClick);
  canvas.addEventListener('touchend',e=>{e.preventDefault();const t=e.changedTouches[0];onCanvasClick({clientX:t.clientX,clientY:t.clientY});},{passive:false});
}
function resize(){
  W=canvas.width=window.innerWidth;
  H=canvas.height=window.innerHeight;
  if(!myX){myX=W/2;myY=H/2;}
  initBgStars();
}
function initBgStars(){
  bgStars=[];
  for(let i=0;i<180;i++)bgStars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+0.2,phase:Math.random()*Math.PI*2,speed:Math.random()*.007+.002,type:Math.random()<.15?'glow':'dot'});
  for(let i=0;i<40;i++)bgStars.push({x:Math.random()*W,y:Math.random()*H,r:.5,phase:Math.random()*Math.PI*2,speed:Math.random()*.004+.001,type:'dust',vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12});
}

// ── GAME LOOP ──
function gameLoop(){
  requestAnimationFrame(gameLoop);
  update();
  render();
}
function update(){
  if(targetX!==null){
    const dx=targetX-myX,dy=targetY-myY,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<4){targetX=null;targetY=null;myVx*=.8;myVy*=.8;}
    else{const sp=Math.min(4,dist*.08);myVx=(dx/dist)*sp;myVy=(dy/dist)*sp;}
  }else{myVx*=.88;myVy*=.88;}
  myX=Math.max(30,Math.min(W-30,myX+myVx));
  myY=Math.max(70,Math.min(H-80,myY+myVy));
  for(const u of Object.values(otherUsers)){
    if(!u.vx){u.vx=(Math.random()-.5)*.35;u.vy=(Math.random()-.5)*.35;}
    u.vx+=(Math.random()-.5)*.04;u.vy+=(Math.random()-.5)*.04;
    u.vx=Math.max(-.7,Math.min(.7,u.vx));u.vy=Math.max(-.7,Math.min(.7,u.vy));
    u.x=Math.max(30,Math.min(W-30,u.x+u.vx));u.y=Math.max(70,Math.min(H-80,u.y+u.vy));
    u.phase=(u.phase||0)+.04;
    if(u.lightTimer>0)u.lightTimer-=.02;
  }
  sparks=sparks.filter(s=>{s.x+=s.vx;s.y+=s.vy;s.vy+=.07;s.life-=.04;return s.life>0;});
  lightWaves=lightWaves.filter(w=>{w.r+=4;w.life-=.03;return w.life>0;});
  bgStars.forEach(s=>{
    if(s.type==='dust'){s.x+=s.vx;s.y+=s.vy;if(s.x<0)s.x=W;if(s.x>W)s.x=0;if(s.y<0)s.y=H;if(s.y>H)s.y=0;}
    s.phase+=s.speed;
  });
}

function render(){
  ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);
  // Nebula
  const t=Date.now()/9000;
  [[W*.3,H*.4,W*.5,'rgba(88,101,242,.05)'],[W*.7,H*.6,W*.4,'rgba(168,85,247,.04)'],[W*.5,H*.2,W*.3,'rgba(255,100,150,.03)']].forEach(([nx,ny,nr,nc],i)=>{
    const ox=Math.sin(t+i)*25,oy=Math.cos(t+i*1.2)*18;
    const g=ctx.createRadialGradient(nx+ox,ny+oy,0,nx+ox,ny+oy,nr);
    g.addColorStop(0,nc);g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  });
  // Stars
  bgStars.forEach(s=>{
    const b=.3+.7*(.5+.5*Math.sin(s.phase));
    if(s.type==='glow'){ctx.shadowColor='rgba(180,200,255,.7)';ctx.shadowBlur=8;}
    ctx.beginPath();ctx.arc(s.x,s.y,s.r*(s.type==='glow'?b:1),0,Math.PI*2);
    ctx.fillStyle=`rgba(255,255,255,${s.type==='dust'?b*.25:b*.7})`;ctx.fill();
    ctx.shadowBlur=0;
  });
  // Light waves
  lightWaves.forEach(w=>{
    ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,Math.PI*2);
    ctx.strokeStyle=`rgba(168,180,255,${w.life*.5})`;ctx.lineWidth=2;ctx.stroke();
  });
  // Sparks
  sparks.forEach(s=>{
    ctx.beginPath();ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,200,80,${s.life})`;ctx.fill();
  });
  // Constellation lines
  const all=[...Object.values(otherUsers).map(u=>({x:u.x,y:u.y})),{x:myX,y:myY}];
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
    const dx=all[i].x-all[j].x,dy=all[i].y-all[j].y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<160){ctx.beginPath();ctx.moveTo(all[i].x,all[i].y);ctx.lineTo(all[j].x,all[j].y);ctx.strokeStyle=`rgba(168,180,255,${.12*(1-d/160)})`;ctx.lineWidth=1;ctx.stroke();}
  }
  // Other users
  for(const u of Object.values(otherUsers))drawStar(u.x,u.y,u.data,false,u.phase,u.lightTimer>0);
  // Me
  drawStar(myX,myY,myData,true,Date.now()/500,false);
}

function drawStar(x,y,d,isMe,phase,isLit){
  const emo=getEmo(d.emotion);
  const col=emo?emo.c:'#00e5ff';
  const r=20+3.5*Math.sin(phase);
  ctx.save();ctx.translate(x,y);
  ctx.shadowColor=col;ctx.shadowBlur=isLit?44:(isMe?28:20);
  ctx.beginPath();ctx.arc(0,0,r*.7,0,Math.PI*2);
  ctx.fillStyle=col;ctx.globalAlpha=isLit?1:isMe?1:.88;ctx.fill();
  ctx.shadowBlur=0;ctx.globalAlpha=1;
  if(isMe){
    ctx.beginPath();ctx.arc(0,0,r*.7+5,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
  }
  // Name
  ctx.font=`700 ${isMe?12:11}px 'Noto Sans TC',sans-serif`;ctx.fillStyle='#fff';ctx.textAlign='center';
  ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=5;
  ctx.fillText(d.name||'靈魂',0,-r-8);ctx.shadowBlur=0;
  // Emotion tag
  if(emo){ctx.font=`300 9px 'Noto Sans TC',sans-serif`;ctx.fillStyle=emo.c;ctx.fillText(emo.n,0,-r-20);}
  // Bubble (dialogue cloud)
  if(d.bubble||d.musicName){
    const lines=[];
    if(d.bubble)lines.push(d.bubble.length>16?d.bubble.slice(0,15)+'…':d.bubble);
    if(d.musicName)lines.push('🎵 '+(d.musicName.length>12?d.musicName.slice(0,11)+'…':d.musicName));
    const bw=Math.max(...lines.map(l=>ctx.measureText(l).width))+22;
    const bh=lines.length*18+14;
    const bx=-bw/2, by=-r-bh-14;
    // Cloud background
    ctx.fillStyle='rgba(14,14,36,.9)';
    ctx.strokeStyle=col+'44';ctx.lineWidth=1;
    rrect(ctx,bx,by,bw,bh,10);ctx.fill();ctx.stroke();
    // Tail
    ctx.beginPath();ctx.moveTo(-5,by+bh);ctx.lineTo(5,by+bh);ctx.lineTo(0,-r-10);ctx.fillStyle='rgba(14,14,36,.9)';ctx.fill();
    // Text
    ctx.font=`300 10px 'Noto Sans TC',sans-serif`;ctx.fillStyle='rgba(255,255,255,.85)';
    lines.forEach((l,i)=>ctx.fillText(l,0,by+18+i*18));
  }
  ctx.restore();
}
function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}

// ── CLICK ──
function onCanvasClick(e){
  const cx=e.clientX,cy=e.clientY;
  for(const [uid,u] of Object.entries(otherUsers)){
    const dx=cx-u.x,dy=cy-u.y;
    if(Math.sqrt(dx*dx+dy*dy)<30){showSpop(uid,u);return;}
  }
  document.getElementById('spop').style.display='none';
  targetX=cx;targetY=cy;
}

// ── ENTRY ──
function pickBubble(btn){
  document.querySelectorAll('.ebubble').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
  document.getElementById('entry-ta').value=btn.textContent;
}
function entryGo(){
  const text=document.getElementById('entry-ta').value.trim();
  if(!text)return;
  entryText=text;
  myData.bubble=text;
  document.getElementById('entry').style.display='none';
  document.getElementById('space').classList.remove('hidden');
  // Detect emotion from text
  if(/家|媽|爸|父|母|兄|姐|弟|妹/.test(text))myData.emotion='family';
  else if(/課|學|考|作業|老師|成績/.test(text))myData.emotion='study';
  else if(/喜歡|愛|失戀|感情|暗戀/.test(text))myData.emotion='love';
  else if(/朋友|友情|孤單|一個人/.test(text))myData.emotion='friend';
  else if(/工作|職場|老闆|同事/.test(text))myData.emotion='work';
  else myData.emotion='self';
  // Schedule cosmos echo after 30s
  setTimeout(()=>showEcho(text),30000);
}

function showEcho(text){
  const msg=pickEcho(text);
  // Show as a floating toast-like notification
  showToast('🌌 '+msg);
  // Also spawn a visual ripple from center
  lightWaves.push({x:W/2,y:H/2,r:10,life:1});
}

// ── AUTH ──
auth.onAuthStateChanged(user=>{
  if(user){
    myUid=user.uid;
    initCanvas();
    initBgStars();
    loadMyData();
    joinRoom('lobby');
    listenOnline();
    requestAnimationFrame(gameLoop);
    if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
  }else{
    auth.signInAnonymously();
  }
});

async function loadMyData(){
  const snap=await db.collection('users').doc(myUid).get();
  if(snap.exists)myData={...myData,...snap.data()};
  else await db.collection('users').doc(myUid).set({...myData,uid:myUid,lastSeen:firebase.firestore.FieldValue.serverTimestamp(),room:'lobby'});
  syncMe();
}
async function saveMyData(upd){
  myData={...myData,...upd};
  await db.collection('users').doc(myUid).update({...upd,lastSeen:firebase.firestore.FieldValue.serverTimestamp()});
}

// ── ROOM ──
async function joinRoom(roomId){
  currentRoom=roomId;
  if(usersUnsub)usersUnsub();
  await db.collection('users').doc(myUid).update({room:roomId,lastSeen:firebase.firestore.FieldValue.serverTimestamp(),bubble:myData.bubble,emotion:myData.emotion,name:myData.name,musicName:myData.musicName||''});
  myX=W/2+(Math.random()-.5)*120;myY=H/2+(Math.random()-.5)*120;
  otherUsers={};
  document.getElementById('room-label').textContent = roomId==='lobby'?'✦ 大廳':(getEmo(roomId)?.n||roomId)+' 星域';
  closePanel('room-panel');
  usersUnsub=db.collection('users').where('room','==',roomId).onSnapshot(snap=>{
    snap.docChanges().forEach(ch=>{
      const uid=ch.doc.id;if(uid===myUid)return;
      if(ch.type==='removed'){delete otherUsers[uid];return;}
      const data=ch.doc.data();
      if(!otherUsers[uid])otherUsers[uid]={data,x:W*.1+Math.random()*W*.8,y:70+Math.random()*(H-160),vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,phase:Math.random()*Math.PI*2,lightTimer:0};
      else otherUsers[uid].data=data;
    });
    updateRoomCounts();
  });
  setInterval(()=>db.collection('users').doc(myUid).update({lastSeen:firebase.firestore.FieldValue.serverTimestamp()}).catch(()=>{}),30000);
}

async function updateRoomCounts(){
  const since=new Date(Date.now()-5*60*1000);
  const ls=await db.collection('users').where('room','==','lobby').where('lastSeen','>',since).get().catch(()=>({size:0}));
  const lel=document.getElementById('lobby-count');if(lel)lel.textContent=ls.size||0;
  for(const e of EMOTIONS){
    const s=await db.collection('users').where('room','==',e.k).where('lastSeen','>',since).get().catch(()=>({size:0}));
    const el=document.getElementById('rc-'+e.k);if(el)el.textContent=(s.size||0)+' 人';
  }
}

function renderRoomGrid(){
  document.getElementById('room-grid').innerHTML=EMOTIONS.map(e=>`
    <div class="rcard" style="background:${e.c}18;border-color:${e.c}35;" onclick="joinRoom('${e.k}')">
      <div class="rcard-emoji">${e.n.split(' ')[0]}</div>
      <div class="rcard-name">${e.n.split(' ').slice(1).join(' ')} 星域</div>
      <div class="rcard-count" id="rc-${e.k}">0 人</div>
    </div>`).join('');
}

async function listenOnline(){
  setInterval(async()=>{
    try{
      const s=await db.collection('users').get();
      document.getElementById('onnum').textContent=Math.max(s.size,1);
    }catch(e){}
  },30000);
  try{
    const s=await db.collection('users').get();
    document.getElementById('onnum').textContent=Math.max(s.size,1);
  }catch(e){}
}

// ── BROADCAST ──
db.collection('broadcasts').orderBy('ts','desc').limit(1).onSnapshot(snap=>{
  snap.docChanges().forEach(ch=>{
    if(ch.type==='added'){
      const d=ch.doc.data();
      if(Date.now()-(d.ts?.seconds||0)*1000<10000)showMeteor(d.text,d.fromName);
    }
  });
});
async function sendBroadcast(){
  const text=document.getElementById('bc-ta').value.trim();
  if(!text)return;
  document.getElementById('bc-ta').value='';
  await db.collection('broadcasts').add({text,fromUid:myUid,fromName:myData.name||'靈魂',ts:firebase.firestore.FieldValue.serverTimestamp()});
  closePanel('broadcast-panel');
  showToast('廣播已送出 ✦');
}
function showMeteor(text,name){
  const el=document.createElement('div');
  el.className='mtext';
  el.textContent=`✦ ${name}：${text}`;
  const y=60+Math.random()*(H*.35),dur=7+Math.random()*4;
  el.style.cssText=`top:${y}px;animation-duration:${dur}s;`;
  document.getElementById('meteors').appendChild(el);
  setTimeout(()=>el.remove(),(dur+1)*1000);
}

// ── BUBBLE ──
function openPanel(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
  const p=document.getElementById(id);
  if(!p)return;
  p.classList.remove('hidden');
  p.scrollTop=0;
  if(id==='bubble-panel'){
    document.getElementById('bubble-ta').value=myData.bubble||'';
    selEmo=myData.emotion||'';
    selMusic=myData.musicUrl?{name:myData.musicName,url:myData.musicUrl,art:myData.musicArt}:null;
    renderEmoRow();
    if(selMusic){const s=document.getElementById('yt-sel');s.style.display='block';s.innerHTML=`<div class="msel"><img class="mart" src="${selMusic.art||''}" onerror="this.style.background='#333'"><div style="flex:1;min-width:0;"><div class="mname">🎵 ${selMusic.name}</div></div><button onclick="selMusic=null;document.getElementById('yt-sel').style.display='none'" style="background:none;border:none;color:rgba(255,255,255,.4);font-size:16px;cursor:pointer;">✕</button></div>`;}
    else document.getElementById('yt-sel').style.display='none';
  }
  if(id==='room-panel')renderRoomGrid();
  if(id==='me-panel')syncMe();
}
function closePanel(id){const p=document.getElementById(id);if(p)p.classList.add('hidden');}

function renderEmoRow(){
  document.getElementById('emo-row').innerHTML=EMOTIONS.map(e=>`<button class="epill ${selEmo===e.k?'on':''}" style="background:${e.c};" onclick="selEmo='${e.k}';renderEmoRow()">${e.n}</button>`).join('');
}

async function saveBubble(){
  const bubble=document.getElementById('bubble-ta').value.trim();
  const upd={bubble,emotion:selEmo,musicName:selMusic?.name||'',musicUrl:selMusic?.url||'',musicArt:selMusic?.art||''};
  await saveMyData(upd);
  closePanel('bubble-panel');
  showToast('對話雲已更新 ✦');
}

// ── ME ──
function syncMe(){
  const ni=document.getElementById('me-name');if(ni)ni.value=myData.name||'';
  const sr=document.getElementById('status-row');
  if(sr)sr.innerHTML=STATUSES.map(s=>`<button onclick="updateMe('status','${s}')" style="padding:7px 13px;border-radius:18px;font-size:12px;border:1px solid ${myData.status===s?'#5865f2':'rgba(255,255,255,.1)'};background:${myData.status===s?'rgba(88,101,242,.2)':'rgba(255,255,255,.05)'};color:${myData.status===s?'#fff':'rgba(255,255,255,.5)'};cursor:pointer;font-family:'Noto Sans TC',sans-serif;">${s}</button>`).join('');
}
async function updateMe(k,v){myData[k]=v;await saveMyData({[k]:v});syncMe();}
async function doLogout(){if(!confirm('確定登出？'))return;await auth.signOut();location.reload();}

// ── STAR POPUP ──
function showSpop(uid,u){
  const d=u.data;
  const pop=document.getElementById('spop');
  const emo=getEmo(d.emotion);
  document.getElementById('spop-av').textContent=emo?emo.n.split(' ')[0]:'✦';
  document.getElementById('spop-name').textContent=d.name||'靈魂';
  document.getElementById('spop-emo').innerHTML=emo?`<span style="background:${emo.c};color:#fff;padding:2px 10px;border-radius:6px;font-size:11px;font-weight:700;">${emo.n}</span>`:'';
  document.getElementById('spop-bubble').textContent=d.bubble||'';
  document.getElementById('spop-music').innerHTML=d.musicName?`<div style="background:rgba(29,185,84,.15);border-radius:8px;padding:4px 10px;font-size:11px;color:#1db954;font-weight:700;">🎵 ${d.musicName}</div>`:'';
  document.getElementById('sp-stay').onclick=()=>{sendReaction(uid,'me');closeSpop();};
  document.getElementById('sp-chat').onclick=()=>{openChat(uid,d.name);closeSpop();};
  document.getElementById('sp-light').onclick=()=>{sendLight(uid,u);closeSpop();};
  pop.style.display='block';
}
function closeSpop(){document.getElementById('spop').style.display='none';}

async function sendReaction(toUid,type){
  await db.collection('reactions').add({to:toUid,from:myUid,fromName:myData.name||'靈魂',type,ts:firebase.firestore.FieldValue.serverTimestamp()});
  showToast(type==='me'?'有個靈魂感受到了 ✦':'正在靠近…');
}

function sendLight(uid,u){
  if(u)u.lightTimer=3;
  lightWaves.push({x:myX,y:myY,r:10,life:1});
  for(let i=0;i<12;i++){const a=Math.random()*Math.PI*2,s=2+Math.random()*3;sparks.push({x:myX,y:myY,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2,life:1});}
  db.collection('lights').add({to:uid,from:myUid,ts:firebase.firestore.FieldValue.serverTimestamp()});
  showToast('✨ 送光成功');
}

// ── CHAT ──
function getChatId(a,b){return[a,b].sort().join('_');}
function openChat(uid,name){
  chatTargetUid=uid;
  document.getElementById('chat-name').textContent=name||'靈魂';
  if(chatUnsub)chatUnsub();
  const chatId=getChatId(myUid,uid);
  const msgs=document.getElementById('chat-msgs');
  msgs.innerHTML='<div class="csys">這段對話只存在於此刻</div>';
  chatUnsub=db.collection('tempChats').doc(chatId).collection('messages').orderBy('ts').onSnapshot(snap=>{
    snap.docChanges().forEach(ch=>{
      if(ch.type==='added'){
        const m=ch.doc.data(),mine=m.uid===myUid;
        const div=document.createElement('div');
        div.className='cmsg '+(mine?'mine':'theirs');
        div.textContent=m.text;
        msgs.appendChild(div);
        msgs.scrollTop=msgs.scrollHeight;
      }
    });
    // typing
    db.collection('tempChats').doc(chatId).onSnapshot(doc=>{
      const d=doc.data();
      const typing=d&&d['typing_'+uid]&&Date.now()/1000-(d['typing_'+uid]?.seconds||0)<4;
      document.getElementById('typing-ind').style.display=typing?'block':'none';
    });
  });
  document.getElementById('chat').classList.add('open');
  document.getElementById('chat-inp').focus();
}
function closeChat(){
  document.getElementById('chat').classList.remove('open');
  if(chatUnsub){chatUnsub();chatUnsub=null;}
  chatTargetUid=null;
}
function onTyping(){
  if(!chatTargetUid)return;
  const chatId=getChatId(myUid,chatTargetUid);
  db.collection('tempChats').doc(chatId).set({['typing_'+myUid]:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  clearTimeout(typingTimer);
  typingTimer=setTimeout(()=>db.collection('tempChats').doc(getChatId(myUid,chatTargetUid)).set({['typing_'+myUid]:null},{merge:true}),3000);
}
async function sendMsg(){
  const inp=document.getElementById('chat-inp'),text=inp.value.trim();
  if(!text||!chatTargetUid)return;
  inp.value='';
  const chatId=getChatId(myUid,chatTargetUid);
  await db.collection('tempChats').doc(chatId).collection('messages').add({text,uid:myUid,ts:firebase.firestore.FieldValue.serverTimestamp()});
  await db.collection('tempChats').doc(chatId).set({['typing_'+myUid]:null},{merge:true});
}

// ── HELP ──
function showHelp(){document.getElementById('help-view').classList.remove('hidden');listenHelp();}
function hideHelp(){document.getElementById('help-view').classList.add('hidden');}
function listenHelp(){
  db.collection('helpRequests').where('status','in',['open','helping']).onSnapshot(snap=>{
    const list=[];snap.forEach(doc=>list.push({id:doc.id,...doc.data()}));
    renderHelpList(list);
  });
}
async function postHelp(){
  const text=document.getElementById('help-ta').value.trim();
  if(!text)return;
  document.getElementById('help-ta').value='';
  await db.collection('helpRequests').add({text,fromUid:myUid,fromName:myData.name||'靈魂',status:'open',helperUid:null,ts:firebase.firestore.FieldValue.serverTimestamp()});
}
async function acceptHelp(id){
  await db.collection('helpRequests').doc(id).update({status:'helping',helperUid:myUid});
  const snap=await db.collection('helpRequests').doc(id).get();
  const d=snap.data();
  hideHelp();
  openChat(d.fromUid,d.fromName);
}
async function doneHelp(id){await db.collection('helpRequests').doc(id).update({status:'done'});showToast('感謝你的幫助！');}
function renderHelpList(list){
  const el=document.getElementById('help-list');
  if(!list.length){el.innerHTML='<div style="text-align:center;padding:40px;color:rgba(255,255,255,.25);font-size:13px;">目前沒有求助</div>';return;}
  el.innerHTML=list.map(h=>{
    const isMe=h.fromUid===myUid,isHelper=h.helperUid===myUid;
    const tagClass=h.status==='open'?'open':'helping';
    const tagText=h.status==='open'?'🔴 等待幫助':'🟢 幫助中';
    return`<div class="hcard">
      <span class="htag ${tagClass}">${tagText}</span>
      <div class="hcard-text">${esc(h.text)}</div>
      <div class="hcard-btns">
        ${!isMe&&!isHelper&&h.status==='open'?`<button class="hcbtn ok" onclick="acceptHelp('${h.id}')">🤝 我來幫忙</button>`:''}
        ${isMe&&h.status!=='done'?`<button class="hcbtn gray" onclick="doneHelp('${h.id}')">✅ 已解決</button>`:''}
        ${isHelper?`<button class="hcbtn ok" onclick="doneHelp('${h.id}')">✅ 完成幫助</button>`:''}
      </div>
    </div>`;
  }).join('');
}

// ── TOAST ──
function showToast(msg){
  clearTimeout(toastTimer);
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

// ── UTILS ──
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');}
