import { state, getLangLevel, getNativeLangName } from './state.js';
import { LANG_META, renderMarkdown } from './constants.js';
import { safeLLM, abortPending, resolveErr, clean } from './llm.js';
import { getVocab } from './vocab.js';
import { syncLangSelectors, autoResize } from './dom.js';

const { cfg } = state;

export function onQuizLangChange(l){
  state.currentLang=l;state.vocabLang=l;localStorage.setItem('lt-lang',l);syncLangSelectors(l);startQuiz();
}

export function startQuiz(){
  state.quizHistory=[];
  state.quizQueue=[];
  state.quizCurrentWord=null;
  const qList=document.getElementById('quiz-msg-list');
  [...qList.children].forEach(el=>{if(el.id!=='quiz-typing-row'&&el.id!=='quiz-empty')el.remove();});
  document.getElementById('quiz-empty').style.display='none';
  const lang=document.getElementById('quiz-lang-select').value;
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
  if(!state.quizQueue.length)return;
  state.quizCurrentWord=state.quizQueue[0];
  const word=state.quizCurrentWord;
  const meta=LANG_META[lang];
  const levelMap={beginner:'A1-A2',intermediate:'B1-B2',advanced:'C1-C2'};
  const quizSys=`You are a language quiz tutor testing the student on ${meta.name}. Student level: ${levelMap[getLangLevel(lang)]||'A1-A2'}. Vary question formats naturally (fill-in-the-blank, translate, use in a sentence, etc.). Respond ONLY with valid JSON, no markdown.`;
  const quizPrompt=`Test this specific word: "${word.word}" (meaning: "${word.translation}"). Do NOT reveal the translation to the student.
Respond ONLY with JSON: {"question":"<question in ${meta.name}; if the task requires translation, you may include a ${getNativeLangName()} instruction>","targetWord":"${word.word}"}`;
  if(cfg.provider==='custom'&&(!cfg.customUrl||!cfg.customModel)){appendQuizMsg('tutor',t.errNoKey);return;}
  if(cfg.provider!=='ollama'&&cfg.provider!=='custom'&&(!cfg.apiKey||cfg.apiKey.length<8)){appendQuizMsg('tutor',t.errNoKey);return;}
  abortPending();
  state._abortCtrl=new AbortController();
  setQuizTyping(true);
  let raw;
  try{raw=await safeLLM([{role:'user',content:quizPrompt}],quizSys,8192,state._abortCtrl.signal);}
  catch(err){setQuizTyping(false);if(err.name==='AbortError')return;appendQuizMsg('tutor',resolveErr(err));return;}
  setQuizTyping(false);
  try{const p=JSON.parse(clean(raw));appendQuizMsg('tutor',p.question);state.quizHistory.push({role:'assistant-question',word:p.targetWord,content:p.question});}
  catch{appendQuizMsg('tutor',clean(raw));}
}

export function quizKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();quizSend();}}

export async function quizSend(){
  const t=state.t;
  const inp=document.getElementById('quiz-input');
  const txt=inp.value.trim();if(!txt)return;
  inp.value='';autoResize(inp);
  document.getElementById('quiz-send-btn').disabled=true;
  appendQuizMsg('user',txt);
  state.quizHistory.push({role:'user',content:txt});
  abortPending();
  state._abortCtrl=new AbortController();
  setQuizTyping(true);
  const lang=document.getElementById('quiz-lang-select').value;
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
  try{raw=await safeLLM([{role:'user',content:evalPrompt}],'',8192,state._abortCtrl.signal);}
  catch(err){setQuizTyping(false);if(err.name==='AbortError'){document.getElementById('quiz-send-btn').disabled=false;return;}appendQuizMsg('tutor',resolveErr(err));document.getElementById('quiz-send-btn').disabled=false;return;}
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
    if(!state.quizQueue.length){
      setTimeout(()=>appendQuizMsg('tutor',t.quizDoneMsg),600);
    }else{
      setTimeout(()=>quizAsk(lang),600);
    }
  }catch{appendQuizMsg('tutor',t.errGeneric+' '+clean(raw));}
  document.getElementById('quiz-send-btn').disabled=false;
}

export function setQuizTyping(v){
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
