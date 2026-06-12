import { state, getLangLevel, getNativeLangName } from './state.js';
import { LANG_META, esc, renderMarkdown } from './constants.js';
import { safeLLMStream, abortPending, resolveErr, clean, hasApiAccess } from './llm.js';
import { getVocab } from './vocab.js';
import { setActiveLang } from './dom.js';
import { saveTip, attachFeedbackCard } from './tips.js';
import { updateModeBadge, updateEmptyState, updateInputPlaceholder } from './updates.js';

const { cfg } = state;

export function onSettingsLevelLangChange(l){
  document.getElementById('cfg-level').value=getLangLevel(l);
}

export function setMode(lesson){cfg.lessonMode=lesson;updateModeBadge();localStorage.setItem('lt-cfg',JSON.stringify(cfg));}

export function clearChat(){
  abortPending();
  state.chatHistory=[];state.currentFbData=null;
  const list=document.getElementById('msg-list');
  [...list.children].forEach(el=>{if(el.id!=='empty'&&el.id!=='typing-row')el.remove();});
  document.getElementById('empty').style.display='';
  document.getElementById('feedback-bar').classList.remove('visible');
  document.getElementById('typing-row').style.display='none';
  document.getElementById('send-btn').disabled=true;
}

export function onLangChange(l){
  setActiveLang(l);
  updateEmptyState();updateInputPlaceholder();updateModeBadge();clearChat();
  const lls=document.getElementById('cfg-level-lang-select');
  if(lls){lls.value=l;document.getElementById('cfg-level').value=getLangLevel(l);}
}

export function onKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}

export function scrollBottom(){const l=document.getElementById('msg-list');l.scrollTop=l.scrollHeight;}

export function setTyping(v){document.getElementById('typing-row').style.display=v?'flex':'none';if(v)scrollBottom();}

export function appendMsg(role,text,translation){
  const t=state.t;
  document.getElementById('empty').style.display='none';
  const list=document.getElementById('msg-list');
  const typingRow=document.getElementById('typing-row');
  const wrap=document.createElement('div');wrap.className=`msg ${role}`;
  const bubble=document.createElement('div');bubble.className='bubble';bubble.innerHTML=renderMarkdown(text);wrap.appendChild(bubble);
  const meta=document.createElement('div');meta.className='msg-meta';meta.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});wrap.appendChild(meta);
  if(role==='tutor'&&translation){
    const td=document.createElement('div');td.className='translation';td.innerHTML=`<strong>${t.translationLabel}:</strong> ${esc(translation)}`;
    const btn=document.createElement('button');btn.className='translate-btn';btn.textContent=t.translateBtn;
    btn.onclick=()=>{const v=td.style.display!=='none'&&td.style.display!=='';td.style.display=v?'none':'block';btn.textContent=v?t.translateBtn:t.hideTranslation;};
    wrap.appendChild(btn);wrap.appendChild(td);
  }
  list.insertBefore(wrap,typingRow);scrollBottom();
  return wrap;
}

export function buildSystemPrompt(){
  const meta=LANG_META[state.currentLang];
  const lvMap={beginner:'A1-A2',intermediate:'B1-B2',advanced:'C1-C2'};
  const fbMap={gentle:'encouraging and gentle',balanced:'balanced',strict:'strict and exhaustive'};
  const uiLangName=getNativeLangName();
  let vocabCtx='';
  if(cfg.lessonMode){
    const arr=getVocab(state.currentLang).slice(0,50);
    if(arr.length)vocabCtx=`\n\nActive vocabulary list (use these words naturally in your responses):\n${arr.map(w=>`${w.word} = ${w.translation}`).join('\n')}`;
  }
  const customCtx=cfg.customInstructions?`\nAdditional instructions: ${cfg.customInstructions}`:'';
  return `You are a friendly language tutor helping practice ${meta.name} (${meta.native}).
Student level: ${lvMap[getLangLevel(state.currentLang)]||'A1-A2'}. Feedback style: ${fbMap[cfg.feedbackStyle]||'balanced'}.${vocabCtx}${customCtx}
${cfg.lessonMode?'LESSON MODE: Actively incorporate vocabulary from the list above into your responses and explanations.':''}
Respond ONLY with valid JSON (no markdown, no preamble):
{"reply":"<response in ${meta.name}>","translation":"<${uiLangName} translation>","feedback":{"positive":["..."],"corrections":["..."],"suggestions":["..."]}}`;
}

