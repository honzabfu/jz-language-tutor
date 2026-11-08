// Seznam modelů, ceny a doporučení: naposledy revidováno 2026-10-07.
// Revidovat zhruba čtvrtletně — postup viz CLAUDE.md → „Model list review“.
// minReasoning: nejnižší úroveň přemýšlení, kterou model přijme (Anthropic output_config.effort,
// OpenAI reasoning_effort, Gemini thinkingConfig.thinkingLevel). Chybí → model bez parametru
// nepřemýšlí nebo ho nepodporuje (Haiku 4.5, Gemini 3.1 Flash-Lite) a neposílá se nic.
export const MODELS_METADATA={
  anthropic:[
    {id:'claude-haiku-4-5-20251001',name:'Claude Haiku 4.5',tier:'budget',capability:'general',speed:'fast',recommended:true,costEstimate:{input:1,output:5},features:['200K context','fast']},
    {id:'claude-sonnet-5-5',name:'Claude Sonnet 5.5',tier:'standard',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:2,output:10},features:['1M context','balanced'],minReasoning:'low'},
    {id:'claude-opus-5-5',name:'Claude Opus 5.5',tier:'premium',capability:'advanced',speed:'slow',recommended:true,costEstimate:{input:4,output:20},features:['1M context','most capable'],minReasoning:'low'}
  ],
  openai:[
    {id:'gpt-6-luna',name:'GPT-6 Luna',tier:'budget',capability:'general',speed:'fast',recommended:true,costEstimate:{input:0.1,output:0.5},features:['ultra-cheap','fast'],minReasoning:'none'},
    {id:'gpt-6.1-sol',name:'GPT-6.1 Sol',tier:'standard',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:2,output:10},features:['balanced'],minReasoning:'low'},
    {id:'gpt-6-astra',name:'GPT-6 Astra',tier:'premium',capability:'advanced',speed:'slow',recommended:false,costEstimate:{input:10,output:50},features:['most capable'],minReasoning:'low'}
  ],
  gemini:[
    {id:'gemini-3.1-flash-lite',name:'Gemini 3.1 Flash-Lite',tier:'budget',capability:'general',speed:'fast',recommended:true,costEstimate:{input:0.25,output:1.5},features:['ultra-cheap','fast']},
    {id:'gemini-3.5-flash-lite',name:'Gemini 3.5 Flash-Lite',tier:'budget',capability:'general',speed:'fast',recommended:false,costEstimate:{input:0.3,output:2.5},features:['cheap','fast'],minReasoning:'minimal'},
    {id:'gemini-3.8-flash',name:'Gemini 3.8 Flash',tier:'standard',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:0.75,output:3.75},features:['newest','balanced'],minReasoning:'low'}
  ],
  ollama:[
    {id:'gemma3',name:'Gemma 3',tier:'budget',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:0,output:0},features:['local','free','multilingual']},
    {id:'qwen2.5',name:'Qwen 2.5',tier:'budget',capability:'general',speed:'balanced',recommended:true,costEstimate:{input:0,output:0},features:['local','free','multilingual']},
    {id:'llama3.2',name:'Llama 3.2',tier:'budget',capability:'general',speed:'fast',recommended:false,costEstimate:{input:0,output:0},features:['local','free','small']},
    {id:'mistral',name:'Mistral',tier:'budget',capability:'general',speed:'fast',recommended:false,costEstimate:{input:0,output:0},features:['local','free']}
  ],
  custom:[]
};

function getModelsForProvider(provider){
  return (MODELS_METADATA[provider]||[]).map(m=>m.id);
}

export const MODELS={
  anthropic:getModelsForProvider('anthropic'),
  openai:getModelsForProvider('openai'),
  gemini:getModelsForProvider('gemini'),
  ollama:getModelsForProvider('ollama'),
  custom:[]
};

export const DEFAULT_PROVIDER_SETTINGS={
  anthropic: {apiKey:'',model:''},
  openai:    {apiKey:'',model:''},
  gemini:    {apiKey:'',model:''},
  ollama:    {apiKey:'',model:'',url:'http://localhost:11434'},
  custom:    {apiKey:'',model:'',url:''},
};

