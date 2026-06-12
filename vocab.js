import { state } from './state.js';
import { getLangLevel, getNativeLangName, getUiLocale } from './state.js';
import { esc, uid, LANG_META, SORT_MODES } from './constants.js';
import { safeLLM, abortPending, resolveErr, clean, hasApiAccess } from './llm.js';
import { setActiveLang, playWord } from './dom.js';

const { cfg, langLevels } = state;

// ── VOCAB STORAGE ──

export function getVocab(lang){try{return JSON.parse(localStorage.getItem('lt-vocab-'+lang)||'[]');}catch{return[];}}
export function setVocab(lang,arr){localStorage.setItem('lt-vocab-'+(lang||state.vocabLang),JSON.stringify(arr));}
export function newSM2(){return{interval:1,ef:2.5,due:Date.now(),reps:0};}

// ── VOCAB VIEW ──

export function onVocabLangChange(l){
  setActiveLang(l);
  const lls=document.getElementById('cfg-level-lang-select');
  if(lls){lls.value=l;document.getElementById('cfg-level').value=getLangLevel(l);}
  renderVocabList();
}
export function cycleSort(){
  state.sortIdx=(state.sortIdx+1)%SORT_MODES.length;
  document.getElementById('sort-btn').textContent=state.t[['sortAlpha','sortDue','sortNew'][state.sortIdx]];
  renderVocabList();
}
export function renderVocabList(){
  const t=state.t;
  const q=(document.getElementById('vocab-search').value||'').toLowerCase();
  let arr=getVocab(state.vocabLang);
  if(q)arr=arr.filter(w=>w.word.toLowerCase().includes(q)||w.translation.toLowerCase().includes(q)||(w.tags||[]).some(tg=>tg.toLowerCase().includes(q)));
  const mode=SORT_MODES[state.sortIdx];
  if(mode==='alpha')arr.sort((a,b)=>a.word.localeCompare(b.word));
  else if(mode==='due')arr.sort((a,b)=>(a.sm2?.due||0)-(b.sm2?.due||0));
  else arr.sort((a,b)=>b.id.localeCompare(a.id));
  const list=document.getElementById('vocab-list');
  const total=getVocab(state.vocabLang).length;
  const countEl=document.getElementById('vocab-count');
  const countTxt=q?`${arr.length} / ${total} ${t.vocabCountSuffix}`:`${total} ${t.vocabCountSuffix}`;
  countEl.innerHTML=total>40?`${countTxt} <span style="color:var(--warn)" title="${t.vocabCountWarning}">⚠</span>`:countTxt;
  if(!arr.length){list.innerHTML=`<div class="vocab-empty"><div style="font-size:2.67rem">📚</div><h2>${q?t.vocabEmptyNoMatch:t.vocabEmptyBlank}</h2><p>${q?t.vocabEmptyNoMatchHint:t.vocabEmptyAddHint}</p></div>`;return;}
  list.innerHTML='';
  const now=Date.now();
  arr.forEach(w=>{
    const due=w.sm2?.due||0;const reps=w.sm2?.reps||0;
    let badge='',cls='';
    if(reps===0){badge=t.badgeNew;cls='due-now';}
    else if(due<=now){badge=t.badgeToday;cls='due-now';}
    else if(due-now<86400000){badge=t.badgeTomorrow;cls='due-soon';}
    else{const d=Math.round((due-now)/86400000);badge=`${d}d`;cls='due-ok';}
    const sel=state.bulkSelectMode&&state.selectedIds.has(w.id);
    const el=document.createElement('div');el.className='vocab-item'+(sel?' selected':'');
    const tagsHtml=(w.tags&&w.tags.length)?`<div class="tag-chips">${w.tags.map(tg=>`<span class="tag-chip">${esc(tg)}</span>`).join('')}</div>`:'';
    const inner=`<div class="wi"><div class="word">${esc(w.word)}</div><div class="trans">${esc(w.translation)}${w.notes?` · <em>${esc(w.notes)}</em>`:''}</div>${tagsHtml}</div><button class="speak-btn" title="${t.pronounceBtn||'Hear pronunciation'}">🔊</button><span class="sm2-badge ${cls}">${badge}</span>`;
    if(state.bulkSelectMode){
      el.innerHTML=`<input type="checkbox" class="cb"${sel?' checked':''}>${inner}`;
      el.addEventListener('click',()=>toggleItemSelect(w.id,el));
    }else{
      el.innerHTML=inner;
      el.addEventListener('click',()=>openWordModal(w));
    }
    el.querySelector('.speak-btn').addEventListener('click',e=>{e.stopPropagation();playWord(w.word,state.vocabLang);});
    list.appendChild(el);
  });
}

