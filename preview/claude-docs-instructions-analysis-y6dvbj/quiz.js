import { state, getLangLevel, getNativeLangName } from './state.js';
import { LANG_META, renderMarkdown } from './constants.js';
import { safeLLM, abortPending, resolveErr, clean, hasApiAccess } from './llm.js';
import { getVocab } from './vocab.js';
import { setActiveLang, autoResize } from './dom.js';

const { cfg } = state;

export function onQuizLangChange(l){
  setActiveLang(l);startQuiz();
}

export function pauseQuiz(){
  abortPending();
  clearTimeout(state.quizTimer);state.quizTimer=null;
  state.quizSessionId++;
  state.quizBusy=false;
  setQuizTyping(false);
}

export function resumeQuiz(){
  if(state.quizLang!==state.currentLang||!state.quizHistory.length){startQuiz();return;}
  if(state.quizNeedsQuestion&&state.quizQueue.length)quizAsk(state.quizLang);
}

const isCurrentSession=(id,lang)=>id===state.quizSessionId&&lang===state.quizLang&&lang===state.currentLang;

export function startQuiz(){
  pauseQuiz();
  state.quizHistory=[];
  state.quizQueue=[];
  state.quizCurrentWord=null;
  state.quizNeedsQuestion=true;
  const qList=document.getElementById('quiz-msg-list');
  [...qList.children].forEach(el=>{if(el.id!=='quiz-typing-row'&&el.id!=='quiz-empty')el.remove();});
  document.getElementById('quiz-empty').style.display='none';
  const lang=state.currentLang;
  state.quizLang=lang;
  document.getElementById('quiz-lang-select').value=lang;
  const arr=getVocab(lang);
  if(!arr.length){document.getElementById('quiz-empty').style.display='';return;}
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const today=new Date().setHours(23,59,59,999);
  const due=shuffle(arr.filter(w=>!w.sm2||w.sm2.due<=today));
  const rest=shuffle(arr.filter(w=>w.sm2&&w.sm2.due>today));
  state.quizQueue=[...due,...rest].slice(0,cfg.quizSessionSize||10);
  state.quizHistory=[{role:'system-note',content:`Vocabulary to test: ${state.quizQueue.map(w=>w.word).join(', ')}`}];
  quizAsk(lang);
}

export async function quizAsk(lang){
  const t=state.t;
  const sessionId=state.quizSessionId;
  if(!isCurrentSession(sessionId,lang)||!state.quizQueue.length||state.quizBusy)return;
  state.quizNeedsQuestion=true;
  state.quizCurrentWord=state.quizQueue[0];
  const word=state.quizCurrentWord;
  const meta=LANG_META[lang];
  const levelMap={beginner:'A1-A2',intermediate:'B1-B2',advanced:'C1-C2'};
  const quizSys=`You are a language quiz tutor testing the student on ${meta.name}. Student level: ${levelMap[getLangLevel(lang)]||'A1-A2'}. Vary question formats naturally (fill-in-the-blank, translate, use in a sentence, etc.). Respond ONLY with valid JSON, no markdown.`;
  const quizPrompt=`Test this specific word: "${word.word}" (meaning: "${word.translation}"). Do NOT reveal the translation to the student.
Respond ONLY with JSON: {"question":"<question in ${meta.name}; if the task requires translation, you may include a ${getNativeLangName()} instruction>","targetWord":"${word.word}"}`;
  if(!hasApiAccess()){appendQuizMsg('tutor',t.errNoKey);return;}
  abortPending();
  state._abortCtrl=new AbortController();
  const signal=state._abortCtrl.signal;
  state.quizBusy=true;
  setQuizTyping(true);
  let raw;
  try{raw=await safeLLM([{role:'user',content:quizPrompt}],quizSys,8192,signal);}
  catch(err){
    if(!isCurrentSession(sessionId,lang))return;
    state.quizBusy=false;setQuizTyping(false);
    if(err.name!=='AbortError')appendQuizMsg('tutor',resolveErr(err));
    return;
  }
  if(!isCurrentSession(sessionId,lang)||signal.aborted)return;
  state.quizBusy=false;state.quizNeedsQuestion=false;
  setQuizTyping(false);
  try{const p=JSON.parse(clean(raw));appendQuizMsg('tutor',p.question);state.quizHistory.push({role:'assistant-question',word:p.targetWord||word.word,content:p.question});}
  catch{const q=clean(raw);appendQuizMsg('tutor',q);state.quizHistory.push({role:'assistant-question',word:word.word,content:q});}
}

