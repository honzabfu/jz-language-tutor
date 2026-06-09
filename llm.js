import { state } from './state.js';

const { cfg } = state;

export function clean(s){s=(s||'').trim();s=s.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();if(!s.startsWith('{')){const m=s.match(/\{[\s\S]*\}/);if(m)s=m[0];}return s;}
export async function httpErr(res){if(res.status===401)throw new Error('ERR_401');if(res.status===429)throw new Error('ERR_429');if(res.status>=500)throw new Error('ERR_500');throw new Error(await res.text());}
export function resolveErr(err){console.error('[LLM error]',err);const t=state.t;const m=err.message;if(m==='NO_KEY')return t.errNoKey;if(m==='ERR_401')return t.err401;if(m==='ERR_429')return t.err429;if(m==='ERR_500')return t.err500;if(m==='MAX_TOKENS')return t.errMaxTokens;if(m?.includes('fetch')||m==='Load failed'||m?.includes('NetworkError')||m?.includes('Failed'))return t.errNetwork;return`${t.errGeneric} ${m}`;}
export function abortPending(){if(state._abortCtrl){state._abortCtrl.abort();state._abortCtrl=null;}}

export async function safeLLM(msgs,sys,maxTokens=1024,signal){
  if(cfg.provider==='anthropic')return callAnthropic(msgs,sys,maxTokens,signal);
  if(cfg.provider==='openai')return callOpenAI(msgs,sys,maxTokens,signal);
  if(cfg.provider==='gemini')return callGemini(msgs,sys,maxTokens,signal);
  if(cfg.provider==='ollama')return callOllama(msgs,sys,signal);
  if(cfg.provider==='custom')return callCustom(msgs,sys,maxTokens,signal);
  throw new Error('Unknown provider');
}

