import { state, getUiLocale } from './state.js';
import { esc } from './constants.js';
import { getVocab, setVocab, newSM2 } from './vocab.js';
import { setActiveLang, playWord } from './dom.js';

const { cfg } = state;

export function sm2Update(sm,q){
  let{interval,ef,reps}=sm;
  // SM-2: neúspěch (q<3) restartuje opakování BEZE změny E-Factoru
  if(q<3){reps=0;interval=1;}
  else{
    if(reps===0)interval=1;
    else if(reps===1)interval=6;
    else interval=Math.round(interval*ef*(q===5?(cfg.smEasyBonus??1):1));
    reps++;
    ef=Math.max(1.3,ef+(0.1-(5-q)*(0.08+(5-q)*0.02)));
  }
  return{interval,ef,reps,due:Date.now()+interval*86400000};
}

export function toggleFcDirection(){
  const t=state.t;
  state.fcDirection=state.fcDirection==='normal'?'reverse':'normal';
  const btn=document.getElementById('fc-dir-btn');
  btn.textContent=state.fcDirection==='normal'?t.fcDirNormal:t.fcDirReverse;
  btn.classList.toggle('rev',state.fcDirection==='reverse');
  startFlashcards(document.getElementById('fc-lang-select').value);
}

export function onFCLangChange(l){
  setActiveLang(l);startFlashcards(l);
}

export function onFCFilterChange(v){
  state.fcFilter=v;startFlashcards(document.getElementById('fc-lang-select').value);
}

export function startFlashcards(lang){
  const all=getVocab(lang);
  if(state.fcFilter==='today'){
    const cutoff=new Date().setHours(23,59,59,999);
    state.fcQueue=all.filter(w=>!w.sm2||w.sm2.due<=cutoff);
    state.fcPending=all.filter(w=>w.sm2&&w.sm2.due>cutoff);
  }else if(state.fcFilter==='all'){
    state.fcQueue=[...all];state.fcPending=[];
  }else if(state.fcFilter==='new'){
    state.fcQueue=all.filter(w=>!w.sm2||w.sm2.reps===0);state.fcPending=[];
  }else{
    state.fcQueue=all.filter(w=>w.sm2&&w.sm2.ef<2.0);state.fcPending=[];
  }
  for(let i=state.fcQueue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[state.fcQueue[i],state.fcQueue[j]]=[state.fcQueue[j],state.fcQueue[i]];}
  if(cfg.fcSessionSize>0)state.fcQueue=state.fcQueue.slice(0,cfg.fcSessionSize);
  state.fcIdx=0;state.fcRevealed=false;
  renderFC();
}

export function renderFC(){
  const t=state.t;
  const body=document.getElementById('fc-body');
  const _locale=getUiLocale();
  const _pendingStr=(state.fcFilter==='today'&&state.fcPending.length)?`<p style="color:var(--mut);font-size:0.87rem;margin-top:8px">${t.fcPendingFn(state.fcPending.length)} · ${t.fcNextDue} ${new Date(Math.min(...state.fcPending.map(w=>w.sm2.due))).toLocaleDateString(_locale,{day:'numeric',month:'long'})}</p>`:'';
  if(!state.fcQueue.length){
    if(state.fcFilter==='today'&&state.fcPending.length){body.innerHTML=`<div class="fc-done"><div class="big">🎉</div><h2>${t.fcDoneTitle}</h2>${_pendingStr}<button class="btn btn-secondary" onclick="navTo('vocab')">${t.navVocab}</button></div>`;}
    else if(state.fcFilter==='new'){body.innerHTML=`<div class="fc-done"><div class="big">✅</div><h2>${t.fcEmptyNew}</h2><p>${t.fcEmptyNewDesc}</p></div>`;}
    else if(state.fcFilter==='weak'){body.innerHTML=`<div class="fc-done"><div class="big">💪</div><h2>${t.fcEmptyWeak}</h2><p>${t.fcEmptyWeakDesc}</p></div>`;}
    else{body.innerHTML=`<div class="fc-done"><div class="big">📚</div><h2>${t.fcEmptyTitle}</h2><p>${t.fcEmptyDesc}</p><button class="btn btn-primary" onclick="navTo('vocab')">${t.navVocab}</button></div>`;}
    return;
  }
  if(state.fcIdx>=state.fcQueue.length){const n=state.fcQueue.length;body.innerHTML=`<div class="fc-done"><div class="big">🎉</div><h2>${t.fcDoneTitle}</h2><p>${t.fcDoneDesc(n)}</p>${_pendingStr}<button class="btn btn-primary" onclick="startFlashcards(document.getElementById('fc-lang-select').value)">${t.fcAgain}</button></div>`;return;}
  const w=state.fcQueue[state.fcIdx];
  const _rev=state.fcDirection==='reverse';
  const _front=_rev?w.translation:w.word;
  const _back=_rev?w.word:w.translation;
  const _frontNotes=!_rev&&w.notes?`<div class="fc-notes">${esc(w.notes)}</div>`:'';
  const _backNotes=_rev&&w.notes?`<div class="fc-notes" style="margin-top:6px;font-size:0.87rem">${esc(w.notes)}</div>`:'';
  body.innerHTML=`
    <div class="fc-progress">${t.fcProgress(state.fcIdx+1,state.fcQueue.length)}</div>
    <div class="fc-card" onclick="revealFC()">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <div class="fc-word">${esc(_front)}</div>
        <button class="speak-btn" title="${t.pronounceBtn||'Hear pronunciation'}">🔊</button>
      </div>
      ${_frontNotes}
      <div class="fc-translation" id="fc-trans">${esc(_back)}${_backNotes}</div>
      <div class="fc-hint" id="fc-hint">${t.fcTap}</div>
    </div>
    <div class="fc-rating" id="fc-rating">
      <div style="font-size:0.87rem;color:var(--mut)">${t.fcRateQ}</div>
      <div class="fc-rating-row">
        <button class="fc-btn fc-btn-0" onclick="rateFC(0)">❌<br>${t.fcRate0}</button>
        <button class="fc-btn fc-btn-3" onclick="rateFC(3)">😐<br>${t.fcRate3}</button>
        <button class="fc-btn fc-btn-4" onclick="rateFC(4)">🙂<br>${t.fcRate4}</button>
        <button class="fc-btn fc-btn-5" onclick="rateFC(5)">⭐<br>${t.fcRate5}</button>
      </div>
    </div>`;
  body.querySelector('.speak-btn').addEventListener('click',e=>{e.stopPropagation();playWord(w.word,document.getElementById('fc-lang-select').value);});
}

export function revealFC(){
  if(state.fcRevealed)return;
  state.fcRevealed=true;
  document.getElementById('fc-trans').style.display='block';
  document.getElementById('fc-hint').style.display='none';
  document.getElementById('fc-rating').style.display='flex';
}

export function rateFC(q){
  const w=state.fcQueue[state.fcIdx];
  const arr=getVocab(document.getElementById('fc-lang-select').value);
  const idx=arr.findIndex(x=>x.id===w.id);
  if(idx>=0){arr[idx].sm2=sm2Update(arr[idx].sm2||newSM2(),q);setVocab(document.getElementById('fc-lang-select').value,arr);}
  state.fcIdx++;state.fcRevealed=false;renderFC();
}
