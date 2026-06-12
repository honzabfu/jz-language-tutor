import { state } from './state.js';

const { cfg } = state;

export function clean(s){s=(s||'').trim();s=s.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();if(!s.startsWith('{')){const m=s.match(/\{[\s\S]*\}/);if(m)s=m[0];}return s;}
async function httpErr(res){if(res.status===401)throw new Error('ERR_401');if(res.status===429)throw new Error('ERR_429');if(res.status>=500)throw new Error('ERR_500');throw new Error(await res.text());}
export function resolveErr(err){console.error('[LLM error]',err);const t=state.t;const m=err.message;if(m==='NO_KEY')return t.errNoKey;if(m==='ERR_401')return t.err401;if(m==='ERR_429')return t.err429;if(m==='ERR_500')return t.err500;if(m==='MAX_TOKENS')return t.errMaxTokens;if(m?.includes('fetch')||m==='Load failed'||m?.includes('NetworkError')||m?.includes('Failed'))return t.errNetwork;return`${t.errGeneric} ${m}`;}
export function abortPending(){if(state._abortCtrl){state._abortCtrl.abort();state._abortCtrl=null;}}

// Jediné místo s pravidlem „je LLM použitelné“: ollama klíč nepotřebuje,
// custom potřebuje URL+model, ostatní klíč delší než 8 znaků
export function hasApiAccess(){
  if(cfg.provider==='ollama')return true;
  if(cfg.provider==='custom')return !!cfg.customUrl&&!!cfg.customModel;
  return !!cfg.apiKey&&cfg.apiKey.length>8;
}

const _temp=()=>cfg.temperature!=null?{temperature:cfg.temperature}:{};
const _filterMsgs=msgs=>msgs.filter(m=>m.role==='user'||m.role==='assistant');
const _withSys=(msgs,sys)=>sys?[{role:'system',content:sys},..._filterMsgs(msgs)]:_filterMsgs(msgs);

// ── PROVIDER REGISTRY ──
// request(...)  → {url, headers, body} (Content-Type doplní driver)
// parse(d)      → text non-streaming odpovědi (hází MAX_TOKENS při truncation)
// sse           → true: SSE (data: …), false: NDJSON (Ollama)
// chunk(data,out) → streaming event: out.text(t) připojí text, out.truncated/out.done flagy

const _openAiParse=d=>{if(d.choices[0].finish_reason==='length')throw new Error('MAX_TOKENS');return d.choices[0].message.content;};
const _openAiChunk=(data,out)=>{
  const text=data.choices?.[0]?.delta?.content;if(text)out.text(text);
  if(data.choices?.[0]?.finish_reason==='length')out.truncated=true;
};

const PROVIDERS={
  anthropic:{
    request(msgs,sys,maxTokens,stream){
      if(!cfg.apiKey)throw new Error('NO_KEY');
      const ps=cfg.providerSettings.anthropic||{};
      return{
        url:ps.proxyUrl||'https://api.anthropic.com/v1/messages',
        headers:{'x-api-key':cfg.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:{model:cfg.model,max_tokens:maxTokens,...(stream?{stream:true}:{}),..._temp(),system:sys||undefined,messages:_filterMsgs(msgs)}
      };
    },
    parse(d){if(d.stop_reason==='max_tokens')throw new Error('MAX_TOKENS');return d.content[0].text;},
    sse:true,
    chunk(data,out){
      if(data.type==='content_block_delta'&&data.delta?.text)out.text(data.delta.text);
      if(data.type==='message_delta'&&data.delta?.stop_reason==='max_tokens')out.truncated=true;
    }
  },
  openai:{
    request(msgs,sys,maxTokens,stream){
      if(!cfg.apiKey)throw new Error('NO_KEY');
      const ps=cfg.providerSettings.openai||{};
      return{
        url:ps.endpointUrl||'https://api.openai.com/v1/chat/completions',
        headers:ps.authHeader==='api-key'?{'api-key':cfg.apiKey}:{'Authorization':`Bearer ${cfg.apiKey}`},
        body:{model:cfg.model,max_completion_tokens:maxTokens,...(stream?{stream:true}:{}),..._temp(),messages:_withSys(msgs,sys)}
      };
    },
    parse:_openAiParse,
    sse:true,
    chunk:_openAiChunk
  },
  gemini:{
    request(msgs,sys,maxTokens,stream){
      if(!cfg.apiKey)throw new Error('NO_KEY');
      const ps=cfg.providerSettings.gemini||{};
      const base=(ps.endpointUrl||'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/,'');
      const body={contents:_filterMsgs(msgs).map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]})),generationConfig:{maxOutputTokens:maxTokens,..._temp()}};
      if(sys)body.system_instruction={parts:[{text:sys}]};
      return{
        url:`${base}/models/${cfg.model}:${stream?'streamGenerateContent?alt=sse':'generateContent'}`,
        headers:{'x-goog-api-key':cfg.apiKey},
        body
      };
    },
    parse(data){
      if(data.candidates?.[0]?.finishReason==='MAX_TOKENS')throw new Error('MAX_TOKENS');
      const text=data.candidates?.[0]?.content?.parts?.[0]?.text;
      if(text==null){const reason=data.candidates?.[0]?.finishReason||data.promptFeedback?.blockReason||'empty response';throw new Error(reason);}
      return text;
    },
    sse:true,
    chunk(data,out){
      const text=data.candidates?.[0]?.content?.parts?.[0]?.text;if(text)out.text(text);
      if(data.candidates?.[0]?.finishReason==='MAX_TOKENS')out.truncated=true;
    }
  },
  ollama:{
    request(msgs,sys,maxTokens,stream){
      const base=(cfg.ollamaUrl||'http://localhost:11434').replace(/\/$/,'');
      const headers={};
      if(cfg.apiKey)headers['Authorization']=`Bearer ${cfg.apiKey}`;
      return{
        url:`${base}/api/chat`,
        headers,
        body:{model:cfg.model,stream,options:{num_predict:maxTokens,..._temp()},messages:_withSys(msgs,sys)}
      };
    },
    parse(d){if(d.done_reason==='length')throw new Error('MAX_TOKENS');return d.message.content;},
    sse:false,
    chunk(data,out){
      const text=data.message?.content;if(text)out.text(text);
      if(data.done){out.done=true;if(data.done_reason==='length')out.truncated=true;}
    }
  },
  custom:{
    request(msgs,sys,maxTokens,stream){
      const base=(cfg.customUrl||'').replace(/\/$/,'');
      if(!base||!cfg.customModel)throw new Error('NO_KEY');
      const headers={};
      if(cfg.apiKey)headers['Authorization']=`Bearer ${cfg.apiKey}`;
      return{
        url:`${base}/chat/completions`,
        headers,
        body:{model:cfg.customModel,max_tokens:maxTokens,...(stream?{stream:true}:{}),..._temp(),messages:_withSys(msgs,sys)}
      };
    },
    parse:_openAiParse,
    sse:true,
    chunk:_openAiChunk
  }
};

