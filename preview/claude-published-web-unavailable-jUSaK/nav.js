import { state } from './state.js';
import { renderVocabList } from './vocab.js';
import { startFlashcards } from './flashcard.js';
import { startQuiz } from './quiz.js';
import { populateSettingsUI, updateProviderBadge } from './settings.js';
import { renderTipsList } from './tips.js';
import { updateInputPlaceholder, updateEmptyState } from './updates.js';

export function navTo(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(name+'-view').classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('nav-'+name).classList.add('active');
  if(name==='vocab'){state.vocabLang=state.currentLang;document.getElementById('vocab-lang-select').value=state.currentLang;renderVocabList();}
  if(name==='fc'){document.getElementById('fc-lang-select').value=state.currentLang;startFlashcards(state.currentLang);}
  if(name==='quiz'){document.getElementById('quiz-lang-select').value=state.currentLang;if(!state.quizHistory.length)startQuiz();}
  if(name==='settings'){populateSettingsUI();}
  if(name==='chat'){updateProviderBadge();updateInputPlaceholder();updateEmptyState();}
  if(name==='tips'){state.tipsLang=state.currentLang;document.getElementById('tips-lang-select').value=state.tipsLang;renderTipsList();}
}
