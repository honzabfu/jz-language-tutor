// ══════════════════════════════════════════════
// CONSTANTS & STATE
// ══════════════════════════════════════════════
// Structured model metadata with capabilities and cost tiers
const MODELS_METADATA={
  anthropic:[
    {id:'claude-haiku-4-5-20251001',name:'Claude Haiku 4.5',tier:'budget',capability:'general',speed:'fast',recommended:true,costEstimate:{input:1,output:5},features:['1M context','fast']},
    {id:'claude-sonnet-4-6',name:'Claude Sonnet 4.6',tier:'standard',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:3,output:15},features:['1M context','balanced']},
    {id:'claude-opus-4-7',name:'Claude Opus 4.7',tier:'premium',capability:'advanced',speed:'slow',recommended:true,costEstimate:{input:5,output:25},features:['1M context','most capable']}
  ],
  openai:[
    {id:'gpt-5-nano',name:'GPT-5 Nano',tier:'budget',capability:'basic',speed:'fast',recommended:false,costEstimate:{input:0.2,output:1.25},features:['ultra-cheap']},
    {id:'gpt-5-mini',name:'GPT-5 Mini',tier:'budget',capability:'general',speed:'fast',recommended:true,costEstimate:{input:0.75,output:4.5},features:['budget-friendly']},
    {id:'gpt-5',name:'GPT-5',tier:'standard',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:2.5,output:15},features:['standard','balanced']},
    {id:'gpt-5.5',name:'GPT-5.5',tier:'premium',capability:'advanced',speed:'slow',recommended:true,costEstimate:{input:5,output:30},features:['newest','most capable']}
  ],
  gemini:[
    {id:'gemini-3.1-flash-lite',name:'Gemini 3.1 Flash-Lite',tier:'budget',capability:'general',speed:'fast',recommended:true,costEstimate:{input:0.25,output:1.5},features:['ultra-cheap','fast']},
    {id:'gemini-2.5-flash-lite',name:'Gemini 2.5 Flash-Lite',tier:'budget',capability:'general',speed:'fast',recommended:false,costEstimate:{input:0.1,output:0.4},features:['ultra-cheap','balanced']},
    {id:'gemini-2.5-flash',name:'Gemini 2.5 Flash',tier:'standard',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:0.5,output:1.5},features:['balanced','fast']},
    {id:'gemini-2.5-pro',name:'Gemini 2.5 Pro',tier:'standard',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:1.25,output:10},features:['capable','200k context']}
  ],
  ollama:[
    {id:'llama3.2',name:'Llama 3.2',tier:'budget',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:0,output:0},features:['local','free']},
    {id:'llama3.3',name:'Llama 3.3',tier:'budget',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:0,output:0},features:['local','free','newest']},
    {id:'mistral',name:'Mistral',tier:'budget',capability:'general',speed:'fast',recommended:true,costEstimate:{input:0,output:0},features:['local','free']},
    {id:'phi4',name:'Phi-4',tier:'budget',capability:'general',speed:'fast',recommended:false,costEstimate:{input:0,output:0},features:['local','free']},
    {id:'qwen2.5',name:'Qwen 2.5',tier:'budget',capability:'general',speed:'balanced',recommended:false,costEstimate:{input:0,output:0},features:['local','free']}
  ],
  custom:[]
};

// Helper: get model list for provider (backward compatibility)
function getModelsForProvider(provider){
  return (MODELS_METADATA[provider]||[]).map(m=>m.id);
}

// Helper: get model metadata by ID
function getModelMetadata(id){
  for(const provider of Object.keys(MODELS_METADATA)){
    const model=MODELS_METADATA[provider].find(m=>m.id===id);
    if(model)return{...model,provider};
  }
  return null;
}

// Helper: get models for provider filtered by tier (budget/standard/premium)
function getModelsByTier(provider,tier){
  return (MODELS_METADATA[provider]||[]).filter(m=>m.tier===tier).map(m=>m.id);
}

// Helper: get models for provider filtered by capability
function getModelsByCapability(provider,capability){
  return (MODELS_METADATA[provider]||[]).filter(m=>m.capability===capability).map(m=>m.id);
}

// Helper: get only recommended models for provider
function getRecommendedModels(provider){
  return (MODELS_METADATA[provider]||[]).filter(m=>m.recommended).map(m=>m.id);
}

// Helper: get appropriate models based on student level
// Beginners: budget tier only, Intermediate: budget+standard, Advanced: all
function getModelsForLevel(provider,level){
  const all=(MODELS_METADATA[provider]||[]);
  const tierFilter=level==='advanced'?['budget','standard','premium']
                   :level==='intermediate'?['budget','standard']
                   :['budget'];
  return all.filter(m=>tierFilter.includes(m.tier)&&m.recommended).map(m=>m.id);
}

// For backward compatibility with existing code
const MODELS={
  anthropic:getModelsForProvider('anthropic'),
  openai:getModelsForProvider('openai'),
  gemini:getModelsForProvider('gemini'),
  ollama:getModelsForProvider('ollama'),
  custom:[]
};
const DEFAULT_PROVIDER_SETTINGS={anthropic:{apiKey:'',model:''},openai:{apiKey:'',model:''},gemini:{apiKey:'',model:''},ollama:{apiKey:'',model:'',url:'http://localhost:11434'},custom:{apiKey:'',model:'',url:''}};
const LANG_META={bulgarian:{name:'Bulgarian',native:'Български',flag:'🇧🇬',lang:'bg'},croatian:{name:'Croatian',native:'Hrvatski',flag:'🇭🇷',lang:'hr'},czech:{name:'Czech',native:'Čeština',flag:'🇨🇿',lang:'cs'},danish:{name:'Danish',native:'Dansk',flag:'🇩🇰',lang:'da'},dutch:{name:'Dutch',native:'Nederlands',flag:'🇳🇱',lang:'nl'},english:{name:'English',native:'English',flag:'🇬🇧',lang:'en'},estonian:{name:'Estonian',native:'Eesti',flag:'🇪🇪',lang:'et'},finnish:{name:'Finnish',native:'Suomi',flag:'🇫🇮',lang:'fi'},french:{name:'French',native:'Français',flag:'🇫🇷',lang:'fr'},german:{name:'German',native:'Deutsch',flag:'🇩🇪',lang:'de'},greek:{name:'Greek',native:'Ελληνικά',flag:'🇬🇷',lang:'el'},hungarian:{name:'Hungarian',native:'Magyar',flag:'🇭🇺',lang:'hu'},italian:{name:'Italian',native:'Italiano',flag:'🇮🇹',lang:'it'},latvian:{name:'Latvian',native:'Latviešu',flag:'🇱🇻',lang:'lv'},lithuanian:{name:'Lithuanian',native:'Lietuvių',flag:'🇱🇹',lang:'lt'},norwegian:{name:'Norwegian',native:'Norsk',flag:'🇳🇴',lang:'no'},polish:{name:'Polish',native:'Polski',flag:'🇵🇱',lang:'pl'},portuguese:{name:'Portuguese',native:'Português',flag:'🇵🇹',lang:'pt'},romanian:{name:'Romanian',native:'Română',flag:'🇷🇴',lang:'ro'},serbian:{name:'Serbian',native:'Srpski',flag:'🇷🇸',lang:'sr'},slovak:{name:'Slovak',native:'Slovenčina',flag:'🇸🇰',lang:'sk'},slovenian:{name:'Slovenian',native:'Slovenščina',flag:'🇸🇮',lang:'sl'},spanish:{name:'Spanish',native:'Español',flag:'🇪🇸',lang:'es'},swedish:{name:'Swedish',native:'Svenska',flag:'🇸🇪',lang:'sv'},ukrainian:{name:'Ukrainian',native:'Українська',flag:'🇺🇦',lang:'uk'},arabic:{name:'Arabic',native:'العربية',flag:'🇸🇦',lang:'ar'},chinese:{name:'Chinese',native:'中文',flag:'🇨🇳',lang:'zh'},hindi:{name:'Hindi',native:'हिन्दी',flag:'🇮🇳',lang:'hi'},japanese:{name:'Japanese',native:'日本語',flag:'🇯🇵',lang:'ja'},korean:{name:'Korean',native:'한국어',flag:'🇰🇷',lang:'ko'},turkish:{name:'Turkish',native:'Türkçe',flag:'🇹🇷',lang:'tr'}};
const UI_LANGS=[{code:'cs',flag:'🇨🇿',label:'Čeština'},{code:'en',flag:'🇬🇧',label:'English'},{code:'es',flag:'🇪🇸',label:'Español'}];
const SORT_MODES=['alpha','due','new'];
let sortIdx=0;

// Shared across all views — starting a new request or switching views cancels any in-flight LLM call.
let _abortCtrl=null;
let cfg={provider:'gemini',model:MODELS.gemini[0],apiKey:'',anthropicProxyUrl:'',ollamaUrl:'http://localhost:11434',customUrl:'',customModel:'',feedbackStyle:'balanced',customInstructions:'',uiLang:navigator.language.startsWith('cs')?'cs':navigator.language.startsWith('es')?'es':'en',nativeLang:'',lessonMode:false,fontSize:'medium',theme:'auto',defaultView:'fc',providerSettings:{}};
let langLevels={};
function getLangLevel(lang){return langLevels[lang]||'beginner';}
const UI_LANG_NATIVE_FALLBACK={cs:'czech',en:'english',es:'spanish'};
const UI_LANG_LOCALE={cs:'cs-CZ',en:'en-US',es:'es-ES'};
function getNativeLangName(){const key=cfg.nativeLang||(UI_LANG_NATIVE_FALLBACK[cfg.uiLang]||'english');return LANG_META[key]?.name??'English';}
function getUiLocale(){return UI_LANG_LOCALE[cfg.uiLang]||'en-US';}
let chatHistory=[];
let quizHistory=[];
let quizQueue=[];
let quizCurrentWord=null;
let currentLang='spanish';
let vocabLang='spanish';
let currentFbData=null;
let activeFbTab='positive';
let editingWordId=null;
let fcQueue=[];
let fcPending=[];
let fcIdx=0;
let fcRevealed=false;
let fcDirection='reverse';
let fcFilter='today';
let genWords=[];
let bulkSelectMode=false;
const selectedIds=new Set();
let tipsLang='spanish';
let tipsFilter='all';
let tipsBulkSelectMode=false;
const selectedTipIds=new Set();

