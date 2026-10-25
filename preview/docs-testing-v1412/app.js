import { state } from './state.js';
import { LANG_META, DEFAULT_PROVIDER_SETTINGS, safeAssign } from './constants.js';
import { I18N } from './i18n.js';
import { autoResize, playWord } from './dom.js';
import {
  previewImport, loadFile, confirmImport, closeImportModal,
  importVocab, exportVocab, openWordModal, closeWordModal,
  saveWord, deleteWord, deleteLearnedWords, toggleBulkMode, bulkSelectAll, deleteSelectedWords,
  swapWordTrans, renderVocabList, cycleSort, onVocabLangChange,
  openGenerateModal, closeGenModal, generateVocab, showGenForm, confirmGenerateImport,
  openDictModal, closeDictModal, dictLookup, dictAddToVocab, dictKey
} from './vocab.js';
import { renderTipsList, onTipsLangChange, setTipsFilter, toggleTipsBulkMode, tipsSelectAll, deleteBulkTips } from './tips.js';
import { applyI18n, updateModeBadge, updateEmptyState, updateInputPlaceholder } from './updates.js';
import { toggleFcDirection, onFCLangChange, onFCFilterChange, startFlashcards, revealFC, rateFC } from './flashcard.js';
import { onQuizLangChange, startQuiz, quizKey, quizSend } from './quiz.js';
import {
  onSettingsLevelLangChange, setMode, clearChat, onLangChange, onKey,
  sendMessage, switchFbTab
} from './chat.js';
import {
  populateSettingsUI, dismissOnboarding, onProviderChange, autoSaveProviderCfg,
  onLevelChange, onFeedbackStyleChange, onNativeLangChange, onFontSizeChange,
  onThemeChange, onDefaultViewChange, onCustomInstructionsChange,
  fetchAndRebuildModels, toggleAdvancedFields, updateApiKeyStatus, onUiLangChange,
  applyFontSize, applyTheme, saveSettings, updateProviderBadge,
  openAdvancedSettings, closeAdvancedSettings, onAdvTemperatureDefaultChange,
  saveAdvancedSettings, resetAdvancedSettings,
  openCfgEditor, closeCfgEditor, saveCfgEditor,
  exportAll, dismissBackupReminder, disableBackupReminder,
  importAll, closeBackupModal, loadBackupFile, confirmBackupImport,
  clearData
} from './settings.js';
import { navTo } from './nav.js';

// ── Window exports for dynamically-generated HTML onclick strings ──
window.navTo = navTo;
window.startFlashcards = startFlashcards;
window.revealFC = revealFC;
window.rateFC = rateFC;

function populateLangSelects(){
  const opts=Object.entries(LANG_META).sort(([,a],[,b])=>a.native.localeCompare(b.native)).map(([k,m])=>`<option value="${k}">${m.flag} ${m.native}</option>`).join('');
  ['lang-select','vocab-lang-select','fc-lang-select','quiz-lang-select','import-lang-sel','tips-lang-select'].forEach(id=>{document.getElementById(id).innerHTML=opts;});
}