export function swapWordTrans(){
  const w=document.getElementById('modal-word');const tr=document.getElementById('modal-trans');
  [w.value,tr.value]=[tr.value,w.value];
}
export function openWordModal(word){
  state.editingWordId=word?word.id:null;
  const t=state.t;
  document.getElementById('modal-title').textContent=word?t.modalEditTitle:t.modalAddTitle;
  const _langCode=LANG_META[state.vocabLang]?.lang||state.vocabLang;
  const _wordBase=t.modalWordLabel.replace(/\s*\*$/,'');
  document.getElementById('modal-word-label-text').textContent=`${_wordBase} (${_langCode}) *`;
  document.getElementById('modal-word').value=word?word.word:'';
  document.getElementById('modal-trans').value=word?word.translation:'';
  document.getElementById('modal-notes').value=word?word.notes||'':'';
  document.getElementById('modal-tags').value=word?(word.tags||[]).join(', '):'';
  document.getElementById('modal-delete-btn').style.display=word?'':'none';
  const infoEl=document.getElementById('modal-sm2-info');
  if(word?.sm2){
    const sm2=word.sm2;
    const due=sm2.due?new Date(sm2.due).toLocaleDateString(getUiLocale(),{day:'numeric',month:'long',year:'numeric'}):'–';
    const rows=[
      [t.sm2NextReview,due],
      [t.sm2Interval,sm2.interval===1?t.sm2Day1:t.sm2DaysFn(sm2.interval)],
      [t.sm2Reps,`${sm2.reps}×`],
      [t.sm2Difficulty,sm2.ef==null?'–':sm2.ef<=1.5?t.sm2Hard:sm2.ef<=2.0?t.sm2Medium:t.sm2Easy],
    ];
    document.getElementById('modal-sm2-rows').innerHTML=rows.map(([k,v])=>`<span style="color:var(--muted)">${k}</span><span style="color:var(--fg);font-weight:500">${v}</span>`).join('');
    infoEl.style.display='block';
  }else{
    infoEl.style.display='none';
  }
  document.getElementById('word-modal').classList.add('open');
  setTimeout(()=>document.getElementById('modal-word').focus(),100);
}
export function closeWordModal(){document.getElementById('word-modal').classList.remove('open');state.editingWordId=null;}
export function closeWordModalOutside(e){if(e.target===document.getElementById('word-modal'))closeWordModal();}
export function saveWord(){
  const t=state.t;
  const word=document.getElementById('modal-word').value.trim();
  const trans=document.getElementById('modal-trans').value.trim();
  if(!word||!trans){alert(t.errWordRequired);return;}
  const notes=document.getElementById('modal-notes').value.trim();
  const tags=document.getElementById('modal-tags').value.split(',').map(s=>s.trim()).filter(Boolean);
  const arr=getVocab(state.vocabLang);
  if(state.editingWordId){
    const idx=arr.findIndex(w=>w.id===state.editingWordId);
    if(idx>=0){arr[idx]={...arr[idx],word,translation:trans,notes,tags};}
  }else{
    arr.push({id:uid(),word,translation:trans,notes,tags,sm2:newSM2()});
  }
  setVocab(state.vocabLang,arr);closeWordModal();renderVocabList();
}
export function deleteWord(){
  const t=state.t;
  if(!state.editingWordId)return;
  if(!confirm(t.confirmDeleteWord))return;
  const arr=getVocab(state.vocabLang).filter(w=>w.id!==state.editingWordId);
  setVocab(state.vocabLang,arr);closeWordModal();renderVocabList();
}
export function deleteLearnedWords(){
  const t=state.t;
  const arr=getVocab(state.vocabLang);
  const learned=arr.filter(w=>w.sm2&&w.sm2.reps>=1&&w.sm2.interval>=21);
  if(!learned.length){alert(t.alertNoLearned);return;}
  if(!confirm(t.confirmDeleteLearnedFn(learned.length)))return;
  setVocab(state.vocabLang,arr.filter(w=>!(w.sm2&&w.sm2.reps>=1&&w.sm2.interval>=21)));
  renderVocabList();
}
export function toggleBulkMode(){
  state.bulkSelectMode=!state.bulkSelectMode;
  state.selectedIds.clear();
  document.getElementById('bulk-bar').style.display=state.bulkSelectMode?'flex':'none';
  document.getElementById('bulk-mode-btn').textContent=state.bulkSelectMode?state.t.bulkModeOff:state.t.bulkModeOn;
  document.getElementById('bulk-count').textContent=state.t.bulkCountFn(0);
  renderVocabList();
}
// Přepíná jen kliknutý řádek in-place — full re-render při každém tapu
// znamenal parse celého slovníku, přestavbu seznamu a ztrátu scroll pozice
export function toggleItemSelect(id,el){
  const sel=!state.selectedIds.has(id);
  if(sel)state.selectedIds.add(id);else state.selectedIds.delete(id);
  document.getElementById('bulk-count').textContent=state.t.bulkCountFn(state.selectedIds.size);
  el.classList.toggle('selected',sel);
  const cb=el.querySelector('.cb');if(cb)cb.checked=sel;
}
export function bulkSelectAll(){
  const q=(document.getElementById('vocab-search').value||'').toLowerCase();
  let arr=getVocab(state.vocabLang);
  if(q)arr=arr.filter(w=>w.word.toLowerCase().includes(q)||w.translation.toLowerCase().includes(q)||(w.tags||[]).some(tg=>tg.toLowerCase().includes(q)));
  arr.forEach(w=>state.selectedIds.add(w.id));
  document.getElementById('bulk-count').textContent=state.t.bulkCountFn(state.selectedIds.size);
  renderVocabList();
}
export function deleteSelectedWords(){
  const t=state.t;
  if(!state.selectedIds.size){alert(t.alertNoSelection);return;}
  if(!confirm(t.confirmDeleteSelectedFn(state.selectedIds.size)))return;
  setVocab(state.vocabLang,getVocab(state.vocabLang).filter(w=>!state.selectedIds.has(w.id)));
  toggleBulkMode();
}