// ── STREAM READERS ──
// Obě varianty po skončení streamu flushnou TextDecoder a zpracují poslední
// řádek bez koncového \n; yield (setTimeout 0) jen jednou per network chunk.

async function readSSE(response,onData){
  const reader=response.body.getReader();
  const decoder=new TextDecoder();
  let buf='';
  const handleLine=line=>{
    if(!line.startsWith('data: '))return false;
    const data=line.slice(6).trim();
    if(data==='[DONE]')return true;
    try{onData(JSON.parse(data));}catch{}
    return false;
  };
  while(true){
    const{done,value}=await reader.read();
    if(done)break;
    buf+=decoder.decode(value,{stream:true});
    const lines=buf.split('\n');
    buf=lines.pop();
    for(const line of lines)if(handleLine(line))return;
    await new Promise(r=>setTimeout(r,0));
  }
  buf+=decoder.decode();
  if(buf)handleLine(buf);
}

async function readNDJSON(response,onData){
  const reader=response.body.getReader();
  const decoder=new TextDecoder();
  let buf='';
  const handleLine=line=>{
    if(!line.trim())return false;
    try{return !!onData(JSON.parse(line));}catch{return false;}
  };
  while(true){
    const{done,value}=await reader.read();
    if(done)break;
    buf+=decoder.decode(value,{stream:true});
    const lines=buf.split('\n');
    buf=lines.pop();
    for(const line of lines)if(handleLine(line))return;
    await new Promise(r=>setTimeout(r,0));
  }
  buf+=decoder.decode();
  if(buf)handleLine(buf);
}

// ── DRIVERS ──

async function _fetchProvider(prov,msgs,sys,maxTokens,stream,signal){
  const req=prov.request(msgs,sys,maxTokens,stream);
  const res=await fetch(req.url,{method:'POST',headers:{'Content-Type':'application/json',...req.headers},body:JSON.stringify(req.body),signal});
  if(!res.ok)await httpErr(res);
  return res;
}

export async function safeLLM(msgs,sys,maxTokens=1024,signal){
  const prov=PROVIDERS[cfg.provider];
  if(!prov)throw new Error('Unknown provider');
  const res=await _fetchProvider(prov,msgs,sys,maxTokens,false,signal);
  return prov.parse(await res.json());
}

export async function safeLLMStream(msgs,sys,maxTokens=1024,signal,onChunk){
  if(cfg.streamingDisabled){const r=await safeLLM(msgs,sys,maxTokens,signal);onChunk(r);return r;}
  const prov=PROVIDERS[cfg.provider];
  if(!prov)throw new Error('Unknown provider');
  const res=await _fetchProvider(prov,msgs,sys,maxTokens,true,signal);
  let full='';
  const out={truncated:false,done:false,text(t){onChunk(t);full+=t;}};
  if(prov.sse)await readSSE(res,data=>prov.chunk(data,out));
  else await readNDJSON(res,data=>{prov.chunk(data,out);return out.done;});
  if(out.truncated)throw new Error('MAX_TOKENS');
  return full;
}
