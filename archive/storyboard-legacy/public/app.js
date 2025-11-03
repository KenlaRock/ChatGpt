// === Utilities
const qs=(s,el=document)=>el.querySelector(s); const qsa=(s,el=document)=>[...el.querySelectorAll(s)];
const sizeFmt=n=> n<1024? n+' B': n<1024*1024? (n/1024).toFixed(1)+' KB': (n/1024/1024).toFixed(2)+' MB';
const safeHTML=s=> s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const nodeCount=v=>{ const seen=new Set(); let c=0; const walk=x=>{ if(x && typeof x==='object'){ if(seen.has(x)) return; seen.add(x); if(Array.isArray(x)){ c+=x.length; x.forEach(walk); } else { c+=Object.keys(x).length; Object.values(x).forEach(walk); } } }; walk(v); return c; };
const isObj=x=> x && typeof x==='object' && !Array.isArray(x);
// Undo/Redo
const MAX_HISTORY=200; let history=[], future=[];
const commit=st=>{ history.push(structuredClone(st)); if(history.length>MAX_HISTORY) history.shift(); future.length=0; updateUR(); };
const undo=()=>{ if(history.length>1){ future.push(history.pop()); apply(history.at(-1), false); } updateUR(); };
const redo=()=>{ if(future.length){ const st=future.pop(); history.push(st); apply(st, false); } updateUR(); };
const updateUR=()=> qs('#badgeUR').textContent= history.length + '/' + future.length;
// IndexedDB Snapshots
const DB_NAME='dv_snapshots_v22'; function idb(){ return new Promise((res,rej)=>{ const req=indexedDB.open(DB_NAME,1); req.onupgradeneeded=()=>{ req.result.createObjectStore('snaps',{keyPath:'id', autoIncrement:true}); }; req.onsuccess=()=>res(req.result); req.onerror=()=>rej(req.error); });}
async function saveSnap(payload){ const db=await idb(); const tx=db.transaction('snaps','readwrite'); await tx.objectStore('snaps').add({ts:Date.now(), payload}); await tx.complete; listSnaps(); }
async function listSnaps(){ const db=await idb(); const tx=db.transaction('snaps'); const st=tx.objectStore('snaps'); const req=st.getAll(); return new Promise(r=>{ req.onsuccess=()=>{ renderSnapList(req.result||[]); r(); }; }); }
async function loadSnap(id){ const db=await idb(); const tx=db.transaction('snaps'); const st=tx.objectStore('snaps'); const req=st.get(id); return new Promise(r=>{ req.onsuccess=()=>{ if(req.result) apply(req.result.payload); r(); }; }); }
function renderSnapList(items){ const host=qs('#snapList'); host.innerHTML=''; items.sort((a,b)=>b.ts-a.ts).slice(0,20).forEach(it=>{ const id=it.id||it.ts; const d=new Date(it.ts).toLocaleString(); host.insertAdjacentHTML('beforeend', `<span>${d}</span><button class='btn' data-snap='${id}'>Öppna</button>`); }); qsa('[data-snap]').forEach(b=> b.onclick=()=> loadSnap(+b.dataset.snap)); }
// Parsing Worker
const parserWorkerCode = `self.onmessage = async (e)=>{ const { text } = e.data; const ret={ ok:true, format:'text', info:{}, data:null, raw:text }; function tryJSON(){ try{ const o=JSON.parse(text); ret.format='json'; ret.data=o; ret.info.mode='JSON'; return true; }catch{ return false; } } function tryXML(){ try{ const p=new DOMParser(); const doc=p.parseFromString(text,'application/xml'); if(doc.getElementsByTagName('parsererror').length) return false; const toObj=(node)=>{ const o={ name: node.nodeName }; if(node.attributes && node.attributes.length){ o.attrs={}; for(const a of node.attributes) o.attrs[a.name]=a.value; } const kids=[...node.childNodes].filter(n=>n.nodeType===1); const texts=[...node.childNodes].filter(n=>n.nodeType===3).map(n=>n.nodeValue.trim()).filter(Boolean); if(texts.length) o.text=texts.join(' '); if(kids.length) o.children=kids.map(toObj); return o; }; ret.format='xml'; ret.info.mode='XML'; ret.data=toObj(doc.documentElement); return true; }catch{ return false; } } function tryCSV(){ try{ const lines=text.split(/
?
/).filter(l=>l.trim().length>0); if(lines.length<1) return false; const sep=(lines[0].includes(';')&&!lines[0].includes(','))?';':','; const hdr=lines[0].split(sep).map(s=>s.trim()); const rows=lines.slice(1).map(l=>{ const cols=l.split(sep); const o={}; hdr.forEach((h,i)=> o[h]=cols[i]!==undefined?cols[i].trim():'' ); return o; }); if(hdr.length===1 && rows.length===0) return false; ret.format='csv'; ret.info.mode='CSV('+sep+')'; ret.data=rows; return true; }catch{ return false; } } function tryYAML(){ const looks=/^\s*\w[\w-]*\s*:/m.test(text); if(!looks) return false; const obj={}; const lines=text.split(/\r?\n/); let currentKey=null; for(const line of lines){ if(/^\s*-\s*/.test(line)){ if(currentKey && !Array.isArray(obj[currentKey])) obj[currentKey]=[]; let v=line.replace(/^\s*-\s*/,'').trim(); if(/^\d+(\.\d+)?$/.test(v)) v=+v; else if(v==='true'||v==='false') v=(v==='true'); obj[currentKey].push(v); } else { const m=line.match(/^\s*([\w-]+)\s*:\s*(.*)$/); if(m){ currentKey=m[1]; let v=m[2].trim(); if(v==='') obj[currentKey]=''; else { if(/^\d+(\.\d+)?$/.test(v)) v=+v; else if(v==='true'||v==='false') v=(v==='true'); obj[currentKey]=v; } } } } ret.format='yaml'; ret.info.mode='YAML (basic parser)'; ret.data=obj; return true; } if(tryJSON()||tryXML()||tryCSV()||tryYAML()){ self.postMessage(ret); } else { ret.data=text; ret.info.mode='TEXT'; self.postMessage(ret); } };`;
let parserWorker = null;
try {
  parserWorker = new Worker(URL.createObjectURL(new Blob([parserWorkerCode], { type: 'application/javascript' })));
} catch (e) {
  console.warn('Worker could not be created; falling back to main-thread parsing', e);
}

