import { MODELS, DEFAULT_PROVIDER_SETTINGS, LANG_META, UI_LANG_NATIVE_FALLBACK, UI_LANG_LOCALE } from './constants.js';

export const state={
  _abortCtrl: null,
  cfg: {
    provider:           'gemini',
    model:              MODELS.gemini[0],
    apiKey:             '',
    anthropicProxyUrl:  '',
    openaiEndpointUrl:  '',
    openaiAuthHeader:   'bearer',
    geminiEndpointUrl:  '',
    ollamaUrl:          'http://localhost:11434',
    customUrl:          '',
    customModel:        '',
    feedbackStyle:      'balanced',
    customInstructions: '',
    uiLang:             navigator.language.startsWith('cs')?'cs':navigator.language.startsWith('es')?'es':'en',
    nativeLang:         '',
    lessonMode:         false,
    fontSize:           'medium',
    theme:              'auto',
    defaultView:        'fc',
    maxTokens:          8192,
    temperature:        null,
    streamingDisabled:  false,
    fcSessionSize:      20,
    quizSessionSize:    10,
    smEasyBonus:        1.0,
    ttsRate:            0.9,
    vocabImportDuplicates: 'skip',
    providerSettings:   {},
  },
  langLevels: {},
  t: null,
  sortIdx: 0,
  chatHistory: [],
  quizHistory: [],
  quizQueue: [],
  quizCurrentWord: null,
  currentLang: 'spanish',
  vocabLang: 'spanish',
  currentFbData: null,
  activeFbTab: 'positive',
  editingWordId: null,
  fcQueue: [],
  fcPending: [],
  fcIdx: 0,
  fcRevealed: false,
  fcDirection: 'reverse',
  fcFilter: 'today',
  genWords: [],
  bulkSelectMode: false,
  selectedIds: new Set(),
  tipsLang: 'spanish',
  tipsFilter: 'all',
  tipsBulkSelectMode: false,
  selectedTipIds: new Set(),
  _pwaPrompt: null,
};

// Ensure DEFAULT_PROVIDER_SETTINGS keys are in providerSettings on startup
Object.keys(DEFAULT_PROVIDER_SETTINGS).forEach(p=>{
  if(!state.cfg.providerSettings[p])state.cfg.providerSettings[p]={...DEFAULT_PROVIDER_SETTINGS[p]};
});

export function getLangLevel(lang){return state.langLevels[lang]||'beginner';}
export function getNativeLangName(){const key=state.cfg.nativeLang||(UI_LANG_NATIVE_FALLBACK[state.cfg.uiLang]||'english');return LANG_META[key]?.name??'English';}
export function getUiLocale(){return UI_LANG_LOCALE[state.cfg.uiLang]||'en-US';}
