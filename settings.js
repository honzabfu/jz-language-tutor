import { state, getLangLevel, defaultCfg } from './state.js';
import { LANG_META, UI_LANGS, MODELS, MODELS_METADATA, DEFAULT_PROVIDER_SETTINGS, safeAssign } from './constants.js';
import { I18N } from './i18n.js';
import { applyI18n, updateApiKeyHint } from './updates.js';
import { getVocab, setVocab, setApplyBackupFn } from './vocab.js';
import { syncLangSelectors } from './dom.js';
import { hasApiAccess } from './llm.js';
import { getSavedTips, setSavedTips } from './tips.js';

const { cfg } = state;
const { langLevels } = state;

setApplyBackupFn(applyBackup);

function _saveProviderSettings(p){
  const ps=cfg.providerSettings[p]||(cfg.providerSettings[p]={});
  ps.apiKey=(document.getElementById('cfg-apikey')?.value||'').trim();
  if(p==='anthropic')ps.proxyUrl=(document.getElementById('cfg-anthropic-proxy-url')?.value||'').trim();
  if(p==='openai'){ps.endpointUrl=(document.getElementById('cfg-openai-endpoint-url')?.value||'').trim();ps.authHeader=document.getElementById('cfg-openai-auth-header')?.value||'bearer';}
  if(p==='gemini')ps.endpointUrl=(document.getElementById('cfg-gemini-endpoint-url')?.value||'').trim();
  if(p==='ollama')ps.url=(document.getElementById('cfg-ollama-url')?.value||'').trim();
  if(p==='custom'){ps.url=(document.getElementById('cfg-custom-url')?.value||'').trim();ps.model=(document.getElementById('cfg-custom-model')?.value||'').trim();}
  else ps.model=document.getElementById('cfg-model')?.value||'';
}

function _loadProviderSettings(p){
  const ps=cfg.providerSettings[p]||{};
  cfg.apiKey=ps.apiKey||'';
  if(p==='anthropic')cfg.anthropicProxyUrl=ps.proxyUrl||'';
  if(p==='openai'){cfg.openaiEndpointUrl=ps.endpointUrl||'';cfg.openaiAuthHeader=ps.authHeader||'bearer';}
  if(p==='gemini')cfg.geminiEndpointUrl=ps.endpointUrl||'';
  if(p==='ollama')cfg.ollamaUrl=ps.url||'http://localhost:11434';
  if(p==='custom'){cfg.customUrl=ps.url||'';cfg.customModel=ps.model||'';}
  else cfg.model=ps.model||(MODELS[p]?.[0]||'');
  const _g=id=>document.getElementById(id);
  if(_g('cfg-apikey'))_g('cfg-apikey').value=cfg.apiKey;
  if(_g('cfg-anthropic-proxy-url'))_g('cfg-anthropic-proxy-url').value=cfg.anthropicProxyUrl;
  if(_g('cfg-openai-endpoint-url'))_g('cfg-openai-endpoint-url').value=cfg.openaiEndpointUrl;
  if(_g('cfg-openai-auth-header'))_g('cfg-openai-auth-header').value=cfg.openaiAuthHeader;
  if(_g('cfg-gemini-endpoint-url'))_g('cfg-gemini-endpoint-url').value=cfg.geminiEndpointUrl;
  if(_g('cfg-ollama-url'))_g('cfg-ollama-url').value=cfg.ollamaUrl;
  if(_g('cfg-custom-url'))_g('cfg-custom-url').value=cfg.customUrl;
  if(_g('cfg-custom-model'))_g('cfg-custom-model').value=cfg.customModel;
}

export function populateSettingsUI(){
  const t=state.t;
  _loadProviderSettings(cfg.provider);
  document.getElementById('cfg-provider').value=cfg.provider;
  const uis=document.getElementById('cfg-ui-lang');uis.innerHTML=UI_LANGS.map(l=>`<option value="${l.code}">${l.flag} ${l.label}</option>`).join('');uis.value=cfg.uiLang;
  const nls=document.getElementById('cfg-native-lang');
  nls.innerHTML=`<option value="">${t.sNativeLangAuto}</option>`+Object.entries(LANG_META).sort(([,a],[,b])=>a.name.localeCompare(b.name)).map(([k,m])=>`<option value="${k}">${m.flag} ${m.name}</option>`).join('');
  nls.value=cfg.nativeLang||'';
  const lls=document.getElementById('cfg-level-lang-select');
  lls.innerHTML=Object.entries(LANG_META).sort(([,a],[,b])=>a.native.localeCompare(b.native)).map(([k,m])=>`<option value="${k}">${m.flag} ${m.native}</option>`).join('');
  lls.value=state.currentLang;
  document.getElementById('cfg-level').value=getLangLevel(state.currentLang);
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
  const _obBanner=document.getElementById('onboarding-banner');
  if(_obBanner)_obBanner.style.display=localStorage.getItem('lt-onboarded')?'none':'flex';
  checkBackupReminder();
}