// ── IMPORT ──

export function importVocab(){
  document.getElementById('import-lang-sel').value=state.vocabLang;
  document.getElementById('import-text').value='';
  document.getElementById('import-preview').textContent='';
  document.getElementById('import-modal').classList.add('open');
}
export function closeImportModal(){document.getElementById('import-modal').classList.remove('open');}
export function closeImportOutside(e){if(e.target===document.getElementById('import-modal'))closeImportModal();}
export function loadFile(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{document.getElementById('import-text').value=ev.target.result;previewImport();};
  r.readAsText(f);e.target.value='';
}
export function previewImport(){
  const t=state.t;
  const raw=document.getElementById('import-text').value.trim();
  if(!raw){document.getElementById('import-preview').textContent='';return;}
  try{const d=JSON.parse(raw);if(d.version&&d.vocab){document.getElementById('import-preview').textContent=t.importPreviewBackup;return;}}catch{}
  document.getElementById('import-preview').textContent=t.importPreviewLinesFn(importRows(raw).length);
}
// CSV parser celého textu dle RFC 4180 ("" = literální uvozovka) — pole v uvozovkách
// smí obsahovat čárky i nové řádky (exportVocab je tak legitimně produkuje)
function parseCsv(text){
  const rows=[];let row=[],cur='',inQ=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(inQ){
      if(c==='"'){if(text[i+1]==='"'){cur+='"';i++;}else inQ=false;}
      else cur+=c;
    }
    else if(c==='"'&&cur===''){inQ=true;}
    else if(c===','){row.push(cur);cur='';}
    else if(c==='\n'||c==='\r'){
      if(c==='\r'&&text[i+1]==='\n')i++;
      row.push(cur);rows.push(row);row=[];cur='';
    }
    else cur+=c;
  }
  if(cur!==''||row.length){row.push(cur);rows.push(row);}
  return rows;
}
// Řádky k importu: vynechá prázdné a komentáře (#); komentář uvnitř pole v uvozovkách komentářem není
function importRows(raw){
  return parseCsv(raw).filter(r=>r.some(f=>f.trim())&&!(r[0]||'').startsWith('#'));
}