// Main-thread parser fallback for environments where Web Workers are blocked
function parseInMainThread(text) {
  const ret = { data: null, info: {}, format: 'text' };
  function tryJSON() {
    try {
      const o = JSON.parse(text);
      ret.format = 'json';
      ret.data = o;
      ret.info.mode = 'JSON';
      return true;
    } catch {}
    return false;
  }
  function tryXML() {
    try {
      const p = new DOMParser();
      const doc = p.parseFromString(text, 'application/xml');
      if (doc.getElementsByTagName('parsererror').length) return false;
      const toObj = (node) => {
        const o = { name: node.nodeName };
        if (node.attributes && node.attributes.length) {
          o.attrs = {};
          for (const a of node.attributes) o.attrs[a.name] = a.value;
        }
        const kids = [...node.childNodes].filter(n => n.nodeType === 1);
        const texts = [...node.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue.trim()).filter(Boolean);
        if (texts.length) o.text = texts.join(' ');
        if (kids.length) o.children = kids.map(toObj);
        return o;
      };
      ret.format = 'xml';
      ret.info.mode = 'XML';
      ret.data = toObj(doc.documentElement);
      return true;
    } catch {}
    return false;
  }
  function tryCSV() {
    try {
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 1) return false;
      const sep = (lines[0].includes(';') && !lines[0].includes(',')) ? ';' : ',';
      const hdr = lines[0].split(sep).map(s => s.trim());
      const rows = lines.slice(1).map(l => {
        const cols = l.split(sep);
        const o = {};
        hdr.forEach((h, i) => o[h] = cols[i] !== undefined ? cols[i].trim() : '');
        return o;
      });
      if (hdr.length === 1 && rows.length === 0) return false;
      ret.format = 'csv';
      ret.info.mode = 'CSV(' + sep + ')';
      ret.data = rows;
      return true;
    } catch {}
    return false;
  }
  function tryYAML() {
    const looks = /^\s*\w[\w-]*\s*:/m.test(text);
    if (!looks) return false;
    const obj = {};
    const lines = text.split(/\r?\n/);
    let currentKey = null;
    for (const line of lines) {
      if (/^\s*-\s*/.test(line)) {
        if (currentKey && !Array.isArray(obj[currentKey])) obj[currentKey] = [];
        let v = line.replace(/^\s*-\s*/, '').trim();
        if (/^\d+(\.\d+)?$/.test(v)) v = +v;
        else if (v === 'true' || v === 'false') v = (v === 'true');
        obj[currentKey].push(v);
      } else {
        const m = line.match(/^\s*([\w-]+)\s*:\s*(.*)$/);
        if (m) {
          currentKey = m[1];
          let v = m[2].trim();
          if (v === '') obj[currentKey] = '';
          else {
            if (/^\d+(\.\d+)?$/.test(v)) v = +v;
            else if (v === 'true' || v === 'false') v = (v === 'true');
            obj[currentKey] = v;
          }
        }
      }
    }
    ret.format = 'yaml';
    ret.info.mode = 'YAML (basic parser)';
    ret.data = obj;
    return true;
  }
  if (tryJSON() || tryXML() || tryCSV() || tryYAML()) {
    return ret;
  }
  ret.data = text;
  ret.info.mode = 'TEXT';
  return ret;
}
// State
let state={ rawText:'', parsed:null, format:'', info:{}, size:0 };

