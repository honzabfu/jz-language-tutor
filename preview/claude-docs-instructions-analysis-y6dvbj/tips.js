import { state } from './state.js';
import { getUiLocale } from './state.js';
import { esc, uid } from './constants.js';
import { setActiveLang } from './dom.js';

export function getSavedTips(lang){try{return JSON.parse(localStorage.getItem('lt-tips-'+lang)||'[]');}catch{return[];}}
export function setSavedTips(lang,arr){localStorage.setItem('lt-tips-'+(lang||state.currentLang),JSON.stringify(arr));}

export function onTipsLangChange(l){setActiveLang(l);renderTipsList();}
export function setTipsFilter(filter,btn){state.tipsFilter=filter;document.querySelectorAll('.tips-filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderTipsList();}

export function saveTip(btn,text,type){
  const tips=getSavedTips(state.currentLang);
  if(!tips.some(tp=>tp.text===text&&tp.type===type)){
    tips.unshift({id:uid(),text,type,lang:state.currentLang,date:Date.now()});
    setSavedTips(state.currentLang,tips);
  }
  btn.textContent='✓';btn.classList.add('saved');btn.disabled=true;
}

export function renderTipsList(){
  const t=state.t;
  let arr=getSavedTips(state.tipsLang);
  if(state.tipsFilter!=='all')arr=arr.filter(tp=>tp.type===state.tipsFilter);
  const list=document.getElementById('tips-list');
  const total=getSavedTips(state.tipsLang).length;
  document.getElementById('tips-count').textContent=state.tipsFilter!=='all'?`${arr.length} / ${total}`:String(total);
  if(!arr.length){
    list.innerHTML=`<div class="vocab-empty"><div style="font-size:2.67rem">🔖</div><h2>${t.tipsEmpty}</h2><p>${t.tipsEmptyHint}</p></div>`;
    return;
  }
  const typeConf={positive:{icon:'✅',label:t.fbPositive,cls:'tip-type-positive'},corrections:{icon:'✏️',label:t.fbCorrections,cls:'tip-type-corrections'},suggestions:{icon:'💡',label:t.fbSuggestions,cls:'tip-type-suggestions'}};
  list.innerHTML='';
  arr.forEach(tip=>{
    const tc=typeConf[tip.type]||typeConf.suggestions;
    const date=new Date(tip.date).toLocaleDateString(getUiLocale(),{day:'numeric',month:'short'});
    const sel=state.tipsBulkSelectMode&&state.selectedTipIds.has(tip.id);
    const el=document.createElement('div');el.className='tips-item'+(sel?' selected':'');
    const content=document.createElement('div');content.className='tips-item-content';
    content.innerHTML=`<div class="tips-item-tag ${tc.cls}">${tc.icon} ${tc.label}</div><div class="tips-item-text">${esc(tip.text)}</div><div class="tips-item-meta">${date}</div>`;
    if(state.tipsBulkSelectMode){
      const cb=document.createElement('input');cb.type='checkbox';cb.className='cb';cb.checked=sel;
      el.appendChild(cb);el.appendChild(content);
      el.addEventListener('click',()=>toggleTipSelect(tip.id,el));
    }else{
      el.appendChild(content);
      const delBtn=document.createElement('button');delBtn.className='tips-delete-btn';delBtn.textContent='×';delBtn.title=t.modalDeleteBtn;
      delBtn.onclick=e=>{e.stopPropagation();deleteTip(tip.id);};
      el.appendChild(delBtn);
    }
    list.appendChild(el);
  });
}

export function deleteTip(id){setSavedTips(state.tipsLang,getSavedTips(state.tipsLang).filter(tp=>tp.id!==id));renderTipsList();}

// In-place varianta — viz toggleItemSelect ve vocab.js
export function toggleTipSelect(id,el){
  const sel=!state.selectedTipIds.has(id);
  if(sel)state.selectedTipIds.add(id);else state.selectedTipIds.delete(id);
  document.getElementById('tips-bulk-count').textContent=state.t.bulkCountFn(state.selectedTipIds.size);
  el.classList.toggle('selected',sel);
  const cb=el.querySelector('.cb');if(cb)cb.checked=sel;
}
export function toggleTipsBulkMode(){
  state.tipsBulkSelectMode=!state.tipsBulkSelectMode;state.selectedTipIds.clear();
  document.getElementById('tips-bulk-bar').style.display=state.tipsBulkSelectMode?'flex':'none';
  document.getElementById('tips-bulk-mode-btn').textContent=state.tipsBulkSelectMode?state.t.bulkModeOff:state.t.bulkModeOn;
  document.getElementById('tips-bulk-count').textContent=state.t.bulkCountFn(0);
  renderTipsList();
}
export function tipsSelectAll(){
  getSavedTips(state.tipsLang).filter(tp=>state.tipsFilter==='all'||tp.type===state.tipsFilter).forEach(tp=>state.selectedTipIds.add(tp.id));
  document.getElementById('tips-bulk-count').textContent=state.t.bulkCountFn(state.selectedTipIds.size);
  renderTipsList();
}
export function deleteBulkTips(){
  if(!state.selectedTipIds.size)return;
  setSavedTips(state.tipsLang,getSavedTips(state.tipsLang).filter(tp=>!state.selectedTipIds.has(tp.id)));
  state.selectedTipIds.clear();state.tipsBulkSelectMode=false;
  document.getElementById('tips-bulk-bar').style.display='none';
  document.getElementById('tips-bulk-mode-btn').textContent=state.t.bulkModeOn;
  renderTipsList();
}

export function attachFeedbackCard(wrap,feedback){
  if(!feedback)return;
  const t=state.t;
  const types=[
    {key:'positive',icon:'✅',label:t.fbPositive},
    {key:'corrections',icon:'✏️',label:t.fbCorrections},
    {key:'suggestions',icon:'💡',label:t.fbSuggestions},
  ];
  const parts=types.filter(tp=>(feedback[tp.key]||[]).length>0).map(tp=>`${tp.icon} ${(feedback[tp.key]||[]).length}`);
  if(!parts.length)return;
  const card=document.createElement('div');card.className='fb-inline';
  const toggle=document.createElement('button');toggle.className='fb-inline-toggle';
  const label=document.createElement('span');label.textContent=parts.join(' · ');
  const arrow=document.createElement('span');arrow.className='fb-inline-arrow';arrow.textContent='▸';
  toggle.appendChild(label);toggle.appendChild(arrow);
  const body=document.createElement('div');body.className='fb-inline-body';
  types.forEach(tp=>{
    const items=feedback[tp.key]||[];if(!items.length)return;
    const sec=document.createElement('div');sec.className='fb-inline-section';
    const title=document.createElement('div');title.className='fb-inline-section-title';title.textContent=`${tp.icon} ${tp.label}`;
    sec.appendChild(title);
    items.forEach(itemText=>{
      const row=document.createElement('div');row.className='fb-inline-item';
      const span=document.createElement('span');span.textContent=itemText;
      const btn=document.createElement('button');btn.className='fb-save-btn';btn.textContent='🔖';btn.title=t.tipsSave;
      btn.onclick=()=>saveTip(btn,itemText,tp.key);
      row.appendChild(span);row.appendChild(btn);sec.appendChild(row);
    });
    body.appendChild(sec);
  });
  toggle.onclick=()=>{const open=body.style.display==='block';body.style.display=open?'none':'block';toggle.classList.toggle('open',!open);};
  card.appendChild(toggle);card.appendChild(body);
  wrap.appendChild(card);
}