export function quizKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();quizSend();}}

export async function quizSend(){
  if(state.quizBusy||state.quizNeedsQuestion||state.quizLang!==state.currentLang||!state.quizQueue.length)return;
  const t=state.t;
  const inp=document.getElementById('quiz-input');
  const txt=inp.value.trim();if(!txt)return;
  inp.value='';autoResize(inp);
  document.getElementById('quiz-send-btn').disabled=true;
  appendQuizMsg('user',txt);
  state.quizHistory.push({role:'user',content:txt});
  abortPending();
  state._abortCtrl=new AbortController();
  const signal=state._abortCtrl.signal;
  const sessionId=state.quizSessionId;
  state.quizBusy=true;
  setQuizTyping(true);
  const lang=state.quizLang;
  const meta=LANG_META[lang];
  const last=state.quizHistory.filter(h=>h.role==='assistant-question').slice(-1)[0];
  const targetWord=last?.word||'';
  const question=last?.content||'';
  const evalPrompt=`You are a language quiz evaluator for ${meta.name}.
Question asked: "${question}"
Target word: "${targetWord}"
Student answer: "${txt}"
Evaluate and respond with JSON only: {"correct":true/false,"feedback":"<brief feedback in ${getNativeLangName()}>"}`;
  let raw;
  try{raw=await safeLLM([{role:'user',content:evalPrompt}],'',8192,signal);}
  catch(err){
    if(!isCurrentSession(sessionId,lang))return;
    state.quizBusy=false;setQuizTyping(false);
    if(err.name!=='AbortError')appendQuizMsg('tutor',resolveErr(err));
    return;
  }
  if(!isCurrentSession(sessionId,lang)||signal.aborted)return;
  setQuizTyping(false);
  try{
    const p=JSON.parse(clean(raw));
    const icon=p.correct?'✅':'❌';
    appendQuizMsg('tutor',`${icon} ${p.feedback}`);
    state.quizHistory.push({role:'assistant-feedback',correct:p.correct,content:p.feedback});
    if(p.correct){
      state.quizQueue.shift();
    }else{
      state.quizQueue.push(state.quizQueue.shift());
    }
    state.quizNeedsQuestion=state.quizQueue.length>0;
    if(!state.quizQueue.length){
      appendQuizMsg('tutor',state.t.quizDoneMsg);
      state.quizBusy=false;
    }else{
      document.getElementById('quiz-send-btn').disabled=true;
      state.quizTimer=setTimeout(()=>{
        if(!isCurrentSession(sessionId,lang))return;
        state.quizTimer=null;state.quizBusy=false;
        quizAsk(lang);
      },600);
    }
  }catch{state.quizBusy=false;appendQuizMsg('tutor',t.errGeneric+' '+clean(raw));}
}

export function setQuizTyping(v){
  document.getElementById('quiz-input').disabled=v;
  document.getElementById('quiz-send-btn').disabled=v||!document.getElementById('quiz-input').value.trim();
  const r=document.getElementById('quiz-typing-row');r.style.display=v?'flex':'none';
  if(v){const l=document.getElementById('quiz-msg-list');l.scrollTop=l.scrollHeight;}
}

export function appendQuizMsg(role,text){
  const list=document.getElementById('quiz-msg-list');
  const typingRow=document.getElementById('quiz-typing-row');
  const wrap=document.createElement('div');wrap.className=`msg ${role}`;
  const b=document.createElement('div');b.className='bubble';b.innerHTML=renderMarkdown(text);
  wrap.appendChild(b);list.insertBefore(wrap,typingRow);list.scrollTop=list.scrollHeight;
}