// Performance monitoring
let performanceWarning = false;
function checkPerformance(){
  // Determine if dataset is very large and could impact performance
  if(!state.parsed){
    performanceWarning = false;
    updatePerfBanner();
    return;
  }
  let n = 0;
  try {
    n = nodeCount(state.parsed);
  } catch(e){ n = 0; }
  // Threshold: warn if more than 200k nodes
  performanceWarning = n > 200000;
  updatePerfBanner();
}
function updatePerfBanner(){
  const el = qs('#perfBanner');
  if(!el) return;
  if(performanceWarning){
    el.textContent = '⚠️ Prestandavarning: datasetet är mycket stort. Export stoppad.';
  } else {
    el.textContent = '';
  }
}
function apply(newState, doCommit=true){ state=newState; if(doCommit) commit(structuredClone(state)); renderAll(); }
function setBadges(){ qs('#badgeFormat').textContent= state.format||'—'; qs('#badgeSize').textContent= sizeFmt(state.size||0); try{ const n=state.parsed? nodeCount(state.parsed):0; qs('#badgeNodes').textContent=n+' noder'; }catch{ qs('#badgeNodes').textContent='—'; } }
// Views
function showView(name){ ['raw','tree','outline','table','mindmap'].forEach(v=> qs('#view-'+v).classList.toggle('hidden', v!==name)); }
qsa('[data-view]').forEach(b=> b.onclick=()=>{ qsa('[data-view]').forEach(x=>x.setAttribute('aria-pressed','false')); b.setAttribute('aria-pressed','true'); showView(b.dataset.view); });
function renderRaw(){ qs('#raw').textContent = state.rawText || ''; }
function renderTree(){ const host=qs('#tree'); host.innerHTML=''; const filter=qs('#txtSearch').value; const re=filter? new RegExp(filter,'i'):null; function node(key,val){ const label=`<strong>${safeHTML(String(key))}</strong>: <span>${safeHTML(typeof val==='object'?'':String(val))}</span>`; if(val && typeof val==='object'){ const entries=Array.isArray(val)? val.map((v,i)=>[i,v]):Object.entries(val); const inner=entries.slice(0,2000).map(([k,v])=>node(k,v)).join(''); return `<details><summary>${label}</summary><div style='margin-left:1rem'>${inner}</div></details>`; } const text=label; if(!re||re.test(text)) return `<div>${text}</div>`; return `<div class='hidden'>${text}</div>`; }
  let html=''; if(state.format==='xml' && state.parsed){ const walk=n=>{ const kids=n.children||[]; const head=`<strong>&lt;${safeHTML(n.name)}&gt;</strong>` + (n.text?` — ${safeHTML(n.text)}`:''); const inner=kids.slice(0,2000).map(walk).join(''); return `<details><summary>${head}</summary><div style='margin-left:1rem'>${inner}</div></details>`; }; html=walk(state.parsed); } else if(state.parsed && typeof state.parsed==='object'){ if(Array.isArray(state.parsed)) html=node('Array', state.parsed); else html=Object.entries(state.parsed).map(([k,v])=>node(k,v)).join(''); } else html='<em>Ingen strukturerad data.</em>'; host.innerHTML=html; }