(function init(){
  try{safeAssign(state.cfg,JSON.parse(localStorage.getItem('lt-cfg')||'{}'));}catch{}
  try{safeAssign(state.langLevels,JSON.parse(localStorage.getItem('lt-levels')||'{}'));}catch{}
  // ručně editovaný lt-cfg (cfg editor) může obsahovat providerSettings:null — nesmí shodit init
  if(!state.cfg.providerSettings||typeof state.cfg.providerSettings!=='object')state.cfg.providerSettings={};
  Object.keys(DEFAULT_PROVIDER_SETTINGS).forEach(p=>{if(!state.cfg.providerSettings[p])state.cfg.providerSettings[p]={...DEFAULT_PROVIDER_SETTINGS[p]};});
  const _ps=state.cfg.providerSettings[state.cfg.provider];
  if(_ps){
    if(state.cfg.apiKey&&!_ps.apiKey)_ps.apiKey=state.cfg.apiKey;
    if(state.cfg.provider!=='custom'&&!_ps.model&&state.cfg.model)_ps.model=state.cfg.model;
    if(state.cfg.provider==='ollama'&&!_ps.url&&state.cfg.ollamaUrl)_ps.url=state.cfg.ollamaUrl;
    if(state.cfg.provider==='custom'){if(!_ps.url&&state.cfg.customUrl)_ps.url=state.cfg.customUrl;if(!_ps.model&&state.cfg.customModel)_ps.model=state.cfg.customModel;}
  }
  applyFontSize(state.cfg.fontSize||'medium');
  applyTheme();
  populateLangSelects();
  const sl=localStorage.getItem('lt-lang');
  if(sl&&LANG_META[sl])state.currentLang=sl;
  state.vocabLang=state.currentLang;
  state.t=I18N[state.cfg.uiLang]||I18N.cs;
  applyI18n();
  populateSettingsUI();
  updateProviderBadge();
  updateModeBadge();
  document.getElementById('lang-select').value=state.currentLang;
  document.getElementById('vocab-lang-select').value=state.vocabLang;
  document.getElementById('fc-lang-select').value=state.currentLang;
  document.getElementById('quiz-lang-select').value=state.currentLang;
  document.getElementById('import-lang-sel').value=state.currentLang;
  const _fcDirBtn=document.getElementById('fc-dir-btn');
  _fcDirBtn.textContent=state.fcDirection==='normal'?state.t.fcDirNormal:state.t.fcDirReverse;
  _fcDirBtn.classList.toggle('rev',state.fcDirection==='reverse');
  state.tipsLang=state.currentLang;
  document.getElementById('tips-lang-select').value=state.currentLang;
  updateEmptyState();
  updateInputPlaceholder();
  if(!localStorage.getItem('lt-onboarded')){navTo('settings');}else{navTo(['chat','vocab','fc','quiz','tips','settings'].includes(state.cfg.defaultView)?state.cfg.defaultView:'fc');}
})();

// ── Event listeners ──

// Chat view
document.getElementById('clear-chat-btn').addEventListener('click',clearChat);
document.getElementById('mode-btn-chat').addEventListener('click',()=>setMode(false));
document.getElementById('mode-btn-lesson').addEventListener('click',()=>setMode(true));
document.getElementById('lang-select').addEventListener('change',e=>onLangChange(e.target.value));
const _fbPositive=document.getElementById('fb-tab-positive');
_fbPositive.addEventListener('click',()=>switchFbTab('positive',_fbPositive));
const _fbCorrections=document.getElementById('fb-tab-corrections');
_fbCorrections.addEventListener('click',()=>switchFbTab('corrections',_fbCorrections));
const _fbSuggestions=document.getElementById('fb-tab-suggestions');
_fbSuggestions.addEventListener('click',()=>switchFbTab('suggestions',_fbSuggestions));
document.getElementById('msg-input').addEventListener('input',e=>{autoResize(e.target);document.getElementById('send-btn').disabled=!e.target.value.trim();});
document.getElementById('msg-input').addEventListener('keydown',onKey);
document.getElementById('send-btn').addEventListener('click',sendMessage);

// Vocab view
document.getElementById('vocab-lang-select').addEventListener('change',e=>onVocabLangChange(e.target.value));
document.getElementById('add-word-btn').addEventListener('click',()=>openWordModal(null));
document.getElementById('vocab-search').addEventListener('input',renderVocabList);
document.getElementById('vocab-import-btn').addEventListener('click',importVocab);
document.getElementById('vocab-export-btn').addEventListener('click',exportVocab);
document.getElementById('vocab-gen-btn').addEventListener('click',openGenerateModal);
document.getElementById('dict-btn').addEventListener('click',()=>openDictModal());
document.getElementById('sort-btn').addEventListener('click',cycleSort);
document.getElementById('delete-learned-btn').addEventListener('click',deleteLearnedWords);
document.getElementById('bulk-mode-btn').addEventListener('click',toggleBulkMode);
document.getElementById('bulk-select-all-btn').addEventListener('click',bulkSelectAll);
document.getElementById('bulk-delete-btn').addEventListener('click',deleteSelectedWords);
document.getElementById('bulk-cancel-btn').addEventListener('click',toggleBulkMode);

