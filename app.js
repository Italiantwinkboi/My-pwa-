// Page fade helper
document.addEventListener("DOMContentLoaded",()=>document.body.classList.add("page"));

// Multiple notes system
const NK="pwa-notes";
let notes=JSON.parse(localStorage[NK]||"{}");

function saveNote(name, text){
  notes[name]=text;
  localStorage[NK]=JSON.stringify(notes);
}

function getNote(name){
  return notes[name]||"";
}

function listNotes(){
  return Object.keys(notes);
}