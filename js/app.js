// Whybook: tasks, the results of complex ones, and the decisions you make along the way.
import * as store from "./store.js";
import * as auth from "./auth.js";
import * as cloud from "./cloud.js";
import * as L from "./logic.js";
import { CATEGORIES, GROUPS, categoryById, categoriesByGroup } from "./categories.js";
import { THEMES, themeById, STICKERS, stickerById, folderSvg, GROUP_COLORS } from "./art.js";
import { SLOTS, PARTS, DEFAULT_ROOM, normalizeRoom, setSlot, setColor, movePart, resetLayout, setImage, randomRoom, buildRoom, roomTint, roomBoardSpot, partTransform, isUnlocked, collection, REWARDS } from "./room.js";

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2,11);
const today=()=>L.todayKey();

/* ---------------- Data ---------------- */
/** Shown on the sign-in card and in Settings, so you can tell which version a device is running. Keep in step with CACHE in sw.js. */
const VERSION=15, VERSION_DATE="16 Nov 2026";
function fresh(){ return { v:4, savedAt:0, profile:{name:"",email:""}, theme:null, backdrop:"coffee", room:{...DEFAULT_ROOM}, seen:0, tasks:[] }; }
function normalize(st){
  const f=fresh(); for(const k in f) if(st[k]===undefined) st[k]=f[k];
  st.tasks=L.migrateTasks(st.tasks||[]); st.room=normalizeRoom(st.room);
  for(const k of ["notes","resources","sketches","inspo","garden","harvests","treats","redeemed","log","scene","streak","lastDone","spent","focusSessions","focusDone","nextKind"]) delete st[k];
  st.v=4; return st;
}
let S=fresh();
let signedIn=false;
function applyPrefs(){ applyTheme(); applyBackdrop(); }
/* ---------------- Background scene ---------------- */
let shownBackdrop=null;
/** The chosen background. "My room" is drawn from your choices (room.js); the others are ready-made scenes (art.js). */
function theme(id=S.backdrop){
  const t=themeById(id);
  if(t.id!=="custom") return {...t,key:t.id};
  return {...t,key:"custom:"+JSON.stringify(S.room),svg:buildRoom(S.room),tint:roomTint(S.room),board:roomBoardSpot(S.room)};
}
/** Where the board hangs in the chosen background (null for Plain). Cheap: doesn't draw the room. */
const boardSpot=()=>S.backdrop==="custom"?roomBoardSpot(S.room):themeById(S.backdrop).board;
/** Decisions you recorded yourself: the example tasks don't count towards what you collect. */
const decisionCount=()=>L.decisionsOf(S.tasks.filter(t=>!t.sample)).length;
function applyBackdrop(){
  const t=theme(), el=$("#backdrop"); if(!el) return;
  document.documentElement.dataset.backdrop=t.id;
  if(shownBackdrop!==t.key){ el.innerHTML=t.svg; shownBackdrop=t.key; }
  const q=$("#backdrop-pick"); if(q) q.value=t.id;
  applyRoom(); applyRoomState();
}
/** The room reflects your work: light by time of day, cups empty as today's tasks get done, plants droop when something is overdue. */
function applyRoomState(){
  const r=L.roomState(S.tasks,today(),new Date().getHours()), h=document.documentElement;
  h.dataset.time=r.time; h.dataset.mood=r.mood; h.style.setProperty("--left",r.left.toFixed(2));
}
setInterval(()=>{ if(signedIn) applyRoomState(); },5*60*1000);

/* ---------------- The board on the wall ---------------- */
// In a room, the main panel is put away and a board hangs on the wall with a summary. Tap it to open the panel.
let panelOpen=false, arranging=false;
const inRoom=()=>!!boardSpot();
function applyRoom(){
  const room=inRoom()&&!panelOpen;
  document.documentElement.classList.toggle("room",room);
  document.documentElement.classList.toggle("can-close",inRoom()&&panelOpen);
  const b=$("#board"); if(!b) return;
  b.hidden=!room; $("#board-add").hidden=!room||arranging;
  if(!room) toggleBoardForm(false);
  if(room){ renderBoard(); placeBoard(); }
}
/** Scenes fill the screen like object-fit: cover. Map the board's scene coordinates to the screen. */
function placeBoard(){
  const spot=boardSpot(), b=$("#board"); if(!spot||!b) return;
  const W=innerWidth, H=innerHeight, scale=Math.max(W/1200,H/800), ox=(W-1200*scale)/2, oy=(H-800*scale)/2;
  let x=ox+spot.x*scale, y=oy+spot.y*scale, w=spot.w*scale, h=spot.h*scale;
  const top=($(".top")?.offsetHeight??56)+8;
  if(w<230){ const k=230/w; x-= (w*k-w)/2; y-= (h*k-h)/2; w*=k; h*=k; }      // never too small to read
  x=Math.min(Math.max(8,x),W-w-8); y=Math.min(Math.max(top,y),H-h-8);          // always fully on screen
  Object.assign(b.style,{left:x+"px",top:y+"px",width:w+"px",height:h+"px",fontSize:Math.max(11,Math.min(16,w/20))+"px"});
  b.dataset.look=spot.look;
  // The + sits on the board's bottom right corner; the quick-add form opens just under the board (or above the screen's edge).
  Object.assign($("#board-add").style,{left:(x+w-34)+"px",top:(y+h-34)+"px"});
  const fw=Math.min(Math.max(w,300),W-16);
  Object.assign($("#board-form").style,{left:Math.min(Math.max(8,x),W-fw-8)+"px",top:Math.min(y+h+10,H-64)+"px",width:fw+"px"});
}
function toggleBoardForm(show){
  const f=$("#board-form"), a=$("#board-add"); if(!f||!a) return;
  f.hidden=!show; a.setAttribute("aria-expanded",String(show)); a.textContent=show?"×":"+"; a.setAttribute("aria-label",show?"Close add a task":"Add a task");
  if(show){ placeBoard(); $("#board-input").focus(); }
}
function renderBoard(){
  const s=L.weekSummary(S.tasks,today()), next=L.sortTasks(S.tasks).filter(t=>t.status==="todo").slice(0,3);
  const done=S.tasks.filter(t=>t.doneAt===today()).length;
  $("#board-body").innerHTML=`
    <span class="b-title">Today</span>
    <span class="b-stats"><b>${s.open}</b> to do${s.overdue?` · <b class="b-warn">${s.overdue}</b> overdue`:""} · <b>${done}</b> done</span>
    <span class="b-notes">${next.length?next.map((t,i)=>`<span class="b-note" style="--r:${[-3,2,-1][i]}deg">${t.complexity==="complex"?"◆ ":""}${esc(t.title)}</span>`).join(""):`<span class="b-note">All clear ✓</span>`}</span>
    <span class="b-open">Tap to open</span>`;
  $("#board").setAttribute("aria-label",`Open Whybook: ${s.open} to do, ${done} done today`);
}
function openPanel(){
  if(panelOpen) return;
  const b=$("#board"), v=$("#view"), r=b&&!b.hidden?b.getBoundingClientRect():null;
  panelOpen=true; applyRoom(); render();
  if(r&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
    const vr=v.getBoundingClientRect();
    v.animate([{transform:`translate(${r.left+r.width/2-(vr.left+vr.width/2)}px,${r.top+r.height/2-(vr.top+Math.min(vr.height,innerHeight)/2)}px) scale(${r.width/vr.width})`,opacity:.4},{transform:"none",opacity:1}],{duration:380,easing:"cubic-bezier(.2,.8,.2,1)"});
  }
}
function closePanel(){ panelOpen=false; closeOutcome(); applyRoom(); scrollTo(0,0); }
addEventListener("resize",()=>{ if(inRoom()&&!panelOpen) placeBoard(); });
const stickerImg=(id,cls="sticker")=>{ const st=stickerById(id); return st?`<span class="${cls}" role="img" aria-label="Sticker: ${esc(st.name)}">${st.svg}</span>`:""; };