// Flashcard view
document.getElementById('fc-lang-select').addEventListener('change',e=>onFCLangChange(e.target.value));
document.getElementById('fc-filter-select').addEventListener('change',e=>onFCFilterChange(e.target.value));
document.getElementById('fc-dir-btn').addEventListener('click',toggleFcDirection);

// Quiz view
document.getElementById('quiz-restart-btn').addEventListener('click',startQuiz);
document.getElementById('quiz-lang-select').addEventListener('change',e=>onQuizLangChange(e.target.value));
document.getElementById('quiz-input').addEventListener('input',e=>{autoResize(e.target);document.getElementById('quiz-send-btn').disabled=!e.target.value.trim();});
document.getElementById('quiz-input').addEventListener('keydown',quizKey);
document.getElementById('quiz-send-btn').addEventListener('click',quizSend);

// Tips view
document.getElementById('tips-lang-select').addEventListener('change',e=>onTipsLangChange(e.target.value));
const _tfAll=document.getElementById('tips-filter-all');
_tfAll.addEventListener('click',()=>setTipsFilter('all',_tfAll));
const _tfPositive=document.getElementById('tips-filter-positive');
_tfPositive.addEventListener('click',()=>setTipsFilter('positive',_tfPositive));
const _tfCorrections=document.getElementById('tips-filter-corrections');
_tfCorrections.addEventListener('click',()=>setTipsFilter('corrections',_tfCorrections));
const _tfSuggestions=document.getElementById('tips-filter-suggestions');
_tfSuggestions.addEventListener('click',()=>setTipsFilter('suggestions',_tfSuggestions));
document.getElementById('tips-bulk-mode-btn').addEventListener('click',toggleTipsBulkMode);
document.getElementById('tips-bulk-select-all-btn').addEventListener('click',tipsSelectAll);
document.getElementById('tips-bulk-delete-btn').addEventListener('click',deleteBulkTips);
document.getElementById('tips-bulk-cancel-btn').addEventListener('click',toggleTipsBulkMode);

// Settings view
document.getElementById('cfg-provider').addEventListener('change',e=>onProviderChange(e.target.value));
document.getElementById('cfg-apikey').addEventListener('input',updateApiKeyStatus);
document.getElementById('cfg-apikey').addEventListener('change',autoSaveProviderCfg);
document.getElementById('cfg-advanced').addEventListener('change',e=>toggleAdvancedFields(e.target.checked));
document.getElementById('cfg-anthropic-proxy-url').addEventListener('change',autoSaveProviderCfg);
document.getElementById('cfg-openai-endpoint-url').addEventListener('change',autoSaveProviderCfg);
document.getElementById('cfg-openai-auth-header').addEventListener('change',autoSaveProviderCfg);
document.getElementById('cfg-gemini-endpoint-url').addEventListener('change',autoSaveProviderCfg);
document.getElementById('cfg-ollama-url').addEventListener('change',autoSaveProviderCfg);
document.getElementById('cfg-custom-url').addEventListener('change',autoSaveProviderCfg);
document.getElementById('cfg-model').addEventListener('change',autoSaveProviderCfg);
document.getElementById('cfg-custom-model').addEventListener('change',autoSaveProviderCfg);
document.getElementById('fetch-models-btn').addEventListener('click',fetchAndRebuildModels);
document.getElementById('cfg-level-lang-select').addEventListener('change',e=>onSettingsLevelLangChange(e.target.value));
document.getElementById('cfg-level').addEventListener('change',e=>onLevelChange(e.target.value));
document.getElementById('cfg-feedback-style').addEventListener('change',e=>onFeedbackStyleChange(e.target.value));
document.getElementById('cfg-native-lang').addEventListener('change',e=>onNativeLangChange(e.target.value));
document.getElementById('cfg-custom-instructions').addEventListener('input',e=>{document.getElementById('cfg-custom-instructions-count').textContent=e.target.value.length;});
document.getElementById('cfg-custom-instructions').addEventListener('change',e=>onCustomInstructionsChange(e.target.value));
document.getElementById('cfg-ui-lang').addEventListener('change',e=>onUiLangChange(e.target.value));
document.getElementById('cfg-font-size').addEventListener('change',e=>onFontSizeChange(e.target.value));
document.getElementById('cfg-theme').addEventListener('change',e=>onThemeChange(e.target.value));
document.getElementById('cfg-default-view').addEventListener('change',e=>onDefaultViewChange(e.target.value));
document.getElementById('backup-reminder-export-btn').addEventListener('click',exportAll);
document.getElementById('backup-reminder-later-btn').addEventListener('click',dismissBackupReminder);
document.getElementById('backup-reminder-disable-btn').addEventListener('click',disableBackupReminder);
document.getElementById('s-save-btn').addEventListener('click',saveSettings);
document.getElementById('s-export-btn').addEventListener('click',exportAll);
document.getElementById('s-import-btn').addEventListener('click',importAll);
document.getElementById('s-clear-btn').addEventListener('click',clearData);
document.getElementById('s-adv-btn').addEventListener('click',openAdvancedSettings);
document.getElementById('s-add-to-home').addEventListener('click',openPwaGuide);
document.getElementById('ob-dismiss').addEventListener('click',dismissOnboarding);

