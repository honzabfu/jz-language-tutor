export const MODELS_METADATA={
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

export function getModelsForProvider(provider){
  return (MODELS_METADATA[provider]||[]).map(m=>m.id);
}
export function getModelMetadata(id){
  for(const provider of Object.keys(MODELS_METADATA)){
    const model=MODELS_METADATA[provider].find(m=>m.id===id);
    if(model)return{...model,provider};
  }
  return null;
}
export function getModelsByTier(provider,tier){
  return (MODELS_METADATA[provider]||[]).filter(m=>m.tier===tier).map(m=>m.id);
}
export function getModelsByCapability(provider,capability){
  return (MODELS_METADATA[provider]||[]).filter(m=>m.capability===capability).map(m=>m.id);
}
export function getRecommendedModels(provider){
  return (MODELS_METADATA[provider]||[]).filter(m=>m.recommended).map(m=>m.id);
}
export function getModelsForLevel(provider,level){
  const all=(MODELS_METADATA[provider]||[]);
  const tierFilter=level==='advanced'?['budget','standard','premium']
                   :level==='intermediate'?['budget','standard']
                   :['budget'];
  return all.filter(m=>tierFilter.includes(m.tier)&&m.recommended).map(m=>m.id);
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

export function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
export function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

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