export async function callAnthropic(msgs,sys,maxTokens=1024,signal){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const filteredMsgs=msgs.filter(m=>m.role==='user'||m.role==='assistant');
  const _aps=cfg.providerSettings.anthropic||{};
  const url=_aps.proxyUrl||'https://api.anthropic.com/v1/messages';
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-api-key':cfg.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:cfg.model,max_tokens:maxTokens,...(cfg.temperature!=null?{temperature:cfg.temperature}:{}),system:sys||undefined,messages:filteredMsgs}),signal});
  if(!res.ok)await httpErr(res);
  const d1=await res.json();
  if(d1.stop_reason==='max_tokens')throw new Error('MAX_TOKENS');
  return d1.content[0].text;
}
export async function callOpenAI(msgs,sys,maxTokens=1024,signal){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const _ops=cfg.providerSettings.openai||{};
  const _oaiUrl=_ops.endpointUrl||'https://api.openai.com/v1/chat/completions';
  const _oaiAuth=_ops.authHeader==='api-key'?{'api-key':cfg.apiKey}:{'Authorization':`Bearer ${cfg.apiKey}`};
  const res=await fetch(_oaiUrl,{method:'POST',headers:{'Content-Type':'application/json',..._oaiAuth},body:JSON.stringify({model:cfg.model,max_completion_tokens:maxTokens,...(cfg.temperature!=null?{temperature:cfg.temperature}:{}),messages:m}),signal});
  if(!res.ok)await httpErr(res);
  const d2=await res.json();
  if(d2.choices[0].finish_reason==='length')throw new Error('MAX_TOKENS');
  return d2.choices[0].message.content;
}
export async function callGemini(msgs,sys,maxTokens=1024,signal){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const gm=msgs.filter(x=>x.role==='user'||x.role==='assistant').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
  const body={contents:gm,generationConfig:{maxOutputTokens:maxTokens,...(cfg.temperature!=null?{temperature:cfg.temperature}:{})}};
  if(sys)body.system_instruction={parts:[{text:sys}]};
  const _gps=cfg.providerSettings.gemini||{};
  const _gBase=(_gps.endpointUrl||'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/,'');
  const res=await fetch(`${_gBase}/models/${cfg.model}:generateContent?key=${cfg.apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  if(!res.ok)await httpErr(res);
  const data=await res.json();
  if(data.candidates?.[0]?.finishReason==='MAX_TOKENS')throw new Error('MAX_TOKENS');
  const text=data.candidates?.[0]?.content?.parts?.[0]?.text;
  if(text==null){const reason=data.candidates?.[0]?.finishReason||data.promptFeedback?.blockReason||'empty response';throw new Error(reason);}
  return text;
}
export async function callOllama(msgs,sys,signal){
  const base=(cfg.ollamaUrl||'http://localhost:11434').replace(/\/$/,'');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const headers={'Content-Type':'application/json'};
  if(cfg.apiKey)headers['Authorization']=`Bearer ${cfg.apiKey}`;
  const res=await fetch(`${base}/api/chat`,{method:'POST',headers,body:JSON.stringify({model:cfg.model,stream:false,...(cfg.temperature!=null?{options:{temperature:cfg.temperature}}:{}),messages:m}),signal});
  if(!res.ok)await httpErr(res);
  return(await res.json()).message.content;
}
export async function callCustom(msgs,sys,maxTokens=1024,signal){
  const base=(cfg.customUrl||'').replace(/\/$/,'');
  if(!base||!cfg.customModel)throw new Error('NO_KEY');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const headers={'Content-Type':'application/json'};
  if(cfg.apiKey)headers['Authorization']=`Bearer ${cfg.apiKey}`;
  const res=await fetch(`${base}/chat/completions`,{method:'POST',headers,body:JSON.stringify({model:cfg.customModel,max_tokens:maxTokens,...(cfg.temperature!=null?{temperature:cfg.temperature}:{}),messages:m}),signal});
  if(!res.ok)await httpErr(res);
  const d3=await res.json();
  if(d3.choices[0].finish_reason==='length')throw new Error('MAX_TOKENS');
  return d3.choices[0].message.content;
}

// ── STREAMING PROVIDERS ──

export async function readSSE(response,onData){
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
      await new Promise(r=>setTimeout(r,0));
    }
  }
}
export async function callAnthropicStream(msgs,sys,maxTokens,signal,onChunk){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const filteredMsgs=msgs.filter(m=>m.role==='user'||m.role==='assistant');
  const _aps=cfg.providerSettings.anthropic||{};
  const url=_aps.proxyUrl||'https://api.anthropic.com/v1/messages';
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-api-key':cfg.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:cfg.model,max_tokens:maxTokens,...(cfg.temperature!=null?{temperature:cfg.temperature}:{}),stream:true,system:sys||undefined,messages:filteredMsgs}),signal});
  if(!res.ok)await httpErr(res);
  let full='';
  await readSSE(res,data=>{if(data.type==='content_block_delta'&&data.delta?.text){onChunk(data.delta.text);full+=data.delta.text;}});
  return full;
}
export async function callOpenAIStream(msgs,sys,maxTokens,signal,onChunk){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const _ops=cfg.providerSettings.openai||{};
  const _oaiUrl=_ops.endpointUrl||'https://api.openai.com/v1/chat/completions';
  const _oaiAuth=_ops.authHeader==='api-key'?{'api-key':cfg.apiKey}:{'Authorization':`Bearer ${cfg.apiKey}`};
  const res=await fetch(_oaiUrl,{method:'POST',headers:{'Content-Type':'application/json',..._oaiAuth},body:JSON.stringify({model:cfg.model,max_completion_tokens:maxTokens,...(cfg.temperature!=null?{temperature:cfg.temperature}:{}),stream:true,messages:m}),signal});
  if(!res.ok)await httpErr(res);
  let full='';
  await readSSE(res,data=>{const text=data.choices?.[0]?.delta?.content;if(text){onChunk(text);full+=text;}});
  return full;
}
export async function callGeminiStream(msgs,sys,maxTokens,signal,onChunk){
  if(!cfg.apiKey)throw new Error('NO_KEY');
  const gm=msgs.filter(x=>x.role==='user'||x.role==='assistant').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
  const body={contents:gm,generationConfig:{maxOutputTokens:maxTokens,...(cfg.temperature!=null?{temperature:cfg.temperature}:{})}};
  if(sys)body.system_instruction={parts:[{text:sys}]};
  const _gps=cfg.providerSettings.gemini||{};
  const _gBase=(_gps.endpointUrl||'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/,'');
  const res=await fetch(`${_gBase}/models/${cfg.model}:streamGenerateContent?key=${cfg.apiKey}&alt=sse`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  if(!res.ok)await httpErr(res);
  let full='';
  await readSSE(res,data=>{const text=data.candidates?.[0]?.content?.parts?.[0]?.text;if(text){onChunk(text);full+=text;}});
  return full;
}
export async function callOllamaStream(msgs,sys,signal,onChunk){
  const base=(cfg.ollamaUrl||'http://localhost:11434').replace(/\/$/,'');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const headers={'Content-Type':'application/json'};
  if(cfg.apiKey)headers['Authorization']=`Bearer ${cfg.apiKey}`;
  const res=await fetch(`${base}/api/chat`,{method:'POST',headers,body:JSON.stringify({model:cfg.model,stream:true,...(cfg.temperature!=null?{options:{temperature:cfg.temperature}}:{}),messages:m}),signal});
  if(!res.ok)await httpErr(res);
  const reader=res.body.getReader();
  const decoder=new TextDecoder();
  let buf='',full='';
  while(true){
    const{done,value}=await reader.read();
    if(done)break;
    buf+=decoder.decode(value,{stream:true});
    const lines=buf.split('\n');buf=lines.pop();
    for(const line of lines){
      if(!line.trim())continue;
      try{const data=JSON.parse(line);const text=data.message?.content;if(text){onChunk(text);full+=text;}if(data.done)return full;}catch{}
    }
  }
  return full;
}
export async function callCustomStream(msgs,sys,maxTokens,signal,onChunk){
  const base=(cfg.customUrl||'').replace(/\/$/,'');
  if(!base||!cfg.customModel)throw new Error('NO_KEY');
  const m=sys?[{role:'system',content:sys},...msgs.filter(x=>x.role==='user'||x.role==='assistant')]:msgs.filter(x=>x.role==='user'||x.role==='assistant');
  const headers={'Content-Type':'application/json'};
  if(cfg.apiKey)headers['Authorization']=`Bearer ${cfg.apiKey}`;
  const res=await fetch(`${base}/chat/completions`,{method:'POST',headers,body:JSON.stringify({model:cfg.customModel,max_tokens:maxTokens,...(cfg.temperature!=null?{temperature:cfg.temperature}:{}),stream:true,messages:m}),signal});
  if(!res.ok)await httpErr(res);
  let full='';
  await readSSE(res,data=>{const text=data.choices?.[0]?.delta?.content;if(text){onChunk(text);full+=text;}});
  return full;
}
export async function safeLLMStream(msgs,sys,maxTokens=1024,signal,onChunk){
  if(cfg.streamingDisabled){const r=await safeLLM(msgs,sys,maxTokens,signal);onChunk(r);return r;}
  if(cfg.provider==='anthropic')return callAnthropicStream(msgs,sys,maxTokens,signal,onChunk);
  if(cfg.provider==='openai')return callOpenAIStream(msgs,sys,maxTokens,signal,onChunk);
  if(cfg.provider==='gemini')return callGeminiStream(msgs,sys,maxTokens,signal,onChunk);
  if(cfg.provider==='ollama')return callOllamaStream(msgs,sys,signal,onChunk);
  if(cfg.provider==='custom')return callCustomStream(msgs,sys,maxTokens,signal,onChunk);
  throw new Error('Unknown provider');
}
