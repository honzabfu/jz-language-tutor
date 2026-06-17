import { state } from './state.js';
import { LANG_META } from './constants.js';

export function playWord(word,lang){
  if(!word)return;
  if(window.speechSynthesis.speaking)window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(word);
  u.lang=LANG_META[lang]?.lang||lang;u.rate=state.cfg.ttsRate??0.9;
  window.speechSynthesis.speak(u);
}

export function syncLangSelectors(l){
  ['lang-select','vocab-lang-select','fc-lang-select','quiz-lang-select','tips-lang-select'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value=l;
  });
}

// Jediné místo pro přepnutí aktivního jazyka — nastaví všechna zrcadlená pole,
// persistuje lt-lang a synchronizuje selecty všech views
export function setActiveLang(l){
  state.currentLang=l;state.vocabLang=l;state.tipsLang=l;
  localStorage.setItem('lt-lang',l);
  syncLangSelectors(l);
}

export function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';}