export function dismissOnboarding(){
  localStorage.setItem('lt-onboarded','1');
  const b=document.getElementById('onboarding-banner');
  if(b)b.style.display='none';
}

export function onProviderChange(p){
  _saveProviderSettings(cfg.provider);cfg.provider=p;_loadProviderSettings(p);
  rebuildModelList(p,MODELS_METADATA[p]||[]);
  document.getElementById('cfg-model').value=cfg.model;
  toggleProviderFields(p);updateApiKeyHint();updateApiKeyStatus();
  setModelHint(p);
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
  updateProviderBadge();
  if(p==='ollama')fetchAndRebuildModels();
}

export function autoSaveProviderCfg(){
  cfg.apiKey=(document.getElementById('cfg-apikey')?.value||'').trim();
  cfg.model=document.getElementById('cfg-model')?.value||cfg.model;
  cfg.anthropicProxyUrl=(document.getElementById('cfg-anthropic-proxy-url')?.value||'').trim();
  cfg.openaiEndpointUrl=(document.getElementById('cfg-openai-endpoint-url')?.value||'').trim();
  cfg.openaiAuthHeader=document.getElementById('cfg-openai-auth-header')?.value||'bearer';
  cfg.geminiEndpointUrl=(document.getElementById('cfg-gemini-endpoint-url')?.value||'').trim();
  cfg.ollamaUrl=(document.getElementById('cfg-ollama-url')?.value||'').trim()||'http://localhost:11434';
  cfg.customUrl=(document.getElementById('cfg-custom-url')?.value||'').trim();
  cfg.customModel=(document.getElementById('cfg-custom-model')?.value||'').trim();
  _saveProviderSettings(cfg.provider);
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
  updateProviderBadge();
  updateApiKeyStatus();
}