function exampleTasks(){
  const d=n=>L.addDays(today(),n), t=(title,extra={})=>({...L.createTask(title,uid(),d(-6)),sample:true,...extra});
  return [
    t("Reply to Minh about the workshop",{due:d(0)}),
    t("Update dependencies",{due:d(2)}),
    t("Decide how to handle form validation",{complexity:"complex",due:d(1)}),
    t("Choose how to lay out the board",{complexity:"complex",status:"done",doneAt:d(-2),outcome:{result:"Flexbox needed extra wrapper elements for the columns. Grid places columns and rows directly and keeps the HTML flat.",decision:"Use CSS Grid for the board, Flexbox inside each card.",category:"layout",sticker:"idea"}}),
    t("Pick a way to manage state",{complexity:"complex",status:"done",doneAt:d(-1),outcome:{result:"Context + useReducer covers everything the app needs today.",decision:"No state library for now. Revisit if the state grows past one reducer.",category:"state",sticker:"check"}}),
    t("Check colour contrast on buttons",{complexity:"complex",status:"done",doneAt:d(-1),outcome:{result:"Muted grey text on white was 3.9:1, below WCAG AA (4.5:1).",decision:"Darken the muted colour to #646B72 (5.3:1).",category:"accessibility",sticker:"gotcha"}}),
    t("Clean up the downloads folder",{status:"done",doneAt:d(0)}),
  ];
}
const hasExamples=()=>S.tasks.some(t=>t.sample);

/* ---------------- Saving & sync ---------------- */
let saveT=null, cloudT=null, pending={changed:[],removed:[]}, sync={status:"off",at:null,error:""}, deferred=null;
function save(){ S.savedAt=Date.now(); clearTimeout(saveT); saveT=setTimeout(persist,250); }
async function persist(){
  try{ const r=await store.saveState(S); pending.changed.push(...r.changed); pending.removed.push(...r.removed); }
  catch(e){ toast("Couldn't save on this device: "+esc(e.message)); return; }
  if(cloud.user()){ clearTimeout(cloudT); cloudT=setTimeout(pushCloud,1200); }
}
async function pushCloud(){
  if(!cloud.user()) return;
  const p=pending; pending={changed:[],removed:[]}; sync.status="syncing"; paintSync();
  try{ await cloud.push(JSON.stringify(store.stripImages(S)),S.savedAt,p.changed,p.removed); sync={status:"ok",at:Date.now(),error:""}; }
  catch(e){ pending.changed.push(...p.changed); pending.removed.push(...p.removed); sync={status:"error",at:sync.at,error:e.message}; }
  paintSync();
}
const typing=()=>!!document.activeElement?.matches?.("input,textarea,select");
async function applyRemote(d){
  if(!d?.json) return;
  const st=normalize(JSON.parse(d.json));
  if((st.savedAt||0)<=(S.savedAt||0)) return;
  if(typing()){ deferred=d; return; }
  await store.attachImages(st,cloud.fetchImage);
  S=st; await store.saveState(S); applyPrefs();
  sync={status:"ok",at:Date.now(),error:""};
  if(signedIn){ render(); toast("Updated from your other device"); }
}
document.addEventListener("focusout",()=>setTimeout(()=>{ if(deferred&&!typing()){ const d=deferred; deferred=null; applyRemote(d); } },300));
function syncLabel(){
  if(!cloud.enabled()) return "Sync is off. Everything is saved on this device only.";
  if(!cloud.user()) return "Sync is set up, but you are not signed in.";
  if(sync.status==="syncing") return "Syncing…";
  if(sync.status==="error") return `Sync problem: ${esc(sync.error)} Changes are kept on this device and will be sent again.`;
  return sync.at?`Synced at ${new Date(sync.at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} as ${esc(cloud.user().email)}`:`Connected as ${esc(cloud.user().email)}`;
}
function paintSync(){ const el=$("#sync-status"); if(el) el.innerHTML=syncLabel(); const top=$("#sync-top"); if(top) top.textContent=!cloud.enabled()?"On this device":!cloud.user()?"Not signed in to sync":sync.status==="syncing"?"Syncing…":sync.status==="error"?"Sync problem":"Synced"; }
const hasContent=st=>!!st.tasks.length;
async function pushEverything(){ if(!S.savedAt) S.savedAt=Date.now(); await cloud.push(JSON.stringify(store.stripImages(S)),S.savedAt); sync={status:"ok",at:Date.now(),error:""}; }
async function startCloud(){
  try{
    const remote=await cloud.readState(), key="tw.linked."+cloud.user().uid, linked=localStorage.getItem(key);
    if(!remote) await pushEverything();
    else{
      const rs=normalize(JSON.parse(remote.json));
      if(!linked&&hasContent(S)&&hasContent(rs)){
        const pick=await ask("Two copies of your work","This device and your account both have data. Which one do you want to keep? The other copy is replaced.",
          [["cloud",`Keep the account copy (${rs.tasks.length} tasks)`],["local",`Keep this device's copy (${S.tasks.length} tasks)`]]);
        if(pick==="local"){ S.savedAt=Date.now(); await store.saveState(S); await pushEverything(); }
        else { rs.savedAt=Math.max(rs.savedAt||0,(S.savedAt||0)+1); await applyRemote({json:JSON.stringify(rs)}); }
      } else if((rs.savedAt||0)>(S.savedAt||0)) await applyRemote(remote);
      else await pushEverything();
    }
    localStorage.setItem(key,"1");
    cloud.watch(applyRemote); paintSync();
  }catch(e){ sync={status:"error",at:null,error:e.message}; paintSync(); }
}

/* ---------------- In-page dialog ---------------- */
function ask(title,text,options){
  return new Promise(done=>{
    const d=$("#dialog"); $("#scrim").hidden=false; d.hidden=false;
    d.innerHTML=`<h2>${esc(title)}</h2><p class="muted">${esc(text)}</p><div class="stack" style="gap:8px">${options.map(([v,l],i)=>`<button class="btn ${i===0?"primary":""}" data-choice="${v}" style="justify-content:center">${esc(l)}</button>`).join("")}</div>`;
    d.onclick=e=>{ const b=e.target.closest("[data-choice]"); if(!b) return; d.hidden=true; $("#scrim").hidden=true; done(b.dataset.choice); };
  });
}

/* ---------------- Theme ---------------- */
function applyTheme(){ if(S.theme) document.documentElement.setAttribute("data-theme",S.theme); else document.documentElement.removeAttribute("data-theme"); }