function renderOutline(){ const host=qs('#outline'); host.innerHTML=''; const walk=(v,prefix=[])=>{ if(Array.isArray(v)){ v.slice(0,5000).forEach((item,i)=> walk(item, prefix.concat('['+i+']'))); } else if(isObj(v)){ Object.entries(v).slice(0,5000).forEach(([k,val])=>{ const path=prefix.concat(k); host.insertAdjacentHTML('beforeend', `<div><span class='small'>${safeHTML(path.join('.'))}</span></div>`); walk(val, path); }); } else { const path=prefix.join('.'); host.insertAdjacentHTML('beforeend', `<div>${safeHTML(path)} = <em>${safeHTML(String(v))}</em></div>`); } };
  if(state.parsed) walk(state.parsed); else host.textContent='—'; }
function renderTable(){ const host=qs('#tableHost'); host.innerHTML=''; let rows=[], headers=[]; if(Array.isArray(state.parsed) && state.parsed.every(isObj)){ rows=state.parsed; headers=[...new Set(rows.flatMap(r=>Object.keys(r)))].slice(0,50); } else { host.innerHTML='<em>Tabell kräver en array av objekt.</em>'; return; } const headerHTML = `<div class='row header'>${headers.map(h=>`<div>${safeHTML(h)}</div>`).join('')}</div>`; host.insertAdjacentHTML('beforeend', headerHTML); const editEnabled = qs('#chkEdit').checked; rows.slice(0,5000).forEach((r,ri)=>{ const rowEl=document.createElement('div'); rowEl.className='row'; headers.forEach(h=>{ const val=r[h]===undefined? '': String(r[h]); if(editEnabled){ const inp=document.createElement('input'); inp.className='input'; inp.value=val; inp.onchange=()=>{ r[h]=coerce(inp.value); state.rawText = JSON.stringify(state.parsed, null, 2); commit(structuredClone(state)); }; rowEl.appendChild(inp); } else { const span=document.createElement('div'); span.textContent=val; rowEl.appendChild(span); } }); host.appendChild(rowEl); }); }
function renderMindmap(){
  const c = qs('#mind');
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  if(!state.parsed || typeof state.parsed !== 'object'){
    ctx.fillStyle = '#9fb3c8';
    ctx.fillText('Ingen strukturerad data', 20, 20);
    return;
  }
  const nodes = [], edges = [];
  const max = 400;
  const q = [[null, 'root', state.parsed, 0]];
  while(q.length && nodes.length < max){
    const [parent, id, val, depth] = q.shift();
    const idx = nodes.length;
    nodes.push({ id: idx, label: String(id), depth });
    if(parent != null) edges.push([parent, idx]);
    if(typeof val === 'object'){
      const entries = Array.isArray(val) ? val.map((v,i)=>[i,v]) : Object.entries(val);
      entries.slice(0, 20).forEach(([k,v]) => q.push([idx, k, v, depth+1]));
    }
  }
  const levels = {};
  nodes.forEach(n => {
    (levels[n.depth] ||= []).push(n);
  });
  const w = c.width, h = c.height;
  const L = Object.keys(levels).length;
  const vgap = h / (L + 1);
  Object.entries(levels).forEach(([d, arr]) => {
    const dy = (+d + 1) * vgap;
    const colgap = w / (arr.length + 1);
    arr.forEach((n, j) => {
      n.x = (j + 1) * colgap;
      n.y = dy;
    });
  });
  const scale = typeof mindmapState !== 'undefined' ? mindmapState.scale : 1;
  const ox = typeof mindmapState !== 'undefined' ? mindmapState.offsetX : 0;
  const oy = typeof mindmapState !== 'undefined' ? mindmapState.offsetY : 0;
  // Draw edges
  ctx.strokeStyle = '#273246';
  ctx.lineWidth = 1.2;
  edges.forEach(([a,b]) => {
    const na = nodes[a], nb = nodes[b];
    const x1 = na.x * scale + ox;
    const y1 = na.y * scale + oy;
    const x2 = nb.x * scale + ox;
    const y2 = nb.y * scale + oy;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
  // Draw nodes and labels
  ctx.fillStyle = '#e6eef7';
  ctx.font = (12 * scale) + 'px monospace';
  nodes.forEach(n => {
    const x = n.x * scale + ox;
    const y = n.y * scale + oy;
    const r = 6 * scale;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(n.label, x + 8 * scale, y + 4 * scale);
  });
}
function renderAll(){ setBadges(); renderRaw(); renderTree(); renderOutline(); renderTable(); renderMindmap(); checkPerformance(); }
// JSON Schema minimal validator
function validateAgainst(schema, data){ let errors=[]; function typeOf(x){ if(Array.isArray(x)) return 'array'; if(x===null) return 'null'; return typeof x; } function check(s,d,path='$'){ if(s.type){ const types=Array.isArray(s.type)? s.type : [s.type]; if(!types.includes(typeOf(d))) errors.push(path+': type '+typeOf(d)+' != '+types.join('|')); } if(s.required && isObj(d)){ s.required.forEach(k=>{ if(!(k in d)) errors.push(path+': saknar "'+k+'"'); }); } if(s.properties && isObj(d)){ for(const [k,ps] of Object.entries(s.properties)){ if(k in d) check(ps, d[k], path+'.'+k); } } if(s.items && Array.isArray(d)){ d.forEach((it,i)=> check(s.items, it, path+'['+i+']')); } }
  try{ check(schema, data); }catch(e){ errors.push('Schemafel: '+e.message); }
  return errors; }
// Presets
function applyPreset(name){ const host=qs('#txtSearch'); if(name==='empty'){ host.value='^$'; } else if(name==='dupes'){ host.value=''; } else if(name==='errors'){ host.value=''; } renderAll(); }
// Coerce for edit
function coerce(v){ if(v==='true') return true; if(v==='false') return false; if(v==='' ) return ''; if(!isNaN(+v) && v.trim()!=='' ) return +v; try{ const j=JSON.parse(v); return j; }catch{} return v; }
// Convert functions
function jsonToXml(obj, nodeName='root'){ if(typeof obj!=='object' || obj===null){ return `<${nodeName}>${String(obj)}</${nodeName}>`; } let xml=''; if(Array.isArray(obj)){ obj.forEach(item=>{ xml += jsonToXml(item, nodeName); }); return xml; } Object.entries(obj).forEach(([k,v])=>{ xml += jsonToXml(v, k); }); return `<${nodeName}>${xml}</${nodeName}>`; }
function jsonToYaml(obj, indent=0){ let out=''; const pad='  '.repeat(indent); if(typeof obj!=='object' || obj===null){ return String(obj); } if(Array.isArray(obj)){ obj.forEach(v=>{ out += pad + '- ' + (typeof v==='object' ? '
' + jsonToYaml(v, indent+1) : jsonToYaml(v,0)) + '
'; }); return out; } Object.entries(obj).forEach(([k,v])=>{ if(typeof v==='object'){ out += pad + k + ':
' + jsonToYaml(v, indent+1); } else { out += pad + k + ': ' + String(v) + '
'; } }); return out; }
function jsonToCsv(obj){ if(!Array.isArray(obj)) return ''; const keys=[...new Set(obj.flatMap(o=>Object.keys(o)))]; let lines=[]; lines.push(keys.join(',')); obj.forEach(row=>{ lines.push(keys.map(k => String(row[k]??'')).join(',')); }); return lines.join('
'); }
function jsonToMarkdown(obj){ return '```json
' + JSON.stringify(obj, null, 2) + '
```'; }
function jsonToHtml(obj){ return '<pre>' + safeHTML(JSON.stringify(obj, null, 2)) + '</pre>'; }
function convertTo(fmt){ const data=state.parsed; if(fmt==='json'){ return JSON.stringify(data, null, 2); } if(fmt==='xml'){ return jsonToXml(data); } if(fmt==='yaml'){ return jsonToYaml(data); } if(fmt==='csv'){ return jsonToCsv(data); } if(fmt==='md'){ return jsonToMarkdown(data); } if(fmt==='html'){ return jsonToHtml(data); } return ''; }
function downloadFile(content, filename){ const blob=new Blob([content], {type:'text/plain;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 5000); }
function exportHtmlSingle(){ const html='<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8"><title>Export</title></head><body>' + jsonToHtml(state.parsed) + '</body></html>'; downloadFile(html, 'export.html'); }
function exportPdf(){ const html = jsonToHtml(state.parsed); const w = window.open('', '_blank'); w.document.write('<!DOCTYPE html><html><head><title>Export PDF</title><style>body{font-family:monospace;}</style></head><body>' + html + '</body></html>'); w.document.close(); w.focus(); w.print(); }
// Export handler
qsa('.convert').forEach(btn=> btn.onclick=()=>{ const fmt=btn.dataset.format; const content=convertTo(fmt); const file= 'converted.'+ (fmt==='html'?'html':fmt); downloadFile(content, file); qs('#exportMsg').textContent='Konverterat till '+fmt.toUpperCase(); });
qsa('.export').forEach(btn=> btn.onclick=()=>{
  const fmt = btn.dataset.format;
  // Check performance warning first
  if(performanceWarning){
    if(!qs('#chkForce').checked){
      alert('Prestandavarning: datasetet är för stort. Aktivera Force export för att fortsätta.');
      return;
    } else {
      if(!confirm('Prestandavarning: datasetet är mycket stort. Fortsätta exporten?')) return;
    }
  }
  // Then check validation errors
  const valText = qs('#valBadge').textContent;
  if(valText.includes('fel')){
    if(!qs('#chkForce').checked){
      alert('Valideringsfel. Markera Force export för att fortsätta.');
      return;
    } else {
      if(!confirm('Valideringsfel finns. Är du säker på att exportera?')) return;
    }
  }
  if(fmt==='pdf'){
    exportPdf();
  } else if(fmt==='htmlsingle'){
    exportHtmlSingle();
  } else {
    const content = convertTo(fmt);
    const ext = fmt==='html' ? 'html' : fmt;
    downloadFile(content, 'export.' + ext);
  }
  qs('#exportMsg').textContent = 'Exporterade ' + fmt.toUpperCase();
});
// I/O
function handleText(text){
  // Uppdatera status och försök använda web worker om den finns
  qs('#badgeStatus').textContent = 'Analyserar…';
  const done = (parsed) => {
    apply({ rawText: text, parsed: parsed.data, info: parsed.info, format: parsed.format, size: text.length });
    qs('#badgeStatus').textContent = 'Klar';
  };
  if (parserWorker) {
    try {
      parserWorker.onmessage = (e) => {
        const { data, info, format } = e.data;
        done({ data, info, format });
      };
      parserWorker.postMessage({ text });
    } catch (err) {
      console.warn('Worker postMessage failed; using main-thread parser', err);
      const parsed = parseInMainThread(text);
      done(parsed);
    }
  } else {
    const parsed = parseInMainThread(text);
    done(parsed);
  }
}
async function openFile(f){ const text=await f.text(); handleText(text); }
function handleDrop(e){ e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f) openFile(f); highlight(false); }
function highlight(on){ const dz=qs('#dropzone'); dz.style.outline= on? '2px dashed var(--focus)': ''; dz.style.background= on? '#101a29': ''; }
// Bindings
qs('#fileInput').addEventListener('change', e=>{ const f=e.target.files[0]; if(f) openFile(f); });
qs('#btnPaste').onclick = async () => {
  try {
    const allowed = navigator.clipboard && window.isSecureContext;
    const t = allowed ? await navigator.clipboard.readText() : '';
    if (t) {
      handleText(t);
      return;
    }
  } catch {}
  const manual = prompt('Klistra in innehåll här och tryck OK:');
  if (manual) handleText(manual);
};
qs('#btnSample').onclick= ()=>{ const sample={name:'Signe', score:99.5, tags:['alpha','beta'], nested:{key:'värde', flag:true}}; handleText(JSON.stringify(sample,null,2)); };
['dragenter','dragover'].forEach(ev=> qs('#dropHost').addEventListener(ev, e=>{ e.preventDefault(); highlight(true); }));
['dragleave','drop'].forEach(ev=> qs('#dropHost').addEventListener(ev, e=>{ e.preventDefault(); if(ev.type==='drop'){ return; } highlight(false); }));
qsa('.preset').forEach(b=> b.onclick=()=> applyPreset(b.dataset.preset));
qs('#btnValidate').onclick=()=>{ let schemaText = qs('#schemaBox').value.trim(); if(!schemaText){ qs('#valBadge').textContent='Inget schema'; return; } try{ const schema=JSON.parse(schemaText); const errs = validateAgainst(schema, state.parsed); if(errs.length){ qs('#valBadge').textContent=errs.length+' fel'; qs('#valBadge').style.color='#ffd166'; qs('#badgeStatus').textContent='Valideringsfel: '+errs[0]; } else { qs('#valBadge').textContent='OK'; qs('#valBadge').style.color='#58d68d'; } }catch(e){ qs('#valBadge').textContent='Ogiltigt schema'; qs('#badgeStatus').textContent='Schema-parse-fel'; } };
qs('#btnUndo').onclick=undo; qs('#btnRedo').onclick=redo;
qs('#btnSaveSnap').onclick=()=> saveSnap(state); qs('#btnLoadSnap').onclick=listSnaps;
qs('#txtSearch').addEventListener('input', renderAll);
qs('#chkEdit').addEventListener('change', renderAll);

// Off-canvas meny: hantera toggling av sidopanelen på mobil
const menuBtn = qs('#btnMenu');
const sidebarEl = qs('#sidebar');
const backdropEl = qs('#backdrop');
function toggleMenu(show) {
  const on = show === undefined ? !sidebarEl.classList.contains('open') : show;
  if (on) {
    sidebarEl.classList.add('open');
    backdropEl.classList.add('show');
  } else {
    sidebarEl.classList.remove('open');
    backdropEl.classList.remove('show');
  }
  if (menuBtn) menuBtn.setAttribute('aria-expanded', String(on));
}
if (menuBtn) menuBtn.addEventListener('click', () => toggleMenu());
if (backdropEl) backdropEl.addEventListener('click', () => toggleMenu(false));

// Mindmap pan & zoom support
const mindmapState = { offsetX: 0, offsetY: 0, scale: 1 };
(() => {
  const canvas = qs('#mind');
  if(!canvas) return;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener('mousedown', e => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener('mouseup', () => { dragging = false; });
  canvas.addEventListener('mousemove', e => {
    if(!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    mindmapState.offsetX += dx;
    mindmapState.offsetY += dy;
    lastX = e.clientX;
    lastY = e.clientY;
    renderMindmap();
  });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    const factor = 0.1;
    mindmapState.scale *= (1 + direction * factor);
    mindmapState.scale = Math.min(Math.max(mindmapState.scale, 0.2), 5);
    renderMindmap();
  });
  canvas.addEventListener('dblclick', () => {
    mindmapState.offsetX = 0;
    mindmapState.offsetY = 0;
    mindmapState.scale = 1;
    renderMindmap();
  });
})();
// init
apply({ rawText:'', parsed:null, format:'', info:{}, size:0 });
listSnaps(); showView('raw');
  // Override renderTable to support virtualized rendering up to 50k rows
  function renderTable(){
    const host = qs('#tableHost');
    host.innerHTML = '';
    let rows = [], headers = [];
    if (Array.isArray(state.parsed) && state.parsed.every(isObj)) {
      rows = state.parsed;
      headers = [...new Set(rows.flatMap(r => Object.keys(r)))].slice(0, 50);
    } else {
      host.innerHTML = '<em>Tabell kräver en array av objekt.</em>';
      return;
    }
    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'row header';
    headers.forEach(h => {
      const cell = document.createElement('div');
      cell.textContent = h;
      headerRow.appendChild(cell);
    });
    host.appendChild(headerRow);
    const editEnabled = qs('#chkEdit').checked;
    // virtualization
    const rowHeight = 32;
    const viewport = document.createElement('div');
    viewport.style.overflow = 'auto';
    viewport.style.maxHeight = '50vh';
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = (rows.length * rowHeight) + 'px';
    viewport.appendChild(container);
    host.appendChild(viewport);
    let visibleCount = 0;
    function init() {
      const vh = viewport.clientHeight || 400;
      visibleCount = Math.min(rows.length, Math.ceil(vh / rowHeight) + 2);
      for (let i = 0; i < visibleCount; i++) {
        const rowEl = document.createElement('div');
        rowEl.className = 'row';
        container.appendChild(rowEl);
      }
      update();
    }
    function update() {
      const scrollTop = viewport.scrollTop;
      const start = Math.floor(scrollTop / rowHeight);
      const pool = container.children;
      for (let i = 0; i < pool.length; i++) {
        const idx = start + i;
        const rowEl = pool[i];
        if (idx < rows.length) {
          rowEl.style.position = 'absolute';
          rowEl.style.top = (idx * rowHeight) + 'px';
          rowEl.style.left = '0';
          rowEl.style.right = '0';
          rowEl.innerHTML = '';
          const rowData = rows[idx];
          headers.forEach(h => {
            const val = rowData[h] === undefined ? '' : String(rowData[h]);
            if (editEnabled) {
              const inp = document.createElement('input');
              inp.className = 'input';
              inp.value = val;
              inp.onchange = () => {
                rowData[h] = coerce(inp.value);
                state.rawText = JSON.stringify(state.parsed, null, 2);
                commit(structuredClone(state));
              };
              rowEl.appendChild(inp);
            } else {
              const div = document.createElement('div');
              div.textContent = val;
              rowEl.appendChild(div);
            }
          });
          rowEl.style.display = '';
        } else {
          rowEl.style.display = 'none';
        }
      }
    }
    viewport.addEventListener('scroll', update);
    // Delay init to ensure height is known
    setTimeout(init, 0);
  }

