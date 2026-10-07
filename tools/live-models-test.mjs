// Živý test modelů z MODELS_METADATA proti skutečným API (pro revizi seznamu modelů).
// Použití (z kořene repa):  node tools/live-models-test.mjs <záloha.json> [provider…]
// Klíče se čtou ze zálohy aplikace (Nastavení → Export zálohy) z cfg.providerSettings,
// nikam se neukládají ani nevypisují. Každý model: odpověď najednou i stream,
// minimální i plné přemýšlení. Volání stojí jednotky centů.
// Složka tools/ se nenasazuje (deploy kopíruje jen soubory z kořene).
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const [backupPath,...only]=process.argv.slice(2);
if(!backupPath){console.log('Použití: node tools/live-models-test.mjs <záloha.json> [anthropic|openai|gemini|custom …]');process.exit(1);}

globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
Object.defineProperty(globalThis,'navigator',{value:{language:'cs'},configurable:true});
const root=pathToFileURL(resolve('.'))+'/';
const ps=JSON.parse(readFileSync(backupPath,'utf8')).cfg?.providerSettings||{};
const {state}=await import(root+'state.js');
const {I18N}=await import(root+'i18n.js');state.t=I18N.cs;
const {MODELS_METADATA}=await import(root+'constants.js');
const llm=await import(root+'llm.js');
const cfg=state.cfg;cfg.providerSettings={};
console.error=()=>{};

// Zachytit spotřebu tokenů u nestreamovaných odpovědí
const realFetch=globalThis.fetch;let usage=null;
globalThis.fetch=async(u,o)=>{
  const body=JSON.parse(o.body);const r=await realFetch(u,o);
  if(r.ok&&!body.stream&&!String(u).includes('streamGenerate')){
    const j=await r.clone().json();
    usage=j.usage?.output_tokens!=null?`out=${j.usage.output_tokens}`
      :j.usage?.completion_tokens!=null?`out=${j.usage.completion_tokens} reasoning=${j.usage.completion_tokens_details?.reasoning_tokens??'?'}`
      :j.usageMetadata?`out=${j.usageMetadata.candidatesTokenCount} thoughts=${j.usageMetadata.thoughtsTokenCount??0}`:null;
  }
  return r;
};

const msgs=[{role:'user',content:"Přelož do španělštiny 'dobrý den, jak se máte?'. Odpověz jen překladem."}];
const sys='You are a concise language tutor.';
let fails=0;
async function one(label,stream){
  usage=null;const t0=Date.now();const s=()=>((Date.now()-t0)/1000).toFixed(1)+'s';
  try{
    const txt=stream?await llm.safeLLMStream(msgs,sys,2048,undefined,()=>{}):await llm.safeLLM(msgs,sys,2048);
    console.log(`${label} ✓ ${s()} ${usage?'['+usage+'] ':''}→ ${JSON.stringify(txt.trim().slice(0,60))}`);
  }catch(e){fails++;console.log(`${label} ✗ ${s()} ${String(e.message).slice(0,200)}`);}
}

const want=p=>!only.length||only.includes(p);
for(const p of ['anthropic','openai','gemini']){
  if(!want(p))continue;
  if(!ps[p]?.apiKey){console.log(`${p}: v záloze chybí API klíč, přeskakuji`);continue;}
  cfg.provider=p;cfg.apiKey=ps[p].apiKey;
  for(const m of MODELS_METADATA[p]){
    cfg.model=m.id;
    for(const full of [false,true]){
      cfg.fullReasoning=full;
      const tag=`${m.id.padEnd(26)} ${full?'full':'min '}`;
      await one(tag+' sync  ',false);
      await one(tag+' stream',true);
    }
  }
}
if(want('custom')&&ps.custom?.url&&ps.custom?.model){
  cfg.provider='custom';cfg.apiKey=ps.custom.apiKey;cfg.customUrl=ps.custom.url;cfg.customModel=ps.custom.model;
  cfg.temperature=0.3;cfg.fullReasoning=false;
  await one(`custom ${ps.custom.model} temp=0.3 sync  `,false);
  await one(`custom ${ps.custom.model} temp=0.3 stream`,true);
}
console.log(fails?`\n${fails} volání selhalo`:'\nVše prošlo');
process.exit(fails?1:0);
