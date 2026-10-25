// Offline regressions for #173–#176. Run: node --test tools/review-regressions.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

class Element {
  constructor(){this.children=[];this.style={};this.value='';this.textContent='';this.classList={add(){},remove(){}};}
  addEventListener(){}
  querySelector(){return new Element();}
  appendChild(el){this.children.push(el);el.parent=this;}
  insertBefore(el,before){this.children.splice(this.children.indexOf(before),0,el);el.parent=this;}
  replaceChildren(...els){this.children=[];els.forEach(el=>this.appendChild(el));}
  remove(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);}
  set innerHTML(value){this.html=value;this.children=[];}
  get innerHTML(){return this.html||'';}
}
const elements=new Map();
globalThis.document={
  getElementById(id){if(!elements.has(id)){const el=new Element();el.id=id;elements.set(id,el);}return elements.get(id);},
  createElement:()=>new Element(),
  querySelectorAll:()=>[],
};
const storage=new Map();
globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const {state}=await import('../state.js');
const {I18N}=await import('../i18n.js');
const {safeLLMStream}=await import('../llm.js');
const vocab=await import('../vocab.js');
const quiz=await import('../quiz.js');
const {navTo}=await import('../nav.js');
const {setActiveLang}=await import('../dom.js');
state.t=I18N.en;
const realFetch=globalThis.fetch;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const question=word=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({question:`Question: ${word}`,targetWord:word})}}]}));
const feedback=()=>new Response(JSON.stringify({choices:[{message:{content:'{"correct":true,"feedback":"OK"}'}}]}));
function provider(name){Object.assign(state.cfg,{provider:name,model:'test',apiKey:'test-only-key',customUrl:'https://example.invalid',customModel:'test'});}

test('dictionary renders a remote HTML error as text',async()=>{
  provider('custom');
  const payload='<img src=x onerror=alert(1)>';
  globalThis.fetch=async()=>new Response(payload,{status:400});
  document.getElementById('dict-input').value='hola';
  const log=console.error;console.error=()=>{};
  try{await vocab.dictLookup();}finally{console.error=log;globalThis.fetch=realFetch;}
  const result=document.getElementById('dict-result');
  assert.equal(result.children.length,1);
  assert.ok(result.children[0].textContent.includes(payload));
  assert.equal(result.children[0].innerHTML,'');
});

test('stream errors reject before and after partial output for SSE and NDJSON',async()=>{
  const cases=[
    ['anthropic',{type:'content_block_delta',delta:{text:'partial'}},{type:'error',error:{type:'overloaded_error',message:'Overloaded'}},'ERR_500'],
    ['openai',{choices:[{delta:{content:'partial'}}]},{error:{message:'remote error'}},'remote error'],
    ['custom',{choices:[{delta:{content:'partial'}}]},{error:{message:'remote error'}},'remote error'],
    ['gemini',{candidates:[{content:{parts:[{text:'partial'}]}}]},{error:{message:'remote error'}},'remote error'],
    ['ollama',{message:{content:'partial'}},{error:'remote error'},'remote error'],
  ];
  try{for(const [name,chunk,error,message] of cases){
    provider(name);
    for(const partial of [false,true]){
      const encode=d=>(name==='ollama'?'':'data: ')+JSON.stringify(d)+'\n';
      globalThis.fetch=async()=>new Response((partial?encode(chunk):'')+encode(error));
      let output='';
      await assert.rejects(safeLLMStream([],'',1024,undefined,t=>output+=t),e=>e.message===message);
      assert.equal(output,partial?'partial':'');
    }
  }}finally{globalThis.fetch=realFetch;}
});