// Advanced settings overlay
document.getElementById('advanced-settings-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeAdvancedSettings();});
document.getElementById('cfg-adv-temperature-default').addEventListener('change',e=>onAdvTemperatureDefaultChange(e.target.checked));
document.getElementById('cfg-adv-temperature').addEventListener('input',e=>{document.getElementById('cfg-adv-temperature-val').textContent=parseFloat(e.target.value).toFixed(2);});
document.getElementById('cfg-sm-easy-bonus').addEventListener('input',e=>{document.getElementById('cfg-sm-easy-bonus-val').textContent=parseFloat(e.target.value).toFixed(2);});
document.getElementById('cfg-tts-rate').addEventListener('input',e=>{document.getElementById('cfg-tts-rate-val').textContent=parseFloat(e.target.value).toFixed(1);});
document.getElementById('adv-save-btn').addEventListener('click',saveAdvancedSettings);
document.getElementById('adv-cancel-btn').addEventListener('click',closeAdvancedSettings);
document.getElementById('adv-reset-btn').addEventListener('click',resetAdvancedSettings);
document.getElementById('adv-cfg-edit-btn').addEventListener('click',openCfgEditor);

// CFG editor overlay
document.getElementById('cfg-editor-overlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeCfgEditor();});
document.getElementById('cfg-editor-save-btn').addEventListener('click',saveCfgEditor);
document.getElementById('cfg-editor-cancel-btn').addEventListener('click',closeCfgEditor);

// PWA banner
document.getElementById('pwa-install-btn').addEventListener('click',pwaInstall);
document.getElementById('pwa-dismiss-btn').addEventListener('click',pwaDismiss);

// PWA guide modal
document.getElementById('pwa-guide-modal').addEventListener('click',e=>{if(e.target===e.currentTarget)closePwaGuide();});
document.getElementById('pwa-guide-close').addEventListener('click',closePwaGuide);

// SW update banner
document.getElementById('sw-reload-btn').addEventListener('click',()=>window.location.reload());
document.getElementById('sw-dismiss-btn').addEventListener('click',()=>document.getElementById('sw-update-banner').classList.remove('visible'));

// Navbar
document.getElementById('nav-chat').addEventListener('click',()=>navTo('chat'));
document.getElementById('nav-vocab').addEventListener('click',()=>navTo('vocab'));
document.getElementById('nav-fc').addEventListener('click',()=>navTo('fc'));
document.getElementById('nav-quiz').addEventListener('click',()=>navTo('quiz'));
document.getElementById('nav-tips').addEventListener('click',()=>navTo('tips'));
document.getElementById('nav-settings').addEventListener('click',()=>navTo('settings'));

// Word modal
document.getElementById('word-modal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeWordModal();});
document.getElementById('modal-word-speak-btn').addEventListener('click',()=>{const w=document.getElementById('modal-word').value;if(w)playWord(w,state.vocabLang);});
document.getElementById('modal-swap-btn').addEventListener('click',swapWordTrans);
document.getElementById('modal-save-btn').addEventListener('click',saveWord);
document.getElementById('modal-cancel-btn').addEventListener('click',closeWordModal);
document.getElementById('modal-delete-btn').addEventListener('click',deleteWord);

// Import modal
document.getElementById('import-modal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeImportModal();});
document.getElementById('import-text').addEventListener('input',previewImport);
document.getElementById('import-confirm-btn').addEventListener('click',confirmImport);
document.getElementById('import-cancel-btn').addEventListener('click',closeImportModal);
document.getElementById('import-file-btn').addEventListener('click',()=>document.getElementById('file-input').click());
document.getElementById('file-input').addEventListener('change',loadFile);

// Backup import modal
document.getElementById('backup-import-modal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeBackupModal();});
document.getElementById('backup-import-btn').addEventListener('click',confirmBackupImport);
document.getElementById('backup-cancel-btn').addEventListener('click',closeBackupModal);
document.getElementById('backup-file-btn').addEventListener('click',()=>document.getElementById('backup-file-input').click());
document.getElementById('backup-file-input').addEventListener('change',loadBackupFile);

// Generate modal
document.getElementById('gen-modal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeGenModal();});
document.getElementById('gen-topic').addEventListener('keydown',e=>{if(e.key==='Enter')generateVocab();});
document.getElementById('gen-action-btn').addEventListener('click',generateVocab);
document.getElementById('gen-cancel-btn').addEventListener('click',closeGenModal);
document.getElementById('gen-import-selected-btn').addEventListener('click',confirmGenerateImport);
document.getElementById('gen-back-btn').addEventListener('click',showGenForm);

// Dictionary modal
document.getElementById('dict-modal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeDictModal();});
document.getElementById('dict-input').addEventListener('keydown',dictKey);
document.getElementById('dict-lookup-btn').addEventListener('click',dictLookup);
document.getElementById('dict-add-btn').addEventListener('click',dictAddToVocab);
document.getElementById('dict-close-btn').addEventListener('click',closeDictModal);

// ── System event listeners ──
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(state.cfg.theme==='auto')applyTheme();});
window.addEventListener('pageshow',e=>{if(e.persisted){const _ak=document.getElementById('cfg-apikey');if(_ak)_ak.value=state.cfg.apiKey||'';updateApiKeyStatus();if('serviceWorker' in navigator){navigator.serviceWorker.getRegistration().then(reg=>{if(reg)reg.update();});}}});

// ── PWA Install Prompt ──
window.addEventListener('beforeinstallprompt',e=>{
  if(localStorage.getItem('lt-pwa-dismissed')||window.matchMedia('(display-mode: standalone)').matches)return;
  e.preventDefault();
  state._pwaPrompt=e;
  document.getElementById('pwa-banner').classList.add('visible');
});
async function pwaInstall(){
  if(!state._pwaPrompt)return;
  state._pwaPrompt.prompt();
  const{outcome}=await state._pwaPrompt.userChoice;
  state._pwaPrompt=null;
  document.getElementById('pwa-banner').classList.remove('visible');
  if(outcome==='accepted')localStorage.setItem('lt-pwa-dismissed','1');
}
function pwaDismiss(){
  document.getElementById('pwa-banner').classList.remove('visible');
  localStorage.setItem('lt-pwa-dismissed','1');
}
function openPwaGuide(){
  const isInstalled=window.matchMedia('(display-mode:standalone)').matches||!!navigator.standalone;
  const isIos=/iphone|ipad|ipod/i.test(navigator.userAgent)||(/macintosh/i.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
  if(!isInstalled&&state._pwaPrompt){pwaInstall();return;}
  const ios=document.getElementById('pwa-guide-ios');const other=document.getElementById('pwa-guide-other');
  ios.style.display='none';other.style.display='none';
  if(isInstalled){other.style.display='block';document.getElementById('pwa-guide-other-text').textContent=state.t.pwaAlreadyInstalled;}
  else if(isIos){ios.style.display='block';}
  else{other.style.display='block';document.getElementById('pwa-guide-other-text').textContent=/android/i.test(navigator.userAgent)?state.t.pwaGuideAndroid:state.t.pwaGuideDesktop;}
  document.getElementById('pwa-guide-modal').classList.add('open');
}
function closePwaGuide(){document.getElementById('pwa-guide-modal').classList.remove('open');}

// ── Service Worker ──
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    const hadController=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController)document.getElementById('sw-update-banner').classList.add('visible');});
  });
}