export async function sendMessage(){
  const t=state.t;
  const input=document.getElementById('msg-input');
  const text=input.value.trim();if(!text)return;
  if(!hasApiAccess()){appendMsg('tutor',t.errNoKey,null);return;}
  abortPending();
  state._abortCtrl=new AbortController();
  input.value='';input.style.height='auto';document.getElementById('send-btn').disabled=true;
  appendMsg('user',text,null);
  const userMsg={role:'user',content:text};
  state.chatHistory.push(userMsg);
  setTyping(true);
  let streamingBubble=null;
  let displayedText='';
  const extractor=makeReplyExtractor(chunk=>{
    if(!streamingBubble){setTyping(false);streamingBubble=appendStreamingMsg();}
    streamingBubble.append(chunk);
    displayedText+=chunk;
  });
  try{
    const raw=await safeLLMStream(state.chatHistory,buildSystemPrompt(),cfg.maxTokens||4096,state._abortCtrl.signal,extractor);
    setTyping(false);
    let parsed;
    try{parsed=JSON.parse(clean(raw));}catch{parsed={reply:displayedText||raw,translation:null,feedback:{positive:[],corrections:[],suggestions:[]}};}
    let msgWrap;
    if(streamingBubble){streamingBubble.finalize(parsed.reply,parsed.translation);msgWrap=streamingBubble.wrap;}
    else{msgWrap=appendMsg('tutor',parsed.reply,parsed.translation);}
    state.chatHistory.push({role:'assistant',content:parsed.reply});
    if(state.chatHistory.length>24)state.chatHistory=state.chatHistory.slice(-24);
    state.currentFbData=parsed.feedback;renderFeedback(state.activeFbTab);
    document.getElementById('feedback-bar').classList.add('visible');
    if(msgWrap)attachFeedbackCard(msgWrap,parsed.feedback);
  }catch(err){
    setTyping(false);
    // userMsg hledáme přes indexOf — abortnutý starý request může doběhnout až poté,
    // co nový sendMessage do historie přidal další zprávy
    const idx=state.chatHistory.indexOf(userMsg);
    if(streamingBubble&&displayedText){
      streamingBubble.finalize(displayedText,null);
      if(idx>=0)state.chatHistory.splice(idx+1,0,{role:'assistant',content:displayedText});
    }else if(idx>=0){
      state.chatHistory.splice(idx,1);
    }
    if(err.name!=='AbortError')appendMsg('tutor',resolveErr(err),null);
  }
}

export function switchFbTab(tab,btn){
  state.activeFbTab=tab;
  document.querySelectorAll('.fb-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderFeedback(tab);
}

export function renderFeedback(tab){
  const t=state.t;
  const el=document.getElementById('fb-content');
  if(!state.currentFbData){el.textContent='';return;}
  const items=state.currentFbData[tab]||[];
  if(!items.length){el.innerHTML='<em style="color:var(--mut)">–</em>';return;}
  el.innerHTML='';
  const ul=document.createElement('ul');
  items.forEach(itemText=>{
    const li=document.createElement('li');
    li.style.display='flex';li.style.alignItems='flex-start';li.style.gap='6px';
    const span=document.createElement('span');span.style.flex='1';span.textContent=itemText;
    const btn=document.createElement('button');btn.className='fb-save-btn';btn.textContent='🔖';btn.title=t.tipsSave;
    btn.onclick=()=>saveTip(btn,itemText,tab);
    li.appendChild(span);li.appendChild(btn);ul.appendChild(li);
  });
  el.appendChild(ul);
}

export function makeReplyExtractor(onDisplayText){
  const KEY='"reply"';
  let st='before',km=0,escaped=false;
  return function feed(chunk){
    let out='';
    for(const ch of chunk){
      if(st==='before'){
        if(ch===KEY[km]){km++;if(km===KEY.length){st='colon';km=0;}}
        else{km=ch===KEY[0]?1:0;}
      }else if(st==='colon'){
        if(ch===':')st='open';
        else if(ch!==' '&&ch!=='\t'&&ch!=='\n'&&ch!=='\r'){st='before';km=ch===KEY[0]?1:0;}
      }else if(st==='open'){
        if(ch==='"')st='in_reply';
        else if(ch!==' '&&ch!=='\t'&&ch!=='\n'&&ch!=='\r'){st='before';km=ch===KEY[0]?1:0;}
      }else if(st==='in_reply'){
        if(escaped){out+=ch==='n'?'\n':ch==='t'?'\t':ch;escaped=false;}
        else if(ch==='\\'){escaped=true;}
        else if(ch==='"'){st='done';}
        else{out+=ch;}
      }
    }
    if(out)onDisplayText(out);
  };
}

export function appendStreamingMsg(){
  document.getElementById('empty').style.display='none';
  const list=document.getElementById('msg-list');
  const typingRow=document.getElementById('typing-row');
  const wrap=document.createElement('div');wrap.className='msg tutor';
  const bubble=document.createElement('div');bubble.className='bubble';
  const textNode=document.createTextNode('');
  bubble.appendChild(textNode);wrap.appendChild(bubble);
  list.insertBefore(wrap,typingRow);scrollBottom();
  return{
    wrap,
    append(text){textNode.textContent+=text;scrollBottom();},
    finalize(fullText,translation){
      const t=state.t;
      bubble.innerHTML=renderMarkdown(fullText);
      const meta=document.createElement('div');meta.className='msg-meta';
      meta.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
      wrap.appendChild(meta);
      if(translation){
        const td=document.createElement('div');td.className='translation';
        td.innerHTML=`<strong>${t.translationLabel}:</strong> ${esc(translation)}`;
        const btn=document.createElement('button');btn.className='translate-btn';btn.textContent=t.translateBtn;
        btn.onclick=()=>{const v=td.style.display!=='none'&&td.style.display!=='';td.style.display=v?'none':'block';btn.textContent=v?t.translateBtn:t.hideTranslation;};
        wrap.appendChild(btn);wrap.appendChild(td);
      }
      scrollBottom();
    }
  };
}
