function fit(){
  document.documentElement.style.setProperty('--vw', window.innerWidth + 'px');
}
window.addEventListener('resize', fit);
fit();
// Minimal IndexedDB helper (promised)
const DB_NAME='pwa-db', DB_VER=1; let dbP = new Promise((res,rej)=>{
  let r = indexedDB.open(DB_NAME,DB_VER);
  r.onupgradeneeded = e => {
    let db = e.target.result;
    if(!db.objectStoreNames.contains('notes')) db.createObjectStore('notes',{keyPath:'id'});
    if(!db.objectStoreNames.contains('tasks')) db.createObjectStore('tasks',{keyPath:'id'});
    if(!db.objectStoreNames.contains('meta')) db.createObjectStore('meta',{keyPath:'k'});
  };
  r.onsuccess = e => res(e.target.result);
  r.onerror = e => rej(e.target.error);
});
function id(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,8) }
async function dbPut(store, val){ const db=await dbP; return new Promise((res,rej)=>{ let tx=db.transaction(store,'readwrite').objectStore(store).put(val); tx.onsuccess=()=>res(true); tx.onerror=()=>rej(); }) }
async function dbGetAll(store){ const db=await dbP; return new Promise((res,rej)=>{ let req=db.transaction(store).objectStore(store).getAll(); req.onsuccess=()=>res(req.result); req.onerror=()=>rej(); }) }
async function dbGet(store, key){ const db=await dbP; return new Promise((res,rej)=>{ let req=db.transaction(store).objectStore(store).get(key); req.onsuccess=()=>res(req.result); req.onerror=()=>rej(); }) }
async function dbDel(store,key){ const db=await dbP; return new Promise((res,rej)=>{ let req=db.transaction(store,'readwrite').objectStore(store).delete(key); req.onsuccess=()=>res(); req.onerror=()=>rej(); }) }

// Haptic helper
function haptic(){ if(navigator.vibrate) navigator.vibrate(10) }

// Router (very small)
function nav(path){ history.pushState({},'',path); route(); }
function route(){
  const p = location.pathname.replace('/My-pwa-','') || '/';
  document.querySelectorAll('main.container').forEach(n=>n.remove());
  if(p==='/' || p==='/index.html'){ renderHome(); return; }
  if(p.includes('notes')){ renderNotes(); return; }
  if(p.includes('tasks')){ renderTasks(); return; }
  if(p.includes('settings')){ renderSettings(); return; }
  renderHome();
}
window.addEventListener('popstate', route);

// Renderers
function renderShell(){ const main=document.createElement('main'); main.className='container page'; document.body.prepend(main); return main; }