let t=I18N.cs;

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
function populateLangSelects(){
  const opts=Object.entries(LANG_META).sort(([,a],[,b])=>a.native.localeCompare(b.native)).map(([k,m])=>`<option value="${k}">${m.flag} ${m.native}</option>`).join('');
  ['lang-select','vocab-lang-select','fc-lang-select','quiz-lang-select','import-lang-sel','tips-lang-select'].forEach(id=>{document.getElementById(id).innerHTML=opts;});
}
function _saveProviderSettings(p){
  const ps=cfg.providerSettings[p]||(cfg.providerSettings[p]={});
  ps.apiKey=(document.getElementById('cfg-apikey')?.value||'').trim();
  if(p==='anthropic')ps.proxyUrl=(document.getElementById('cfg-anthropic-proxy-url')?.value||'').trim();
  if(p==='ollama')ps.url=(document.getElementById('cfg-ollama-url')?.value||'').trim();
  if(p==='custom'){ps.url=(document.getElementById('cfg-custom-url')?.value||'').trim();ps.model=(document.getElementById('cfg-custom-model')?.value||'').trim();}
  else ps.model=document.getElementById('cfg-model')?.value||'';
}
function _loadProviderSettings(p){
  const ps=cfg.providerSettings[p]||{};
  cfg.apiKey=ps.apiKey||'';
  if(p==='anthropic')cfg.anthropicProxyUrl=ps.proxyUrl||'';
  if(p==='ollama')cfg.ollamaUrl=ps.url||'http://localhost:11434';
  if(p==='custom'){cfg.customUrl=ps.url||'';cfg.customModel=ps.model||'';}
  else cfg.model=ps.model||(MODELS[p]?.[0]||'');
  const _g=id=>document.getElementById(id);
  if(_g('cfg-apikey'))_g('cfg-apikey').value=cfg.apiKey;
  if(_g('cfg-anthropic-proxy-url'))_g('cfg-anthropic-proxy-url').value=cfg.anthropicProxyUrl;
  if(_g('cfg-ollama-url'))_g('cfg-ollama-url').value=cfg.ollamaUrl;
  if(_g('cfg-custom-url'))_g('cfg-custom-url').value=cfg.customUrl;
  if(_g('cfg-custom-model'))_g('cfg-custom-model').value=cfg.customModel;
}
(function init(){
  try{Object.assign(cfg,JSON.parse(localStorage.getItem('lt-cfg')||'{}'));}catch{}
  try{Object.assign(langLevels,JSON.parse(localStorage.getItem('lt-levels')||'{}'));}catch{}
  // Ensure providerSettings has all provider keys
  Object.keys(DEFAULT_PROVIDER_SETTINGS).forEach(p=>{
    if(!cfg.providerSettings[p])cfg.providerSettings[p]={...DEFAULT_PROVIDER_SETTINGS[p]};
  });
  // Migrate legacy apiKey into ALL cloud provider slots that are still empty
  if(cfg.apiKey)['anthropic','openai','gemini','custom'].forEach(p=>{if(!cfg.providerSettings[p].apiKey)cfg.providerSettings[p].apiKey=cfg.apiKey;});
  // Migrate model/url for current provider slot
  const _ps=cfg.providerSettings[cfg.provider];
  if(cfg.provider!=='custom'&&!_ps.model&&cfg.model)_ps.model=cfg.model;
  if(cfg.provider==='ollama'&&!_ps.url&&cfg.ollamaUrl)_ps.url=cfg.ollamaUrl;
  if(cfg.provider==='custom'){if(!_ps.url&&cfg.customUrl)_ps.url=cfg.customUrl;if(!_ps.model&&cfg.customModel)_ps.model=cfg.customModel;}
  applyFontSize(cfg.fontSize||'medium');
  applyTheme();
  populateLangSelects();
  const sl=localStorage.getItem('lt-lang');
  if(sl&&LANG_META[sl])currentLang=sl;
  vocabLang=currentLang;
  t=I18N[cfg.uiLang]||I18N.cs;
  applyI18n();
  populateSettingsUI();
  updateProviderBadge();
  updateModeBadge();
  document.getElementById('lang-select').value=currentLang;
  document.getElementById('vocab-lang-select').value=vocabLang;
  document.getElementById('fc-lang-select').value=currentLang;
  document.getElementById('quiz-lang-select').value=currentLang;
  document.getElementById('import-lang-sel').value=currentLang;
  const _fcDirBtn=document.getElementById('fc-dir-btn');_fcDirBtn.textContent=fcDirection==='normal'?t.fcDirNormal:t.fcDirReverse;_fcDirBtn.classList.toggle('rev',fcDirection==='reverse');
  tipsLang=currentLang;
  document.getElementById('tips-lang-select').value=currentLang;
  updateEmptyState();
  updateInputPlaceholder();
  navTo(['chat','vocab','fc','quiz','tips','settings'].includes(cfg.defaultView)?cfg.defaultView:'fc');
})();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(cfg.theme==='auto')applyTheme();});
// Restore password fields when page is recovered from bfcache (iOS Safari clears them for security)
window.addEventListener('pageshow',e=>{if(e.persisted){const _ak=document.getElementById('cfg-apikey');if(_ak)_ak.value=cfg.apiKey||'';updateApiKeyStatus();}});

// ══════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════
function syncLangSelectors(l){['lang-select','vocab-lang-select','fc-lang-select','quiz-lang-select','tips-lang-select'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=l;});}
function navTo(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(name+'-view').classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('nav-'+name).classList.add('active');
  if(name==='vocab'){vocabLang=currentLang;document.getElementById('vocab-lang-select').value=currentLang;renderVocabList();}
  if(name==='fc'){document.getElementById('fc-lang-select').value=currentLang;startFlashcards(currentLang);}
  if(name==='quiz'){document.getElementById('quiz-lang-select').value=currentLang;if(!quizHistory.length)startQuiz();}
  if(name==='settings'){populateSettingsUI();}
  if(name==='chat'){updateProviderBadge();updateInputPlaceholder();updateEmptyState();}
  if(name==='tips'){tipsLang=currentLang;document.getElementById('tips-lang-select').value=tipsLang;renderTipsList();}
}

// ══════════════════════════════════════════════
// I18N
// ══════════════════════════════════════════════
function applyI18n(){
  document.getElementById('hdr-title').textContent=t.appTitle;
  document.getElementById('settings-title').textContent=t.settingsTitle;
  document.getElementById('empty-title').textContent=t.emptyTitle;
  document.getElementById('empty-desc').textContent=t.emptyDesc;
  document.getElementById('quiz-empty-title').textContent=t.quizEmptyTitle;
  document.getElementById('quiz-empty-desc').textContent=t.quizEmptyDesc;
  document.getElementById('fb-lbl-positive').textContent=t.fbPositive;
  document.getElementById('fb-lbl-corrections').textContent=t.fbCorrections;
  document.getElementById('fb-lbl-suggestions').textContent=t.fbSuggestions;
  document.getElementById('nav-lbl-chat').textContent=t.navChat;
  document.getElementById('nav-lbl-vocab').textContent=t.navVocab;
  document.getElementById('nav-lbl-fc').textContent=t.navFc;
  document.getElementById('nav-lbl-quiz').textContent=t.navQuiz;
  document.getElementById('nav-lbl-settings').textContent=t.navSettings;
  document.getElementById('vocab-hdr-title').textContent=t.vocabHdr;
  document.getElementById('fc-hdr-title').textContent=t.fcHdr;
  document.getElementById('quiz-hdr-title').textContent=t.quizHdr;
  document.getElementById('sort-btn').textContent=t[['sortAlpha','sortDue','sortNew'][sortIdx]];
  const _dBtn=document.getElementById('fc-dir-btn');if(_dBtn){_dBtn.textContent=fcDirection==='normal'?t.fcDirNormal:t.fcDirReverse;_dBtn.classList.toggle('rev',fcDirection==='reverse');}
  const _fSel=document.getElementById('fc-filter-select');if(_fSel){const _fOpts=_fSel.querySelectorAll('option');if(_fOpts[0])_fOpts[0].textContent=t.fcFilterToday;if(_fOpts[1])_fOpts[1].textContent=t.fcFilterAll;if(_fOpts[2])_fOpts[2].textContent=t.fcFilterNew;if(_fOpts[3])_fOpts[3].textContent=t.fcFilterWeak;}
  document.getElementById('mode-lbl-chat').textContent=t.modeChat;
  document.getElementById('mode-lbl-lesson').textContent=t.modeLesson;
  document.getElementById('mode-btn-chat').title=t.modeChatDesc;
  document.getElementById('mode-btn-lesson').title=t.modeLessonDesc;
  document.getElementById('clear-chat-btn').title=t.clearChatTitle;
  document.getElementById('chat-help-btn').title=t.sHelpLink;
  updateModeBadge();
  updateInputPlaceholder();
  updateApiKeyHint();
  document.getElementById('s-provider-title').textContent=t.sProviderTitle;
  document.getElementById('s-provider-label').textContent=t.sProviderLabel;
  document.querySelector('#cfg-provider option[value="ollama"]').textContent=t.sOllamaOption;
  document.querySelector('#cfg-provider option[value="custom"]').textContent=t.sCustomOption;
  document.getElementById('s-model-label').textContent=t.sModelLabel;
  document.getElementById('s-custom-model-label').textContent=t.sCustomModelLabel;
  document.getElementById('s-apikey-label').textContent=t.sApiKeyLabel;
  document.getElementById('s-ollama-hint').textContent=t.sOllamaHint;
  document.getElementById('s-anthropic-hint').textContent=t.sAnthropicHint;
  document.getElementById('s-anthropic-proxy-label').textContent=t.sAnthropicProxyLabel;
  document.getElementById('s-anthropic-proxy-hint').textContent=t.sAnthropicProxyHint;
  document.getElementById('s-custom-url-hint').textContent=t.sCustomUrlHint;
  document.getElementById('s-tutor-title').textContent=t.sTutorTitle;
  document.getElementById('s-lang-label').textContent=t.sLangLabel;
  document.getElementById('s-level-label').textContent=t.sLevelLabel;
  document.querySelector('#cfg-level option[value="beginner"]').textContent=t.sLevelBeginner;
  document.querySelector('#cfg-level option[value="intermediate"]').textContent=t.sLevelIntermediate;
  document.querySelector('#cfg-level option[value="advanced"]').textContent=t.sLevelAdvanced;
  document.getElementById('s-feedback-label').textContent=t.sFeedbackLabel;
  document.querySelector('#cfg-feedback-style option[value="gentle"]').textContent=t.sFeedbackGentle;
  document.querySelector('#cfg-feedback-style option[value="balanced"]').textContent=t.sFeedbackBalanced;
  document.querySelector('#cfg-feedback-style option[value="strict"]').textContent=t.sFeedbackStrict;
  document.getElementById('s-custom-instructions-label').textContent=t.sCustomInstructionsLabel;
  document.getElementById('cfg-custom-instructions').placeholder=t.sCustomInstructionsPH;
  document.getElementById('s-custom-instructions-hint').textContent=t.sCustomInstructionsHint;
  document.getElementById('s-ui-title').textContent=t.sUiTitle;
  document.getElementById('s-ui-lang-label').textContent=t.sUiLangLabel;
  document.getElementById('s-native-lang-label').textContent=t.sNativeLangLabel;
  const _nlsOpt=document.querySelector('#cfg-native-lang option[value=""]');if(_nlsOpt)_nlsOpt.textContent=t.sNativeLangAuto;
  document.getElementById('s-font-size-label').textContent=t.sFontSizeLabel;
  document.querySelector('#cfg-font-size option[value="small"]').textContent=t.sFontSizeSmall;
  document.querySelector('#cfg-font-size option[value="medium"]').textContent=t.sFontSizeMedium;
  document.querySelector('#cfg-font-size option[value="large"]').textContent=t.sFontSizeLarge;
  document.querySelector('#cfg-font-size option[value="xl"]').textContent=t.sFontSizeXl;
  document.getElementById('s-theme-label').textContent=t.sThemeLabel;
  document.querySelector('#cfg-theme option[value="auto"]').textContent=t.themeAuto;
  document.querySelector('#cfg-theme option[value="light"]').textContent=t.themeLight;
  document.querySelector('#cfg-theme option[value="dark"]').textContent=t.themeDark;
  document.getElementById('s-default-view-label').textContent=t.sDefaultViewLabel;
  document.getElementById('s-default-view-vocab').textContent=t.navVocab;
  document.getElementById('s-default-view-quiz').textContent=t.navQuiz;
  document.getElementById('s-default-view-tips').textContent=t.navTips;
  document.getElementById('s-data-title').textContent=t.sDataTitle;
  document.getElementById('s-data-desc').textContent=t.sDataDesc;
  document.getElementById('s-save-btn').textContent=t.sSaveBtn;
  document.getElementById('s-export-btn').textContent=t.sExportBtn;
  document.getElementById('s-import-btn').textContent=t.sImportBtn;
  document.getElementById('s-clear-btn').textContent=t.sClearBtn;
  document.getElementById('s-add-to-home').textContent=t.sAddToHome;
  document.getElementById('s-help-link').textContent=t.sHelpLink;
  // vocab toolbar
  document.getElementById('vocab-search').placeholder=t.vocabSearchPH;
  document.getElementById('vocab-gen-btn').textContent=t.vocabGenBtn;
  document.getElementById('delete-learned-btn').textContent=t.deleteLearnedBtn;
  document.getElementById('bulk-mode-btn').textContent=bulkSelectMode?t.bulkModeOff:t.bulkModeOn;
  document.getElementById('bulk-count').textContent=t.bulkCountFn(selectedIds.size);
  document.getElementById('bulk-select-all-btn').textContent=t.bulkSelectAll;
  document.getElementById('bulk-delete-btn').textContent=t.bulkDeleteBtn;
  document.getElementById('bulk-cancel-btn').textContent=t.bulkCancelBtn;
  // word modal
  document.getElementById('modal-trans').placeholder=t.modalTransPH;
  document.getElementById('modal-notes').placeholder=t.modalNotesPH;
  document.getElementById('modal-tags').placeholder=t.modalTagsPH;
  document.getElementById('import-text').placeholder=t.importTextPH;
  document.getElementById('gen-topic').placeholder=t.genTopicPH;
  const _langCode=LANG_META[vocabLang]?.lang||vocabLang;
  const _wordBase=t.modalWordLabel.replace(/\s*\*$/,'');
  document.getElementById('modal-word-label-text').textContent=`${_wordBase} (${_langCode}) *`;
  document.getElementById('modal-trans-label-text').textContent=t.modalTransLabel.replace(/\s*\*$/,'')+' ('+getNativeLangName()+') *';
  document.getElementById('modal-swap-btn').title=t.swapBtn;
  document.getElementById('modal-note-label').textContent=t.modalNoteLabel;
  document.getElementById('modal-tags-label').textContent=t.modalTagsLabel;
  document.getElementById('modal-sm2-title').textContent=t.modalSm2Title;
  document.getElementById('modal-save-btn').textContent=t.modalSaveBtn;
  document.getElementById('modal-cancel-btn').textContent=t.modalCancelBtn;
  document.getElementById('modal-delete-btn').textContent=t.modalDeleteBtn;
  // import modal
  document.getElementById('import-title').textContent=t.importTitle;
  document.getElementById('import-desc').innerHTML=t.importDesc;
  document.getElementById('import-content-label').textContent=t.importContentLabel;
  document.getElementById('import-lang-label').textContent=t.importLangLabel;
  document.getElementById('import-col-label').textContent=t.importColLabel;
  document.querySelector('#import-col-order option[value="normal"]').textContent=t.importColNormal;
  document.querySelector('#import-col-order option[value="reverse"]').textContent=t.importColReverse;
  document.getElementById('import-confirm-btn').textContent=t.importBtn;
  document.getElementById('import-cancel-btn').textContent=t.importCancelBtn;
  document.getElementById('import-file-btn').textContent=t.importFromFile;
  // backup import modal
  document.getElementById('backup-import-title').textContent=t.backupImportTitle;
  document.getElementById('backup-import-desc').textContent=t.backupImportDesc;
  document.getElementById('backup-import-label').textContent=t.backupImportLabel;
  document.getElementById('backup-import-btn').textContent=t.backupImportBtn;
  document.getElementById('backup-cancel-btn').textContent=t.backupCancelBtn;
  document.getElementById('backup-file-btn').textContent=t.backupFromFile;
  // generate modal
  document.getElementById('gen-title').textContent=t.genTitle;
  document.getElementById('gen-topic-label').textContent=t.genTopicLabel;
  document.getElementById('gen-count-label').textContent=t.genCountLabel;
  document.getElementById('gen-level-label').textContent=t.genLevelLabel;
  document.querySelector('#gen-level option[value="beginner"]').textContent=t.sLevelBeginner;
  document.querySelector('#gen-level option[value="intermediate"]').textContent=t.sLevelIntermediate;
  document.querySelector('#gen-level option[value="advanced"]').textContent=t.sLevelAdvanced;
  document.getElementById('gen-cancel-btn').textContent=t.genCancelBtn;
  document.getElementById('gen-preview-hint').textContent=t.genPreviewHint;
  document.getElementById('gen-import-selected-btn').textContent=t.genImportSelectedBtn;
  document.getElementById('gen-back-btn').textContent=t.genBackBtn;
  // quiz
  document.getElementById('quiz-input').placeholder=t.quizAnswerPH;
  // pwa banner
  document.getElementById('pwa-banner-text').textContent=t.pwaBannerText;
  document.getElementById('pwa-install-btn').textContent=t.pwaInstallBtn;
  // sw update banner
  document.getElementById('sw-update-banner-text').textContent=t.swUpdateText;
  document.getElementById('sw-reload-btn').textContent=t.swReloadBtn;
  document.getElementById('add-word-btn').title=t.addWordTitle;
  document.getElementById('vocab-cost-warn').textContent=t.vocabCostWarn;
  // tips view
  document.getElementById('tips-hdr-title').textContent=t.tipsHdr;
  document.getElementById('nav-lbl-tips').textContent=t.navTips;
  document.getElementById('tips-lbl-positive').textContent=t.fbPositive;
  document.getElementById('tips-lbl-corrections').textContent=t.fbCorrections;
  document.getElementById('tips-lbl-suggestions').textContent=t.fbSuggestions;
  document.getElementById('tips-filter-all').textContent=t.tipsFilterAll;
  document.getElementById('tips-bulk-mode-btn').textContent=tipsBulkSelectMode?t.bulkModeOff:t.bulkModeOn;
  // dict modal
  document.getElementById('dict-modal-title').textContent=t.dictModalTitle;
  document.getElementById('dict-input').placeholder=t.dictSearchPH;
  document.getElementById('dict-lookup-btn').textContent=t.dictLookupBtn;
  document.getElementById('dict-add-btn').textContent=t.dictAddBtn;
  document.getElementById('dict-close-btn').textContent=t.dictCloseBtn;
  document.getElementById('dict-btn').textContent=t.dictOpenBtn;
  document.getElementById('dict-warning').innerHTML=t.dictWarning;
  document.getElementById('footer-tagline').textContent=t.footerTagline;
  document.getElementById('pwa-dismiss-btn').title=t.bannerDismiss;
  document.getElementById('sw-dismiss-btn').title=t.bannerDismiss;
}
function updateInputPlaceholder(){const m=LANG_META[currentLang];const label=m?(cfg.uiLang==='en'?m.name:m.native):currentLang;document.getElementById('msg-input').placeholder=t.inputPH(label);}
function updateEmptyState(){const m=LANG_META[currentLang];if(m)document.getElementById('empty-flag').textContent=m.flag;}