export function onLevelChange(val){const lang=document.getElementById('cfg-level-lang-select').value;langLevels[lang]=val;localStorage.setItem('lt-levels',JSON.stringify(langLevels));}
export function onFeedbackStyleChange(val){cfg.feedbackStyle=val;localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
export function onNativeLangChange(val){cfg.nativeLang=val;localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
export function onFontSizeChange(val){cfg.fontSize=val;applyFontSize(val);localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
export function onThemeChange(val){cfg.theme=val;applyTheme();localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
export function onDefaultViewChange(val){cfg.defaultView=val;localStorage.setItem('lt-cfg',JSON.stringify(cfg));}
export function onCustomInstructionsChange(val){cfg.customInstructions=val.trim();localStorage.setItem('lt-cfg',JSON.stringify(cfg));}

export function rebuildModelList(p,models){
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

export function setModelHint(p){
  const t=state.t;
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

export async function fetchModels(provider,apiKey,ollamaUrl){
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
    const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=50',{headers:{'x-goog-api-key':apiKey}});
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

export async function fetchAndRebuildModels(){
  const t=state.t;
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

export function toggleAdvancedFields(open){
  document.getElementById('advanced-fields').style.display=open?'':'none';
}

export function toggleProviderFields(p){
  const isOllama=p==='ollama',isCustom=p==='custom',isAnthropic=p==='anthropic',isOpenAI=p==='openai',isGemini=p==='gemini';
  const hasAdvanced=isAnthropic||isOpenAI||isGemini;
  document.getElementById('field-apikey').style.display='';
  document.getElementById('field-advanced').style.display=hasAdvanced?'':'none';
  document.getElementById('field-anthropic-proxy-url').style.display=isAnthropic?'':'none';
  document.getElementById('field-openai-endpoint-url').style.display=isOpenAI?'':'none';
  document.getElementById('field-openai-auth-header').style.display=isOpenAI?'':'none';
  document.getElementById('field-gemini-endpoint-url').style.display=isGemini?'':'none';
  document.getElementById('field-ollama-url').style.display=isOllama?'':'none';
  document.getElementById('field-custom-url').style.display=isCustom?'':'none';
  document.getElementById('field-custom-model').style.display=isCustom?'':'none';
  document.getElementById('field-model-select').style.display=isCustom?'none':'';
  const hasValue=(isAnthropic&&!!cfg.anthropicProxyUrl)||(isOpenAI&&(!!cfg.openaiEndpointUrl||cfg.openaiAuthHeader!=='bearer'))||(isGemini&&!!cfg.geminiEndpointUrl);
  document.getElementById('cfg-advanced').checked=hasValue;
  document.getElementById('advanced-fields').style.display=hasValue?'':'none';
}

export function updateApiKeyStatus(){
  const t=state.t;
  const el=document.getElementById('apikey-status');
  if(cfg.provider==='custom'){el.textContent='';return;}
  const k=document.getElementById('cfg-apikey')?.value||cfg.apiKey||'';
  if(cfg.provider==='ollama'){el.innerHTML=k.length>0?`<span class="status-dot status-ok"></span>${t.apiKeySet}`:'';return;}
  el.innerHTML=k.length>8?`<span class="status-dot status-ok"></span>${t.apiKeySet}`:`<span class="status-dot status-empty"></span>${t.noApiKey}`;
}

export function onUiLangChange(l){
  cfg.uiLang=l;state.t=I18N[l]||I18N.cs;applyI18n();localStorage.setItem('lt-cfg',JSON.stringify(cfg));
}

export function applyFontSize(size){
  const m={small:'87.5%',medium:'100%',large:'112.5%',xl:'131.25%'};
  document.documentElement.style.setProperty('--fs',m[size]||'100%');
}

export function applyTheme(){
  const th=cfg.theme||'auto';
  if(th==='auto'){document.documentElement.dataset.theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
  else{document.documentElement.dataset.theme=th;}
}

export function saveSettings(){
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
  state.t=I18N[cfg.uiLang]||I18N.cs;
  cfg.nativeLang=document.getElementById('cfg-native-lang').value;
  applyI18n();
  cfg.fontSize=document.getElementById('cfg-font-size').value;
  applyFontSize(cfg.fontSize);
  cfg.theme=document.getElementById('cfg-theme').value;
  applyTheme();
  cfg.defaultView=document.getElementById('cfg-default-view').value;
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
  updateProviderBadge();
  const t=state.t;
  const toast=document.getElementById('save-toast');
  toast.textContent=t.saveToast;toast.classList.add('visible');
  setTimeout(()=>toast.classList.remove('visible'),2000);
  updateApiKeyStatus();
}

export function updateProviderBadge(){
  const lb={anthropic:'Claude',openai:'GPT',gemini:'Gemini',ollama:'Ollama',custom:'Custom'};
  const ok=hasApiAccess();
  const text=lb[cfg.provider]||cfg.provider;
  const cls='provider-badge'+(ok?'':' warn');
  ['provider-badge','quiz-provider-badge'].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=text;el.className=cls;}});
}

export function openAdvancedSettings(){
  const mt=cfg.maxTokens||8192;
  const useProviderDefault=cfg.temperature==null;
  const temp=useProviderDefault?0.7:cfg.temperature;
  document.getElementById('cfg-adv-max-tokens').value=mt;
  document.getElementById('cfg-adv-temperature-default').checked=useProviderDefault;
  document.getElementById('cfg-adv-temperature').value=temp;
  document.getElementById('cfg-adv-temperature').disabled=useProviderDefault;
  document.getElementById('cfg-adv-temperature-val').textContent=useProviderDefault?'—':parseFloat(temp).toFixed(2);
  document.getElementById('cfg-adv-streaming-disabled').checked=!!cfg.streamingDisabled;
  const _fcs=cfg.fcSessionSize??20;document.getElementById('cfg-fc-session-size').value=_fcs;
  const _qss=cfg.quizSessionSize??10;document.getElementById('cfg-quiz-session-size').value=_qss;
  const _seb=cfg.smEasyBonus??1.0;document.getElementById('cfg-sm-easy-bonus').value=_seb;document.getElementById('cfg-sm-easy-bonus-val').textContent=parseFloat(_seb).toFixed(2);
  const _tts=cfg.ttsRate??0.9;document.getElementById('cfg-tts-rate').value=_tts;document.getElementById('cfg-tts-rate-val').textContent=parseFloat(_tts).toFixed(1);
  document.getElementById('cfg-vocab-import-dups').value=cfg.vocabImportDuplicates||'skip';
  document.getElementById('advanced-settings-overlay').classList.add('open');
}

export function closeAdvancedSettings(){
  document.getElementById('advanced-settings-overlay').classList.remove('open');
}

export function onAdvTemperatureDefaultChange(checked){
  document.getElementById('cfg-adv-temperature').disabled=checked;
  const _tv=parseFloat(document.getElementById('cfg-adv-temperature').value);
  const val=isNaN(_tv)?0.7:_tv;
  document.getElementById('cfg-adv-temperature-val').textContent=checked?'—':val.toFixed(2);
}

export function saveAdvancedSettings(){
  const t=state.t;
  const mt=parseInt(document.getElementById('cfg-adv-max-tokens').value,10);
  cfg.maxTokens=(!isNaN(mt)&&mt>=128&&mt<=8192)?mt:8192;
  const useProviderDefault=document.getElementById('cfg-adv-temperature-default').checked;
  const _t=parseFloat(document.getElementById('cfg-adv-temperature').value);
  cfg.temperature=useProviderDefault?null:Math.min(1,Math.max(0,isNaN(_t)?0.7:_t));
  cfg.streamingDisabled=document.getElementById('cfg-adv-streaming-disabled').checked;
  const _fcsv=parseInt(document.getElementById('cfg-fc-session-size').value,10);cfg.fcSessionSize=(!isNaN(_fcsv)&&_fcsv>=5&&_fcsv<=50)?_fcsv:20;
  const _qssv=parseInt(document.getElementById('cfg-quiz-session-size').value,10);cfg.quizSessionSize=(!isNaN(_qssv)&&_qssv>=5&&_qssv<=30)?_qssv:10;
  const _sebv=parseFloat(document.getElementById('cfg-sm-easy-bonus').value);cfg.smEasyBonus=(!isNaN(_sebv)&&_sebv>=1.0&&_sebv<=1.5)?_sebv:1.0;
  const _ttsv=parseFloat(document.getElementById('cfg-tts-rate').value);cfg.ttsRate=(!isNaN(_ttsv)&&_ttsv>=0.5&&_ttsv<=1.5)?_ttsv:0.9;
  cfg.vocabImportDuplicates=document.getElementById('cfg-vocab-import-dups').value;
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
  closeAdvancedSettings();
  const toast=document.getElementById('save-toast');
  toast.textContent=t.saveToast;toast.classList.add('visible');
  setTimeout(()=>toast.classList.remove('visible'),2000);
}

export function resetAdvancedSettings(){
  cfg.maxTokens=8192;cfg.temperature=null;cfg.streamingDisabled=false;
  cfg.fcSessionSize=20;cfg.quizSessionSize=10;cfg.smEasyBonus=1.0;cfg.ttsRate=0.9;cfg.vocabImportDuplicates='skip';
  document.getElementById('cfg-adv-max-tokens').value=8192;
  document.getElementById('cfg-adv-temperature-default').checked=true;
  document.getElementById('cfg-adv-temperature').value=0.7;
  document.getElementById('cfg-adv-temperature').disabled=true;
  document.getElementById('cfg-adv-temperature-val').textContent='—';
  document.getElementById('cfg-adv-streaming-disabled').checked=false;
  document.getElementById('cfg-fc-session-size').value=20;
  document.getElementById('cfg-quiz-session-size').value=10;
  document.getElementById('cfg-sm-easy-bonus').value=1.0;document.getElementById('cfg-sm-easy-bonus-val').textContent='1.00';
  document.getElementById('cfg-tts-rate').value=0.9;document.getElementById('cfg-tts-rate-val').textContent='0.9';
  document.getElementById('cfg-vocab-import-dups').value='skip';
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
}

export const _SETTINGS_KEYS=['lt-backup-dismissed','lt-backup-last-count','lt-backup-reminder-on','lt-cfg','lt-lang','lt-levels','lt-onboarded','lt-pwa-dismissed'];

function _getAllSettings(){
  const excluded=['lt-vocab-','lt-tips-'];
  const keySet=new Set(_SETTINGS_KEYS);
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('lt-')&&!excluded.some(p=>k.startsWith(p)))keySet.add(k);}
  const data={};
  [...keySet].sort().forEach(k=>{const raw=localStorage.getItem(k);if(raw===null){data[k]=null;return;}try{data[k]=JSON.parse(raw);}catch{data[k]=raw;}});
  return data;
}

export function openCfgEditor(){
  closeAdvancedSettings();
  document.getElementById('cfg-editor-textarea').value=JSON.stringify(_getAllSettings(),null,2);
  document.getElementById('cfg-editor-error').style.display='none';
  document.getElementById('cfg-editor-overlay').classList.add('open');
}

export function closeCfgEditor(){
  document.getElementById('cfg-editor-overlay').classList.remove('open');
}

export function saveCfgEditor(){
  const t=state.t;
  const ta=document.getElementById('cfg-editor-textarea');
  const errEl=document.getElementById('cfg-editor-error');
  let parsed;
  try{parsed=JSON.parse(ta.value);}catch(e){errEl.textContent=(t.cfgEditorError||'Neplatný JSON:')+' '+e.message;errEl.style.display='';return;}
  const originalKeys=Object.keys(_getAllSettings());
  Object.entries(parsed).forEach(([k,v])=>{if(v===null){localStorage.removeItem(k);}else{localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v));}});
  originalKeys.filter(k=>!(k in parsed)).forEach(k=>localStorage.removeItem(k));
  let savedCfg;try{savedCfg=JSON.parse(localStorage.getItem('lt-cfg')||'{}');}catch{savedCfg={};}
  Object.keys(cfg).forEach(k=>delete cfg[k]);
  Object.assign(cfg,defaultCfg());
  safeAssign(cfg,savedCfg);
  if(!cfg.providerSettings||typeof cfg.providerSettings!=='object')cfg.providerSettings={};
  Object.keys(DEFAULT_PROVIDER_SETTINGS).forEach(p=>{if(!cfg.providerSettings[p])cfg.providerSettings[p]={...DEFAULT_PROVIDER_SETTINGS[p]};});
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
  // lt-levels a lt-lang se musí znovu načíst z právě přepsaného localStorage,
  // jinak je příští uložení tiše přepíše starou kopií z paměti
  Object.keys(langLevels).forEach(k=>delete langLevels[k]);
  try{safeAssign(langLevels,JSON.parse(localStorage.getItem('lt-levels')||'{}'));}catch{}
  const _sl=localStorage.getItem('lt-lang');
  if(_sl&&LANG_META[_sl]){state.currentLang=_sl;state.vocabLang=_sl;state.tipsLang=_sl;syncLangSelectors(_sl);}
  state.t=I18N[cfg.uiLang]||I18N.cs;
  closeCfgEditor();
  applyFontSize(cfg.fontSize||'medium');
  applyTheme();
  applyI18n();
  populateSettingsUI();
  const toast=document.getElementById('save-toast');
  toast.textContent=state.t.saveToast;toast.classList.add('visible');
  setTimeout(()=>toast.classList.remove('visible'),2000);
}

export function exportAll(){
  const t=state.t;
  const _hasKey=cfg.apiKey&&cfg.apiKey.length>8||Object.values(cfg.providerSettings||{}).some(ps=>ps.apiKey&&ps.apiKey.length>8);
  if(_hasKey&&!confirm(t.sExportApiKeyWarning))return;
  const data={version:2,cfg,langLevels,vocab:{},tips:{},exported:new Date().toISOString()};
  Object.keys(LANG_META).forEach(l=>{const v=getVocab(l);if(v.length)data.vocab[l]=v;const tp=getSavedTips(l);if(tp.length)data.tips[l]=tp;});
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`langtutor-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();
  const _ak=document.getElementById('cfg-apikey');if(_ak)_ak.value=cfg.apiKey||'';
  localStorage.setItem('lt-backup-last-count',String(getTotalVocabCount()));
  localStorage.removeItem('lt-backup-dismissed');
  const _brb=document.getElementById('backup-reminder-banner');if(_brb)_brb.style.display='none';
  _setBackupBadge(false);
}

export function getTotalVocabCount(){return Object.keys(LANG_META).reduce((sum,l)=>sum+getVocab(l).length,0);}

function _setBackupBadge(visible){const b=document.getElementById('backup-badge');if(b)b.style.display=visible?'':'none';}

export function checkBackupReminder(){
  const t=state.t;
  const el=document.getElementById('backup-reminder-banner');
  if(localStorage.getItem('lt-backup-reminder-on')==='false'){if(el)el.style.display='none';_setBackupBadge(false);return;}
  const lastCount=parseInt(localStorage.getItem('lt-backup-last-count')||'0',10);
  const newWords=getTotalVocabCount()-lastCount;
  if(newWords<20){if(el)el.style.display='none';_setBackupBadge(false);return;}
  const dismissed=parseInt(localStorage.getItem('lt-backup-dismissed')||'0',10);
  if(dismissed&&Date.now()-dismissed<14*24*60*60*1000){if(el)el.style.display='none';_setBackupBadge(false);return;}
  _setBackupBadge(true);
  if(!el)return;
  document.getElementById('backup-reminder-text').textContent=t.backupReminderTextFn(newWords);
  el.style.display='';
}

export function dismissBackupReminder(){
  localStorage.setItem('lt-backup-dismissed',String(Date.now()));
  document.getElementById('backup-reminder-banner').style.display='none';
  _setBackupBadge(false);
}

export function disableBackupReminder(){
  localStorage.setItem('lt-backup-reminder-on','false');
  document.getElementById('backup-reminder-banner').style.display='none';
  _setBackupBadge(false);
}

export function importAll(){
  document.getElementById('backup-import-text').value='';
  document.getElementById('backup-import-modal').classList.add('open');
}

export function closeBackupModal(){document.getElementById('backup-import-modal').classList.remove('open');}
export function closeBackupModalOutside(e){if(e.target===document.getElementById('backup-import-modal'))closeBackupModal();}

export function loadBackupFile(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{document.getElementById('backup-import-text').value=ev.target.result;};
  r.readAsText(f);
  e.target.value='';
}

export function confirmBackupImport(){
  const t=state.t;
  const raw=document.getElementById('backup-import-text').value.trim();
  if(!raw)return;
  let data;
  try{data=JSON.parse(raw);}catch{alert(t.alertInvalidJson);return;}
  closeBackupModal();
  try{applyBackup(data);}catch(e){alert(`${t.errGeneric} ${e.message}`);}
}

// Adresy, na které llm.js odesílá API klíče — jejich změnu při importu zálohy musí uživatel potvrdit
function _collectEndpointUrls(c){
  const urls={};
  if(!c||typeof c!=='object')return urls;
  ['anthropicProxyUrl','openaiEndpointUrl','geminiEndpointUrl','ollamaUrl','customUrl'].forEach(k=>{if(c[k])urls[k]=String(c[k]);});
  const ps=c.providerSettings;
  if(ps&&typeof ps==='object')Object.keys(ps).forEach(p=>{const s=ps[p];if(s&&typeof s==='object')['proxyUrl','endpointUrl','url'].forEach(k=>{if(s[k])urls[`${p}.${k}`]=String(s[k]);});});
  return urls;
}

export function applyBackup(data){
  if(data.cfg){
    const cur=_collectEndpointUrls(cfg);
    const changed=Object.entries(_collectEndpointUrls(data.cfg)).filter(([k,v])=>v!==(cur[k]||''));
    if(changed.length&&!confirm(state.t.sImportUrlWarningFn(changed.map(([k,v])=>`${k}: ${v}`).join('\n'))))return;
    safeAssign(cfg,data.cfg);
  }
  if(data.langLevels)safeAssign(langLevels,data.langLevels);
  Object.keys(DEFAULT_PROVIDER_SETTINGS).forEach(p=>{if(!cfg.providerSettings||typeof cfg.providerSettings!=='object')cfg.providerSettings={};if(!cfg.providerSettings[p])cfg.providerSettings[p]={...DEFAULT_PROVIDER_SETTINGS[p]};});
  if(data.vocab)Object.keys(data.vocab).forEach(l=>{if(LANG_META[l]&&Array.isArray(data.vocab[l]))setVocab(l,data.vocab[l]);});
  if(data.tips)Object.keys(data.tips).forEach(l=>{if(LANG_META[l]&&Array.isArray(data.tips[l]))setSavedTips(l,data.tips[l]);});
  localStorage.setItem('lt-cfg',JSON.stringify(cfg));
  localStorage.setItem('lt-levels',JSON.stringify(langLevels));
  localStorage.setItem('lt-backup-last-count',String(getTotalVocabCount()));
  localStorage.removeItem('lt-backup-dismissed');
  state.t=I18N[cfg.uiLang]||I18N.cs;
  applyFontSize(cfg.fontSize||'medium');applyTheme();
  applyI18n();populateSettingsUI();updateProviderBadge();
  alert(state.t.alertBackupRestored);
}

export function clearData(){
  const t=state.t;
  if(!confirm(t.clearConfirm))return;localStorage.clear();location.reload();
}