export const LANG_META={
  bulgarian:  {name:'Bulgarian',  native:'Български',   flag:'🇧🇬', lang:'bg'},
  croatian:   {name:'Croatian',   native:'Hrvatski',    flag:'🇭🇷', lang:'hr'},
  czech:      {name:'Czech',      native:'Čeština',     flag:'🇨🇿', lang:'cs'},
  danish:     {name:'Danish',     native:'Dansk',       flag:'🇩🇰', lang:'da'},
  dutch:      {name:'Dutch',      native:'Nederlands',  flag:'🇳🇱', lang:'nl'},
  english:    {name:'English',    native:'English',     flag:'🇬🇧', lang:'en'},
  estonian:   {name:'Estonian',   native:'Eesti',       flag:'🇪🇪', lang:'et'},
  finnish:    {name:'Finnish',    native:'Suomi',       flag:'🇫🇮', lang:'fi'},
  french:     {name:'French',     native:'Français',    flag:'🇫🇷', lang:'fr'},
  german:     {name:'German',     native:'Deutsch',     flag:'🇩🇪', lang:'de'},
  greek:      {name:'Greek',      native:'Ελληνικά',    flag:'🇬🇷', lang:'el'},
  hungarian:  {name:'Hungarian',  native:'Magyar',      flag:'🇭🇺', lang:'hu'},
  italian:    {name:'Italian',    native:'Italiano',    flag:'🇮🇹', lang:'it'},
  latvian:    {name:'Latvian',    native:'Latviešu',    flag:'🇱🇻', lang:'lv'},
  lithuanian: {name:'Lithuanian', native:'Lietuvių',    flag:'🇱🇹', lang:'lt'},
  norwegian:  {name:'Norwegian',  native:'Norsk',       flag:'🇳🇴', lang:'no'},
  polish:     {name:'Polish',     native:'Polski',      flag:'🇵🇱', lang:'pl'},
  portuguese: {name:'Portuguese', native:'Português',   flag:'🇵🇹', lang:'pt'},
  romanian:   {name:'Romanian',   native:'Română',      flag:'🇷🇴', lang:'ro'},
  serbian:    {name:'Serbian',    native:'Srpski',      flag:'🇷🇸', lang:'sr'},
  slovak:     {name:'Slovak',     native:'Slovenčina',  flag:'🇸🇰', lang:'sk'},
  slovenian:  {name:'Slovenian',  native:'Slovenščina', flag:'🇸🇮', lang:'sl'},
  spanish:    {name:'Spanish',    native:'Español',     flag:'🇪🇸', lang:'es'},
  swedish:    {name:'Swedish',    native:'Svenska',     flag:'🇸🇪', lang:'sv'},
  ukrainian:  {name:'Ukrainian',  native:'Українська',  flag:'🇺🇦', lang:'uk'},
  arabic:     {name:'Arabic',     native:'العربية',     flag:'🇸🇦', lang:'ar'},
  chinese:    {name:'Chinese',    native:'中文',         flag:'🇨🇳', lang:'zh'},
  hindi:      {name:'Hindi',      native:'हिन्दी',       flag:'🇮🇳', lang:'hi'},
  japanese:   {name:'Japanese',   native:'日本語',       flag:'🇯🇵', lang:'ja'},
  korean:     {name:'Korean',     native:'한국어',       flag:'🇰🇷', lang:'ko'},
  turkish:    {name:'Turkish',    native:'Türkçe',      flag:'🇹🇷', lang:'tr'},
};

export const UI_LANGS=[{code:'cs',flag:'🇨🇿',label:'Čeština'},{code:'en',flag:'🇬🇧',label:'English'},{code:'es',flag:'🇪🇸',label:'Español'}];
export const SORT_MODES=['alpha','due','new'];
export const UI_LANG_NATIVE_FALLBACK={cs:'czech',en:'english',es:'spanish'};
export const UI_LANG_LOCALE={cs:'cs-CZ',en:'en-US',es:'es-ES'};

export function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
export function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

// Object.assign pro nedůvěryhodný JSON — přeskakuje klíče, které by zasáhly prototyp
export function safeAssign(target,src){
  if(!src||typeof src!=='object')return target;
  for(const k of Object.keys(src)){
    if(k==='__proto__'||k==='constructor'||k==='prototype')continue;
    target[k]=src[k];
  }
  return target;
}

export function renderMarkdown(text){
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