// ══════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════
function populateSettingsUI(){
  _loadProviderSettings(cfg.provider);
  document.getElementById('cfg-provider').value=cfg.provider;
  const uis=document.getElementById('cfg-ui-lang');uis.innerHTML=UI_LANGS.map(l=>`<option value="${l.code}">${l.flag} ${l.label}</option>`).join('');uis.value=cfg.uiLang;
  const nls=document.getElementById('cfg-native-lang');
  nls.innerHTML=`<option value="">${t.sNativeLangAuto}</option>`+Object.entries(LANG_META).sort(([,a],[,b])=>a.name.localeCompare(b.name)).map(([k,m])=>`<option value="${k}">${m.flag} ${m.name}</option>`).join('');
  nls.value=cfg.nativeLang||'';
  const lls=document.getElementById('cfg-level-lang-select');
  lls.innerHTML=Object.entries(LANG_META).sort(([,a],[,b])=>a.native.localeCompare(b.native)).map(([k,m])=>`<option value="${k}">${m.flag} ${m.native}</option>`).join('');
  lls.value=currentLang;
  document.getElementById('cfg-level').value=getLangLevel(currentLang);
  document.getElementById('cfg-feedback-style').value=cfg.feedbackStyle;
  const _ci=document.getElementById('cfg-custom-instructions');
  _ci.value=cfg.customInstructions||'';
  document.getElementById('cfg-custom-instructions-count').textContent=_ci.value.length;
  document.getElementById('cfg-apikey').value=cfg.apiKey||'';
  document.getElementById('cfg-ollama-url').value=cfg.ollamaUrl;
  document.getElementById('cfg-custom-url').value=cfg.customUrl||'';
  document.getElementById('cfg-custom-model').value=cfg.customModel||'';
  document.getElementById('cfg-font-size').value=cfg.fontSize||'medium';
  document.getElementById('cfg-theme').value=cfg.theme||'auto';
  document.getElementById('cfg-default-view').value=cfg.defaultView||'fc';
  rebuildModelList(cfg.provider,MODELS_METADATA[cfg.provider]||[]);
  document.getElementById('cfg-model').value=cfg.model;
  toggleProviderFields(cfg.provider);
  updateApiKeyHint();
  updateApiKeyStatus();
  setModelHint(cfg.provider);
}
function onProviderChange(p){
  _saveProviderSettings(cfg.provider);cfg.provider=p;_loadProviderSettings(p);
  rebuildModelList(p,MODELS_METADATA[p]||[]);
  document.getElementById('cfg-model').value=cfg.model;
  toggleProviderFields(p);updateApiKeyHint();updateApiKeyStatus();
  setModelHint(p);
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
  updateProviderBadge();
  if(p==='ollama')fetchAndRebuildModels();
}
function autoSaveProviderCfg(){
  cfg.apiKey=(document.getElementById('cfg-apikey')?.value||'').trim();
  cfg.model=document.getElementById('cfg-model')?.value||cfg.model;
  cfg.anthropicProxyUrl=(document.getElementById('cfg-anthropic-proxy-url')?.value||'').trim();
  cfg.ollamaUrl=(document.getElementById('cfg-ollama-url')?.value||'').trim()||'http://localhost:11434';
  cfg.customUrl=(document.getElementById('cfg-custom-url')?.value||'').trim();
  cfg.customModel=(document.getElementById('cfg-custom-model')?.value||'').trim();
  _saveProviderSettings(cfg.provider);
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
  updateProviderBadge();
  updateApiKeyStatus();
}
function onLevelChange(val){const lang=document.getElementById('cfg-level-lang-select').value;langLevels[lang]=val;localStorage.setItem('lt-levels',JSON.stringify(langLevels));}
function onFeedbackStyleChange(val){cfg.feedbackStyle=val;localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
function onNativeLangChange(val){cfg.nativeLang=val;localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
function onFontSizeChange(val){cfg.fontSize=val;applyFontSize(val);localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
function onThemeChange(val){cfg.theme=val;applyTheme();localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
function onDefaultViewChange(val){cfg.defaultView=val;localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
function onCustomInstructionsChange(val){cfg.customInstructions=val.trim();localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
function rebuildModelList(p,models){
  const s=document.getElementById('cfg-model');
  s.innerHTML='';
  models.forEach(m=>{
    const o=document.createElement('option');
    o.value=m.id||m;
    o.textContent=m.name||m.id||m;
    s.appendChild(o);
  });
  const ids=models.map(m=>m.id||m);
  if(ids.includes(cfg.model)){
    s.value=cfg.model;
  }else if(cfg.model){
    const o=document.createElement('option');
    o.value=cfg.model;
    o.textContent=cfg.model;
    s.insertBefore(o,s.firstChild);
    s.value=cfg.model;
  }else if(ids.length){
    s.value=ids[0];
  }
}
function setModelHint(p){
  const el=document.getElementById('s-model-hint');
  if(!el)return;
  const hints={
    anthropic:t.modelHintAnthropic||'Pro běžné použití doporučujeme Haiku nebo Sonnet — jsou rychlé a výrazně levnější než Opus.',
    openai:t.modelHintOpenai||'Pro běžné použití doporučujeme modely řady Mini nebo Flash — jsou rychlé a výrazně levnější.',
    gemini:t.modelHintGemini||'Pro běžné použití doporučujeme modely řady Flash nebo Flash-Lite — jsou rychlé a levné.',
    ollama:'',custom:''
  };
  el.textContent=hints[p]||'';
}
async function fetchModels(provider,apiKey,ollamaUrl){
  if(provider==='anthropic'){
    const r=await fetch('https://api.anthropic.com/v1/models',{headers:{'x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'}});
    if(!r.ok)throw new Error(r.status);
    const d=await r.json();
    return (d.data||[]).filter(m=>/claude/i.test(m.id)).map(m=>({id:m.id,name:m.display_name||m.id}));
  }
  if(provider==='openai'){
    const r=await fetch('https://api.openai.com/v1/models',{headers:{Authorization:`Bearer ${apiKey}`}});
    if(!r.ok)throw new Error(r.status);
    const d=await r.json();
    return (d.data||[])
      .filter(m=>/^(gpt-|o[0-9]|chatgpt-)/.test(m.id)&&!/(instruct|vision|realtime|audio|preview-\d{4}|0[0-9]{2,})/.test(m.id))
      .sort((a,b)=>b.created-a.created)
      .map(m=>({id:m.id,name:m.id}));
  }
  if(provider==='gemini'){
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=50`);
    if(!r.ok)throw new Error(r.status);
    const d=await r.json();
    return (d.models||[])
      .filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent'))
      .map(m=>({id:m.name.replace('models/',''),name:m.displayName||m.name.replace('models/','')}));
  }
  if(provider==='ollama'){
    const base=(ollamaUrl||'http://localhost:11434').replace(/\/$/,'');
    const headers={};
    if(apiKey)headers['Authorization']=`Bearer ${apiKey}`;
    const r=await fetch(`${base}/api/tags`,{headers});
    if(!r.ok)throw new Error(r.status);
    const d=await r.json();
    return (d.models||[]).map(m=>({id:m.name,name:m.name}));
  }
  return [];
}

async function fetchAndRebuildModels(){
  const p=document.getElementById('cfg-provider').value;
  const apiKey=(document.getElementById('cfg-apikey')?.value||'').trim();
  const ollamaUrl=(document.getElementById('cfg-ollama-url')?.value||'').trim();
  const statusEl=document.getElementById('model-fetch-status');
  const btn=document.getElementById('fetch-models-btn');
  if(p!=='ollama'&&!apiKey){statusEl.textContent=t.fetchModelsNoKey||'Nejdříve zadej API klíč.';return;}
  statusEl.textContent=t.fetchModelsLoading||'Načítám modely…';
  if(btn)btn.disabled=true;
  try{
    const models=await fetchModels(p,apiKey,ollamaUrl);
    if(!models.length)throw new Error('empty');
    rebuildModelList(p,models);
    const sel=document.getElementById('cfg-model');
    if(cfg.model&&[...sel.options].some(o=>o.value===cfg.model))sel.value=cfg.model;
    statusEl.textContent=`✓ ${models.length} ${t.fetchModelsOk||'modelů načteno'}`;
    setTimeout(()=>{statusEl.textContent='';},3000);
  }catch(e){
    rebuildModelList(p,MODELS_METADATA[p]||[]);
    statusEl.textContent=t.fetchModelsError||'Nepodařilo se načíst modely — používám výchozí seznam.';
  }finally{
    if(btn)btn.disabled=false;
  }
}

function toggleProviderFields(p){
  const isOllama=p==='ollama',isCustom=p==='custom',isAnthropic=p==='anthropic';
  document.getElementById('field-apikey').style.display='';
  document.getElementById('field-ollama-url').style.display=isOllama?'':'none';
  document.getElementById('field-custom-url').style.display=isCustom?'':'none';
  document.getElementById('field-custom-model').style.display=isCustom?'':'none';
  document.getElementById('field-model-select').style.display=isCustom?'none':'';
  document.getElementById('s-anthropic-hint').style.display=isAnthropic?'':'none';
  document.getElementById('field-anthropic-proxy-url').style.display=isAnthropic?'':'none';
}
function updateApiKeyHint(){const el=document.getElementById('apikey-hint');const h=t.apiHints[cfg.provider]||'';el.textContent=cfg.provider==='ollama'?(t.ollamaApiKeyHint||'Volitelné — vyžadováno pouze pokud je Ollama zabezpečena klíčem (OLLAMA_API_KEY) nebo reverse proxy.'):h?t.sGenerateAt(h):'';document.getElementById('apikey-storage-warn').textContent=cfg.provider!=='ollama'?t.apiKeyStorageWarn:'';}
function updateApiKeyStatus(){const el=document.getElementById('apikey-status');if(cfg.provider==='custom'){el.textContent='';return;}const k=document.getElementById('cfg-apikey')?.value||cfg.apiKey||'';if(cfg.provider==='ollama'){el.innerHTML=k.length>0?`<span class="status-dot status-ok"></span>${t.apiKeySet}`:'';return;}el.innerHTML=k.length>8?`<span class="status-dot status-ok"></span>${t.apiKeySet}`:`<span class="status-dot status-empty"></span>${t.noApiKey}`;}
function onUiLangChange(l){cfg.uiLang=l;t=I18N[l]||I18N.cs;applyI18n();localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
function applyFontSize(size){const m={small:'13px',medium:'15px',large:'17px',xl:'20px'};document.documentElement.style.setProperty('--fs',m[size]||'15px');}
function applyTheme(){const th=cfg.theme||'auto';if(th==='auto'){document.documentElement.dataset.theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}else{document.documentElement.dataset.theme=th;}}
function saveSettings(){
  cfg.provider=document.getElementById('cfg-provider').value;
  cfg.model=document.getElementById('cfg-model').value;
  cfg.apiKey=document.getElementById('cfg-apikey').value.trim();
  cfg.ollamaUrl=document.getElementById('cfg-ollama-url').value.trim();
  cfg.customUrl=document.getElementById('cfg-custom-url').value.trim();
  cfg.customModel=document.getElementById('cfg-custom-model').value.trim();
  _saveProviderSettings(cfg.provider);
  const settingsLang=document.getElementById('cfg-level-lang-select').value;
  langLevels[settingsLang]=document.getElementById('cfg-level').value;
  localStorage.setItem('lt-levels',JSON.stringify(langLevels));
  cfg.feedbackStyle=document.getElementById('cfg-feedback-style').value;
  cfg.customInstructions=document.getElementById('cfg-custom-instructions').value.trim();
  cfg.uiLang=document.getElementById('cfg-ui-lang').value;
  cfg.nativeLang=document.getElementById('cfg-native-lang').value;
  applyI18n();
  cfg.fontSize=document.getElementById('cfg-font-size').value;
  applyFontSize(cfg.fontSize);
  cfg.theme=document.getElementById('cfg-theme').value;
  applyTheme();
  cfg.defaultView=document.getElementById('cfg-default-view').value;
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
  updateProviderBadge();
  const toast=document.getElementById('save-toast');
  toast.textContent=t.saveToast;toast.classList.add('visible');
  setTimeout(()=>toast.classList.remove('visible'),2000);
  updateApiKeyStatus();
}
function updateProviderBadge(){const lb={anthropic:'Claude',openai:'GPT',gemini:'Gemini',ollama:'Ollama',custom:'Custom'};const ok=cfg.provider==='ollama'||(cfg.provider==='custom'&&!!cfg.customUrl&&!!cfg.customModel)||(cfg.apiKey&&cfg.apiKey.length>8);const text=lb[cfg.provider]||cfg.provider;const cls='provider-badge'+(ok?'':' warn');['provider-badge','quiz-provider-badge'].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=text;el.className=cls;}});}

// ── Export / Import full backup ──
function exportAll(){
  const _hasKey=cfg.apiKey&&cfg.apiKey.length>8||Object.values(cfg.providerSettings||{}).some(ps=>ps.apiKey&&ps.apiKey.length>8);
  if(_hasKey&&!confirm(t.sExportApiKeyWarning))return;
  const data={version:2,cfg,langLevels,vocab:{},tips:{},exported:new Date().toISOString()};
  Object.keys(LANG_META).forEach(l=>{const v=getVocab(l);if(v.length)data.vocab[l]=v;const tp=getSavedTips(l);if(tp.length)data.tips[l]=tp;});
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`langtutor-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();
  // Restore the API key input in case the browser cleared it during download (iOS/bfcache behaviour)
  const _ak=document.getElementById('cfg-apikey');if(_ak)_ak.value=cfg.apiKey||'';
}
function importAll(){
  document.getElementById('backup-import-text').value='';
  document.getElementById('backup-import-modal').classList.add('open');
}
function closeBackupModal(){document.getElementById('backup-import-modal').classList.remove('open');}
function closeBackupModalOutside(e){if(e.target===document.getElementById('backup-import-modal'))closeBackupModal();}
function loadBackupFile(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{document.getElementById('backup-import-text').value=ev.target.result;};
  r.readAsText(f);
  e.target.value='';
}
function confirmBackupImport(){
  const raw=document.getElementById('backup-import-text').value.trim();
  if(!raw)return;
  try{const data=JSON.parse(raw);closeBackupModal();applyBackup(data);}catch{alert(t.alertInvalidJson);}
}
function applyBackup(data){
  if(data.cfg)Object.assign(cfg,data.cfg);
  if(data.langLevels)Object.assign(langLevels,data.langLevels);
  if(data.vocab)Object.keys(data.vocab).forEach(l=>setVocab(l,data.vocab[l]));
  if(data.tips)Object.keys(data.tips).forEach(l=>setSavedTips(l,data.tips[l]));
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
  localStorage.setItem('lt-levels',JSON.stringify(langLevels));
  t=I18N[cfg.uiLang]||I18N.cs;
  applyI18n();populateSettingsUI();updateProviderBadge();
  alert(t.alertBackupRestored);
}
function clearData(){if(!confirm(t.clearConfirm))return;localStorage.clear();location.reload();}

// ══════════════════════════════════════════════
// VOCAB STORAGE
// ══════════════════════════════════════════════
function getVocab(lang){try{return JSON.parse(localStorage.getItem('lt-vocab-'+lang)||'[]');}catch{return[];}}
function setVocab(lang,arr){localStorage.setItem('lt-vocab-'+(lang||vocabLang),JSON.stringify(arr));}
function newSM2(){return{interval:1,ef:2.5,due:Date.now(),reps:0};}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

// ══════════════════════════════════════════════
// VOCAB VIEW
// ══════════════════════════════════════════════
function onVocabLangChange(l){currentLang=l;vocabLang=l;localStorage.setItem('lt-lang',l);syncLangSelectors(l);const lls=document.getElementById('cfg-level-lang-select');if(lls){lls.value=l;document.getElementById('cfg-level').value=getLangLevel(l);}renderVocabList();}
function cycleSort(){sortIdx=(sortIdx+1)%SORT_MODES.length;document.getElementById('sort-btn').textContent=t[['sortAlpha','sortDue','sortNew'][sortIdx]];renderVocabList();}
function renderVocabList(){
  const q=(document.getElementById('vocab-search').value||'').toLowerCase();
  let arr=getVocab(vocabLang);
  if(q)arr=arr.filter(w=>w.word.toLowerCase().includes(q)||w.translation.toLowerCase().includes(q)||(w.tags||[]).some(tg=>tg.toLowerCase().includes(q)));
  const mode=SORT_MODES[sortIdx];
  if(mode==='alpha')arr.sort((a,b)=>a.word.localeCompare(b.word));
  else if(mode==='due')arr.sort((a,b)=>(a.sm2?.due||0)-(b.sm2?.due||0));
  else arr.sort((a,b)=>b.id.localeCompare(a.id));
  const list=document.getElementById('vocab-list');
  const total=getVocab(vocabLang).length;
  const countEl=document.getElementById('vocab-count');
  const countTxt=q?`${arr.length} / ${total} ${t.vocabCountSuffix}`:`${total} ${t.vocabCountSuffix}`;
  countEl.innerHTML=total>40?`${countTxt} <span style="color:var(--warn)" title="${t.vocabCountWarning}">⚠</span>`:countTxt;
  if(!arr.length){list.innerHTML=`<div class="vocab-empty"><div style="font-size:2.67rem">📚</div><h2>${q?t.vocabEmptyNoMatch:t.vocabEmptyBlank}</h2><p>${q?t.vocabEmptyNoMatchHint:t.vocabEmptyAddHint}</p></div>`;return;}
  list.innerHTML='';
  const now=Date.now();
  arr.forEach(w=>{
    const due=w.sm2?.due||0;
    const reps=w.sm2?.reps||0;
    let badge='',cls='';
    if(reps===0){badge=t.badgeNew;cls='due-now';}
    else if(due<=now){badge=t.badgeToday;cls='due-now';}
    else if(due-now<86400000){badge=t.badgeTomorrow;cls='due-soon';}
    else{const d=Math.round((due-now)/86400000);badge=`${d}d`;cls='due-ok';}
    const sel=bulkSelectMode&&selectedIds.has(w.id);
    const el=document.createElement('div');el.className='vocab-item'+(sel?' selected':'');
    const tagsHtml=(w.tags&&w.tags.length)?`<div class="tag-chips">${w.tags.map(tg=>`<span class="tag-chip">${esc(tg)}</span>`).join('')}</div>`:'';
    const inner=`<div class="wi"><div class="word">${esc(w.word)}</div><div class="trans">${esc(w.translation)}${w.notes?` · <em>${esc(w.notes)}</em>`:''}</div>${tagsHtml}</div><button class="speak-btn" onclick="event.stopPropagation();playWord('${w.word.replace(/'/g,"\\'")}','${vocabLang}')" title="${t.pronounceBtn||'Hear pronunciation'}">🔊</button><span class="sm2-badge ${cls}">${badge}</span>`;
    if(bulkSelectMode){
      el.innerHTML=`<input type="checkbox" class="cb"${sel?' checked':''}>${inner}`;
      el.addEventListener('click',()=>toggleItemSelect(w.id));
    }else{
      el.innerHTML=inner;
      el.addEventListener('click',()=>openWordModal(w));
    }
    list.appendChild(el);
  });
}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function swapWordTrans(){
  const w=document.getElementById('modal-word');
  const tr=document.getElementById('modal-trans');
  [w.value,tr.value]=[tr.value,w.value];
}
function openWordModal(word){
  editingWordId=word?word.id:null;
  document.getElementById('modal-title').textContent=word?t.modalEditTitle:t.modalAddTitle;
  const _langCode=LANG_META[vocabLang]?.lang||vocabLang;
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
function closeWordModal(){document.getElementById('word-modal').classList.remove('open');editingWordId=null;}
function closeWordModalOutside(e){if(e.target===document.getElementById('word-modal'))closeWordModal();}
function saveWord(){
  const word=document.getElementById('modal-word').value.trim();
  const trans=document.getElementById('modal-trans').value.trim();
  if(!word||!trans){alert(t.errWordRequired);return;}
  const notes=document.getElementById('modal-notes').value.trim();
  const tags=document.getElementById('modal-tags').value.split(',').map(s=>s.trim()).filter(Boolean);
  const arr=getVocab(vocabLang);
  if(editingWordId){
    const idx=arr.findIndex(w=>w.id===editingWordId);
    if(idx>=0){arr[idx]={...arr[idx],word,translation:trans,notes,tags};}
  }else{
    arr.push({id:uid(),word,translation:trans,notes,tags,sm2:newSM2()});
  }
  setVocab(vocabLang,arr);
  closeWordModal();renderVocabList();
}
function deleteWord(){
  if(!editingWordId)return;
  if(!confirm(t.confirmDeleteWord))return;
  const arr=getVocab(vocabLang).filter(w=>w.id!==editingWordId);
  setVocab(vocabLang,arr);closeWordModal();renderVocabList();
}
function deleteLearnedWords(){
  const arr=getVocab(vocabLang);
  const learned=arr.filter(w=>w.sm2&&w.sm2.reps>=1&&w.sm2.interval>=21);
  if(!learned.length){alert(t.alertNoLearned);return;}
  if(!confirm(t.confirmDeleteLearnedFn(learned.length)))return;
  setVocab(vocabLang,arr.filter(w=>!(w.sm2&&w.sm2.reps>=1&&w.sm2.interval>=21)));
  renderVocabList();
}
function toggleBulkMode(){
  bulkSelectMode=!bulkSelectMode;
  selectedIds.clear();
  document.getElementById('bulk-bar').style.display=bulkSelectMode?'flex':'none';
  document.getElementById('bulk-mode-btn').textContent=bulkSelectMode?t.bulkModeOff:t.bulkModeOn;
  document.getElementById('bulk-count').textContent=t.bulkCountFn(0);
  renderVocabList();
}
function toggleItemSelect(id){
  if(selectedIds.has(id))selectedIds.delete(id);else selectedIds.add(id);
  document.getElementById('bulk-count').textContent=t.bulkCountFn(selectedIds.size);
  renderVocabList();
}
function bulkSelectAll(){
  const q=(document.getElementById('vocab-search').value||'').toLowerCase();
  let arr=getVocab(vocabLang);
  if(q)arr=arr.filter(w=>w.word.toLowerCase().includes(q)||w.translation.toLowerCase().includes(q)||(w.tags||[]).some(tg=>tg.toLowerCase().includes(q)));
  arr.forEach(w=>selectedIds.add(w.id));
  document.getElementById('bulk-count').textContent=t.bulkCountFn(selectedIds.size);
  renderVocabList();
}
function deleteSelectedWords(){
  if(!selectedIds.size){alert(t.alertNoSelection);return;}
  if(!confirm(t.confirmDeleteSelectedFn(selectedIds.size)))return;
  setVocab(vocabLang,getVocab(vocabLang).filter(w=>!selectedIds.has(w.id)));
  toggleBulkMode();
}

// ── IMPORT ──
function importVocab(){
  document.getElementById('import-lang-sel').value=vocabLang;
  document.getElementById('import-text').value='';
  document.getElementById('import-preview').textContent='';
  document.getElementById('import-modal').classList.add('open');
}
function closeImportModal(){document.getElementById('import-modal').classList.remove('open');}
function closeImportOutside(e){if(e.target===document.getElementById('import-modal'))closeImportModal();}
function loadFile(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{document.getElementById('import-text').value=ev.target.result;previewImport();};
  r.readAsText(f);
  e.target.value='';
}
document.getElementById('import-text').addEventListener('input',previewImport);
function previewImport(){
  const raw=document.getElementById('import-text').value.trim();
  if(!raw){document.getElementById('import-preview').textContent='';return;}
  try{const d=JSON.parse(raw);if(d.version&&d.vocab){document.getElementById('import-preview').textContent=t.importPreviewBackup;return;}}catch{}
  const lines=raw.split('\n').filter(l=>l.trim()&&!l.startsWith('#'));
  document.getElementById('import-preview').textContent=t.importPreviewLinesFn(lines.length);
}
function confirmImport(){
  const raw=document.getElementById('import-text').value.trim();
  if(!raw)return;
  try{const d=JSON.parse(raw);if(d.version&&d.vocab){applyBackup(d);closeImportModal();return;}}catch{}
  // CSV/TXT
  const lang=document.getElementById('import-lang-sel').value;
  const lines=raw.split('\n').filter(l=>l.trim()&&!l.startsWith('#'));
  const arr=getVocab(lang);
  const existing=new Set(arr.map(w=>w.word.toLowerCase()));
  let added=0,skipped=0;
  lines.forEach(line=>{
    const parts=line.split(',');
    if(parts.length<2){// try tab
      const tp=line.split('\t');if(tp.length<2)return;
      parts.length=0;parts.push(...tp);
    }
    const rev=document.getElementById('import-col-order').value==='reverse';
    const word=(parts[rev?1:0]||'').trim();const trans=(parts[rev?0:1]||'').trim();
    if(!word||!trans)return;
    if(existing.has(word.toLowerCase())){skipped++;return;}
    const rawTags=(parts[3]||'').trim();
    const tags=rawTags?rawTags.split('|').map(s=>s.trim()).filter(Boolean):[];
    arr.push({id:uid(),word,translation:trans,notes:(parts[2]||'').trim(),tags,sm2:newSM2()});
    existing.add(word.toLowerCase());added++;
  });
  setVocab(lang,arr);
  closeImportModal();renderVocabList();
  alert(t.alertImportDoneFn(added,skipped));
}
function exportVocab(){
  const arr=getVocab(vocabLang);
  const lines=arr.map(w=>[w.word,w.translation,w.notes||'',(w.tags||[]).join('|')].join(','));
  const blob=new Blob([lines.join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`vocab-${vocabLang}-${new Date().toISOString().slice(0,10)}.csv`;a.click();
}

// ── DICTIONARY OVERLAY ──
let dictResult=null;
function openDictModal(word){
  document.getElementById('dict-input').value=word||'';
  document.getElementById('dict-result').innerHTML='';
  document.getElementById('dict-add-btn').style.display='none';
  dictResult=null;
  document.getElementById('dict-modal').classList.add('open');
  setTimeout(()=>{const inp=document.getElementById('dict-input');inp.focus();if(word)dictLookup();},100);
}
function closeDictModal(){document.getElementById('dict-modal').classList.remove('open');}
function closeDictModalOutside(e){if(e.target===document.getElementById('dict-modal'))closeDictModal();}
function dictKey(e){if(e.key==='Enter')dictLookup();}
async function dictLookup(){
  const word=document.getElementById('dict-input').value.trim();
  if(!word)return;
  const resEl=document.getElementById('dict-result');
  resEl.innerHTML=`<div class="dict-msg">${t.dictLoading}</div>`;
  document.getElementById('dict-add-btn').style.display='none';
  dictResult=null;
  const targetMeta=LANG_META[vocabLang];
  const targetLang=targetMeta?targetMeta.name:vocabLang;
  const nativeLang=getNativeLangName();
  const sys=`You are a concise bilingual ${targetLang}–${nativeLang} dictionary. Reply with ONLY valid JSON, no markdown fences, no extra text. Keep all fields brief.`;
  const userPrompt=`Look up: "${word}"\nReturn JSON with fields:\n- "entry": plain-text dictionary entry in ${targetLang}, max 3 lines: word+colon on line 1, grammatical category+main translations on line 2, one short usage example in ${targetLang} on line 3\n- "word": the headword/lemma in ${targetLang}\n- "translation": main translations in ${nativeLang} as short comma-separated string (max 5 words)\n- "notes": one short grammatical note or typical collocation in ${targetLang} (e.g. verb government, gender, typical preposition); empty string if not applicable`;
  try{
    const raw=await safeLLM([{role:'user',content:userPrompt}],sys,4096);
    let json;try{json=JSON.parse(clean(raw));}catch{throw new Error(t.errParseLlm);}
    dictResult=json;
    resEl.innerHTML=`<div class="dict-entry">${esc(json.entry)}</div>`;
    document.getElementById('dict-add-btn').style.display='';
  }catch(err){
    resEl.innerHTML=`<div class="dict-msg" style="color:var(--err)">${resolveErr(err)}</div>`;
  }
}
function dictAddToVocab(){
  if(!dictResult)return;
  closeDictModal();
  openWordModal(null);
  document.getElementById('modal-word').value=dictResult.word||'';
  document.getElementById('modal-trans').value=dictResult.translation||'';
  document.getElementById('modal-notes').value=dictResult.notes||'';
}

// ── GENERATE VOCAB ──
function hasApiAccess(){
  return cfg.provider==='ollama'||(cfg.provider==='custom'&&!!cfg.customUrl&&!!cfg.customModel)||(cfg.apiKey&&cfg.apiKey.length>8);
}
function openGenerateModal(){
  document.getElementById('gen-topic').value='';
  const hasApi=hasApiAccess();
  document.getElementById('gen-api-note').textContent=hasApi?t.genApiNoteWithKey:t.genApiNoteNoKey;
  document.getElementById('gen-action-btn').textContent=hasApi?t.genBtn:t.genCopyBtn;
  document.getElementById('gen-level').value=getLangLevel(vocabLang);
  showGenForm();
  document.getElementById('gen-modal').classList.add('open');
  setTimeout(()=>document.getElementById('gen-topic').focus(),100);
}
function closeGenModal(){abortPending();document.getElementById('gen-modal').classList.remove('open');}
function closeGenModalOutside(e){if(e.target===document.getElementById('gen-modal'))closeGenModal();}
function showGenForm(){
  document.getElementById('gen-form').style.display='';
  document.getElementById('gen-preview').style.display='none';
}
async function generateVocab(){
  const topic=document.getElementById('gen-topic').value.trim();
  if(!topic){alert(t.genTopicRequired);return;}
  const count=parseInt(document.getElementById('gen-count').value);
  const meta=LANG_META[vocabLang];
  const levelMap={beginner:'A1-A2',intermediate:'B1-B2',advanced:'C1-C2'};
  const selectedLevel=document.getElementById('gen-level').value;
  langLevels[vocabLang]=selectedLevel;
  localStorage.setItem('lt-levels',JSON.stringify(langLevels));
  const level=levelMap[selectedLevel]||'A1-A2';
  const nativeLang=getNativeLangName();
  if(!hasApiAccess()){
    const prompt=`Generate ${count} ${meta.name} vocabulary words on the topic "${topic}" for ${level} level.\nReply ONLY as CSV (no header, one word per line):\nword in ${meta.name},translation in ${nativeLang},grammatical note or example in ${meta.name} only (optional)\n\nExpected column format:\n<${meta.name} word>,<${nativeLang} translation>,<short grammatical note or example phrase in ${meta.name} only (e.g. gender, typical preposition, verb form, short phrase); empty if not needed>`;
    try{await navigator.clipboard.writeText(prompt);}
    catch{const ta=document.createElement('textarea');ta.value=prompt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);}
    closeGenModal();
    alert(t.alertPromptCopied);
    return;
  }
  abortPending();
  _abortCtrl=new AbortController();
  const btn=document.getElementById('gen-action-btn');
  const origText=btn.textContent;
  btn.textContent=t.genLoading;btn.disabled=true;
  const prompt=`Generate exactly ${count} ${meta.name} vocabulary words on the topic "${topic}" for a ${level} level learner. Translations should be in ${nativeLang}.
Return ONLY a JSON array, no preamble, no markdown:
[{"word":"<word in ${meta.name}>","translation":"<translation in ${nativeLang}>","notes":"<short grammatical note or example phrase in ${meta.name} only (e.g. gender, typical preposition, verb form, short phrase); empty string if not applicable — do NOT use ${nativeLang} here>","tags":["<topic category in ${nativeLang}>","${level}"]}]`;
  try{
    const raw=await safeLLM([{role:'user',content:prompt}],'',Math.max(8192,count*200),_abortCtrl.signal);
    let arr;
    try{
      const s=raw.trim().replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
      const m=s.match(/\[[\s\S]*\]/);
      arr=JSON.parse(m?m[0]:s);
    }catch{throw new Error(t.errParseLlm);}
    if(!Array.isArray(arr)||!arr.length)throw new Error(t.errLlmNoWords);
    genWords=arr.filter(w=>w.word&&w.translation);
    renderGenPreview();
  }catch(err){
    if(err.name!=='AbortError')alert(resolveErr(err));
  }finally{
    btn.textContent=origText;btn.disabled=false;
  }
}
function renderGenPreview(){
  const list=document.getElementById('gen-word-list');
  list.innerHTML=genWords.map((w,i)=>`
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
function confirmGenerateImport(){
  const arr=getVocab(vocabLang);
  const existing=new Set(arr.map(w=>w.word.toLowerCase()));
  let added=0,skipped=0;
  genWords.forEach((w,i)=>{
    if(!document.getElementById('gen-chk-'+i)?.checked)return;
    if(existing.has(w.word.toLowerCase())){skipped++;return;}
    arr.push({id:uid(),word:w.word,translation:w.translation,notes:w.notes||'',tags:Array.isArray(w.tags)?w.tags.map(String).filter(Boolean):[],sm2:newSM2()});
    existing.add(w.word.toLowerCase());added++;
  });
  setVocab(vocabLang,arr);
  closeGenModal();renderVocabList();
  alert(t.alertImportDoneFn(added,skipped));
}

// ── FC DIRECTION ──
function toggleFcDirection(){
  fcDirection=fcDirection==='normal'?'reverse':'normal';
  const btn=document.getElementById('fc-dir-btn');
  btn.textContent=fcDirection==='normal'?t.fcDirNormal:t.fcDirReverse;
  btn.classList.toggle('rev',fcDirection==='reverse');
  startFlashcards(document.getElementById('fc-lang-select').value);
}

// ══════════════════════════════════════════════
// SM-2 ALGORITHM
// ══════════════════════════════════════════════
function sm2Update(sm,q){
  // q: 0=zapomněl, 3=těžce, 4=dobře, 5=perfektně
  let{interval,ef,reps}=sm;
  if(q<3){reps=0;interval=1;}
  else{
    if(reps===0)interval=1;
    else if(reps===1)interval=6;
    else interval=Math.round(interval*ef);
    reps++;
  }
  ef=Math.max(1.3,ef+(0.1-(5-q)*(0.08+(5-q)*0.02)));// official SM-2 EF update; floor 1.3 prevents intervals from collapsing to 1 day forever
  return{interval,ef,reps,due:Date.now()+interval*86400000};
}

// ══════════════════════════════════════════════
// FLASHCARD VIEW
// ══════════════════════════════════════════════
function onFCLangChange(l){currentLang=l;vocabLang=l;localStorage.setItem('lt-lang',l);syncLangSelectors(l);startFlashcards(l);}
function onFCFilterChange(v){fcFilter=v;startFlashcards(document.getElementById('fc-lang-select').value);}
function startFlashcards(lang){
  const all=getVocab(lang);
  if(fcFilter==='today'){
    const cutoff=new Date().setHours(23,59,59,999);
    fcQueue=all.filter(w=>!w.sm2||w.sm2.due<=cutoff);
    fcPending=all.filter(w=>w.sm2&&w.sm2.due>cutoff);
  }else if(fcFilter==='all'){
    fcQueue=[...all];fcPending=[];
  }else if(fcFilter==='new'){
    fcQueue=all.filter(w=>!w.sm2||w.sm2.reps===0);fcPending=[];
  }else{
    fcQueue=all.filter(w=>w.sm2&&w.sm2.ef<2.0);fcPending=[];
  }
  // shuffle
  for(let i=fcQueue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[fcQueue[i],fcQueue[j]]=[fcQueue[j],fcQueue[i]];}
  fcIdx=0;fcRevealed=false;
  renderFC();
}
function renderFC(){
  const body=document.getElementById('fc-body');
  const _locale=getUiLocale();
  const _pendingStr=(fcFilter==='today'&&fcPending.length)?`<p style="color:var(--mut);font-size:0.87rem;margin-top:8px">${t.fcPendingFn(fcPending.length)} · ${t.fcNextDue} ${new Date(Math.min(...fcPending.map(w=>w.sm2.due))).toLocaleDateString(_locale,{day:'numeric',month:'long'})}</p>`:'';
  if(!fcQueue.length){
    if(fcFilter==='today'&&fcPending.length){body.innerHTML=`<div class="fc-done"><div class="big">🎉</div><h2>${t.fcDoneTitle}</h2>${_pendingStr}<button class="btn btn-secondary" onclick="navTo('vocab')">${t.navVocab}</button></div>`;}
    else if(fcFilter==='new'){body.innerHTML=`<div class="fc-done"><div class="big">✅</div><h2>${t.fcEmptyNew}</h2><p>${t.fcEmptyNewDesc}</p></div>`;}
    else if(fcFilter==='weak'){body.innerHTML=`<div class="fc-done"><div class="big">💪</div><h2>${t.fcEmptyWeak}</h2><p>${t.fcEmptyWeakDesc}</p></div>`;}
    else{body.innerHTML=`<div class="fc-done"><div class="big">📚</div><h2>${t.fcEmptyTitle}</h2><p>${t.fcEmptyDesc}</p><button class="btn btn-primary" onclick="navTo('vocab')">${t.navVocab}</button></div>`;}
    return;
  }
  if(fcIdx>=fcQueue.length){const n=fcQueue.length;body.innerHTML=`<div class="fc-done"><div class="big">🎉</div><h2>${t.fcDoneTitle}</h2><p>${t.fcDoneDesc(n)}</p>${_pendingStr}<button class="btn btn-primary" onclick="startFlashcards(document.getElementById('fc-lang-select').value)">${t.fcAgain}</button></div>`;return;}
  const w=fcQueue[fcIdx];
  const _rev=fcDirection==='reverse';
  const _front=_rev?w.translation:w.word;
  const _back=_rev?w.word:w.translation;
  const _frontNotes=!_rev&&w.notes?`<div class="fc-notes">${esc(w.notes)}</div>`:'';
  const _backNotes=_rev&&w.notes?`<div class="fc-notes" style="margin-top:6px;font-size:0.87rem">${esc(w.notes)}</div>`:'';
  body.innerHTML=`
    <div class="fc-progress">${t.fcProgress(fcIdx+1,fcQueue.length)}</div>
    <div class="fc-card" onclick="revealFC()">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <div class="fc-word">${esc(_front)}</div>
        <button class="speak-btn" onclick="event.stopPropagation();playWord('${w.word.replace(/'/g,"\\'")}','${document.getElementById('fc-lang-select').value}')" title="${t.pronounceBtn||'Hear pronunciation'}">🔊</button>
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
}
function revealFC(){
  if(fcRevealed)return;
  fcRevealed=true;
  document.getElementById('fc-trans').style.display='block';
  document.getElementById('fc-hint').style.display='none';
  document.getElementById('fc-rating').style.display='flex';
}
function rateFC(q){
  const w=fcQueue[fcIdx];
  const arr=getVocab(document.getElementById('fc-lang-select').value);
  const idx=arr.findIndex(x=>x.id===w.id);
  if(idx>=0){arr[idx].sm2=sm2Update(arr[idx].sm2||newSM2(),q);setVocab(document.getElementById('fc-lang-select').value,arr);}
  fcIdx++;fcRevealed=false;renderFC();
}

// ══════════════════════════════════════════════
// QUIZ VIEW
// ══════════════════════════════════════════════
function onQuizLangChange(l){currentLang=l;vocabLang=l;localStorage.setItem('lt-lang',l);syncLangSelectors(l);startQuiz();}
function startQuiz(){
  quizHistory=[];
  quizQueue=[];
  quizCurrentWord=null;
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
  quizQueue=[...due,...rest].slice(0,10);
  quizHistory=[{role:'system-note',content:`Vocabulary to test: ${quizQueue.map(w=>w.word).join(', ')}`}];
  quizAsk(lang);
}
async function quizAsk(lang){
  if(!quizQueue.length)return;
  quizCurrentWord=quizQueue[0];
  const word=quizCurrentWord;
  const meta=LANG_META[lang];
  const levelMap={beginner:'A1-A2',intermediate:'B1-B2',advanced:'C1-C2'};
  const quizSys=`You are a language quiz tutor testing the student on ${meta.name}. Student level: ${levelMap[getLangLevel(lang)]||'A1-A2'}. Vary question formats naturally (fill-in-the-blank, translate, use in a sentence, etc.). Respond ONLY with valid JSON, no markdown.`;
  const quizPrompt=`Test this specific word: "${word.word}" (meaning: "${word.translation}"). Do NOT reveal the translation to the student.
Respond ONLY with JSON: {"question":"<question in ${meta.name}; if the task requires translation, you may include a ${getNativeLangName()} instruction>","targetWord":"${word.word}"}`;
  if(cfg.provider==='custom'&&(!cfg.customUrl||!cfg.customModel)){appendQuizMsg('tutor',t.errNoKey);return;}
  if(cfg.provider!=='ollama'&&cfg.provider!=='custom'&&(!cfg.apiKey||cfg.apiKey.length<8)){appendQuizMsg('tutor',t.errNoKey);return;}
  abortPending();
  _abortCtrl=new AbortController();
  setQuizTyping(true);
  let raw;
  try{raw=await safeLLM([{role:'user',content:quizPrompt}],quizSys,8192,_abortCtrl.signal);}
  catch(err){setQuizTyping(false);if(err.name==='AbortError')return;appendQuizMsg('tutor',resolveErr(err));return;}
  setQuizTyping(false);
  try{const p=JSON.parse(clean(raw));appendQuizMsg('tutor',p.question);quizHistory.push({role:'assistant-question',word:p.targetWord,content:p.question});}
  catch{appendQuizMsg('tutor',clean(raw));}
}
function quizKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();quizSend();}}
async function quizSend(){
  const inp=document.getElementById('quiz-input');
  const txt=inp.value.trim();if(!txt)return;
  inp.value='';autoResize(inp);
  document.getElementById('quiz-send-btn').disabled=true;
  appendQuizMsg('user',txt);
  quizHistory.push({role:'user',content:txt});
  abortPending();
  _abortCtrl=new AbortController();
  setQuizTyping(true);
  const lang=document.getElementById('quiz-lang-select').value;
  const meta=LANG_META[lang];
  const last=quizHistory.filter(h=>h.role==='assistant-question').slice(-1)[0];
  const targetWord=last?.word||'';
  const question=last?.content||'';
  const evalPrompt=`You are a language quiz evaluator for ${meta.name}.
Question asked: "${question}"
Target word: "${targetWord}"
Student answer: "${txt}"
Evaluate and respond with JSON only: {"correct":true/false,"feedback":"<brief feedback in ${getNativeLangName()}>"}`;
  let raw;
  try{raw=await safeLLM([{role:'user',content:evalPrompt}],'',8192,_abortCtrl.signal);}
  catch(err){setQuizTyping(false);if(err.name==='AbortError'){document.getElementById('quiz-send-btn').disabled=false;return;}appendQuizMsg('tutor',resolveErr(err));document.getElementById('quiz-send-btn').disabled=false;return;}
  setQuizTyping(false);
  try{
    const p=JSON.parse(clean(raw));
    const icon=p.correct?'✅':'❌';
    appendQuizMsg('tutor',`${icon} ${p.feedback}`);
    quizHistory.push({role:'assistant-feedback',correct:p.correct,content:p.feedback});
    if(p.correct){
      quizQueue.shift();
    } else {
      quizQueue.push(quizQueue.shift());
    }
    if(!quizQueue.length){
      setTimeout(()=>appendQuizMsg('tutor',t.quizDoneMsg),600);
    } else {
      setTimeout(()=>quizAsk(lang),600);
    }
  }catch{appendQuizMsg('tutor',t.errGeneric+' '+clean(raw));}
  document.getElementById('quiz-send-btn').disabled=false;
}
function setQuizTyping(v){const r=document.getElementById('quiz-typing-row');r.style.display=v?'flex':'none';if(v){const l=document.getElementById('quiz-msg-list');l.scrollTop=l.scrollHeight;}}
function appendQuizMsg(role,text){
  const list=document.getElementById('quiz-msg-list');
  const typingRow=document.getElementById('quiz-typing-row');
  const wrap=document.createElement('div');wrap.className=`msg ${role}`;
  const b=document.createElement('div');b.className='bubble';b.innerHTML=renderMarkdown(text);
  wrap.appendChild(b);list.insertBefore(wrap,typingRow);list.scrollTop=list.scrollHeight;
}

// ══════════════════════════════════════════════
// CHAT
// ══════════════════════════════════════════════
function onSettingsLevelLangChange(l){document.getElementById('cfg-level').value=getLangLevel(l);}
function setMode(lesson){cfg.lessonMode=lesson;updateModeBadge();}
function toggleLessonMode(){setMode(!cfg.lessonMode);}
function updateModeBadge(){
  const chat=document.getElementById('mode-btn-chat');
  const lesson=document.getElementById('mode-btn-lesson');
  chat.classList.toggle('active',!cfg.lessonMode);
  lesson.classList.toggle('active',cfg.lessonMode);
  document.getElementById('vocab-cost-warn').style.display=(cfg.lessonMode&&getVocab(currentLang).length>40)?'block':'none';
}
function clearChat(){abortPending();chatHistory=[];currentFbData=null;const list=document.getElementById('msg-list');[...list.children].forEach(el=>{if(el.id!=='empty'&&el.id!=='typing-row')el.remove();});document.getElementById('empty').style.display='';document.getElementById('feedback-bar').classList.remove('visible');document.getElementById('typing-row').style.display='none';document.getElementById('send-btn').disabled=true;}
function onLangChange(l){currentLang=l;vocabLang=l;localStorage.setItem('lt-lang',l);syncLangSelectors(l);updateEmptyState();updateInputPlaceholder();updateModeBadge();clearChat();const lls=document.getElementById('cfg-level-lang-select');if(lls){lls.value=l;document.getElementById('cfg-level').value=getLangLevel(l);}}
function onKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}
function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';}
function scrollBottom(){const l=document.getElementById('msg-list');l.scrollTop=l.scrollHeight;}
function setTyping(v){document.getElementById('typing-row').style.display=v?'flex':'none';if(v)scrollBottom();}
function renderMarkdown(text){
  const inline=s=>s
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/_(.+?)_/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>');
  const lines=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').split('\n');
  const parts=[];let li=[];
  const flush=()=>{if(li.length){parts.push('<ul>'+li.map(i=>`<li>${i}</li>`).join('')+'</ul>');li=[];}};
  for(const ln of lines){const m=ln.match(/^[ \t]*[-*] (.+)/);if(m)li.push(inline(m[1]));else{flush();parts.push(inline(ln));}}
  flush();
  return parts.join('<br>');
}
function appendMsg(role,text,translation){
  document.getElementById('empty').style.display='none';
  const list=document.getElementById('msg-list');
  const typingRow=document.getElementById('typing-row');
  const wrap=document.createElement('div');wrap.className=`msg ${role}`;
  const bubble=document.createElement('div');bubble.className='bubble';bubble.innerHTML=renderMarkdown(text);wrap.appendChild(bubble);
  const meta=document.createElement('div');meta.className='msg-meta';meta.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});wrap.appendChild(meta);
  if(role==='tutor'&&translation){
    const td=document.createElement('div');td.className='translation';td.innerHTML=`<strong>${t.translationLabel}:</strong> ${translation}`;
    const btn=document.createElement('button');btn.className='translate-btn';btn.textContent=t.translateBtn;
    btn.onclick=()=>{const v=td.style.display!=='none'&&td.style.display!=='';td.style.display=v?'none':'block';btn.textContent=v?t.translateBtn:t.hideTranslation;};
    wrap.appendChild(btn);wrap.appendChild(td);
  }
  list.insertBefore(wrap,typingRow);scrollBottom();
  return wrap;
}

function buildSystemPrompt(){
  const meta=LANG_META[currentLang];
  const lvMap={beginner:'A1-A2',intermediate:'B1-B2',advanced:'C1-C2'};
  const fbMap={gentle:'encouraging and gentle',balanced:'balanced',strict:'strict and exhaustive'};
  const uiLangName=getNativeLangName();
  let vocabCtx='';
  if(cfg.lessonMode){
    const arr=getVocab(currentLang).slice(0,50);// cap prevents context overflow; UI warns at 40 words
    if(arr.length)vocabCtx=`\n\nActive vocabulary list (use these words naturally in your responses):\n${arr.map(w=>`${w.word} = ${w.translation}`).join('\n')}`;
  }
  const customCtx=cfg.customInstructions?`\nAdditional instructions: ${cfg.customInstructions}`:'';
  return `You are a friendly language tutor helping practice ${meta.name} (${meta.native}).
Student level: ${lvMap[getLangLevel(currentLang)]||'A1-A2'}. Feedback style: ${fbMap[cfg.feedbackStyle]||'balanced'}.${vocabCtx}${customCtx}
${cfg.lessonMode?'LESSON MODE: Actively incorporate vocabulary from the list above into your responses and explanations.':''}
Respond ONLY with valid JSON (no markdown, no preamble):
{"reply":"<response in ${meta.name}>","translation":"<${uiLangName} translation>","feedback":{"positive":["..."],"corrections":["..."],"suggestions":["..."]}}`;
}

async function sendMessage(){
  const input=document.getElementById('msg-input');
  const text=input.value.trim();if(!text)return;
  if(cfg.provider!=='ollama'&&cfg.provider!=='custom'&&(!cfg.apiKey||cfg.apiKey.length<8)){appendMsg('tutor',t.errNoKey,null);return;}
  abortPending();
  _abortCtrl=new AbortController();
  input.value='';input.style.height='auto';document.getElementById('send-btn').disabled=true;
  appendMsg('user',text,null);
  chatHistory.push({role:'user',content:text});
  setTyping(true);
  let streamingBubble=null;
  let displayedText='';
  const extractor=makeReplyExtractor(chunk=>{
    if(!streamingBubble){setTyping(false);streamingBubble=appendStreamingMsg();}
    streamingBubble.append(chunk);
    displayedText+=chunk;
  });
  try{
    const raw=await safeLLMStream(chatHistory,buildSystemPrompt(),8192,_abortCtrl.signal,extractor);
    setTyping(false);
    let parsed;
    try{parsed=JSON.parse(clean(raw));}catch{parsed={reply:displayedText||raw,translation:null,feedback:{positive:[],corrections:[],suggestions:[]}};}
    let msgWrap;
    if(streamingBubble){streamingBubble.finalize(parsed.reply,parsed.translation);msgWrap=streamingBubble.wrap;}
    else{msgWrap=appendMsg('tutor',parsed.reply,parsed.translation);}
    chatHistory.push({role:'assistant',content:parsed.reply});
    if(chatHistory.length>24)chatHistory=chatHistory.slice(-24);// keep last 24 messages to limit context token cost
    currentFbData=parsed.feedback;renderFeedback(activeFbTab);
    document.getElementById('feedback-bar').classList.add('visible');
    if(msgWrap)attachFeedbackCard(msgWrap,parsed.feedback);
  }catch(err){
    setTyping(false);
    if(err.name==='AbortError'){if(streamingBubble&&displayedText)streamingBubble.finalize(displayedText,null);return;}
    if(streamingBubble&&displayedText){streamingBubble.finalize(displayedText,null);}
    else{appendMsg('tutor',resolveErr(err),null);}
  }
}

function switchFbTab(tab,btn){activeFbTab=tab;document.querySelectorAll('.fb-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderFeedback(tab);}
function renderFeedback(tab){
  const el=document.getElementById('fb-content');
  if(!currentFbData){el.textContent='';return;}
  const items=currentFbData[tab]||[];
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

// ══════════════════════════════════════════════
// SAVED TIPS
// ══════════════════════════════════════════════
function getSavedTips(lang){try{return JSON.parse(localStorage.getItem('lt-tips-'+lang)||'[]');}catch{return[];}}
function setSavedTips(lang,arr){localStorage.setItem('lt-tips-'+(lang||currentLang),JSON.stringify(arr));}
function onTipsLangChange(l){currentLang=l;tipsLang=l;vocabLang=l;localStorage.setItem('lt-lang',l);syncLangSelectors(l);renderTipsList();}
function setTipsFilter(filter,btn){tipsFilter=filter;document.querySelectorAll('.tips-filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderTipsList();}
function saveTip(btn,text,type){
  const tips=getSavedTips(currentLang);
  if(!tips.some(tp=>tp.text===text&&tp.type===type)){
    tips.unshift({id:uid(),text,type,lang:currentLang,date:Date.now()});
    setSavedTips(currentLang,tips);
  }
  btn.textContent='✓';btn.classList.add('saved');btn.disabled=true;
}
function renderTipsList(){
  let arr=getSavedTips(tipsLang);
  if(tipsFilter!=='all')arr=arr.filter(tp=>tp.type===tipsFilter);
  const list=document.getElementById('tips-list');
  const total=getSavedTips(tipsLang).length;
  document.getElementById('tips-count').textContent=tipsFilter!=='all'?`${arr.length} / ${total}`:String(total);
  if(!arr.length){
    list.innerHTML=`<div class="vocab-empty"><div style="font-size:2.67rem">🔖</div><h2>${t.tipsEmpty}</h2><p>${t.tipsEmptyHint}</p></div>`;
    return;
  }
  const typeConf={positive:{icon:'✅',label:t.fbPositive,cls:'tip-type-positive'},corrections:{icon:'✏️',label:t.fbCorrections,cls:'tip-type-corrections'},suggestions:{icon:'💡',label:t.fbSuggestions,cls:'tip-type-suggestions'}};
  list.innerHTML='';
  arr.forEach(tip=>{
    const tc=typeConf[tip.type]||typeConf.suggestions;
    const date=new Date(tip.date).toLocaleDateString(getUiLocale(),{day:'numeric',month:'short'});
    const sel=tipsBulkSelectMode&&selectedTipIds.has(tip.id);
    const el=document.createElement('div');el.className='tips-item'+(sel?' selected':'');
    const content=document.createElement('div');content.className='tips-item-content';
    content.innerHTML=`<div class="tips-item-tag ${tc.cls}">${tc.icon} ${tc.label}</div><div class="tips-item-text">${esc(tip.text)}</div><div class="tips-item-meta">${date}</div>`;
    if(tipsBulkSelectMode){
      const cb=document.createElement('input');cb.type='checkbox';cb.className='cb';cb.checked=sel;
      el.appendChild(cb);el.appendChild(content);
      el.addEventListener('click',()=>toggleTipSelect(tip.id));
    }else{
      el.appendChild(content);
      const delBtn=document.createElement('button');delBtn.className='tips-delete-btn';delBtn.textContent='×';delBtn.title=t.modalDeleteBtn;
      delBtn.onclick=e=>{e.stopPropagation();deleteTip(tip.id);};
      el.appendChild(delBtn);
    }
    list.appendChild(el);
  });
}
function deleteTip(id){setSavedTips(tipsLang,getSavedTips(tipsLang).filter(tp=>tp.id!==id));renderTipsList();}
function toggleTipSelect(id){
  if(selectedTipIds.has(id))selectedTipIds.delete(id);else selectedTipIds.add(id);
  document.getElementById('tips-bulk-count').textContent=t.bulkCountFn(selectedTipIds.size);
  renderTipsList();
}
function toggleTipsBulkMode(){
  tipsBulkSelectMode=!tipsBulkSelectMode;selectedTipIds.clear();
  document.getElementById('tips-bulk-bar').style.display=tipsBulkSelectMode?'flex':'none';
  document.getElementById('tips-bulk-mode-btn').textContent=tipsBulkSelectMode?t.bulkModeOff:t.bulkModeOn;
  renderTipsList();
}
function tipsSelectAll(){
  getSavedTips(tipsLang).filter(tp=>tipsFilter==='all'||tp.type===tipsFilter).forEach(tp=>selectedTipIds.add(tp.id));
  document.getElementById('tips-bulk-count').textContent=t.bulkCountFn(selectedTipIds.size);
  renderTipsList();
}
function deleteBulkTips(){
  if(!selectedTipIds.size)return;
  setSavedTips(tipsLang,getSavedTips(tipsLang).filter(tp=>!selectedTipIds.has(tp.id)));
  selectedTipIds.clear();tipsBulkSelectMode=false;
  document.getElementById('tips-bulk-bar').style.display='none';
  document.getElementById('tips-bulk-mode-btn').textContent=t.bulkModeOn;
  renderTipsList();
}
function attachFeedbackCard(wrap,feedback){
  if(!feedback)return;
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

// ══════════════════════════════════════════════
// LLM PROVIDERS
// ══════════════════════════════════════════════
function clean(s){s=(s||'').trim();s=s.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();if(!s.startsWith('{')){const m=s.match(/\{[\s\S]*\}/);if(m)s=m[0];}return s;}
async function httpErr(res){if(res.status===401)throw new Error('ERR_401');if(res.status===429)throw new Error('ERR_429');if(res.status>=500)throw new Error('ERR_500');throw new Error(await res.text());}
function resolveErr(err){console.error('[LLM error]',err);const m=err.message;if(m==='NO_KEY')return t.errNoKey;if(m==='ERR_401')return t.err401;if(m==='ERR_429')return t.err429;if(m==='ERR_500')return t.err500;if(m==='MAX_TOKENS')return t.errMaxTokens;if(m?.includes('fetch')||m==='Load failed'||m?.includes('NetworkError')||m?.includes('Failed'))return t.errNetwork;return`${t.errGeneric} ${m}`;}
function abortPending(){if(_abortCtrl){_abortCtrl.abort();_abortCtrl=null;}}

async function safeLLM(msgs,sys,maxTokens=1024,signal){
  if(cfg.provider==='anthropic')return callAnthropic(msgs,sys,maxTokens,signal);
  if(cfg.provider==='openai')return callOpenAI(msgs,sys,maxTokens,signal);
  if(cfg.provider==='gemini')return callGemini(msgs,sys,maxTokens,signal);
  if(cfg.provider==='ollama')return callOllama(msgs,sys,signal);
  if(cfg.provider==='custom')return callCustom(msgs,sys,maxTokens,signal);
  throw new Error('Unknown provider');
}
// 'anthropic-dangerous-direct-browser-calls' header is required for direct browser→API calls without a backend proxy.
async function callAnthropic(msgs,sys,maxTokens=1024,signal){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const filteredMsgs=msgs.filter(m=>m.role==='user'||m.role==='assistant');
  const url=cfg.anthropicProxyUrl||'https://api.anthropic.com/v1/messages';
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-api-key':cfg.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-calls':'true'},body:JSON.stringify({model:cfg.model,max_tokens:maxTokens,system:sys||undefined,messages:filteredMsgs}),signal});
  if(!res.ok)await httpErr(res);
  const d1=await res.json();
  if(d1.stop_reason==='max_tokens')throw new Error('MAX_TOKENS');
  return d1.content[0].text;
}
async function callOpenAI(msgs,sys,maxTokens=1024,signal){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const res=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${cfg.apiKey}`},body:JSON.stringify({model:cfg.model,max_completion_tokens:maxTokens,messages:m}),signal});
  if(!res.ok)await httpErr(res);
  const d2=await res.json();
  if(d2.choices[0].finish_reason==='length')throw new Error('MAX_TOKENS');
  return d2.choices[0].message.content;
}
async function callGemini(msgs,sys,maxTokens=1024,signal){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const gm=msgs.filter(x=>x.role==='user'||x.role==='assistant').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
  const body={contents:gm,generationConfig:{maxOutputTokens:maxTokens}};
  if(sys)body.system_instruction={parts:[{text:sys}]};
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent?key=${cfg.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  if(!res.ok)await httpErr(res);
  const data=await res.json();
  if(data.candidates?.[0]?.finishReason==='MAX_TOKENS')throw new Error('MAX_TOKENS');
  const text=data.candidates?.[0]?.content?.parts?.[0]?.text;
  if(text==null){
    const reason=data.candidates?.[0]?.finishReason||data.promptFeedback?.blockReason||'empty response';
    throw new Error(reason);
  }
  return text;
}
async function callOllama(msgs,sys,signal){
  const base=(cfg.ollamaUrl||'http://localhost:11434').replace(/\/$/,'');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const headers={'Content-Type':'application/json'};
  if(cfg.apiKey)headers['Authorization']=`Bearer ${cfg.apiKey}`;
  const res=await fetch(`${base}/api/chat`,{method:'POST',headers,body:JSON.stringify({model:cfg.model,stream:false,messages:m}),signal});
  if(!res.ok)await httpErr(res);
  return(await res.json()).message.content;
}
async function callCustom(msgs,sys,maxTokens=1024,signal){
  const base=(cfg.customUrl||'').replace(/\/$/,'');
  if(!base||!cfg.customModel)throw new Error('NO_KEY');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const headers={'Content-Type':'application/json'};
  if(cfg.apiKey)headers['Authorization']=`Bearer ${cfg.apiKey}`;
  const res=await fetch(`${base}/chat/completions`,{method:'POST',headers,body:JSON.stringify({model:cfg.customModel,max_tokens:maxTokens,messages:m}),signal});
  if(!res.ok)await httpErr(res);
  const d3=await res.json();
  if(d3.choices[0].finish_reason==='length')throw new Error('MAX_TOKENS');
  return d3.choices[0].message.content;
}

// ══════════════════════════════════════════════
// STREAMING PROVIDERS
// ══════════════════════════════════════════════
async function readSSE(response,onData){
  const reader=response.body.getReader();
  const decoder=new TextDecoder();
  let buf='';
  while(true){
    const{done,value}=await reader.read();
    if(done)break;
    buf+=decoder.decode(value,{stream:true});
    const lines=buf.split('\n');
    buf=lines.pop();
    for(const line of lines){
      if(!line.startsWith('data: '))continue;
      const data=line.slice(6).trim();
      if(data==='[DONE]')return;
      try{onData(JSON.parse(data));}catch{}
      await new Promise(r=>setTimeout(r,0));// yield to event loop so each chunk can paint before the next arrives
    }
  }
}
async function callAnthropicStream(msgs,sys,maxTokens,signal,onChunk){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const filteredMsgs=msgs.filter(m=>m.role==='user'||m.role==='assistant');
  const url=cfg.anthropicProxyUrl||'https://api.anthropic.com/v1/messages';
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-api-key':cfg.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-calls':'true'},body:JSON.stringify({model:cfg.model,max_tokens:maxTokens,stream:true,system:sys||undefined,messages:filteredMsgs}),signal});
  if(!res.ok)await httpErr(res);
  let full='';
  await readSSE(res,data=>{
    if(data.type==='content_block_delta'&&data.delta?.text){onChunk(data.delta.text);full+=data.delta.text;}
  });
  return full;
}
async function callOpenAIStream(msgs,sys,maxTokens,signal,onChunk){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const res=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${cfg.apiKey}`},body:JSON.stringify({model:cfg.model,max_completion_tokens:maxTokens,stream:true,messages:m}),signal});
  if(!res.ok)await httpErr(res);
  let full='';
  await readSSE(res,data=>{
    const text=data.choices?.[0]?.delta?.content;
    if(text){onChunk(text);full+=text;}
  });
  return full;
}
async function callGeminiStream(msgs,sys,maxTokens,signal,onChunk){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const gm=msgs.filter(x=>x.role==='user'||x.role==='assistant').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
  const body={contents:gm,generationConfig:{maxOutputTokens:maxTokens}};
  if(sys)body.system_instruction={parts:[{text:sys}]};
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:streamGenerateContent?key=${cfg.apiKey}&alt=sse`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  if(!res.ok)await httpErr(res);
  let full='';
  await readSSE(res,data=>{
    const text=data.candidates?.[0]?.content?.parts?.[0]?.text;
    if(text){onChunk(text);full+=text;}
  });
  return full;
}
async function callOllamaStream(msgs,sys,signal,onChunk){
  const base=(cfg.ollamaUrl||'http://localhost:11434').replace(/\/$/,'');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const headers={'Content-Type':'application/json'};
  if(cfg.apiKey)headers['Authorization']=`Bearer ${cfg.apiKey}`;
  const res=await fetch(`${base}/api/chat`,{method:'POST',headers,body:JSON.stringify({model:cfg.model,stream:true,messages:m}),signal});
  if(!res.ok)await httpErr(res);
  const reader=res.body.getReader();
  const decoder=new TextDecoder();
  let buf='',full='';
  while(true){
    const{done,value}=await reader.read();
    if(done)break;
    buf+=decoder.decode(value,{stream:true});
    const lines=buf.split('\n');
    buf=lines.pop();
    for(const line of lines){
      if(!line.trim())continue;
      try{
        const data=JSON.parse(line);
        const text=data.message?.content;
        if(text){onChunk(text);full+=text;}
        if(data.done)return full;
      }catch{}
    }
  }
  return full;
}
async function callCustomStream(msgs,sys,maxTokens,signal,onChunk){
  const base=(cfg.customUrl||'').replace(/\/$/,'');
  if(!base||!cfg.customModel)throw new Error('NO_KEY');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const headers={'Content-Type':'application/json'};
  if(cfg.apiKey)headers['Authorization']=`Bearer ${cfg.apiKey}`;
  const res=await fetch(`${base}/chat/completions`,{method:'POST',headers,body:JSON.stringify({model:cfg.customModel,max_tokens:maxTokens,stream:true,messages:m}),signal});
  if(!res.ok)await httpErr(res);
  let full='';
  await readSSE(res,data=>{
    const text=data.choices?.[0]?.delta?.content;
    if(text){onChunk(text);full+=text;}
  });
  return full;
}
async function safeLLMStream(msgs,sys,maxTokens=1024,signal,onChunk){
  if(cfg.provider==='anthropic')return callAnthropicStream(msgs,sys,maxTokens,signal,onChunk);
  if(cfg.provider==='openai')return callOpenAIStream(msgs,sys,maxTokens,signal,onChunk);
  if(cfg.provider==='gemini')return callGeminiStream(msgs,sys,maxTokens,signal,onChunk);
  if(cfg.provider==='ollama')return callOllamaStream(msgs,sys,signal,onChunk);
  if(cfg.provider==='custom')return callCustomStream(msgs,sys,maxTokens,signal,onChunk);
  throw new Error('Unknown provider');
}
function makeReplyExtractor(onDisplayText){
  // State machine to find "reply" key and extract its string value.
  // Handles both {"reply":"..."} and {"reply": "..."} (optional whitespace around colon).
  const KEY='"reply"';
  let state='before',km=0,esc=false;
  return function feed(chunk){
    let out='';
    for(const ch of chunk){
      if(state==='before'){
        if(ch===KEY[km]){km++;if(km===KEY.length){state='colon';km=0;}}
        else{km=ch===KEY[0]?1:0;}
      }else if(state==='colon'){
        if(ch===':')state='open';
        else if(ch!==' '&&ch!=='\t'&&ch!=='\n'&&ch!=='\r'){state='before';km=ch===KEY[0]?1:0;}
      }else if(state==='open'){
        if(ch==='"')state='in_reply';
        else if(ch!==' '&&ch!=='\t'&&ch!=='\n'&&ch!=='\r'){state='before';km=ch===KEY[0]?1:0;}
      }else if(state==='in_reply'){
        if(esc){out+=ch==='n'?'\n':ch==='t'?'\t':ch;esc=false;}
        else if(ch==='\\'){esc=true;}
        else if(ch==='"'){state='done';}
        else{out+=ch;}
      }
    }
    if(out)onDisplayText(out);
  };
}
function appendStreamingMsg(){
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
      bubble.innerHTML=renderMarkdown(fullText);
      const meta=document.createElement('div');meta.className='msg-meta';
      meta.textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
      wrap.appendChild(meta);
      if(translation){
        const td=document.createElement('div');td.className='translation';
        td.innerHTML=`<strong>${t.translationLabel}:</strong> ${translation}`;
        const btn=document.createElement('button');btn.className='translate-btn';btn.textContent=t.translateBtn;
        btn.onclick=()=>{const v=td.style.display!=='none'&&td.style.display!=='';td.style.display=v?'none':'block';btn.textContent=v?t.translateBtn:t.hideTranslation;};
        wrap.appendChild(btn);wrap.appendChild(td);
      }
      scrollBottom();
    }
  };
}

// ══════════════════════════════════════════════
// PWA INSTALL PROMPT
// ══════════════════════════════════════════════
let _pwaPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  if(localStorage.getItem('lt-pwa-dismissed')||window.matchMedia('(display-mode: standalone)').matches)return;
  e.preventDefault();
  _pwaPrompt=e;
  document.getElementById('pwa-banner').classList.add('visible');
});
async function pwaInstall(){
  if(!_pwaPrompt)return;
  _pwaPrompt.prompt();
  const{outcome}=await _pwaPrompt.userChoice;
  _pwaPrompt=null;
  document.getElementById('pwa-banner').classList.remove('visible');
  if(outcome==='accepted')localStorage.setItem('lt-pwa-dismissed','1');
}
function pwaDismiss(){
  document.getElementById('pwa-banner').classList.remove('visible');
  localStorage.setItem('lt-pwa-dismissed','1');
}

// ── Web Speech API Pronunciation ──
function playWord(word,lang){
  if(!word)return;
  if(window.speechSynthesis.speaking)window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(word);
  u.lang=LANG_META[lang]?.lang||lang;u.rate=0.9;
  window.speechSynthesis.speak(u);
}

// ── Service Worker ──
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    const hadController=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(()=>{});
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(hadController){
        document.getElementById('sw-update-banner').classList.add('visible');
      }
    });
  });
}