/* ---------------- Auth ---------------- */
let authMode="signin";
function showLogin(mode,msg=""){
  authMode=mode; signedIn=false; $("#app").hidden=true; $("#login").hidden=false;
  const err=`<p class="err" id="auth-err" role="alert">${esc(msg)}</p>`;
  const field=(id,label,type,ac,ph,val="")=>`<div class="stack" style="gap:6px"><label class="label" for="${id}">${label}</label><input class="input" id="${id}" type="${type}" autocomplete="${ac}" placeholder="${ph}" value="${esc(val)}" required></div>`;
  const B={
    create:`<div><h2>Create your account</h2><p class="muted">Your password locks Whybook on this device.</p></div>
      <form id="auth-create" class="stack" novalidate>${field("a-name","Your name","text","name","What should we call you?")}${field("a-email","Email","email","username","you@example.com")}${field("a-pass","Password","password","new-password","At least 8 characters")}${field("a-pass2","Repeat password","password","new-password","Type it again")}${err}
      <button class="btn primary big" type="submit">Create account</button></form>
      <p class="proto-note">Already using Whybook on another device? <button class="linkish" data-auth="cloud-setup">Connect sync instead</button></p>`,
    signin:`<div><h2>Welcome back</h2><p class="muted">Sign in to your tasks and decisions.</p></div>
      <form id="auth-signin" class="stack" novalidate>${field("a-email","Email","email","username","you@example.com",S.profile.email)}${field("a-pass","Password","password","current-password","Your password")}${err}
      <button class="btn primary big" type="submit">Sign in</button></form>
      <p class="proto-note">Forgot your password? It can't be recovered on this device. <button class="linkish" data-auth="reset">Reset this device</button></p>`,
    reset:`<div><h2>Reset this device?</h2><p class="muted">This erases every task, note, sketch and plant stored on this device, then lets you create a new account. If sync is on, your data is still in your account.</p></div>
      ${err}<button class="btn big danger" data-auth="wipe">Erase this device</button><button class="btn ghost" data-auth="signin">Cancel</button>`,
    cloud:`<div><h2>Sign in to sync</h2><p class="muted">Use the email and password of your Whybook sync account.</p></div>
      <form id="auth-cloud" class="stack" novalidate>${field("a-email","Email","email","username","you@example.com",S.profile.email)}${field("a-pass","Password","password","current-password","At least 8 characters")}${err}
      <div class="row"><button class="btn primary big" type="submit" style="flex:1">Sign in</button><button class="btn big" type="button" data-auth="cloud-new" style="flex:1">Create account</button></div></form>
      <p class="proto-note"><button class="linkish" data-auth="forgot">Email me a reset link</button> · <button class="linkish" data-auth="cloud-off">Stop syncing on this device</button></p>`,
    "cloud-setup":`<div><h2>Connect sync</h2><p class="muted">Paste the Firebase config from your project (Project settings → Your apps → SDK setup and configuration → Config). The README explains the setup.</p></div>
      <form id="auth-setup" class="stack" novalidate><label class="label" for="a-config">Firebase config</label><textarea class="input" id="a-config" placeholder="const firebaseConfig = { apiKey: ..., projectId: ..., appId: ... }" style="min-height:140px;font-family:var(--f-mono);font-size:.8rem"></textarea>${err}
      <button class="btn primary big" type="submit">Connect</button></form>
      <button class="btn ghost" data-auth="back">Back</button>`,
    offline:`<div><h2>You're offline</h2><p class="muted">Sign-in needs a connection the first time on this device. Connect to the internet and try again.</p></div><button class="btn primary big" data-auth="retry">Try again</button>`
  };
  $("#auth-body").innerHTML=B[mode];
  setTimeout(()=>{ const f=$("#auth-body input:not([value]):not([type=hidden]), #auth-body input[value=''], #auth-body textarea"); f&&f.focus(); },60);
}
const authErr=m=>{ const e=$("#auth-err"); if(e) e.textContent=m; };
const validEmail=e=>/^\S+@\S+\.\S+$/.test(e);
async function backToStart(){ if(cloud.enabled()) return showLogin("cloud"); showLogin(await auth.hasAccount()?"signin":"create"); }
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-auth]"); if(!b) return; e.preventDefault();
  const a=b.dataset.auth;
  if(a==="cloud-setup"||a==="reset"||a==="signin") showLogin(a);
  if(a==="back"||a==="retry") backToStart();
  if(a==="wipe"){ await store.wipeAll(); auth.endSession(); cloud.setConfig(null); location.reload(); }
  if(a==="cloud-off"){ cloud.setConfig(null); location.reload(); }
  if(a==="forgot"){ const em=$("#a-email").value.trim(); if(!validEmail(em)) return authErr("Enter your email first."); try{ await cloud.resetPassword(em); authErr("Check your inbox for a reset link."); }catch(x){ authErr(firebaseMsg(x)); } }
  if(a==="cloud-new"){ const em=$("#a-email").value.trim(), pw=$("#a-pass").value; if(!validEmail(em)) return authErr("Enter a valid email address."); if(pw.length<8) return authErr("Use at least 8 characters for the password.");
    try{ authErr("Creating your account…"); await cloud.signUp(em,pw); }catch(x){ authErr(firebaseMsg(x)); } }
});
function firebaseMsg(x){
  const c=x?.code||""; return c.includes("invalid-credential")||c.includes("wrong-password")||c.includes("user-not-found")?"Email or password is wrong.":
    c.includes("email-already-in-use")?"An account with this email already exists. Sign in instead.":c.includes("weak-password")?"Choose a longer password.":
    c.includes("admin-restricted")||c.includes("operation-not-allowed")?"New accounts are turned off for this project. Sign in with your existing account.":
    c.includes("network")?"No connection. Try again when you're online.":c.includes("too-many-requests")?"Too many tries. Wait a minute and try again.":(x?.message||"Something went wrong.");
}
async function onAuthSubmit(f){
  const v=id=>($("#"+id)?.value||"").trim();
  if(f.id==="auth-create"){
    if(!v("a-name")) return authErr("Enter your name."); if(!validEmail(v("a-email"))) return authErr("Enter a valid email address.");
    if($("#a-pass").value.length<8) return authErr("Use at least 8 characters for the password."); if($("#a-pass").value!==$("#a-pass2").value) return authErr("The two passwords don't match.");
    authErr("Creating your account…"); await auth.createAccount(v("a-name"),v("a-email"),$("#a-pass").value);
    S.profile={name:v("a-name"),email:v("a-email").toLowerCase()}; save(); enterApp();
  }
  if(f.id==="auth-signin"){
    authErr("Checking…");
    if(await auth.checkPassword(v("a-email"),$("#a-pass").value)){ auth.startSession(v("a-email")); enterApp(); } else authErr("Email or password is wrong.");
  }
  if(f.id==="auth-cloud"){
    if(!validEmail(v("a-email"))) return authErr("Enter a valid email address.");
    try{ authErr("Signing in…"); await cloud.signIn(v("a-email"),$("#a-pass").value); }catch(x){ authErr(firebaseMsg(x)); }
  }
  if(f.id==="auth-setup") connectCloud($("#a-config").value,authErr);
}
async function connectCloud(text,report){
  const cfg=cloud.parseConfig(text);
  if(!cfg) return report("That doesn't look like a Firebase config. It needs apiKey, projectId and appId.");
  cloud.setConfig(cfg); report("Connecting…");
  try{ await cloud.init(); location.reload(); }catch(e){ cloud.setConfig(null); report("Couldn't load Firebase. Check your connection and the config."); }
}
function enterApp(){
  if(signedIn) return; signedIn=true;
  $("#login").hidden=true; $("#app").hidden=false; render();
}
async function boot(){
  try{ const st=await store.loadState(); if(st) S=normalize(st); }catch(e){}
  applyPrefs();
  const ver=$("#version"); if(ver) ver.textContent=`Version ${VERSION} · ${VERSION_DATE}`;
  if("serviceWorker" in navigator && location.protocol!=="file:"){
    // Switch to a new version as soon as it is published: ask for sw.js fresh every time, and reload once when a new one takes over.
    const had=!!navigator.serviceWorker.controller; let reloaded=false;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(had&&!reloaded){ reloaded=true; location.reload(); } });
    navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).then(r=>r.update()).catch(()=>{});
  }
  if(cloud.enabled()){
    try{
      await cloud.init();
      cloud.onUser(u=>{
        if(u){ S.profile.email=u.email; if(!S.profile.name) S.profile.name=u.email.split("@")[0]; auth.startSession(u.email); enterApp(); startCloud(); }
        else if(signedIn) location.reload(); else showLogin("cloud");
      });
    }catch(e){ if(auth.sessionValid()) enterApp(); else showLogin("offline"); }
    return;
  }
  if(!(await auth.hasAccount())) return showLogin("create");
  if(auth.sessionValid()) return enterApp();
  showLogin("signin");
}


/* ---------------- Routing ---------------- */
const VIEWS=["tasks","decisions","settings"];
const cur=()=>{const h=location.hash.slice(1);return VIEWS.includes(h)?h:"tasks"};
window.addEventListener("hashchange",()=>{ if(signedIn){ closeOutcome(); if(arranging) stopArranging(); if(inRoom()&&!panelOpen) openPanel(); else render(); } });
const filter={group:null,category:null,text:""};
let showAllDone=false, recording=null, searchT=null, restoreData=null;