async function renderHome(){
  const m = renderShell();
  m.innerHTML = `<div class="header"><div class="h1">Dashboard</div></div>
    <div class="grid card">
      <a class="tile" href="#" data-href="/My-pwa-/notes"><div>📝</div><div class="small">Notes</div></a>
      <a class="tile" href="#" data-href="/My-pwa-/tasks"><div>✅</div><div class="small">Tasks</div></a>
      <a class="tile" href="#" data-href="/My-pwa-/settings"><div>⚙️</div><div class="small">Settings</div></a>
    </div>`;
  m.querySelectorAll('[data-href]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); nav(a.dataset.href); haptic(); }));
}

async function renderNotes(){
  const m = renderShell();
  m.innerHTML = `<div class="header"><div class="h1">Notes</div></div>
    <div class="card">
      <input id="noteTitle" class="box" placeholder="Title (ex: ideas)"/>
      <textarea id="noteBody" class="box" placeholder="Write here..."></textarea>
      <div style="display:flex;gap:10px">
        <button id="saveNote" class="btn">Save</button>
        <button id="exportNotes" class="btn" style="background:#475569">Export</button>
      </div>
      <div id="noteList" style="margin-top:12px"></div>
    </div>`;
  document.getElementById('saveNote').addEventListener('click', async ()=>{
    const t=document.getElementById('noteTitle').value.trim(); const b=document.getElementById('noteBody').value;
    if(!t){ alert('Add a title'); return; }
    const obj={id:id(),title:t,body:b,updated:Date.now()};
    await dbPut('notes',obj); haptic(); renderNotes();
  });
  document.getElementById('exportNotes').addEventListener('click', async ()=>{
    const all = await dbGetAll('notes'); const blob=new Blob([JSON.stringify(all,0,2)],{type:'application/json'}); 
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='notes-export.json'; a.click(); URL.revokeObjectURL(url);
  });
  // list
  const list = await dbGetAll('notes');
  const node = document.getElementById('noteList');
  if(!list.length) node.innerHTML = '<div class="small">No notes yet.</div>';
  else node.innerHTML = list.map(n=>`<div style="padding:10px;border-radius:8px;background:#f8fcff;margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-weight:700">${n.title}</div>
      <div><button data-id="${n.id}" class="btn" style="padding:6px 8px;background:#ef4444">Delete</button></div>
    </div>
    <div class="small" style="margin-top:6px">${n.body? n.body.slice(0,180):''}</div>
  </div>`).join('');
  node.querySelectorAll('button[data-id]').forEach(b=>b.addEventListener('click',async e=>{ if(!confirm('Delete?'))return; await dbDel('notes',b.dataset.id); haptic(); renderNotes(); }));
}

async function renderTasks(){
  const m = renderShell();
  m.innerHTML = `<div class="header"><div class="h1">Tasks</div></div>
    <div class="card">
      <input id="taskText" class="box" placeholder="New task"/>
      <div style="display:flex;gap:10px"><button id="addTask" class="btn">Add</button><button id="clearDone" class="btn" style="background:#ef4444">Clear Done</button></div>
      <div id="taskList" style="margin-top:12px"></div>
    </div>`;
  document.getElementById('addTask').addEventListener('click', async ()=>{
    const v=document.getElementById('taskText').value.trim(); if(!v) return;
    await dbPut('tasks',{id:id(),text:v,done:false,created:Date.now()});
    document.getElementById('taskText').value=''; haptic(); renderTasks();
  });
  document.getElementById('clearDone').addEventListener('click', async ()=>{
    const all = await dbGetAll('tasks'); for(const t of all) if(t.done) await dbDel('tasks',t.id); renderTasks();
  });
  const all = await dbGetAll('tasks');
  const list = document.getElementById('taskList');
  if(!all.length) list.innerHTML='<div class="small">No tasks</div>'; else {
    list.innerHTML = all.sort((a,b)=>b.created-a.created).map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-radius:8px;background:#f8fcff;margin-bottom:8px">
      <div style="display:flex;gap:10px;align-items:center"><input type="checkbox" data-id="${t.id}" ${t.done? 'checked':''}/> <div>${t.text}</div></div>
      <div><button data-del="${t.id}" class="btn" style="background:#ef4444;padding:6px 8px">Del</button></div>
    </div>`).join('');
    list.querySelectorAll('input[type=checkbox]').forEach(ch=>ch.addEventListener('change', async e=>{ const idv=e.target.dataset.id; const obj = await dbGet('tasks',idv); obj.done = e.target.checked; await dbPut('tasks',obj); haptic(); renderTasks(); }));
    list.querySelectorAll('button[data-del]').forEach(b=>b.addEventListener('click', async e=>{ await dbDel('tasks',b.dataset.del); haptic(); renderTasks(); }));
  }
}

// Settings
function renderSettings(){
  const m = renderShell();
  m.innerHTML = `<div class="header"><div class="h1">Settings</div></div>
    <div class="card"><div class="small">Theme</div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button id="setDark" class="btn">Dark</button>
        <button id="setLight" class="btn" style="background:#475569">Light</button>
      </div>
      <div style="margin-top:12px"><button id="importBtn" class="btn" style="background:#64748b">Import JSON</button></div>
    </div>`;
  document.getElementById('setDark').addEventListener('click', ()=>{ document.documentElement.classList.add('dark'); localStorage.theme='dark'; haptic(); });
  document.getElementById('setLight').addEventListener('click', ()=>{ document.documentElement.classList.remove('dark'); localStorage.theme=''; haptic(); });
  document.getElementById('importBtn').addEventListener('click', async ()=>{
    const input = document.createElement('input'); input.type='file'; input.accept='.json,application/json';
    input.onchange = async e => {
      const f = e.target.files[0]; if(!f) return;
      const txt = await f.text(); try{ const arr = JSON.parse(txt); if(Array.isArray(arr)){ for(const o of arr){ if(o.id && o.title) await dbPut('notes',o); if(o.id && o.text) await dbPut('tasks',o); } alert('Imported'); haptic(); } }catch(err){ alert('Invalid JSON') }
    };
    input.click();
  });
}

// Init
(async function init(){
  // install sw
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/My-pwa-/sw.js').catch(()=>{});
  if(localStorage.theme==='dark') document.documentElement.classList.add('dark');
  route();
})();