export function confirmImport(){
  const t=state.t;
  const raw=document.getElementById('import-text').value.trim();if(!raw)return;
  let backup=null;
  try{const d=JSON.parse(raw);if(d.version&&d.vocab)backup=d;}catch{}
  if(backup){
    try{applyBackupImport(backup);}catch(e){alert(`${t.errGeneric} ${e.message}`);}
    closeImportModal();return;
  }
  const lang=document.getElementById('import-lang-sel').value;
  const arr=getVocab(lang);
  const existing=new Map(arr.map(w=>[w.word.toLowerCase(),w]));
  const dupMode=cfg.vocabImportDuplicates||'skip';
  let added=0,skipped=0,merged=0;
  importRows(raw).forEach(row=>{
    let parts=row;
    if(parts.length<2){const tp=(parts[0]||'').split('\t');if(tp.length<2)return;parts=tp;}
    const rev=document.getElementById('import-col-order').value==='reverse';
    const word=(parts[rev?1:0]||'').trim();const trans=(parts[rev?0:1]||'').trim();
    if(!word||!trans)return;
    const rawTags=(parts[3]||'').trim();
    const tags=rawTags?rawTags.split('|').map(s=>s.trim()).filter(Boolean):[];
    const notes=(parts[2]||'').trim();
    if(existing.has(word.toLowerCase())){
      if(dupMode==='skip'){skipped++;return;}
      const ew=existing.get(word.toLowerCase());
      ew.translation=trans;
      if(dupMode==='overwrite'){ew.notes=notes;ew.tags=tags;}else{if(notes)ew.notes=notes;if(tags.length)ew.tags=tags;}
      merged++;return;
    }
    const w={id:uid(),word,translation:trans,notes,tags,sm2:newSM2()};
    arr.push(w);existing.set(word.toLowerCase(),w);added++;
  });
  setVocab(lang,arr);closeImportModal();renderVocabList();
  alert(t.alertImportDoneFn(added,skipped,merged));
}
export function exportVocab(){
  const arr=getVocab(state.vocabLang);
  const cell=v=>{v=String(v??'');return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
  const lines=arr.map(w=>[w.word,w.translation,w.notes||'',(w.tags||[]).join('|')].map(cell).join(','));
  const blob=new Blob([lines.join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`vocab-${state.vocabLang}-${new Date().toISOString().slice(0,10)}.csv`;a.click();
}

// Callback set by settings.js to avoid circular import
let _applyBackupFn=null;
export function setApplyBackupFn(fn){_applyBackupFn=fn;}
function applyBackupImport(data){if(_applyBackupFn)_applyBackupFn(data);}

// ── DICTIONARY ──

let dictResult=null;
export function openDictModal(word){
  document.getElementById('dict-input').value=word||'';
  document.getElementById('dict-result').innerHTML='';
  document.getElementById('dict-add-btn').style.display='none';
  dictResult=null;
  document.getElementById('dict-modal').classList.add('open');
  setTimeout(()=>{const inp=document.getElementById('dict-input');inp.focus();if(word)dictLookup();},100);
}
export function closeDictModal(){abortPending();document.getElementById('dict-modal').classList.remove('open');}
export function closeDictModalOutside(e){if(e.target===document.getElementById('dict-modal'))closeDictModal();}
export function dictKey(e){if(e.key==='Enter')dictLookup();}
export async function dictLookup(){
  const word=document.getElementById('dict-input').value.trim();if(!word)return;
  const t=state.t;
  const resEl=document.getElementById('dict-result');
  resEl.innerHTML=`<div class="dict-msg">${t.dictLoading}</div>`;
  document.getElementById('dict-add-btn').style.display='none';dictResult=null;
  const targetMeta=LANG_META[state.vocabLang];const targetLang=targetMeta?targetMeta.name:state.vocabLang;
  const nativeLang=getNativeLangName();
  const sys=`You are a concise bilingual ${targetLang}–${nativeLang} dictionary. Reply with ONLY valid JSON, no markdown fences, no extra text. Keep all fields brief.`;
  const userPrompt=`Look up: "${word}"\nReturn JSON with fields:\n- "entry": plain-text dictionary entry in ${targetLang}, max 3 lines: word+colon on line 1, grammatical category+main translations on line 2, one short usage example in ${targetLang} on line 3\n- "word": the headword/lemma in ${targetLang}\n- "translation": main translations in ${nativeLang} as short comma-separated string (max 5 words)\n- "notes": one short grammatical note or typical collocation in ${targetLang} (e.g. verb government, gender, typical preposition); empty string if not applicable`;
  abortPending();state._abortCtrl=new AbortController();
  try{
    const raw=await safeLLM([{role:'user',content:userPrompt}],sys,4096,state._abortCtrl.signal);
    let json;try{json=JSON.parse(clean(raw));}catch{throw new Error(t.errParseLlm);}
    dictResult=json;
    resEl.innerHTML=`<div class="dict-entry">${esc(json.entry)}</div>`;
    document.getElementById('dict-add-btn').style.display='';
  }catch(err){
    if(err.name==='AbortError')return;
    resEl.innerHTML=`<div class="dict-msg" style="color:var(--err)">${resolveErr(err)}</div>`;
  }
}
export function dictAddToVocab(){
  if(!dictResult)return;
  closeDictModal();openWordModal(null);
  document.getElementById('modal-word').value=dictResult.word||'';
  document.getElementById('modal-trans').value=dictResult.translation||'';
  document.getElementById('modal-notes').value=dictResult.notes||'';
}

// ── GENERATE VOCAB ──

export function openGenerateModal(){
  document.getElementById('gen-topic').value='';
  const hasApi=hasApiAccess();const t=state.t;
  document.getElementById('gen-api-note').textContent=hasApi?t.genApiNoteWithKey:t.genApiNoteNoKey;
  document.getElementById('gen-action-btn').textContent=hasApi?t.genBtn:t.genCopyBtn;
  document.getElementById('gen-level').value=getLangLevel(state.vocabLang);
  showGenForm();
  document.getElementById('gen-modal').classList.add('open');
  setTimeout(()=>document.getElementById('gen-topic').focus(),100);
}
export function closeGenModal(){abortPending();document.getElementById('gen-modal').classList.remove('open');}
export function closeGenModalOutside(e){if(e.target===document.getElementById('gen-modal'))closeGenModal();}
export function showGenForm(){
  document.getElementById('gen-form').style.display='';
  document.getElementById('gen-preview').style.display='none';
}
export async function generateVocab(){
  const t=state.t;
  const topic=document.getElementById('gen-topic').value.trim();
  if(!topic){alert(t.genTopicRequired);return;}
  const count=parseInt(document.getElementById('gen-count').value);
  const meta=LANG_META[state.vocabLang];
  const levelMap={beginner:'A1-A2',intermediate:'B1-B2',advanced:'C1-C2'};
  const selectedLevel=document.getElementById('gen-level').value;
  langLevels[state.vocabLang]=selectedLevel;
  localStorage.setItem('lt-levels',JSON.stringify(langLevels));
  const level=levelMap[selectedLevel]||'A1-A2';
  const nativeLang=getNativeLangName();
  if(!hasApiAccess()){
    const prompt=`Generate ${count} ${meta.name} vocabulary words on the topic "${topic}" for ${level} level.\nReply ONLY as CSV (no header, one word per line):\nword in ${meta.name},translation in ${nativeLang},grammatical note or example in ${meta.name} only (optional)\n\nExpected column format:\n<${meta.name} word>,<${nativeLang} translation>,<short grammatical note or example phrase in ${meta.name} only (e.g. gender, typical preposition, verb form, short phrase); empty if not needed>`;
    try{await navigator.clipboard.writeText(prompt);}
    catch{const ta=document.createElement('textarea');ta.value=prompt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);}
    closeGenModal();alert(t.alertPromptCopied);return;
  }
  abortPending();state._abortCtrl=new AbortController();
  const btn=document.getElementById('gen-action-btn');const origText=btn.textContent;
  btn.textContent=t.genLoading;btn.disabled=true;
  const prompt=`Generate exactly ${count} ${meta.name} vocabulary words on the topic "${topic}" for a ${level} level learner. Translations should be in ${nativeLang}.
Return ONLY a JSON array, no preamble, no markdown:
[{"word":"<word in ${meta.name}>","translation":"<translation in ${nativeLang}>","notes":"<short grammatical note or example phrase in ${meta.name} only (e.g. gender, typical preposition, verb form, short phrase); empty string if not applicable — do NOT use ${nativeLang} here>","tags":["<topic category in ${nativeLang}>","${level}"]}]`;
  try{
    const raw=await safeLLM([{role:'user',content:prompt}],'',Math.max(8192,count*200),state._abortCtrl.signal);
    let arr;
    try{const s=raw.trim().replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();const m=s.match(/\[[\s\S]*\]/);arr=JSON.parse(m?m[0]:s);}catch{throw new Error(t.errParseLlm);}
    if(!Array.isArray(arr)||!arr.length)throw new Error(t.errLlmNoWords);
    state.genWords=arr.filter(w=>w.word&&w.translation);
    renderGenPreview();
  }catch(err){
    if(err.name!=='AbortError')alert(resolveErr(err));
  }finally{btn.textContent=origText;btn.disabled=false;}
}
export function renderGenPreview(){
  const list=document.getElementById('gen-word-list');
  list.innerHTML=state.genWords.map((w,i)=>`
    <div class="gen-word-item">
      <input type="checkbox" id="gen-chk-${i}" checked>
      <label for="gen-chk-${i}" class="gen-word-info" style="cursor:pointer">
        <div class="gen-w">${esc(w.word)}</div>
        <div class="gen-t">${esc(w.translation)}${w.notes?` · <em>${esc(w.notes)}</em>`:''}</div>
      </label>
    </div>`).join('');
  document.getElementById('gen-form').style.display='none';
  document.getElementById('gen-preview').style.display='';
}
export function confirmGenerateImport(){
  const t=state.t;
  const arr=getVocab(state.vocabLang);
  const existing=new Set(arr.map(w=>w.word.toLowerCase()));
  let added=0,skipped=0;
  state.genWords.forEach((w,i)=>{
    if(!document.getElementById('gen-chk-'+i)?.checked)return;
    if(existing.has(w.word.toLowerCase())){skipped++;return;}
    arr.push({id:uid(),word:w.word,translation:w.translation,notes:w.notes||'',tags:Array.isArray(w.tags)?w.tags.map(String).filter(Boolean):[],sm2:newSM2()});
    existing.add(w.word.toLowerCase());added++;
  });
  setVocab(state.vocabLang,arr);closeGenModal();renderVocabList();
  alert(t.alertImportDoneFn(added,skipped));
}

// Event listeners setup
document.getElementById('import-text').addEventListener('input',previewImport);
