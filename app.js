// Haptic
const h=()=>navigator.vibrate?.(8);

// Highlight active tab
const setActive=(p)=>{
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  if(p.includes('notes'))tabNotes.classList.add('active');
  if(p.includes('tasks'))tabTasks.classList.add('active');
  if(p.includes('settings'))tabSettings.classList.add('active');
}

// Router render shells
const shell=()=>{app.innerHTML="";return app}

// Render pages (simplified visuals)
async function renderHome(){
  const m=shell();
  setActive('/');
  m.innerHTML=`<div class="header"><div class="h1">Dashboard</div></div>
  <div class="grid card">
    <div class="tile" onclick="nav('/My-pwa-/notes');h()">📝 <span>Notes</span></div>
    <div class="tile" onclick="nav('/My-pwa-/tasks');h()">✅ <span>Tasks</span></div>
    <div class="tile" onclick="nav('/My-pwa-/settings');h()">⚙️ <span>Settings</span></div>
  </div>`;
}
async function renderNotes(){
  const m=shell();
  setActive('/notes');
  m.innerHTML=`<div class="card">
    <button class="backBtn" onclick="nav('/My-pwa-/');h()">← Back</button>
    <h2>Notes</h2>
    <textarea class="box"></textarea>
    <button class="btn" onclick="h()">Save</button>
  </div>`;
}
async function renderTasks(){
  const m=shell();
  setActive('/tasks');
  m.innerHTML=`<div class="card">
    <button class="backBtn" onclick="nav('/My-pwa-/');h()">← Back</button>
    <h2>Tasks</h2>
    <input class="box"/><button class="btn" onclick="h()">Add</button>
  </div>`;
}
async function renderSettings(){
  const m=shell();
  setActive('/settings');
  m.innerHTML=`<div class="card">
    <button class="backBtn" onclick="nav('/My-pwa-/');h()">← Back</button>
    <h2>Theme</h2>
    <button class="btn" onclick="document.body.className='dark';h()">Dark</button>
    <button class="btn" onclick="document.body.className='';h()">Light</button>
  </div>`;
}

// Router logic (prevents zoom change bugs)
function nav(p){history.pushState({},'',p);route()}
async function route(){
  const p=location.pathname;
  setActive(p);
  if(p==='/'||p==='/My-pwa-/')renderHome();
  if(p.includes('notes'))renderNotes();
  if(p.includes('tasks'))renderTasks();
  if(p.includes('settings'))renderSettings();
}
window.addEventListener('popstate',route);
route();

// (Optional) Swipe-left to go home
window.addEventListener('touchstart',e=>{x=e.touches[0].clientX});
let x=0;
window.addEventListener('touchend',e=>{if(e.changedTouches[0].clientX-x>120){nav('/My-pwa-/');h()}});