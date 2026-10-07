export function syncLangSelectors(l){
  ['lang-select','vocab-lang-select','fc-lang-select','quiz-lang-select','tips-lang-select'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value=l;
  });
}

export function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';}