function render(){
  const v=cur(); applyRoomState();
  if(inRoom()&&!panelOpen){ renderBoard(); }
  document.querySelectorAll(".tabs a").forEach(a=>{ if(a.getAttribute("href")==="#"+v) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  $("#view").innerHTML=R[v]();
  paintSync();
}

/* ---------------- Views ---------------- */
const R={};
const plural=(n,one,many)=>`${n} ${n===1?one:many}`;

const relatedCount=t=>L.relatedDecisions(L.decisionsOf(S.tasks),{title:t.title,excludeId:t.id}).length;
function taskItem(t){
  const done=t.status==="done", due=done?"":L.dueLabel(t.due,today()), cat=t.outcome&&categoryById(t.outcome.category);
  return `<li class="task-item" data-status="${t.status}" data-complexity="${t.complexity}">
    ${!done&&t.complexity==="simple"?`<input type="checkbox" class="tick" aria-label="Done: ${esc(t.title)}" data-act="complete" data-id="${t.id}">`:""}
    <div class="body">
      <span class="title">${esc(t.title)}</span>
      <span class="meta">
        ${t.complexity==="complex"?`<span class="pill complex">Complex</span>`:""}
        ${!done&&t.complexity==="complex"&&relatedCount(t)?`<button class="pill hint" data-act="record" data-id="${t.id}" aria-label="${plural(relatedCount(t),"earlier decision","earlier decisions")} may help with ${esc(t.title)}">💡 ${plural(relatedCount(t),"earlier decision","earlier decisions")}</button>`:""}
        ${due?`<span class="${due.includes("overdue")?"due overdue":"due"}">${due}</span>`:""}
        ${done?`<span>Done ${t.doneAt}</span>`:""}
        ${done&&t.outcome?`<button class="pill category" data-act="filter-cat" data-id="${esc(t.outcome.category)}" aria-label="Show all ${esc(cat?.name??t.outcome.category)} decisions">${esc(cat?.name??t.outcome.category)}</button>`:""}
      </span>
      ${done&&t.outcome?`<p class="decision">${esc(t.outcome.decision)}</p>`:""}
    </div>
    ${done&&t.outcome?.sticker?stickerImg(t.outcome.sticker,"sticker small"):""}
    <div class="actions">
      ${!done&&t.complexity==="complex"?`<button class="primary" data-act="record" data-id="${t.id}" aria-label="Record result for ${esc(t.title)}">Record result</button>`:""}
      ${!done?`<button class="ghost" data-act="toggle-kind" data-id="${t.id}" title="Change between simple and complex">${t.complexity==="simple"?"Make complex":"Make simple"}</button>`:""}
      ${done&&t.outcome?`<button data-act="record" data-id="${t.id}" aria-label="Edit result for ${esc(t.title)}">Edit result</button>`:""}
      ${done?`<button data-act="reopen" data-id="${t.id}" aria-label="Reopen ${esc(t.title)}">Reopen</button>`:""}
      <button class="ghost" data-act="delete" data-id="${t.id}" aria-label="Delete ${esc(t.title)}">Delete</button>
    </div>
  </li>`;
}

R.tasks=()=>{
  const s=L.weekSummary(S.tasks,today()), sorted=L.sortTasks(S.tasks);
  const todo=sorted.filter(t=>t.status==="todo"), done=sorted.filter(t=>t.status==="done");
  const top=s.topCategory&&categoryById(s.topCategory.id);
  return `
  ${(S.seen||0)<VERSION?`<section class="card start news"><h2>New: make the room yours</h2>
    <ul><li><b>Build your own room</b>: choose the wall, window, furniture, plant and more, in your own colours.</li>
    <li><b>Move and resize things</b> by dragging them, and hang <b>your own pictures</b> or a poster you draw.</li>
    <li><b>Collect</b> new items as you record decisions.</li></ul>
    <div class="row"><button class="primary" data-act="edit-room">🎨 Build my room</button><button data-act="news-seen">Got it</button></div></section>`:""}
  ${S.tasks.length?"":`<section class="card start"><h2>Start here</h2><ol>
    <li>Type a task below and press <b>Add</b>. Tick <b>Needs a decision</b> when finishing it will mean choosing something.</li>
    <li>Simple tasks: tick them off. Complex tasks: press <b>Record result</b> and write what happened, what you decided, and the topic.</li>
    <li>Open <b>Decisions</b> to filter everything you've decided by topic.</li></ol>
    <button data-act="add-examples">Add example tasks to explore</button></section>`}
  <section class="summary" aria-label="This week">
    <div><b>${s.open}</b><span>to do</span></div>
    <div class="${s.overdue?"warn":""}"><b>${s.overdue}</b><span>overdue</span></div>
    <div><b>${s.doneToday}</b><span>done today</span></div>
    <div><b>${s.doneThisWeek}</b><span>done this week</span></div>
    <div><b>${s.decisionsThisWeek}</b><span>decisions this week</span></div>
    ${top?`<div class="wide"><b>${esc(top.name)}</b><span>most decided this week</span></div>`:""}
  </section>
  <form class="capture" id="capture-form">
    <label for="capture" class="visually-hidden">Capture a task</label>
    <input id="capture" placeholder="What do you need to do?" autocomplete="off">
    <label class="check"><input type="checkbox" id="capture-complex"> Needs a decision</label>
    <label class="date">Due <input type="date" id="capture-due"></label>
    <button type="submit" class="primary">Add</button>
    <p class="error" id="capture-err" role="alert" hidden></p>
  </form>
  <div class="task-list">
    <section aria-label="To do"><h2>To do (${todo.length})</h2>
      ${todo.length?`<ul>${todo.map(taskItem).join("")}</ul>`:`<p class="empty">Nothing to do. Capture a task above.</p>`}</section>
    <section aria-label="Done"><h2>Done (${done.length})</h2>
      ${done.length?`<ul>${(showAllDone?done:done.slice(0,10)).map(taskItem).join("")}</ul>`:`<p class="empty">Finished tasks appear here.</p>`}
      ${!showAllDone&&done.length>10?`<button data-act="show-all">Show all ${done.length}</button>`:""}</section>
  </div>
  ${hasExamples()?`<p class="muted"><button class="linkish" data-act="remove-examples">Remove the example tasks</button></p>`:""}`;
};

function decisionList(){
  const all=L.decisionsOf(S.tasks), shown=L.filterDecisions(all,filter);
  if(!all.length) return `<p class="empty">No decisions yet. When you finish a complex task, its result and decision appear here.</p>`;
  return `<p class="muted">${plural(shown.length,"decision","decisions")}</p>
    ${shown.length?shown.map(d=>{ const name=categoryById(d.category)?.name??d.category; return `
      <article class="decision-card" aria-labelledby="d-${d.taskId}">
        <header><h3 id="d-${d.taskId}">${esc(d.title)}</h3><time datetime="${d.doneAt}">${d.doneAt}</time></header>
        <div class="row">${d.sticker?stickerImg(d.sticker,"sticker small"):""}<button class="pill category" data-act="filter-cat" data-id="${esc(d.category)}" aria-label="Show all ${esc(name)} decisions">${esc(name)}</button></div>
        <dl><dt>Result</dt><dd>${esc(d.result)}</dd><dt>Decision</dt><dd>${esc(d.decision)}</dd></dl>
        <button data-act="record" data-id="${d.taskId}" aria-label="Edit ${esc(d.title)}">Edit</button>
      </article>`;}).join(""):`<p class="empty">No decisions match these filters. <button data-act="clear-filters">Clear filters</button></p>`}`;
}
function filterControls(){
  const counts=L.countByCategory(L.decisionsOf(S.tasks));
  const options=CATEGORIES.filter(c=>(!filter.group||c.group===filter.group)&&((counts[c.id]??0)>0||c.id===filter.category));
  const active=filter.group||filter.category||filter.text;
  return `<div class="groups">${[null,...GROUPS].map(g=>`<button data-act="group" data-g="${g??""}" aria-pressed="${filter.group===g}">${g??"All"}</button>`).join("")}</div>
    <label for="f-category">Category</label>
    <select id="f-category"><option value="">All categories</option>${options.map(c=>`<option value="${c.id}" ${c.id===filter.category?"selected":""}>${esc(c.name)} (${counts[c.id]??0})</option>`).join("")}</select>
    <label for="f-text">Search decisions</label>
    <input id="f-text" type="search" value="${esc(filter.text)}">
    ${active?`<button data-act="clear-filters">Clear filters</button>`:""}`;
}
let decisionsMode="folders", openFolder=null;
R.decisions=()=>{
  const all=L.decisionsOf(S.tasks);
  const head=`<div class="row between"><h1>Decisions</h1><button data-act="export-md">Export as Markdown</button></div>
  <p class="muted">What you learned and decided while finishing complex tasks, filed by web development topic.</p>
  ${all.length?`<div class="seg" role="group" aria-label="View">${[["folders","Folders"],["list","List"]].map(([m,l])=>`<button data-act="decisions-mode" data-m="${m}" aria-pressed="${decisionsMode===m}">${l}</button>`).join("")}</div>`:""}`;
  if(!all.length) return `<section class="card">${head}<p class="empty">No decisions yet. When you finish a complex task, its result and decision appear here, filed in a folder for its topic.</p></section>`;
  if(decisionsMode==="list") return `<section class="card">${head}
    <div role="search" aria-label="Filter decisions" class="filters" id="filters">${filterControls()}</div>
    <div id="decision-list" class="decision-log">${decisionList()}</div></section>`;
  const folders=L.foldersOf(all), f=openFolder&&folders.find(x=>x.category===openFolder);
  if(f) return `<section class="card">${head}${folderView(f)}</section>`;
  return `<section class="card">${head}${shelf(folders)}</section>`;
};
function shelf(folders){
  return [...GROUPS,"Other"].map(g=>{ const list=folders.filter(f=>f.group===g); if(!list.length) return "";
    return `<section class="shelf" aria-label="${g}"><h2>${g}</h2><div class="folders">${list.map(f=>`
      <button class="folder" data-act="open-folder" data-id="${esc(f.category)}" aria-label="${esc(f.name)}, ${plural(f.count,"decision","decisions")}">
        ${folderSvg(GROUP_COLORS[f.group]??"#8A93A6",f.stickers)}
        <span class="folder-name">${esc(f.name)}</span><span class="folder-count">${plural(f.count,"decision","decisions")} · latest ${f.latest}</span>
      </button>`).join("")}</div></section>`; }).join("");
}
function folderView(f){
  return `<div class="folder-open" style="--folder:${GROUP_COLORS[f.group]??"#8A93A6"}">
    <div class="row"><button data-act="close-folder">← All folders</button><h2>${esc(f.name)}</h2><span class="muted">${plural(f.count,"decision","decisions")}</span></div>
    <div class="notes">${f.decisions.map((d,i)=>`
      <article class="note" style="--tilt:${[-1.2,0.8,-0.4,1.1][i%4]}deg" aria-labelledby="n-${d.taskId}">
        <span class="clip" aria-hidden="true"></span>
        ${d.sticker?stickerImg(d.sticker):""}
        <header><h3 id="n-${d.taskId}">${esc(d.title)}</h3><time datetime="${d.doneAt}">${d.doneAt}</time></header>
        <dl><dt>Result</dt><dd>${esc(d.result)}</dd><dt>Decision</dt><dd>${esc(d.decision)}</dd></dl>
        <button data-act="record" data-id="${d.taskId}" aria-label="Edit ${esc(d.title)}">Edit</button>
      </article>`).join("")}</div></div>`;
}
function refreshDecisions(){ const f=$("#filters"); if(f){ f.innerHTML=filterControls(); } const l=$("#decision-list"); if(l) l.innerHTML=decisionList(); }

/* ---------------- Room builder ---------------- */
const PICTURES=[["poster","Poster on the wall",500],["view","View from the window",700],["wall","Whole background",1400]];
/** One row of choices per slot. Each row is a radio group; the room behind the panel changes as you choose. */
function roomBuilder(){
  const n=decisionCount(), col=collection(n), r=S.room;
  const chip=(s,o)=>{ const open=isUnlocked(o,n);
    return `<button type="button" role="radio" class="chip" aria-checked="${r[s.id]===o.id}" ${open?`data-act="set-room" data-slot="${s.id}" data-id="${o.id}"`:`aria-disabled="true" title="Opens after ${plural(o.unlock,"decision","decisions")}"`}>${o.color&&!o.photo?`<span class="swatch" style="background:${o.color}"></span>`:""}${open?"":"🔒 "}${esc(o.name)}${open?"":` <span class="muted">· ${o.unlock}</span>`}</button>`; };
  const tint=s=>{ if(!s.tint) return ""; const own=r.colors[s.id], std=s.options.find(o=>o.id===r[s.id]);
    return `<div class="own-colour"><label>Your own colour <input type="color" data-color="${s.id}" value="${own??std?.main??std?.color??"#888888"}"></label>${own?`<button type="button" class="ghost" data-act="clear-color" data-slot="${s.id}">Use the standard colour</button>`:""}</div>`; };
  return `<section class="card stack wide" id="room-builder"><h2>Build your room</h2>
    <p class="muted" style="font-size:.88rem">Choose each part. The room behind this panel changes as you go: tap <b>Back to the room</b> to see it all.</p>
    <div class="room-preview" id="room-preview" aria-hidden="true">${buildRoom(r)}</div>
    <div class="row"><button class="primary" data-act="arrange">✋ Move and resize things</button><button class="btn" data-act="room-random">🎲 Surprise me</button><button class="btn" data-act="room-reset">Start again</button></div>
    ${SLOTS.map(s=>`<div class="slot"><h3 id="slot-${s.id}">${esc(s.name)}</h3>
      <div class="chips" role="radiogroup" aria-labelledby="slot-${s.id}">${s.options.filter(o=>!o.photo||r.images[o.photo]).map(o=>chip(s,o)).join("")}</div>${tint(s)}</div>`).join("")}
    <div class="slot"><h3>Your pictures</h3>
      <p class="muted" style="font-size:.85rem">Add a photo or a drawing from your device, or draw a poster here with your finger or Apple Pencil. Pictures are made smaller before they are saved.</p>
      <div class="pictures">${PICTURES.map(([k,label])=>`<div class="picture">${r.images[k]?`<img src="${r.images[k]}" alt="">`:`<span class="empty" aria-hidden="true">＋</span>`}<b>${label}</b>
        <div class="row"><label class="btn file">${r.images[k]?"Change":"Choose a picture"}<input type="file" accept="image/*" data-image="${k}" class="visually-hidden"></label>
        ${k==="poster"?`<button type="button" class="btn" data-act="draw-poster">✏️ Draw</button>`:""}${r.images[k]?`<button type="button" class="ghost" data-act="remove-image" data-kind="${k}" aria-label="Remove: ${label}">Remove</button>`:""}</div></div>`).join("")}</div></div>
    <div class="slot"><h3>Your collection</h3>
      <p class="muted" style="font-size:.85rem">Every decision you record counts. ${col.next?`Next: <b>${esc(col.next.name)}</b> (${esc(col.next.slotName)}) at ${plural(col.next.unlock,"decision","decisions")}, ${col.next.unlock-n} to go.`:"You have collected everything."}</p>
      <progress class="collect" max="${REWARDS.length}" value="${col.earned.length}" aria-label="Collected ${col.earned.length} of ${REWARDS.length}"></progress>
      <ul class="rewards">${REWARDS.map(x=>`<li class="${x.unlock<=n?"got":""}">${x.unlock<=n?"✓":"🔒"} ${esc(x.name)} <span class="muted">· ${x.unlock}</span></li>`).join("")}</ul></div>
  </section>`;
}
/** Redraw the builder in place, and keep the keyboard focus on the choice just made. */
function refreshBuilder(slot){
  const el=$("#room-builder"); if(!el){ render(); return; }
  const y=scrollY; el.outerHTML=roomBuilder(); scrollTo(0,y);
  const thumb=document.querySelector('.theme-pick[data-id="custom"] .thumb'); if(thumb){ thumb.innerHTML=buildRoom(S.room); thumb.style.background=roomTint(S.room); }
  if(slot) document.querySelector(`#room-builder [data-slot="${slot}"][aria-checked="true"]`)?.focus();
}
const setRoom=(room,slot)=>{ S.room=room; save(); applyBackdrop(); refreshBuilder(slot); };

/* ---------------- Your pictures ---------------- */
/** Read a picture file and make it at most `max` pixels on its longer side, as a JPEG data URL small enough to save and sync. */
async function shrinkImage(file,max){
  const bmp=await createImageBitmap(file), k=Math.min(1,max/Math.max(bmp.width,bmp.height));
  const c=document.createElement("canvas"); c.width=Math.round(bmp.width*k); c.height=Math.round(bmp.height*k);
  const g=c.getContext("2d"); g.fillStyle="#fff"; g.fillRect(0,0,c.width,c.height); g.drawImage(bmp,0,0,c.width,c.height);
  return c.toDataURL("image/jpeg",.82);
}

/* ---------------- Draw a poster ---------------- */
const INKS=["#1D2227","#E4572E","#E8C35A","#4E9A60","#4E7FD9","#9A6FD0","#F28BA8","#FFFFFF"], PAPER="#FBF7EE";
let pad=null;   // { strokes: [{ color, size, points: [[x, y, pressure]] }], color, size, base }
function openDraw(){
  pad={strokes:[],color:INKS[0],size:6,base:null}; recording="draw";
  $("#outcome").innerHTML=`<div class="outcome-form draw" role="dialog" aria-label="Draw a poster"><h2>Draw a poster</h2>
    <canvas id="pad" width="462" height="582" aria-label="Drawing area"></canvas>
    <div class="row inks" role="radiogroup" aria-label="Colour">${INKS.map((c,i)=>`<button type="button" role="radio" class="ink" aria-checked="${i===0}" data-act="pad-ink" data-c="${c}" aria-label="Colour ${i+1}" style="background:${c}"></button>`).join("")}</div>
    <div class="row"><span class="seg" role="radiogroup" aria-label="Pen size">${[[3,"Fine"],[6,"Medium"],[14,"Thick"]].map(([n,l])=>`<button type="button" role="radio" aria-checked="${n===6}" data-act="pad-size" data-n="${n}">${l}</button>`).join("")}</span>
      <button type="button" data-act="pad-undo">Undo</button><button type="button" data-act="pad-clear">Clear</button></div>
    <div class="row"><button type="button" class="primary" data-act="pad-save">Hang it on the wall</button><button type="button" data-act="close-outcome">Cancel</button></div></div>`;
  $("#outcome").hidden=false;
  const cv=$("#pad"); let live=null;
  const at=e=>{ const b=cv.getBoundingClientRect(); return [(e.clientX-b.left)*cv.width/b.width,(e.clientY-b.top)*cv.height/b.height,e.pointerType==="pen"&&e.pressure?e.pressure:.5]; };
  cv.addEventListener("pointerdown",e=>{ e.preventDefault(); cv.setPointerCapture(e.pointerId); live={color:pad.color,size:pad.size,points:[at(e)]}; pad.strokes.push(live); paintPad(); });
  cv.addEventListener("pointermove",e=>{ if(!live) return; for(const ev of (e.getCoalescedEvents?.()??[e])) live.points.push(at(ev)); paintPad(); });
  const end=()=>{ live=null; }; cv.addEventListener("pointerup",end); cv.addEventListener("pointercancel",end);
  if(S.room.images.poster){ const im=new Image(); im.onload=()=>{ if(pad){ pad.base=im; paintPad(); } }; im.src=S.room.images.poster; }   // carry on from the poster you have
  paintPad();
}
function paintPad(){
  const cv=$("#pad"); if(!cv||!pad) return; const g=cv.getContext("2d");
  g.fillStyle=PAPER; g.fillRect(0,0,cv.width,cv.height); if(pad.base) g.drawImage(pad.base,0,0,cv.width,cv.height);
  g.lineCap=g.lineJoin="round";
  for(const st of pad.strokes){ g.strokeStyle=g.fillStyle=st.color; const p=st.points;
    if(p.length===1){ g.beginPath(); g.arc(p[0][0],p[0][1],st.size*(.5+p[0][2])/2,0,7); g.fill(); continue; }
    for(let i=1;i<p.length;i++){ g.lineWidth=st.size*(.5+p[i][2]); g.beginPath(); g.moveTo(p[i-1][0],p[i-1][1]); g.lineTo(p[i][0],p[i][1]); g.stroke(); } }
}

/* ---------------- Move and resize things ---------------- */
let selPart="plant", drag=null;
const sceneScale=()=>Math.max(innerWidth/1200,innerHeight/800);
const partEl=id=>id==="board"?$("#board"):document.querySelector(`#backdrop [data-part="${id}"]`);
function startArranging(){
  arranging=true; panelOpen=false; closeOutcome(); document.documentElement.classList.add("arranging"); applyRoom();
  if(!partEl(selPart)) selPart="board";
  paintArrange(); scrollTo(0,0); $("#arrange-part")?.focus();
}
function stopArranging(){ arranging=false; drag=null; document.documentElement.classList.remove("arranging"); $("#arrange-bar").hidden=true; document.querySelectorAll(".sel").forEach(e=>e.classList.remove("sel")); save(); }
function paintArrange(){
  const here=PARTS.filter(p=>partEl(p.id)), bar=$("#arrange-bar"), p=S.room.pos[selPart];
  bar.innerHTML=`<p class="hint">Drag things in the room to move them, or use the buttons.</p>
    <label>Item <select id="arrange-part">${here.map(x=>`<option value="${x.id}" ${x.id===selPart?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>
    <span class="pad-keys" role="group" aria-label="Move">${[["←",-20,0,"left"],["↑",0,-20,"up"],["↓",0,20,"down"],["→",20,0,"right"]].map(([t,x,y,l])=>`<button type="button" data-act="nudge" data-dx="${x}" data-dy="${y}" aria-label="Move ${l}">${t}</button>`).join("")}</span>
    <span class="pad-keys" role="group" aria-label="Size"><button type="button" data-act="nudge" data-ds="-0.1" aria-label="Smaller">−</button><span class="muted" aria-live="polite">${Math.round((p?.s??1)*100)}%</span><button type="button" data-act="nudge" data-ds="0.1" aria-label="Bigger">+</button></span>
    <button type="button" data-act="layout-reset">Put everything back</button><button type="button" class="primary" data-act="arrange-done">Done</button>`;
  bar.hidden=false;
  document.querySelectorAll(".sel").forEach(e=>e.classList.remove("sel")); partEl(selPart)?.classList.add("sel");
}
/** Show a part where the room now says it is, without redrawing the whole scene. */
function placePart(id){ if(id==="board") placeBoard(); else partEl(id)?.setAttribute("transform",partTransform(S.room,id)); }
function nudge(dx,dy,ds){ S.room=movePart(S.room,selPart,dx,dy,ds); shownBackdrop="custom:"+JSON.stringify(S.room); placePart(selPart); }
document.addEventListener("pointerdown",e=>{
  if(!arranging) return; const el=e.target.closest?.("#backdrop .part, #board"); if(!el) return;
  e.preventDefault(); selPart=el.id==="board"?"board":el.dataset.part; drag={id:e.pointerId,x:e.clientX,y:e.clientY}; paintArrange();
});
document.addEventListener("pointermove",e=>{
  if(!drag||e.pointerId!==drag.id) return; const k=sceneScale(), was=S.room.pos[selPart]??{x:0,y:0};
  nudge((e.clientX-drag.x)/k,(e.clientY-drag.y)/k,0);
  const now=S.room.pos[selPart]; drag.x+=(now.x-was.x)*k; drag.y+=(now.y-was.y)*k;   // only count what was applied, so rounding never drifts
});
for(const ev of ["pointerup","pointercancel"]) document.addEventListener(ev,e=>{ if(drag&&e.pointerId===drag.id){ drag=null; save(); paintArrange(); } });

/* ---------------- Outcome dialog ---------------- */
function openOutcome(id){
  const t=S.tasks.find(x=>x.id===id); if(!t) return;
  recording=id; const o=t.outcome??{result:"",decision:"",category:""}, groups=categoriesByGroup();
  $("#outcome").innerHTML=`<form id="outcome-form" class="outcome-form" role="dialog" aria-label="Record the result" novalidate>
    <h2>${esc(t.title)}</h2>
    <label for="o-result">Result</label><textarea id="o-result" rows="4" placeholder="What happened? What did you find out?">${esc(o.result)}</textarea>
    <label for="o-decision">Decision</label><textarea id="o-decision" rows="3" placeholder="What did you decide, and why?">${esc(o.decision)}</textarea>
    <label for="o-category">Category</label>
    <select id="o-category"><option value="">Choose a category…</option>${GROUPS.map(g=>`<optgroup label="${g}">${groups[g].map(c=>`<option value="${c.id}" ${c.id===o.category?"selected":""}>${esc(c.name)}</option>`).join("")}</optgroup>`).join("")}</select>
    <div id="o-related" aria-live="polite">${relatedHtml(t,o.category)}</div>
    <fieldset class="sticker-pick"><legend>Sticker <span class="muted">(optional)</span></legend>
      <label class="none"><input type="radio" name="o-sticker" value="" ${!o.sticker?"checked":""}><span>None</span></label>
      ${STICKERS.map(st=>`<label title="${esc(st.name)}"><input type="radio" name="o-sticker" value="${st.id}" ${o.sticker===st.id?"checked":""}><span class="sticker" aria-hidden="true">${st.svg}</span><span class="visually-hidden">${esc(st.name)}</span></label>`).join("")}
    </fieldset>
    <p class="error" id="o-err" role="alert" hidden></p>
    <div class="row"><button type="submit" class="primary">Save decision</button><button type="button" data-act="close-outcome">Cancel</button></div>
  </form>`;
  $("#outcome").hidden=false; setTimeout(()=>$("#o-result")?.focus(),30);
}
/** Earlier decisions on the same topic, shown while you write a new one. */
function relatedHtml(t,category){
  const list=L.relatedDecisions(L.decisionsOf(S.tasks),{category,title:t.title,excludeId:t.id});
  if(!list.length) return "";
  const cat=category&&categoryById(category);
  return `<section class="related" aria-label="Earlier decisions"><h3>${cat&&list.some(d=>d.category===category)?`You've decided about ${esc(cat.name)} before`:"Earlier decisions that may help"}</h3>
    <ul>${list.map(d=>`<li>${d.sticker?stickerImg(d.sticker,"sticker small"):""}<span><b>${esc(d.title)}</b> <span class="muted">${d.doneAt}</span><br>${esc(d.decision)}</span></li>`).join("")}</ul></section>`;
}
function closeOutcome(){ recording=null; pad=null; $("#outcome").hidden=true; $("#outcome").innerHTML=""; }

/* ---------------- Settings ---------------- */
R.settings=()=>{
  const cl=cloud.enabled();
  return `<div class="settings-grid">
    <section class="card stack"><h2>Account</h2>
      <form id="name-form" class="row"><label class="label" for="set-name" style="width:100%">Name</label><input class="input" id="set-name" value="${esc(S.profile.name)}" style="flex:1;min-width:160px"><button class="btn" type="submit">Save</button></form>
      <p class="muted">Email: ${esc(S.profile.email||"not set")}</p>
      ${cl?`<p class="muted" style="font-size:.85rem">Your password is managed by your sync account. To change it, sign out and use "Email me a reset link".</p>`
      :`<form id="pw-form" class="stack" style="gap:8px"><span class="label">Change password</span><input class="input" id="pw-old" type="password" autocomplete="current-password" placeholder="Current password" required><input class="input" id="pw-new" type="password" autocomplete="new-password" placeholder="New password, 8+ characters" required><input class="input" id="pw-new2" type="password" autocomplete="new-password" placeholder="Repeat new password" required><button class="btn" type="submit">Change password</button></form>`}
      <div><button class="btn" data-act="logout">Sign out</button></div>
    </section>
    <section class="card stack"><h2>Sync between iPad and computer</h2>
      <p id="sync-status" class="sync-line">${syncLabel()}</p>
      ${cl?`<div><button class="btn" data-act="cloud-off">Stop syncing on this device</button></div>`
      :`<p class="muted" style="font-size:.88rem">Sync uses your own free Firebase project. Follow the steps in the README, then paste the config here on each device.</p>
      <form id="sync-form" class="stack" style="gap:8px"><label class="label" for="fb-config">Firebase config</label><textarea class="input" id="fb-config" placeholder="const firebaseConfig = { apiKey: ..., projectId: ..., appId: ... }" style="min-height:110px;font-family:ui-monospace,monospace;font-size:.8rem"></textarea><button class="btn primary" type="submit">Connect sync</button></form>`}
    </section>
    <section class="card stack"><h2>Backup and export</h2>
      <p class="muted" style="font-size:.88rem">Download everything as one file, and keep a copy somewhere safe, especially if sync is off.</p>
      <div class="row"><button class="btn" data-act="backup">Download backup</button><label class="btn" for="restore-file" style="cursor:pointer">Restore from file</label><input id="restore-file" type="file" accept="application/json,.json" hidden><button class="btn" data-act="export-md">Export decisions as Markdown</button></div>
      <div id="restore-confirm"></div>
    </section>
    <section class="card stack wide"><h2>Background</h2>
      <p class="muted" style="font-size:.88rem">An animated scene behind your tasks. Pick a ready-made room, or <b>My room</b> to put one together yourself. Animations stop when Reduce Motion is on.</p>
      <div class="theme-picks" role="radiogroup" aria-label="Background">${THEMES.map(x=>theme(x.id)).map(t=>`<button role="radio" aria-checked="${S.backdrop===t.id}" data-act="set-backdrop" data-id="${t.id}" class="theme-pick">
        <span class="thumb" style="background:${t.tint||"var(--paper)"}">${t.svg}</span><span>${esc(t.name)}</span></button>`).join("")}</div>
    </section>
    ${S.backdrop==="custom"?roomBuilder():""}
    <section class="card stack"><h2>Appearance</h2>
      <div class="seg">${[["","Match device"],["light","Light"],["dark","Dark"]].map(([v,l])=>`<button data-act="set-theme" data-v="${v}" aria-pressed="${(S.theme||"")===v}">${l}</button>`).join("")}</div>
      <h2>Example tasks</h2>
      <div>${hasExamples()?`<button class="btn" data-act="remove-examples">Remove example tasks</button>`:`<button class="btn" data-act="add-examples">Add example tasks</button>`}</div>
      <h2>Version</h2><p class="muted" style="font-size:.88rem">Version ${VERSION} · ${VERSION_DATE}. The app updates itself when you open it with a connection.</p>
      <div><button class="btn" data-act="update-now">Check for updates</button></div>
      <h2>Erase</h2><p class="muted" style="font-size:.88rem">Removes everything stored on this device and signs you out.</p>
      <div><button class="btn danger" data-act="erase">Erase this device</button></div>
    </section>
  </div>`;
};

/* ---------------- Theme, toast, download ---------------- */
let toastT;
function toast(msg){ const t=$("#toast"); t.innerHTML=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,3200); }
function download(name,text,type){ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); }

/* ---------------- Actions ---------------- */
function change(fn){ S.tasks=fn(S.tasks); save(); render(); }
const A={
  complete:d=>{ change(ts=>L.completeSimple(ts,d.id,today())); toast("Done"); },
  record:d=>openOutcome(d.id),
  "close-outcome":closeOutcome,
  reopen:d=>change(ts=>L.reopenTask(ts,d.id)),
  "toggle-kind":d=>{ const t=S.tasks.find(x=>x.id===d.id); change(ts=>L.setComplexity(ts,d.id,t.complexity==="simple"?"complex":"simple")); },
  delete:d=>{ const b=document.querySelector(`[data-act=delete][data-id="${d.id}"]`); if(!b.dataset.armed){ b.dataset.armed="1"; b.textContent="Tap to confirm"; b.classList.add("danger"); return; } change(ts=>L.deleteTask(ts,d.id)); },
  "show-all":()=>{ showAllDone=true; render(); },
  "decisions-mode":d=>{ decisionsMode=d.m; openFolder=null; render(); },
  "open-folder":d=>{ openFolder=d.id; render(); $("#view").scrollIntoView?.({block:"start"}); },
  "close-folder":()=>{ openFolder=null; render(); },
  "set-backdrop":d=>{ S.backdrop=d.id; save(); applyBackdrop(); render(); },
  "edit-room":()=>{ S.backdrop="custom"; S.seen=VERSION; save(); if(arranging) stopArranging(); applyBackdrop(); if(cur()!=="settings") location.hash="settings"; else if(!panelOpen) openPanel(); else render(); setTimeout(()=>$("#room-builder")?.scrollIntoView({block:"start"}),80); },
  "news-seen":()=>{ S.seen=VERSION; save(); render(); },
  "update-now":async()=>{ toast("Getting the newest version…");   // forget every saved copy of the app's files (never your data), then load again
    try{ for(const r of await navigator.serviceWorker?.getRegistrations?.()??[]) await r.unregister(); for(const k of await caches?.keys?.()??[]) await caches.delete(k); }catch(e){}
    location.reload(); },
  "set-room":d=>setRoom(setSlot(S.room,d.slot,d.id),d.slot),
  "room-random":()=>setRoom(randomRoom(Math.random,decisionCount(),S.room)),
  "room-reset":()=>setRoom(normalizeRoom({...DEFAULT_ROOM,images:S.room.images})),
  "clear-color":d=>setRoom(setColor(S.room,d.slot,null)),
  "remove-image":d=>{ setRoom(setImage(S.room,d.kind,null)); toast("Picture removed"); },
  "draw-poster":openDraw,
  "pad-ink":d=>{ pad.color=d.c; document.querySelectorAll(".ink").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.c===d.c))); },
  "pad-size":d=>{ pad.size=+d.n; document.querySelectorAll("[data-act=pad-size]").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.n===d.n))); },
  "pad-undo":()=>{ pad.strokes.pop(); paintPad(); },
  "pad-clear":()=>{ pad.strokes=[]; pad.base=null; paintPad(); },
  "pad-save":()=>{ const data=$("#pad").toDataURL("image/jpeg",.9); closeOutcome(); setRoom(setImage(S.room,"poster",data)); toast("Your poster is on the wall. Use <b>Move and resize things</b> to place it."); },
  arrange:startArranging,
  "arrange-done":()=>{ stopArranging(); if(cur()!=="settings") location.hash="settings"; openPanel(); },
  nudge:d=>{ nudge(+(d.dx||0),+(d.dy||0),+(d.ds||0)); save(); paintArrange(); document.querySelector(`#arrange-bar [data-act=nudge][data-dx="${d.dx||""}"][data-dy="${d.dy||""}"][data-ds="${d.ds||""}"]`)?.focus(); },
  "layout-reset":()=>{ S.room=resetLayout(S.room); save(); shownBackdrop=null; applyBackdrop(); paintArrange(); },
  "open-panel":()=>{ if(!arranging) openPanel(); },
  "board-add":()=>toggleBoardForm($("#board-form").hidden),
  "close-panel":closePanel,
  "filter-cat":d=>{ filter.group=null; filter.category=d.id; filter.text=""; decisionsMode="list"; if(cur()==="decisions") render(); else location.hash="decisions"; },
  group:d=>{ filter.group=d.g||null; filter.category=null; refreshDecisions(); },
  "clear-filters":()=>{ filter.group=null; filter.category=null; filter.text=""; render(); },
  "export-md":()=>{ download(`decisions-${today()}.md`,L.decisionsToMarkdown(L.decisionsOf(S.tasks)),"text/markdown"); toast("Decisions exported"); },
  "add-examples":()=>{ if(hasExamples()) return; S.tasks=[...exampleTasks(),...S.tasks]; save(); render(); toast("Example tasks added. Remove them from the task list or Settings."); },
  "remove-examples":()=>{ S.tasks=S.tasks.filter(t=>!t.sample); save(); render(); toast("Example tasks removed"); },
  "set-theme":d=>{ S.theme=d.v||null; save(); applyTheme(); render(); },
  logout:async()=>{ auth.endSession(); if(cloud.user()) await cloud.signOut(); location.hash=""; location.reload(); },
  backup:()=>{ download(`whybook-backup-${today()}.json`,JSON.stringify({app:"whybook",version:2,exportedAt:new Date().toISOString(),state:S}),"application/json"); toast("Backup downloaded"); },
  "restore-yes":()=>{ if(!restoreData) return; S=normalize(restoreData); S.savedAt=Date.now(); restoreData=null; applyPrefs(); save(); render(); toast("Backup restored"); },
  "restore-no":()=>{ restoreData=null; render(); },
  "cloud-off":async()=>{ if(cloud.user()) await cloud.signOut(); cloud.setConfig(null); auth.startSession(S.profile.email||"me"); location.reload(); },
  erase:async()=>{ const b=$("[data-act=erase]"); if(!b.dataset.armed){ b.dataset.armed="1"; b.textContent="Tap again to erase everything on this device"; return; } if(cloud.user()) await cloud.signOut(); await store.wipeAll(); auth.endSession(); cloud.setConfig(null); location.hash=""; location.reload(); },
};
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-act]"); if(!el||el.closest("#login")) return;
  const f=A[el.dataset.act]; if(!f) return;
  if(el.tagName!=="INPUT") e.preventDefault();
  f(el.dataset);
});
document.addEventListener("keydown",e=>{ if(e.key!=="Escape") return; if(recording) closeOutcome(); else if(arranging) A["arrange-done"](); else if(!$("#board-form").hidden) { toggleBoardForm(false); $("#board-add").focus(); } else if(panelOpen&&inRoom()) closePanel(); });
$("#outcome").addEventListener("click",e=>{ if(e.target.id==="outcome") closeOutcome(); });
document.addEventListener("change",e=>{
  const el=e.target;
  if(el.id==="arrange-part"){ selPart=el.value; paintArrange(); $("#arrange-part").focus(); return; }
  if(el.dataset.color){ setRoom(setColor(S.room,el.dataset.color,el.value)); return; }
  if(el.dataset.image&&el.files[0]){ const kind=el.dataset.image, max=PICTURES.find(x=>x[0]===kind)[2];
    shrinkImage(el.files[0],max).then(data=>{ setRoom(setImage(S.room,kind,data)); toast(kind==="poster"?"Your poster is on the wall":"Picture added to your room"); },()=>toast("That file couldn't be read as a picture.")); return; }
  if(el.id==="backdrop-pick"){ S.backdrop=el.value; save(); applyBackdrop(); if(panelOpen) render(); return; }
  if(el.id==="o-category"&&recording){ const t=S.tasks.find(x=>x.id===recording), box=$("#o-related"); if(t&&box) box.innerHTML=relatedHtml(t,el.value); return; }
  if(el.id==="f-category"){ filter.category=el.value||null; refreshDecisions(); }
  else if(el.id==="restore-file"&&el.files[0]){ el.files[0].text().then(t=>{ try{ const d=JSON.parse(t); if(!["whybook","threadwork"].includes(d.app)||!d.state) throw 0; /* "threadwork": backups made before the rename */ restoreData=d.state; $("#restore-confirm").innerHTML=`<p>Replace everything with the backup from <b>${esc((d.exportedAt||"").slice(0,10))}</b> (${d.state.tasks?.length||0} tasks)?</p><div class="row"><button class="btn primary" data-act="restore-yes">Replace</button><button class="btn ghost" data-act="restore-no">Cancel</button></div>`; }catch(x){ toast("That file isn't a Whybook backup."); } }); }
});
document.addEventListener("input",e=>{
  if(e.target.id==="f-text"){ filter.text=e.target.value; clearTimeout(searchT); searchT=setTimeout(()=>{ const l=$("#decision-list"); if(l) l.innerHTML=decisionList(); },250); }
  if(e.target.dataset?.color){ S.room=setColor(S.room,e.target.dataset.color,e.target.value); applyBackdrop(); const pv=$("#room-preview"); if(pv) pv.innerHTML=buildRoom(S.room); }   // live while you pick
  if(e.target.id==="capture"){ const er=$("#capture-err"); if(er) er.hidden=true; }
});
document.addEventListener("submit",e=>{
  const f=e.target; e.preventDefault();
  if(f.id.startsWith("auth-")) return onAuthSubmit(f);
  if(f.id==="capture-form"){
    const title=$("#capture").value.trim();
    if(!title){ const er=$("#capture-err"); er.textContent="Type a task first"; er.hidden=false; return; }
    S.tasks=[L.createTask(title,uid(),today(),{complexity:$("#capture-complex").checked?"complex":"simple",due:$("#capture-due").value||null}),...S.tasks];
    save(); render(); $("#capture")?.focus();
  }
  if(f.id==="board-form"){
    const inp=$("#board-input"), title=inp.value.trim(); if(!title){ inp.focus(); return; }
    S.tasks=[L.createTask(title,uid(),today(),{complexity:$("#board-complex").checked?"complex":"simple"}),...S.tasks];
    inp.value=""; $("#board-complex").checked=false; save(); render(); inp.focus(); toast("Added to your list"); return;
  }
  if(f.id==="outcome-form"){
    const r=L.parseOutcome({result:$("#o-result").value,decision:$("#o-decision").value,category:$("#o-category").value,sticker:document.querySelector("input[name=o-sticker]:checked")?.value||null});
    if(!r.ok){ const er=$("#o-err"); er.textContent=r.error; er.hidden=false; return; }
    const id=recording, first=S.tasks.find(t=>t.id===id)?.status!=="done", before=decisionCount();
    closeOutcome(); change(ts=>L.recordOutcome(ts,id,r.value,today()));
    const fresh=collection(decisionCount(),before).fresh;   // anything new for your room?
    toast(fresh.length?`🎁 New for your room: <b>${fresh.map(x=>esc(x.name)).join(", ")}</b>. Find it in Settings → My room.`:first?`Decision saved under ${esc(categoryById(r.value.category)?.name??"")}`:"Decision updated");
  }
  if(f.id==="name-form"){ S.profile.name=$("#set-name").value.trim(); save(); render(); toast("Name saved"); }
  if(f.id==="pw-form"){ const ok=$("#pw-new").value.length>=8&&$("#pw-new").value===$("#pw-new2").value; if(!ok) return toast("New passwords must match and be at least 8 characters."); auth.changePassword($("#pw-old").value,$("#pw-new").value).then(r=>{ toast(r?"Password changed":"Current password is wrong"); if(r) f.reset(); }); }
  if(f.id==="sync-form") connectCloud($("#fb-config").value,m=>toast(esc(m)));
});

boot();