test('successful streams, refusal, truncation, callback errors and abort still propagate',async()=>{
  provider('openai');
  try{
    for(const [finish,expected] of [['stop',null],['length','MAX_TOKENS'],['content_filter','REFUSAL']]){
      // Final JSON line deliberately has no newline; malformed keepalive data is skipped.
      globalThis.fetch=async()=>new Response('data: malformed\ndata: '+JSON.stringify({choices:[{delta:{content:'hello'},finish_reason:finish}]}));
      const call=()=>safeLLMStream([],'',1024,undefined,()=>{});
      if(expected)await assert.rejects(call(),e=>e.message===expected);
      else assert.equal(await call(),'hello');
    }
    globalThis.fetch=async()=>new Response('data: {"choices":[{"delta":{"content":"hello"}}]}\n');
    await assert.rejects(safeLLMStream([],'',1024,undefined,()=>{throw new Error('callback failed');}),/callback failed/);
    provider('ollama');
    globalThis.fetch=async()=>new Response('{"message":{"content":"hello"},"done":true}');
    assert.equal(await safeLLMStream([],'',1024,undefined,()=>{}),'hello');
    await assert.rejects(safeLLMStream([],'',1024,undefined,()=>{throw new Error('callback failed');}),/callback failed/);
    globalThis.fetch=async()=>{throw new DOMException('Aborted','AbortError');};
    await assert.rejects(safeLLMStream([],'',1024,undefined,()=>{}),{name:'AbortError'});
  }finally{globalThis.fetch=realFetch;}
});

test('SW activation deletes only older versions of its own scope',async()=>{
  const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
  const scopes=['https://example.test/app/','https://example.test/app/preview/a/','https://example.test/app/preview/b/'];
  for(const scope of scopes){
    const keys=[...scopes.flatMap(s=>[`langtutor:${s}:v29`,`langtutor:${s}:v30`]),'langtutor-v29','other-app-cache'];
    const deleted=[];const handlers={};let pending;
    vm.runInNewContext(source,{
      self:{registration:{scope},addEventListener:(n,f)=>handlers[n]=f,clients:{claim:async()=>{}}},
      caches:{keys:async()=>keys,delete:async key=>deleted.push(key)},
    });
    handlers.activate({waitUntil:p=>pending=p});await pending;
    assert.deepEqual(deleted,[`langtutor:${scope}:v29`]);
  }
});

test('quiz resets on language change, preserves same-language sessions and ignores stale work',async()=>{
  provider('custom');
  for(const lang of ['spanish','german'])vocab.setVocab(lang,[{id:lang+'1',word:lang+'1',translation:'one'},{id:lang+'2',word:lang+'2',translation:'two'}]);
  const list=document.getElementById('quiz-msg-list');
  list.replaceChildren(document.getElementById('quiz-empty'),document.getElementById('quiz-typing-row'));
  const requests=[];
  // Intentionally ignore abort so generation guards must reject late completions too.
  globalThis.fetch=(url,opts)=>new Promise(resolve=>requests.push({body:JSON.parse(opts.body),resolve}));
  try{
    setActiveLang('spanish');navTo('quiz');
    assert.equal(requests.length,1);
    navTo('vocab');setActiveLang('german');navTo('quiz');
    assert.equal(requests.length,2);
    requests[0].resolve(question('old spanish'));await tick();
    assert.equal(state.quizHistory.some(h=>h.role==='assistant-question'),false);
    requests[1].resolve(question('german'));await tick();
    assert.equal(state.quizHistory.at(-1).word,'german');
    navTo('vocab');navTo('quiz');assert.equal(requests.length,2);
    document.getElementById('quiz-input').value='answer';
    const sending=quiz.quizSend();
    assert.match(requests[2].body.messages[0].content,/evaluator for German/);
    requests[2].resolve(feedback());await sending;
    assert.notEqual(state.quizTimer,null);
    navTo('vocab');assert.equal(state.quizTimer,null);
    setActiveLang('spanish');navTo('quiz');
    assert.equal(requests.length,4);
    requests[3].resolve(question('spanish'));await tick();
    assert.equal(state.quizLang,'spanish');
    // Restart while evaluation is pending; old feedback must not shift the new queue.
    document.getElementById('quiz-input').value='answer';
    const oldEvaluation=quiz.quizSend();
    quiz.startQuiz();assert.equal(requests.length,6);
    requests[4].resolve(feedback());await oldEvaluation;
    assert.equal(state.quizQueue.length,2);
    requests[5].resolve(question('new session'));await tick();
    assert.equal(state.quizHistory.at(-1).word,'new session');
    // An empty-language restart must invalidate outstanding questions too.
    quiz.startQuiz();setActiveLang('french');quiz.startQuiz();
    requests[6].resolve(question('stale'));await tick();
    assert.equal(state.quizHistory.length,0);
    assert.equal(state.quizBusy,false);
    assert.equal(document.getElementById('quiz-typing-row').style.display,'none');
  }finally{quiz.pauseQuiz();globalThis.fetch=realFetch;}
});
